const CACHE_NAME = 'f1-dashboard-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

const EXTERNAL_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      return caches.open(CACHE_NAME).then(cache => {
        return Promise.allSettled(
          EXTERNAL_ASSETS.map(url => 
            fetch(url, { mode: 'cors' }).then(response => {
              if (response.ok) {
                return cache.put(url, response);
              }
            }).catch(() => {})
          )
        );
      });
    }).then(() => {
      self.skipWaiting();
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => {
      self.clients.claim();
    })
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  if (request.method !== 'GET') {
    return;
  }
  
  // Manejar solicitudes externas primero (APIs)
  if (url.origin !== location.origin) {
    if (url.hostname === 'api.jolpi.ca' || 
        url.hostname === 'wttr.in' ||
        url.hostname === 'en.wikipedia.org' ||
        url.hostname === 'flagcdn.com') {
      
      event.respondWith(
        fetch(request)
          .then(response => {
            // Solo cachear respuestas exitosas para recursos estáticos pequeños
            if (response.ok && (url.hostname === 'flagcdn.com')) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(request, clone);
              }).catch(() => {}); // Ignorar errores al cachear
            }
            return response;
          })
          .catch(() => {
            // Intentar obtener del cache solo para recursos pequeños
            if (url.hostname === 'flagcdn.com') {
              return caches.match(request);
            }
            // Para APIs externas, devolver error
            return new Response('Network error', { status: 503 });
          })
      );
      return; // Salir para evitar otros handlers
    }
  }
  
  // Para recursos locales, usar estrategia cache-first
  event.respondWith(
    caches.match(request).then(cached => {
      // Si hay algo en cache, retornarlo
      if (cached) {
        // Intentar actualizar cache en background sin esperar
        fetch(request).then(response => {
          if (response.ok) {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, response);
            }).catch(() => {});
          }
        }).catch(() => {});
        
        return cached;
      } else {
        // Si no hay en cache, ir a la red
        return fetch(request).then(response => {
          // Si la respuesta es exitosa, guardar en cache
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, clone);
            }).catch(() => {}); // Ignorar errores al cachear
          }
          return response;
        }).catch(() => {
          // Si falla la red, enviar respuesta alternativa offline
          return new Response('Offline', { status: 503 });
        });
      }
    })
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});