import { Article } from '../../articles/entities/article.entity';
import {
  PublicArticleCardDto,
  PublicArticleDetailDto,
} from '../dto/public-article-response.dto';

function mapAuthor(article: Article) {
  return {
    id: article.author.id,
    displayName: article.author.displayName,
  };
}

function mapCategories(article: Article) {
  return (article.categories ?? []).map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
  }));
}

function mapTags(article: Article) {
  return (article.tags ?? []).map((tag) => ({
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
  }));
}

export function toPublicArticleCard(article: Article): PublicArticleCardDto {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    featuredImage: article.seo?.ogImageUrl ?? null,
    featured: article.featured,
    isFeatured: article.featured,
    isBreaking: article.breaking,
    isHero: article.hero,
    hasVideo: article.hasVideo ?? false,
    publishedAt: article.publishedAt as Date,
    author: mapAuthor(article),
    categories: mapCategories(article),
    tags: mapTags(article),
  };
}

export function toPublicArticleDetail(article: Article): PublicArticleDetailDto {
  return {
    ...toPublicArticleCard(article),
    content: article.content,
    videoUrl: article.videoUrl,
    seoTitle: article.seo?.metaTitle ?? null,
    seoDescription: article.seo?.metaDescription ?? null,
    updatedAt: article.updatedAt,
  };
}
