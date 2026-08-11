import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import tls from "node:tls";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { sendPush } from "./webpush.js";
import { INBOUND_PUSH_KINDS, inboundPushPayload } from "./push-payloads.js";

const { Pool } = pg;
const scrypt = promisify(crypto.scrypt);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, "../public");
// Gebouwd door build-knowledge-index.mjs, bewust NIET in public/ (dat wordt onbeveiligd
// statisch geserveerd) — alleen bereikbaar via het geauthenticeerde /api/admin/knowledge.
const KNOWLEDGE_INDEX_PATH = path.join(__dirname, "knowledge-index.json");
// Handmatig, inhoudelijk geanalyseerd (niet automatisch af te leiden): welk document hoort
// écht bij welk ander document, en waarom. Zie knowledge-relationships.json zelf voor hoe
// dit is bepaald (per-categorie inhoudsanalyse, geen keyword-gok of categorie-toeval).
const KNOWLEDGE_RELATIONSHIPS_PATH = path.join(__dirname, "knowledge-relationships.json");
// Nachtelijke staleness-check schrijft hier zijn laatste run naar toe (runtime state,
// niet gecommit — reset bij elke deploy, en dat is prima: het is een signaal, geen
// bron van waarheid). Zie runStalenessCheck() verderop.
const KNOWLEDGE_STALENESS_PATH = path.join(__dirname, "knowledge-staleness-state.json");
const PORT = Number(process.env.PORT || 8096);
const DATABASE_URL = process.env.DATABASE_URL || "";
const INGEST_KEY = process.env.INGEST_KEY || "";
const COOKIE_SECURE = String(process.env.COOKIE_SECURE || "false") === "true";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;
const OTP_TTL_MS = 10 * 60 * 1000;
const TRUST_TTL_MS = 30 * 24 * 60 * 60 * 1000;
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

// Hulp: klant stuurt een vraag, komt per e-mail binnen. Dezelfde Hostinger-mailbox
// en dezelfde zero-dependency SMTP-client als het bestaande leadformulier op
// belvanger.nl (product/chatbot/server.js), hier hergebruikt i.p.v. opnieuw gebouwd.
const SMTP_HOST = process.env.SMTP_HOST || "";
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER;
const SUPPORT_TO = process.env.SUPPORT_TO || "";
const SMTP_ENABLED = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);
const SUPPORT_ENABLED = SMTP_ENABLED && Boolean(SUPPORT_TO);
const supportAttempts = new Map();

// Web Push (PWA op het beginscherm + de Android-app via Trusted Web Activity).
// Ontbreken deze vars, dan is push simpelweg uit: /api/push/key geeft dan netjes
// { enabled: false } en de klant ziet geen aan-knop, in plaats van een crash.
// Sleutels genereren: node scripts/generate-vapid-keys.mjs
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || (SMTP_FROM ? `mailto:${SMTP_FROM}` : "");
const PUSH_ENABLED = Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY && VAPID_SUBJECT);
// Publieke URL van het dashboard, gebruikt in de deeplink van een pushmelding en in
// de e-mailmeldingen. Zonder dit valt hij terug op het domein dat al hardcoded in de
// e-mails stond, zodat gedrag niet verandert als de var ontbreekt.
const PUBLIC_BASE_URL = (process.env.PUBLIC_BASE_URL || "https://dashboard.belvanger.nl").replace(/\/+$/, "");
// Trusted Web Activity: pakketnaam + signing-fingerprints voor
// /.well-known/assetlinks.json. Meerdere fingerprints zijn normaal (upload key én
// de sleutel waarmee Play App Signing daadwerkelijk ondertekent), komma-gescheiden.
const TWA_PACKAGE_NAME = (process.env.TWA_PACKAGE_NAME || "").trim();
const TWA_SHA256_FINGERPRINTS = (process.env.TWA_SHA256_FINGERPRINTS || "")
  .split(",")
  .map((value) => value.trim().toUpperCase())
  .filter((value) => /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/.test(value));

if (!DATABASE_URL || !INGEST_KEY) throw new Error("DATABASE_URL en INGEST_KEY zijn verplicht");

const pool = new Pool({ connectionString: DATABASE_URL, max: 10 });
const loginAttempts = new Map();
const resetAttempts = new Map();
const otpVerifyAttempts = new Map();

// "Deze periode bespaard"-widget (Overzicht): dezelfde eerlijke aanname als de
// rekenmachine op de marketingsite (sites/belvanger/site/js/app.js) — ~60% van
// gemiste belletjes is een echte klus-kans. avg_job_value komt uit tenants (door
// platform_admin ingesteld); ontbreekt die, dan valt de widget terug op deze default
// (zelfde €250 als de homepage-rekenmachine) en toont de widget een indicatie-hint.
const DEFAULT_AVG_JOB_VALUE = 250;
const MISSED_CALL_RECOVERY_RATE = 0.6;

