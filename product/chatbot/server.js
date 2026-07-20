// Config-driven chat-assistent backend (herbruikbaar per klant).
// Serveert de statische bestanden + klant-config + proxyt chats naar OpenRouter.
// De API-sleutel staat hier (server-side), nooit in de browser.
// Per klant: customers/<CUSTOMER>/{config.json, system-prompt.txt, knowledge-base.md}.

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import tls from "node:tls";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

try {
  process.loadEnvFile(path.join(__dirname, ".env"));
} catch {
  /* geen .env — prima, we lezen dan uit de echte omgeving */
}

const PORT = process.env.PORT || 3100;
const MODEL = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash-lite";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// --- Klant laden ---
const CUSTOMER = process.env.CUSTOMER || "ab-uitvaartzorg";
const CUSTOMERS_DIR = path.resolve(process.env.CUSTOMERS_DIR || path.join(__dirname, "customers"));
const CUSTOMER_DIR = path.join(CUSTOMERS_DIR, CUSTOMER);

const CONFIG = JSON.parse(fs.readFileSync(path.join(CUSTOMER_DIR, "config.json"), "utf8"));
const SYSTEM_PROMPT = fs.readFileSync(path.join(CUSTOMER_DIR, "system-prompt.txt"), "utf8");
const KNOWLEDGE_BASE = fs.readFileSync(path.join(CUSTOMER_DIR, "knowledge-base.md"), "utf8");
const SYSTEM_TEXT = `${SYSTEM_PROMPT}\n\n---\n\n# Kennisbank (de enige toegestane bron)\n\n${KNOWLEDGE_BASE}`;

// --- Rate limiting (per IP, in-memory) ---
const RATE_MAX = Number(process.env.RATE_LIMIT_PER_MIN || 30);
const rateHits = new Map(); // ip -> { count, resetAt }
function clientIp(req) {
  const xff = req.headers["x-forwarded-for"];
  if (xff) return String(xff).split(",")[0].trim();
  return req.socket.remoteAddress || "onbekend";
}
function isRateLimited(ip) {
  const now = Date.now();
  let e = rateHits.get(ip);
  if (!e || now > e.resetAt) {
    e = { count: 0, resetAt: now + 60_000 };
    rateHits.set(ip, e);
  }
  e.count += 1;
  if (rateHits.size > 5000) {
    // simpele opschoning
    for (const [k, v] of rateHits) if (now > v.resetAt) rateHits.delete(k);
  }
  return e.count > RATE_MAX;
}

// --- Analytics (privacy-veilig) ---
// Standaard alleen metadata (geen berichttekst). Zet LOG_QUESTIONS=true om ook de
// vraagtekst te bewaren (voor een FAQ-backlog) — dat kan persoonsgegevens bevatten,
// dus alleen aanzetten met privacyverklaring + bewaartermijn.
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(__dirname, "data"));
const LOG_QUESTIONS = String(process.env.LOG_QUESTIONS || "false") === "true";
try {
  fs.mkdirSync(DATA_DIR, { recursive: true });
} catch {}
function recordAnalytics(entry) {
  const line = JSON.stringify({ ts: new Date().toISOString(), customer: CUSTOMER, ...entry }) + "\n";
  fs.appendFile(path.join(DATA_DIR, "analytics.jsonl"), line, () => {});
}

// --- Website-bezoek (geanonimiseerd) ---
// We slaan NOOIT het IP of de user-agent op. Voor het tellen van unieke bezoekers
// gebruiken we een dag-roterende, niet-herleidbare hash (vid). Geen persoonsgegevens.
function visitorId(ip, ua) {
  const day = new Date().toISOString().slice(0, 10);
  return createHash("sha256").update(`${ip}|${ua || ""}|${day}|ab-analytics`).digest("hex").slice(0, 16);
}
function deviceType(ua) {
  const u = (ua || "").toLowerCase();
  if (/ipad|tablet/.test(u)) return "tablet";
  if (/mobi|iphone|android/.test(u)) return "mobile";
  return "desktop";
}
function isBot(ua) {
  return /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegram|headless|lighthouse|pingdom|uptime|monitor|curl|wget|python-requests/i.test(ua || "");
}
function refHost(ref) {
  try {
    return ref ? new URL(ref).hostname.replace(/^www\./, "") : "";
  } catch {
    return "";
  }
}
function recordPageview(req, urlPath) {
  const ua = req.headers["user-agent"] || "";
  if (isBot(ua)) return; // crawlers/monitors niet meetellen
  const entry = {
    ts: new Date().toISOString(),
    path: urlPath,
    lang: urlPath.replace(/\\/g, "/").includes("/en/") ? "en" : "nl",
    device: deviceType(ua),
    ref: refHost(req.headers["referer"] || req.headers["referrer"] || ""),
    vid: visitorId(clientIp(req), ua),
  };
  fs.appendFile(path.join(DATA_DIR, "pageviews.jsonl"), JSON.stringify(entry) + "\n", () => {});
}

