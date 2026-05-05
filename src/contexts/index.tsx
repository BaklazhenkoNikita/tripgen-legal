'use client';

import { type ReactNode } from 'react';
import { SnackbarProvider } from './SnackbarContext';
import { CityProvider } from './CityContext';
import { ActiveTripProvider } from './ActiveTripContext';
import { SubscriptionProvider } from './SubscriptionContext';
import { AIContextProvider } from './AIContext';
import { SessionExpiredHost } from './SessionExpiredHost';
import { AILimitPopupHost } from './AILimitPopupHost';
import { useClerkTokenInit } from '@/lib/auth/clerk';

/** Mounts every app-level context in a single place.
 *  Order: SessionExpired/AILimit subscribe to errorBus and need Snackbar + Clerk routing,
 *  so they live inside SnackbarProvider. City + ActiveTrip + Subscription + AI are siblings. */
export function AppContextsRoot({ children }: { children: ReactNode }) {
  // Register Clerk's getToken with apiFetch on every route — not just (app).
  // SubscriptionProvider polls /api/credits from marketing pages too, and
  // without this registration getToken() returns null → no Authorization
  // header → 401. Done at render time (not useEffect) so the first poll
  // wins the race; same rationale documented in lib/auth/clerk.ts.
  useClerkTokenInit();

  return (
    <SnackbarProvider>
      <CityProvider>
        <ActiveTripProvider>
          <SubscriptionProvider>
            <AIContextProvider>
              <SessionExpiredHost />
              <AILimitPopupHost />
              {children}
            </AIContextProvider>
          </SubscriptionProvider>
        </ActiveTripProvider>
      </CityProvider>
    </SnackbarProvider>
  );
}

export { useSnackbar } from './SnackbarContext';
export { useCity, useCityOptional } from './CityContext';
export { useActiveTrip } from './ActiveTripContext';
export { useSubscription, useSubscriptionOptional } from './SubscriptionContext';
export { useAIContext } from './AIContext';
