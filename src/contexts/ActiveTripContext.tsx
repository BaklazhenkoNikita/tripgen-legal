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

interface ActiveTripContextValue {
  activeTripId: string | null;
  activeTripSummary: ActiveTripSummary | null;
  /** True once localStorage has been read on the client. Lets consumers
   *  distinguish "no active trip" from "not yet hydrated" — both look like null. */
  hydrated: boolean;
  setActiveTripId: (id: string | null) => void;
  setActiveTripSummary: (summary: ActiveTripSummary | null) => void;
  /** True when there is an active trip that the user can add activities to. */
  isInTrip: () => boolean;
}

const ActiveTripContext = createContext<ActiveTripContextValue | null>(null);

export function ActiveTripProvider({ children }: { children: ReactNode }) {
  const [activeTripId, setActiveTripIdState] = useState<string | null>(null);
  const [activeTripSummary, setActiveTripSummary] = useState<ActiveTripSummary | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setActiveTripIdState(stored);
    } catch {
      // noop
    }
    setHydrated(true);
  }, []);

  const setActiveTripId = useCallback((id: string | null) => {
    setActiveTripIdState(id);
    try {
      if (id) localStorage.setItem(STORAGE_KEY, id);
      else localStorage.removeItem(STORAGE_KEY);
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
      hydrated,
      setActiveTripId,
      setActiveTripSummary,
      isInTrip,
    }),
    [activeTripId, activeTripSummary, hydrated, setActiveTripId, isInTrip],
  );

  return <ActiveTripContext.Provider value={value}>{children}</ActiveTripContext.Provider>;
}

export function useActiveTrip(): ActiveTripContextValue {
  const ctx = useContext(ActiveTripContext);
  if (!ctx) throw new Error('useActiveTrip must be used inside <ActiveTripProvider>');
  return ctx;
}
