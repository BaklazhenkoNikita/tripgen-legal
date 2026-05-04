import { destinations } from '@/data/destinations';

/** Convert a destination string ("Barcelona", "New York") into the URL slug
 *  used by the explore route (`/explore/{slug}`). The route's [slug]/page.tsx
 *  reverses this with a humanise fallback when the slug is not in the curated
 *  destinations list, so symmetry is preserved end-to-end. */
export function destinationSlug(destination: string | null | undefined): string {
  if (!destination) return '';
  return destination
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

/** Reverse of `destinationSlug`. Curated destinations win (so deep-links
 *  like `/explore/paris-5-days` resolve to "Paris"); falls back to a
 *  humanised version of the slug for arbitrary user-typed cities. */
export function slugToCity(slug: string): string {
  const curated = destinations.find((d) => d.slug === slug);
  if (curated) return curated.city;
  return decodeURIComponent(slug)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
