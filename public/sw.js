/* eslint-disable */
/**
 * Minimal Service Worker for Periplo web push.
 *
 * Activated only when `NEXT_PUBLIC_ENABLE_WEB_PUSH=1` — registration is
 * gated in `useWebPush`. This SW only handles push events; it does not
 * precache assets, intercept fetches, or do offline caching (the query
 * persister in IndexedDB covers that). Expand carefully if you add more
 * responsibilities; a broken SW can lock users out of the site.
 */

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (_) {
    // fall through — render a generic notification
  }

  const title = payload.title || 'Periplo';
  const options = {
    body: payload.body || '',
    icon: payload.icon || '/icon-192.png',
    badge: '/badge-72.png',
    data: payload.data || {},
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const deeplink = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({ type: 'push-click', url: deeplink });
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(deeplink);
      }
    }),
  );
});
