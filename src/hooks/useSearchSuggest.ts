'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/keys';
import type { SearchSuggestResponse } from '@/types';

/** Debounced autocomplete for the nav search bar. Fires GET /api/search/suggest
 *  300ms after the user stops typing; cached per query + city. */
export function useSearchSuggest(query: string, city: string | null | undefined) {
  const trimmed = query.trim();
  const debounced = useDebounced(trimmed, 300);

  return useQuery({
    queryKey: queryKeys.search.suggest(debounced, city ?? undefined),
    queryFn: async (): Promise<SearchSuggestResponse | null> => {
      if (!debounced) return null;
      const q = new URLSearchParams({ q: debounced });
      if (city) q.set('city', city);
      return api.get<SearchSuggestResponse>(
        `${endpoints.searchSuggest}?${q.toString()}`,
      );
    },
    enabled: debounced.length >= 2,
    staleTime: 30 * 1000,
  });
}

function useDebounced<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}
