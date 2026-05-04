'use client';

import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';

/**
 * Deep activity context — richer than `/api/activity-context`. Used for
 * complex scenarios (multi-day contexts, travel-time reasoning, etc.).
 * Rate-limited by the `activity_detail` counter.
 */
export interface DeepContextArgs {
  activity_id: string;
  city: string;
  trip_context?: Record<string, unknown>;
}

export interface DeepContextResponse {
  context: Record<string, unknown>;
  [key: string]: unknown;
}

export function useDeepContext() {
  return useMutation({
    mutationFn: async (args: DeepContextArgs): Promise<DeepContextResponse> => {
      return api.post<DeepContextResponse>(endpoints.deepContext, args);
    },
  });
}
