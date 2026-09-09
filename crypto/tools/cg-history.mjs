// Market-cap arc per token from CoinGecko's public API (no key): genesis date, all-time-high
// price with its date, all-time-low with its date, current price and market cap, drawdown
// from the high, community counts, and the cap one year ago when the 365-day chart is open.
// (The full-history chart needs a paid key since 2024; /coins/{id} does not.)
//   node cg-history.mjs [id,id,...]   -> prints a markdown table and writes cg-history.json next to it
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
const ids = (process.argv[2] || "automata,marlin,secret,pha,opengradient,nillion,iexec-rlc,oasis-network,akash-network,virtual-protocol,bittensor,near").split(",");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fmt = (v) => v == null ? "?" : v >= 1e9 ? "$" + (v / 1e9).toFixed(2) + "B" : v >= 1e6 ? "$" + (v / 1e6).toFixed(1) + "M" : "$" + Math.round(v).toLocaleString("en-US");
const day = (s) => s ? String(s).slice(0, 10) : "?";
async function getJson(url) {
  for (let t = 0; t < 4; t++) {
    const r = await fetch(url, { headers: { accept: "application/json" } });
    if (r.status === 429) { await sleep(20000 * (t + 1)); continue; }
    if (!r.ok) return { error: "http " + r.status };
    return r.json();
  }
  return { error: "rate limited" };
}
const out = [];
for (const id of ids) {
  const c = await getJson(`https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&market_data=true&community_data=true&developer_data=false&sparkline=false`);
  if (c.error) { out.push({ id, error: c.error }); await sleep(3000); continue; }
  const m = c.market_data || {}, cd = c.community_data || {};
  const row = {
    id, name: c.name, symbol: (c.symbol || "").toUpperCase(), genesis_date: c.genesis_date || null,
    rank: c.market_cap_rank || null, price: m.current_price?.usd ?? null, market_cap: m.market_cap?.usd ?? null, fdv: m.fully_diluted_valuation?.usd ?? null,
    volume_24h: m.total_volume?.usd ?? null, ath_price: m.ath?.usd ?? null, ath_date: day(m.ath_date?.usd), ath_change_pct: m.ath_change_percentage?.usd != null ? Math.round(m.ath_change_percentage.usd) : null,
    atl_price: m.atl?.usd ?? null, atl_date: day(m.atl_date?.usd), change_1y_pct: m.price_change_percentage_1y != null ? Math.round(m.price_change_percentage_1y) : null,
    circulating: m.circulating_supply ?? null, total_supply: m.total_supply ?? null, max_supply: m.max_supply ?? null,
    twitter_followers: cd.twitter_followers ?? null, telegram_users: cd.telegram_channel_user_count ?? null, reddit_subscribers: cd.reddit_subscribers ?? null,
    categories: (c.categories || []).slice(0, 6), homepage: (c.links?.homepage || []).find(Boolean) || null, fetched_at: new Date().toISOString(),
  };
  // implied cap at the price high, with today's circulating supply: an upper-ish bound, since supply usually grew since then
  row.cap_at_ath_price_today_supply = row.ath_price != null && row.circulating != null ? row.ath_price * row.circulating : null;
  await sleep(3000);
  const chart = await getJson(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=365&interval=daily`);
  if (!chart.error && Array.isArray(chart.market_caps) && chart.market_caps.length) {
    const caps = chart.market_caps.filter((p) => p[1] > 0);
    const hi = caps.reduce((a, p) => (p[1] > a[1] ? p : a), caps[0]), lo = caps.reduce((a, p) => (p[1] < a[1] ? p : a), caps[0]);
    row.cap_1y_ago = caps[0][1]; row.cap_1y_ago_day = day(new Date(caps[0][0]).toISOString());
    row.cap_1y_high = hi[1]; row.cap_1y_high_day = day(new Date(hi[0]).toISOString()); row.cap_1y_low = lo[1]; row.cap_1y_low_day = day(new Date(lo[0]).toISOString());
  } else row.chart_error = chart.error || "no series";
  out.push(row);
  await sleep(3000);
}
writeFileSync(join(here, "cg-history.json"), JSON.stringify({ fetched_at: new Date().toISOString(), source: "https://api.coingecko.com/api/v3/coins/{id} and /market_chart?days=365", rows: out }, null, 1));
console.log("| token | genesis | price ATH (day) | from ATH | cap now | cap 1y ago | 1y high (day) | X followers | Telegram |");
console.log("|---|---|---|---|---|---|---|---|---|");
for (const o of out) console.log(o.error ? `| ${o.id} | error: ${o.error} |` : `| ${o.symbol} ${o.name} | ${o.genesis_date || "?"} | $${o.ath_price} (${o.ath_date}) | ${o.ath_change_pct}% | ${fmt(o.market_cap)} | ${fmt(o.cap_1y_ago)} (${o.cap_1y_ago_day || "?"}) | ${fmt(o.cap_1y_high)} (${o.cap_1y_high_day || "?"}) | ${o.twitter_followers ?? "?"} | ${o.telegram_users ?? "?"} |`);
