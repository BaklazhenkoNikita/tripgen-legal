'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { useColorScheme } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { lightAppearance, darkAppearance } from '@/lib/clerk-appearance';

/** Wraps ClerkProvider with the light/dark appearance that matches the
 *  current MUI color scheme. Reads useColorScheme — must be inside MuiProvider. */
export function ClerkAppearanceProvider({ children }: { children: ReactNode }) {
  const { mode, systemMode } = useColorScheme();
  const resolved = (mode === 'system' ? systemMode : mode) ?? 'light';
  const appearance = resolved === 'dark' ? darkAppearance : lightAppearance;

  return (
    <ClerkProvider dynamic appearance={appearance}>
      {children}
    </ClerkProvider>
  );
}
