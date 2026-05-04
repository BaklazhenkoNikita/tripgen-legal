/** Storage/lookup key — keep lowercased to preserve backend case-insensitive lookups. */
export function normalizeCity(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s*\/\s*/g, '-');
}

/** Display formatter — title-cases each word (handles spaces and hyphens). */
export function formatPlaceName(raw: string | null | undefined): string {
  if (!raw) return '';
  return raw
    .trim()
    .toLowerCase()
    .split(/(\s+|-)/)
    .map((part) => (part.length > 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join('');
}
