'use client';

import { useEffect } from 'react';
import { useClerk, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { subscribeApiErrors } from '@/lib/api/errorBus';
import { useSnackbar } from './SnackbarContext';

/** Subscribes to the API error bus and handles `session_expired` signals:
 *  sign user out, clear caches, snackbar, bounce to `/`.
 *  Mirrors mobile's `SessionExpiredHost`. */
export function SessionExpiredHost() {
  const { signOut } = useClerk();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    // Local dev with a `pk_test_` Clerk key talks to the deployed backend,
    // which only trusts the production Clerk issuer — every authed call 401s.
    // Bouncing the user out on each one makes the app unusable; stay put and
    // let the affected calls fail in place. Real prod (pk_live_) is unchanged.
    const isDevClerk =
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_test_');

    const unsubscribe = subscribeApiErrors((event) => {
      if (event.type !== 'session_expired') return;
      if (!isSignedIn) return;
      if (isDevClerk) {
        console.warn(
          '[dev] Backend rejected the dev Clerk token (401). Staying signed in.',
        );
        return;
      }
      queryClient.clear();
      void signOut().catch(() => {});
      showSnackbar({ message: 'Session expired. Please sign in again.' });
      router.replace('/');
    });
    return unsubscribe;
  }, [signOut, isSignedIn, router, queryClient, showSnackbar]);

  return null;
}
