/**
 * Lazy GeoNames city index. The 1.8 MB cities.json ships as a separate JS chunk
 * via dynamic import() — fetched only when the city switcher is opened for the
 * first time. Subsequent calls reuse the same indexed array.
 */

export interface CityEntry {
  /** Display name (e.g. "Antalya") */
  n: string;
  /** Country name (e.g. "Turkey") */
  c: string;
  /** Population tier 1–7 */
  t: number;
  /** Latitude */
  a: number;
  /** Longitude */
  o: number;
  /** Pre-computed lowercase, accent-stripped name */
  nLower: string;
}

interface RawCityEntry {
  n: string;
  c: string;
  t: number;
  a: number;
  o: number;
}

export function stripAccents(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

let citiesPromise: Promise<CityEntry[]> | null = null;

export function loadCities(): Promise<CityEntry[]> {
  if (!citiesPromise) {
    citiesPromise = import('@/data/cities.json').then((mod) => {
      const raw = (mod.default ?? mod) as RawCityEntry[];
      return raw.map((c) => ({ ...c, nLower: stripAccents(c.n).toLowerCase() }));
    });
  }
  return citiesPromise;
}
