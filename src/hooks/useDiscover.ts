'use client';

import { useCallback, useRef, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createSSEStream } from '@/lib/api/sseClient';
import { endpoints } from '@/lib/api/endpoints';
import { getSessionId } from '@/lib/api/telemetry';
import type { SSEEvent } from '@/types';

/**
 * `POST /api/discover` — SSE stream that surfaces local discoveries (events,
 * hidden gems, neighborhood walks) for a city. Rate-limited by
 * `ai_generation_internal`; consumes credits when user-initiated.
 */
export interface DiscoverArgs {
  city: string;
  query?: string;
  categories?: string[];
  max_results?: number;
}

export type DiscoverPhase = 'idle' | 'connecting' | 'streaming' | 'complete' | 'error';

export interface DiscoverResult {
  id: string;
  title: string;
  description?: string;
  category?: string;
  images?: Array<{ url?: string | null }>;
  source?: string;
  url?: string;
  [key: string]: unknown;
}

export function useDiscover() {
  const [phase, setPhase] = useState<DiscoverPhase>('idle');
  const [results, setResults] = useState<DiscoverResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const { getToken } = useAuth();

  const start = useCallback(
    async (args: DiscoverArgs) => {
      abortRef.current?.abort();
      setPhase('connecting');
      setResults([]);
      setError(null);

      const token = await getToken();
      const sessionId = getSessionId();
      const headers: Record<string, string> = { 'X-Session-Id': sessionId };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      abortRef.current = createSSEStream({
        url: endpoints.discover,
        body: { ...args, session_id: sessionId },
        headers,
        onEvent: (event: SSEEvent) => {
          // Transition to `streaming` once, functionally so we don't read a
          // stale closure value. Ignore housekeeping events (route/heartbeat/etc.).
          setPhase((prev) => (prev === 'connecting' ? 'streaming' : prev));
          if (event.type === 'discovering' || event.type === 'suggestions') {
            const items = Array.isArray(event.data?.items)
              ? (event.data.items as DiscoverResult[])
              : Array.isArray(event.data?.suggestions)
              ? (event.data.suggestions as DiscoverResult[])
              : [];
            if (items.length) setResults((prev) => [...prev, ...items]);
          }
          if (event.type === 'final_response') {
            const items = Array.isArray(event.data?.items)
              ? (event.data.items as DiscoverResult[])
              : [];
            if (items.length) setResults(items);
          }
          if (event.type === 'error') {
            const msg =
              typeof event.data === 'string'
                ? event.data
                : event.data?.message ?? 'Discovery failed';
            setError(msg);
            setPhase('error');
          }
        },
        onError: (err) => {
          setError(err.message);
          setPhase('error');
        },
        onComplete: () => {
          setPhase((prev) => (prev === 'error' ? prev : 'complete'));
        },
      });
    },
    // `phase` is intentionally excluded — we transition via functional
    // setState inside the callback, and including it would recreate `start`
    // on every phase change, which would abort live streams.
    [getToken],
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setPhase('idle');
  }, []);

  return { phase, results, error, start, cancel };
}
