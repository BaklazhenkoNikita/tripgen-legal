'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/keys';
import type { FeedItem } from '@/hooks/useHomeFeed';

export interface ViatorFeedResponse {
  city: string;
  viator_activities: FeedItem[];
  cached?: boolean;
  total?: number;
}

interface RawViatorResponse {
  city: string;
  viator_activities?: unknown[];
  cached?: boolean;
  total?: number;
}

/** Viator bookable-tour feed for a city. */
export function useViatorFeed(city: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.feeds.viator(city ?? ''),
    queryFn: async (): Promise<ViatorFeedResponse | null> => {
      if (!city) return null;
      const raw = await api.get<RawViatorResponse>(endpoints.viatorFeed(city));
      return {
        city: raw.city,
        viator_activities: (raw.viator_activities ?? []).map(toViatorFeedItem),
        cached: raw.cached,
        total: raw.total,
      };
    },
    enabled: !!city,
    staleTime: 60 * 60 * 1000, // 1h — Viator results don't change frequently
  });
}

export interface ViatorSearchArgs {
  q: string;
  city?: string;
  dates?: string;
  limit?: number;
}

export function useViatorSearch(args: ViatorSearchArgs | null) {
  return useQuery({
    queryKey: queryKeys.feeds.viatorSearch({
      q: args?.q ?? '',
      city: args?.city,
      dates: args?.dates,
      limit: args?.limit,
    }),
    queryFn: async (): Promise<ViatorFeedResponse | null> => {
      if (!args?.q) return null;
      const params = new URLSearchParams({ q: args.q });
      if (args.city) params.set('city', args.city);
      if (args.dates) params.set('dates', args.dates);
      if (args.limit) params.set('limit', String(args.limit));
      const raw = await api.get<RawViatorResponse>(
        `${endpoints.viatorSearch}?${params.toString()}`,
      );
      return {
        city: raw.city,
        viator_activities: (raw.viator_activities ?? []).map(toViatorFeedItem),
        cached: raw.cached,
        total: raw.total,
      };
    },
    enabled: !!args?.q,
    staleTime: 10 * 60 * 1000,
  });
}

/** The Viator endpoint returns flat activity objects (no `{ item, score, entity_type }`
 *  envelope) and uses `images: string[]` rather than `Array<{ url }>` like the other
 *  v4 feeds. Wrap each row into the `FeedItem` shape so it flows through `FeedRow`
 *  and `FeedCard` unchanged. */
export function toViatorFeedItem(raw: unknown): FeedItem {
  const flat = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const images = normalizeImages(flat.images);
  const priceRange =
    typeof flat.price_range === 'string' && flat.price_range.length > 0
      ? flat.price_range
      : formatPriceFrom(flat.price_from, flat.currency);
  return {
    entity_type: 'viator',
    score: typeof flat.score === 'number' ? flat.score : 0,
    item: {
      ...flat,
      images,
      ...(priceRange ? { price_range: priceRange } : {}),
    },
  };
}

function normalizeImages(input: unknown): Array<{ url: string }> {
  if (!Array.isArray(input)) return [];
  const out: Array<{ url: string }> = [];
  for (const entry of input) {
    if (typeof entry === 'string' && entry.length > 0) {
      out.push({ url: entry });
    } else if (entry && typeof entry === 'object') {
      const url = (entry as { url?: unknown }).url;
      if (typeof url === 'string' && url.length > 0) out.push({ url });
    }
  }
  return out;
}

function formatPriceFrom(from: unknown, currency: unknown): string | undefined {
  if (typeof from !== 'number' || !Number.isFinite(from)) return undefined;
  const cur = typeof currency === 'string' ? currency.toUpperCase() : '';
  return cur ? `from ${cur} ${from}` : `from ${from}`;
}
