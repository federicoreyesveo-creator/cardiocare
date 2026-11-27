"""Arma el sitio: python build.py (dentro de src/).

1. Saca las fotos de e-img.html a ../img/*.webp (cacheables, ya no van pegadas en el HTML).
2. Une CSS + header + datos + vistas en cardio.html (fragmento) e ../index.html (página completa con SEO).
3. Prerender (si está Playwright): escribe la portada ya renderizada dentro de <main>, para que Google
   y los buscadores de IA (que no corren JavaScript) lean el contenido sin esperar al JS.
"""
import base64, http.server, json, os, re, socketserver, threading

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
os.chdir(HERE)

# Dirección pública. Cuando esté el dominio propio, cambiar acá y volver a correr el build.
SITE = "https://cardiocare-sigma.vercel.app"

LOGO='<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 34.5S5 25.6 5 15.4C5 10.6 8.7 7 13.2 7c2.8 0 5.2 1.4 6.8 3.6C21.6 8.4 24 7 26.8 7 31.3 7 35 10.6 35 15.4 35 25.6 20 34.5 20 34.5Z" fill="#E11D2E"/><path d="M8.5 19.5h7l2-4 3.2 8 2.3-5h8.5" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
PHONE='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>'
HEART='<svg viewBox="0 0 24 24" fill="#fff"><path d="M12 21s-8-5.2-8-11.2A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 2.8C20 15.8 12 21 12 21Z"/></svg>'

def read(p):
    return open(p, encoding="utf-8").read()

# ---------- 1. fotos a archivos ----------
img_src = read("e-img.html")
imgs = dict(re.findall(r'"([a-zA-Z0-9_-]+)"\s*:\s*"data:image/webp;base64,([^"]+)"', img_src))
os.makedirs(os.path.join(ROOT, "img"), exist_ok=True)
for k, b64 in imgs.items():
    with open(os.path.join(ROOT, "img", f"{k}.webp"), "wb") as f:
        f.write(base64.b64decode(b64))
img_js = "<script>\nconst IMG=" + json.dumps({k: f"/img/{k}.webp" for k in imgs}) + ";\n</script>\n"

# ---------- 2. armado ----------
hdr = read("e-header.html").replace("__LOGO__", LOGO).replace("__PHONE__", PHONE).replace("__HEART__", HEART)

TITLE = "Cardiólogo Pediatra en Mérida · Dr. Josué Cauich | Cardio Care"
DESC = ("Dr. Josué Cauich Segovia, cardiólogo pediatra intervencionista en Mérida, Yucatán. Soplos, arritmias, "
        "cardiopatías congénitas y cateterismo. Consultorio en Star Médica Altabrisa.")

