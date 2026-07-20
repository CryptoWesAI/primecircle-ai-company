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

function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(type.startsWith("application/json") ? JSON.stringify(body) : body);
}

http.createServer((req, res) => {
  const url = new URL(req.url, "http://127.0.0.1:18196");
  if (url.pathname === "/api/me") return send(res, 200, { user: { email: "info@belvanger.nl", tenant_name: "Belvanger", must_change_password: false } });
  if (url.pathname === "/api/summary") return send(res, 200, { attention: 2, metrics: { missed_calls: 1, sms_sent: 3, sms_delivered: 3, replies: 1, website_leads: 1 }, contacts: contacts.slice(0, 2), recent, channels: [{ source: "twilio", count: 5 }, { source: "website", count: 1 }, { source: "email", count: 1 }] });
  if (url.pathname === "/api/contacts") return send(res, 200, { contacts });
  if (url.pathname.startsWith("/api/contacts/")) return send(res, 200, { contact: contacts[0], events: recent.map((event, id) => ({ ...event, id: id + 1, event_type: id ? "call.missed" : "sms.inbound", direction: "inbound" })) });
  const requested = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
  const file = path.resolve(publicDir, requested);
  if (!file.startsWith(publicDir) || !fs.existsSync(file)) return send(res, 404, "Niet gevonden", "text/plain; charset=utf-8");
  const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml" };
  send(res, 200, fs.readFileSync(file), types[path.extname(file)] || "application/octet-stream");
}).listen(18196, "127.0.0.1", () => console.log("preview ready"));
