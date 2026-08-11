import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ArticleStatus } from '../../common/enums/article-status.enum';
import { UserRole } from '../../common/enums/user-role.enum';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { slugify } from '../../common/utils/slug.util';
import { Category } from '../categories/entities/category.entity';
import { Tag } from '../tags/entities/tag.entity';
import { Story } from '../stories/entities/story.entity';
import { ArticleSeo } from './entities/article-seo.entity';
import { Article } from './entities/article.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ListArticlesQueryDto } from './dto/list-articles-query.dto';
import {
  ArticleResponseDto,
  PaginatedArticlesDto,
} from './dto/article-response.dto';
import { ArticleDashboardStatsDto } from './dto/article-dashboard-stats.dto';
import { ArticleMediaService } from './article-media.service';
import { toArticleResponse } from './mappers/article.mapper';

function resolveFeatured(dto: { featured?: boolean; isFeatured?: boolean }): boolean | undefined {
  if (dto.isFeatured !== undefined) return dto.isFeatured;
  if (dto.featured !== undefined) return dto.featured;
  return undefined;
}

function resolvePromotionFlags(dto: CreateArticleDto | UpdateArticleDto): {
  featured: boolean;
  breaking: boolean;
  hero: boolean;
} {
  return {
    featured: resolveFeatured(dto) ?? false,
    breaking: dto.isBreaking ?? false,
    hero: dto.isHero ?? false,
  };
}

function resolveVideoFields(
  dto: { hasVideo?: boolean; videoUrl?: string | null },
  normalizeVideo: (value: string) => string,
): { hasVideo: boolean; videoUrl: string | null } {
  const wantsVideo = dto.hasVideo === true;
  if (!wantsVideo) {
    return { hasVideo: false, videoUrl: null };
  }
  const trimmed = dto.videoUrl?.trim() ?? '';
  if (!trimmed) {
    throw new BadRequestException('Video URL or file is required when "Has Video" is enabled.');
  }
  return { hasVideo: true, videoUrl: normalizeVideo(trimmed) };
}

