import type { FeedItem } from '@/hooks/useHomeFeed';

const PENDING_IMAGE_THRESHOLD = 0.3;

function imageCount(images: unknown): number {
  return Array.isArray(images) ? images.length : 0;
}

function shareMissingImages<T>(items: ReadonlyArray<T>, getImages: (item: T) => unknown): number {
  if (items.length === 0) return 0;
  let missing = 0;
  for (const it of items) {
    if (imageCount(getImages(it)) === 0) missing++;
  }
  return missing / items.length;
}

/** True if a meaningful share of items still have empty `images` arrays.
 *  Used by feed hooks to keep polling after the LLM-generation flag flips
 *  to false but the backend's image-attach pipeline is still running. */
export function feedHasPendingImages(items: ReadonlyArray<FeedItem>): boolean {
  return shareMissingImages(items, (i) => i.item?.images) > PENDING_IMAGE_THRESHOLD;
}

/** Same idea for entities that carry `images` directly (Restaurant, etc.). */
export function entitiesHavePendingImages<T extends { images?: unknown }>(
  items: ReadonlyArray<T>,
): boolean {
  return shareMissingImages(items, (i) => i.images) > PENDING_IMAGE_THRESHOLD;
}
