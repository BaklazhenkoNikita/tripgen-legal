/**
 * AUTO-GENERATED — do not edit by hand.
 * Source: trip_gen_mobile/mobile/src/types/search.ts
 * Run `npm run sync:types` to refresh. CI fails on drift (`--check`).
 */

/**
 * Smart search types — categories, typed results, suggestions.
 *
 * Mirrors backend responses from:
 *   GET /api/search
 *   GET /api/search/suggest
 */

export const PRIMARY_CATEGORIES = [
  'culture', 'landmarks', 'nature', 'adventure', 'food',
  'nightlife', 'music', 'shopping', 'wellness',
] as const;

export type PrimaryCategory = typeof PRIMARY_CATEGORIES[number];

export const CATEGORY_LABELS: Record<PrimaryCategory, string> = {
  culture: 'Culture & Art',
  landmarks: 'Landmarks',
  nature: 'Nature & Outdoors',
  adventure: 'Adventure & Sports',
  food: 'Food & Drink',
  nightlife: 'Nightlife & Bars',
  music: 'Music & Shows',
  shopping: 'Shopping & Markets',
  wellness: 'Wellness & Spa',
};

export const CATEGORY_ICONS: Record<PrimaryCategory, string> = {
  culture: 'color-palette-outline',
  landmarks: 'compass-outline',
  nature: 'leaf-outline',
  adventure: 'walk-outline',
  food: 'restaurant-outline',
  nightlife: 'moon-outline',
  music: 'musical-notes-outline',
  shopping: 'bag-outline',
  wellness: 'fitness-outline',
};

export interface SearchResultItem {
  item: {
    _id: string;
    name?: string;
    title?: string;
    city?: string;
    country?: string;
    description?: string;
    address?: string;
    primary_categories?: string[];
    secondary_tags?: string[];
    vibe_tags?: string[];
    images?: { url: string }[];
    duration?: string;
    cost?: string;
    working_hours?: string;
    tips?: string;
    coordinates?: { lat: number; lng: number };
    rating?: number;
    venue?: { name: string; address?: string };
    event_datetime?: string;
    source_url?: string;
    cuisine_type?: string[];
    price_range?: string;
    website_url?: string;
    // Viator-specific fields
    price_from?: number;
    currency?: string;
    review_count?: number;
    booking_url?: string;
    viator_product_code?: string;
    short_description?: string;
    tags?: string[];
    category?: string;
  };
  entity_type: 'exploration' | 'activity' | 'live_event' | 'restaurant' | 'viator';
  relevance: number;
}

export interface SearchResponse {
  results: SearchResultItem[];
  query: string;
  total: number;
  matched_category?: string | null;
}

export interface CategorySuggestion {
  name: PrimaryCategory;
  label: string;
  count: number;
}

export interface ItemSuggestion {
  _id: string;
  name: string;
  entity_type: 'exploration' | 'activity' | 'viator';
  primary_categories?: string[];
  images?: Array<{ url: string }>;
  price_from?: number;
  currency?: string;
}

export interface SearchSuggestResponse {
  categories: CategorySuggestion[];
  items: ItemSuggestion[];
  query: string;
}

export interface SearchParams {
  q: string;
  city?: string;
  category?: string;
  include_events?: boolean;
  include_restaurants?: boolean;
  include_viator?: boolean;
  limit?: number;
}
