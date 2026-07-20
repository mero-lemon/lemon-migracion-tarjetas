# Mis gastos · prototipo Lemon

Prototipo navegable (alta fidelidad, mobile-first) de la sección **Mis gastos**: entender
cuánto gastaste, en qué, y si vas mejor o peor que el mes pasado. Pensada como mini-app
dentro de la app de Lemon.

Construido con el **Lemon Mobile Design System** real (tokens de `@lemonatio/ds-lemoncash-app`),
sin paso de build: HTML + React/Babel desde CDN + JSX locales. Mismo patrón que `/cards/` y `/cajas/`.

## Cómo correrlo

```bash
# desde la raíz del repo (no abrir con file://)
python3 -m http.server 8000
# → http://localhost:8000/gastos/
```

"Hoy" está fijado al **lunes 20/7/2026** y la data se genera con seed fijo:
la demo es idéntica en cada run.

## Estructura de la experiencia

**Home** — entrás con miedo, la pantalla te responde primero "¿estoy bien?" y después "¿cuánto?":
1. **Veredicto** arriba de todo ("Venís gastando menos que de costumbre."), calculado contra
   **tu propio ritmo habitual** (promedio de los últimos 3 meses al mismo día). El ambiente
   acompaña: degradé superior verde calma / ámbar atención / rojo suave según el estado.
2. El **número frío** que respalda el veredicto (cuenta desde cero al entrar) + tu mes típico
   a esta altura.
3. **Diagrama de barras** con los grupos más grandes (top 5 + "Otros"); tap en una barra →
   buscador con esa categoría precargada.
4. Dos datos fríos: vs. mes anterior (mismos N días) y la categoría que más movió la aguja.
5. Acceso al buscador + últimos movimientos. Todo entra coreografiado en orden de lectura.

**Buscador** — sección aparte, con aire, para investigar en detalle:
- **Período**: Día · Semana · Mes · Año + navegación ← → (bloqueada hacia el futuro).
- **Categorías**: multi-select con las 13 categorías del motor.
- **Medio de pago**: tarjeta / QR / débito automático / transferencia.
- **Comercio**: búsqueda por texto.
- **Resultados**: total + ritmo de la selección, top comercios (si hay una sola categoría),
  y movimientos agrupados por día. Tap → detalle en bottom sheet con "¿Está mal la
  categoría?" (dummy en v1, alimenta el motor a futuro).

**Estados**: skeleton de carga, splash de primer uso, sin resultados / período vacío.

## Archivos

```
index.html         → punto de entrada
app.jsx            → estado raíz (rutas home|buscar, filtros persistentes) + stage
gastos-data.jsx    → taxonomía (13 categorías), generador seeded (~6 meses,
                     patrones AR: finde gastronómico, servicios a principio de mes,
                     SUBE recurrente, suscripciones en fecha fija, inflación mensual)
                     y ExpensesRepository — la interfaz que la UI consume
gastos-ui.jsx      → primitivas: formateo es-AR, diagrama de barras, chips de filtro,
                     segmented, comparación, ritmo, filas, estados
gastos-screens.jsx → home "Mis gastos", buscador, sheet de movimiento, splash FTE
lemon-ui.jsx / ios-frame.jsx / colors_and_type.css / fonts/ → copia del DS compartido
```

## La capa de datos es reemplazable

La UI solo conoce `ExpensesRepository`:

```js
ExpensesRepository.getSummary(period)              // total, comparación, desglose, proyección, insight
ExpensesRepository.query(period, { cats, methods, text })  // buscador
ExpensesRepository.getMovements(period, cat?)
ExpensesRepository.getTopMerchants(period, cat)
```

Para el build real se enchufa el backend implementando esa interfaz, sin tocar pantallas.
El mock incluye solo egresos de consumo (sin reversas ni transferencias entre cuentas propias).
