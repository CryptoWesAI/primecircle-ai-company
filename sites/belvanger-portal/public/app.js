const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const state = { user: null, summary: null, contacts: [], tenants: [], activeContact: null, view: "overview", savingsShown: 0, proofLog: [], partners: [], knowledge: { entries: [], relationships: [], loaded: false, category: "Alles", query: "", activeId: null } };

const labels = {
  new: "Nieuw", follow_up: "Opvolging nodig", contacted: "Contact gehad", closed: "Afgesloten",
  "call.missed": "Gemiste oproep", "sms.outbound": "Sms verzonden", "sms.status": "Sms-status",
  "sms.inbound": "Sms ontvangen", "email.inbound": "E-mail ontvangen", "website.lead": "Websiteaanvraag",
  "chat.lead": "Aanvraag via chat", "contact.status": "Status gewijzigd",
};
const channelNames = { twilio: "Telefoon en sms", email: "E-mail", website: "Website", chatbot: "Websitechat", dashboard: "Dashboard" };
const proofLogLabels = { "call.missed": "Gemiste oproep opgevangen", "sms.outbound": "Automatische sms verzonden" };
const euro = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

function timeGreeting() {
  const hour = Number(new Intl.DateTimeFormat("nl-NL", { hour: "numeric", hour12: false, timeZone: "Europe/Amsterdam" }).format(new Date()));
  if (hour < 6) return "Goedenacht";
  if (hour < 12) return "Goedemorgen";
  if (hour < 18) return "Goedemiddag";
  return "Goedenavond";
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

async function api(path, options = {}) {
  const response = await fetch(path, { credentials: "same-origin", ...options, headers: { "Content-Type": "application/json", ...(options.headers || {}) } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(body.error || "Er ging iets mis."), { status: response.status });
  return body;
}

function relativeTime(value) {
  const date = new Date(value); const seconds = Math.round((date - Date.now()) / 1000); const abs = Math.abs(seconds);
  const formatter = new Intl.RelativeTimeFormat("nl", { numeric: "auto" });
  if (abs < 60) return formatter.format(seconds, "second");
  if (abs < 3600) return formatter.format(Math.round(seconds / 60), "minute");
  if (abs < 86400) return formatter.format(Math.round(seconds / 3600), "hour");
  return formatter.format(Math.round(seconds / 86400), "day");
}

function contactName(contact) { return contact.name || contact.company || contact.phone || contact.email || "Onbekend contact"; }
function contactMeta(contact) { return [contact.company && contact.company !== contact.name ? contact.company : null, contact.phone, contact.email].filter(Boolean).join(" · "); }
function statusHtml(status) { return `<span class="status status--${escapeHtml(status)}">${escapeHtml(labels[status] || status)}</span>`; }
function channelGlyph(type = "") { return type.startsWith("call") ? "☎" : type.startsWith("sms") ? "S" : type.startsWith("email") ? "@" : type.startsWith("chat") ? "◇" : type.startsWith("contact") ? "+" : "W"; }

function empty(message) { return `<div class="empty">${escapeHtml(message)}</div>`; }

// "Deze periode bespaard": telt van het vorige getoonde bedrag naar het nieuwe op,
// niet altijd vanaf 0 (bij een periodewissel voelt doortellen natuurlijker dan
// terugspringen naar 0). Respecteert prefers-reduced-motion: dan direct het eindcijfer.
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

function animateSavings(toValue) {
  const el = $("#savingsAmount");
  const fromValue = state.savingsShown;
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || fromValue === toValue) {
    el.textContent = euro.format(toValue);
    state.savingsShown = toValue;
    return;
  }
  const duration = 1400;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min(1, (now - start) / duration);
    const eased = easeOutCubic(progress);
    const current = Math.round(fromValue + (toValue - fromValue) * eased);
    el.textContent = euro.format(current);
    if (progress < 1) requestAnimationFrame(tick);
    else state.savingsShown = toValue;
  }
  requestAnimationFrame(tick);
}

function renderSavings() {
  const savings = state.summary.savings;
  const card = $("#savingsCard");
  const sub = $("#savingsSub");
  const calls = savings.missedCallsCaught;
  card.classList.toggle("savings-card--empty", calls === 0);
  animateSavings(savings.amount);

  const callWord = calls === 1 ? "gemiste oproep" : "gemiste oproepen";
  const jobValueText = savings.avgJobValueIsDefault
    ? `${euro.format(savings.avgJobValue)} indicatieve gemiddelde klus-waarde`
    : `${euro.format(savings.avgJobValue)} gemiddelde klus-waarde`;
  const hint = savings.avgJobValueIsDefault
    ? ` Belvanger-beheer kan uw eigen gemiddelde klus-waarde instellen voor een nauwkeuriger bedrag.`
    : "";

  sub.textContent = calls === 0
    ? "Nog geen gemiste oproepen deze periode om op te vangen. Zodra dat gebeurt, telt Belvanger dit bedrag hier automatisch bij op."
    : `Schatting op basis van ${calls} opgevangen ${callWord} × ${jobValueText} × 60% kans op een echte klus.${hint}`;
}

function renderSummary() {
  const data = state.summary;
  $("#attentionCount").textContent = data.attention;
  $("#metricCalls").textContent = data.metrics.missed_calls;
  $("#metricSms").textContent = data.metrics.sms_sent;
  $("#metricSmsDetail").textContent = `${data.metrics.sms_delivered} afgeleverd`;
  $("#metricReplies").textContent = data.metrics.replies;
  $("#metricWeb").textContent = data.metrics.website_leads;
  renderSavings();

  $("#attentionList").innerHTML = data.contacts.length ? data.contacts.map((contact) => `
    <article class="contact-row" data-contact-id="${contact.id}">
      <span class="channel-dot">${channelGlyph(contact.last_event_type)}</span>
      <span class="contact-row__main"><b>${escapeHtml(contactName(contact))}</b><small>${escapeHtml(contactMeta(contact) || "Contactgegevens volgen")}</small></span>
      ${statusHtml(contact.status)}
    </article>`).join("") : empty("Geen contacten wachten op opvolging.");

  $("#activityList").innerHTML = data.recent.length ? data.recent.map((event) => `
    <article class="timeline-item" ${event.contact_id ? `data-contact-id="${event.contact_id}"` : ""}>
      <b>${escapeHtml(event.label)}</b>
      <p>${escapeHtml(contactName(event))}${event.preview ? ` · ${escapeHtml(event.preview)}` : ""}</p>
      <time>${relativeTime(event.occurred_at)} · ${escapeHtml(channelNames[event.source] || event.source)}</time>
    </article>`).join("") : empty("Nieuwe oproepen, berichten en aanvragen verschijnen hier automatisch.");

  const counts = Object.fromEntries(data.channels.map((item) => [item.source, item.count]));
  const sourceTotals = { website: (counts.website || 0) + (counts.chatbot || 0), twilio: counts.twilio || 0, email: counts.email || 0 };
  Object.entries(sourceTotals).forEach(([source, count]) => {
    const card = $(`[data-source-card="${source}"]`); if (!card) return;
    card.classList.toggle("is-connected", count > 0);
    $(".connection__status", card).textContent = count > 0 ? `${count} gebeurtenissen ontvangen` : "Nog geen data ontvangen";
  });
}

async function loadSummary() {
  state.summary = await api(`/api/summary?range=${encodeURIComponent($("#rangeSelect").value)}`);
  renderSummary();
}

function renderProofLog() {
  const entries = state.proofLog;
  $("#proofLogList").innerHTML = entries.length ? entries.map((entry) => `
    <article class="timeline-item">
      <b>${escapeHtml(proofLogLabels[entry.event_type] || entry.label)}</b>
      <time>${new Intl.DateTimeFormat("nl-NL", { dateStyle: "medium", timeStyle: "short" }).format(new Date(entry.occurred_at))}</time>
    </article>`).join("") : empty("Nog geen opgevangen gemiste oproepen of automatische sms'jes in deze periode.");
}

async function loadProofLog() {
  const result = await api(`/api/proof-log?range=${encodeURIComponent($("#rangeSelect").value)}`);
  state.proofLog = result.entries;
  renderProofLog();
}

async function loadConnections() {
  const result = await api("/api/connections");
  for (const connection of result.connections) {
    const card = $(`[data-source-card="${connection.source}"]`);
    if (!card) continue;
    const ready = connection.status === "connected";
    card.classList.toggle("is-connected", ready);
    $(".connection__status", card).textContent = connection.event_count > 0
      ? `${connection.event_count} gebeurtenissen ontvangen`
      : ready ? "Actief" : "Nog niet actief";
  }
}

function renderContacts() {
  const rows = state.contacts.map((contact) => `
    <tr data-contact-id="${contact.id}"><td class="contact-cell"><b>${escapeHtml(contactName(contact))}</b><small>${escapeHtml(contactMeta(contact))}</small></td>
    <td>${escapeHtml(labels[contact.last_event_type] || contact.last_event_type || "–")}</td><td>${statusHtml(contact.status)}</td>
    <td>${escapeHtml(relativeTime(contact.last_event_at))}</td><td class="table-arrow">→</td></tr>`).join("");
  $("#contactsBody").innerHTML = rows || `<tr><td colspan="5">${empty("Geen contacten gevonden.")}</td></tr>`;
  $("#mobileContacts").innerHTML = state.contacts.length ? state.contacts.map((contact) => `
    <article class="contact-row" data-contact-id="${contact.id}"><span class="channel-dot">${channelGlyph(contact.last_event_type)}</span>
    <span class="contact-row__main"><b>${escapeHtml(contactName(contact))}</b><small>${escapeHtml(contactMeta(contact))}</small></span>${statusHtml(contact.status)}</article>`).join("") : empty("Geen contacten gevonden.");
}

async function loadContacts() {
  const params = new URLSearchParams({ status: $("#statusFilter").value, q: $("#contactSearch").value.trim() });
  const result = await api(`/api/contacts?${params}`); state.contacts = result.contacts; renderContacts();
}

function renderPartners() {
  const list = state.partners;
  $("#partnersList").innerHTML = list.length ? list.map((partner) => `
    <article class="partner-row" data-partner-id="${partner.id}">
      <div><b>${escapeHtml(partner.name)}</b><small>${escapeHtml([partner.phone, partner.email].filter(Boolean).join(" · ") || "Geen contactgegevens")}</small></div>
      <button class="text-button" type="button" data-delete-partner="${partner.id}">Verwijderen</button>
    </article>`).join("") : empty("Nog geen partners toegevoegd.");
  const select = $("#detailReferSelect");
  const current = select.value;
  select.innerHTML = '<option value="">Kies een partner…</option>' + list.map((partner) => `<option value="${partner.id}">${escapeHtml(partner.name)}</option>`).join("");
  select.value = current;
}

async function loadPartners() {
  const result = await api("/api/partners");
  state.partners = result.partners;
  renderPartners();
}

$("#partnerForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  await api("/api/partners", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(form))) });
  form.reset();
  await loadPartners();
});

$("#partnersList").addEventListener("click", async (event) => {
  const id = event.target.dataset.deletePartner;
  if (!id) return;
  await api(`/api/partners/${id}`, { method: "DELETE" });
  await loadPartners();
});

