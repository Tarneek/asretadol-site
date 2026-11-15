import { SITE_CACHE_TAGS } from '../cache/site-revalidate';
import { apiFetch } from './client';
import type { PublicStory } from '../types/public-api';

export async function fetchPublicStories(): Promise<PublicStory[]> {
  return apiFetch<PublicStory[]>('/public/stories', {
    revalidate: 30,
    tags: [SITE_CACHE_TAGS.home, SITE_CACHE_TAGS.stories],
  });
}
