'use client';

import { Fragment, type ReactNode } from 'react';
import { CircleCheck, Info, Lightbulb } from 'lucide-react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha, type SxProps, type Theme } from '@mui/material/styles';

/**
 * Shared building blocks for the place detail surfaces (drawer + full page):
 * section headings, check-lists, tinted callouts and a tiny inline-emphasis
 * renderer for model-written copy.
 */

export type PlaceBlockLayout = 'drawer' | 'page';

/** Body copy size per layout — the drawer is ~620px wide, the page much
 *  wider but capped by `PROSE_MAX`. */
export const proseFontSize = (layout: PlaceBlockLayout) =>
  layout === 'page' ? '1rem' : '0.9375rem';

/** ~68 characters per line keeps long editorial paragraphs readable. */
export const PROSE_MAX = '68ch';

export function SectionHeading({
  children,
  variant = 'eyebrow',
  sx,
}: {
  children: ReactNode;
  /** 'eyebrow' — small tracked terracotta caps (nested sub-labels, list
   *  labels). 'title' — a readable section title for top-level blocks, so the
   *  page reads as a real two-level hierarchy instead of one flat overline. */
  variant?: 'eyebrow' | 'title';
  sx?: SxProps<Theme>;
}) {
  const base: SxProps<Theme> =
    variant === 'title'
      ? {
          fontSize: '1rem',
          fontWeight: 600,
          lineHeight: 1.3,
          letterSpacing: '-0.01em',
          color: 'text.primary',
          m: 0,
        }
      : {
          fontSize: '0.6875rem',
          fontWeight: 700,
          lineHeight: 1.5,
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          color: 'primary.dark',
          m: 0,
        };
  return (
    <Typography
      component="h3"
      sx={[base, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
    >
      {children}
    </Typography>
  );
}

// `**bold**`, `__bold__`, `*italic*`, `_italic_` — the only markdown the
// context generator emits in practice. Everything else renders as text.
const EMPHASIS = /(\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\s][^*\n]*\*|(?<![\p{L}\p{N}])_[^_\s][^_\n]*_(?![\p{L}\p{N}]))/gu;

/** Renders inline bold / italic in model-written copy instead of showing the
 *  raw asterisks. No HTML, links or block syntax — plain text otherwise. */
export function InlineEmphasis({ text }: { text: string }) {
  const parts = text.split(EMPHASIS);
  return (
    <>
      {parts.map((part, i) => {
        if (!part) return null;
        if (
          (part.startsWith('**') && part.endsWith('**')) ||
          (part.startsWith('__') && part.endsWith('__'))
        ) {
          return (
            <Box component="strong" key={i} sx={{ fontWeight: 600 }}>
              {part.slice(2, -2)}
            </Box>
          );
        }
        if (
          part.length > 2 &&
          ((part.startsWith('*') && part.endsWith('*')) ||
            (part.startsWith('_') && part.endsWith('_')))
        ) {
          return <em key={i}>{part.slice(1, -1)}</em>;
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}

const norm = (s: string) => s.trim().toLowerCase().replace(/[.!\s]+$/, '');

/** Case/punctuation-insensitive de-dupe; drops anything in `exclude`. */
export function dedupeStrings(
  items: readonly (string | null | undefined)[],
  exclude: readonly string[] = [],
): string[] {
  const seen = new Set(exclude.map(norm));
  const out: string[] = [];
  for (const raw of items) {
    if (typeof raw !== 'string') continue;
    const item = raw.trim();
    if (!item) continue;
    const key = norm(item);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

/** Highlights as a check-list — two columns on the wide page. */
export function CheckList({
  title,
  items,
  layout,
  sx,
}: {
  title?: string;
  items?: readonly string[] | null;
  layout: PlaceBlockLayout;
  sx?: SxProps<Theme>;
}) {
  if (!items || items.length === 0) return null;
  return (
    <Box sx={[...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}>
      {title ? <SectionHeading>{title}</SectionHeading> : null}
      <Box
        component="ul"
        sx={{
          mt: title ? 1.5 : 0,
          mb: 0,
          p: 0,
          listStyle: 'none',
          display: 'grid',
          gap: 1.5,
          columnGap: 3,
          gridTemplateColumns:
            layout === 'page' ? { xs: '1fr', md: '1fr 1fr' } : '1fr',
        }}
      >
        {items.map((item, i) => (
          <Box
            component="li"
            key={i}
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1,
              fontSize: '0.875rem',
              lineHeight: 1.55,
              color: 'text.primary',
              overflowWrap: 'anywhere',
            }}
          >
            <Box
              component="span"
              sx={{ mt: '1px', flexShrink: 0, display: 'inline-flex', color: 'primary.main' }}
            >
              <CircleCheck size={18} aria-hidden />
            </Box>
            <Box component="span">
              <InlineEmphasis text={item} />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

type CalloutTone = 'tip' | 'info';

const calloutTones: Record<
  CalloutTone,
  { icon: typeof Lightbulb; accent: (t: Theme) => string; ink: (t: Theme) => string }
> = {
  // Amber — practical, act-on-this advice.
  tip: {
    icon: Lightbulb,
    accent: (t) => t.palette.warning.main,
    ink: (t) => t.palette.warning.dark,
  },
  // Transit blue — neutral "good to know" facts, distinct from the brand
  // terracotta used for headings and actions.
  info: {
    icon: Info,
    accent: (t) => t.palette.route.main,
    ink: (t) => t.palette.route.main,
  },
};

/** Tinted box with an icon eyebrow and a bulleted list. */
export function Callout({
  tone,
  title,
  items,
  sx,
}: {
  tone: CalloutTone;
  title: string;
  items?: readonly string[] | null;
  sx?: SxProps<Theme>;
}) {
  if (!items || items.length === 0) return null;
  const { icon: Icon, accent, ink } = calloutTones[tone];
  return (
    <Box
      sx={[
        (t: Theme) => ({
          borderRadius: 1.5,
          border: '1px solid',
          borderColor: alpha(accent(t), 0.3),
          bgcolor: alpha(accent(t), t.palette.mode === 'dark' ? 0.12 : 0.08),
          p: 2,
        }),
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <Box
        sx={(t: Theme) => ({
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          color: ink(t),
        })}
      >
        <Icon size={16} aria-hidden />
        <SectionHeading sx={{ color: 'inherit' }}>{title}</SectionHeading>
      </Box>
      <Box component="ul" sx={{ mt: 1, mb: 0, p: 0, listStyle: 'none' }}>
        {items.map((item, i) => (
          <Box
            component="li"
            key={i}
            sx={{
              display: 'flex',
              gap: 1,
              mt: i === 0 ? 0 : 1,
              fontSize: '0.875rem',
              lineHeight: 1.6,
              color: 'text.primary',
              overflowWrap: 'anywhere',
            }}
          >
            <Box
              component="span"
              sx={(t: Theme) => ({
                mt: '9px',
                height: 5,
                width: 5,
                flexShrink: 0,
                borderRadius: 999,
                bgcolor: accent(t),
              })}
            />
            <Box component="span">
              <InlineEmphasis text={item} />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
