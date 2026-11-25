'use client';

import { createContext, useContext } from 'react';

export interface ChatRenderContextValue {
  /** City used to build place links / maps searches. */
  city?: string | null;
  /** Send a prompt as a new user message ("Fix it", capability cards). */
  sendPrompt?: (prompt: string) => void;
  /** True while a turn streams — prompt-sending buttons disable. */
  busy?: boolean;
}

const ChatRenderContext = createContext<ChatRenderContextValue>({});

export const ChatRenderProvider = ChatRenderContext.Provider;

export function useChatRender(): ChatRenderContextValue {
  return useContext(ChatRenderContext);
}
