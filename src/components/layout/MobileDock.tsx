'use client';

import Link, { useLinkStatus } from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { SignedIn } from '@clerk/nextjs';
import { Compass, Sparkles, Map as MapIcon, type LucideIcon } from 'lucide-react';
import { memo, useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { alpha } from '@mui/material/styles';
import { useActiveTripOptional } from '@/contexts';

interface DockItem {
  href: string;
  match: string;
  label: string;
  icon: LucideIcon;
  suppressHydration?: boolean;
}

/** Bottom dock — visible on mobile only when signed in. */
export function MobileDock() {
  const pathname = usePathname() ?? '/';
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const activeTripId = useActiveTripOptional()?.activeTripId ?? null;

  // Mirror Navigation: link Plan directly to /trip/{id} when we know the
  // active trip so we skip the index-page redirect hop.
  const items = useMemo<readonly DockItem[]>(
    () => [
      { href: '/discover', match: '/discover', label: 'Discover', icon: Compass },
      {
        href: activeTripId ? `/trip/${activeTripId}` : '/trip',
        match: '/trip',
        label: 'Plan',
        icon: Sparkles,
        suppressHydration: true,
      },
      { href: '/history', match: '/history', label: 'Trips', icon: MapIcon },
    ],
    [activeTripId],
  );

  // Clear the optimistic pending state once the route catches up. Mirrors the
  // pattern in Navigation.tsx — the active styling holds the tapped item from
  // the click frame through the in-flight nav until pathname reflects it.
  useEffect(() => {
    if (pendingHref && pathname.startsWith(pendingHref.split('?')[0])) {
      setPendingHref(null);
    }
  }, [pathname, pendingHref]);

  // Eagerly warm the router cache on mount — same rationale as Navigation:
  // viewport-intersection prefetch is too late for the first tap.
  useEffect(() => {
    for (const item of items) router.prefetch(item.href);
  }, [router, items]);

  return (
    <SignedIn>
      <Box
        component="nav"
        aria-label="Primary"
        sx={{
          position: 'fixed',
          insetInline: 0,
          bottom: 0,
          zIndex: (t) => t.zIndex.appBar,
          borderTop: (t) => `1px solid ${t.palette.divider}`,
          bgcolor: (t) =>
            alpha(t.palette.background.paper, t.palette.mode === 'dark' ? 0.82 : 0.95),
          backdropFilter: 'blur(12px)',
          pb: 'env(safe-area-inset-bottom)',
          display: { xs: 'block', md: 'none' },
        }}
      >
        <Box
          component="ul"
          sx={{
            mx: 'auto',
            display: 'flex',
            maxWidth: 480,
            alignItems: 'stretch',
            justifyContent: 'space-between',
            px: 1,
            m: 0,
            p: 0,
            listStyle: 'none',
          }}
        >
          {items.map(({ href, match, label, icon: Icon, suppressHydration }) => {
            const active =
              pendingHref === href ||
              pathname === match ||
              pathname.startsWith(match + '/');
            return (
              <Box component="li" key={match} sx={{ flex: 1 }}>
                <Box
                  component={Link}
                  href={href}
                  prefetch
                  onClick={() => setPendingHref(href)}
                  aria-current={active ? 'page' : undefined}
                  suppressHydrationWarning={suppressHydration}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.25,
                    py: 1,
                    fontSize: 11,
                    fontWeight: 500,
                    textDecoration: 'none',
                    color: active ? 'primary.main' : 'text.disabled',
                    transition: 'color 0.15s',
                    '&:hover': { color: 'text.primary' },
                  }}
                >
                  <DockIcon Icon={Icon} />
                  {label}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </SignedIn>
  );
}

/** Icon slot that overlays a small spinner while the parent Link's
 *  navigation is in flight. `useLinkStatus` must run inside a descendant of
 *  `<Link>` — that's why it lives in this child component. */
const DockIcon = memo(function DockIcon({ Icon }: { Icon: LucideIcon }) {
  const { pending } = useLinkStatus();
  return (
    <Box
      sx={{
        position: 'relative',
        width: 20,
        height: 20,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon
        size={20}
        aria-hidden
        style={{
          opacity: pending ? 0 : 1,
          transition: 'opacity 0.12s',
        }}
      />
      {pending ? (
        <CircularProgress
          size={16}
          thickness={5}
          sx={{ position: 'absolute', color: 'inherit' }}
        />
      ) : null}
    </Box>
  );
});
