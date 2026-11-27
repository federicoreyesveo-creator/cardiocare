"""Arma el sitio: python build.py (dentro de src/).

1. Saca las fotos de e-img.html a ../img/*.webp (cacheables, ya no van pegadas en el HTML).
2. Genera una página por URL, cada una con su título, descripción, canonical y Open Graph:
   /  ·  /acerca-de/  ·  /contacto/  ·  /servicios/<slug>/
3. Prerender (si está Playwright): escribe el contenido de cada página ya renderizado dentro de <main>,
   para que Google y los buscadores de IA (que no corren JavaScript) lo lean sin esperar al JS.
4. Escribe sitemap.xml y llms.txt con todas las URLs.
"""
import base64, html as H, http.server, json, os, re, socketserver, threading

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
os.chdir(HERE)

# Dirección pública. Cuando esté el dominio propio, cambiar acá y en robots.txt, y volver a correr el build.
SITE = "https://cardiocare-sigma.vercel.app"
TODAY = "2026-11-27"

LOGO='<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 34.5S5 25.6 5 15.4C5 10.6 8.7 7 13.2 7c2.8 0 5.2 1.4 6.8 3.6C21.6 8.4 24 7 26.8 7 31.3 7 35 10.6 35 15.4 35 25.6 20 34.5 20 34.5Z" fill="#E11D2E"/><path d="M8.5 19.5h7l2-4 3.2 8 2.3-5h8.5" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
PHONE='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>'
HEART='<svg viewBox="0 0 24 24" fill="#fff"><path d="M12 21s-8-5.2-8-11.2A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 2.8C20 15.8 12 21 12 21Z"/></svg>'

def read(p):
    return open(p, encoding="utf-8").read()

def write(path, text):
    if os.path.dirname(path):
        os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, "w", encoding="utf-8", newline="\n").write(text)

def file_for(url):
    return os.path.join(ROOT, *[p for p in url.split("/") if p], "index.html")

# ---------- 1. fotos a archivos ----------
img_src = read("e-img.html")
imgs = dict(re.findall(r'"([a-zA-Z0-9_-]+)"\s*:\s*"data:image/webp;base64,([^"]+)"', img_src))
os.makedirs(os.path.join(ROOT, "img"), exist_ok=True)
for k, b64 in imgs.items():
    with open(os.path.join(ROOT, "img", f"{k}.webp"), "wb") as f:
        f.write(base64.b64decode(b64))
img_js = "<script>\nconst IMG=" + json.dumps({k: f"/img/{k}.webp" for k in imgs}) + ";\n</script>\n"

# ---------- 2. páginas ----------
data = read("e-data.js")
services = [dict(slug=s, name=n, short=sh.replace("“", "").replace("”", ""), img=im)
            for s, n, sh, im in re.findall(r'\{slug:"([^"]+)",name:"([^"]+)",short:"([^"]+)",img:\[[^\]]*?"([a-z0-9-]+)"\]', data)]

DR = "Dr. Josué Cauich Segovia"
TAIL = "Cardiólogo Pediatra en Mérida | Cardio Care"

def clip(t, n=158):
    return t if len(t) <= n else t[: t.rfind(" ", 0, n - 1)].rstrip(",.;:") + "…"

pages = [
    dict(url="/", key="inicio", title=f"Cardiólogo Pediatra en Mérida · {DR} | Cardio Care",
         desc=f"{DR}, cardiólogo pediatra intervencionista en Mérida, Yucatán. Soplos, arritmias, cardiopatías congénitas y cateterismo. Consultorio en Star Médica Altabrisa.",
         image="/og.jpg"),
    dict(url="/acerca-de/", key="acerca-de", title=f"{DR} · {TAIL}", crumb="Acerca de",
         desc=f"Conoce al {DR}: formado en el Instituto Nacional de Pediatría y el Instituto Nacional de Cardiología, certificado por el Consejo Mexicano de Cardiología.",
         image="/img/dr-portrait.webp"),
    dict(url="/contacto/", key="contacto", title=f"Contacto y citas · {TAIL}", crumb="Contacto",
         desc="Agenda una consulta de cardiología pediátrica en Mérida: consultorio 916 del Hospital Star Médica Altabrisa. Teléfono (+52) 999 409 2633, lunes a sábado.",
         image="/og.jpg"),
] + [
    dict(url=f"/servicios/{s['slug']}/", key=f"servicio-{s['slug']}", title=clip(f"{s['name']} · {TAIL}", 70),
         crumb=s["name"], desc=clip(f"{s['name']}: {s['short']}. Atención con el {DR}, cardiólogo pediatra intervencionista en Mérida, Yucatán."),
         image=f"/img/{s['img']}.webp")
    for s in services
]

physician = {
    "@type": "Physician",
    "@id": SITE + "/#medico",
    "name": f"{DR} · Cardio Care",
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

def jsonld(pg):
    graph = [physician]
    if pg["url"] != "/":
        items = [{"@type": "ListItem", "position": 1, "name": "Inicio", "item": SITE + "/"}]
        if pg["url"].startswith("/servicios/"):
            items.append({"@type": "ListItem", "position": 2, "name": "Servicios", "item": SITE + "/#servicios"})
        items.append({"@type": "ListItem", "position": len(items) + 1, "name": pg["crumb"], "item": SITE + pg["url"]})
        graph.append({"@type": "BreadcrumbList", "itemListElement": items})
        graph.append({"@type": "MedicalWebPage", "url": SITE + pg["url"], "name": pg["title"], "description": pg["desc"],
                      "about": {"@id": SITE + "/#medico"}, "inLanguage": "es-MX"})
    return json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False)

