# Prototipos Lemon · tarjetas + cajas + gastos + onboarding + pagos automáticos + alta de tarjetas + crédito

Prototipos interactivos (alta fidelidad) construidos con el **Lemon Mobile Design System**.
Es un sitio **100% estático** — no tiene paso de build: HTML + React/Babel cargados desde
CDN + componentes JSX locales.

- `/` → **Migración de tarjetas** (flujos GP → Pomelo, NFC/Apple Pay)
- `/cajas/` → **Cofres** (FTE: pesos apartados que rinden, dentro de Portfolio; la tarjeta/QR no los ven)
- `/gastos/` → **Tus gastos** (home de un vistazo + buscador con filtros — ver `gastos/README.md`)
- `/onboarding/` → **Onboarding sin tarjetas** (home vacía → pager horizontal virtual/física/crédito → flujos de alta)
- `/pagos-automaticos/` → **Tus pagos automáticos** (mini app: qué débitos automáticos tenés, cuáles se rebotan y en qué tarjeta; 4 variantes para testear — ver `pagos-automaticos/README.md`)
- `/credito/` → **Nueva Lemon Credit Card** (el prototipo con el que se pitchea la propuesta, ordenado por la narrativa de `credito/narrativa.md`: elegí el límite entre tres montos activados según tu saldo → elegí el respaldo en dólar digital o Bitcoin (el límite es el 80% del respaldo) → se crea la tarjeta y caés en la home, que separa «empezá a usar tu tarjeta» del seguimiento del envío; el cierre y el débito automático se eligen al activarla, y termina en Apple Pay. Al lado de cada pantalla hay dos tarjetas dadas vuelta —**Narrativa** y **Contexto**— que se giran con un clic: qué le contamos al usuario y la data que lo respalda, con su fuente. Vista de mapa para presentar — ver `credito/README.md`)
- `/alta-tarjetas/` → **Alta de tarjetas · spec** (documento, sin prototipo: virtual NFC gratis como centro + física paga con fricción honesta; árbol de entrada, flujos por camino, matriz de casos, copy, variantes de checkout — ver `alta-tarjetas/README.md`)

## Deploy (Vercel)

El sitio es estático y no tiene build. Dos formas, según qué quieras publicar:

- **Todo junto, sin tocar settings.** Importás el repo con la configuración por defecto: el `vercel.json` de la raíz
  reescribe `/` → `/repo/`, así `/credito/`, `/cards/`, `/cajas/` y el resto quedan en la URL corta.
- **Un prototipo solo.** Importás el repo y ponés **Root Directory = `repo/credito`** (o `repo/cajas`, etc.),
  Framework *Other*, sin build command. Cada carpeta es autocontenida. Con Root Directory apuntando a una subcarpeta,
  el `vercel.json` de la raíz no se usa: no hay conflicto entre las dos formas.

Ojo con una dependencia: las pantallas compilan JSX en el navegador con **React y Babel desde unpkg**. Anda igual en
Vercel, pero la primera carga baja ~1 MB de CDN y, si unpkg está caído, el prototipo no levanta.

## Estructura

```
index.html        → punto de entrada de tarjetas (abrilo directo en el navegador)
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
cajas/            → 100% autocontenida (deployable sola, Root Directory: repo/cajas)
  index.html      → punto de entrada de cajas
  app.jsx         → estado + router (arranca siempre en la FTE)
  cajas-screens.jsx → Inicio, Portfolio, wallet Pesos, sección Cajas, crear, detalle
  cajas-ui.jsx    → splash FTE, keypad de monto, fila de caja, arte SVG, plantillas
  lemon-ui.jsx / ios-frame.jsx / screens-shared.jsx / fonts/ → copia del DS de cards/
onboarding/       → 100% autocontenida (deployable sola, Root Directory: repo/onboarding)
  index.html      → punto de entrada del onboarding sin tarjetas
  app.jsx         → stage + modal iOS (home ↔ onboarding) + wiring a los flujos de cards/
  onboarding.jsx  → pager de 3 pantallas (peek + dots + nudge), home vacía, sheet de costos
  lemon-ui.jsx / card-experience.jsx / flows.jsx / assets/ / fonts/ → copia del DS de cards/
pagos-automaticos/ → 100% autocontenida (deployable sola, Root Directory: repo/pagos-automaticos)
  index.html      → punto de entrada de la mini app
  da-rules.js     → reglas puras (normalización de marca, visibilidad, orden) — sin React
  da-rules.test.js / tests.html → tests de esas reglas (navegador o node)
  da-data.jsx     → 6 perfiles de fixtures + getDebitosAutomaticos() (la interfaz reemplazable)
  da-ui.jsx / da-screens.jsx → primitivas + lista (4 variantes), detalle y cierre
  app-shell.jsx   → los dos puntos de entrada: banner de Tarjetas y el mail
  app.jsx         → router + panel dev (variante/perfil/modo/entrada) + escenario por URL
  lemon-ui.jsx / ios-frame.jsx / colors_and_type.css / fonts/ → copia del DS de cards/
credito/           → 100% autocontenida (deployable sola, Root Directory: repo/credito)
  index.html       → punto de entrada de la nueva tarjeta de crédito
  credito-model.js → reglas puras (ratios por activo, respaldo ↔ límite, grupos de cierre, autopay, formateo) — sin React
  credito-model.test.js / tests.html → tests de esas reglas (navegador o jsc)
  credito-ui.jsx   → primitivas propias (AssetIcon, BigAmount, OptionCard, Gauge, Notice, DateTimeline, SegTabs)
  narrativa.md     → narrativa de producto (promesa, posicionamiento, tono, momentos, preguntas abiertas)
  credito-copy.js  → todos los textos de pantalla (única fuente de verdad del copy)
  credito-limite.jsx → «Elegí el límite de tu tarjeta» (tres montos de mayor a menor, la seleccionada en negro con su frase de poder) y su modo edición
  credito-screens.jsx → respaldo, tu tarjeta, bienvenida, cierre (acordeón), débito automático (+ helper), Apple Pay, ya podés pagar, landing, Límite y respaldo, resumen, pagar, consumos
  app.jsx          → estado + router + presets (vista de mapa) + panel dev + escenario por URL
  supuestos.md · capturas-actual/ · lemon-ui.jsx / screens-shared.jsx / ios-frame.jsx / colors_and_type.css / fonts/ → copia del DS de cards/
alta-tarjetas/     → spec en markdown (sin código): reutiliza por referencia las pantallas de cards/, onboarding/ y migracion-ab/
  README.md        → lineamientos del repo + árbol de entrada (estado del usuario → camino)
  flujos.md        → pantalla a pantalla por camino (C1…C8) · matriz.md → casos × estados
  copy.md          → todos los textos · checkout.md → variantes de checkout y pago + recomendación
  reutilizacion.md → tal cual / adaptado / nuevo · supuestos.md → preguntas abiertas para producto
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
