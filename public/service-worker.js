// Service Worker for DevFlow.AI PWA
// Version: 2.0.0 - Enhanced with better caching strategies
const CACHE_NAME = 'devflow-ai-v2';
const RUNTIME_CACHE = 'devflow-ai-runtime-v2';
const STATIC_CACHE = 'devflow-ai-static-v2';

// Assets to cache immediately on install (critical assets)
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/manifest.json',
  '/index.css',
  // Core icons
  '/icons/light/icon-192x192.png',
  '/icons/dark/icon-192x192.png',
  '/icons/light/icon-512x512.png',
  '/icons/dark/icon-512x512.png',
  '/icons/light/maskable-icon-192x192.png',
  '/icons/dark/maskable-icon-192x192.png',
  '/icons/light/maskable-icon-512x512.png',
  '/icons/dark/maskable-icon-512x512.png'
];

// Install event - precache critical assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing v2...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Precaching critical assets');
        return cache.addAll(PRECACHE_ASSETS.map(url => new Request(url, { cache: 'reload' })));
      })
      .then(() => {
        console.log('[Service Worker] Installed successfully');
        return self.skipWaiting(); // Activate immediately
      })
      .catch((error) => {
        console.error('[Service Worker] Install failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating v2...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE && cacheName !== STATIC_CACHE) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activated');
        return self.clients.claim(); // Take control of all pages immediately
      })
  );
});

// Helper function to determine cache strategy
function getCacheStrategy(request) {
  const url = new URL(request.url);
  
  // Static assets - cache first, fallback to network
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
    return 'cache-first';
  }
  
  // API calls - network first, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    return 'network-first';
  }
  
  // HTML pages - network first with cache fallback
  if (request.headers.get('accept')?.includes('text/html')) {
    return 'network-first';
  }
  
  // Default: network first
  return 'network-first';
}

// Virtual File System for Preview
const fileSystem = new Map();

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'UPDATE_FILES') {
    console.log('[Service Worker] Updating preview files', event.data.files.length);
    fileSystem.clear();
    event.data.files.forEach(file => {
      // Normalize path: ensure leading slash
      const path = file.fileName.startsWith('/') ? file.fileName : '/' + file.fileName;
      fileSystem.set(path, file.content);
    });
    // Send acknowledgment
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage({ type: 'FILES_UPDATED' });
    }
  }
});

function getMimeType(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  switch (ext) {
    case 'html': return 'text/html';
    case 'css': return 'text/css';
    case 'js': case 'jsx': case 'ts': case 'tsx': return 'text/javascript';
    case 'json': return 'application/json';
    case 'png': return 'image/png';
    case 'jpg': case 'jpeg': return 'image/jpeg';
    case 'svg': return 'image/svg+xml';
    default: return 'text/plain';
  }
}

// Fetch event - intelligent caching strategy + VFS
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Intercept Preview Requests
  if (url.pathname.startsWith('/_preview/')) {
    // Extract relative path from /_preview/
    let path = url.pathname.replace('/_preview', '');
    if (path === '/' || path === '') path = '/index.html';
    
    // Try to find exact match
    let content = fileSystem.get(path);
    
    // Try adding .html if missing
    if (!content && !path.split('/').pop().includes('.')) {
        content = fileSystem.get(path + '.html');
    }
    
    // Try index.html in directory
    if (!content && path.endsWith('/')) {
        content = fileSystem.get(path + 'index.html');
    }

    if (content) {
      const mimeType = getMimeType(path);
      
      const response = new Response(content, {
        status: 200,
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': 'no-store' // Never cache preview files
        }
      });
      event.respondWith(response);
      return;
    } else {
      // File not found in VFS
      event.respondWith(new Response('File not found in preview: ' + path, { status: 404 }));
      return;
    }
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests (unless CORS is properly configured)
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  const strategy = getCacheStrategy(event.request);

  if (strategy === 'cache-first') {
    // Cache First Strategy - for static assets
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request)
            .then((response) => {
              // Cache successful responses
              if (response && response.status === 200) {
                const responseToCache = response.clone();
                caches.open(STATIC_CACHE)
                  .then((cache) => {
                    cache.put(event.request, responseToCache);
                  });
              }
              return response;
            })
            .catch(() => {
              // Return offline fallback if available
              if (event.request.headers.get('accept')?.includes('text/html')) {
                return caches.match('/index.html');
              }
            });
        })
    );
  } else {
    // Network First Strategy - for HTML and API calls
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful responses
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
          }
          return response;
        })
        .catch(() => {
          // If network fails, return cached version
          return caches.match(event.request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                console.log('[Service Worker] Serving from cache:', event.request.url);
                return cachedResponse;
              }
              // For HTML requests, return the main page
              if (event.request.headers.get('accept')?.includes('text/html')) {
                return caches.match('/index.html');
              }
              // Return offline response
              return new Response('Offline', {
                status: 503,
                statusText: 'Service Unavailable',
                headers: new Headers({
                  'Content-Type': 'text/plain'
                })
              });
            });
        })
    );
  }
});

// Background sync (for future offline functionality)
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  // Implement background sync logic here if needed
});

// Push notifications (for future notifications)
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received');
  // Implement push notification logic here if needed
  event.waitUntil(
    self.registration.showNotification('DevFlow.AI', {
      body: 'You have a new update!',
      icon: '/icons/light/icon-192x192.png',
      badge: '/icons/light/icon-96x96.png',
      tag: 'devflow-notification'
    })
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
