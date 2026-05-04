'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createSSEStream } from '@/lib/api/sseClient';
import { apiFetch } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { getSessionId } from '@/lib/api/telemetry';
import type { TravelData, TravelActivity, SSEEvent, DayPlan } from '@/types';

/**
 * Trip generation phases, in the order they typically appear.
 * `awaiting_clarification`, `recovering`, and `saving_fallback` are
 * off-happy-path states that block on user input or network recovery.
 */
export type GenerationPhase =
  | 'idle'
  | 'connecting'
  | 'routing'
  | 'activities_preliminary'
  | 'activities_progress'
  | 'activities_complete'
  | 'coordinates_update'
  | 'destination_info'
  | 'restaurants_complete'
  | 'awaiting_clarification'
  | 'recovering'
  | 'saving_fallback'
  | 'complete'
  | 'error';

export interface GenerateParams {
  destination: string;
  startDate?: string;
  endDate?: string;
  budget?: string;
  preferredActivityTypes?: string[];
  numberOfDays?: number;
  additionalInfo?: string;
  vibeTags?: string[];
  energyLevel?: string;
  who?: string;
  planMode?: string;
  surpriseMe?: boolean;
  query?: string;
  state?: Record<string, unknown> | null;
}

interface TripGenerationState {
  travelData: TravelData | null;
  phase: GenerationPhase;
  error: string | null;
  isLoading: boolean;
  searchId: string | null;
  currentDay: number | null;
  totalDays: number | null;
  /** trace id from generation_meta — used to recover after stream-break */
  generationId: string | null;
  /** Pending clarification question. When set, UI opens the ClarificationDialog. */
  clarificationQuestion: string | null;
  /** Backend's preview of planned modifications (MODIFY route). */
  modificationPlan: unknown | null;
}

const initialState: TripGenerationState = {
  travelData: null,
  phase: 'idle',
  error: null,
  isLoading: false,
  searchId: null,
  currentDay: null,
  totalDays: null,
  generationId: null,
  clarificationQuestion: null,
  modificationPlan: null,
};

// Recovery tuning — mirror mobile's values (3s interval, 30s ceiling).
// Mobile implementation: trip_gen_mobile/mobile/src/hooks/useTripGeneration.ts
// keeps the stream-break recovery window tight so the UI fails over to an
// error state promptly if the backend never persists.
const RECOVERY_POLL_INTERVAL_MS = 3_000;
const RECOVERY_MAX_DURATION_MS = 30_000;

function getEntityDedupKey(a: TravelActivity): string {
  return a.activity_id || a.id;
}

function mergeActivities(
  existing: TravelActivity[],
  incoming: TravelActivity[],
): TravelActivity[] {
  const map = new Map(existing.map((a) => [getEntityDedupKey(a), a]));
  for (const a of incoming) {
    const key = getEntityDedupKey(a);
    map.set(key, { ...map.get(key), ...a });
  }
  return Array.from(map.values());
}

