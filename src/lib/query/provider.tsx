'use client';

import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from './client';
import { startQueryPersister } from './persister';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  useEffect(() => {
    // No-op unless NEXT_PUBLIC_ENABLE_QUERY_PERSIST=1. The persister mirrors
    // the cache to IndexedDB on a 3s throttle and rehydrates on next load.
    return startQueryPersister(queryClient);
  }, [queryClient]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
