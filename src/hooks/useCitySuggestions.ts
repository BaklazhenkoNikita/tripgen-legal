'use client';

/**
 * Client-side city autocomplete — port of mobile's useCitySuggestions.
 *
 * Combines two sources:
 *   1. Curated DB destinations (from useDestinationsList — already cached
 *      with images/descriptions for the discover surfaces)
 *   2. Bundled GeoNames dataset (~32k cities), lazy-loaded on first use
 *
 * Scoring (descending weight):
 *   - Tourism boost (+50): city exists in our curated DB destinations
 *   - Prefix match (+30) / alias prefix (+25) / substring (+10) / alias substr (+8)
 *   - Fuzzy match (+5 dist-1, +2 dist-2)
 *   - Population tier (+0–21)
 *   - Active trip (+15) / recent pick (+12)
 *
 * Mobile-only signals dropped: GPS proximity, onboarding home city.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDestinationsList } from '@/hooks/useDestinationsAutocomplete';
import { useRecentDestinations } from '@/hooks/useRecentDestinations';
import { useActiveTrip } from '@/contexts/ActiveTripContext';
import { loadCities, stripAccents, type CityEntry } from '@/lib/cities/cityIndex';
import { ALIAS_PREFIX_INDEX } from '@/lib/cities/cityAliases';
import { fuzzyScore, maxEditDistance } from '@/lib/cities/fuzzyMatch';
import { normalizeCity } from '@/lib/cities/normalizeCity';
import type { DestinationListItem } from '@/types';

const DEBOUNCE_MS = 150;
const MIN_QUERY_LEN = 2;
const MAX_RESULTS = 8;

export interface CitySuggestionsResult {
  suggestions: DestinationListItem[];
  /** True when there's a query but no matches — caller can render a "Press Enter to use 'X'" row. */
  showFallback: boolean;
  /** True while the GeoNames chunk is still loading on first open. */
  isLoading: boolean;
}

