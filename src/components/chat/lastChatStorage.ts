/**
 * Tracks the most recently viewed chat across sessions so `/chat` can resume
 * where the user left off. Per-trip drawer chats use a separate key
 * (`tripgen_trip_chat_<tripId>`) — see ChatDrawer.tsx.
 */
export const LAST_CHAT_STORAGE_KEY = 'tripgen_last_chat_id';

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
  } catch {
    // localStorage may be unavailable (private mode, quota) — ignore.
  }
}
