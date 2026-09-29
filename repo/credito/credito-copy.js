// Copy de la Lemon Credit Card, ordenado por la narrativa de producto
// (ver narrativa.md). Una sola fuente de verdad para todos los textos de
// pantalla: si hay que cambiar una frase, se cambia acá, no en las pantallas.
// Patrones con {variable} se resuelven con tpl(). Voseo rioplatense.
//
// Versión 29/09: el feedback del equipo aplicado. Entran los pesos como
// respaldo y el respaldo rinde a la tasa de Earn (el rendimiento se queda
// adentro del respaldo; el límite NO sube solo, se avisa cuando hay margen y
// lo sube el usuario), el límite acepta monto libre, la tarjeta no cobra
// mantenimiento, el débito automático sale de la activación y se ofrece con la
// tarjeta ya activa, y Apple Pay vive en la confirmación. Antes: la bandera es
// el control («Ahora vos controlás todo»), los montos de dólar digital se
// escriben US$, las fechas son ≈ hasta que la tarjeta existe y los avisos se
// prometen en plural. Decisiones y su porqué: narrativa.md.
(function (root) {
  const CreditoCopy = {
    promo: {
      // Bandera elegida por Jero (21/09): el control. Se repite en toda la
      // comunicación; los hechos («sin vender», «sin pedir permiso») bajan al sub.
      headline: 'Ahora vos controlás todo.',
      sub: 'Lemon Credit Card: el límite lo ponés vos y tus ahorros te respaldan, sin venderlos.',
      cta: 'Quiero mi Credit Card'
    },
    limite: {
      h1: 'Elegí el límite de tu tarjeta',
      sub_opcional: 'Nadie te lo asigna: lo ponés vos y lo cambiás cuando quieras.',
      stage_label: 'Tu límite',
      stage_label_edit: 'Tu nuevo límite',
      stage_empty: 'Elegí un monto',
      power_5M: 'El viaje afuera, la mudanza. Sin pedir permiso.',
      power_1M: 'El celu nuevo, la compu, la escapada.',
      power_500k: 'El súper, la nafta, las salidas del mes.',
      locked_reason: 'Te falta saldo para respaldarlo',
      locked_reason_units: 'Te faltan {faltante} de respaldo',
      locked_action: 'Comprar',
      locked_action_ars: 'Cargar saldo', // a los pesos no se los compra
      // «Otro» (equipo, 29/09): el techo lo pone tu saldo, no nuestra lista
      otro_label: 'Otro monto',
      otro_sub: 'Con tu saldo de hoy llegás hasta {max}',
      otro_sub_vacio: 'Elegí vos cuánto, hasta lo que tu saldo respalde',
      otro_min: 'El mínimo es {min}',
      otro_max: 'Con tu saldo de hoy llegás hasta {max}',
      otro_placeholder: '0',
      helper_label: '¿Puedo cambiarlo después?',
      helper_title: 'El límite lo manejás vos',
      helper_b1: 'Sí: lo subís o lo bajás cuando quieras, las veces que quieras, desde la app.',
      helper_b2: 'Subirlo pide un poco más de respaldo. Bajarlo devuelve la diferencia a tu saldo.',
      helper_b3: 'Lo único que no podés es bajarlo por debajo de lo que ya usaste en el período.',
      helper_close: 'Entendido',
      cta: 'Continuar'
    },
    respaldo: {
      h1: 'Elegí tu respaldo',
      sub_opcional: 'Tu plata te respalda. Y sigue siendo tuya.',
      option_label: 'Dejás',
      option_line: 'Dejás {monto}',
      // El equivalente en pesos va acá, en segundo plano (Jero, 29/09): a nivel
      // transparencia suma, pero «dejás $1.250.000 para gastar $1.000.000» es
      // una resta que el usuario puede hacer y que nosotros no le servimos.
      option_ars: '≈ {ars} de tu saldo',
      option_rinde: 'Rinde {tna} anual mientras respalda',
      locked_line: 'Te faltan {faltante}',
      helper_label: '¿Cómo funciona el respaldo?',
      helper_title: 'Así te cuida tu respaldo',
      helper_b1: 'Sigue siendo tuyo. No se vende ni se mueve, y vuelve a tu saldo si bajás el límite o das de baja la tarjeta.',
      helper_b_rinde: 'No queda quieto: mientras respalda sigue rindiendo a la misma tasa que en Earn —los pesos ≈20% anual, el dólar digital ≈4,5%— y los intereses se suman a tu respaldo. Tu límite no cambia solo: cuando tu respaldo alcanza para uno más alto, te avisamos y lo subís vos.',
      helper_b2: 'Dejás un poco más que tu límite: el límite es el 80% de lo que dejás (para $1.000.000, dejás $1.250.000). Ese margen es tu colchón, y lo que te habilita la tarjeta sin historial crediticio.',
      helper_b3: 'Tu límite sigue el valor de tu respaldo en pesos: si sube, sube; si baja, baja. Con Bitcoin se mueve mucho más que con dólar digital.',
      helper_b4: 'Solo lo usamos si no pagás el resumen, 7 días después del vencimiento. Antes te avisamos varias veces: que haya que tocar tu respaldo es lo último que queremos.',
      helper_close: 'Entendido',
      cta: 'Continuar'
    },
    pedido: {
      h1: 'Tu Lemon Credit Card',
      sub: 'Al crearla ya es tuya. Cuándo cierra tu resumen lo elegís cuando la actives.',
      row_mantenimiento: 'Mantenimiento',
      // Jero, 29/09: la tarjeta no cobra mantenimiento. El cero deja de ser
      // letra chica y pasa a ser lo que la pantalla tiene para decir.
      mantenimiento_valor: 'Sin costo',
      mantenimiento_sub: 'No tiene costo de mantenimiento: ni ahora ni cuando la actives. Lo único que dejás es tu respaldo, y sigue siendo tuyo.',
      tag_gratis: 'Gratis',
      cta: 'Crear mi Credit Card'
    },
    confirm: {
      eyebrow_opcional: 'Tarjeta creada',
      h1: 'Ya es tuya',
      sub: 'Desde hoy el control es tuyo. Activala y pagá con el celu, sin esperar la física.',
      cta: 'Empezar a usar ahora',
      cta2: 'Ir a Lemon Card'
    },
    // Contenedor 1 de la home recién creada: usarla ya, sin esperar nada
    home_usar: {
      eyebrow: 'Empezá a usar tu tarjeta',
      title: 'Ya es tuya. Activala y pagá con el celu.',
      body: 'Elegí cuándo cierra tu resumen y sumala a Apple Pay. Es una pantalla.',
      cta: 'Empezar a usar ahora'
    },
    // Contenedor 2: el plástico, que viaja aparte y no frena nada
    home_envio: {
      eyebrow: 'Tu tarjeta física',
      title: 'En camino',
      sub: 'Llega entre el {desde} y el {hasta}',
      body: 'No hace falta esperarla: con el celu ya pagás.',
      paso_pedida: 'Pedida',
      paso_preparando: 'En preparación',
      paso_despachada: 'Despachada',
      paso_entregada: 'Entregada',
      entregada_title: 'Entregada',
      entregada_sub: 'Activala desde la app cuando quieras usarla en el local.'
    },
    home_wallet: {
      title: 'Pagá con el celu desde hoy',
      body: 'Tu tarjeta ya funciona. Sumala a Apple Pay y usala ahora, sin esperar la física.',
      cta: 'Sumar a Apple Pay'
    },
    home_fisica: {
      title: 'Tu tarjeta física está en camino',
      body: 'Llega en 5 a 7 días hábiles. No hace falta esperarla: con el celu ya pagás.'
    },
    cierre: {
      header: 'Activar tarjeta',
      h1: 'Elegí cuándo cierra tu resumen',
      sub: 'Pensalo según cuándo cobrás: vence unos 10 días después del cierre.',
      option_title: 'Cierra alrededor del {dia}',
      option_sub: 'Vence alrededor del {dia_vto_aprox}',
      expanded_line: 'Tu primer resumen cerraría ≈ el {fecha_cierre} y vencería ≈ el {fecha_vto}.',
      footnote: 'Son fechas aproximadas: quedan fijas cuando activás la tarjeta y las ves en la app.',
      cta: 'Activar mi tarjeta'
    },
    // Débito automático: sale de la activación (Jero, 29/09). Se configura con
    // la tarjeta ya activa, desde el banner de la home o desde «Ya podés pagar».
    autopay: {
      header: 'Débito automático',
      h1: 'Elegí cuánto se paga solo',
      sub: 'El día del vencimiento, sin que tengas que acordarte.',
      min_title: 'Solo el mínimo',
      min_body: 'Te cubre para que no se congele. El resto pasa al próximo resumen, con interés.',
      total_title: 'El total, en pesos y dólares',
      total_body: 'Los dólares con tu dólar digital, así te ahorrás el 30%. Todo el resumen, sin intereses.',
      totalpesos_title: 'El total, en pesos',
      totalpesos_body: 'Todo el resumen desde tus pesos, sin intereses.',
      helper_label: '¿De dónde sale la plata?',
      helper_title: 'De dónde sale la plata',
      helper_body: 'Con «pesos y dólares», los consumos en pesos se pagan con tus pesos y los de dólares con tu dólar digital: así no pagás la percepción del 30%. Si te falta en una moneda, se completa con la otra. Con «en pesos», todo sale de tus pesos. Nunca se toca otra moneda, y si no alcanza te avisamos varias veces antes.',
      cta: 'Activar débito automático',
      skip: 'Prefiero pagarlo yo cada mes'
    },
    // El banner de la home: el único empujón, y se puede ignorar para siempre
    home_autopay: {
      title: 'Que se pague solo',
      body: 'Elegí cuánto se debita el día del vencimiento y no tenés que acordarte de nada.',
      cta: 'Configurar'
    },
    wallet: {
      header: 'Activar tarjeta',
      h1: 'Pagá con el celu desde hoy',
      sub: 'Sumala a Apple Pay y pagá apoyando el celu, sin esperar la física.',
      cta: 'Agregar a Apple Wallet',
      skip: 'Ahora no'
    },
    activated: {
      h1: 'Ya podés pagar con el celu',
      sub: 'Tu Credit Card está en tu billetera. El límite, el cierre y el débito los cambiás cuando quieras, desde la app.',
      row_limite: 'Límite',
      row_cierre: 'Cierre',
      row_autopay: 'Débito automático',
      autopay_min_sub: 'Se debita el día del vencimiento. El resto pasa al próximo resumen.',
      autopay_total_sub: 'Se debita el día del vencimiento. Pesos con pesos, dólares con dólar digital.',
      autopay_totalpesos_sub: 'Se debita el día del vencimiento, todo desde tus pesos.',
      autopay_off: 'Sin configurar',
      autopay_off_sub: 'Por ahora lo pagás vos cada mes. Lo activás cuando quieras.',
      cta: 'Ir a mi Credit Card',
      row_cierre_sub: 'Vence el {vto}',
      // Apple Pay ya no es un paso aparte (equipo, 29/09): el botón vive acá,
      // así «ya es tuya» y «ya podés pagar» son el mismo momento.
      cta_wallet: 'Agregar a Apple Wallet',
      cta_skip: 'Ahora no',
      h1_sin_wallet: 'Tu Credit Card está activa',
      sub_sin_wallet: 'Ya podés usarla. Sumala a Apple Pay y pagá con el celu, sin esperar la física.'
    },
    home: {
      title: 'Lemon Card',
      tab_prepaga: 'Prepaga',
      tab_credito: 'Crédito',
      card_name: 'Credit Card',
      sec_consumos: 'Consumos del período',
      sec_disponible: 'Límite disponible',
      sec_limite_total: 'Límite total',
      sec_actividad: 'Actividad',
      resumen_apagar: 'a pagar',
      resumen_cta: 'Pagar',
      sin_resumen: 'Tu primer resumen cierra el {fecha}. Hasta entonces, nada que pagar.',
      // Tu respaldo creció y alcanza para un límite más alto. El límite no sube
      // solo (Jero, 29/09): esto invita, no decide. Aparece desde un 10%.
      margen_title: 'Podés subir tu límite a {ars}',
      margen_body: 'Tu respaldo creció y ya alcanza para más. Subilo cuando quieras.',
      margen_cta: 'Ver mi límite'
    },
    // Consumos del período (equipo, 29/09): los pagos que hiciste van acá, pero
    // NO suman al número grande —esa sección responde cuánto vas a deber—, y el
    // historial deja de vivir en un mail.
    consumos: {
      header: 'Consumos del período',
      periodo: 'Cierra el {cierre} · vence el {vto}',
      sec_consumos: 'Consumos',
      sec_pagos: 'Pagos que hiciste',
      pagos_sub: 'No suman a lo que vas a deber: lo bajan.',
      sin_pagos: 'Todavía no hiciste pagos en este período.',
      anteriores: 'Períodos anteriores',
      anteriores_sub: 'Los resúmenes que ya cerraron, acá adentro.',
      anterior_row: 'Resumen de {mes}',
      anterior_pagado: 'Pagado',
      anterior_impago: 'Sin pagar'
    },
    limite_respaldo: {
      header: 'Límite y respaldo',
      gauge_label: 'Disponible',
      row_usado: 'Usado este período',
      row_sin_pagar: 'Resumen sin pagar',
      row_sin_pagar_sub: 'Se libera cuando lo pagás',
      row_limite_total: 'Límite total',
      edit_cta: 'Editar límite',
      section_respaldo: 'Tu respaldo',
      apartaste_label: 'Dejaste',
      apartaste_sub: '≈ {ars} hoy · sigue siendo tuyo',
      apartaste_sub_ars: 'Sigue siendo tuyo', // con pesos no hay equivalente que mostrar
      rinde_row: 'Rinde {tna} anual, como en Earn',
      margen_title: 'Tu respaldo alcanza para un límite de {ars}',
      margen_body: 'Creció desde que lo dejaste. El límite no sube solo: subilo vos cuando quieras.',
      margen_cta: 'Subir a {ars}',
      retirar_cta: 'Retirar respaldo',
      // Retirar da de baja la tarjeta. Antes hay que saldar lo que debés, y con
      // qué lo saldás es una elección (equipo, 29/09).
      retiro_h1: 'Retirar tu respaldo',
      retiro_sub: 'La tarjeta se da de baja. Antes hay que saldar lo que debés:',
      retiro_sin_deuda: 'No debés nada: tu respaldo vuelve entero a tu saldo.',
      retiro_row_respaldo: 'Tu respaldo',
      retiro_row_deuda: 'Lo que debés hoy',
      retiro_row_vuelve: 'Vuelve a tu saldo',
      retiro_como: '¿Con qué lo pagás?',
      retiro_wallet_title: 'Con el saldo de tu wallet',
      retiro_wallet_body: 'Tu respaldo vuelve entero: {vuelve}.',
      retiro_wallet_falta: 'Te faltan {falta} en tu wallet',
      retiro_respaldo_title: 'Con parte de tu respaldo',
      retiro_respaldo_body: 'Se descuentan {deuda} y vuelve el resto: {vuelve}.',
      retiro_respaldo_no_alcanza: 'Tu respaldo no alcanza para cubrir lo que debés',
      retiro_plazo: 'Hasta 48 h hábiles',
      retiro_cta: 'Confirmar el retiro',
      retiro_volver: 'Volver',
      saber_mas: '¿Cómo funciona?',
      saber_title: 'Así te cuida tu respaldo',
      saber_b1: 'Sigue siendo tuyo. No se vende ni se mueve, y vuelve a tu saldo si bajás el límite o das de baja la tarjeta.',
      // El mismo bullet que en el alta: si se toca uno, se toca el otro (narrativa.md §9)
      saber_b_rinde: 'No queda quieto: mientras respalda sigue rindiendo a la misma tasa que en Earn —los pesos ≈20% anual, el dólar digital ≈4,5%— y los intereses se suman a tu respaldo. Tu límite no cambia solo: cuando tu respaldo alcanza para uno más alto, te avisamos y lo subís vos.',
      saber_b2: 'Dejás un poco más que tu límite: el límite es el 80% de lo que dejás (para $1.000.000, dejás $1.250.000). Ese margen es tu colchón, y lo que te habilita la tarjeta sin historial crediticio.',
      saber_b3: 'Tu límite sigue el valor de tu respaldo en pesos: si sube, sube; si baja, baja. Con Bitcoin se mueve mucho más que con dólar digital.',
      saber_b4: 'Solo lo usamos si no pagás el resumen, 7 días después del vencimiento. Antes te avisamos varias veces: que haya que tocar tu respaldo es lo último que queremos.',
      saber_close: 'Entendido'
    },
    estados: {
      pausada_title: 'La pausaste vos',
      pausada_body: 'No pasan compras hasta que la reactives. Tu límite y tu respaldo quedan como están.',
      pausada_cta: 'Reactivar',
      congelada_title: 'Congelada hasta pagar el mínimo',
      congelada_body: 'No pasan compras. Pagá el mínimo ({minimo}) y se descongela en cuanto impacta el pago.',
      vence_title: 'Tu resumen vence {cuando}',
      vence_body: 'Con el mínimo ({minimo}) antes del {fecha} alcanza para que no se congele. Si podés, pagá el total y no generás intereses.',
      retiro_title: 'Tu respaldo está volviendo',
      retiro_body: 'Si debías algo, se paga con el respaldo; el resto vuelve a tu saldo en hasta 48 h hábiles. La tarjeta queda dada de baja.'
    },
    editar_limite: {
      header: 'Editar límite',
      h1: 'Elegí tu nuevo límite',
      sub: 'Subir pide más respaldo. Bajar lo devuelve a tu saldo. Lo cambiás las veces que quieras.',
      tag_actual: 'Actual',
      sub_subir: 'Dejás {unidades} más',
      sub_bajar: 'Vuelven {unidades} a tu saldo',
      blocked: 'Todavía tenés {ars} en uso',
      cta_subir: 'Subir a {ars}',
      cta_bajar: 'Bajar a {ars}'
    }
  };
  // «Dejás {monto}» → «Dejás US$ 862,07»
  const tpl = (str, vars) => String(str || '').replace(/\{(\w+)\}/g, (_, k) => (vars && vars[k] != null ? vars[k] : ''));
  CreditoCopy.tpl = tpl;
  root.CreditoCopy = CreditoCopy;
  if (typeof module !== 'undefined' && module.exports) module.exports = CreditoCopy;
})(typeof window !== 'undefined' ? window : globalThis);