// --- Lead doorsturen naar een partner ---------------------------------------------
// Alles wat de partner nodig heeft in één vooringevuld bericht; de klant verstuurt het
// vanaf zijn eigen WhatsApp/SMS (geen partner-login, geen automatische verzending vanuit
// het systeem). Bij versturen loggen we "Doorgestuurd naar X" op de lead via de bestaande
// refer-endpoint, die het ook in de leadtijdlijn zet.
function forwardWaNumber(raw) {
  let d = String(raw || "").replace(/[^\d+]/g, "");
  if (d.startsWith("+")) d = d.slice(1);
  else if (d.startsWith("00")) d = d.slice(2);
  else if (d.startsWith("0")) d = "31" + d.slice(1); // NL: 06… -> 316…
  return d.replace(/\D/g, "");
}

function forwardSummaryText(contact) {
  const naam = contactName(contact);
  const nummer = contact.phone || "onbekend";
  const ev = (state.activeContactEvents || [])[0];
  const kanaal = ev ? ev.label : "Nieuwe aanvraag";
  const tijdBron = ev ? ev.occurred_at : contact.last_event_at;
  const tijd = tijdBron ? new Intl.DateTimeFormat("nl-NL", { dateStyle: "medium", timeStyle: "short" }).format(new Date(tijdBron)) : "";
  const omschrijving = ev ? (ev.preview || ev.subject || "") : "";
  const regels = [
    "Nieuwe lead via Belvanger:",
    `Naam: ${naam}`,
    `Telefoon: ${nummer}`,
    `Binnengekomen: ${kanaal}${tijd ? ", " + tijd : ""}`,
  ];
  if (omschrijving) regels.push(`Betreft: ${omschrijving}`);
  regels.push("", "Kun jij dit oppakken? Laat even weten of het lukt.");
  return regels.join("\n");
}

let forwardPartner = null;
$("#detailReferButton").addEventListener("click", () => {
  if (!state.activeContact) return;
  const partnerId = $("#detailReferSelect").value;
  if (!partnerId) { $("#detailReferStatus").textContent = "Kies eerst een partner."; return; }
  forwardPartner = state.partners.find((p) => String(p.id) === String(partnerId));
  if (!forwardPartner) return;
  $("#forwardTo").textContent = `Aan: ${forwardPartner.name}${forwardPartner.phone ? " (" + forwardPartner.phone + ")" : ""}`;
  $("#forwardMessage").value = forwardSummaryText(state.activeContact);
  const heeftNummer = Boolean(forwardWaNumber(forwardPartner.phone));
  $("#forwardWhatsApp").disabled = !heeftNummer;
  $("#forwardSms").disabled = !heeftNummer;
  $("#forwardNote").textContent = heeftNummer ? "" : "Deze partner heeft geen telefoonnummer. Gebruik Kopieer, of voeg een nummer toe bij Partners.";
  $("#forwardCompose").classList.remove("is-hidden");
  $("#detailReferStatus").textContent = "";
});

$("#forwardCancel").addEventListener("click", () => $("#forwardCompose").classList.add("is-hidden"));

async function logForward() {
  if (!state.activeContact || !forwardPartner) return;
  try {
    const result = await api(`/api/contacts/${state.activeContact.id}/refer`, { method: "POST", body: JSON.stringify({ partner_id: forwardPartner.id }) });
    $("#detailReferStatus").textContent = `Doorgestuurd naar ${result.partner.name} · zojuist`;
    $("#detailReferSelect").value = forwardPartner.id;
    await Promise.all([loadContacts(), loadSummary()]);
  } catch (err) { $("#detailReferStatus").textContent = err.message || "Loggen mislukt."; }
}

// In de publieke demo (/dashboard-demo) niet echt WhatsApp/sms openen naar een verzonnen
// nummer — dat oogt kapot voor een bezoeker. In plaats daarvan een nette voorbeeld-melding;
// de rest van de flow (bericht opstellen, "Doorgestuurd naar X" loggen) werkt gewoon.
// Op het echte dashboard (pad "/") is deze check inert.
const FORWARD_IS_DEMO = location.pathname.startsWith("/dashboard-demo");
$("#forwardWhatsApp").addEventListener("click", () => {
  const num = forwardWaNumber(forwardPartner && forwardPartner.phone);
  if (!num) return;
  if (FORWARD_IS_DEMO) { $("#forwardNote").textContent = `Voorbeeld: op je eigen dashboard opent dit WhatsApp met dit bericht al klaar voor ${forwardPartner.name}.`; logForward(); return; }
  window.open(`https://wa.me/${num}?text=${encodeURIComponent($("#forwardMessage").value)}`, "_blank", "noopener");
  logForward();
});
$("#forwardSms").addEventListener("click", () => {
  const num = forwardWaNumber(forwardPartner && forwardPartner.phone);
  if (!num) return;
  if (FORWARD_IS_DEMO) { $("#forwardNote").textContent = `Voorbeeld: op je eigen dashboard opent dit een sms met dit bericht al klaar voor ${forwardPartner.name}.`; logForward(); return; }
  window.location.href = `sms:+${num}?body=${encodeURIComponent($("#forwardMessage").value)}`;
  logForward();
});
$("#forwardCopy").addEventListener("click", async () => {
  const text = $("#forwardMessage").value;
  try { await navigator.clipboard.writeText(text); }
  catch { const ta = $("#forwardMessage"); ta.focus(); ta.select(); document.execCommand("copy"); }
  $("#forwardNote").textContent = "Gekopieerd. Plak het in WhatsApp of een sms naar je partner.";
});

function integrationLabel(source) {
  return ({ twilio: "Telefoon en sms", website: "Website", email: "E-mail" })[source] || source;
}
function integrationField(integrations, source, field) {
  return (integrations.find((item) => item.source === source) || {})[field] || "";
}

function renderTenants() {
  $("#tenantGrid").innerHTML = state.tenants.length ? state.tenants.map((tenant) => {
    const integrations = tenant.integrations || [];
    const twilio = integrations.find((item) => item.source === "twilio") || {};
    return `<article class="tenant-card">
      <div class="tenant-card__head"><div><h3>${escapeHtml(tenant.name)}</h3><span class="tenant-code">${escapeHtml(tenant.slug)}</span></div><span class="status status--${tenant.active ? "contacted" : "closed"}">${tenant.active ? "Actief" : "Gepauzeerd"}</span></div>
      <div class="tenant-stats"><span><b>${tenant.users}</b>gebruikers</span><span><b>${tenant.contacts}</b>contacten</span></div>
      <div class="integration-pills">${integrations.map((item) => `<span class="integration-pill ${item.status === "connected" ? "is-connected" : ""}">${escapeHtml(integrationLabel(item.source))} · ${item.status === "connected" ? "gekoppeld" : "open"}</span>`).join("")}</div>
      <details class="twilio-config"><summary>${twilio.status === "connected" ? "Telefoon en sms wijzigen" : "Telefoon en sms koppelen"}</summary>
        <form data-twilio-form="${tenant.id}">
          <label>Bestaand nummer<input name="businessNumber" type="tel" value="${escapeHtml(twilio.businessNumber || "")}" placeholder="+31..."></label>
          <label>Opvangnummer<input name="twilioNumber" type="tel" value="${escapeHtml(twilio.externalIdentifier || "")}" placeholder="+31..."></label>
          <label>Accountcode telefoonservice<input name="twilioAccountSid" value="${escapeHtml(twilio.twilioAccountSid || "")}" placeholder="AC..."></label>
          <button class="button button--secondary" type="submit">Telefoonkoppeling opslaan</button><p class="form-error" role="alert"></p>
        </form>
      </details>
      <details class="twilio-config"><summary>Website-domein en klus-waarde instellen</summary>
        <form data-config-form="${tenant.id}">
          <label class="form-span">Website-domein<input name="websiteDomain" value="${escapeHtml(tenant.websiteDomain || "")}" placeholder="belvanger.nl"></label>
          <label class="form-span">Gemiddelde klus-waarde (€)<input name="avgJobValue" type="number" min="1" max="100000" step="1" value="${escapeHtml(tenant.avgJobValue ?? "")}" placeholder="Indicatief: € 250"></label>
          <button class="button button--secondary" type="submit">Opslaan</button><p class="form-error" role="alert"></p>
        </form>
      </details>
      <details class="twilio-config"><summary>n8n-workflows koppelen</summary>
        <form data-n8n-form="${tenant.id}">
          <label>Telefoon en sms<input name="twilioWorkflowId" value="${escapeHtml(integrationField(integrations, "twilio", "n8nWorkflowId"))}" placeholder="workflow-id"></label>
          <label>Website<input name="websiteWorkflowId" value="${escapeHtml(integrationField(integrations, "website", "n8nWorkflowId"))}" placeholder="workflow-id"></label>
          <label>E-mail<input name="emailWorkflowId" value="${escapeHtml(integrationField(integrations, "email", "n8nWorkflowId"))}" placeholder="workflow-id"></label>
          <button class="button button--secondary" type="submit">Workflows opslaan</button><p class="form-error" role="alert"></p>
        </form>
      </details>
      <details class="twilio-config"><summary>${tenant.clarityTokenSet ? "Zichtbaarheid wijzigen" : "Zichtbaarheid koppelen"}</summary>
        <form data-analytics-form="${tenant.id}">
          <label>Clarity project-ID<input name="clarityProjectId" value="${escapeHtml(tenant.clarityProjectId || "")}" placeholder="xp1tz2e1mq"></label>
          <label>Clarity API-token<input name="clarityApiToken" type="password" autocomplete="off" placeholder="${tenant.clarityTokenSet ? "Ingesteld, laat leeg om te behouden" : "Uit Clarity > Settings > Data Export"}"></label>
          <label class="form-span">Google Search Console-link<input name="searchConsoleUrl" value="${escapeHtml(tenant.searchConsoleUrl || "")}" placeholder="https://search.google.com/search-console?resource_id=..."></label>
          <button class="button button--secondary" type="submit">Zichtbaarheid opslaan</button><p class="form-error" role="alert"></p>
        </form>
      </details>
    </article>`;
  }).join("") : empty("Nog geen klantinstallaties. Maak de eerste klant aan.");
}

async function loadTenants() {
  const result = await api("/api/admin/tenants");
  state.tenants = result.tenants;
  renderTenants();
}

const checkLabels = { twilio: "Telefoon en sms", website: "Website", email: "E-mail" };
const checkStatusLabels = { ok: "In orde", warning: "Let op", error: "Fout", not_configured: "Niet gekoppeld", unknown: "Onbekend" };

function renderHealth(data) {
  const when = new Intl.DateTimeFormat("nl-NL", { dateStyle: "medium", timeStyle: "short" }).format(new Date(data.checkedAt));
  const parts = [`${data.summary.ok} in orde`, `${data.summary.warning} let op`, `${data.summary.error} fout`];
  if (data.summary.notConfigured) parts.push(`${data.summary.notConfigured} niet gekoppeld`);
  $("#healthMeta").textContent = `Laatst gecontroleerd: ${when} · ${parts.join(", ")}`;
  $("#healthGrid").innerHTML = data.tenants.length ? data.tenants.map((tenant) => `
    <article class="tenant-card health-card">
      <div class="tenant-card__head"><div><h3>${escapeHtml(tenant.name)}</h3><span class="tenant-code">${escapeHtml(tenant.slug)}</span></div></div>
      <div class="health-rows">
        ${Object.entries(tenant.checks).map(([key, check]) => `
          <div class="health-row health-row--${check.status}">
            <span class="health-row__label">${escapeHtml(checkLabels[key] || key)}</span>
            <span class="health-row__status">${escapeHtml(checkStatusLabels[check.status] || check.status)}</span>
            <span class="health-row__detail">${escapeHtml(check.detail)}</span>
          </div>`).join("")}
      </div>
      ${tenant.lastEventDays !== null ? `<p class="muted health-activity">Laatste activiteit: ${tenant.lastEventDays === 0 ? "vandaag" : `${tenant.lastEventDays} dag(en) geleden`}</p>` : ""}
    </article>`).join("") : empty("Geen actieve klanten om te controleren.");
}

