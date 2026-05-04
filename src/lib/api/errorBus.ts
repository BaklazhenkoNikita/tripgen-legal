/**
 * Lightweight pub-sub for API error signals that UI contexts subscribe to.
 *
 * Mirrors mobile's `AILimitPopupHost` / `SessionExpiredHost` pattern without
 * coupling the HTTP layer to React. Contexts (wired in (app)/layout.tsx) call
 * `subscribe()` on mount and receive events until unmount.
 */

export type ApiErrorEvent =
  | { type: 'rate_limit'; status: 429; retryAfterSeconds?: number; message?: string }
  | { type: 'maintenance'; status: 503; message?: string }
  | { type: 'session_expired'; status: 401 };

type Listener = (event: ApiErrorEvent) => void;

const listeners = new Set<Listener>();

export function subscribeApiErrors(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function emitApiError(event: ApiErrorEvent) {
  for (const fn of listeners) {
    try {
      fn(event);
    } catch {
      // Listeners shouldn't throw; swallow to keep delivery ordered.
    }
  }
}

/** Parse a Retry-After header value (seconds or HTTP-date) into seconds from now. */
export function parseRetryAfter(headerValue: string | null): number | undefined {
  if (!headerValue) return undefined;
  const asNum = Number(headerValue);
  if (Number.isFinite(asNum) && asNum >= 0) return asNum;
  const asDate = Date.parse(headerValue);
  if (!Number.isNaN(asDate)) {
    const secs = Math.max(0, Math.round((asDate - Date.now()) / 1000));
    return secs;
  }
  return undefined;
}
