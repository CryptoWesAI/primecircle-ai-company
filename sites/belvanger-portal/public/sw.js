// Service worker van het Belvanger klantdashboard.
//
// Doet drie dingen, en bewust niet meer:
//   1. de app installeerbaar maken (Chrome eist een fetch-handler),
//   2. pushmeldingen tonen en de tik erop naar de juiste plek sturen,
//   3. een nette offline-pagina in plaats van de dino.
//
// HARDE REGEL: /api/ wordt NOOIT aangeraakt. Cache Storage is per ORIGIN, niet per
// gebruiker, dus een gecachete /api/summary zou op een gedeelde telefoon de cijfers
// van klant A aan klant B kunnen tonen. Alles onder /api/ gaat daarom regelrecht naar
// het netwerk, en bij uitloggen gooit de app alle caches weg via een message.

// Versie van DEZE service worker, zichtbaar gemaakt in het dashboard.
//
// Waarom dit bestaat: een service worker die vast blijft zitten op een oude versie is de
// meest verraderlijke storing in een PWA. Alles lijkt te werken, de server meldt dat de
// push is aangenomen, en toch gedraagt de telefoon zich als weken terug. Serverside is
// dat niet te zien. Deze versie plus de reparatieknop in het dashboard maken het
// vaststelbaar en oplosbaar zonder dat iemand een telefoon hoeft over te nemen.
const SW_VERSION = "2026-07-27-g";

const CACHE = "belvanger-shell-v6";
const OFFLINE_URL = "/offline.html";

// Alleen tenant-onafhankelijke bestanden. Bewust GEEN /style.css of /app.js met
// versie-querystring erin: die staan in index.html met een ?v=-parameter die we hier
// zouden moeten naschrijven bij elke wijziging. Die worden runtime gecached (zie
// hieronder), zodat er niets is om uit de pas te laten lopen.
const PRECACHE = [OFFLINE_URL, "/icons/icon-192.png"];

// Runtime-cachebaar: statische bestanden die per definitie geen klantdata bevatten.
const STATIC_PATTERN = /\.(?:css|js|woff2|png|svg)$/i;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  const type = event.data?.type;

  // Uitloggen: alles wat we ooit hebben bewaard gaat weg.
  if (type === "clear-caches") {
    event.waitUntil(caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key)))));
    return;
  }

  // Het dashboard vraagt welke versie hier draait. Antwoordt hij niet, of met een oude
  // versie, dan zit deze telefoon vast op een verouderde worker.
  if (type === "version") {
    event.source?.postMessage({ type: "version", version: SW_VERSION });
  }
});

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached || network;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Zie de harde regel bovenaan.
  if (url.pathname.startsWith("/api/")) return;

  // Navigaties altijd netwerk-eerst: een gecachete pagina kan een verlopen sessie
  // tonen, of een oude versie van het dashboard, en dat is erger dan even wachten.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => (await caches.match(OFFLINE_URL)) || Response.error())
    );
    return;
  }

  if (STATIC_PATTERN.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});

// --- Pushmeldingen ----------------------------------------------------------

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {};
  }

  const title = data.title || "Belvanger";
  const phone = typeof data.phone === "string" ? data.phone : "";
  const targetUrl = data.url || "/";

  // "Bel terug" komt er alleen bij als de server een nummer heeft meegestuurd
  // (PUSH_INCLUDE_CALLER). Zonder nummer is een belknop een dode knop.
  const actions = phone
    ? [{ action: "call", title: "Bel terug" }, { action: "open", title: "Bekijk" }]
    : [];

  event.waitUntil(self.registration.showNotification(title, {
    body: data.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    lang: "nl",
    // tag + renotify: een tweede gemiste oproep vervangt de melding en trilt
    // opnieuw, in plaats van een stapel losse meldingen te bouwen.
    tag: data.tag || "belvanger",
    renotify: true,
    requireInteraction: true,
    vibrate: [220, 90, 220],
    actions,
    data: { url: targetUrl, phone },
  }));
});

/**
 * Terugvalroute als `clients.openWindow()` is geweigerd: een bestaand venster navigeren,
 * en anders alleen focussen. Wordt pas aangeroepen NA de openWindow-poging, omdat die
 * als eerste moet gebeuren (zie notificationclick hieronder).
 */
async function focusBestaandVenster(target) {
  const clientList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  const sameOrigin = clientList.filter((c) => {
    try { return new URL(c.url).origin === self.location.origin; } catch { return false; }
  });

  for (const client of sameOrigin) {
    if (!("navigate" in client)) continue;
    try {
      const navigated = await client.navigate(target);
      if (navigated) { await navigated.focus().catch(() => {}); return; }
    } catch { /* niet bestuurd door deze worker: probeer het volgende venster */ }
  }
  if (sameOrigin[0]) await sameOrigin[0].focus().catch(() => {});
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const { url = "/", phone = "" } = event.notification.data || {};

  // Tikken op de MELDING ZELF belt terug, niet alleen de knop "Bel terug". De
  // meldingstekst zegt "Tik om deze klant terug te bellen", en dat moet waar zijn.
  // Wie het dashboard wil, tikt op "Bekijk".
  const wantsCall = Boolean(phone) && event.action !== "open";
  const nummer = String(phone).replace(/\s/g, "");
  const target = wantsCall ? `/?call=${encodeURIComponent(nummer)}` : url;

  // ── DIT MOET DE EERSTE REGEL ZIJN, EN ZONDER `await` ERVOOR ──────────────────
  //
  // Het gebruikersgebaar uit deze tik vervalt zodra de code iets awaits. Gebeurt dat
  // toch, dan weigert Chrome met "InvalidAccessError: Not allowed to open a window" en
  // gebeurt er zichtbaar niets. Gemeten op een echt toestel: er stond een await vóór
  // deze aanroep en dat was de oorzaak.
  //
  // En bewust GEEN openWindow("tel:...."). Chrome behandelt een tel:-URL dan als gewone
  // pagina en opent een browsertab MET tel:+31... in de adresbalk in plaats van de
  // telefoonapp. De telefoonapp wordt gestart door push.js met `location.href`.
  const opening = self.clients.openWindow(target);

  event.waitUntil((async () => {
    try {
      if (await opening) return;
    } catch { /* geweigerd: terugvallen op een bestaand venster */ }
    await focusBestaandVenster(target);
  })());
});
