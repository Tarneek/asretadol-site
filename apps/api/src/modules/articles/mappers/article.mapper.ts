import { Article } from '../entities/article.entity';
import { ArticleResponseDto } from '../dto/article-response.dto';

export function toArticleResponse(article: Article): ArticleResponseDto {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    content: article.content,
    seoTitle: article.seo?.metaTitle ?? null,
    seoDescription: article.seo?.metaDescription ?? null,
    featuredImage: article.seo?.ogImageUrl ?? null,
    status: article.status,
    featured: article.featured,
    isFeatured: article.featured,
    isBreaking: article.breaking,
    isHero: article.hero,
    hasVideo: article.hasVideo ?? false,
    videoUrl: article.videoUrl ?? null,
    viewsCount: article.viewsCount,
    publishedAt: article.publishedAt,
    authorId: article.authorId,
    author: article.author
      ? {
          id: article.author.id,
          email: article.author.email,
          displayName: article.author.displayName,
          role: article.author.role,
        }
      : undefined,
    categories: (article.categories ?? []).map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
    })),
    tags: (article.tags ?? []).map((tag) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
    })),
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
  };
}
