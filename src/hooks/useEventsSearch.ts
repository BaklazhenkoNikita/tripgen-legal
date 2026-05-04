'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import type { LiveEvent, EventSearchParams, EventSearchResponse } from '@/types';

/** Faceted event search against `/api/events/search`. */
export function useEventsSearch(params: EventSearchParams | null) {
  return useQuery({
    queryKey: [
      'events',
      'search',
      params?.city ?? '',
      params?.date_from ?? '',
      params?.date_to ?? '',
      params?.categories ?? '',
      params?.is_free ?? '',
      params?.max_price ?? '',
      params?.sort ?? '',
      params?.page ?? 1,
      params?.limit ?? 20,
    ],
    queryFn: async (): Promise<EventSearchResponse | null> => {
      if (!params?.city) return null;
      const q = new URLSearchParams();
      q.set('city', params.city);
      if (params.date_from) q.set('date_from', params.date_from);
      if (params.date_to) q.set('date_to', params.date_to);
      if (params.categories) q.set('categories', params.categories);
      if (params.is_free != null) q.set('is_free', String(params.is_free));
      if (params.max_price != null) q.set('max_price', String(params.max_price));
      if (params.lat != null) q.set('lat', String(params.lat));
      if (params.lng != null) q.set('lng', String(params.lng));
      if (params.radius_km != null) q.set('radius_km', String(params.radius_km));
      if (params.sort) q.set('sort', params.sort);
      if (params.page) q.set('page', String(params.page));
      if (params.limit) q.set('limit', String(params.limit));
      return api.get<EventSearchResponse>(`${endpoints.eventsSearch}?${q.toString()}`);
    },
    enabled: !!params?.city,
    staleTime: 5 * 60 * 1000,
  });
}

/** Enrich a single event (rate-limited by `ai_enrich`). */
export interface EnrichEventArgs {
  eventId: string;
  source?: string;
}

export function useEnrichEvent() {
  return useMutation({
    mutationFn: async ({ eventId, source }: EnrichEventArgs): Promise<LiveEvent> => {
      const params = new URLSearchParams();
      if (source) params.set('source', source);
      const suffix = params.toString() ? `?${params.toString()}` : '';
      return api.post<LiveEvent>(
        `${endpoints.eventsSearch.replace('/search', '')}/${encodeURIComponent(eventId)}/enrich${suffix}`,
        {},
      );
    },
  });
}