function mergeDayPlans(existing: DayPlan[], incoming: DayPlan[]): DayPlan[] {
  const map = new Map(existing.map((d) => [d.day_number ?? 0, d]));
  for (const d of incoming) {
    const key = d.day_number ?? 0;
    const prev = map.get(key);
    if (prev) {
      map.set(key, { ...prev, ...d, activities: d.activities ?? prev.activities });
    } else {
      map.set(key, d);
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => (a.day_number ?? 0) - (b.day_number ?? 0),
  );
}

export function useTripGeneration() {
  const [state, setState] = useState<TripGenerationState>(initialState);
  const abortRef = useRef<AbortController | null>(null);
  /** True once `final_response` arrived (so the onComplete callback doesn't
   *  trigger recovery when the stream cleanly ends). */
  const completedRef = useRef(false);
  const recoveryTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recoveryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { getToken } = useAuth();

  const clearRecovery = useCallback(() => {
    if (recoveryTimerRef.current) {
      clearInterval(recoveryTimerRef.current);
      recoveryTimerRef.current = null;
    }
    if (recoveryTimeoutRef.current) {
      clearTimeout(recoveryTimeoutRef.current);
      recoveryTimeoutRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      abortRef.current = null;
      clearRecovery();
    };
  }, [clearRecovery]);

  /** Poll by-trace to recover a trip that finished server-side after the SSE stream broke. */
  const startRecoveryPolling = useCallback(
    (generationId: string) => {
      clearRecovery();
      setState((prev) => ({ ...prev, phase: 'recovering', isLoading: true }));

      const startedAt = Date.now();

      const attempt = async () => {
        try {
          const result = await apiFetch<{
            search_id?: string;
            state?: TravelData;
          } | null>(endpoints.searchHistoryByTrace(generationId));
          if (result && result.search_id) {
            clearRecovery();
            setState((prev) => ({
              ...prev,
              phase: 'complete',
              isLoading: false,
              searchId: result.search_id ?? prev.searchId,
              travelData: result.state ?? prev.travelData,
            }));
            return;
          }
        } catch {
          // 404 until the backend persists — keep polling.
        }

        if (Date.now() - startedAt >= RECOVERY_MAX_DURATION_MS) {
          clearRecovery();
          setState((prev) => ({
            ...prev,
            phase: 'error',
            isLoading: false,
            error: "We couldn't confirm your trip saved. Please try generating again.",
          }));
        }
      };

      recoveryTimerRef.current = setInterval(attempt, RECOVERY_POLL_INTERVAL_MS);
      recoveryTimeoutRef.current = setTimeout(() => {
        clearRecovery();
        setState((prev) =>
          prev.phase === 'recovering'
            ? {
                ...prev,
                phase: 'error',
                isLoading: false,
                error: "We couldn't confirm your trip saved. Please try generating again.",
              }
            : prev,
        );
      }, RECOVERY_MAX_DURATION_MS);

      // Fire once immediately so the user doesn't wait a full interval.
      attempt();
    },
    [clearRecovery],
  );

  /** Fallback save — called when `final_response` arrived without a search_id. */
  const fallbackSave = useCallback(async (data: TravelData) => {
    setState((prev) => ({ ...prev, phase: 'saving_fallback', isLoading: true }));
    try {
      const saved = await apiFetch<{ search_id?: string }>(endpoints.saveTrip, {
        method: 'POST',
        body: { state: data },
      });
      if (saved?.search_id) {
        setState((prev) => ({
          ...prev,
          phase: 'complete',
          isLoading: false,
          searchId: saved.search_id ?? prev.searchId,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          phase: 'complete',
          isLoading: false,
          // No search id — trip visible in memory only.
        }));
      }
    } catch (err) {
      setState((prev) => ({
        ...prev,
        phase: 'error',
        isLoading: false,
        error:
          err instanceof Error
            ? `Couldn't save your trip: ${err.message}`
            : "Couldn't save your trip.",
      }));
    }
  }, []);

  const generate = useCallback(
    async (params: GenerateParams) => {
      abortRef.current?.abort();
      clearRecovery();
      completedRef.current = false;

      setState({
        ...initialState,
        isLoading: true,
        phase: 'connecting',
      });

      const token = await getToken();
      const sessionId = getSessionId();

      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      headers['X-Session-Id'] = sessionId;

      abortRef.current = createSSEStream({
        url: endpoints.travel,
        body: {
          destination: params.destination,
          start_date: params.startDate,
          end_date: params.endDate,
          budget: params.budget,
          preferred_activity_types: params.preferredActivityTypes,
          number_of_days: params.numberOfDays,
          additional_info: params.additionalInfo,
          vibe_tags: params.vibeTags ?? [],
          energy_level: params.energyLevel,
          who: params.who,
          plan_mode: params.planMode ?? null,
          surprise_me: params.surpriseMe ?? false,
          query: params.query,
          state: params.state ?? null,
          session_id: sessionId,
        },
        headers,
        onEvent: (event: SSEEvent) => {
          setState((prev) => {
            switch (event.type) {
              case 'generation_meta': {
                const data = event.data ?? {};
                return {
                  ...prev,
                  generationId: data.generation_id ?? data.trace_id ?? prev.generationId,
                };
              }

              case 'route':
                return { ...prev, phase: 'routing' };

              case 'activities_preliminary': {
                const data = event.data ?? {};
                const totalDays =
                  data.travel_plan?.length ?? data.total_trip_days ?? prev.totalDays;
                return {
                  ...prev,
                  phase: 'activities_preliminary',
                  totalDays,
                  currentDay: 1,
                  travelData: {
                    destination: data.destination ?? params.destination,
                    start_date: data.start_date ?? params.startDate,
                    end_date: data.end_date ?? params.endDate,
                    travel_plan: data.travel_plan ?? [],
                    activities: data.activities ?? [],
                    restaurants: [],
                    is_preliminary: true,
                    total_trip_days: totalDays ?? undefined,
                  },
                };
              }

              case 'activities_progress': {
                const data = event.data ?? {};
                const incomingActivities: TravelActivity[] = data.activities ?? [];
                const incomingPlan: DayPlan[] = data.travel_plan ?? [];

                return {
                  ...prev,
                  phase: 'activities_progress',
                  currentDay: data.day_number ?? prev.currentDay,
                  travelData: prev.travelData
                    ? {
                        ...prev.travelData,
                        activities: mergeActivities(
                          prev.travelData.activities ?? [],
                          incomingActivities,
                        ),
                        travel_plan: incomingPlan.length
                          ? mergeDayPlans(prev.travelData.travel_plan ?? [], incomingPlan)
                          : prev.travelData.travel_plan,
                      }
                    : prev.travelData,
                };
              }

              case 'activities_complete': {
                const data = event.data ?? {};
                return {
                  ...prev,
                  phase: 'activities_complete',
                  travelData: prev.travelData
                    ? {
                        ...prev.travelData,
                        activities: mergeActivities(
                          prev.travelData.activities ?? [],
                          data.activities ?? [],
                        ),
                        travel_plan: data.travel_plan
                          ? mergeDayPlans(prev.travelData.travel_plan ?? [], data.travel_plan)
                          : prev.travelData.travel_plan,
                        is_preliminary: false,
                      }
                    : prev.travelData,
                };
              }

              case 'coordinates_update': {
                const data = event.data ?? {};
                const coordActivities: TravelActivity[] = data.activities ?? [];
                if (!prev.travelData || !coordActivities.length) return prev;
                return {
                  ...prev,
                  phase: 'coordinates_update',
                  travelData: {
                    ...prev.travelData,
                    activities: mergeActivities(
                      prev.travelData.activities ?? [],
                      coordActivities,
                    ),
                  },
                };
              }

              case 'destination_info': {
                return {
                  ...prev,
                  phase: 'destination_info',
                  travelData: prev.travelData
                    ? { ...prev.travelData, ...event.data }
                    : prev.travelData,
                };
              }

              case 'restaurants_complete': {
                const data = event.data ?? {};
                return {
                  ...prev,
                  phase: 'restaurants_complete',
                  travelData: prev.travelData
                    ? {
                        ...prev.travelData,
                        restaurants: data.restaurants ?? prev.travelData.restaurants,
                      }
                    : prev.travelData,
                };
              }

              case 'modification_plan': {
                return {
                  ...prev,
                  modificationPlan: event.data ?? event,
                };
              }

              case 'activities_added': {
                const data = event.data ?? {};
                const added: TravelActivity[] = data.activities ?? [];
                return {
                  ...prev,
                  travelData: prev.travelData
                    ? {
                        ...prev.travelData,
                        activities: mergeActivities(
                          prev.travelData.activities ?? [],
                          added,
                        ),
                        travel_plan: data.travel_plan
                          ? mergeDayPlans(prev.travelData.travel_plan ?? [], data.travel_plan)
                          : prev.travelData.travel_plan,
                      }
                    : prev.travelData,
                };
              }

              case 'clarification_needed': {
                const question =
                  event.question ??
                  (typeof event.data === 'string' ? event.data : event.data?.question) ??
                  'The planner needs more info to continue.';
                return {
                  ...prev,
                  phase: 'awaiting_clarification',
                  isLoading: false,
                  clarificationQuestion: question,
                };
              }

              case 'final_response': {
                const data = event.data ?? {};
                const finalState = data.state ?? data;
                const searchId = data.search_id ?? prev.searchId;
                completedRef.current = true;
                return {
                  ...prev,
                  phase: 'complete',
                  isLoading: false,
                  searchId,
                  travelData: {
                    ...(prev.travelData ?? {}),
                    ...finalState,
                    is_preliminary: false,
                  } as TravelData,
                };
              }

              case 'chat_response':
                return prev;

              case 'error':
                return {
                  ...prev,
                  phase: 'error',
                  isLoading: false,
                  error:
                    typeof event.data === 'string'
                      ? event.data
                      : event.data?.message ?? 'An error occurred',
                };

              default:
                return prev;
            }
          });
        },
        onError: (err: Error) => {
          if (completedRef.current) return;
          setState((prev) => {
            // If we have a generation id but no final_response, recovery is possible.
            if (prev.generationId && !prev.searchId) {
              queueMicrotask(() => startRecoveryPolling(prev.generationId!));
              return { ...prev, phase: 'recovering', isLoading: true, error: null };
            }
            return {
              ...prev,
              phase: 'error',
              isLoading: false,
              error: err.message,
            };
          });
        },
        onComplete: () => {
          // The stream closed. Three cases:
          //   1. final_response already flipped completedRef=true → nothing to do.
          //   2. We have a generation id but no search id → start recovery polling.
          //   3. We have travelData + no search_id but also no generation id → fallback save.
          //   4. Nothing useful accumulated → mark error.
          setState((prev) => {
            if (prev.phase === 'awaiting_clarification') return prev;
            if (completedRef.current) {
              if (!prev.searchId && prev.travelData) {
                queueMicrotask(() => fallbackSave(prev.travelData!));
                return { ...prev, phase: 'saving_fallback', isLoading: true };
              }
              return { ...prev, isLoading: false, phase: 'complete' };
            }
            if (prev.generationId) {
              queueMicrotask(() => startRecoveryPolling(prev.generationId!));
              return { ...prev, phase: 'recovering', isLoading: true };
            }
            if (prev.travelData) {
              queueMicrotask(() => fallbackSave(prev.travelData!));
              return { ...prev, phase: 'saving_fallback', isLoading: true };
            }
            return {
              ...prev,
              phase: 'error',
              isLoading: false,
              error: prev.error ?? 'The trip generation stream ended unexpectedly.',
            };
          });
        },
      });
    },
    [getToken, startRecoveryPolling, fallbackSave, clearRecovery],
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    clearRecovery();
    setState((prev) => ({ ...prev, isLoading: false, phase: 'idle' }));
  }, [clearRecovery]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    clearRecovery();
    completedRef.current = false;
    setState(initialState);
  }, [clearRecovery]);

  /** Resume generation after the user answers a `clarification_needed` question.
   *  Sends the same body plus an `answer` field; the backend continues the flow. */
  const answerClarification = useCallback(
    async (answer: string, params: GenerateParams) => {
      return generate({
        ...params,
        query: answer,
        state: params.state ?? null,
      });
    },
    [generate],
  );

  return {
    ...state,
    generate,
    cancel,
    reset,
    answerClarification,
  };
}
