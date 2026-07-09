# Phase 2 – Schritt 1: Neues Header/Footer (einheitliche Navigation)

Ersetzt die alten Partials. ALLE Unterseiten bekommen sofort das neue Design + Menü mit Unterseiten.
Selbst-enthalten (eigenes CSS, kein JS nötig – Mobil-Menü per CSS-Checkbox), funktioniert mit der bestehenden innerHTML-Injektion.

## Deployen (Repo-Wurzel)
  unzip -o palletto-phase2-schritt1.zip -d .
  git add _header.html _footer.html
  git commit -m "Phase 2/1: einheitliches Header/Footer im neuen Design"
  git push origin main

## Hinweis
- Voraussetzung: assets/img/logo.webp + assets/fonts/ liegen schon im Repo (aus Phase 1) – passt.
- Falls oben auf einer Unterseite eine kleine Lücke bleibt (alter fixed-Header hatte Padding),
  wird das in Schritt 2 beim Body-Redesign sauber behoben.
