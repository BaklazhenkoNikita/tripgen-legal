'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/keys';
import type { TravelActivity } from '@/types';

/** GET `/api/activity/{id}` — full activity record including cached enrichment. */
export function useActivity(activityId: string | null | undefined) {
  return useQuery({
    queryKey: ['activity', activityId ?? ''],
    queryFn: async (): Promise<TravelActivity | null> => {
      if (!activityId) return null;
      return api.get<TravelActivity>(endpoints.activityDetail(activityId));
    },
    enabled: !!activityId,
    staleTime: 30 * 60 * 1000,
  });
}

export interface ActivitiesListArgs {
  city?: string;
  category?: string;
  limit?: number;
  skip?: number;
}

export interface ActivitiesListResponse {
  activities: TravelActivity[];
  total: number;
}

/** GET `/api/activities/list` — paginated list. */
export function useActivitiesList(args: ActivitiesListArgs | null) {
  return useQuery({
    queryKey: [
      'activitiesList',
      args?.city ?? '',
      args?.category ?? '',
      args?.limit ?? 30,
      args?.skip ?? 0,
    ],
    queryFn: async (): Promise<ActivitiesListResponse | null> => {
      if (!args) return null;
      const q = new URLSearchParams();
      if (args.city) q.set('city', args.city);
      if (args.category) q.set('category', args.category);
      q.set('limit', String(args.limit ?? 30));
      q.set('skip', String(args.skip ?? 0));
      return api.get<ActivitiesListResponse>(`${endpoints.activitiesList}?${q.toString()}`);
    },
    enabled: !!args && !!args.city,
    staleTime: 10 * 60 * 1000,
  });
}

export interface ActivitiesSearchArgs {
  q: string;
  city?: string;
  limit?: number;
}

/** GET `/api/activities/search` — full-text search. */
export function useActivitiesSearch(args: ActivitiesSearchArgs | null) {
  return useQuery({
    queryKey: queryKeys.activities.search(args?.q ?? ''),
    queryFn: async (): Promise<ActivitiesListResponse | null> => {
      if (!args?.q) return null;
      const q = new URLSearchParams({ q: args.q });
      if (args.city) q.set('city', args.city);
      if (args.limit) q.set('limit', String(args.limit));
      return api.get<ActivitiesListResponse>(`${endpoints.activitiesSearch}?${q.toString()}`);
    },
    enabled: !!args?.q,
    staleTime: 5 * 60 * 1000,
  });
}