function readJsonl(name) {
  try {
    return fs.readFileSync(path.join(DATA_DIR, name), "utf8").split("\n").filter(Boolean)
      .map((l) => { try { return JSON.parse(l); } catch { return null; } })
      .filter(Boolean);
  } catch {
    return [];
  }
}
function topN(obj, n) {
  return Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, n).map(([key, count]) => ({ key, count }));
}
function prettyPage(p) {
  if (!p || p === "/" || /\/index\.html$/.test(p)) return p && p.includes("/en/") ? "Home (EN)" : "Home";
  return p.replace(/^\//, "").replace(/\.html$/, "").replace(/^en\//, "EN: ").replace(/-/g, " ");
}

function computeStats() {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);

  // --- Website-bezoek ---
  const pv = readJsonl("pageviews.jsonl");
  const visitors = { total: pv.length, byDay: {}, uniqueByDay: {}, byPage: {}, byDevice: {}, byRef: {}, byLang: {} };
  const vidByDay = {};
  const vidTotal = new Set();
  for (const r of pv) {
    const day = (r.ts || "").slice(0, 10);
    visitors.byDay[day] = (visitors.byDay[day] || 0) + 1;
    visitors.byPage[r.path] = (visitors.byPage[r.path] || 0) + 1;
    visitors.byDevice[r.device || "desktop"] = (visitors.byDevice[r.device || "desktop"] || 0) + 1;
    visitors.byLang[r.lang || "nl"] = (visitors.byLang[r.lang || "nl"] || 0) + 1;
    visitors.byRef[r.ref || "direct"] = (visitors.byRef[r.ref || "direct"] || 0) + 1;
    if (r.vid) {
      (vidByDay[day] = vidByDay[day] || new Set()).add(r.vid);
      vidTotal.add(r.vid);
    }
  }
  for (const [d, set] of Object.entries(vidByDay)) visitors.uniqueByDay[d] = set.size;
  visitors.uniqueTotal = vidTotal.size;
  visitors.topPages = topN(visitors.byPage, 8).map((x) => ({ ...x, label: prettyPage(x.key) }));
  visitors.topRefs = topN(visitors.byRef, 6);

  // --- Chatbot ---
  const rows = readJsonl("analytics.jsonl");
  const chat = { total: 0, ok: 0, referred: 0, avgMs: 0, byLang: {}, byDay: {}, questions: [], hasQuestions: false };
  let msSum = 0;
  const qmap = new Map();
  for (const r of rows) {
    chat.total++;
    chat.byLang[r.lang] = (chat.byLang[r.lang] || 0) + 1;
    chat.byDay[(r.ts || "").slice(0, 10)] = (chat.byDay[(r.ts || "").slice(0, 10)] || 0) + 1;
    if (r.referred) chat.referred++;
    if (r.ok) chat.ok++;
    if (r.ms) msSum += r.ms;
    if (r.question) {
      const k = r.question.trim().toLowerCase();
      const e = qmap.get(k) || { text: r.question.trim(), count: 0 };
      e.count++;
      qmap.set(k, e);
    }
  }
  chat.avgMs = chat.total ? Math.round(msSum / chat.total) : 0;
  chat.hasQuestions = qmap.size > 0;
  chat.questions = [...qmap.values()].sort((a, b) => b.count - a.count).slice(0, 50);

  // --- Samenvatting (in één oogopslag) ---
  const insights = [];
  const uToday = visitors.uniqueByDay[today] || 0;
  const uYest = visitors.uniqueByDay[yesterday] || 0;
  if (visitors.uniqueTotal > 0) {
    let trend = "";
    if (uYest > 0) {
      const d = Math.round(((uToday - uYest) / uYest) * 100);
      trend = ` (${d >= 0 ? "+" : ""}${d}% t.o.v. gisteren)`;
    }
    insights.push(`${uToday} unieke bezoeker(s) vandaag${trend}; ${visitors.uniqueTotal} in totaal.`);
    if (visitors.topPages[0]) insights.push(`Populairste pagina: ${visitors.topPages[0].label} (${visitors.topPages[0].count} weergaven).`);
    const pct = visitors.total ? Math.round(((visitors.byDevice.mobile || 0) / visitors.total) * 100) : 0;
    insights.push(`${pct}% van de bezoeken komt via mobiel.`);
    const topRef = visitors.topRefs[0];
    if (topRef) insights.push(`Meeste bezoekers via ${topRef.key === "direct" ? "een directe link / onbekend" : topRef.key}.`);
  } else {
    insights.push("Nog geen bezoekersgegevens — die verschijnen zodra mensen de site bezoeken.");
  }
  if (chat.total > 0) {
    insights.push(`${chat.total} chatbericht(en); ${Math.round((chat.referred / chat.total) * 100)}% eindigde met een verwijzing naar bellen.`);
  }

  return {
    generatedAt: new Date().toISOString(),
    customer: CUSTOMER,
    businessName: CONFIG.businessName,
    colors: CONFIG.colors || {},
    logQuestions: LOG_QUESTIONS,
    insights,
    visitors,
    chat,
  };
}

