import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Pool } = pg;
const scrypt = promisify(crypto.scrypt);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, "../public");
const PORT = Number(process.env.PORT || 8096);
const DATABASE_URL = process.env.DATABASE_URL || "";
const INGEST_KEY = process.env.INGEST_KEY || "";
const COOKIE_SECURE = String(process.env.COOKIE_SECURE || "false") === "true";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const MAX_BODY = 256 * 1024;
const INTEGRATION_SOURCES = ["twilio", "website", "email"];

// Systeemcheck: actieve controle van Twilio, website en n8n per klant (naast de
// bestaande passieve last_event_at-status uit de ingest-flow). Ontbreken deze
// vars, dan degradeert de check netjes naar "unknown" in plaats van te crashen.
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || "";
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || "";
const N8N_API_URL = (process.env.N8N_API_URL || "").replace(/\/+$/, "");
const N8N_API_KEY = process.env.N8N_API_KEY || "";
const HEALTH_TIMEOUT_MS = 8000;

if (!DATABASE_URL || !INGEST_KEY) throw new Error("DATABASE_URL en INGEST_KEY zijn verplicht");

const pool = new Pool({ connectionString: DATABASE_URL, max: 10 });
const loginAttempts = new Map();

const EVENT_LABELS = {
  "call.missed": "Gemiste oproep",
  "sms.outbound": "Sms verzonden",
  "sms.status": "Sms-status",
  "sms.inbound": "Sms ontvangen",
  "email.inbound": "E-mail ontvangen",
  "website.lead": "Websiteaanvraag",
  "chat.lead": "Aanvraag via chat",
  "contact.status": "Status gewijzigd",
};

function securityHeaders(contentType = "application/json; charset=utf-8") {
  return {
    "Content-Type": contentType,
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "X-Robots-Tag": "noindex, nofollow, noarchive",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Content-Security-Policy": "default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  };
}

function json(res, status, body, extra = {}) {
  res.writeHead(status, { ...securityHeaders(), ...extra });
  res.end(JSON.stringify(body));
}

function normalizePhone(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (raw.startsWith("+")) return `+${digits}`;
  if (digits.startsWith("00")) return `+${digits.slice(2)}`;
  if (digits.startsWith("0") && digits.length >= 9) return `+31${digits.slice(1)}`;
  return digits ? `+${digits}` : null;
}

function normalizeEmail(value) {
  const email = String(value || "").trim().toLowerCase();
  return email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? email : null;
}

function cleanText(value, max = 500) {
  return String(value || "").replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, max) || null;
}

function parseCookies(req) {
  return Object.fromEntries(String(req.headers.cookie || "").split(";").map((part) => part.trim().split("=")).filter((p) => p.length === 2).map(([k, v]) => [k, decodeURIComponent(v)]));
}

