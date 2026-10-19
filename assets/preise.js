(function () {
  "use strict";

  var PREISE = {
    starter: { grundpreis: 69, fahrerpreis: 12 },
    business: { grundpreis: 129, fahrerpreis: 19 }
  };
  var FLOTTEN_GRENZE = 15;
  var MAX_FAHRER = 999;

  function element(id) {
    return document.getElementById(id);
  }

  function alsEuro(wert) {
    return new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 }).format(wert);
  }

  function begrenzen(wert) {
    var zahl = Math.trunc(Number(wert));
    if (!Number.isFinite(zahl)) return 0;
    return Math.min(MAX_FAHRER, Math.max(0, zahl));
  }

  function rechnerStarten() {
    var zahlEingabe = element("driver-number");
    var regler = element("driver-range");
    var weniger = element("driver-decrease");
    var mehr = element("driver-increase");
    var ausgabe = element("driver-output");
    var standardErgebnis = element("standard-results");
    var flottenErgebnis = element("fleet-result");
    var liveRegion = element("calculator-live");

    if (!zahlEingabe || !regler || !weniger || !mehr) return;

    var liveTimer;

    function liveMelden(text) {
      if (!liveRegion) return;
      window.clearTimeout(liveTimer);
      liveRegion.textContent = "";
      liveTimer = window.setTimeout(function () {
        liveRegion.textContent = text;
      }, 80);
    }

    function anzeigen(anzahl, melden) {
      var fahrer = begrenzen(anzahl);
      var flotte = fahrer >= FLOTTEN_GRENZE;
      var reglerWert = Math.min(fahrer, FLOTTEN_GRENZE);
      var fortschritt = (reglerWert / FLOTTEN_GRENZE) * 100;

      zahlEingabe.value = String(fahrer);
      regler.value = String(reglerWert);
      regler.style.setProperty("--range-progress", fortschritt + "%");
      regler.setAttribute(
        "aria-valuetext",
        flotte
          ? "15 oder mehr aktive Fahrer, Enterprise-Angebot auf Anfrage"
          : fahrer + (fahrer === 1 ? " aktiver Fahrer" : " aktive Fahrer")
      );

      weniger.disabled = fahrer <= 0;
      mehr.disabled = fahrer >= MAX_FAHRER;

      if (ausgabe) {
        ausgabe.textContent = flotte
          ? (fahrer === FLOTTEN_GRENZE ? "15+ Fahrer" : fahrer + " Fahrer · Enterprise")
          : fahrer + (fahrer === 1 ? " Fahrer" : " Fahrer");
      }

      if (standardErgebnis) standardErgebnis.hidden = flotte;
      if (flottenErgebnis) flottenErgebnis.hidden = !flotte;

      if (flotte) {
        if (melden) liveMelden("Enterprise: Ab 15 aktiven Fahrern erhältst du ein individuelles Angebot.");
        return;
      }

      var starterFahrer = PREISE.starter.fahrerpreis * fahrer;
      var businessFahrer = PREISE.business.fahrerpreis * fahrer;
      var starterGesamt = PREISE.starter.grundpreis + starterFahrer;
      var businessGesamt = PREISE.business.grundpreis + businessFahrer;

      element("starter-total").textContent = alsEuro(starterGesamt);
      element("starter-drivers").textContent = alsEuro(starterFahrer);
      element("business-total").textContent = alsEuro(businessGesamt);
      element("business-drivers").textContent = alsEuro(businessFahrer);

      if (melden) {
        liveMelden(
          "Bei " + fahrer + (fahrer === 1 ? " aktivem Fahrer " : " aktiven Fahrern ") +
          "kostet Starter " + alsEuro(starterGesamt) + " Euro und Business " +
          alsEuro(businessGesamt) + " Euro netto pro Monat."
        );
      }
    }

    regler.addEventListener("input", function () {
      anzeigen(regler.value, true);
    });

    zahlEingabe.addEventListener("input", function () {
      if (zahlEingabe.value === "") return;
      anzeigen(zahlEingabe.value, true);
    });

    zahlEingabe.addEventListener("change", function () {
      anzeigen(zahlEingabe.value || 1, true);
    });

    weniger.addEventListener("click", function () {
      anzeigen(begrenzen(zahlEingabe.value) - 1, true);
      zahlEingabe.focus();
    });

    mehr.addEventListener("click", function () {
      anzeigen(begrenzen(zahlEingabe.value) + 1, true);
      zahlEingabe.focus();
    });

    anzeigen(zahlEingabe.value, false);
  }

  function navigationVerbessern(kopf) {
    if (!kopf) return;

    kopf.querySelectorAll('a[href="/preise.html"]').forEach(function (link) {
      link.setAttribute("aria-current", "page");
    });

    var schalter = kopf.querySelector("#plh-toggle");
    var burger = kopf.querySelector(".plh-burger");
    var mobil = kopf.querySelector(".plh-mobile");
    if (!schalter || !burger || !mobil) return;

    mobil.id = "plh-mobile-menu";
    schalter.tabIndex = -1;
    burger.setAttribute("role", "button");
    burger.setAttribute("tabindex", "0");
    burger.setAttribute("aria-controls", mobil.id);

    function statusSetzen() {
      var offen = schalter.checked;
      burger.setAttribute("aria-expanded", String(offen));
      burger.setAttribute("aria-label", offen ? "Menü schließen" : "Menü öffnen");
    }

    burger.addEventListener("keydown", function (ereignis) {
      if (ereignis.key !== "Enter" && ereignis.key !== " ") return;
      ereignis.preventDefault();
      burger.click();
    });

    schalter.addEventListener("change", statusSetzen);
    mobil.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        schalter.checked = false;
        statusSetzen();
      });
    });
    statusSetzen();
  }

  function partialLaden(url, zielId) {
    var ziel = element(zielId);
    if (!ziel) return Promise.resolve(null);

    return fetch(url)
      .then(function (antwort) {
        if (!antwort.ok) throw new Error("Partial konnte nicht geladen werden: " + url);
        return antwort.text();
      })
      .then(function (html) {
        ziel.innerHTML = html;
        return ziel;
      })
      .catch(function () {
        return null;
      });
  }

  rechnerStarten();

  Promise.all([
    partialLaden("/_header.html", "site-header"),
    partialLaden("/_footer.html", "site-footer")
  ]).then(function (partials) {
    navigationVerbessern(partials[0]);
  });
})();