ld = {
    "@context": "https://schema.org",
    "@type": "Physician",
    "name": "Dr. Josué Cauich Segovia · Cardio Care",
    "description": "Cardiólogo pediatra intervencionista en Mérida, Yucatán.",
    "url": SITE + "/",
    "image": SITE + "/img/dr2.webp",
    "logo": SITE + "/favicon.svg",
    "medicalSpecialty": ["Pediatric", "Cardiovascular"],
    "telephone": "+529994092633",
    "address": {
        "@type": "PostalAddress",
        "streetAddress": "Calle 26 #199 por 15 y 7, Consultorio 916, Hospital Star Médica",
        "addressLocality": "Mérida",
        "addressRegion": "Yucatán",
        "postalCode": "97133",
        "addressCountry": "MX",
    },
    "geo": {"@type": "GeoCoordinates", "latitude": 21.0160689, "longitude": -89.5849652},
    "hasMap": "https://www.google.com/maps/place/Hospital+Star+M%C3%A9dica+M%C3%A9rida/data=!4m2!3m1!1s0x0:0xc198ba75b83b93b2",
    "sameAs": ["https://www.google.com/maps/place/Dr+Josu%C3%A9+Cauich+Segovia+Cardi%C3%B3logo+Pediatra/@21.0160689,-89.5849652,17z/data=!4m8!3m7!1s0x8f5677212c8c126d:0xbca4947630c16ba3!8m2!3d21.0160689!4d-89.5849652!9m1!1b1!16s%2Fg%2F1pty506rj"],
    "openingHoursSpecification": [
        {"@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], "opens": "09:00", "closes": "20:00"},
        {"@type": "OpeningHoursSpecification", "dayOfWeek": "Saturday", "opens": "09:00", "closes": "13:00"},
    ],
    "areaServed": {"@type": "State", "name": "Yucatán"},
}

FONTS = "https://fonts.googleapis.com/css2?family=Onest:wght@300;400;500;600&family=Geist+Mono:wght@500&display=swap"
head = f'''<title>{TITLE}</title>
<meta name="description" content="{DESC}">
<link rel="canonical" href="{SITE}/">
<meta name="theme-color" content="#2347D1">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta property="og:type" content="website">
<meta property="og:locale" content="es_MX">
<meta property="og:site_name" content="Cardio Care">
<meta property="og:title" content="Cardiólogo Pediatra en Mérida · Cardio Care">
<meta property="og:description" content="Dr. Josué Cauich Segovia, cardiólogo pediatra intervencionista en Mérida, Yucatán.">
<meta property="og:url" content="{SITE}/">
<meta property="og:image" content="{SITE}/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="El Dr. Josué Cauich Segovia, cardiólogo pediatra en Mérida">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="{FONTS}">
<link href="{FONTS}" rel="stylesheet" media="print" onload="this.media='all'">
<noscript><link href="{FONTS}" rel="stylesheet"></noscript>
<link rel="preload" as="image" href="/img/dr-cut.webp" fetchpriority="high">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
'''
out = (head + read("e.css") + "\n" + hdr + "\n" + img_js + read("e-data.js")
       + "\nconst LOGO=`" + LOGO + "`;\n" + read("e-views.js") + "\n})();\n</script>\n")
open("cardio.html", "w", encoding="utf-8").write(out)

page = ('<!doctype html>\n<html lang="es-MX">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
        + out.replace("</style>\n", "</style>\n</head>\n<body>\n", 1) + "</body>\n</html>\n")
index = os.path.join(ROOT, "index.html")
open(index, "w", encoding="utf-8").write(page)

# ---------- 3. prerender de la portada ----------
def prerender():
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("! Sin Playwright: index.html queda sin prerender (el contenido lo pinta solo el JS).")
        return

    class Quiet(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *a, **kw):
            super().__init__(*a, directory=ROOT, **kw)
        def log_message(self, *a):
            pass

    srv = socketserver.TCPServer(("127.0.0.1", 0), Quiet)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    port = srv.server_address[1]
    # Guarda el HTML tal cual lo genera cada vista, antes de que las animaciones le agreguen estados.
    hook = """(() => {
      const d = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
      window.__pre = {};
      Object.defineProperty(Element.prototype, 'innerHTML', { configurable: true, get: d.get,
        set(v) { if (this.id && !(this.id in window.__pre)) window.__pre[this.id] = v; d.set.call(this, v); } });
    })();"""
    try:
        with sync_playwright() as p:
            # CHROME_PATH opcional: usar un Chrome/Chromium ya instalado en vez del de Playwright.
            b = p.chromium.launch(executable_path=os.environ.get("CHROME_PATH") or None)
            pg = b.new_page()
            pg.add_init_script(hook)
            pg.goto(f"http://127.0.0.1:{port}/", wait_until="load")
            pre = pg.evaluate("window.__pre")
            b.close()
    finally:
        srv.shutdown()

    html = page
    for el_id in ("main", "megapanel", "drawersvc"):
        if el_id not in pre:
            continue
        open_tag = re.search(rf'<(\w+)[^>]*\bid="{el_id}"[^>]*>', html)
        close = f"</{open_tag.group(1)}>"
        start = open_tag.end()
        if not html.startswith(close, start):  # solo se rellenan contenedores vacíos
            continue
        tag = open_tag.group(0)
        if el_id == "main":
            tag = tag[:-1] + ' data-pre="inicio">'
        html = html[:open_tag.start()] + tag + pre[el_id] + html[start:]
    open(index, "w", encoding="utf-8").write(html)
    print("prerender ok:", ", ".join(k for k in pre))

prerender()
print(len(open(index, encoding="utf-8").read()) // 1024, "KB index.html ·", len(imgs), "fotos en img/")
