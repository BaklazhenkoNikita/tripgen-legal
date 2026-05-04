/**
 * SVG glyphs for category pins. Returned as raw SVG markup so they can be
 * inlined into Leaflet `divIcon` HTML (which lives outside the React tree).
 * Paths are taken from lucide and rendered in a 24×24 viewBox; the parent
 * .tg-pin__glyph element scales them down via CSS.
 */

const SVG_OPEN =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
const SVG_CLOSE = '</svg>';

const GLYPHS: Record<string, string> = {
  // lucide: MapPin
  default:
    '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  // lucide: Utensils
  restaurant:
    '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
  // lucide: CalendarDays
  live_event:
    '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/>',
  // lucide: Compass
  exploration:
    '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
  // lucide: Mountain
  activity:
    '<path d="M8 3 4 15a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1L16 3a1 1 0 0 0-2 0l-3 9-3-9a1 1 0 0 0-2 0"/>',
  // lucide: Ticket
  viator:
    '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>',
};

export function glyphForEntity(entityType: string | undefined): string {
  const key = entityType && GLYPHS[entityType] ? entityType : 'default';
  return SVG_OPEN + GLYPHS[key] + SVG_CLOSE;
}
