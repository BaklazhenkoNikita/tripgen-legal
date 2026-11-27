'use client';

import { createContext, useContext } from 'react';
import type { ChatRequestContext } from '@/lib/chat/protocol';

export interface ChatRenderContextValue {
  /** City used to build place links / maps searches. */
  city?: string | null;
  /** Send a prompt as a new user message ("Fix it", capability cards).
   *  `context` scopes just this message (e.g. Ask on a place card). */
  sendPrompt?: (prompt: string, context?: ChatRequestContext) => void;
  /** True while a turn streams — prompt-sending buttons disable. */
  busy?: boolean;
}

const ChatRenderContext = createContext<ChatRenderContextValue>({});

export const ChatRenderProvider = ChatRenderContext.Provider;

export function useChatRender(): ChatRenderContextValue {
  return useContext(ChatRenderContext);
}
