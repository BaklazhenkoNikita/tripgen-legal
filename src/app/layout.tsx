import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Analytics } from '@vercel/analytics/next';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import { QueryProvider } from '@/lib/query/provider';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { MuiProvider } from '@/theme/MuiProvider';
import { ToastBridge } from '@/components/ui/ToastBridge';
import { AppContextsRoot } from '@/contexts';
import { ClerkAppearanceProvider } from '@/components/providers/ClerkAppearanceProvider';
import { dmSerifDisplay, plusJakartaSans } from '@/theme/fonts';
import { organizationJsonLd, websiteJsonLd, stringifyJsonLd } from '@/lib/seo/jsonld';
import './globals.css';

const SITE_DESCRIPTION =
  'Plan your perfect trip with AI. Get personalized day-by-day itineraries, activity recommendations, and real-time collaboration.';

const GOOGLE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F7F7F7' },
    { media: '(prefers-color-scheme: dark)', color: '#0A0807' },
  ],
  colorScheme: 'light dark',
};

export const metadata: Metadata = {
  title: {
    default: 'Periplo — AI Travel Planner',
    template: '%s | Periplo',
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL('https://periploapp.com'),
  applicationName: 'Periplo',
  keywords: [
    'AI travel planner',
    'trip itinerary',
    'travel itinerary generator',
    'city guide',
    'day-by-day trip planner',
    'travel planning AI',
  ],
  authors: [{ name: 'Periplo' }],
  creator: 'Periplo',
  publisher: 'Periplo',
  formatDetection: { email: false, telephone: false, address: false },
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/apple-touch-icon-152x152.png', sizes: '152x152', type: 'image/png' },
    ],
  },
  openGraph: {
    type: 'website',
    siteName: 'Periplo',
    title: 'Periplo — AI Travel Planner',
    description: SITE_DESCRIPTION,
    url: 'https://periploapp.com',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Periplo — AI Travel Planner',
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  alternates: { canonical: '/' },
  ...(GOOGLE_VERIFICATION ? { verification: { google: GOOGLE_VERIFICATION } } : {}),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const orgLd = stringifyJsonLd(organizationJsonLd());
  const siteLd = stringifyJsonLd(websiteJsonLd());

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
        {orgLd && (
          <Script
            id="ld-organization"
            type="application/ld+json"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: orgLd }}
          />
        )}
        {siteLd && (
          <Script
            id="ld-website"
            type="application/ld+json"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: siteLd }}
          />
        )}
        {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
        <Analytics />
      </body>
    </html>
  );
}
