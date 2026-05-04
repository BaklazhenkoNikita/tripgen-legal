'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import type { DestinationListItem } from '@/types';

export interface AutocompleteResponse {
  results: DestinationListItem[];
}

/**
 * City-name autocomplete. Backend rate-limits by `city_autocomplete`
 * (2000/day guest, 5000/day auth). Paired with `useDestinationsList`
 * for the "load all cities" screen.
 */
export function useDestinationsAutocomplete(query: string | null | undefined) {
  return useQuery({
    queryKey: ['destinationsAutocomplete', query ?? ''],
    queryFn: async (): Promise<AutocompleteResponse | null> => {
      if (!query) return null;
      const params = new URLSearchParams({ query });
      return api.get<AutocompleteResponse>(
        `${endpoints.destinationAutocomplete}?${params.toString()}`,
      );
    },
    enabled: !!query && query.length >= 2,
    staleTime: 10 * 60 * 1000,
  });
}

export function useDestinationsList() {
  return useQuery({
    queryKey: ['destinationsList'],
    queryFn: async (): Promise<{ destinations: DestinationListItem[] }> => {
      return api.get(endpoints.destinationList);
    },
    staleTime: 24 * 60 * 60 * 1000,
  });
}
