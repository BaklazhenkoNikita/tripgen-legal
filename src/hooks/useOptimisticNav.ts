'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * Shared optimistic-active + eager-prefetch behavior for the primary nav
 * surfaces (desktop Navigation pills, MobileDock tabs).
 *
 * - `pendingHref` holds the tapped destination from the click frame until
 *   the route catches up, so active styling doesn't lag the in-flight
 *   navigation.
 * - Every destination is prefetched on mount: `<Link prefetch>` only fires
 *   on viewport intersection, which is too late for a cold first tap — the
 *   user would pay the full RSC + bundle fetch on the first hop.
 */
export function useOptimisticNav(hrefs: readonly string[]) {
  const pathname = usePathname() ?? '/';
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    if (pendingHref && pathname.startsWith(pendingHref.split('?')[0])) {
      setPendingHref(null);
    }
  }, [pathname, pendingHref]);

  useEffect(() => {
    for (const href of hrefs) router.prefetch(href);
  }, [router, hrefs]);

  return { pathname, pendingHref, setPendingHref };
}
