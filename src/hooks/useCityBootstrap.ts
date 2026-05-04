'use client';

import { useEffect } from 'react';
import { useCity } from '@/contexts';

const FALLBACK_CITY = 'Barcelona';
const ATTEMPT_FLAG = 'tripgen_city_bootstrap_attempted_v1';

/** Picks a sensible default city on first visit. Order:
 *   1. If the user already has a city in localStorage → noop.
 *   2. Try browser geolocation (silent — only triggers the OS prompt if the
 *      site has permission). On success, reverse-geocode via BigDataCloud's
 *      free no-key endpoint and use that city.
 *   3. Otherwise fall back to a popular default (Barcelona).
 *  Mounted once near the root so every signed-in or signed-out user lands on
 *  a populated destinations view instead of an empty "Pick a city" screen. */
export function useCityBootstrap() {
  const { city, setCity } = useCity();

  useEffect(() => {
    if (city) return;
    if (typeof window === 'undefined') return;

    let cancelled = false;
    const attempted = (() => {
      try {
        return window.sessionStorage.getItem(ATTEMPT_FLAG) === '1';
      } catch {
        return false;
      }
    })();

    const useFallback = () => {
      if (cancelled) return;
      setCity(FALLBACK_CITY);
    };

    const markAttempted = () => {
      try {
        window.sessionStorage.setItem(ATTEMPT_FLAG, '1');
      } catch {
        // noop
      }
    };

    if (attempted || !navigator.geolocation) {
      useFallback();
      markAttempted();
      return;
    }

    markAttempted();

    const timeout = window.setTimeout(useFallback, 4000);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        window.clearTimeout(timeout);
        if (cancelled) return;
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
          );
          if (!res.ok) throw new Error('reverse geocode failed');
          const data = (await res.json()) as { city?: string; locality?: string; principalSubdivision?: string };
          const detected = data.city || data.locality || data.principalSubdivision;
          if (cancelled) return;
          setCity(detected && detected.trim() ? detected : FALLBACK_CITY);
        } catch {
          useFallback();
        }
      },
      () => {
        window.clearTimeout(timeout);
        useFallback();
      },
      { timeout: 4000, maximumAge: 24 * 60 * 60 * 1000 },
    );

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [city, setCity]);
}
