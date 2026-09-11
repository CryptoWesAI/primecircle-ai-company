// Serves ../site over plain HTTP for tests that need a real origin (ES modules
// cannot be imported from file:// pages). No caching, no directory listing.
//   node static-server.mjs [port]
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname, normalize } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
const root = join(dirname(fileURLToPath(import.meta.url)), "..", "site");
const port = Number(process.argv[2] || 8792);
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".mp3": "audio/mpeg", ".ogg": "audio/ogg", ".wav": "audio/wav", ".jpg": "image/jpeg", ".jpeg": "image/jpeg" };
createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (p.endsWith("/")) p += "index.html";
  const file = normalize(join(root, p));
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  try { const data = await readFile(file); res.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream", "Cache-Control": "no-store" }); res.end(data); }
  catch { res.writeHead(404, { "Content-Type": "text/plain" }); res.end("not found"); }
}).listen(port, "127.0.0.1", () => console.log("static site on http://127.0.0.1:" + port + "/"));
