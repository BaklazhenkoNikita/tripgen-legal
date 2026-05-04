'use client';

import Link from 'next/link';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { useSubscription } from '@/contexts';

/**
 * Display-only paywall surface. No Stripe/Paddle checkout yet — v1 shows the
 * credit balance, next regen time, and a "coming soon" upgrade CTA. Drop-in
 * on the profile page + link from the AI-limit dialog.
 */
export function PaywallView() {
  const { credits: info } = useSubscription();
  const credits = info?.credits ?? 0;
  const maxCredits = info?.maxCredits ?? 3;
  const nextRegenAt = info?.nextRegenAt ?? null;
  const isPro = info?.isPro ?? false;

  if (isPro) {
    return (
      <Box
        component="section"
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: (t) => alpha(t.palette.primary.main, 0.3),
          bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
          p: 2,
        }}
      >
        <Typography
          component="h3"
          sx={{ fontSize: 14, fontWeight: 600, color: 'primary.dark' }}
        >
          Periplo Pro
        </Typography>
        <Typography sx={{ mt: 0.5, fontSize: 12, color: 'primary.dark' }}>
          You have unlimited trip generations. Thanks for supporting us.
        </Typography>
      </Box>
    );
  }

  const nextRegen = nextRegenAt ? formatRelative(nextRegenAt) : null;

  return (
    <Box
      component="section"
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        p: 2,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography
          component="h3"
          sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary' }}
        >
          AI credits
        </Typography>
        <Typography component="span" sx={{ fontSize: 12, color: 'text.secondary' }}>
          {credits} / {maxCredits}
        </Typography>
      </Stack>
      <Box
        sx={{
          mt: 1,
          height: 8,
          width: '100%',
          overflow: 'hidden',
          borderRadius: 999,
          bgcolor: 'action.hover',
        }}
      >
        <Box
          sx={{
            height: '100%',
            bgcolor: 'primary.main',
            transition: 'width 200ms',
            width: `${Math.max(0, Math.min(100, (credits / Math.max(1, maxCredits)) * 100))}%`,
          }}
        />
      </Box>
      {nextRegen ? (
        <Typography sx={{ mt: 1, fontSize: 12, color: 'text.secondary' }}>
          Next credit back {nextRegen}.
        </Typography>
      ) : null}

      <Box
        sx={{
          mt: 2,
          borderRadius: 2,
          border: '1px solid',
          borderColor: (t) => alpha(t.palette.primary.main, 0.25),
          bgcolor: (t) => alpha(t.palette.primary.main, 0.06),
          p: 1.5,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
          Unlimited generations and priority routing with Pro.
        </Typography>
        <Box
          component={Link}
          href="/pricing"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 1,
            bgcolor: 'primary.main',
            px: 1.5,
            py: 0.75,
            fontSize: 13,
            fontWeight: 600,
            color: 'common.white',
            textDecoration: 'none',
            '&:hover': { opacity: 0.9 },
          }}
        >
          Upgrade to Pro
        </Box>
      </Box>
    </Box>
  );
}

function formatRelative(iso: string): string | null {
  const ts = Date.parse(iso);
  if (!Number.isFinite(ts)) return null;
  const diff = ts - Date.now();
  if (diff <= 0) return 'soon';
  const mins = Math.round(diff / 60_000);
  if (mins < 60) return `in ${mins}m`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `in ${hrs}h`;
  const days = Math.round(hrs / 24);
  return `in ${days}d`;
}
