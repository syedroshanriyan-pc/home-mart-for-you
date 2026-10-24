// Service Worker for Fresh Chicken & Groceries PWA
const CACHE_NAME = "freshchicken-v2";
const STATIC_ASSETS = [
  "/manifest.json",
  "/favicon.svg",
  "/logo-icon.svg",
  "/logo.svg",
];

// Install event - Precache truly static assets only (no dynamic HTML)
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("Service worker precache partial notice:", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event - Clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Bypass service worker entirely for non-GET, API, authentication, admin, delivery, checkout, and account requests
  if (
    event.request.method !== "GET" ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/delivery") ||
    url.pathname.startsWith("/account") ||
    url.pathname.startsWith("/checkout") ||
    url.pathname.startsWith("/login") ||
    url.pathname.startsWith("/register")
  ) {
    return;
  }

  // Only cache static files (scripts, styles, images, fonts, static assets)
  const isStaticAsset =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".webp") ||
    url.pathname.endsWith(".ico") ||
    url.pathname === "/manifest.json";

  if (!isStaticAsset) {
    // Dynamic navigation/pages: Network-only to prevent stale authentication/session caching
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkResponse;
      });
    })
  );
});
