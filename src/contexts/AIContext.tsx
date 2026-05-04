'use client';

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

/** Lightweight context handed to AI surfaces (chat, trip-gen) so they know
 *  what the user is currently looking at. Mirrors mobile's AIContext. */
export interface AIContextValue {
  tripId?: string;
  city?: string;
  dayNumber?: number;
}

interface AIContextStore {
  context: AIContextValue;
  setContext: (next: AIContextValue) => void;
  patch: (partial: AIContextValue) => void;
}

const AIContext = createContext<AIContextStore | null>(null);

export function AIContextProvider({ children }: { children: ReactNode }) {
  const [context, setContext] = useState<AIContextValue>({});

  const value = useMemo<AIContextStore>(
    () => ({
      context,
      setContext,
      patch: (partial) => setContext((prev) => ({ ...prev, ...partial })),
    }),
    [context],
  );

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
}

export function useAIContext(): AIContextStore {
  const ctx = useContext(AIContext);
  if (!ctx) throw new Error('useAIContext must be used inside <AIContextProvider>');
  return ctx;
}
