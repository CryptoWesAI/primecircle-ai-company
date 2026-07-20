// PrimeCircle VPS Control — secrets + restart dashboard.
// Zero external deps (Node built-ins only). Security-sensitive: intended to run ONLY on a
// private Tailscale network, behind app-login. It reads/writes per-project .env files and
// can recreate containers via `docker compose up -d`.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = parseInt(process.env.PORT || "8095", 10);
const PROJECTS_ROOT = process.env.PROJECTS_ROOT || "/opt";
const BACKUP_ROOT = process.env.BACKUP_ROOT || "/opt/dashboard-backups";
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const PUBLIC_DIR = path.join(__dirname, "public");
// Projecten die het dashboard NOOIT beheert (zichzelf; en pure infra).
const EXCLUDE = new Set(["dashboard", "dashboard-backups", "containerd", "primecircle-backups", "belvanger-backups"]);
const SESSION_MAX_AGE = 1000 * 60 * 60 * 12; // 12h

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(BACKUP_ROOT, { recursive: true });

// --- session secret (persisted, niet in env nodig) ---
const SECRET_FILE = path.join(DATA_DIR, "session.key");
let SESSION_SECRET;
if (fs.existsSync(SECRET_FILE)) SESSION_SECRET = fs.readFileSync(SECRET_FILE);
else { SESSION_SECRET = crypto.randomBytes(32); fs.writeFileSync(SECRET_FILE, SESSION_SECRET, { mode: 0o600 }); }

// --- auth (scrypt hash in data/auth.json) ---
const AUTH_FILE = path.join(DATA_DIR, "auth.json");
function needsSetup() { return !fs.existsSync(AUTH_FILE); }
function setPassword(pw) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(pw, salt, 64);
  fs.writeFileSync(AUTH_FILE, JSON.stringify({ salt: salt.toString("hex"), hash: hash.toString("hex") }), { mode: 0o600 });
}
function verifyPassword(pw) {
  if (needsSetup()) return false;
  try {
    const { salt, hash } = JSON.parse(fs.readFileSync(AUTH_FILE, "utf8"));
    const test = crypto.scryptSync(pw, Buffer.from(salt, "hex"), 64);
    return crypto.timingSafeEqual(test, Buffer.from(hash, "hex"));
  } catch { return false; }
}

// --- stateless signed session cookie ---
function makeToken() {
  const exp = Date.now() + SESSION_MAX_AGE;
  const payload = String(exp);
  const sig = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  return `${payload}.${sig}`;
}
function validToken(tok) {
  if (!tok || !tok.includes(".")) return false;
  const [payload, sig] = tok.split(".");
  const expect = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  if (sig.length !== expect.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expect))) return false;
  return Date.now() < parseInt(payload, 10);
}
function parseCookies(req) {
  const out = {};
  (req.headers.cookie || "").split(";").forEach((c) => {
    const i = c.indexOf("="); if (i > -1) out[c.slice(0, i).trim()] = decodeURIComponent(c.slice(i + 1).trim());
  });
  return out;
}
function isAuthed(req) { return validToken(parseCookies(req).dash_sess); }

// --- rate limit login ---
const loginHits = new Map();
function loginLimited(ip) {
  const now = Date.now(); const rec = loginHits.get(ip) || { n: 0, t: now };
  if (now - rec.t > 60000) { rec.n = 0; rec.t = now; }
  rec.n++; loginHits.set(ip, rec);
  return rec.n > 8;
}

// --- helpers ---
function send(res, code, body, headers = {}) {
  res.writeHead(code, { "Cache-Control": "no-store", ...headers });
  res.end(body);
}
function sendJson(res, code, obj, headers = {}) {
  send(res, code, JSON.stringify(obj), { "Content-Type": "application/json", ...headers });
}
function secHeaders() {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Content-Security-Policy": "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; base-uri 'none'; form-action 'self'",
  };
}
function readBody(req) {
  return new Promise((resolve) => {
    let d = ""; req.on("data", (c) => { d += c; if (d.length > 1e6) req.destroy(); });
    req.on("end", () => { try { resolve(d ? JSON.parse(d) : {}); } catch { resolve(null); } });
  });
}

// --- .env parsing (structuur-behoudend) ---
function parseEnv(text) {
  return text.split(/\r?\n/).map((raw) => {
    if (/^\s*#/.test(raw)) return { type: "comment", raw };
    const m = raw.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$/);
    if (m) return { type: "kv", raw, key: m[1], value: m[2] };
    return { type: "other", raw };
  });
}
function serializeEnv(lines) { return lines.map((l) => l.type === "kv" ? `${l.key}=${l.value}` : l.raw).join("\n"); }