function tokenHash(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function safeEqual(left, right) {
  const a = Buffer.from(String(left || ""));
  const b = Buffer.from(String(right || ""));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function cleanSlug(value) {
  const slug = String(value || "").trim().toLowerCase();
  return /^[a-z0-9](?:[a-z0-9-]{1,48}[a-z0-9])?$/.test(slug) ? slug : null;
}

function temporaryPassword() {
  return `Bv!${crypto.randomBytes(12).toString("base64url")}`;
}

function integrationToken() {
  return `bvi_${crypto.randomBytes(32).toString("base64url")}`;
}

async function passwordDigest(password, salt) {
  const result = await scrypt(password, salt, 64);
  return Buffer.from(result).toString("hex");
}

async function createPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  return { salt, hash: await passwordDigest(password, salt) };
}

async function readBody(req) {
  let body = "";
  for await (const chunk of req) {
    body += chunk;
    if (body.length > MAX_BODY) throw Object.assign(new Error("Payload te groot"), { status: 413 });
  }
  try { return JSON.parse(body || "{}"); }
  catch { throw Object.assign(new Error("Ongeldige JSON"), { status: 400 }); }
}

async function currentUser(req) {
  const token = parseCookies(req).portal_session;
  if (!token) return null;
  const result = await pool.query(`
    SELECT u.id, u.email, u.display_name, u.must_change_password, u.role,
           t.id AS tenant_id, t.slug AS tenant_slug, t.name AS tenant_name
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    JOIN tenants t ON t.id = u.tenant_id
    WHERE s.token_hash = $1 AND s.expires_at > NOW() AND u.active = TRUE
  `, [tokenHash(token)]);
  return result.rows[0] || null;
}

async function requireUser(req, res) {
  const user = await currentUser(req);
  if (!user) json(res, 401, { error: "Log opnieuw in." });
  return user;
}

function requirePlatformAdmin(res, user) {
  if (user.role !== "platform_admin") {
    json(res, 403, { error: "Alleen Belvanger-beheer kan klanten beheren." });
    return false;
  }
  return true;
}

async function bootstrap() {
  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  await pool.query(schema);
  await pool.query("DELETE FROM sessions WHERE expires_at <= NOW()");

  const slug = process.env.BOOTSTRAP_TENANT_SLUG || "belvanger";
  const name = process.env.BOOTSTRAP_TENANT_NAME || "Belvanger";
  const email = normalizeEmail(process.env.BOOTSTRAP_ADMIN_EMAIL);
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD || "";
  const tenant = await pool.query(`
    INSERT INTO tenants (slug, name) VALUES ($1, $2)
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `, [slug, name]);
  if (email && password.length >= 12) {
    const exists = await pool.query("SELECT id FROM users WHERE tenant_id = $1 AND email = $2", [tenant.rows[0].id, email]);
    if (!exists.rowCount) {
      const credentials = await createPassword(password);
      await pool.query(`
        INSERT INTO users (tenant_id, email, display_name, password_salt, password_hash, role)
        VALUES ($1, $2, $3, $4, $5, 'platform_admin')
      `, [tenant.rows[0].id, email, name, credentials.salt, credentials.hash]);
    }
    await pool.query("UPDATE users SET role = 'platform_admin' WHERE tenant_id = $1 AND email = $2", [tenant.rows[0].id, email]);
  }
}

async function login(req, res) {
  const ip = req.socket.remoteAddress || "unknown";
  const attempt = loginAttempts.get(ip) || { count: 0, reset: Date.now() + 15 * 60_000 };
  if (Date.now() > attempt.reset) Object.assign(attempt, { count: 0, reset: Date.now() + 15 * 60_000 });
  if (attempt.count >= 10) return json(res, 429, { error: "Te veel pogingen. Probeer het later opnieuw." });

  const body = await readBody(req);
  const email = normalizeEmail(body.email);
  const result = await pool.query(`
    SELECT u.*, t.slug AS tenant_slug, t.name AS tenant_name
    FROM users u JOIN tenants t ON t.id = u.tenant_id
    WHERE u.email = $1 AND t.slug = $2 AND u.active = TRUE
  `, [email, cleanText(body.tenant || "belvanger", 80)]);
  const user = result.rows[0];
  const supplied = String(body.password || "");
  const digest = user ? await passwordDigest(supplied, user.password_salt) : await passwordDigest(supplied, "00000000000000000000000000000000");
  const valid = user && crypto.timingSafeEqual(Buffer.from(digest, "hex"), Buffer.from(user.password_hash, "hex"));
  if (!valid) {
    attempt.count += 1;
    loginAttempts.set(ip, attempt);
    return json(res, 401, { error: "E-mailadres of wachtwoord klopt niet." });
  }

  loginAttempts.delete(ip);
  const token = crypto.randomBytes(32).toString("base64url");
  await pool.query("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)", [tokenHash(token), user.id, new Date(Date.now() + SESSION_TTL_MS)]);
  const cookie = `portal_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_MS / 1000}${COOKIE_SECURE ? "; Secure" : ""}`;
  json(res, 200, { ok: true, mustChangePassword: user.must_change_password }, { "Set-Cookie": cookie });
}

async function logout(req, res) {
  const token = parseCookies(req).portal_session;
  if (token) await pool.query("DELETE FROM sessions WHERE token_hash = $1", [tokenHash(token)]);
  json(res, 200, { ok: true }, { "Set-Cookie": "portal_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0" });
}

async function changePassword(req, res, user) {
  const body = await readBody(req);
  const password = String(body.password || "");
  if (password.length < 12) return json(res, 400, { error: "Gebruik minimaal 12 tekens." });
  const credentials = await createPassword(password);
  await pool.query("UPDATE users SET password_salt = $1, password_hash = $2, must_change_password = FALSE WHERE id = $3", [credentials.salt, credentials.hash, user.id]);
  json(res, 200, { ok: true });
}

async function upsertContact(client, tenantId, contact, occurredAt) {
  const phone = normalizePhone(contact?.phone);
  const email = normalizeEmail(contact?.email);
  if (!phone && !email) return null;

  // Events for one person can arrive at the same time (for example, a call and
  // the automatic SMS). Serialise writes for the same identifiers so two
  // workers cannot create the same contact concurrently.
  const lockKeys = [
    phone ? `${tenantId}:phone:${phone}` : null,
    email ? `${tenantId}:email:${email}` : null,
  ].filter(Boolean).sort();
  for (const lockKey of lockKeys) {
    await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))", [lockKey]);
  }

  const existing = await client.query(`
    SELECT * FROM contacts
    WHERE tenant_id = $1 AND (($2::text IS NOT NULL AND phone = $2) OR ($3::text IS NOT NULL AND email = $3))
    ORDER BY last_event_at DESC LIMIT 1
  `, [tenantId, phone, email]);
  const name = cleanText(contact?.name, 160);
  const company = cleanText(contact?.company, 160);
  if (existing.rowCount) {
    const id = existing.rows[0].id;
    await client.query(`
      UPDATE contacts SET
        name = COALESCE($1, name), company = COALESCE($2, company),
        phone = COALESCE($3, phone), email = COALESCE($4, email),
        status = CASE WHEN status = 'closed' THEN 'follow_up' ELSE status END,
        last_event_at = GREATEST(last_event_at, $5), updated_at = NOW()
      WHERE id = $6
    `, [name, company, phone, email, occurredAt, id]);
    return id;
  }
  const inserted = await client.query(`
    INSERT INTO contacts (tenant_id, name, company, phone, email, status, last_event_at)
    VALUES ($1, $2, $3, $4, $5, 'new', $6)
    ON CONFLICT DO NOTHING
    RETURNING id
  `, [tenantId, name, company, phone, email, occurredAt]);
  if (inserted.rowCount) return inserted.rows[0].id;

  const concurrent = await client.query(`
    SELECT id FROM contacts
    WHERE tenant_id = $1 AND (($2::text IS NOT NULL AND phone = $2) OR ($3::text IS NOT NULL AND email = $3))
    ORDER BY last_event_at DESC LIMIT 1
  `, [tenantId, phone, email]);
  if (concurrent.rowCount) return concurrent.rows[0].id;
  throw new Error("Contact kon niet veilig worden opgeslagen.");
}

