'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import type { TripInsightsResponse } from '@/lib/chat/protocol';

/** Trip check-up for the chat empty state. Model-free on the server, so it
 *  costs no quota; failures just hide the section. */
export function useTripInsights(tripId: string | null | undefined) {
  return useQuery({
    queryKey: ['chat', 'tripInsights', tripId ?? ''] as const,
    queryFn: async () => {
      const res = await api.get<TripInsightsResponse>(endpoints.chatTripInsights(tripId!));
      return Array.isArray(res?.insights) ? res.insights : [];
    },
    enabled: !!tripId,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
