'use client';

import { type HTMLAttributes, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import { alpha, type Theme } from '@mui/material/styles';

export type BadgeTone =
  | 'neutral'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'exploration'
  | 'activity'
  | 'event'
  | 'restaurant'
  | 'viator';

export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  size?: BadgeSize;
  iconLeft?: ReactNode;
}

// Badge `event` is the legacy alias for the `live_event` palette key — kept
// because callers pass tone="event". Map it through here.
const CATEGORY_TONE_TO_PALETTE = {
  exploration: 'exploration',
  activity: 'activity',
  event: 'live_event',
  restaurant: 'restaurant',
  viator: 'viator',
} as const;

const toneSx = (tone: BadgeTone) => (theme: Theme) => {
  const p = theme.palette;
  switch (tone) {
    case 'neutral': return {
      bgcolor: alpha(p.text.primary, 0.06),
      color: p.text.secondary,
      border: `1px solid ${p.divider}`,
    };
    case 'accent':  return { bgcolor: alpha(p.primary.main, 0.14),   color: p.primary.main };
    case 'success': return { bgcolor: alpha(p.success.main, 0.14),   color: p.success.dark };
    case 'warning': return { bgcolor: alpha(p.warning.main, 0.14),   color: p.warning.dark };
    case 'danger':  return { bgcolor: alpha(p.error.main, 0.14),     color: p.error.dark };
    case 'info':    return { bgcolor: alpha(p.secondary.main, 0.14), color: p.secondary.main };
    case 'exploration':
    case 'activity':
    case 'event':
    case 'restaurant':
    case 'viator': {
      const c = p.category[CATEGORY_TONE_TO_PALETTE[tone]];
      return { bgcolor: alpha(c, 0.18), color: c };
    }
  }
};

const sizeSx = (s: BadgeSize) =>
  s === 'sm'
    ? { px: 1, py: 0.25, fontSize: 10 }
    : { px: 1.25, py: 0.5, fontSize: 11 };

export function Badge({
  tone = 'neutral',
  size = 'sm',
  iconLeft,
  className,
  children,
  style,
  ...rest
}: BadgeProps) {
  return (
    <Box
      component="span"
      className={className}
      style={style}
      sx={[
        {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          borderRadius: 999,
          fontWeight: 500,
          lineHeight: 1,
          whiteSpace: 'nowrap',
        },
        sizeSx(size),
        toneSx(tone) as never,
      ]}
      {...rest}
    >
      {iconLeft ? <Box component="span" sx={{ display: 'inline-flex' }}>{iconLeft}</Box> : null}
      {children}
    </Box>
  );
}
