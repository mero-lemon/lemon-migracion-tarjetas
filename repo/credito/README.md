# Lemon Credit Card · nueva experiencia · prototipo Lemon

Prototipo navegable (alta fidelidad) de la **Lemon Credit Card**, la nueva tarjeta de crédito respaldada de Lemon.
El usuario **elige uno de tres límites** ($5.000.000 · $1.000.000 · $500.000, activados o no según su saldo),
**elige con qué respaldarlo** (dólar digital o Bitcoin: el límite es el 80% del respaldo) y **crea la tarjeta ahí
mismo**: cae en la home de crédito, que le ofrece dos cosas separadas —**empezar a usarla ya** (cierre → débito →
Apple Pay) y **seguir el envío del plástico**—. La landing **Lemon Card · Crédito** separa **límite · disponible ·
saldo**, y el respaldo vive en su propia pantalla **Límite y respaldo**, como en la app de hoy.

**Toda la experiencia está ordenada por una narrativa de producto** —tu mejor amiga y tu superpoder, bajo la bandera
del control: *Ahora vos controlás todo*— que vive en [`narrativa.md`](narrativa.md). **Todos los textos de pantalla
salen de [`credito-copy.js`](credito-copy.js)**: para cambiar una frase se toca ese archivo, no las pantallas.

> **Este es el prototipo para pitchear, no el final.** Al lado del teléfono, cada pantalla trae **dos tarjetas dadas
> vuelta que se giran al hacer clic**. **Narrativa**: qué le queremos contar al usuario en esa pantalla —la idea en
> una frase y lo que se le suma—. **Contexto**: la evidencia, con el número a la izquierda, el hecho al lado y su
> fuente debajo. Sirven para contar primero y respaldar después, sin leer de un papel.
>
> **Las notas no dicen cómo resolverlo.** La experiencia tiene que explicarse sola, y el «cómo» es justo lo que el
> equipo de diseño tiene que poder proponer cuando se le presenta la narrativa. Cómo está resuelto hoy se lee acá y
> en [`narrativa.md`](narrativa.md) §7: eso es documentación de implementación, no material de pitch.
>
> Cada dato vive en **una sola pantalla**, la que justifica: límite variable → el límite · respaldo en dólar digital →
> el respaldo · débito automático y dólares con dólares → «cuánto se paga solo» y el resumen · cuatro grupos → el
> cierre · NFC → Apple Pay. El caso general (*194.000 golpearon la puerta y entraron 684*) abre en la primera
> pantalla. El contenido vive en [`credito-notas.js`](credito-notas.js), con sus reglas de edición escritas arriba del
> archivo; `?ux=0` las esconde.
>
> **Versión 21/09 (tarde): las ocho definiciones de Jero están aplicadas** (narrativa.md §10). En una línea: la
> bandera pasa a ser el control; los montos de dólar digital se escriben **US$ 862**; el límite **fluctúa** con el
> valor del respaldo; los avisos se prometen **varias veces**; descongelar pasa **cuando impacta el pago**; cierre y
> límite se cambian **infinitas veces**; y mientras se elige el grupo de cierre, cierre y vencimiento van los dos con
> **≈**. Además, «Elegí el límite» estrena un **escenario oscuro** con el monto grande.
>
> **El flujo es el que corrigió Jero:** la tarjeta **se crea al terminar «Elegí tu respaldo»** y lleva **directo a la
> home**; el cierre y el débito automático se piden **recién cuando toca activarla**.

Construido con el **Lemon Mobile Design System** real (tokens de `@lemonatio/ds-lemoncash-app`), sin paso de
build: HTML + React/Babel desde CDN + JSX locales. Mismo patrón que `/cards/`, `/cajas/`, `/onboarding/` y
`/pagos-automaticos/`. Destinatario: **Chelo**. Es una propuesta de producto sobre la ventana que abre la
migración GP → Pomelo, no un MVP.

> **Principio de esta versión: lo mínimo que hace falta para decidir, y nada más.** Tres pantallas para tener la
> tarjeta y tres más, cuando el usuario quiera, para activarla. Cada pantalla hace una sola pregunta y la responde
> con lo justo: el límite son tres montos y un escenario que muestra el elegido con su frase de poder; el respaldo,
> dos activos con una sola línea (*«Dejás US$ 862,07»*) y un helper tocable que explica cómo te cuida; lo que no
> alcanza se apaga con un candado, el motivo y la salida (*Comprar*).
>
> **Y respeta los lineamientos de la app de hoy** (capturas en `capturas-actual/`): hero con el render real de la
> tarjeta + título centrado, filas label/valor, secciones planas con flecha (*Consumos del período → Límite
> disponible → Resumen → Actividad*), card row con miniatura vertical, medidor semicircular en *Límite y respaldo*.
> Traducidos al DS nuevo (tema claro, Geist + Inter); los únicos bloques oscuros son el promo de la home sin tarjeta
> y el escenario de «Elegí el límite».

