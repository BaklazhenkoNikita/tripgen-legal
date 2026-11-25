'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import { MapPin, Utensils } from 'lucide-react';
import { entityHref } from '@/lib/chat/links';

interface Props {
  type: 'activity' | 'restaurant';
  id: string;
  name: string;
  city?: string | null;
  children?: ReactNode;
}

/** Inline tappable chip for `[[activity:<id>|Name]]` / `[[restaurant:…]]`. */
export function EntityChip({ type, id, name, city, children }: Props) {
  const { href, external } = entityHref(type, id, name, city);
  const Icon = type === 'restaurant' ? Utensils : MapPin;
  const label = external ? `${name} — open in Google Maps (new tab)` : `${name} — open place details`;
  return (
    <Box
      component={external ? 'a' : Link}
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      aria-label={label}
      sx={(t) => ({
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        verticalAlign: 'baseline',
        maxWidth: '100%',
        px: 0.875,
        py: 0.125,
        mx: 0.125,
        borderRadius: 999,
        bgcolor: alpha(t.palette.primary.main, 0.1),
        color: `${t.palette.primary.dark} !important`,
        fontWeight: 600,
        textDecoration: 'none !important',
        lineHeight: 1.5,
        // Visual chip stays compact; the pseudo-element pads the hit area.
        position: 'relative',
        '&::after': { content: '""', position: 'absolute', inset: '-8px -2px' },
        '&:hover': { bgcolor: alpha(t.palette.primary.main, 0.18) },
        '&:focus-visible': {
          outline: `2px solid ${t.palette.primary.main}`,
          outlineOffset: 2,
        },
        ...(t.palette.mode === 'dark' ? { color: `${t.palette.primary.light} !important` } : {}),
      })}
    >
      <Icon size={12} aria-hidden style={{ flexShrink: 0 }} />
      <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {children ?? name}
      </Box>
    </Box>
  );
}
