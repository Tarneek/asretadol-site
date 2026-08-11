import { adminApiFetch } from './admin-client';
import type { AdminStory } from '../types/admin-api';

export async function listAdminStories(): Promise<AdminStory[]> {
  return adminApiFetch<AdminStory[]>('/stories');
}

export async function createAdminStory(body: {
  title: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  link?: string | null;
  isActive?: boolean;
}): Promise<AdminStory> {
  return adminApiFetch<AdminStory>('/stories', { method: 'POST', body });
}

export async function updateAdminStory(
  id: string,
  body: Record<string, unknown>,
): Promise<AdminStory> {
  return adminApiFetch<AdminStory>(`/stories/${id}`, { method: 'PATCH', body });
}

export async function deleteAdminStory(id: string): Promise<void> {
  await adminApiFetch<void>(`/stories/${id}`, { method: 'DELETE' });
}
