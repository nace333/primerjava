// Offline: the app and its two libraries are cached on install; the app is refreshed from the network when online.
const CACHE = "primerjava-v3";
const FILES = [
  "./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png",
  "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const local = new URL(e.request.url).origin === location.origin;
  e.respondWith(
    local
      ? fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
          .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match("index.html")))
      : caches.match(e.request).then(r => r || fetch(e.request))
  );
});
