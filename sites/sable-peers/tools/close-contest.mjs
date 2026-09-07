// Closes a Gatekeeper contest: reads the standings from the board on the VPS,
// replays the winner's log with the core for the details the card needs, and
// writes the DATA block of site/winner.js. Then deploy, and the page is up.
//   node tools/close-contest.mjs            (window from the board's BOARD_CONTEST)
//   node tools/close-contest.mjs --dry      (print, write nothing)
// Needs the VPS key at ~/.ssh/primecircle_codex_vps.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { replay } from "../site/game/core.js";
const here = dirname(fileURLToPath(import.meta.url));
const WINNER = join(here, "..", "site", "winner.js");
const dry = process.argv.includes("--dry");
const ssh = (cmd) => execFileSync("ssh", ["-i", join(process.env.HOME || process.env.USERPROFILE, ".ssh", "primecircle_codex_vps"), "-o", "BatchMode=yes", "root@31.97.123.34", cmd], { encoding: "utf8", timeout: 60000 });

const contest = JSON.parse(ssh("docker exec sable-board node admin.js contest"));
if (!contest.standings.length) { console.error("no standings inside the window"); process.exit(1); }
const top = contest.standings[0];
const row = JSON.parse(ssh(`docker exec sable-board node admin.js run ${JSON.stringify(top.name)}`) || "null");
if (!row) { console.error("winner's row not found"); process.exit(1); }

// the details: from the replay when the run carries a log, from the row alone when it predates the replay check
let details = { refused: row.refused, receipts: row.receipts, loops: undefined, leaked: undefined, cleanWaves: undefined, verified: "hash" };
if (row.log) {
  const rp = replay(String(row.seed), JSON.parse(row.log));
  if (rp.score !== row.score) { console.error("the stored log does not reproduce the stored score: " + rp.score + " vs " + row.score); process.exit(1); }
  details = { refused: rp.refusedBad, receipts: rp.receipts, loops: rp.refusedLoops, leaked: rp.leaked, cleanWaves: rp.cleanWaves, verified: "replay" };
}

const src = readFileSync(WINNER, "utf8");
const prizes = (src.match(/  prizes: \[[\s\S]*?\n  \],\n/) || [""])[0];
const data = `const DATA = {
  final: true,
  contest: {
    start: ${JSON.stringify(contest.start)},
    end: ${JSON.stringify(contest.end)},
    frozenAt: ${JSON.stringify(contest.end + "T23:59:59Z")},
    verified: ${JSON.stringify(details.verified)},
  },
  winner: {
    name: ${JSON.stringify(row.name)},
    handle: ${JSON.stringify(row.handle || "")},
    score: ${row.score},
    wave: ${row.wave},
    duration_ms: ${row.duration_ms},
    refused: ${details.refused}, loops: ${details.loops ?? "undefined"}, leaked: ${details.leaked ?? "undefined"}, cleanWaves: ${details.cleanWaves ?? "undefined"}, receipts: ${details.receipts},
    day: ${JSON.stringify(row.day)},
  },
${prizes}  standings: [
${contest.standings.slice(0, 10).map((r) => `    { name: ${JSON.stringify(r.name)}, handle: ${JSON.stringify(r.handle || "")}, score: ${r.score}, wave: ${r.wave}, duration_ms: ${r.duration_ms}, day: ${JSON.stringify(r.day)} },`).join("\n")}
  ],
};
`;
const out = src.replace(/const DATA = \{[\s\S]*?\n\};\n/, data);
if (out === src) { console.error("DATA block not found in winner.js"); process.exit(1); }
console.log(data);
if (dry) { console.log("(dry run, nothing written)"); process.exit(0); }
writeFileSync(WINNER, out);
console.log("written: site/winner.js. Now: bash deploy-to-vps.sh, then the strip links to winner.html.");