// --- projecten ontdekken ---
const COMPOSE_FILES = ["docker-compose.yml", "docker-compose.yaml", "compose.yml", "compose.yaml"];
function composePath(dir) { return COMPOSE_FILES.map((f) => path.join(dir, f)).find((p) => fs.existsSync(p)); }
function cleanRef(s) { return s.trim().replace(/\s+#.*$/, "").replace(/^["']|["']$/g, "").trim(); }

// Haal alle `env_file:`-paden uit een compose-tekst (inline, [lijst], of block-lijst).
function parseEnvFileDirectives(text) {
  const lines = text.split(/\r?\n/); const out = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(\s*)env_file:\s*(.*)$/);
    if (!m) continue;
    const indent = m[1].length; const rest = cleanRef(m[2]);
    if (rest) {
      if (rest.startsWith("[")) rest.replace(/^\[|\]$/g, "").split(",").forEach((s) => { const v = cleanRef(s); if (v) out.push(v); });
      else out.push(rest);
    } else {
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].trim() === "") continue;
        const lm = lines[j].match(/^(\s*)-\s*(.+)$/);
        if (lm && lm[1].length > indent) { const v = cleanRef(lm[2].replace(/^path:\s*/, "")); if (v) out.push(v); }
        else break;
      }
    }
  }
  return out;
}

// Alle env-files van een project: top-level .env + wat de compose declareert (binnen de projectmap).
function discoverEnvFiles(dir) {
  const files = new Set();
  if (fs.existsSync(path.join(dir, ".env"))) files.add(".env");
  const cp = composePath(dir);
  if (cp) {
    try {
      for (const rel of parseEnvFileDirectives(fs.readFileSync(cp, "utf8"))) {
        const abs = path.resolve(dir, rel);
        if ((abs === path.join(dir, ".env") || abs.startsWith(dir + path.sep)) && fs.existsSync(abs))
          files.add(path.relative(dir, abs).split(path.sep).join("/"));
      }
    } catch {}
  }
  return [...files];
}
function fileKeys(abs) {
  try { return parseEnv(fs.readFileSync(abs, "utf8")).filter((l) => l.type === "kv").map((l) => l.key); } catch { return []; }
}

