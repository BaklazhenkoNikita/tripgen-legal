'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth, useClerk, useUser } from '@clerk/nextjs';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useStripeCheckout, type Plan } from '@/hooks/useStripeCheckout';
import { useSubscriptionOptional } from '@/contexts/SubscriptionContext';

interface PlanCard {
  id: Plan;
  name: string;
  priceLabel: string;
  cadence: string;
  badge?: string;
  bullets: string[];
}

const PLANS: PlanCard[] = [
  {
    id: 'annual',
    name: 'Pro Annual',
    priceLabel: '$29.99',
    cadence: 'per year',
    badge: 'Best value',
    bullets: [
      'Unlimited trips in Claude / ChatGPT',
      'Six months free vs. monthly',
      'Cancel anytime',
    ],
  },
  {
    id: 'monthly',
    name: 'Pro Monthly',
    priceLabel: '$4.99',
    cadence: 'per month',
    bullets: [
      'Unlimited trips in Claude / ChatGPT',
      'Cancel anytime',
    ],
  },
];

export function McpUpgradeCheckout() {
  const searchParams = useSearchParams();
  const utmSource = searchParams.get('utm_source') ?? undefined;
  const utmCampaign = searchParams.get('utm_campaign') ?? undefined;

  const { isSignedIn, isLoaded } = useAuth();
  const { openSignIn } = useClerk();
  const { user } = useUser();
  const subscription = useSubscriptionOptional();
  const isPro = subscription?.credits?.isPro ?? false;

  // Build the return URL once on mount so the sign-in detour preserves UTMs.
  const [returnTo, setReturnTo] = useState<string | undefined>();
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setReturnTo(window.location.pathname + window.location.search);
  }, []);

  const { startCheckout, pending } = useStripeCheckout({
    source: utmSource,
    campaign: utmCampaign,
    signInReturnTo: returnTo,
  });

  if (isLoaded && isSignedIn && isPro) {
    return (
      <Box
        component="section"
        sx={{
          mb: 3,
          borderRadius: 2.5,
          border: '1px solid',
          borderColor: 'rgb(var(--tg-palette-primary-mainChannel) / 0.25)',
          bgcolor: 'rgb(var(--tg-palette-primary-mainChannel) / 0.08)',
          p: { xs: 2.5, md: 3 },
        }}
      >
        <Typography sx={{ fontSize: 16, fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
          You&apos;re already on Pro.
        </Typography>
        <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
          Head back to Claude or ChatGPT — your next request will be unlimited.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      component="section"
      sx={{
        mb: 3,
        borderRadius: 2.5,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        p: { xs: 2.5, md: 3.5 },
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
      }}
    >
      <Typography
        component="h2"
        sx={{
          fontFamily: 'var(--font-display), Georgia, "Times New Roman", serif',
          fontSize: '1.375rem',
          lineHeight: 1.25,
          mb: 0.5,
          color: 'text.primary',
        }}
      >
        Subscribe to keep planning
      </Typography>
      <Typography sx={{ fontSize: 14, color: 'text.secondary', mb: 2.5 }}>
        Unlimited Periplo trips inside Claude, ChatGPT, and the mobile app —
        one subscription covers them all.
      </Typography>

      {!isLoaded ? (
        <Box sx={{ height: 220 }} />
      ) : !isSignedIn ? (
        <Box>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => {
              const fallback =
                returnTo ??
                (typeof window !== 'undefined'
                  ? window.location.pathname + window.location.search
                  : '/legal/mcp-upgrade');
              openSignIn({ fallbackRedirectUrl: fallback });
            }}
          >
            Sign in to subscribe
          </Button>
          <Typography
            sx={{ mt: 1.5, fontSize: 12, color: 'text.disabled', textAlign: 'center' }}
          >
            Use the same account you signed in with on Claude or ChatGPT so your
            Pro status follows you.
          </Typography>
        </Box>
      ) : (
        <Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2,
            }}
          >
            {PLANS.map((p) => (
              <PlanColumn
                key={p.id}
                plan={p}
                loading={pending === p.id}
                disabled={pending !== null && pending !== p.id}
                onSubscribe={() => void startCheckout(p.id)}
              />
            ))}
          </Box>
          <Typography
            sx={{ mt: 2, fontSize: 12, color: 'text.disabled', textAlign: 'center' }}
          >
            Subscribing as{' '}
            <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              {user?.primaryEmailAddress?.emailAddress ?? '—'}
            </Box>
            . Wrong account?{' '}
            <Box
              component="button"
              type="button"
              onClick={() => openSignIn({ fallbackRedirectUrl: returnTo })}
              sx={{
                background: 'none',
                border: 'none',
                p: 0,
                color: 'primary.main',
                cursor: 'pointer',
                font: 'inherit',
                textDecoration: 'underline',
              }}
            >
              Switch
            </Box>
            .
          </Typography>
        </Box>
      )}
    </Box>
  );
}

function PlanColumn({
  plan,
  loading,
  disabled,
  onSubscribe,
}: {
  plan: PlanCard;
  loading: boolean;
  disabled: boolean;
  onSubscribe: () => void;
}) {
  const isAnnual = plan.id === 'annual';
  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: 2,
        border: '1px solid',
        borderColor: isAnnual ? 'primary.main' : 'divider',
        bgcolor: 'background.paper',
        p: { xs: 2, sm: 2.5 },
      }}
    >
      {plan.badge ? (
        <Box
          sx={{
            position: 'absolute',
            top: -10,
            right: 12,
            borderRadius: 999,
            bgcolor: 'primary.main',
            color: 'common.white',
            px: 1.25,
            py: 0.25,
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          {plan.badge}
        </Box>
      ) : null}
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary' }}>
        {plan.name}
      </Typography>
      <Box sx={{ mt: 1, display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
        <Typography sx={{ fontSize: 28, fontWeight: 700, color: 'text.primary' }}>
          {plan.priceLabel}
        </Typography>
        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
          {plan.cadence}
        </Typography>
      </Box>
      <Box
        component="ul"
        sx={{
          mt: 1.5,
          p: 0,
          listStyle: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
        }}
      >
        {plan.bullets.map((b) => (
          <Box
            key={b}
            component="li"
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 0.75,
              fontSize: 13,
              color: 'text.secondary',
            }}
          >
            <Box
              component={Check}
              aria-hidden
              sx={{ mt: 0.25, width: 14, height: 14, flexShrink: 0, color: 'primary.main' }}
            />
            <span>{b}</span>
          </Box>
        ))}
      </Box>
      <Button
        variant={isAnnual ? 'primary' : 'secondary'}
        size="md"
        fullWidth
        loading={loading}
        disabled={disabled || loading}
        onClick={onSubscribe}
        style={{ marginTop: 16 }}
      >
        Subscribe
      </Button>
    </Box>
  );
}
