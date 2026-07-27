import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const publicDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../public");
const now = Date.now();
const contacts = [
  { id: 1, name: "Eva van Dijk", company: "Van Dijk Schilderwerken", phone: "+31612345678", email: "eva@example.test", status: "follow_up", last_event_type: "sms.inbound", last_event_at: new Date(now - 7 * 60_000).toISOString() },
  { id: 2, name: "Marco Jansen", company: "Jansen Installatie", phone: "+31623456789", email: "marco@example.test", status: "new", last_event_type: "call.missed", last_event_at: new Date(now - 31 * 60_000).toISOString() },
  { id: 3, name: "Sanne Bakker", company: "Bakker Interieur", phone: "+31634567890", email: "sanne@example.test", status: "contacted", last_event_type: "website.lead", last_event_at: new Date(now - 2 * 3600_000).toISOString() },
];
const recent = [
  { contact_id: 1, name: "Eva van Dijk", company: "Van Dijk Schilderwerken", label: "Sms ontvangen", preview: "Ja, graag vanmiddag even bellen.", source: "twilio", occurred_at: contacts[0].last_event_at },
  { contact_id: 2, name: "Marco Jansen", company: "Jansen Installatie", label: "Gemiste oproep", preview: "Automatische opvolging gestart", source: "twilio", occurred_at: contacts[1].last_event_at },
  { contact_id: 3, name: "Sanne Bakker", company: "Bakker Interieur", label: "Websiteaanvraag", preview: "Aanvraag via contactformulier", source: "website", occurred_at: contacts[2].last_event_at },
];
const proofLog = [
  { occurred_at: new Date(now - 40 * 60_000).toISOString(), event_type: "call.missed", status: "no-answer", label: "Gemiste oproep" },
  { occurred_at: new Date(now - 39 * 60_000).toISOString(), event_type: "sms.outbound", status: "sent", label: "Sms verzonden" },
  { occurred_at: new Date(now - 31 * 60_000).toISOString(), event_type: "call.missed", status: "no-answer", label: "Gemiste oproep" },
  { occurred_at: new Date(now - 30 * 60_000).toISOString(), event_type: "sms.outbound", status: "sent", label: "Sms verzonden" },
];

function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(type.startsWith("application/json") ? JSON.stringify(body) : body);
}

http.createServer((req, res) => {
  const url = new URL(req.url, "http://127.0.0.1:18196");
  if (url.pathname === "/api/me") return send(res, 200, { user: { email: "info@belvanger.nl", tenant_name: "Belvanger", role: "platform_admin", must_change_password: false } });
  if (url.pathname === "/api/admin/knowledge") {
    try {
      const index = JSON.parse(fs.readFileSync(path.resolve(publicDir, "../src/knowledge-index.json"), "utf8"));
      let relationships = [];
      try { relationships = JSON.parse(fs.readFileSync(path.resolve(publicDir, "../src/knowledge-relationships.json"), "utf8")); } catch {}
      const staleness = { lastRunAt: new Date(now - 6 * 3600_000).toISOString(), checkedCount: 6, totalEdges: relationships.length, flagged: [
        { from: relationships[2]?.from, to: relationships[2]?.to, reason: "kernterm uit de relatie-omschrijving niet meer teruggevonden in het brondocument" },
      ] };
      return send(res, 200, { ...index, relationships, staleness });
    } catch { return send(res, 200, { generatedAt: null, entries: [], relationships: [], staleness: null }); }
  }
  if (url.pathname === "/api/summary") return send(res, 200, { attention: 2, metrics: { missed_calls: 4, sms_sent: 3, sms_delivered: 3, replies: 1, website_leads: 1 }, contacts: contacts.slice(0, 2), recent, channels: [{ source: "twilio", count: 5 }, { source: "website", count: 1 }, { source: "email", count: 1 }], savings: { amount: 600, missedCallsCaught: 4, avgJobValue: 250, avgJobValueIsDefault: true, recoveryRate: 0.6 } });
  if (url.pathname === "/api/proof-log") return send(res, 200, { range: "7d", entries: proofLog });
  if (url.pathname === "/api/connections") return send(res, 200, { connections: [
    { source: "twilio", status: "connected", external_identifier: "+31201234567", last_event_at: contacts[1].last_event_at, event_count: 12 },
    { source: "website", status: "connected", external_identifier: null, last_event_at: contacts[2].last_event_at, event_count: 4 },
    { source: "email", status: "pending", external_identifier: null, last_event_at: null, event_count: 0 },
  ] });
  if (url.pathname === "/api/contacts") return send(res, 200, { contacts });
  // Deze twee werden nog niet gemockt, waardoor elke preview-run twee 404's in de
  // console gaf en een echte fout daarin niet meer opvalt.
  if (url.pathname === "/api/partners") return send(res, 200, { partners: [
    { id: 1, name: "Installatiebedrijf De Vries", phone: "+31612000001", email: "info@example.test" },
  ] });
  if (url.pathname === "/api/visibility") return send(res, 200, { clarity: null, searchConsole: null, updatedAt: null });
  if (url.pathname.startsWith("/api/contacts/")) return send(res, 200, { contact: contacts[0], events: recent.map((event, id) => ({ ...event, id: id + 1, event_type: id ? "call.missed" : "sms.inbound", direction: "inbound" })) });
  // Meldingen: standaard uit, want de preview heeft geen VAPID-sleutels en hoort
  // nooit echt te pushen. Zo is te zien dat de meldingenkaart dan verborgen blijft
  // i.p.v. een dode knop te tonen.
  //
  // PREVIEW_PUSH=1 doet alsof de server sleutels heeft, zodat de kaart zelf visueel
  // te controleren is. De sleutel hieronder is een geldig gevormd maar nergens
  // geldig P-256-punt: subscriben lukt dus niet, en dat hoeft ook niet om de opmaak
  // te zien. Nooit een echte sleutel in dit bestand zetten.
  if (url.pathname === "/api/push/key") {
    return process.env.PREVIEW_PUSH === "1"
      ? send(res, 200, { enabled: true, publicKey: "BDIAaIYAulwN2TadY0q5aBAGkdlZIYU_FL5L6-_gLDgh_k_Wjs7w9y13C4Lj_CnnxUbhq9jbGCBL6874A3bm49o", devices: 0 })
      : send(res, 200, { enabled: false, publicKey: null, devices: 0 });
  }
  const requested = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
  const file = path.resolve(publicDir, requested);
  if (!file.startsWith(publicDir) || !fs.existsSync(file)) return send(res, 404, "Niet gevonden", "text/plain; charset=utf-8");
  // Zelfde MIME-map als serveStatic in src/server.js. Loopt deze uit de pas, dan
  // verifieer je in de preview iets anders dan wat er live gebeurt: zonder
  // .webmanifest en .png is de PWA niet installeerbaar.
  const types = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".svg": "image/svg+xml",
    ".webmanifest": "application/manifest+json; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".woff2": "font/woff2",
  };
  send(res, 200, fs.readFileSync(file), types[path.extname(file)] || "application/octet-stream");
}).listen(18196, "127.0.0.1", () => console.log("preview ready"));
