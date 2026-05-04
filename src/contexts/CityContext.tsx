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

const STORAGE_KEY = 'tripgen_active_city';

interface CityContextValue {
  city: string | null;
  setCity: (city: string | null) => void;
}

const CityContext = createContext<CityContextValue | null>(null);

export function CityProvider({
  children,
  defaultCity,
}: {
  children: ReactNode;
  defaultCity?: string;
}) {
  const [city, setCityState] = useState<string | null>(defaultCity ?? null);

  // Hydrate from localStorage after mount (SSR safe).
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setCityState(stored);
    } catch {
      // storage disabled — stick with defaultCity
    }
  }, []);

  const setCity = useCallback((next: string | null) => {
    setCityState(next);
    try {
      if (next) localStorage.setItem(STORAGE_KEY, next);
      else localStorage.removeItem(STORAGE_KEY);
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
