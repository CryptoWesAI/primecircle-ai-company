# Chat-assistent: herbruikbaar per klant

Kennis-gegronde chatassistent, **config-driven en herbruikbaar**: dezelfde code
draait voor elke klant; alleen de map `customers/<klant>/` verschilt. Eerste
echte klant: AB Uitvaartzorg. Nieuwe klant toevoegen? Zie `customers/README.md`.

Volledige spec: `../clients/ab-uitvaartzorg/docs/chatbot-ab-uitvaartzorg-spec.md`.

## Hoe het werkt

- `server.js`: klein Node-endpoint (geen npm-dependencies), config-driven.
  Laadt `customers/$CUSTOMER/` (standaard `ab-uitvaartzorg`), serveert
  `/api/config` (branding voor het widget) en stuurt chats door naar
  **OpenRouter** (`google/gemini-2.5-flash-lite`, instelbaar via `OPENROUTER_MODEL`).
  De API-sleutel staat hier (server-side), **nooit** in de browser.
- `customers/<klant>/`, per klant: `config.json` (naam, contactpersoon,
  telefoon, kleuren, talen), `system-prompt.txt` (toon/grenzen) en
  `knowledge-base.md` (de enige toegestane bron). Beide teksten worden bij élk
  verzoek volledig meegestuurd (*context stuffing* — geen vector-database nodig).
- `public/widget.js` + `widget.css`: het **generieke** insluitbare chatvenster.
  Het haalt naam/telefoon/kleuren/talen op via `/api/config`, dus dezelfde
  widget werkt voor elke klant. Met de verplichte AI-transparantie (Art. 50) en
  een altijd zichtbare "Bel"-knop.
- **Extra functionaliteiten:**
  - *Rate-limiting* op `/api/chat` (per IP, `RATE_LIMIT_PER_MIN`, standaard 30 →
    429 met een vriendelijke boodschap) tegen misbruik/kosten.
  - *`/health`* endpoint voor monitoring; *access-logging* naar stdout.
  - *Analytics* (privacy-veilig): per gesprek een JSONL-regel in `data/` met
    alleen metadata (taal, lengtes, reactietijd, doorverwezen ja/nee). De
    vraagtekst wordt **alleen** bewaard met `LOG_QUESTIONS=true` (privacy-
    afweging). Samenvatting: `node stats.mjs`.
  - *Dashboard* (beveiligd): `/dashboard?token=<DASHBOARD_TOKEN>` toont KPI's,
    gesprekken per dag, talen, doorverwijs-percentage en de FAQ-backlog. Zowel
    `/dashboard` als `/api/stats` vereisen de token; leeg = uitgeschakeld.
  - *Voorbeeldvragen* (chips) uit `config.json` per klant, die bezoekers naar
    beantwoordbare onderwerpen leiden.
- **Standaard geen berichtinhoud opgeslagen**: alleen geanonimiseerde metadata.

Kies de klant lokaal met `$env:CUSTOMER = "<klant>"` vóór `node server.js`
(standaard `ab-uitvaartzorg`).

## Lokaal draaien

Vereist: Node.js 20+ (geen npm-dependencies) en een OpenRouter-sleutel
(aanmaken op https://openrouter.ai/keys). De sleutel staat al in `.env`
(gitignored); dat wordt automatisch geladen.

**Makkelijkste manier:** dubbelklik `start-chatbot.cmd` in de map `chatbot`.
Er opent een venster met "…draait op http://localhost:3100" — laat dat open.

Of handmatig:

```powershell
cd "...\primecircle-ai-company\chatbot"
node server.js
```

> Gebruik **`node server.js`**, niet `npm start`: op Windows blokkeert PowerShell
> standaard `npm.ps1` (foutmelding "running scripts is disabled"). `node` heeft
> daar geen last van, en omdat het endpoint geen dependencies heeft is `npm`
> ook niet nodig.

Open daarna http://localhost:3100 en klik rechtsonder op **"Stel een vraag"**.
Laat het venster open staan zolang je de chat wilt gebruiken.

> De sleutel + het model staan in `.env` (`OPENROUTER_API_KEY`, `OPENROUTER_MODEL`).
> Een ander model kiezen? Pas `OPENROUTER_MODEL` aan (zie https://openrouter.ai/models).

Testvragen: "Wat zijn de kosten?", "Wat is het Afscheidshuus?",
"Wat moet ik doen als iemand is overleden?", "Kost een voorgesprek iets?".
Test ook de grens: "Mijn man is net overleden" → moet rustig doorverwijzen
naar bellen.

## Nog te doen vóór livegang (zie spec §8)

1. Testen + **Alien laat toon en grenzen meelezen en keurt goed.**
2. Kennisbank uitbreiden met veelgestelde vragen die Alien aandraagt.
3. Privacyverklaring uitbreiden met een alinea over de chatassistent.
4. Deployen (kandidaat: Hostinger Node) en het widget insluiten op de site via
   één `<script>`-regel, gericht op de juiste `AB_CHAT_API`-URL.
