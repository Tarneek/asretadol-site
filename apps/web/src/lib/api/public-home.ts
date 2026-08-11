import { apiFetch, ApiError, isApiNetworkError } from './client';
import { ApiConfigurationError } from '../config';
import {
  fetchCategoryArticles,
  fetchFeaturedArticles,
  fetchHeroArticles,
  fetchLatestArticles,
  fetchTagArticles,
} from './public-articles';
import { fetchPublicStories } from './public-stories';
import type { PublicArticleCard, PublicStory } from '../types/public-api';

export type PublicCategorySummary = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
};

export type PublicTagSummary = {
  id: string;
  name: string;
  slug: string;
};

export async function fetchPublicCategories(): Promise<PublicCategorySummary[]> {
  return apiFetch<PublicCategorySummary[]>('/public/categories', {
    revalidate: 120,
  });
}

export async function fetchPublicTags(): Promise<PublicTagSummary[]> {
  return apiFetch<PublicTagSummary[]>('/public/tags', {
    revalidate: 120,
  });
}

/** Soft-fail helper for homepage sections — empty when taxonomy/articles missing. */
export async function safeFetchCategoryArticles(
  slug: string,
  limit: number,
): Promise<PublicArticleCard[]> {
  try {
    const result = await fetchCategoryArticles(slug, { limit });
    return result.data;
  } catch (error) {
    if (error instanceof ApiConfigurationError || isApiNetworkError(error)) {
      throw error;
    }
    if (error instanceof ApiError && error.status === 404) {
      return [];
    }
    throw error;
  }
}

export async function safeFetchTagArticles(
  slug: string,
  limit: number,
): Promise<PublicArticleCard[]> {
  try {
    const result = await fetchTagArticles(slug, { limit });
    return result.data;
  } catch (error) {
    if (error instanceof ApiConfigurationError || isApiNetworkError(error)) {
      throw error;
    }
    if (error instanceof ApiError && error.status === 404) {
      return [];
    }
    throw error;
  }
}

export async function loadHomepageFeeds() {
  const [hero, featured, latest, iranEconomy, worldEconomy, analytical, stories] =
    await Promise.all([
      fetchHeroArticles({ limit: 6 }),
      fetchFeaturedArticles({ limit: 8 }),
      fetchLatestArticles({ limit: 24 }),
      safeFetchCategoryArticles('iranian-economy', 8),
      safeFetchCategoryArticles('world-economy', 12),
      safeFetchTagArticles('analysis', 8),
      fetchPublicStories().catch((error: unknown) => {
        if (error instanceof ApiConfigurationError || isApiNetworkError(error)) {
          throw error;
        }
        return [] as PublicStory[];
      }),
    ]);

  return {
    hero: hero.data,
    featured: featured.data,
    latest: latest.data,
    iranEconomy,
    worldEconomy,
    analytical,
    stories,
  };
}
