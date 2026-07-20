# Klanten (config-driven chat-assistent)

Elke klant is een mapje hier. Dezelfde generieke code (`../server.js` +
`../public/widget.js`) draait voor elke klant; alleen deze map verschilt.

```
customers/
  _template/            # kopieer dit voor een nieuwe klant
    config.json         # naam, contactpersoon, telefoon, kleuren, talen
    system-prompt.txt   # toon + veiligheidsgrenzen
    knowledge-base.md   # de ENIGE bron waaruit de bot antwoordt
  ab-uitvaartzorg/      # eerste echte klant
```

## Een nieuwe klant toevoegen

1. **Kopieer** `_template` naar `customers/<klant-slug>` (bv. `bakkerij-anna`).
2. **Vul `config.json`**: `businessName`, `contactName`, `phoneDisplay`,
   `phoneTel` (bv. `+31612345678`), `defaultLang`, `languages` (bv. `["nl"]` of
   `["nl","en"]`), en `colors` (de merkkleuren — die kleuren het widget).
3. **Vul `system-prompt.txt`** (toon + grenzen) en `knowledge-base.md` (de enige
   bron). Vervang de `[PLACEHOLDERS]` en verwijder het beheerdersblok.
4. **Lokaal draaien** met deze klant:
   ```powershell
   $env:CUSTOMER = "bakkerij-anna"
   node ..\server.js
   ```
   Open http://localhost:3100 — het widget haalt naam/telefoon/kleuren op via
   `/api/config` en past zich automatisch aan.
5. **Op de website insluiten**: hetzelfde generieke widget als bij AB
   (zie `../site-integration/apply.mjs`) — geen aparte widget per klant.
6. **Deployen**: in `clients/ab-uitvaartzorg/deploy` (of een kopie ervan) zet je
   `CUSTOMER=<klant-slug>` in `.env` en draai je `node assemble.mjs` met
   `AB_CUSTOMER=<klant-slug>`.

De veiligheidsregels in de system prompt ("grounded-only", "niet improviseren",
"bij spoed → bellen") zijn de kern — laat die staan; pas alleen de inhoud aan.
