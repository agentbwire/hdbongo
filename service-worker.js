/**
 * hdbongo service worker.
 * Bump CACHE_NAME whenever the shell changes, otherwise devices keep the old page.
 */
const CACHE_NAME = 'hdmoviezclub-v2';

const urlsToCache = [
  '/', '/index.html', '/app.js', '/config.js',
  '/lib/firebase.js', '/lib/store.js',
  '/styles/main.css', '/styles/components.css', '/styles/responsive.css',
  '/styles/animations.css', '/styles/card-preview.css',
  '/data/content.js', '/data/software.js', '/data/categories.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache).catch(err => {
      console.log('Some shell files could not be cached:', err);
    }))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names => Promise.all(
      names.map(name => name !== CACHE_NAME ? caches.delete(name) : null)
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never cache payments, accounts, or third-party requests (fonts, flags, posters).
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  // Pages: always try the network first, so a new deploy shows up immediately.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put('/index.html', copy));
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Everything else: cache first, then network.
  event.respondWith(
    caches.match(request).then(hit => hit || fetch(request).then(response => {
      if (response && response.status === 200 && response.type === 'basic') {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
      }
      return response;
    }))
  );
});
