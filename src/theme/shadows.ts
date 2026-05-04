/* Theme-aware shadow tokens.
 *
 * Light mode keeps the existing "charcoal-on-white" shadow language
 * (rgba(34,34,34,*) variants). Dark mode uses deeper near-black shadows
 * because dark surfaces need stronger separation, and a faint inset
 * hairline so cards don't melt into the background.
 *
 * Usage in sx:
 *   import { tgShadow } from '@/theme/shadows';
 *   sx={{ boxShadow: (t) => tgShadow(t, 'card') }}
 *   sx={{ '&:hover': { boxShadow: (t) => tgShadow(t, 'cardHover') } }}
 *
 * Usage inside a MUI styleOverrides callback:
 *   ({ theme }) => ({ boxShadow: tgShadow(theme, 'card') })
 */

export type TgShadowKey =
  | 'card'
  | 'cardHover'
  | 'appBar'
  | 'dropdown'
  | 'sheet'
  | 'toast'
  | 'tooltip'
  | 'primaryButton'
  | 'primaryButtonHover';

const lightShadows: Record<TgShadowKey, string> = {
  card:               '0 2px 8px rgba(34, 34, 34, 0.05)',
  cardHover:          '0 8px 24px rgba(34, 34, 34, 0.10)',
  appBar:             '0 12px 32px rgba(34, 34, 34, 0.08)',
  dropdown:           '0 8px 24px rgba(34, 34, 34, 0.10)',
  sheet:              '0 24px 48px rgba(34, 34, 34, 0.18)',
  toast:              '0 8px 24px rgba(34, 34, 34, 0.10)',
  tooltip:            '0 2px 6px rgba(0, 0, 0, 0.18)',
  primaryButton:      '0 14px 32px rgba(196, 96, 58, 0.18)',
  primaryButtonHover: '0 18px 40px rgba(154, 74, 45, 0.22)',
};

const darkShadows: Record<TgShadowKey, string> = {
  // Hairline outset + deeper drop shadow. The hairline gives surfaces
  // a visible edge against the near-black background.
  card:               '0 0 0 1px rgba(255, 255, 255, 0.04), 0 2px 6px rgba(0, 0, 0, 0.45)',
  cardHover:          '0 0 0 1px rgba(255, 255, 255, 0.06), 0 8px 24px rgba(0, 0, 0, 0.55)',
  appBar:             '0 0 0 1px rgba(255, 255, 255, 0.04), 0 12px 32px rgba(0, 0, 0, 0.55)',
  dropdown:           '0 0 0 1px rgba(255, 255, 255, 0.06), 0 12px 28px rgba(0, 0, 0, 0.6)',
  sheet:              '0 0 0 1px rgba(255, 255, 255, 0.06), 0 24px 48px rgba(0, 0, 0, 0.7)',
  toast:              '0 0 0 1px rgba(255, 255, 255, 0.06), 0 12px 28px rgba(0, 0, 0, 0.6)',
  tooltip:            '0 2px 6px rgba(0, 0, 0, 0.6)',
  // Slightly muted tint so the terracotta glow doesn't blow out on dark.
  primaryButton:      '0 12px 28px rgba(196, 96, 58, 0.32)',
  primaryButtonHover: '0 16px 36px rgba(196, 96, 58, 0.42)',
};

type ThemeWithMode = { palette: { mode?: 'light' | 'dark' } };

export function tgShadow(theme: ThemeWithMode, key: TgShadowKey): string {
  const mode = theme.palette.mode === 'dark' ? 'dark' : 'light';
  return (mode === 'dark' ? darkShadows : lightShadows)[key];
}
