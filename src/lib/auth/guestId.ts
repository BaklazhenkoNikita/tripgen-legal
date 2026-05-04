/**
 * Persistent guest id — mirrors mobile's `utils/getGuestId()`.
 *
 * Used as the `X-Session-Id` header on every API call so the backend can
 * attach guest data (trip history, signals, shortlist) to one identity,
 * then merge into an authenticated profile on sign-in via
 * `POST /api/travel/merge-profile`.
 *
 * Stored in `localStorage` (survives tab close + browser restart). On SSR
 * and in private windows where storage is unavailable, we fall back to an
 * ephemeral in-memory id — losing persistence but not breaking the request.
 */

const STORAGE_KEY = 'tripgen_guest_id';

let memoryId: string | null = null;

function generateId(): string {
  // RFC 4122 v4-ish — good enough for a client-side correlation id.
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `guest-${crypto.randomUUID()}`;
  }
  const rand = Math.random().toString(36).slice(2, 10);
  return `guest-${Date.now().toString(36)}-${rand}`;
}

export function getGuestId(): string {
  if (memoryId) return memoryId;

  if (typeof window === 'undefined') {
    // SSR: generate a per-render id. Not persistent, but no UI depends on it server-side.
    memoryId = generateId();
    return memoryId;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      memoryId = stored;
      return stored;
    }
    const fresh = generateId();
    localStorage.setItem(STORAGE_KEY, fresh);
    memoryId = fresh;
    return fresh;
  } catch {
    // Private window / storage disabled — use in-memory only.
    memoryId = generateId();
    return memoryId;
  }
}

/** Clear after guest-merge so subsequent calls are attributed to the signed-in user. */
export function clearGuestId() {
  memoryId = null;
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // noop
    }
  }
}

/** Record that we've merged a given guest id into the current Clerk user. Prevents duplicate merges. */
const MERGED_KEY = 'tripgen_guest_merged';

export function getMergedGuestId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(MERGED_KEY);
  } catch {
    return null;
  }
}

export function setMergedGuestId(guestId: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MERGED_KEY, guestId);
  } catch {
    // noop
  }
}
