'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@clerk/nextjs';
import { apiFetch } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';

export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'none';

export interface CreditInfo {
  credits: number;
  nextRegenAt: string | null;
  maxCredits: number;
  isPro: boolean;
  subscriptionStatus: SubscriptionStatus;
  proExpiresAt: string | null;
  proWillRenew: boolean;
}

interface CreditsResponse {
  credits: number;
  next_regen_at: string | null;
  max_credits: number;
  is_pro: boolean;
  subscription_status: SubscriptionStatus;
  pro_expires_at: string | null;
  pro_will_renew: boolean;
}

interface SubscriptionContextValue {
  credits: CreditInfo | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

/** 5-minute poll matches mobile's SubscriptionContext cadence. */
const POLL_INTERVAL_MS = 5 * 60_000;

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { isSignedIn } = useAuth();
  const [credits, setCredits] = useState<CreditInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isSignedIn) {
      setCredits(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // Backend returns snake_case; map to the camelCase shape the rest of
      // the app reads. Mirrors mobile's `mobile/src/services/creditService.ts`.
      const raw = await apiFetch<CreditsResponse>(endpoints.credits);
      setCredits({
        credits: raw.credits ?? 0,
        nextRegenAt: raw.next_regen_at ?? null,
        maxCredits: raw.max_credits ?? 0,
        isPro: raw.is_pro ?? false,
        subscriptionStatus: raw.subscription_status ?? 'none',
        proExpiresAt: raw.pro_expires_at ?? null,
        proWillRenew: raw.pro_will_renew ?? false,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load credits');
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    void refresh();
    if (!isSignedIn) return;
    const t = setInterval(() => void refresh(), POLL_INTERVAL_MS);
    return () => clearInterval(t);
  }, [refresh, isSignedIn]);

  const value = useMemo(
    () => ({ credits, isLoading, error, refresh }),
    [credits, isLoading, error, refresh],
  );

  return (
    <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionContextValue {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used inside <SubscriptionProvider>');
  return ctx;
}

/** Non-throwing variant for surfaces that render both inside and outside the
 *  authenticated provider stack (e.g. the top nav, which is mounted on both
 *  (marketing) and (app) layouts). Returns null when the provider isn't present. */
export function useSubscriptionOptional(): SubscriptionContextValue | null {
  return useContext(SubscriptionContext);
}
