# Cardio Care

Rediseño del sitio del Dr. Josué Cauich Segovia, cardiólogo pediatra en Mérida.

- `index.html`, `acerca-de/`, `contacto/`, `servicios/`: el sitio publicado (lo genera el build, no se edita a mano).
- `src/`: las fuentes. `python build.py` dentro de `src/` genera una página por URL (`/`, `/acerca-de/`, `/contacto/`, `/servicios/<slug>/`),
  las fotos de `img/`, `sitemap.xml` y `llms.txt`. Con Playwright instalado, además escribe el contenido de cada página ya
  renderizado en el HTML (para Google y buscadores de IA). `CHROME_PATH` opcional: ruta a un Chrome/Chromium para el prerender.
  Los links viejos con `#` (por ejemplo `#servicio-soplos`) redirigen solos a la URL nueva.
- `robots.txt`, `og.jpg`, `favicon.svg`, `apple-touch-icon.png`, `vercel.json` (cabeceras y caché).
- Dominio: cambiar `SITE` en `src/build.py`, y la URL de `robots.txt`.
