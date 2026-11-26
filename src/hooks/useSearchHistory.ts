'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/keys';

/**
 * One row of `GET /api/search-history/summary`. The backend returns a FLAT
 * projection (tripgen_backend/endpoints/search_history.py
 * `list_search_history_summary`) — there is no nested `result_summary` /
 * `parameters` object on this endpoint.
 */
export interface SearchHistoryItem {
  search_id: string;
  user_id?: string;
  /** Raw user-entered destination, e.g. "taipei, Taiwan". Run through `displayDestination`. */
  destination?: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
  is_favorite?: boolean;
  user_title?: string | null;
  tags?: string[];
  activity_count?: number;
  thumbnail_image_url?: string | null;
  activity_ids?: string[];
  plan_mode?: string;
  collaborator_count?: number;
}

interface SearchHistorySummaryResponse {
  searches: SearchHistoryItem[];
  total: number;
}

export function useSearchHistory(options?: { limit?: number; skip?: number }) {
  const limit = options?.limit ?? 20;
  const skip = options?.skip ?? 0;

  return useQuery({
    queryKey: queryKeys.trips.history({ limit, skip }),
    queryFn: async (): Promise<SearchHistoryItem[]> => {
      const res = await api.get<SearchHistorySummaryResponse>(
        `${endpoints.searchHistorySummary}?limit=${limit}&skip=${skip}`,
      );
      return res.searches ?? [];
    },
    staleTime: 60 * 1000, // 1 minute
  });
}
