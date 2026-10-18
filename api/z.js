/* ============================================================
   Palletto – Zaehl-Endpunkt
   Liegt im Repo palletto-landing unter  api/z.js
   Vercel macht daraus automatisch  https://palletto.de/api/z
   ------------------------------------------------------------
   Warum auf der eigenen Domain und nicht direkt auf Supabase:
   Adblocker blockieren Anfragen an fremde Tracking-Domains,
   aber nicht an die Domain, auf der man gerade ist. Ausserdem
   entfaellt damit jedes CORS-Thema.

   Noetige Umgebungsvariablen im Vercel-Projekt
   (Settings → Environment Variables, alle drei Umgebungen):

     SUPABASE_URL        https://oomsrawjuiqmxxsqqlsb.supabase.co
     SUPABASE_ANON_KEY   der oeffentliche anon-Key
     ZAEHLER_SALT        eine lange Zufallszeichenkette, geheim

   Den ZAEHLER_SALT einmal erzeugen und nie wieder aendern
   (sonst bricht die Wiedererkennung innerhalb des Tages):
     openssl rand -base64 48

   Ausdruecklich NICHT der Service-Key. Siehe Kommentar in der
   Migration.
   ============================================================ */

"use strict";

const crypto = require("crypto");

/* Bots, Crawler und Monitoring. Ohne diesen Filter bestehen die
   Zahlen zu einem guten Teil aus Maschinen – robots.txt erlaubt
   bei uns ja absichtlich auch die KI-Crawler. */
const BOTS = new RegExp(
  [
    "bot", "crawl", "spider", "slurp", "scraper", "search",
    "facebookexternalhit", "embedly", "preview", "validator",
    "headless", "lighthouse", "pagespeed", "uptime", "monitor", "probe",
    "curl", "wget", "python-requests", "go-http-client", "java/",
    "axios", "node-fetch", "okhttp", "httpclient",
    "gptbot", "oai-searchbot", "chatgpt", "claudebot", "anthropic",
    "perplexity", "ccbot", "bytespider", "amazonbot", "applebot",
    "semrush", "ahrefs", "mj12", "dotbot", "petalbot",
    "yandex", "baidu", "sogou", "exabot", "ia_archiver"
  ].join("|"),
  "i"
);

const EIGENE_HOSTS = ["palletto.de", "www.palletto.de"];

function kuerzen(wert, laenge) {
  if (typeof wert !== "string") return null;
  const w = wert.trim();
  if (!w) return null;
  return w.length > laenge ? w.slice(0, laenge) : w;
}

/* Das Salz wechselt um Mitternacht UTC. Dadurch ist derselbe
   Besucher am naechsten Tag nicht mehr wiederzuerkennen – genau
   das macht den Pruefwert datenschutzrechtlich unkritisch. */
function tagesSalz() {
  const heute = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return crypto
    .createHmac("sha256", process.env.ZAEHLER_SALT || "")
    .update(heute)
    .digest();
}

function besucherPruefwert(ip, browser) {
  return crypto
    .createHmac("sha256", tagesSalz())
    .update(ip + "|" + browser)
    .digest("hex")
    .slice(0, 32);
}

/* Nur die Domain behalten. Verweise von der eigenen Seite sind
   interne Navigation und zaehlen nicht als Herkunft. */
function herkunft(referrer) {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    const eigen = EIGENE_HOSTS.map((h) => h.replace(/^www\./, ""));
    return eigen.includes(host) ? null : host;
  } catch (e) {
    return null;
  }
}

module.exports = async function (req, res) {
  /* Die Antwort ist immer dieselbe: leer und erfolgreich. Die
     Website soll nie auf uns warten und nie erfahren, ob das
     Zaehlen geklappt hat. */
  const fertig = () => {
    res.statusCode = 204;
    res.end();
  };

  if (req.method !== "POST") {
    res.statusCode = 405;
    return res.end();
  }

  try {
    const browser = req.headers["user-agent"] || "";
    if (!browser || BOTS.test(browser)) return fertig();

    /* Fremde Absender abweisen, damit niemand die Tabelle von
       aussen vollschreibt. */
    const absender = req.headers.origin || req.headers.referer || "";
    if (absender) {
      try {
        if (!EIGENE_HOSTS.includes(new URL(absender).hostname)) return fertig();
      } catch (e) {
        return fertig();
      }
    }

    let d = req.body;
    if (typeof d === "string") {
      try { d = JSON.parse(d); } catch (e) { d = null; }
    }
    if (!d || typeof d !== "object" || !d.pfad) return fertig();

    const ip =
      (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "0.0.0.0";

    const zeile = {
      pfad:         kuerzen(d.pfad, 300),
      referrer:     herkunft(d.referrer),
      utm_quelle:   kuerzen(d.utm_quelle, 80),
      utm_medium:   kuerzen(d.utm_medium, 80),
      utm_kampagne: kuerzen(d.utm_kampagne, 120),
      google_ads:   d.google_ads === true,
      land:         req.headers["x-vercel-ip-country"] || null,
      geraet:       ["handy", "tablet", "desktop"].includes(d.geraet) ? d.geraet : null,
      besucher:     besucherPruefwert(ip, browser)
    };

    const antwort = await fetch(process.env.SUPABASE_URL + "/rest/v1/besuche", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey:          process.env.SUPABASE_ANON_KEY,
        Authorization:   "Bearer " + process.env.SUPABASE_ANON_KEY,
        Prefer:          "return=minimal"
      },
      body: JSON.stringify(zeile)
    });

    if (!antwort.ok) {
      console.error("[zaehler] Supabase", antwort.status, await antwort.text());
    }
  } catch (e) {
    console.error("[zaehler]", e && e.message);
  }

  fertig();
};