FONTS = "https://fonts.googleapis.com/css2?family=Onest:wght@300;400;500;600&family=Geist+Mono:wght@500&display=swap"

def head(pg):
    e = lambda s: H.escape(s, quote=True)
    lcp = '<link rel="preload" as="image" href="/img/dr-cut.webp" fetchpriority="high">\n' if pg["url"] == "/" else ""
    return f'''<title>{e(pg["title"])}</title>
<meta name="description" content="{e(pg["desc"])}">
<link rel="canonical" href="{SITE}{pg["url"]}">
<meta name="theme-color" content="#2347D1">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta property="og:type" content="website">
<meta property="og:locale" content="es_MX">
<meta property="og:site_name" content="Cardio Care">
<meta property="og:title" content="{e(pg["title"])}">
<meta property="og:description" content="{e(pg["desc"])}">
<meta property="og:url" content="{SITE}{pg["url"]}">
<meta property="og:image" content="{SITE}{pg["image"]}">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="{FONTS}">
<link href="{FONTS}" rel="stylesheet" media="print" onload="this.media='all'">
<noscript><link href="{FONTS}" rel="stylesheet"></noscript>
{lcp}<script type="application/ld+json">{jsonld(pg)}</script>
'''

hdr = read("e-header.html").replace("__LOGO__", LOGO).replace("__PHONE__", PHONE).replace("__HEART__", HEART)
body = (read("e.css") + "\n" + hdr + "\n" + img_js + data
        + "\nconst LOGO=`" + LOGO + "`;\n" + read("e-views.js") + "\n})();\n</script>\n")

def page_html(pg):
    out = head(pg) + body
    return ('<!doctype html>\n<html lang="es-MX">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
            + out.replace("</style>\n", "</style>\n</head>\n<body>\n", 1) + "</body>\n</html>\n")

write("cardio.html", head(pages[0]) + body)
built = {pg["url"]: page_html(pg) for pg in pages}
for url, text in built.items():
    write(file_for(url), text)

# ---------- 3. prerender ----------
def fill(text, el_id, inner, pre_key=None):
    m = re.search(rf'<(\w+)[^>]*\bid="{el_id}"[^>]*>', text)
    if not m or not text.startswith(f"</{m.group(1)}>", m.end()):  # solo contenedores vacíos
        return text
    tag = m.group(0) if pre_key is None else m.group(0)[:-1] + f' data-pre="{pre_key}">'
    return text[:m.start()] + tag + inner + text[m.end():]

def prerender():
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("! Sin Playwright: las páginas quedan sin prerender (el contenido lo pinta solo el JS).")
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
            tab = b.new_page()
            tab.add_init_script(hook)
            for pg in pages:
                tab.goto(f"http://127.0.0.1:{port}{pg['url']}", wait_until="load")
                pre = tab.evaluate("window.__pre")
                text = built[pg["url"]]
                if "main" in pre:
                    text = fill(text, "main", pre["main"], pg["key"])
                for el_id in ("megapanel", "drawersvc"):
                    if el_id in pre:
                        text = fill(text, el_id, pre[el_id])
                write(file_for(pg["url"]), text)
            b.close()
    finally:
        srv.shutdown()
    print("prerender ok:", len(pages), "páginas")

prerender()

# ---------- 4. sitemap y llms.txt ----------
urls = "\n".join(f"  <url><loc>{SITE}{pg['url']}</loc><lastmod>{TODAY}</lastmod></url>" for pg in pages)
write(os.path.join(ROOT, "sitemap.xml"),
      f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{urls}\n</urlset>\n')

svc_lines = "\n".join(f"- [{s['name']}]({SITE}/servicios/{s['slug']}/): {s['short']}" for s in services)
write(os.path.join(ROOT, "llms.txt"), f"""# Cardio Care · {DR}

> Cardiólogo pediatra intervencionista en Mérida, Yucatán. Atiende a bebés, niños y adolescentes en el consultorio 916 del Hospital Star Médica Altabrisa.

Certificado por el Consejo Mexicano de Cardiología (Cardiología Pediátrica e Intervencionista) y el Consejo Mexicano de Pediatría. Formado en el Instituto Nacional de Pediatría (UNAM) y en el Instituto Nacional de Cardiología "Ignacio Chávez". Miembro activo de la AMECC. Calificación de 5.0 en Google con más de 450 reseñas.

## Consultorio

- Dirección: Consultorio 916, Hospital Star Médica, Calle 26 #199 por 15 y 7, Col. Altabrisa, 97133 Mérida, Yucatán, México
- Teléfonos: +52 999 409 2633 · +52 999 196 1958
- Lunes a viernes: 09:00 – 20:00
- Sábado: 09:00 – 13:00
- Domingo: cerrado
- Contacto: {SITE}/contacto/

## Servicios

{svc_lines}

## Más

- [Acerca del {DR}]({SITE}/acerca-de/)
- [Perfil en Google Maps](https://www.google.com/maps/place/Dr+Josu%C3%A9+Cauich+Segovia+Cardi%C3%B3logo+Pediatra/@21.0160689,-89.5849652,17z)
""")
print(len(pages), "páginas ·", len(imgs), "fotos en img/ · sitemap.xml y llms.txt al día")
