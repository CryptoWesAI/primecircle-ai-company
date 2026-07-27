const base = "http://127.0.0.1:8096";

async function request(path, options = {}) {
  const response = await fetch(`${base}${path}`, options);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${path}: ${response.status} ${body.error || ""}`);
  return { response, body };
}

const health = await request("/healthz");
const login = await request("/api/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ tenant: "belvanger", email: "info@belvanger.nl", password: process.env.BOOTSTRAP_ADMIN_PASSWORD }),
});
const cookie = login.response.headers.get("set-cookie").split(";")[0];

const events = [
  { source: "twilio", eventType: "call.missed", externalId: "smoke-call-1", direction: "inbound", contact: { name: "Eva van Dijk", company: "Van Dijk Schilderwerken", phone: "+31612340001" }, subject: "Gemiste oproep", preview: "Oproep niet beantwoord", metadata: { test: true } },
  { source: "twilio", eventType: "sms.outbound", externalId: "smoke-sms-1", direction: "outbound", status: "sent", contact: { name: "Eva van Dijk", phone: "+31612340001" }, preview: "We konden je net niet te woord staan.", metadata: { test: true } },
  { source: "twilio", eventType: "sms.status", externalId: "smoke-sms-1", direction: "system", status: "delivered", contact: { name: "Eva van Dijk", phone: "+31612340001" }, metadata: { test: true } },
  { source: "twilio", eventType: "sms.inbound", externalId: "smoke-sms-2", direction: "inbound", status: "received", contact: { name: "Eva van Dijk", phone: "+31612340001" }, preview: "Graag terugbellen over schilderwerk.", metadata: { test: true } },
  { source: "email", eventType: "email.inbound", externalId: "smoke-email-1", direction: "inbound", contact: { name: "Marco Jansen", email: "marco.smoketest@example.com" }, subject: "Vraag over beschikbaarheid", preview: "Kunnen jullie volgende week langskomen?", metadata: { test: true } },
  { source: "website", eventType: "website.lead", externalId: "smoke-web-1", direction: "inbound", contact: { name: "Daan de Boer", company: "De Boer Montage", phone: "+31612340002", email: "daan.smoketest@example.com" }, subject: "Websiteaanvraag", preview: "Aanvraag voor een vrijblijvende kennismaking.", metadata: { test: true } },
  { source: "chatbot", eventType: "chat.lead", externalId: "smoke-chat-1", direction: "inbound", contact: { name: "Sanne Bakker", phone: "+31612340003" }, subject: "Chatbotlead", preview: "Zoekt hulp na een gemiste oproep.", metadata: { test: true } },
];

for (const event of events) {
  await request("/api/ingest", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Ingest-Key": process.env.INGEST_KEY, "X-Tenant": "belvanger" },
    body: JSON.stringify(event),
  });
}

const duplicate = await request("/api/ingest", {
  method: "POST",
  headers: { "Content-Type": "application/json", "X-Ingest-Key": process.env.INGEST_KEY, "X-Tenant": "belvanger" },
  body: JSON.stringify(events[0]),
});
if (!duplicate.body.duplicate) throw new Error("Deduplicatie werkte niet");

const summary = await request("/api/summary?range=7d", { headers: { Cookie: cookie } });
const contacts = await request("/api/contacts?status=all", { headers: { Cookie: cookie } });
if (summary.body.metrics.missed_calls !== 1 || summary.body.metrics.sms_sent !== 1 || summary.body.metrics.sms_delivered !== 1) throw new Error("KPI-aggregatie klopt niet");
if (contacts.body.contacts.length < 4) throw new Error("Contactaggregatie klopt niet");

// "Deze periode bespaard": 1 opgevangen gemiste oproep × default klus-waarde (€250,
// zolang deze tenant geen eigen waarde heeft ingesteld) × 60% herstelaanname = €150.
const savings = summary.body.savings;
if (!savings || savings.missedCallsCaught !== 1) throw new Error("Bespaard-widget: opgevangen-telling klopt niet");
if (savings.avgJobValueIsDefault && savings.amount !== 150) throw new Error("Bespaard-widget: rekensom klopt niet (verwacht €150 bij default klus-waarde)");

console.log(JSON.stringify({
  health: health.body.ok,
  login: login.body.ok,
  deduplication: duplicate.body.duplicate,
  attention: summary.body.attention,
  metrics: summary.body.metrics,
  savings: summary.body.savings,
  contacts: contacts.body.contacts.length,
}, null, 2));
