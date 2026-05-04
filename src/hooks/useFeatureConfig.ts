'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';

/**
 * Server feature flags + kill switches. Surface the `disable_*` flags and
 * `maintenance_message` in the UI so operators can flip backend env vars
 * and users see the corresponding state without a deploy:
 *
 *   disable_trip_generation → greys out the Generate button + shows banner
 *   disable_chat            → greys out chat compose + shows banner
 *   disable_all_ai          → nukes both + maintenance banner everywhere
 *   maintenance_message     → banner copy
 */
export interface FeatureConfig {
  features?: Record<string, boolean>;
  disable_trip_generation?: boolean;
  disable_chat?: boolean;
  disable_all_ai?: boolean;
  maintenance_message?: string | null;
  min_mobile_version?: string;
  min_web_version?: string;
  [key: string]: unknown;
}

export function useFeatureConfig() {
  return useQuery({
    queryKey: ['featureConfig'],
    queryFn: async (): Promise<FeatureConfig> => {
      return api.get<FeatureConfig>(endpoints.featureConfig);
    },
    // Poll every 5 min so a backend flip propagates without a full refresh.
    refetchInterval: 5 * 60 * 1000,
    refetchIntervalInBackground: false,
    staleTime: 60 * 1000,
  });
}

/** Convenience: is trip generation currently allowed? */
export function useTripGenEnabled(): boolean {
  const { data } = useFeatureConfig();
  return !(data?.disable_trip_generation ?? data?.disable_all_ai ?? false);
}

/** Convenience: is chat currently allowed? */
export function useChatEnabled(): boolean {
  const { data } = useFeatureConfig();
  return !(data?.disable_chat ?? data?.disable_all_ai ?? false);
}