function activityDateLabel(iso) {
  const d = new Date(iso + "T12:00:00");
  return new Intl.DateTimeFormat("nl-NL", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(d);
}

function renderActivity(data) {
  $("#activityMeta").textContent = data.totalEntries
    ? `${data.totalEntries} entries over ${data.totalDays} dagen.`
    : "Nog geen entries.";
  $("#activityTimeline").innerHTML = data.days.length ? data.days.map((day) => `
    <section class="activity-day">
      <h3 class="activity-day__heading">${escapeHtml(activityDateLabel(day.date))}</h3>
      <div class="activity-entries">
        ${day.entries.map((e) => `
          <article class="activity-entry activity-entry--${escapeHtml(e.category)}">
            <div class="activity-entry__head"><span class="activity-entry__badge">${escapeHtml(e.label)}</span><h4>${escapeHtml(e.title)}</h4></div>
            <p>${escapeHtml(e.summary)}</p>
          </article>`).join("")}
      </div>
    </section>`).join("") : empty("Nog geen entries. Voeg de eerste toe met “+ Nieuwe entry”.");
}

async function loadActivity() {
  renderActivity(await api("/api/admin/activity"));
}

// Kennisbank ("second brain"): statisch, geladen via /api/admin/knowledge, één keer per
// sessie gecached. Zoeken/filteren gebeurt client-side (76 documenten, ruim klein genoeg).

// Minimale markdown → HTML, alleen wat deze eigen documenten daadwerkelijk gebruiken
// (kopjes, vet, cursief, inline code, links, lijstjes, blockquotes, alinea's). Geen
// dependency, geen volledige CommonMark — escaped eerst, dus geen HTML-injectie via
// de inhoud.
function renderMarkdown(md) {
  const lines = escapeHtml(md).split("\n");
  const out = [];
  let inList = false, inQuote = false, inCode = false;
  const codeLines = [];
  // Handgeschreven markdown wordt vaak op ~90 tekens zacht afgebroken zonder lege
  // regel ertussen; dat blijft één paragraaf (en **vet** kan over die knip heen lopen),
  // dus platte tekstregels worden gebufferd tot de paragraaf echt eindigt.
  let para = [];
  const flushPara = () => { if (para.length) { out.push(`<p>${inline(para.join(" "))}</p>`); para = []; } };
  const closeList = () => { if (inList) { out.push("</ul>"); inList = false; } };
  const closeQuote = () => { if (inQuote) { out.push("</blockquote>"); inQuote = false; } };
  const inline = (s) => s
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  for (const raw of lines) {
    const line = raw.trimEnd();
    // Fenced code/ascii-diagram blokken: geen markdown-verwerking, regeleindes behouden,
    // niet meegenomen in de paragraaf-samenvoeging hierboven.
    if (/^```/.test(line)) {
      if (inCode) { out.push(`<pre><code>${codeLines.join("\n")}</code></pre>`); codeLines.length = 0; inCode = false; }
      else { flushPara(); closeList(); closeQuote(); inCode = true; }
      continue;
    }
    if (inCode) { codeLines.push(line); continue; }
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) { flushPara(); closeList(); closeQuote(); const level = Math.min(heading[1].length + 2, 6); out.push(`<h${level}>${inline(heading[2])}</h${level}>`); continue; }
    const quote = line.match(/^&gt;\s?(.*)$/);
    if (quote) { flushPara(); closeList(); if (!inQuote) { out.push("<blockquote>"); inQuote = true; } if (quote[1].trim()) out.push(`<p>${inline(quote[1])}</p>`); continue; }
    closeQuote();
    const item = line.match(/^[-*]\s+(.*)$/);
    if (item) { flushPara(); if (!inList) { out.push("<ul>"); inList = true; } out.push(`<li>${inline(item[1])}</li>`); continue; }
    closeList();
    if (!line.trim()) { flushPara(); continue; }
    para.push(line.trim());
  }
  flushPara();
  closeList();
  closeQuote();
  return out.join("");
}

async function loadKnowledge() {
  if (state.knowledge.loaded) return renderKnowledgeCategories(), renderKnowledgeList();
  const data = await api("/api/admin/knowledge");
  state.knowledge.entries = data.entries || [];
  state.knowledge.relationships = data.relationships || [];
  state.knowledge.loaded = true;
  // Belvanger's Kennisbank toont tegenwoordig uitsluitend Belvanger-content (één
  // categorie) — een categorieniveau met daarin precies één node om op te klikken
  // is geen echte stap, dus de graafweergave start meteen op documentniveau.
  const cats = [...new Set(state.knowledge.entries.map((e) => e.category))];
  if (cats.length === 1) {
    state.knowledgeGraphState.level = "documents";
    state.knowledgeGraphState.category = cats[0];
  }
  renderKnowledgeCategories();
  renderKnowledgeList();
  renderKnowledgeStaleness(data.staleness);
}

// Toont het resultaat van de nachtelijke staleness-check (server.js): een roterende
// steekproef van relaties wordt elke nacht herchecked tegen de huidige documentinhoud.
// Dit ontdekt geen nieuwe documenten (dat kan alleen via een herbuild+deploy), maar
// maakt zichtbaar wanneer een bestaande relatie is verweerd sinds de laatste analyse.
function renderKnowledgeStaleness(staleness) {
  const el = $("#knowledgeStaleness");
  if (!staleness || !staleness.lastRunAt) { el.classList.add("is-hidden"); return; }
  const when = new Date(staleness.lastRunAt).toLocaleString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  const flagged = staleness.flagged || [];
  el.classList.remove("is-hidden");
  el.classList.toggle("is-clean", flagged.length === 0);
  el.classList.toggle("is-flagged", flagged.length > 0);
  el.textContent = flagged.length === 0
    ? `Laatste controle ${when}: ${staleness.checkedCount}/${staleness.totalEdges} relaties gecontroleerd, geen afwijkingen.`
    : `Laatste controle ${when}: ${flagged.length} relatie${flagged.length === 1 ? "" : "s"} mogelijk verouderd — ${flagged.map((f) => f.from).join(", ")}.`;
}

// Echte, per-document geanalyseerde relaties (zie knowledge-relationships.json) — geen
// verzonnen/keyword-koppeling. Gebruikt door zowel het lijst- als het graafdetailpaneel.
function knowledgeRelated(path) {
  return state.knowledge.relationships
    .filter((e) => e.from === path || e.to === path)
    .map((e) => {
      const otherPath = e.from === path ? e.to : e.from;
      const entry = state.knowledge.entries.find((x) => x.path === otherPath);
      return entry ? { entry, reason: e.reason } : null;
    })
    .filter(Boolean);
}

function renderKnowledgeCategories() {
  const cats = ["Alles", ...new Set(state.knowledge.entries.map((e) => e.category))];
  $("#knowledgeCategories").innerHTML = cats.map((cat) => `
    <button class="knowledge-pill${cat === state.knowledge.category ? " is-active" : ""}" type="button" data-category="${escapeHtml(cat)}">${escapeHtml(cat)}</button>`).join("");
}

function knowledgeSnippet(entry, query) {
  if (!query) return "";
  const idx = entry.content.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return "";
  const start = Math.max(0, idx - 40);
  const snippet = entry.content.slice(start, idx + 80).replace(/\s+/g, " ").trim();
  return `${start > 0 ? "…" : ""}${escapeHtml(snippet)}…`;
}

function renderKnowledgeList() {
  const { entries, category, query } = state.knowledge;
  const q = query.trim().toLowerCase();
  const filtered = entries.filter((e) =>
    (category === "Alles" || e.category === category) &&
    (!q || e.title.toLowerCase().includes(q) || e.content.toLowerCase().includes(q) || e.path.toLowerCase().includes(q))
  );
  $("#knowledgeCount").textContent = `${filtered.length} document${filtered.length === 1 ? "" : "en"}`;
  $("#knowledgeList").innerHTML = filtered.length ? filtered.map((e) => `
    <button class="knowledge-item${e.path === state.knowledge.activeId ? " is-active" : ""}" type="button" data-path="${escapeHtml(e.path)}">
      <b>${escapeHtml(e.title)}</b>
      <small>${escapeHtml(e.path)}</small>
      ${q ? `<span class="knowledge-snippet">${knowledgeSnippet(e, q)}</span>` : ""}
    </button>`).join("") : empty("Geen documenten gevonden.");
}

function knowledgeDocHtml(entry) {
  const related = knowledgeRelated(entry.path);
  return `
    <header class="knowledge-doc__head">
      <p class="eyebrow">${escapeHtml(entry.category)} · ${escapeHtml(entry.path)}</p>
      <h2>${escapeHtml(entry.title)}</h2>
    </header>
    <div class="knowledge-doc__body">${renderMarkdown(entry.content)}</div>
    ${related.length ? `
    <div class="knowledge-related">
      <h3>Hoort hierbij (${related.length})</h3>
      <ul>${related.map((r) => `
        <li><button type="button" data-related-path="${escapeHtml(r.entry.path)}">${escapeHtml(r.entry.title)}<small>${escapeHtml(r.reason)}</small></button></li>`).join("")}</ul>
    </div>` : ""}`;
}

function renderKnowledgeDoc(entry) {
  state.knowledge.activeId = entry.path;
  $("#knowledgeDoc").innerHTML = knowledgeDocHtml(entry);
  renderKnowledgeList();
}
$("#knowledgeDoc").addEventListener("click", (event) => {
  const btn = event.target.closest("[data-related-path]");
  if (!btn) return;
  const entry = state.knowledge.entries.find((e) => e.path === btn.dataset.relatedPath);
  if (entry) { renderKnowledgeDoc(entry); $("#knowledgeDoc").scrollTop = 0; }
});

$("#knowledgeSearch").addEventListener("input", (event) => { state.knowledge.query = event.target.value; renderKnowledgeList(); });
$("#knowledgeCategories").addEventListener("click", (event) => {
  const btn = event.target.closest("[data-category]");
  if (!btn) return;
  state.knowledge.category = btn.dataset.category;
  renderKnowledgeCategories();
  renderKnowledgeList();
});
$("#knowledgeList").addEventListener("click", (event) => {
  const btn = event.target.closest("[data-path]");
  if (!btn) return;
  const entry = state.knowledge.entries.find((e) => e.path === btn.dataset.path);
  if (entry) renderKnowledgeDoc(entry);
});

// --- Kennisbank: Graaf-weergave (canvas-engine) -----------------------------------
// Eén enkele <canvas> die zelf projecteert en tekent — geen DOM-nodes meer. Dat geeft
// volledige controle over diepte-sortering, gloed/bloom, sfeer en soepele motion, en
// (belangrijk) labels verschijnen alleen bij hover/actief/hub/kern, zodat 14 documenten
// in een klein vlak nooit meer over elkaar heen vallen. De bol draait vrij met de muis,
// met traag "leven" (idle-spin) en momentum. Relaties zijn nooit verzonnen — alleen de
// weergave is nieuw; de data komt onveranderd uit knowledge-relationships.json.
const KNOWLEDGE_COLORS = {
  "Belvanger": "#ff7a3c",
  "Chatbot-product": "#4fd1c5",
  "PrimeCircle — bedrijfsbreed": "#7c9cff",
  "Skills": "#d2a84a",
};

// Type-vocabulaire is afgeleid van de écht voorkomende taal in de handmatig
// geanalyseerde reasons (geen generiek "extends/contradicts"-schema): geclassificeerd
// en over de hele dataset getest. De kleuren dienen als visuele grammatica op de edges.
const KNOWLEDGE_REL_TYPES = {
  "builds-on": { label: "bouwt voort op", color: "#ffb454", speed: 1.4 },
  "references": { label: "verwijst naar", color: "#72dcff", speed: 0.95 },
  "companion": { label: "zelfde onderwerp", color: "#c98bff", speed: 0.7 },
  "corrects": { label: "corrigeert", color: "#ff6b6b", speed: 1.8 },
  "relates-to": { label: "gerelateerd", color: "#9fb2c0", speed: 0.55 },
};
function classifyRelationship(reason) {
  const r = (reason || "").toLowerCase();
  if (/corrigeert zichzelf|vervangt|vervangen door|achterhaald/.test(r)) return "corrects";
  if (/beide (behandelen|beschrijven)|dezelfde .*(die|dat)|allebei|wederzijdse|documenteert precies|documenteert.*dat.*(beoordeelt|behandelt)/.test(r)) return "companion";
  if (/voort\s*(te\s*)?bouw|bouwt? .*voort|voortvloei|gebaseerd op|implementeert|past .* toe|hergebruikt|concrete (uitwerking|implementatie|realisatie|voorbeeld) van|letterlijk uitgewerkt voorbeeld|toepast|is (de|het|precies) .*(uitwerking|implementatie|invulling|aanpak|methodologie|standaard|realisatie|beslissing achter|voorbeeld) (van|die|dat|achter)|eist (expliciet )?dat|vereist|draagt .*over naar|is het volgende|aanvulling op|is de beslissing achter/.test(r)) return "builds-on";
  if (/verwijst|noemt|citeert|wijs?t? .*naar|linkt|haakt .* in op|index noemt|indexeert|instrueert|lees dit bestand|vastgelegd (in|als)|bijgehouden in|documenteert/.test(r)) return "references";
  return "relates-to";
}

const KG_FLAT = new Set(["force", "circle", "rings", "bubbles"]);
const KG = (state.knowledgeGraphState = {
  level: "categories", category: null, layout: "globe",
  nodes: [], edges: [],
  cur: {}, target: {},
  rotX: -0.28, rotY: 0.55, velX: 0, velY: 0,
  tRotX: null, tRotY: null, focusUntil: 0,
  zoom: 1, tZoom: 1,
  hoverId: null, activeId: null, focusId: null,
  screen: {}, edgeCache: [],
  dragging: false, lastInteract: 0, moved: 0,
  stars: null,
});

function kgClamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
function knowledgeHexToRgb(hex) { const n = parseInt(hex.replace("#", ""), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function knowledgeStringHash(str) { let h = 0; for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0; return Math.abs(h); }

// --- Layouts: alle in eenheids-schaal (straal ~1), projectie schaalt naar het scherm ---
function kgFibSphere(n) {
  if (n <= 0) return [];
  const pts = [], off = 2 / n, inc = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = i * off - 1 + off / 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const phi = i * inc;
    pts.push({ x: Math.cos(phi) * r, y: y, z: Math.sin(phi) * r });
  }
  return pts;
}
// De meest-verbonden documenten naar voren (hoogste z) zodat autoriteit meteen leest.
function kgLayoutGlobe(shell) {
  const pos = kgFibSphere(shell.length);
  const byDeg = shell.map((n, i) => i).sort((a, b) => (shell[b].degree || 0) - (shell[a].degree || 0));
  const byZ = pos.map((p, i) => i).sort((a, b) => pos[b].z - pos[a].z);
  const out = {};
  byDeg.forEach((nodeIdx, rank) => { out[shell[nodeIdx].id] = pos[byZ[rank]]; });
  return out;
}
function kgLayoutForce(shell) {
  const golden = Math.PI * (3 - Math.sqrt(5)), out = {};
  shell.forEach((n, i) => {
    const r = 1.15 * Math.sqrt((i + 0.5) / shell.length), a = i * golden;
    out[n.id] = { x: Math.cos(a) * r, y: Math.sin(a) * r * 0.9, z: 0 };
  });
  return out;
}
function kgLayoutCircle(shell) {
  const out = {};
  shell.forEach((n, i) => {
    const a = (i / Math.max(1, shell.length)) * Math.PI * 2 - Math.PI / 2;
    out[n.id] = { x: Math.cos(a) * 1.12, y: Math.sin(a) * 1.12, z: 0 };
  });
  return out;
}
// Concentrische ringen op basis van échte in-degree: meest-verwezen documenten binnenin.
function kgLayoutRings(shell) {
  const tiers = [[], [], []];
  shell.forEach((n) => { const d = n.degree || 0; if (n.isHub || d >= 4) tiers[0].push(n); else if (d >= 1) tiers[1].push(n); else tiers[2].push(n); });
  const radii = [0.42, 0.86, 1.24], out = {};
  tiers.forEach((tier, ti) => tier.forEach((n, i) => {
    const a = (i / Math.max(1, tier.length)) * Math.PI * 2 - Math.PI / 2 + ti * 0.4;
    out[n.id] = { x: Math.cos(a) * radii[ti], y: Math.sin(a) * radii[ti], z: 0 };
  }));
  return out;
}
// Clustert op échte connectiviteit (union-find over de relatie-edges).
function kgLayoutBubbles(shell, edges) {
  const parent = {}; shell.forEach((n) => { parent[n.id] = n.id; });
  const find = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
  for (const e of edges) { if (!(e.from in parent) || !(e.to in parent)) continue; const ra = find(e.from), rb = find(e.to); if (ra !== rb) parent[ra] = rb; }
  const groups = {}; shell.forEach((n) => { const r = find(n.id); (groups[r] = groups[r] || []).push(n); });
  const clusters = Object.values(groups).sort((a, b) => b.length - a.length);
  const out = {}, step = (Math.PI * 2) / Math.max(1, clusters.length);
  clusters.forEach((cluster, ci) => {
    const clusterR = clusters.length === 1 ? 0 : 0.82;
    const ca = ci * step - Math.PI / 2, cx = Math.cos(ca) * clusterR, cy = Math.sin(ca) * clusterR;
    const innerR = 0.14 + Math.sqrt(cluster.length) * 0.15;
    cluster.forEach((n, i) => { const a = (i / Math.max(1, cluster.length)) * Math.PI * 2; out[n.id] = { x: cx + Math.cos(a) * innerR, y: cy + Math.sin(a) * innerR, z: 0 }; });
  });
  return out;
}
function kgLayout(shell, edges, layout) {
  if (layout === "force") return kgLayoutForce(shell);
  if (layout === "circle") return kgLayoutCircle(shell);
  if (layout === "rings") return kgLayoutRings(shell);
  if (layout === "bubbles") return kgLayoutBubbles(shell, edges);
  return kgLayoutGlobe(shell);
}

function knowledgeGraphData() {
  const gs = KG, nodes = [], edges = [];
  if (gs.level === "categories") {
    const cats = [...new Set(state.knowledge.entries.map((e) => e.category))];
    nodes.push({ id: "__core__", label: "Kennisbank", type: "core", color: "#eaf3fb" });
    cats.forEach((cat) => {
      const count = state.knowledge.entries.filter((e) => e.category === cat).length;
      nodes.push({ id: cat, label: cat, sub: `${count} document${count === 1 ? "" : "en"}`, type: "category", color: KNOWLEDGE_COLORS[cat] || "#8fa3b0", degree: count });
      edges.push({ from: "__core__", to: cat, weight: 2 });
    });
    const crossCounts = {}, catOf = Object.fromEntries(state.knowledge.entries.map((e) => [e.path, e.category]));
    for (const rel of state.knowledge.relationships) {
      const a = catOf[rel.from], b = catOf[rel.to];
      if (a && b && a !== b) { const key = [a, b].sort().join("|"); crossCounts[key] = (crossCounts[key] || 0) + 1; }
    }
    for (const [key, count] of Object.entries(crossCounts)) { const [a, b] = key.split("|"); edges.push({ from: a, to: b, weight: Math.min(count, 8) }); }
  } else {
    const docs = state.knowledge.entries.filter((e) => e.category === gs.category);
    const inCat = new Set(docs.map((d) => d.path)), docEdges = [];
    for (const rel of state.knowledge.relationships) {
      if (inCat.has(rel.from) && inCat.has(rel.to)) docEdges.push({ from: rel.from, to: rel.to, weight: 1, type: classifyRelationship(rel.reason), reason: rel.reason });
    }
    const degree = {};
    for (const e of docEdges) { degree[e.from] = (degree[e.from] || 0) + 1; degree[e.to] = (degree[e.to] || 0) + 1; }
    const maxDegree = Math.max(1, ...Object.values(degree));
    nodes.push({ id: "__cat_core__", label: gs.category, type: "core", color: KNOWLEDGE_COLORS[gs.category] || "#eaf3fb" });
    docs.forEach((doc) => {
      const deg = degree[doc.path] || 0;
      nodes.push({ id: doc.path, label: doc.title.length > 32 ? doc.title.slice(0, 31) + "…" : doc.title, type: "doc", color: KNOWLEDGE_COLORS[doc.category] || "#8fa3b0", degree: deg, isHub: deg >= 4 && deg === maxDegree });
    });
    edges.push(...docEdges);
  }
  return { nodes, edges };
}

// (Her)bouwt het datamodel + doelposities. Bij een verse bouw starten de nodes licht
// ingeklapt naar het midden, zodat ze soepel "openvouwen" naar hun plek (deploy-gevoel).
function buildKnowledgeGlobe(fresh) {
  const { nodes, edges } = knowledgeGraphData();
  KG.nodes = nodes; KG.edges = edges;
  const shell = nodes.filter((n) => n.type !== "core");
  const pos = kgLayout(shell, edges, KG.layout);
  const target = {};
  for (const n of nodes) target[n.id] = n.type === "core" ? { x: 0, y: 0, z: 0 } : (pos[n.id] || { x: 0, y: 0, z: 0 });
  KG.target = target;
  const cur = {};
  for (const n of nodes) {
    const t = target[n.id];
    cur[n.id] = (!fresh && KG.cur[n.id]) ? KG.cur[n.id] : { x: t.x * 0.12, y: t.y * 0.12, z: t.z * 0.12 };
  }
  KG.cur = cur;
}
function kgRot(p) {
  const cy = Math.cos(KG.rotY), sy = Math.sin(KG.rotY);
  const x1 = p.x * cy - p.z * sy, z1 = p.x * sy + p.z * cy;
  const cx = Math.cos(KG.rotX), sx = Math.sin(KG.rotX);
  const y1 = p.y * cx - z1 * sx, z2 = p.y * sx + z1 * cx;
  return { x: x1, y: y1, z: z2 };
}
function kgBaseRadius(n) { return n.type === "core" ? 9.5 : n.isHub ? 7.2 : 4.6 + Math.min(2.4, (n.degree || 0) * 0.45); }

const KG_CAM = 2.7;
function kgProject(rp, w, h) {
  const R = Math.min(w, h) * 0.4 * KG.zoom;
  const s = KG_CAM / (KG_CAM - rp.z);
  return { sx: w / 2 + rp.x * s * R, sy: h / 2 - rp.y * s * R, s, z: rp.z };
}

function kgAtmosphere(ctx, w, h, t) {
  const g = ctx.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.52, Math.max(w, h) * 0.8);
  g.addColorStop(0, "#101c2b"); g.addColorStop(0.55, "#0a121c"); g.addColorStop(1, "#05080d");
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = "lighter";
  const blob = (x, y, r, col) => { const b = ctx.createRadialGradient(x, y, 0, x, y, r); b.addColorStop(0, col); b.addColorStop(1, "rgba(0,0,0,0)"); ctx.fillStyle = b; ctx.fillRect(x - r, y - r, r * 2, r * 2); };
  blob(w * 0.26, h * 0.3, Math.min(w, h) * 0.5, "rgba(255,110,50,0.06)");
  blob(w * 0.78, h * 0.72, Math.min(w, h) * 0.55, "rgba(90,150,255,0.055)");
  if (!KG.stars) KG.stars = Array.from({ length: 80 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.1 + 0.25, a: Math.random() * 0.45 + 0.12, tw: Math.random() * 6 }));
  ctx.fillStyle = "#dCEBF7";
  for (const s of KG.stars) { ctx.globalAlpha = s.a * (0.55 + 0.45 * Math.sin(t * 0.0013 + s.tw)); ctx.beginPath(); ctx.arc(s.x * w, s.y * h, s.r, 0, 6.2832); ctx.fill(); }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
  const v = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.28, w / 2, h / 2, Math.max(w, h) * 0.72);
  v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.5)");
  ctx.fillStyle = v; ctx.fillRect(0, 0, w, h);
}

function kgQuad(a, c, b, p) { const m = 1 - p; return { x: m * m * a.x + 2 * m * p * c.x + p * p * b.x, y: m * m * a.y + 2 * m * p * c.y + p * p * b.y }; }

function kgDraw(t) {
  const canvas = $("#knowledgeCanvas"), wrap = $("#knowledgeGraphWrap");
  if (!canvas || wrap.clientWidth === 0) return;
  const rect = wrap.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = rect.width, h = rect.height;
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  kgAtmosphere(ctx, w, h, t);

  // Project alle nodes.
  const screen = {};
  for (const n of KG.nodes) { const c = KG.cur[n.id]; if (!c) continue; const rp = kgRot(c); const sc = kgProject(rp, w, h); sc.r = kgBaseRadius(n) * sc.s; screen[n.id] = sc; }
  KG.screen = screen;

  // Edges (achter de nodes), gebogen naar het midden, diepte-vervaagd, met stromende puls.
  const edgeCache = [];
  ctx.globalCompositeOperation = "lighter";
  for (const edge of KG.edges) {
    const a = screen[edge.from], b = screen[edge.to];
    if (!a || !b) continue;
    edgeCache.push({ ...edge, ax: a.sx, ay: a.sy, bx: b.sx, by: b.sy });
    const typed = edge.type && KNOWLEDGE_REL_TYPES[edge.type];
    const rgb = typed ? knowledgeHexToRgb(typed.color) : [120, 170, 210];
    const depth = (a.z + b.z) / 2, dfade = 0.3 + 0.7 * ((depth + 1) / 2);
    const emph = edge.from === KG.hoverId || edge.to === KG.hoverId || edge.from === KG.activeId || edge.to === KG.activeId;
    const cx = (a.sx + b.sx) / 2 + (w / 2 - (a.sx + b.sx) / 2) * 0.12;
    const cy = (a.sy + b.sy) / 2 + (h / 2 - (a.sy + b.sy) / 2) * 0.12;
    ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${(emph ? 0.6 : 0.14 + (edge.weight || 1) * 0.03) * dfade})`;
    ctx.lineWidth = (emph ? 1.8 : 0.7 + Math.min(1.4, (edge.weight || 1) * 0.25));
    ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.quadraticCurveTo(cx, cy, b.sx, b.sy); ctx.stroke();
    if (typed) {
      const speed = typed.speed || 1;
      const phase = (t * 0.00028 * speed + (knowledgeStringHash(edge.from + edge.to) % 100) / 100) % 1;
      const q = kgQuad(a, { x: cx, y: cy }, b, phase);
      ctx.beginPath(); ctx.arc(q.x, q.y, emph ? 2.6 : 1.9, 0, 6.2832);
      ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${(emph ? 1 : 0.85) * dfade})`; ctx.fill();
    }
  }
  KG.edgeCache = edgeCache;

  // Nodes van achter naar voor.
  const order = KG.nodes.slice().sort((a, b) => screen[a.id].z - screen[b.id].z);
  const lightDir = { x: -0.4, y: -0.5 };
  for (const n of order) {
    const sc = screen[n.id]; if (!sc) continue;
    const depthT = (sc.z + 1) / 2;
    const active = n.id === KG.activeId;
    const focusDim = KG.focusId && !active && n.type !== "core" && n.id !== KG.hoverId ? 0.32 : 1;
    const [cr, cg, cb] = knowledgeHexToRgb(n.color);
    const r = Math.max(2, sc.r);
    const a = (0.42 + 0.58 * depthT) * focusDim;
    // Gloed
    const glow = ctx.createRadialGradient(sc.sx, sc.sy, 0, sc.sx, sc.sy, r * 4.6);
    glow.addColorStop(0, `rgba(${cr},${cg},${cb},${0.5 * a})`);
    glow.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(sc.sx, sc.sy, r * 4.6, 0, 6.2832); ctx.fill();
    ctx.globalCompositeOperation = "source-over";
    // Orb met rimlicht
    const ox = sc.sx + lightDir.x * r * 0.4, oy = sc.sy + lightDir.y * r * 0.4;
    const orb = ctx.createRadialGradient(ox, oy, r * 0.1, sc.sx, sc.sy, r);
    orb.addColorStop(0, `rgba(255,246,236,${a})`);
    orb.addColorStop(0.42, `rgba(${cr},${cg},${cb},${a})`);
    orb.addColorStop(1, `rgba(${Math.round(cr * 0.42)},${Math.round(cg * 0.34)},${Math.round(cb * 0.34)},${a})`);
    ctx.fillStyle = orb; ctx.beginPath(); ctx.arc(sc.sx, sc.sy, r, 0, 6.2832); ctx.fill();
    ctx.strokeStyle = `rgba(255,255,255,${0.22 * depthT * focusDim})`; ctx.lineWidth = 1; ctx.stroke();
    // Ring alleen om het ACTIEF aangeklikte document — dat is het enige "geselecteerd"-
    // signaal. De hub valt al genoeg op door zijn iets grotere orb + vaste label; een
    // eigen ring liet 'm ten onrechte permanent "geselecteerd" lijken.
    if (active) {
      const pr = r + 4 + Math.sin(t * 0.004) * 2;
      ctx.strokeStyle = `rgba(255,255,255,${0.85 * depthT})`;
      ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(sc.sx, sc.sy, pr, 0, 6.2832); ctx.stroke();
    }
  }

  // Labels — alleen kern, hub, hover en actief, zodat niets overlapt. In prioriteits-
  // volgorde tekenen (actief > hover > kern > hub) en een label overslaan als het vak
  // botst met een al geplaatst vak — anders vallen kern- en hub-label soms over elkaar.
  const labelOrder = [];
  const pushId = (id) => { if (id && !labelOrder.includes(id)) labelOrder.push(id); };
  pushId(KG.activeId); pushId(KG.hoverId);
  for (const n of KG.nodes) if (n.type === "core") pushId(n.id);
  for (const n of KG.nodes) if (n.isHub) pushId(n.id);
  ctx.textBaseline = "middle";
  const placed = [];
  const overlaps = (a) => placed.some((b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y);
  for (const id of labelOrder) {
    const n = KG.nodes.find((k) => k.id === id), sc = screen[id];
    if (!n || !sc || sc.z < -0.75) continue;
    const strong = id === KG.hoverId || id === KG.activeId || n.type === "core";
    ctx.font = `${strong ? "700" : "600"} ${n.type === "core" ? 13 : 12}px "Fraunces", system-ui, sans-serif`;
    const tw = ctx.measureText(n.label).width, padX = 9, bh = 22, bw = tw + padX * 2;
    let lx = sc.sx + sc.r + 9, ly = sc.sy;
    if (lx + bw > w - 8) lx = sc.sx - sc.r - 9 - bw;
    lx = kgClamp(lx, 8, w - bw - 8);
    ly = kgClamp(ly, bh / 2 + 6, h - bh / 2 - 6);
    const box = { x: lx, y: ly - bh / 2, w: bw, h: bh };
    if (overlaps(box) && !strong) continue; // zwakke labels wijken; actief/hover/kern winnen altijd
    if (overlaps(box) && strong) { box.y = kgClamp(ly + bh + 4 - bh / 2, 6, h - bh - 6); if (overlaps(box)) continue; }
    placed.push(box);
    ctx.fillStyle = "rgba(7,12,19,0.86)";
    const bx = box.x, by = box.y, rad = 7;
    ctx.beginPath();
    ctx.moveTo(bx + rad, by); ctx.arcTo(bx + bw, by, bx + bw, by + bh, rad); ctx.arcTo(bx + bw, by + bh, bx, by + bh, rad);
    ctx.arcTo(bx, by + bh, bx, by, rad); ctx.arcTo(bx, by, bx + bw, by, rad); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = `rgba(${knowledgeHexToRgb(n.color).join(",")},0.5)`; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = strong ? "#f4f9fd" : "#c9d8e2";
    ctx.fillText(n.label, box.x + padX, box.y + bh / 2 + 0.5);
  }
}

// --- Update-stap: rotatie (idle-spin, momentum, focus-ease), zoom, positie-morph ------
function kgStep(t) {
  KG.zoom += (KG.tZoom - KG.zoom) * 0.15;
  for (const n of KG.nodes) { const c = KG.cur[n.id], tg = KG.target[n.id]; if (c && tg) { c.x += (tg.x - c.x) * 0.14; c.y += (tg.y - c.y) * 0.14; c.z += (tg.z - c.z) * 0.14; } }
  if (KG.focusUntil > t && KG.tRotX != null) {
    KG.rotX += (KG.tRotX - KG.rotX) * 0.12; KG.rotY += (KG.tRotY - KG.rotY) * 0.12;
  } else if (!KG.dragging) {
    if (KG_FLAT.has(KG.layout)) {
      KG.velX *= 0.9; KG.velY *= 0.9;
      KG.rotX += ((-0.14) - KG.rotX) * 0.07 + KG.velX;
      KG.rotY += (0 - KG.rotY) * 0.07 + KG.velY;
    } else {
      KG.rotY += KG.velY; KG.rotX += KG.velX;
      KG.velX *= 0.95; KG.velY *= 0.95;
      if (t - KG.lastInteract > 2200 && Math.abs(KG.velY) < 0.002 && !KG.focusId) KG.rotY += 0.0022;
      KG.rotX = kgClamp(KG.rotX, -1.45, 1.45);
    }
  }
}

let knowledgeEdgesLoopId = null;
function knowledgeGraphLoop(t) {
  if ($("#knowledgeGraphView").classList.contains("is-hidden")) { knowledgeEdgesLoopId = null; return; }
  kgStep(t); kgDraw(t);
  knowledgeEdgesLoopId = requestAnimationFrame(knowledgeGraphLoop);
}
function startKnowledgeEdgesLoop() { if (!knowledgeEdgesLoopId) knowledgeEdgesLoopId = requestAnimationFrame(knowledgeGraphLoop); }

// --- Hit-testing --------------------------------------------------------------------
function kgNodeAt(x, y) {
  let best = null, bestZ = -Infinity;
  for (const n of KG.nodes) {
    const sc = KG.screen[n.id]; if (!sc) continue;
    if (Math.hypot(x - sc.sx, y - sc.sy) <= sc.r + 7 && sc.z > bestZ) { bestZ = sc.z; best = n.id; }
  }
  return best;
}
function knowledgeEdgeAt(x, y) {
  let best = null, bestDist = 8;
  for (const edge of KG.edgeCache) {
    if (!edge.reason) continue;
    const { ax, ay, bx, by } = edge, dx = bx - ax, dy = by - ay, lenSq = dx * dx + dy * dy || 1;
    let tt = kgClamp(((x - ax) * dx + (y - ay) * dy) / lenSq, 0, 1);
    const px = ax + tt * dx, py = ay + tt * dy, dist = Math.hypot(x - px, y - py);
    if (dist < bestDist) { bestDist = dist; best = edge; }
  }
  return best;
}

// --- Camera-focus op klik (cancelbaar) ----------------------------------------------
function knowledgeSnapCameraTo(nodeId) {
  KG.focusId = nodeId;
  if (KG_FLAT.has(KG.layout)) return;
  const c = KG.cur[nodeId]; if (!c) return;
  KG.tRotY = -Math.atan2(c.x, c.z || 0.0001);
  KG.tRotX = kgClamp(Math.atan2(c.y, Math.hypot(c.x, c.z) || 0.0001), -1.4, 1.4);
  KG.focusUntil = performance.now() + 750;
}

function renderKnowledgeGraphDoc(entry) {
  KG.activeId = entry.path;
  state.knowledge.activeId = entry.path;
  $("#knowledgeGraphDoc").innerHTML = knowledgeDocHtml(entry);
}
$("#knowledgeGraphDoc").addEventListener("click", (event) => {
  const btn = event.target.closest("[data-related-path]");
  if (!btn) return;
  const entry = state.knowledge.entries.find((e) => e.path === btn.dataset.relatedPath);
  if (!entry) return;
  if (entry.category !== KG.category) {
    KG.level = "documents"; KG.category = entry.category;
    buildKnowledgeGlobe(true); $("#knowledgeGraphBack").classList.remove("is-hidden");
  }
  renderKnowledgeGraphDoc(entry); knowledgeSnapCameraTo(entry.path);
  $("#knowledgeGraphDoc").scrollTop = 0;
});

function goKnowledgeCategoryLevel() {
  if (new Set(state.knowledge.entries.map((e) => e.category)).size <= 1) return;
  KG.level = "categories"; KG.category = null; KG.focusId = null;
  $("#knowledgeGraphBack").classList.add("is-hidden");
  $("#knowledgeEdgeEvidence").classList.add("is-hidden");
  buildKnowledgeGlobe(true); knowledgeApplyLayoutHint();
}
$("#knowledgeGraphBack").addEventListener("click", goKnowledgeCategoryLevel);

// --- Bewijspaneel op een klikbare edge ----------------------------------------------
function showKnowledgeEdgeEvidence(edge, clientX, clientY) {
  const rect = $("#knowledgeGraphWrap").getBoundingClientRect(), panel = $("#knowledgeEdgeEvidence");
  const typed = KNOWLEDGE_REL_TYPES[edge.type] || KNOWLEDGE_REL_TYPES["relates-to"];
  const fromEntry = state.knowledge.entries.find((e) => e.path === edge.from);
  const toEntry = state.knowledge.entries.find((e) => e.path === edge.to);
  panel.style.setProperty("--evidence-color", typed.color);
  $("#knowledgeEdgeEvidenceType").textContent = `${typed.label} — ${fromEntry ? fromEntry.title : edge.from} ↔ ${toEntry ? toEntry.title : edge.to}`;
  $("#knowledgeEdgeEvidenceReason").textContent = edge.reason;
  let left = kgClamp(clientX - rect.left + 12, 8, rect.width - 282), top = kgClamp(clientY - rect.top + 12, 8, rect.height - 120);
  panel.style.left = `${left}px`; panel.style.top = `${top}px`;
  panel.classList.remove("is-hidden");
}
$("#knowledgeEdgeEvidenceClose").addEventListener("click", () => $("#knowledgeEdgeEvidence").classList.add("is-hidden"));

// --- Muis/touch op de canvas: slepen om te draaien, klik = node/edge, scroll = zoom ---
(function setupKnowledgeCanvas() {
  const canvas = $("#knowledgeCanvas");
  let lastX = 0, lastY = 0;
  const point = (e) => (e.touches ? e.touches[0] : e);

  function down(e) {
    const p = point(e); KG.dragging = true; KG.moved = 0; KG.focusId = null; KG.focusUntil = 0;
    lastX = p.clientX; lastY = p.clientY; KG.lastInteract = performance.now();
    canvas.classList.add("is-dragging");
  }
  function move(e) {
    const p = point(e), rect = canvas.getBoundingClientRect(), x = p.clientX - rect.left, y = p.clientY - rect.top;
    if (KG.dragging) {
      const dx = p.clientX - lastX, dy = p.clientY - lastY; lastX = p.clientX; lastY = p.clientY;
      KG.moved += Math.abs(dx) + Math.abs(dy); KG.lastInteract = performance.now();
      KG.rotY += dx * 0.006; KG.rotX = kgClamp(KG.rotX - dy * 0.006, -1.45, 1.45);
      KG.velY = dx * 0.006; KG.velX = -dy * 0.006;
      if (e.cancelable) e.preventDefault();
    } else {
      KG.hoverId = kgNodeAt(x, y);
      canvas.classList.toggle("is-pointer", !!KG.hoverId);
    }
  }
  function up(e) {
    if (!KG.dragging) return;
    KG.dragging = false; canvas.classList.remove("is-dragging");
    if (KG.moved < 6) {
      const p = point(e.changedTouches ? { touches: e.changedTouches } : e), rect = canvas.getBoundingClientRect();
      kgClick(p.clientX - rect.left, p.clientY - rect.top, p.clientX, p.clientY);
    }
  }
  function kgClick(x, y, clientX, clientY) {
    const id = kgNodeAt(x, y);
    if (id) {
      const n = KG.nodes.find((k) => k.id === id);
      $("#knowledgeEdgeEvidence").classList.add("is-hidden");
      if (KG.level === "categories" && n.type === "category") {
        KG.level = "documents"; KG.category = id; KG.focusId = null;
        $("#knowledgeGraphBack").classList.remove("is-hidden");
        buildKnowledgeGlobe(true); knowledgeApplyLayoutHint();
      } else if (n.type === "core") { goKnowledgeCategoryLevel(); }
      else if (n.type === "doc") { const entry = state.knowledge.entries.find((e) => e.path === id); if (entry) { renderKnowledgeGraphDoc(entry); knowledgeSnapCameraTo(id); $("#knowledgeGraphDoc").scrollTop = 0; } }
      return;
    }
    const edge = knowledgeEdgeAt(x, y);
    if (edge) showKnowledgeEdgeEvidence(edge, clientX, clientY);
    else $("#knowledgeEdgeEvidence").classList.add("is-hidden");
  }

  canvas.addEventListener("mousedown", down);
  window.addEventListener("mousemove", move);
  window.addEventListener("mouseup", up);
  canvas.addEventListener("touchstart", down, { passive: true });
  canvas.addEventListener("touchmove", move, { passive: false });
  canvas.addEventListener("touchend", up);
  canvas.addEventListener("wheel", (e) => {
    e.preventDefault(); KG.lastInteract = performance.now();
    KG.tZoom = kgClamp(KG.tZoom * (e.deltaY < 0 ? 1.12 : 0.89), 0.5, 2.6);
  }, { passive: false });
})();
$("#knowledgeZoomIn").addEventListener("click", () => { KG.tZoom = Math.min(2.6, KG.tZoom + 0.2); KG.lastInteract = performance.now(); });
$("#knowledgeZoomOut").addEventListener("click", () => { KG.tZoom = Math.max(0.5, KG.tZoom - 0.2); KG.lastInteract = performance.now(); });

const KNOWLEDGE_LAYOUT_HINTS = {
  globe: "Sleep om te draaien, scroll om te zoomen. Beweeg over een punt voor de titel, klik om te lezen.",
  rings: "Binnenste ring = meest verwezen document. Sleep om te kantelen, scroll om te zoomen, klik om te lezen.",
  circle: "Sleep om te kantelen, scroll om te zoomen. Beweeg over een punt voor de titel, klik om te lezen.",
  bubbles: "Elke bubbel is een groep echt-verbonden documenten. Sleep om te kantelen, klik om te lezen.",
  force: "Sleep om te kantelen, scroll om te zoomen. Beweeg over een punt voor de titel, klik om te lezen.",
};
function knowledgeApplyLayoutHint() {
  const base = KNOWLEDGE_LAYOUT_HINTS[KG.layout] || KNOWLEDGE_LAYOUT_HINTS.globe;
  $("#knowledgeGraphHint").textContent = KG.level === "categories" ? base.replace("een document", "een categorie") : base;
}

$$(".knowledge-layout-chip").forEach((chip) => chip.addEventListener("click", () => {
  const layout = chip.dataset.layout;
  if (layout === KG.layout) return;
  $$(".knowledge-layout-chip").forEach((c) => { c.classList.toggle("is-active", c === chip); c.setAttribute("aria-selected", c === chip ? "true" : "false"); });
  KG.layout = layout; KG.focusId = null; KG.velX = 0; KG.velY = 0;
  if (layout === "globe") { KG.rotX = -0.28; KG.rotY = 0.55; } else { KG.rotX = -0.14; KG.rotY = 0; }
  KG.lastInteract = performance.now();
  buildKnowledgeGlobe(true); knowledgeApplyLayoutHint();
}));

$$(".knowledge-mode-btn").forEach((btn) => btn.addEventListener("click", () => {
  $$(".knowledge-mode-btn").forEach((b) => { b.classList.toggle("is-active", b === btn); b.setAttribute("aria-selected", b === btn ? "true" : "false"); });
  const graphMode = btn.dataset.mode === "graph";
  $("#knowledgeListView").classList.toggle("is-hidden", graphMode);
  $("#knowledgeGraphView").classList.toggle("is-hidden", !graphMode);
  if (graphMode) requestAnimationFrame(() => { buildKnowledgeGlobe(true); knowledgeApplyLayoutHint(); startKnowledgeEdgesLoop(); });
}));

// Vertaling van Clarity's ruwe meetnamen/velden naar begrijpelijke Nederlandse
// taal. Namen hieronder zijn empirisch bevestigd via een echte API-call (2026-07-21);
// onbekende metingen/velden vallen terug op een nette generieke opsplitsing.
const VISIBILITY_PRIMARY = {
  Traffic: { title: "Bezoekersverkeer", hint: "Hoeveel mensen de site de laatste dagen bezochten." },
  EngagementTime: { title: "Tijd op de site", hint: "Hoe lang bezoekers gemiddeld bleven." },
  ScrollDepth: { title: "Scrolldiepte", hint: "Hoe ver bezoekers gemiddeld naar beneden scrollden." },
  PopularPages: { title: "Populaire pagina's", hint: "Welke pagina's het vaakst bezocht werden." },
};
const VISIBILITY_BREAKDOWN = {
  Browser: { title: "Browser", hint: "Waarmee bezoekers de site openden." },
  Device: { title: "Apparaat", hint: "Telefoon, tablet of computer." },
  OS: { title: "Besturingssysteem", hint: "" },
  Country: { title: "Land", hint: "Vanuit welk land bezoekers kwamen." },
  PageTitle: { title: "Paginatitel", hint: "" },
  ReferrerUrl: { title: "Verwijzende website", hint: "Via welke andere website bezoekers binnenkwamen." },
};
const VISIBILITY_FRICTION = {
  DeadClickCount: "Klikken op iets dat niets deed",
  ExcessiveScroll: "Onrustig heen-en-weer scrollen",
  RageClickCount: "Herhaaldelijk boos klikken",
  QuickbackClick: "Direct weer terug geklikt",
  ScriptErrorCount: "Technische fouten op de pagina",
  ErrorClickCount: "Klikken die een fout gaven",
};
const VISIBILITY_FIELD_LABELS = {
  totalSessionCount: "Bezoeken", totalBotSessionCount: "Waarvan bots", distinctUserCount: "Unieke bezoekers",
  pagesPerSessionPercentage: "Pagina's per bezoek", totalTime: "Totale tijd (sec)", activeTime: "Actieve tijd (sec)",
  averageScrollDepth: "Gemiddelde scrolldiepte (%)", URL: "Pagina", visitPercentage: "Aandeel van bezoeken (%)",
  subTotal: "Aantal keer", sessionsCount: "Sessies", sessionsWithMetricPercentage: "Aandeel sessies (%)",
  sessionsWithoutMetricPercentage: "Aandeel zonder dit (%)", pagesViews: "Paginaweergaven",
};

function metricFieldLabel(key) {
  return VISIBILITY_FIELD_LABELS[key] || key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());
}

function metricTitle(name) {
  return (VISIBILITY_PRIMARY[name] || VISIBILITY_BREAKDOWN[name] || {}).title
    || name.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
}

function formatMetricValue(value) {
  if (value === null || value === undefined || value === "") return "–";
  if (typeof value === "number") return new Intl.NumberFormat("nl-NL").format(value);
  if (typeof value === "string" && /^-?\d+(\.\d+)?$/.test(value)) return new Intl.NumberFormat("nl-NL").format(Number(value));
  return String(value);
}

function visibilityCard(name, hint, information) {
  const rows = (information || []).slice(0, 8);
  return `<article class="visibility-card">
    <h3>${escapeHtml(metricTitle(name))}</h3>
    ${hint ? `<p class="visibility-hint">${escapeHtml(hint)}</p>` : ""}
    ${rows.length ? `<div class="visibility-rows">${rows.map((row) => `
      <div class="visibility-row">
        ${Object.entries(row).map(([key, value]) => `<span><b>${escapeHtml(formatMetricValue(value))}</b>${escapeHtml(metricFieldLabel(key))}</span>`).join("")}
      </div>`).join("")}</div>` : `<p class="muted visibility-empty">Nog geen gegevens voor deze periode.</p>`}
  </article>`;
}

function renderVisibility(data) {
  $("#visibilityMeta").textContent = data.lastFetchedAt
    ? `Laatst opgehaald: ${new Intl.DateTimeFormat("nl-NL", { dateStyle: "medium", timeStyle: "short" }).format(new Date(data.lastFetchedAt))} · gegevens van Clarity over de laatste 3 dagen.`
    : data.clarityConfigured ? "Nog niet opgehaald. Klik op “Ververs Clarity-gegevens”." : "Clarity is nog niet gekoppeld voor deze klant. Vraag Belvanger-beheer dit in te stellen.";
  const insights = data.insights || [];
  if (!insights.length) {
    $("#visibilityGrid").innerHTML = empty(data.clarityConfigured ? "Nog geen gegevens opgehaald." : "Clarity is nog niet gekoppeld.");
  } else {
    const byName = new Map(insights.map((m) => [m.metricName, m.information || []]));
    const primary = Object.entries(VISIBILITY_PRIMARY)
      .filter(([name]) => byName.has(name))
      .map(([name, meta]) => visibilityCard(name, meta.hint, byName.get(name)));
    const breakdown = Object.entries(VISIBILITY_BREAKDOWN)
      .filter(([name]) => (byName.get(name) || []).length)
      .map(([name, meta]) => visibilityCard(name, meta.hint, byName.get(name)));
    const frictionRows = Object.entries(VISIBILITY_FRICTION)
      .filter(([name]) => byName.has(name))
      .map(([name, label]) => {
        const info = (byName.get(name) || [])[0] || {};
        const count = info.subTotal ?? info.sessionsCount;
        return `<div class="visibility-row"><span><b>${escapeHtml(formatMetricValue(count))}</b>${escapeHtml(label)}</span></div>`;
      });
    const friction = frictionRows.length ? `<article class="visibility-card visibility-card--wide">
      <h3>Gebruikerssignalen</h3>
      <p class="visibility-hint">Signalen dat bezoekers ergens vastliepen of gefrustreerd raakten.</p>
      <div class="visibility-rows visibility-rows--friction">${frictionRows.join("")}</div>
    </article>` : "";
    const knownNames = new Set([...Object.keys(VISIBILITY_PRIMARY), ...Object.keys(VISIBILITY_BREAKDOWN), ...Object.keys(VISIBILITY_FRICTION)]);
    const other = insights.filter((m) => !knownNames.has(m.metricName) && (m.information || []).length)
      .map((m) => visibilityCard(m.metricName, "", m.information));
    $("#visibilityGrid").innerHTML = [...primary, ...breakdown, friction, ...other].join("")
      || empty("Nog geen gegevens voor deze periode.");
  }
  const gscCard = $("#visibilityGscCard"); const gscLink = $("#gscLink");
  if (data.searchConsoleUrl) { gscCard.classList.remove("is-hidden"); gscLink.href = data.searchConsoleUrl; }
  else gscCard.classList.add("is-hidden");
}

async function loadVisibility() {
  renderVisibility(await api("/api/visibility"));
}

async function loadHealth() {
  const button = $("#runHealthcheck"); const original = button.textContent;
  button.disabled = true; button.textContent = "Bezig met controleren…";
  try { renderHealth(await api("/api/admin/healthcheck", { method: "POST" })); }
  catch (error) { $("#healthMeta").textContent = error.message; }
  finally { button.disabled = false; button.textContent = original; }
}

async function openContact(id) {
  const data = await api(`/api/contacts/${id}`); state.activeContact = data.contact; state.activeContactEvents = data.events || [];
  $("#detailName").textContent = contactName(data.contact); $("#detailMeta").textContent = contactMeta(data.contact);
  $("#detailStatus").value = data.contact.status;
  $("#forwardCompose").classList.add("is-hidden");
  $("#detailReferSelect").value = data.contact.referred_partner_id || "";
  $("#detailReferStatus").textContent = data.contact.referred_partner_name
    ? `Doorgestuurd naar ${data.contact.referred_partner_name} · ${new Intl.DateTimeFormat("nl-NL", { dateStyle: "medium", timeStyle: "short" }).format(new Date(data.contact.referred_at))}`
    : "";
  const phone = data.contact.phone || ""; $("#callLink").href = phone ? `tel:${phone}` : "#"; $("#smsLink").href = phone ? `sms:${phone}` : "#";
  $("#waLink").href = phone ? `https://wa.me/${phone.replace(/\D/g, "")}` : "#";
  $("#detailTimeline").innerHTML = data.events.length ? data.events.map((event) => `
    <article class="timeline-item"><b>${escapeHtml(event.label)}</b><p>${escapeHtml(event.preview || event.subject || labels[event.status] || "Gebeurtenis geregistreerd")}</p>
    <time>${new Intl.DateTimeFormat("nl-NL", { dateStyle: "medium", timeStyle: "short" }).format(new Date(event.occurred_at))} · ${escapeHtml(channelNames[event.source] || event.source)}</time></article>`).join("") : empty("Nog geen gebeurtenissen.");
  $("#contactDialog").showModal();
}

function setView(view) {
  state.view = view; $$(".view").forEach((node) => node.classList.add("is-hidden")); $(`#view-${view}`).classList.remove("is-hidden");
  $$(".nav__item").forEach((node) => node.classList.toggle("is-active", node.dataset.view === view));
  const titles = { overview: timeGreeting(), contacts: "Contacten", connections: "Kanalen", visibility: "Zichtbaarheid", support: "Hulp", admin: "Klanten beheren", health: "Systeemcheck", activity: "Activiteitenlog", knowledge: "Kennisbank" }; $("#pageTitle").textContent = titles[view];
  document.querySelector(".shell").classList.remove("menu-open");
  if (view === "contacts") { loadContacts().catch(showFatal); loadPartners().catch(showFatal); }
  if (view === "connections") loadConnections().catch(showFatal);
  if (view === "visibility") loadVisibility().catch(showFatal);
  if (view === "admin") loadTenants().catch(showFatal);
  if (view === "activity") loadActivity().catch(showFatal);
  if (view === "knowledge") loadKnowledge().catch(showFatal);
}

function showFatal(error) { console.error(error); alert(error.message); }

async function showApp(user) {
  state.user = user; $("#loginView").classList.add("is-hidden"); $("#appShell").classList.remove("is-hidden");
  $("#accountName").textContent = user.tenant_name; $("#accountEmail").textContent = user.email; $("#accountAvatar").textContent = user.tenant_name.slice(0, 1).toUpperCase();
  $("#adminGroupLabel").classList.toggle("is-hidden", user.role !== "platform_admin");
  $("#adminNav").classList.toggle("is-hidden", user.role !== "platform_admin");
  $("#healthNav").classList.toggle("is-hidden", user.role !== "platform_admin");
  $("#activityNav").classList.toggle("is-hidden", user.role !== "platform_admin");
  $("#knowledgeNav").classList.toggle("is-hidden", user.role !== "platform_admin");
  $("#todayLabel").textContent = new Intl.DateTimeFormat("nl-NL", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Amsterdam" }).format(new Date());
  if (state.view === "overview") $("#pageTitle").textContent = timeGreeting();
  await loadSummary();
  await loadProofLog();
  await loadPartners();
  await loadConnections();
  if (user.must_change_password) openPasswordDialog(true);
}

let pendingOtpChallenge = null;

$("#loginForm").addEventListener("submit", async (event) => {
  event.preventDefault(); $("#loginError").textContent = ""; const form = new FormData(event.currentTarget);
  try {
    const result = await api("/api/login", { method: "POST", body: JSON.stringify(Object.fromEntries(form)) });
    if (result.otpRequired) {
      pendingOtpChallenge = result.challenge;
      $("#otpForm").reset(); $("#otpForm input[name='remember']").checked = true; $("#otpFormError").textContent = "";
      $("#loginForm").classList.add("is-hidden"); $("#otpForm").classList.remove("is-hidden");
      return;
    }
    const me = await api("/api/me"); await showApp(me.user);
  } catch (error) { $("#loginError").textContent = error.message; }
});

$("#otpForm").addEventListener("submit", async (event) => {
  event.preventDefault(); $("#otpFormError").textContent = "";
  const form = new FormData(event.currentTarget);
  const button = $("button[type='submit']", event.currentTarget); const original = button.textContent;
  button.disabled = true; button.textContent = "Bezig…";
  try {
    await api("/api/verify-otp", { method: "POST", body: JSON.stringify({ challenge: pendingOtpChallenge, code: form.get("code"), remember: form.get("remember") === "on" }) });
    pendingOtpChallenge = null;
    const me = await api("/api/me"); await showApp(me.user);
  } catch (error) { $("#otpFormError").textContent = error.message; }
  finally { button.disabled = false; button.textContent = original; }
});

$("#backToLoginFromOtp").addEventListener("click", () => {
  pendingOtpChallenge = null;
  $("#otpForm").classList.add("is-hidden"); $("#loginForm").classList.remove("is-hidden");
});

$("#showForgotPassword").addEventListener("click", () => {
  $("#loginError").textContent = "";
  $("#forgotFormError").textContent = ""; $("#forgotFormSuccess").classList.add("is-hidden");
  $("#loginForm").classList.add("is-hidden"); $("#forgotForm").classList.remove("is-hidden");
});
$("#backToLogin").addEventListener("click", () => {
  $("#forgotForm").classList.add("is-hidden"); $("#loginForm").classList.remove("is-hidden");
});
$("#forgotForm").addEventListener("submit", async (event) => {
  event.preventDefault(); $("#forgotFormError").textContent = ""; $("#forgotFormSuccess").classList.add("is-hidden");
  const button = $("button[type='submit']", event.currentTarget); const original = button.textContent;
  button.disabled = true; button.textContent = "Bezig…";
  try {
    await api("/api/forgot-password", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) });
    $("#forgotFormSuccess").classList.remove("is-hidden");
  } catch (error) { $("#forgotFormError").textContent = error.message; }
  finally { button.disabled = false; button.textContent = original; }
});

// Hetzelfde scherm doet twee dingen, en het verschil zit hem in of het huidige wachtwoord
// gevraagd wordt. Gedwongen eerste wijziging: niet, die persoon heeft net het tijdelijke
// wachtwoord getypt en kan het scherm ook niet wegklikken. Vrijwillige wijziging: wel, en
// dan mag je annuleren.
function openPasswordDialog(gedwongen) {
  const form = $("#passwordForm");
  form.reset();
  $("#passwordError").textContent = "";
  $("#passwordSuccess").classList.add("is-hidden");
  $("#passwordEyebrow").textContent = gedwongen ? "Eerste keer inloggen" : "Je account";
  $("#passwordHeading").textContent = gedwongen ? "Kies een eigen wachtwoord" : "Wachtwoord wijzigen";
  $("#currentPasswordField").classList.toggle("is-hidden", gedwongen);
  form.currentPassword.required = !gedwongen;
  $("#closePasswordDialog").classList.toggle("is-hidden", gedwongen);
  $("#passwordNote").classList.toggle("is-hidden", gedwongen);
  $("#passwordDialog").showModal();
}

$("#changePasswordButton").addEventListener("click", () => openPasswordDialog(false));
$("#closePasswordDialog").addEventListener("click", () => $("#passwordDialog").close());

$("#passwordForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  $("#passwordError").textContent = "";
  $("#passwordSuccess").classList.add("is-hidden");
  const form = event.currentTarget;
  const velden = Object.fromEntries(new FormData(form));
  const knop = form.querySelector('button[type="submit"]');
  const oorspronkelijk = knop.textContent;
  knop.disabled = true; knop.textContent = "Bezig…";
  try {
    await api("/api/change-password", {
      method: "POST",
      body: JSON.stringify({ password: velden.password, currentPassword: velden.currentPassword || undefined }),
    });
    // Even laten zien dat het gelukt is voordat het scherm dichtgaat. Een dialoog die
    // wegklapt zonder bevestiging laat je twijfelen of je het wel goed hebt gedaan, en dan
    // ga je het nog een keer doen.
    $("#passwordSuccess").classList.remove("is-hidden");
    form.reset();
    setTimeout(() => $("#passwordDialog").close(), 1400);
  } catch (error) {
    $("#passwordError").textContent = error.message;
  } finally {
    knop.disabled = false; knop.textContent = oorspronkelijk;
  }
});

$("#logoutButton").addEventListener("click", async () => { await api("/api/logout", { method: "POST" }); location.reload(); });
$("#rangeSelect").addEventListener("change", () => Promise.all([loadSummary(), loadProofLog()]).catch(showFatal));
$("#statusFilter").addEventListener("change", () => loadContacts().catch(showFatal));
let searchTimer; $("#contactSearch").addEventListener("input", () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => loadContacts().catch(showFatal), 250); });
$("#menuButton").addEventListener("click", () => { const shell = $("#appShell"); shell.classList.toggle("menu-open"); $("#menuButton").setAttribute("aria-expanded", shell.classList.contains("menu-open")); });
$("#closeDialog").addEventListener("click", () => $("#contactDialog").close());
$("#openTenantDialog").addEventListener("click", () => {
  $("#tenantForm").reset(); $("#tenantForm input[name='slug']").dataset.edited = "false"; $("#tenantForm").classList.remove("is-hidden"); $("#credentialResult").classList.add("is-hidden"); $("#tenantFormError").textContent = ""; $("#tenantDialog").showModal();
});
$("#closeTenantDialog").addEventListener("click", () => $("#tenantDialog").close());
$("#finishTenant").addEventListener("click", () => { $("#tenantDialog").close(); loadTenants().catch(showFatal); });
$("#tenantForm input[name='name']").addEventListener("input", (event) => {
  const slug = $("#tenantForm input[name='slug']");
  if (slug.dataset.edited === "true") return;
  slug.value = event.target.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50);
});
$("#tenantForm input[name='slug']").addEventListener("input", (event) => { event.target.dataset.edited = "true"; });
$("#tenantForm").addEventListener("submit", async (event) => {
  event.preventDefault(); $("#tenantFormError").textContent = "";
  const button = $("button[type='submit']", event.currentTarget); button.disabled = true; button.textContent = "Klant wordt aangemaakt…";
  try {
    const result = await api("/api/admin/tenants", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) });
    $("#credentialText").textContent = `Dashboardlogin\nBedrijfscode: ${result.login.companyCode}\nE-mail: ${result.login.email}\nTijdelijk wachtwoord: ${result.login.temporaryPassword}\n\nTechnische koppelsleutels (alleen voor beheer)\nWebsite: ${result.integrationKeys.website}\nE-mail: ${result.integrationKeys.email}\nTelefoon en sms: ${result.integrationKeys.twilio}`;
    event.currentTarget.classList.add("is-hidden"); $("#credentialResult").classList.remove("is-hidden");
  } catch (error) { $("#tenantFormError").textContent = error.message; }
  finally { button.disabled = false; button.textContent = "Klant aanmaken"; }
});
$("#copyCredentials").addEventListener("click", async (event) => {
  await navigator.clipboard.writeText($("#credentialText").textContent);
  event.currentTarget.textContent = "Gekopieerd";
});
$("#detailStatus").addEventListener("change", async (event) => { if (!state.activeContact) return; const id = state.activeContact.id; await api(`/api/contacts/${id}`, { method: "PATCH", body: JSON.stringify({ status: event.target.value }) }); $("#contactDialog").close(); await Promise.all([loadSummary(), loadContacts()]); await openContact(id); });
$("#deleteContact").addEventListener("click", async () => {
  if (!state.activeContact) return;
  const naam = contactName(state.activeContact);
  if (!confirm(`Weet je zeker dat je ${naam} wilt verwijderen? Dit kan niet ongedaan gemaakt worden.`)) return;
  await api(`/api/contacts/${state.activeContact.id}`, { method: "DELETE" });
  state.activeContact = null;
  $("#contactDialog").close();
  await Promise.all([loadSummary(), loadContacts()]);
});
document.addEventListener("submit", async (event) => {
  const configForm = event.target.closest("[data-config-form]");
  const n8nForm = event.target.closest("[data-n8n-form]");
  const twilioForm = event.target.closest("[data-twilio-form]");
  const analyticsForm = event.target.closest("[data-analytics-form]");
  const form = configForm || n8nForm || twilioForm || analyticsForm;
  if (!form) return;
  event.preventDefault(); const error = $(".form-error", form); error.textContent = "";
  const endpoint = configForm ? `/api/admin/tenants/${configForm.dataset.configForm}/config`
    : n8nForm ? `/api/admin/tenants/${n8nForm.dataset.n8nForm}/n8n`
    : analyticsForm ? `/api/admin/tenants/${analyticsForm.dataset.analyticsForm}/analytics`
    : `/api/admin/tenants/${twilioForm.dataset.twilioForm}/twilio`;
  try { await api(endpoint, { method: "PATCH", body: JSON.stringify(Object.fromEntries(new FormData(form))) }); await loadTenants(); }
  catch (problem) { error.textContent = problem.message; }
});
$("#supportForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  $("#supportFormError").textContent = ""; $("#supportFormSuccess").classList.add("is-hidden");
  const button = $("button[type='submit']", event.currentTarget); button.disabled = true; button.textContent = "Versturen…";
  try {
    await api("/api/support", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) });
    event.currentTarget.reset();
    $("#supportFormSuccess").classList.remove("is-hidden");
  } catch (error) { $("#supportFormError").textContent = error.message; }
  finally { button.disabled = false; button.textContent = "Bericht versturen"; }
});
$("#refreshVisibility").addEventListener("click", async () => {
  const button = $("#refreshVisibility"); const original = button.textContent;
  button.disabled = true; button.textContent = "Bezig met ophalen…";
  try { await api("/api/visibility/refresh", { method: "POST" }); await loadVisibility(); }
  catch (error) { $("#visibilityMeta").textContent = error.message; }
  finally { button.disabled = false; button.textContent = original; }
});
$("#openNewContactDialog").addEventListener("click", () => {
  $("#newContactForm").reset(); $("#newContactFormError").textContent = "";
  $("#newContactDialog").showModal();
});
$("#closeNewContactDialog").addEventListener("click", () => $("#newContactDialog").close());
$("#newContactForm").addEventListener("submit", async (event) => {
  event.preventDefault(); $("#newContactFormError").textContent = "";
  const button = $("button[type='submit']", event.currentTarget); const original = button.textContent;
  button.disabled = true; button.textContent = "Bezig…";
  try {
    await api("/api/contacts", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) });
    $("#newContactDialog").close();
    await Promise.all([loadContacts(), loadSummary()]);
  } catch (error) { $("#newContactFormError").textContent = error.message; }
  finally { button.disabled = false; button.textContent = original; }
});
$("#runHealthcheck").addEventListener("click", () => loadHealth());
$("#openActivityDialog").addEventListener("click", () => {
  $("#activityForm").reset();
  $("#activityForm input[name='logDate']").value = new Date().toISOString().slice(0, 10);
  $("#activityFormError").textContent = "";
  $("#activityDialog").showModal();
});
$("#closeActivityDialog").addEventListener("click", () => $("#activityDialog").close());
$("#activityForm").addEventListener("submit", async (event) => {
  event.preventDefault(); $("#activityFormError").textContent = "";
  const button = $("button[type='submit']", event.currentTarget); button.disabled = true;
  try {
    await api("/api/admin/activity", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) });
    $("#activityDialog").close();
    await loadActivity();
  } catch (error) { $("#activityFormError").textContent = error.message; }
  finally { button.disabled = false; }
});
document.addEventListener("click", (event) => { const nav = event.target.closest("[data-view]"); if (nav) setView(nav.dataset.view); const go = event.target.closest("[data-go]"); if (go) setView(go.dataset.go); const row = event.target.closest("[data-contact-id]"); if (row) openContact(row.dataset.contactId).catch(showFatal); });

(async () => {
  try { const result = await api("/api/me"); await showApp(result.user); }
  catch (error) { if (error.status !== 401) $("#loginError").textContent = "Dashboard is tijdelijk niet bereikbaar."; }
})();
