import { adminApiFetch } from './admin-client';

export type AdminUser = {
  id: string;
  mobile: string;
  email: string | null;
  displayName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function listAdminUsers(): Promise<AdminUser[]> {
  return adminApiFetch<AdminUser[]>('/users');
}

export async function createAdminUser(body: {
  mobile: string;
  password: string;
  displayName?: string;
  role?: string;
  isActive?: boolean;
}): Promise<AdminUser> {
  return adminApiFetch<AdminUser>('/users', { method: 'POST', body });
}

export async function updateAdminUser(
  id: string,
  body: {
    mobile?: string;
    password?: string;
    displayName?: string;
    role?: string;
    isActive?: boolean;
  },
): Promise<AdminUser> {
  return adminApiFetch<AdminUser>(`/users/${id}`, { method: 'PATCH', body });
}

export async function deleteAdminUser(id: string): Promise<void> {
  await adminApiFetch<void>(`/users/${id}`, { method: 'DELETE' });
}
