// ZOE service worker — minimal app-shell + cached-clip viewing.
const CACHE = "zoe-shell-v2";
const SHELL = ["/", "/manifest.webmanifest"];
const OFFLINE_HTML =
  '<!doctype html><meta charset="utf-8"><title>Offline</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;font-family:system-ui,sans-serif;background:#0f2035;color:#f5f0e0;display:flex;align-items:center;justify-content:center;min-height:100dvh;padding:24px;text-align:center}h1{color:#c9a84c;font-weight:500;margin:0 0 12px}p{opacity:.75;margin:0}</style><h1>You\u2019re offline</h1><p>Reconnect to keep using ZOE.</p>';

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
        .catch(() =>
          caches.match(req).then(
            (c) =>
              c ||
              caches.match("/").then(
                (root) =>
                  root ||
                  new Response(OFFLINE_HTML, {
                    headers: { "Content-Type": "text/html; charset=utf-8" },
                  }),
              ),
          ),
        ),
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
