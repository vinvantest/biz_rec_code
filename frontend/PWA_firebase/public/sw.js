/*
 *
 *  Air Horner
 *  Copyright 2015 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */

// Version 0.57
let version = '0.57';
let cacheName = 'bizrec-v-1';
var filesToCache = [
                    //'.',
                    'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700',
                    'https://fonts.gstatic.com/s/roboto/v18/I3S1wsgSg9YCurV6PUkTOYX0hVgzZQUfRDuZrPvH3D8.woff2',
                    'https://fonts.googleapis.com/css?family=Oxygen:700|Open+Sans',
                    'bower_components/webcomponentsjs/webcomponents-loader.js',
                    //`/`,
                    `/index.html`,
                    //`/ice.html`,
                    //`/images/*`,
                    'manifest.json'
                  ];

self.addEventListener('install', e => {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(filesToCache)
      .then(() => self.skipWaiting());
    })
  )
});

self.addEventListener('activate', e => {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== cacheName) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request, {ignoreSearch:true}).then(response => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('beforeinstallprompt', e => {
  // e.userChoice will return a Promise.
  e.userChoice.then( function(choiceResult) {
    alert('event - '+choiceResult.outcome);//remove me
    console.log(choiceResult.outcome);
    if(choiceResult.outcome == 'dismissed') {
      console.log('User cancelled home screen install');
      alert('You will not be prompted again to install the app to home screen. If you wish to do so in future you will have to clear browser cache and revisit the website app https://biz-rec.com');
    }
    else {
      console.log('App added to home screen');
    }
  });
});
