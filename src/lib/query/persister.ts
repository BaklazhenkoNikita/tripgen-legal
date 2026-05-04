/**
 * IndexedDB persister for TanStack Query.
 *
 * Feature-flagged via `NEXT_PUBLIC_ENABLE_QUERY_PERSIST=1`. When disabled the
 * client uses the in-memory cache only (current behavior). When enabled, the
 * cache is mirrored to IndexedDB (via `idb-keyval`) on a 3-second throttle
 * and rehydrated on next page load.
 *
 * LRU eviction: we only persist the 10 most-recently-accessed
 * `['trips','detail',<id>]` queries — trip detail payloads can be large and
 * it makes no sense to persist the whole tail. Everything else (home feed,
 * weather, destinations, profile, credits) is always persisted. Mirror of
 * `trip_gen_mobile/mobile/src/config/queryClient.ts` LRU behavior.
 */

import { get, set, del, createStore } from 'idb-keyval';
import {
  persistQueryClient,
  type PersistedClient,
  type Persister,
} from '@tanstack/query-persist-client-core';
import type { QueryClient } from '@tanstack/react-query';

const CACHE_KEY = 'tripgen-query-cache-v1';
const LRU_KEY = 'tripgen-query-cache-lru-v1';
const LRU_LIMIT = 10;

export function isPersistenceEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_QUERY_PERSIST === '1';
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && 'indexedDB' in window;
}

const idbStore = isBrowser() ? createStore('tripgen-cache', 'keyval') : null;

async function readLru(): Promise<string[]> {
  if (!idbStore) return [];
  try {
    return ((await get<string[]>(LRU_KEY, idbStore)) ?? []).slice(-LRU_LIMIT);
  } catch {
    return [];
  }
}

async function writeLru(ids: string[]): Promise<void> {
  if (!idbStore) return;
  try {
    await set(LRU_KEY, ids.slice(-LRU_LIMIT), idbStore);
  } catch {
    // Best effort — if IDB is full we just skip persistence.
  }
}

function createIdbPersister(): Persister {
  return {
    persistClient: async (client: PersistedClient) => {
      if (!idbStore) return;
      try {
        await set(CACHE_KEY, client, idbStore);
      } catch {
        // IDB quota or private window — give up quietly.
      }
    },
    restoreClient: async () => {
      if (!idbStore) return undefined;
      try {
        return (await get<PersistedClient>(CACHE_KEY, idbStore)) ?? undefined;
      } catch {
        return undefined;
      }
    },
    removeClient: async () => {
      if (!idbStore) return;
      try {
        await del(CACHE_KEY, idbStore);
      } catch {
        // ignore
      }
    },
  };
}

/** Start persistence for the given client. No-op if disabled or not a browser. */
export function startQueryPersister(client: QueryClient): (() => void) | undefined {
  if (!isBrowser() || !isPersistenceEnabled()) return undefined;

  const persister = createIdbPersister();

  const [unsubscribe] = persistQueryClient({
    // `@tanstack/query-persist-client-core` ships with its own nested
    // `@tanstack/query-core` which TS sees as a separate nominal type;
    // the runtime instance is compatible. Cast through `unknown`.
    queryClient: client as unknown as Parameters<typeof persistQueryClient>[0]['queryClient'],
    persister,
    maxAge: 24 * 60 * 60 * 1000, // 24h
    buster: 'v1',
    dehydrateOptions: {
      // Only dehydrate queries that are fresh enough and succeeded.
      shouldDehydrateQuery: (query) => {
        if (query.state.status !== 'success') return false;
        // LRU-limit trip-detail payloads. Everything else passes through.
        const key = query.queryKey;
        if (
          Array.isArray(key) &&
          key[0] === 'trips' &&
          key[1] === 'detail' &&
          typeof key[2] === 'string'
        ) {
          // LRU bookkeeping: record this access; keep last N trip ids.
          const tripId = key[2];
          void readLru().then((ids) => {
            const next = [...ids.filter((id) => id !== tripId), tripId].slice(-LRU_LIMIT);
            void writeLru(next);
          });
          // Always persist — the top-level `persistClient` call will trim
          // the unused query data to the LRU cap below.
          return true;
        }
        return true;
      },
    },
  });

  // Extra pass after dehydrate: trim the persisted cache to only keep the
  // LRU-winning trip-detail queries.
  void trimPersistedCacheToLru();

  return unsubscribe;
}

async function trimPersistedCacheToLru(): Promise<void> {
  if (!idbStore) return;
  try {
    const cached = await get<PersistedClient>(CACHE_KEY, idbStore);
    if (!cached || !cached.clientState?.queries) return;
    const lru = new Set(await readLru());
    const filtered = cached.clientState.queries.filter((q) => {
      const k = q.queryKey;
      if (Array.isArray(k) && k[0] === 'trips' && k[1] === 'detail') {
        return typeof k[2] === 'string' && lru.has(k[2]);
      }
      return true;
    });
    if (filtered.length === cached.clientState.queries.length) return;
    await set(
      CACHE_KEY,
      { ...cached, clientState: { ...cached.clientState, queries: filtered } },
      idbStore,
    );
  } catch {
    // best effort
  }
}
