import { ApiError } from './client';
import { adminApiFetch } from './admin-client';
import type {
  AdminArticle,
  AdminDashboardStats,
  AdminViewsChart,
  PaginatedAdminArticles,
} from '../types/admin-api';

export async function fetchAdminDashboardStats(): Promise<AdminDashboardStats> {
  return adminApiFetch<AdminDashboardStats>('/articles/stats');
}

export async function fetchAdminViewsChart(days = 14): Promise<AdminViewsChart> {
  return adminApiFetch<AdminViewsChart>('/articles/stats/views-chart', {
    searchParams: { days },
  });
}

/** Chart data only — never throws; dashboard stats stay usable if this fails. */
export async function fetchAdminViewsChartSafe(
  days = 14,
): Promise<{ chart: AdminViewsChart; unavailable: boolean }> {
  try {
    const chart = await fetchAdminViewsChart(days);
    return { chart, unavailable: false };
  } catch (error) {
    if (process.env.NODE_ENV === 'development' && error instanceof ApiError) {
      console.warn('[admin] views chart unavailable:', error.body);
    }
    const clampedDays = Math.min(90, Math.max(7, days));
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const points: AdminViewsChart['points'] = [];
    for (let i = 0; i < clampedDays; i += 1) {
      const d = new Date(today);
      d.setUTCDate(d.getUTCDate() - (clampedDays - 1 - i));
      points.push({ date: d.toISOString().slice(0, 10), views: 0 });
    }
    return {
      chart: { days: clampedDays, totalInRange: 0, points },
      unavailable: true,
    };
  }
}

export async function listAdminArticles(params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  categoryId?: string;
}): Promise<PaginatedAdminArticles> {
  return adminApiFetch<PaginatedAdminArticles>('/articles', {
    searchParams: {
      page: params?.page,
      limit: params?.limit,
      status: params?.status,
      search: params?.search,
      categoryId: params?.categoryId,
    },
  });
}

export async function getAdminArticle(id: number): Promise<AdminArticle> {
  return adminApiFetch<AdminArticle>(`/articles/${id}`);
}

export async function createAdminArticle(
  body: Record<string, unknown>,
): Promise<AdminArticle> {
  return adminApiFetch<AdminArticle>('/articles', { method: 'POST', body });
}

export async function updateAdminArticle(
  id: number,
  body: Record<string, unknown>,
): Promise<AdminArticle> {
  return adminApiFetch<AdminArticle>(`/articles/${id}`, { method: 'PATCH', body });
}

export async function publishAdminArticle(id: number): Promise<AdminArticle> {
  return adminApiFetch<AdminArticle>(`/articles/${id}/publish`, { method: 'POST' });
}

export async function archiveAdminArticle(id: number): Promise<AdminArticle> {
  return adminApiFetch<AdminArticle>(`/articles/${id}/archive`, { method: 'POST' });
}

export async function deleteAdminArticle(id: number): Promise<void> {
  await adminApiFetch<void>(`/articles/${id}`, { method: 'DELETE' });
}

export async function uploadAdminArticleImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const result = await adminApiFetch<{ path: string }>('/articles/media/upload', {
    method: 'POST',
    body: formData,
  });
  return result.path;
}

export async function uploadAdminArticleVideo(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const result = await adminApiFetch<{ path: string }>('/articles/media/upload-video', {
    method: 'POST',
    body: formData,
  });
  return result.path;
}

export async function setAdminArticleFeatured(
  id: number,
  featured: boolean,
): Promise<AdminArticle> {
  return adminApiFetch<AdminArticle>(`/articles/${id}/featured`, {
    method: 'PATCH',
    body: { featured },
  });
}
