var CACHE_NAME="2022-07-24 00:46",urlsToCache=["/tegaki-de-anzan/","/tegaki-de-anzan/index.js","/tegaki-de-anzan/worker.js","/tegaki-de-anzan/model/model.json","/tegaki-de-anzan/model/group1-shard1of1.bin","/tegaki-de-anzan/mp3/incorrect1.mp3","/tegaki-de-anzan/mp3/end.mp3","/tegaki-de-anzan/mp3/correct3.mp3","/tegaki-de-anzan/favicon/favicon.svg","https://marmooo.github.io/fonts/textar-light.woff2","https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/css/bootstrap.min.css","https://cdn.jsdelivr.net/npm/signature_pad@4.0.7/dist/signature_pad.umd.min.js","https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.17.0/dist/tf.min.js"];self.addEventListener("install",function(a){a.waitUntil(caches.open(CACHE_NAME).then(function(a){return a.addAll(urlsToCache)}))}),self.addEventListener("fetch",function(a){a.respondWith(caches.match(a.request).then(function(b){return b||fetch(a.request)}))}),self.addEventListener("activate",function(a){var b=[CACHE_NAME];a.waitUntil(caches.keys().then(function(a){return Promise.all(a.map(function(a){if(b.indexOf(a)===-1)return caches.delete(a)}))}))})