'use client';

import { type ReactNode } from 'react';
import Box from '@mui/material/Box';
import { Crown } from 'lucide-react';
import { alpha } from '@mui/material/styles';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  children?: ReactNode;
}

const SIZES = {
  sm: { px: 1, py: 0.25, fontSize: 10, iconSize: 10, gap: 0.4 },
  md: { px: 1.25, py: 0.5, fontSize: 11, iconSize: 12, gap: 0.5 },
  lg: { px: 1.75, py: 0.75, fontSize: 13, iconSize: 14, gap: 0.6 },
} as const;

export function ProBadge({ size = 'md', children = 'Pro' }: Props) {
  const s = SIZES[size];
  return (
    <Box
      component="span"
      sx={(t) => ({
        display: 'inline-flex',
        alignItems: 'center',
        gap: s.gap,
        px: s.px,
        py: s.py,
        fontSize: s.fontSize,
        fontWeight: 600,
        lineHeight: 1,
        letterSpacing: '0.02em',
        borderRadius: 999,
        color: t.palette.mode === 'dark' ? t.palette.warning.light : t.palette.warning.dark,
        backgroundImage: `linear-gradient(135deg, ${alpha(t.palette.warning.main, 0.28)}, ${alpha(t.palette.warning.dark, 0.18)})`,
        border: `1px solid ${alpha(t.palette.warning.main, 0.45)}`,
        boxShadow: `0 1px 0 ${alpha(t.palette.common.white, 0.4)} inset, 0 0 0 1px ${alpha(t.palette.warning.main, 0.08)}`,
        whiteSpace: 'nowrap',
      })}
    >
      <Crown size={s.iconSize} aria-hidden style={{ flexShrink: 0 }} />
      {children}
    </Box>
  );
}