async function resolveIngestTarget(req, body, source) {
  const supplied = String(req.headers["x-ingest-key"] || "");
  if (!supplied) return null;

  const integration = await pool.query(`
    SELECT i.id AS integration_id, i.source AS integration_source, t.id AS tenant_id, t.slug AS tenant_slug
    FROM tenant_integrations i
    JOIN tenants t ON t.id = i.tenant_id
    WHERE i.token_hash = $1 AND i.status <> 'paused' AND t.active = TRUE
  `, [tokenHash(supplied)]);
  if (integration.rowCount) {
    const target = integration.rows[0];
    if (target.integration_source !== source && !(target.integration_source === "website" && source === "chatbot")) return null;
    return target;
  }

  if (!safeEqual(supplied, INGEST_KEY)) return null;
  if (source === "twilio") {
    const metadata = body.metadata && typeof body.metadata === "object" ? body.metadata : {};
    const accountSid = cleanText(metadata.account_sid || body.AccountSid, 40);
    const twilioNumber = normalizePhone(metadata.twilio_number || body.To || body.to);
    const mapped = await pool.query(`
      SELECT i.id AS integration_id, i.source AS integration_source, t.id AS tenant_id, t.slug AS tenant_slug
      FROM tenant_integrations i
      JOIN tenants t ON t.id = i.tenant_id
      WHERE i.source = 'twilio' AND i.status <> 'paused' AND t.active = TRUE
        AND (($1::text IS NOT NULL AND i.twilio_account_sid = $1)
          OR ($2::text IS NOT NULL AND i.external_identifier = $2))
      ORDER BY CASE WHEN i.twilio_account_sid = $1 THEN 0 ELSE 1 END
      LIMIT 1
    `, [accountSid, twilioNumber]);
    return mapped.rows[0] || null;
  }

  const bootstrapSlug = process.env.BOOTSTRAP_TENANT_SLUG || "belvanger";
  const integrationSource = source === "chatbot" ? "website" : source;
  const legacy = await pool.query(`
    SELECT t.id AS tenant_id, t.slug AS tenant_slug, i.id AS integration_id
    FROM tenants t
    LEFT JOIN tenant_integrations i
      ON i.tenant_id = t.id AND i.source = $2 AND i.status <> 'paused'
    WHERE t.slug = $1 AND t.active = TRUE
  `, [bootstrapSlug, integrationSource]);
  return legacy.rows[0] || null;
}

