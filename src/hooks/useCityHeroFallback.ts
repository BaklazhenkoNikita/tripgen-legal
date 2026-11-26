'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Maps a city name to a curated hero photo from the static destinations
 * catalogue, for trip cards whose backend `thumbnail_image_url` is empty.
 *
 * The catalogue is ~380KB of SEO copy, so it is loaded as its own async
 * chunk and only when `enabled` (some card actually needs a fallback).
 * Cards render immediately with the Photo placeholder and swap in the image
 * when the chunk lands — images never block content.
 */
export function useCityHeroFallback(enabled: boolean): (city: string) => string | null {
  const [heroByCity, setHeroByCity] = useState<Map<string, string> | null>(null);

  useEffect(() => {
    if (!enabled || heroByCity) return;
    let cancelled = false;
    import('@/data/destinations')
      .then(({ destinations }) => {
        if (cancelled) return;
        const map = new Map<string, string>();
        for (const d of destinations) {
          const key = d.city.toLowerCase();
          if (!map.has(key)) map.set(key, d.heroImage);
        }
        setHeroByCity(map);
      })
      .catch(() => {
        // Fallback art is optional; the placeholder stays.
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, heroByCity]);

  return useCallback(
    (city: string) => heroByCity?.get(city.trim().toLowerCase()) ?? null,
    [heroByCity],
  );
}
