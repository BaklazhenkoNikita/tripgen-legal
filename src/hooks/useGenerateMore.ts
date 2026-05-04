'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/keys';
import type { FeedItem } from '@/hooks/useHomeFeed';

/**
 * "Load more" for a city's feed. Backend runs an AI orchestrator to surface
 * fresh content in a given category/content type. Rate-limited — guest has
 * a small daily cap (see backend `rate_limit_generate_more_activities`).
 */
export interface GenerateMoreResponse {
  city: string;
  content_type: string;
  category?: string;
  items: FeedItem[];
  generated: number;
}

export interface GenerateMoreArgs {
  city: string;
  contentType: 'activity' | 'restaurant' | 'event' | 'exploration';
  category?: string;
}

export function useGenerateMore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: GenerateMoreArgs): Promise<GenerateMoreResponse> => {
      const params = new URLSearchParams();
      params.set('content_type', args.contentType);
      if (args.category) params.set('category', args.category);
      return api.post<GenerateMoreResponse>(
        `${endpoints.generateMore(args.city)}?${params.toString()}`,
        {},
      );
    },
    onSuccess: (_res, args) => {
      // Invalidate feeds so users see the new items next refetch.
      qc.invalidateQueries({ queryKey: queryKeys.feeds.home(args.city) });
      qc.invalidateQueries({ queryKey: ['feeds', 'explore', args.city] });
      qc.invalidateQueries({ queryKey: ['feeds', 'activities', args.city] });
      qc.invalidateQueries({ queryKey: queryKeys.feeds.categoryCounts(args.city) });
    },
  });
}
