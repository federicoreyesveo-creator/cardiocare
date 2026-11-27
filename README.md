# Cardio Care

Rediseño del sitio del Dr. Josué Cauich Segovia, cardiólogo pediatra en Mérida.

- `index.html`: el sitio completo en un solo archivo (versión 3), listo para publicar.
- `src/`: las fuentes. `python build.py` dentro de `src/` regenera `index.html`, `src/cardio.html` y las fotos de `img/`.
  Con Playwright instalado, además escribe la portada ya renderizada en el HTML (para Google y buscadores de IA).
  `CHROME_PATH` opcional: ruta a un Chrome/Chromium para el prerender.
- `robots.txt`, `sitemap.xml`, `llms.txt`, `og.jpg`, `favicon.svg`, `apple-touch-icon.png`, `vercel.json` (cabeceras y caché).
- Dominio: cambiar `SITE` en `src/build.py`, y las URLs de `robots.txt`, `sitemap.xml` y `llms.txt`.
