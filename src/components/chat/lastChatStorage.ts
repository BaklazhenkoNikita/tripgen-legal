/**
 * Tracks the most recently viewed chat across sessions so `/chat` can resume
 * where the user left off. Per-trip drawer chats use a separate key
 * (`tripgen_trip_chat_<tripId>`) — see ChatDrawer.tsx.
 */
export const LAST_CHAT_STORAGE_KEY = 'tripgen_last_chat_id';
const LAST_CHAT_EVENT = 'tripgen:last-chat-change';

export function readLastChatId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(LAST_CHAT_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function writeLastChatId(chatId: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LAST_CHAT_STORAGE_KEY, chatId);
    // `storage` only fires cross-tab; emit a custom event so same-tab
    // subscribers (e.g. the nav's Chat pill) re-read synchronously.
    window.dispatchEvent(new Event(LAST_CHAT_EVENT));
  } catch {
    // localStorage may be unavailable (private mode, quota) — ignore.
  }
}

export function subscribeLastChatId(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: Event) => {
    if (e instanceof StorageEvent && e.key !== null && e.key !== LAST_CHAT_STORAGE_KEY) return;
    cb();
  };
  window.addEventListener('storage', handler);
  window.addEventListener(LAST_CHAT_EVENT, handler);
  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener(LAST_CHAT_EVENT, handler);
  };
}
