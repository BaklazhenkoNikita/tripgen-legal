'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import {
  drainQueue,
  isOfflineEnabled,
  readQueue,
  type QueuedAction,
} from '@/lib/offline/queue';

/**
 * Subscribes to `navigator.online/offline` and drains the queue when the
 * browser comes back online. Feature-flagged — no-ops unless
 * `NEXT_PUBLIC_ENABLE_OFFLINE=1`.
 */
export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator === 'undefined' ? true : navigator.onLine,
  );
  const [queueLength, setQueueLength] = useState(0);
  const draining = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    void readQueue().then((q) => setQueueLength(q.length));
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const runDrain = useCallback(async () => {
    if (!isOfflineEnabled() || draining.current) return;
    draining.current = true;
    try {
      const result = await drainQueue(executeAction);
      const remaining = await readQueue();
      setQueueLength(remaining.length);
      return result;
    } finally {
      draining.current = false;
    }
  }, []);

  useEffect(() => {
    if (isOnline) void runDrain();
  }, [isOnline, runDrain]);

  return { isOnline, queueLength, drain: runDrain };
}

async function executeAction(action: QueuedAction): Promise<void> {
  switch (action.kind) {
    case 'v2_add_activity':
      await api.post(endpoints.v2AddActivity, action.payload);
      return;
    case 'v2_delete_activity':
      await api.post(endpoints.v2DeleteActivity, action.payload);
      return;
    case 'v2_move_activity':
      await api.post(endpoints.v2MoveActivity, action.payload);
      return;
    case 'v2_reorder_activities':
      await api.post(endpoints.v2ReorderActivities, action.payload);
      return;
    case 'shortlist_add':
      await api.post(endpoints.shortlist, action.payload);
      return;
    case 'shortlist_remove':
      await api.delete(
        `${endpoints.shortlist}/${encodeURIComponent(action.payload.entity_id)}`,
      );
      return;
    case 'signal':
      await api.post(endpoints.signals, action.payload);
      return;
  }
}