const EVENT_LABELS = {
  "call.missed": "Gemiste oproep",
  "sms.outbound": "Sms verzonden",
  "sms.status": "Sms-status",
  "sms.inbound": "Sms ontvangen",
  "email.inbound": "E-mail ontvangen",
  "website.lead": "Websiteaanvraag",
  "chat.lead": "Aanvraag via chat",
  "contact.status": "Status gewijzigd",
  "contact.manual": "Handmatig toegevoegd",
  "contact.referred": "Doorgezet naar partner",
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

function resetToken() {
  return crypto.randomBytes(32).toString("base64url");
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
           t.id AS tenant_id, t.slug AS tenant_slug, t.name AS tenant_name, t.avg_job_value
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

async function createSessionCookie(userId) {
  const token = crypto.randomBytes(32).toString("base64url");
  await pool.query("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)", [tokenHash(token), userId, new Date(Date.now() + SESSION_TTL_MS)]);
  return `portal_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_MS / 1000}${COOKIE_SECURE ? "; Secure" : ""}`;
}

async function createTrustCookie(userId) {
  const token = crypto.randomBytes(32).toString("base64url");
  await pool.query("INSERT INTO trusted_devices (token_hash, user_id, expires_at) VALUES ($1, $2, $3)", [tokenHash(token), userId, new Date(Date.now() + TRUST_TTL_MS)]);
  return `portal_trust=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${TRUST_TTL_MS / 1000}${COOKIE_SECURE ? "; Secure" : ""}`;
}

function otpEmail(code) {
  return {
    subject: `Inlogcode: ${code}`,
    text: `Je inlogcode voor Belvanger is: ${code}\n\nDeze code is 10 minuten geldig. Heb je niet zelf proberen in te loggen? Negeer deze e-mail dan, of wijzig voor de zekerheid je wachtwoord.`,
    html: emailShell(
      `<p style="margin:0 0 14px;font-size:18px;font-weight:700;">Je inlogcode</p>
       <p style="margin:0 0 20px;">Vul deze code in om in te loggen bij je Belvanger-dashboard. Geldig voor 10 minuten.</p>
       <p style="margin:0 0 20px;font-size:32px;font-weight:900;letter-spacing:.12em;color:#16232E;">${escHtml(code)}</p>
       <p style="margin:0;color:#5a6470;font-size:13px;">Heb je niet zelf proberen in te loggen? Negeer deze e-mail, of wijzig voor de zekerheid je wachtwoord.</p>`,
      "Belvanger, veilig en overzichtelijk.",
      "Je ontvangt dit omdat er zojuist is ingelogd (of geprobeerd) op jouw Belvanger-account."),
  };
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

  // Vertrouwd apparaat (30 dagen): 2FA overslaan als dit apparaat al eerder een
  // code voor deze gebruiker heeft ingevoerd.
  const trustToken = parseCookies(req).portal_trust;
  if (trustToken) {
    const trusted = await pool.query(
      "SELECT 1 FROM trusted_devices WHERE token_hash = $1 AND user_id = $2 AND expires_at > NOW()",
      [tokenHash(trustToken), user.id]
    );
    if (trusted.rowCount) {
      const cookie = await createSessionCookie(user.id);
      return json(res, 200, { ok: true, mustChangePassword: user.must_change_password }, { "Set-Cookie": cookie });
    }
  }

  // Geen SMTP geconfigureerd: 2FA kan dan niet werken, val terug op direct inloggen
  // i.p.v. iedereen buiten te sluiten.
  if (!SMTP_ENABLED) {
    const cookie = await createSessionCookie(user.id);
    return json(res, 200, { ok: true, mustChangePassword: user.must_change_password }, { "Set-Cookie": cookie });
  }

  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
  const challenge = crypto.randomBytes(32).toString("base64url");
  await pool.query(
    "INSERT INTO login_challenges (token_hash, user_id, code_hash, expires_at) VALUES ($1, $2, $3, $4)",
    [tokenHash(challenge), user.id, tokenHash(code), new Date(Date.now() + OTP_TTL_MS)]
  );
  const mail = otpEmail(code);
  smtpSend({ host: SMTP_HOST, port: SMTP_PORT, user: SMTP_USER, pass: SMTP_PASS, from: SMTP_FROM, to: email, subject: mail.subject, text: mail.text, html: mail.html })
    .catch((error) => console.error("otp-mail mislukt naar", email, error?.message || error));
  json(res, 200, { otpRequired: true, challenge });
}

async function verifyOtp(req, res) {
  const ip = req.socket.remoteAddress || "unknown";
  const attempt = otpVerifyAttempts.get(ip) || { count: 0, reset: Date.now() + 15 * 60_000 };
  if (Date.now() > attempt.reset) Object.assign(attempt, { count: 0, reset: Date.now() + 15 * 60_000 });
  if (attempt.count >= 15) return json(res, 429, { error: "Te veel pogingen. Log opnieuw in." });

  const body = await readBody(req);
  const challenge = String(body.challenge || "");
  const code = cleanText(body.code, 6) || "";
  const remember = body.remember === true;

  const client = await pool.connect();
  let outcome;
  try {
    await client.query("BEGIN");
    const result = await client.query(
      `SELECT lc.token_hash, lc.user_id, lc.code_hash, lc.attempts, u.must_change_password
       FROM login_challenges lc JOIN users u ON u.id = lc.user_id
       WHERE lc.token_hash = $1 AND lc.expires_at > NOW() FOR UPDATE`,
      [tokenHash(challenge)]
    );
    if (!result.rowCount) {
      outcome = { status: 400, error: "Deze aanvraag is verlopen of ongeldig. Log opnieuw in." };
    } else {
      const row = result.rows[0];
      if (row.attempts >= 5) {
        await client.query("DELETE FROM login_challenges WHERE token_hash = $1", [row.token_hash]);
        outcome = { status: 429, error: "Te veel foutieve pogingen. Log opnieuw in." };
      } else if (!safeEqual(tokenHash(code), row.code_hash)) {
        await client.query("UPDATE login_challenges SET attempts = attempts + 1 WHERE token_hash = $1", [row.token_hash]);
        outcome = { status: 401, error: "Code klopt niet." };
      } else {
        await client.query("DELETE FROM login_challenges WHERE token_hash = $1", [row.token_hash]);
        outcome = { status: 200, userId: row.user_id, mustChangePassword: row.must_change_password };
      }
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  if (outcome.status !== 200) {
    attempt.count += 1;
    otpVerifyAttempts.set(ip, attempt);
    return json(res, outcome.status, { error: outcome.error });
  }
  otpVerifyAttempts.delete(ip);
  const cookies = [await createSessionCookie(outcome.userId)];
  if (remember) cookies.push(await createTrustCookie(outcome.userId));
  json(res, 200, { ok: true, mustChangePassword: outcome.mustChangePassword }, { "Set-Cookie": cookies });
}

async function logout(req, res) {
  const token = parseCookies(req).portal_session;
  if (token) {
    // Push-subscriptions horen bij de SESSIE, niet bij de browser. Laten we ze staan,
    // dan blijven lead-meldingen aankomen op een toestel dat geen geldige sessie meer
    // heeft: dat is leaddata naar een niet-geauthenticeerd apparaat. Daarom eerst de
    // toestellen van deze gebruiker weg, dan de sessie.
    const session = await pool.query("SELECT user_id FROM sessions WHERE token_hash = $1", [tokenHash(token)]);
    if (session.rowCount) {
      await pool.query("DELETE FROM push_devices WHERE user_id = $1", [session.rows[0].user_id]);
    }
    await pool.query("DELETE FROM sessions WHERE token_hash = $1", [tokenHash(token)]);
  }
  json(res, 200, { ok: true }, { "Set-Cookie": "portal_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0" });
}

function passwordResetEmail(naam, resetUrl) {
  const first = escHtml(String(naam || "").trim().split(/\s+/)[0] || "daar");
  return {
    subject: "Wachtwoord opnieuw instellen",
    text: `Hoi ${first},\n\nJe hebt (of iemand namens jou) een nieuw wachtwoord aangevraagd voor je Belvanger-dashboard.\n\nStel 'm hier binnen 60 minuten opnieuw in:\n${resetUrl}\n\nHeb je dit niet aangevraagd? Dan kun je deze e-mail gewoon negeren, er verandert niets aan je account.\n\nGroeten,\nTeam Belvanger`,
    html: emailShell(
      `<p style="margin:0 0 14px;font-size:18px;font-weight:700;">Wachtwoord opnieuw instellen</p>
       <p style="margin:0 0 14px;">Hoi ${first}, je hebt (of iemand namens jou) een nieuw wachtwoord aangevraagd voor je Belvanger-dashboard.</p>
       <p style="margin:0 0 20px;">Stel 'm hieronder binnen 60 minuten opnieuw in. Daarna verloopt de link.</p>
       <p style="margin:0 0 20px;"><a href="${resetUrl}" style="display:inline-block;background:#E6480C;color:#fff;font-weight:700;padding:12px 22px;border-radius:10px;text-decoration:none;">Nieuw wachtwoord instellen</a></p>
       <p style="margin:0;color:#5a6470;font-size:13px;">Heb je dit niet aangevraagd? Negeer deze e-mail gerust, er verandert dan niets aan je account.</p>`,
      "Belvanger, veilig en overzichtelijk.",
      "Je ontvangt dit omdat er een wachtwoordreset is aangevraagd voor jouw Belvanger-account."),
  };
}

// Altijd hetzelfde antwoord teruggeven, ongeacht of het account bestaat of de
// limiet is geraakt: nooit laten blijken welke e-mailadressen wel/niet bestaan.
async function requestPasswordReset(req, res) {
  const ip = req.socket.remoteAddress || "unknown";
  const attempt = resetAttempts.get(ip) || { count: 0, reset: Date.now() + 15 * 60_000 };
  if (Date.now() > attempt.reset) Object.assign(attempt, { count: 0, reset: Date.now() + 15 * 60_000 });
  attempt.count += 1;
  resetAttempts.set(ip, attempt);

  const body = await readBody(req);
  if (attempt.count <= 8 && SMTP_ENABLED) {
    const email = normalizeEmail(body.email);
    const tenant = cleanText(body.tenant || "belvanger", 80);
    if (email) {
      const result = await pool.query(`
        SELECT u.id, u.display_name FROM users u JOIN tenants t ON t.id = u.tenant_id
        WHERE u.email = $1 AND t.slug = $2 AND u.active = TRUE
      `, [email, tenant]);
      const target = result.rows[0];
      if (target) {
        const token = resetToken();
        await pool.query(
          "INSERT INTO password_reset_tokens (token_hash, user_id, expires_at) VALUES ($1, $2, $3)",
          [tokenHash(token), target.id, new Date(Date.now() + PASSWORD_RESET_TTL_MS)]
        );
        const resetUrl = `https://dashboard.belvanger.nl/reset.html?token=${encodeURIComponent(token)}`;
        const mail = passwordResetEmail(target.display_name, resetUrl);
        smtpSend({ host: SMTP_HOST, port: SMTP_PORT, user: SMTP_USER, pass: SMTP_PASS, from: SMTP_FROM, to: email, subject: mail.subject, text: mail.text, html: mail.html })
          .catch((error) => console.error("wachtwoordreset-mail mislukt naar", email, error?.message || error));
      }
    }
  }
  json(res, 200, { ok: true });
}

async function verifyResetToken(res, tokenRaw) {
  if (!tokenRaw) return json(res, 200, { valid: false });
  const result = await pool.query(
    "SELECT 1 FROM password_reset_tokens WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()",
    [tokenHash(tokenRaw)]
  );
  json(res, 200, { valid: Boolean(result.rowCount) });
}

async function completePasswordReset(req, res) {
  const body = await readBody(req);
  const tokenRaw = String(body.token || "");
  const password = String(body.password || "");
  if (password.length < 12) return json(res, 400, { error: "Het nieuwe wachtwoord moet minimaal 12 tekens hebben." });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      "SELECT user_id FROM password_reset_tokens WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW() FOR UPDATE",
      [tokenHash(tokenRaw)]
    );
    if (!result.rowCount) {
      await client.query("ROLLBACK");
      return json(res, 400, { error: "Deze link is ongeldig of verlopen. Vraag een nieuwe aan." });
    }
    const userId = result.rows[0].user_id;
    const credentials = await createPassword(password);
    await client.query("UPDATE users SET password_salt = $1, password_hash = $2, must_change_password = FALSE WHERE id = $3", [credentials.salt, credentials.hash, userId]);
    await client.query("UPDATE password_reset_tokens SET used_at = NOW() WHERE token_hash = $1", [tokenHash(tokenRaw)]);
    await client.query("DELETE FROM sessions WHERE user_id = $1", [userId]);
    // Ook de vertrouwde apparaten eruit. Zonder deze regel overleeft de tweefactor-omzeiling
    // van een apparaat dat iemand anders in handen heeft de wachtwoordreset nog 30 dagen,
    // terwijl die reset juist bedoeld is om die persoon buiten te zetten.
    await client.query("DELETE FROM trusted_devices WHERE user_id = $1", [userId]);
    await client.query("COMMIT");
    json(res, 200, { ok: true });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function changePassword(req, res, user) {
  const body = await readBody(req);
  const password = String(body.password || "");
  if (password.length < 12) return json(res, 400, { error: "Gebruik minimaal 12 tekens." });

  // Twee gevallen, en ze verschillen wezenlijk.
  //
  // Gedwongen eerste wijziging (must_change_password): de gebruiker heeft zojuist het
  // tijdelijke wachtwoord ingetypt om binnen te komen. Er is geen tweede wachtwoord om naar
  // te vragen.
  //
  // Vrijwillige wijziging: hier MOET het huidige wachtwoord erbij. Zonder die eis kan
  // iedereen die een sessie te pakken heeft (geleende telefoon, meegekeken op de laptop, een
  // gestolen cookie) het wachtwoord veranderen zonder het oude ooit te kennen, en de eigenaar
  // daarmee uit zijn eigen dashboard sluiten. De sessie is dan de sleutel tot het slot.
  if (!user.must_change_password) {
    const current = String(body.currentPassword || "");
    const opgeslagen = await pool.query("SELECT password_salt, password_hash FROM users WHERE id = $1", [user.id]);
    const rij = opgeslagen.rows[0];
    if (!rij) return json(res, 401, { error: "Log opnieuw in." });
    // Altijd rekenen, ook bij een leeg veld, zodat de duur niets verraadt.
    const digest = await passwordDigest(current, rij.password_salt);
    const klopt = current.length > 0 && crypto.timingSafeEqual(Buffer.from(digest, "hex"), Buffer.from(rij.password_hash, "hex"));
    if (!klopt) return json(res, 401, { error: "Je huidige wachtwoord klopt niet." });
    if (current === password) return json(res, 400, { error: "Kies een ander wachtwoord dan je huidige." });
  }

  const credentials = await createPassword(password);
  await pool.query("UPDATE users SET password_salt = $1, password_hash = $2, must_change_password = FALSE WHERE id = $3", [credentials.salt, credentials.hash, user.id]);

  // Je wachtwoord wijzigen doe je meestal omdat je twijfelt of iemand anders het kent. Dan is
  // het onlogisch dat elke andere sessie 12 uur geldig blijft en elk vertrouwd apparaat de
  // tweefactor nog 30 dagen mag overslaan. Alles eruit behalve de sessie waarmee je dit nu
  // doet, anders log je jezelf uit terwijl je in het scherm staat.
  const huidigeSessie = parseCookies(req).portal_session;
  await pool.query(
    "DELETE FROM sessions WHERE user_id = $1 AND token_hash <> $2",
    [user.id, huidigeSessie ? tokenHash(huidigeSessie) : ""],
  );
  await pool.query("DELETE FROM trusted_devices WHERE user_id = $1", [user.id]);
  json(res, 200, { ok: true });
}

// Gebeurtenissen waarbij een MENS op antwoord wacht. Komt zo'n gebeurtenis binnen bij
// een contact dat al op "contact gehad" of "afgesloten" staat, dan hoort dat contact
// terug in de opvolglijst.
//
// Waarom dit er expliciet staat: tot 2026-07-29 zette upsertContact alleen 'closed'
// terug naar 'follow_up'. Een klant die je al eens gesproken had ('contacted') en die
// daarna opnieuw het formulier invulde, verdween daardoor stilletjes uit "Nu aandacht
// nodig". Precies de klant die je NIET mag missen, want die is al warm. Gevonden
// doordat de founder een testaanvraag deed en zijn eigen contact op 'contacted' stond.
//
// sms.outbound en sms.status staan hier bewust niet in, net als in INBOUND_PUSH_KINDS:
// dat is ons eigen systeem dat werkt, niet iemand die wacht.
const HEROPENT_OPVOLGING = new Set([
  "call.missed",
  "website.lead",
  ...Object.keys(INBOUND_PUSH_KINDS),
]);

async function upsertContact(client, tenantId, contact, occurredAt, eventType) {
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
        status = CASE WHEN $7::boolean AND status NOT IN ('new', 'follow_up')
                      THEN 'follow_up' ELSE status END,
        last_event_at = GREATEST(last_event_at, $5), updated_at = NOW()
      WHERE id = $6
    `, [name, company, phone, email, occurredAt, id, HEROPENT_OPVOLGING.has(eventType)]);
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
    const contactId = await upsertContact(client, target.tenant_id, body.contact || {}, occurredAt, eventType);
    const inserted = await client.query(`
      INSERT INTO events (tenant_id, contact_id, source, event_type, direction, external_id, status, subject, preview, metadata, dedupe_key, occurred_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11,$12)
      ON CONFLICT (tenant_id, dedupe_key) DO NOTHING RETURNING id
    `, [target.tenant_id, contactId, source, eventType, ["inbound", "outbound", "system"].includes(body.direction) ? body.direction : null, externalId, status, cleanText(body.subject, 220), cleanText(body.preview, 600), JSON.stringify(metadata), dedupeKey, occurredAt]);
    if (target.integration_id) {
      await client.query("UPDATE tenant_integrations SET status = 'connected', last_event_at = GREATEST(COALESCE(last_event_at, $1), $1), updated_at = NOW() WHERE id = $2", [occurredAt, target.integration_id]);
    }
    await client.query("COMMIT");
    if (inserted.rowCount && eventType === "call.missed") {
      notifyMissedCall(target.tenant_id, body.contact?.phone, occurredAt).catch(() => {});
      pushMissedCall(target.tenant_id, body.contact?.phone, occurredAt).catch(() => {});
    }
    if (inserted.rowCount && eventType === "website.lead") {
      notifyWebsiteLead(target.tenant_id, body.contact, cleanText(body.preview, 600), occurredAt).catch(() => {});
      pushWebsiteLead(target.tenant_id, occurredAt).catch(() => {});
    }
    // Een reactie van de beller, een e-mail of een chataanvraag. Dit is de eigenlijke
    // lead: zonder melding hierop mist de klant het gesprek alsnog.
    if (inserted.rowCount && INBOUND_PUSH_KINDS[eventType]) {
      pushInboundLead(target.tenant_id, eventType, contactId, body.contact, cleanText(body.preview, 600)).catch(() => {});
    }
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
      t.avg_job_value AS "avgJobValue",
      ta.clarity_project_id AS "clarityProjectId",
      (ta.clarity_api_token IS NOT NULL) AS "clarityTokenSet",
      ta.search_console_url AS "searchConsoleUrl",
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
    LEFT JOIN tenant_analytics ta ON ta.tenant_id = t.id
    GROUP BY t.id, ta.clarity_project_id, ta.clarity_api_token, ta.search_console_url
    ORDER BY t.created_at DESC
  `);
  json(res, 200, { tenants: result.rows });
}

// Kennisbank ("second brain"): statisch, door build-knowledge-index.mjs gebouwd
// JSON-bestand met alle relevante markdown-documentatie. Geen database nodig —
// dit verandert alleen wanneer iemand opnieuw deployt, niet at runtime.
let knowledgeCache = null;
async function listKnowledge(res, user) {
  if (!requirePlatformAdmin(res, user)) return;
  if (!knowledgeCache) {
    let entries = [], generatedAt = null, relationships = [];
    try { ({ generatedAt, entries } = JSON.parse(fs.readFileSync(KNOWLEDGE_INDEX_PATH, "utf8"))); } catch {}
    try { relationships = JSON.parse(fs.readFileSync(KNOWLEDGE_RELATIONSHIPS_PATH, "utf8")); } catch {}
    knowledgeCache = { generatedAt, entries, relationships };
  }
  let staleness = null;
  try { staleness = JSON.parse(fs.readFileSync(KNOWLEDGE_STALENESS_PATH, "utf8")); } catch {}
  json(res, 200, { ...knowledgeCache, staleness });
}

// Nachtelijke staleness-check — Level-5-lite: geen 24/7-losse dienst, gewoon een
// geplande taak binnen het proces dat toch al altijd draait. Herchecked elke nacht
// een roterende plak (~5%) van de 112 relaties: staat de kernterm uit de "reason"
// nog steeds in het bron-document? Zo niet, is de relatie mogelijk verouderd sinds
// die inhoud is herschreven. Ontdekt geen NIEUWE documenten (dat kan pas na een
// herbuild+deploy vanaf de volledige monorepo, die alleen lokaal bestaat) — dit
// controleert alleen wat al is uitgerold, en dat eerlijk en zichtbaar.
const STOPWORDS = new Set(["deze","dat","dit","voor","naar","door","zoals","waar","wordt","werd","noemt","expliciet","zegt","voort","bouwen","gebruikt","letterlijk","script","bestand","merkt","nooit","bevat","staat","gaat","over","heeft","alinea"]);
function relationshipKeyword(reason, content) {
  const contentLower = content.toLowerCase();
  const words = (reason || "").toLowerCase().match(/[a-zà-ÿ][a-zà-ÿ0-9-]{5,}/g) || [];
  return words.find((w) => !STOPWORDS.has(w) && contentLower.includes(w)) || null;
}

function runStalenessCheck() {
  let entries = [], relationships = [];
  try { ({ entries } = JSON.parse(fs.readFileSync(KNOWLEDGE_INDEX_PATH, "utf8"))); } catch {}
  try { relationships = JSON.parse(fs.readFileSync(KNOWLEDGE_RELATIONSHIPS_PATH, "utf8")); } catch {}
  if (!entries.length || !relationships.length) return;
  const entryByPath = new Map(entries.map((e) => [e.path, e]));

  let state = { rotationIndex: 0 };
  try { state = JSON.parse(fs.readFileSync(KNOWLEDGE_STALENESS_PATH, "utf8")); } catch {}

  const sliceSize = Math.max(1, Math.round(relationships.length * 0.05));
  const start = state.rotationIndex % relationships.length;
  const slice = [];
  for (let i = 0; i < sliceSize; i++) slice.push(relationships[(start + i) % relationships.length]);

  const flagged = [];
  for (const rel of slice) {
    const fromEntry = entryByPath.get(rel.from);
    const toEntry = entryByPath.get(rel.to);
    if (!fromEntry || !toEntry) { flagged.push({ from: rel.from, to: rel.to, reason: "document niet meer gevonden (verplaatst of verwijderd?)" }); continue; }
    const keyword = relationshipKeyword(rel.reason, fromEntry.content);
    if (!keyword) flagged.push({ from: rel.from, to: rel.to, reason: "kernterm uit de relatie-omschrijving niet meer teruggevonden in het brondocument" });
  }

  const next = {
    lastRunAt: new Date().toISOString(),
    rotationIndex: (start + sliceSize) % relationships.length,
    checkedCount: slice.length,
    totalEdges: relationships.length,
    flagged,
  };
  fs.writeFileSync(KNOWLEDGE_STALENESS_PATH, JSON.stringify(next));
  console.log(`Kennisbank staleness-check: ${slice.length}/${relationships.length} relaties gecontroleerd, ${flagged.length} gemarkeerd.`);
}

// ── Nachtelijke systeemcontrole met een mail ─────────────────────────────────────────────
//
// De drie onderdelen bestonden al los van elkaar: collectHealth() doet echte controles,
// smtpSend() verstuurt mail, en er stond al een nachtelijke timer. De enige trigger voor de
// controles was een mens die inlogt als platform_admin en op een knop drukt. Gevolg: als er
// iets omviel merkte niemand het, tot een klant belde.
//
// Wanneer er wél gemaild wordt, en waarom precies zo:
//
//  - Bij een fout of waarschuwing: meteen. Dat is het hele punt.
//  - Is alles goed: alleen op maandag. Een dagelijkse "alles is prima"-mail leer je binnen
//    twee weken weg te klikken, en dan mis je juist de mail die er wél toe doet. Maar
//    helemaal nooit mailen kan ook niet, want dan weet je niet of de controle zelf nog leeft.
//    Eén rustige mail per week is het bewijs dat de wachter wakker is.
//  - Bij een storing niet elke dag opnieuw dezelfde mail: staat dezelfde storing er de
//    volgende dag nog, dan komt er niets, tot hij verandert of opgelost is. Anders wordt een
//    bekend probleem een dagelijkse ruis die de volgende storing verbergt.
const ALERT_EMAIL = process.env.ALERT_EMAIL || SMTP_FROM || process.env.BOOTSTRAP_ADMIN_EMAIL || "";
const STATUS_TEKST = { ok: "in orde", warning: "let op", error: "FOUT", not_configured: "niet gekoppeld", unknown: "onbekend" };

// De vorige uitkomst onthouden we in de database, niet in een bestand naast de broncode.
// Eerste poging deed dat wél, en die faalde bij het testen met EROFS omdat die map niet
// schrijfbaar hoefde te zijn. Erger dan de fout zelf was de volgorde: het opslaan gebeurde
// vóór het versturen, dus een mislukte schrijfactie hield de waarschuwing tegen. Een wachter
// die zwijgt omdat hij zijn eigen aantekening niet kwijt kan is geen wachter.
async function leesSysteemStaat(sleutel) {
  try {
    const r = await pool.query("SELECT value FROM system_state WHERE key = $1", [sleutel]);
    return r.rows[0]?.value || {};
  } catch (err) {
    console.error("Kon de vorige systeemcheck niet lezen:", err?.message || err);
    return {};
  }
}
async function schrijfSysteemStaat(sleutel, waarde) {
  try {
    await pool.query(
      "INSERT INTO system_state (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()",
      [sleutel, JSON.stringify(waarde)],
    );
  } catch (err) {
    // Bewust alleen loggen. Mislukt dit, dan krijg je hooguit morgen dezelfde mail nog eens.
    console.error("Kon de systeemcheck-staat niet opslaan:", err?.message || err);
  }
}

function healthVingerafdruk(rapport) {
  // Alleen de statussen, niet de details. Zo telt "certificaat verloopt over 20 dagen" morgen
  // als dezelfde storing als "over 19 dagen", en krijg je daar niet elke dag een mail over.
  const perKlant = rapport.tenants
    .map((t) => `${t.slug}:${Object.entries(t.checks).map(([k, c]) => `${k}=${c.status}`).join(",")}`);
  const platform = (rapport.platform || []).map((c) => `${c.naam}=${c.status}`);
  return [...perKlant, ...platform].join("|");
}

async function runHealthMail() {
  if (!SMTP_ENABLED || !ALERT_EMAIL) {
    console.log("Systeemcheck: geen SMTP of geen ALERT_EMAIL, dus geen mail. Controle overgeslagen.");
    return;
  }
  const rapport = await collectHealth();
  const problemen = rapport.summary.error + rapport.summary.warning;
  const vinger = healthVingerafdruk(rapport);

  const vorige = await leesSysteemStaat("systeemcheck");
  const isMaandag = new Date().getDay() === 1;
  const veranderd = vorige.vingerafdruk !== vinger;
  const moetMailen = problemen > 0 ? veranderd : (veranderd || isMaandag);

  if (!moetMailen) {
    console.log(`Systeemcheck: ${problemen} probleem(en), ongewijzigd sinds de vorige keer, dus geen mail.`);
    await schrijfSysteemStaat("systeemcheck", { vingerafdruk: vinger, gemaildOp: vorige.gemaildOp || null });
    return;
  }

  const regels = [];
  for (const c of rapport.platform || []) {
    regels.push(`  ${c.status === "ok" ? "  " : "> "}${c.naam}: ${STATUS_TEKST[c.status] || c.status}${c.detail ? ` (${c.detail})` : ""}`);
  }
  if ((rapport.platform || []).length) regels.push("");
  for (const t of rapport.tenants) {
    for (const [kanaal, check] of Object.entries(t.checks)) {
      regels.push(`  ${check.status === "ok" ? "  " : "> "}${t.name} / ${kanaal}: ${STATUS_TEKST[check.status] || check.status}${check.detail ? ` (${check.detail})` : ""}`);
    }
    if (t.lastEventDays !== null && t.lastEventDays >= 7) {
      regels.push(`  > ${t.name}: al ${t.lastEventDays} dagen geen enkele gebeurtenis binnengekomen.`);
    }
  }

  const onderwerp = problemen > 0
    ? `Belvanger systeemcheck: ${rapport.summary.error} fout, ${rapport.summary.warning} waarschuwing`
    : "Belvanger systeemcheck: alles in orde";
  const tekst = [
    problemen > 0
      ? "Er is iets dat aandacht nodig heeft."
      : "Alles staat groen. Deze mail komt eens per week zodat je weet dat de controle zelf nog draait.",
    "",
    ...regels,
    "",
    `Samenvatting: ${rapport.summary.ok} in orde, ${rapport.summary.warning} waarschuwing, ${rapport.summary.error} fout, ${rapport.summary.notConfigured} niet gekoppeld, ${rapport.summary.unknown} onbekend.`,
    `Gecontroleerd op ${new Date(rapport.checkedAt).toLocaleString("nl-NL")}.`,
    "",
    "Bekijk het volledige overzicht in het dashboard onder Systeemcheck.",
  ].join("\n");

  await smtpSend({
    host: SMTP_HOST, port: SMTP_PORT, user: SMTP_USER, pass: SMTP_PASS, from: SMTP_FROM,
    to: ALERT_EMAIL, subject: onderwerp, text: tekst,
  });
  console.log(`Systeemcheck gemaild naar ${ALERT_EMAIL}: ${onderwerp}`);
  // Pas ONTHOUDEN als de mail echt weg is. Faalt het versturen, dan blijft de vorige staat
  // staan en probeert de volgende ronde het opnieuw, in plaats van te denken dat je al
  // gewaarschuwd bent.
  await schrijfSysteemStaat("systeemcheck", { vingerafdruk: vinger, gemaildOp: new Date().toISOString() });
}

function scheduleNightlyHealthMail() {
  // 07:00 en niet 03:00: een melding die om drie uur 's nachts binnenkomt ligt 's ochtends
  // onder de rest, en dit is bedoeld om gelezen te worden.
  const volgende = () => {
    const nu = new Date();
    const straks = new Date(nu);
    straks.setHours(7, 0, 0, 0);
    if (straks <= nu) straks.setDate(straks.getDate() + 1);
    setTimeout(async () => {
      try { await runHealthMail(); } catch (err) { console.error("Systeemcheck mislukt:", err); }
      volgende();
    }, straks.getTime() - nu.getTime());
  };
  volgende();
  // Eén controle kort na het opstarten, zodat een deploy die iets sloopt binnen vijf minuten
  // zichtbaar is in plaats van pas de volgende ochtend. Mailt alleen als er ECHT iets anders
  // is dan de vorige keer, dus een herstart geeft geen mail.
  setTimeout(() => { runHealthMail().catch((err) => console.error("Systeemcheck bij opstarten mislukt:", err)); }, 5 * 60 * 1000);
}

function scheduleNightlyStalenessCheck() {
  // Eerste run kort na opstarten, zodat er meteen een signaal is i.p.v. leeg tot 03:00.
  setTimeout(() => { try { runStalenessCheck(); } catch (err) { console.error("Staleness-check mislukt:", err); } }, 2 * 60 * 1000);
  const scheduleNext = () => {
    const now = new Date();
    const next = new Date(now);
    next.setHours(3, 0, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    setTimeout(() => {
      try { runStalenessCheck(); } catch (err) { console.error("Staleness-check mislukt:", err); }
      scheduleNext();
    }, next.getTime() - now.getTime());
  };
  scheduleNext();
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

  // Leeg veld = terug naar de indicatieve default (DEFAULT_AVG_JOB_VALUE), niet 0.
  let avgJobValue = null;
  const rawAvgJobValue = String(body.avgJobValue ?? "").trim();
  if (rawAvgJobValue !== "") {
    const parsed = Number(rawAvgJobValue);
    if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 100000) {
      return json(res, 400, { error: "Gemiddelde klus-waarde moet een bedrag tussen €1 en €100.000 zijn." });
    }
    avgJobValue = Math.round(parsed);
  }

  const result = await pool.query(
    "UPDATE tenants SET website_domain = $1, avg_job_value = $2, updated_at = NOW() WHERE id = $3 RETURNING id",
    [domain, avgJobValue, tenantId]
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

// Het certificaat is de stilste storing die er is. Let's Encrypt verlengt op 60 dagen; faalt
// dat, dan blijft alles 30 dagen lang gewoon werken en krijgt daarna ELKE bezoeker een
// volledige browserwaarschuwing. checkWebsite hierboven merkt het pas als het al te laat is.
// Deze controle kijkt vooruit.
async function checkCertificate(domain) {
  if (!domain) return { status: "not_configured", detail: "" };
  return new Promise((klaar) => {
    let afgehandeld = false;
    const af = (uitkomst) => { if (!afgehandeld) { afgehandeld = true; klaar(uitkomst); } };
    // rejectUnauthorized: false is hier juist de bedoeling. Met de standaardinstelling weigert
    // Node de verbinding zodra het certificaat ongeldig is, en dan krijg je "kon niet ophalen"
    // terwijl het antwoord "verlopen sinds vorige week" is. Precies het geval waarvoor deze
    // controle bestaat, zou dus de vaagste melding geven. We versturen hier niets, we lezen
    // alleen het certificaat en beoordelen de geldigheid zelf.
    const socket = tls.connect({ host: domain, port: 443, servername: domain, rejectUnauthorized: false }, () => {
      const cert = socket.getPeerCertificate();
      socket.end();
      if (!cert || !cert.valid_to) return af({ status: "unknown", detail: "Geen certificaat gelezen." });
      const dagen = Math.floor((new Date(cert.valid_to).getTime() - Date.now()) / 86_400_000);
      if (dagen < 0) return af({ status: "error", detail: `Certificaat is ${-dagen} dagen VERLOPEN.` });
      if (dagen <= 21) return af({ status: "warning", detail: `Certificaat verloopt over ${dagen} dagen en is nog niet verlengd.` });
      af({ status: "ok", detail: `Certificaat nog ${dagen} dagen geldig.` });
    });
    socket.setTimeout(HEALTH_TIMEOUT_MS, () => { socket.destroy(); af({ status: "error", detail: "Certificaatcontrole liep in een timeout." }); });
    socket.on("error", () => af({ status: "error", detail: "Kon het certificaat niet ophalen." }));
  });
}

// Controleert of de back-upketen nog loopt. Twee schakels, en ze kunnen los van elkaar breken:
// de VPS maakt elke nacht een pakket klaar, en de PC van de founder haalt dat op. Valt schakel
// twee weg, bijvoorbeeld omdat die PC een tijd uit staat, dan staat alles nog steeds op één
// machine en is er feitelijk geen back-up meer. Dat is precies het soort verval dat je niet
// merkt, want er gaat niets kapot; er gebeurt alleen niets meer.
async function checkBackups() {
  // Let op de tweede helft van deze regel. Een tijdstip dat NIET te lezen is levert NaN op, en
  // elke vergelijking met NaN is false. Zonder deze controle viel zo'n waarde door alle drempels
  // heen en kwam hij onderaan als "in orde" uit de bus. Bij het naspelen van een storing meldde
  // de check letterlijk "alles in orde" terwijl de kopie twintig dagen oud was. Een melder die
  // bij twijfel groen zegt is gevaarlijker dan geen melder, want je vertrouwt hem.
  const uren = (waarde) => {
    if (!waarde?.op) return null;
    const ms = new Date(waarde.op).getTime();
    return Number.isFinite(ms) ? (Date.now() - ms) / 3_600_000 : NaN;
  };
  const onleesbaar = (u) => Number.isNaN(u);

  const vps = await leesSysteemStaat("backup-vps");
  const kopie = await leesSysteemStaat("backup-kopie");
  const vpsUren = uren(vps);
  const kopieUren = uren(kopie);

  const checks = [];
  if (vpsUren === null) {
    checks.push({ naam: "Back-up op de server", status: "error", detail: "Er is nog nooit een pakket gemaakt. Draait de nachtelijke taak wel?" });
  } else if (onleesbaar(vpsUren)) {
    checks.push({ naam: "Back-up op de server", status: "error", detail: `Het tijdstip van de laatste back-up is onleesbaar (${vps.op}). Behandeld als storing.` });
  } else if (vps.status !== "ok") {
    checks.push({ naam: "Back-up op de server", status: "error", detail: `De laatste poging is MISLUKT. ${vps.detail || ""}`.trim() });
  } else if (vpsUren > 36) {
    checks.push({ naam: "Back-up op de server", status: "error", detail: `Laatste pakket is ${Math.round(vpsUren / 24)} dagen oud. De nachtelijke taak draait niet meer.` });
  } else {
    const mb = vps.bytes ? ` (${Math.round(vps.bytes / 1_048_576)} MB)` : "";
    checks.push({ naam: "Back-up op de server", status: "ok", detail: `Vannacht gemaakt${mb}.` });
  }

  const dagen = kopieUren === null ? null : Math.floor(kopieUren / 24);
  if (kopieUren === null) {
    checks.push({ naam: "Kopie van de server af", status: "error", detail: "Er is nog nooit een pakket opgehaald. Alles staat dus op één machine." });
  } else if (onleesbaar(kopieUren)) {
    checks.push({ naam: "Kopie van de server af", status: "error", detail: `Het tijdstip van de laatste kopie is onleesbaar (${kopie.op}). Behandeld als storing.` });
  } else if (dagen >= 14) {
    checks.push({ naam: "Kopie van de server af", status: "error", detail: `Al ${dagen} dagen geen kopie opgehaald. Staat de PC aan en draait de geplande taak?` });
  } else if (dagen >= 7) {
    checks.push({ naam: "Kopie van de server af", status: "warning", detail: `Laatste kopie is ${dagen} dagen geleden opgehaald.` });
  } else {
    checks.push({ naam: "Kopie van de server af", status: "ok", detail: `${dagen === 0 ? "Vandaag" : `${dagen} dag(en) geleden`} opgehaald naar ${kopie.machine || "je PC"}.` });
  }

  const test = await leesSysteemStaat("backup-hersteltest");
  const testUren = uren(test);
  const testDagen = testUren === null || onleesbaar(testUren) ? null : Math.floor(testUren / 24);
  if (testUren !== null && onleesbaar(testUren)) {
    checks.push({ naam: "Hersteltest", status: "error", detail: `Het tijdstip van de laatste hersteltest is onleesbaar (${test.op}).` });
  } else if (testDagen === null) {
    checks.push({ naam: "Hersteltest", status: "warning", detail: "Nog nooit uitgevoerd. Een ongeteste back-up is een aanname." });
  } else if (test.status !== "ok") {
    checks.push({ naam: "Hersteltest", status: "error", detail: `De laatste hersteltest is MISLUKT. ${test.detail || ""}`.trim() });
  } else if (testDagen > 45) {
    checks.push({ naam: "Hersteltest", status: "warning", detail: `Laatste geslaagde test was ${testDagen} dagen geleden.` });
  } else {
    checks.push({ naam: "Hersteltest", status: "ok", detail: `${testDagen} dagen geleden geslaagd. ${test.detail || ""}`.trim() });
  }

  return checks;
}

async function runHealthcheck(res, user) {
  if (!requirePlatformAdmin(res, user)) return;
  json(res, 200, await collectHealth());
}

// De controles zelf, losgekoppeld van de HTTP-route. Dat is de hele truc waardoor de
// nachtelijke taak hieronder dezelfde controles kan draaien als de knop in het dashboard:
// één set controles, twee manieren om hem aan te roepen, dus ze kunnen niet uit elkaar lopen.
async function collectHealth() {
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
    const [twilioNumber, twilioFlow, site, cert, websiteFlow, emailFlow] = await Promise.all([
      checkTwilioNumber(twilioInfo.externalIdentifier, twilioInfo.twilioAccountSid),
      checkN8nWorkflow(twilioInfo.n8nWorkflowId),
      checkWebsite(tenant.websiteDomain),
      checkCertificate(tenant.websiteDomain),
      checkN8nWorkflow(websiteInfo.n8nWorkflowId),
      checkN8nWorkflow(emailInfo.n8nWorkflowId),
    ]);
    return {
      tenantId: tenant.id, slug: tenant.slug, name: tenant.name,
      checks: {
        twilio: combineChecks([twilioNumber, twilioFlow]),
        website: combineChecks([site, cert, websiteFlow]),
        email: emailFlow,
      },
      lastEventDays: staleDays(twilioInfo.lastEventAt),
    };
  }));

  // Naast de controles per klant staan er platformbrede controles: de back-upketen. Die hoort
  // bij niemand in het bijzonder en zou zonder deze regel nergens terechtkomen.
  const platform = await checkBackups();
  const flat = [...results.flatMap((row) => Object.values(row.checks)), ...platform];
  const summary = {
    ok: flat.filter((c) => c.status === "ok").length,
    warning: flat.filter((c) => c.status === "warning").length,
    error: flat.filter((c) => c.status === "error").length,
    notConfigured: flat.filter((c) => c.status === "not_configured").length,
    unknown: flat.filter((c) => c.status === "unknown").length,
  };
  return { checkedAt: new Date().toISOString(), summary, platform, tenants: results };
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
  let s = String(value == null ? "" : value);
  // Excel voert een cel die begint met = + - of @ uit ALS FORMULE. De namen en berichten in
  // deze export komen uit het openbare contactformulier van de klant, dus een vreemde kan
  // daar =HYPERLINK(...) invullen en dat draait dan op de computer van de klant zodra hij
  // zijn eigen export opent. Een voorloopquote maakt er tekst van; Excel toont hem niet.
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return `"${s.replace(/"/g, '""')}"`;
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

// --- Hulp: supportverzoek van een klant, per e-mail naar info@belvanger.nl ---
// Minimale SMTP-client over impliciete TLS (poort 465), zonder dependencies.
// Één-op-één geport uit product/chatbot/server.js (bewezen werkend voor het
// bestaande leadformulier), met een optionele Reply-To voor het supportverzoek.
function smtpSend({ host, port, user, pass, from, to, replyTo, subject, text, html }) {
  return new Promise((resolve, reject) => {
    const socket = tls.connect({ host, port, servername: host });
    socket.setEncoding("utf8");
    socket.setTimeout(20000, () => { socket.destroy(); reject(new Error("smtp timeout")); });
    let buf = "";
    let waiting = null;
    function pump() {
      if (!waiting) return;
      const m = buf.match(/^(\d{3}) [^\n]*\n/m);
      if (m) {
        buf = buf.slice(buf.indexOf(m[0]) + m[0].length);
        const w = waiting; waiting = null; w(m[1]);
      }
    }
    socket.on("data", (d) => { buf += d; pump(); });
    socket.on("error", reject);
    const read = () => new Promise((r) => { waiting = r; pump(); });
    const send = (line) => socket.write(line + "\r\n");
    (async () => {
      try {
        let c = await read(); if (c[0] !== "2") throw new Error("greeting " + c);
        send("EHLO belvanger.nl"); c = await read(); if (c[0] !== "2") throw new Error("EHLO " + c);
        send("AUTH LOGIN"); c = await read(); if (c !== "334") throw new Error("AUTH " + c);
        send(Buffer.from(user).toString("base64")); c = await read(); if (c !== "334") throw new Error("user " + c);
        send(Buffer.from(pass).toString("base64")); c = await read(); if (c !== "235") throw new Error("auth " + c);
        send("MAIL FROM:<" + from + ">"); c = await read(); if (c[0] !== "2") throw new Error("MAIL " + c);
        send("RCPT TO:<" + to + ">"); c = await read(); if (c[0] !== "2") throw new Error("RCPT " + c);
        send("DATA"); c = await read(); if (c !== "354") throw new Error("DATA " + c);
        const dot = (s) => String(s).replace(/\r?\n/g, "\r\n").replace(/\r\n\./g, "\r\n..");
        const base = [
          "From: Belvanger <" + from + ">",
          "To: <" + to + ">",
          ...(replyTo ? ["Reply-To: <" + replyTo + ">"] : []),
          "Subject: " + subject,
          "MIME-Version: 1.0",
          "Date: " + new Date().toUTCString(),
        ];
        let mime;
        if (html) {
          const bnd = "bv_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
          const plain = text || String(html).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
          mime = base.concat(['Content-Type: multipart/alternative; boundary="' + bnd + '"']).join("\r\n")
            + "\r\n\r\n--" + bnd + "\r\n"
            + 'Content-Type: text/plain; charset="utf-8"\r\nContent-Transfer-Encoding: 8bit\r\n\r\n' + dot(plain) + "\r\n"
            + "--" + bnd + "\r\n"
            + 'Content-Type: text/html; charset="utf-8"\r\nContent-Transfer-Encoding: 8bit\r\n\r\n' + dot(html) + "\r\n"
            + "--" + bnd + "--\r\n";
        } else {
          mime = base.concat(['Content-Type: text/plain; charset="utf-8"', "Content-Transfer-Encoding: 8bit"]).join("\r\n")
            + "\r\n\r\n" + dot(text);
        }
        socket.write(mime + "\r\n.\r\n");
        c = await read(); if (c[0] !== "2") throw new Error("send " + c);
        send("QUIT"); socket.end(); resolve(true);
      } catch (e) { try { socket.destroy(); } catch {} reject(e); }
    })();
  });
}

function escHtml(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

function cleanMultiline(value, max = 4000) {
  const normalized = String(value || "").split("\r\n").join("\n");
  return normalized.replace(/[\u0000-\u0009\u000b\u000c\u000e-\u001f\u007f]+/g, " ").slice(0, max).trim();
}
function emailShell(inner, tagline, disclaimer) {
  const font = "-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
  return `<!doctype html><html><body style="margin:0;background:#FAF9F6;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAF9F6;"><tr><td align="center" style="padding:28px 16px;">
  <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="width:520px;max-width:100%;background:#ffffff;border:1px solid #e4e1d8;border-radius:16px;overflow:hidden;">
    <tr><td style="background:#16232E;padding:22px 28px;font-family:${font};">
      <span style="color:#FAF9F6;font-size:20px;font-weight:800;letter-spacing:.3px;">Belvanger<span style="color:#E6480C;">.</span></span>
    </td></tr>
    <tr><td style="padding:28px;color:#16232E;font-family:${font};font-size:16px;line-height:1.6;">${inner}</td></tr>
    <tr><td style="padding:18px 28px;border-top:1px solid #e4e1d8;color:#5a6470;font-size:13px;font-family:${font};line-height:1.5;">
      ${escHtml(tagline)}<br>
      <a href="https://belvanger.nl" style="color:#E6480C;text-decoration:none;">belvanger.nl</a> &middot; <a href="mailto:info@belvanger.nl" style="color:#E6480C;text-decoration:none;">info@belvanger.nl</a>
    </td></tr>
  </table>
  <p style="color:#9aa2a9;font-size:12px;margin:16px 0 0;font-family:${font};">${escHtml(disclaimer)}</p>
</td></tr></table>
</body></html>`;
}

function supportAutoreply(naam) {
  const first = escHtml(String(naam || "").trim().split(/\s+/)[0] || "daar");
  return {
    subject: "We hebben je bericht ontvangen",
    text: `Bedankt voor je bericht, ${first}!\n\nWe hebben 'm goed ontvangen en nemen zo snel mogelijk contact met je op.\n\nGroeten,\nTeam Belvanger\n\nbelvanger.nl | info@belvanger.nl`,
    html: emailShell(
      `<p style="margin:0 0 14px;font-size:18px;font-weight:700;">Bedankt voor je bericht, ${first}!</p>
       <p style="margin:0 0 14px;">We hebben 'm goed ontvangen en nemen zo snel mogelijk contact met je op.</p>
       <p style="margin:22px 0 0;">Groeten,<br><strong>Team Belvanger</strong></p>`,
      "We reageren doorgaans binnen één werkdag.",
      "Je ontvangt deze mail omdat je een vraag stelde via je Belvanger-dashboard."),
  };
}

async function submitSupportRequest(req, res, user) {
  if (!SUPPORT_ENABLED) return json(res, 501, { error: "Het hulpformulier is nog niet geconfigureerd." });
  const attempt = supportAttempts.get(user.id) || { count: 0, reset: Date.now() + 60 * 60_000 };
  if (Date.now() > attempt.reset) Object.assign(attempt, { count: 0, reset: Date.now() + 60 * 60_000 });
  if (attempt.count >= 5) return json(res, 429, { error: "Te veel berichten. Probeer het over een uur opnieuw." });

  const body = await readBody(req);
  const subject = cleanText(body.subject, 150);
  const message = cleanMultiline(body.message, 4000);
  if (!subject || !message) return json(res, 400, { error: "Onderwerp en bericht zijn verplicht." });

  attempt.count += 1;
  supportAttempts.set(user.id, attempt);

  const text = [
    `Nieuw supportverzoek via het dashboard (${user.tenant_name})`, "",
    `Klant:     ${user.tenant_name}`,
    `Naam:      ${user.display_name}`,
    `E-mail:    ${user.email}`,
    `Onderwerp: ${subject}`, "",
    "Bericht:",
    message, "",
    `Tijd:      ${new Date().toISOString()}`,
  ].join("\n");
  try {
    await smtpSend({
      host: SMTP_HOST, port: SMTP_PORT, user: SMTP_USER, pass: SMTP_PASS, from: SMTP_FROM,
      to: SUPPORT_TO, replyTo: user.email, subject: `Supportverzoek van ${user.tenant_name}: ${subject}`, text,
    });
  } catch (error) {
    console.error("support e-mail mislukt:", error?.message || error);
    return json(res, 502, { error: "Versturen is mislukt. Probeer het later opnieuw of stuur direct een WhatsApp." });
  }
  try {
    const ar = supportAutoreply(user.display_name);
    await smtpSend({ host: SMTP_HOST, port: SMTP_PORT, user: SMTP_USER, pass: SMTP_PASS, from: SMTP_FROM, to: user.email, subject: ar.subject, text: ar.text, html: ar.html });
  } catch (error) { console.error("support-autoreply mislukt:", error?.message || error); }
  json(res, 200, { ok: true });
}

// --- Web Push ---------------------------------------------------------------
//
// Waarom naast de e-mailmelding en niet in plaats daarvan: e-mail is traag en wordt
// door een vakman op een ladder niet gelezen, push trilt binnen seconden. Maar push
// heeft géén afleverbewijs in het protocol (RFC 8030 belooft alleen dat de
// push-dienst het bericht heeft aangenomen), en OEM-batterijbeheer op goedkope
// Android-toestellen sloopt bezorging stil. Daarom blijft e-mail voorlopig staan als
// vangnet en houden we per toestel bij of het nog werkt.
//
// De volgende stap hierin is een echt escalatie-grootboek (push, en zonder ACK binnen
// 30 seconden automatisch sms). Dat is BEWUST niet meegebouwd: elke terugval kost
// Twilio-geld per bericht, en dat is een beslissing over klantkosten die de founder
// zelf neemt. Zie docs/research/belvanger-android-app-adhd-onderzoek-2026-07-25.md.

/**
 * Alle toestellen van een klant die meldingen aan hebben staan. Alleen actieve
 * gebruikers: een gedeactiveerde gebruiker hoort geen leads meer te zien, ook niet
 * op een toestel waarop hij ooit push heeft aangezet.
 */
async function pushTargets(tenantId) {
  const result = await pool.query(`
    SELECT d.id, d.endpoint, d.p256dh, d.auth
    FROM push_devices d
    JOIN users u ON u.id = d.user_id
    WHERE d.tenant_id = $1 AND u.active = TRUE
  `, [tenantId]);
  return result.rows;
}

/**
 * Verstuurt één melding naar alle toestellen van een klant en verwerkt de uitkomst
 * per toestel. Gooit nooit: een mislukte melding mag de ingest-flow niet raken.
 */
async function pushToTenant(tenantId, notification) {
  if (!PUSH_ENABLED) return;
  try {
    const devices = await pushTargets(tenantId);
    if (!devices.length) return;
    const payload = JSON.stringify(notification);
    const vapid = { publicKey: VAPID_PUBLIC_KEY, privateKey: VAPID_PRIVATE_KEY, subject: VAPID_SUBJECT };
    await Promise.all(devices.map(async (device) => {
      const outcome = await sendPush(device, payload, vapid);
      if (outcome.gone) {
        // De browser heeft dit endpoint weggegooid. Rij weg, anders pushen we
        // eeuwig naar een toestel dat niet meer bestaat.
        await pool.query("DELETE FROM push_devices WHERE id = $1", [device.id]).catch(() => {});
        return;
      }
      if (outcome.ok) {
        await pool.query("UPDATE push_devices SET last_success_at = NOW(), failure_count = 0 WHERE id = $1", [device.id]).catch(() => {});
        return;
      }
      await pool.query("UPDATE push_devices SET last_failure_at = NOW(), failure_count = failure_count + 1 WHERE id = $1", [device.id]).catch(() => {});
      console.error("push mislukt:", outcome.statusCode, outcome.error || "");
    }));
  } catch (error) {
    console.error("pushToTenant mislukt:", error?.message || error);
  }
}

/**
 * Pushmelding bij een gemiste oproep.
 *
 * Over het telefoonnummer in de payload: de payload is end-to-end versleuteld
 * (RFC 8291) met sleutels die alleen het toestel van de klant heeft, dus Google ziet
 * uitsluitend ciphertext. Het nummer meesturen is daarmee verdedigbaar (eigen
 * leaddata van de klant naar het eigen toestel van de klant) én veel bruikbaarder:
 * zonder nummer moet iemand op een ladder eerst de app openen en inloggen.
 * Toch staat het standaard UIT, omdat dit een gegevensbeschermingsafweging is die de
 * founder zelf hoort te maken en niet een keuze die er stilletjes in glijdt.
 * Aanzetten: PUSH_INCLUDE_CALLER=true in .env.
 */
async function pushMissedCall(tenantId, phone, occurredAt) {
  const includeCaller = String(process.env.PUSH_INCLUDE_CALLER || "false") === "true";
  const caller = phone ? String(phone) : "";
  await pushToTenant(tenantId, {
    title: includeCaller && caller ? `Gemiste oproep: ${caller}` : "Je hebt een oproep gemist",
    body: includeCaller && caller ? "Tik om deze klant terug te bellen." : "Tik om te zien wie er belde en terug te bellen.",
    tag: `missed-call-${occurredAt.getTime()}`,
    url: "/?tab=contacten",
    // Alleen gevuld als PUSH_INCLUDE_CALLER aan staat; de service worker maakt
    // hier een "Bel terug"-knop van die direct de telefoonapp opent.
    phone: includeCaller ? caller : "",
  });
}

async function pushInboundLead(tenantId, eventType, contactId, contact, preview) {
  const includeDetails = String(process.env.PUSH_INCLUDE_CALLER || "false") === "true";
  const payload = inboundPushPayload(eventType, {
    name: contact?.name,
    phone: contact?.phone,
    preview,
  }, contactId, includeDetails);
  if (payload) await pushToTenant(tenantId, payload);
}

async function pushWebsiteLead(tenantId, occurredAt) {
  await pushToTenant(tenantId, {
    title: "Nieuwe aanvraag via je website",
    body: "Tik om de aanvraag te bekijken.",
    tag: `website-lead-${occurredAt.getTime()}`,
    url: "/?tab=contacten",
    phone: "",
  });
}

// --- Push-API voor de client ------------------------------------------------

/**
 * De client heeft de publieke VAPID-sleutel nodig om een subscription te maken.
 * Geeft ook terug hoeveel toestellen deze gebruiker al heeft aangemeld, zodat de UI
 * "meldingen staan aan" kan tonen zonder een tweede request.
 */
async function pushKey(res, user) {
  if (!PUSH_ENABLED) return json(res, 200, { enabled: false, publicKey: null, devices: 0 });
  const result = await pool.query("SELECT COUNT(*)::int AS n FROM push_devices WHERE user_id = $1", [user.id]);
  json(res, 200, { enabled: true, publicKey: VAPID_PUBLIC_KEY, devices: result.rows[0].n });
}

/**
 * Slaat een PushSubscription op. Idempotent op endpoint: de browser kan dezelfde
 * subscription opnieuw aanbieden (bijvoorbeeld na een reconcile bij het openen van de
 * app), en dan mag er geen tweede rij ontstaan. Wisselt het endpoint van gebruiker,
 * bijvoorbeeld omdat twee mensen dezelfde telefoon gebruiken, dan verhuist de rij
 * mee in plaats van dat de oude eigenaar meldingen blijft krijgen.
 */
async function subscribePush(req, res, user) {
  if (!PUSH_ENABLED) return json(res, 503, { error: "Meldingen zijn op deze server niet geconfigureerd." });
  const body = await readBody(req);
  const endpoint = cleanText(body.endpoint, 800);
  const p256dh = cleanText(body.p256dh, 200);
  const auth = cleanText(body.auth, 100);
  if (!endpoint || !p256dh || !auth) return json(res, 400, { error: "endpoint, p256dh en auth zijn verplicht." });
  if (!/^https:\/\//i.test(endpoint)) return json(res, 400, { error: "endpoint moet https zijn." });
  // Vorm valideren vóór opslag: een subscription met verkeerde sleutellengtes levert
  // anders pas maanden later een onverklaarbaar mislukte melding op.
  if (Buffer.from(p256dh, "base64url").length !== 65) return json(res, 400, { error: "p256dh heeft de verkeerde lengte." });
  if (Buffer.from(auth, "base64url").length !== 16) return json(res, 400, { error: "auth heeft de verkeerde lengte." });

  await pool.query(`
    INSERT INTO push_devices (tenant_id, user_id, endpoint, p256dh, auth)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (endpoint) DO UPDATE
      SET tenant_id = EXCLUDED.tenant_id,
          user_id = EXCLUDED.user_id,
          p256dh = EXCLUDED.p256dh,
          auth = EXCLUDED.auth,
          failure_count = 0,
          last_failure_at = NULL
  `, [user.tenant_id, user.id, endpoint, p256dh, auth]);
  json(res, 201, { ok: true });
}

/**
 * Meldingen uitzetten. Zonder endpoint in de body gaan ALLE toestellen van deze
 * gebruiker eruit; dat is wat "zet meldingen uit" in de UI moet doen op een toestel
 * waarvan de subscription al kwijt is.
 */
async function unsubscribePush(req, res, user) {
  const body = await readBody(req).catch(() => ({}));
  const endpoint = cleanText(body.endpoint, 800);
  if (endpoint) await pool.query("DELETE FROM push_devices WHERE user_id = $1 AND endpoint = $2", [user.id, endpoint]);
  else await pool.query("DELETE FROM push_devices WHERE user_id = $1", [user.id]);
  json(res, 200, { ok: true });
}

/**
 * Stuurt een testmelding naar de eigen toestellen. Dit is geen luxe: het is de enige
 * manier waarop de klant (en de founder tijdens onboarding) kan vaststellen dat de
 * hele keten werkt, inclusief het batterijbeheer van dit specifieke toestel. Als de
 * test niet aankomt, komt een echte gemiste oproep ook niet aan.
 */
async function pushTest(res, user) {
  if (!PUSH_ENABLED) return json(res, 503, { error: "Meldingen zijn op deze server niet geconfigureerd." });
  const devices = await pushTargets(user.tenant_id);
  if (!devices.length) return json(res, 400, { error: "Er staan nog geen toestellen aangemeld voor meldingen." });
  await pushToTenant(user.tenant_id, {
    title: "Testmelding van Belvanger",
    body: "Als je dit ziet, werken je meldingen. Zo snel krijg je ook een gemiste oproep binnen.",
    tag: `test-${Date.now()}`,
    url: "/",
    phone: "",
  });
  json(res, 200, { ok: true, devices: devices.length });
}

// --- Realtime melding bij een gemiste oproep, per e-mail naar alle actieve
// gebruikers van de klant. Hergebruikt dezelfde SMTP-koppeling als Hulp. Wordt
// bewust niet afgewacht door de aanroeper (ingest moet snel blijven reageren voor
// n8n/Twilio); mislukken van de melding mag de eventopslag nooit raken.
async function notifyMissedCall(tenantId, phone, occurredAt) {
  if (!SMTP_ENABLED) return;
  try {
    const recipients = await pool.query("SELECT email FROM users WHERE tenant_id = $1 AND active = TRUE", [tenantId]);
    if (!recipients.rowCount) return;
    const caller = phone || "een onbekend nummer";
    const when = new Intl.DateTimeFormat("nl-NL", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Amsterdam" }).format(occurredAt);
    const text = [
      "Je hebt zojuist een oproep gemist.", "",
      `Van:  ${caller}`,
      `Tijd: ${when}`, "",
      "Bekijk 'm in je dashboard: https://dashboard.belvanger.nl/",
    ].join("\n");
    const html = emailShell(
      `<p style="margin:0 0 14px;font-size:18px;font-weight:700;">Je hebt zojuist een oproep gemist.</p>
       <p style="margin:0 0 6px;"><strong>Van:</strong> ${escHtml(caller)}</p>
       <p style="margin:0 0 14px;"><strong>Tijd:</strong> ${escHtml(when)}</p>
       <p style="margin:22px 0 0;"><a href="https://dashboard.belvanger.nl/" style="color:#E6480C;text-decoration:none;">Bekijk in je dashboard &rarr;</a></p>`,
      "Belvanger vangt je gemiste klanten automatisch op.",
      "Je ontvangt dit omdat er zojuist een oproep is gemist op je gekoppelde nummer.");
    await Promise.all(recipients.rows.map((r) =>
      smtpSend({ host: SMTP_HOST, port: SMTP_PORT, user: SMTP_USER, pass: SMTP_PASS, from: SMTP_FROM, to: r.email, subject: `Gemiste oproep: ${caller}`, text, html })
        .catch((error) => console.error("missed-call-melding mislukt naar", r.email, error?.message || error))
    ));
  } catch (error) {
    console.error("notifyMissedCall mislukt:", error?.message || error);
  }
}

// Realtime melding bij een nieuwe websiteaanvraag, per e-mail naar alle actieve
// gebruikers van de KLANT wiens website de lead binnenkreeg (tenant-gescopeerd,
// nooit naar een vast Belvanger-adres: de lead gaat over die klant, niet over ons).
async function notifyWebsiteLead(tenantId, contact, message, occurredAt) {
  if (!SMTP_ENABLED) return;
  try {
    const recipients = await pool.query("SELECT email FROM users WHERE tenant_id = $1 AND active = TRUE", [tenantId]);
    if (!recipients.rowCount) return;
    const name = cleanText(contact?.name, 160) || "Onbekend";
    const company = cleanText(contact?.company, 160) || "-";
    const phone = normalizePhone(contact?.phone) || "-";
    const email = normalizeEmail(contact?.email) || "-";
    const when = new Intl.DateTimeFormat("nl-NL", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Amsterdam" }).format(occurredAt);
    const textLines = [
      "Je hebt zojuist een nieuwe aanvraag via je website ontvangen.", "",
      `Naam:     ${name}`,
      `Bedrijf:  ${company}`,
      `Telefoon: ${phone}`,
      `E-mail:   ${email}`,
      `Tijd:     ${when}`,
    ];
    if (message) textLines.push("", "Bericht:", message);
    textLines.push("", "Bekijk in je dashboard: https://dashboard.belvanger.nl/");
    const text = textLines.join("\n");
    const html = emailShell(
      `<p style="margin:0 0 14px;font-size:18px;font-weight:700;">Je hebt zojuist een nieuwe aanvraag via je website ontvangen.</p>
       <p style="margin:0 0 4px;"><strong>Naam:</strong> ${escHtml(name)}</p>
       <p style="margin:0 0 4px;"><strong>Bedrijf:</strong> ${escHtml(company)}</p>
       <p style="margin:0 0 4px;"><strong>Telefoon:</strong> ${escHtml(phone)}</p>
       <p style="margin:0 0 14px;"><strong>E-mail:</strong> ${escHtml(email)}</p>
       ${message ? `<p style="margin:0 0 14px;"><strong>Bericht:</strong><br>${escHtml(message)}</p>` : ""}
       <p style="margin:22px 0 0;"><a href="https://dashboard.belvanger.nl/" style="color:#E6480C;text-decoration:none;">Bekijk in je dashboard &rarr;</a></p>`,
      "Belvanger vangt je nieuwe aanvragen automatisch op.",
      "Je ontvangt dit omdat er zojuist een nieuwe aanvraag via je website is binnengekomen.");
    await Promise.all(recipients.rows.map((r) =>
      smtpSend({ host: SMTP_HOST, port: SMTP_PORT, user: SMTP_USER, pass: SMTP_PASS, from: SMTP_FROM, to: r.email, subject: `Nieuwe websiteaanvraag: ${name}`, text, html })
        .catch((error) => console.error("website-lead-melding mislukt naar", r.email, error?.message || error))
    ));
  } catch (error) {
    console.error("notifyWebsiteLead mislukt:", error?.message || error);
  }
}

async function listConnections(res, user) {
  const result = await pool.query(`
    SELECT i.source, i.status, i.external_identifier, i.last_event_at,
      (SELECT COUNT(*)::int FROM events e WHERE e.tenant_id = i.tenant_id AND e.source = i.source) AS event_count
    FROM tenant_integrations i WHERE i.tenant_id = $1 ORDER BY i.source
  `, [user.tenant_id]);
  json(res, 200, { connections: result.rows });
}

// --- Zichtbaarheid: Microsoft Clarity Data Export API + link naar Google Search Console ---
// Clarity-limieten (officiële docs): max. 10 requests/dag per project, data beperkt
// tot de laatste 1-3 dagen, geen paginering. Daarom nooit automatisch pollen, alleen
// op verzoek verversen, met een minimale wachttijd tussen twee verversingen.
const CLARITY_API_URL = "https://www.clarity.ms/export-data/api/v1/project-live-insights";
const VISIBILITY_MIN_REFRESH_MS = 10 * 60 * 1000;

async function fetchClarityInsights(token) {
  const { signal, cancel } = withTimeout(HEALTH_TIMEOUT_MS);
  try {
    const response = await fetch(`${CLARITY_API_URL}?numOfDays=3`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      signal,
    });
    if (response.status === 429) return { error: "Dagelijkse limiet van Clarity bereikt (max. 10 keer per dag). Probeer het later opnieuw." };
    if (response.status === 401 || response.status === 403) return { error: "Clarity-token is ongeldig, verlopen of niet geautoriseerd." };
    if (!response.ok) return { error: `Clarity gaf HTTP ${response.status}.` };
    return { data: await response.json() };
  } catch (error) {
    return { error: error.name === "AbortError" ? "Clarity reageerde niet op tijd." : "Kon Clarity niet bereiken." };
  } finally { cancel(); }
}

async function getVisibility(res, user) {
  const result = await pool.query(`
    SELECT clarity_project_id, search_console_url, clarity_last_fetched_at, clarity_last_payload
    FROM tenant_analytics WHERE tenant_id = $1
  `, [user.tenant_id]);
  const row = result.rows[0] || {};
  json(res, 200, {
    clarityConfigured: Boolean(row.clarity_project_id),
    searchConsoleUrl: row.search_console_url || null,
    lastFetchedAt: row.clarity_last_fetched_at,
    insights: row.clarity_last_payload || null,
  });
}

async function refreshVisibility(res, user) {
  const result = await pool.query(`
    SELECT clarity_api_token, clarity_last_fetched_at FROM tenant_analytics WHERE tenant_id = $1
  `, [user.tenant_id]);
  const row = result.rows[0];
  if (!row || !row.clarity_api_token) return json(res, 400, { error: "Clarity is nog niet gekoppeld voor deze klant." });
  if (row.clarity_last_fetched_at && Date.now() - new Date(row.clarity_last_fetched_at).getTime() < VISIBILITY_MIN_REFRESH_MS) {
    return json(res, 429, { error: "Net ververst. Wacht een paar minuten voor je opnieuw ophaalt (Clarity staat max. 10 keer per dag toe)." });
  }
  const { data, error } = await fetchClarityInsights(row.clarity_api_token);
  if (error) return json(res, 502, { error });
  await pool.query(`
    UPDATE tenant_analytics SET clarity_last_payload = $1, clarity_last_fetched_at = NOW(), updated_at = NOW() WHERE tenant_id = $2
  `, [JSON.stringify(data), user.tenant_id]);
  json(res, 200, { ok: true, insights: data, lastFetchedAt: new Date().toISOString() });
}

async function updateAdminAnalytics(req, res, user, tenantId) {
  if (!requirePlatformAdmin(res, user)) return;
  const body = await readBody(req);
  const clarityProjectId = cleanText(body.clarityProjectId, 40) || null;
  const clarityApiToken = cleanText(body.clarityApiToken, 2000) || null;
  const searchConsoleUrl = cleanText(body.searchConsoleUrl, 300) || null;
  await pool.query(`
    INSERT INTO tenant_analytics (tenant_id, clarity_project_id, clarity_api_token, search_console_url, updated_at)
    VALUES ($1, $2, $3, $4, NOW())
    ON CONFLICT (tenant_id) DO UPDATE SET
      clarity_project_id = $2,
      clarity_api_token = COALESCE($3, tenant_analytics.clarity_api_token),
      search_console_url = $4,
      updated_at = NOW()
  `, [tenantId, clarityProjectId, clarityApiToken, searchConsoleUrl]);
  json(res, 200, { ok: true });
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
  // Gemiste oproepen die "opgevangen" zijn: per het n8n-workflowcontract (zie
  // n8n/README.md, workflow 1) wordt call.missed pas naar het dashboard geschreven
  // NADAT de automatische opvang-sms al is verstuurd. Elke geregistreerde
  // call.missed is dus al een opgevangen gemiste oproep — geen aparte telling nodig,
  // exact dezelfde databron/telling als de bestaande "Gemiste oproepen"-kaart.
  const missedCallsCaught = counts.rows[0].missed_calls;
  const avgJobValueIsDefault = user.avg_job_value == null;
  const avgJobValue = avgJobValueIsDefault ? DEFAULT_AVG_JOB_VALUE : Number(user.avg_job_value);
  const savingsAmount = Math.round(missedCallsCaught * avgJobValue * MISSED_CALL_RECOVERY_RATE);

  json(res, 200, {
    range,
    attention: attention.rows[0].count,
    metrics: counts.rows[0],
    channels: channels.rows,
    recent: recent.rows.map((row) => ({ ...row, label: EVENT_LABELS[row.event_type] || row.event_type })),
    contacts: contacts.rows,
    savings: {
      amount: savingsAmount,
      missedCallsCaught,
      avgJobValue,
      avgJobValueIsDefault,
      recoveryRate: MISSED_CALL_RECOVERY_RATE,
    },
  });
}

// Bewijslog: het n8n-eventcontract (zie n8n/README.md, workflow 1) schrijft
// call.missed pas naar het dashboard NADAT de automatische sms al is verstuurd,
// dus elke call.missed in de database is per definitie al "opgevangen". Deze
// lijst toont daarom simpelweg de eigen call.missed/sms.outbound-events van de
// tenant in chronologische volgorde, zodat de klant zelf ziet dat een gemiste
// oproep en de bijbehorende sms vlak na elkaar plaatsvonden. Geen expliciete
// koppeling tussen een specifieke oproep en "zijn" sms is nodig (en zonder
// gedeelde external_id ook niet betrouwbaar te maken) omdat de belofte alleen is
// dat het vangnet als geheel werkt, niet dat elk paar 1-op-1 matcht.
async function proofLog(res, user, range) {
  const interval = rangeInterval(range);
  const result = await pool.query(`
    SELECT occurred_at, event_type, status
    FROM events
    WHERE tenant_id = $1 AND event_type IN ('call.missed', 'sms.outbound') AND occurred_at >= NOW() - $2::interval
    ORDER BY occurred_at ASC
    LIMIT 100
  `, [user.tenant_id, interval]);
  json(res, 200, {
    range,
    entries: result.rows.map((row) => ({ ...row, label: EVENT_LABELS[row.event_type] || row.event_type })),
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
  const contact = await pool.query(`
    SELECT c.*, p.name AS referred_partner_name
    FROM contacts c LEFT JOIN partners p ON p.id = c.referred_partner_id
    WHERE c.id = $1 AND c.tenant_id = $2
  `, [id, user.tenant_id]);
  if (!contact.rowCount) return json(res, 404, { error: "Contact niet gevonden." });
  const events = await pool.query("SELECT * FROM events WHERE contact_id = $1 AND tenant_id = $2 ORDER BY occurred_at DESC", [id, user.tenant_id]);
  json(res, 200, { contact: contact.rows[0], events: events.rows.map((row) => ({ ...row, label: EVENT_LABELS[row.event_type] || row.event_type })) });
}

async function createContact(req, res, user) {
  const body = await readBody(req);
  const name = cleanText(body.name, 160);
  const company = cleanText(body.company, 160);
  const phone = normalizePhone(body.phone);
  const email = normalizeEmail(body.email);
  if (!phone && !email) return json(res, 400, { error: "Vul minimaal een telefoonnummer of e-mailadres in." });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // Bewust zonder eventType: iemand voegt hier zelf een contact toe vanuit het
    // dashboard. Dat is geen klant die om aandacht vraagt, dus de status blijft staan.
    const contactId = await upsertContact(client, user.tenant_id, { name, company, phone, email }, new Date());
    const dedupeKey = `dashboard:${crypto.randomUUID()}:contact.manual`;
    await client.query(`
      INSERT INTO events (tenant_id, contact_id, source, event_type, direction, preview, dedupe_key, occurred_at)
      VALUES ($1,$2,'dashboard','contact.manual','system',$3,$4,NOW())
    `, [user.tenant_id, contactId, `Handmatig toegevoegd door ${user.display_name}.`, dedupeKey]);
    await client.query("COMMIT");
    const contact = await pool.query("SELECT * FROM contacts WHERE id = $1", [contactId]);
    json(res, 201, { contact: contact.rows[0] });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function exportContactsCsv(res, user) {
  const result = await pool.query(`
    SELECT name, company, phone, email, status, to_char(last_event_at, 'YYYY-MM-DD HH24:MI') AS last_event_at, to_char(created_at, 'YYYY-MM-DD HH24:MI') AS created_at
    FROM contacts WHERE tenant_id = $1 ORDER BY last_event_at DESC
  `, [user.tenant_id]);
  const statusLabels = { new: "Nieuw", follow_up: "Opvolging nodig", contacted: "Contact gehad", closed: "Afgesloten" };
  const header = ["Naam", "Bedrijf", "Telefoon", "E-mail", "Status", "Laatste activiteit", "Aangemaakt"].map(csvEscape).join(";");
  const rows = result.rows.map((r) => [r.name, r.company, r.phone, r.email, statusLabels[r.status] || r.status, r.last_event_at, r.created_at].map(csvEscape).join(";"));
  const csv = "﻿" + [header, ...rows].join("\r\n") + "\r\n";
  res.writeHead(200, {
    ...securityHeaders("text/csv; charset=utf-8"),
    "Content-Disposition": `attachment; filename="belvanger-contacten-${new Date().toISOString().slice(0, 10)}.csv"`,
  });
  res.end(csv);
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

// Verwijdert ook de bijbehorende events (niet alleen loskoppelen): bedoeld voor
// niet-klanten (verkeerd nummer, spam) die de tijdlijn/metrics niet horen te vervuilen.
async function deleteContact(res, user, id) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM events WHERE contact_id = $1 AND tenant_id = $2", [id, user.tenant_id]);
    const result = await client.query("DELETE FROM contacts WHERE id = $1 AND tenant_id = $2", [id, user.tenant_id]);
    if (!result.rowCount) { await client.query("ROLLBACK"); return json(res, 404, { error: "Contact niet gevonden." }); }
    await client.query("COMMIT");
    json(res, 200, { ok: true });
  } catch (error) {
    await client.query("ROLLBACK"); throw error;
  } finally { client.release(); }
}

// --- Partners: het eigen netwerk van een tenant, handmatig te koppelen aan een lead die de
// tenant zelf niet kan oppakken. Bewust geen automatische matching/routing. ---
async function listPartners(res, user) {
  const result = await pool.query("SELECT * FROM partners WHERE tenant_id = $1 ORDER BY name ASC", [user.tenant_id]);
  json(res, 200, { partners: result.rows });
}

async function createPartner(req, res, user) {
  const body = await readBody(req);
  const name = cleanText(body.name, 160);
  if (!name) return json(res, 400, { error: "Vul een naam in." });
  const phone = normalizePhone(body.phone);
  const email = normalizeEmail(body.email);
  const note = cleanText(body.note, 300);
  const result = await pool.query(
    "INSERT INTO partners (tenant_id, name, phone, email, note) VALUES ($1,$2,$3,$4,$5) RETURNING *",
    [user.tenant_id, name, phone, email, note]
  );
  json(res, 200, { partner: result.rows[0] });
}

async function deletePartner(res, user, id) {
  const result = await pool.query("DELETE FROM partners WHERE id = $1 AND tenant_id = $2", [id, user.tenant_id]);
  if (!result.rowCount) return json(res, 404, { error: "Partner niet gevonden." });
  json(res, 200, { ok: true });
}

// Doorzetten: alleen een zichtbaar, tijdgestempeld dashboardrecord (wie, wanneer, naar welke
// partner). Stuurt bewust nog niets automatisch naar de partner of de beller — dat vraagt om
// een aparte beslissing over toestemming/notificatie, nog niet gemaakt.
async function referContact(req, res, user, id) {
  const body = await readBody(req);
  const partnerId = Number(body.partner_id);
  if (!Number.isInteger(partnerId)) return json(res, 400, { error: "Kies een partner." });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const partner = await client.query("SELECT * FROM partners WHERE id = $1 AND tenant_id = $2", [partnerId, user.tenant_id]);
    if (!partner.rowCount) { await client.query("ROLLBACK"); return json(res, 404, { error: "Partner niet gevonden." }); }
    const contact = await client.query(
      "UPDATE contacts SET referred_partner_id = $1, referred_at = NOW(), updated_at = NOW() WHERE id = $2 AND tenant_id = $3 RETURNING *",
      [partnerId, id, user.tenant_id]
    );
    if (!contact.rowCount) { await client.query("ROLLBACK"); return json(res, 404, { error: "Contact niet gevonden." }); }
    const dedupeKey = `dashboard:${crypto.randomUUID()}:contact.referred`;
    await client.query(`
      INSERT INTO events (tenant_id, contact_id, source, event_type, direction, preview, dedupe_key, occurred_at)
      VALUES ($1,$2,'dashboard','contact.referred','system',$3,$4,NOW())
    `, [user.tenant_id, id, `Doorgestuurd naar partner: ${partner.rows[0].name}`, dedupeKey]);
    await client.query("COMMIT");
    json(res, 200, { contact: contact.rows[0], partner: partner.rows[0] });
  } catch (error) {
    await client.query("ROLLBACK"); throw error;
  } finally { client.release(); }
}

function serveStatic(req, res, pathname) {
  const requested = pathname === "/" ? "index.html" : pathname.replace(/^\//, "");
  const target = path.resolve(PUBLIC_DIR, requested);
  if (!target.startsWith(PUBLIC_DIR) || !fs.existsSync(target)) return false;
  const stat = fs.statSync(target);
  if (stat.isDirectory()) return false;
  const ext = path.extname(target);
  // .webmanifest en .png staan hier niet voor de sier: zonder die twee gaan het
  // manifest en de iconen als application/octet-stream de deur uit, en omdat we
  // X-Content-Type-Options: nosniff zetten weigert Chrome ze dan allebei. Gevolg
  // zou zijn dat de PWA stil niet installeerbaar is, zonder foutmelding.
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
  // De service worker mag NOOIT een uur gecached worden: dan blijft een oude sw.js
  // met een oude cachelijst rondhangen en zien klanten een verouderd dashboard.
  const isServiceWorker = requested === "sw.js";
  const cacheControl = isServiceWorker || ext === ".html" ? "no-cache" : "public, max-age=3600";
  const extra = isServiceWorker ? { "Service-Worker-Allowed": "/" } : {};
  res.writeHead(200, {
    ...securityHeaders(types[ext] || "application/octet-stream"),
    "Cache-Control": cacheControl,
    "Content-Length": stat.size,
    ...extra,
  });
  // HEAD krijgt dezelfde headers maar geen body. Zonder dit viel elk HEAD-verzoek door
  // naar de 404-handler, dus ook HEAD op "/", en dat laat iedere uptime-monitor (die
  // standaard HEAD gebruikt) melden dat de hele site down is.
  if (req.method === "HEAD") { res.end(); return true; }
  fs.createReadStream(target).pipe(res);
  return true;
}

// Digital Asset Links: hiermee bewijst dashboard.belvanger.nl dat de Android-app met
// deze signing-fingerprint bij dit domein hoort. Zonder dit valt de Trusted Web
// Activity terug op een gewone Chrome-tab MET adresbalk, en dat is precies wat Google
// Play onder "minimum functionality" als webview-wrapper afkeurt.
//
// Dynamisch in plaats van een bestand in public/: de fingerprint is pas bekend nadat
// de keystore bestaat, en hij hoort bij de omgeving (upload key vs. Play App Signing),
// niet bij de broncode. Ontbreekt de env-var, dan geven we 404 in plaats van een
// leeg-maar-geldig bestand: een half assetlinks-bestand is moeilijker te debuggen
// dan een ontbrekend bestand.
function serveAssetLinks(res) {
  if (!TWA_PACKAGE_NAME || !TWA_SHA256_FINGERPRINTS.length) {
    return json(res, 404, { error: "Digital Asset Links is niet geconfigureerd." });
  }
  const body = JSON.stringify([{
    relation: ["delegate_permission/common.handle_all_urls"],
    target: {
      namespace: "android_app",
      package_name: TWA_PACKAGE_NAME,
      sha256_cert_fingerprints: TWA_SHA256_FINGERPRINTS,
    },
  }], null, 2);
  // Publiek en cachebaar: Android's verifier haalt dit op zonder cookies, en het
  // verandert alleen als er een sleutel bij komt.
  res.writeHead(200, {
    ...securityHeaders("application/json; charset=utf-8"),
    "Cache-Control": "public, max-age=300",
  });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  try {
    if (req.method === "GET" && url.pathname === "/healthz") {
      await pool.query("SELECT 1"); return json(res, 200, { ok: true });
    }
    // Publiek en zonder sessie: Android's Digital Asset Links-verifier haalt dit op
    // zonder cookies, en Chrome doet dat bij het openen van de Trusted Web Activity.
    if (req.method === "GET" && url.pathname === "/.well-known/assetlinks.json") return serveAssetLinks(res);
    if (req.method === "POST" && url.pathname === "/api/login") return await login(req, res);
    if (req.method === "POST" && url.pathname === "/api/verify-otp") return await verifyOtp(req, res);
    if (req.method === "POST" && url.pathname === "/api/ingest") return await ingest(req, res);
    if (req.method === "POST" && url.pathname === "/api/forgot-password") return await requestPasswordReset(req, res);
    if (req.method === "GET" && url.pathname === "/api/reset-password/verify") return await verifyResetToken(res, url.searchParams.get("token"));
    if (req.method === "POST" && url.pathname === "/api/reset-password") return await completePasswordReset(req, res);

    if (url.pathname.startsWith("/api/")) {
      const user = await requireUser(req, res);
      if (!user) return;
      if (req.method === "POST" && url.pathname === "/api/logout") return await logout(req, res);
      if (req.method === "GET" && url.pathname === "/api/me") return json(res, 200, { user });
      if (req.method === "POST" && url.pathname === "/api/change-password") return await changePassword(req, res, user);
      if (req.method === "GET" && url.pathname === "/api/summary") return await summary(res, user, url.searchParams.get("range") || "7d");
      if (req.method === "GET" && url.pathname === "/api/proof-log") return await proofLog(res, user, url.searchParams.get("range") || "7d");
      if (req.method === "GET" && url.pathname === "/api/connections") return await listConnections(res, user);
      if (req.method === "GET" && url.pathname === "/api/visibility") return await getVisibility(res, user);
      if (req.method === "POST" && url.pathname === "/api/visibility/refresh") return await refreshVisibility(res, user);
      if (req.method === "POST" && url.pathname === "/api/support") return await submitSupportRequest(req, res, user);
      if (req.method === "GET" && url.pathname === "/api/push/key") return await pushKey(res, user);
      if (req.method === "POST" && url.pathname === "/api/push/subscribe") return await subscribePush(req, res, user);
      if (req.method === "POST" && url.pathname === "/api/push/unsubscribe") return await unsubscribePush(req, res, user);
      if (req.method === "POST" && url.pathname === "/api/push/test") return await pushTest(res, user);
      if (req.method === "GET" && url.pathname === "/api/contacts") return await listContacts(res, user, url);
      if (req.method === "POST" && url.pathname === "/api/contacts") return await createContact(req, res, user);
      if (req.method === "GET" && url.pathname === "/api/contacts/export") return await exportContactsCsv(res, user);
      if (req.method === "GET" && url.pathname === "/api/admin/tenants") return await listAdminTenants(res, user);
      if (req.method === "POST" && url.pathname === "/api/admin/tenants") return await createAdminTenant(req, res, user);
      if (req.method === "POST" && url.pathname === "/api/admin/healthcheck") return await runHealthcheck(res, user);
      if (req.method === "GET" && url.pathname === "/api/admin/knowledge") return await listKnowledge(res, user);
      if (req.method === "GET" && url.pathname === "/api/admin/activity") return await listActivity(res, user);
      if (req.method === "POST" && url.pathname === "/api/admin/activity") return await addActivity(req, res, user);
      if (req.method === "GET" && url.pathname === "/api/admin/activity/export") return await exportActivityCsv(res, user);
      const twilioAdminMatch = url.pathname.match(/^\/api\/admin\/tenants\/(\d+)\/twilio$/);
      if (twilioAdminMatch && req.method === "PATCH") return await updateAdminTwilio(req, res, user, Number(twilioAdminMatch[1]));
      const configAdminMatch = url.pathname.match(/^\/api\/admin\/tenants\/(\d+)\/config$/);
      if (configAdminMatch && req.method === "PATCH") return await updateAdminTenantConfig(req, res, user, Number(configAdminMatch[1]));
      const n8nAdminMatch = url.pathname.match(/^\/api\/admin\/tenants\/(\d+)\/n8n$/);
      if (n8nAdminMatch && req.method === "PATCH") return await updateAdminN8nLinks(req, res, user, Number(n8nAdminMatch[1]));
      const analyticsAdminMatch = url.pathname.match(/^\/api\/admin\/tenants\/(\d+)\/analytics$/);
      if (analyticsAdminMatch && req.method === "PATCH") return await updateAdminAnalytics(req, res, user, Number(analyticsAdminMatch[1]));
      const match = url.pathname.match(/^\/api\/contacts\/(\d+)$/);
      if (match && req.method === "GET") return await contactDetail(res, user, Number(match[1]));
      if (match && req.method === "PATCH") return await updateContact(req, res, user, Number(match[1]));
      if (match && req.method === "DELETE") return await deleteContact(res, user, Number(match[1]));
      const referMatch = url.pathname.match(/^\/api\/contacts\/(\d+)\/refer$/);
      if (referMatch && req.method === "POST") return await referContact(req, res, user, Number(referMatch[1]));
      if (req.method === "GET" && url.pathname === "/api/partners") return await listPartners(res, user);
      if (req.method === "POST" && url.pathname === "/api/partners") return await createPartner(req, res, user);
      const partnerMatch = url.pathname.match(/^\/api\/partners\/(\d+)$/);
      if (partnerMatch && req.method === "DELETE") return await deletePartner(res, user, Number(partnerMatch[1]));
      return json(res, 404, { error: "API-route niet gevonden." });
    }

    if ((req.method === "GET" || req.method === "HEAD") && serveStatic(req, res, url.pathname)) return;
    json(res, 404, { error: "Niet gevonden." });
  } catch (error) {
    console.error(error?.stack || error);
    json(res, error.status || 500, { error: error.status ? error.message : "Interne fout." });
  }
});

await bootstrap();
server.listen(PORT, "0.0.0.0", () => console.log(`Belvanger portal draait op poort ${PORT}`));
scheduleNightlyStalenessCheck();
scheduleNightlyHealthMail();
