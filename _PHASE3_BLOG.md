# Phase 3 – Blog: neues Design + EINHEITLICHE Partials

- blog/assets/blog.css      -> neu (Design-System der Hauptseite)
- blog/index.html + 13 Artikel -> alter fest eingebauter Header/Footer ENTFERNT,
  laden jetzt /_header.html und /_footer.html (identisch zur restlichen Seite)

## Deployen (Repo-Wurzel)
  unzip -o palletto-phase3-blog.zip -d .
  git add blog/
  git commit -m "Phase 3: Blog im neuen Design + einheitliche Partials"
  git push origin main

Danach palletto.de/blog/ und einen Artikel mit Cmd+Shift+R pruefen.
