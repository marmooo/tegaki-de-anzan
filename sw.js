var CACHE_NAME='2019-09-01 13:00';var urlsToCache=['https://marmooo.github.io/tegaki-de-anzan/','https://marmooo.github.io/tegaki-de-anzan/favicon/android-chrome-192x192.png','https://marmooo.github.io/tegaki-de-anzan/favicon/android-chrome-512x512.png','https://marmooo.github.io/tegaki-de-anzan/favicon/apple-touch-icon.png','https://marmooo.github.io/tegaki-de-anzan/favicon/favicon-32x32.png','https://marmooo.github.io/tegaki-de-anzan/favicon/favicon-48x48.png','https://marmooo.github.io/tegaki-de-anzan/favicon/safari-pinned-tab.svg','https://marmooo.github.io/tegaki-de-anzan/favicon/site.webmanifest','https://marmooo.github.io/fonts/textar-min.woff2','https://marmooo.github.io/fonts/textar-min.woff','https://marmooo.github.io/fonts/textar-min.ttf','https://marmooo.github.io/model/model.json','https://marmooo.github.io/model/group1-shard1of1.bin','https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.3.1/css/bootstrap.min.css','https://cdnjs.cloudflare.com/ajax/libs/tensorflow/1.2.8/tf.min.js','https://marmooo.github.io/js/signature_pad.min.js',];self.addEventListener('install',function(event){event.waitUntil(caches.open(CACHE_NAME).then(function(cache){return cache.addAll(urlsToCache);}));});self.addEventListener('fetch',function(event){event.respondWith(caches.match(event.request).then(function(response){if(response){return response;}
return fetch(event.request);}));});self.addEventListener('activate',function(event){var cacheWhitelist=[CACHE_NAME];event.waitUntil(caches.keys().then(function(cacheNames){return Promise.all(cacheNames.map(function(cacheName){if(cacheWhitelist.indexOf(cacheName)===-1){return caches.delete(cacheName);}}));}));});