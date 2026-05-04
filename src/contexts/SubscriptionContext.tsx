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
      const next = await apiFetch<CreditInfo>(endpoints.credits);
      setCredits(next);
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
