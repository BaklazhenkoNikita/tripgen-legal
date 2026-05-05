import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { Apple, Play } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';

type Platform = 'apple' | 'google';
type State = 'live' | 'coming-soon' | 'closed-beta';

interface StoreBadgeProps {
  platform: Platform;
  state?: State;
  href?: string;
}

const PLATFORM_COPY: Record<Platform, { topLive: string; bottom: string; ariaName: string }> = {
  apple: { topLive: 'Download on the', bottom: 'App Store', ariaName: 'iOS' },
  google: { topLive: 'Get it on', bottom: 'Google Play', ariaName: 'Android' },
};

const CLOSED_BETA_MAILTO = `mailto:support@periploapp.com?subject=${encodeURIComponent(
  'Periplo Android closed beta — request access',
)}&body=${encodeURIComponent(
  "Hi Periplo team,\n\nI'd like to join the Android closed beta. My Google account email is: ___\n\nThanks!",
)}`;

export function StoreBadge({ platform, state = 'coming-soon', href }: StoreBadgeProps) {
  const copy = PLATFORM_COPY[platform];
  const Glyph = platform === 'apple' ? Apple : Play;
  const isInteractive = state === 'live' || state === 'closed-beta';

  let topLine: string;
  let bottomLine: string;
  let ariaLabel: string;
  let linkAttrs: Record<string, string | boolean>;

  if (state === 'closed-beta') {
    topLine = 'Request access';
    bottomLine = 'Closed Beta';
    ariaLabel = 'Request Android closed beta access';
    linkAttrs = { href: CLOSED_BETA_MAILTO };
  } else if (state === 'live' && href) {
    topLine = copy.topLive;
    bottomLine = copy.bottom;
    ariaLabel = `${copy.topLive} ${copy.bottom}`;
    linkAttrs = { href, target: '_blank', rel: 'noopener noreferrer' };
  } else {
    topLine = 'Coming soon';
    bottomLine = copy.bottom;
    ariaLabel = `${copy.ariaName} app — coming soon`;
    linkAttrs = { 'aria-disabled': true };
  }

  const badge = (
    <Box
      component={isInteractive ? 'a' : 'div'}
      {...linkAttrs}
      aria-label={ariaLabel}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1.25,
        px: 2,
        py: 1,
        borderRadius: 999,
        bgcolor: 'text.primary',
        color: 'background.paper',
        textDecoration: 'none',
        cursor: isInteractive ? 'pointer' : 'default',
        opacity: isInteractive ? 1 : 0.85,
        transition: 'transform 0.18s ease, opacity 0.18s ease',
        '&:hover': isInteractive
          ? { transform: 'translateY(-1px)' }
          : undefined,
      }}
    >
      <Glyph size={20} aria-hidden style={{ flexShrink: 0 }} />
      <Stack spacing={0} sx={{ lineHeight: 1.1 }}>
        <Box component="span" sx={{ fontSize: 10, fontWeight: 500, opacity: 0.78, letterSpacing: 0.2 }}>
          {topLine}
        </Box>
        <Box component="span" sx={{ fontSize: 14, fontWeight: 600, letterSpacing: -0.1 }}>
          {bottomLine}
        </Box>
      </Stack>
    </Box>
  );

  if (state === 'coming-soon') return <Tooltip content="Coming soon">{badge}</Tooltip>;
  return badge;
}
