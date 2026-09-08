# Sable MCP Gateway: what was announced, what the docs say, what the deployment answers

Date: 2026-09-08. Author: founder's workspace, independent of Sable. Disclosure: the founder holds SABL.

## 1. The claim

Sable posted on X (text pasted by the founder, 8 Sep 2026):

> MCP Gateway is live on Sable. MCP tools, with budgets and policies around them. Every call is metered and receipted. Shipped.

## 2. What the docs describe

Source: https://www.buildsable.com/docs/mcp-gateway, fetched as raw HTML on 2026-09-08 about 14:15 UTC and converted to text locally (not a WebFetch summary). The page appeared in the docs sidebar between "MCP server" and "Sable Services"; it was not in the sidebar recorded on 2026-08-29.

Mechanism, in Sable's own words where it matters:

- "It is a tool firewall with a ledger." You register a third-party MCP server (name, URL, the upstream's auth header, an allowlist of tool names, a per-call price). Sable returns a `proxy_url`. The agent connects to the proxy with a normal `sk-sable_` key.
- Every `tools/call` through the proxy is allowlist-checked before the upstream is dialed (refusal is a 403 `policy_denied`), metered as one `mcp_call` usage event at the server's per-call price, and receipted with a signed metadata-only receipt of kind `mcp_call`.
- Two allowlists intersect: the server's allowlist and the calling key's policy `allowed_tools`. `tools/list` is filtered to the effective allowlist, so the agent never sees a tool it may not call.
- The receipt carries the tool name, a sha256 fingerprint of `name|arguments`, a fingerprint of the result, latency, cost in micro-USD, the policy id and hash, `node_id`, timestamp. It arrives in the `x-sable-receipt*` headers and in `result._meta.sable_receipt`. Verifiable through the public `POST /v1/receipts/verify`.
- Billing status: `ok`, `tool_error` and `upstream_error` are billed ("the upstream did the work"); `error` (unreachable, timeout, unusable answer) is recorded at zero cost.
- Default price: the deployment's `SABLE_MCP_PROXY_MICRO_USD_PER_CALL`, "100 µ$ = $0.0001", can only be raised per server.
- Bounds: 60 s upstream timeout, 4 MiB response cap, 50 servers per account, 256 tools per allowlist. Streamable HTTP only, no legacy HTTP+SSE. SSRF checks at registration and at dial time, redirects refused, https required in production.
- Their own caveat: "It does not sandbox the upstream server, cannot see what that server does with the arguments once they arrive, and cannot verify that its result is correct. The proof it gives you is 'this tool was called with these arguments, under these rules, and cost this much', not 'the tool behaved.'"
- Registration "hands Sable a credential" for the upstream, AES-GCM sealed at rest, destroyed on deregister.
- The example receipt on the page is dated `2026-09-04T10:31:02Z`.

Documented endpoints:

| Method | Path | Auth |
| --- | --- | --- |
| POST, GET | `/v1/mcp-servers` | session |
| GET, PATCH, DELETE | `/v1/mcp-servers/:id` | session |
| POST | `/v1/mcp-servers/:id/test` | session |
| POST (JSON-RPC) | `/v1/mcp/servers/:id` | `sk-sable_` key |

## 3. What the public deployment answers

Probes against `https://api.buildsable.com` at 2026-09-08T14:23:33Z, from a Dutch residential connection, with curl. No account, no session; one run with a bogus `sk-sable_bogus` bearer to separate "not routed" from "not authorised".

| Path | Method | Auth | HTTP | Body |
| --- | --- | --- | --- | --- |
| `/v1/mcp-servers` | GET, POST | none | 404 | empty |
| `/v1/mcp-servers` | GET | bogus key | 404 | empty |
| `/v1/mcp-servers/mcp_test` | GET, POST | none | 404 | empty |
| `/v1/mcp-servers/mcp_test/test` | GET, POST | none | 404 | empty |
| `/v1/mcp/servers/mcp_test` | GET, POST | none, bogus key | 404 | empty |
| `/v1/mcp` (the older MCP server) | GET | none | 401 | `missing Authorization header` |
| `/v1/mandates` | GET | none | 401 | `missing Authorization header` |
| `/v1/mandates` | GET | bogus key | 401 | `invalid session token` |
| `/.well-known/oauth-authorization-server` | GET | none | 404 | empty |
| `/.well-known/oauth-protected-resource` | GET | none | 404 | empty |
| `/v1/oauth/register` | GET | none | 404 | empty |

Reading: on this gateway a routed endpoint answers 401 before it looks anything up (`/v1/mandates` with a bogus key says "invalid session token"). Every MCP Gateway path answers 404 with and without a key. At probe time the feature described in the docs is not reachable on the public API host. The same holds for the OAuth 2.1 endpoints that the older "MCP server" docs page lists; the whitepaper's §10 table still says "OAuth 2.1 / DCR is not implemented", which matches the deployment and contradicts that docs page.

What this does not prove: the routes may sit behind a deployment flag (the docs name `SABLE_MCP_PROXY_MICRO_USD_PER_CALL` as a deployment setting), or on a host that is not `api.buildsable.com`. The portal page "Portal → MCP Gateway" could not be checked without an account.

Other surfaces checked the same day:

- Pricing page (`/pricing`): no mention of MCP, per-call prices, or tool calls.
- Billing docs (`/docs/billing`): "MCP Gateway" appears only in the sidebar.
- Whitepaper (watch record, last check 2026-09-08T12:26Z): unchanged since the 2026-09-04 snapshot. It mentions an MCP server on the gateway port and "dispatch / MCP client" in the architecture figure, and lists "Remote MCP server: Built" in §10. It does not mention a tool proxy, per-call tool pricing, tool allowlists, or `mcp_call` receipts.
- Gateway status at 12:26Z: `degraded`, confidential tier failing closed (`measurement_mismatch`, 7,791 consecutive refusals), signer and model count unchanged.

## 4. How it fits the earlier surface

Until now Sable's MCP story was inbound: `POST /v1/mcp` exposes six Sable tools (chat, run code, verify receipt, attestation, balance, models) to an agent. The MCP Gateway is outbound: Sable stands between the agent and someone else's MCP server, and the thing being sold is governance (allowlist, budget, receipt) rather than compute. It reuses the existing pieces: key spend caps, key policies, mandates, the receipt signer, the usage ledger. The new receipt kind `mcp_call` has the same `actions` shape as chat receipts.

Design choices worth noting:

- Pricing per call, not per byte or per second. A cheap tool and an expensive one cost the same unless the registrant raises the price, and Sable does not know what the upstream charges. "Honest budgets" depend on the registrant setting a realistic price.
- The credential for the upstream lives at Sable. That is a custody-of-secrets trade: convenient, and one more place the token can leak from. Their text says sealed at rest, opened at dial time, never logged.
- Only `tools/call` is governed. `resources/read` and `prompts/get` are forwarded unmetered and unreceipted, and sampling, roots, elicitation, logging and completion are refused. So "every call is metered and receipted" means every tool call, not every MCP message.
- Arguments and results cross in-frame only; the receipt holds fingerprints. Same privacy contract as the chat path.

## 5. Open questions

1. When does `POST /v1/mcp-servers` stop answering 404 on `api.buildsable.com`? That is the moment "live" becomes checkable from outside.
2. Will the pricing page or `/v1/models`-style public catalogue show the default per-call price, or is it only in the docs?
3. Does the whitepaper get a new row for the gateway, and does the cover version move this time?
4. Does a `mcp_call` receipt verify through the public verifier with the same signer (`0xf4a6…a812`) as chat receipts? Needs a key.

## 6. Follow-ups considered

- Add `/docs/mcp-gateway` and the docs sidebar to the daily peers watch, so docs additions are recorded with a date.
- Add an hourly unauthenticated probe of `POST /v1/mcp-servers` to the watcher ledger (expect a flip from 404 to 401) so the Observatory can show when the announced route actually lands, the way the burn watch waits for the first burn.
- Neither is built as of this note.
