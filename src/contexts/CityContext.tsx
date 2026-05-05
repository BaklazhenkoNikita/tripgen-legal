'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'tripgen_active_city';
const CITY_EVENT = 'tripgen:city-change';

interface CityContextValue {
  city: string | null;
  setCity: (city: string | null) => void;
}

const CityContext = createContext<CityContextValue | null>(null);

function getCitySnapshot(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function getServerCitySnapshot(): string | null {
  return null;
}

function subscribeCity(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: Event) => {
    if (e instanceof StorageEvent && e.key !== null && e.key !== STORAGE_KEY) return;
    cb();
  };
  window.addEventListener('storage', handler);
  window.addEventListener(CITY_EVENT, handler);
  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener(CITY_EVENT, handler);
  };
}

export function CityProvider({
  children,
  defaultCity,
}: {
  children: ReactNode;
  defaultCity?: string;
}) {
  // Read localStorage synchronously on first client commit so consumers
  // (e.g. nav's Explore pill) don't flicker `/explore` → `/explore/<slug>`
  // after a post-mount effect.
  const stored = useSyncExternalStore(
    subscribeCity,
    getCitySnapshot,
    getServerCitySnapshot,
  );
  const city = stored ?? defaultCity ?? null;

  const setCity = useCallback((next: string | null) => {
    try {
      if (next) localStorage.setItem(STORAGE_KEY, next);
      else localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new Event(CITY_EVENT));
    } catch {
      // noop
    }
  }, []);

  const value = useMemo(() => ({ city, setCity }), [city, setCity]);
  return <CityContext.Provider value={value}>{children}</CityContext.Provider>;
}

export function useCity(): CityContextValue {
  const ctx = useContext(CityContext);
  if (!ctx) throw new Error('useCity must be used inside <CityProvider>');
  return ctx;
}

/** Non-throwing variant for surfaces mounted on both (marketing) and (app)
 *  layouts (e.g. Navigation's NavSearch). Returns null when the provider
 *  isn't in the tree. */
export function useCityOptional(): CityContextValue | null {
  return useContext(CityContext);
}