// --- Dashboard (met token beveiligd) ---
const DASHBOARD_TOKEN = process.env.DASHBOARD_TOKEN || "";
const DASHBOARD_HTML = [path.join(__dirname, "dashboard.html"), path.join(__dirname, "public", "dashboard.html")].find((p) => fs.existsSync(p));
function tokenOk(req) {
  if (!DASHBOARD_TOKEN) return false;
  try {
    return new URL(req.url, "http://x").searchParams.get("token") === DASHBOARD_TOKEN;
  } catch {
    return false;
  }
}

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";
const CORS = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Private-Network": "true",
};

function fallbackReply(lang) {
  const who = CONFIG.contactName || (lang === "en" ? "us" : "ons");
  if (lang === "en") {
    return `Sorry, something went wrong. Please call ${who} on ${CONFIG.phoneDisplay} — available day and night.`;
  }
  const met = CONFIG.contactName ? `met ${who}` : "ons";
  return `Excuses, er ging even iets mis. Belt u gerust ${met} op ${CONFIG.phoneDisplay} — dag en nacht bereikbaar.`;
}
function busyReply(lang) {
  if (lang === "en") return `It's a bit busy right now — please try again in a moment, or call ${CONFIG.contactName || "us"} on ${CONFIG.phoneDisplay}.`;
  return `Het is even druk — probeer het zo nog eens, of bel ${CONFIG.contactName || "ons"} op ${CONFIG.phoneDisplay}.`;
}

// --- Lead-aanvraag → e-mail (env-gated: alleen actief als SMTP geconfigureerd is) ---
// Herbruikbaar per klant: staan de SMTP_*-vars niet in .env (zoals bij AB), dan is
// /api/lead uitgeschakeld en verandert er niets voor die klant.
const SMTP = {
  host: process.env.SMTP_HOST || "",
  port: Number(process.env.SMTP_PORT || 465),
  user: process.env.SMTP_USER || "",
  pass: process.env.SMTP_PASS || "",
  from: process.env.SMTP_FROM || process.env.SMTP_USER || "",
};
const LEAD_TO = process.env.LEAD_TO || "";
const LEAD_ENABLED = !!(SMTP.host && SMTP.user && SMTP.pass && LEAD_TO);

