/** Storage/lookup key — keep lowercased to preserve backend case-insensitive lookups. */
export function normalizeCity(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s*\/\s*/g, '-');
}

/**
 * Connector words that stay lowercase mid-name ("Rio de Janeiro",
 * "Aix-en-Provence", "Frankfurt am Main"). Never applied to the first word
 * of a segment, so "La Paz" / "Le Havre" keep their capital.
 */
const LOWER_PARTICLES = new Set([
  'am', 'an', 'and', 'da', 'das', 'de', 'del', 'della', 'der', 'des', 'di', 'do',
  'dos', 'du', 'en', 'im', 'la', 'le', 'les', 'of', 'on', 'sur', 'the', 'upon', 'y',
]);

const SEPARATOR = /^[\s,\-–/]+$/;

/**
 * Display formatter for user-typed place names. Title-cases words that were
 * typed all-lowercase and leaves authored casing alone, so "taipei, Taiwan"
 * → "Taipei, Taiwan" while "USA", "NYC" and "McAllen" survive intact.
 */
export function formatPlaceName(raw: string | null | undefined): string {
  if (!raw) return '';
  let segmentStart = true;
  return raw
    .trim()
    .replace(/\s+/g, ' ')
    .split(/([\s,\-–/]+)/)
    .map((part) => {
      if (part === '' || SEPARATOR.test(part)) {
        if (part.includes(',')) segmentStart = true;
        return part;
      }
      const isFirst = segmentStart;
      segmentStart = false;
      if (part !== part.toLowerCase()) return part;
      if (!isFirst && LOWER_PARTICLES.has(part)) return part;
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join('');
}

export interface DestinationDisplay {
  /** First comma segment, e.g. "Taipei". */
  city: string;
  /** Last comma segment when there is more than one, e.g. "Taiwan". */
  country: string | null;
  /** The whole cased string, e.g. "Taipei, Taiwan". */
  full: string;
}

/** Splits a free-text destination ("taipei, Taiwan") into cased display parts. */
export function displayDestination(raw: string | null | undefined): DestinationDisplay {
  const full = formatPlaceName(raw);
  const segments = full.split(',').map((s) => s.trim()).filter(Boolean);
  if (segments.length <= 1) return { city: full, country: null, full };
  return { city: segments[0], country: segments[segments.length - 1], full };
}
