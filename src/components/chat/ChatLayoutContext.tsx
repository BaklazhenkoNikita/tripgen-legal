'use client';

import { createContext, useContext } from 'react';

export interface ChatLayoutContextValue {
  /** Mobile-only: open the off-canvas chat history drawer. No-op on desktop. */
  openHistory: () => void;
  /** True when viewport is below the md breakpoint and the sidebar is hidden. */
  isMobile: boolean;
}

export const ChatLayoutContext = createContext<ChatLayoutContextValue | null>(null);

export function useChatLayout(): ChatLayoutContextValue {
  const ctx = useContext(ChatLayoutContext);
  if (!ctx) {
    return { openHistory: () => {}, isMobile: false };
  }
  return ctx;
}
