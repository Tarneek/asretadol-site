import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ArticleStatus } from '../../common/enums/article-status.enum';
import { ArticleViewAnalyticsService } from '../articles/article-view-analytics.service';
import { Article } from '../articles/entities/article.entity';
import { Category } from '../categories/entities/category.entity';
import { Tag } from '../tags/entities/tag.entity';
import {
  PaginatedPublicArticlesDto,
  PublicArticleDetailDto,
  PublicCategoryArticlesDto,
  PublicSearchResultDto,
  PublicTagArticlesDto,
} from './dto/public-article-response.dto';
import { PublicArticlesQueryDto } from './dto/public-articles-query.dto';
import { PublicSearchQueryDto } from './dto/public-search-query.dto';
import {
  buildPaginationMeta,
  PaginationQueryDto,
} from './dto/pagination-query.dto';
import {
  toPublicArticleCard,
  toPublicArticleDetail,
} from './mappers/public-article.mapper';

@Injectable()
export class PublicArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articlesRepository: Repository<Article>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(Tag)
    private readonly tagsRepository: Repository<Tag>,
    private readonly viewAnalytics: ArticleViewAnalyticsService,
  ) {}

  async findLatest(query: PublicArticlesQueryDto): Promise<PaginatedPublicArticlesDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;

    const qb = this.createPublishedQueryBuilder();
    this.applyOptionalFilters(qb, query);
    qb.orderBy('article.publishedAt', 'DESC').addOrderBy('article.id', 'DESC');

    return this.paginateCards(qb, page, limit);
  }

  async findFeatured(query: PaginationQueryDto): Promise<PaginatedPublicArticlesDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;

    const qb = this.createPublishedQueryBuilder()
      .andWhere('article.featured = :featured', { featured: true })
      .orderBy('article.publishedAt', 'DESC')
      .addOrderBy('article.id', 'DESC');

    return this.paginateCards(qb, page, limit);
  }

  async findHero(query: PaginationQueryDto): Promise<PaginatedPublicArticlesDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 6;

    const qb = this.createPublishedQueryBuilder()
      .andWhere('article.hero = :hero', { hero: true })
      .orderBy('article.publishedAt', 'DESC')
      .addOrderBy('article.id', 'DESC');

    return this.paginateCards(qb, page, limit);
  }

  async findBreaking(query: PaginationQueryDto): Promise<PaginatedPublicArticlesDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.createPublishedQueryBuilder()
      .andWhere('article.breaking = :breaking', { breaking: true })
      .orderBy('article.publishedAt', 'DESC')
      .addOrderBy('article.id', 'DESC');

    return this.paginateCards(qb, page, limit);
  }

  async findBySlug(slug: string): Promise<PublicArticleDetailDto> {
    const article = await this.createPublishedQueryBuilder()
      .andWhere('article.slug = :slug', { slug })
      .getOne();

    if (!article) {
      throw new NotFoundException(`Published article "${slug}" not found`);
    }

    await this.articlesRepository.increment({ id: article.id }, 'viewsCount', 1);
    await this.viewAnalytics.recordArticleView();
    article.viewsCount += 1;

    return toPublicArticleDetail(article);
  }

  async findById(id: number): Promise<PublicArticleDetailDto> {
    const article = await this.createPublishedQueryBuilder()
      .andWhere('article.id = :id', { id })
      .getOne();

    if (!article) {
      throw new NotFoundException(`Published article "${id}" not found`);
    }

    await this.articlesRepository.increment({ id: article.id }, 'viewsCount', 1);
    await this.viewAnalytics.recordArticleView();
    article.viewsCount += 1;

    return toPublicArticleDetail(article);
  }

  async findByCategorySlug(
    categorySlug: string,
    query: PaginationQueryDto,
  ): Promise<PublicCategoryArticlesDto> {
    const category = await this.categoriesRepository.findOne({
      where: { slug: categorySlug },
    });

    if (!category) {
      throw new NotFoundException(`Category "${categorySlug}" not found`);
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 12;

    const qb = this.createPublishedQueryBuilder()
      .andWhere('categories.id = :categoryId', { categoryId: category.id })
      .orderBy('article.publishedAt', 'DESC')
      .addOrderBy('article.id', 'DESC');

    const { data, meta } = await this.paginateCards(qb, page, limit);

    return {
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
      },
      data,
      meta,
    };
  }

  async findByTagSlug(
    tagSlug: string,
    query: PaginationQueryDto,
  ): Promise<PublicTagArticlesDto> {
    const tag = await this.tagsRepository.findOne({ where: { slug: tagSlug } });

    if (!tag) {
      throw new NotFoundException(`Tag "${tagSlug}" not found`);
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 12;

    const qb = this.createPublishedQueryBuilder()
      .andWhere('tags.id = :tagId', { tagId: tag.id })
      .orderBy('article.publishedAt', 'DESC')
      .addOrderBy('article.id', 'DESC');

    const { data, meta } = await this.paginateCards(qb, page, limit);

    return {
      tag: {
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
      },
      data,
      meta,
    };
  }

  async search(query: PublicSearchQueryDto): Promise<PublicSearchResultDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const term = query.q.trim();

    const qb = this.createPublishedQueryBuilder().andWhere(
      '(article.title ILIKE :term OR article.excerpt ILIKE :term OR article.content ILIKE :term)',
      { term: `%${term}%` },
    );

    if (query.categorySlug) {
      qb.andWhere('categories.slug = :categorySlug', {
        categorySlug: query.categorySlug,
      });
    }

    if (query.tagSlug) {
      qb.andWhere('tags.slug = :tagSlug', { tagSlug: query.tagSlug });
    }

    qb.orderBy('article.publishedAt', 'DESC').addOrderBy('article.id', 'DESC');

    const { data, meta } = await this.paginateCards(qb, page, limit);

    return {
      query: term,
      data,
      meta,
    };
  }

  private createPublishedQueryBuilder(): SelectQueryBuilder<Article> {
    const now = new Date();
    return this.articlesRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author')
      .leftJoinAndSelect('article.seo', 'seo')
      .leftJoinAndSelect('article.categories', 'categories')
      .leftJoinAndSelect('article.tags', 'tags')
      .where(
        `(
          (article.status = :published AND article.published_at IS NOT NULL)
          OR (
            article.status = :scheduled
            AND article.published_at IS NOT NULL
            AND article.published_at <= :now
          )
        )`,
        {
          published: ArticleStatus.Published,
          scheduled: ArticleStatus.Scheduled,
          now,
        },
      );
  }

  private applyOptionalFilters(
    qb: SelectQueryBuilder<Article>,
    query: PublicArticlesQueryDto,
  ): void {
    if (query.categoryId) {
      qb.andWhere('categories.id = :categoryId', { categoryId: query.categoryId });
    }

    if (query.tagId) {
      qb.andWhere('tags.id = :tagId', { tagId: query.tagId });
    }

    if (query.authorId) {
      qb.andWhere('article.author_id = :authorId', { authorId: query.authorId });
    }
  }

  private async paginateCards(
    qb: SelectQueryBuilder<Article>,
    page: number,
    limit: number,
  ): Promise<PaginatedPublicArticlesDto> {
    const total = await qb.clone().getCount();

    // Postgres requires that for `SELECT DISTINCT`, every `ORDER BY` expression must
    // be present in the select list. We keep the ordering from `qb` (published_at/id),
    // so we must include `article.published_at` in this distinct id query.
    const idRows = await qb
      .clone()
      .select('article.id', 'id')
      .addSelect('article.published_at', 'published_at')
      .distinct(true)
      .offset((page - 1) * limit)
      .limit(limit)
      .getRawMany<{ id: number }>();

    const ids = idRows.map((row) => row.id);

    if (ids.length === 0) {
      return {
        data: [],
        meta: buildPaginationMeta(total, page, limit),
      };
    }

    const articles = await this.articlesRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author')
      .leftJoinAndSelect('article.seo', 'seo')
      .leftJoinAndSelect('article.categories', 'categories')
      .leftJoinAndSelect('article.tags', 'tags')
      .where('article.id IN (:...ids)', { ids })
      .getMany();

    const byId = new Map(articles.map((article) => [article.id, article]));
    const ordered = ids
      .map((id) => byId.get(id))
      .filter((article): article is Article => article !== undefined);

    return {
      data: ordered.map(toPublicArticleCard),
      meta: buildPaginationMeta(total, page, limit),
    };
  }
}
