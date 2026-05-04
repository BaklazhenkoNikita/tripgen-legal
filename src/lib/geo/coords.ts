/**
 * Coordinate normalization.
 *
 * Backend `Activity` / `Restaurant` payloads have historically shipped
 * lat/lng under several different keys depending on the code path that
 * produced them (Mongo cache, LLM synthesis, Viator, Google Places, etc.):
 *
 *   - `latitude` + `longitude`
 *   - `lat` + `lng`
 *   - `lat` + `lon`
 *   - nested `coordinates: { lat, lng }` (or `{ latitude, longitude }`)
 *
 * Every renderer that consumes coordinates has to tolerate all of these.
 * Mobile centralizes this in `useActivityMap` (and siblings); web used to
 * do it ad-hoc per component. Centralize here so the home map, trip map,
 * activity detail drawer, and any future surface share one normalizer.
 */

export interface LatLng {
  lat: number;
  lng: number;
}

/** Loose shape — accept any object with any combination of the known keys. */
export interface CoordsBearing {
  latitude?: number | null;
  longitude?: number | null;
  lat?: number | null;
  lng?: number | null;
  lon?: number | null;
  coordinates?: {
    lat?: number | null;
    lng?: number | null;
    latitude?: number | null;
    longitude?: number | null;
    lon?: number | null;
  } | null;
}

function validLat(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n) && n >= -90 && n <= 90;
}

function validLng(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n) && n >= -180 && n <= 180;
}

/** Returns `{lat, lng}` if a usable pair can be extracted, otherwise null. */
export function getLatLng(source: CoordsBearing | null | undefined): LatLng | null {
  if (!source) return null;

  const latCandidates = [
    source.latitude,
    source.lat,
    source.coordinates?.latitude,
    source.coordinates?.lat,
  ];
  const lngCandidates = [
    source.longitude,
    source.lng,
    source.lon,
    source.coordinates?.longitude,
    source.coordinates?.lng,
    source.coordinates?.lon,
  ];

  const lat = latCandidates.find(validLat);
  const lng = lngCandidates.find(validLng);

  if (lat === undefined || lng === undefined) return null;
  return { lat, lng };
}

/** Filter a list to items that have valid coordinates, returning the pair inline. */
export function collectLatLng<T extends CoordsBearing>(
  items: readonly T[] | null | undefined,
): Array<{ item: T; latLng: LatLng }> {
  if (!items) return [];
  const out: Array<{ item: T; latLng: LatLng }> = [];
  for (const item of items) {
    const latLng = getLatLng(item);
    if (latLng) out.push({ item, latLng });
  }
  return out;
}

/** Bounding box of a list of items with coordinates (null if none have any). */
export function boundingBox(
  items: Array<CoordsBearing | null | undefined>,
): { north: number; south: number; east: number; west: number } | null {
  let north = -Infinity;
  let south = Infinity;
  let east = -Infinity;
  let west = Infinity;
  let any = false;
  for (const it of items) {
    const c = getLatLng(it);
    if (!c) continue;
    any = true;
    if (c.lat > north) north = c.lat;
    if (c.lat < south) south = c.lat;
    if (c.lng > east) east = c.lng;
    if (c.lng < west) west = c.lng;
  }
  return any ? { north, south, east, west } : null;
}
