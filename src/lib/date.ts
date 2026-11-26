/** Returns `today + offsetDays` formatted as YYYY-MM-DD in the user's local timezone. */
export function isoDateOffset(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const tzOffsetMs = d.getTimezoneOffset() * 60 * 1000;
  return new Date(d.getTime() - tzOffsetMs).toISOString().split('T')[0];
}

// Fixed locale: these strings render on the server and the client, and the
// rest of the UI copy is English.
const LOCALE = 'en-US';

/**
 * Parses the date part of an ISO string ("2026-12-28" or
 * "2026-12-28T00:00:00Z") as a LOCAL calendar date. `new Date('2026-12-28')`
 * is parsed as UTC midnight and shows the previous day west of UTC.
 */
export function parseIsoDateLocal(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "2026-12-28" → "Mon, Dec 28". Falls back to the input when unparseable. */
export function formatDayDate(iso: string | null | undefined): string {
  const d = parseIsoDateLocal(iso);
  if (!d) return iso ?? '';
  return d.toLocaleDateString(LOCALE, { weekday: 'short', month: 'short', day: 'numeric' });
}

/**
 * Compact trip date range:
 * same month "Dec 28–31", cross-month "Nov 28 – Dec 2",
 * cross-year "Dec 30, 2026 – Jan 2, 2027", single day "Dec 28".
 */
export function formatDateRange(
  start: string | null | undefined,
  end: string | null | undefined,
): string | null {
  const a = parseIsoDateLocal(start);
  const b = parseIsoDateLocal(end);
  if (!a && !b) return null;
  const md = (d: Date) => d.toLocaleDateString(LOCALE, { month: 'short', day: 'numeric' });
  if (!a || !b) return md((a ?? b) as Date);
  if (a.getTime() === b.getTime()) return md(a);
  if (a.getFullYear() !== b.getFullYear()) {
    const mdy = (d: Date) =>
      d.toLocaleDateString(LOCALE, { month: 'short', day: 'numeric', year: 'numeric' });
    return `${mdy(a)} – ${mdy(b)}`;
  }
  if (a.getMonth() === b.getMonth()) return `${md(a)}–${b.getDate()}`;
  return `${md(a)} – ${md(b)}`;
}

/** Inclusive day count between two ISO dates ("Dec 28" → "Dec 31" = 4). */
export function tripDayCount(
  start: string | null | undefined,
  end: string | null | undefined,
): number | null {
  const a = parseIsoDateLocal(start);
  const b = parseIsoDateLocal(end);
  if (!a || !b) return null;
  const days = Math.round((b.getTime() - a.getTime()) / 86_400_000) + 1;
  return days > 0 ? days : null;
}
