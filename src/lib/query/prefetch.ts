import type { QueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/keys';
import type { TravelData } from '@/types';
import type { TripAccessRole } from '@/hooks/useTripDetail';

interface TripDetailResponse {
  search_id: string;
  travel_state?: TravelData;
  access_role?: TripAccessRole | null;
  [key: string]: unknown;
}

interface TripDetailQueryData {
  tripData: TravelData | null;
  accessRole: TripAccessRole | null;
}

export function prefetchTripDetail(queryClient: QueryClient, searchId: string) {
  if (!searchId) return;
  void queryClient.prefetchQuery({
    queryKey: queryKeys.trips.detail(searchId),
    queryFn: async (): Promise<TripDetailQueryData | null> => {
      const res = await api.get<TripDetailResponse>(
        endpoints.searchHistoryById(searchId),
      );
      return {
        tripData: res.travel_state ?? null,
        accessRole: res.access_role ?? null,
      };
    },
    staleTime: 2 * 60 * 1000,
  });
}
