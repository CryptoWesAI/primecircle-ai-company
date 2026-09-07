// Small admin tasks against the board database, run inside the container:
//   docker exec sable-board node admin.js count
//   docker exec sable-board node admin.js top 10
//   docker exec sable-board node admin.js delete-name "some name"   (a deletion request)
//   docker exec sable-board node admin.js contest                    (standings of the BOARD_CONTEST window, JSON for the winner's page)
//   docker exec sable-board node admin.js run "some name"            (a player's best row with its input log)
import { DatabaseSync } from "node:sqlite";
const db = new DatabaseSync(process.env.BOARD_DB || "/data/board.sqlite");
const [cmd, ...args] = process.argv.slice(2);
if (cmd === "count") console.log(db.prepare("SELECT COUNT(*) AS n FROM scores").get().n);
else if (cmd === "top") console.table(db.prepare("SELECT day, name, handle, score, receipts, wave, duration_ms, verified FROM scores ORDER BY score DESC LIMIT ?").all(Number(args[0] || 10)));
else if (cmd === "delete-name") { const r = db.prepare("DELETE FROM scores WHERE lower(name) = lower(?)").run(String(args[0] || "")); console.log("deleted", r.changes); }
else if (cmd === "contest") {
  const m = String(args[0] || process.env.BOARD_CONTEST || "").match(/^(\d{4}-\d{2}-\d{2})\/(\d{4}-\d{2}-\d{2})$/);
  if (!m) { console.log("usage: contest [YYYY-MM-DD/YYYY-MM-DD], or set BOARD_CONTEST"); process.exit(1); }
  const rows = db.prepare("SELECT name, handle, MAX(score) AS score, wave, duration_ms, day FROM scores WHERE day >= ? AND day <= ? AND verified = 1 AND handle IS NOT NULL AND handle != '' GROUP BY lower(name) ORDER BY score DESC, id ASC LIMIT 25").all(m[1], m[2]);
  console.log(JSON.stringify({ start: m[1], end: m[2], standings: rows }, null, 2));
}
else if (cmd === "run") console.log(JSON.stringify(db.prepare("SELECT day, seed, name, handle, score, receipts, refused, wave, duration_ms, verified, log FROM scores WHERE lower(name) = lower(?) ORDER BY score DESC LIMIT 1").get(String(args[0] || "")) || null));
else { console.log("commands: count | top [n] | delete-name <name> | contest [start/end] | run <name>"); process.exit(1); }
