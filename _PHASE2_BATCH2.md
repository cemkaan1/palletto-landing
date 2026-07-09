# Phase 2 – Batch 2 (kumulativ, ersetzt Batch 1)

3 Unterseiten im neuen Design + gemeinsames CSS + Partials + Startseite (Founder raus) + Cache-Fix.

## Deployen (Repo-Wurzel)
  unzip -o palletto-phase2-batch2.zip -d .
  git add index.html vercel.json assets/palletto.css _header.html _footer.html \
          palettenschein-digitalisieren.html palettenkonto-software.html palettentausch-app.html
  git commit -m "Phase 2/2: 3 Unterseiten neu im Design, Partials, CSS, Cache-Fix"
  git push origin main

Danach testen: palletto.de/palettenkonto-software.html + /palettentausch-app.html (Cmd+Shift+R)
