'use client';

import { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const APPLE_PROVIDER_TOKEN = '125112343';

const stores = [
  {
    href: 'https://apps.apple.com/app/id6761609896',
    icon: '🍎',
    label: 'App Store',
    eyebrow: 'Download on',
    utm: 'ios',
  },
  {
    href: 'https://play.google.com/store/apps/details?id=com.tripgen.app',
    icon: '▶',
    label: 'Google Play',
    eyebrow: 'Get it on',
    utm: 'android',
  },
];

/**
 * Forward the UTM/utm_source params from the MCP host onto the App Store and
 * Play Store deep links so we can attribute installs to the Claude / ChatGPT
 * cohort separately from organic. Mirrors the inline script in the legacy
 * mcp-upgrade.html paywall.
 */
export function McpUpgradeBadges() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const root = containerRef.current;
    if (!root) return;

    const params = new URLSearchParams(window.location.search);
    const source = params.get('utm_source') || 'mcp';
    const medium = params.get('utm_medium') || 'paywall';
    const campaign = params.get('utm_campaign') || 'plan_trip_429';

    root.querySelectorAll<HTMLAnchorElement>('a[data-store-badge]').forEach((a) => {
      try {
        const u = new URL(a.href);
        // App Store accepts pt/ct campaign params; Play Store uses referrer.
        // We send both for simplicity — each store ignores what it doesn't
        // recognize.
        u.searchParams.set('pt', APPLE_PROVIDER_TOKEN);
        u.searchParams.set('ct', `${source}_${medium}_${campaign}`);
        u.searchParams.set(
          'referrer',
          `utm_source=${source}&utm_medium=${medium}&utm_campaign=${campaign}`,
        );
        a.href = u.toString();
      } catch {
        /* leave plain href on parse failure */
      }
    });
  }, []);

  return (
    <Box
      ref={containerRef}
      sx={{
        display: 'flex',
        gap: 2,
        flexWrap: 'wrap',
        mt: 3,
      }}
    >
      {stores.map((store) => (
        <Box
          key={store.label}
          component="a"
          href={store.href}
          data-store-badge
          data-utm={store.utm}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1.5,
            px: 2.5,
            py: 1.5,
            borderRadius: 1.5,
            bgcolor: 'text.primary',
            color: 'background.paper',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: 15,
            minHeight: 56,
            flex: 1,
            minWidth: 220,
            justifyContent: 'center',
            transition: 'transform 120ms ease',
            '&:hover': {
              transform: 'translateY(-1px)',
              color: 'background.paper',
            },
          }}
        >
          <Box
            component="span"
            aria-hidden
            sx={{ fontSize: 22, lineHeight: 1 }}
          >
            {store.icon}
          </Box>
          <Box component="span">
            <Typography
              component="small"
              sx={{
                display: 'block',
                fontSize: 11,
                fontWeight: 500,
                opacity: 0.75,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              {store.eyebrow}
            </Typography>
            {store.label}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
