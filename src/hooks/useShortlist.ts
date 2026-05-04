'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/keys';
import type { EntityType, ShortlistResponse } from '@/types';

/** User's saved items (activities, events, restaurants). */
export function useShortlist() {
  return useQuery({
    queryKey: queryKeys.shortlist.all,
    queryFn: async (): Promise<ShortlistResponse> => {
      const res = await api.get<ShortlistResponse>(endpoints.shortlist);
      return res ?? { items: [], count: 0 };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export interface ShortlistAddArgs {
  entity_id: string;
  entity_type: EntityType;
  city?: string;
}

export function useShortlistAdd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: ShortlistAddArgs) => {
      return api.post<{ saved: boolean }>(endpoints.shortlist, args);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.shortlist.all });
    },
  });
}

export function useShortlistRemove() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entityId: string) => {
      return api.delete<{ removed: boolean }>(
        `${endpoints.shortlist}/${encodeURIComponent(entityId)}`,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.shortlist.all });
    },
  });
}

/** Convenience: hash for fast membership checks in FeedCard. */
export function useShortlistIds(): Set<string> {
  const { data } = useShortlist();
  return new Set((data?.items ?? []).map((i) => i._id));
}
