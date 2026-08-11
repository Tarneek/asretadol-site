import { apiFetch } from './client';
import type {
  ListArticlesParams,
  PaginatedPublicArticles,
  PublicArticleDetail,
  PublicCategoryArticles,
  PublicTagArticles,
} from '../types/public-api';

function toSearchParams(params: ListArticlesParams): Record<string, string | number | undefined> {
  return {
    page: params.page,
    limit: params.limit,
    categoryId: params.categoryId,
    tagId: params.tagId,
    authorId: params.authorId,
  };
}

export async function fetchLatestArticles(
  params?: ListArticlesParams,
): Promise<PaginatedPublicArticles> {
  return apiFetch<PaginatedPublicArticles>('/public/articles/latest', {
    searchParams: toSearchParams(params ?? {}),
  });
}

export async function fetchFeaturedArticles(
  params?: Pick<ListArticlesParams, 'page' | 'limit'>,
): Promise<PaginatedPublicArticles> {
  return apiFetch<PaginatedPublicArticles>('/public/articles/featured', {
    searchParams: {
      page: params?.page,
      limit: params?.limit,
    },
  });
}

export async function fetchHeroArticles(
  params?: Pick<ListArticlesParams, 'page' | 'limit'>,
): Promise<PaginatedPublicArticles> {
  return apiFetch<PaginatedPublicArticles>('/public/articles/hero', {
    searchParams: {
      page: params?.page,
      limit: params?.limit,
    },
  });
}

export async function fetchBreakingArticles(
  params?: Pick<ListArticlesParams, 'page' | 'limit'>,
): Promise<PaginatedPublicArticles> {
  return apiFetch<PaginatedPublicArticles>('/public/articles/breaking', {
    searchParams: {
      page: params?.page,
      limit: params?.limit,
    },
  });
}

export async function fetchArticleBySlug(slug: string): Promise<PublicArticleDetail> {
  return apiFetch<PublicArticleDetail>(`/public/articles/${encodeURIComponent(slug)}`);
}

export async function fetchArticleById(id: number): Promise<PublicArticleDetail> {
  return apiFetch<PublicArticleDetail>(`/public/articles/${id}`);
}

export async function fetchCategoryArticles(
  categorySlug: string,
  params?: Pick<ListArticlesParams, 'page' | 'limit'>,
): Promise<PublicCategoryArticles> {
  return apiFetch<PublicCategoryArticles>(
    `/public/categories/${encodeURIComponent(categorySlug)}/articles`,
    {
      searchParams: {
        page: params?.page,
        limit: params?.limit,
      },
    },
  );
}

export async function fetchTagArticles(
  tagSlug: string,
  params?: Pick<ListArticlesParams, 'page' | 'limit'>,
): Promise<PublicTagArticles> {
  return apiFetch<PublicTagArticles>(`/public/tags/${encodeURIComponent(tagSlug)}/articles`, {
    searchParams: {
      page: params?.page,
      limit: params?.limit,
    },
  });
}

export async function searchPublicArticles(params: {
  q: string;
  page?: number;
  limit?: number;
  categorySlug?: string;
  tagSlug?: string;
}): Promise<{
  query: string;
  data: import('../types/public-api').PublicArticleCard[];
  meta: import('../types/public-api').PaginationMeta;
}> {
  return apiFetch('/public/search', {
    searchParams: {
      q: params.q,
      page: params.page,
      limit: params.limit,
      categorySlug: params.categorySlug,
      tagSlug: params.tagSlug,
    },
  });
}
