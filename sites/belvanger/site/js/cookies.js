/* Belvanger, cookiemelding + toestemmingsgate voor analytics (Microsoft Clarity). */
(function () {
  "use strict";

  // TODO(founder): vul je Clarity-project-ID in nadat je een gratis account hebt
  // aangemaakt op clarity.microsoft.com. Leeg laten = geen analytics geladen,
  // ook niet na "Alles accepteren" (de banner blijft wel gewoon werken).
  var CLARITY_PROJECT_ID = "xp1tz2e1mq";

  var STORAGE_KEY = "bv_cookie_consent"; // waarde: "all" | "necessary"
  var LANG = (document.documentElement.getAttribute("lang") || "nl").slice(0, 2) === "en" ? "en" : "nl";

  var STR = {
    nl: {
      text: "We gebruiken alleen strikt noodzakelijke cookies om de site te laten werken. Ga je akkoord, dan mogen we ook geanonimiseerd bijhouden hoe bezoekers de site gebruiken, zodat we 'm kunnen verbeteren.",
      acceptAll: "Alles accepteren",
      necessaryOnly: "Alleen noodzakelijk",
      link: "Privacyverklaring",
    },
    en: {
      text: "We only use strictly necessary cookies to make the site work. If you agree, we may also anonymously track how visitors use the site, to help us improve it.",
      acceptAll: "Accept all",
      necessaryOnly: "Necessary only",
      link: "Privacy policy",
    },
  };
  var t = STR[LANG];

  function loadClarity() {
    if (!CLARITY_PROJECT_ID || window.__bvClarityLoaded) return;
    window.__bvClarityLoaded = true;
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, "clarity", "script", CLARITY_PROJECT_ID);
  }

  function applyConsent(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) {}
    if (value === "all") loadClarity();
  }

  function buildBanner() {
    var el = document.createElement("div");
    el.className = "cookie-banner";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-label", LANG === "en" ? "Cookie settings" : "Cookie-instellingen");
    el.innerHTML =
      '<div class="cookie-banner__inner">' +
        '<p>' + t.text + ' <a href="' + (LANG === "en" ? "privacy.html" : "privacy.html") + '">' + t.link + "</a></p>" +
        '<div class="cookie-banner__actions">' +
          '<button type="button" class="btn btn--ghost btn--sm" data-cookie-necessary>' + t.necessaryOnly + "</button>" +
          '<button type="button" class="btn btn--primary btn--sm" data-cookie-accept>' + t.acceptAll + "</button>" +
        "</div>" +
      "</div>";
    document.body.appendChild(el);
    document.body.classList.add("has-cookie-banner");
    updateBannerOffset(el);
    var onResize = function () { updateBannerOffset(el); };
    window.addEventListener("resize", onResize);
    function dismiss() {
      window.removeEventListener("resize", onResize);
      document.body.classList.remove("has-cookie-banner");
      el.remove();
    }
    el.querySelector("[data-cookie-accept]").addEventListener("click", function () {
      applyConsent("all"); dismiss();
    });
    el.querySelector("[data-cookie-necessary]").addEventListener("click", function () {
      applyConsent("necessary"); dismiss();
    });
    return el;
  }

  // Schuift een eventuele zwevende knop (bijv. de chat-widget) omhoog zodat
  // die niet onder de cookiemelding schuilt (gemeten, want de banner-hoogte
  // varieert per schermbreedte doordat de tekst dan terugloopt).
  function updateBannerOffset(el) {
    document.documentElement.style.setProperty("--cookie-banner-h", el.offsetHeight + "px");
  }

  function showBanner() {
    if (document.querySelector(".cookie-banner")) return;
    buildBanner();
  }

  var stored;
  try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) { stored = null; }
  if (stored === "all") loadClarity();
  else if (stored !== "necessary") showBanner();

  // Footer-link "Cookie-instellingen wijzigen" roept dit aan om opnieuw te kiezen.
  document.addEventListener("click", function (event) {
    var trigger = event.target.closest("[data-cookie-settings]");
    if (!trigger) return;
    event.preventDefault();
    showBanner();
  });
})();
