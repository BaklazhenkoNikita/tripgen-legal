'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import { alpha, type Theme } from '@mui/material/styles';
import { ArrowRight, type LucideIcon } from 'lucide-react';
import { radii, minTap } from '@/theme/standards';

/**
 * Frame for protocol-v2 chat cards: sits in the assistant column at prose
 * width, hairline border, 16px radius, terracotta eyebrow — the same card
 * language as the trip stop cards.
 */
export function CardShell({
  icon: Icon,
  eyebrow,
  title,
  children,
  footer,
  padded = true,
  ariaLabel,
}: {
  icon?: LucideIcon;
  eyebrow?: string;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  padded?: boolean;
  ariaLabel?: string;
}) {
  return (
    <Box
      component="section"
      aria-label={ariaLabel ?? [eyebrow, title].filter(Boolean).join(': ')}
      sx={{
        width: '100%',
        borderRadius: radii.card,
        border: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      {eyebrow || title ? (
        <Box sx={{ px: 2, pt: 1.75, pb: padded ? 0 : 1.25, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
          {eyebrow ? <Eyebrow icon={Icon}>{eyebrow}</Eyebrow> : null}
          {title ? (
            <Box
              component="h3"
              sx={{ m: 0, fontSize: '1rem', fontWeight: 600, lineHeight: 1.35, letterSpacing: '-0.005em', color: 'text.primary' }}
            >
              {title}
            </Box>
          ) : null}
        </Box>
      ) : null}
      <Box sx={padded ? { px: 2, pt: eyebrow || title ? 1.25 : 1.75, pb: 1.75 } : undefined}>{children}</Box>
      {footer}
    </Box>
  );
}

export function Eyebrow({ icon: Icon, children }: { icon?: LucideIcon; children: ReactNode }) {
  return (
    <Box
      component="p"
      sx={{
        m: 0,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'primary.main',
      }}
    >
      {Icon ? <Icon size={13} aria-hidden /> : null}
      {children}
    </Box>
  );
}

/** Full-width footer row ("Open trip") — 44px target. */
export function CardFooterLink({ href, label, external }: { href: string; label: string; external?: boolean }) {
  return (
    <Box
      component={external ? 'a' : Link}
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      sx={(t: Theme) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.75,
        minHeight: minTap,
        borderTop: 1,
        borderColor: 'divider',
        fontSize: 14,
        fontWeight: 600,
        color: 'primary.main',
        textDecoration: 'none',
        '&:hover': { bgcolor: alpha(t.palette.primary.main, 0.06) },
        '&:focus-visible': { outline: `2px solid ${t.palette.primary.main}`, outlineOffset: -2 },
      })}
    >
      {label}
      <ArrowRight size={15} aria-hidden />
    </Box>
  );
}

/** Small rounded stat chip ("3 days"). */
export function StatChip({ icon: Icon, children }: { icon?: LucideIcon; children: ReactNode }) {
  return (
    <Box
      component="span"
      sx={(t) => ({
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1,
        py: 0.375,
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 500,
        bgcolor: alpha(t.palette.primary.main, 0.08),
        color: 'text.primary',
      })}
    >
      {Icon ? (
        <Box component="span" sx={{ display: 'inline-flex', color: 'primary.main' }}>
          <Icon size={12} aria-hidden />
        </Box>
      ) : null}
      {children}
    </Box>
  );
}

/** Quiet italic note used for fallback_text and unknown card kinds. */
export function FallbackNote({ text }: { text: string }) {
  if (!text) return null;
  return (
    <Box component="p" sx={{ m: 0, fontSize: 14, fontStyle: 'italic', color: 'text.secondary', whiteSpace: 'pre-line' }}>
      {text}
    </Box>
  );
}

/** Shared focus ring + ≥44px target for card buttons. */
export const cardButtonSx = (t: Theme) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 0.75,
  minHeight: minTap,
  px: 1.75,
  border: 0,
  borderRadius: 999,
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontSize: 14,
  fontWeight: 600,
  textDecoration: 'none',
  '&:focus-visible': { outline: `2px solid ${t.palette.primary.main}`, outlineOffset: 2 },
  '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
});
