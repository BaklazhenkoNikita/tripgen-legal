import { destinationSlug } from '@/lib/destinationSlug';
import { placeSlugWithId } from '@/lib/placeSlug';
import { mapsSearchUrl } from './markdown';

export interface EntityLink {
  href: string;
  /** External links open in a new tab. */
  external: boolean;
}

/**
 * Where tapping a chat entity goes:
 * - activity with a Mongo id + known city → the web place page
 *   (`/explore/[city]/[slug-id]`)
 * - anything else (restaurants, Viator ids, unknown city) → Google Maps search
 */
export function entityHref(
  type: string | undefined,
  id: string | undefined,
  name: string,
  city?: string | null,
): EntityLink {
  if (type !== 'restaurant' && city) {
    const place = placeSlugWithId(name, id);
    const citySlug = destinationSlug(city);
    if (place && citySlug) return { href: `/explore/${citySlug}/${place}`, external: false };
  }
  return { href: mapsSearchUrl(name, city), external: true };
}

const SCREEN_ROUTES: Record<string, { href: string; label: string }> = {
  explore: { href: '/explore', label: 'Open Explore' },
  trips: { href: '/history', label: 'Open your trips' },
  activities: { href: '/explore', label: 'Browse activities' },
  discover: { href: '/discover', label: 'Open Discover' },
  search: { href: '/explore', label: 'Open search' },
  settings: { href: '/profile', label: 'Open settings' },
  profile: { href: '/profile', label: 'Open your profile' },
};

/** Map a server `navigation` frame (mobile screen names) to a web route. */
export function navigationTarget(
  screen: string,
  params?: Record<string, unknown>,
): { href: string; label: string } | null {
  if (!screen) return null;
  if (screen.startsWith('/')) return { href: screen, label: 'Open' };
  const tripId = typeof params?.trip_id === 'string' ? params.trip_id : undefined;
  if (screen === 'trip_detail' || screen === 'trip') {
    return tripId ? { href: `/trip/${encodeURIComponent(tripId)}`, label: 'Open your trip' } : SCREEN_ROUTES.trips;
  }
  return SCREEN_ROUTES[screen] ?? null;
}
