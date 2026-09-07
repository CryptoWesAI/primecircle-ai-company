// The app's icons, rendered from the site's own mark: 192 and 512 (the mark on
// its dark tile), a maskable 512 (the mark small, on the void, for Android's
// shapes), and a 96 monochrome badge for the notification bar.
//   node tools/make-icons.mjs
import puppeteer from "puppeteer-core";
import { existsSync, readFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
const site = join(here, "..", "site");
const exe = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"].find((p) => existsSync(p));
const svg = readFileSync(join(site, "sable-mark.svg"), "utf8");
const glyph = (svg.match(/<g fill="#ece8e0"[\s\S]*?<\/g>/) || [""])[0].replace('fill="#ece8e0"', 'fill="#ffffff"');
const page = (inner, size, bg) => `<!doctype html><html><body style="margin:0;background:${bg};width:${size}px;height:${size}px;overflow:hidden">${inner}</body></html>`;
mkdirSync(join(site, "icons"), { recursive: true });
const b = await puppeteer.launch({ executablePath: exe, headless: true });
try {
  const p = await b.newPage();
  const shot = async (html, size, file, transparent) => {
    await p.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
    await p.setContent(html);
    await p.screenshot({ path: join(site, "icons", file), clip: { x: 0, y: 0, width: size, height: size }, omitBackground: !!transparent });
    console.log("wrote icons/" + file);
  };
  const full = (size) => page(`<div style="width:${size}px;height:${size}px">${svg.replace(/width="32" height="32"/, `width="${size}" height="${size}"`)}</div>`, size, "#05070A");
  await shot(full(512), 512, "icon-512.png");
  await shot(full(192), 192, "icon-192.png");
  const inner = Math.round(512 * 0.62), off = Math.round((512 - inner) / 2);
  await shot(page(`<div style="position:absolute;left:${off}px;top:${off}px;width:${inner}px;height:${inner}px">${svg.replace(/width="32" height="32"/, `width="${inner}" height="${inner}"`)}</div>`, 512, "#05070A"), 512, "maskable-512.png");
  await shot(page(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="96" height="96">${glyph}</svg>`, 96, "transparent"), 96, "badge-96.png", true);
} finally { await b.close(); }
