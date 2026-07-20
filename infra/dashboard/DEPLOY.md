# PrimeCircle VPS Control — deploy & bediening

Privé dashboard om per Docker-project de secrets (`.env`) te beheren en de container te
herstarten. **Alleen bereikbaar via het Tailscale-netwerk**, niet op het open internet.

## Architectuur (kort)

- Node-app (zero deps) in `infra/dashboard/` → gedeployed naar `/opt/dashboard`.
- Container publiceert **alleen op `127.0.0.1:8095`** (nooit publiek).
- Bereikbaar gemaakt via **`tailscale serve`** (geldige HTTPS op je tailnet).
- Mount: `/opt` (de per-project `.env`'s), de **docker-socket** (voor `compose up -d`), en
  een volume voor de login-hash + sessiesleutel.
- Beveiliging: privé-only (Tailscale) + app-login (scrypt-hash), sessiecookie
  HttpOnly/Secure/SameSite=Strict, CSRF-header op mutaties, login-ratelimit, security-headers,
  `.env` + backups `chmod 600`, **backup vóór elke wijziging** in `/opt/dashboard-backups/<project>/`.

## Deployen / updaten

```bash
cd infra/dashboard
bash deploy-to-vps.sh            # tar → /opt/dashboard, docker compose up -d --build
```

## Eenmalig: bereikbaar maken op je tailnet

1. **HTTPS-certificaten aanzetten** in de Tailscale-admin (eenmalig, jouw account):
   → https://login.tailscale.com/admin/dns → zet **MagicDNS** aan → zet **HTTPS
   Certificates** aan.
2. Op de VPS de service serveren op je tailnet:
   ```bash
   ssh root@31.97.123.34 'tailscale serve --bg 8095'
   ```
3. Open de HTTPS-URL van de node: `https://primecircle-vps.<jouw-tailnet>.ts.net`
   (exacte naam toont `tailscale serve status`). Eerste keer: stel je wachtwoord in.

## Bediening

- **Per project**: secrets tonen/bewerken/verwijderen, `+ sleutel toevoegen`.
- **Alleen opslaan** = schrijft `.env` (met backup). **Opslaan & herstarten** = schrijft +
  `docker compose up -d` (container wordt hermaakt, zodat de nieuwe waarden echt laden).
- Projecten zonder `.env` (secrets in `docker-compose.yml`) zijn **alleen-lezen** in v1;
  herstarten kan wel.

## Wachtwoord vergeten / resetten

```bash
ssh root@31.97.123.34 "docker exec dashboard sh -c 'rm -f /app/data/auth.json' && docker restart dashboard"
```
Daarna toont het dashboard weer het "wachtwoord instellen"-scherm.

## Een wijziging terugdraaien

Backups staan per project in `/opt/dashboard-backups/<project>/.env.<timestamp>` (verborgen
bestanden — `ls -la`). Terugzetten:
```bash
cp /opt/dashboard-backups/<project>/.env.<timestamp> /opt/<project>/.env
cd /opt/<project> && docker compose up -d
```

## Beveiligingsmodel & grenzen (bewust)

- De app draait als root met de docker-socket + `/opt` → **root-equivalent op de host**.
  Dit is acceptabel **omdat** de app uitsluitend privé (Tailscale) bereikbaar is. Wordt de
  app ooit publiek gezet, dan vervalt dat uitgangspunt.
- v2-hardening (later): privilege-separatie — app schrijft een "apply request", een
  root-side watcher voert de `compose up -d` uit; container houdt dan geen socket meer.
