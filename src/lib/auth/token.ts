/**
 * Token cache with 30s TTL, concurrent-request dedup, 5s timeout, and a
 * consecutive-failure counter that triggers `session_expired` after 3 strikes.
 * Adapted from mobile/src/services/apiClient.ts token layer.
 */

import { emitApiError } from '@/lib/api/errorBus';

const TOKEN_CACHE_MS = 30_000;
const TOKEN_TIMEOUT_MS = 5_000;
const MAX_CONSECUTIVE_FAILURES = 3;

let cachedToken: string | null = null;
let cacheTimestamp = 0;
let pendingFetch: Promise<string | null> | null = null;
let consecutiveFailures = 0;

type TokenGetter = () => Promise<string | null>;
let tokenGetter: TokenGetter | null = null;

export function setTokenGetter(getter: TokenGetter) {
  tokenGetter = getter;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Token fetch timed out after ${ms}ms`)),
      ms,
    );
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

function registerOutcome(success: boolean) {
  if (success) {
    consecutiveFailures = 0;
    return;
  }
  consecutiveFailures += 1;
  if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
    // Pin the counter so we only fire once until something succeeds again.
    consecutiveFailures = MAX_CONSECUTIVE_FAILURES;
    emitApiError({ type: 'session_expired', status: 401 });
  }
}

export async function getToken(
  opts: { forceRefresh?: boolean } = {},
): Promise<string | null> {
  if (!tokenGetter) return null;

  const now = Date.now();
  if (!opts.forceRefresh && cachedToken && now - cacheTimestamp < TOKEN_CACHE_MS) {
    return cachedToken;
  }

  if (pendingFetch) return pendingFetch;

  pendingFetch = withTimeout(tokenGetter(), TOKEN_TIMEOUT_MS)
    .then((token) => {
      cachedToken = token;
      cacheTimestamp = Date.now();
      registerOutcome(token != null);
      return token;
    })
    .catch((err) => {
      registerOutcome(false);
      // Don't propagate — callers just proceed without Authorization header.
      if (process.env.NODE_ENV === 'development') {
        console.warn('[auth] Token fetch failed:', (err as Error)?.message ?? err);
      }
      return null;
    })
    .finally(() => {
      pendingFetch = null;
    });

  return pendingFetch;
}

export function clearTokenCache() {
  cachedToken = null;
  cacheTimestamp = 0;
}

/** Test/utility hook — resets the failure counter without clearing the token. */
export function resetTokenFailureCounter() {
  consecutiveFailures = 0;
}
