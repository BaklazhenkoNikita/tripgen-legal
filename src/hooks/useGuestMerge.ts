'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import {
  getGuestId,
  getMergedGuestId,
  setMergedGuestId,
} from '@/lib/auth/guestId';
import { useSnackbar } from '@/contexts';

/**
 * Fires once per Clerk sign-in: calls `POST /api/profiles/merge` so any
 * trips / signals / shortlists accumulated under the guest id get reassigned
 * to the authenticated user, then records the merged id so we don't repeat.
 *
 * (This route used to be named `merge-profile` under the travel router on the
 * client side; the constant was corrected in Phase J — backend always had it
 * on the profiles router.)
 *
 * Mirrors mobile's `AuthBootstrap` effect (trip_gen_mobile/mobile/src/app/_layout.tsx:143-197).
 */
interface MergeResponse {
  trips_merged?: number;
  shortlist_merged?: number;
  signals_merged?: number;
}

const ONBOARDING_BUFFER_KEY = 'tripgen_onboarding_buffer';

export function useGuestMerge() {
  const { isSignedIn, userId } = useAuth();
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();
  const inFlight = useRef(false);

  useEffect(() => {
    if (!isSignedIn || !userId) return;
    if (inFlight.current) return;

    const guestId = getGuestId();
    const already = getMergedGuestId();
    if (already === guestId) return;

    inFlight.current = true;
    (async () => {
      try {
        const res = await apiFetch<MergeResponse>(endpoints.mergeProfile, {
          method: 'POST',
          body: { guest_id: guestId },
        });
        setMergedGuestId(guestId);

        // If the user completed onboarding while a guest, flush the buffered
        // preferences into their profile now.
        try {
          const buf = localStorage.getItem(ONBOARDING_BUFFER_KEY);
          if (buf) {
            const parsed = JSON.parse(buf) as {
              vibes?: string[];
              energy?: string;
              who?: string;
              budget?: string;
            };
            await apiFetch(endpoints.profileById(userId), {
              method: 'PATCH',
              body: {
                preferences: {
                  preferred_activity_types: parsed.vibes ?? [],
                  vibe_tags: parsed.vibes ?? [],
                  energy_level: parsed.energy || undefined,
                  who: parsed.who || undefined,
                  budget: parsed.budget || undefined,
                },
                onboarding_completed: true,
              },
            });
            localStorage.removeItem(ONBOARDING_BUFFER_KEY);
          }
        } catch {
          // buffer flush failures are non-blocking — onboarding can be re-run from profile
        }

        // Invalidate user-scoped queries so they refetch with the merged identity.
        queryClient.invalidateQueries({ queryKey: ['trips'] });
        queryClient.invalidateQueries({ queryKey: ['activities'] });
        queryClient.invalidateQueries({ queryKey: ['chats'] });
        queryClient.invalidateQueries({ queryKey: ['shortlist'] });
        queryClient.invalidateQueries({ queryKey: ['profile'] });

        const merged = (res?.trips_merged ?? 0) + (res?.shortlist_merged ?? 0);
        if (merged > 0) {
          showSnackbar({
            message: `Welcome back — ${merged} item${merged === 1 ? '' : 's'} from your guest session moved to your account.`,
          });
        }
      } catch {
        // Soft failure — leave guest id in place so a later sign-in retries.
        // Don't surface to user (interrupting sign-in is worse than a silent retry).
      } finally {
        inFlight.current = false;
      }
    })();
  }, [isSignedIn, userId, queryClient, showSnackbar]);
}
