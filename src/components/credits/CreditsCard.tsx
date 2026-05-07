'use client';

import { Infinity as InfinityIcon, Sparkles } from 'lucide-react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { useSubscriptionOptional } from '@/contexts';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { ProBadge } from '@/components/credits/ProBadge';

const cardSx = {
  borderRadius: 2,
  border: '1px solid',
  borderColor: 'divider',
  bgcolor: 'background.paper',
  p: 2.5,
} as const;

const proCardSx = {
  borderRadius: 2,
  border: '1px solid',
  borderColor: (t: { palette: { mode: string; warning: { main: string } } }) =>
    t.palette.mode === 'dark'
      ? alpha((t.palette.warning as { main: string }).main, 0.32)
      : alpha((t.palette.warning as { main: string }).main, 0.45),
  backgroundImage: (t: { palette: { mode: string; background: { paper: string }; warning: { main: string; light: string } } }) =>
    t.palette.mode === 'dark'
      ? `linear-gradient(135deg, ${alpha(t.palette.warning.main, 0.14)}, ${t.palette.background.paper} 60%)`
      : `linear-gradient(135deg, ${alpha(t.palette.warning.light, 0.35)}, ${alpha(t.palette.warning.main, 0.10)} 50%, ${t.palette.background.paper})`,
  p: 2.5,
} as const;

export function CreditsCard() {
  const subscription = useSubscriptionOptional();

  if (!subscription) return null;
  const { credits, isLoading, error, refresh } = subscription;

  if (isLoading && !credits) {
    return (
      <Box sx={cardSx}>
        <Skeleton variant="line" height={12} width={96} />
        <Stack spacing={1} sx={{ mt: 2 }}>
          <Skeleton variant="line" height={24} width="100%" />
          <Skeleton variant="line" height={12} width={128} />
        </Stack>
      </Box>
    );
  }

  if (!credits) {
    return (
      <Box sx={cardSx}>
        <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
          {error ? `Couldn't load credits: ${error}` : 'Credits unavailable.'}
        </Typography>
        <Box sx={{ mt: 1.5 }}>
          <Button variant="ghost" size="sm" onClick={() => void refresh()}>
            Retry
          </Button>
        </Box>
      </Box>
    );
  }

  if (credits.isPro) {
    return (
      <Box sx={proCardSx}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            <Sparkles size={14} aria-hidden style={{ color: 'var(--tg-palette-warning-dark)' }} />
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: (t) => (t.palette.mode === 'dark' ? t.palette.warning.light : t.palette.warning.dark),
              }}
            >
              AI credits
            </Typography>
          </Stack>
          <ProBadge size="md" />
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mt: 1.5 }}>
          <InfinityIcon
            size={42}
            strokeWidth={2.25}
            aria-hidden
            style={{ color: 'var(--mui-palette-text-primary)' }}
          />
          <Typography
            component="span"
            sx={{
              fontSize: 28,
              fontWeight: 600,
              color: 'text.primary',
              lineHeight: 1,
            }}
          >
            Unlimited
          </Typography>
        </Stack>

        <Typography sx={{ mt: 1.5, fontSize: 13, color: 'text.secondary' }}>
          Generate as many trips, chats, and itineraries as you want.
        </Typography>

        {credits.proExpiresAt ? (
          <Typography sx={{ mt: 1, fontSize: 12, color: 'text.secondary' }}>
            {credits.proWillRenew ? 'Renews' : 'Ends'} on{' '}
            {new Date(credits.proExpiresAt).toLocaleDateString()}
          </Typography>
        ) : null}
      </Box>
    );
  }

  const pct = Math.min(
    100,
    Math.max(0, (credits.credits / credits.maxCredits) * 100),
  );

  return (
    <Box sx={cardSx}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" spacing={1} sx={{ display: 'inline-flex' }}>
          <Sparkles size={14} aria-hidden style={{ color: 'var(--mui-palette-primary-main)' }} />
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'text.disabled',
            }}
          >
            AI credits
          </Typography>
        </Stack>
      </Stack>

      <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mt: 1.5 }}>
        <Typography
          component="span"
          sx={{
            fontSize: 36,
            fontWeight: 600,
            fontVariantNumeric: 'tabular-nums',
            color: 'text.primary',
            lineHeight: 1,
          }}
        >
          {credits.credits}
        </Typography>
        <Typography component="span" sx={{ fontSize: 14, color: 'text.disabled' }}>
          / {credits.maxCredits}
        </Typography>
      </Stack>

      <Box
        sx={{
          mt: 1.5,
          height: 6,
          overflow: 'hidden',
          borderRadius: 999,
          bgcolor: 'action.hover',
        }}
      >
        <Box
          sx={{
            height: '100%',
            borderRadius: 999,
            bgcolor: 'primary.main',
            transition: 'width 500ms',
            width: `${pct}%`,
          }}
        />
      </Box>

      {credits.nextRegenAt ? (
        <Typography sx={{ mt: 1.5, fontSize: 12, color: 'text.secondary' }}>
          Next credit at {new Date(credits.nextRegenAt).toLocaleString()}
        </Typography>
      ) : null}
    </Box>
  );
}
