// Service Worker for Nata Coffee PWA
// Updated version to clear old cache
const CACHE_NAME = 'nata-coffee-v2';
const urlsToCache = [
  '/coffee/',
  '/coffee/index.html',
  '/coffee/fore.html',
  '/coffee/kopken.html',
  '/coffee/style.css',
  '/coffee/images/nata-logo.png',
  '/coffee/images/fore.webp',
  '/coffee/images/kopikenangan.png'
];

// Install event - skip waiting to activate immediately
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone the response and cache it
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(event.request);
      })
  );
});

// Activate event - Delete all old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          console.log('Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      // Take control of all pages immediately
      return self.clients.claim();
    })
  );
});
