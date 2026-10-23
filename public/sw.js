// Service Worker for Fresh Chicken & Groceries PWA
const CACHE_NAME = "freshchicken-v1";
const STATIC_ASSETS = [
  "/",
  "/menu",
  "/cart",
  "/manifest.json",
  "/icon.svg",
];

// Install event
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

// Activate event
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

// Fetch event (Network first with cache fallback)
self.addEventListener("fetch", (event) => {
  // Only handle GET requests and skip api/admin/auth requests
  if (
    event.request.method !== "GET" ||
    event.request.url.includes("/api/") ||
    event.request.url.includes("/admin/") ||
    event.request.url.includes("/delivery/")
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache successful responses for static assets
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          (event.request.url.includes("/_next/static/") ||
            event.request.url.endsWith(".svg") ||
            event.request.url.endsWith(".png") ||
            event.request.url.endsWith(".jpg"))
        ) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          // Fallback to root if navigating
          if (event.request.mode === "navigate") {
            return caches.match("/");
          }
          return new Response("Offline", { status: 503, statusText: "Service Unavailable" });
        });
      })
  );
});
