# Spec — VPS Secrets & Restart Dashboard

> Status: **draft, awaiting founder sign-off** (2026-07-18). Do not build until approved.
> A private, PrimeCircle-styled control panel to manage per-container secrets and restart
> projects on the VPS. Highest-risk category (holds all secrets + can control Docker) →
> security is the primary design driver.

## Goal

One place to see, per Docker project, which secrets belong to it, edit/add/delete them, and
apply the change by recreating the container — so nothing lives in scattered `.env` files in
the founder's head.

## Scope — v1

- List the VPS projects and their env files. Env files are **auto-discovered**: the
  top-level `/opt/<project>/.env` **plus any `env_file:` paths declared in the project's
  `docker-compose.yml`** (e.g. `primecircle` → `backend/.env`). A project can expose more
  than one env file; each is shown under its path label. Editable projects so far:
  **ab-uitvaartzorg, belvanger, glasservice-siedsma, n8n** (`.env`) and **primecircle**
  (`backend/.env`). More appear automatically as they gain an env file.
- Per project: show each key (values **masked** by default, reveal per-key), **add / edit /
  delete** a key, **save** (writes `.env` + a timestamped backup first).
- **Apply & restart** button per project → `docker compose up -d` in that project dir
  (recreate, so new env is picked up), then show the result + a short log tail + health.
- Show live container status (running / healthy / stopped) per project.

## Non-goals (v1) — deliberately excluded

- ❌ Editing secrets that live in `docker-compose.yml` `environment:` (agent-zero,
  knifensharp, primecircle-*). v1 shows them **read-only** with a note; converting a
  project to `.env` is a later, opt-in step (compose edits are error-prone).
- ❌ Multi-user / roles. Single operator (the founder).
- ❌ Editing compose files, images, or volumes. Secrets + restart only.
- ❌ Public exposure (see access model).

## Access model (founder chose: private-only)

The dashboard is **not reachable from the open internet**. Recommended mechanism:

- **Tailscale (recommended).** Install Tailscale on the VPS + the founder's devices (free,
  personal). The dashboard binds so `dashboard.primecircle.cloud` only answers on the
  tailnet. Works from anywhere the founder's device is (home, mobile) — no dependence on a
  fixed IP. *Rejected alt:* **IP-allowlist via Traefik** — simpler (no VPN app) but breaks
  on the founder's dynamic home IP and on mobile data; kept as a fallback only.
- **Plus app-level login** (defense in depth): a single account, password stored **hashed**
  (bcrypt/scrypt) in the dashboard's own `.env`; session cookie (HttpOnly, Secure,
  SameSite=Strict); login rate-limited. So even on the tailnet, a stray device still needs
  the password.
- TLS stays via Traefik + Let's Encrypt.

## Architecture

- **Small Node app** (minimal deps — same lineage as the chatbot server the founder already
  runs), serving a PrimeCircle-styled UI + a tiny JSON API. Lives in `infra/dashboard/`
  (repo = source of truth), deployed to `/opt/dashboard`.
- **Container** behind the existing Traefik, own network. Bind/gating per the access model.
- **Reads/writes** the per-project `.env` files: mount the specific project dirs (or `/opt`)
  read-write. Enforce `chmod 600` on every `.env` it writes.
- **Backups:** before any write, copy to `/opt/dashboard-backups/<project>/.env.<timestamp>`
  → every change is reversible (a fat-finger never bricks a project silently).

### Restart mechanism (decision + risk)

Changing a `.env` needs `docker compose up -d` (recreate), **not** `docker restart` (keeps
old env). The app therefore needs to drive Docker.

- **v1 (recommended, given private-only access):** mount the Docker socket into the
  dashboard container; the app runs `docker compose up -d` in the target project dir.
  Simplest, fits the all-containerized setup.
- **Risk stated plainly:** Docker-socket access = root-equivalent on the host. If the
  dashboard app is breached, the whole VPS is exposed. The private-only access model is what
  makes this acceptable for a solo personal tool. **Future hardening (v2):** privilege
  separation — the app writes an "apply request", a root-side systemd watcher performs the
  `up -d`; the container never holds the socket.

## UI (PrimeCircle platform style)

Dark theme matching the live platform palette: background navy `#04060A`/`#04121C`, cyan
accents `#18BFFF`/`#17A3EC`, gold accents `#C9972C`/`#F0CB6B`, light text `#E8F2F8`.

- Top bar: PrimeCircle mark + "VPS Control".
- One **card per project**: name, container status pill (running/healthy), key list
  (masked, per-key reveal/edit/delete), "+ add key", **Save**, **Apply & restart**.
- After Apply: inline result (success/fail) + last ~15 log lines + refreshed status.
- Secrets discipline: values masked by default, **never** written to logs, no secret in any
  URL/query, reveal is per-key and ephemeral.

## Build steps

1. Install + configure **Tailscale** on the VPS (founder installs the client on his
   devices — guided).
2. Scaffold the Node app in `infra/dashboard/` (server + API + static UI), PrimeCircle-styled.
3. Secrets layer: parse/serialize `.env` safely (preserve comments/order), write + `chmod
   600` + timestamped backup.
4. Restart layer: `docker compose up -d` in the project dir via mounted socket; capture
   result + log tail + health.
5. Auth layer: hashed single-account login, session cookie, login rate-limit.
6. Dockerfile + compose + `.env.example`; deploy to `/opt/dashboard`, behind Traefik, gated
   to the tailnet.
7. Lock it down: verify it does **not** answer publicly; verify login required; verify a
   test key change + restart round-trips on a **safe** project first (e.g. a throwaway), not
   a client one.

## Verification plan

- From a non-tailnet network: `curl` the public URL → must **fail/timeout** (not reachable).
- From the tailnet: dashboard loads, login required, wrong password rejected + rate-limited.
- Round-trip on a safe/test project: add a dummy key → Save → confirm `.env` + backup on
  disk (via SSH) → Apply → confirm container recreated + healthy → delete the key → restart
  → gone. Use `web-verify` to screenshot the UI at desktop + mobile.
- Confirm no secret value appears in container logs.

## Human-validation checkpoints (founder signs off)

- Before first touching any **client** project (AB, glasservice) through the tool — test on a
  throwaway project first.
- The Tailscale/account setup (identity + network) — founder's call.
- Confirm the Docker-socket tradeoff is understood and accepted for v1.

## Open decision for the founder

1. **Tailscale (recommended) vs IP-allowlist** for private access?
2. Accept the **Docker-socket** approach for v1 (with v2 privilege-separation later), or
   want privilege-separation from the start?
