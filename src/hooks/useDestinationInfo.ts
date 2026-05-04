'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/keys';
import type { DestinationInfo } from '@/types';

/** Live destination info (GET /api/destinations/info/{city}). Unauthenticated
 *  — the backend's rate limit applies only on cache miss per mobile docs. */
export function useDestinationInfo(city: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.destinations.info(city ?? ''),
    queryFn: async (): Promise<DestinationInfo | null> => {
      if (!city) return null;
      return api.get<DestinationInfo>(endpoints.destinationInfo(city));
    },
    enabled: !!city,
    staleTime: 24 * 60 * 60 * 1000, // 24h
    retry: 1,
  });
}
