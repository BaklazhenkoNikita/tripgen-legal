'use client';

/**
 * Lightweight Tabs primitive that mirrors the previous Radix-based API.
 *
 * Exports: Tabs (root with value/onValueChange), TabsList, TabsTrigger (value=...),
 * TabsContent (value=...). Uses MUI Tabs internally, with a context to coordinate.
 */

import { createContext, useContext, useId, type ReactNode } from 'react';
import MuiTabs, { tabsClasses } from '@mui/material/Tabs';
import MuiTab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';

interface TabsCtx {
  value: string;
  onValueChange: (v: string) => void;
}
const Ctx = createContext<TabsCtx | null>(null);

export function Tabs({
  value,
  onValueChange,
  defaultValue,
  children,
  className,
}: {
  value?: string;
  onValueChange?: (v: string) => void;
  defaultValue?: string;
  children: ReactNode;
  className?: string;
}) {
  // Note: parent controls value via prop or defaultValue; we expose the same shape.
  const ctxValue: TabsCtx = {
    value: value ?? defaultValue ?? '',
    onValueChange: onValueChange ?? (() => {}),
  };
  return (
    <Ctx.Provider value={ctxValue}>
      <Box className={className}>{children}</Box>
    </Ctx.Provider>
  );
}

export function TabsList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('TabsList must be used inside <Tabs>');
  return (
    <MuiTabs
      value={ctx.value || false}
      onChange={(_, v) => ctx.onValueChange(v as string)}
      variant="scrollable"
      scrollButtons={false}
      className={className}
      sx={{
        minHeight: 36,
        borderRadius: 999,
        border: (t) => `1px solid ${t.palette.divider}`,
        bgcolor: 'background.paper',
        p: 0.5,
        [`& .${tabsClasses.indicator}`]: { display: 'none' },
      }}
    >
      {children}
    </MuiTabs>
  );
}

export function TabsTrigger({
  value,
  children,
  className,
  ...rest
}: {
  value: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <MuiTab
      value={value}
      label={children}
      disableRipple
      className={className}
      sx={{
        minHeight: 28,
        py: 0,
        px: 1.5,
        fontSize: 13,
        fontWeight: 500,
        textTransform: 'none',
        borderRadius: 999,
        color: 'text.secondary',
        '&.Mui-selected': {
          color: 'primary.contrastText',
          bgcolor: 'primary.main',
          boxShadow: (t) =>
            `0 4px 12px ${alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.4 : 0.2)}`,
        },
      }}
      {...rest}
    />
  );
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  const ctx = useContext(Ctx);
  const id = useId();
  if (!ctx) throw new Error('TabsContent must be used inside <Tabs>');
  if (ctx.value !== value) return null;
  return (
    <Box role="tabpanel" id={id} className={className} sx={{ mt: 2, outline: 'none' }}>
      {children}
    </Box>
  );
}
