'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import type { Restaurant } from '@/types';
import { entitiesHavePendingImages } from '@/lib/feed/imageReadiness';

export interface RestaurantsListResponse {
  restaurants: Restaurant[];
  total?: number;
}

export interface RestaurantsListArgs {
  city: string;
  category?: string;
  limit?: number;
  skip?: number;
}

export function useRestaurantsList(args: RestaurantsListArgs | null) {
  return useQuery({
    queryKey: [
      'restaurantsList',
      args?.city ?? '',
      args?.category ?? '',
      args?.limit ?? 30,
      args?.skip ?? 0,
    ],
    queryFn: async (): Promise<RestaurantsListResponse | null> => {
      if (!args) return null;
      const q = new URLSearchParams({ city: args.city });
      if (args.category) q.set('category', args.category);
      q.set('limit', String(args.limit ?? 30));
      q.set('skip', String(args.skip ?? 0));
      return api.get<RestaurantsListResponse>(
        `${endpoints.restaurantsList}?${q.toString()}`,
      );
    },
    enabled: !!args?.city,
    staleTime: 10 * 60 * 1000,
    refetchInterval: (query) => {
      const d = query.state.data as RestaurantsListResponse | null | undefined;
      if (!d) return false;
      const items = d.restaurants ?? [];
      if (items.length === 0 && query.state.dataUpdateCount < 8) return 4000;
      if (entitiesHavePendingImages(items) && query.state.dataUpdateCount < 12) return 4000;
      return false;
    },
    refetchIntervalInBackground: false,
  });
}
