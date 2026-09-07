// Small admin tasks against the board database, run inside the container:
//   docker exec sable-board node admin.js count
//   docker exec sable-board node admin.js top 10
//   docker exec sable-board node admin.js delete-name "some name"   (a deletion request)
import { DatabaseSync } from "node:sqlite";
const db = new DatabaseSync(process.env.BOARD_DB || "/data/board.sqlite");
const [cmd, ...args] = process.argv.slice(2);
if (cmd === "count") console.log(db.prepare("SELECT COUNT(*) AS n FROM scores").get().n);
else if (cmd === "top") console.table(db.prepare("SELECT day, name, handle, score, receipts, wave, duration_ms FROM scores ORDER BY score DESC LIMIT ?").all(Number(args[0] || 10)));
else if (cmd === "delete-name") { const r = db.prepare("DELETE FROM scores WHERE lower(name) = lower(?)").run(String(args[0] || "")); console.log("deleted", r.changes); }
else { console.log("commands: count | top [n] | delete-name <name>"); process.exit(1); }
