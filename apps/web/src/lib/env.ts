/**
 * Centralized frontend environment access.
 * Next.js inlines NEXT_PUBLIC_* at build time; server and client both read the same values.
 */

export type AppEnvironment = 'development' | 'production' | 'test';

export type ApiEnvOk = {
  status: 'ok';
  baseUrl: string;
  source: 'env' | 'development-default';
};

export type ApiEnvMissing = {
  status: 'missing';
  variable: 'NEXT_PUBLIC_API_URL';
  message: string;
  hint: string;
  example: string;
};

export type ApiEnvConfig = ApiEnvOk | ApiEnvMissing;

/** Nest global prefix included — local default matches docker-compose + API_PORT=3001 */
export const DEV_DEFAULT_API_URL = 'http://localhost:3001/api';

const API_URL_VARIABLE = 'NEXT_PUBLIC_API_URL' as const;

function normalizeApiBaseUrl(url: string): string {
  return url.replace(/\/$/, '');
}

export function getAppEnvironment(): AppEnvironment {
  const nodeEnv = process.env.NODE_ENV;
  if (nodeEnv === 'production' || nodeEnv === 'test') {
    return nodeEnv;
  }
  return 'development';
}

export function isProductionApp(): boolean {
  return getAppEnvironment() === 'production';
}

/**
 * Resolves the public API base URL without throwing.
 * - Uses NEXT_PUBLIC_API_URL when set (staging/production/local).
 * - In development, falls back to localhost so `pnpm dev:web` works without a web-only .env.
 */
export function getApiEnv(): ApiEnvConfig {
  const explicit = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (explicit) {
    return {
      status: 'ok',
      baseUrl: normalizeApiBaseUrl(explicit),
      source: 'env',
    };
  }

  if (getAppEnvironment() === 'development') {
    return {
      status: 'ok',
      baseUrl: DEV_DEFAULT_API_URL,
      source: 'development-default',
    };
  }

  return {
    status: 'missing',
    variable: API_URL_VARIABLE,
    message: `${API_URL_VARIABLE} is not set.`,
    hint:
      'Set it to the full Nest API base URL including the /api prefix (e.g. https://api.example.com/api).',
    example: 'http://localhost:3001/api',
  };
}

export function isApiConfigured(): boolean {
  return getApiEnv().status === 'ok';
}

export function getPublicEnvSummary(): {
  appEnv: AppEnvironment;
  api: ApiEnvConfig;
} {
  return {
    appEnv: getAppEnvironment(),
    api: getApiEnv(),
  };
}
