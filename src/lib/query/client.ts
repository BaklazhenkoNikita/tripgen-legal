import { QueryClient } from '@tanstack/react-query';
import { shouldRetryQuery, queryRetryDelay } from '@/lib/api/retry';

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        // gc = 24h so offline + tab-switch reads still hit the cache; mirror
        // of mobile's `queryClient.ts`. Persister (Phase L, feature-flagged)
        // writes a subset of this cache to IndexedDB on a 3s throttle.
        gcTime: 24 * 60 * 60 * 1000,
        retry: shouldRetryQuery,
        retryDelay: queryRetryDelay,
        refetchOnWindowFocus: false,
      },
      mutations: {
        // Mutations default to no retry; individual `useMutation` calls can
        // opt in via `retry: shouldRetryQuery`. This matches mobile.
        retry: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  if (typeof window === 'undefined') {
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}