async function ingest(req, res) {
  const body = await readBody(req);
  const eventType = cleanText(body.eventType, 80);
  const source = cleanText(body.source, 40);
  if (!eventType || !source) return json(res, 400, { error: "source en eventType zijn verplicht." });
  const target = await resolveIngestTarget(req, body, source);
  if (!target) return json(res, 401, { error: source === "twilio" ? "Twilio-account of nummer is niet aan een klant gekoppeld." : "Ongeldige ingest-sleutel." });

  const occurredAt = new Date(body.occurredAt || Date.now());
  if (Number.isNaN(occurredAt.getTime())) return json(res, 400, { error: "occurredAt is ongeldig." });
  const externalId = cleanText(body.externalId, 180);
  const status = cleanText(body.status, 60);
  const dedupeBase = externalId || crypto.createHash("sha256").update(JSON.stringify(body)).digest("hex");
  const dedupeKey = `${source}:${dedupeBase}:${eventType}:${status || ""}`;
  const metadata = body.metadata && typeof body.metadata === "object" && !Array.isArray(body.metadata) ? body.metadata : {};

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const contactId = await upsertContact(client, target.tenant_id, body.contact || {}, occurredAt);
    const inserted = await client.query(`
      INSERT INTO events (tenant_id, contact_id, source, event_type, direction, external_id, status, subject, preview, metadata, dedupe_key, occurred_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11,$12)
      ON CONFLICT (tenant_id, dedupe_key) DO NOTHING RETURNING id
    `, [target.tenant_id, contactId, source, eventType, ["inbound", "outbound", "system"].includes(body.direction) ? body.direction : null, externalId, status, cleanText(body.subject, 220), cleanText(body.preview, 600), JSON.stringify(metadata), dedupeKey, occurredAt]);
    if (target.integration_id) {
      await client.query("UPDATE tenant_integrations SET status = 'connected', last_event_at = GREATEST(COALESCE(last_event_at, $1), $1), updated_at = NOW() WHERE id = $2", [occurredAt, target.integration_id]);
    }
    await client.query("COMMIT");
    json(res, inserted.rowCount ? 201 : 200, { ok: true, duplicate: !inserted.rowCount, eventId: inserted.rows[0]?.id || null, contactId });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function listAdminTenants(res, user) {
  if (!requirePlatformAdmin(res, user)) return;
  const result = await pool.query(`
    SELECT t.id, t.slug, t.name, t.active, t.created_at,
      t.website_domain AS "websiteDomain",
      COUNT(DISTINCT u.id)::int AS users,
      COUNT(DISTINCT c.id)::int AS contacts,
      COALESCE(jsonb_agg(DISTINCT jsonb_build_object(
        'source', i.source, 'status', i.status, 'externalIdentifier', i.external_identifier,
        'twilioAccountSid', i.twilio_account_sid, 'lastEventAt', i.last_event_at,
        'businessNumber', i.config->>'business_number', 'n8nWorkflowId', i.config->>'n8n_workflow_id'
      )) FILTER (WHERE i.id IS NOT NULL), '[]'::jsonb) AS integrations
    FROM tenants t
    LEFT JOIN users u ON u.tenant_id = t.id
    LEFT JOIN contacts c ON c.tenant_id = t.id
    LEFT JOIN tenant_integrations i ON i.tenant_id = t.id
    GROUP BY t.id
    ORDER BY t.created_at DESC
  `);
  json(res, 200, { tenants: result.rows });
}

async function createAdminTenant(req, res, user) {
  if (!requirePlatformAdmin(res, user)) return;
  const body = await readBody(req);
  const name = cleanText(body.name, 120);
  const slug = cleanSlug(body.slug);
  const email = normalizeEmail(body.email);
  const displayName = cleanText(body.contactName || name, 120);
  const businessNumber = normalizePhone(body.businessNumber);
  const twilioNumber = normalizePhone(body.twilioNumber);
  const twilioAccountSid = cleanText(body.twilioAccountSid, 40);
  if (!name || !slug || !email) return json(res, 400, { error: "Bedrijfsnaam, geldige bedrijfscode en e-mailadres zijn verplicht." });
  if (twilioAccountSid && !/^AC[0-9a-fA-F]{32}$/.test(twilioAccountSid)) return json(res, 400, { error: "Een Twilio Account SID begint met AC en bevat 34 tekens." });

  const password = String(body.temporaryPassword || temporaryPassword());
  if (password.length < 12) return json(res, 400, { error: "Het tijdelijke wachtwoord moet minimaal 12 tekens hebben." });
  const credentials = await createPassword(password);
  const tokens = Object.fromEntries(INTEGRATION_SOURCES.map((source) => [source, integrationToken()]));
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const tenant = await client.query("INSERT INTO tenants (slug, name) VALUES ($1, $2) RETURNING id, slug, name", [slug, name]);
    await client.query(`
      INSERT INTO users (tenant_id, email, display_name, password_salt, password_hash, role)
      VALUES ($1, $2, $3, $4, $5, 'customer_admin')
    `, [tenant.rows[0].id, email, displayName, credentials.salt, credentials.hash]);
    for (const source of INTEGRATION_SOURCES) {
      const isTwilio = source === "twilio";
      await client.query(`
        INSERT INTO tenant_integrations
          (tenant_id, source, label, token_hash, external_identifier, twilio_account_sid, status, config)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb)
      `, [tenant.rows[0].id, source, source === "twilio" ? "Telefoon en sms" : source === "website" ? "Website en chat" : "E-mail", tokenHash(tokens[source]), isTwilio ? twilioNumber : null, isTwilio ? twilioAccountSid : null, isTwilio && (twilioNumber || twilioAccountSid) ? "connected" : "pending", JSON.stringify(isTwilio ? { business_number: businessNumber } : {})]);
    }
    await client.query("COMMIT");
    json(res, 201, {
      ok: true,
      tenant: tenant.rows[0],
      login: { companyCode: slug, email, temporaryPassword: password },
      integrationKeys: tokens,
      notice: "Bewaar deze gegevens nu; wachtwoord en sleutels worden niet opnieuw getoond.",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    if (error.code === "23505") return json(res, 409, { error: "Bedrijfscode, e-mailadres, Twilio-account of nummer is al gekoppeld." });
    throw error;
  } finally { client.release(); }
}

async function updateAdminTwilio(req, res, user, tenantId) {
  if (!requirePlatformAdmin(res, user)) return;
  const body = await readBody(req);
  const twilioNumber = normalizePhone(body.twilioNumber);
  const businessNumber = normalizePhone(body.businessNumber);
  const twilioAccountSid = cleanText(body.twilioAccountSid, 40);
  if (twilioAccountSid && !/^AC[0-9a-fA-F]{32}$/.test(twilioAccountSid)) return json(res, 400, { error: "Een Twilio Account SID begint met AC en bevat 34 tekens." });
  const result = await pool.query(`
    UPDATE tenant_integrations SET external_identifier = $1, twilio_account_sid = $2,
      status = CASE WHEN $1::text IS NULL AND $2::text IS NULL THEN 'pending' ELSE 'connected' END,
      config = CASE WHEN $3::text IS NULL THEN config - 'business_number' ELSE jsonb_set(config, '{business_number}', to_jsonb($3::text), true) END,
      updated_at = NOW()
    WHERE tenant_id = $4 AND source = 'twilio' RETURNING id
  `, [twilioNumber, twilioAccountSid, businessNumber, tenantId]);
  if (!result.rowCount) return json(res, 404, { error: "Twilio-koppeling niet gevonden." });
  json(res, 200, { ok: true });
}

async function updateAdminTenantConfig(req, res, user, tenantId) {
  if (!requirePlatformAdmin(res, user)) return;
  const body = await readBody(req);
  const domain = cleanText(String(body.websiteDomain || "").replace(/^https?:\/\//i, "").replace(/\/+$/, ""), 200);
  const result = await pool.query(
    "UPDATE tenants SET website_domain = $1, updated_at = NOW() WHERE id = $2 RETURNING id",
    [domain, tenantId]
  );
  if (!result.rowCount) return json(res, 404, { error: "Klant niet gevonden." });
  json(res, 200, { ok: true });
}

// n8n-workflow-ID's horen per kanaal (elke klant heeft één workflow per bron:
// twilio/website/email), dus die zetten we in tenant_integrations.config i.p.v.
// op tenant-niveau. Eén formulier, drie kanalen tegelijk opslaan.
async function updateAdminN8nLinks(req, res, user, tenantId) {
  if (!requirePlatformAdmin(res, user)) return;
  const body = await readBody(req);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const source of INTEGRATION_SOURCES) {
      const key = `${source}WorkflowId`;
      const workflowId = cleanText(body[key], 100);
      await client.query(`
        UPDATE tenant_integrations SET
          config = CASE WHEN $1::text IS NULL THEN config - 'n8n_workflow_id' ELSE jsonb_set(config, '{n8n_workflow_id}', to_jsonb($1::text), true) END,
          updated_at = NOW()
        WHERE tenant_id = $2 AND source = $3
      `, [workflowId, tenantId, source]);
    }
    await client.query("COMMIT");
    json(res, 200, { ok: true });
  } catch (error) {
    await client.query("ROLLBACK"); throw error;
  } finally { client.release(); }
}

// --- Systeemcheck: actieve controles (Twilio-API, website, n8n) ---

function withTimeout(ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, cancel: () => clearTimeout(timer) };
}

async function checkTwilioNumber(phoneNumber, storedAccountSid) {
  if (!phoneNumber) return { status: "not_configured", detail: "Geen Twilio-nummer gekoppeld." };
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) return { status: "unknown", detail: "Twilio-controle niet geconfigureerd op de server." };
  const { signal, cancel } = withTimeout(HEALTH_TIMEOUT_MS);
  try {
    const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/IncomingPhoneNumbers.json?PhoneNumber=${encodeURIComponent(phoneNumber)}`;
    const response = await fetch(url, { headers: { Authorization: `Basic ${auth}` }, signal });
    if (!response.ok) return { status: "error", detail: `Twilio-API gaf HTTP ${response.status}.` };
    const body = await response.json();
    const match = body.incoming_phone_numbers?.[0];
    if (!match) return { status: "error", detail: "Nummer niet gevonden onder het Twilio-hoofdaccount." };
    if (storedAccountSid && storedAccountSid !== TWILIO_ACCOUNT_SID) return { status: "warning", detail: "Opgeslagen accountcode wijkt af van het hoofdaccount." };
    const hasVoice = Boolean(match.voice_url || match.voice_application_sid);
    return hasVoice
      ? { status: "ok", detail: "Nummer actief en gekoppeld aan een voice-flow." }
      : { status: "warning", detail: "Nummer actief, maar geen voice-koppeling ingesteld." };
  } catch (error) {
    return { status: "error", detail: error.name === "AbortError" ? "Twilio reageerde niet op tijd." : "Kon Twilio niet bereiken." };
  } finally { cancel(); }
}

async function checkWebsite(domain) {
  if (!domain) return { status: "not_configured", detail: "Geen website gekoppeld." };
  const { signal, cancel } = withTimeout(HEALTH_TIMEOUT_MS);
  try {
    const response = await fetch(`https://${domain}`, { method: "GET", redirect: "follow", signal });
    return response.ok
      ? { status: "ok", detail: `Bereikbaar (HTTP ${response.status}).` }
      : { status: "error", detail: `Website gaf HTTP ${response.status}.` };
  } catch (error) {
    return { status: "error", detail: error.name === "AbortError" ? "Website reageerde niet op tijd." : "Website niet bereikbaar." };
  } finally { cancel(); }
}

