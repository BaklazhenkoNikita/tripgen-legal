'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Check, Minus, Sparkles, AlertTriangle, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/layout/Section';
import { radii, textScale } from '@/theme/standards';
import { useSubscriptionOptional } from '@/contexts/SubscriptionContext';
import { useStripeCheckout, type Plan } from '@/hooks/useStripeCheckout';

interface PlanCard {
  id: Plan | 'free';
  name: string;
  priceLabel: string;
  cadence: string;
  badge?: string;
  tagline: string;
  bullets: string[];
  cta: string;
}

const PLANS: PlanCard[] = [
  {
    id: 'free',
    name: 'Free',
    priceLabel: '$0',
    cadence: 'forever',
    tagline: 'Everything you need to plan a real trip.',
    bullets: [
      '3 trip credits — one refills every 4 hours',
      'Day-by-day itineraries with maps',
      'Save, share, and edit your trips',
    ],
    cta: 'Start planning — free',
  },
  {
    id: 'monthly',
    name: 'Pro Monthly',
    priceLabel: '$4.99',
    cadence: 'per month',
    tagline: 'For frequent planners who want no limits.',
    bullets: [
      'Unlimited AI trip generations',
      'Priority queue during peak hours',
      'Cancel anytime',
    ],
    cta: 'Subscribe',
  },
  {
    id: 'annual',
    name: 'Pro Annual',
    priceLabel: '$29.99',
    cadence: 'per year',
    badge: 'Save 50%',
    tagline: 'Everything in Monthly, six months free.',
    bullets: [
      'Everything in Pro Monthly',
      'Six months free vs. monthly billing',
      'Cancel anytime',
    ],
    cta: 'Subscribe',
  },
];

const COMPARISON: { label: string; free: string | boolean; pro: string | boolean }[] = [
  { label: 'AI trip generations', free: '3-credit bank, refills over the day', pro: 'Unlimited' },
  { label: 'Priority queue during peak hours', free: false, pro: true },
  { label: 'Trip chat & smart suggestions', free: 'Standard limits', pro: 'Elevated limits' },
  { label: 'Day-by-day itineraries, maps & exports', free: true, pro: true },
  { label: 'Share & collaborate on trips', free: true, pro: true },
  { label: 'One subscription across web and mobile app', free: true, pro: true },
];

const BILLING_FAQ: { q: string; a: string }[] = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel from the billing portal in one click — you keep Pro until the end of the period you already paid for, and you are never charged again.',
  },
  {
    q: 'What exactly is in the free plan?',
    a: 'The full product: AI-generated day-by-day itineraries, maps, editing, sharing, and trip chat. Free plans use a bank of 3 trip credits; one credit refills every 4 hours.',
  },
  {
    q: 'Does Pro cover the mobile app too?',
    a: 'Yes — Pro unlocks unlimited generations on the web, in the mobile app, and through AI connectors like Claude and ChatGPT. There is no separate tier per channel.',
  },
  {
    q: 'How does billing work?',
    a: 'Payments are processed securely by Stripe. We never see your card details. For billing questions, email support@periploapp.com.',
  },
];

export function PricingClient() {
  return (
    <Suspense>
      <PricingInner />
    </Suspense>
  );
}

