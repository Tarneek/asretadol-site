import { adminApiFetch } from './admin-client';
import type { AdminCategory } from '../types/admin-api';

export async function listAdminCategories(): Promise<AdminCategory[]> {
  return adminApiFetch<AdminCategory[]>('/categories');
}

export async function createAdminCategory(body: {
  name: string;
  slug?: string;
  description?: string | null;
}): Promise<AdminCategory> {
  return adminApiFetch<AdminCategory>('/categories', { method: 'POST', body });
}

export async function updateAdminCategory(
  id: string,
  body: Record<string, unknown>,
): Promise<AdminCategory> {
  return adminApiFetch<AdminCategory>(`/categories/${id}`, { method: 'PATCH', body });
}

export async function deleteAdminCategory(id: string): Promise<void> {
  await adminApiFetch<void>(`/categories/${id}`, { method: 'DELETE' });
}
