import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

// Root-level legal slugs (mobile-locked + previously-live URLs) that 301 to
// /legal/<slug>. Mobile-locked: privacy, terms, help, affiliate-disclosure,
// ai-disclosure, dsa, delete-account (referenced from mobile app config /
// store metadata). Plus mcp + mcp-upgrade — previously live at periploapp.com
// before the legal-repo restructure, so existing bookmarks need to land.
//
// The .html bookmark URLs (e.g. /privacy.html) are NOT redirected: the
// static HTMLs in /public are the canonical surface for those URLs (mobile
// app store metadata + external bookmarks expect them to resolve as-is).
// The Next.js /legal/<slug> route is the rich, fully-themed surface for
// in-app navigation.
const LEGAL_SLUGS = [
  'privacy',
  'terms',
  'help',
  'delete-account',
  'dsa',
  'affiliate-disclosure',
  'ai-disclosure',
  'mcp',
  'mcp-upgrade',
] as const;

const nextConfig: NextConfig = {
  // Pin the workspace root so Next.js doesn't walk up to the parent ai_travel
  // repo's lockfile when this app is built standalone.
  outputFileTracingRoot: __dirname,
  async redirects() {
    return LEGAL_SLUGS.map((slug) => ({
      source: `/${slug}`,
      destination: `/legal/${slug}`,
      permanent: true,
    }));
  },
  async rewrites() {
    // Proxy backend API calls — /api/* not matched by a local Next route
    // (e.g. /api/stripe/*) gets forwarded to the trip-planner backend.
    const backend = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';
    return [
      {
        source: '/api/:path*',
        destination: `${backend}/api/:path*`,
      },
    ];
  },
  async headers() {
    // Vercel infers Content-Type from extension; AASA has no extension and
    // assetlinks.json must serve as application/json for iOS / Android to
    // recognize the deep-link manifest. Force it.
    return [
      {
        source: '/.well-known/apple-app-site-association',
        headers: [{ key: 'Content-Type', value: 'application/json' }],
      },
      {
        source: '/.well-known/assetlinks.json',
        headers: [{ key: 'Content-Type', value: 'application/json' }],
      },
    ];
  },
  images: {
    // https-wildcard is deliberate: activity/destination photos come from
    // arbitrary hosts (Google CSE image results, Viator, city sources), so a
    // host allowlist would break content images. Plain-http sources are not
    // proxied — a photo URL that only serves http is dropped upstream.
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  // Next 15 ships with `staleTimes.dynamic = 0`, which discards the client
  // Router Cache for dynamic routes immediately and forces a fresh RSC
  // roundtrip on every back/forward or revisit. Restore the Next 14 defaults
  // so /trip/[id], /chat/[id], /explore/[slug] feel snappy on revisit. Live
  // data still flows through React Query (which has its own invalidation),
  // and the trip RSC payload is shell-only after the Suspense refactor in
  // src/app/(app)/trip/[searchId]/page.tsx.
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
};

// Sentry wrap is a no-op when neither SENTRY_DSN nor SENTRY_AUTH_TOKEN are set;
// the init files at sentry.*.config.ts short-circuit if DSN is absent.
// Sentry build options. `disableLogger` got deprecated in favor of a webpack
// treeshake option whose exact shape varies by @sentry/nextjs version — skip
// it for now and accept a small amount of bundle noise.
const sentryOptions = {
  silent: !process.env.SENTRY_AUTH_TOKEN,
  hideSourceMaps: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
};

export default withSentryConfig(nextConfig, sentryOptions);
