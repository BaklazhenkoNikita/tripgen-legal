'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';

/**
 * Web Push scaffolding. Registers a Service Worker, asks for permission
 * on user gesture, and posts the resulting subscription to the backend as
 * a push token. Feature-flagged via `NEXT_PUBLIC_ENABLE_WEB_PUSH=1`; the
 * VAPID public key is read from `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (set once
 * backend surfaces web-push support).
 *
 * This ships behind a flag because iOS Safari support is spotty and the
 * backend endpoint contract is shared with native mobile push — needs a
 * platform field the UI sends as `web` so backend can route correctly.
 */

const SW_URL = '/sw.js';

export type PushStatus =
  | 'unsupported'
  | 'disabled'
  | 'default'
  | 'granted'
  | 'denied'
  | 'registering'
  | 'error';

export function useWebPush() {
  const [status, setStatus] = useState<PushStatus>('unsupported');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (process.env.NEXT_PUBLIC_ENABLE_WEB_PUSH !== '1') {
      setStatus('disabled');
      return;
    }
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      setStatus('unsupported');
      return;
    }
    setStatus(Notification.permission as PushStatus);
  }, []);

  const request = useCallback(async () => {
    if (typeof window === 'undefined') return;
    if (process.env.NEXT_PUBLIC_ENABLE_WEB_PUSH !== '1') return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported');
      return;
    }
    try {
      setStatus('registering');
      const reg = await navigator.serviceWorker.register(SW_URL);
      await navigator.serviceWorker.ready;

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus(permission as PushStatus);
        return;
      }

      const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapid) {
        setError('VAPID key not configured');
        setStatus('error');
        return;
      }

      // Copy to a fresh ArrayBuffer so the type aligns with PushSubscriptionOptionsInit
      // across TS's strict Uint8Array<ArrayBufferLike> narrowing in modern lib.dom.
      const keyBytes = urlBase64ToUint8Array(vapid);
      const applicationServerKey = new Uint8Array(keyBytes).buffer;
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      await api.post(endpoints.pushToken, {
        token: JSON.stringify(subscription.toJSON()),
        platform: 'web',
      });

      setStatus('granted');
    } catch (e) {
      setError((e as Error).message);
      setStatus('error');
    }
  }, []);

  const unregister = useCallback(async () => {
    if (typeof window === 'undefined') return;
    try {
      await api.delete(endpoints.pushToken);
      const reg = await navigator.serviceWorker.getRegistration(SW_URL);
      await reg?.unregister();
      setStatus('default');
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  return { status, error, request, unregister };
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = typeof atob === 'function' ? atob(base64) : Buffer.from(base64, 'base64').toString('binary');
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}
