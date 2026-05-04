'use client';

import {
  Children,
  forwardRef,
  isValidElement,
  type ButtonHTMLAttributes,
  type ElementType,
  type ReactElement,
  type ReactNode,
} from 'react';
import MuiButton from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import { alpha } from '@mui/material/styles';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'outline'
  | 'destructive'
  | 'subtle';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
  /** Render as the immediate child (e.g. <Link>). Implemented via MUI's `component` prop. */
  asChild?: boolean;
  className?: string;
}

const muiVariantFor = (
  v: ButtonVariant,
): { variant: 'contained' | 'outlined' | 'text'; color: 'primary' | 'secondary' | 'error' | 'inherit' } => {
  switch (v) {
    case 'primary':     return { variant: 'contained', color: 'primary' };
    case 'secondary':   return { variant: 'outlined',  color: 'inherit' };
    case 'outline':     return { variant: 'outlined',  color: 'inherit' };
    case 'ghost':       return { variant: 'text',      color: 'inherit' };
    case 'destructive': return { variant: 'contained', color: 'error' };
    case 'subtle':      return { variant: 'text',      color: 'primary' };
  }
};

const sizeStyle = (s: ButtonSize) => {
  switch (s) {
    case 'xs':       return { height: 28, fontSize: 12, px: 1.25 };
    case 'sm':       return { height: 32, fontSize: 13, px: 1.5 };
    case 'md':       return { height: 40, fontSize: 14, px: 2 };
    case 'lg':       return { height: 48, fontSize: 15, px: 2.5 };
    case 'icon':     return { height: 40, width: 40, minWidth: 40, p: 0 };
    case 'icon-sm':  return { height: 32, width: 32, minWidth: 32, p: 0 };
  }
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled,
    iconLeft,
    iconRight,
    fullWidth,
    asChild = false,
    className,
    children,
    type,
    ...rest
  },
  ref,
) {
  // When `asChild` is true, lift the single child's element type and props onto
  // MUI's polymorphic `component` prop so the rendered DOM is one element
  // (e.g. an <a> styled as a button) instead of <button><a/></button>.
  const slot =
    asChild && Children.count(children) === 1 && isValidElement(children)
      ? (children as ReactElement<Record<string, unknown>>)
      : null;

  const isIcon = size === 'icon' || size === 'icon-sm';
  if (isIcon && !asChild) {
    return (
      <IconButton
        ref={ref as never}
        type={type ?? 'button'}
        disabled={disabled || loading}
        className={className}
        sx={sizeStyle(size)}
        {...(rest as Record<string, unknown>)}
      >
        {loading ? <CircularProgress size={16} thickness={4} /> : iconLeft ?? children ?? iconRight}
      </IconButton>
    );
  }

  if (isIcon && slot) {
    return (
      <IconButton
        ref={ref as never}
        component={slot.type as ElementType}
        disabled={disabled || loading}
        className={className}
        sx={sizeStyle(size)}
        {...(slot.props as Record<string, unknown>)}
        {...(rest as Record<string, unknown>)}
      >
        {loading
          ? <CircularProgress size={16} thickness={4} />
          : iconLeft ?? (slot.props as { children?: ReactNode }).children ?? iconRight}
      </IconButton>
    );
  }

  const muiV = muiVariantFor(variant);
  const baseSx: Record<string, unknown> = {
    ...sizeStyle(size),
    ...(fullWidth ? { width: '100%' } : {}),
    borderRadius: 999,
    textTransform: 'none' as const,
    gap: 1,
  };
  if (variant === 'subtle') {
    baseSx.bgcolor = (t: import('@mui/material/styles').Theme) => alpha(t.palette.primary.main, 0.12);
    baseSx.color = 'primary.main';
    baseSx['&:hover'] = {
      bgcolor: (t: import('@mui/material/styles').Theme) => alpha(t.palette.primary.main, 0.18),
    };
  }
  if (variant === 'secondary') {
    baseSx.bgcolor = 'background.paper';
    baseSx.borderColor = 'divider';
    baseSx.color = 'text.primary';
    baseSx['&:hover'] = { bgcolor: 'action.hover', borderColor: 'text.disabled' };
  }

  if (slot) {
    const slotProps = slot.props as { children?: ReactNode } & Record<string, unknown>;
    return (
      <MuiButton
        ref={ref as never}
        component={slot.type as ElementType}
        variant={muiV.variant}
        color={muiV.color}
        disabled={disabled || loading}
        className={className}
        sx={baseSx}
        startIcon={loading ? <CircularProgress size={14} thickness={4} color="inherit" /> : iconLeft}
        endIcon={!loading ? iconRight : undefined}
        {...slotProps}
        {...(rest as Record<string, unknown>)}
      >
        {slotProps.children}
      </MuiButton>
    );
  }

  return (
    <MuiButton
      ref={ref as never}
      variant={muiV.variant}
      color={muiV.color}
      type={type ?? 'button'}
      disabled={disabled || loading}
      className={className}
      sx={baseSx}
      startIcon={loading ? <CircularProgress size={14} thickness={4} color="inherit" /> : iconLeft}
      endIcon={!loading ? iconRight : undefined}
      {...(rest as Record<string, unknown>)}
    >
      {children}
    </MuiButton>
  );
});
