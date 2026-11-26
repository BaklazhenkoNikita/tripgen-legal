/** Storage/lookup key — keep lowercased to preserve backend case-insensitive lookups. */
export function normalizeCity(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s*\/\s*/g, '-');
}

// Joining words that stay lowercase mid-name ("Rio de Janeiro",
// "Frankfurt am Main", "Stoke-on-Trent", "Newcastle upon Tyne"). The first
// word is always capitalised ("La Paz", "Den Haag", "Los Angeles").
const LOWERCASE_PARTICLES = new Set([
  'am',
  'da',
  'das',
  'de',
  'del',
  'della',
  'der',
  'des',
  'di',
  'do',
  'dos',
  'du',
  'en',
  'la',
  'le',
  'les',
  'of',
  'on',
  'sur',
  'upon',
]);

const HAS_UPPERCASE = /\p{Lu}/u;

/**
 * Display formatter for city / place names typed by users or stored as
 * lowercase lookup keys ("taipei" → "Taipei", "rio de janeiro" →
 * "Rio de Janeiro", "zürich" → "Zürich").
 *
 * Only rewrites input with NO uppercase letters — anything already cased
 * ("McLaren Vale", "Xi'an", "NYC") is trusted and returned as-is (trimmed,
 * whitespace collapsed), so curated names are never mangled.
 */
export function displayPlaceName(raw: string | null | undefined): string {
  if (!raw) return '';
  const cleaned = raw.trim().replace(/\s+/g, ' ');
  if (!cleaned || HAS_UPPERCASE.test(cleaned)) return cleaned;
  let wordIndex = 0;
  return cleaned
    .split(/(\s+|-)/)
    .map((part) => {
      if (part === ' ' || part === '-' || part.length === 0) return part;
      const isFirst = wordIndex === 0;
      wordIndex += 1;
      if (!isFirst && LOWERCASE_PARTICLES.has(part)) return part;
      return part.charAt(0).toLocaleUpperCase() + part.slice(1);
    })
    .join('');
}

/** @deprecated alias — use `displayPlaceName`. Kept for existing imports. */
export const formatPlaceName = displayPlaceName;