---

## Cómo correrlo

```bash
# desde la raíz del repo (no abrir con file://: el navegador bloquea los .jsx)
python3 -m http.server 8000
# → http://localhost:8000/credito/
```

> Si editás un `.jsx` y no ves el cambio, es la caché del navegador (Babel carga los `.jsx` por XHR y el
> `http.server` no manda `Cache-Control`): recargá forzado (⌘⇧R) o abrí DevTools con "Disable cache".

En **desktop** se ve dentro de un marco de iPhone con el control strip arriba (selector de pantalla, **Mapa**,
**Panel dev**, Reiniciar). En un **celular real** (viewport < 560 px) se ve a pantalla completa.

**"Hoy" está fijado al jueves 18/09/2026** y las cotizaciones y saldos son mock: la demo es idéntica en cada run.

## Cómo moverse para presentar

La barra de arriba tiene **solo lo que se usa al presentar**: el nombre de la pantalla, *Mapa* y *Reiniciar*. El
selector de pantallas, el panel dev y el botón de las notas salieron para que no haya nada que distraiga.

- **Mapa** (botón arriba, o `?mapa=1`): todas las pantallas renderizadas en vivo, en grilla, agrupadas por flujo.
  Un clic salta a cualquiera con su estado ya armado, sin recorrer el flujo. Es la navegación del prototipo.
- **Las dos tarjetas** de la derecha —*Narrativa* y *Contexto*— están siempre; se giran con un clic. `?ux=0` las
  esconde para mostrar la app sola.
- **Reiniciar**: vuelve la pantalla actual a su estado inicial.
- El **panel dev** (saldos, cotizaciones, ratios, estado de la tarjeta) sigue en el código —`DevPanel` en
  [`app.jsx`](app.jsx)— pero no se monta. Para volver a tenerlo alcanza con renderizarlo.
- **Por URL**, para abrir directo en una pantalla:

| Parámetro | Valores | Qué hace |
|---|---|---|
| `p` | `home-vacia` `limit` `respaldo-pick` `cierre` `autopay-cuanto` `summary` `confirm` `wallet` `activated` `home-nueva` `home-activa` `home-pausada` `home-congelada` `limite` `statement` `pay` `edit-limit` `edit-limit-low` | Arranca en esa pantalla con su estado |
| `mapa` | `1` | Abre en la vista de mapa |
| `notas` | `0` | Oculta las notas «A confirmar» (para la presentación limpia) |
| `ux` | `0` | Oculta las notas de UX de al lado del teléfono |
| `presel` | `0` | En «Elegí el límite de tu tarjeta» no preselecciona ningún monto (para testear comprensión) |

---

## La narrativa ordena la experiencia

[`narrativa.md`](narrativa.md) define la promesa (**Ahora vos controlás todo**), el posicionamiento (**tu mejor
amiga y tu superpoder**), el tono de voz, el vocabulario, la narrativa momento a momento y las ocho definiciones
cerradas con Jero. Cada pantalla es un momento de esa narrativa y su copy vive en
[`credito-copy.js`](credito-copy.js):

| Momento | Pantalla | Lo que tiene que sentir |
|---|---|---|
| Descubrir | Promo en Lemon Card · Crédito | *Ahora vos controlás todo.* Quién manda, dicho antes que el mecanismo |
| Elegir el poder | Elegí el límite de tu tarjeta | El poder al que accede: el monto elegido, enorme, sobre negro, con su frase |
| Elegir la garantía | Elegí tu respaldo | El seguro que la cuida y la habilita: solo cuánto deja, y un helper con los cuatro hechos |
| Ajustar el ritmo | Elegí cuándo cierra tu resumen | Elegir sin exactitud falsa: las dos fechas con ≈ hasta que la tarjeta exista |
| Delegar sin miedo | Elegí cuánto se paga solo | Mínimo o total, y la salida sin culpa: *Prefiero pagarlo yo cada mes* |
| Confirmar | Tu Lemon Credit Card | Todo lo que eligió, junto, antes de que exista: límite · respaldo · cierre · débito |
| Ya es suya | Tarjeta creada · Ya es tuya | Bienvenida a este mundo: la tarjeta flotando y *Sumar a Apple Pay* |
| Sumarla al celu | Pagá con el celu desde hoy | El primer pago está a un toque, y se puede posponer |
| Ya podés pagar | Ya podés pagar con el celu | El cierre del arco: activa, en la billetera, con las fechas ya fijas |
| Vivir con ella | Lemon Card · Crédito | Consumos · límite disponible · resumen · actividad, como la app de hoy |

