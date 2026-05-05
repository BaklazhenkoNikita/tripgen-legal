'use client';

import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/keys';
import type { TravelData, TravelActivity, DayPlan } from '@/types';

export type TripAccessRole = 'owner' | 'collaborator';

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

export function useTripDetail(searchId: string | null) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.trips.detail(searchId ?? ''),
    queryFn: async (): Promise<TripDetailQueryData | null> => {
      if (!searchId) return null;
      const res = await api.get<TripDetailResponse>(
        endpoints.searchHistoryById(searchId),
      );
      return {
        tripData: res.travel_state ?? null,
        accessRole: res.access_role ?? null,
      };
    },
    enabled: !!searchId,
    staleTime: 2 * 60 * 1000,
  });

  const tripData = data?.tripData ?? null;
  const accessRole = data?.accessRole ?? null;

  /** Update trip data in React Query cache (for optimistic updates) */
  const setTripData = useCallback(
    (updater: TravelData | ((prev: TravelData | null) => TravelData | null)) => {
      queryClient.setQueryData<TripDetailQueryData | null>(
        queryKeys.trips.detail(searchId ?? ''),
        (old) => {
          const prevTrip = old?.tripData ?? null;
          const next =
            typeof updater === 'function' ? updater(prevTrip) : updater;
          return { tripData: next, accessRole: old?.accessRole ?? null };
        },
      );
    },
    [queryClient, searchId],
  );

  // Derived data
  const days: DayPlan[] = useMemo(
    () => tripData?.travel_plan ?? [],
    [tripData],
  );

  const activityPool: TravelActivity[] = useMemo(
    () => tripData?.activities ?? [],
    [tripData],
  );

  const activityPoolMap = useMemo(() => {
    const map = new Map<string, TravelActivity>();
    for (const a of activityPool) {
      if (a.id) map.set(a.id, a);
      if (a.activity_id) map.set(a.activity_id, a);
    }
    return map;
  }, [activityPool]);

  const restaurants = useMemo(
    () => tripData?.restaurants ?? [],
    [tripData],
  );

  /** Resolve a day's simplified activities to full TravelActivity objects.
   *  Order is driven by `day.activities`; refs not yet present in the pool
   *  render as placeholders so first-paint order matches the backend even
   *  when pool hydration lags. */
  const getActivitiesForDay = useCallback(
    (dayIndex: number): TravelActivity[] => {
      const day = days[dayIndex];
      if (!day) return [];
      return day.activities.map((s): TravelActivity => {
        const refId = s.id || s.activity_id || '';
        const pooled =
          activityPoolMap.get(s.id) ?? activityPoolMap.get(s.activity_id ?? '');
        if (pooled) {
          return pooled.id === refId ? pooled : { ...pooled, id: refId };
        }
        return {
          id: refId,
          name: s.name,
          category: s.category,
          time_of_visit: s.time_of_visit,
          activity_id: s.activity_id,
        };
      });
    },
    [days, activityPoolMap],
  );

  return {
    tripData,
    accessRole,
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
    setTripData,
    days,
    activityPool,
    activityPoolMap,
    restaurants,
    getActivitiesForDay,
  };
}
