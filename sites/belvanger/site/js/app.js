/* Belvanger, v0 interacties. Vanilla JS, geen dependencies. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── i18n: teksten die in JS zitten, per taal (uit <html lang>). NL is default. ──
  var LANG = ((document.documentElement.getAttribute("lang") || "nl").slice(0, 2) === "en") ? "en" : "nl";
  var STR = {
    nl: { ringing: "Hij gaat over…", missed: "Gemist! Kijk wat er gebeurt", replay: "Speel nog eens af",
      soundOff: "Geluid uitzetten", soundOn: "Geluid aanzetten", perMonth: " per maand",
      required: "Vul dit even in.", phoneInvalid: "Vul een geldig telefoonnummer in (8–15 cijfers).", emailInvalid: "Vul een geldig e-mailadres in.",
      waIntro: "Hoi! Ik wil graag een vrijblijvend gesprek over Belvanger.", waCompany: "Bedrijf", waTrade: "Vak", waPhone: "Telefoon" },
    en: { ringing: "It's ringing…", missed: "Missed! Watch what happens", replay: "Play again",
      soundOff: "Turn sound off", soundOn: "Turn sound on", perMonth: " per month",
      required: "Please fill this in.", phoneInvalid: "Enter a valid phone number (8–15 digits).", emailInvalid: "Enter a valid email address.",
      waIntro: "Hi! I'd like a no-obligation call about Belvanger.", waCompany: "Company", waTrade: "Trade", waPhone: "Phone" }
  };
  var T = STR[LANG];
  var euro = new Intl.NumberFormat(LANG === "en" ? "en-IE" : "nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

  /* ── Conversie-events (blueprint §5) ──
     Privacy-vriendelijk: geen cookies, geen externe tracker, geen persoonsgegevens.
     v0 buffert in window.__bv; zet TRACK_ENDPOINT zodra de eigen backend staat. */
  var TRACK_ENDPOINT = null; // bijv. "/api/pv"
  var LEAD_ENDPOINT = "/api/lead"; // same-origin: server mailt de aanvraag naar info@belvanger.nl
  window.__bv = window.__bv || [];
  function track(naam, extra) {
    var payload = { e: naam, t: Date.now(), p: location.pathname };
    if (extra) payload.d = extra;
    window.__bv.push(payload);
    if (TRACK_ENDPOINT && navigator.sendBeacon) {
      try { navigator.sendBeacon(TRACK_ENDPOINT, JSON.stringify(payload)); } catch (e) {}
    }
  }

  /* Klik-om-te-bellen overal meetellen */
  document.querySelectorAll("[data-phone-link]").forEach(function (el) {
    el.addEventListener("click", function () { track("klik_bellen"); });
  });

  /* ── Jaar in footer ── */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ── Header: solid bij scroll ── */
  var header = document.querySelector("[data-header]");
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 8) header.setAttribute("data-scrolled", "");
      else header.removeAttribute("data-scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ── Mobiel menu ── */
  var toggle = document.querySelector("[data-nav-toggle]");
  var menu = document.querySelector("[data-mobile-menu]");
  if (toggle && menu && header) {
    var setMenu = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      if (open) { header.setAttribute("data-open", ""); menu.hidden = false; }
      else { header.removeAttribute("data-open"); menu.hidden = true; }
    };
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
  }

  /* ── Scroll-reveals ──
     Progressive enhancement: de CSS verbergt reveals pas als .reveal-ready op <html>
     staat. Die zetten we hier — dus alleen als dit script daadwerkelijk draait.
     Faalt of blokkeert app.js, dan blijft alle content gewoon zichtbaar. */
  var reveals = document.querySelectorAll(".reveal");
  document.documentElement.classList.add("reveal-ready");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ══ Signature: de gemiste oproep → WhatsApp-vangst → lead ══
     Poster staat er al (volledige gesprek). We "armen" alleen als er beweging mag,
     en spelen dan af. Herhaalbaar via de knop. */
  var demo = document.querySelector(".hero__demo");
  var phone = document.querySelector("[data-phone]");
  var simctl = document.querySelector("[data-simctl]");

  if (demo && phone && simctl && !reduceMotion) {
    var simBtn = simctl.querySelector("[data-sim]");
    var simLabel = simctl.querySelector("[data-sim-label]");
    var soundBtn = simctl.querySelector("[data-sound]");
    var steps = phone.querySelectorAll("[data-step]");
    var toast = demo.querySelector(".lead-toast");
    var timers = [];
    var playing = false;
    var soundOn = true;   // standaard AAN; de bezoeker kan 'm uitzetten
    var actx = null;

    simctl.hidden = false;

    /* Geluid: gesynthetiseerd, geen audiobestand om te laden.
       Browsers staan geluid pas toe ná een klik of tik (autoplay-beleid). Zonder
       zo'n gebaar blijft de AudioContext "suspended" en valt het geluid stil weg:
       geen fout, gewoon stil. Bij elke klik ontgrendelen we 'm hieronder. */
    var audio = function () {
      if (!actx) {
        try { actx = new (window.AudioContext || window.webkitAudioContext)(); }
        catch (e) { return null; }
      }
      if (actx.state === "suspended") { try { actx.resume(); } catch (e) {} }
      return actx;
    };

    /* Ontgrendel het geluid bij het EERSTE gebaar, waar dan ook op de pagina.
       Doe je dit alleen op de eigen knoppen, dan speelt de simulatie stil af en
       lijkt de geluidsknop te liegen ("aan", maar je hoort niks).
       Op een telefoon is scrollen een aanraking (touchend telt als gebaar), dus
       tegen de tijd dat de telefoon in beeld scrollt is het geluid meestal al vrij.
       Met een muis scrollen telt niet: op desktop blijft de eerste, automatische
       afspeelbeurt stil tot er ergens geklikt wordt. Dat is browserbeleid. */
    ["pointerdown", "pointerup", "touchend", "click", "keydown"].forEach(function (ev) {
      window.addEventListener(ev, function () { audio(); }, { once: true, passive: true, capture: true });
    });

    var beep = function (freq, dur, type, gainVal) {
      if (!soundOn) return;
      if (!audio()) return;
      try {
        var o = actx.createOscillator(), g = actx.createGain();
        o.type = type || "sine";
        o.frequency.value = freq;
        g.gain.setValueAtTime(0, actx.currentTime);
        g.gain.linearRampToValueAtTime(gainVal || 0.05, actx.currentTime + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + dur);
        o.connect(g); g.connect(actx.destination);
        o.start(); o.stop(actx.currentTime + dur);
      } catch (err) { /* geluid is bijzaak: nooit de demo breken */ }
    };
    var ringTone = function () { beep(480, 0.35, "sine", 0.05); setTimeout(function () { beep(620, 0.35, "sine", 0.05); }, 260); };
    var popTone = function () { beep(880, 0.12, "triangle", 0.045); };

    var clearTimers = function () { timers.forEach(clearTimeout); timers = []; };
    var at = function (ms, fn) { timers.push(setTimeout(fn, ms)); };
    var chatBody = phone.querySelector(".chat__body");
    var show = function (n) {
      var el = phone.querySelector('[data-step="' + n + '"]') || (n === 7 ? toast : null);
      if (!el) return;
      el.classList.add("is-in");
      // laat het chatvenster meescrollen naar het nieuwste bericht (zoals WhatsApp)
      if (chatBody && chatBody.contains(el)) {
        chatBody.scrollTop = Math.max(0, el.offsetTop + el.offsetHeight - chatBody.clientHeight + 10);
      }
    };
    var hide = function (n) {
      var el = phone.querySelector('[data-step="' + n + '"]') || (n === 7 ? toast : null);
      if (el) el.classList.remove("is-in");
    };

    var reset = function () {
      clearTimers();
      phone.classList.add("is-armed");
      demo.classList.add("is-armed");
      steps.forEach(function (s) { s.classList.remove("is-in"); });
      if (toast) toast.classList.remove("is-in");
      phone.setAttribute("data-state", "idle");
    };

    var play = function () {
      if (playing) return;
      playing = true;
      reset();
      simctl.classList.add("is-live");
      if (simLabel) simLabel.textContent = T.ringing;

      // 1. de telefoon rinkelt, jij kunt niet opnemen
      phone.setAttribute("data-state", "ringing");
      ringTone();
      at(1200, ringTone);
      at(2400, ringTone);

      // 2. niet opgenomen → gemiste oproep
      at(3400, function () {
        phone.setAttribute("data-state", "missed");
        show(1); popTone();
        if (simLabel) simLabel.textContent = T.missed;
      });

      // 3. Belvanger appt de beller automatisch terug
      at(4300, function () { show(2); popTone(); });

      // 4. de beller typt
      at(5300, function () { show(3); });

      // 5. …en antwoordt
      at(6400, function () { hide(3); show(4); popTone(); });

      // 6. Belvanger reageert en houdt de lead binnen
      at(7300, function () { show(5); });                     // Belvanger typt
      at(8500, function () { hide(5); show(6); popTone(); });  // reactie die de lead binnenhoudt

      // 7. de lead komt binnen bij de vakman
      at(9500, function () {
        show(7);
        beep(660, 0.15, "triangle", 0.05);
        setTimeout(function () { beep(880, 0.2, "triangle", 0.05); }, 130);
        phone.setAttribute("data-state", "done");
        simctl.classList.remove("is-live");
        if (simLabel) simLabel.textContent = T.replay;
        playing = false;
        track("signature_afgespeeld");
      });
    };

    simBtn.addEventListener("click", function () {
      if (playing) return;
      if (soundOn) audio();   // deze klik is het gebaar dat geluid ontgrendelt
      play();
    });

    soundBtn.addEventListener("click", function () {
      soundOn = !soundOn;
      soundBtn.setAttribute("aria-pressed", String(soundOn));
      soundBtn.setAttribute("title", soundOn ? T.soundOff : T.soundOn);
      if (soundOn) { audio(); popTone(); }   // even laten horen dat 'ie aan staat
    });

    // Speel één keer automatisch af zodra de telefoon in beeld staat
    if ("IntersectionObserver" in window) {
      var autoPlayed = false;
      var pio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && !autoPlayed) {
            autoPlayed = true;
            play();
            pio.disconnect();
          }
        });
      }, { threshold: 0.45 });
      pio.observe(phone);
    }
  }

  /* ── Rekenmachine ── */
  var calc = document.getElementById("rekenmachine");
  if (calc) {
    var inputs = {
      calls: calc.querySelector('[data-input="calls"]'),
      value: calc.querySelector('[data-input="value"]'),
      recover: calc.querySelector('[data-input="recover"]')
    };
    var outs = {
      calls: calc.querySelector('[data-out="calls"]'),
      value: calc.querySelector('[data-out="value"]'),
      recover: calc.querySelector('[data-out="recover"]'),
      loss: calc.querySelector('[data-out="loss"]'),
      won: calc.querySelector('[data-out="won"]')
    };

    var render = function () {
      var calls = +inputs.calls.value;      // gemiste belletjes/MAAND
      var value = +inputs.value.value;       // gem. kluswaarde
      var recover = +inputs.recover.value;   // % terug te winnen

      // 'calls' is per maand → geen week-naar-maand omrekening meer (was ×4,33, imprecies).
      // Aanname: ~60% van gemiste belletjes is een echte klus-kans (rest = bestaande klant, leverancier, spam).
      var lostLeads = calls * 0.6;
      var lossMonth = lostLeads * value;
      var wonMonth = lossMonth * (recover / 100);

      outs.calls.textContent = calls;
      outs.value.textContent = euro.format(value);
      outs.recover.textContent = recover + "%";
      outs.loss.textContent = euro.format(Math.round(lossMonth / 10) * 10);
      outs.won.textContent = "± " + euro.format(Math.round(wonMonth / 10) * 10) + T.perMonth;
    };

    var calcTracked = false;
    Object.keys(inputs).forEach(function (k) {
      inputs[k].addEventListener("input", function () {
        render();
        if (!calcTracked) { calcTracked = true; track("rekenmachine_gebruikt"); }
      });
    });
    render();
  }

  /* ── Demo-formulier: client-side validatie + honeypot ── */
  var form = document.querySelector("[data-form]");
  if (form) {
    var ok = form.querySelector("[data-form-ok]");
    var fail = form.querySelector("[data-form-fail]");

    // Fouten worden ook programmatisch gekoppeld (aria-invalid + aria-describedby +
    // role="alert"), zodat schermlezers de reden horen — visueel tonen is niet genoeg.
    var showError = function (field, msg) {
      field.setAttribute("data-invalid", "");
      var err = field.querySelector("[data-err]");
      var input = field.querySelector("input, select");
      if (err) {
        if (!err.id) err.id = "err-" + (input && input.name ? input.name : Math.random().toString(36).slice(2));
        err.setAttribute("role", "alert");
        err.textContent = msg;
      }
      if (input) {
        input.setAttribute("aria-invalid", "true");
        if (err) input.setAttribute("aria-describedby", err.id);
      }
    };
    var clearError = function (field) {
      field.removeAttribute("data-invalid");
      var err = field.querySelector("[data-err]");
      var input = field.querySelector("input, select");
      if (err) err.textContent = "";
      if (input) {
        input.removeAttribute("aria-invalid");
        input.removeAttribute("aria-describedby");
      }
    };

    form.querySelectorAll("input, select").forEach(function (el) {
      el.addEventListener("input", function () {
        var f = el.closest(".ffield");
        if (f) clearError(f);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Honeypot: gevuld = bot → stil negeren
      var hp = form.querySelector('input[name="website"]');
      if (hp && hp.value.trim() !== "") return;

      var valid = true;
      var required = form.querySelectorAll("[required]");
      required.forEach(function (el) {
        var f = el.closest(".ffield");
        if (!f) return;
        var val = el.value.trim();
        if (!val) { showError(f, T.required); valid = false; return; }
        if (el.name === "telefoon") {
          // Alleen toegestane tekens én een realistisch aantal ECHTE cijfers.
          // (De oude regex keurde "++++++++" en "()()()()"" goed — die leverden
          //  onbruikbare leads op terwijl de bezoeker "gelukt" te zien kreeg.)
          var digits = val.replace(/\D/g, "");
          if (!/^[0-9+()\s-]+$/.test(val) || digits.length < 8 || digits.length > 15) {
            showError(f, T.phoneInvalid);
            valid = false; return;
          }
        }
        if (el.name === "email") {
          if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val)) { showError(f, T.emailInvalid); valid = false; return; }
        }
        clearError(f);
      });

      if (!valid) {
        var firstBad = form.querySelector("[data-invalid] input, [data-invalid] select");
        if (firstBad) firstBad.focus();
        return;
      }

      // Verzending: POST naar de eigen server (/api/lead) → e-mail naar info@belvanger.nl.
      // Lukt dat niet, dan tonen we een terugval (rechtstreeks mailen/WhatsApp) zodat de
      // aanvraag nooit verloren gaat.
      var payload = {
        naam: ((form.querySelector('[name="naam"]') || {}).value || "").trim(),
        email: ((form.querySelector('[name="email"]') || {}).value || "").trim(),
        bedrijf: ((form.querySelector('[name="bedrijf"]') || {}).value || "").trim(),
        vak: (form.querySelector('[name="vak"]') || {}).value || "",
        telefoon: ((form.querySelector('[name="telefoon"]') || {}).value || "").trim(),
        vraag: ((form.querySelector('[name="vraag"]') || {}).value || "").trim(),
        website: (form.querySelector('[name="website"]') || {}).value || "",
        taal: LANG,
        pagina: location.href
      };
      var submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      if (fail) fail.hidden = true;
      track("gesprek_aanvraag", { vak: payload.vak });
      fetch(LEAD_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).then(function (r) {
        if (!r.ok) throw new Error("status " + r.status);
        form.reset();
        if (ok) { ok.hidden = false; ok.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" }); }
      }).catch(function () {
        if (fail) { fail.hidden = false; fail.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" }); }
      }).finally(function () {
        if (submitBtn) submitBtn.disabled = false;
      });
    });
  }
})();