// Minimale SMTP-client over impliciete TLS (poort 465), zonder dependencies.
function smtpSend({ host, port, user, pass, from, to, subject, text, html }) {
  return new Promise((resolve, reject) => {
    const socket = tls.connect({ host, port, servername: host });
    socket.setEncoding("utf8");
    socket.setTimeout(20000, () => { socket.destroy(); reject(new Error("smtp timeout")); });
    let buf = "";
    let waiting = null;
    function pump() {
      if (!waiting) return;
      const m = buf.match(/^(\d{3}) [^\n]*\n/m); // laatste regel van een (evt. meerregelig) antwoord
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
        const dot = (s) => String(s).replace(/\r?\n/g, "\r\n").replace(/\r\n\./g, "\r\n.."); // CRLF + dot-stuffing
        const base = [
          "From: Belvanger <" + from + ">",
          "To: <" + to + ">",
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

function oneLine(s) { return String(s == null ? "" : s).replace(/[\r\n\t]+/g, " ").trim().slice(0, 300); }
function escHtml(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

// Gebrande bevestigingsmail (autoreply) naar de aanvrager. Belvanger-huisstijl, geen em-dashes.
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
function leadAutoreply(lang, naam) {
  const first = escHtml(String(naam || "").trim().split(/\s+/)[0] || (lang === "en" ? "there" : "daar"));
  if (lang === "en") {
    return {
      subject: "Thanks for your request to Belvanger",
      text: `Thanks for your request, ${first}!\n\nWe've received it and one of us will call you back soon to go through everything at your pace.\n\nHave a question in the meantime? Just reply to this email or send a WhatsApp.\n\nBest,\nTeam Belvanger\n\nThe calls you miss, we catch.\nbelvanger.nl | info@belvanger.nl`,
      html: emailShell(
        `<p style="margin:0 0 14px;font-size:18px;font-weight:700;">Thanks for your request, ${first}!</p>
         <p style="margin:0 0 14px;">We've received it. One of us will call you back soon to go through everything at your pace.</p>
         <p style="margin:0 0 14px;">Have a question in the meantime? Just reply to this email or send a WhatsApp.</p>
         <p style="margin:22px 0 0;">Best,<br><strong>Team Belvanger</strong></p>`,
        "The calls you miss, we catch.",
        "You're receiving this because you submitted a request on belvanger.nl."),
    };
  }
  return {
    subject: "Bedankt voor je aanvraag bij Belvanger",
    text: `Bedankt voor je aanvraag, ${first}!\n\nWe hebben 'm goed ontvangen. Een van ons neemt snel telefonisch contact met je op om alles rustig door te nemen.\n\nHeb je in de tussentijd een vraag? Reageer gerust op deze mail of stuur een WhatsApp.\n\nGroeten,\nTeam Belvanger\n\nDe belletjes die jij mist, vangen wij op.\nbelvanger.nl | info@belvanger.nl`,
    html: emailShell(
      `<p style="margin:0 0 14px;font-size:18px;font-weight:700;">Bedankt voor je aanvraag, ${first}!</p>
       <p style="margin:0 0 14px;">We hebben 'm goed ontvangen. Een van ons neemt snel telefonisch contact met je op om alles rustig door te nemen.</p>
       <p style="margin:0 0 14px;">Heb je in de tussentijd een vraag? Reageer gerust op deze mail of stuur een WhatsApp.</p>
       <p style="margin:22px 0 0;">Groeten,<br><strong>Team Belvanger</strong></p>`,
      "De belletjes die jij mist, vangen wij op.",
      "Je ontvangt deze mail omdat je een aanvraag deed op belvanger.nl."),
  };
}

function handleLead(req, res) {
  let body = "";
  req.on("data", (c) => { body += c; if (body.length > 20000) req.destroy(); });
  req.on("end", async () => {
    try {
      if (!LEAD_ENABLED) {
        res.writeHead(501, { "Content-Type": "application/json", ...CORS });
        res.end(JSON.stringify({ error: "lead endpoint niet geconfigureerd" }));
        return;
      }
      const d = JSON.parse(body || "{}");
      if (oneLine(d.website)) { // honeypot gevuld = bot → doe alsof het lukte, verstuur niets
        res.writeHead(200, { "Content-Type": "application/json", ...CORS });
        res.end(JSON.stringify({ ok: true }));
        return;
      }
      const naam = oneLine(d.naam);
      const tel = oneLine(d.telefoon);
      const vak = oneLine(d.vak);
      const bedrijf = oneLine(d.bedrijf);
      const email = oneLine(d.email);
      const vraag = String(d.vraag || "").replace(/\r?\n/g, "\n").slice(0, 2000);
      if (!naam || !tel) {
        res.writeHead(400, { "Content-Type": "application/json", ...CORS });
        res.end(JSON.stringify({ error: "naam en telefoon zijn verplicht" }));
        return;
      }
      const subject = `Nieuwe aanvraag via belvanger.nl — ${naam}`;
      const text = [
        "Nieuwe gesprek-aanvraag via belvanger.nl", "",
        `Naam:      ${naam}`,
        `Bedrijf:   ${bedrijf || "-"}`,
        `Vak:       ${vak || "-"}`,
        `Telefoon:  ${tel}`,
        `E-mail:    ${email || "-"}`, "",
        "Vraag / situatie:",
        vraag || "-", "",
        `Taal:      ${oneLine(d.taal)}`,
        `Pagina:    ${oneLine(d.pagina)}`,
        `Tijd:      ${new Date().toISOString()}`,
      ].join("\n");
      await smtpSend({ ...SMTP, to: LEAD_TO, subject, text });
      // Autoreply naar de aanvrager (best-effort: faalt dit, dan is de lead nog steeds binnen).
      if (email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        const ar = leadAutoreply(oneLine(d.taal) === "en" ? "en" : "nl", naam);
        try { await smtpSend({ ...SMTP, to: email, subject: ar.subject, text: ar.text, html: ar.html }); }
        catch (e) { console.error("autoreply mislukt:", e?.message || e); }
      }
      fs.appendFile(path.join(DATA_DIR, "leads.jsonl"), JSON.stringify({ ts: new Date().toISOString(), vak, taal: oneLine(d.taal) }) + "\n", () => {});
      res.writeHead(200, { "Content-Type": "application/json", ...CORS });
      res.end(JSON.stringify({ ok: true }));
    } catch (err) {
      console.error("lead error:", err?.message || err);
      res.writeHead(500, { "Content-Type": "application/json", ...CORS });
      res.end(JSON.stringify({ error: "verzenden mislukt" }));
    }
  });
}

async function handleChat(req, res, ip) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
    if (body.length > 100_000) req.destroy();
  });
  req.on("end", async () => {
    const start = Date.now();
    let lang = "nl";
    try {
      if (!process.env.OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY ontbreekt");

      const parsed = JSON.parse(body || "{}");
      const messages = parsed.messages;
      lang = parsed.lang === "en" ? "en" : "nl";
      if (!Array.isArray(messages) || messages.length === 0) {
        res.writeHead(400, { "Content-Type": "application/json", ...CORS });
        res.end(JSON.stringify({ error: "messages[] required" }));
        return;
      }
      const clean = messages
        .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
        .slice(-20)
        .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));
      const lastUser = [...clean].reverse().find((m) => m.role === "user");

      let systemText = SYSTEM_TEXT;
      if (lang === "en") {
        systemText +=
          "\n\nDe bezoeker gebruikt de Engelstalige versie van de website. Antwoord in het Engels, tenzij de bezoeker duidelijk in het Nederlands schrijft.";
      }

      const or = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "X-Title": `${CONFIG.businessName} chat`,
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 1024,
          messages: [{ role: "system", content: systemText }, ...clean],
        }),
      });

      if (!or.ok) {
        const detail = await or.text();
        throw new Error(`OpenRouter ${or.status}: ${detail.slice(0, 300)}`);
      }
      const data = await or.json();
      const reply = (data?.choices?.[0]?.message?.content?.trim()) || fallbackReply(lang);
      const referred = CONFIG.phoneDisplay ? reply.includes(CONFIG.phoneDisplay) : false;

      res.writeHead(200, { "Content-Type": "application/json", ...CORS });
      res.end(JSON.stringify({ reply }));

      recordAnalytics({
        lang,
        ok: true,
        referred,
        ms: Date.now() - start,
        qLen: lastUser ? lastUser.content.length : 0,
        aLen: reply.length,
        model: MODEL,
        ...(LOG_QUESTIONS && lastUser ? { question: lastUser.content } : {}),
      });
    } catch (err) {
      console.error("chat error:", err?.message || err);
      res.writeHead(500, { "Content-Type": "application/json", ...CORS });
      res.end(JSON.stringify({ reply: fallbackReply(lang) }));
      recordAnalytics({ lang, ok: false, referred: true, ms: Date.now() - start, error: String(err?.message || err).slice(0, 120) });
    }
  });
}

