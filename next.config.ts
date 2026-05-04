import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

// Root-level legal slugs (mobile-locked + previously-live URLs) that 301 to
// /legal/<slug>. Mobile-locked: privacy, terms, help, affiliate-disclosure,
// ai-disclosure, dsa, delete-account (referenced from mobile app config /
// store metadata). Plus mcp + mcp-upgrade — previously live at periploapp.com
// before the legal-repo restructure, so existing bookmarks need to land.
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

// All HTML pages that existed at the GitHub-Pages-era root and should now
// 301 to their extensionless Next.js equivalent.
const HTML_BOOKMARK_SLUGS = [
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
    const legalRedirects = LEGAL_SLUGS.map((slug) => ({
      source: `/${slug}`,
      destination: `/legal/${slug}`,
      permanent: true,
    }));
    const htmlRedirects = HTML_BOOKMARK_SLUGS.map((slug) => ({
      source: `/${slug}.html`,
      destination: `/legal/${slug}`,
      permanent: true,
    }));
    return [...legalRedirects, ...htmlRedirects];
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
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
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
