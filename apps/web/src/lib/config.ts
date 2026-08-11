import type { ApiEnvMissing } from './env';
import { getApiEnv, isProductionApp } from './env';

export { DEV_DEFAULT_API_URL, getApiEnv, getAppEnvironment, isApiConfigured, isProductionApp } from './env';
export type { ApiEnvConfig, ApiEnvMissing, ApiEnvOk, AppEnvironment } from './env';

export class ApiConfigurationError extends Error {
  readonly config: ApiEnvMissing;

  constructor(config: ApiEnvMissing) {
    super(config.message);
    this.name = 'ApiConfigurationError';
    this.config = config;
  }
}

/**
 * Returns the API base URL or throws ApiConfigurationError when not configured.
 * Prefer getApiEnv() + UI fallbacks on public pages; use this inside API clients.
 */
export function getApiBaseUrl(): string {
  const env = getApiEnv();
  if (env.status === 'missing') {
    throw new ApiConfigurationError(env);
  }
  return env.baseUrl;
}

/** Non-throwing helper for auth and optional code paths. */
export function tryGetApiBaseUrl(): string | null {
  const env = getApiEnv();
  return env.status === 'ok' ? env.baseUrl : null;
}

/** @deprecated Use isProductionApp() from ./env */
export function isProduction(): boolean {
  return isProductionApp();
}
