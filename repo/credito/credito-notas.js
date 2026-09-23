// Material de presentación: NO es parte de la app. Al lado del teléfono van dos
// tarjetas dadas vuelta que se giran al hacer clic.
//
//   NARRATIVA · qué le queremos contar al usuario en esta pantalla: la idea en
//               una frase (lead) y un párrafo que la desarrolla (parrafo),
//               escrito en voz de campaña —posiciona, nombra la tensión y
//               cierra—. NO dice cómo resolverlo en pantalla: esa es la
//               conversación que queremos abrir con diseño.
//   CONTEXTO  · la evidencia, con su fuente. Cada ítem es {n, t, f}.
//
// Reglas de edición, para que esto siga sirviendo para pitchear:
//   · Un dato vive en UNA sola pantalla, la que justifica. No se repite.
//   · El párrafo desarrolla el lead, no lo repite: si la primera oración del
//     párrafo se puede borrar sin perder nada, sobra.
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
      parrafo: 'En cualquier otro lado el límite es una sentencia: te la dan, no se discute, y te enterás en la caja del súper. Acá es una decisión tuya y se toma en una pantalla. El monto que elegís es lo que vas a poder hacer —el viaje, la mudanza, el celu nuevo—, y si hoy te queda grande lo bajás, si mañana te queda chico lo subís. Lo que no te alcanza no te reprocha: te dice por qué y cómo llegar.',
      contexto: [
        { n: '23%', t: 'de las tarjetas que se usan tuvo un consumo rechazado por límite —$28,9 M en un mes—, y el límite es el motivo de rechazo número uno.', f: HOY + ' · base, agosto 2026' },
        { n: '40%', t: 'de quienes tienen tarjeta de crédito en otro banco está disconforme con su límite.', f: 'Discovery previo a la V1 · encuesta, 865 respuestas' },
        { n: '$2,5-3 M', t: 'era el rango de límite sugerido internamente. La V1 salió con $1.000.000.', f: 'Definición interna, previa al lanzamiento' }
      ]
    },
    'respaldo-pick': {
      paso: 'Alta · 2 de 3', titulo: 'Elegí tu respaldo',
      lead: 'Tu plata te respalda, y sigue siendo tuya.',
      parrafo: 'Acá está el miedo de verdad: «si dejo mi plata, ¿la pierdo?». La respuesta es no, y la damos antes de que la pregunta aparezca. Tu dólar digital o tu Bitcoin no se venden ni se mueven: quedan cubriéndote las espaldas y vuelven a tu saldo cuando bajás el límite o das de baja la tarjeta. Solo los tocamos si no pagás, avisándote varias veces antes. Con dólar digital tu límite casi no se mueve; con Bitcoin, sigue al precio.',
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
      parrafo: 'Es el único momento del alta en el que no pedimos nada: ya elegiste todo, y lo que sigue es tuyo. Por eso no repetimos lo que acabás de decidir. Lo único que sumamos es lo que todavía no sabés: el mantenimiento empieza a correr recién cuando actives la tarjeta, y los primeros tres meses van bonificados. Sin letra chica y sin sorpresas en el primer resumen.',
      contexto: [
        { n: '~100', t: 'altas por mes, estables, sin comunicación ni inversión asociada: la demanda está, lo que sobra es fricción.', f: HOY + ' · altas mensuales, 2026' },
        { n: '69%', t: 'de las líneas activas consume todos los meses: quien entra, usa.', f: HOY + ' · líneas con respaldo activo' }
      ]
    },
    'home-camino': {
      paso: 'Recién creada', titulo: 'La home, con la tarjeta ya tuya',
      lead: 'Ya tenés tarjeta: podés estar comprando hoy.',
      parrafo: 'El plástico tarda cinco días; tu tarjeta, cero. Esa distancia es la que gana o pierde el primer uso, así que la home separa dos cosas que no son la misma: empezar a usarla ahora —con el celu, en dos pantallas— y seguir el viaje del plástico, que va por su cuenta. Nada de lo que viene por correo puede frenar lo que ya tenés en la mano.',
      contexto: [
        { t: 'La tarjeta virtual existe al instante; la física, no. Si las dos comparten el mismo espacio, el plástico termina marcando el ritmo de todo.' }
      ]
    },
    cierre: {
      paso: 'Activación · 1 de 3', titulo: 'Elegí cuándo cierra tu resumen',
      lead: 'Vos elegís el ritmo del resumen: según cuándo cobrás, no según cuándo te diste de alta.',
      parrafo: 'Hoy todos cierran el mismo día, que es el día que le convino al sistema. Darlo vuelta es barato y cambia la relación con la tarjeta: elegís cuándo cierra y, con eso, cuándo pagás. Mientras no esté activa preferimos decir que las fechas son aproximadas antes que prometer un día que se puede correr; la confianza se construye justo ahí.',
      contexto: [
        { n: '1 → 4', t: 'hoy todo el parque cierra el mismo día; pasaría a cerrar según la semana del mes.', f: HOY + ' · ciclo de facturación' },
        { t: 'Pomelo habilita los cuatro grupos. Que los elija el usuario, y no la fecha de alta, es la propuesta.' }
      ]
    },
    'autopay-cuanto': {
      paso: 'Activación · 2 de 3', titulo: 'Elegí cuánto se paga solo',
      lead: 'Delegás el pago sin perder el control.',
      parrafo: 'Pagar a mano todos los meses es la vía más rápida a que te congelen la tarjeta por un olvido. Automatizarlo sin preguntar es la vía más rápida a que sientas que te sacan plata. Entre esas dos, elegís vos: el mínimo te cubre para que nada se rompa, el total te deja sin intereses, y tus dólares pagan lo que gastaste en dólares, sin la percepción del 30%. Y si preferís pagarlo vos cada mes, también está bien.',
      contexto: [
        { n: '3,5%', t: 'del parque activo se liquida todos los meses por no llegar al pago mínimo.', f: HOY + ' · liquidaciones mensuales' },
        { n: '37%', t: 'de las tarjetas registra consumo internacional en el mes.', f: HOY + ' · base, agosto 2026' },
        { n: '×2', t: 'se multiplicó el consumo en USDC en los tres meses posteriores a sacarle el impuesto del 30%.', f: 'Tarjeta prepaga AR · otro producto, sirve de precedente' }
      ]
    },
    wallet: {
      paso: 'Activación · 3 de 3', titulo: 'Pagá con el celu desde hoy',
      lead: 'Pagás con el celu desde hoy, sin esperar el plástico.',
      parrafo: 'Es la primera vez que la promesa se toca con la mano: apoyás el teléfono y la tarjeta que pediste hace cinco minutos funciona. Ese gesto es el que convierte «pedí una tarjeta» en «ya estoy pagando». Y como es un regalo y no un trámite, se puede dejar para después sin que nada se rompa.',
      contexto: [
        { t: 'El NFC llega con la migración a Pomelo: hoy no existe. Es lo que convierte «pedí una tarjeta» en «ya estoy pagando».' }
      ]
    },
    activated: {
      paso: 'Activación · listo', titulo: 'Ya podés pagar con el celu',
      lead: 'Está activa, en tu billetera, y todo lo podés cambiar.',
      parrafo: 'El final del alta no es una arenga: es un resumen y una puerta abierta. Las fechas ya son fijas —la tarjeta existe y el ciclo quedó definido—, el límite es el que elegiste y el débito hace exactamente lo que le pediste. Si no quisiste débito automático, no pasa nada: lo pagás vos cada mes. Nada de lo que decidiste hoy queda cerrado para siempre.',
      contexto: [
        { n: '6 de 6', t: 'mejoras del caso, resueltas en seis pantallas: límite · respaldo · cierre · débito · dólares con dólares · celu.', f: 'Propuesta del prototipo' }
      ]
    },
    'home-activa': {
      paso: 'Vivir con ella', titulo: 'Lemon Card · Crédito',
      lead: 'Tres números y ninguna explicación: cuánto gastaste, cuánto te queda, cuánto tenés que pagar.',
      parrafo: 'El día a día no se explica, se usa. Quien ya entendió el producto abre la app para saber tres cosas, y las tres tienen que estar a la vista sin tocar nada. Lo que todavía no pagaste sigue ocupando tu límite y lo decimos, porque descubrirlo en una compra rechazada es mucho peor que leerlo acá. El respaldo, que es la parte que se entiende una sola vez, vive a un toque de distancia.',
      contexto: [
        { n: '169 → 475', t: 'cuentas con consumo por mes, de enero a agosto de 2026: el uso crece solo.', f: HOY + ' · cuentas con consumo, 2026' },
        { n: '1 de 4', t: 'intentos de uso termina rechazado. Después del límite, el segundo motivo es cuenta inhibida: 730 rechazos sobre 90 tarjetas.', f: HOY + ' · rechazos, agosto 2026' }
      ]
    },
    'home-congelada': {
      paso: 'Estados difíciles', titulo: 'Congelada hasta pagar el mínimo',
      lead: 'El problema, la salida y la fecha. En ese orden, y sin reproche.',
      parrafo: 'Es el peor momento de la relación y el que define si la tarjeta se recupera o se da de baja. Por eso decimos qué pasó, cómo se sale y hasta cuándo tenés, en ese orden y con los números adelante. Nunca «mora» ni «liquidamos»: usamos parte de tu respaldo, avisando varias veces antes. Y siempre hay dos puertas abiertas: pagar el mínimo o cancelar con lo que ya dejaste.',
      contexto: [
        { n: '12%', t: 'de todas las líneas que existieron terminaron liquidadas: 162 de 1.338.', f: HOY + ' · histórico de líneas' },
        { t: 'El débito automático existe para que esta pantalla no aparezca.' }
      ]
    },
    'home-pausada': {
      paso: 'Estados difíciles', titulo: 'La pausaste vos',
      lead: 'Fue tu decisión y se respeta: tu límite y tu respaldo quedan como están.',
      parrafo: 'Pausar es un gesto de control, no un castigo: quien apaga la tarjeta quiere seguridad, no menos información. Mientras está en pausa, el límite y el respaldo se siguen viendo tal cual, porque lo que necesita confirmar es que su plata sigue ahí. Volver es un toque, y no hay nada que rehacer.',
      contexto: [
        { t: 'Es una corrección, no una mejora: la información ya existe y hoy se esconde justo cuando el usuario quiere confirmar que su plata sigue ahí.' }
      ]
    },
    limite: {
      paso: 'Límite y respaldo', titulo: 'El medidor, y tu respaldo',
      lead: 'Cuánto podés gastar y qué dejaste para respaldarlo, de un vistazo.',
      parrafo: 'Es la pantalla donde el producto se vuelve transparente: el medidor muestra lo que te queda y abajo está lo que dejaste, con su valor de hoy. Tu respaldo es tuyo y te lo podés llevar cuando quieras, con la cuenta a la vista: cuánto cubre lo que debés y cuánto vuelve a tu saldo. Que la salida esté siempre a mano es lo que hace que no la necesites.',
      contexto: [
        { n: '486', t: 'de las 648 líneas cerradas fueron por retiro voluntario del colateral: la gente se lleva su plata, no se le va.', f: HOY + ' · histórico de líneas' }
      ]
    },
    'edit-limit': {
      paso: 'Después', titulo: 'Elegí tu nuevo límite',
      lead: 'El control no se termina en el alta: subís o bajás cuando quieras.',
      parrafo: 'Un límite que no se puede mover vuelve a ser el límite de un banco. Acá cambiarlo es la misma decisión del primer día, con la misma pantalla, y antes de confirmar ves qué implica en tu plata: cuánto más dejás, o cuánto vuelve a tu saldo. El único borde es no bajarlo por debajo de lo que ya usaste.',
      contexto: [
        { n: '24%', t: 'se mostró interesado en que su límite se ajuste automáticamente.', f: 'Encuesta COPS · posterior a la V1' },
        { n: '9,9%', t: 'del soporte de la tarjeta es sobre límites, con 11 pedidos explícitos de aumento. Hoy eso es una conversación con Ops.', f: 'COPS · 820 conversaciones, 90 días' }
      ]
    },
    statement: {
      paso: 'Vivir con ella', titulo: 'El resumen, adentro de la app',
      lead: 'El resumen se lee acá, no en un PDF que hay que buscar en el mail.',
      parrafo: 'El resumen es el momento en que la tarjeta rinde cuentas, así que no puede vivir en un adjunto. Está en la app, con lo que gastaste en pesos y en dólares, y lo que gastaste en dólares se paga con dólares. Si arrastrás deuda del mes pasado, se dice aparte: nunca se suma en silencio.',
      contexto: [
        { n: '17%', t: 'de las cuentas ya paga el resumen con crypto —BTC, USDC, ETH—, y eso es el 19% del volumen procesado.', f: HOY + ' · pagos, agosto 2026' },
        { n: '7,1%', t: 'de las conversaciones de soporte pide pagar los consumos en dólares con los dólares que ya tiene.', f: 'COPS · muestra de 296 conversaciones' }
      ]
    },
    consumos: {
      paso: 'Vivir con ella', titulo: 'Consumos del período',
      lead: 'Lo que llevás gastado en este ciclo, con las fechas del ciclo a la vista.',
      parrafo: 'Saber cuánto va del mes es la pregunta más frecuente y la más fácil de responder mal. El período se nombra por su cierre y su vencimiento, así que no hay nada que calcular: sabés hasta cuándo suma lo que gastes hoy.'
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
