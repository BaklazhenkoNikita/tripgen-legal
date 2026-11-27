'use client';

import { type CSSProperties, type HTMLAttributes } from 'react';
import MuiSkeleton from '@mui/material/Skeleton';
import { alpha, type Theme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { FITTED_COLUMNS, FITTED_GAP } from './HorizontalScrollRow';

/**
 * Shared pulse style for route-level loading.tsx skeletons that mirror page
 * layout with plain Boxes (uses the global `tgSkeletonPulse` keyframes).
 */
export const skeletonPulseSx = (opacity = 0.06, delayMs = 0) => ({
  bgcolor: (t: Theme) => alpha(t.palette.text.primary, opacity),
  animation: 'tgSkeletonPulse 1.6s ease-in-out infinite',
  ...(delayMs ? { animationDelay: `${delayMs}ms` } : null),
});

export type SkeletonVariant = 'line' | 'block' | 'card' | 'circle';

export interface SkeletonProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
}

const variantSpec: Record<SkeletonVariant, { variant: 'rectangular' | 'rounded' | 'circular' | 'text'; sx: CSSProperties & Record<string, unknown> }> = {
  line:   { variant: 'text',        sx: { height: 12, width: '75%', borderRadius: 999 } },
  block:  { variant: 'rounded',     sx: { height: 96, width: '100%', borderRadius: 8 } },
  card:   { variant: 'rounded',     sx: { height: 192, width: '100%', borderRadius: 12 } },
  circle: { variant: 'circular',    sx: { height: 40, width: 40 } },
};

export function Skeleton({
  variant = 'line',
  width,
  height,
  className,
  style,
  ...rest
}: SkeletonProps) {
  const spec = variantSpec[variant];
  return (
    <MuiSkeleton
      aria-hidden
      animation="wave"
      variant={spec.variant}
      className={className}
      style={style}
      sx={{
        ...spec.sx,
        ...(width ? { width } : null),
        ...(height ? { height } : null),
      }}
      {...rest}
    />
  );
}

export function SkeletonRail({
  count = 4,
  className,
  fitted = false,
}: {
  count?: number;
  className?: string;
  /** Match a `fitted` HorizontalScrollRow: container-sized 3:2 cards. */
  fitted?: boolean;
}) {
  if (fitted) {
    return (
      <Box
        className={className}
        sx={{
          display: 'grid',
          gridAutoFlow: 'column',
          gridAutoColumns: FITTED_COLUMNS,
          gap: FITTED_GAP,
          overflow: 'hidden',
          py: 1,
        }}
      >
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton
            key={i}
            variant="card"
            style={{ width: '100%', aspectRatio: '3 / 2', animationDelay: `${i * 0.08}s` }}
          />
        ))}
      </Box>
    );
  }
  return (
    <Box className={className} sx={{ display: 'flex', gap: 1.5, overflow: 'hidden' }}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          variant="card"
          width={288}
          height={224}
          style={{ flexShrink: 0, animationDelay: `${i * 0.08}s` }}
        />
      ))}
    </Box>
  );
}
