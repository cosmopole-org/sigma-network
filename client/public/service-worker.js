const CACHE_NAME = 'my-cache';
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/styles.css',
        // Add more assets to cache
      ]);
    })
  );
});
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
  );
});
