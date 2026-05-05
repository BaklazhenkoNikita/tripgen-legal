'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

/** Summary of the user's currently-focused trip. Populated later (Phase C/D)
 *  from `useSearchHistory` + `useTripDetail`. v1 stores just the id + a flag so
 *  surfaces can branch on "is there an active trip?" before the full record loads. */
export interface ActiveTripSummary {
  id: string;
  destination: string;
  destinationDisplay: string;
  startDate: string | null;
  endDate: string | null;
  plannedDayCount: number;
  activityCount: number;
  imageUrl: string | null;
  status: 'draft' | 'upcoming' | 'active' | 'past';
  daysAway: number;
}

const STORAGE_KEY = 'tripgen_active_trip_id';
const ACTIVE_TRIP_EVENT = 'tripgen:active-trip-change';

interface ActiveTripContextValue {
  activeTripId: string | null;
  activeTripSummary: ActiveTripSummary | null;
  setActiveTripId: (id: string | null) => void;
  setActiveTripSummary: (summary: ActiveTripSummary | null) => void;
  /** True when there is an active trip that the user can add activities to. */
  isInTrip: () => boolean;
}

const ActiveTripContext = createContext<ActiveTripContextValue | null>(null);

function getActiveTripIdSnapshot(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function getServerActiveTripIdSnapshot(): string | null {
  return null;
}

function subscribeActiveTripId(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: Event) => {
    if (e instanceof StorageEvent && e.key !== null && e.key !== STORAGE_KEY) return;
    cb();
  };
  window.addEventListener('storage', handler);
  window.addEventListener(ACTIVE_TRIP_EVENT, handler);
  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener(ACTIVE_TRIP_EVENT, handler);
  };
}

export function ActiveTripProvider({ children }: { children: ReactNode }) {
  // Read localStorage synchronously on first client commit so consumers
  // (e.g. nav's Trip pill) don't flicker `/trip` → `/trip/<id>` after a
  // post-mount effect.
  const activeTripId = useSyncExternalStore(
    subscribeActiveTripId,
    getActiveTripIdSnapshot,
    getServerActiveTripIdSnapshot,
  );
  const [activeTripSummary, setActiveTripSummary] = useState<ActiveTripSummary | null>(null);

  const setActiveTripId = useCallback((id: string | null) => {
    try {
      if (id) localStorage.setItem(STORAGE_KEY, id);
      else localStorage.removeItem(STORAGE_KEY);
      // `storage` only fires cross-tab; emit a custom event so same-tab
      // subscribers (e.g. the nav's Trip pill) re-read synchronously.
      window.dispatchEvent(new Event(ACTIVE_TRIP_EVENT));
    } catch {
      // noop
    }
    if (!id) setActiveTripSummary(null);
  }, []);

  const isInTrip = useCallback(() => activeTripId != null, [activeTripId]);

  const value = useMemo(
    () => ({
      activeTripId,
      activeTripSummary,
      setActiveTripId,
      setActiveTripSummary,
      isInTrip,
    }),
    [activeTripId, activeTripSummary, setActiveTripId, isInTrip],
  );

  return <ActiveTripContext.Provider value={value}>{children}</ActiveTripContext.Provider>;
}

export function useActiveTrip(): ActiveTripContextValue {
  const ctx = useContext(ActiveTripContext);
  if (!ctx) throw new Error('useActiveTrip must be used inside <ActiveTripProvider>');
  return ctx;
}

/** Non-throwing variant for surfaces that may render outside the provider
 *  (mirrors `useCityOptional`). Returns null when the provider isn't in the
 *  tree. */
export function useActiveTripOptional(): ActiveTripContextValue | null {
  return useContext(ActiveTripContext);
}
