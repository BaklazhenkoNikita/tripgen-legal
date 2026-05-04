/**
 * AUTO-GENERATED — do not edit by hand.
 * Source: trip_gen_mobile/mobile/src/types/shortlist.ts
 * Run `npm run sync:types` to refresh. CI fails on drift (`--check`).
 */

/**
 * Shortlist types — user's saved/bookmarked items.
 */

export type EntityType = 'activity' | 'live_event' | 'restaurant';

export interface ShortlistItem {
  _id: string;
  entity_type: EntityType;
  saved_at: string;
  // Hydrated entity fields (varies by type)
  name?: string;
  title?: string;
  description?: string;
  category?: string | string[];
  city?: string;
  images?: Array<{ url: string }>;
}

export interface ShortlistResponse {
  items: ShortlistItem[];
  count: number;
}
