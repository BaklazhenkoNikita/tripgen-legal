'use client';

import Box from '@mui/material/Box';
import type { ReactNode } from 'react';

interface Props {
  ariaLabel: string;
  children: ReactNode;
  /** Right-edge mask fade width in px. */
  maskWidth?: number;
  /** Gap between children, in MUI spacing units. */
  gap?: number;
  /** Right padding (peek amount) — controls how much the last card is clipped. */
  peekPadding?: { xs: number; sm: number; lg: number };
  /** Negative right margin to bleed past the parent container's right padding. */
  bleedRight?: { xs: number; sm: number; lg: number };
}

export function HorizontalScrollRow({
  ariaLabel,
  children,
  maskWidth = 24,
  gap = 1.5,
  peekPadding = { xs: 5, sm: 6, lg: 7 },
  bleedRight = { xs: -2, sm: -3, lg: -4 },
}: Props) {
  return (
    <Box
      role="region"
      aria-label={ariaLabel}
      tabIndex={0}
      sx={{
        pl: 0,
        pr: peekPadding,
        pt: 1,
        pb: 1,
        display: 'flex',
        gap,
        overflowX: 'auto',
        overflowY: 'hidden',
        scrollSnapType: 'x mandatory',
        scrollPaddingInlineStart: 0,
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
        '&::-webkit-scrollbar': { display: 'none' },
        outline: 'none',
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: 2,
        },
      }}
    >
      {children}
    </Box>
  );
}
