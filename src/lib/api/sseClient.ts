/**
 * SSE streaming client for Web.
 *
 * Adapted from mobile/src/services/sseClient.web.ts.
 * Uses global fetch with ReadableStream for SSE parsing.
 * Includes automatic retry with exponential backoff.
 */

import type { SSEEvent } from '@/types';
import { getTelemetryHeaders, getSessionId, type RequestSource } from './telemetry';
import { emitApiError, parseRetryAfter } from './errorBus';
import { API_BASE_URL } from './baseUrl';

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;
/**
 * Max silence between chunks before we treat the stream as dead and retry.
 * Backend emits `{type:"heartbeat"}` every 30s on long runs and `: keepalive`
 * every 15s; a 60s gap means the socket is broken.
 */
const STALL_TIMEOUT_MS = 60_000;
const isDev = process.env.NODE_ENV === 'development';

export interface SSEOptions {
  url: string;
  body: Record<string, unknown>;
  headers?: Record<string, string>;
  /** Internal fan-out marker (matches REST client's internalSource). */
  internalSource?: RequestSource;
  onEvent: (event: SSEEvent) => void;
  onError: (error: Error) => void;
  onComplete: () => void;
}

type SSERequestError = Error & {
  status?: number;
  retryable?: boolean;
};

async function buildHttpError(response: Response): Promise<SSERequestError> {
  let detail = '';
  try {
    const json = await response.json();
    if (typeof json?.detail === 'string') {
      detail = json.detail;
    }
  } catch {
    try {
      detail = (await response.text()).trim();
    } catch {
      // ignore
    }
  }

  const message = detail || `HTTP ${response.status}: ${response.statusText}`;

  // Surface 429 / 503 / 401 on the error bus so contexts can react (paywall-lite
  // popup, maintenance banner, session-expired redirect) in parallel with the
  // stream's own error handling.
  if (response.status === 429) {
    emitApiError({
      type: 'rate_limit',
      status: 429,
      retryAfterSeconds: parseRetryAfter(response.headers.get('Retry-After')),
      message: detail || undefined,
    });
  } else if (response.status === 503) {
    emitApiError({ type: 'maintenance', status: 503, message: detail || undefined });
  } else if (response.status === 401) {
    emitApiError({ type: 'session_expired', status: 401 });
  }

  const err = new Error(message) as SSERequestError;
  err.status = response.status;
  err.retryable = !(response.status >= 400 && response.status < 500);
  return err;
}

export function createSSEStream(options: SSEOptions): AbortController {
  const { url, body, headers = {}, internalSource, onEvent, onError, onComplete } = options;
  const controller = new AbortController();

  const allHeaders: Record<string, string> = {
    ...getTelemetryHeaders({ url, internalSource }),
    ...headers,
  };

  if (!allHeaders['X-Session-Id']) {
    allHeaders['X-Session-Id'] = getSessionId();
  }

  (async () => {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
        if (isDev) console.log(`[SSE] Retry ${attempt}/${MAX_RETRIES} in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
        if (controller.signal.aborted) {
          onComplete();
          return;
        }
      }

      try {
        if (isDev) {
          console.log(`[SSE] Connecting to ${url}${attempt > 0 ? ` (attempt ${attempt + 1})` : ''}`);
        }

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...allHeaders,
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw await buildHttpError(response);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let buffer = '';

        // Race each chunk against a stall timer; if no bytes arrive for
        // STALL_TIMEOUT_MS, treat it as stream death and fall into the retry loop.
        while (true) {
          const readPromise = reader.read();
          let stallTimer: ReturnType<typeof setTimeout> | undefined;
          const stallPromise = new Promise<never>((_, reject) => {
            stallTimer = setTimeout(() => {
              const err: SSERequestError = new Error(
                `SSE stall: no data for ${Math.round(STALL_TIMEOUT_MS / 1000)}s`,
              );
              err.retryable = true;
              reject(err);
            }, STALL_TIMEOUT_MS);
          });

          let readResult: ReadableStreamReadResult<Uint8Array>;
          try {
            readResult = await Promise.race([readPromise, stallPromise]);
          } finally {
            if (stallTimer) clearTimeout(stallTimer);
          }

          const { done, value } = readResult;
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith(': keepalive')) continue;

            if (trimmed.startsWith('data: ')) {
              const payload = trimmed.slice(6);
              if (payload === '[DONE]') {
                onComplete();
                return;
              }
              try {
                onEvent(JSON.parse(payload) as SSEEvent);
              } catch {
                // Not valid JSON — skip
              }
            }
          }
        }

        onComplete();
        return;
      } catch (err: unknown) {
        const error = err as SSERequestError;
        if (error.name === 'AbortError') {
          onComplete();
          return;
        }
        lastError = error;
        if (isDev) {
          console.warn(`[SSE] Attempt ${attempt + 1} failed:`, error.message);
        }
        if (error.retryable === false) {
          break;
        }
      }
    }

    if (isDev) {
      console.warn(`[SSE] All ${MAX_RETRIES + 1} attempts failed for ${url}`);
    }
    onError(lastError ?? new Error('SSE connection failed'));
  })();

  return controller;
}

/**
 * Helper to start a trip generation SSE stream.
 */
export function streamTripGeneration(params: {
  destination: string;
  startDate?: string;
  endDate?: string;
  budget?: string;
  preferredActivityTypes?: string[];
  numberOfDays?: number;
  additionalInfo?: string;
  vibeTags?: string[];
  energyLevel?: string;
  who?: string;
  planMode?: string;
  query?: string;
  state?: Record<string, unknown> | null;
  authToken?: string | null;
  sessionId?: string;
  onEvent: (event: SSEEvent) => void;
  onError: (error: Error) => void;
  onComplete: () => void;
}): AbortController {
  const { authToken, onEvent, onError, onComplete, sessionId, ...rest } = params;

  const headers: Record<string, string> = {};
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  if (sessionId) headers['X-Session-Id'] = sessionId;

  return createSSEStream({
    url: `${API_BASE_URL}/api/travel`,
    body: {
      destination: rest.destination,
      start_date: rest.startDate,
      end_date: rest.endDate,
      budget: rest.budget,
      preferred_activity_types: rest.preferredActivityTypes,
      number_of_days: rest.numberOfDays,
      additional_info: rest.additionalInfo,
      vibe_tags: rest.vibeTags ?? [],
      energy_level: rest.energyLevel,
      who: rest.who,
      plan_mode: rest.planMode ?? null,
      query: rest.query,
      state: rest.state ?? null,
    },
    headers,
    onEvent,
    onError,
    onComplete,
  });
}
