// Material de presentación: NO es parte de la app. Al lado del teléfono van dos
// tarjetas dadas vuelta que se giran al hacer clic.
//
//   NARRATIVA · qué le queremos contar al usuario en esta pantalla: la idea en
//               una frase (lead), un párrafo cuando hace falta desarrollarla
//               (parrafo) y lo que se le suma (narrativa). NO dice cómo
//               resolverlo: esa es la conversación que abrimos con diseño.
//   CONTEXTO  · la evidencia, con su fuente. Cada ítem es {n, t, f}.
//
// Reglas de edición, para que esto siga sirviendo para pitchear:
//   · Un dato vive en UNA sola pantalla, la que justifica. No se repite.
//   · El lead no repite lo que dicen los bullets, y los bullets no repiten
//     entre sí. Si dos dicen lo mismo, sobra uno.
//   · Nada de adjetivos: número, hecho, consecuencia.
//   · Nada de soluciones de UI. Cómo está resuelto hoy se lee en narrativa.md
//     (§7, momento a momento) y en el README; acá va el qué y el porqué.
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
    'home-vacia': {
      paso: 'Descubrir', titulo: 'La tarjeta, antes de pedirla',
      lead: 'El que manda sos vos: ponés tu límite y tus ahorros se quedan donde están.',
      parrafo: 'Esta tarjeta no compite con otra tarjeta: compite con ese momento en que tuviste que elegir entre vender lo que ahorraste o no comprar. Por eso la posicionamos como la herramienta con la que manejás tu día a día —el súper, la nafta, el viaje, el celu nuevo— sin tocar lo que venís construyendo. Nadie te evalúa, nada se vende, y el techo lo ponés vos. Sin vender nada, sin pedir permiso: ahora vos controlás todo.',
      narrativa: [],
      contexto: [
        { n: '193.946', t: 'usuarios llegaron a «no tenés respaldo suficiente» en 12 meses.', f: HOY + ' · flujo de alta, 12 meses' },
        { n: '108.558', t: 'de ellos avanzaron hasta comprar crypto para poder entrar.', f: HOY + ' · flujo de alta, 12 meses' },
        { n: '684', t: 'líneas activas es todo el parque, con ~100 altas por mes sin una sola comunicación.', f: HOY + ' · líneas con respaldo activo' },
        { n: '75%', t: 'de quienes ahorran en crypto tuvo que vender sus ahorros ante una necesidad. Esa es la propuesta de valor.', f: 'Discovery previo a la V1 · +1.500 respuestas' },
        { n: '41%', t: 'de quienes no tienen tarjeta dice que nunca se la ofrecieron: no son rechazados, son no alcanzados.', f: 'Discovery previo a la V1' }
      ]
    },
    limit: {
      paso: 'Alta · 1 de 3', titulo: 'Elegí el límite de tu tarjeta',
      lead: 'Nadie te evalúa: el límite lo elegís vos, y lo cambiás cuando quieras.',
      narrativa: [
        'El monto que elegís es lo que vas a poder hacer: el viaje, la mudanza, el celu nuevo.',
        'Lo que no te alcanza no te reprocha: te dice por qué y cómo llegar.'
      ],
      contexto: [
        { n: '23%', t: 'de las tarjetas que se usan tuvo un consumo rechazado por límite —$28,9 M en un mes—, y el límite es el motivo de rechazo número uno.', f: HOY + ' · base, agosto 2026' },
        { n: '40%', t: 'de quienes tienen tarjeta de crédito en otro banco está disconforme con su límite.', f: 'Discovery previo a la V1 · encuesta, 865 respuestas' },
        { n: '$2,5-3 M', t: 'era el rango de límite sugerido internamente. La V1 salió con $1.000.000.', f: 'Definición interna, previa al lanzamiento' }
      ]
    },
    'respaldo-pick': {
      paso: 'Alta · 2 de 3', titulo: 'Elegí tu respaldo',
      lead: 'Tu plata te respalda, y sigue siendo tuya.',
      narrativa: [
        'No se vende ni se mueve: vuelve a tu saldo cuando bajás el límite o das de baja la tarjeta.',
        'La usamos solo si no pagás, y te avisamos varias veces antes.',
        'Con dólar digital tu límite casi no se mueve; con Bitcoin, sigue al precio.'
      ],
      contexto: [
        { n: '+5.892', t: 'usuarios pasarían a ser elegibles: el universo va de 3.040 a 8.932 sin tocar el modelo de riesgo.', f: 'Base de usuarios · saldos al 10/09/2026' },
        { n: '8,73 BTC', t: 'es todo el colateral vigente: el parque entero está respaldado en Bitcoin, ni una línea con otra moneda.', f: HOY + ' · líneas con respaldo activo' },
        { n: '52 / 14%', t: 'preferiría dejar el respaldo en pesos / elegiría Bitcoin. El dólar digital es lo más cerca de esa preferencia que el riesgo permite.', f: 'Encuesta COPS · posterior a la V1' },
        { n: '7 de 12', t: 'entrevistados nombran a las stables como su resguardo de valor; Bitcoin lo mencionan 3.', f: 'Discovery previo a la V1 · entrevistas' }
      ]
    },
    summary: {
      paso: 'Alta · 3 de 3', titulo: 'Tu Lemon Credit Card',
      lead: 'Al tocar el botón la tarjeta existe. Es un nacimiento, no un checkout.',
      narrativa: [
        'Lo único que falta decir es el costo: el mantenimiento corre recién cuando la actives, y los primeros 3 meses van bonificados.',
        'Lo que ya elegiste no se vuelve a preguntar ni a listar.'
      ],
      contexto: [
        { n: '~100', t: 'altas por mes, estables, sin comunicación ni inversión asociada: la demanda está, lo que sobra es fricción.', f: HOY + ' · altas mensuales, 2026' },
        { n: '69%', t: 'de las líneas activas consume todos los meses: quien entra, usa.', f: HOY + ' · líneas con respaldo activo' }
      ]
    },
    'home-camino': {
      paso: 'Recién creada', titulo: 'La home, con la tarjeta ya tuya',
      lead: 'Ya tenés tarjeta: podés estar comprando hoy.',
      narrativa: [
        'El plástico viaja aparte y no te frena.',
        'Usarla y esperarla son dos cosas distintas, y no queremos que se mezclen.'
      ],
      contexto: [
        { t: 'La tarjeta virtual existe al instante; la física, no. Si las dos comparten el mismo espacio, el plástico termina marcando el ritmo de todo.' }
      ]
    },
    cierre: {
      paso: 'Activación · 1 de 3', titulo: 'Elegí cuándo cierra tu resumen',
      lead: 'Vos elegís el ritmo del resumen: según cuándo cobrás, no según cuándo te diste de alta.',
      narrativa: [
        'Elegir cuándo cierra es elegir cuándo pagás: las dos fechas se dicen juntas.',
        'Mientras la tarjeta no esté activa son aproximadas, y prefererimos decirlo antes que prometer un día que se puede correr.'
      ],
      contexto: [
        { n: '1 → 4', t: 'hoy todo el parque cierra el mismo día; pasaría a cerrar según la semana del mes.', f: HOY + ' · ciclo de facturación' },
        { t: 'Pomelo habilita los cuatro grupos. Que los elija el usuario, y no la fecha de alta, es la propuesta.' }
      ]
    },
    'autopay-cuanto': {
      paso: 'Activación · 2 de 3', titulo: 'Elegí cuánto se paga solo',
      lead: 'Delegás el pago sin perder el control.',
      narrativa: [
        'Tus dólares pagan lo que gastaste en dólares, sin la percepción del 30%.',
        'El mínimo te cubre para que no se congele, pero no decidimos por vos cuánta plata se te va.',
        'Y si preferís pagarlo vos cada mes, también está bien.'
      ],
      contexto: [
        { n: '3,5%', t: 'del parque activo se liquida todos los meses por no llegar al pago mínimo.', f: HOY + ' · liquidaciones mensuales' },
        { n: '37%', t: 'de las tarjetas registra consumo internacional en el mes.', f: HOY + ' · base, agosto 2026' },
        { n: '×2', t: 'se multiplicó el consumo en USDC en los tres meses posteriores a sacarle el impuesto del 30%.', f: 'Tarjeta prepaga AR · otro producto, sirve de precedente' }
      ]
    },
    wallet: {
      paso: 'Activación · 3 de 3', titulo: 'Pagá con el celu desde hoy',
      lead: 'Pagás con el celu desde hoy, sin esperar el plástico.',
      narrativa: [
        'Es la primera vez que el superpoder se toca con la mano.',
        'Y se puede dejar para después: es un regalo, no un trámite.'
      ],
      contexto: [
        { t: 'El NFC llega con la migración a Pomelo: hoy no existe. Es lo que convierte «pedí una tarjeta» en «ya estoy pagando».' }
      ]
    },
    activated: {
      paso: 'Activación · listo', titulo: 'Ya podés pagar con el celu',
      lead: 'Está activa, en tu billetera, y todo lo podés cambiar.',
      narrativa: [
        'Ahora las fechas son fijas: la tarjeta existe y el ciclo quedó definido.',
        'Si no quisiste débito automático no pasa nada: lo pagás vos cada mes.'
      ],
      contexto: [
        { n: '6 de 6', t: 'mejoras del caso, resueltas en seis pantallas: límite · respaldo · cierre · débito · dólares con dólares · celu.', f: 'Propuesta del prototipo' }
      ]
    },
    'home-activa': {
      paso: 'Vivir con ella', titulo: 'Lemon Card · Crédito',
      lead: 'Tres números y ninguna explicación: cuánto gastaste, cuánto te queda, cuánto tenés que pagar.',
      narrativa: [
        'Lo que todavía no pagaste sigue ocupando tu límite, y lo decimos.',
        'El respaldo no se explica dos veces: vive en una sola pantalla.'
      ],
      contexto: [
        { n: '169 → 475', t: 'cuentas con consumo por mes, de enero a agosto de 2026: el uso crece solo.', f: HOY + ' · cuentas con consumo, 2026' },
        { n: '1 de 4', t: 'intentos de uso termina rechazado. Después del límite, el segundo motivo es cuenta inhibida: 730 rechazos sobre 90 tarjetas.', f: HOY + ' · rechazos, agosto 2026' }
      ]
    },
    'home-congelada': {
      paso: 'Estados difíciles', titulo: 'Congelada hasta pagar el mínimo',
      lead: 'El problema, la salida y la fecha. En ese orden, y sin reproche.',
      narrativa: [
        'Nunca decimos «mora» ni «liquidamos»: usamos parte de tu respaldo, avisando varias veces antes.',
        'Siempre hay dos puertas: pagar el mínimo o cancelar con el respaldo.'
      ],
      contexto: [
        { n: '12%', t: 'de todas las líneas que existieron terminaron liquidadas: 162 de 1.338.', f: HOY + ' · histórico de líneas' },
        { t: 'El débito automático existe para que esta pantalla no aparezca.' }
      ]
    },
    'home-pausada': {
      paso: 'Estados difíciles', titulo: 'La pausaste vos',
      lead: 'Fue tu decisión y se respeta: tu límite y tu respaldo quedan como están.',
      narrativa: [
        'Pausar no es perder: la plata sigue donde estaba y vuelve con un toque.'
      ],
      contexto: [
        { t: 'Es una corrección, no una mejora: la información ya existe y hoy se esconde justo cuando el usuario quiere confirmar que su plata sigue ahí.' }
      ]
    },
    limite: {
      paso: 'Límite y respaldo', titulo: 'El medidor, y tu respaldo',
      lead: 'Cuánto podés gastar y qué dejaste para respaldarlo, de un vistazo.',
      narrativa: [
        'Tu respaldo es tuyo y te lo podés llevar cuando quieras, con la cuenta a la vista: cuánto cubre lo que debés y cuánto vuelve.'
      ],
      contexto: [
        { n: '486', t: 'de las 648 líneas cerradas fueron por retiro voluntario del colateral: la gente se lleva su plata, no se le va.', f: HOY + ' · histórico de líneas' }
      ]
    },
    'edit-limit': {
      paso: 'Después', titulo: 'Elegí tu nuevo límite',
      lead: 'El control no se termina en el alta: subís o bajás cuando quieras.',
      narrativa: [
        'Y ves qué implica el cambio en tu plata antes de confirmarlo.',
        'El único borde es no bajar por debajo de lo que ya usaste.'
      ],
      contexto: [
        { n: '24%', t: 'se mostró interesado en que su límite se ajuste automáticamente.', f: 'Encuesta COPS · posterior a la V1' },
        { n: '9,9%', t: 'del soporte de la tarjeta es sobre límites, con 11 pedidos explícitos de aumento. Hoy eso es una conversación con Ops.', f: 'COPS · 820 conversaciones, 90 días' }
      ]
    },
    statement: {
      paso: 'Vivir con ella', titulo: 'El resumen, adentro de la app',
      lead: 'El resumen se lee acá, no en un PDF que hay que buscar en el mail.',
      narrativa: [
        'Lo que gastaste en dólares se paga con dólares.',
        'Si arrastrás deuda del mes pasado, se dice aparte: no se suma en silencio.'
      ],
      contexto: [
        { n: '17%', t: 'de las cuentas ya paga el resumen con crypto —BTC, USDC, ETH—, y eso es el 19% del volumen procesado.', f: HOY + ' · pagos, agosto 2026' },
        { n: '7,1%', t: 'de las conversaciones de soporte pide pagar los consumos en dólares con los dólares que ya tiene.', f: 'COPS · muestra de 296 conversaciones' }
      ]
    },
    consumos: {
      paso: 'Vivir con ella', titulo: 'Consumos del período',
      lead: 'Lo que llevás gastado en este ciclo, con las fechas del ciclo a la vista.',
      narrativa: [
        'El período se nombra por su cierre y su vencimiento: sabés hasta cuándo suma.'
      ]
    },
    confirm: {
      paso: 'Alternativa', titulo: 'Ya es tuya (pantalla suelta)',
      lead: 'La celebración entre crear la tarjeta y la home.',
      narrativa: [
        'Hoy el flujo va derecho del alta a la home. Queda acá por si el momento emocional vale la pantalla.'
      ]
    }
  };
  root.CreditoNotas = CreditoNotas;
  if (typeof module !== 'undefined' && module.exports) module.exports = CreditoNotas;
})(typeof window !== 'undefined' ? window : globalThis);
