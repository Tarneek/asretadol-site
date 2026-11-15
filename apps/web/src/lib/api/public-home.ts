import { SITE_CACHE_TAGS } from '../cache/site-revalidate';
import { ApiConfigurationError } from '../config';
import type { PublicArticleCard, PublicStory, PublicAdvertisement } from '../types/public-api';
import { apiFetch, ApiError, isApiNetworkError } from './client';
import {
  fetchCategoryArticles,
  fetchFeaturedArticles,
  fetchHeroArticles,
  fetchLatestArticles,
  fetchTagArticles,
} from './public-articles';
import { safeFetchPublicAdvertisements } from './public-advertisements';
import { safeFetchPublicMarketRates } from './public-market-rates';
import { fetchPublicStories } from './public-stories';

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
    revalidate: 60,
    tags: [SITE_CACHE_TAGS.taxonomy],
  });
}

export async function fetchPublicTags(): Promise<PublicTagSummary[]> {
  return apiFetch<PublicTagSummary[]>('/public/tags', {
    revalidate: 60,
    tags: [SITE_CACHE_TAGS.taxonomy],
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
  const [hero, featured, latest, iranEconomy, worldEconomy, analytical, stories, advertisements, marketRates] =
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
      safeFetchPublicAdvertisements(),
      safeFetchPublicMarketRates(),
    ]);

  return {
    hero: hero.data,
    featured: featured.data,
    latest: latest.data,
    iranEconomy,
    worldEconomy,
    analytical,
    stories,
    advertisements,
    marketRates,
  };
}
