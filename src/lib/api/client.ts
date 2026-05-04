import { getToken, clearTokenCache } from '@/lib/auth/token';
import { getTelemetryHeaders, type TelemetryOptions } from './telemetry';
import { emitApiError, parseRetryAfter } from './errorBus';
import { API_BASE_URL } from './baseUrl';

export class ApiError extends Error {
  status: number;
  statusText: string;
  body: unknown;
  /**
   * Populated when the server sent a `Retry-After` header (429, 503). The
   * retry policy in `retry.ts` reads this to honor the header before falling
   * back to exponential backoff. Expressed in seconds (HTTP convention).
   */
  retryAfterSeconds?: number;

  constructor(res: Response, body?: unknown, retryAfterSeconds?: number) {
    super(`API ${res.status}: ${res.statusText}`);
    this.name = 'ApiError';
    this.status = res.status;
    this.statusText = res.statusText;
    this.body = body;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

interface FetchOptions extends Omit<RequestInit, 'body'> {
  skipAuth?: boolean;
  body?: unknown;
  /** Optional internal-source marker for rate-limit bucket routing (X-TripGen-Source). */
  internalSource?: TelemetryOptions['internalSource'];
}

function buildInit(
  opts: Omit<RequestInit, 'body' | 'headers'>,
  headers: Headers,
  body: unknown,
): RequestInit {
  return {
    ...opts,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  };
}

function messageFromBody(body: unknown): string | undefined {
  if (!body) return undefined;
  if (typeof body === 'string') return body;
  if (typeof body === 'object' && body) {
    const rec = body as Record<string, unknown>;
    if (typeof rec.message === 'string') return rec.message;
    if (typeof rec.detail === 'string') return rec.detail;
    if (typeof rec.error === 'string') return rec.error;
  }
  return undefined;
}

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { skipAuth, body, internalSource, ...fetchOpts } = options;

  const headers = new Headers(fetchOpts.headers);
  headers.set('Content-Type', 'application/json');
  headers.set('Accept', 'application/json');

  // Telemetry (request id + persistent guest id + feature name + optional source)
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  const telemetry = getTelemetryHeaders({ url, internalSource });
  for (const [key, value] of Object.entries(telemetry)) {
    headers.set(key, value);
  }

  // Auth — fire-and-forget; guest users still call with X-Session-Id only.
  if (!skipAuth) {
    const token = await getToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  let res = await fetch(url, buildInit(fetchOpts, headers, body));

  // 401: refresh token once, retry. If still 401, announce session_expired.
  if (res.status === 401 && !skipAuth) {
    clearTokenCache();
    const freshToken = await getToken({ forceRefresh: true });
    if (freshToken) {
      headers.set('Authorization', `Bearer ${freshToken}`);
      res = await fetch(url, buildInit(fetchOpts, headers, body));
    }
    if (res.status === 401) {
      emitApiError({ type: 'session_expired', status: 401 });
    }
  }

  if (!res.ok) {
    const errBody = await parseErrorBody(res);
    const retryAfterSeconds = parseRetryAfter(res.headers.get('Retry-After'));

    if (res.status === 429) {
      emitApiError({
        type: 'rate_limit',
        status: 429,
        retryAfterSeconds,
        message: messageFromBody(errBody),
      });
    } else if (res.status === 503) {
      emitApiError({
        type: 'maintenance',
        status: 503,
        message: messageFromBody(errBody),
      });
    }

    throw new ApiError(res, errBody, retryAfterSeconds);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

async function parseErrorBody(res: Response): Promise<unknown> {
  try {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch {
    return null;
  }
}

/** Convenience methods */
export const api = {
  get: <T>(path: string, opts?: FetchOptions) =>
    apiFetch<T>(path, { ...opts, method: 'GET' }),

  post: <T>(path: string, body?: unknown, opts?: FetchOptions) =>
    apiFetch<T>(path, { ...opts, method: 'POST', body }),

  patch: <T>(path: string, body?: unknown, opts?: FetchOptions) =>
    apiFetch<T>(path, { ...opts, method: 'PATCH', body }),

  delete: <T>(path: string, opts?: FetchOptions) =>
    apiFetch<T>(path, { ...opts, method: 'DELETE' }),
};
