import { ApiError, apiFetch } from './client';
import {
  getAccessTokenFromCookies,
  refreshAccessToken,
} from '../auth/session';

type AdminFetchOptions = {
  method?: string;
  body?: unknown | FormData;
  searchParams?: Record<string, string | number | undefined>;
};

export async function adminApiFetch<T>(
  path: string,
  options?: AdminFetchOptions,
): Promise<T> {
  let accessToken = await getAccessTokenFromCookies();
  if (!accessToken) {
    throw new ApiError(401, 'Not authenticated');
  }

  try {
    return await apiFetch<T>(path, {
      method: options?.method,
      body: options?.body,
      searchParams: options?.searchParams,
      revalidate: false,
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      accessToken = await refreshAccessToken();
      if (!accessToken) {
        throw error;
      }
      return apiFetch<T>(path, {
        method: options?.method,
        body: options?.body,
        searchParams: options?.searchParams,
        revalidate: false,
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    }
    throw error;
  }
}