## La decisión de diseño: sobrio y mínimo

La primera versión (18/09) resolvía «Elegí tu límite» con una oración por opción, dos barras a escala y el activo
cambiable en la misma pantalla. Jero la vio **muy cargada** y pidió ir por el espíritu contrario. Esta versión:

1. **Sin onboarding.** *Quiero mi Credit Card* abre directo «Elegí el límite de tu tarjeta». La home sin tarjeta es
   un solo bloque: el render real de la tarjeta negra sobre negro, la bandera (*«Ahora vos controlás todo.»*, elegida
   por Jero el 21/09) y una línea con el nombre y la mecánica (*«Lemon Credit Card: el límite lo ponés vos y tus
   ahorros te respaldan, sin venderlos.»*). Lo aspiracional lo dicen la imagen y el título; no se inventan beneficios.
2. **Tres montos, nada más, de mayor a menor, con un escenario arriba.** $5.000.000 · $1.000.000 · $500.000, sin
   header: la pregunta es el título. Una opción está activa si el saldo alcanza para respaldarla con dólar digital
   **o** con Bitcoin. El monto elegido vive en un **bloque negro con la tarjeta asomando** —*TU LÍMITE*, el número
   enorme en blanco y **la frase de poder** (*«El celu nuevo, la compu, la escapada.»*)— y la lista de abajo solo
   elige: la sobriedad que pidió Jero el 19/09, pero con el volumen que faltaba («medio apagada», 21/09). La que no
   alcanza se apaga: candado, *«Te falta saldo para respaldarlo · Cargar saldo»*, y al tocarla abre la sheet de
   compra con el faltante exacto. Al pie, un helper: *«¿Puedo cambiarlo después?»* → sí, las veces que quieras.
   Preselecciona el más alto que alcanza. No hay monto personalizado.
3. **El respaldo se elige después, y solo entre dólar digital y Bitcoin.** Los pesos quedan para pagar el resumen.
   Cada activo muestra **solo cuánto dejás** (*«Dejás US$ 862,07»*); el que no alcanza, *«Te faltan X · Comprar»*.
   Debajo, un helper tocable (*«¿Cómo funciona el respaldo?»*) abre *Así te cuida tu respaldo* con cuatro hechos en
   orden de miedo: sigue siendo tuyo · el límite es el 80% de lo que dejás (con el número) · **tu límite sigue el
   valor de tu respaldo en pesos, y con Bitcoin se mueve mucho más** · solo se usa si no pagás, avisándote varias
   veces antes. Mismo estado seleccionado negro que el límite.
4. **Tu Lemon Credit Card cierra el alta con una sola cosa nueva.** Ni límite ni respaldo: los acaba de elegir, y
   volver a listarlos convierte el momento en una factura. Lo único que se suma es el costo, dicho completo:
   *«Se empieza a cobrar recién cuando actives la tarjeta, y los primeros 3 meses van bonificados»*, con el precio
   tachado y el tag *3 meses gratis*. CTA **Crear mi Credit Card** → y de ahí, **directo a la home**.
5. **La home recién creada tiene dos contenedores, y no se mezclan.** Arriba, *Empezá a usar tu tarjeta*: **«Ya es
   tuya. Activala y pagá con el celu»**, con el botón que abre la activación. Abajo, *Tu tarjeta física*: **En
   camino**, con el rango de fechas (*«Llega entre el 23 y el 25 de septiembre»*), los cuatro pasos del envío
   (Pedida · En preparación · Despachada · Entregada) y la línea que saca la ansiedad: *«No hace falta esperarla: con
   el celu ya pagás»*. Separarlos evita la lectura de «tengo que esperar cinco días», que es lo contrario de lo que
   pasa. La pill de la tarjeta dice **Sin activar**, no «En camino»: el envío ya tiene su caja.
6. **El cierre es un acordeón, y todavía sin fechas exactas.** *Elegí cuándo cierra tu resumen*: cada opción dice
   *«Cierra alrededor del 15 · Vence alrededor del 25»*; al desplegar, la línea de tiempo muestra **las dos fechas
   con ≈** (*≈ 15 oct · ≈ 26 oct*). El pie dice lo único que importa ahí: **quedan fijas cuando activás la tarjeta**.
   Solo cierre y vencimiento: el «se congela» no va acá.
