/**
 * Pin colours for the map. These are the source of truth for the
 * `--tg-cat-*` CSS variables emitted from `src/theme/index.ts`
 * (MuiCssBaseline) so badges and pins share one palette. The map renders
 * SVG outside the React tree where CSS vars don't cascade onto
 * strokes/fills, so we keep an explicit hex map here too.
 */

export const CATEGORY_COLORS: Record<string, string> = {
  exploration: '#7B6BA0',
  activity: '#5B7B5E',
  live_event: '#C07850',
  restaurant: '#D4943A',
  viator: '#5A9EB0',
};

export const CATEGORY_COLORS_DARK: Record<string, string> = {
  exploration: '#a99fcd',
  activity: '#84a888',
  live_event: '#e09a72',
  restaurant: '#ecb461',
  viator: '#88c5d6',
};

export const DEFAULT_PIN_COLOR = '#6B7280';
export const DEFAULT_PIN_COLOR_DARK = '#9aa1ad';

export function colorForEntity(entityType: string | undefined, theme: 'light' | 'dark' = 'light'): string {
  const palette = theme === 'dark' ? CATEGORY_COLORS_DARK : CATEGORY_COLORS;
  const fallback = theme === 'dark' ? DEFAULT_PIN_COLOR_DARK : DEFAULT_PIN_COLOR;
  if (!entityType) return fallback;
  return palette[entityType] ?? fallback;
}

export const CATEGORY_LABELS: Record<string, string> = {
  exploration: 'Exploration',
  activity: 'Activities',
  live_event: 'Events',
  restaurant: 'Food',
  viator: 'Tours',
};
