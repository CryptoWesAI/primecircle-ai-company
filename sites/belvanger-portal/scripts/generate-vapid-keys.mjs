// Genereert een VAPID-sleutelpaar voor Web Push en print het als .env-regels.
//
//   node scripts/generate-vapid-keys.mjs
//
// Doe dit EEN keer per omgeving en bewaar de private key alleen in de gitignored
// .env op de VPS. Rouleren van dit paar maakt elke bestaande push-subscription
// ongeldig: het publieke deel zit vastgeklonken in de subscription die de browser
// van elke klant heeft aangemaakt. Kwijtraken betekent dus dat iedere klant
// opnieuw op "Zet meldingen aan" moet tikken, niet dat er data weg is.

import { generateVapidKeys } from "../src/webpush.js";

const { publicKey, privateKey } = generateVapidKeys();

console.log(`
# --- Web Push (VAPID) --------------------------------------------------------
# VAPID_PUBLIC_KEY is niet geheim: de browser krijgt hem via /api/push/key.
# VAPID_PRIVATE_KEY is WEL geheim en hoort nergens anders dan in .env.
# VAPID_SUBJECT moet een mailto: of https: zijn waarop een push-dienst je kan
# bereiken als je verkeer een probleem veroorzaakt (RFC 8292 eist een contact).
VAPID_PUBLIC_KEY=${publicKey}
VAPID_PRIVATE_KEY=${privateKey}
VAPID_SUBJECT=mailto:info@belvanger.nl
`.trim());
