const CACHE_NAME = "2024-06-16 09:37";
const urlsToCache = [
  "/tegaki-de-anzan/",
  "/tegaki-de-anzan/index.js",
  "/tegaki-de-anzan/worker.js",
  "/tegaki-de-anzan/model/model.json",
  "/tegaki-de-anzan/model/group1-shard1of1.bin",
  "/tegaki-de-anzan/mp3/incorrect1.mp3",
  "/tegaki-de-anzan/mp3/end.mp3",
  "/tegaki-de-anzan/mp3/correct3.mp3",
  "/tegaki-de-anzan/favicon/favicon.svg",
  "https://marmooo.github.io/fonts/textar-light.woff2",
  "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    }),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName)),
      );
    }),
  );
});
