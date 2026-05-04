'use client';

import { type ReactNode } from 'react';
import { SnackbarProvider } from './SnackbarContext';
import { CityProvider } from './CityContext';
import { ActiveTripProvider } from './ActiveTripContext';
import { SubscriptionProvider } from './SubscriptionContext';
import { AIContextProvider } from './AIContext';
import { SessionExpiredHost } from './SessionExpiredHost';
import { AILimitPopupHost } from './AILimitPopupHost';

/** Mounts every app-level context in a single place.
 *  Order: SessionExpired/AILimit subscribe to errorBus and need Snackbar + Clerk routing,
 *  so they live inside SnackbarProvider. City + ActiveTrip + Subscription + AI are siblings. */
export function AppContextsRoot({ children }: { children: ReactNode }) {
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
