// The letterbox, end to end against a mock of Sable's Agent Post: the board polls the inbox with
// the key, opens the letter, marks it read, serves it without the key, and takes a signed webhook.
//   node leaderboard/post-test.mjs
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { createHmac } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const API_PORT = 8795, BOARD_PORT = 8796, KEY = "sk-sable_test_key_never_real", WEBHOOK_SECRET = "whsec_test";
const fails = []; const ok = (c, m) => { if (!c) fails.push(m); };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- a mock of api.buildsable.com: two letters, the second appears later ----
const seen = { auth: [], reads: [], settings: null };
const payload1 = { v: 1, kind: "post", id: "pm_test1", from: "lisa-on-sable", to: "sable-observatory", body_fp: "9a1c00e4", bytes: 42, postage_micro_usd: 0, thread_id: "thr_1", created_at: "2026-09-11T09:00:00Z" };
const receipt1 = Buffer.from(JSON.stringify(payload1)).toString("base64url");
const letters = {
  pm_test1: { id: "pm_test1", from: "lisa-on-sable", to: "sable-observatory", subject: "Hello from Lisa", body: "First letter. Receipt attached.", created_at: "2026-09-11T09:00:00Z", thread_id: "thr_1", read_at: null,
    receipt: { receipt: receipt1, signature: "0x" + "ab".repeat(65), signer: "0x0000000000000000000000000000000000000001", payload: payload1 } },
};
const mock = createServer((req, res) => {
  const u = new URL(req.url, "http://x"); const send = (code, body) => { res.writeHead(code, { "content-type": "application/json" }); res.end(JSON.stringify(body)); };
  const auth = req.headers.authorization || ""; seen.auth.push(auth);
  if (auth !== "Bearer " + KEY && !u.pathname.startsWith("/v1/post/handles/")) return send(401, { error: { message: "missing Authorization header", type: "unauthorized" } });
  if (req.method === "GET" && u.pathname === "/v1/post/inbox") {
    const unread = Object.values(letters).filter((l) => !l.read_at).map(({ id, from, to, created_at, thread_id, read_at }) => ({ id, from, to, created_at, thread_id, read_at, bytes: 42 }));
    return send(200, { messages: unread, next_cursor: null });
  }
  let m = u.pathname.match(/^\/v1\/post\/messages\/([^/]+)\/read$/);
  if (m && req.method === "POST") { const l = letters[m[1]]; if (!l) return send(404, { error: { message: "not found" } }); l.read_at = new Date().toISOString(); seen.reads.push(m[1]); return send(200, { ok: true, id: m[1], read_at: l.read_at }); }
  m = u.pathname.match(/^\/v1\/post\/messages\/([^/]+)$/);
  if (m && req.method === "GET") { const l = letters[m[1]]; return l ? send(200, l) : send(404, { error: { message: "not found" } }); }
  if (u.pathname === "/v1/post/settings" && req.method === "PUT") { let b = ""; req.on("data", (c) => (b += c)); req.on("end", () => { seen.settings = JSON.parse(b); send(200, { ...seen.settings, ok: true }); }); return; }
  m = u.pathname.match(/^\/v1\/post\/handles\/([^/]+)$/);
  if (m) return send(200, { handle: m[1], accepts: false, postage_micro_usd: 0, policy: "allowlist" });
  send(404, { error: { message: "not found" } });
});
await new Promise((r) => mock.listen(API_PORT, "127.0.0.1", r));

// ---- the board, letterbox open, polling fast ----
const child = spawn(process.execPath, [join(here, "server.js")], { env: { ...process.env, PORT: String(BOARD_PORT), BOARD_SECRET: "test-secret-test-secret-test-secret-1234", BOARD_DB: ":memory:", PUSH_SECRET: "push-secret-for-the-test", SABLE_API_BASE: "http://127.0.0.1:" + API_PORT, SABLE_POST_KEY: KEY, SABLE_POST_HANDLE: "sable-observatory", POST_WEBHOOK_SECRET: WEBHOOK_SECRET, POST_POLL_MS: "15000" }, stdio: ["ignore", "pipe", "pipe"] });
child.stderr.on("data", (d) => process.stderr.write(d));
let logs = ""; child.stdout.on("data", (d) => { logs += d; });
await new Promise((r) => child.stdout.once("data", r));
const BASE = "http://127.0.0.1:" + BOARD_PORT;
const get = async (p) => { const r = await fetch(BASE + p); return { status: r.status, body: await r.json() }; };

