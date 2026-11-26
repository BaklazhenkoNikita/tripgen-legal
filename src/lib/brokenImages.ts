/**
 * Page-session registry of image URLs that failed to load.
 *
 * When a place's first photo is dead but the others are fine, every photo
 * slot should skip the dead one: carousels push it to the end, cards and
 * thumbnails move on to the next photo. The carousel, the place-page mosaic
 * and the lightbox each index into the same photo list, so they all read one
 * shared registry and agree on the order (photo `i` in the carousel is photo
 * `i` in the lightbox). It lives in memory only and clears on reload.
 */
import { useMemo, useSyncExternalStore } from 'react';

type Url = string | null | undefined;

const EMPTY: ReadonlySet<string> = new Set();
let broken: ReadonlySet<string> = EMPTY;
const listeners = new Set<() => void>();

/** Record a failed load. Every photo slot showing this URL re-renders. */
export function markImageBroken(url: Url): void {
  if (!url || broken.has(url)) return;
  const next = new Set(broken);
  next.add(url);
  broken = next;
  for (const listener of listeners) listener();
}

export function getBrokenImages(): ReadonlySet<string> {
  return broken;
}

export function subscribeBrokenImages(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Test-only: forget every recorded failure. */
export function resetBrokenImages(): void {
  broken = EMPTY;
  for (const listener of listeners) listener();
}

/**
 * Healthy URLs first, broken ones at the end, each group in its original
 * order. Empty and duplicate URLs are dropped. Keyed by URL (never by index)
 * because indexes shift once the list is reordered.
 */
export function orderByHealth(urls: readonly Url[], brokenSet: ReadonlySet<string>): string[] {
  const seen = new Set<string>();
  const healthy: string[] = [];
  const failed: string[] = [];
  for (const url of urls) {
    if (!url || seen.has(url)) continue;
    seen.add(url);
    (brokenSet.has(url) ? failed : healthy).push(url);
  }
  return healthy.concat(failed);
}

export interface OrderedImages {
  /** Healthy URLs first, broken ones at the end. */
  ordered: string[];
  /** First URL that hasn't failed, or null when every candidate is broken. */
  current: string | null;
  isBroken: (url: Url) => boolean;
}

export function useOrderedImages(urls: readonly Url[]): OrderedImages {
  const brokenSet = useSyncExternalStore(subscribeBrokenImages, getBrokenImages, () => EMPTY);
  // Callers often rebuild the array every render; key on its contents.
  const key = urls.join('\n');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ordered = useMemo(() => orderByHealth(urls, brokenSet), [key, brokenSet]);
  const current = ordered.length > 0 && !brokenSet.has(ordered[0]) ? ordered[0] : null;
  return { ordered, current, isBroken: (url) => !!url && brokenSet.has(url) };
}
