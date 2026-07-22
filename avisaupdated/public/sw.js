const CACHE_NAME = 'avisa-portal-v1';
const ASSETS = [
    './offline.html',
    './assets/css/layout.css'
];

// Install Event
self.addEventListener('install', event => {
    // console.log('Service Worker: Installed');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            // console.log('Service Worker: Caching Files');
            return cache.addAll(ASSETS).then(() => {
                console.log('SW: All assets cached successfully');
            }).catch(err => {
                console.error('SW: Failed to cache assets', err);
            });
        })
    );
    self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', event => {
    // console.log('Service Worker: Activated');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        // console.log('Service Worker: Clearing Old Cache');
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch Event - Network First, fallback to Cache
self.addEventListener('fetch', event => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    // Handle API requests separately (Network Only, usually)
    // But here we use Network First for everything to be safe
    event.respondWith(
        fetch(event.request)
            .then(res => {
                // Determine if we should cache this response
                // We typically don't cache API POST requests, but we might cache GETs
                // For simplicity, we clone and cache successful GET responses
                if (event.request.method === 'GET' && res && res.status === 200 && res.type === 'basic') {
                    const resClone = res.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, resClone);
                    });
                }
                return res;
            })
            .catch(() => {
                // Network failed, look in cache
                return caches.match(event.request).then(response => {
                    if (response) {
                        return response;
                    }
                    // If not in cache and it's a page navigation, show offline page
                    if (event.request.mode === 'navigate') {
                        return caches.match('/avisaexperts-portal/public/offline.html');
                    }
                });
            })
    );
});
