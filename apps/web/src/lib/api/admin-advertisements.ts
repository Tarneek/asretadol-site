import { adminApiFetch } from './admin-client';
import type { AdminAdvertisement } from '../types/admin-api';

export async function listAdminAdvertisements(): Promise<AdminAdvertisement[]> {
  return adminApiFetch<AdminAdvertisement[]>('/advertisements');
}

export async function createAdminAdvertisement(body: {
  title: string;
  imageUrl: string;
  linkUrl: string;
  placement: 'ad-slot' | 'ad-banner';
  slotIndex?: number;
  sortOrder?: number;
  isActive?: boolean;
  rotationEnabled?: boolean;
  rotationIntervalSeconds?: number;
  startsAt?: string | null;
  endsAt?: string | null;
}): Promise<AdminAdvertisement> {
  return adminApiFetch<AdminAdvertisement>('/advertisements', { method: 'POST', body });
}

export async function updateAdminAdvertisement(
  id: string,
  body: Record<string, unknown>,
): Promise<AdminAdvertisement> {
  return adminApiFetch<AdminAdvertisement>(`/advertisements/${id}`, {
    method: 'PATCH',
    body,
  });
}

export async function deleteAdminAdvertisement(id: string): Promise<void> {
  await adminApiFetch<void>(`/advertisements/${id}`, { method: 'DELETE' });
}