function listProjects() {
  let dirs = [];
  try { dirs = fs.readdirSync(PROJECTS_ROOT, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name); }
  catch { return []; }
  return dirs
    .filter((name) => !EXCLUDE.has(name))
    .filter((name) => !!composePath(path.join(PROJECTS_ROOT, name)))
    .map((name) => {
      const dir = path.join(PROJECTS_ROOT, name);
      const files = discoverEnvFiles(dir).map((rel) => ({ path: rel, keys: fileKeys(path.join(dir, rel)) }));
      return { name, dir, files, editable: files.length > 0 };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}
function getProject(name) { return listProjects().find((p) => p.name === name) || null; }
// Valideer + resolve een env-file van een project (alleen bekende paden; geen traversal).
function resolveEnvFile(pr, rel) {
  if (!pr || !pr.files.some((f) => f.path === rel)) return null;
  return path.join(pr.dir, rel);
}

// docker status per project
function composeStatus(dir) {
  return new Promise((resolve) => {
    execFile("docker", ["compose", "ps", "--format", "json"], { cwd: dir, timeout: 15000 }, (err, stdout) => {
      if (err) return resolve({ state: "unknown" });
      const rows = stdout.trim().split(/\r?\n/).filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
      if (!rows.length) return resolve({ state: "stopped" });
      const states = rows.map((r) => (r.Health || r.State || "").toLowerCase());
      const state = states.includes("healthy") ? "healthy" : states.some((s) => s.includes("running") || s === "up") ? "running" : states[0] || "unknown";
      resolve({ state });
    });
  });
}
function composeUp(dir) {
  return new Promise((resolve) => {
    execFile("docker", ["compose", "up", "-d"], { cwd: dir, timeout: 180000 }, (err, stdout, stderr) => {
      const out = ((stdout || "") + (stderr || "")).trim().split(/\r?\n/);
      resolve({ ok: !err, log: out.slice(-15).join("\n") });
    });
  });
}

function backupEnv(name, fileRel, envPath) {
  const dir = path.join(BACKUP_ROOT, name);
  fs.mkdirSync(dir, { recursive: true });
  try { fs.chmodSync(dir, 0o700); } catch {}
  const fileId = fileRel.replace(/[\/\\]/g, "__"); // bv. backend/.env → backend__.env
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const dest = path.join(dir, `${fileId}.${ts}`);
  fs.copyFileSync(envPath, dest);
  try { fs.chmodSync(dest, 0o600); } catch {} // backup bevat secrets
}

// --- routes ---
async function handle(req, res) {
  const url = new URL(req.url, "http://x");
  const p = url.pathname;
  const method = req.method;

  // static assets (setup/login pages need these before auth)
  if (method === "GET" && (p === "/" || p === "/index.html")) return serveFile(res, "index.html");
  if (method === "GET" && (p === "/style.css" || p === "/app.js" || p === "/favicon.svg")) return serveFile(res, p.slice(1));

  // session info
  if (method === "GET" && p === "/api/session") {
    return sendJson(res, 200, { authenticated: isAuthed(req), needsSetup: needsSetup() });
  }

  const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();

  // first-run password setup
  if (method === "POST" && p === "/api/setup") {
    if (!needsSetup()) return sendJson(res, 409, { error: "Al ingesteld." });
    const body = await readBody(req);
    if (!body || typeof body.password !== "string" || body.password.length < 10)
      return sendJson(res, 400, { error: "Kies een wachtwoord van minstens 10 tekens." });
    setPassword(body.password);
    return sendJson(res, 200, { ok: true }, cookieHeader());
  }

  // login
  if (method === "POST" && p === "/api/login") {
    if (loginLimited(ip)) return sendJson(res, 429, { error: "Te veel pogingen. Wacht even." });
    const body = await readBody(req);
    if (!body || !verifyPassword(body.password || "")) return sendJson(res, 401, { error: "Onjuist wachtwoord." });
    return sendJson(res, 200, { ok: true }, cookieHeader());
  }
  if (method === "POST" && p === "/api/logout") {
    return sendJson(res, 200, { ok: true }, { "Set-Cookie": "dash_sess=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0" });
  }

  // ---- alles hieronder vereist auth + CSRF-header op mutaties ----
  if (!isAuthed(req)) return sendJson(res, 401, { error: "Niet ingelogd." });
  if (method !== "GET" && req.headers["x-csrf"] !== "1") return sendJson(res, 403, { error: "CSRF." });

  if (method === "GET" && p === "/api/projects") {
    const projects = listProjects();
    const withStatus = await Promise.all(projects.map(async (pr) => ({
      name: pr.name, editable: pr.editable, files: pr.files,
      status: (await composeStatus(pr.dir)).state,
    })));
    return sendJson(res, 200, { projects: withStatus });
  }

  if (method === "POST" && p === "/api/reveal") {
    const body = await readBody(req); const pr = getProject(body?.project);
    const abs = resolveEnvFile(pr, body?.file);
    if (!abs) return sendJson(res, 404, { error: "Onbekend project/bestand." });
    const lines = parseEnv(fs.readFileSync(abs, "utf8"));
    const kv = lines.find((l) => l.type === "kv" && l.key === body.key);
    if (!kv) return sendJson(res, 404, { error: "Onbekende sleutel." });
    return sendJson(res, 200, { value: kv.value });
  }

  if (method === "POST" && p === "/api/save") {
    const body = await readBody(req); const pr = getProject(body?.project);
    const abs = resolveEnvFile(pr, body?.file);
    if (!abs) return sendJson(res, 404, { error: "Onbekend project/bestand." });
    if (!Array.isArray(body.changes)) return sendJson(res, 400, { error: "Geen wijzigingen." });
    let lines = parseEnv(fs.readFileSync(abs, "utf8"));
    for (const ch of body.changes) {
      if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(ch.key || "")) return sendJson(res, 400, { error: `Ongeldige sleutelnaam: ${ch.key}` });
      if (ch.op === "delete") { lines = lines.filter((l) => !(l.type === "kv" && l.key === ch.key)); }
      else if (ch.op === "set") {
        const val = String(ch.value ?? "");
        if (/[\r\n]/.test(val)) return sendJson(res, 400, { error: "Waarde mag geen nieuwe regels bevatten." });
        const existing = lines.find((l) => l.type === "kv" && l.key === ch.key);
        if (existing) existing.value = val; else lines.push({ type: "kv", key: ch.key, value: val });
      }
    }
    backupEnv(pr.name, body.file, abs);
    fs.writeFileSync(abs, serializeEnv(lines), { mode: 0o600 });
    try { fs.chmodSync(abs, 0o600); } catch {} // mode-optie geldt alleen bij aanmaken; forceer 600
    return sendJson(res, 200, { ok: true });
  }

  if (method === "POST" && p === "/api/restart") {
    const body = await readBody(req); const pr = getProject(body?.project);
    if (!pr) return sendJson(res, 404, { error: "Onbekend project." });
    const r = await composeUp(pr.dir);
    const status = (await composeStatus(pr.dir)).state;
    return sendJson(res, r.ok ? 200 : 500, { ok: r.ok, log: r.log, status });
  }

  return sendJson(res, 404, { error: "Niet gevonden." });
}

function cookieHeader() {
  return { "Set-Cookie": `dash_sess=${makeToken()}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_MAX_AGE / 1000}` };
}

const MIME = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml" };
function serveFile(res, name) {
  const fp = path.join(PUBLIC_DIR, path.normalize("/" + name));
  if (!fp.startsWith(PUBLIC_DIR) || !fs.existsSync(fp)) return send(res, 404, "Not found");
  send(res, 200, fs.readFileSync(fp), { "Content-Type": MIME[path.extname(fp)] || "text/plain", ...secHeaders() });
}

http.createServer((req, res) => {
  Object.entries(secHeaders()).forEach(([k, v]) => res.setHeader(k, v));
  handle(req, res).catch((e) => { console.error("ERR", req.method, req.url, e.message); if (!res.headersSent) sendJson(res, 500, { error: "Serverfout." }); });
}).listen(PORT, () => console.log(`PrimeCircle VPS Control op :${PORT} (projects=${PROJECTS_ROOT})`));
