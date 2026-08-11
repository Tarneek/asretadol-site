import * as bcrypt from 'bcrypt';
import { DataSource, In, Repository } from 'typeorm';
import { ArticleStatus } from '../common/enums/article-status.enum';
import { UserRole } from '../common/enums/user-role.enum';
import { ArticleSeo } from '../modules/articles/entities/article-seo.entity';
import { Article } from '../modules/articles/entities/article.entity';
import { Category } from '../modules/categories/entities/category.entity';
import { Story } from '../modules/stories/entities/story.entity';
import { Tag } from '../modules/tags/entities/tag.entity';
import { User } from '../modules/users/entities/user.entity';
import {
  demoArticles,
  demoArticleSlugs,
  demoAuthors,
  demoCategories,
  demoStories,
  demoTags,
  type DemoArticleSeed,
} from './demo/demo-content.data';

/** Category slugs from the first demo seed revision — cleaned up on force re-seed. */
const OBSOLETE_DEMO_CATEGORY_SLUGS = ['economy', 'world', 'technology', 'analysis'];

const BCRYPT_ROUNDS = 12;

export type DemoSeedOptions = {
  force?: boolean;
  authorPassword?: string;
};

export type DemoSeedResult = {
  skipped: boolean;
  categories: number;
  tags: number;
  usersCreated: number;
  articles: number;
};

export async function runDemoSeed(
  dataSource: DataSource,
  options: DemoSeedOptions = {},
): Promise<DemoSeedResult> {
  const articlesRepo = dataSource.getRepository(Article);
  const categoriesRepo = dataSource.getRepository(Category);

  const password =
    options.authorPassword ??
    process.env.SEED_DEMO_AUTHOR_PASSWORD ??
    process.env.SEED_ADMIN_PASSWORD ??
    'ChangeMeDemo12!';

  /**
   * Always upsert taxonomy + articles (idempotent).
   * Early "skip" was causing stale seeds (old category slugs) while homepage
   * expects `iranian-economy` / `world-economy` — resulting in empty UI.
   * SEED_DEMO_FORCE still deletes demo article rows first for a clean replace.
   */
  if (options.force) {
    await removeDemoArticles(articlesRepo, dataSource.getRepository(ArticleSeo));
    await removeObsoleteCategories(categoriesRepo, OBSOLETE_DEMO_CATEGORY_SLUGS);
  } else {
    // Soft cleanup of obsolete category slugs if they have no remaining articles.
    await removeObsoleteCategoriesIfUnused(categoriesRepo, OBSOLETE_DEMO_CATEGORY_SLUGS);
  }

  const usersCreated = await seedAuthors(dataSource.getRepository(User), password);
  const categoryBySlug = await seedCategories(categoriesRepo);
  const tagBySlug = await seedTags(dataSource.getRepository(Tag));
  const userByEmail = await loadUserEmails(dataSource.getRepository(User));
  await seedStories(dataSource.getRepository(Story));

  let articlesSeeded = 0;
  for (const seed of demoArticles) {
    const author = userByEmail.get(seed.authorEmail.toLowerCase());
    if (!author) {
      throw new Error(`Demo seed author not found: ${seed.authorEmail}`);
    }

    const categories = seed.categorySlugs.map((slug) => {
      const category = categoryBySlug.get(slug);
      if (!category) {
        throw new Error(`Demo category slug missing: ${slug}`);
      }
      return category;
    });

    const tags = seed.tagSlugs.map((slug) => {
      const tag = tagBySlug.get(slug);
      if (!tag) {
        throw new Error(`Demo tag slug missing: ${slug}`);
      }
      return tag;
    });

    await upsertArticle(
      articlesRepo,
      dataSource.getRepository(ArticleSeo),
      seed,
      author.id,
      categories,
      tags,
    );
    articlesSeeded += 1;
  }

  return {
    skipped: false,
    categories: demoCategories.length,
    tags: demoTags.length,
    usersCreated,
    articles: articlesSeeded,
  };
}

async function removeDemoArticles(
  articlesRepo: Repository<Article>,
  seoRepo: Repository<ArticleSeo>,
): Promise<void> {
  const articles = await articlesRepo.find({
    where: { slug: In(demoArticleSlugs) },
    select: ['id'],
  });

  if (articles.length === 0) {
    return;
  }

  const ids = articles.map((article) => article.id);
  await seoRepo.delete({ articleId: In(ids) });
  await articlesRepo.manager
    .createQueryBuilder()
    .delete()
    .from('article_categories')
    .where('article_id IN (:...ids)', { ids })
    .execute();
  await articlesRepo.manager
    .createQueryBuilder()
    .delete()
    .from('article_tags')
    .where('article_id IN (:...ids)', { ids })
    .execute();
  await articlesRepo.delete({ id: In(ids) });
}

async function removeObsoleteCategories(
  categoriesRepo: Repository<Category>,
  slugs: string[],
): Promise<void> {
  if (slugs.length === 0) {
    return;
  }
  await categoriesRepo.delete({ slug: In(slugs) });
}

async function removeObsoleteCategoriesIfUnused(
  categoriesRepo: Repository<Category>,
  slugs: string[],
): Promise<void> {
  for (const slug of slugs) {
    const inUse = await categoriesRepo
      .createQueryBuilder('category')
      .innerJoin('category.articles', 'article')
      .where('category.slug = :slug', { slug })
      .getCount();
    if (inUse === 0) {
      await categoriesRepo.delete({ slug });
    }
  }
}

