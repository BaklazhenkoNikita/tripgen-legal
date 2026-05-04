'use client';

import { Toaster } from 'sonner';
import { useColorScheme, useTheme } from '@mui/material/styles';
import { tgShadow } from '@/theme/shadows';

/** Mounts sonner's Toaster, themed against MUI palette. Single instance for the app. */
export function ToastBridge() {
  const { mode, systemMode } = useColorScheme();
  const theme = useTheme();
  const resolved = (mode === 'system' ? systemMode : mode) ?? 'light';
  return (
    <Toaster
      theme={resolved}
      position="bottom-right"
      richColors
      closeButton
      offset={20}
      toastOptions={{
        style: {
          background: theme.palette.background.paper,
          color: theme.palette.text.primary,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 8,
          boxShadow: tgShadow(theme, 'toast'),
          fontFamily: theme.typography.fontFamily,
        },
        className: 'tg-toast',
      }}
    />
  );
}
