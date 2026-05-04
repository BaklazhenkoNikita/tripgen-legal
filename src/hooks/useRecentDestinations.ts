'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'tripgen_recent_cities_v1';
const MAX_ENTRIES = 8;
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const UPDATE_EVENT = 'tripgen:recent-cities-update';

interface Entry {
  city: string;
  at: number;
}

function read(): Entry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Entry[];
    if (!Array.isArray(parsed)) return [];
    const cutoff = Date.now() - TTL_MS;
    return parsed.filter((e) => e && typeof e.city === 'string' && e.at > cutoff);
  } catch {
    return [];
  }
}

function write(entries: Entry[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
    window.dispatchEvent(new Event(UPDATE_EVENT));
  } catch {
    // storage disabled — noop
  }
}

/** Tracks which cities the user has recently engaged with. Backed by
 *  localStorage; entries expire after 30 days. Used by Home's "Pick up where
 *  you left off" rail and (optionally) the city switcher's recent list. */
export function useRecentDestinations() {
  const [list, setList] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => setList(read().map((e) => e.city));
    sync();
    window.addEventListener(UPDATE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(UPDATE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const add = useCallback((city: string) => {
    if (!city) return;
    const entries = read().filter((e) => e.city.toLowerCase() !== city.toLowerCase());
    entries.unshift({ city, at: Date.now() });
    write(entries);
  }, []);

  return { list, add };
}