7. **El débito automático es una sola pregunta con tres respuestas.** *Elegí cuánto se paga solo*: **solo el
   mínimo** · **el total, en pesos y dólares** (los dólares con tu dólar digital: te ahorrás el 30%) · **el total, en
   pesos**. Arriba del CTA, siempre la salida sin culpa: **«Prefiero pagarlo yo cada mes»**. **No hay pantalla «¿De
   dónde se paga?»**: un helper (*«¿De dónde sale la plata?»*) explica qué moneda paga qué, que si en una no alcanza
   se completa con la otra y que nunca se toca otra moneda. Cierra en *Pagá con el celu desde hoy* (Apple Wallet) y
   **Ya podés pagar con el celu**, con límite, cierre —ya con **fecha fija**— y cómo se paga.
8. **La home es «Lemon Card», solapas «Prepaga» y «Crédito», y sigue la landing de hoy.** Card row (*Credit Card*,
   miniatura vertical · últimos 4 · estado · pausar · flecha) → aviso según estado → secciones planas *Consumos del
   período* (con cierre y vencimiento, ya fijos) → *Límite disponible* (verde, con *Límite total* debajo) → *Resumen*
   (tarjeta violeta con *Pagar*) → *Actividad*. Mientras no esté en el celu aparece la tarjeta blanca *Pagá con el
   celu desde hoy*; mientras el plástico viaja, sigue el seguimiento. Tocar la card row o *Límite disponible* abre
   **Límite y respaldo**: el medidor semicircular, usado · sin pagar · límite total, *Editar límite*, y abajo *Tu
   respaldo* (*«Dejaste US$ 862,07 · ≈ $1.250.000 hoy · sigue siendo tuyo»*) con *Retirar* / *Saber más* (los mismos
   cuatro hechos del alta). El respaldo no vuelve a la home.
9. **La misma pantalla de límite edita después** (Flujo 4): el escenario muestra el límite nuevo y qué implica
   (*«Dejás US$ 345 más»* / *«Vuelven US$ 345 a tu saldo»*), la actual queda marcada, y bajar por debajo de lo
   comprometido se bloquea con el porqué.
10. **Cada pantalla se explica sola, al lado, y cada una es una mejora del caso.** Dos tarjetas dadas vuelta:
   **Narrativa** (lo que el usuario se tiene que llevar) y **Contexto** (la data, con su fuente). Se giran de a una
   con un clic: se cuenta la pantalla, se gira la narrativa y recién después se respalda con los números. Ninguna
   dice cómo resolverlo —eso se conversa con diseño—. El reparto sigue las seis mejoras: 1 · límite variable
   (límite) · 2 · respaldo en dólar digital (respaldo) · 3 · dólares con dólares, sin el 30% (débito y resumen) ·
   4 · débito automático (débito) · 5 · cuatro grupos de cierre (cierre) · 6 · NFC (Apple Pay). La primera pantalla
   abre con el caso completo: la puerta (193.946 / 108.558 / 684) y el diagnóstico (75% / 41%).

## Los tres números, en la landing

| Número | Qué es | Cómo se ve |
|---|---|---|
| **Disponible** | Límite − **todo lo comprometido**: lo usado este período + el resumen cerrado que todavía no pagaste (el límite no se libera hasta que pagás) | Sección plana *Límite disponible →* con el número grande **verde**. Tocarla abre **Límite y respaldo** (medidor semicircular + usado · sin pagar · límite total). Con la tarjeta congelada o en retiro, la etiqueta cambia (*"Disponible cuando la descongeles"*) y el número se apaga |
| **Límite** | El techo. Nunca cambia por una pausa ni por un congelamiento | Línea *Límite total $X* debajo del disponible; en **Límite y respaldo**, fila *Límite total* + botón *Editar límite* |
| **Saldo** | Lo que hay que **pagar** del resumen ya cerrado (+ deuda anterior) | Tarjeta **violeta** tipo comprobante, con vencimiento y botón **Pagar**. Pagarlo libera límite: la barra y el disponible se mueven al instante |

Además: **consumos del período** con las fechas de cierre/vencimiento **del grupo elegido**, actividad reciente, y
**avisos in-app** (vence en X días · congelada · liquidación con fecha concreta) que hoy salen solo por push.

---

## Reglas implementadas

Viven en [`credito-model.js`](credito-model.js), **sin React y sin fixtures**, con tests aparte.

