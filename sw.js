const CACHE_NAME = 'f1-dashboard-v3';

const STATIC_ASSETS = [
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  // Navigation requests: let the browser handle directly (no SW interception)
  // Avoids Chrome Android PWA ERR_FAILED caused by navigate-mode fetch restrictions
  if (request.mode === 'navigate') return;

  // External origins: only intercept known API/CDN hosts
  if (url.origin !== location.origin) {
    if (url.hostname === 'flagcdn.com') {
      event.respondWith(
        caches.match(request).then(cached => {
          if (cached) return cached;
          return fetch(request).then(response => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then(cache => cache.put(request, clone)).catch(() => {});
            }
            return response;
          }).catch(() => new Response('', { status: 503 }));
        })
      );
    }
    return;
  }

  // Local static assets: cache-first, network fallback
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) {
        // Revalidate in background
        fetch(request).then(response => {
          if (response.ok) {
            caches.open(CACHE_NAME).then(cache => cache.put(request, response)).catch(() => {});
          }
        }).catch(() => {});
        return cached;
      }
      return fetch(request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone)).catch(() => {});
        }
        return response;
      }).catch(() => new Response('Offline', { status: 503 }));
    }).catch(() => fetch(request).catch(() => new Response('Offline', { status: 503 })))
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
