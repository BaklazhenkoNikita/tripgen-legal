/**
 * Server-side fetch wrappers for SEO-critical metadata generation.
 *
 * These run inside `generateMetadata` and server components, so they can't
 * use the Clerk-aware `apiFetch` (which depends on browser-side getToken).
 * Instead they hit the backend directly with `next/fetch` so Next.js can
 * cache responses across requests and the build pipeline.
 *
 * All readers return `null` on any failure (404, network, parse error) so
 * callers can fall through to a not-found UI without try/catch noise.
 */
import type { TravelActivity } from '@/types';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

/** Trip detail shape returned by `GET /api/search-history/{id}`. We type it
 *  loose here (matching the slice the client hook reads) so a missing
 *  field doesn't blow up at metadata-generation time. */
export interface ServerTripDetail {
  searchId?: string;
  destination?: string;
  travel_plan?: Array<{
    day_number?: number;
    date?: string;
    title?: string;
    activities?: Array<{ name?: string; activity_id?: string }>;
  }>;
  activities?: Array<Pick<TravelActivity, 'id' | 'name' | 'description' | 'images' | 'address' | 'latitude' | 'longitude' | 'coordinates' | 'rating' | 'website_url'>>;
  start_date?: string;
  end_date?: string;
  is_public?: boolean;
}

async function safeFetchJson<T>(url: string, revalidate: number): Promise<T | null> {
  try {
    const res = await fetch(url, {
      next: { revalidate },
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Fetch a single activity for SSR metadata. Cached for 1 hour — places
 *  rarely change and we want fast cold renders for crawler hits. */
export function getActivity(id: string) {
  if (!/^[a-f0-9]{24}$/i.test(id)) return Promise.resolve(null);
  return safeFetchJson<TravelActivity>(
    `${BACKEND_URL}/api/activity/${encodeURIComponent(id)}`,
    60 * 60,
  );
}

/** Fetch a saved trip for SSR metadata. Cached for 5 minutes — trips can
 *  change as users edit them, but the first paint just needs the
 *  destination + activity list, which moves slowly enough that 5 min is
 *  fine for SERP / share-card freshness. */
export function getTrip(id: string) {
  return safeFetchJson<ServerTripDetail>(
    `${BACKEND_URL}/api/search-history/${encodeURIComponent(id)}`,
    60 * 5,
  );
}

/** Pull the first usable image URL out of the polymorphic `images` array
 *  emitted by the backend (sometimes string, sometimes `{url}` object). */
export function firstImageUrl(images: TravelActivity['images']): string | undefined {
  if (!images?.length) return undefined;
  const first = images[0];
  if (typeof first === 'string') return first;
  return first?.url ?? undefined;
}

/** Resolve {lat, lng} from an activity's polymorphic coordinate fields. */
export function activityCoords(activity: TravelActivity): { latitude: number; longitude: number } | undefined {
  const lat =
    activity.latitude ??
    activity.coordinates?.lat ??
    activity.coordinates?.latitude;
  const lng =
    activity.longitude ??
    activity.coordinates?.lng ??
    activity.coordinates?.longitude ??
    activity.coordinates?.lon;
  if (typeof lat === 'number' && typeof lng === 'number') {
    return { latitude: lat, longitude: lng };
  }
  return undefined;
}
