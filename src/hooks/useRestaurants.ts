'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import type { Restaurant } from '@/types';

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
  });
}