async function checkN8nWorkflow(workflowId) {
  if (!workflowId) return { status: "not_configured", detail: "Geen n8n-workflow gekoppeld." };
  if (!N8N_API_URL || !N8N_API_KEY) return { status: "unknown", detail: "n8n-controle niet geconfigureerd op de server." };
  const { signal, cancel } = withTimeout(HEALTH_TIMEOUT_MS);
  try {
    const response = await fetch(`${N8N_API_URL}/api/v1/workflows/${encodeURIComponent(workflowId)}`, { headers: { "X-N8N-API-KEY": N8N_API_KEY }, signal });
    if (response.status === 404) return { status: "error", detail: "Workflow niet gevonden in n8n." };
    if (!response.ok) return { status: "error", detail: `n8n-API gaf HTTP ${response.status}.` };
    const body = await response.json();
    return body.active
      ? { status: "ok", detail: "Workflow actief." }
      : { status: "error", detail: "Workflow bestaat, maar staat uit." };
  } catch (error) {
    return { status: "error", detail: error.name === "AbortError" ? "n8n reageerde niet op tijd." : "Kon n8n niet bereiken." };
  } finally { cancel(); }
}

function staleDays(lastEventAt) {
  if (!lastEventAt) return null;
  return Math.floor((Date.now() - new Date(lastEventAt).getTime()) / 86_400_000);
}

