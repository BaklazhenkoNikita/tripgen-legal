'use client';

import { useState } from 'react';
import { useAuth, useClerk } from '@clerk/nextjs';
import { toast } from 'sonner';

export type Plan = 'monthly' | 'annual';

interface Options {
  source?: string;
  campaign?: string;
  /** Path to come back to after sign-in, defaults to current path + search. */
  signInReturnTo?: string;
}

export function useStripeCheckout(opts: Options = {}) {
  const { isSignedIn, isLoaded } = useAuth();
  const { openSignIn } = useClerk();
  const [pending, setPending] = useState<Plan | null>(null);

  const startCheckout = async (plan: Plan) => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      const fallback =
        opts.signInReturnTo ??
        (typeof window !== 'undefined'
          ? window.location.pathname + window.location.search
          : '/pricing');
      openSignIn({ fallbackRedirectUrl: fallback });
      return;
    }
    setPending(plan);
    try {
      const body: Record<string, string> = { plan };
      if (opts.source) body.source = opts.source;
      if (opts.campaign) body.campaign = opts.campaign;
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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

  return { startCheckout, pending };
}
