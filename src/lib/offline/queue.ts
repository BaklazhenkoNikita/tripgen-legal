/**
 * Offline mutation queue (IndexedDB).
 *
 * Feature-flagged via `NEXT_PUBLIC_ENABLE_OFFLINE=1`. Mirrors mobile's
 * `offlineMutationQueue.ts`. When the network is offline at submit time,
 * callers `enqueue` a typed action; on reconnect, `drainQueue` replays
 * actions in FIFO order, squashing redundant pairs (e.g. add+delete for
 * the same activity cancels both).
 *
 * The queue stores *actions*, not full HTTP requests — replay goes through
 * the same hooks the UI uses, so auth, telemetry, and retry policy apply
 * uniformly. Signal on success/failure lets UI surface drain status.
 */

import { get, set, del, createStore } from 'idb-keyval';

export type QueuedAction =
  | {
      kind: 'v2_add_activity';
      id: string;
      payload: { search_id: string; day_number: number; activity_id: string; activity_name: string };
    }
  | {
      kind: 'v2_delete_activity';
      id: string;
      payload: { search_id: string; activity_id: string; day_number: number };
    }
  | {
      kind: 'v2_move_activity';
      id: string;
      payload: {
        search_id: string;
        activity_id: string;
        from_day: number;
        to_day: number;
        to_position?: number;
      };
    }
  | {
      kind: 'v2_reorder_activities';
      id: string;
      payload: { search_id: string; day_number: number; activity_ids: string[] };
    }
  | {
      kind: 'shortlist_add';
      id: string;
      payload: { entity_id: string; entity_type: string; city?: string };
    }
  | {
      kind: 'shortlist_remove';
      id: string;
      payload: { entity_id: string };
    }
  | {
      kind: 'signal';
      id: string;
      payload: Record<string, unknown>;
    };

const KEY = 'tripgen-offline-queue-v1';
const store =
  typeof window !== 'undefined' && 'indexedDB' in window
    ? createStore('tripgen-offline', 'keyval')
    : null;

export function isOfflineEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_OFFLINE === '1';
}

export async function readQueue(): Promise<QueuedAction[]> {
  if (!store) return [];
  try {
    return (await get<QueuedAction[]>(KEY, store)) ?? [];
  } catch {
    return [];
  }
}

async function writeQueue(queue: QueuedAction[]): Promise<void> {
  if (!store) return;
  try {
    if (queue.length === 0) {
      await del(KEY, store);
    } else {
      await set(KEY, queue, store);
    }
  } catch {
    // best effort
  }
}

function genId(): string {
  return `q_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Append an action, returning the fully-formed `QueuedAction` for UI tracking. */
export async function enqueue<K extends QueuedAction['kind']>(
  kind: K,
  payload: Extract<QueuedAction, { kind: K }>['payload'],
): Promise<QueuedAction> {
  const action = { kind, id: genId(), payload } as QueuedAction;
  const current = await readQueue();
  await writeQueue(squash([...current, action]));
  return action;
}

/**
 * Squash redundant action pairs in place:
 *   - add_activity(X) + delete_activity(X) → drop both
 *   - reorder_activities(day, A) followed by reorder_activities(day, B) → keep latest only
 *   - shortlist_add(X) + shortlist_remove(X) → drop both
 * Applied on insert; kept cheap so it runs on every enqueue.
 */
export function squash(queue: QueuedAction[]): QueuedAction[] {
  const out: QueuedAction[] = [];
  for (const action of queue) {
    const pair = findInversePair(out, action);
    if (pair !== -1) {
      out.splice(pair, 1); // drop both
      continue;
    }
    const replace = findSupersede(out, action);
    if (replace !== -1) {
      out[replace] = action;
      continue;
    }
    out.push(action);
  }
  return out;
}

function findInversePair(existing: QueuedAction[], next: QueuedAction): number {
  if (next.kind === 'v2_delete_activity') {
    return existing.findIndex(
      (a) =>
        a.kind === 'v2_add_activity' &&
        a.payload.search_id === next.payload.search_id &&
        a.payload.activity_id === next.payload.activity_id,
    );
  }
  if (next.kind === 'shortlist_remove') {
    return existing.findIndex(
      (a) => a.kind === 'shortlist_add' && a.payload.entity_id === next.payload.entity_id,
    );
  }
  return -1;
}

function findSupersede(existing: QueuedAction[], next: QueuedAction): number {
  if (next.kind === 'v2_reorder_activities') {
    return existing.findIndex(
      (a) =>
        a.kind === 'v2_reorder_activities' &&
        a.payload.search_id === next.payload.search_id &&
        a.payload.day_number === next.payload.day_number,
    );
  }
  return -1;
}

/** Replay the queue against a supplied executor (one HTTP call per action). */
export async function drainQueue(
  execute: (action: QueuedAction) => Promise<void>,
): Promise<{ succeeded: string[]; failed: Array<{ id: string; error: Error }> }> {
  const queue = await readQueue();
  const succeeded: string[] = [];
  const failed: Array<{ id: string; error: Error }> = [];
  const remaining: QueuedAction[] = [];
  for (const action of queue) {
    try {
      await execute(action);
      succeeded.push(action.id);
    } catch (err) {
      failed.push({ id: action.id, error: err as Error });
      remaining.push(action); // keep for next attempt
    }
  }
  await writeQueue(remaining);
  return { succeeded, failed };
}

export async function clearQueue(): Promise<void> {
  await writeQueue([]);
}
