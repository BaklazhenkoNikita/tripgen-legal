/**
 * AUTO-GENERATED — do not edit by hand.
 * Source: trip_gen_mobile/mobile/src/types/discovery.ts
 * Run `npm run sync:types` to refresh. CI fails on drift (`--check`).
 */

/**
 * Types for the discovery / swipe-to-discover feature.
 */

export type DiscoveryCategory =
  | 'adventure'
  | 'culture'
  | 'food'
  | 'nightlife'
  | 'nature'
  | 'relaxation'
  | 'shopping'
  | 'landmarks'
  | 'art'
  | 'beach';

export interface DiscoveryCard {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  category: DiscoveryCategory;
  tags: string[];
  destination: string;
  latitude?: number;
  longitude?: number;
  /** Extra fields for richer card display */
  duration?: string;
  cost?: string;
  address?: string;
  /** Formatted event date — present for live_event items */
  eventDate?: string;
  /** Viator booking URL — present for bookable experiences */
  bookingUrl?: string;
}

export type SwipeDirection = 'left' | 'right';

export interface SwipeResult {
  cardId: string;
  direction: SwipeDirection;
  category: DiscoveryCategory;
}

