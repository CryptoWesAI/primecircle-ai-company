// The Observatory's service worker: makes the page installable, keeps the shell
// available when the network is not, and shows push notifications. It reads no
// visitor data and caches nothing from the live reads (status, board, market).
const VERSION = "sable-sw-2026-09-08b";
const SHELL = ["/", "/index.html", "/app.js", "/early.js", "/manifest.webmanifest", "/icons/icon-192.png", "/robot.png", "/sable-mark.svg"];
const SHELL_PATH = /^\/(index\.html|app\.js|early\.js|manifest\.webmanifest|robot\.png|sable-mark\.svg|lisa\.js|winner\.html|winner\.js|game\/[a-z]+\.js|icons\/.+|fonts\/.+)?$/;

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// the shell: network first, so a deploy reaches everyone; the cached copy when offline
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin || !SHELL_PATH.test(url.pathname)) return;
  // no-cache: always revalidated with the server (an ETag round trip), so a deploy reaches every phone at the next open
  e.respondWith(fetch(e.request, { cache: "no-cache" }).then((r) => { if (r.ok) { const copy = r.clone(); caches.open(VERSION).then((c) => c.put(e.request, copy)); } return r; })
    .catch(() => caches.match(e.request).then((m) => m || (url.pathname === "/" ? caches.match("/index.html") : Response.error()))));
});
// a push: one notification, with the device's own sound and a short vibration
self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { body: e.data ? e.data.text() : "" }; }
  const title = String(d.title || "Sable Observatory").slice(0, 80);
  e.waitUntil(self.registration.showNotification(title, {
    body: String(d.body || "Something changed on the page.").slice(0, 200),
    icon: "/icons/icon-192.png", badge: "/icons/badge-96.png",
    tag: String(d.tag || "sable-observatory"), renotify: true, silent: false, vibrate: [200, 100, 200],
    data: { url: String(d.url || "/") },
  }));
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || "/", location.origin).href;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((cs) => {
    for (const c of cs) { if (c.url.startsWith(location.origin) && "focus" in c) { c.navigate(url); return c.focus(); } }
    return self.clients.openWindow(url);
  }));
});
