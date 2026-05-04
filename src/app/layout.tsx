import type { Metadata } from 'next';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import { QueryProvider } from '@/lib/query/provider';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { MuiProvider } from '@/theme/MuiProvider';
import { ToastBridge } from '@/components/ui/ToastBridge';
import { AppContextsRoot } from '@/contexts';
import { ClerkAppearanceProvider } from '@/components/providers/ClerkAppearanceProvider';
import { dmSerifDisplay, plusJakartaSans } from '@/theme/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Periplo — AI Travel Planner',
    template: '%s | Periplo',
  },
  description:
    'Plan your perfect trip with AI. Get personalized day-by-day itineraries, activity recommendations, and real-time collaboration.',
  metadataBase: new URL('https://periploapp.com'),
  openGraph: {
    type: 'website',
    siteName: 'Periplo',
    title: 'Periplo — AI Travel Planner',
    description:
      'Plan your perfect trip with AI. Get personalized day-by-day itineraries, activity recommendations, and real-time collaboration.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSerifDisplay.variable} ${plusJakartaSans.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <InitColorSchemeScript
          attribute="data-tg-color-scheme"
          modeStorageKey="tg-mode"
          colorSchemeStorageKey="tg-color-scheme"
          defaultMode="system"
        />
        <MuiProvider>
          <ClerkAppearanceProvider>
            <ErrorBoundary>
              <QueryProvider>
                <AppContextsRoot>
                  {children}
                  <ToastBridge />
                </AppContextsRoot>
              </QueryProvider>
            </ErrorBoundary>
          </ClerkAppearanceProvider>
        </MuiProvider>
      </body>
    </html>
  );
}
