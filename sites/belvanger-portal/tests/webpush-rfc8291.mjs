// Valideert onze eigen Web Push-crypto tegen het officiële testvector uit
// RFC 8291 Appendix A ("Push Message Encryption Example").
//
// Waarom dit bestaat: we hebben de `web-push`-package niet, dus er is geen tweede
// implementatie die ons corrigeert. Zonder deze test zou de eerste keer dat we
// ontdekken dat de HKDF-info-strings of de header-layout fout zijn, een stille
// mislukte melding op de telefoon van een klant zijn. Het vector prikt precies de
// stukken die je stil verkeerd kunt doen: de "WebPush: info"-constructie, de
// aes128gcm-sleutelafleiding en de 21-byte header met salt, record size en keyid.
//
// Draaien: node tests/webpush-rfc8291.mjs

import assert from "node:assert/strict";
import { encryptPayload, generateVapidKeys } from "../src/webpush.js";

// --- RFC 8291 Appendix A, letterlijk ---------------------------------------
const PLAINTEXT = "When I grow up, I want to be a watermelon";
const UA_PUBLIC = "BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV-JvLexhqUzORcxaOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw4";
const AUTH_SECRET = "BTBZMqHH6r4Tts7J_aSIgg";
const AS_PRIVATE = "yfWPiYE-n46HLnH0KqZOF1fJJU3MYrct3AELtAQ-oRw";
const SALT = "DGv6ra1nlYgDCS1FRnbzlw";
const EXPECTED_BODY =
  "DGv6ra1nlYgDCS1FRnbzlwAAEABBBP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A_yl95bQpu6cVPTpK4Mqgkf1CXztLVBSt2Ks3oZwbuwXPXLWyouBWLVWGNWQexSgSxsj_Qulcy4a-fN";

const b64url = (buf) => Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const body = encryptPayload(PLAINTEXT, UA_PUBLIC, AUTH_SECRET, { asPrivate: AS_PRIVATE, salt: SALT });
assert.equal(b64url(body), EXPECTED_BODY, "aes128gcm-body wijkt af van RFC 8291 Appendix A");

// Header-layout apart nagelopen, zodat een fout hier een duidelijke melding geeft
// in plaats van alleen "de hele body klopt niet".
assert.equal(body.subarray(0, 16).toString("base64url"), SALT, "salt hoort de eerste 16 bytes te zijn");
assert.equal(body.readUInt32BE(16), 4096, "record size hoort 4096 te zijn");
assert.equal(body.readUInt8(20), 65, "keyid-lengte hoort 65 te zijn (ongecomprimeerd P-256-punt)");
assert.equal(body.readUInt8(21), 4, "keyid hoort met 0x04 te beginnen");

// --- Randgevallen die we zelf afdwingen ------------------------------------
assert.throws(() => encryptPayload("x", b64url(Buffer.alloc(64)), AUTH_SECRET), /p256dh moet 65 bytes/);
assert.throws(() => encryptPayload("x", UA_PUBLIC, b64url(Buffer.alloc(8))), /auth moet 16 bytes/);
assert.throws(() => encryptPayload("x".repeat(4100), UA_PUBLIC, AUTH_SECRET), /te groot voor één record/);

// Twee opeenvolgende versleutelingen van dezelfde payload moeten verschillen: als
// ze gelijk zijn, hergebruiken we salt of efemere sleutel en is de encryptie stuk.
const a = encryptPayload(PLAINTEXT, UA_PUBLIC, AUTH_SECRET);
const b = encryptPayload(PLAINTEXT, UA_PUBLIC, AUTH_SECRET);
assert.notEqual(b64url(a), b64url(b), "salt/efemere sleutel wordt hergebruikt");

// --- VAPID-sleutelvorm -----------------------------------------------------
const keys = generateVapidKeys();
assert.equal(Buffer.from(keys.publicKey, "base64url").length, 65, "VAPID-publiek moet 65 bytes zijn");
assert.equal(Buffer.from(keys.publicKey, "base64url")[0], 4, "VAPID-publiek moet ongecomprimeerd zijn");
assert.equal(Buffer.from(keys.privateKey, "base64url").length, 32, "VAPID-privaat moet 32 bytes zijn");

console.log("OK  Web Push-crypto klopt met RFC 8291 Appendix A (body, header, randgevallen, VAPID-vorm).");
