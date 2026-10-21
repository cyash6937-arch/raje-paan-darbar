self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('push', event => {
  let d = {};
  try { d = event.data ? event.data.json() : {}; } catch (e) {}
  event.waitUntil(self.registration.showNotification(d.title || 'Raje Paan Darbar', {
    body: d.body || 'Your order is ready!',
    vibrate: [250, 150, 250],
    requireInteraction: true,
    tag: 'paan-ready'
  }));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) { if ('focus' in c) return c.focus(); }
    return clients.openWindow('/');
  }));
});
