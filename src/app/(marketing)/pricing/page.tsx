'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Check, Sparkles, AlertTriangle } from 'lucide-react';
import { useAuth, useClerk } from '@clerk/nextjs';
import { toast } from 'sonner';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { Button } from '@/components/ui/Button';
import { useSubscriptionOptional } from '@/contexts/SubscriptionContext';

type Plan = 'monthly' | 'annual';

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
    id: 'monthly',
    name: 'Pro Monthly',
    priceLabel: '$9.99',
    cadence: 'per month',
    bullets: [
      'Unlimited AI trip generations',
      'Priority queue during peak hours',
      'Cancel anytime',
    ],
  },
  {
    id: 'annual',
    name: 'Pro Annual',
    priceLabel: '$79.99',
    cadence: 'per year',
    badge: 'Save 33%',
    bullets: [
      'Everything in Monthly',
      'Two months free vs. monthly billing',
      'Cancel anytime',
    ],
  },
];

export default function PricingPage() {
  return (
    <Suspense>
      <PricingInner />
    </Suspense>
  );
}

function PricingInner() {
  const { isSignedIn, isLoaded } = useAuth();
  const { openSignIn } = useClerk();
  const subscription = useSubscriptionOptional();
  const isPro = subscription?.credits?.isPro ?? false;
  const searchParams = useSearchParams();
  const cancelled = searchParams.get('cancelled') === '1';
  const [pending, setPending] = useState<Plan | 'portal' | null>(null);

  const startCheckout = async (plan: Plan) => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      openSignIn({
        fallbackRedirectUrl: '/pricing',
      });
      return;
    }
    setPending(plan);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        toast.error(data.error ?? 'Could not start checkout.');
        setPending(null);
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not start checkout.');
      setPending(null);
    }
  };

  const openPortal = async () => {
    setPending('portal');
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        toast.error(data.error ?? 'Could not open billing portal.');
        setPending(null);
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not open billing portal.');
      setPending(null);
    }
  };

  return (
    <Box sx={{ mx: 'auto', maxWidth: 960, px: { xs: 2, sm: 3 }, py: { xs: 5, sm: 8 } }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography
          component="h1"
          sx={{
            fontFamily: 'var(--font-display, inherit)',
            fontSize: { xs: '2rem', sm: '2.75rem' },
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: 'text.primary',
          }}
        >
          Plan smarter with Pro
        </Typography>
        <Typography sx={{ mt: 1.5, mx: 'auto', maxWidth: 560, fontSize: 16, color: 'text.secondary' }}>
          Unlimited AI generations, priority routing, and the same itinerary engine the mobile app uses.
        </Typography>
      </Box>

      {cancelled ? (
        <Box
          role="status"
          sx={{
            mt: 4,
            mx: 'auto',
            maxWidth: 720,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.25,
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: (t) => alpha('#FF9500', 0.3),
            bgcolor: (t) => alpha('#FF9500', 0.08),
            p: 2,
          }}
        >
          <Box
            component={AlertTriangle}
            aria-hidden
            sx={{ mt: 0.25, width: 16, height: 16, flexShrink: 0, color: '#B36600' }}
          />
          <Typography sx={{ fontSize: 14, color: '#7A4500' }}>
            No charge — you closed checkout before it completed. Pick a plan below to try again.
          </Typography>
        </Box>
      ) : null}

      {isPro ? (
        <Box
          sx={{
            mt: 5,
            mx: 'auto',
            maxWidth: 560,
            borderRadius: 3,
            border: '1px solid',
            borderColor: (t) => alpha(t.palette.primary.main, 0.3),
            bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
            p: 3,
            textAlign: 'center',
          }}
        >
          <Box
            component={Sparkles}
            aria-hidden
            sx={{ width: 24, height: 24, color: 'primary.main', mx: 'auto' }}
          />
          <Typography
            component="h2"
            sx={{ mt: 1, fontSize: 18, fontWeight: 600, color: 'text.primary' }}
          >
            You&apos;re already on Pro
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: 14, color: 'text.secondary' }}>
            Manage your subscription, switch plans, or update your card from the billing portal.
          </Typography>
          <Box sx={{ mt: 2.5, display: 'flex', justifyContent: 'center', gap: 1 }}>
            <Button
              variant="primary"
              size="md"
              loading={pending === 'portal'}
              disabled={pending === 'portal'}
              onClick={() => void openPortal()}
            >
              Manage subscription
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                window.location.href = '/profile';
              }}
            >
              Back to profile
            </Button>
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            mt: 5,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2.5,
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
      )}

      <Typography sx={{ mt: 6, textAlign: 'center', fontSize: 13, color: 'text.disabled' }}>
        Questions about billing?{' '}
        <Box
          component={Link}
          href="/faq"
          sx={{ color: 'primary.main', textDecoration: 'none', fontWeight: 500 }}
        >
          Check the FAQ
        </Box>
        .
      </Typography>
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
      component="section"
      sx={{
        position: 'relative',
        borderRadius: 3,
        border: '1px solid',
        borderColor: isAnnual ? 'primary.main' : 'divider',
        bgcolor: 'background.paper',
        p: { xs: 2.5, sm: 3 },
        boxShadow: isAnnual ? 6 : 0,
      }}
    >
      {plan.badge ? (
        <Box
          sx={{
            position: 'absolute',
            top: -12,
            right: 16,
            borderRadius: 999,
            bgcolor: 'primary.main',
            color: 'common.white',
            px: 1.25,
            py: 0.25,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          {plan.badge}
        </Box>
      ) : null}
      <Typography
        component="h2"
        sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary' }}
      >
        {plan.name}
      </Typography>
      <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
        <Typography sx={{ fontSize: 36, fontWeight: 700, color: 'text.primary' }}>
          {plan.priceLabel}
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
          {plan.cadence}
        </Typography>
      </Box>
      <Box component="ul" sx={{ mt: 2, p: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        {plan.bullets.map((b) => (
          <Box
            key={b}
            component="li"
            sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, fontSize: 14, color: 'text.secondary' }}
          >
            <Box
              component={Check}
              aria-hidden
              sx={{ mt: 0.25, width: 16, height: 16, flexShrink: 0, color: 'primary.main' }}
            />
            <span>{b}</span>
          </Box>
        ))}
      </Box>
      <Button
        variant={isAnnual ? 'primary' : 'secondary'}
        size="lg"
        fullWidth
        loading={loading}
        disabled={disabled || loading}
        onClick={onSubscribe}
        style={{ marginTop: 24 }}
      >
        Subscribe
      </Button>
    </Box>
  );
}