function PricingInner() {
  const subscription = useSubscriptionOptional();
  const isPro = subscription?.credits?.isPro ?? false;
  const searchParams = useSearchParams();
  const cancelled = searchParams.get('cancelled') === '1';
  const { startCheckout, pending: checkoutPending } = useStripeCheckout({
    signInReturnTo: '/pricing',
  });
  const [portalPending, setPortalPending] = useState(false);
  const pending: Plan | 'portal' | null = portalPending
    ? 'portal'
    : checkoutPending;

  const openPortal = async () => {
    setPortalPending(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        toast.error(data.error ?? 'Could not open billing portal.');
        setPortalPending(false);
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not open billing portal.');
      setPortalPending(false);
    }
  };

  return (
    <Section width="content" component="div">
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h1" component="h1" sx={{ color: 'text.primary' }}>
          Plan smarter with Pro
        </Typography>
        <Typography sx={{ mt: 2, mx: 'auto', maxWidth: 560, color: 'text.secondary' }}>
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
            borderColor: (t) => alpha(t.palette.warning.main, 0.3),
            bgcolor: (t) => alpha(t.palette.warning.main, 0.08),
            p: 2,
          }}
        >
          <Box
            component={AlertTriangle}
            aria-hidden
            sx={{ mt: 0.25, width: 16, height: 16, flexShrink: 0, color: 'warning.dark' }}
          />
          <Typography variant="body2" sx={{ color: 'warning.dark' }}>
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
            borderRadius: radii.cardLarge,
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
          <Typography component="h2" sx={{ mt: 1, ...textScale.title, color: 'text.primary' }}>
            You&apos;re already on Pro
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
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
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 2.5,
            alignItems: 'stretch',
          }}
        >
          {PLANS.map((p) => (
            <PlanColumn
              key={p.id}
              plan={p}
              loading={p.id !== 'free' && pending === p.id}
              disabled={p.id !== 'free' && pending !== null && pending !== p.id}
              onSubscribe={p.id === 'free' ? undefined : () => void startCheckout(p.id as Plan)}
            />
          ))}
        </Box>
      )}

      <ComparisonTable />

      <BillingFaq />

      <Typography sx={{ mt: 5, textAlign: 'center', ...textScale.meta, color: 'text.disabled' }}>
        Secure checkout via Stripe · Cancel anytime · More questions?{' '}
        <Box
          component={Link}
          href="/faq"
          sx={{ color: 'primary.main', textDecoration: 'none', fontWeight: 500 }}
        >
          Check the FAQ
        </Box>
        .
      </Typography>
    </Section>
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
  onSubscribe?: () => void;
}) {
  const isAnnual = plan.id === 'annual';
  const isFree = plan.id === 'free';
  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: radii.cardLarge,
        border: '1px solid',
        borderColor: isAnnual ? 'primary.main' : 'divider',
        bgcolor: 'background.paper',
        p: { xs: 3, sm: 3.5 },
        boxShadow: isAnnual ? 'var(--tg-shadow-card-hover)' : 'var(--tg-shadow-card)',
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 'var(--tg-shadow-card-hover)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Typography component="h2" sx={{ ...textScale.label, color: 'text.primary' }}>
          {plan.name}
        </Typography>
        {plan.badge ? (
          <Box
            sx={{
              borderRadius: radii.pill,
              bgcolor: 'primary.main',
              color: 'common.white',
              px: 1.25,
              py: 0.25,
              ...textScale.meta,
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {plan.badge}
          </Box>
        ) : null}
      </Box>
      <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
        <Typography sx={{ fontSize: '2.25rem', fontWeight: 700, lineHeight: 1.1, color: 'text.primary' }}>
          {plan.priceLabel}
        </Typography>
        <Typography sx={{ ...textScale.meta, fontWeight: 400, color: 'text.secondary' }}>
          {plan.cadence}
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
        {plan.tagline}
      </Typography>
      <Box component="ul" sx={{ mt: 2, mb: 0, p: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        {plan.bullets.map((b) => (
          <Box
            key={b}
            component="li"
            sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, ...textScale.support, color: 'text.secondary' }}
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
      <Box sx={{ mt: 'auto', pt: 3 }}>
        {isFree ? (
          <Button variant="secondary" size="lg" fullWidth asChild>
            <Link href="/trip">{plan.cta}</Link>
          </Button>
        ) : (
          <Button
            variant={isAnnual ? 'primary' : 'secondary'}
            size="lg"
            fullWidth
            loading={loading}
            disabled={disabled || loading}
            onClick={onSubscribe}
          >
            {plan.cta}
          </Button>
        )}
      </Box>
    </Box>
  );
}

function ComparisonCell({ value }: { value: string | boolean }) {
  if (value === true) {
    return (
      <Box component={Check} aria-label="Included" sx={{ width: 18, height: 18, color: 'primary.main' }} />
    );
  }
  if (value === false) {
    return (
      <Box component={Minus} aria-label="Not included" sx={{ width: 18, height: 18, color: 'text.disabled' }} />
    );
  }
  return <span>{value}</span>;
}

function ComparisonTable() {
  return (
    <Box sx={{ mt: { xs: 7, md: 9 } }}>
      <Typography variant="h3" component="h2" sx={{ textAlign: 'center', color: 'text.primary' }}>
        Compare plans
      </Typography>
      <Box
        sx={{
          mt: 3,
          mx: 'auto',
          maxWidth: 760,
          borderRadius: radii.card,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          overflow: 'hidden',
          boxShadow: 'var(--tg-shadow-card)',
        }}
      >
        <Box
          component="table"
          sx={{
            width: '100%',
            borderCollapse: 'collapse',
            '& th, & td': {
              textAlign: 'left',
              px: { xs: 1.5, sm: 2.5 },
              py: 1.5,
              borderBottom: '1px solid',
              borderColor: 'divider',
              verticalAlign: 'middle',
              ...textScale.support,
            },
            '& tr:last-of-type td': { borderBottom: 0 },
            '& td:not(:first-of-type), & th:not(:first-of-type)': {
              textAlign: 'center',
              width: { xs: '27%', sm: '24%' },
            },
          }}
        >
          <Box component="thead">
            <Box component="tr" sx={{ bgcolor: 'action.hover' }}>
              <Box component="th" sx={{ ...textScale.label }}>
                Features
              </Box>
              <Box component="th" sx={{ ...textScale.label }}>
                Free
              </Box>
              <Box component="th" sx={{ ...textScale.label, color: 'primary.main' }}>
                Pro
              </Box>
            </Box>
          </Box>
          <Box component="tbody">
            {COMPARISON.map((row) => (
              <Box component="tr" key={row.label}>
                <Box component="td" sx={{ color: 'text.primary' }}>
                  {row.label}
                </Box>
                <Box component="td" sx={{ color: 'text.secondary' }}>
                  <ComparisonCell value={row.free} />
                </Box>
                <Box component="td" sx={{ color: 'text.secondary' }}>
                  <ComparisonCell value={row.pro} />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function BillingFaq() {
  return (
    <Box sx={{ mt: { xs: 7, md: 9 }, mx: 'auto', maxWidth: 760 }}>
      <Typography variant="h3" component="h2" sx={{ textAlign: 'center', color: 'text.primary' }}>
        Billing questions
      </Typography>
      <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {BILLING_FAQ.map((faq) => (
          <Box
            component="details"
            key={faq.q}
            className="group"
            sx={{
              borderRadius: radii.card,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              p: 2.5,
              boxShadow: 'var(--tg-shadow-card)',
              transition: 'all 0.2s',
              '&[open]': { bgcolor: 'action.hover' },
              '&:hover:not([open])': { borderColor: 'text.disabled' },
            }}
          >
            <Box
              component="summary"
              sx={{
                display: 'flex',
                cursor: 'pointer',
                listStyle: 'none',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                ...textScale.label,
                fontSize: '0.95rem',
                color: 'text.primary',
                '&::-webkit-details-marker': { display: 'none' },
              }}
            >
              <span>{faq.q}</span>
              <Box
                aria-hidden
                sx={{
                  display: 'flex',
                  flexShrink: 0,
                  color: 'text.disabled',
                  transition: 'transform 200ms',
                  '.group[open] &': { transform: 'rotate(180deg)' },
                }}
              >
                <ChevronDown size={16} />
              </Box>
            </Box>
            <Typography variant="body2" sx={{ mt: 1.5, color: 'text.secondary' }}>
              {faq.a}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
