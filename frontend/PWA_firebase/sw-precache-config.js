/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

/* eslint-env node */

module.exports = {
  staticFileGlobs: [
    'bower_components/webcomponentsjs/webcomponents-loader.js',
    'images/*',
    'manifest.json',
  ],
  runtimeCaching: [
    {
      urlPattern: /\/bower_components\/webcomponentsjs\/.*.js/,
      handler: 'fastest',
      options: {
        cache: {
          name: 'webcomponentsjs-polyfills-cache',
        },
      },
    },
  ],
};

/* shop app
module.exports = {
      staticFileGlobs: [
            '/index.html',
            '/manifest.json',
            '/robots.txt',
            '/sitemap.xml',
            '/bower_components/webcomponentsjs/webcomponents-lite.min.js',
            '/bower_components/app-storage/app-indexeddb-mirror/app-indexeddb-mirror-worker.js',
            '/bower_components/app-storage/app-indexeddb-mirror/common-worker-scope.js',
            'images/providers/facebook.svg',
            'images/providers/google.svg',
            'images/logo/logo_doubleline_204x130.png',
            'images/logo/logo_line_456x91.png',
            'images/logo/logo_s_180x86.png',
            'images/logo/logo_tree_180x86.png'
      ],
      navigateFallback: '/index.html'
};

*/
