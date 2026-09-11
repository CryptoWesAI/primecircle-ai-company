// Small admin tasks against the board database, run inside the container:
//   docker exec sable-board node admin.js count
//   docker exec sable-board node admin.js top 10
//   docker exec sable-board node admin.js delete-name "some name"   (a deletion request)
//   docker exec sable-board node admin.js contest                    (standings of the BOARD_CONTEST window, JSON for the winner's page)
//   docker exec sable-board node admin.js run "some name"            (a player's best row with its input log)
//   docker exec sable-board node admin.js flagged                    (runs the referee flagged: out of the contest until reviewed)
//   docker exec sable-board node admin.js unflag "some name"         (a reviewed run counts again)
//   docker exec sable-board node admin.js subs                       (how many phones subscribed to notifications)
//   docker exec sable-board node admin.js push "Title" "Body" [url]  (send a notification to every subscriber)
import { DatabaseSync } from "node:sqlite";
const db = new DatabaseSync(process.env.BOARD_DB || "/data/board.sqlite");
const [cmd, ...args] = process.argv.slice(2);
const BOARD = "http://127.0.0.1:" + (process.env.PORT || 8787);
const API = (process.env.SABLE_API_BASE || "https://api.buildsable.com").replace(/\/+$/, "");
if (cmd === "count") console.log(db.prepare("SELECT COUNT(*) AS n FROM scores").get().n);
else if (cmd === "top") console.table(db.prepare("SELECT day, name, handle, score, receipts, wave, duration_ms, verified, flagged FROM scores ORDER BY score DESC LIMIT ?").all(Number(args[0] || 10)));
else if (cmd === "delete-name") { const r = db.prepare("DELETE FROM scores WHERE lower(name) = lower(?)").run(String(args[0] || "")); console.log("deleted", r.changes); }
else if (cmd === "contest") {
  const m = String(args[0] || process.env.BOARD_CONTEST || "").match(/^(\d{4}-\d{2}-\d{2})\/(\d{4}-\d{2}-\d{2})$/);
  if (!m) { console.log("usage: contest [YYYY-MM-DD/YYYY-MM-DD], or set BOARD_CONTEST"); process.exit(1); }
  const rows = db.prepare("SELECT name, handle, MAX(score) AS score, wave, duration_ms, day FROM scores WHERE day >= ? AND day <= ? AND flagged = 0 AND handle IS NOT NULL AND handle != '' GROUP BY lower(handle) ORDER BY score DESC, id ASC LIMIT 25").all(m[1], m[2]);
  console.log(JSON.stringify({ start: m[1], end: m[2], standings: rows }, null, 2));
}
else if (cmd === "run") console.log(JSON.stringify(db.prepare("SELECT day, seed, name, handle, score, receipts, refused, wave, duration_ms, verified, log FROM scores WHERE lower(name) = lower(?) ORDER BY score DESC LIMIT 1").get(String(args[0] || "")) || null));
else if (cmd === "subs") console.log(db.prepare("SELECT COUNT(*) AS n FROM push_subs").get().n);
else if (cmd === "push") {
  const body = JSON.stringify({ title: String(args[0] || "Sable Observatory"), body: String(args[1] || ""), url: String(args[2] || "/") });
  const r = await fetch("http://127.0.0.1:" + (process.env.PORT || 8787) + "/push/notify", { method: "POST", headers: { "content-type": "application/json", "x-push-secret": process.env.PUSH_SECRET || "" }, body });
  console.log(r.status, await r.text());
}
else if (cmd === "flagged") console.table(db.prepare("SELECT id, day, name, handle, score, refused, wave, duration_ms FROM scores WHERE flagged = 1 ORDER BY score DESC LIMIT 50").all());
else if (cmd === "unflag") { const r = db.prepare("UPDATE scores SET flagged = 0 WHERE lower(name) = lower(?)").run(String(args[0] || "")); console.log("unflagged", r.changes); }
/* the letterbox (Sable's Agent Post). The key is read from the environment and never printed.
     post-status                       what the board knows: open or closed, last check, count
     post-check [handle]               Sable's public answer for the handle (accepts: false is normal with an allowlist)
     post-settings [h1,h2]             allowlist only, zero postage; default allowlist lisa-on-sable
     post-settings-show                the settings as Sable stores them
     post-poll                         read the inbox now
     post-inbox                        the letters the board has stored */
else if (cmd === "post-status") { const r = await fetch(BOARD + "/post/status"); console.log(await r.text()); }
else if (cmd === "post-poll") { const r = await fetch(BOARD + "/post/poll", { method: "POST", headers: { "x-push-secret": process.env.PUSH_SECRET || "" } }); console.log(r.status, await r.text()); }
else if (cmd === "post-check") { const h = String(args[0] || process.env.SABLE_POST_HANDLE || "sable-observatory"); const r = await fetch(API + "/v1/post/handles/" + encodeURIComponent(h)); console.log(r.status, await r.text()); }
else if (cmd === "post-settings" || cmd === "post-settings-show") {
  const key = process.env.SABLE_POST_KEY || ""; if (!key) { console.log("SABLE_POST_KEY is not set in the environment"); process.exit(1); }
  const headers = { authorization: "Bearer " + key, "content-type": "application/json", accept: "application/json" };
  if (cmd === "post-settings-show") { const r = await fetch(API + "/v1/post/settings", { headers }); console.log(r.status, await r.text()); }
  else {
    const allow = String(args[0] || "lisa-on-sable").split(",").map((s) => s.trim().toLowerCase()).filter((s) => /^[a-z0-9-]{1,64}$/.test(s));
    const body = JSON.stringify({ postage_micro_usd: 0, accept_policy: "allowlist", allowlist: allow });
    console.log("PUT /v1/post/settings", body);
    const r = await fetch(API + "/v1/post/settings", { method: "PUT", headers, body }); console.log(r.status, await r.text());
  }
}
else if (cmd === "post-inbox") console.table(db.prepare("SELECT id, from_handle, subject, created_at, received_at, read_marked FROM post_messages ORDER BY created_at DESC LIMIT 20").all());
else { console.log("commands: count | top [n] | delete-name <name> | contest [start/end] | run <name> | flagged | unflag <name> | subs | push | post-status | post-check | post-settings | post-settings-show | post-poll | post-inbox"); process.exit(1); }
