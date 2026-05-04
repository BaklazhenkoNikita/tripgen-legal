'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/keys';

export interface SearchHistoryItem {
  search_id: string;
  destination?: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  status?: string;
  result_summary?: {
    destination_display?: string;
    date_range?: string;
    total_days?: number;
    total_activities?: number;
    total_restaurants?: number;
    budget_range?: string;
    thumbnail_image_url?: string;
  };
  parameters?: {
    destination?: string;
    query?: string;
    start_date?: string;
    end_date?: string;
    budget?: string;
    number_of_days?: number;
    plan_mode?: string;
  };
  user_title?: string;
  is_favorite?: boolean;
  tags?: string[];
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
