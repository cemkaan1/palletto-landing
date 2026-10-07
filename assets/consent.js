/* ============================================================
   Palletto – Einwilligungsbanner (TDDDG / DSGVO)
   ------------------------------------------------------------
   Einbindung: <script src="/assets/consent.js" defer></script>
   kurz vor </body> auf jeder Seite.

   Grundsatz: Vor einer Einwilligung wird KEIN Marketing-Script
   geladen. Das LinkedIn Insight Tag wird ausschliesslich hier
   gestartet – es darf in keiner Seite mehr fest eingebaut sein.

   Einstellungen erneut oeffnen:  window.pallettoConsent.open()
   ============================================================ */
(function () {
  "use strict";

  var SPEICHER   = "palletto-consent";
  var FASSUNG    = 1;                 // bei inhaltlicher Aenderung hochzaehlen
  var LI_PARTNER = "9703802";

  /* ---------- Speicher ---------- */

  function lesen() {
    try {
      var roh = localStorage.getItem(SPEICHER);
      if (!roh) return null;
      var d = JSON.parse(roh);
      return d && d.fassung === FASSUNG ? d : null;
    } catch (e) { return null; }
  }

  function schreiben(marketing) {
    try {
      localStorage.setItem(SPEICHER, JSON.stringify({
        fassung: FASSUNG,
        marketing: !!marketing,
        zeitpunkt: new Date().toISOString()
      }));
    } catch (e) { /* privater Modus o. ae. – dann gilt: keine Einwilligung */ }
  }

  /* ---------- LinkedIn Insight Tag ---------- */

  var liGeladen = false;

  function linkedInStarten() {
    if (liGeladen) return;
    liGeladen = true;

    window._linkedin_partner_id = LI_PARTNER;
    window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
    window._linkedin_data_partner_ids.push(LI_PARTNER);

    if (!window.lintrk) {
      window.lintrk = function (a, b) { window.lintrk.q.push([a, b]); };
      window.lintrk.q = [];
    }
    var s = document.getElementsByTagName("script")[0];
    var b = document.createElement("script");
    b.type = "text/javascript";
    b.async = true;
    b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
    s.parentNode.insertBefore(b, s);
  }

  /* Bei Widerruf: Script laesst sich nicht entladen, aber die von
     LinkedIn gesetzten Cookies werden entfernt und beim naechsten
     Seitenaufruf wird gar nichts mehr geladen. */
  function linkedInCookiesLoeschen() {
    var namen = ["li_fat_id", "li_sugr", "bcookie", "bscookie", "lidc", "UserMatchHistory", "AnalyticsSyncHistory", "li_gc"];
    var host = location.hostname;
    var domains = [host, "." + host, "." + host.split(".").slice(-2).join(".")];
    namen.forEach(function (n) {
      domains.forEach(function (d) {
        document.cookie = n + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=" + d;
      });
      document.cookie = n + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    });
  }

  function anwenden(marketing) {
    if (marketing) linkedInStarten();
    else linkedInCookiesLoeschen();
  }

  /* ---------- Styles ---------- */

  var CSS = [
    '.plc{position:fixed;z-index:2147483647;left:1rem;bottom:1rem;width:calc(100% - 2rem);max-width:23rem;',
      'background:#fff;border:1px solid #EBE8E1;border-radius:1rem;box-shadow:0 12px 32px -12px rgba(15,27,45,.28);',
      'font-family:"Plus Jakarta Sans",system-ui,-apple-system,"Segoe UI",sans-serif;color:#0F1B2D;',
      'opacity:0;transform:translateY(.75rem);transition:opacity .2s ease,transform .2s ease;',
      'max-height:calc(100vh - 2rem);overflow-y:auto}',
    '.plc.offen{opacity:1;transform:translateY(0)}',
    '.plc-in{padding:1.1rem 1.2rem}',
    '.plc p{font-size:.84rem;line-height:1.55;color:rgba(15,27,45,.72);margin:0}',
    '.plc a{color:#1B3A6B;font-weight:600;text-decoration:underline;text-underline-offset:2px}',
    '.plc a:hover{color:#FF9500}',
    '.plc-btns{display:flex;gap:.5rem;margin-top:.9rem}',
    '.plc-btn{flex:1 1 0;font:inherit;font-weight:700;font-size:.82rem;padding:.55rem .7rem;border-radius:999px;cursor:pointer;',
      'border:1px solid #EBE8E1;background:#fff;color:#0F1B2D;transition:background .18s,border-color .18s;white-space:nowrap}',
    '.plc-btn:hover{background:#FAF8F3;border-color:#DCD7C9}',
    '.plc-btn.ja{background:#FF9500;border-color:#FF9500;color:#fff}',
    '.plc-btn.ja:hover{background:#e88500;border-color:#e88500}',
    '.plc-btn:focus-visible{outline:2px solid #1B3A6B;outline-offset:2px}',
    '.plc-mehr{margin-top:.6rem;text-align:center}',
    '.plc-mehr button{font:inherit;font-size:.76rem;font-weight:600;color:rgba(27,58,107,.6);background:none;border:none;',
      'cursor:pointer;text-decoration:underline;text-underline-offset:2px;padding:.2rem}',
    '.plc-mehr button:hover{color:#0F1B2D}',
    '.plc-details{display:none;margin-top:.8rem;border-top:1px solid #EBE8E1;padding-top:.8rem}',
    '.plc-details.sichtbar{display:block}',
    '.plc-zeile{display:flex;gap:.75rem;align-items:flex-start;padding:.6rem 0;border-bottom:1px solid #F3F1EC}',
    '.plc-zeile:last-of-type{border-bottom:none}',
    '.plc-zeile h3{font-size:.82rem;font-weight:700;margin:0 0 .15rem}',
    '.plc-zeile p{font-size:.76rem;line-height:1.5}',
    '.plc-fix{flex:0 0 auto;font-size:.66rem;font-weight:700;color:rgba(27,58,107,.45);text-transform:uppercase;letter-spacing:.05em;padding-top:.15rem}',
    '.plc-schalter{flex:0 0 auto;position:relative;width:38px;height:22px;margin-top:.1rem}',
    '.plc-schalter input{position:absolute;inset:0;opacity:0;width:100%;height:100%;margin:0;cursor:pointer}',
    '.plc-spur{position:absolute;inset:0;border-radius:999px;background:#DCD7C9;transition:background .18s;pointer-events:none}',
    '.plc-knopf{position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:999px;background:#fff;box-shadow:0 1px 3px rgba(15,27,45,.3);transition:transform .18s;pointer-events:none}',
    '.plc-schalter input:checked ~ .plc-spur{background:#FF9500}',
    '.plc-schalter input:checked ~ .plc-knopf{transform:translateX(16px)}',
    '.plc-schalter input:focus-visible ~ .plc-spur{outline:2px solid #1B3A6B;outline-offset:2px}',
    '.plc-fuss{margin-top:.7rem;font-size:.72rem;color:rgba(15,27,45,.45);text-align:center}',
    '@media(prefers-reduced-motion:reduce){.plc,.plc-knopf,.plc-spur{transition:none}}'
  ].join("");

  function stylesEinfuegen() {
    if (document.getElementById("plc-style")) return;
    var st = document.createElement("style");
    st.id = "plc-style";
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  /* ---------- Banner ---------- */

  var box = null, overlay = null, letzterFokus = null;

  function schliessen() {
    if (!box) return;
    box.classList.remove("offen");
    setTimeout(function () {
      if (box && box.parentNode) box.parentNode.removeChild(box);
      box = null; overlay = null;
      if (letzterFokus && letzterFokus.focus) letzterFokus.focus();
    }, 240);
  }

  function entscheiden(marketing) {
    schreiben(marketing);
    anwenden(marketing);
    schliessen();
  }

  function oeffnen(vorauswahl) {
    if (box) return;
    stylesEinfuegen();
    letzterFokus = document.activeElement;

    box = document.createElement("div");
    box.className = "plc";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-labelledby", "plc-titel");

    box.innerHTML =
      '<div class="plc-in">' +
        '<p id="plc-titel">Wir messen mit dem LinkedIn Insight Tag, ob unsere Anzeigen etwas bringen. ' +
        'Nur mit Ihrer Zustimmung. Technisch Notwendiges läuft ohnehin. ' +
        '<a href="/datenschutz.html">Datenschutz</a></p>' +

        '<div class="plc-btns">' +
          '<button type="button" class="plc-btn" data-plc="nein">Ablehnen</button>' +
          '<button type="button" class="plc-btn ja" data-plc="ja">Akzeptieren</button>' +
        '</div>' +

        '<div class="plc-mehr"><button type="button" data-plc="mehr" aria-expanded="false">Einstellungen</button></div>' +

        '<div class="plc-details" id="plc-details">' +
          '<div class="plc-zeile">' +
            '<div><h3>Notwendig</h3>' +
            '<p>Grundfunktionen und das Buchungsfenster von Cal.com.</p></div>' +
            '<span class="plc-fix">Immer</span>' +
          '</div>' +
          '<div class="plc-zeile">' +
            '<div><h3>Marketing</h3>' +
            '<p>LinkedIn Insight Tag. Überträgt Daten an LinkedIn in den USA.</p></div>' +
            '<label class="plc-schalter">' +
              '<input type="checkbox" id="plc-marketing" aria-label="Marketing erlauben">' +
              '<span class="plc-spur"></span><span class="plc-knopf"></span>' +
            '</label>' +
          '</div>' +
          '<div class="plc-btns">' +
            '<button type="button" class="plc-btn" data-plc="auswahl">Auswahl speichern</button>' +
          '</div>' +
        '</div>' +

        '<p class="plc-fuss"><a href="/impressum.html">Impressum</a></p>' +
      '</div>';

    document.body.appendChild(box);

    var schalter = box.querySelector("#plc-marketing");
    var gespeichert = lesen();
    schalter.checked = gespeichert ? !!gespeichert.marketing : false;

    box.addEventListener("click", function (e) {
      var t = e.target.closest("[data-plc]");
      if (!t) return;
      var was = t.getAttribute("data-plc");
      if (was === "ja")      entscheiden(true);
      if (was === "nein")    entscheiden(false);
      if (was === "auswahl") entscheiden(schalter.checked);
      if (was === "mehr") {
        var d = box.querySelector("#plc-details");
        var auf = d.classList.toggle("sichtbar");
        t.setAttribute("aria-expanded", auf ? "true" : "false");
        t.textContent = auf ? "Einstellungen ausblenden" : "Einstellungen anzeigen";
      }
    });

    /* Das Fenster blockiert die Seite nicht – es muss auch nicht, weil ohne
       Zustimmung ohnehin kein Marketing-Script laedt. Weggeklickt werden kann
       es trotzdem nicht: Wegklicken waere weder Zustimmung noch Ablehnung. */

    if (vorauswahl) box.querySelector('[data-plc="mehr"]').click();

    requestAnimationFrame(function () {
      box.classList.add("offen");
      box.querySelector('[data-plc="nein"]').focus({preventScroll:true});
    });
  }

  /* ---------- Start ---------- */

  var zustand = lesen();
  if (zustand) {
    anwenden(zustand.marketing);
  } else {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () { oeffnen(false); });
    } else {
      oeffnen(false);
    }
  }

  /* Fuer den Footer-Link „Cookie-Einstellungen" */
  window.pallettoConsent = {
    open: function () { oeffnen(true); },
    status: function () { return lesen(); }
  };
})();
