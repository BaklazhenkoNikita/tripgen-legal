import { destinationSlug } from './destinationSlug';

const ID_RE = /^[a-f0-9]{24}$/i;

/** Build the [place] segment for `/explore/[city]/[place]` as a slug-id
 *  hybrid: `slug(name) + "-" + id`. The id (Mongo ObjectId, 24 hex chars)
 *  is always parseable from the trailing segment; the slug is purely
 *  decorative (SEO + readability). Returns null when id is missing or
 *  not a Mongo ObjectId — callers should fall back to the drawer-only
 *  flow in that case (e.g. Viator items). */
export function placeSlugWithId(
  name: string | null | undefined,
  id: string | null | undefined,
): string | null {
  if (!id || !ID_RE.test(id)) return null;
  const slug = destinationSlug(name ?? '');
  return slug ? `${slug}-${id}` : id;
}

/** Reverse of `placeSlugWithId`. The id is the trailing 24-hex segment
 *  after the last `-`; if the URL is just the id (no slug), returns it
 *  as-is. Returns null when no id can be recovered. */
export function extractPlaceId(slug: string | null | undefined): string | null {
  if (!slug) return null;
  const decoded = decodeURIComponent(slug);
  if (ID_RE.test(decoded)) return decoded;
  const lastDash = decoded.lastIndexOf('-');
  if (lastDash === -1) return null;
  const tail = decoded.slice(lastDash + 1);
  return ID_RE.test(tail) ? tail : null;
}
