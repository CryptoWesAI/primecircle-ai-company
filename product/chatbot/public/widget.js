// Generiek chat-widget (herbruikbaar per klant) — geen dependencies.
// Branding (naam, telefoon, kleuren, talen) komt van /api/config op de eigen
// server, dus dezelfde widget werkt voor elke klant.
// Insluiten met één regel per pagina:
//   <script src="assets/ab-chat.js" data-ab-chat data-lang="nl" defer></script>
(function () {
  var script = document.querySelector("script[data-ab-chat]") || document.currentScript;

  // Endpoint-URL: window-override → door apply.mjs ingevulde waarde → (fallback) eigen origin.
  var API_BASE = window.AB_CHAT_API || "__AB_CHAT_API__";
  if (!API_BASE || API_BASE === "__AB_CHAT_API__") {
    try {
      API_BASE = script ? new URL(script.src).origin : "";
    } catch (e) {
      API_BASE = "";
    }
  }
  var reqLang = (script && script.getAttribute("data-lang")) || window.AB_CHAT_LANG || null;

  // Demo-personalisatie: optionele URL-parameters waarmee de founder tijdens een live
  // verkoopgesprek de widget kan "voorladen" met het bedrijf/vak van de prospect, zonder
  // een nieuwe klantmap of serverproces. Alleen aanwezige velden worden meegestuurd; geen
  // enkele velden aanwezig → geen prospect-veld in de request (huidig gedrag ongewijzigd).
  var demoProspect = (function () {
    var params;
    try {
      params = new URLSearchParams(location.search);
    } catch (e) {
      return null;
    }
    var fields = { bedrijfsnaam: "demo_bedrijf", vak: "demo_vak", werkgebied: "demo_werkgebied" };
    var out = {};
    var has = false;
    for (var key in fields) {
      var raw = params.get(fields[key]);
      if (raw == null) continue;
      var trimmed = String(raw).trim().slice(0, 60);
      if (!trimmed) continue;
      out[key] = trimmed;
      has = true;
    }
    return has ? out : null;
  })();

  // Injecteer de bijbehorende CSS vanaf hetzelfde pad als dit script.
  if (script && script.src && !document.getElementById("ab-chat-css")) {
    var link = document.createElement("link");
    link.id = "ab-chat-css";
    link.rel = "stylesheet";
    link.href = script.src.replace(/\.js(\?.*)?$/, ".css$1");
    document.head.appendChild(link);
  }

  var DEFAULT_CONFIG = { businessName: "", contactName: "", phoneDisplay: "", phoneTel: "", whatsapp: "", contactEmail: "", defaultLang: "nl", languages: ["nl", "en"], colors: {} };

  fetch(API_BASE + "/api/config")
    .then(function (r) { return r.ok ? r.json() : DEFAULT_CONFIG; })
    .catch(function () { return DEFAULT_CONFIG; })
    .then(init);

  function strings(lang, c) {
    var name = c.businessName || "";
    var contact = c.contactName || "";
    // Escape-kanaal naar een mens: telefoon (voorkeur, bv. AB) → anders WhatsApp/e-mail (bv. Belvanger).
    var phone = c.phoneTel ? (c.phoneDisplay || "") : "";
    var wa = c.whatsapp || "";
    var email = c.contactEmail || "";
    if (lang === "en") {
      var phEn = phone ? " on " + phone : "";
      var whoEn = contact || "us";
      var escEn = "", callEn = "", errEn = "";
      if (phone) {
        escEn = " For personal or urgent matters, please call " + whoEn + phEn + ", available day and night.";
        callEn = "Call " + (contact ? contact + " · " : "") + phone + " · 24/7";
        errEn = " Please call " + whoEn + phEn + ", available day and night.";
      } else if (wa) {
        escEn = " For personal contact, send us a WhatsApp" + (email ? " or email " + email : "") + ".";
        callEn = "Send a WhatsApp";
        errEn = " Please send us a WhatsApp" + (email ? " or email " + email : "") + ".";
      } else if (email) {
        escEn = " For personal contact, email us at " + email + ".";
        callEn = "Email us";
        errEn = " Please email us at " + email + ".";
      }
      return {
        toggle: "Ask a question",
        subtitle: "Digital assistant",
        disclosure:
          "You are chatting with " + (name ? name + "'s " : "") + "AI assistant (automated, not a staff member)." + escEn,
        greeting: "Good day. How can I help you?",
        call: callEn,
        placeholder: "Type your question...",
        send: "Send",
        close: "Close",
        error: "Sorry, something went wrong." + errEn,
        badgeTitle: "Automated: artificial intelligence, not a staff member",
      };
    }
    var phNl = phone ? " op " + phone : "";
    var metNl = contact ? "met " + contact : "ons";
    var escNl = "", callNl = "", errNl = "";
    if (phone) {
      escNl = " Voor persoonlijk of dringend contact belt u " + (contact || "ons") + phNl + ", dag en nacht bereikbaar.";
      callNl = "Bel " + (contact ? contact + " · " : "") + phone + " · 24/7";
      errNl = " Belt u gerust " + metNl + phNl + ", dag en nacht bereikbaar.";
    } else if (wa) {
      escNl = " Voor persoonlijk contact stuurt u ons een WhatsApp" + (email ? " of mailt u " + email : "") + ".";
      callNl = "Stuur een WhatsApp";
      errNl = " Stuur ons gerust een WhatsApp" + (email ? " of mail " + email : "") + ".";
    } else if (email) {
      escNl = " Voor persoonlijk contact mailt u ons op " + email + ".";
      callNl = "Mail ons";
      errNl = " Mail ons gerust op " + email + ".";
    }
    return {
      toggle: "Stel een vraag",
      subtitle: "Digitale assistent",
      disclosure:
        "U chat met de AI-assistent" + (name ? " van " + name : "") + " (automatisch, geen medewerker)." + escNl,
      greeting: "Goedendag. Waarmee kan ik u helpen?",
      call: callNl,
      placeholder: "Typ uw vraag...",
      send: "Stuur",
      close: "Sluiten",
      error: "Excuses, er ging even iets mis." + errNl,
      badgeTitle: "Automatisch: kunstmatige intelligentie, geen medewerker",
    };
  }

  function applyColors(colors, fontDisplay) {
    var c = colors || {};
    var style = document.createElement("style");
    style.id = "ab-chat-vars";
    style.textContent =
      "#ab-chat-toggle,#ab-chat-panel{" +
      "--sw-primary:" + (c.primary || "#21342d") + ";" +
      "--sw-primary-soft:" + (c.primarySoft || "#2f4a40") + ";" +
      "--sw-surface:" + (c.surface || "#f4f1ea") + ";" +
      "--sw-ink:" + (c.ink || "#26302c") + ";" +
      "--sw-line:" + (c.line || "#d9d3c7") +
      (fontDisplay ? ";--sw-font-display:" + fontDisplay : "") + "}";
    document.head.appendChild(style);
  }

  function init(config) {
    config = config || DEFAULT_CONFIG;
    var langs = Array.isArray(config.languages) && config.languages.length ? config.languages : ["nl"];
    var lang = reqLang && langs.indexOf(reqLang) !== -1 ? reqLang : config.defaultLang || langs[0] || "nl";
    var t = strings(lang, config);
    var tel = config.phoneTel || "";
    var waNum = config.whatsapp || "";
    var cEmail = config.contactEmail || "";
    var API_URL = API_BASE + "/api/chat";

    applyColors(config.colors, config.fontDisplay);

    var history = [];

    var toggle = document.createElement("button");
    toggle.id = "ab-chat-toggle";
    toggle.type = "button";
    toggle.textContent = t.toggle;

    var panel = document.createElement("div");
    panel.id = "ab-chat-panel";
    panel.innerHTML =
      '<div class="ab-header">' +
      '  <div class="ab-head-text"><strong></strong><small></small></div>' +
      '  <div class="ab-head-right">' +
      '    <span class="ab-badge">AI</span>' +
      '    <button class="ab-close" type="button">×</button>' +
      "  </div>" +
      "</div>" +
      '<div class="ab-messages" id="ab-messages"></div>' +
      '<a class="ab-call"></a>' +
      '<div class="ab-input">' +
      '  <textarea id="ab-text" rows="1"></textarea>' +
      '  <button id="ab-send" type="button"></button>' +
      "</div>";

    document.body.appendChild(toggle);
    document.body.appendChild(panel);

    panel.querySelector(".ab-header strong").textContent = config.businessName || t.subtitle;
    panel.querySelector(".ab-header small").textContent = t.subtitle;
    var badgeEl = panel.querySelector(".ab-badge");
    if (badgeEl) badgeEl.setAttribute("title", t.badgeTitle);
    panel.querySelector(".ab-close").setAttribute("aria-label", t.close);
    var callEl = panel.querySelector(".ab-call");
    callEl.textContent = t.call;
    if (tel) {
      callEl.setAttribute("href", "tel:" + tel);
    } else if (waNum) {
      callEl.setAttribute("href", "https://wa.me/" + waNum);
      callEl.setAttribute("target", "_blank");
      callEl.setAttribute("rel", "noopener");
    } else if (cEmail) {
      callEl.setAttribute("href", "mailto:" + cEmail);
    }
    if (!t.call || (!tel && !waNum && !cEmail)) callEl.style.display = "none";
    var textEl = panel.querySelector("#ab-text");
    textEl.setAttribute("placeholder", t.placeholder);
    var sendEl = panel.querySelector("#ab-send");
    sendEl.textContent = t.send;
    var messagesEl = panel.querySelector("#ab-messages");

    function addMessage(text, cls) {
      var el = document.createElement("div");
      el.className = "ab-msg " + cls;
      el.textContent = text;
      messagesEl.appendChild(el);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      return el;
    }

    var chipsEl = null;
    function renderChips() {
      var list = (config.suggestions && config.suggestions[lang]) || [];
      if (!list.length) return;
      var wrap = document.createElement("div");
      wrap.className = "ab-chips";
      list.slice(0, 4).forEach(function (q) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "ab-chip";
        b.textContent = q;
        b.addEventListener("click", function () {
          textEl.value = q;
          send();
        });
        wrap.appendChild(b);
      });
      messagesEl.appendChild(wrap);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      chipsEl = wrap;
    }

    var opened = false;
    function openPanel() {
      panel.classList.add("ab-open");
      toggle.style.display = "none";
      if (!opened) {
        opened = true;
        addMessage(t.disclosure, "ab-note");
        addMessage(t.greeting, "ab-bot");
        renderChips();
      }
      textEl.focus();
    }
    function closePanel() {
      panel.classList.remove("ab-open");
      toggle.style.display = "inline-flex";
    }

    toggle.addEventListener("click", openPanel);
    panel.querySelector(".ab-close").addEventListener("click", closePanel);

    function setBusy(busy) {
      sendEl.disabled = busy;
      textEl.disabled = busy;
      sendEl.textContent = busy ? "…" : t.send;
    }

    async function send() {
      var text = textEl.value.trim();
      if (!text) return;
      if (chipsEl) { chipsEl.remove(); chipsEl = null; }
      textEl.value = "";
      addMessage(text, "ab-user");
      history.push({ role: "user", content: text });
      setBusy(true);
      var thinking = addMessage("…", "ab-bot");
      try {
        var payload = { messages: history, lang: lang };
        if (demoProspect) payload.prospect = demoProspect;
        var resp = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        var data = await resp.json();
        var reply = (data && data.reply) || t.error;
        thinking.textContent = reply;
        history.push({ role: "assistant", content: reply });
      } catch (e) {
        thinking.textContent = t.error;
      } finally {
        setBusy(false);
        textEl.focus();
      }
    }

    sendEl.addEventListener("click", send);
    textEl.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    });
  }
})();
