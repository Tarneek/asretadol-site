import { adminApiFetch } from './admin-client';
import type { AdminTag } from '../types/admin-api';

export async function listAdminTags(): Promise<AdminTag[]> {
  return adminApiFetch<AdminTag[]>('/tags');
}

export async function createAdminTag(body: { name: string; slug?: string }): Promise<AdminTag> {
  return adminApiFetch<AdminTag>('/tags', { method: 'POST', body });
}

export async function updateAdminTag(
  id: string,
  body: Record<string, unknown>,
): Promise<AdminTag> {
  return adminApiFetch<AdminTag>(`/tags/${id}`, { method: 'PATCH', body });
}

export async function deleteAdminTag(id: string): Promise<void> {
  await adminApiFetch<void>(`/tags/${id}`, { method: 'DELETE' });
}
