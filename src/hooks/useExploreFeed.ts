'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/keys';
import type { FeedItem } from './useHomeFeed';
import { feedHasPendingImages } from '@/lib/feed/imageReadiness';

export interface ExploreFeedResponse {
  city: string;
  exploration: FeedItem[];
  total: number;
}

export function useExploreFeed(
  city: string | null | undefined,
  params?: { category?: string; limit?: number; offset?: number },
) {
  return useQuery({
    queryKey: queryKeys.feeds.explore(city ?? '', params),
    queryFn: async (): Promise<ExploreFeedResponse | null> => {
      if (!city) return null;
      const q = new URLSearchParams();
      if (params?.category) q.set('category', params.category);
      q.set('limit', String(params?.limit ?? 30));
      if (params?.offset) q.set('offset', String(params.offset));
      const url = `${endpoints.exploreFeed(city)}?${q.toString()}`;
      return api.get<ExploreFeedResponse>(url);
    },
    enabled: !!city,
    staleTime: 15 * 60 * 1000,
    refetchInterval: (query) => {
      const d = query.state.data as ExploreFeedResponse | null | undefined;
      if (!d) return false;
      const items = d.exploration ?? [];
      if (items.length === 0 && query.state.dataUpdateCount < 8) return 4000;
      if (feedHasPendingImages(items) && query.state.dataUpdateCount < 12) return 4000;
      return false;
    },
    refetchIntervalInBackground: false,
  });
}