function serveConfig(req, res) {
  res.writeHead(200, { "Content-Type": "application/json", ...CORS });
  res.end(JSON.stringify(CONFIG));
}

function serveHealth(req, res) {
  res.writeHead(200, { "Content-Type": "application/json", ...CORS });
  res.end(JSON.stringify({ status: "ok", customer: CUSTOMER, model: MODEL, uptime: Math.round(process.uptime()) }));
}

// --- Static file serving ---
const STATIC_DIR = path.resolve(process.env.STATIC_DIR || path.join(__dirname, "public"));
const INDEX_FILE = fs.existsSync(path.join(STATIC_DIR, "index.html")) ? "index.html" : "demo.html";
const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript",
  ".css": "text/css", ".json": "application/json", ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8", ".webp": "image/webp", ".png": "image/png",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif", ".svg": "image/svg+xml",
  ".ico": "image/x-icon", ".woff": "font/woff", ".woff2": "font/woff2", ".map": "application/json",
};

function serveStatic(req, res) {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") urlPath = "/" + INDEX_FILE;
  else if (urlPath.endsWith("/")) urlPath = urlPath + "index.html";
  const filePath = path.join(STATIC_DIR, path.normalize(urlPath));
  if (!filePath.startsWith(STATIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    if (ext === ".html") recordPageview(req, urlPath); // alleen echte pagina's tellen
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  });
}