**Respaldo ↔ límite.** `respaldo = límite × 1,25`: **el respaldo es mayor que el límite y el límite es aprox. el
80% del respaldo** (regla de Jero, 21/09; igual para dólar digital y Bitcoin, a confirmar si Bitcoin pide más
colchón). El ratio es un parámetro editable en el panel dev, de 20% a 160%. Conversión a unidades: USDC 2 decimales
· BTC 8 decimales guardados, 4 significativos mostrados. Los pesos existen en el modelo solo como origen del pago
(`RESPALDO_ASSETS = ['USDC', 'BTC']`). En UI la relación se dice al revés, desde el usuario: *«tu límite es el 80%
de tu respaldo»*, nunca «125%» ni «ratio».

> Historia del número: el brief decía *"respaldo = 65% del límite"* y los insumos describían LTV 65% (respaldo ≈
> 154%). Jero cerró el 21/09 con **límite = 80% del respaldo**. Ver `supuestos.md` S1.

**Saldos mock** (editables): Pesos $720.000 · 900 USDC (≈ $1.450/USDC) · 0,0045 BTC (≈ $150.000.000/BTC).
Con eso **$500.000 alcanza con los dos activos, $1.000.000 solo con dólar digital y $5.000.000 con ninguno**: los
tres estados de una opción se ven sin tocar nada. Máximo pedible: dólar digital $1.000.000 · Bitcoin $500.000.

**Cuatro grupos de cierre**, uno por semana. Vencimiento = cierre + 10 días (como muestra hoy la app: cierre 31/05 →
vto 10/06); si cae sábado, domingo o feriado pasa al siguiente día hábil (regla del core de Pomelo; feriados AR 2026
con una lista parcial, ver `supuestos.md` S4). Congela = vencimiento + 1. Liquida = vencimiento + 7, con aviso el mismo
día del vencimiento. Fechas calculadas con `Date`, no strings; los movimientos mock también se fechan relativos a "hoy"
y al ciclo, así nunca aparece un consumo del período anterior al cierre.

| Grupo | Cierra | Próximo ciclo desde el 18/09 | Para quién |
|---|---|---|---|
| 1ª semana | día 1 | cierra 1 oct · vence mar 13 oct (el 12 es feriado) · se congela 14 oct | Si cobrás entre el 1 y el 10 |
| 2ª semana | día 8 | cierra 8 oct · vence lun 19 oct · se congela 20 oct | Si cobrás a mitad de mes |
| 3ª semana | día 15 | cierra 15 oct · vence dom→lun 26 oct · se congela 27 oct | Si cobrás después del 20 |
| 4ª semana | día 22 | cierra 22 sep · vence vie 2 oct · se congela 3 oct | Si cobrás a fin de mes o el 1º |

**Débito automático del resumen**, lo elige el usuario **antes de crear la tarjeta**, entre tres: **solo el mínimo**
(default: la red que evita la liquidación sin decidir por él cuánta plata se le saca) · **el total, en pesos y
dólares** (pesos con pesos, dólares con dólar digital → sin la percepción del 30%) · **el total, en pesos**. Si en una
moneda no alcanza se completa con la otra; nunca otra moneda. Va en un helper tocable (*«¿De dónde sale la plata?»*),
no en una pantalla. Cuándo: el día del vencimiento. **Se puede no activar** (*«Prefiero pagarlo yo cada mes»*; queda
*«Desactivado · pagás a mano cada mes»*). **Si no alcanza el saldo:** se
debita lo que haya, aviso in-app + push, y a las 48 h se toma del respaldo antes de congelar (TyC 7.4).

**Estados.** *Activa* (desde el momento en que se crea: el plástico en viaje no la frena) · *Pausada* (la maneja el
usuario; **límite, disponible y respaldo se siguen mostrando**) · *Congelada* (no pagó el mínimo; se rechazan compras
y débitos de comercios; el límite sigue visible y el disponible dice *"cuando la descongeles"*; **puede pagar y puede
pedir el retiro del respaldo desde ese estado**; pagar el mínimo la reactiva **cuando impacta el pago**) · *Retiro en curso*. La liquidación se muestra a vencimiento + 7 sin más condición (hoy la regla de
06/2026 exige además cobertura < 120% y no estar exento: ver `supuestos.md` S18).

### Tests

```bash
# navegador
http://localhost:8000/credito/tests.html
# o con JavaScriptCore de macOS (no hay node en la máquina)
/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc credito-model.js credito-model.test.js
```

48 casos: respaldo por activo y por ratio override (límite = 80% del respaldo), conversión a unidades, `check` con
los saldos mock (qué alcanza y cuánto falta), qué activo alcanza para cada preset (`affordableAsset` /
`closestAsset`), máximo pedible, editar límite (delta), débito automático (tres modalidades), tres números
(disponible descuenta el resumen impago), fechas de los cuatro grupos (incluido el corrimiento por fin de semana y
feriado), formateo (**US$ para dólar digital**, unidad para Bitcoin) y `limiteHoy` (el límite que corresponde hoy al
respaldo, para la fluctuación).

