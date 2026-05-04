/**
 * Adapts a `TravelActivity` (used by trip pages) into the same
 * `NormalizedFeedDetail` shape consumed by the explore drawer, so both
 * surfaces can render through one shared `PlaceDetailContent` component.
 */

import type { TravelActivity } from '@/types';
import { getLatLng } from '@/lib/geo/coords';
import { getActivityImageUrl } from '@/hooks/useActivityPhotos';
import type { NormalizedFeedDetail } from './itemAdapter';

interface AdapterOpts {
  destination?: string | null;
  photoMap?: Record<string, string>;
}

export function travelActivityToFeedDetail(
  activity: TravelActivity,
  opts: AdapterOpts = {},
): NormalizedFeedDetail {
  const id = activity.activity_id ?? activity.id;
  const city = opts.destination?.split(',')[0]?.trim() || null;

  return {
    id,
    title: activity.name,
    subtitle: activity.location_name ?? null,
    description: activity.description ?? null,
    city,
    country: null,
    address: activity.address ?? null,
    images: collectImages(activity, opts.photoMap),
    coords: getLatLng(activity),
    category: activity.category?.[0] ?? null,
    categories: activity.primary_categories ?? activity.category ?? [],
    tags: pickTags(activity),
    duration: activity.duration ?? null,
    cost: activity.cost ?? null,
    workingHours: activity.working_hours ?? null,
    rating: typeof activity.rating === 'number' ? activity.rating : null,
    reviewCount: null,
    eventDate: null,
    isViator: false,
    bookingUrl: null,
    priceFrom: null,
    currency: null,
    websiteUrl: activity.website_url ?? null,
    insiderTips: activity.insider_tips ?? [],
    interestingFacts: activity.interesting_facts ?? [],
    highlights: [],
  };
}

function collectImages(
  activity: TravelActivity,
  photoMap?: Record<string, string>,
): string[] {
  const out: string[] = [];

  if (activity.images?.length) {
    for (const img of activity.images) {
      const url = typeof img === 'string' ? img : img?.url;
      if (typeof url === 'string' && url.length > 0) out.push(url);
    }
  }

  if (out.length === 0) {
    const fallback = getActivityImageUrl(activity, photoMap);
    if (fallback) out.push(fallback);
  }

  return out;
}

function pickTags(activity: TravelActivity): string[] {
  const sources = [activity.vibe_tags, activity.secondary_tags];
  for (const src of sources) {
    if (Array.isArray(src) && src.length > 0) return src;
  }
  return [];
}
