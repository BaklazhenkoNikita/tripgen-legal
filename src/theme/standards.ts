import type { SxProps, Theme } from '@mui/material/styles';

export const appleFontStack =
  "'SF Pro Display', 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif";

export const textScale = {
  hero: {
    fontWeight: 700,
    fontSize: 'clamp(2.75rem, 4vw, 3.9rem)',
    lineHeight: 1.1,
    letterSpacing: '-0.015em',
  },
  headline: {
    fontWeight: 600,
    fontSize: 'clamp(1.85rem, 2.5vw, 2.4rem)',
    lineHeight: 1.18,
    letterSpacing: '-0.01em',
  },
  body: {
    fontWeight: 400,
    fontSize: 'clamp(1rem, 0.6vw + 0.85rem, 1.15rem)',
    lineHeight: 1.6,
    letterSpacing: '0em',
  },
  support: {
    fontWeight: 400,
    fontSize: 'clamp(0.9rem, 0.4vw + 0.65rem, 0.98rem)',
    lineHeight: 1.5,
    letterSpacing: '0.01em',
  },
  // Small UI steps — tokens for the sizes components were hand-setting as
  // raw numbers (18/14/12px). Use these instead of numeric fontSize in sx.
  title: {
    fontWeight: 600,
    fontSize: '1.125rem',
    lineHeight: 1.35,
    letterSpacing: '-0.005em',
  },
  label: {
    fontWeight: 600,
    fontSize: '0.875rem',
    lineHeight: 1.4,
    letterSpacing: '0em',
  },
  meta: {
    fontWeight: 500,
    fontSize: '0.75rem',
    lineHeight: 1.4,
    letterSpacing: '0.01em',
  },
} as const;

/**
 * Corner radii (in theme spacing units) for hand-built Box cards, which
 * bypass the global MuiCard override. Use these instead of ad-hoc values.
 */
export const radii = {
  /** Standard card / list tile (16px). */
  card: 2,
  /** Prominent surface: day plan cards, sheets (24px). */
  cardLarge: 3,
  /** Pills, chips, fully rounded buttons. */
  pill: 999,
} as const;

/** Text shadow for light text rendered over photos. */
export const photoTextShadow = '0 1px 2px rgba(0,0,0,0.45)';

export const sectionPadding = {
  px: { xs: 2, sm: 3, md: 5 },
  py: { xs: 5, sm: 7, md: 9 },
};

export const blockPadding = {
  px: { xs: 2.5, md: 4 },
  py: { xs: 3, md: 4 },
};

export const sectionContainerSx: SxProps<Theme> = {
  ...sectionPadding,
  width: '100%',
  mx: 'auto',
  maxWidth: 'min(1400px, 100%)',
};

export const sectionStackGap = { xs: 4, md: 5 };
