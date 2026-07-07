#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os, json, re, base64, html, glob, datetime
import requests

SITE = "https://palletto.de"
TOPICS_FILE = "content/blog-topics.json"
MODEL = "claude-sonnet-4-6"  # ggf. an aktuelles Modell aus docs.claude.com anpassen
TODAY = datetime.date.today().isoformat()

def gh_output(key, val):
    out = os.environ.get("GITHUB_OUTPUT")
    if out:
        with open(out, "a", encoding="utf-8") as f:
            f.write(f"{key}={val}\n")

def font_b64(path):
    try:
        with open(path, "rb") as f:
            return base64.b64encode(f.read()).decode()
    except Exception:
        return None

def pick_topic(topics):
    for t in topics:
        if not os.path.exists(f"blog/{t['slug']}/index.html"):
            return t
    return None

def call_claude(topic):
    system = ("Du bist Cem-Kaan Özertas, Gründer von Palletto und selbst Transportunternehmer. "
        "Du schreibst Blogartikel für deutsche Speditionen rund um Palettentausch, Palettenkonto und digitale "
        "Palettenscheine. Stil: professionelles, klares Du-Deutsch, Unternehmer-Perspektive, kein Hype, kein "
        "Marketing-Geschwafel, konkret und ehrlich nützlich. Keine erfundenen Zahlen (nutze Spannen). Rechtliche "
        "Aussagen vorsichtig formulieren – es gibt im Template einen 'keine Rechtsberatung'-Hinweis.")
    user = (f"Schreibe einen Blogartikel.\n\nThema: {topic['title']}\nFokus-Keyword: {topic['keyword']}\n"
        f"Blickwinkel: {topic['angle']}\n\n"
        "Gib AUSSCHLIESSLICH gültiges JSON zurück (keine Backticks), exakt so:\n"
        '{"title":"SEO-Titel <60 Zeichen mit Keyword","meta_description":"~150 Zeichen mit Keyword",'
        '"lead":"1 Absatz Einleitung, ohne HTML-Tags",'
        '"body_html":"Artikel-Body als HTML. Erlaubt: <h2>,<h3>,<p>,<ul><li>,<strong>,<a href>. '
        '3-5 <h2>-Abschnitte. Optional EIN <div class=\\"callout\\"><span class=\\"label\\">Kurz gesagt</span> ...</div>. '
        'KEINE <h1>, kein <html>/<head>/<body>.",'
        '"faq":[{"question":"...","answer":"..."}]}\n'
        "Body ca. 700-1000 Wörter, 3-4 FAQ-Einträge.")
    r = requests.post("https://api.anthropic.com/v1/messages",
        headers={"x-api-key": os.environ["ANTHROPIC_API_KEY"],
                 "anthropic-version": "2023-06-01", "content-type": "application/json"},
        json={"model": MODEL, "max_tokens": 4000, "system": system,
              "messages": [{"role": "user", "content": user}]}, timeout=180)
    r.raise_for_status()
    text = "".join(b.get("text", "") for b in r.json()["content"] if b.get("type") == "text").strip()
    text = re.sub(r"^```(?:json)?|```$", "", text, flags=re.M).strip()
    return json.loads(text)