try {
  await wait(3200);   // the start poll runs 2 s after boot
  let s = await get("/post/status");
  ok(s.body.on === true && s.body.handle === "sable-observatory", "letterbox open with the handle");
  ok(s.body.count === 1 && s.body.last_poll && !s.body.last_error, "first poll stored one letter without error (" + JSON.stringify(s.body) + ")");
  let m = await get("/post/messages");
  ok(m.status === 200 && m.body.messages.length === 1, "one letter served");
  const L = m.body.messages[0] || {};
  ok(L.from === "lisa-on-sable" && L.subject === "Hello from Lisa" && L.body === "First letter. Receipt attached.", "letter fields");
  ok(L.receipt === receipt1 && L.signature === "0x" + "ab".repeat(65) && L.signer === "0x0000000000000000000000000000000000000001", "receipt envelope served");
  ok(L.payload && L.payload.body_fp === "9a1c00e4" && L.payload.postage_micro_usd === 0, "decoded payload served");
  ok(!JSON.stringify(m.body).includes(KEY), "the key never appears in a public answer");
  ok(seen.reads.includes("pm_test1"), "the letter was marked read at Sable");
  ok(seen.auth.some((a) => a === "Bearer " + KEY), "the board authenticated with the key");
  // a second letter, announced by a signed webhook
  const payload2 = { ...payload1, id: "pm_test2", created_at: "2026-09-11T09:05:00Z", body_fp: "77aa" };
  letters.pm_test2 = { id: "pm_test2", from: "lisa-on-sable", to: "sable-observatory", subject: "Second", body: "Two.", created_at: "2026-09-11T09:05:00Z", thread_id: "thr_1", read_at: null,
    receipt: { receipt: Buffer.from(JSON.stringify(payload2)).toString("base64url"), signature: "0x" + "cd".repeat(65), signer: "0x0000000000000000000000000000000000000001", payload: payload2 } };
  const ev = JSON.stringify({ type: "post_received", data: { message_id: "pm_test2", from: "lisa-on-sable", to: "sable-observatory" } });
  const bad = await fetch(BASE + "/post/webhook", { method: "POST", headers: { "content-type": "application/json", "x-sable-signature": "sha256=" + "00".repeat(32) }, body: ev });
  ok(bad.status === 401, "a webhook with a wrong signature is refused (" + bad.status + ")");
  const sig = "sha256=" + createHmac("sha256", WEBHOOK_SECRET).update(ev).digest("hex");
  const good = await fetch(BASE + "/post/webhook", { method: "POST", headers: { "content-type": "application/json", "x-sable-signature": sig, "x-sable-event": "post_received" }, body: ev });
  ok(good.status === 200, "a signed webhook is accepted");
  await wait(1200);
  s = await get("/post/status");
  ok(s.body.count === 2, "the webhook made the board fetch the second letter (count " + s.body.count + ")");
  m = await get("/post/messages");
  ok(m.body.messages[0].id === "pm_test2" && m.body.messages[1].id === "pm_test1", "newest letter first");
  // the admin poll needs the secret
  const noSecret = await fetch(BASE + "/post/poll", { method: "POST" });
  ok(noSecret.status === 401, "admin poll without the secret is refused");
  const adm = await fetch(BASE + "/post/poll", { method: "POST", headers: { "x-push-secret": "push-secret-for-the-test" } });
  ok(adm.status === 200 && (await adm.json()).count === 2, "admin poll answers with the status");
  ok((await get("/health")).body.letterbox === true, "health says the letterbox is open");
} finally {
  child.kill(); mock.close();
}
console.log(fails.length ? "FAILED:\n- " + fails.join("\n- ") : "letterbox: all checks passed");
process.exit(fails.length ? 1 : 0);
