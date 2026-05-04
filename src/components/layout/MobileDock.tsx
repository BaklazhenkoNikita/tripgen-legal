'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignedIn } from '@clerk/nextjs';
import { Compass, Sparkles, Map as MapIcon } from 'lucide-react';
import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';

const items = [
  { href: '/discover', label: 'Discover', icon: Compass },
  { href: '/trip', label: 'Plan', icon: Sparkles },
  { href: '/history', label: 'Trips', icon: MapIcon },
] as const;

/** Bottom dock — visible on mobile only when signed in. */
export function MobileDock() {
  const pathname = usePathname() ?? '/';
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
          bgcolor: (t) => alpha(t.palette.background.paper, 0.95),
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
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Box component="li" key={href} sx={{ flex: 1 }}>
                <Box
                  component={Link}
                  href={href}
                  aria-current={active ? 'page' : undefined}
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
                    transition: 'color 0.2s',
                    '&:hover': { color: 'text.primary' },
                  }}
                >
                  <Icon size={20} aria-hidden />
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
