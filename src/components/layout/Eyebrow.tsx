'use client';

// Client component: its sx uses a theme callback (dark-mode colour), which
// can't be serialized from server-rendered pages (footer, guides, blog).
import type { ElementType, ReactNode } from 'react';
import type { SxProps, Theme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { textScale } from '@/theme/standards';

export interface EyebrowProps {
  children: ReactNode;
  /** Optional leading icon (a lucide component). Rendered at 14px. */
  icon?: ElementType;
  /**
   * `brand` — terracotta (`primary.dark`, 6.2:1 on white): section eyebrows.
   * `neutral` — `text.secondary`: group labels (month headers, menus).
   * `inverse` — white over photos (hero eyebrows), with a legibility shadow.
   */
  tone?: 'brand' | 'neutral' | 'inverse';
  component?: ElementType;
  sx?: SxProps<Theme>;
}

/**
 * The one small-caps label that sits above a heading. Replaces the per-page
 * variants (11/12px, 0.04–0.2em tracking, orange/disabled/primary colors).
 */
export function Eyebrow({ children, icon: Icon, tone = 'brand', component = 'p', sx }: EyebrowProps) {
  return (
    <Box
      component={component}
      sx={[
        {
          ...textScale.meta,
          m: 0,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.75,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color:
            tone === 'brand' ? 'primary.dark' : tone === 'inverse' ? 'rgba(255,255,255,0.88)' : 'text.secondary',
          ...(tone === 'inverse' ? { textShadow: '0 1px 4px rgba(0,0,0,0.45)' } : null),
        },
        // primary.dark is too dim on the dark background; main reads ~5.5:1.
        (t: Theme) => (tone === 'brand' ? t.applyStyles('dark', { color: t.palette.primary.main }) : {}),
        ...(Array.isArray(sx) ? sx : [sx]),
      ] as SxProps<Theme>}
    >
      {Icon ? <Box component={Icon} aria-hidden sx={{ width: 14, height: 14, flexShrink: 0 }} /> : null}
      {children}
    </Box>
  );
}
