const CACHE = 'csl-v3';
const ASSETS = [
  '/cyberstrike-labs/',
  '/cyberstrike-labs/index.html',
  '/cyberstrike-labs/manifest.json',
  '/cyberstrike-labs/logo.svg'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Don't intercept API or Firebase calls
  const url = e.request.url;
  if (url.includes('firebase') || url.includes('groq-proxy') || url.includes('gstatic') || url.includes('googleapis')) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached =>
      cached || fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
        return res;
      }).catch(() => caches.match('/cyberstrike-labs/index.html'))
    )
  );
});
