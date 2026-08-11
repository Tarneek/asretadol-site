import { apiFetch } from './client';
import type { PublicStory } from '../types/public-api';

export async function fetchPublicStories(): Promise<PublicStory[]> {
  return apiFetch<PublicStory[]>('/public/stories', {
    revalidate: 60,
  });
}
