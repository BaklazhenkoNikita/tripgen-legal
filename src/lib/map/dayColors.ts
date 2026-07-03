/**
 * Day-route colours for map polylines and day pins. Like
 * `categoryColors.ts`, these stay explicit hex because MapLibre consumes
 * them outside the React tree where CSS vars don't cascade. Brand-adjacent
 * hues intentionally match the theme palette (`src/theme/index.ts`):
 * terracotta primary/dark/light, teal secondary, orange highlight, muted.
 */
export const DAY_COLORS = [
  '#C4603A', // primary
  '#00A699', // secondary
  '#FF9500', // highlight
  '#484848',
  '#9A4A2D', // primary.dark
  '#2ACEBA', // secondary.light
  '#717171', // text muted
  '#D88564', // primary.light
  '#9C27B0',
  '#FFB347',
] as const;

/** Brightened variants for dark map styles (mirrors CATEGORY_COLORS_DARK). */
export const DAY_COLORS_DARK = [
  '#D4724A', // dark primary
  '#2ACEBA', // dark secondary
  '#FFA733',
  '#8F8A84',
  '#B86A47',
  '#5FDCCB',
  '#B0A090', // dark muted
  '#E29B79',
  '#BA68C8',
  '#FFC469',
] as const;

export function colorForDay(dayIndex: number, theme: 'light' | 'dark' = 'light'): string {
  const palette = theme === 'dark' ? DAY_COLORS_DARK : DAY_COLORS;
  const len = palette.length;
  return palette[((dayIndex % len) + len) % len];
}
