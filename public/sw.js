// ZOE service worker — minimal app-shell + cached-clip viewing.
const CACHE = "zoe-shell-v1";
const SHELL = ["/", "/timeline", "/patterns", "/profile", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(SHELL).catch(() => {
        // ignore failures — shell URLs may require auth
      }),
    ),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Don't intercept Supabase, API routes, or auth flows.
  if (
    url.pathname.startsWith("/api/") ||
    url.hostname.endsWith(".supabase.co")
  ) {
    return;
  }

  // HTML navigations: network-first, fall back to cache.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, clone));
          return res;
        })
        .catch(() => caches.match(req).then((c) => c || caches.match("/"))),
    );
    return;
  }

  // Static assets: cache-first.
  if (
    req.destination === "image" ||
    req.destination === "font" ||
    req.destination === "style" ||
    req.destination === "script"
  ) {
    event.respondWith(
      caches.match(req).then(
        (cached) =>
          cached ||
          fetch(req).then((res) => {
            const clone = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, clone));
            return res;
          }),
      ),
    );
  }
});
