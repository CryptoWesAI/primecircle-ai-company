const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const state = { user: null, summary: null, contacts: [], tenants: [], activeContact: null, view: "overview" };

const labels = {
  new: "Nieuw", follow_up: "Opvolging nodig", contacted: "Contact gehad", closed: "Afgesloten",
  "call.missed": "Gemiste oproep", "sms.outbound": "Sms verzonden", "sms.status": "Sms-status",
  "sms.inbound": "Sms ontvangen", "email.inbound": "E-mail ontvangen", "website.lead": "Websiteaanvraag",
  "chat.lead": "Aanvraag via chat", "contact.status": "Status gewijzigd",
};
const channelNames = { twilio: "Telefoon en sms", email: "E-mail", website: "Website", chatbot: "Websitechat", dashboard: "Dashboard" };

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
function channelGlyph(type = "") { return type.startsWith("call") ? "☎" : type.startsWith("sms") ? "S" : type.startsWith("email") ? "@" : type.startsWith("chat") ? "◇" : "W"; }

function empty(message) { return `<div class="empty">${escapeHtml(message)}</div>`; }

function renderSummary() {
  const data = state.summary;
  $("#attentionCount").textContent = data.attention;
  $("#metricCalls").textContent = data.metrics.missed_calls;
  $("#metricSms").textContent = data.metrics.sms_sent;
  $("#metricSmsDetail").textContent = `${data.metrics.sms_delivered} afgeleverd`;
  $("#metricReplies").textContent = data.metrics.replies;
  $("#metricWeb").textContent = data.metrics.website_leads;

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
      <details class="twilio-config"><summary>Website-domein instellen</summary>
        <form data-config-form="${tenant.id}">
          <label class="form-span">Website-domein<input name="websiteDomain" value="${escapeHtml(tenant.websiteDomain || "")}" placeholder="belvanger.nl"></label>
          <button class="button button--secondary" type="submit">Domein opslaan</button><p class="form-error" role="alert"></p>
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

async function loadHealth() {
  const button = $("#runHealthcheck"); const original = button.textContent;
  button.disabled = true; button.textContent = "Bezig met controleren…";
  try { renderHealth(await api("/api/admin/healthcheck", { method: "POST" })); }
  catch (error) { $("#healthMeta").textContent = error.message; }
  finally { button.disabled = false; button.textContent = original; }
}

async function openContact(id) {
  const data = await api(`/api/contacts/${id}`); state.activeContact = data.contact;
  $("#detailName").textContent = contactName(data.contact); $("#detailMeta").textContent = contactMeta(data.contact);
  $("#detailStatus").value = data.contact.status;
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
  const titles = { overview: "Goedemorgen", contacts: "Contacten", connections: "Kanalen", admin: "Klanten beheren", health: "Systeemcheck", activity: "Activiteitenlog" }; $("#pageTitle").textContent = titles[view];
  document.querySelector(".shell").classList.remove("menu-open");
  if (view === "contacts") loadContacts().catch(showFatal);
  if (view === "connections") loadConnections().catch(showFatal);
  if (view === "admin") loadTenants().catch(showFatal);
  if (view === "activity") loadActivity().catch(showFatal);
}

function showFatal(error) { console.error(error); alert(error.message); }

async function showApp(user) {
  state.user = user; $("#loginView").classList.add("is-hidden"); $("#appShell").classList.remove("is-hidden");
  $("#accountName").textContent = user.tenant_name; $("#accountEmail").textContent = user.email; $("#accountAvatar").textContent = user.tenant_name.slice(0, 1).toUpperCase();
  $("#adminNav").classList.toggle("is-hidden", user.role !== "platform_admin");
  $("#healthNav").classList.toggle("is-hidden", user.role !== "platform_admin");
  $("#activityNav").classList.toggle("is-hidden", user.role !== "platform_admin");
  $("#todayLabel").textContent = new Intl.DateTimeFormat("nl-NL", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
  await loadSummary();
  await loadConnections();
  if (user.must_change_password) $("#passwordDialog").showModal();
}

$("#loginForm").addEventListener("submit", async (event) => {
  event.preventDefault(); $("#loginError").textContent = ""; const form = new FormData(event.currentTarget);
  try { await api("/api/login", { method: "POST", body: JSON.stringify(Object.fromEntries(form)) }); const me = await api("/api/me"); await showApp(me.user); }
  catch (error) { $("#loginError").textContent = error.message; }
});

$("#passwordForm").addEventListener("submit", async (event) => {
  event.preventDefault(); $("#passwordError").textContent = ""; const password = new FormData(event.currentTarget).get("password");
  try { await api("/api/change-password", { method: "POST", body: JSON.stringify({ password }) }); $("#passwordDialog").close(); }
  catch (error) { $("#passwordError").textContent = error.message; }
});

$("#logoutButton").addEventListener("click", async () => { await api("/api/logout", { method: "POST" }); location.reload(); });
$("#rangeSelect").addEventListener("change", () => loadSummary().catch(showFatal));
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
document.addEventListener("submit", async (event) => {
  const configForm = event.target.closest("[data-config-form]");
  const n8nForm = event.target.closest("[data-n8n-form]");
  const twilioForm = event.target.closest("[data-twilio-form]");
  const form = configForm || n8nForm || twilioForm;
  if (!form) return;
  event.preventDefault(); const error = $(".form-error", form); error.textContent = "";
  const endpoint = configForm ? `/api/admin/tenants/${configForm.dataset.configForm}/config`
    : n8nForm ? `/api/admin/tenants/${n8nForm.dataset.n8nForm}/n8n`
    : `/api/admin/tenants/${twilioForm.dataset.twilioForm}/twilio`;
  try { await api(endpoint, { method: "PATCH", body: JSON.stringify(Object.fromEntries(new FormData(form))) }); await loadTenants(); }
  catch (problem) { error.textContent = problem.message; }
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
