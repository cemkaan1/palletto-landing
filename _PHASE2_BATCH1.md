# Phase 2 – Batch 1

Enthält:
- palettenschein-digitalisieren.html  → NEU im Design (hatte vorher faelschlich AGB-Inhalt!)
- _header.html / _footer.html         → neue Partials (falls noch nicht deployed)
- assets/palletto.css                 → neu kompiliert (deckt Startseite + Unterseite)
- index.html                          → Founder-Foto raus + CSS ?v=3
- vercel.json                         → Cache-Fix (wichtig! sonst haengen Aenderungen im Cache)

## Deployen (Repo-Wurzel)
  unzip -o palletto-phase2-batch1.zip -d .
  git add index.html vercel.json assets/palletto.css _header.html _footer.html palettenschein-digitalisieren.html
  git commit -m "Phase 2/1: Palettenschein-digitalisieren neu, Partials, Cache-Fix, Founder"
  git push origin main

Danach: palletto.de/palettenschein-digitalisieren.html mit Cmd+Shift+R oeffnen.
