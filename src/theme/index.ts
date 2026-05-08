'use client';

import { alpha, extendTheme } from '@mui/material/styles';
import { textScale } from './standards';
import { tgShadow } from './shadows';
import {
  CATEGORY_COLORS,
  CATEGORY_COLORS_DARK,
} from '@/lib/map/categoryColors';

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

// Light semantic colors — chosen to read on hoodwiseBackground / hoodwiseSurface.
const lightSuccess = '#16A34A';
const lightSuccessDark = '#15803D';
const lightSuccessLight = '#4ADE80';
const lightWarning = '#F59E0B';
const lightWarningDark = '#B15300';
const lightWarningLight = '#FCD34D';
const lightError = '#DC2626';
const lightErrorDark = '#B91C1C';
const lightErrorLight = '#F87171';

// Dark palette — aligned with the mobile app theme
// (trip_gen_mobile/mobile/src/config/theme.ts) so brand reads consistently
// across web and native. Warm cream text + burnt-terracotta primary, with
// borders/dividers expressed as cream-channel RGBA so a single divider
// composes nicely on whichever surface it lands.
const darkPrimary = '#D4724A';
const darkPrimaryDark = '#C4603A';
const darkPrimaryLight = '#E0A080';
const darkSecondary = '#2ACEBA';
const darkSecondaryDark = '#00A699';
const darkSecondaryLight = '#5DE5D4';
const darkText = '#EDE0D4';
const darkMuted = '#B0A090';
// Tertiary text — between secondary and primary. Used for card meta (dates,
// duration, country) where text.secondary felt too dim on long rows.
const darkTertiary = '#C4B8AD';
// Three-step elevation. Page floor (default) → card surface (paper) →
// elevated (nested cards, expanded sections, modals).
const darkBackground = '#131210';
const darkSurface = '#1E1A17';
const darkElevated = '#3A3530';
// Cream-tinted RGBA divider — composes against whichever surface; warmer
// than a solid hex grey. Matches mobile's `border` / `divider` tokens.
const darkDivider = 'rgba(237, 224, 212, 0.12)';
const darkHighlight = '#FFB44C';

// Dark semantic colors — brightened so they stay legible on darkBackground.
const darkSuccess = '#4ADE80';
const darkSuccessDark = '#16A34A';
const darkSuccessLight = '#86EFAC';
const darkWarning = '#FFB44C';
const darkWarningDark = '#F59E0B';
const darkWarningLight = '#FCD34D';
const darkError = '#EF6B6B';
const darkErrorDark = '#DC2626';
const darkErrorLight = '#FCA5A5';

