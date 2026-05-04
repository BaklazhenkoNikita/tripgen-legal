/**
 * Maps a `FeedItem` (from the v4 home / explore feeds) into a `TravelActivity`
 * suitable for `useTripMutations.addActivity`.
 *
 * Returns null for entity types that aren't activity-shaped (live_event,
 * restaurant). Viator items are accepted; their `viator_product_code` is used
 * as `activity_id` because the v2 add-activity endpoint keys by string id.
 */

import type { FeedItem } from '@/hooks/useHomeFeed';
import type { TravelActivity } from '@/types';
import { cardId } from '@/components/home/FeedCard';

const SUPPORTED: ReadonlySet<FeedItem['entity_type']> = new Set([
  'exploration',
  'activity',
  'viator',
]);

export function feedItemToTravelActivity(feedItem: FeedItem): TravelActivity | null {
  if (!SUPPORTED.has(feedItem.entity_type)) return null;
  const inner = feedItem.item ?? {};

  const innerId = pickString(inner._id, (inner as Record<string, unknown>).id as unknown);
  const viatorCode = pickString(
    (inner as Record<string, unknown>).viator_product_code as unknown,
  );

  const id = innerId ?? viatorCode ?? cardId(feedItem);
  const activityId = innerId ?? viatorCode;

  const name = pickString(inner.title, inner.name) ?? 'Untitled';
  const description = pickString(
    inner.description,
    (inner as Record<string, unknown>).short_description as unknown,
  );

  const categoryArr = pickCategoryArray(inner);

  return {
    id,
    activity_id: activityId,
    name,
    description,
    images: extractImages(inner),
    category: categoryArr,
    primary_categories: pickStringArray(inner.primary_categories),
    secondary_tags: pickStringArray(
      (inner as Record<string, unknown>).secondary_tags as unknown,
    ),
    vibe_tags: pickStringArray((inner as Record<string, unknown>).vibe_tags as unknown),
    address: pickString(inner.address) ?? pickString(inner.venue?.address),
    duration: pickString(inner.duration),
    cost: pickString(inner.cost, inner.price_range),
    working_hours: pickString(
      (inner as Record<string, unknown>).working_hours as unknown,
    ),
    coordinates: extractCoordinates(inner),
    latitude: pickCoord(inner.coordinates?.lat, inner.coordinates?.latitude),
    longitude: pickCoord(inner.coordinates?.lng, inner.coordinates?.longitude),
    website_url: pickString(
      (inner as Record<string, unknown>).website_url as unknown,
      (inner as Record<string, unknown>).booking_url as unknown,
    ),
    rating: typeof inner.rating === 'number' ? inner.rating : undefined,
    insider_tips: pickStringArray(
      (inner as Record<string, unknown>).insider_tips as unknown,
    ),
    interesting_facts: pickStringArray(
      (inner as Record<string, unknown>).interesting_facts as unknown,
    ),
    from_database: feedItem.entity_type !== 'viator',
  };
}

function extractImages(inner: FeedItem['item']): Array<{ url?: string | null }> {
  const arr = (inner as Record<string, unknown>).images as unknown;
  const out: Array<{ url?: string | null }> = [];
  if (Array.isArray(arr)) {
    for (const entry of arr) {
      if (typeof entry === 'string' && entry.length > 0) {
        out.push({ url: entry });
      } else if (entry && typeof entry === 'object') {
        const url = (entry as { url?: string | null }).url;
        if (typeof url === 'string' && url.length > 0) out.push({ url });
      }
    }
  }
  if (out.length === 0) {
    const single = (inner as { imageUrl?: string }).imageUrl;
    if (typeof single === 'string' && single.length > 0) out.push({ url: single });
  }
  return out;
}

function extractCoordinates(inner: FeedItem['item']): TravelActivity['coordinates'] {
  const c = inner.coordinates;
  if (!c) return undefined;
  const lat = pickCoord(c.lat, c.latitude);
  const lng = pickCoord(c.lng, c.longitude);
  if (lat == null && lng == null) return undefined;
  return { lat, lng, latitude: lat, longitude: lng };
}

function pickCoord(...values: Array<number | undefined>): number | undefined {
  for (const v of values) {
    if (typeof v === 'number' && Number.isFinite(v)) return v;
  }
  return undefined;
}

function pickCategoryArray(inner: FeedItem['item']): string[] | undefined {
  const primary = pickStringArray(inner.primary_categories);
  if (primary.length > 0) return primary;
  const single = pickString(inner.category);
  return single ? [single] : undefined;
}

function pickString(...candidates: unknown[]): string | undefined {
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim().length > 0) return c;
  }
  return undefined;
}

function pickStringArray(...candidates: unknown[]): string[] {
  for (const c of candidates) {
    if (Array.isArray(c)) {
      const filtered = c.filter(
        (v): v is string => typeof v === 'string' && v.length > 0,
      );
      if (filtered.length > 0) return filtered;
    }
  }
  return [];
}
