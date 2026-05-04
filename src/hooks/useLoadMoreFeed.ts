'use client';

import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { cardId } from '@/components/home/FeedCard';
import { toViatorFeedItem } from './useViatorFeed';
import type { FeedItem } from './useHomeFeed';

export type LoadMoreSource = {
  contentType: 'exploration' | 'activity' | 'viator';
  category?: string;
  /** Server offset assumed to be already covered by the initial render (e.g.
   *  `useHomeFeed` returns the first 12 of `exploration` and `activity`).
   *  Defaults to `pageSize`. Pass `0` to start fetching from the top — useful
   *  for sources that aren't preloaded or for a category change where the
   *  initial render had no category-scoped items. */
  initialOffset?: number;
};

export interface UseLoadMoreFeedArgs {
  city: string;
  sources: LoadMoreSource[];
  aiAugmentable: boolean;
  /** Page size for each load-more click AND the assumed offset of the
   *  initial load for every source (home feed + CategorySection both
   *  start with `limit=12`). */
  pageSize?: number;
}

export interface UseLoadMoreFeedResult {
  extras: FeedItem[];
  hasMoreInDB: boolean;
  canGenerate: boolean;
  isPending: boolean;
  loadMore: () => Promise<void>;
  reset: () => void;
}

interface SourceResponse {
  items: FeedItem[];
  total: number | null;
}

async function fetchPage(
  city: string,
  source: LoadMoreSource,
  offset: number,
  limit: number,
): Promise<SourceResponse> {
  if (source.contentType === 'viator') {
    // Viator endpoint uses `skip` instead of `offset` and returns flat rows
    // that need wrapping into the FeedItem envelope.
    const q = new URLSearchParams();
    if (source.category) q.set('category', source.category);
    q.set('limit', String(limit));
    q.set('skip', String(offset));
    const url = `${endpoints.viatorFeed(city)}?${q.toString()}`;
    const res = await api.get<{ viator_activities?: unknown[]; total?: number }>(url);
    return {
      items: (res.viator_activities ?? []).map(toViatorFeedItem),
      total: typeof res.total === 'number' ? res.total : null,
    };
  }

  const q = new URLSearchParams();
  if (source.category) q.set('category', source.category);
  q.set('limit', String(limit));
  q.set('offset', String(offset));
  if (source.contentType === 'exploration') {
    const url = `${endpoints.exploreFeed(city)}?${q.toString()}`;
    const res = await api.get<{ exploration?: FeedItem[]; total?: number }>(url);
    return {
      items: res.exploration ?? [],
      total: typeof res.total === 'number' ? res.total : null,
    };
  }
  const url = `${endpoints.activitiesFeed(city)}?${q.toString()}`;
  const res = await api.get<{ activities?: FeedItem[]; total?: number }>(url);
  return {
    items: res.activities ?? [],
    total: typeof res.total === 'number' ? res.total : null,
  };
}

function startOffset(source: LoadMoreSource, pageSize: number): number {
  return source.initialOffset ?? pageSize;
}

export function useLoadMoreFeed(args: UseLoadMoreFeedArgs): UseLoadMoreFeedResult {
  // `aiAugmentable` is accepted for API stability with callers but no longer
  // gates an AI-generation path (removed in the marketing-merge cleanup).
  const { city, sources, pageSize = 12 } = args;
  const [extras, setExtras] = useState<FeedItem[]>([]);
  const [hasMoreInDB, setHasMoreInDB] = useState(true);
  const [isPending, setIsPending] = useState(false);

  // Track how many *additional* items we've fetched per source on top of the
  // initial pageSize that the row was loaded with. Server offset = pageSize + offsetsRef[i].
  const offsetsRef = useRef<number[]>(sources.map(() => 0));
  const totalsRef = useRef<Array<number | null>>(sources.map(() => null));
  const seenIdsRef = useRef<Set<string>>(new Set());

  const reset = useCallback(() => {
    offsetsRef.current = sources.map(() => 0);
    totalsRef.current = sources.map(() => null);
    seenIdsRef.current = new Set();
    setExtras([]);
    setHasMoreInDB(true);
  }, [sources]);

  const dedupeAndAppend = useCallback((incoming: FeedItem[]): FeedItem[] => {
    const fresh: FeedItem[] = [];
    for (const it of incoming) {
      if (!it || !it.item) continue;
      const id = cardId(it);
      if (seenIdsRef.current.has(id)) continue;
      seenIdsRef.current.add(id);
      fresh.push(it);
    }
    return fresh;
  }, []);

  const fetchFromDB = useCallback(async (): Promise<number> => {
    const responses = await Promise.all(
      sources.map(async (src, i) => {
        const offset = startOffset(src, pageSize) + offsetsRef.current[i];
        const total = totalsRef.current[i];
        if (total !== null && offset >= total) {
          return { items: [], total };
        }
        return fetchPage(city, src, offset, pageSize);
      }),
    );

    const merged: FeedItem[] = [];
    responses.forEach((res, i) => {
      // When the endpoint returns no `total`, infer exhaustion from a short
      // page: if we asked for `pageSize` and got fewer, there's no next page.
      if (res.total === null && res.items.length < pageSize) {
        const consumed = startOffset(sources[i], pageSize) + offsetsRef.current[i] + res.items.length;
        totalsRef.current[i] = consumed;
      } else {
        totalsRef.current[i] = res.total;
      }
      offsetsRef.current[i] += res.items.length;
      merged.push(...res.items);
    });

    merged.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    const fresh = dedupeAndAppend(merged);
    if (fresh.length > 0) {
      setExtras((prev) => [...prev, ...fresh]);
    }

    const dbExhausted = sources.every((src, i) => {
      const total = totalsRef.current[i];
      return total !== null && startOffset(src, pageSize) + offsetsRef.current[i] >= total;
    });
    if (dbExhausted || fresh.length === 0) {
      setHasMoreInDB(false);
    }
    return fresh.length;
  }, [city, sources, pageSize, dedupeAndAppend]);

  const loadMore = useCallback(async () => {
    if (isPending || !city || sources.length === 0) return;
    if (!hasMoreInDB) return;
    setIsPending(true);
    try {
      await fetchFromDB();
    } catch (err) {
      toast.error(
        err instanceof Error ? `Couldn't load more: ${err.message}` : "Couldn't load more.",
      );
    } finally {
      setIsPending(false);
    }
  }, [isPending, city, sources, hasMoreInDB, fetchFromDB]);

  return {
    extras,
    hasMoreInDB,
    // AI-augmented "Generate more" path was trip-planner-only and removed in
    // the marketing-merge cleanup; callers always render the DB-pagination UI.
    canGenerate: false,
    isPending,
    loadMore,
    reset,
  };
}
