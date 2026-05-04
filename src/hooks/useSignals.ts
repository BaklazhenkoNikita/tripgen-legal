'use client';

import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';

/**
 * Fire-and-forget behavior tracking. Mirrors mobile `signalService`:
 * records likes/dislikes, dwell times, and per-screen interactions so the
 * recommender has data to personalize feeds. Failures are swallowed.
 */
export interface SignalArgs {
  signal_type: 'like' | 'dislike' | 'view' | 'dwell' | 'tap' | 'add_to_trip' | 'share' | string;
  entity_id?: string;
  entity_type?: 'activity' | 'restaurant' | 'live_event' | 'viator' | 'exploration' | 'trip';
  screen?: string;
  dwell_seconds?: number;
  category?: string;
  value?: number | string;
  metadata?: Record<string, unknown>;
}

export function useSignals() {
  return useMutation({
    mutationFn: async (args: SignalArgs): Promise<void> => {
      try {
        await api.post<void>(endpoints.signals, args);
      } catch {
        // Fire-and-forget — don't surface errors.
      }
    },
    // Never retry; signals are best-effort.
    retry: false,
  });
}

/** Imperative helper outside a React render. Returns a promise but you can ignore it. */
export function emitSignal(args: SignalArgs): Promise<void> {
  return api
    .post<void>(endpoints.signals, args)
    .then(() => undefined)
    .catch(() => undefined);
}
