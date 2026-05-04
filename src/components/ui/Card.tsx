'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import { alpha, type Theme } from '@mui/material/styles';
import { tgShadow } from '@/theme/shadows';

type CardElevation = 'flat' | 'raised' | 'floating';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevation?: CardElevation;
  interactive?: boolean;
  as?: 'div' | 'article' | 'section';
}

const elevationSx = (e: CardElevation) => (theme: Theme) => {
  switch (e) {
    case 'flat':
      return {
        bgcolor: 'background.paper',
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: 'none',
      };
    case 'raised':
      return {
        bgcolor: 'background.paper',
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: tgShadow(theme, 'card'),
      };
    case 'floating':
      return {
        bgcolor: 'background.paper',
        boxShadow: tgShadow(theme, 'cardHover'),
      };
  }
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { elevation = 'flat', interactive, as = 'div', className, children, style, ...rest },
  ref,
) {
  return (
    <Box
      ref={ref}
      component={as}
      className={className}
      style={style}
      sx={[
        {
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 1, // 8px via theme.shape.borderRadius
          textAlign: 'left',
          transition: 'all 0.2s ease',
        },
        elevationSx(elevation),
        ...(interactive
          ? [
              {
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: (t: Theme) =>
                    `0 6px 20px ${alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.28 : 0.16)}`,
                  borderColor: (t: Theme) => alpha(t.palette.primary.main, 0.32),
                  transform: 'translateY(-1px)',
                },
              },
            ]
          : []),
      ]}
      {...rest}
    >
      {children}
    </Box>
  );
});

interface SlotProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export function CardMedia({
  className,
  aspect = '16/10',
  style,
  ...rest
}: SlotProps & { aspect?: '16/9' | '16/10' | '4/3' | '3/2' | '1/1' }) {
  return (
    <Box
      className={className}
      style={{ aspectRatio: aspect, ...style }}
      sx={{ position: 'relative', width: '100%', overflow: 'hidden', bgcolor: 'action.hover' }}
      {...rest}
    />
  );
}

export function CardBody({ className, style, ...rest }: SlotProps) {
  return (
    <Box
      className={className}
      style={style}
      sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, p: 2 }}
      {...rest}
    />
  );
}

export function CardTitle({ className, style, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <Box
      component="h3"
      className={className}
      style={style}
      sx={{
        m: 0,
        fontSize: 16,
        fontWeight: 600,
        lineHeight: 1.3,
        color: 'text.primary',
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: 2,
        overflow: 'hidden',
      }}
      {...rest}
    />
  );
}

export function CardSubtitle({ className, style, ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <Box
      component="p"
      className={className}
      style={style}
      sx={{
        m: 0,
        fontSize: 13,
        color: 'text.secondary',
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: 2,
        overflow: 'hidden',
      }}
      {...rest}
    />
  );
}

export function CardMeta({ className, style, ...rest }: SlotProps) {
  return (
    <Box
      className={className}
      style={style}
      sx={{
        mt: 'auto',
        pt: 0.5,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 0.75,
        fontSize: 12,
        color: 'text.secondary',
      }}
      {...rest}
    />
  );
}

export function CardActions({ className, style, ...rest }: SlotProps) {
  return (
    <Box
      className={className}
      style={style}
      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
      {...rest}
    />
  );
}
