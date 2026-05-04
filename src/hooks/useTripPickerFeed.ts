'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useHomeFeed, type FeedItem } from './useHomeFeed';
import { useLoadMoreFeed, type LoadMoreSource } from './useLoadMoreFeed';
import { cardId } from '@/components/home/FeedCard';

interface Args {
  city: string | null | undefined;
  activeCategory: string | null;
  excludeIds?: ReadonlySet<string>;
}

interface Result {
  items: FeedItem[];
  isLoading: boolean;
  hasMore: boolean;
  isPending: boolean;
  loadMore: () => void;
}

/** Activity-shaped subset of the v4 feed for the trip activity picker. Drops
 *  live_event and restaurant items (not addable to itinerary), dedupes by
 *  cardId, and filters out activities already in the trip pool. */
export function useTripPickerFeed({
  city,
  activeCategory,
  excludeIds,
}: Args): Result {
  const { data: feed, isLoading } = useHomeFeed(city ?? null);

  // Sources cover all three addable kinds. When a category is active we start
  // from offset 0 (the home feed didn't preload category-scoped pages); when
  // the mixed view is showing we start at offset=12 to skip the home feed's
  // already-rendered first page of exploration + activity. Viator is never
  // preloaded by the home feed so it always starts at 0.
  const sources = useMemo<LoadMoreSource[]>(() => {
    const cat = activeCategory ?? undefined;
    return [
      { contentType: 'exploration', category: cat, initialOffset: cat ? 0 : 12 },
      { contentType: 'activity', category: cat, initialOffset: cat ? 0 : 12 },
      { contentType: 'viator', category: cat, initialOffset: 0 },
    ];
  }, [activeCategory]);

  const loadMoreFeed = useLoadMoreFeed({
    city: city ?? '',
    sources,
    aiAugmentable: false,
  });

  // Reset pagination when city or chip changes.
  const resetKey = `${city ?? ''}::${activeCategory ?? ''}`;
  const lastResetKey = useRef(resetKey);
  useEffect(() => {
    if (lastResetKey.current !== resetKey) {
      lastResetKey.current = resetKey;
      loadMoreFeed.reset();
    }
  }, [resetKey, loadMoreFeed]);

  const items = useMemo<FeedItem[]>(() => {
    const base: FeedItem[] = [];
    // Only fold in the home-feed mix when no category is selected. The home
    // feed is unfiltered, so its items would pollute a category view (and
    // create the original "shows 2 cards for nightlife" bug).
    if (feed && !activeCategory) {
      base.push(
        ...(feed.exploration ?? []),
        ...(feed.activities ?? []),
      );
    }
    const merged = [...base, ...loadMoreFeed.extras];
    return finalize(merged, activeCategory, excludeIds);
  }, [feed, loadMoreFeed.extras, activeCategory, excludeIds]);

  return {
    items,
    isLoading,
    hasMore: loadMoreFeed.hasMoreInDB,
    isPending: loadMoreFeed.isPending,
    loadMore: () => {
      void loadMoreFeed.loadMore();
    },
  };
}

function finalize(
  items: FeedItem[],
  activeCategory: string | null,
  excludeIds: ReadonlySet<string> | undefined,
): FeedItem[] {
  const seen = new Set<string>();
  const out: FeedItem[] = [];
  const pred = matchCategory(activeCategory);
  for (const it of items) {
    if (!it || !it.item) continue;
    if (it.entity_type === 'live_event' || it.entity_type === 'restaurant') continue;
    const id = cardId(it);
    if (seen.has(id)) continue;
    if (excludeIds && excludeIds.has(id)) continue;
    if (!pred(it)) continue;
    seen.add(id);
    out.push(it);
  }
  out.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  return out;
}

function matchCategory(category: string | null) {
  if (!category) return () => true;
  const target = category.toLowerCase();
  return (item: FeedItem): boolean => {
    const inner = item.item ?? {};
    const fields: Array<string | string[] | undefined> = [
      inner.primary_categories as string[] | undefined,
      inner.category as string | undefined,
      (inner as Record<string, unknown>).cuisine_type as string[] | undefined,
    ];
    for (const f of fields) {
      if (!f) continue;
      if (typeof f === 'string') {
        if (f.toLowerCase() === target) return true;
      } else if (Array.isArray(f)) {
        if (f.some((v) => typeof v === 'string' && v.toLowerCase() === target)) return true;
      }
    }
    return false;
  };
}