---

## Qué está mockeado (y qué no)

**Mockeado:** saldos, cotizaciones, el ratio por activo, los consumos del período y el resumen (una sola foto:
cerró en septiembre, vence en unos días), la deuda del período anterior en el caso congelada, la compra ("Comprar
0,0008333 BTC" suma el faltante al saldo mock, dicho en pantalla), el pago (mueve saldo y estado), la dirección de
envío (no se pide: la propuesta es activar primero en el celu), Face ID / OTP.

**Real / decidido:** tokens, tipografías e iconografía del DS; las reglas de cálculo; las fechas de los grupos;
todos los copys; el orden de los flujos.

**La capa de reglas es reemplazable:** las pantallas solo conocen `window.CreditoModel` (`check`, `respaldoUnits`,
`affordableAsset`, `limitChange`, `cycleDates`, `tresNumeros`, formateo). Para el build real se reemplazan esas
funciones por el backend, sin tocar pantallas.

## Las pantallas

**Flujo 1 · Alta** (3 pantallas + la home) — 1 *Elegí el límite de tu tarjeta*: tres montos de mayor a menor,
activados según el saldo, el elegido en el escenario negro con su frase de poder, el que no alcanza abre *Comprar* ·
2 *Elegí tu respaldo*: dólar digital o Bitcoin, *«Dejás US$ 862,07»*, helper *¿Cómo funciona el respaldo?* ·
3 *Tu Lemon Credit Card*: la tarjeta y el mantenimiento explicado (se cobra al activar; 3 meses bonificados) ·
**Crear mi Credit Card** → la **home**, con los dos contenedores: *empezá a usar tu tarjeta* y *tu tarjeta física ·
en camino* (cuatro pasos + rango de fechas). *Ya es tuya* queda en el mapa como pantalla suelta, por si se quiere
recuperar ese momento.

**Flujo 2 · Activación** (3 pantallas, header *Activar tarjeta*) — 1 *Elegí cuándo cierra tu resumen*: acordeón de
cuatro cierres con **las dos fechas en ≈** · 2 *Elegí cuánto se paga solo*: mínimo o total + **«Prefiero pagarlo yo
cada mes»** + helper *¿De dónde sale la plata?* · 3 *Pagá con el celu desde hoy* → *Ya podés pagar con el celu*, con
las fechas ya fijas.

**Flujo 3 · Landing** — Lemon Card · solapa Crédito, con la estructura de la app de hoy: card row (*Credit Card*),
aviso in-app según estado, la invitación a sumarla al celu si falta, el seguimiento del plástico si corresponde,
*Consumos del período* (con cierre y vencimiento del grupo), *Límite disponible* (+ límite total), *Resumen*
(violeta, con *Pagar*), *Actividad*. Sub-pantallas:
**Límite y respaldo** (medidor de disponible, usado · sin pagar · límite total, *Editar límite*, respaldo con
*Retirar* —también congelada, con el cálculo de cuánto vuelve— y *Saber más*), *Resumen* (detalle con **deuda del
período anterior**, mínimo, pagar total / mínimo / otro monto), *Consumos del período*.

**Flujo 4 · Editar el límite** — la misma pantalla de límite en modo edición: subir pide más, bajar libera, y bajar
por debajo de lo comprometido se explica.

**Estados de la landing:** sin tarjeta · recién creada (sin activar, con los dos contenedores) · activa sin celu ·
activa con resumen a pagar · pausada (límite visible) · congelada (aviso con fecha de liquidación, pagar el mínimo y cancelar con el
respaldo) · retiro en curso.

## Decisiones que tomé y no estaban en el brief

- **Sin onboarding ni «Saber más» antes de elegir.** La promo de la home es la única presentación; lo que hay que
  saber se aprende eligiendo. Si hace falta un explainer, va en la pantalla de respaldo, no antes.
- **«World class» sin decirlo.** El promo usa el render real de la tarjeta y la bandera del control; no se
  inventan beneficios (cashback, millas, seguros, lounge) ni se dice «tenemos NFC»: el único mensaje sobre pagar
  con el celu es *«sumala a Apple Pay»* (regla del proto de cards; Google Pay no se nombra, pedido de Jero 21/09).
- **La bandera es el control** (Jero, 21/09): *Ahora vos controlás todo.* Todo el copy acompaña esa línea —el límite
  lo ponés vos, lo cambiás cuando quieras, elegís las fechas— y la tarjeta se posiciona como la herramienta del día a
  día. «Sin vender nada, sin pedir permiso» sigue vivo, pero como hecho de apoyo en el sub, no como bandera.
- **Un solo formato de monto en todo el producto:** «$» prefijo y «US$», aunque la app de hoy escriba «1.000.000
  ARS». Los lineamientos que se toman son de estructura y jerarquía, no de notación ni de paleta.
- **El pedido pregunta límite antes que respaldo.** El usuario piensa en cuánto quiere gastar; el respaldo es la
  consecuencia. Pedirlo al revés (activo → límite) obliga a explicar la relación antes de que exista.
- **Los pesos no respaldan.** Solo dólar digital y Bitcoin (pedido de Jero, 19/09). Los pesos quedan como origen del
  pago del resumen.
- **El respaldo es mayor que el límite: el límite es el 80% del respaldo** (Jero, 21/09). En UI se dice siempre desde
  el usuario (*«tu límite es el 80% de lo que dejás»*), nunca como ratio ni porcentaje del límite.
- **El origen del débito automático no se elige.** Pesos con pesos, dólares con dólar digital, y si falta en una se
  completa con la otra (Jero, 21/09). La regla vive en un helper, no en una pantalla.
- **No hay flujo de activación: la tarjeta nace lista** (Jero, 21/09). Como se puede tokenizar en Apple Pay apenas
  existe, y para eso hay que tener cierre y débito configurados, esos dos pasos se mudaron **antes** de crearla. Lo
  único que queda después es *Sumar a Apple Pay*, y es opcional. Es lo que convierte «pedí una tarjeta» en «ya estoy
  pagando».
- **El ≈ solo vive antes de que la tarjeta exista.** Mientras elige el grupo de cierre, las dos fechas son
  aproximadas; cuando la tarjeta se crea quedan fijas y se escriben sin signo en toda la app (Jero, 21/09).
- **Los montos de dólar digital se escriben US$**, no «USDC» (Jero, 21/09): la voz dice «dólar digital» en todas
  partes y el ticker la contradecía. Bitcoin conserva su unidad.
- **Sin monto personalizado.** Tres montos cierran el 99% de los casos y evitan el teclado y la validación.
- **Preselección del límite más alto que alcanza.** La pantalla tira para arriba, no para lo más barato.
  `?presel=0` la apaga para testear comprensión.
- **Comprar es la salida cuando no alcanza**, no un gris mudo. Los 193.946 que se fueron por "no tenés respaldo"
  son la conversión que importa.
- **Usar el celu antes de que llegue el plástico.** La bienvenida ofrece Apple Pay y la home lo vuelve a ofrecer
  mientras la tarjeta no esté en la billetera, sin bloquear nada.
- **El grupo de cierre lo elige el usuario y lo cambia cuando quiera** (el caso de management lo describe como
  asignado por fecha de alta). El hint *"si cobrás…"* es el criterio real.
- **El débito automático se puede rechazar con una frase, no con un toggle.** «Prefiero pagarlo yo cada mes» arriba
  del CTA: la salida existe, es amable, y no compite con la acción principal.
- **Pagar el mínimo descongela cuando impacta el pago** (Jero, 21/09), con demora posible: por eso el copy no promete
  el instante. Es una regla que implementa Lemon (Pomelo distingue bloqueo blando y duro, pero desbloquear sigue
  siendo potestad del emisor).
- **Vencimiento = cierre + 10 días**, como muestra la app hoy, no el +6 de la doc de Ops.
- **El disponible descuenta el resumen sin pagar.** Es la definición de los insumos ("el límite no se libera hasta que el
  usuario paga"): en la demo principal el disponible es $147.700, no $660.000, y pagar el resumen lo libera a la vista.
- **Con débito automático activado, el aviso de vencimiento solo aparece si el saldo de origen no cubre lo que se va a
  debitar.** Si cubre, no hay nada que avisar.
- **El tab Pre-paga responde** con una sheet que dice dónde vive la pre-paga (en `/cards/`), en vez de quedar mudo.
- **El retiro del respaldo con deuda cancela la deuda con el respaldo y devuelve el resto**, en la app y con
  el cálculo a la vista. Hoy es manual y no está disponible congelada.
- **Rótulos de los tres números** con color propio (verde disponible · negro límite · violeta saldo) para que no se
  confundan tampoco fuera de la landing.

## Lo que dejé afuera a propósito

Dirección de envío y tracking del plástico (existe en `/cards/`) · Face ID / PIN / OTP · tolerancia del ~10% sobre el
límite (hoy existe, acá no se modela: S17) · cuotas y adelantos de
efectivo (Pomelo los trae; no son parte de esta propuesta) · tasas de interés (no hay número contractual firme) ·
deuda bimonetaria en detalle (el resumen muestra consumos en USD y su conversión al BNA, nada más) · liquidación
ejecutada y deuda remanente · notificaciones push reales (solo lo que ahora también se ve in-app) · reporte a BCRA.

## Archivos

```
credito/
  index.html            → punto de entrada (orden de scripts: model → DS → ui → limite → screens → app)
  credito-model.js      → reglas puras: activos y ratios, respaldo ↔ límite, grupos de cierre, autopay, formateo
  credito-model.test.js → 48 tests · tests.html los corre en el navegador
  narrativa.md          → la narrativa de producto que ordena la experiencia (promesa, posicionamiento, tono, vocabulario, momentos, las 8 definiciones de Jero y lo que sigue abierto)
  credito-copy.js       → TODOS los textos de pantalla, por momento (única fuente de verdad del copy; tpl() para {variables})
  credito-notas.js      → las notas de UX que se muestran al lado del teléfono (qué le contamos al usuario en cada pantalla, por qué, y el dato que lo respalda)
  credito-ui.jsx        → primitivas propias: AssetIcon, BigAmount, OptionCard, SelCheck, SectionHead, HeroPill, HelperLink, HelperSheet, CreditoHeroPromo, Gauge, Notice, DateTimeline, SegTabs…
  credito-limite.jsx    → «Elegí el límite de tu tarjeta»: el escenario negro (LimitStage) + los tres montos, y su modo edición; sheets Comprar y «¿Puedo cambiarlo después?»
  credito-screens.jsx   → respaldo, cierre (acordeón), débito automático (+ helper), tu tarjeta, bienvenida, Apple Pay, ya podés pagar, landing, Límite y respaldo, resumen, pagar, consumos
  assets/               → credito-hero.png (render de la tarjeta, del proto de onboarding) · nfc-hero.png (celu en el POS, del proto de cards)
  app.jsx               → estado + router + presets (mapa) + panel dev + notas de UX (UxNote) + escenario por URL
  supuestos.md          → supuestos revisables y preguntas abiertas para producto
  capturas-actual/      → las 5 capturas de la experiencia de hoy
  lemon-ui.jsx / screens-shared.jsx / ios-frame.jsx / colors_and_type.css / fonts/ → copia del DS de cards/
```

## Números para acompañar la presentación (fuente: `nuevas-credito/`)

**La puerta.** 193.946 usuarios de Argentina llegaron a *"no tenés respaldo suficiente"* en 12 meses y 108.558
avanzaron hasta comprar crypto. El parque activo es de **684 líneas**, con ~100 altas por mes sin comunicación.

**El límite.** 23% de las tarjetas que se usan tuvo un consumo rechazado por límite en agosto (**$28,9 M** en el
mes); uno de cada cuatro intentos de uso termina rechazado y el límite es el motivo número uno. 40% de quienes
tienen tarjeta en otro banco está disconforme con su límite. 9,9% del soporte de la tarjeta es sobre límites, con 11
pedidos explícitos de aumento en 90 días. 24% se mostró interesado en que el límite se ajuste solo. El rango
sugerido internamente era **$2,5-3 M**: la V1 salió con $1.000.000.

**El respaldo.** Sumar dólar digital lleva el universo elegible de **3.040 a 8.932** (+5.892, casi ×3) sin tocar el
modelo de riesgo. Hoy el colateral vigente es **8,73 BTC**, todo en Bitcoin. 52% preferiría dejar el respaldo en
pesos y solo 14% elegiría BTC; 7 de 12 entrevistados nombran a las stables como su resguardo. 45% considera alto el
mínimo para acceder.

**El uso y el pago.** 69% de las líneas activas consume todos los meses. 37% de las tarjetas registra consumo
internacional. 17% de las cuentas paga el resumen con crypto (**19% del volumen**) y 7,1% del soporte pide pagar los
consumos en dólares con los dólares que ya tiene; en la prepaga, el consumo en USDC **se duplicó** al sacarle el
impuesto del 30%. 3,5% del parque se liquida todos los meses por no llegar al mínimo (162 líneas históricas, el 12%
de todas las que existieron); de las 648 líneas cerradas, **486 fueron retiro voluntario del colateral**.

**El diagnóstico de fondo.** 75% de quienes ahorran en crypto tuvo que vender sus ahorros ante una necesidad —esa es
la propuesta de valor— y 41% de quienes no tienen tarjeta dice que **nunca se la ofrecieron**: el mercado no son los
rechazados, son los no alcanzados.
