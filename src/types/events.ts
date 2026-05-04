/**
 * AUTO-GENERATED — do not edit by hand.
 * Source: trip_gen_mobile/mobile/src/types/events.ts
 * Run `npm run sync:types` to refresh. CI fails on drift (`--check`).
 */

/**
 * Live event types — time-bound events from external sources.
 */

export type EventCategory =
  | 'music'
  | 'art'
  | 'food'
  | 'sports'
  | 'theater'
  | 'festival'
  | 'market'
  | 'workshop'
  | 'nightlife'
  | 'community'
  | 'other';

export interface EventVenue {
  name: string;
  address: string;
  coordinates?: { lat: number; lng: number };
}

export interface EventPrice {
  is_free: boolean;
  min_price?: number;
  max_price?: number;
  currency: string;
}

export interface LiveEvent {
  _id: string;
  city: string;
  title: string;
  description: string;
  category: EventCategory;
  subcategory?: string;
  event_datetime: string;
  event_end_datetime?: string;
  additional_datetimes?: string[];
  venue: EventVenue;
  price: EventPrice;
  source: string;
  source_url: string;
  images?: Array<{
    url: string;
    width?: number;
    height?: number;
    source?: string;
  }>;
  tags: string[];
  popularity_score: number;
}

export interface EventSearchParams {
  city: string;
  date_from?: string;
  date_to?: string;
  categories?: string;
  is_free?: boolean;
  max_price?: number;
  sort?: 'relevance' | 'date' | 'popularity' | 'distance';
  lat?: number;
  lng?: number;
  radius_km?: number;
  page?: number;
  limit?: number;
}

export interface EventSearchResponse {
  events: LiveEvent[];
  total: number;
  page: number;
  limit: number;
}
