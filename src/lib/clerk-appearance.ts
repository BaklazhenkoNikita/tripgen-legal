/* Clerk appearance variants keyed to the Periplo terracotta palette.
 * These mirror the palette tokens in src/theme/index.ts so the Clerk
 * sign-in/up modals match the rest of the app in light and dark mode.
 *
 * Used by src/components/providers/ClerkAppearanceProvider.tsx, which
 * picks the right one via useColorScheme() and feeds it to ClerkProvider. */

const fontFamily =
  "'SF Pro Display', 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

export const lightAppearance = {
  variables: {
    colorPrimary: '#C4603A',
    colorText: '#222222',
    colorBackground: '#FFFFFF',
    colorInputBackground: '#F7F7F7',
    colorInputText: '#222222',
    borderRadius: '8px',
    fontFamily,
  },
} as const;

export const darkAppearance = {
  variables: {
    colorPrimary: '#E58866',
    colorText: '#F3EFE9',
    colorBackground: '#181513',
    colorInputBackground: '#0E0C0B',
    colorInputText: '#F3EFE9',
    colorTextSecondary: '#B8AFA6',
    colorDanger: '#FF6F6F',
    colorSuccess: '#5DE5D4',
    colorNeutral: '#F3EFE9',
    borderRadius: '8px',
    fontFamily,
  },
  elements: {
    card: {
      backgroundColor: '#181513',
      border: '1px solid #2B2724',
      boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 24px 48px rgba(0,0,0,0.7)',
    },
    socialButtonsBlockButton: {
      backgroundColor: '#0E0C0B',
      borderColor: '#2B2724',
      '&:hover': { backgroundColor: '#1F1B17' },
    },
    formFieldInput: {
      backgroundColor: '#0E0C0B',
      borderColor: '#2B2724',
      color: '#F3EFE9',
    },
    footer: { backgroundColor: '#181513' },
    dividerLine: { backgroundColor: '#2B2724' },
    formButtonPrimary: {
      backgroundColor: '#E58866',
      '&:hover': { backgroundColor: '#C4603A' },
    },
  },
} as const;
