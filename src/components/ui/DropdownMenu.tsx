'use client';

/**
 * Lightweight Dropdown primitive that mirrors the previous Radix API
 * (DropdownMenu/DropdownTrigger/DropdownContent/DropdownItem/DropdownLabel/DropdownSeparator/DropdownGroup).
 *
 * Implementation: an internal context drives an MUI Menu anchored to the trigger element.
 */

import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useRef,
  useState,
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
  type ReactElement,
} from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { tgShadow } from '@/theme/shadows';

interface Ctx {
  anchor: HTMLElement | null;
  setAnchor: (el: HTMLElement | null) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
}
const DropCtx = createContext<Ctx | null>(null);

export function DropdownMenu({ children }: { children: ReactNode }) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  return (
    <DropCtx.Provider value={{ anchor, setAnchor, open, setOpen }}>
      {children}
    </DropCtx.Provider>
  );
}

export function DropdownTrigger({
  children,
  asChild,
}: {
  children: ReactNode;
  asChild?: boolean;
}) {
  const ctx = useContext(DropCtx);
  if (!ctx) throw new Error('DropdownTrigger must be used inside <DropdownMenu>');
  const handleClick = (e: MouseEvent<HTMLElement>) => {
    ctx.setAnchor(e.currentTarget);
    ctx.setOpen(true);
  };

  if (asChild && Children.count(children) === 1 && isValidElement(children)) {
    const child = children as ReactElement<{ onClick?: (e: MouseEvent<HTMLElement>) => void }>;
    return cloneElement(child, {
      onClick: (e: MouseEvent<HTMLElement>) => {
        child.props.onClick?.(e);
        handleClick(e);
      },
    });
  }
  return (
    <Box component="button" type="button" onClick={handleClick}>
      {children}
    </Box>
  );
}

interface ContentExtraProps {
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
}

export function DropdownContent({
  align = 'end',
  sideOffset = 6,
  children,
  className,
}: ContentExtraProps & { children: ReactNode; className?: string }) {
  const ctx = useContext(DropCtx);
  if (!ctx) throw new Error('DropdownContent must be used inside <DropdownMenu>');
  const horizontal = align === 'start' ? 'left' : align === 'end' ? 'right' : 'center';
  return (
    <Menu
      anchorEl={ctx.anchor}
      open={ctx.open}
      onClose={() => ctx.setOpen(false)}
      anchorOrigin={{ vertical: 'bottom', horizontal }}
      transformOrigin={{ vertical: -sideOffset, horizontal }}
      className={className}
      slotProps={{
        paper: {
          sx: {
            mt: `${sideOffset}px`,
            minWidth: 176,
            borderRadius: 1.5,
            border: (t) => `1px solid ${t.palette.divider}`,
            boxShadow: (t) => tgShadow(t, 'dropdown'),
            p: 0.5,
          },
        },
      }}
    >
      {children}
    </Menu>
  );
}

export function DropdownItem({
  onSelect,
  onClick,
  children,
  className,
  disabled,
  ...rest
}: ComponentProps<typeof MenuItem> & { onSelect?: (e: Event) => void }) {
  const ctx = useContext(DropCtx);
  return (
    <MenuItem
      disabled={disabled}
      className={className}
      onClick={(e) => {
        onClick?.(e as never);
        onSelect?.(e.nativeEvent);
        ctx?.setOpen(false);
      }}
      sx={{
        borderRadius: 1,
        fontSize: 14,
        py: 1,
        px: 1.5,
        gap: 1,
        '&:hover': { bgcolor: 'action.hover' },
      }}
      {...rest}
    >
      {children}
    </MenuItem>
  );
}

export function DropdownLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Typography
      className={className}
      sx={{
        px: 1.5,
        py: 0.75,
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'text.disabled',
      }}
    >
      {children}
    </Typography>
  );
}

export function DropdownSeparator({ className }: { className?: string }) {
  return <Divider className={className} sx={{ my: 0.5 }} />;
}

export function DropdownGroup({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