const ARTICLE_RELATIONS = ['author', 'seo', 'categories', 'tags'] as const;

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articlesRepository: Repository<Article>,
    @InjectRepository(ArticleSeo)
    private readonly articleSeoRepository: Repository<ArticleSeo>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(Tag)
    private readonly tagsRepository: Repository<Tag>,
    @InjectRepository(Story)
    private readonly storiesRepository: Repository<Story>,
    private readonly articleMedia: ArticleMediaService,
  ) {}

  async create(
    dto: CreateArticleDto,
    currentUser: AuthenticatedUser,
  ): Promise<ArticleResponseDto> {
    const slug = await this.resolveUniqueSlug(dto.slug ?? dto.title);
    const categories = await this.resolveCategories(dto.categoryIds);
    const tags = await this.resolveTags(dto.tagIds);

    const flags = resolvePromotionFlags(dto);
    const video = resolveVideoFields(dto, (url) => this.articleMedia.normalizeVideoUrl(url));

    const article = this.articlesRepository.create({
      title: dto.title.trim(),
      slug,
      excerpt: dto.excerpt?.trim() || null,
      content: dto.content,
      status: ArticleStatus.Draft,
      featured: flags.featured,
      breaking: flags.breaking,
      hero: flags.hero,
      hasVideo: video.hasVideo,
      videoUrl: video.videoUrl,
      viewsCount: 0,
      publishedAt: null,
      authorId: currentUser.id,
      categories,
      tags,
    });

    const saved = await this.articlesRepository.save(article);

    await this.upsertSeo(saved.id, {
      seoTitle: dto.seoTitle,
      seoDescription: dto.seoDescription,
      featuredImage: dto.featuredImage,
    });

    return this.findOneForUser(saved.id, currentUser);
  }

  async findAll(
    query: ListArticlesQueryDto,
    currentUser: AuthenticatedUser,
  ): Promise<PaginatedArticlesDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.articlesRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author')
      .leftJoinAndSelect('article.seo', 'seo')
      .leftJoinAndSelect('article.categories', 'categories')
      .leftJoinAndSelect('article.tags', 'tags');

    if (currentUser.role === UserRole.Author) {
      qb.andWhere('article.author_id = :authorId', { authorId: currentUser.id });
    } else if (query.authorId) {
      qb.andWhere('article.author_id = :authorId', { authorId: query.authorId });
    }

    if (query.status) {
      qb.andWhere('article.status = :status', { status: query.status });
    }

    if (query.categoryId) {
      qb.andWhere('categories.id = :categoryId', { categoryId: query.categoryId });
    }

    if (query.tagId) {
      qb.andWhere('tags.id = :tagId', { tagId: query.tagId });
    }

    if (query.search?.trim()) {
      qb.andWhere(
        '(article.title ILIKE :search OR article.slug ILIKE :search OR article.excerpt ILIKE :search)',
        { search: `%${query.search.trim()}%` },
      );
    }

    qb.orderBy('article.updatedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [articles, total] = await qb.getManyAndCount();

    return {
      data: articles.map(toArticleResponse),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 0,
      },
    };
  }

  async getDashboardStats(): Promise<ArticleDashboardStatsDto> {
    const [totalArticles, draftCount, publishedCount, scheduledCount, activeStories] =
      await Promise.all([
        this.articlesRepository.count(),
        this.articlesRepository.count({ where: { status: ArticleStatus.Draft } }),
        this.articlesRepository.count({ where: { status: ArticleStatus.Published } }),
        this.articlesRepository.count({ where: { status: ArticleStatus.Scheduled } }),
        this.storiesRepository.count({ where: { isActive: true } }),
      ]);

    const viewsRow = await this.articlesRepository
      .createQueryBuilder('article')
      .select('COALESCE(SUM(article.views_count), 0)', 'total')
      .getRawOne<{ total: string }>();

    return {
      totalArticles,
      totalViews: Number(viewsRow?.total ?? 0),
      draftCount,
      publishedCount,
      scheduledCount,
      activeStories,
    };
  }

  async findOneForUser(
    id: number,
    currentUser: AuthenticatedUser,
  ): Promise<ArticleResponseDto> {
    const article = await this.getArticleOrThrow(id);
    this.assertCanRead(article, currentUser);
    return toArticleResponse(article);
  }

  async update(
    id: number,
    dto: UpdateArticleDto,
    currentUser: AuthenticatedUser,
  ): Promise<ArticleResponseDto> {
    const article = await this.getArticleOrThrow(id);
    this.assertCanEdit(article, currentUser);

    if (dto.title !== undefined) {
      article.title = dto.title.trim();
    }

    if (dto.slug !== undefined) {
      article.slug = await this.resolveUniqueSlug(dto.slug, article.id);
    } else if (dto.title !== undefined && article.status === ArticleStatus.Draft) {
      article.slug = await this.resolveUniqueSlug(dto.title, article.id);
    }

    if (dto.excerpt !== undefined) {
      article.excerpt = dto.excerpt?.trim() || null;
    }

    if (dto.content !== undefined) {
      article.content = dto.content;
    }

    const featuredValue = resolveFeatured(dto);
    if (
      featuredValue !== undefined ||
      dto.isBreaking !== undefined ||
      dto.isHero !== undefined
    ) {
      this.assertCanPublish(currentUser);
      if (featuredValue !== undefined) {
        article.featured = featuredValue;
      }
      if (dto.isBreaking !== undefined) {
        article.breaking = dto.isBreaking;
      }
      if (dto.isHero !== undefined) {
        article.hero = dto.isHero;
      }
    }

    if (dto.categoryIds !== undefined) {
      article.categories = await this.resolveCategories(dto.categoryIds);
    }

    if (dto.tagIds !== undefined) {
      article.tags = await this.resolveTags(dto.tagIds);
    }

    if (dto.hasVideo !== undefined || dto.videoUrl !== undefined) {
      const video = resolveVideoFields(
        {
          hasVideo: dto.hasVideo ?? article.hasVideo,
          videoUrl: dto.videoUrl !== undefined ? dto.videoUrl : article.videoUrl,
        },
        (url) => this.articleMedia.normalizeVideoUrl(url),
      );
      article.hasVideo = video.hasVideo;
      article.videoUrl = video.videoUrl;
    }

    await this.articlesRepository.save(article);

    if (
      dto.seoTitle !== undefined ||
      dto.seoDescription !== undefined ||
      dto.featuredImage !== undefined
    ) {
      await this.upsertSeo(article.id, {
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        featuredImage: dto.featuredImage,
        merge: true,
      });
    }

    return this.findOneForUser(id, currentUser);
  }

  async publish(
    id: number,
    currentUser: AuthenticatedUser,
  ): Promise<ArticleResponseDto> {
    this.assertCanPublish(currentUser);
    const article = await this.getArticleOrThrow(id);

    if (article.status === ArticleStatus.Published) {
      return toArticleResponse(article);
    }

    if (article.status === ArticleStatus.Archived) {
      throw new BadRequestException('Archived articles must be restored before publishing');
    }

    if (article.status === ArticleStatus.Scheduled && article.publishedAt) {
      article.status = ArticleStatus.Published;
      await this.articlesRepository.save(article);
      return this.findOneForUser(id, currentUser);
    }

    if (!article.title.trim() || !article.content.trim()) {
      throw new BadRequestException('Title and content are required to publish');
    }

    article.status = ArticleStatus.Published;
    article.publishedAt = article.publishedAt ?? new Date();
    await this.articlesRepository.save(article);

    return this.findOneForUser(id, currentUser);
  }

  async archive(
    id: number,
    currentUser: AuthenticatedUser,
  ): Promise<ArticleResponseDto> {
    this.assertCanPublish(currentUser);
    const article = await this.getArticleOrThrow(id);

    if (article.status === ArticleStatus.Draft) {
      throw new BadRequestException('Only published articles can be archived');
    }

    article.status = ArticleStatus.Archived;
    article.featured = false;
    article.breaking = false;
    article.hero = false;
    await this.articlesRepository.save(article);

    return this.findOneForUser(id, currentUser);
  }

  async unarchive(
    id: number,
    currentUser: AuthenticatedUser,
  ): Promise<ArticleResponseDto> {
    this.assertCanPublish(currentUser);
    const article = await this.getArticleOrThrow(id);

    if (article.status !== ArticleStatus.Archived) {
      throw new BadRequestException('Only archived articles can be restored to draft');
    }

    article.status = ArticleStatus.Draft;
    article.publishedAt = null;
    article.featured = false;
    article.breaking = false;
    article.hero = false;
    await this.articlesRepository.save(article);

    return this.findOneForUser(id, currentUser);
  }

  async setFeatured(
    id: number,
    featured: boolean,
    currentUser: AuthenticatedUser,
  ): Promise<ArticleResponseDto> {
    this.assertCanPublish(currentUser);
    const article = await this.getArticleOrThrow(id);

    if (featured && article.status !== ArticleStatus.Published) {
      throw new BadRequestException('Only published articles can be featured');
    }

    article.featured = featured;
    await this.articlesRepository.save(article);

    return this.findOneForUser(id, currentUser);
  }

  async remove(id: number, currentUser: AuthenticatedUser): Promise<void> {
    const article = await this.getArticleOrThrow(id);
    this.assertCanDelete(article, currentUser);
    await this.articlesRepository.remove(article);
  }

  private async getArticleOrThrow(id: number): Promise<Article> {
    const article = await this.articlesRepository.findOne({
      where: { id },
      relations: [...ARTICLE_RELATIONS],
    });

    if (!article) {
      throw new NotFoundException(`Article ${id} not found`);
    }

    return article;
  }

  private async resolveUniqueSlug(raw: string, excludeId?: number): Promise<string> {
    const base = slugify(raw);
    if (!base) {
      throw new BadRequestException('Unable to generate a valid slug');
    }

    let candidate = base;
    let suffix = 2;

    while (await this.slugExists(candidate, excludeId)) {
      candidate = `${base}-${suffix}`;
      suffix += 1;
    }

    return candidate;
  }

  private async slugExists(slug: string, excludeId?: number): Promise<boolean> {
    const qb = this.articlesRepository
      .createQueryBuilder('article')
      .where('article.slug = :slug', { slug });

    if (excludeId) {
      qb.andWhere('article.id != :excludeId', { excludeId });
    }

    const count = await qb.getCount();
    return count > 0;
  }

  private async resolveCategories(ids?: string[]): Promise<Category[]> {
    if (!ids || ids.length === 0) {
      return [];
    }

    const categories = await this.categoriesRepository.findBy({ id: In(ids) });
    if (categories.length !== ids.length) {
      throw new BadRequestException('One or more categoryIds are invalid');
    }

    return categories;
  }

  private async resolveTags(ids?: string[]): Promise<Tag[]> {
    if (!ids || ids.length === 0) {
      return [];
    }

    const tags = await this.tagsRepository.findBy({ id: In(ids) });
    if (tags.length !== ids.length) {
      throw new BadRequestException('One or more tagIds are invalid');
    }

    return tags;
  }

  private async upsertSeo(
    articleId: number,
    input: {
      seoTitle?: string | null;
      seoDescription?: string | null;
      featuredImage?: string | null;
      merge?: boolean;
    },
  ): Promise<void> {
    let seo = await this.articleSeoRepository.findOne({ where: { articleId } });

    if (!seo) {
      seo = this.articleSeoRepository.create({
        articleId,
        metaTitle: null,
        metaDescription: null,
        ogImageUrl: null,
        canonicalUrl: null,
      });
    }

    if (input.seoTitle !== undefined || !input.merge) {
      seo.metaTitle = input.seoTitle?.trim() || null;
    }
    if (input.seoDescription !== undefined || !input.merge) {
      seo.metaDescription = input.seoDescription?.trim() || null;
    }
    if (input.featuredImage !== undefined || !input.merge) {
      seo.ogImageUrl = this.articleMedia.normalizeFeaturedImagePath(input.featuredImage);
    }

    await this.articleSeoRepository.save(seo);
  }

  private assertCanRead(article: Article, user: AuthenticatedUser): void {
    if (user.role === UserRole.Author && article.authorId !== user.id) {
      throw new ForbiddenException('Authors can only access their own articles');
    }
  }

  private assertCanEdit(article: Article, user: AuthenticatedUser): void {
    if (user.role === UserRole.Admin || user.role === UserRole.Editor) {
      return;
    }

    if (user.role === UserRole.Author && article.authorId === user.id) {
      if (article.status === ArticleStatus.Archived) {
        throw new ForbiddenException('Authors cannot edit archived articles');
      }
      return;
    }

    throw new ForbiddenException('You cannot edit this article');
  }

  private assertCanDelete(article: Article, user: AuthenticatedUser): void {
    if (user.role === UserRole.Admin || user.role === UserRole.Editor) {
      return;
    }

    if (
      user.role === UserRole.Author &&
      article.authorId === user.id &&
      article.status === ArticleStatus.Draft
    ) {
      return;
    }

    throw new ForbiddenException('You cannot delete this article');
  }

  private assertCanPublish(user: AuthenticatedUser): void {
    if (user.role !== UserRole.Admin && user.role !== UserRole.Editor) {
      throw new ForbiddenException('Only editors and admins can manage publish workflow');
    }
  }
}
