/**
 * Route / transit colours for the map and travel-information UI. These are
 * the source of truth for the `--tg-route-*` CSS variables emitted from
 * `src/theme/index.ts` (MuiCssBaseline) and for the `palette.route` group.
 *
 * Kept as explicit hex (like `categoryColors.ts` / `dayColors.ts`) because the
 * map renders SVG/DOM outside the React tree where CSS vars don't cascade onto
 * strokes/fills, and route lines / transit labels need a concrete colour.
 *
 * This is a distinct transit BLUE — deliberately separate from the terracotta
 * primary, teal secondary, and the orange `info`/highlight accent — so that
 * "how you move between places" (routes, travel time, directions) reads as its
 * own information channel. Day-coloured route polylines still exist for
 * per-day grouping; this blue is for travel-effort / transit affordances
 * (travel-time-to-next chips, transit labels, directions).
 */

export const ROUTE_COLORS = {
  /** Primary transit blue — route/travel accents on light surfaces. */
  main: '#2F6FB0',
  /** Softer blue for label backgrounds / secondary transit UI. */
  muted: '#5B8FC4',
} as const;

/** Brightened variants for dark map styles (mirrors CATEGORY_COLORS_DARK). */
export const ROUTE_COLORS_DARK = {
  main: '#6BA6E0',
  muted: '#8FBEEA',
} as const;

export function routeColor(
  variant: keyof typeof ROUTE_COLORS = 'main',
  theme: 'light' | 'dark' = 'light',
): string {
  return theme === 'dark' ? ROUTE_COLORS_DARK[variant] : ROUTE_COLORS[variant];
}
