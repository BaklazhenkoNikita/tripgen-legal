'use client';

import { useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/keys';
import type {
  TravelData,
  TravelActivity,
  SimplifiedActivity,
  ReorganizeResult,
  ReorganizeDayResult,
} from '@/types';

interface UseTripMutationsOptions {
  searchId: string;
  tripData: TravelData | null;
  setTripData: (updater: TravelData | ((prev: TravelData | null) => TravelData | null)) => void;
}

/**
 * V2 delta mutation hook with serialized queue and optimistic updates.
 * Adapted from mobile/src/hooks/useTripMutations.ts.
 *
 * Key patterns preserved from mobile:
 * - Serialized mutation queue (enqueueMutation) prevents read-modify-write races
 * - Optimistic updates with rollback on error
 * - React Query cache sync for search history summary
 *
 * Removed from mobile:
 * - Haptics (web doesn't have tactile feedback)
 * - Offline mutation queue (web is always online)
 * - offlineAwareMutation wrapper
 */
export function useTripMutations({
  searchId,
  tripData,
  setTripData,
}: UseTripMutationsOptions) {
  const queryClient = useQueryClient();

  // Serialized mutation queue: prevents backend race conditions
  const mutationQueueRef = useRef<Promise<void>>(Promise.resolve());

  const enqueueMutation = useCallback((fn: () => Promise<void>): Promise<void> => {
    const queued = mutationQueueRef.current
      .catch(() => {}) // Don't let previous failures block the queue
      .then(fn);
    mutationQueueRef.current = queued;
    return queued;
  }, []);

  /** Sync React Query search history cache after mutations */
  const syncSearchHistorySummary = useCallback(
    (state: TravelData | null) => {
      if (!state || !searchId) return;
      const ids = new Set<string>();
      for (const day of state.travel_plan ?? []) {
        for (const a of day.activities ?? []) {
          if (a.id) ids.add(a.id);
        }
      }
      const activityCount = ids.size;

      queryClient.setQueriesData(
        { queryKey: queryKeys.trips.summary() },
        (old: unknown) => {
          if (!old || !Array.isArray(old)) return old;
          return old.map((entry: Record<string, unknown>) => {
            if (entry?.search_id !== searchId) return entry;
            return {
              ...entry,
              result_summary: {
                ...((entry.result_summary as Record<string, unknown>) ?? {}),
                total_activities: activityCount,
              },
            };
          });
        },
      );
    },
    [queryClient, searchId],
  );

  // ── Delete Activity ──────────────────────────────────────────────
  const deleteActivity = useCallback(
    (activityId: string, dayNumber: number) => {
      if (!tripData) return;
      const previous = tripData;

      // Optimistic update
      setTripData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          travel_plan: (prev.travel_plan ?? []).map((day) => {
            if (day.day_number !== dayNumber) return day;
            return {
              ...day,
              activities: day.activities.filter(
                (a) => a.id !== activityId && a.activity_id !== activityId,
              ),
            };
          }),
        };
      });

      enqueueMutation(async () => {
        try {
          await api.post(endpoints.v2DeleteActivity, {
            search_id: searchId,
            activity_id: activityId,
            day_number: dayNumber,
          });
          syncSearchHistorySummary(tripData);
        } catch {
          setTripData(previous); // Rollback
        }
      });
    },
    [searchId, tripData, setTripData, syncSearchHistorySummary, enqueueMutation],
  );

  // ── Move Activity ────────────────────────────────────────────────
  const moveActivity = useCallback(
    (activityId: string, fromDay: number, toDay: number, toPosition?: number) => {
      if (!tripData) return;
      const previous = tripData;

      // Optimistic update
      setTripData((prev) => {
        if (!prev) return prev;
        let moved: SimplifiedActivity | null = null;
        const updated = (prev.travel_plan ?? []).map((day) => {
          if (day.day_number === fromDay) {
            const found = day.activities.find(
              (a) => a.id === activityId || a.activity_id === activityId,
            );
            if (found) moved = found;
            return {
              ...day,
              activities: day.activities.filter(
                (a) => a.id !== activityId && a.activity_id !== activityId,
              ),
            };
          }
          return day;
        });
        if (!moved) return { ...prev, travel_plan: updated };
        return {
          ...prev,
          travel_plan: updated.map((day) => {
            if (day.day_number === toDay) {
              const acts = [...day.activities];
              acts.splice(toPosition ?? acts.length, 0, moved!);
              return { ...day, activities: acts };
            }
            return day;
          }),
        };
      });

      enqueueMutation(async () => {
        try {
          await api.post(endpoints.v2MoveActivity, {
            search_id: searchId,
            activity_id: activityId,
            from_day: fromDay,
            to_day: toDay,
            to_position: toPosition ?? 0,
          });
        } catch {
          setTripData(previous);
        }
      });
    },
    [searchId, tripData, setTripData, enqueueMutation],
  );

  // ── Reorder Activities ───────────────────────────────────────────
  const reorderActivities = useCallback(
    (dayNumber: number, orderedIds: string[]) => {
      if (!tripData) return;
      const previous = tripData;

      // Optimistic update
      setTripData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          travel_plan: (prev.travel_plan ?? []).map((day) => {
            if (day.day_number !== dayNumber) return day;
            const map = new Map(day.activities.map((a) => [a.id, a]));
            const reordered = orderedIds
              .map((id) => map.get(id))
              .filter(Boolean) as typeof day.activities;
            // Append any activities not in the ordered list
            day.activities.forEach((a) => {
              if (!orderedIds.includes(a.id)) reordered.push(a);
            });
            return { ...day, activities: reordered };
          }),
        };
      });

      enqueueMutation(async () => {
        try {
          await api.post(endpoints.v2ReorderActivities, {
            search_id: searchId,
            day_number: dayNumber,
            activity_ids: orderedIds,
          });
        } catch {
          setTripData(previous);
        }
      });
    },
    [searchId, tripData, setTripData, enqueueMutation],
  );

  // ── Add Activity ─────────────────────────────────────────────────
  const addActivity = useCallback(
    (activity: TravelActivity, dayNumber: number) => {
      if (!tripData) return;
      const previous = tripData;
      const activityId = activity.activity_id ?? activity.id;

      // Optimistic update
      setTripData((prev) => {
        if (!prev) return prev;
        const simplifiedRef: SimplifiedActivity = {
          id: activityId,
          name: activity.name,
          activity_id: activity.activity_id,
          category: activity.category,
          time_of_visit: activity.time_of_visit,
        };
        return {
          ...prev,
          activities: [...(prev.activities ?? []), activity],
          travel_plan: (prev.travel_plan ?? []).map((day) => {
            if (day.day_number !== dayNumber) return day;
            return { ...day, activities: [...day.activities, simplifiedRef] };
          }),
        };
      });

      enqueueMutation(async () => {
        try {
          await api.post(endpoints.v2AddActivity, {
            search_id: searchId,
            day_number: dayNumber,
            activity_id: activityId,
            activity_name: activity.name,
          });
          syncSearchHistorySummary(tripData);
        } catch {
          setTripData(previous);
        }
      });
    },
    [searchId, tripData, setTripData, syncSearchHistorySummary, enqueueMutation],
  );

  // ── Attach Activity to Day (from existing pool) ──────────────────
  // For the manual "+" picker on each day. The activity is already in the
  // trip pool (`travelData.activities`); we only insert a SimplifiedActivity
  // ref into the chosen day. Server-side, v2AddActivity by activity_id is
  // idempotent w.r.t. the pool.
  const attachActivityToDay = useCallback(
    (activity: TravelActivity, dayNumber: number, position?: number) => {
      if (!tripData) return;
      const previous = tripData;
      const activityId = activity.activity_id ?? activity.id;

      setTripData((prev) => {
        if (!prev) return prev;
        const simplifiedRef: SimplifiedActivity = {
          id: activityId,
          name: activity.name,
          activity_id: activity.activity_id,
          category: activity.category,
          time_of_visit: activity.time_of_visit,
        };
        return {
          ...prev,
          travel_plan: (prev.travel_plan ?? []).map((day) => {
            if (day.day_number !== dayNumber) return day;
            const acts = [...day.activities];
            acts.splice(position ?? acts.length, 0, simplifiedRef);
            return { ...day, activities: acts };
          }),
        };
      });

      enqueueMutation(async () => {
        try {
          await api.post(endpoints.v2AddActivity, {
            search_id: searchId,
            day_number: dayNumber,
            activity_id: activityId,
            activity_name: activity.name,
          });
          syncSearchHistorySummary(tripData);
        } catch {
          setTripData(previous);
        }
      });
    },
    [searchId, tripData, setTripData, syncSearchHistorySummary, enqueueMutation],
  );

  // ── Restore Activity ─────────────────────────────────────────────
  // Reuses v2AddActivity. The activity is still in the `activities` pool
  // after a delete (only the day reference + `deleted_activities` shadow
  // entry are touched), so re-adding by activity_id puts it back without
  // duplicating the pool entry.
  const restoreActivity = useCallback(
    (activity: TravelActivity, dayNumber: number) => {
      if (!tripData) return;
      const previous = tripData;
      const activityId = activity.activity_id ?? activity.id;

      setTripData((prev) => {
        if (!prev) return prev;
        const simplifiedRef: SimplifiedActivity = {
          id: activityId,
          name: activity.name,
          activity_id: activity.activity_id,
          category: activity.category,
          time_of_visit: activity.time_of_visit,
        };
        return {
          ...prev,
          deleted_activities: (prev.deleted_activities ?? []).filter(
            (a) => a.id !== activityId && a.activity_id !== activityId,
          ),
          travel_plan: (prev.travel_plan ?? []).map((day) => {
            if (day.day_number !== dayNumber) return day;
            return { ...day, activities: [...day.activities, simplifiedRef] };
          }),
        };
      });

      enqueueMutation(async () => {
        try {
          await api.post(endpoints.v2AddActivity, {
            search_id: searchId,
            day_number: dayNumber,
            activity_id: activityId,
            activity_name: activity.name,
          });
          syncSearchHistorySummary(tripData);
        } catch {
          setTripData(previous);
        }
      });
    },
    [searchId, tripData, setTripData, syncSearchHistorySummary, enqueueMutation],
  );

  // ── Add Day ──────────────────────────────────────────────────────
  const addDay = useCallback(
    (mode: 'empty' | 'ai' | 'fill_unassigned' = 'empty') => {
      if (!tripData) return;
      const previous = tripData;
      const newDayNumber = (tripData.travel_plan?.length ?? 0) + 1;

      // Optimistic update
      setTripData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          travel_plan: [
            ...(prev.travel_plan ?? []),
            { day_number: newDayNumber, activities: [] },
          ],
          total_trip_days: newDayNumber,
        };
      });

      enqueueMutation(async () => {
        try {
          await api.post(endpoints.v2AddDay, {
            search_id: searchId,
            mode,
          });
        } catch {
          setTripData(previous);
        }
      });
    },
    [searchId, tripData, setTripData, enqueueMutation],
  );

  // ── Delete Day ───────────────────────────────────────────────────
  const deleteDay = useCallback(
    (dayNumber: number, mode: 'redistribute' | 'delete_all' = 'delete_all') => {
      if (!tripData) return;
      const previous = tripData;

      // Optimistic update
      setTripData((prev) => {
        if (!prev) return prev;
        const filtered = (prev.travel_plan ?? [])
          .filter((d) => d.day_number !== dayNumber)
          .map((d, i) => ({ ...d, day_number: i + 1 })); // Renumber
        return {
          ...prev,
          travel_plan: filtered,
          total_trip_days: filtered.length,
        };
      });

      enqueueMutation(async () => {
        try {
          await api.post(endpoints.v2DeleteDay, {
            search_id: searchId,
            day_number: dayNumber,
            mode,
          });
          syncSearchHistorySummary(tripData);
          // In redistribute mode the server moves this day's activities onto
          // other days; the optimistic update only dropped the day, so refetch
          // to pull in the redistributed plan. delete_all needs no refetch.
          if (mode === 'redistribute') {
            queryClient.invalidateQueries({ queryKey: queryKeys.trips.detail(searchId) });
          }
        } catch {
          setTripData(previous);
        }
      });
    },
    [searchId, tripData, setTripData, syncSearchHistorySummary, enqueueMutation, queryClient],
  );

  // ── Reorder Days ─────────────────────────────────────────────────
  const reorderDays = useCallback(
    (orderedDayNumbers: number[]) => {
      if (!tripData) return;
      const previous = tripData;

      // Optimistic update
      setTripData((prev) => {
        if (!prev) return prev;
        const dayMap = new Map(
          (prev.travel_plan ?? []).map((d) => [d.day_number, d]),
        );
        const reordered = orderedDayNumbers
          .map((n, i) => {
            const day = dayMap.get(n);
            return day ? { ...day, day_number: i + 1 } : null;
          })
          .filter(Boolean) as typeof prev.travel_plan;
        return { ...prev, travel_plan: reordered };
      });

      enqueueMutation(async () => {
        try {
          await api.post(endpoints.v2ReorderDays, {
            search_id: searchId,
            ordered_day_numbers: orderedDayNumbers,
          });
        } catch {
          setTripData(previous);
        }
      });
    },
    [searchId, tripData, setTripData, enqueueMutation],
  );

  // ── Autofill Day ─────────────────────────────────────────────────
  const autofillDay = useCallback(
    async (dayNumber: number) => {
      try {
        const res = await api.post<{ success: boolean; activities?: TravelActivity[] }>(
          endpoints.v2AutofillDay,
          { search_id: searchId, day_number: dayNumber },
        );
        if (res.activities) {
          // Update local state with server-returned activities
          setTripData((prev) => {
            if (!prev) return prev;
            const newRefs: SimplifiedActivity[] = res.activities!.map((a) => ({
              id: a.activity_id ?? a.id,
              name: a.name,
              activity_id: a.activity_id,
              category: a.category,
              time_of_visit: a.time_of_visit,
            }));
            return {
              ...prev,
              activities: [...(prev.activities ?? []), ...res.activities!],
              travel_plan: (prev.travel_plan ?? []).map((day) => {
                if (day.day_number !== dayNumber) return day;
                return { ...day, activities: [...day.activities, ...newRefs] };
              }),
            };
          });
        }
      } catch {
        // Autofill failure is non-critical — just log
        console.warn('Autofill failed for day', dayNumber);
      }
    },
    [searchId, setTripData],
  );

  // ── Surprise Me — replace a day's activities with AI suggestions ──
  // V1 endpoint. Costs 1 credit. We refetch the trip on success rather than
  // doing optimistic apply, because the backend returns a fresh state.
  const surpriseDay = useCallback(
    async (dayNumber: number) => {
      if (!tripData) return;
      const res = await api.post<{ state?: TravelData; activities?: TravelActivity[] }>(
        endpoints.tripSurprise(searchId, dayNumber),
        {},
      );
      if (res?.state) {
        setTripData(res.state);
      } else if (res?.activities) {
        setTripData((prev) => {
          if (!prev) return prev;
          const newRefs: SimplifiedActivity[] = res.activities!.map((a) => ({
            id: a.activity_id ?? a.id,
            name: a.name,
            activity_id: a.activity_id,
            category: a.category,
            time_of_visit: a.time_of_visit,
          }));
          return {
            ...prev,
            activities: [...(prev.activities ?? []), ...res.activities!],
            travel_plan: (prev.travel_plan ?? []).map((day) =>
              day.day_number === dayNumber ? { ...day, activities: newRefs } : day,
            ),
          };
        });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.trips.detail(searchId) });
    },
    [searchId, tripData, setTripData, queryClient],
  );

  // ── Reorganize — reorder activities across all days ────────────────
  // V1 endpoint. Costs 1 credit. Returns a fresh plan; we apply order by id.
  const reorganize = useCallback(
    async () => {
      if (!tripData) return;
      const res = await api.post<ReorganizeResult>(endpoints.tripReorganize(searchId), {});
      if (!res?.reorganized_plan) return;
      setTripData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          travel_plan: res.reorganized_plan.map((plan, i) => {
            const existing = (prev.travel_plan ?? []).find(
              (d) => d.day_number === plan.day_number,
            );
            const activityMap = new Map(
              (prev.travel_plan ?? [])
                .flatMap((d) => d.activities)
                .map((a) => [a.id, a]),
            );
            const ordered = plan.activity_ids
              .map((id) => activityMap.get(id))
              .filter(Boolean) as SimplifiedActivity[];
            return {
              ...(existing ?? { activities: [] }),
              day_number: plan.day_number,
              activities: ordered,
              notes: plan.reasoning || existing?.notes,
            };
          }),
        };
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.trips.detail(searchId) });
    },
    [searchId, tripData, setTripData, queryClient],
  );

  // ── Reorganize Day — reorder within a single day ────────────────────
  const reorganizeDay = useCallback(
    async (dayNumber: number) => {
      if (!tripData) return;
      const res = await api.post<ReorganizeDayResult>(
        endpoints.tripReorganizeDay(searchId),
        { day_number: dayNumber },
      );
      if (!res?.reordered_activity_ids) return;
      setTripData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          travel_plan: (prev.travel_plan ?? []).map((day) => {
            if (day.day_number !== dayNumber) return day;
            const map = new Map(day.activities.map((a) => [a.id, a]));
            const ordered = res.reordered_activity_ids
              .map((id) => map.get(id))
              .filter(Boolean) as SimplifiedActivity[];
            // Keep any activities the server didn't mention (defensive).
            day.activities.forEach((a) => {
              if (!res.reordered_activity_ids.includes(a.id)) ordered.push(a);
            });
            return { ...day, activities: ordered };
          }),
        };
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.trips.detail(searchId) });
    },
    [searchId, tripData, setTripData, queryClient],
  );

  return {
    // V2 delta mutations
    deleteActivity,
    moveActivity,
    reorderActivities,
    addActivity,
    attachActivityToDay,
    restoreActivity,
    addDay,
    deleteDay,
    reorderDays,
    autofillDay,
    // V1 trip-level AI actions (1 credit each)
    surpriseDay,
    reorganize,
    reorganizeDay,
    enqueueMutation,
  };
}
