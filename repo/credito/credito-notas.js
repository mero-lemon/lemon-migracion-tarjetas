// Material de presentación: NO es parte de la app. Al lado del teléfono van las
// tarjetas dadas vuelta que se giran al hacer clic.
//
//   NARRATIVA · qué le queremos contar al usuario: la idea en una frase (lead)
//               y un párrafo escrito en la voz con la que se lo diríamos a él
//               (parrafo). Va en TODAS las pantallas: siempre hay algo que
//               queremos que se lleve. NO dice cómo resolverlo en pantalla:
//               esa es la conversación que queremos abrir con diseño.
//   CONTEXTO  · la evidencia que justifica que esa pantalla exista. Cada ítem
//               es {n, t, d, f}: el número, la conclusión que ese número
//               permite afirmar, el dato completo y la fuente.
//
// CUÁNDO VA CONTEXTO Y CUÁNDO NO (criterio, no capricho):
//   · Va donde hay evidencia de verdad: un número medido, con fuente, que
//     justifica la decisión de producto que muestra la pantalla. En general son
//     las pantallas que resuelven una de las seis mejoras del caso.
//   · NO va donde lo único que podemos escribir es una opinión de diseño
//     («si las dos comparten el mismo espacio, el plástico marca el ritmo»).
//     Eso es «cómo lo contamos» con otro nombre, y se sacó a propósito.
//   · Tampoco va donde el dato es cierto pero habla del producto en general y
//     no de la decisión que muestra esa pantalla (Jero, 25/09, sobre la home
//     activa): si el número se puede contar igual de bien en otra pantalla, es
//     de esa otra pantalla.
//   · Por eso hoy son 9 pantallas con las dos tarjetas y 8 con narrativa sola
//     (summary · home-camino · wallet · activated · home-activa · home-pausada
//     · consumos · confirm). Una tarjeta sola no es una pantalla incompleta: es
//     una pantalla donde la evidencia ya la dimos antes.
//
// Reglas de edición, para que esto siga sirviendo para pitchear:
//   · Un dato vive en UNA sola pantalla, la que justifica. No se repite.
//   · El lead es la afirmación en la voz del producto, corta: qué se tiene que
//     llevar el usuario. El párrafo la desarrolla con lo que él hace —verbos
//     suyos, frases cortas, cosas concretas—, no con metáforas.
//   · Nada de «no es X, es Y»: la antítesis suena a ensayo y no aclara nada.
//   · En Contexto, el título dice la conclusión y el dato la sostiene. Un
//     número suelto no afirma nada solo.
//   · Nada de soluciones de UI. Cómo está resuelto hoy se lee en narrativa.md
//     (§7, momento a momento) y en el README; acá va el qué y el porqué.
//   · La voz respeta narrativa.md: sin superlativos declamados («la mejor»),
//     sin «llegó» (la tarjeta no llega: ya está), sin NFC, sin colateral ni
//     liquidar, y el 30% se nombra como «la percepción del 30%».
//
// Fuentes: «194.000 golpearon la puerta. Entraron 684» (tarjeta de crédito:
// migrar con mejoras, 09/2026). Cada dato lleva la suya abajo, y se distingue
// explícitamente de dónde sale, porque no todo mide lo mismo:
//   · «Tarjeta de crédito hoy» → la colateralizada que YA está en producción
//     (684 líneas). Es medición real de uso, no proyección.
//   · «Discovery previo a la V1» → encuestas y entrevistas de antes de lanzar.
//   · «Encuesta COPS» → posterior al lanzamiento; responde gente interesada
//     que no llegó a pedir la tarjeta, así que mide fricción de conversión.
//   · «Base de usuarios» → todos los usuarios de Lemon, no tarjetahabientes.
//   · «Tarjeta prepaga AR» → otro producto; sirve como precedente, no como
//     comportamiento de esta tarjeta.
// `paso` y `titulo` no se muestran: identifican la entrada al editar el archivo.
(function (root) {
  const HOY = 'Tarjeta de crédito hoy'; // la colateralizada que ya está en producción
  const CreditoNotas = {
    // ── Las dos tarjetas ────────────────────────────────────────────
    'home-vacia': {
      paso: 'Descubrir', titulo: 'La tarjeta, antes de pedirla',
      lead: 'Ahora vos controlás todo.',
      parrafo: 'Es la herramienta para manejar tu día a día: el súper, la nafta, el viaje, el celu nuevo. Definís el límite que te sirve, sin que nadie te evalúe. Gastás sin vender lo que ahorraste: tu dólar digital y tu Bitcoin se quedan donde están. Pagás cuando te queda cómodo, o dejás que se pague solo. Ves en qué se te va, y lo que gastaste en dólares lo pagás con dólares, sin la percepción del 30%.',
      contexto: [
        { n: '193.946', t: 'Existe un interés, y no hicimos ninguna campaña.',
          d: '193.946 usuarios llegaron a «no tenés respaldo suficiente» en 12 meses, y 108.558 avanzaron hasta comprar crypto para poder entrar.', f: HOY + ' · flujo de alta, 12 meses' },
        { n: '~100', t: 'El experimento validó la demanda: entran solos, todos los meses.',
          d: '~100 altas por mes, estables, sin inversión asociada. Todo el parque son 684 líneas activas.', f: HOY + ' · altas mensuales, 2026' },
        { n: '75%', t: 'Hoy, ahorrar en crypto termina en venderla.',
          d: '75% de quienes ahorran en crypto tuvo que vender sus ahorros ante una necesidad. Esa es la propuesta de valor.', f: 'Discovery previo a la V1 · +1.500 respuestas' },
        { n: '41%', t: 'Hay una porción de la sociedad a la que nunca le ofrecieron una tarjeta de crédito.',
          d: 'Lo dice el 41% de quienes no tienen ninguna: no son rechazados, son no alcanzados.', f: 'Discovery previo a la V1' },
        { n: '69%', t: 'Y el que entra, usa: el consumo crece solo.',
          d: '69% de las líneas activas consume todos los meses, y las cuentas con consumo pasaron de 169 a 475 entre enero y agosto de 2026.', f: HOY + ' · líneas activas y cuentas con consumo, 2026' }
      ]
    },
    limit: {
      paso: 'Alta · 1 de 3', titulo: 'Elegí el límite de tu tarjeta',
      lead: 'Ahora el límite lo elegís vos, y lo cambiás cuando quieras.',
      parrafo: 'Tu límite acá no lo define nadie: es lo primero que hacés, y se decide en una pantalla. El monto que elegís es lo que vas a poder hacer —el viaje, la mudanza, el celu nuevo—, y si hoy te queda grande lo bajás, si mañana te queda chico lo subís, las veces que quieras. Lo que no te alcanza no te reprocha: te dice por qué y cómo llegar.',
      contexto: [
        { n: '23%', t: 'Casi 1 de cada 4 tarjetas ya chocó contra su propio límite.',
          d: '$28,9 M rechazados en un mes. El límite es el motivo de rechazo número uno.', f: HOY + ' · base, agosto 2026' },
        { n: '40%', t: 'Cuando el límite lo asigna otro, la disconformidad es la norma.',
          d: '40% de quienes tienen tarjeta de crédito en otro banco está disconforme con su límite.', f: 'Discovery previo a la V1 · encuesta, 865 respuestas' },
        { n: '$2,5-3 M', t: 'Nuestro propio límite salió corto contra lo que ya sabíamos.',
          d: 'El rango sugerido internamente era de $2,5 a 3 M. La V1 salió con $1.000.000.', f: 'Definición interna, previa al lanzamiento' }
      ]
    },
    'respaldo-pick': {
      paso: 'Alta · 2 de 3', titulo: 'Elegí tu respaldo',
      lead: 'Tu plata te respalda, y sigue siendo tuya.',
      parrafo: 'Tu dólar digital o tu Bitcoin no se venden ni se mueven: quedan cubriéndote las espaldas. Vuelven a tu saldo cuando bajás el límite o das de baja la tarjeta. Solo los tocamos si no pagás, y te avisamos varias veces antes. Elegís con cuál respaldarte: con dólar digital tu límite casi no se mueve, con Bitcoin sigue al precio todos los días.',
      contexto: [
        { n: '+5.892', t: 'Aceptar dólar digital casi triplica el universo elegible.',
          d: 'El universo pasa de 3.040 a 8.932 usuarios, sin tocar el modelo de riesgo.', f: 'Base de usuarios · saldos al 10/09/2026' },
        { n: '8,73 BTC', t: 'Hoy el respaldo es solo Bitcoin, y el límite se mueve con él.',
          d: '8,73 BTC es todo el respaldo vigente: ni una línea respaldada con otra moneda.', f: HOY + ' · líneas con respaldo activo' },
        { n: '52 / 14%', t: 'Casi nadie elegiría Bitcoin para respaldar.',
          d: '52% preferiría dejar el respaldo en pesos y solo 14% elegiría Bitcoin. El dólar digital es lo más cerca de esa preferencia que el riesgo permite.', f: 'Encuesta COPS · posterior a la V1' },
        { n: '7 de 12', t: 'Las stables ya son el resguardo de valor de nuestros usuarios.',
          d: '7 de 12 entrevistados las nombran así; a Bitcoin lo mencionan 3.', f: 'Discovery previo a la V1 · entrevistas' }
      ]
    },
    cierre: {
      paso: 'Activación · 1 de 3', titulo: 'Elegí cuándo cierra tu resumen',
      lead: 'Vos elegís cuándo cierra, y con eso cuándo pagás.',
      parrafo: 'Elegís el grupo que te sirve según cuándo cobrás, no según el día en que te diste de alta. Vence unos diez días después del cierre, así que con esa sola decisión acomodás la tarjeta a tu sueldo. Mientras no la actives las fechas van en aproximado: preferimos eso antes que prometerte un día que se puede correr. Cuando la activás, quedan fijas.',
      contexto: [
        { n: '1 → 4', t: 'Hoy todo el parque cierra el mismo día: el que le convino al sistema.',
          d: 'Pomelo habilita cuatro grupos de cierre. Que lo elija el usuario, y no su fecha de alta, es la propuesta.', f: HOY + ' · ciclo de facturación' }
      ]
    },
    'autopay-cuanto': {
      paso: 'Activación · 2 de 3', titulo: 'Elegí cuánto se paga solo',
      lead: 'Delegás el pago sin perder el control.',
      parrafo: 'Elegís cuánto se paga solo el día del vencimiento: el mínimo te cubre para que nada se congele, el total te deja sin intereses. Tus dólares pagan lo que gastaste en dólares, sin la percepción del 30%. Y si preferís pagarlo vos cada mes, también está bien: la opción está a la vista, no escondida.',
      contexto: [
        { n: '3,5%', t: 'Olvidarse de pagar es el motivo número uno por el que hoy se pierde una línea.',
          d: '3,5% del parque activo se liquida todos los meses por no llegar al pago mínimo.', f: HOY + ' · liquidaciones mensuales' },
        { n: '37%', t: 'Más de un tercio de las tarjetas gasta afuera todos los meses.',
          d: '37% de las tarjetas registra consumo internacional en el mes.', f: HOY + ' · base, agosto 2026' },
        { n: '×2', t: 'Sacar el 30% duplica el consumo en dólares.',
          d: 'En la prepaga, el consumo en USDC se multiplicó por dos en los tres meses posteriores a sacarle el impuesto.', f: 'Tarjeta prepaga AR · otro producto, sirve de precedente' }
      ]
    },
    'home-congelada': {
      paso: 'Estados difíciles', titulo: 'Congelada hasta pagar el mínimo',
      lead: 'El problema, la salida y la fecha. En ese orden.',
      parrafo: 'Te decimos qué pasó, cómo se sale y hasta cuándo tenés, con los números adelante y sin reproche. Nunca «mora» ni «liquidamos»: si llegamos ahí usamos parte de tu respaldo, avisándote varias veces antes. Siempre hay dos puertas abiertas —pagar el mínimo o cancelar con lo que ya dejaste— y se descongela en cuanto impacta el pago.',
      contexto: [
        { n: '12%', t: 'Una de cada ocho líneas que existieron terminó liquidada.',
          d: '162 de 1.338. El débito automático existe para que esta pantalla no aparezca.', f: HOY + ' · histórico de líneas' },
        { n: '730', t: 'Y mientras tanto, la tarjeta congelada rebota en la caja.',
          d: 'Después del límite, el segundo motivo de rechazo es la cuenta inhibida: 730 rechazos sobre 90 tarjetas en un solo mes.', f: HOY + ' · rechazos, agosto 2026' }
      ]
    },
    limite: {
      paso: 'Límite y respaldo', titulo: 'El medidor, y tu respaldo',
      lead: 'Cuánto podés gastar y qué dejaste para respaldarlo.',
      parrafo: 'El medidor muestra lo que te queda, y abajo está lo que dejaste con su valor de hoy. Tu respaldo es tuyo y te lo podés llevar cuando quieras, con la cuenta a la vista: cuánto cubre lo que debés y cuánto vuelve a tu saldo. Que la salida esté siempre a mano es lo que hace que no la necesites.',
      contexto: [
        { n: '486', t: 'La gente se lleva su plata, no se le va.',
          d: '486 de las 648 líneas cerradas fueron por retiro voluntario del respaldo.', f: HOY + ' · histórico de líneas' }
      ]
    },
    'edit-limit': {
      paso: 'Después', titulo: 'Elegí tu nuevo límite',
      lead: 'El control no se termina en el alta: subís o bajás cuando quieras.',
      parrafo: 'Cambiar el límite es la misma decisión del primer día, con la misma pantalla. Antes de confirmar ves qué implica en tu plata: cuánto más dejás si subís, cuánto vuelve a tu saldo si bajás. Lo hacés las veces que quieras, y el único borde es no bajarlo por debajo de lo que ya usaste.',
      contexto: [
        { n: '9,9%', t: 'Hoy, pedir más límite es una conversación con Ops.',
          d: '9,9% del soporte de la tarjeta es sobre límites, con 11 pedidos explícitos de aumento.', f: 'COPS · 820 conversaciones, 90 días' },
        { n: '24%', t: 'Y uno de cada cuatro quiere que se ajuste solo.',
          d: '24% se mostró interesado en que su límite se ajuste automáticamente.', f: 'Encuesta COPS · posterior a la V1' }
      ]
    },
    statement: {
      paso: 'Vivir con ella', titulo: 'El resumen, adentro de la app',
      lead: 'El resumen se lee acá, no en un PDF que hay que buscar en el mail.',
      parrafo: 'Está en la app, con lo que gastaste en pesos y en dólares separado. Lo que gastaste en dólares lo pagás con dólares, sin la percepción del 30%. Y si arrastrás deuda del mes pasado te lo decimos aparte: nunca se suma en silencio.',
      contexto: [
        { n: '17%', t: 'Pagar el resumen con crypto ya es un hábito.',
          d: '17% de las cuentas lo hace —BTC, USDC, ETH— y eso es el 19% del volumen procesado.', f: HOY + ' · pagos, agosto 2026' },
        { n: '7,1%', t: 'Y lo piden con todas las letras en soporte.',
          d: '7,1% de las conversaciones pide pagar los consumos en dólares con los dólares que ya tiene.', f: 'COPS · muestra de 296 conversaciones' }
      ]
    },

    // ── Narrativa sola: la evidencia ya la dimos antes ──────────────
    'home-activa': {
      paso: 'Vivir con ella', titulo: 'Lemon Card · Crédito',
      lead: 'Tres números y ninguna explicación.',
      parrafo: 'Cuánto gastaste, cuánto te queda y cuánto tenés que pagar: las tres cosas a la vista, sin tocar nada. Lo que todavía no pagaste sigue ocupando tu límite y te lo decimos acá, porque enterarte en una compra rechazada es mucho peor. El respaldo, que se entiende una sola vez, queda a un toque de distancia.'
    },
    summary: {
      paso: 'Alta · 3 de 3', titulo: 'Tu Lemon Credit Card',
      lead: 'Al tocar el botón, la tarjeta ya es tuya.',
      parrafo: 'Ya elegiste todo, así que no te lo volvemos a preguntar ni te lo volvemos a mostrar. Lo único que sumamos acá es lo que todavía no sabés: cuánto cuesta. El mantenimiento empieza a correr recién cuando actives la tarjeta, y los primeros tres meses van bonificados. Sin letra chica y sin sorpresas en el primer resumen.'
    },
    'home-camino': {
      paso: 'Recién creada', titulo: 'La home, con la tarjeta ya tuya',
      lead: 'Ya tenés tarjeta: podés estar comprando hoy.',
      parrafo: 'El plástico tarda cinco días; tu tarjeta, cero. Por eso la home separa las dos cosas: de un lado empezás a usarla ahora, con el celu, en dos pantallas; del otro seguís el viaje del envío, que va por su cuenta. Nada de lo que viene por correo puede frenar lo que ya tenés en la mano.'
    },
    wallet: {
      paso: 'Activación · 3 de 3', titulo: 'Pagá con el celu desde hoy',
      lead: 'Pagás con el celu hoy, sin esperar el plástico.',
      parrafo: 'Apoyás el teléfono y la tarjeta que pediste hace cinco minutos funciona. Ese gesto convierte «pedí una tarjeta» en «ya estoy pagando», y es la primera vez que la promesa se toca con la mano. Es un regalo y no un trámite: se puede dejar para después y no se rompe nada.'
    },
    activated: {
      paso: 'Activación · listo', titulo: 'Ya podés pagar con el celu',
      lead: 'Está activa, y todo lo que elegiste lo podés cambiar.',
      parrafo: 'Las fechas ya son fijas, el límite es el que pusiste y el débito hace exactamente lo que le pediste. Si no quisiste débito automático, lo pagás vos cada mes y nadie te lo reprocha. El límite, el cierre y cuánto se paga solo los cambiás desde la app, cuando quieras y las veces que quieras.'
    },
    'home-pausada': {
      paso: 'Estados difíciles', titulo: 'La pausaste vos',
      lead: 'La pausaste vos, y se respeta.',
      parrafo: 'Mientras está en pausa, tu límite y tu respaldo se siguen viendo tal cual: lo que necesitás confirmar es que tu plata sigue ahí. Pausar es un gesto de control y no cambia nada de lo que elegiste. Volver es un toque, y no hay nada que rehacer.'
    },
    consumos: {
      paso: 'Vivir con ella', titulo: 'Consumos del período',
      lead: 'Cuánto llevás gastado en este ciclo, sin calcular nada.',
      parrafo: 'El período se nombra por su cierre y su vencimiento, así que sabés hasta cuándo suma lo que gastes hoy. Es la pregunta más frecuente del mes y la más fácil de responder mal.'
    },
    confirm: {
      paso: 'Alternativa', titulo: 'Ya es tuya (pantalla suelta)',
      lead: 'La celebración entre crear la tarjeta y la home.',
      parrafo: 'Hoy el flujo va derecho del alta a la home, y el festejo es que la tarjeta ya está ahí. Esta pantalla queda guardada por si, al contarlo, el momento emocional se gana su propio lugar.'
    }
  };
  root.CreditoNotas = CreditoNotas;
  if (typeof module !== 'undefined' && module.exports) module.exports = CreditoNotas;
})(typeof window !== 'undefined' ? window : globalThis);
