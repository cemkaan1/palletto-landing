# Neues Logo – überall ersetzt

Neu:
  assets/img/logo.svg        Wortmarke dunkel (Header)
  assets/img/logo-weiss.svg  Wortmarke weiß (Footer)
  assets/img/icon.svg        App-Icon
  favicon.svg / favicon.ico / favicon-96x96.png
  apple-touch-icon.png
  web-app-manifest-192x192.png / -512x512.png  (maskable, Vollbild)
  og-image.png               neue Social-Vorschau
  site.webmanifest           theme_color auf #0F1B2D

Geändert: _header.html, _footer.html, index.html, danke.html

## Deployen (Repo-Wurzel)
  unzip -o palletto-logo-website.zip -d .
  git add -A
  git commit -m "Neues Logo: Wortmarke, App-Icon, Favicons, OG-Image"
  git push origin main

Danach mit Cmd+Shift+R prüfen. Favicon braucht evtl. Hard-Reload oder Inkognito.
Alte assets/img/logo.webp wird nicht mehr gebraucht (kann bleiben).