// Combineert deelchecks (bijv. Twilio-nummer + de bijbehorende n8n-workflow) tot
// één statusregel per kanaal. "not_configured" weegt zwaarder dan "ok" (nooit
// stilzwijgend groen tonen als een deel nog niet gekoppeld is), maar minder zwaar
// dan een echte fout.
const STATUS_RANK = { ok: 0, not_configured: 1, unknown: 2, warning: 3, error: 4 };
function combineChecks(checks) {
  const worst = checks.reduce((a, b) => (STATUS_RANK[b.status] > STATUS_RANK[a.status] ? b : a));
  return { status: worst.status, detail: checks.map((c) => c.detail).filter(Boolean).join(" ") };
}

async function runHealthcheck(res, user) {
  if (!requirePlatformAdmin(res, user)) return;
  const tenants = await pool.query(`
    SELECT t.id, t.slug, t.name, t.website_domain AS "websiteDomain",
      COALESCE(jsonb_object_agg(i.source, jsonb_build_object(
        'status', i.status, 'externalIdentifier', i.external_identifier,
        'twilioAccountSid', i.twilio_account_sid, 'lastEventAt', i.last_event_at,
        'n8nWorkflowId', i.config->>'n8n_workflow_id'
      )) FILTER (WHERE i.id IS NOT NULL), '{}'::jsonb) AS integrations
    FROM tenants t
    LEFT JOIN tenant_integrations i ON i.tenant_id = t.id
    WHERE t.active = TRUE
    GROUP BY t.id
    ORDER BY t.name
  `);

  const results = await Promise.all(tenants.rows.map(async (tenant) => {
    const twilioInfo = tenant.integrations.twilio || {};
    const websiteInfo = tenant.integrations.website || {};
    const emailInfo = tenant.integrations.email || {};
    const [twilioNumber, twilioFlow, site, websiteFlow, emailFlow] = await Promise.all([
      checkTwilioNumber(twilioInfo.externalIdentifier, twilioInfo.twilioAccountSid),
      checkN8nWorkflow(twilioInfo.n8nWorkflowId),
      checkWebsite(tenant.websiteDomain),
      checkN8nWorkflow(websiteInfo.n8nWorkflowId),
      checkN8nWorkflow(emailInfo.n8nWorkflowId),
    ]);
    return {
      tenantId: tenant.id, slug: tenant.slug, name: tenant.name,
      checks: {
        twilio: combineChecks([twilioNumber, twilioFlow]),
        website: combineChecks([site, websiteFlow]),
        email: emailFlow,
      },
      lastEventDays: staleDays(twilioInfo.lastEventAt),
    };
  }));

  const flat = results.flatMap((row) => Object.values(row.checks));
  const summary = {
    ok: flat.filter((c) => c.status === "ok").length,
    warning: flat.filter((c) => c.status === "warning").length,
    error: flat.filter((c) => c.status === "error").length,
    notConfigured: flat.filter((c) => c.status === "not_configured").length,
    unknown: flat.filter((c) => c.status === "unknown").length,
  };
  json(res, 200, { checkedAt: new Date().toISOString(), summary, tenants: results });
}

// --- Activiteitenlog (platform-niveau, alleen platform_admin) ---
const ACTIVITY_CATEGORIES = ["beslissing", "bouwwerk", "fix", "test", "onderzoek", "infra"];
const ACTIVITY_LABELS = { beslissing: "Beslissing", bouwwerk: "Bouwwerk", fix: "Fix", test: "Test", onderzoek: "Onderzoek", infra: "Infra" };

async function listActivity(res, user) {
  if (!requirePlatformAdmin(res, user)) return;
  const result = await pool.query(`
    SELECT id, to_char(log_date, 'YYYY-MM-DD') AS log_date, category, title, summary, created_by, created_at
    FROM activity_log ORDER BY log_date DESC, id DESC LIMIT 500
  `);
  const days = [];
  const byDate = new Map();
  for (const row of result.rows) {
    let day = byDate.get(row.log_date);
    if (!day) { day = { date: row.log_date, entries: [] }; byDate.set(row.log_date, day); days.push(day); }
    day.entries.push({ id: row.id, category: row.category, label: ACTIVITY_LABELS[row.category] || row.category, title: row.title, summary: row.summary, createdBy: row.created_by });
  }
  json(res, 200, { days, totalDays: days.length, totalEntries: result.rows.length });
}

async function addActivity(req, res, user) {
  if (!requirePlatformAdmin(res, user)) return;
  const body = await readBody(req);
  const logDate = /^\d{4}-\d{2}-\d{2}$/.test(body.logDate || "") ? body.logDate : new Date().toISOString().slice(0, 10);
  const category = ACTIVITY_CATEGORIES.includes(body.category) ? body.category : "bouwwerk";
  const title = cleanText(body.title, 200);
  const summary = cleanText(body.summary, 2000);
  if (!title || !summary) return json(res, 400, { error: "Titel en samenvatting zijn verplicht." });
  const createdBy = cleanText(body.createdBy, 40) || "wesley";
  const result = await pool.query(`
    INSERT INTO activity_log (log_date, category, title, summary, created_by)
    VALUES ($1, $2, $3, $4, $5) RETURNING id
  `, [logDate, category, title, summary, createdBy]);
  json(res, 201, { ok: true, id: result.rows[0].id });
}

