# Migración de tarjetas · Lemon

Prototipo interactivo (alta fidelidad) del flujo de migración de tarjetas, construido con el
**Lemon Mobile Design System**. Es un sitio **100% estático** — no tiene paso de build:
HTML + React/Babel cargados desde CDN + componentes JSX locales.

## Estructura

```
index.html        → punto de entrada (abrilo directo en el navegador)
cards/
  app.jsx         → app principal (router de pantallas)
  flows.jsx       → definición de los flujos / escenarios
  screens-shared.jsx
  lemon-ui.jsx    → componentes del design system
  ios-frame.jsx   → marco del iPhone
  image-slot.js   → slots de imagen arrastrables
  colors_and_type.css
  assets/         → imágenes (logos, lemmies, flags)
  fonts/          → fuentes + íconos custom de Lemon
```

## Cómo correrlo localmente

No hace falta instalar nada. Solo necesitás servirlo por HTTP (no abrir el archivo con
`file://`, porque el navegador bloquea la carga de los `.jsx`).

```bash
# con Python (viene en casi todas las máquinas)
python3 -m http.server 8000
# luego abrí http://localhost:8000

# o con Node, si lo tenés
npx serve .
```

## Editar con Claude Code

1. Cloná el repo: `git clone <url-del-repo>`
2. Abrí la carpeta con Claude Code.
3. Los componentes están separados por archivo en `cards/` — pedile a Claude que edite el
   que corresponda (p.ej. "cambiá el copy de tal pantalla en `flows.jsx`").

## Deploy en Vercel

El proyecto se sirve tal cual, sin configuración:

1. En [vercel.com](https://vercel.com) → **Add New… → Project**.
2. Elegí este repo.
3. Framework Preset: **Other**. Build Command: *(vacío)*. Output Directory: *(vacío / raíz)*.
4. **Deploy.**

Cada `git push` a la rama principal vuelve a desplegar automáticamente.
