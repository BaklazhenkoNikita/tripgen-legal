'use client';

import { type CSSProperties, type HTMLAttributes } from 'react';
import MuiSkeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';

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

export function SkeletonRail({ count = 4, className }: { count?: number; className?: string }) {
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
