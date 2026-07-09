# Konsistenz-Fix nach Full-Check

## Was drin ist
- impressum/datenschutz/agb/avv/danke.html -> Tailwind-CDN RAUS, nutzen jetzt /assets/palletto.css
  (noindex bleibt, canonical ergaenzt, Inter-Fonts raus)
- danke.html: kaputtes Logo /pallettologo.png -> /assets/img/logo.webp
- assets/palletto.css -> neu kompiliert, enthaelt jetzt auch .legal-content
- robots.txt -> Disallow auf geloeschte Testseiten entfernt
- Alle Seiten auf palletto.css?v=4 (Cache-Bust)

## Deployen (Repo-Wurzel)
  unzip -o palletto-final-fix.zip -d .
  git add -A
  git commit -m "Konsistenz: Rechtsseiten ohne CDN, Logo-Fix, robots.txt, CSS v4"
  git push origin main

## Danach optional aufraeumen (spart Ballast, kein Muss)
  git rm -r fonts/                       # alte Inter-Fonts, werden nicht mehr geladen
  git rm assets/img/founder.webp assets/img/founder-avatar.webp assets/img/lkw-ladung.webp \
         assets/img/paletten-hof.webp assets/img/paletten-lager.webp assets/img/lager-regal.webp \
         assets/img/app-bilanz.webp assets/img/app-kunden.webp assets/img/app-kunde.webp \
         assets/img/app-fotos.webp assets/img/app-fahrer-daten.webp
  git commit -m "Aufraeumen: ungenutzte Fonts und Bilder"
  git push origin main