function csvEscape(value) {
  const s = String(value == null ? "" : value).replace(/"/g, '""');
  return `"${s}"`;
}

async function exportActivityCsv(res, user) {
  if (!requirePlatformAdmin(res, user)) return;
  const result = await pool.query(`
    SELECT to_char(log_date, 'YYYY-MM-DD') AS log_date, category, title, summary, created_by
    FROM activity_log ORDER BY log_date DESC, id DESC
  `);
  const header = ["Datum", "Categorie", "Titel", "Samenvatting", "Ingevoerd door"].map(csvEscape).join(";");
  const rows = result.rows.map((r) => [r.log_date, ACTIVITY_LABELS[r.category] || r.category, r.title, r.summary, r.created_by].map(csvEscape).join(";"));
  const csv = "﻿" + [header, ...rows].join("\r\n") + "\r\n"; // BOM: Excel herkent UTF-8 correct
  res.writeHead(200, {
    ...securityHeaders("text/csv; charset=utf-8"),
    "Content-Disposition": `attachment; filename="belvanger-activiteitenlog-${new Date().toISOString().slice(0, 10)}.csv"`,
  });
  res.end(csv);
}

async function listConnections(res, user) {
  const result = await pool.query(`
    SELECT i.source, i.status, i.external_identifier, i.last_event_at,
      (SELECT COUNT(*)::int FROM events e WHERE e.tenant_id = i.tenant_id AND e.source = i.source) AS event_count
    FROM tenant_integrations i WHERE i.tenant_id = $1 ORDER BY i.source
  `, [user.tenant_id]);
  json(res, 200, { connections: result.rows });
}

function rangeInterval(value) {
  return ({ "24h": "1 day", "7d": "7 days", "30d": "30 days" })[value] || "7 days";
}

async function summary(res, user, range) {
  const interval = rangeInterval(range);
  const [attention, counts, channels, recent, contacts] = await Promise.all([
    pool.query("SELECT COUNT(*)::int AS count FROM contacts WHERE tenant_id = $1 AND status IN ('new','follow_up')", [user.tenant_id]),
    pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE event_type = 'call.missed')::int AS missed_calls,
        COUNT(DISTINCT external_id) FILTER (WHERE event_type = 'sms.outbound')::int AS sms_sent,
        COUNT(DISTINCT external_id) FILTER (WHERE event_type = 'sms.status' AND status = 'delivered')::int AS sms_delivered,
        COUNT(*) FILTER (WHERE event_type IN ('sms.inbound','email.inbound'))::int AS replies,
        COUNT(*) FILTER (WHERE event_type IN ('website.lead','chat.lead'))::int AS website_leads
      FROM events WHERE tenant_id = $1 AND occurred_at >= NOW() - $2::interval
    `, [user.tenant_id, interval]),
    pool.query(`SELECT source, COUNT(*)::int AS count FROM events WHERE tenant_id = $1 AND occurred_at >= NOW() - $2::interval GROUP BY source ORDER BY count DESC`, [user.tenant_id, interval]),
    pool.query(`
      SELECT e.id, e.event_type, e.source, e.status, e.subject, e.preview, e.occurred_at,
             c.id AS contact_id, c.name, c.company, c.phone, c.email
      FROM events e LEFT JOIN contacts c ON c.id = e.contact_id
      WHERE e.tenant_id = $1 ORDER BY e.occurred_at DESC LIMIT 12
    `, [user.tenant_id]),
    pool.query(`
      SELECT c.*, COALESCE((SELECT event_type FROM events e WHERE e.contact_id = c.id ORDER BY occurred_at DESC LIMIT 1), '') AS last_event_type
      FROM contacts c WHERE c.tenant_id = $1 AND c.status IN ('new','follow_up')
      ORDER BY c.last_event_at DESC LIMIT 8
    `, [user.tenant_id]),
  ]);
  json(res, 200, {
    range,
    attention: attention.rows[0].count,
    metrics: counts.rows[0],
    channels: channels.rows,
    recent: recent.rows.map((row) => ({ ...row, label: EVENT_LABELS[row.event_type] || row.event_type })),
    contacts: contacts.rows,
  });
}

async function listContacts(res, user, url) {
  const status = url.searchParams.get("status") || "all";
  const q = cleanText(url.searchParams.get("q"), 100);
  const params = [user.tenant_id];
  let where = "tenant_id = $1";
  if (["new", "follow_up", "contacted", "closed"].includes(status)) {
    params.push(status); where += ` AND status = $${params.length}`;
  }
  if (q) {
    params.push(`%${q.toLowerCase()}%`);
    where += ` AND LOWER(CONCAT_WS(' ', name, company, phone, email)) LIKE $${params.length}`;
  }
  const result = await pool.query(`
    SELECT c.*, (SELECT event_type FROM events e WHERE e.contact_id = c.id ORDER BY occurred_at DESC LIMIT 1) AS last_event_type,
           (SELECT COUNT(*)::int FROM events e WHERE e.contact_id = c.id) AS event_count
    FROM contacts c WHERE ${where} ORDER BY last_event_at DESC LIMIT 200
  `, params);
  json(res, 200, { contacts: result.rows });
}

async function contactDetail(res, user, id) {
  const contact = await pool.query("SELECT * FROM contacts WHERE id = $1 AND tenant_id = $2", [id, user.tenant_id]);
  if (!contact.rowCount) return json(res, 404, { error: "Contact niet gevonden." });
  const events = await pool.query("SELECT * FROM events WHERE contact_id = $1 AND tenant_id = $2 ORDER BY occurred_at DESC", [id, user.tenant_id]);
  json(res, 200, { contact: contact.rows[0], events: events.rows.map((row) => ({ ...row, label: EVENT_LABELS[row.event_type] || row.event_type })) });
}

async function updateContact(req, res, user, id) {
  const body = await readBody(req);
  if (!["new", "follow_up", "contacted", "closed"].includes(body.status)) return json(res, 400, { error: "Ongeldige status." });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const contact = await client.query("UPDATE contacts SET status = $1, updated_at = NOW() WHERE id = $2 AND tenant_id = $3 RETURNING *", [body.status, id, user.tenant_id]);
    if (!contact.rowCount) { await client.query("ROLLBACK"); return json(res, 404, { error: "Contact niet gevonden." }); }
    const dedupeKey = `dashboard:${crypto.randomUUID()}:contact.status`;
    await client.query(`
      INSERT INTO events (tenant_id, contact_id, source, event_type, direction, status, preview, dedupe_key, occurred_at)
      VALUES ($1,$2,'dashboard','contact.status','system',$3,$4,$5,NOW())
    `, [user.tenant_id, id, body.status, cleanText(body.note, 600), dedupeKey]);
    await client.query("COMMIT");
    json(res, 200, { contact: contact.rows[0] });
  } catch (error) {
    await client.query("ROLLBACK"); throw error;
  } finally { client.release(); }
}

function serveStatic(req, res, pathname) {
  const requested = pathname === "/" ? "index.html" : pathname.replace(/^\//, "");
  const target = path.resolve(PUBLIC_DIR, requested);
  if (!target.startsWith(PUBLIC_DIR) || !fs.existsSync(target) || fs.statSync(target).isDirectory()) return false;
  const ext = path.extname(target);
  const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml" };
  res.writeHead(200, { ...securityHeaders(types[ext] || "application/octet-stream"), "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=3600" });
  fs.createReadStream(target).pipe(res);
  return true;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  try {
    if (req.method === "GET" && url.pathname === "/healthz") {
      await pool.query("SELECT 1"); return json(res, 200, { ok: true });
    }
    if (req.method === "POST" && url.pathname === "/api/login") return await login(req, res);
    if (req.method === "POST" && url.pathname === "/api/ingest") return await ingest(req, res);

    if (url.pathname.startsWith("/api/")) {
      const user = await requireUser(req, res);
      if (!user) return;
      if (req.method === "POST" && url.pathname === "/api/logout") return await logout(req, res);
      if (req.method === "GET" && url.pathname === "/api/me") return json(res, 200, { user });
      if (req.method === "POST" && url.pathname === "/api/change-password") return await changePassword(req, res, user);
      if (req.method === "GET" && url.pathname === "/api/summary") return await summary(res, user, url.searchParams.get("range") || "7d");
      if (req.method === "GET" && url.pathname === "/api/connections") return await listConnections(res, user);
      if (req.method === "GET" && url.pathname === "/api/contacts") return await listContacts(res, user, url);
      if (req.method === "GET" && url.pathname === "/api/admin/tenants") return await listAdminTenants(res, user);
      if (req.method === "POST" && url.pathname === "/api/admin/tenants") return await createAdminTenant(req, res, user);
      if (req.method === "POST" && url.pathname === "/api/admin/healthcheck") return await runHealthcheck(res, user);
      if (req.method === "GET" && url.pathname === "/api/admin/activity") return await listActivity(res, user);
      if (req.method === "POST" && url.pathname === "/api/admin/activity") return await addActivity(req, res, user);
      if (req.method === "GET" && url.pathname === "/api/admin/activity/export") return await exportActivityCsv(res, user);
      const twilioAdminMatch = url.pathname.match(/^\/api\/admin\/tenants\/(\d+)\/twilio$/);
      if (twilioAdminMatch && req.method === "PATCH") return await updateAdminTwilio(req, res, user, Number(twilioAdminMatch[1]));
      const configAdminMatch = url.pathname.match(/^\/api\/admin\/tenants\/(\d+)\/config$/);
      if (configAdminMatch && req.method === "PATCH") return await updateAdminTenantConfig(req, res, user, Number(configAdminMatch[1]));
      const n8nAdminMatch = url.pathname.match(/^\/api\/admin\/tenants\/(\d+)\/n8n$/);
      if (n8nAdminMatch && req.method === "PATCH") return await updateAdminN8nLinks(req, res, user, Number(n8nAdminMatch[1]));
      const match = url.pathname.match(/^\/api\/contacts\/(\d+)$/);
      if (match && req.method === "GET") return await contactDetail(res, user, Number(match[1]));
      if (match && req.method === "PATCH") return await updateContact(req, res, user, Number(match[1]));
      return json(res, 404, { error: "API-route niet gevonden." });
    }

    if (req.method === "GET" && serveStatic(req, res, url.pathname)) return;
    json(res, 404, { error: "Niet gevonden." });
  } catch (error) {
    console.error(error?.stack || error);
    json(res, error.status || 500, { error: error.status ? error.message : "Interne fout." });
  }
});

await bootstrap();
server.listen(PORT, "0.0.0.0", () => console.log(`Belvanger portal draait op poort ${PORT}`));
