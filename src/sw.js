const cacheName = "2026-03-23 00:00";
const urlsToCache = [
  "/tegaki-de-anzan/index.js",
  "/tegaki-de-anzan/worker.js",
  "/tegaki-de-anzan/model/model.json",
  "/tegaki-de-anzan/model/group1-shard1of1.bin",
  "/tegaki-de-anzan/mp3/incorrect1.mp3",
  "/tegaki-de-anzan/mp3/end.mp3",
  "/tegaki-de-anzan/mp3/correct3.mp3",
  "/tegaki-de-anzan/favicon/favicon.svg",
  "https://marmooo.github.io/fonts/textar-light.woff2",
  "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js",
];

async function preCache() {
  const cache = await caches.open(cacheName);
  await Promise.all(
    urlsToCache.map((url) =>
      cache.add(url).catch((e) => console.warn("Failed to cache", url, e))
    ),
  );
  self.skipWaiting();
}

async function handleFetch(event) {
  const cached = await caches.match(event.request);
  return cached || fetch(event.request);
}

async function cleanOldCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map((name) => name !== cacheName ? caches.delete(name) : null),
  );
  self.clients.claim();
}

self.addEventListener("install", (event) => {
  event.waitUntil(preCache());
});
self.addEventListener("fetch", (event) => {
  event.respondWith(handleFetch(event));
});
self.addEventListener("activate", (event) => {
  event.waitUntil(cleanOldCaches());
});
