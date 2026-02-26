const CACHE_NAME = 'maktaba-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// INSTALL
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS).catch(() => {}))
  );
});

// ACTIVATE
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// FETCH - Network first, fallback to cache
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        return res;
      })
      .catch(() => caches.match(event.request).then(r => r || new Response('Offline - Hakuna mtandao', { headers: { 'Content-Type': 'text/plain' } })))
  );
});

// PUSH NOTIFICATIONS
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : { title: 'The Maktaba', body: 'Kuna maudhui mapya!' };
  event.waitUntil(
    self.registration.showNotification(data.title || 'The Maktaba', {
      body: data.body || 'Karibu kusoma maudhui mapya!',
      icon: './icon-192.png',
      badge: './icon-192.png',
      vibrate: [200, 100, 200]
    })
  );
});
