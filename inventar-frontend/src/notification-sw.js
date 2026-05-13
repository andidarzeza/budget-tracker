/*
 * Minimal service worker for the notification-testing flow.
 *
 * Doesn't yet handle real Web Push events — that requires VAPID keys and
 * a backend that calls the Web Push protocol. For local testing we only
 * need a registered service worker so the page can call
 * `registration.showNotification(...)`. iOS PWAs (16.4+) require this
 * path; the bare `new Notification(...)` constructor throws on iOS.
 */

self.addEventListener('install', () => {
  // Take over as soon as the new SW is installed — no need to wait for
  // every open tab to close, which would make iterating during testing
  // annoying.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Tapping a notification: focus an existing tab if there is one,
// otherwise open the PWA at its start URL.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    (async () => {
      const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      const existing = list.find((c) => 'focus' in c);
      if (existing) return existing.focus();
      if (self.clients.openWindow) return self.clients.openWindow('/');
    })(),
  );
});