export function useCitySuggestions(query: string): CitySuggestionsResult {
  const { data: destinationsData } = useDestinationsList();
  const destinations = destinationsData?.destinations;
  const { list: recentPicks } = useRecentDestinations();
  const { activeTripSummary } = useActiveTrip();

  const [cities, setCities] = useState<CityEntry[] | null>(null);

  // Kick off the lazy import once on mount.
  useEffect(() => {
    let cancelled = false;
    loadCities()
      .then((c) => {
        if (!cancelled) setCities(c);
      })
      .catch(() => {
        // dataset failed to load — DB matches still render.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Debounce the query.
  const [debouncedQuery, setDebouncedQuery] = useState('');
  useEffect(() => {
    if (!query || query.length < MIN_QUERY_LEN) {
      setDebouncedQuery('');
      return;
    }
    const t = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  const tripCityNorm = useMemo(
    () => (activeTripSummary ? normalizeCity(activeTripSummary.destination) : null),
    [activeTripSummary],
  );

  const suggestions = useMemo<DestinationListItem[]>(() => {
    const q = stripAccents(debouncedQuery).toLowerCase();

    // --- Empty state ---
    if (!q) {
      const out: DestinationListItem[] = [];
      const seen = new Set<string>();

      for (const pick of recentPicks) {
        if (out.length >= 5) break;
        const norm = normalizeCity(pick);
        if (seen.has(norm)) continue;
        seen.add(norm);
        const dbMatch = destinations?.find(
          (d) => normalizeCity((d.city ?? d.name ?? '').toLowerCase()) === norm,
        );
        if (dbMatch) {
          out.push({ ...dbMatch, source: 'db' });
        } else {
          const cityMatch = cities?.find((c) => normalizeCity(c.nLower) === norm);
          if (cityMatch) {
            out.push({
              name: cityMatch.n,
              city: norm,
              country: cityMatch.c,
              source: 'cities',
              populationTier: cityMatch.t,
            });
          } else {
            out.push({ name: pick, city: norm, country: '', source: 'cities' });
          }
        }
      }

      if (activeTripSummary && out.length < 5) {
        const norm = normalizeCity(activeTripSummary.destination);
        if (!seen.has(norm)) {
          seen.add(norm);
          out.push({
            name: activeTripSummary.destinationDisplay,
            city: norm,
            country: '',
            source: 'cities',
          });
        }
      }

      return out;
    }

    // --- Typed query: alias resolution ---
    const aliasMatches = new Map<string, number>();
    const qPrefix2 = q.slice(0, 2);
    const aliasBucket = ALIAS_PREFIX_INDEX.get(qPrefix2);
    if (aliasBucket) {
      for (const [alias, canonical] of aliasBucket) {
        let s = 0;
        if (alias.startsWith(q)) s = 25;
        else if (q.startsWith(alias)) s = 25;
        else if (alias.includes(q)) s = 8;
        if (s > 0) {
          const prev = aliasMatches.get(canonical) ?? 0;
          if (s > prev) aliasMatches.set(canonical, s);
        }
      }
    }

    const fuzzyMax = maxEditDistance(q.length);

    // --- 1. DB destinations ---
    const dbMatches: DestinationListItem[] = [];
    if (destinations) {
      const scored = destinations
        .map((d) => {
          const cityLow = stripAccents(d.city ?? '').toLowerCase();
          const nameLow = stripAccents(d.name ?? '').toLowerCase();
          let score = 0;
          if (cityLow.startsWith(q)) score = 30;
          else if (nameLow.startsWith(q)) score = 20;
          else if (cityLow.includes(q) || nameLow.includes(q)) score = 10;

          if (score === 0) {
            score = Math.max(aliasMatches.get(cityLow) ?? 0, aliasMatches.get(nameLow) ?? 0);
          }

          if (score === 0 && fuzzyMax > 0) {
            const cityFuzzy = fuzzyScore(q, cityLow.slice(0, q.length + fuzzyMax), fuzzyMax);
            const nameFuzzy = fuzzyScore(q, nameLow.slice(0, q.length + fuzzyMax), fuzzyMax);
            score = Math.max(cityFuzzy, nameFuzzy);
            if (score === 0 && cityLow.length <= q.length + 2) {
              score = fuzzyScore(q, cityLow, fuzzyMax);
            }
            if (score === 0 && nameLow.length <= q.length + 2) {
              score = fuzzyScore(q, nameLow, fuzzyMax);
            }
          }

          return { d: { ...d, source: 'db' as const }, score };
        })
        .filter((s) => s.score > 0)
        .sort((a, b) => b.score - a.score);

      dbMatches.push(...scored.map((s) => s.d).slice(0, 8));
    }

    // --- 2. Bundled cities ---
    const seen = new Set(
      dbMatches.map((d) => normalizeCity((d.city ?? d.name ?? '').toLowerCase())),
    );
    const dbCitySet = new Set(
      (destinations ?? []).map((d) => normalizeCity((d.city ?? d.name ?? '').toLowerCase())),
    );
    const recentSet = new Set(recentPicks.map((c) => normalizeCity(c)));

    const cityScored: { item: DestinationListItem; score: number }[] = [];

    if (cities) {
      for (const c of cities) {
        const cityNorm = normalizeCity(c.nLower);
        if (seen.has(cityNorm)) continue;

        let matchScore = 0;
        if (c.nLower.startsWith(q)) matchScore = 30;
        else if (c.nLower.includes(q)) matchScore = 10;

        if (matchScore === 0) {
          matchScore = aliasMatches.get(c.nLower) ?? 0;
        }

        if (matchScore === 0 && fuzzyMax > 0) {
          matchScore = fuzzyScore(q, c.nLower.slice(0, q.length + fuzzyMax), fuzzyMax);
          if (matchScore === 0 && c.nLower.length <= q.length + 2) {
            matchScore = fuzzyScore(q, c.nLower, fuzzyMax);
          }
        }

        if (matchScore === 0) continue;

        // Tourism boost
        if (dbCitySet.has(cityNorm)) matchScore += 50;
        // Population tier
        matchScore += c.t * 3;
        // Active trip
        if (tripCityNorm && cityNorm === tripCityNorm) matchScore += 15;
        // Recent pick
        if (recentSet.has(cityNorm)) matchScore += 12;

        seen.add(cityNorm);
        cityScored.push({
          item: {
            name: c.n,
            city: cityNorm,
            country: c.c,
            source: 'cities',
            populationTier: c.t,
          },
          score: matchScore,
        });
      }
    }

    cityScored.sort((a, b) => b.score - a.score);
    const cityMatches = cityScored.slice(0, 16).map((s) => s.item);

    return [...dbMatches, ...cityMatches].slice(0, MAX_RESULTS);
  }, [debouncedQuery, destinations, cities, recentPicks, tripCityNorm, activeTripSummary]);

  const showFallback =
    debouncedQuery.length >= MIN_QUERY_LEN && cities !== null && suggestions.length === 0;
  const isLoading = debouncedQuery.length >= MIN_QUERY_LEN && cities === null;

  return { suggestions, showFallback, isLoading };
}
