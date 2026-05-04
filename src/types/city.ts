/**
 * AUTO-GENERATED — do not edit by hand.
 * Source: trip_gen_mobile/mobile/src/types/city.ts
 * Run `npm run sync:types` to refresh. CI fails on drift (`--check`).
 */

/**
 * City discovery types — destination list.
 *
 * Mirrors backend responses from:
 *   GET  /api/destinations/list
 */

export interface DestinationListItem {
  name: string;
  city: string;
  country: string;
  description?: string;
  destination_type?: string;
  images?: Array<{ url: string; source?: string; width?: number; height?: number }>;
  normalized_destination?: string;
  source?: 'db' | 'cities';
  populationTier?: number;
}

export interface DestinationListResponse {
  destinations: DestinationListItem[];
  total: number;
}
