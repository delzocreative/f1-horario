const CACHE_NAME = 'f1-dashboard-v2';

const STATIC_ASSETS = [
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

const EXTERNAL_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() =>
        caches.open(CACHE_NAME).then(cache =>
          Promise.allSettled(
            EXTERNAL_ASSETS.map(url =>
              fetch(url, { mode: 'cors' })
                .then(response => { if (response.ok) return cache.put(url, response); })
                .catch(() => {})
            )
          )
        )
      )
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

  // External APIs: network-first, cache flags only for static CDN resources
  if (url.origin !== location.origin) {
    if (
      url.hostname === 'api.jolpi.ca' ||
      url.hostname === 'wttr.in' ||
      url.hostname === 'en.wikipedia.org' ||
      url.hostname === 'flagcdn.com'
    ) {
      event.respondWith(
        fetch(request)
          .then(response => {
            if (response.ok && url.hostname === 'flagcdn.com') {
              const clone = response.clone();
              caches.open(CACHE_NAME).then(cache => cache.put(request, clone)).catch(() => {});
            }
            return response;
          })
          .catch(() => {
            if (url.hostname === 'flagcdn.com') {
              return caches.match(request).then(cached => cached || new Response('', { status: 503 }));
            }
            return new Response('Network error', { status: 503 });
          })
      );
    }
    return;
  }

  // Navigation requests (opening the PWA): cache-first, network fallback, then cached index
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then(cached => {
        const networkFetch = fetch(request)
          .then(response => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then(cache => cache.put(request, clone)).catch(() => {});
            }
            return response;
          })
          .catch(() => cached || new Response('Offline', { status: 503 }));

        return cached ? cached : networkFetch;
      }).catch(() =>
        fetch(request).catch(() => new Response('Offline', { status: 503 }))
      )
    );
    return;
  }

  // Local static assets: cache-first with background revalidation
  event.respondWith(
    caches.match(request).then(cached => {
      const networkFetch = fetch(request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone)).catch(() => {});
          }
          return response;
        })
        .catch(() => cached || new Response('Offline', { status: 503 }));

      return cached || networkFetch;
    }).catch(() =>
      fetch(request).catch(() => new Response('Offline', { status: 503 }))
    )
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
