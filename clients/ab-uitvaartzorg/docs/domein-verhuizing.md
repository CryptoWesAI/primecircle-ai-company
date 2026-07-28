# Verhuizing naar het eigen domein van AB Uitvaartzorg

Wat er moet gebeuren om deze site van `ab.primecircle.cloud` naar
`abaandachtenbetrokkenheiduitvaartzorg.nl` te verplaatsen, en wat daarvoor al klaar is.

**Stand: 2026-07-28.** Gemeten, niet aangenomen.

## Het goede nieuws: inhoudelijk is de site al klaar

Ik heb de hele `site/`-map doorzocht op verwijzingen naar het tijdelijke adres. Er zijn er
**nul**. De enige plek waar `primecircle.cloud` voorkomt is de Traefik-regel in
`docker-compose.yml`, en dat is precies waar hij hoort.

Sterker nog: de site is al volledig ingericht op haar echte domein. Gecontroleerd:

| Wat | Waarde |
|---|---|
| `rel="canonical"` | `https://abaandachtenbetrokkenheiduitvaartzorg.nl/...` |
| `hreflang` NL/EN | zelfde domein |
| `og:url` en `og:image` | zelfde domein |
| JSON-LD (`@id`, `url`) | zelfde domein |
| `sitemap.xml` | zelfde domein |
| `robots.txt` sitemapregel | zelfde domein |

De chatwidget praat via hetzelfde adres als de pagina waarop hij staat (`API_BASE` wordt bij
het bouwen op "auto" gezet), dus die verhuist vanzelf mee. Geen enkele instelling aan te passen.

## Wat er wél moet gebeuren

1. **DNS.** Een A-record voor het domein naar `31.97.123.34`. Doe dit als laatste stap; zodra
   dit staat gaat het echte verkeer naar de nieuwe site.
2. **De Traefik-regel** in `docker-compose.yml`:
   `Host(\`ab.primecircle.cloud\`)` wordt `Host(\`abaandachtenbetrokkenheiduitvaartzorg.nl\`)`,
   plus eventueel `www.`. Daarna `docker compose up -d --build`.
3. **HAAL DE NOINDEX-REGEL WEG.** Zie de waarschuwing hieronder. Dit is de gevaarlijkste stap
   van de hele verhuizing, want als je hem vergeet werkt alles en vindt niemand haar.
4. **Let's Encrypt** geeft automatisch een certificaat af zodra DNS klopt en de container
   draait. Niets handmatigs.
5. **De oude site.** Op `abaandachtenbetrokkenheiduitvaartzorg.nl` staat op dit moment een
   werkende site (nginx, HTTP 200). Die wordt door de DNS-wijziging vervangen. Bespreek met
   Alien wat daarmee gebeurt en zorg dat er een kopie van is voordat je omzet.

## Waarschuwing: de noindex-regel die ik heb toegevoegd

`docker-compose.yml` bevat sinds 28 juli deze twee regels:

```
- "traefik.http.middlewares.ab-noindex.headers.customresponseheaders.X-Robots-Tag=noindex, nofollow"
- "traefik.http.routers.ab.middlewares=ab-noindex@docker"
```

**Waarom ze er staan.** Deze illustratieversie is een complete kopie van een site die op haar
eigen domein al live staat. De pagina's zeggen zelf `robots: index, follow` en `robots.txt`
staat op `Allow: /`. Zonder deze regel nodigt de kopie zoekmachines uit om binnen te komen, en
een tweede volledige versie van een bestaande onderneming kan haar eigen vindbaarheid schaden.
De `canonical` wijst weliswaar naar het echte domein en dat helpt, maar dat is een hint, geen
slot.

**Waarom ze in de compose staan en niet in de HTML.** Die HTML verhuist mee. Op haar eigen
domein moet de site juist gevonden worden. Door het aan het tijdelijke adres te hangen
verdwijnt de blokkade vanzelf zodra dat adres verdwijnt, mits je stap 3 hierboven doet.

## Waar de bron staat, en waarom dat aandacht verdient

De canonieke bron van de website is `C:/Users/wfvis/Documents/PrimeCircle` (25 items, 3,2 MB).
`assemble.mjs` kopieert die map over `deploy/site/` heen.

**Dat is een echte valkuil en hij heeft me op 28 juli te pakken gehad.** Ik had de
privacycorrectie in `deploy/site/` gezet, en de eerstvolgende `node assemble.mjs` gooide hem weg
zonder iets te melden. Elke inhoudelijke wijziging aan deze site hoort in
`Documents/PrimeCircle`, nooit in `deploy/site/`.

De bronmap staat buiten git en buiten de nachtelijke back-up. Het is niet onherstelbaar, want
`deploy/site/` staat wél in de klantrepo op GitHub en is vrijwel identiek (assemble voegt alleen
de scripttag toe). Maar als je die map ooit kwijtraakt moet je het uit de gebouwde kopie
terugpuzzelen. Overweeg hem in git te zetten, of in de back-uptaak op te nemen.

## Wat er bij een verhuizing NIET meeverhuist

- **De bezoekstatistieken.** Die staan in het Docker-volume `ab-uitvaartzorg-data`
  (`analytics.jsonl`, `pageviews.jsonl`). Het volume blijft bestaan bij een herbouw, dus bij een
  domeinwissel op dezelfde VPS blijft alles staan. Verhuis je naar een andere machine, neem dan
  het volume mee; het zit in de nachtelijke back-up als `ab-uitvaartzorg-data.tar.gz`.
- **De sleutels.** `.env` staat niet in git en gaat versleuteld mee met `deploy-to-vps.sh`. Ook
  meegenomen in de nachtelijke back-up (`env-bestanden.tar.gz`).

## Voordat je omzet: drie dingen die met Alien besproken moeten worden

1. **De privacyverklaring.** Op 28 juli gecorrigeerd omdat de oude tekst aantoonbaar onjuist was
   (geen woord over de AI-chat, en de claim dat er geen trackingtechnieken worden gebruikt). Zij
   is de verwerkingsverantwoordelijke; het is haar document en zij moet het nalezen.
2. **De verwerkersovereenkomst.** Zie `docs/juridisch/verwerkersovereenkomst-concept.md`. Er is
   er nog geen, terwijl er wel al persoonsgegevens door de chat gaan. Voor haar eigen domein,
   met echt verkeer, is dat een grotere zaak dan nu.
3. **De AI-chat zelf.** Wil zij die überhaupt op haar echte site? Nu is het een illustratie
   zonder publiek. Straks typen echte nabestaanden erin, en dan gaat die tekst naar een taalmodel
   in de Verenigde Staten. Dat is een keuze die zij bewust moet maken, niet een functie die
   meelift met een verhuizing.
