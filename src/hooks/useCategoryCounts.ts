'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/keys';

export interface CategoryCountsResponse {
  city: string;
  counts: Record<string, number>;
  total: number;
}

/** Category-chip counts for a city's activities feed. */
export function useCategoryCounts(city: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.feeds.categoryCounts(city ?? ''),
    queryFn: async (): Promise<CategoryCountsResponse | null> => {
      if (!city) return null;
      return api.get<CategoryCountsResponse>(endpoints.categoryCounts(city));
    },
    enabled: !!city,
    staleTime: 15 * 60 * 1000,
  });
}
