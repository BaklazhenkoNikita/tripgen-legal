'use client';

import { Crown, Sparkles } from 'lucide-react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useSubscriptionOptional } from '@/contexts';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const cardSx = {
  borderRadius: 2,
  border: '1px solid',
  borderColor: 'divider',
  bgcolor: 'background.paper',
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
        {credits.isPro ? (
          <Badge tone="warning" size="md" iconLeft={<Crown size={12} />}>
            Pro
          </Badge>
        ) : null}
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
        {!credits.isPro ? (
          <Typography component="span" sx={{ fontSize: 14, color: 'text.disabled' }}>
            / {credits.maxCredits}
          </Typography>
        ) : null}
      </Stack>

      {!credits.isPro ? (
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
      ) : null}

      {credits.nextRegenAt && !credits.isPro ? (
        <Typography sx={{ mt: 1.5, fontSize: 12, color: 'text.secondary' }}>
          Next credit at {new Date(credits.nextRegenAt).toLocaleString()}
        </Typography>
      ) : null}

      {credits.isPro && credits.proExpiresAt ? (
        <Typography sx={{ mt: 1.5, fontSize: 12, color: 'text.secondary' }}>
          {credits.proWillRenew ? 'Renews' : 'Ends'} on{' '}
          {new Date(credits.proExpiresAt).toLocaleDateString()}
        </Typography>
      ) : null}

      <Typography sx={{ mt: 2, fontSize: 12, color: 'text.disabled' }}>
        Subscription upgrades coming soon.
      </Typography>
    </Box>
  );
}
