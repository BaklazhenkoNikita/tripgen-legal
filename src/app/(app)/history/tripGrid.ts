import type { SxProps, Theme } from '@mui/material/styles';

/** Shared by the page and its loading skeleton so nothing jumps on load. */
export const TRIP_GRID_SX: SxProps<Theme> = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
  gap: 3,
  listStyle: 'none',
  p: 0,
  m: 0,
};

export const HISTORY_PAGE_PY = { xs: 4, md: 6 } as const;
