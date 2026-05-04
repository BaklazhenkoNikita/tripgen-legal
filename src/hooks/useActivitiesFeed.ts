'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/keys';
import type { FeedItem } from './useHomeFeed';

export interface ActivitiesFeedResponse {
  city: string;
  activities: FeedItem[];
  total: number;
}

export function useActivitiesFeed(
  city: string | null | undefined,
  params?: { category?: string; limit?: number; offset?: number },
) {
  return useQuery({
    queryKey: queryKeys.feeds.activities(city ?? '', params),
    queryFn: async (): Promise<ActivitiesFeedResponse | null> => {
      if (!city) return null;
      const q = new URLSearchParams();
      if (params?.category) q.set('category', params.category);
      q.set('limit', String(params?.limit ?? 30));
      if (params?.offset) q.set('offset', String(params.offset));
      const url = `${endpoints.activitiesFeed(city)}?${q.toString()}`;
      return api.get<ActivitiesFeedResponse>(url);
    },
    enabled: !!city,
    staleTime: 15 * 60 * 1000,
  });
}
