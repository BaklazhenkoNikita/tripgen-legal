import type { QueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/keys';
import type { TravelData } from '@/types';

interface TripDetailResponse {
  search_id: string;
  travel_state?: TravelData;
  [key: string]: unknown;
}

export function prefetchTripDetail(queryClient: QueryClient, searchId: string) {
  if (!searchId) return;
  void queryClient.prefetchQuery({
    queryKey: queryKeys.trips.detail(searchId),
    queryFn: async (): Promise<TravelData | null> => {
      const res = await api.get<TripDetailResponse>(
        endpoints.searchHistoryById(searchId),
      );
      return res.travel_state ?? null;
    },
    staleTime: 2 * 60 * 1000,
  });
}
