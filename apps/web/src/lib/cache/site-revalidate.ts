import { revalidatePath, revalidateTag } from 'next/cache';

/** Shared Data Cache tags for public site fetches (Next.js App Router). */
export const SITE_CACHE_TAGS = {
  home: 'site:home',
  articles: 'site:articles',
  stories: 'site:stories',
  advertisements: 'site:advertisements',
  marketRates: 'site:market-rates',
  taxonomy: 'site:taxonomy',
} as const;

export type SiteCacheTag = (typeof SITE_CACHE_TAGS)[keyof typeof SITE_CACHE_TAGS];

type RevalidatePublicSiteOptions = {
  /** Invalidate article list/detail data (default true for article mutations). */
  articles?: boolean;
  stories?: boolean;
  advertisements?: boolean;
  taxonomy?: boolean;
  marketRates?: boolean;
  /** Specific article routes when known. */
  articleId?: number;
  articleSlug?: string;
};

/**
 * Bust Next.js Data Cache + Full Route Cache for public pages after CMS writes.
 * Always refreshes the homepage; optionally targets related sections.
 */
export function revalidatePublicSite(
  options: RevalidatePublicSiteOptions = {},
): void {
  const {
    articles = false,
    stories = false,
    advertisements = false,
    taxonomy = false,
    marketRates = false,
    articleId,
    articleSlug,
  } = options;

  revalidateTag(SITE_CACHE_TAGS.home);

  if (articles) {
    revalidateTag(SITE_CACHE_TAGS.articles);
  }
  if (stories) {
    revalidateTag(SITE_CACHE_TAGS.stories);
  }
  if (advertisements) {
    revalidateTag(SITE_CACHE_TAGS.advertisements);
  }
  if (taxonomy) {
    revalidateTag(SITE_CACHE_TAGS.taxonomy);
  }
  if (marketRates) {
    revalidateTag(SITE_CACHE_TAGS.marketRates);
  }

  // Route Cache — public surfaces only (avoid wiping /admin via root layout)
  revalidatePath('/');
  revalidatePath('/category', 'layout');
  revalidatePath('/tag', 'layout');
  revalidatePath('/news', 'layout');
  revalidatePath('/article', 'layout');

  if (articleId != null && articleSlug) {
    revalidatePath(`/news/${articleId}/${articleSlug}`);
  }

  if (articleSlug) {
    revalidatePath(`/article/${articleSlug}`);
  }
}

export function revalidateAfterArticleMutation(article?: {
  id: number;
  slug?: string;
}): void {
  revalidatePublicSite({
    articles: true,
    taxonomy: true,
    articleId: article?.id,
    articleSlug: article?.slug,
  });
}

export function revalidateAfterStoryMutation(): void {
  revalidatePublicSite({ stories: true });
}

export function revalidateAfterAdvertisementMutation(): void {
  revalidatePublicSite({ advertisements: true });
}

export function revalidateAfterTaxonomyMutation(): void {
  revalidatePublicSite({ articles: true, taxonomy: true });
}
