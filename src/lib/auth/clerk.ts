'use client';

import { useAuth } from '@clerk/nextjs';
import { setTokenGetter } from './token';

/**
 * Registers Clerk's getToken with the API client during render — not in
 * useEffect. useEffects fire bottom-up, so an effect here would lose the race
 * against `useGuestMerge` and `SubscriptionProvider.refresh`, leaving the
 * first authed calls into (app) without an Authorization header (401s).
 */
export function useClerkTokenInit() {
  const { getToken } = useAuth();
  setTokenGetter(() => getToken());
}
