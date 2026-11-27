'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
  /** The place on screen (full place page) — the floating chat attaches it
   *  as a removable context chip. */
  entity?: AIFocusEntity;
}

export interface AIFocusEntity {
  id: string;
  type: 'activity' | 'restaurant' | 'live_event';
  name: string;
}

interface AIContextStore {
  context: AIContextValue;
  setContext: (next: AIContextValue) => void;
  patch: (partial: AIContextValue) => void;
}

const AIContext = createContext<AIContextStore | null>(null);

export function AIContextProvider({ children }: { children: ReactNode }) {
  const [context, setContext] = useState<AIContextValue>({});
  // Stable identity — useReportAIFocus depends on it, so a per-render
  // closure would re-run its effect (and setState) on every update.
  const patch = useCallback(
    (partial: AIContextValue) => setContext((prev) => ({ ...prev, ...partial })),
    [],
  );

  const value = useMemo<AIContextStore>(
    () => ({ context, setContext, patch }),
    [context, patch],
  );

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
}

export function useAIContext(): AIContextStore {
  const ctx = useContext(AIContext);
  if (!ctx) throw new Error('useAIContext must be used inside <AIContextProvider>');
  return ctx;
}

/** Report what the current page shows to AI surfaces; cleared on unmount. */
export function useReportAIFocus(entity: AIFocusEntity | null): void {
  const ctx = useContext(AIContext);
  const patch = ctx?.patch;
  const id = entity?.id;
  const type = entity?.type;
  const name = entity?.name;
  useEffect(() => {
    if (!patch) return;
    patch({ entity: id && type && name ? { id, type, name } : undefined });
    return () => patch({ entity: undefined });
  }, [patch, id, type, name]);
}
