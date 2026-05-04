'use client';

import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/keys';
import type { TravelData, TravelActivity, DayPlan } from '@/types';

interface TripDetailResponse {
  search_id: string;
  travel_state?: TravelData;
  [key: string]: unknown;
}

export function useTripDetail(searchId: string | null) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.trips.detail(searchId ?? ''),
    queryFn: async (): Promise<TravelData | null> => {
      if (!searchId) return null;
      const res = await api.get<TripDetailResponse>(
        endpoints.searchHistoryById(searchId),
      );
      return res.travel_state ?? null;
    },
    enabled: !!searchId,
    staleTime: 2 * 60 * 1000,
  });

  const tripData = data ?? null;

  /** Update trip data in React Query cache (for optimistic updates) */
  const setTripData = useCallback(
    (updater: TravelData | ((prev: TravelData | null) => TravelData | null)) => {
      queryClient.setQueryData(
        queryKeys.trips.detail(searchId ?? ''),
        (old: TravelData | null | undefined) => {
          if (typeof updater === 'function') return updater(old ?? null);
          return updater;
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

  /** Resolve a day's simplified activities to full TravelActivity objects */
  const getActivitiesForDay = useCallback(
    (dayIndex: number): TravelActivity[] => {
      const day = days[dayIndex];
      if (!day) return [];
      return day.activities
        .map((s) => activityPoolMap.get(s.id) ?? activityPoolMap.get(s.activity_id ?? ''))
        .filter((a): a is TravelActivity => a != null);
    },
    [days, activityPoolMap],
  );

  return {
    tripData,
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
