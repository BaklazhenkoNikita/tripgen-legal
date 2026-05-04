/**
 * Build a Google Maps URL that searches by place name + address rather than
 * raw coordinates. Mirrors the mobile pattern in
 * `trip_gen_mobile/mobile/src/utils/mapsProviders.ts` so the pin lands on the
 * actual venue (coords only disambiguate the region).
 */

interface MapsTarget {
  name?: string | null;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
}

export function getMapsUrl(target: MapsTarget): string | null {
  const { name, address, lat, lng } = target;

  let query: string | null = null;
  if (name && address) query = `${name}, ${address}`;
  else if (name) query = name;
  else if (address) query = address;
  else if (lat != null && lng != null) query = `${lat},${lng}`;

  if (!query) return null;

  const center = lat != null && lng != null ? `&center=${lat},${lng}` : '';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}${center}`;
}