def make_hero(slug, title, eyebrow, theme):
    NAVY, NAVY9, ORANGE, CREAM = "#1B3A6B", "#0F2342", "#FF9500", "#FAFAF7"
    w = title.split()
    lines = [" ".join(w[:(len(w)+1)//2]), " ".join(w[(len(w)+1)//2:])] if len(w) > 3 else [title]
    style = ""
    for wt, fn in [("800", "fonts/inter-v20-latin-800.woff2"), ("700", "fonts/inter-v20-latin-700.woff2")]:
        b = font_b64(fn)
        if b:
            style += ("@font-face{font-family:'Inter';font-weight:" + wt +
                      ";font-style:normal;src:url(data:font/woff2;base64," + b + ") format('woff2');}")
    if theme == "cream":
        bg = ('<rect width="1200" height="630" fill="' + CREAM + '"/>'
              '<circle cx="1090" cy="110" r="260" fill="#F1EFE7"/>'
              '<circle cx="1170" cy="600" r="150" fill="' + ORANGE + '" opacity="0.08"/>'
              '<rect x="0" y="0" width="10" height="630" fill="' + ORANGE + '"/>')
        tfill, bfill, pfill = NAVY9, NAVY9, "#7b8696"
    else:
        bg = ('<rect width="1200" height="630" fill="' + NAVY9 + '"/>'
              '<circle cx="1080" cy="120" r="280" fill="' + NAVY + '" opacity="0.55"/>'
              '<circle cx="1160" cy="590" r="160" fill="' + ORANGE + '" opacity="0.12"/>')
        tfill, bfill, pfill = "#FFFFFF", "#FFFFFF", "rgba(255,255,255,0.6)"
    ty = "300" if len(lines) == 2 else "320"
    tspans = "".join('<tspan x="80" dy="' + ("0" if i == 0 else "64") + '">' + html.escape(l) + '</tspan>'
                     for i, l in enumerate(lines))
    return ('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">'
            '<defs><style>' + style + '</style></defs>' + bg +
            '<text x="80" y="150" font-family="Inter,sans-serif" font-size="22" font-weight="700" '
            'letter-spacing="3" fill="' + ORANGE + '">' + html.escape(eyebrow) + '</text>'
            '<text y="' + ty + '" font-family="Inter,sans-serif" font-size="56" font-weight="800" '
            'letter-spacing="-1.5" fill="' + tfill + '">' + tspans + '</text>'
            '<circle cx="87" cy="554" r="7" fill="' + ORANGE + '"/>'
            '<text x="102" y="562" font-family="Inter,sans-serif" font-size="28" font-weight="800" fill="'
            + bfill + '">Palletto</text>'
            '<text x="1120" y="564" text-anchor="end" font-family="Inter,sans-serif" font-size="18" '
            'font-weight="700" fill="' + pfill + '">palletto.de</text></svg>')

def build_page(topic, art):
    slug, e = topic["slug"], lambda s: html.escape(s, quote=True)
    title = art.get("title") or topic["title"]
    meta, lead, body = art["meta_description"], art["lead"], art["body_html"]
    eyebrow, faq = topic["eyebrow"], art.get("faq", [])
    url, hero = f"{SITE}/blog/{slug}/", f"{SITE}/blog/images/{slug}.svg"
    faq_html = "".join("<details><summary>" + html.escape(q["question"]) + "</summary><p>"
                       + html.escape(q["answer"]) + "</p></details>" for q in faq)
    bp = json.dumps({"@context": "https://schema.org", "@type": "BlogPosting", "headline": title,
        "description": meta, "image": f"{SITE}/og-image.png", "datePublished": TODAY, "dateModified": TODAY,
        "author": {"@type": "Person", "name": "Cem-Kaan Özertas"},
        "publisher": {"@type": "Organization", "name": "Palletto",
                      "logo": {"@type": "ImageObject", "url": f"{SITE}/og-image.png"}},
        "mainEntityOfPage": url}, ensure_ascii=False)
    faqld = json.dumps({"@context": "https://schema.org", "@type": "FAQPage",
        "mainEntity": [{"@type": "Question", "name": q["question"],
                        "acceptedAnswer": {"@type": "Answer", "text": q["answer"]}} for q in faq]},
        ensure_ascii=False)
    return f"""<!DOCTYPE html>
<html lang="de"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{e(title)} | Palletto</title>
<meta name="description" content="{e(meta)}">
<link rel="canonical" href="{url}"><meta name="robots" content="index, follow">
<meta property="og:type" content="article"><meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(meta)}"><meta property="og:url" content="{url}">
<meta property="og:image" content="{SITE}/og-image.png"><meta property="og:site_name" content="Palletto">
<meta property="og:locale" content="de_DE"><meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="/blog/assets/blog.css">
<script type="application/ld+json">{bp}</script>
<script type="application/ld+json">{faqld}</script>
</head><body>
<header class="site-header"><div class="bar">
<a class="brand" href="/"><span class="dot"></span>Palletto</a>
<nav class="nav"><a href="/">Startseite</a><a href="/blog/">Blog</a><a href="/#preise">Preise</a><a class="cta" href="/#preise">Kostenlos testen</a></nav>
</div></header>
<main><article>
<div class="wrap article-hero"><span class="eyebrow">{e(eyebrow)}</span><h1>{e(title)}</h1>
<div class="article-meta"><span>Cem-Kaan Özertas</span><span class="sep"></span><span>{TODAY}</span></div></div>
<div class="wrap"><div class="hero-img"><img src="{hero}" alt="{e(title)}" width="1200" height="630"></div></div>
<div class="wrap prose">
<p class="lead">{html.escape(lead)}</p>
{body}
<div class="cta-box"><h3>Schluss mit Zettelwirtschaft.</h3><p>Palletto dokumentiert jede Palettenübergabe mobil – mit Unterschrift, Foto und automatischem Saldo. Ohne Hardware.</p><a class="btn" href="/#preise">Palletto kostenlos testen</a></div>
<div class="faq"><h2>Häufige Fragen</h2>{faq_html}</div>
<div class="byline"><div class="avatar">CÖ</div><div class="who"><strong>Cem-Kaan Özertas</strong><span>Gründer von Palletto &amp; selbst Transportunternehmer</span></div></div>
<p class="disclaimer">Dieser Beitrag dient der allgemeinen Information und stellt keine Rechtsberatung dar.</p>
<a class="back" href="/blog/">← Zurück zum Blog</a>
</div></article></main>
<footer class="site-footer"><div class="inner">
<a class="brand" href="/"><span class="dot"></span>Palletto</a>
<div class="links"><a href="/">Startseite</a><a href="/blog/">Blog</a><a href="/#preise">Preise</a><a href="/impressum.html">Impressum</a><a href="/datenschutz.html">Datenschutz</a></div>
<div class="copy">© 2026 Palletto · Digitale Palettenscheine für Transportunternehmen</div>
</div></footer>
</body></html>"""

def build_sitemap():
    rows = [("/", "1.0", "weekly"), ("/blog/", "0.8", "weekly")]
    for p in sorted(glob.glob("blog/*/index.html")):
        rows.append((f"/blog/{p.split('/')[1]}/", "0.7", "monthly"))
    xml = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for loc, prio, freq in rows:
        xml.append(f"  <url><loc>{SITE}{loc}</loc><lastmod>{TODAY}</lastmod>"
                   f"<changefreq>{freq}</changefreq><priority>{prio}</priority></url>")
    xml.append("</urlset>")
    with open("sitemap.xml", "w", encoding="utf-8") as f:
        f.write("\n".join(xml) + "\n")

def main():
    topics = json.load(open(TOPICS_FILE, encoding="utf-8"))
    topic = pick_topic(topics)
    if not topic:
        print("Keine offenen Themen mehr."); gh_output("created", "false"); return
    print("Erzeuge Artikel:", topic["slug"])
    art = call_claude(topic)
    os.makedirs(f"blog/{topic['slug']}", exist_ok=True)
    os.makedirs("blog/images", exist_ok=True)
    open(f"blog/images/{topic['slug']}.svg", "w", encoding="utf-8").write(
        make_hero(topic["slug"], art.get("title") or topic["title"], topic["eyebrow"], topic.get("theme", "navy")))
    open(f"blog/{topic['slug']}/index.html", "w", encoding="utf-8").write(build_page(topic, art))
    build_sitemap()
    gh_output("created", "true"); gh_output("slug", topic["slug"]); gh_output("title", art.get("title") or topic["title"])
    print("Fertig:", topic["slug"])

if __name__ == "__main__":
    main()
    