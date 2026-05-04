'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { subscribeApiErrors, type ApiErrorEvent } from '@/lib/api/errorBus';
import { useSubscriptionOptional } from './SubscriptionContext';
import { tgShadow } from '@/theme/shadows';

interface LimitState {
  message?: string;
  deadlineMs?: number;
}

export function AILimitPopupHost() {
  const [limit, setLimit] = useState<LimitState | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const subscription = useSubscriptionOptional();

  useEffect(() => {
    const unsubscribe = subscribeApiErrors((event: ApiErrorEvent) => {
      if (event.type !== 'rate_limit') return;
      setLimit({
        message: event.message,
        deadlineMs:
          event.retryAfterSeconds != null
            ? Date.now() + event.retryAfterSeconds * 1000
            : subscription?.credits?.nextRegenAt
              ? Date.parse(subscription.credits.nextRegenAt)
              : undefined,
      });
    });
    return unsubscribe;
  }, [subscription?.credits?.nextRegenAt]);

  useEffect(() => {
    if (!limit?.deadlineMs) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [limit?.deadlineMs]);

  const countdown = useMemo(() => {
    if (!limit?.deadlineMs) return null;
    const remaining = Math.max(0, Math.round((limit.deadlineMs - now) / 1000));
    return formatCountdown(remaining);
  }, [limit?.deadlineMs, now]);

  if (!limit) return null;
  const credits = subscription?.credits;

  return (
    <Box
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-limit-title"
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: (t) => t.zIndex.modal,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'rgba(0,0,0,0.40)',
        p: 2,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 480,
          borderRadius: 2,
          bgcolor: 'background.paper',
          p: 3,
          boxShadow: (t) => tgShadow(t, 'sheet'),
        }}
      >
        <Typography
          id="ai-limit-title"
          component="h2"
          sx={{ fontSize: 18, fontWeight: 600, color: 'text.primary' }}
        >
          You&rsquo;re out of AI credits
        </Typography>
        <Typography sx={{ mt: 1, fontSize: 14, color: 'text.secondary' }}>
          {limit.message ??
            "You've hit today's AI generation limit. Credits regenerate over time — thanks for your patience."}
        </Typography>

        {credits ? (
          <Box
            sx={{
              mt: 2,
              borderRadius: 1.5,
              border: (t) => `1px solid ${t.palette.divider}`,
              bgcolor: 'action.hover',
              px: 1.5,
              py: 1,
              fontSize: 14,
              color: 'text.primary',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box component="span" sx={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.disabled' }}>
                Balance
              </Box>
              <Box component="span" sx={{ fontWeight: 600 }}>
                {credits.credits} / {credits.maxCredits}
              </Box>
            </Box>
            {countdown ? (
              <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box component="span" sx={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.disabled' }}>
                  Next credit
                </Box>
                <Box component="span" sx={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace', fontSize: 12, color: 'text.secondary' }}>
                  {countdown}
                </Box>
              </Box>
            ) : null}
          </Box>
        ) : countdown ? (
          <Typography sx={{ mt: 1.5, fontSize: 14, color: 'text.disabled' }}>
            Try again in {countdown}.
          </Typography>
        ) : null}

        <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
          {!credits?.isPro ? (
            <Button
              component={Link}
              href="/pricing"
              variant="contained"
              color="primary"
              onClick={() => setLimit(null)}
              sx={{ borderRadius: 1.5, px: 2.5, py: 1 }}
            >
              Upgrade to Pro
            </Button>
          ) : null}
          <Button
            variant="outlined"
            onClick={() => setLimit(null)}
            sx={{
              borderRadius: 1.5,
              px: 2.5,
              py: 1,
              borderColor: 'divider',
              color: 'text.primary',
              '&:hover': { bgcolor: 'action.hover', borderColor: 'text.disabled' },
            }}
          >
            Got it
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

function formatCountdown(totalSeconds: number): string {
  if (totalSeconds <= 0) return 'now';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${String(s).padStart(2, '0')}s`;
  return `${s}s`;
}
