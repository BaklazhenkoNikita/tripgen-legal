import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { Apple, Play } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';

type Platform = 'apple' | 'google';
type State = 'live' | 'coming-soon';

interface StoreBadgeProps {
  platform: Platform;
  state?: State;
  href?: string;
}

const PLATFORM_COPY: Record<Platform, { topLive: string; bottom: string; ariaName: string }> = {
  apple: { topLive: 'Download on the', bottom: 'App Store', ariaName: 'iOS' },
  google: { topLive: 'Get it on', bottom: 'Google Play', ariaName: 'Android' },
};

export function StoreBadge({ platform, state = 'coming-soon', href }: StoreBadgeProps) {
  const copy = PLATFORM_COPY[platform];
  const Glyph = platform === 'apple' ? Apple : Play;
  const isLive = state === 'live';
  const topLine = isLive ? copy.topLive : 'Coming soon';

  const badge = (
    <Box
      component={isLive && href ? 'a' : 'div'}
      {...(isLive && href ? { href, target: '_blank', rel: 'noopener noreferrer' } : { 'aria-disabled': true })}
      aria-label={isLive ? `${copy.topLive} ${copy.bottom}` : `${copy.ariaName} app — coming soon`}
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
        cursor: isLive ? 'pointer' : 'default',
        opacity: isLive ? 1 : 0.85,
        transition: 'transform 0.18s ease, opacity 0.18s ease',
        '&:hover': isLive
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
          {copy.bottom}
        </Box>
      </Stack>
    </Box>
  );

  if (isLive) return badge;
  return <Tooltip content="Coming soon">{badge}</Tooltip>;
}
