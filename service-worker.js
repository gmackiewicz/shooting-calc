const CACHE_NAME = 'app-v1';
const urlsToCache = [
  '/',
  '/index.html',
//   '/styles.css',
//   '/script.js',
  // Add all files you want to cache
];

// Install service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Fetch cached resources
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});