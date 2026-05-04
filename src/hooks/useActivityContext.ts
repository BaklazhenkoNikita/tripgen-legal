'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/keys';
import type { ActivityDetails, TravelActivity } from '@/types';

/**
 * Lazy-loaded rich activity context (historical significance, insider tips,
 * etc). Called when the ActivityDetailDrawer opens.
 *
 * Mirrors mobile's ActivityDetailSheet behaviour: POST activity name +
 * categories + city; cache in-memory; don't retry on 429.
 */
export function useActivityContext(
  activity: TravelActivity | null,
  destination: string | null,
) {
  const city = destination?.split(',')[0]?.trim() ?? '';
  const activityId = activity?.activity_id ?? activity?.id ?? '';

  return useQuery({
    queryKey: queryKeys.activities.context(activityId),
    queryFn: async (): Promise<ActivityDetails | null> => {
      if (!activity || !city) return null;
      return api.post<ActivityDetails>(endpoints.activityContext, {
        activity_id: activityId,
        activity_name: activity.name,
        city,
        categories: activity.category ?? [],
      });
    },
    enabled: !!activity && !!city,
    staleTime: 24 * 60 * 60 * 1000, // 24h — activity context rarely changes
    retry: (failureCount, error) => {
      if (failureCount >= 1) return false;
      if (error instanceof Error && /\b429\b/.test(error.message)) return false;
      return true;
    },
  });
}
