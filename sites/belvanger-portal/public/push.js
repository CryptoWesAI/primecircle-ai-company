// Meldingen (Web Push) en de service-workerregistratie.
//
// Apart bestand en niet in app.js: app.js is het dashboard, dit is de laag die het
// dashboard installeerbaar maakt en meldingen regelt. Ze raken elkaar op precies
// twee plekken, en die staan hieronder benoemd (de uitlogknop en ?call=).
//
// Bewust defensief: op een desktop zonder Notification-API, in een private window, of
// op een server zonder VAPID-sleutels moet dit stil niets doen in plaats van een
// foutmelding in het gezicht van de klant te duwen.

(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

  // --- 0. Op het beginscherm zetten ----------------------------------------
  //
  // Dit staat helemaal bovenaan omdat het `beforeinstallprompt`-event MAAR EEN KEER
  // komt en daarna verdwenen is: te laat een listener aanhangen en de knop is
  // onbereikbaar tot de volgende paginalading. Deferred scripts draaien vóór `load`
  // en Chrome vuurt dit event op/na `load`, dus hier is vroeg genoeg.
  //
  // Bewust alleen Android/Chrome. iOS Safari kent dit event niet en heeft geen enkele
  // API om te installeren (daar is het het Deel-menu, drie stappen diep), dus daar
  // blijft de kaart verborgen in plaats van een knop te tonen die niets doet.
  // Zie CURRENT_STATE.md: iOS is bewust uitgesteld.
  let installPrompt = null;

  // Al geïnstalleerd? Dan is de hele kaart onzin. De PWA draait dan in standalone.
  const isStandalone = window.matchMedia?.("(display-mode: standalone)")?.matches === true;

  function renderInstallCard(mode) {
    const card = $("#installCard");
    const button = $("#installButton");
    const status = $("#installStatus");
    if (!card) return;

    if (mode === "hide") { card.classList.add("is-hidden"); return; }

    if (mode === "dismissed") {
      // Chrome vuurt het event niet opnieuw binnen dezelfde paginalading, dus de knop
      // is nu dood. Weghalen en de handmatige route noemen is eerlijker dan een knop
      // laten staan die niks meer doet.
      button.classList.add("is-hidden");
      status.textContent = "Geen probleem. Je kunt het later altijd nog doen via het menu van Chrome (de drie puntjes rechtsboven) en dan \"App installeren\".";
      status.dataset.kind = "";
      return;
    }

    card.classList.remove("is-hidden");
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    // preventDefault onderdrukt Chrome's eigen installatiebalkje onderaan, zodat er
    // niet twee dingen tegelijk om installatie vragen.
    event.preventDefault();
    installPrompt = event;
    if (!isStandalone) renderInstallCard("show");
  });

  window.addEventListener("appinstalled", () => {
    installPrompt = null;
    renderInstallCard("hide");
  });

  $("#installButton")?.addEventListener("click", async () => {
    const button = $("#installButton");
    if (!installPrompt) { renderInstallCard("dismissed"); return; }
    button.disabled = true;
    try {
      const choice = await installPrompt.prompt();
      // Het event is na één keer prompt() opgebruikt, ongeacht de uitkomst.
      installPrompt = null;
      if (choice?.outcome === "accepted") renderInstallCard("hide");
      else renderInstallCard("dismissed");
    } catch {
      renderInstallCard("dismissed");
    } finally {
      button.disabled = false;
    }
  });

  // --- 1. Terugbellen vanuit een melding -----------------------------------
  //
  // De service worker kan geen tel:-URL openen die op elke Android-versie werkt, dus
  // opent hij /?call=<nummer> en starten wij hier de telefoonapp. Dit moet vóór alles
  // anders gebeuren: de vakman heeft op "Bel terug" getikt en verwacht een gesprek,
  // niet een dashboard.
  const callParam = new URLSearchParams(location.search).get("call");
  if (callParam && /^\+?[0-9\s-]{5,20}$/.test(callParam)) {
    const nummer = callParam.replace(/[\s-]/g, "");
    // URL eerst opschonen, anders belt een refresh of een terugknop opnieuw.
    history.replaceState(null, "", location.pathname);

    // Zichtbare knop ALTIJD klaarzetten, vóór de automatische poging. Android mag een
    // tel:-sprong weigeren omdat een paginalading zelf geen gebruikersgebaar is, en dan
    // gebeurt er zichtbaar niets: de vakman staat dan met een dashboard in zijn hand
    // terwijl hij dacht te bellen. Deze knop is wél een gebaar en werkt overal.
    const bar = document.querySelector("#callBar");
    if (bar) {
      const link = bar.querySelector("#callBarLink");
      link.href = `tel:${nummer}`;
      link.textContent = `Bel ${callParam.trim()}`;
      bar.classList.remove("is-hidden");
      bar.querySelector("#callBarDismiss").addEventListener("click", () => bar.classList.add("is-hidden"));
      // GEEN automatisch verbergen bij visibilitychange. Dat zat er eerst in ("de
      // telefoonapp is open, dus de balk is overbodig"), maar het verbergt de balk ook
      // bij het dichtklappen van het meldingenpaneel of een korte app-wissel. Dan komt
      // de vakman terug op een dashboard zonder belknop en denkt hij dat er niets
      // gebeurd is. De balk blijft nu staan tot hij belt of zelf sluit; hij kan er
      // hoogstens één keer te veel staan, en dat is het minst schadelijke van de twee.
    }

    location.href = `tel:${nummer}`;
  }

  // --- 2. Service worker ----------------------------------------------------
  let registration = null;
  const ready = supported
    ? navigator.serviceWorker.register("/sw.js").then((reg) => { registration = reg; return reg; }).catch((error) => {
        console.warn("service worker registreren mislukt:", error);
        return null;
      })
    : Promise.resolve(null);

  // --- 3. Uitloggen: lokaal opruimen ----------------------------------------
  //
  // De server gooit bij /api/logout de push_devices-rijen van deze gebruiker weg. Wat
  // de server NIET kan: de subscription in deze browser opzeggen en onze caches legen.
  // Capture-fase, zodat dit start voordat app.js zijn eigen handler afrondt met een
  // location.reload().
  $("#logoutButton")?.addEventListener("click", () => {
    if (!supported) return;
    navigator.serviceWorker.ready.then(async (reg) => {
      const subscription = await reg.pushManager.getSubscription().catch(() => null);
      await subscription?.unsubscribe().catch(() => {});
      reg.active?.postMessage({ type: "clear-caches" });
    }).catch(() => {});
  }, { capture: true });

  // --- 3b. Welke service worker draait hier eigenlijk? ----------------------
  //
  // De verwachte versie staat hier hardcoded en wordt bij elke sw.js-wijziging
  // meeverhoogd. Wijkt de gemelde versie af, of antwoordt de worker niet, dan zit deze
  // telefoon vast op een oude worker. Dat is serverside onzichtbaar: een push-dienst
  // meldt "aangenomen" ook als het toestel zich gedraagt als weken terug.
  const VERWACHTE_SW = "2026-07-27-g";

  function meldSwStatus(tekst, kind) {
    const el = $("#swStatus");
    if (!el) return;
    el.textContent = tekst;
    el.dataset.kind = kind || "";
    el.classList.remove("is-hidden");
    // Reparatieknop alleen tonen als er echt iets te repareren valt.
    $("#swRepairButton")?.classList.toggle("is-hidden", kind !== "error");
  }

  async function controleerSwVersie() {
    const reg = await ready;
    if (!reg) return;
    if (!navigator.serviceWorker.controller) {
      meldSwStatus("Deze pagina wordt nog niet door de app-laag bestuurd. Sluit de app helemaal af en open hem opnieuw.", "error");
      return;
    }
    // Eerst Chrome vragen om te kijken of er een nieuwere versie klaarstaat.
    await reg.update().catch(() => {});

    const antwoord = await new Promise((resolve) => {
      const timer = setTimeout(() => resolve(null), 3000);
      const onMessage = (event) => {
        if (event.data?.type !== "version") return;
        clearTimeout(timer);
        navigator.serviceWorker.removeEventListener("message", onMessage);
        resolve(event.data.version);
      };
      navigator.serviceWorker.addEventListener("message", onMessage);
      navigator.serviceWorker.controller.postMessage({ type: "version" });
    });

    if (antwoord === VERWACHTE_SW) {
      meldSwStatus(`App-laag is actueel (${antwoord}).`, "ok");
      return;
    }
    meldSwStatus(
      antwoord
        ? `Je telefoon gebruikt nog een oudere app-laag (${antwoord} in plaats van ${VERWACHTE_SW}). Tik op "Meldingen opnieuw instellen".`
        : "De app-laag reageert niet. Tik op \"Meldingen opnieuw instellen\".",
      "error"
    );
  }

  /**
   * Harde reparatie van een vastgelopen service worker: registratie weg, caches weg,
   * pagina herladen. Bij het herladen registreert push.js een verse worker.
   * Dit is de enige betrouwbare uitweg als een worker blijft hangen, en het moet
   * zelfservice zijn: bij een klant kun je zijn telefoon niet overnemen.
   */
  $("#swRepairButton")?.addEventListener("click", async () => {
    const button = $("#swRepairButton");
    button.disabled = true;
    meldSwStatus("Opnieuw instellen...", "");
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const reg of regs) {
        const sub = await reg.pushManager?.getSubscription().catch(() => null);
        await sub?.unsubscribe().catch(() => {});
        await reg.unregister().catch(() => {});
      }
      if (window.caches) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
      await apiPost("/api/push/unsubscribe", {});
    } catch { /* herladen ruimt de rest op */ }
    location.reload();
  });

  // --- 4. De meldingenkaart -------------------------------------------------
  const card = $("#pushCard");
  if (!card) return;

  const els = {
    title: $("#pushCardTitle"),
    body: $("#pushCardBody"),
    status: $("#pushStatus"),
    enable: $("#pushEnableButton"),
    test: $("#pushTestButton"),
    disable: $("#pushDisableButton"),
  };

  let publicKey = null;

  function urlBase64ToUint8Array(base64) {
    const padded = base64.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const raw = atob(padded);
    return Uint8Array.from(raw, (char) => char.charCodeAt(0));
  }

  async function apiPost(path, body) {
    const response = await fetch(path, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Er ging iets mis.");
    return data;
  }

  function setStatus(message, kind = "") {
    els.status.textContent = message || "";
    els.status.dataset.kind = kind;
  }

  function render(mode) {
    // Drie standen, en per stand precies één voor de hand liggende knop.
    const on = mode === "on";
    els.enable.classList.toggle("is-hidden", on || mode === "blocked");
    els.test.classList.toggle("is-hidden", !on);
    els.disable.classList.toggle("is-hidden", !on);

    if (mode === "on") {
      els.title.textContent = "Meldingen staan aan";
      els.body.textContent = "Je krijgt een melding zodra iemand je belt en je niet opneemt.";
    } else if (mode === "blocked") {
      els.title.textContent = "Meldingen zijn geblokkeerd";
      els.body.textContent = "Je hebt meldingen eerder geweigerd. Zet ze aan via het slotje in de adresbalk, of bij de app-instellingen van je telefoon.";
    } else {
      els.title.textContent = "Krijg een melding zodra je een klant mist";
      els.body.textContent = "Dan hoef je dit dashboard niet in de gaten te houden. Je telefoon trilt binnen een paar seconden.";
    }
    card.classList.remove("is-hidden");
  }

  /**
   * Verzoent wat de BROWSER heeft met wat de SERVER weet. Dit moet bij elke keer
   * openen gebeuren en niet alleen bij de eerste keer: Chrome kan een endpoint
   * roteren of weggooien (data gewist, andere standaardbrowser), en dan denkt de
   * server dat meldingen aanstaan terwijl er niets meer aankomt. Zonder deze stap is
   * dat onzichtbaar tot het moment dat het ertoe doet.
   */
  async function reconcile() {
    const reg = await ready;
    if (!reg) return;

    let info;
    try { info = await (await fetch("/api/push/key", { credentials: "same-origin" })).json(); }
    catch { return; }
    if (!info?.enabled || !info.publicKey) return; // server heeft geen VAPID-sleutels
    publicKey = info.publicKey;

    const permission = Notification.permission;
    const subscription = await reg.pushManager.getSubscription().catch(() => null);

    if (permission === "denied") { render("blocked"); return; }
    if (permission === "granted" && subscription) {
      // Opnieuw aanbieden is idempotent op endpoint en herstelt precies het geval
      // waarin de browser nog een subscription heeft maar de server de rij kwijt is.
      await sendSubscription(subscription).catch(() => {});
      render("on");
      return;
    }
    render("off");
  }

  async function sendSubscription(subscription) {
    const json = subscription.toJSON();
    await apiPost("/api/push/subscribe", {
      endpoint: json.endpoint,
      p256dh: json.keys?.p256dh,
      auth: json.keys?.auth,
    });
  }

  els.enable?.addEventListener("click", async () => {
    els.enable.disabled = true;
    setStatus("");
    try {
      const reg = await ready;
      if (!reg) throw new Error("Meldingen werken niet in deze browser.");
      // requestPermission moet uit een klik komen; op Android 13+ is dit het moment
      // waarop het systeemvenster voor POST_NOTIFICATIONS verschijnt.
      const permission = await Notification.requestPermission();
      if (permission === "denied") { render("blocked"); return; }
      if (permission !== "granted") { setStatus("Je hebt meldingen nog niet toegestaan."); return; }

      const existing = await reg.pushManager.getSubscription();
      const subscription = existing || await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      await sendSubscription(subscription);
      render("on");
      setStatus("Meldingen staan aan. Stuur een testmelding om te zien of ze op dit toestel doorkomen.", "ok");
    } catch (error) {
      setStatus(error.message || "Meldingen aanzetten is niet gelukt.", "error");
    } finally {
      els.enable.disabled = false;
    }
  });

  els.test?.addEventListener("click", async () => {
    els.test.disabled = true;
    setStatus("Testmelding wordt verstuurd...");
    try {
      await apiPost("/api/push/test");
      // Bewust geen "gelukt": de server weet alleen dat de push-dienst het bericht
      // heeft aangenomen, niet dat de telefoon hem toont. Dat is precies het punt
      // van de test, dus de klant moet zelf kijken.
      setStatus("Verstuurd. Zie je binnen tien seconden niets, dan blokkeert je toestel meldingen (batterijbeheer) en moeten we dat samen even goedzetten.", "ok");
    } catch (error) {
      setStatus(error.message || "Testmelding versturen is niet gelukt.", "error");
    } finally {
      els.test.disabled = false;
    }
  });

  els.disable?.addEventListener("click", async () => {
    els.disable.disabled = true;
    try {
      const reg = await ready;
      const subscription = await reg?.pushManager.getSubscription().catch(() => null);
      await apiPost("/api/push/unsubscribe", subscription ? { endpoint: subscription.endpoint } : {});
      await subscription?.unsubscribe().catch(() => {});
      render("off");
      setStatus("Meldingen staan uit. Je gemiste oproepen worden nog steeds opgevangen.");
    } catch (error) {
      setStatus(error.message || "Uitzetten is niet gelukt.", "error");
    } finally {
      els.disable.disabled = false;
    }
  });

  // De kaart hoort alleen te verschijnen als er iemand is ingelogd. app.js haalt
  // #appShell uit is-hidden bij een geldige sessie, dus daar wachten we op in plaats
  // van een tweede /api/me te doen.
  if (!supported) return;
  const shell = $("#appShell");
  if (shell && !shell.classList.contains("is-hidden")) { reconcile(); controleerSwVersie(); return; }
  const observer = new MutationObserver(() => {
    if (shell.classList.contains("is-hidden")) return;
    observer.disconnect();
    reconcile();
    controleerSwVersie();
  });
  if (shell) observer.observe(shell, { attributes: true, attributeFilter: ["class"] });
})();
