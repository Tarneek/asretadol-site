import type { MetadataRoute } from 'next';
import { fetchLatestArticles } from '@/lib/api/public-articles';
import { generateArticleSlug } from '@/lib/url/generate-article-slug';
import { getSiteUrl } from '@/lib/site-url';

const STATIC_PATHS = [
  '/',
  '/about',
  '/contact',
  '/category/iranian-economy',
  '/category/world-economy',
  '/tag/analysis',
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${siteUrl}${path === '/' ? '' : path}`,
    lastModified: now,
    changeFrequency: path === '/' ? 'hourly' : 'weekly',
    priority: path === '/' ? 1 : 0.7,
  }));

  try {
    const { data } = await fetchLatestArticles({ limit: 500, page: 1 });
    const articleEntries: MetadataRoute.Sitemap = data.map((article) => ({
      url: `${siteUrl}/news/${article.id}/${generateArticleSlug(article.title)}`,
      lastModified: new Date(article.publishedAt),
      changeFrequency: 'daily',
      priority: 0.8,
    }));

    return [...staticEntries, ...articleEntries];
  } catch {
    return staticEntries;
  }
}
