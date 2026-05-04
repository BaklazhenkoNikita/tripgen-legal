export const DAY_COLORS = [
  '#C4603A',
  '#00A699',
  '#FF9500',
  '#484848',
  '#9A4A2D',
  '#2ACEBA',
  '#717171',
  '#D88564',
  '#9C27B0',
  '#FFB347',
] as const;

export function colorForDay(dayIndex: number): string {
  const len = DAY_COLORS.length;
  return DAY_COLORS[((dayIndex % len) + len) % len];
}
