/**
 * Mobile-parity retry policy for REST (via `apiFetch`) and React Query.
 *
 * Mirror of `trip_gen_mobile/mobile/src/config/queryClient.ts`:
 *   - 429 → retry up to 2x, honor `Retry-After` (capped at 30s), otherwise
 *     exponential back-off (2^n * 1000ms, max 30s).
 *   - 4xx (excl. 429) → do not retry (the server won't change its mind).
 *   - 5xx / network errors → retry up to 2x, linear back-off (n * 1000ms, max 10s).
 *   - Idempotent by default; callers that must not retry a POST can set
 *     `retry: false` on the React Query option.
 */

import { ApiError } from './client';

const MAX_QUERY_RETRIES = 2;
const RETRY_AFTER_CAP_MS = 30_000;
const EXP_BACKOFF_CAP_MS = 30_000;
const LINEAR_BACKOFF_CAP_MS = 10_000;

function getStatus(err: unknown): number | null {
  if (err instanceof ApiError) return err.status;
  if (err && typeof err === 'object' && 'status' in err) {
    const s = (err as { status?: unknown }).status;
    return typeof s === 'number' ? s : null;
  }
  return null;
}

function getRetryAfterMs(err: unknown): number | null {
  // `ApiError.retryAfterSeconds` is parsed from the `Retry-After` header in
  // `client.ts`; read from there, not from the body (the body is the error
  // envelope, which carries a `detail` string, not structured retry data).
  if (err instanceof ApiError && typeof err.retryAfterSeconds === 'number') {
    return Math.min(err.retryAfterSeconds * 1000, RETRY_AFTER_CAP_MS);
  }
  return null;
}

/** Whether React Query should retry this failure. */
export function shouldRetryQuery(failureCount: number, err: unknown): boolean {
  if (failureCount >= MAX_QUERY_RETRIES) return false;

  const status = getStatus(err);
  if (status === 429) return true;
  if (status !== null && status >= 400 && status < 500) return false;
  // 5xx, network errors, unknown → retry
  return true;
}

/** How long to wait before the next retry attempt. */
export function queryRetryDelay(attemptIndex: number, err: unknown): number {
  const status = getStatus(err);
  if (status === 429) {
    const fromHeader = getRetryAfterMs(err);
    if (fromHeader !== null) return fromHeader;
    const exp = Math.pow(2, attemptIndex) * 1000;
    return Math.min(exp, EXP_BACKOFF_CAP_MS);
  }
  // 5xx / network
  return Math.min((attemptIndex + 1) * 1000, LINEAR_BACKOFF_CAP_MS);
}