export const theme = extendTheme({
  cssVarPrefix: 'tg',
  // Match the attribute set by <InitColorSchemeScript attribute="data-tg-color-scheme">
  // so MUI emits `[data-tg-color-scheme="dark"]` selectors instead of
  // `@media (prefers-color-scheme: dark)`. Without this the ThemeToggle's
  // setMode() call is a no-op and dark mode only ever follows OS preference.
  colorSchemeSelector: 'data-tg-color-scheme',
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
        success: {
          main: lightSuccess,
          light: lightSuccessLight,
          dark: lightSuccessDark,
          contrastText: hoodwiseSurface,
        },
        warning: {
          main: lightWarning,
          light: lightWarningLight,
          dark: lightWarningDark,
          contrastText: hoodwiseSurface,
        },
        error: {
          main: lightError,
          light: lightErrorLight,
          dark: lightErrorDark,
          contrastText: hoodwiseSurface,
        },
        info: {
          main: hoodwiseHighlight,
          contrastText: hoodwiseSurface,
        },
        background: {
          default: hoodwiseBackground,
          paper: hoodwiseSurface,
          // In light mode the third tier maps back to plain paper — the
          // surface contrast naturally separates without an extra step.
          elevated: hoodwiseSurface,
        },
        text: {
          primary: hoodwiseCharcoal,
          secondary: hoodwiseMuted,
          // In light mode tertiary just inherits secondary; the dark palette
          // gets a brighter dedicated value where the gap actually matters.
          tertiary: hoodwiseMuted,
        },
        divider: hoodwiseDivider,
        action: {
          hover: alpha(hoodwiseCharcoal, 0.08),
          selected: alpha(hoodwisePrimary, 0.18),
          focus: alpha(hoodwisePrimary, 0.24),
          active: hoodwisePrimaryDark,
        },
        category: {
          exploration: CATEGORY_COLORS.exploration,
          activity: CATEGORY_COLORS.activity,
          live_event: CATEGORY_COLORS.live_event,
          restaurant: CATEGORY_COLORS.restaurant,
          viator: CATEGORY_COLORS.viator,
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
        success: {
          main: darkSuccess,
          light: darkSuccessLight,
          dark: darkSuccessDark,
          contrastText: darkBackground,
        },
        warning: {
          main: darkWarning,
          light: darkWarningLight,
          dark: darkWarningDark,
          contrastText: darkBackground,
        },
        error: {
          main: darkError,
          light: darkErrorLight,
          dark: darkErrorDark,
          contrastText: hoodwiseSurface,
        },
        info: {
          main: darkHighlight,
          contrastText: darkBackground,
        },
        background: {
          default: darkBackground,
          paper: darkSurface,
          // `elevated` is a third tier above `paper`. Use for nested cards,
          // expanded panel content, or modals/sheets that need to sit on top
          // of an already-paper surface. Reach via `theme.palette.background.elevated`.
          elevated: darkElevated,
        },
        text: {
          primary: darkText,
          secondary: darkMuted,
          // Tertiary — brighter than secondary but dimmer than primary. Used
          // for card meta (dates, duration, country, "5 DAYS"). MUI doesn't
          // include this slot by default; the augmentation at the bottom of
          // this file lets `color: 'text.tertiary'` resolve in sx.
          tertiary: darkTertiary,
          // MUI defaults to rgba(255,255,255,0.5) which clashes with the warm
          // cream darkText. Use the same warm tone at a faded alpha for hierarchy.
          disabled: alpha(darkText, 0.42),
        },
        divider: darkDivider,
        action: {
          hover: alpha(darkText, 0.08),
          selected: alpha(darkPrimary, 0.22),
          focus: alpha(darkPrimary, 0.28),
          active: darkPrimaryLight,
        },
        category: {
          exploration: CATEGORY_COLORS_DARK.exploration,
          activity: CATEGORY_COLORS_DARK.activity,
          live_event: CATEGORY_COLORS_DARK.live_event,
          restaurant: CATEGORY_COLORS_DARK.restaurant,
          viator: CATEGORY_COLORS_DARK.viator,
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
      // MuiCssBaseline.styleOverrides receives the theme directly, unlike
      // component-level overrides which receive `{ theme, ownerState }`.
      styleOverrides: (t) => ({
        body: {
          backgroundColor: 'var(--tg-palette-background-default)',
          color: 'var(--tg-palette-text-primary)',
        },
        '*::selection': {
          backgroundColor: 'var(--tg-palette-primary-main)',
          color: 'var(--tg-palette-primary-contrastText)',
        },
        // Emit shadow tokens as CSS vars so:
        // - non-React surfaces (Leaflet div-icons, popups, transit labels in
        //   globals.css) auto-switch with the color scheme without per-mode rules
        // - server components can reference shadows as plain strings
        //   (`var(--tg-shadow-card)`) instead of sx callbacks, which can't be
        //   serialised across the RSC boundary
        ':root': {
          '--tg-shadow-card': tgShadow(t, 'card'),
          '--tg-shadow-card-hover': tgShadow(t, 'cardHover'),
          '--tg-shadow-app-bar': tgShadow(t, 'appBar'),
          '--tg-shadow-dropdown': tgShadow(t, 'dropdown'),
          '--tg-shadow-sheet': tgShadow(t, 'sheet'),
          '--tg-shadow-toast': tgShadow(t, 'toast'),
          '--tg-shadow-tooltip': tgShadow(t, 'tooltip'),
          '--tg-shadow-primary-button': tgShadow(t, 'primaryButton'),
          '--tg-shadow-primary-button-hover': tgShadow(t, 'primaryButtonHover'),
          '--tg-shadow-map-overlay': tgShadow(t, 'mapOverlay'),
          '--tg-shadow-map-overlay-small': tgShadow(t, 'mapOverlaySmall'),
          '--tg-shadow-popup': tgShadow(t, 'popup'),
          '--tg-shadow-cluster': tgShadow(t, 'cluster'),
          '--tg-shadow-transit-label': tgShadow(t, 'transitLabel'),
          '--tg-shadow-marker-label': tgShadow(t, 'markerLabel'),
          // Category pin colors — exposed for divIcon HTML and SVG strokes
          // that don't inherit MUI's CSS vars by default.
          '--tg-cat-exploration': t.palette.category.exploration,
          '--tg-cat-activity': t.palette.category.activity,
          '--tg-cat-live-event': t.palette.category.live_event,
          '--tg-cat-restaurant': t.palette.category.restaurant,
          '--tg-cat-viator': t.palette.category.viator,
        },
      }),
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
      defaultProps: { color: 'default' },
      styleOverrides: {
        // Dark surfaces at 0.85 alpha look opaque/muddy; lighter chrome lets
        // the page texture (image hero, gradient) show through the blur.
        root: ({ theme: t }) => ({
          backgroundColor: alpha(
            t.palette.background.paper,
            t.palette.mode === 'dark' ? 0.72 : 0.85,
          ),
          color: t.palette.text.primary,
          boxShadow: tgShadow(t, 'appBar'),
          backdropFilter: 'blur(18px)',
        }),
        colorPrimary: ({ theme: t }) => ({
          backgroundColor: alpha(
            t.palette.background.paper,
            t.palette.mode === 'dark' ? 0.72 : 0.85,
          ),
          color: t.palette.text.primary,
        }),
        colorDefault: ({ theme: t }) => ({
          backgroundColor: alpha(
            t.palette.background.paper,
            t.palette.mode === 'dark' ? 0.72 : 0.85,
          ),
          color: t.palette.text.primary,
        }),
        colorTransparent: {
          backgroundColor: 'transparent',
        },
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
          backgroundColor: alpha(
            t.palette.background.paper,
            t.palette.mode === 'dark' ? 0.85 : 0.9,
          ),
          borderRadius: 999,
        }),
      },
    },
    MuiTooltip: {
      defaultProps: { arrow: true },
    },
  },
});

// ---------------------------------------------------------------------------
// Module augmentation — exposes our custom `category` palette group to MUI's
// type system so `theme.palette.category.restaurant` is type-checked in sx
// callbacks and string-sx (e.g. `bgcolor: 'category.food.main'` is NOT valid;
// these are flat hex strings, not PaletteColor objects).
// ---------------------------------------------------------------------------
declare module '@mui/material/styles' {
  interface CategoryPalette {
    exploration: string;
    activity: string;
    live_event: string;
    restaurant: string;
    viator: string;
  }
  interface Palette {
    category: CategoryPalette;
  }
  interface PaletteOptions {
    category?: CategoryPalette;
  }
  // Custom slots beyond MUI's defaults — `text.tertiary` for card meta and
  // `background.elevated` for the third surface tier (modals, expanded
  // sections, nested cards on top of paper).
  interface TypeText {
    tertiary: string;
  }
  interface TypeBackground {
    elevated: string;
  }
}
