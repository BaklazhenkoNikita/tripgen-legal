/**
 * Normalises the loose `FeedItem.item` envelope returned by the v4 feed
 * endpoints into a strongly-typed view-model that the detail drawer can
 * render without spreading null-checks across JSX.
 *
 * Image shapes vary by entity:
 *   - exploration / activity / restaurant → `images: Array<{ url }>`
 *   - viator                              → `images: string[]`
 *   - some discovery cards (older)        → `imageUrl: string`
 */

import type { FeedItem } from '@/hooks/useHomeFeed';
import { getLatLng, type LatLng } from '@/lib/geo/coords';
import { cardId } from '@/components/home/FeedCard';

export interface NormalizedFeedDetail {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  city: string | null;
  country: string | null;
  address: string | null;
  images: string[];
  coords: LatLng | null;
  category: string | null;
  categories: string[];
  tags: string[];
  duration: string | null;
  cost: string | null;
  workingHours: string | null;
  rating: number | null;
  reviewCount: number | null;
  eventDate: string | null;
  /** Viator-specific. */
  isViator: boolean;
  bookingUrl: string | null;
  priceFrom: number | null;
  currency: string | null;
  /** Hints for the deep-context lookup. */
  websiteUrl: string | null;
  insiderTips: string[];
  interestingFacts: string[];
  highlights: string[];
}

export function normalizeFeedItem(feedItem: FeedItem): NormalizedFeedDetail {
  const inner = feedItem.item ?? {};
  const isViator = feedItem.entity_type === 'viator';

  return {
    id: cardId(feedItem),
    title: pickString(inner.title, inner.name) ?? 'Untitled',
    subtitle: deriveSubtitle(feedItem),
    description:
      pickString(inner.description, inner.short_description) ?? null,
    city: pickString(inner.city) ?? null,
    country: pickString(inner.country) ?? null,
    address: pickString(inner.address, (inner.venue as { address?: string } | undefined)?.address) ?? null,
    images: extractImages(inner),
    coords: getLatLng(inner),
    category: pickString(inner.category) ?? null,
    categories: pickStringArray(inner.primary_categories, inner.subcategories),
    tags: pickStringArray(inner.tags, inner.vibe_tags, inner.secondary_tags),
    duration: pickString(inner.duration) ?? null,
    cost: pickString(inner.cost, inner.price_range) ?? null,
    workingHours: pickString(inner.working_hours) ?? null,
    rating: pickNumber(inner.rating),
    reviewCount: pickNumber(inner.review_count),
    eventDate: pickString(inner.event_datetime) ?? null,
    isViator,
    bookingUrl: pickString(inner.booking_url) ?? null,
    priceFrom: pickNumber(inner.price_from),
    currency: pickString(inner.currency) ?? null,
    websiteUrl: pickString(inner.website_url) ?? null,
    insiderTips: pickStringArray(inner.insider_tips),
    interestingFacts: pickStringArray(inner.interesting_facts),
    highlights: pickStringArray(inner.highlights),
  };
}

function deriveSubtitle(feedItem: FeedItem): string | null {
  const inner = feedItem.item ?? {};
  if (feedItem.entity_type === 'restaurant') {
    const cuisines = inner.cuisine_type as string[] | undefined;
    if (cuisines?.length) return cuisines.slice(0, 3).join(' · ');
  }
  if (feedItem.entity_type === 'live_event') {
    const venue = inner.venue as { name?: string } | undefined;
    if (venue?.name) return venue.name;
  }
  if (feedItem.entity_type === 'viator') {
    return pickString(inner.short_description) ?? null;
  }
  return pickString(inner.country) ?? null;
}

function extractImages(inner: FeedItem['item']): string[] {
  const out: string[] = [];

  const arr = inner.images as unknown;
  if (Array.isArray(arr)) {
    for (const entry of arr) {
      if (typeof entry === 'string' && entry.length > 0) {
        out.push(entry);
      } else if (entry && typeof entry === 'object') {
        const url = (entry as { url?: string | null }).url;
        if (typeof url === 'string' && url.length > 0) out.push(url);
      }
    }
  }

  if (out.length === 0) {
    const single = (inner as { imageUrl?: string }).imageUrl;
    if (typeof single === 'string' && single.length > 0) out.push(single);
  }

  return out;
}

function pickString(...candidates: unknown[]): string | undefined {
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim().length > 0) return c;
  }
  return undefined;
}

function pickNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function pickStringArray(...candidates: unknown[]): string[] {
  for (const c of candidates) {
    if (Array.isArray(c)) {
      const filtered = c.filter((v): v is string => typeof v === 'string' && v.length > 0);
      if (filtered.length > 0) return filtered;
    }
  }
  return [];
}
