
const CACHE_NAME = 'boh-cache-v1';
const urlsToCache = [
  '/index.html',
  '/index.css',
  // Add other critical assets here if any, e.g., logo, main JS bundle if not dynamically loaded
  // For ESM.sh based apps, the main JS is loaded by index.html which gets cached.
  // Specific JS modules from esm.sh are harder to cache predictively without a build step.
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Failed to open cache or add urls to cache', err);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  // We only want to cache GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          // Serve from cache
          return response;
        }
        // Not in cache, fetch from network
        return fetch(event.request).then(
          networkResponse => {
            // Optionally, cache new requests dynamically if needed
            // Be careful with caching everything, especially API calls unless explicitly designed for offline.
            // if (networkResponse && networkResponse.status === 200 && urlsToCache.includes(event.request.url)) {
            //   const responseToCache = networkResponse.clone();
            //   caches.open(CACHE_NAME)
            //     .then(cache => {
            //       cache.put(event.request, responseToCache);
            //     });
            // }
            return networkResponse;
          }
        ).catch(error => {
            console.error("Fetching failed:", error);
            // You could return a custom offline page here if an HTML page request fails
            // For assets, just failing might be okay, or return a placeholder.
            // if (event.request.destination === 'document') {
            //   return caches.match('/offline.html'); // Example offline page
            // }
            throw error;
        });
      })
  );
});