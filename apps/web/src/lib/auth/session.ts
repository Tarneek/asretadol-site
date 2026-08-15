import { cookies } from 'next/headers';
import { tryGetApiBaseUrl } from '../config';
import { ApiError, apiFetch } from '../api/client';
import {
  ACCESS_TOKEN_COOKIE,
  accessTokenCookieOptions,
  REFRESH_TOKEN_COOKIE,
  refreshTokenCookieOptions,
} from './constants';

export type SessionUser = {
  id: string;
  mobile: string;
  email: string | null;
  displayName: string;
  role: string;
  isActive: boolean;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
};

export async function getAccessTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export async function setAuthCookies(tokens: AuthTokens): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(
    ACCESS_TOKEN_COOKIE,
    tokens.accessToken,
    accessTokenCookieOptions(tokens.expiresIn),
  );
  cookieStore.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, refreshTokenCookieOptions());
}

export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
}

export async function refreshAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  if (!refreshToken) {
    return null;
  }

  const baseUrl = tryGetApiBaseUrl();
  if (!baseUrl) {
    await clearAuthCookies();
    return null;
  }

  const response = await fetch(`${baseUrl}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ refreshToken }),
    cache: 'no-store',
  });

  if (!response.ok) {
    await clearAuthCookies();
    return null;
  }

  const tokens = (await response.json()) as AuthTokens;
  await setAuthCookies(tokens);
  return tokens.accessToken;
}

async function fetchUserMe(accessToken: string): Promise<SessionUser> {
  const baseUrl = tryGetApiBaseUrl();
  if (!baseUrl) {
    throw new ApiError(503, 'API is not configured');
  }

  const response = await fetch(`${baseUrl}/users/me`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const body = await response.text();
    throw new ApiError(response.status, body);
  }

  return response.json() as Promise<SessionUser>;
}

export async function getSession(): Promise<SessionUser | null> {
  let accessToken = await getAccessTokenFromCookies();
  if (!accessToken) {
    return null;
  }

  try {
    return await fetchUserMe(accessToken);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      accessToken = await refreshAccessToken();
      if (!accessToken) {
        return null;
      }
      try {
        return await fetchUserMe(accessToken);
      } catch {
        await clearAuthCookies();
        return null;
      }
    }
    return null;
  }
}

export async function loginWithCredentials(
  mobile: string,
  password: string,
): Promise<SessionUser> {
  const tokens = await apiFetch<AuthTokens>('/auth/login', {
    revalidate: false,
    method: 'POST',
    body: { mobile, password },
  });

  await setAuthCookies(tokens);
  const user = await fetchUserMe(tokens.accessToken);
  return user;
}

export async function logoutSession(): Promise<void> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (refreshToken) {
    try {
      await apiFetch<void>('/auth/logout', {
        revalidate: false,
        method: 'POST',
        body: { refreshToken },
      });
    } catch {
      // Clear local session even if backend logout fails.
    }
  }

  await clearAuthCookies();
}
