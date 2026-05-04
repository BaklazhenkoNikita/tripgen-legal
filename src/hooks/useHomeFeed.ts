'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/query/keys';

/** One card returned by any v4 feed endpoint. `item` is loosely typed because
 *  the shape varies by entity type — home surfaces only read common fields. */
export interface FeedItem {
  item: {
    _id?: string;
    name?: string;
    title?: string;
    city?: string;
    description?: string;
    address?: string;
    primary_categories?: string[];
    category?: string;
    images?: Array<{ url?: string | null }>;
    coordinates?: { lat?: number; lng?: number; latitude?: number; longitude?: number };
    duration?: string;
    cost?: string;
    price_range?: string;
    event_datetime?: string;
    cuisine_type?: string[];
    venue?: { name: string; address?: string };
    booking_url?: string;
    rating?: number;
    [key: string]: unknown;
  };
  score: number;
  entity_type: 'exploration' | 'activity' | 'live_event' | 'restaurant' | 'viator';
}

export interface HomeFeedResponse {
  city: string;
  exploration: FeedItem[];
  activities: FeedItem[];
  events: FeedItem[];
  restaurants: FeedItem[];
  has_content: boolean;
  generating: boolean;
  events_generating: boolean;
  events_count: number;
  food_count: number;
  raw_events_available: number;
}

/** Home tab — top explore + trending activities + upcoming events + food. */
export function useHomeFeed(city: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.feeds.home(city ?? ''),
    queryFn: async (): Promise<HomeFeedResponse | null> => {
      if (!city) return null;
      const data = await api.get<HomeFeedResponse>(endpoints.homeFeed(city));
      return {
        ...data,
        exploration: data.exploration ?? [],
        activities: data.activities ?? [],
        events: data.events ?? [],
        restaurants: data.restaurants ?? [],
        has_content: data.has_content ?? false,
        generating: data.generating ?? false,
        events_generating: data.events_generating ?? false,
        events_count: data.events_count ?? data.events?.length ?? 0,
        food_count: data.food_count ?? data.restaurants?.length ?? 0,
        raw_events_available: data.raw_events_available ?? 0,
      };
    },
    enabled: !!city,
    staleTime: 15 * 60 * 1000,
  });
}