http
  .createServer((req, res) => {
    const start = Date.now();
    const ip = clientIp(req);
    res.on("finish", () => {
      console.log(`${new Date().toISOString()} ${ip} ${req.method} ${req.url.split("?")[0]} ${res.statusCode} ${Date.now() - start}ms`);
    });

    // Security-headers voor álle responses (herstelt wat de nginx-config zette).
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "geolocation=(), camera=(), microphone=()");

    if (req.method === "OPTIONS" && req.url === "/api/chat") {
      res.writeHead(204, CORS);
      res.end();
      return;
    }
    if (req.method === "POST" && req.url === "/api/chat") {
      if (isRateLimited(ip)) {
        const lang = "nl";
        res.writeHead(429, { "Content-Type": "application/json", ...CORS });
        res.end(JSON.stringify({ reply: busyReply(lang) }));
        return;
      }
      return handleChat(req, res, ip);
    }
    if (req.method === "OPTIONS" && req.url === "/api/lead") {
      res.writeHead(204, CORS);
      res.end();
      return;
    }
    if (req.method === "POST" && req.url === "/api/lead") {
      if (isRateLimited(ip)) {
        res.writeHead(429, { "Content-Type": "application/json", ...CORS });
        res.end(JSON.stringify({ error: "te veel aanvragen, probeer het zo opnieuw" }));
        return;
      }
      return handleLead(req, res);
    }
    if (req.method === "GET" && req.url === "/api/config") return serveConfig(req, res);
    if (req.method === "GET" && req.url === "/health") return serveHealth(req, res);
    if (req.method === "GET" && req.url.split("?")[0] === "/api/stats") {
      if (!tokenOk(req)) {
        res.writeHead(403, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "forbidden" }));
        return;
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(computeStats()));
      return;
    }
    if (req.method === "GET" && req.url.split("?")[0] === "/dashboard") {
      if (!tokenOk(req)) {
        res.writeHead(403, { "Content-Type": "text/html; charset=utf-8" });
        res.end("<h1>403</h1><p>Ongeldige of ontbrekende token. Open <code>/dashboard?token=UW-TOKEN</code>." + (DASHBOARD_TOKEN ? "" : " (Dashboard is uitgeschakeld: stel DASHBOARD_TOKEN in.)") + "</p>");
        return;
      }
      if (!DASHBOARD_HTML) {
        res.writeHead(404);
        res.end("dashboard.html niet gevonden");
        return;
      }
      fs.readFile(DASHBOARD_HTML, (err, data) => {
        if (err) { res.writeHead(404); res.end("Not found"); return; }
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(data);
      });
      return;
    }
    if (req.method === "GET") return serveStatic(req, res);
    res.writeHead(405);
    res.end("Method not allowed");
  })
  .listen(PORT, () => {
    console.log(`Chat-assistent (${CONFIG.businessName}) draait op http://localhost:${PORT}  (model: ${MODEL}, rate: ${RATE_MAX}/min, vragen loggen: ${LOG_QUESTIONS})`);
    if (!process.env.OPENROUTER_API_KEY) {
      console.warn("LET OP: OPENROUTER_API_KEY is niet gezet — chatverzoeken zullen falen.");
    }
  });
