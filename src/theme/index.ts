'use client';

import { alpha, extendTheme } from '@mui/material/styles';
import { textScale } from './standards';
import { tgShadow } from './shadows';

const fontBody = 'var(--font-body), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
const fontDisplay = 'var(--font-display), Georgia, "Times New Roman", serif';

// Light palette — Periplo terracotta brand.
const hoodwisePrimary = '#C4603A';
const hoodwisePrimaryDark = '#9A4A2D';
const hoodwisePrimaryLight = '#D88564';
const hoodwiseSecondary = '#00A699';
const hoodwiseSecondaryDark = '#007866';
const hoodwiseSecondaryLight = '#2ACEBA';
const hoodwiseCharcoal = '#222222';
const hoodwiseMuted = '#717171';
const hoodwiseSurface = '#FFFFFF';
const hoodwiseBackground = '#F7F7F7';
const hoodwiseDivider = '#E0E0E0';
const hoodwiseHighlight = '#FF9500';

// Dark palette — brighter terracotta family for dark surfaces.
const darkPrimary = '#E58866';
const darkPrimaryDark = '#C4603A';
const darkPrimaryLight = '#F0AC8E';
const darkSecondary = '#2ACEBA';
const darkSecondaryDark = '#00A699';
const darkSecondaryLight = '#5DE5D4';
const darkText = '#F3EFE9';
const darkMuted = '#B8AFA6';
const darkSurface = '#181513';
const darkBackground = '#0E0C0B';
const darkDivider = '#2B2724';
const darkHighlight = '#FFB44C';

export const theme = extendTheme({
  cssVarPrefix: 'tg',
  colorSchemes: {
    light: {
      palette: {
        mode: 'light',
        primary: {
          main: hoodwisePrimary,
          light: hoodwisePrimaryLight,
          dark: hoodwisePrimaryDark,
          contrastText: hoodwiseSurface,
        },
        secondary: {
          main: hoodwiseSecondary,
          light: hoodwiseSecondaryLight,
          dark: hoodwiseSecondaryDark,
          contrastText: hoodwiseSurface,
        },
        background: {
          default: hoodwiseBackground,
          paper: hoodwiseSurface,
        },
        text: {
          primary: hoodwiseCharcoal,
          secondary: hoodwiseMuted,
        },
        divider: hoodwiseDivider,
        info: { main: hoodwiseHighlight },
        action: {
          hover: alpha(hoodwiseCharcoal, 0.08),
          selected: alpha(hoodwisePrimary, 0.18),
          focus: alpha(hoodwisePrimary, 0.24),
          active: hoodwisePrimaryDark,
        },
      },
    },
    dark: {
      palette: {
        mode: 'dark',
        primary: {
          main: darkPrimary,
          light: darkPrimaryLight,
          dark: darkPrimaryDark,
          contrastText: hoodwiseSurface,
        },
        secondary: {
          main: darkSecondary,
          light: darkSecondaryLight,
          dark: darkSecondaryDark,
          contrastText: hoodwiseSurface,
        },
        background: {
          default: darkBackground,
          paper: darkSurface,
        },
        text: {
          primary: darkText,
          secondary: darkMuted,
        },
        divider: darkDivider,
        info: { main: darkHighlight },
        action: {
          hover: alpha(darkText, 0.08),
          selected: alpha(darkPrimary, 0.22),
          focus: alpha(darkPrimary, 0.28),
          active: darkPrimaryLight,
        },
      },
    },
  },
  typography: {
    fontFamily: fontBody,
    h1: { ...textScale.hero, fontFamily: fontDisplay, fontWeight: 400 },
    h2: { ...textScale.headline, fontFamily: fontDisplay, fontWeight: 400 },
    h3: { ...textScale.headline, fontFamily: fontDisplay, fontWeight: 400 },
    h4: {
      ...textScale.headline,
      fontFamily: fontDisplay,
      fontWeight: 400,
      fontSize: 'clamp(1.1rem, 1.5vw, 1.5rem)',
    },
    h5: { ...textScale.body, fontWeight: 600 },
    h6: textScale.body,
    subtitle1: textScale.body,
    subtitle2: { ...textScale.support, fontWeight: 500 },
    body1: textScale.body,
    body2: textScale.support,
    button: {
      ...textScale.body,
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.01em',
    },
    caption: textScale.support,
    overline: {
      ...textScale.support,
      fontWeight: 600,
      letterSpacing: '0.2em',
      textTransform: 'uppercase',
    },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: 'var(--tg-palette-background-default)',
          color: 'var(--tg-palette-text-primary)',
        },
        '*::selection': {
          backgroundColor: 'var(--tg-palette-primary-main)',
          color: '#fff',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingInline: '1.5rem',
          paddingBlock: '0.65rem',
          fontWeight: 600,
        },
        containedPrimary: ({ theme: t }) => ({
          boxShadow: tgShadow(t, 'primaryButton'),
          '&:hover': {
            backgroundColor: t.palette.primary.dark,
            boxShadow: tgShadow(t, 'primaryButtonHover'),
          },
        }),
        outlinedPrimary: ({ theme: t }) => ({
          borderColor: alpha(t.palette.primary.main, 0.32),
          color: t.palette.primary.main,
          '&:hover': {
            borderColor: t.palette.primary.main,
            backgroundColor: alpha(t.palette.primary.main, 0.08),
          },
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme: t }) => ({
          borderRadius: 8,
          boxShadow: tgShadow(t, 'cardHover'),
        }),
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme: t }) => ({
          backgroundColor: alpha(t.palette.background.paper, 0.92),
          color: t.palette.text.primary,
          boxShadow: tgShadow(t, 'appBar'),
          backdropFilter: 'blur(18px)',
        }),
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: ({ theme: t }) => ({
          borderColor: t.palette.divider,
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: ({ theme: t }) => ({
          fontWeight: 500,
          color: t.palette.text.primary,
          backgroundColor: alpha(t.palette.background.paper, 0.9),
          borderRadius: 999,
        }),
      },
    },
    MuiTooltip: {
      defaultProps: { arrow: true },
    },
  },
});