async function seedAuthors(
  usersRepo: Repository<User>,
  password: string,
): Promise<number> {
  let created = 0;
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  for (const author of demoAuthors) {
    const email = author.email.toLowerCase();
    const existing = await usersRepo.findOne({ where: { email } });
    if (existing) {
      continue;
    }

    const role = author.role === 'editor' ? UserRole.Editor : UserRole.Author;
    await usersRepo.save(
      usersRepo.create({
        email,
        passwordHash,
        displayName: author.displayName,
        role,
        isActive: true,
      }),
    );
    created += 1;
  }

  return created;
}

async function seedCategories(
  categoriesRepo: Repository<Category>,
): Promise<Map<string, Category>> {
  const map = new Map<string, Category>();

  for (const seed of demoCategories) {
    let category = await categoriesRepo.findOne({ where: { slug: seed.slug } });
    if (!category) {
      category = categoriesRepo.create({
        name: seed.name,
        slug: seed.slug,
        description: seed.description,
        parentId: null,
        sortOrder: seed.sortOrder,
      });
      category = await categoriesRepo.save(category);
    } else {
      category.name = seed.name;
      category.description = seed.description;
      category.sortOrder = seed.sortOrder;
      category = await categoriesRepo.save(category);
    }
    map.set(seed.slug, category);
  }

  return map;
}

async function seedTags(tagsRepo: Repository<Tag>): Promise<Map<string, Tag>> {
  const map = new Map<string, Tag>();

  for (const seed of demoTags) {
    let tag = await tagsRepo.findOne({ where: { slug: seed.slug } });
    if (!tag) {
      tag = tagsRepo.create({
        name: seed.name,
        slug: seed.slug,
      });
      tag = await tagsRepo.save(tag);
    } else {
      tag.name = seed.name;
      tag = await tagsRepo.save(tag);
    }
    map.set(seed.slug, tag);
  }

  return map;
}

async function loadUserEmails(usersRepo: Repository<User>): Promise<Map<string, User>> {
  const emails = [
    ...new Set(demoAuthors.map((author) => author.email.toLowerCase())),
  ];
  const users = await usersRepo.find({ where: { email: In(emails) } });
  const map = new Map<string, User>();
  for (const user of users) {
    map.set(user.email, user);
  }
  return map;
}

async function seedStories(storiesRepo: Repository<Story>): Promise<void> {
  const existing = await storiesRepo.find();
  const existingByTitle = new Map(existing.map((story) => [story.title.toLowerCase(), story]));

  for (const seed of demoStories) {
    const current = existingByTitle.get(seed.title.toLowerCase());
    if (!current) {
      await storiesRepo.save(
        storiesRepo.create({
          title: seed.title,
          mediaUrl: seed.mediaUrl,
          mediaType: seed.mediaType,
          link: seed.link ?? null,
          isActive: seed.isActive ?? true,
        }),
      );
      continue;
    }

    current.mediaUrl = seed.mediaUrl;
    current.mediaType = seed.mediaType;
    current.link = seed.link ?? null;
    current.isActive = seed.isActive ?? true;
    await storiesRepo.save(current);
  }
}

async function upsertArticle(
  articlesRepo: Repository<Article>,
  seoRepo: Repository<ArticleSeo>,
  seed: DemoArticleSeed,
  authorId: string,
  categories: Category[],
  tags: Tag[],
): Promise<void> {
  let article = await articlesRepo.findOne({
    where: { slug: seed.slug },
    relations: ['categories', 'tags'],
  });

  const publishedAt = resolvePublishedAt(seed);

  if (!article) {
    article = articlesRepo.create({
      title: seed.title,
      slug: seed.slug,
      excerpt: seed.excerpt,
      content: seed.content,
      status: seed.status,
      featured: seed.featured && seed.status === ArticleStatus.Published,
      hero: seed.hero && seed.status === ArticleStatus.Published,
      breaking: seed.breaking && seed.status === ArticleStatus.Published,
      viewsCount: 0,
      publishedAt,
      authorId,
      categories,
      tags,
    });
  } else {
    article.title = seed.title;
    article.excerpt = seed.excerpt;
    article.content = seed.content;
    article.status = seed.status;
    article.featured = seed.featured && seed.status === ArticleStatus.Published;
    article.hero = seed.hero && seed.status === ArticleStatus.Published;
    article.breaking = seed.breaking && seed.status === ArticleStatus.Published;
    article.publishedAt = publishedAt;
    article.authorId = authorId;
    article.categories = categories;
    article.tags = tags;
  }

  article = await articlesRepo.save(article);

  let seo = await seoRepo.findOne({ where: { articleId: article.id } });
  if (!seo) {
    seo = seoRepo.create({
      articleId: article.id,
      metaTitle: seed.seoTitle,
      metaDescription: seed.seoDescription,
      ogImageUrl: seed.featuredImage,
      canonicalUrl: null,
    });
  } else {
    seo.metaTitle = seed.seoTitle;
    seo.metaDescription = seed.seoDescription;
    seo.ogImageUrl = seed.featuredImage;
  }

  await seoRepo.save(seo);
}

function resolvePublishedAt(seed: DemoArticleSeed): Date | null {
  if (seed.status === ArticleStatus.Draft) {
    return null;
  }

  if (seed.status === ArticleStatus.Archived || seed.status === ArticleStatus.Published) {
    const daysAgo = seed.publishedDaysAgo ?? 0;
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - daysAgo);
    date.setUTCHours(9, 0, 0, 0);
    return date;
  }

  return null;
}
