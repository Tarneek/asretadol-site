import { getApiBaseUrl } from '../config';

export { ApiConfigurationError } from '../config';

export class ApiError extends Error {
  readonly status: number;
  readonly body: string;

  constructor(status: number, body: string) {
    super(`API request failed (${status})`);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

/** Thrown when the Nest API is unreachable (ECONNREFUSED, DNS, timeout, etc.). */
export class ApiNetworkError extends Error {
  readonly cause?: unknown;
  readonly url: string;

  constructor(url: string, cause?: unknown) {
    const detail = cause instanceof Error ? cause.message : 'fetch failed';
    super(
      `Cannot reach the API at ${url}. Start the Nest API (pnpm dev:api) and ensure PostgreSQL is running.`,
    );
    this.name = 'ApiNetworkError';
    this.url = url;
    this.cause = cause;
    // Preserve original message for debugging without crashing UX
    if (detail && detail !== 'fetch failed') {
      this.message = `${this.message} (${detail})`;
    }
  }
}

type ApiFetchOptions = {
  searchParams?: Record<string, string | number | undefined>;
  revalidate?: number | false;
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  /** Max wait for the HTTP response (ms). Prevents SSR from hanging when the API is stuck. */
  timeoutMs?: number;
};

const DEFAULT_FETCH_TIMEOUT_MS = 15_000;

export async function apiFetch<T>(path: string, options?: ApiFetchOptions): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = new URL(`${baseUrl}${path.startsWith('/') ? path : `/${path}`}`);

  if (options?.searchParams) {
    for (const [key, value] of Object.entries(options.searchParams)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const hasBody = options?.body !== undefined;
  const isFormData = typeof FormData !== 'undefined' && options?.body instanceof FormData;
  const isGet = !options?.method || options.method === 'GET';
  const useStaticCache = isGet && options?.revalidate !== false;
  const requestUrl = url.toString();

  const timeoutMs = options?.timeoutMs ?? DEFAULT_FETCH_TIMEOUT_MS;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(requestUrl, {
      method: options?.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        ...(hasBody && !isFormData ? { 'Content-Type': 'application/json' } : {}),
        ...options?.headers,
      },
      body: hasBody
        ? isFormData
          ? (options!.body as FormData)
          : JSON.stringify(options!.body)
        : undefined,
      cache: useStaticCache ? undefined : 'no-store',
      next: useStaticCache ? { revalidate: options?.revalidate ?? 60 } : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    throw new ApiNetworkError(baseUrl, error);
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const body = await response.text();
    throw new ApiError(response.status, body);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function isApiNetworkError(error: unknown): error is ApiNetworkError {
  return error instanceof ApiNetworkError;
}
