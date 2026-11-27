'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useCreateChat } from '@/hooks/useChats';
import { useLastChatId, writeLastChatId } from '@/components/chat/lastChatStorage';
import type { ChatEntryContext } from '@/components/chat/ChatConversation';

interface OpenOptions {
  /** Explicit "what are we asking about" (e.g. Ask Periplo on a place).
   *  Omit to use whatever the current page reports via AIContext. */
  context?: ChatEntryContext;
}

interface ChatDockValue {
  isOpen: boolean;
  /** Bumps on every open() so the panel can re-focus its composer. */
  openNonce: number;
  /** Context passed to the last open(); null → page context. */
  openContext: ChatEntryContext | null;
  open: (opts?: OpenOptions) => void;
  close: () => void;
  toggle: () => void;
  /** The conversation the dock (and "Ask" side panels) continue — the same
   *  "last chat" the nav's Ask Periplo link opens. */
  chatId: string | null;
  /** Returns the current chat id, creating a chat when there is none. */
  ensureChat: () => Promise<string | null>;
  newChat: () => Promise<void>;
  creating: boolean;
  error: string | null;
}

const ChatDockContext = createContext<ChatDockValue | null>(null);

/**
 * State for the floating "Ask Periplo" chat window (bottom-right) and the
 * place side panels' Ask view. Lives in AppContextsRoot so an open
 * conversation survives client-side navigation.
 */
export function ChatDockProvider({ children }: { children: ReactNode }) {
  const lastChatId = useLastChatId();
  const createChat = useCreateChat();
  const [isOpen, setIsOpen] = useState(false);
  const [openNonce, setOpenNonce] = useState(0);
  const [openContext, setOpenContext] = useState<ChatEntryContext | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pending = useRef<Promise<string | null> | null>(null);

  const create = useCallback(async (): Promise<string | null> => {
    if (pending.current) return pending.current;
    setCreating(true);
    setError(null);
    const p = createChat
      .mutateAsync({ title: 'Ask Periplo' })
      .then((chat) => {
        writeLastChatId(chat.chat_id);
        return chat.chat_id;
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Could not start a chat.');
        return null;
      })
      .finally(() => {
        setCreating(false);
        pending.current = null;
      });
    pending.current = p;
    return p;
  }, [createChat]);

  const ensureChat = useCallback(
    async () => lastChatId ?? create(),
    [lastChatId, create],
  );

  const newChat = useCallback(async () => {
    setOpenContext(null);
    await create();
  }, [create]);

  const open = useCallback((opts?: OpenOptions) => {
    setOpenContext(opts?.context ?? null);
    setIsOpen(true);
    setOpenNonce((n) => n + 1);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => {
    if (isOpen) close();
    else open();
  }, [isOpen, open, close]);

  const value = useMemo<ChatDockValue>(
    () => ({
      isOpen,
      openNonce,
      openContext,
      open,
      close,
      toggle,
      chatId: lastChatId,
      ensureChat,
      newChat,
      creating,
      error,
    }),
    [isOpen, openNonce, openContext, open, close, toggle, lastChatId, ensureChat, newChat, creating, error],
  );

  return <ChatDockContext.Provider value={value}>{children}</ChatDockContext.Provider>;
}

export function useChatDock(): ChatDockValue {
  const ctx = useContext(ChatDockContext);
  if (!ctx) throw new Error('useChatDock must be used inside <ChatDockProvider>');
  return ctx;
}

/** Non-throwing variant for components that may render outside the root
 *  providers (previews, isolated tests). */
export function useChatDockOptional(): ChatDockValue | null {
  return useContext(ChatDockContext);
}
