'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/keys';
import type { WeatherReport } from '@/types';

export function useWeather(location: string | null) {
  return useQuery({
    queryKey: queryKeys.weather.byLocation(location ?? ''),
    queryFn: async (): Promise<WeatherReport | null> => {
      if (!location) return null;
      return api.get<WeatherReport>(
        `${endpoints.weather}?location=${encodeURIComponent(location)}`,
      );
    },
    enabled: !!location,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
