var CACHE_NAME = "2022-05-02 00:20";
var urlsToCache = [
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
  "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css",
  "https://cdn.jsdelivr.net/npm/signature_pad@4.0.4/dist/signature_pad.umd.min.js",
  "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.16.0/dist/tf.min.js",
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(urlsToCache);
      }),
  );
});

self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request)
      .then(function (response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }),
  );
});

self.addEventListener("activate", function (event) {
  var cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
});
