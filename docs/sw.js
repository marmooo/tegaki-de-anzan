const CACHE_NAME="2024-06-03 09:00",urlsToCache=["/tegaki-de-anzan/","/tegaki-de-anzan/index.js","/tegaki-de-anzan/worker.js","/tegaki-de-anzan/model/model.json","/tegaki-de-anzan/model/group1-shard1of1.bin","/tegaki-de-anzan/mp3/incorrect1.mp3","/tegaki-de-anzan/mp3/end.mp3","/tegaki-de-anzan/mp3/correct3.mp3","/tegaki-de-anzan/favicon/favicon.svg","https://marmooo.github.io/fonts/textar-light.woff2","https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.19.0/dist/tf.min.js"];self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE_NAME).then(e=>e.addAll(urlsToCache)))}),self.addEventListener("fetch",e=>{e.respondWith(caches.match(e.request).then(t=>t||fetch(e.request)))}),self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(e=>Promise.all(e.filter(e=>e!==CACHE_NAME).map(e=>caches.delete(e)))))})