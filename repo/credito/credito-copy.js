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
      helper_b4: 'Y se mueve solo con tu respaldo: miramos su valor una vez por día y, si cambió más de un 10%, tu límite lo acompaña y te avisamos. Nunca baja de lo que ya usaste.',
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
      option_rinde: 'Rinde {tna} anual, todos los días',
      locked_line: 'Te faltan {faltante}',
      helper_label: '¿Cómo funciona el respaldo?',
      helper_title: 'Así te cuida tu respaldo',
      helper_b1: 'Sigue siendo tuyo. No se vende ni se mueve, y vuelve a tu saldo si bajás el límite o das de baja la tarjeta.',
      helper_b_rinde: 'No queda quieto: mientras respalda sigue rindiendo a la misma tasa que en Earn —los pesos ≈20% anual, el dólar digital ≈4,5%— y capitaliza todos los días. Los intereses se suman a tu respaldo, así que tu límite también sube con ellos.',
      helper_b2: 'Dejás un poco más que tu límite: el límite es el {pct} de lo que dejás (para un límite de {limite}, dejás {respaldo}). Ese margen es tu colchón, y lo que te habilita la tarjeta sin historial crediticio.',
      helper_b3: 'Tu límite sigue el valor de tu respaldo en pesos: lo miramos una vez por día y, si cambió más de un 10%, tu límite se ajusta y te avisamos. Con pesos no se mueve nunca —es la misma moneda que tu deuda—; con Bitcoin se mueve mucho más que con dólar digital.',
      helper_b4: 'Solo lo usamos si no pagás el resumen, 7 días después del vencimiento. Antes te avisamos varias veces: que haya que tocar tu respaldo es lo último que queremos.',
      helper_close: 'Entendido',
      cta: 'Continuar'
    },
    pedido: {
      h1: 'Tu Lemon Credit Card',
      // Jero, 29/09: esta pantalla no habla de plata. Es el momento en que la
      // tarjeta nace y lo único que tiene que hacer es dar ganas. Lo que cuesta
      // (nada) vive en el helper, a un toque: no es un argumento de venta, es
      // una respuesta para el que pregunta.
      sub: 'Creala y empezá a manejar tu día a día con la plata que ya tenés. Sin venderla, sin pedirle permiso a nadie.',
      helper_label: '¿Tiene algún costo?',
      helper_title: 'Lo que cuesta tu Credit Card',
      helper_b1: 'Crearla no cuesta nada, y tenerla tampoco: no cobramos mantenimiento, ni ahora ni cuando la actives.',
      helper_b2: 'Tu respaldo no es un costo: es tuyo, rinde mientras respalda y vuelve a tu saldo cuando bajás el límite o das de baja la tarjeta.',
      helper_b3: 'Lo único que se cobra es financiar: si pagás solo el mínimo, lo que quede para el próximo resumen paga {tna} anual. Pagando el total, no pagás intereses.',
      helper_close: 'Entendido',
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
      min_body: 'Te cubre para que no se congele. El resto pasa al próximo resumen, con una tasa del {tna} anual.',
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
      autopay_min_sub: 'Se debita el día del vencimiento. El resto pasa al próximo resumen, al {tna} anual.',
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
      // El límite acompaña al respaldo solo, en las dos direcciones y desde un
      // 10% (Jero, 29/09). Esto no invita a nada: avisa que ya pasó. El mismo
      // aviso sale por push.
      ajuste_up_title: 'Tu límite subió a {ars}',
      ajuste_up_body: 'Tu respaldo creció y tu límite lo acompaña. No tenés que hacer nada.',
      ajuste_down_title: 'Tu límite bajó a {ars}',
      ajuste_down_body: 'Tu respaldo vale menos hoy y tu límite lo acompaña. Cuando vuelva a subir, sube con él.',
      ajuste_piso: 'No baja de lo que ya usaste: {ars}.',
      ajuste_cta: 'Ver mi límite'
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
      rinde_row: 'Rinde {tna} anual, todos los días',
      ajuste_title: 'Tu límite sigue a tu respaldo',
      ajuste_body: 'Miramos el valor de tu respaldo una vez por día. Si cambió más de un 10%, tu límite se ajusta solo y te avisamos. Nunca baja de lo que ya usaste, y podés cambiarlo vos cuando quieras.',
      retirar_cta: 'Retirar respaldo',
      // El retiro es un proceso, no un botón (Jero, 29/09): pedís el retiro,
      // te avisamos lo que debés, lo pagás —con el saldo de tu wallet o con
      // parte del respaldo— y recién ahí se libera el resto. Pagar con la
      // wallet SIEMPRE está disponible: nadie está obligado a saldar su deuda
      // comiéndose el respaldo.
      retiro_h1: 'Retirar tu respaldo',
      retiro_sub: 'La tarjeta se da de baja y tu respaldo vuelve a tu saldo. Así queda la cuenta:',
      retiro_sin_deuda: 'No debés nada, así que tu respaldo vuelve entero.',
      retiro_row_respaldo: 'Tu respaldo',
      retiro_row_deuda: 'Lo que debés hoy',
      retiro_row_vuelve: 'Vuelve a tu saldo',
      retiro_pasos: 'Pedís el retiro · te calculamos lo que debés · lo pagás · se libera el resto.',
      retiro_recalculo: 'El total se calcula el mismo día que lo pedís. Si no lo pagás, al día siguiente se recalcula.',
      retiro_pedir_cta: 'Solicitar el retiro',
      retiro_cta: 'Confirmar el retiro',
      retiro_volver: 'Volver',
      retiro_plazo: 'Hasta 48 h hábiles',
      // Paso 3: con qué saldás la deuda
      pago_h1: 'Pagá lo que debés y liberá tu respaldo',
      pago_sub: 'Elegí de dónde sale. Con el saldo de tu wallet, tu respaldo vuelve entero.',
      pago_fecha: 'Calculado el {fecha}. Si no lo pagás hoy, mañana se recalcula.',
      retiro_como: '¿Con qué lo pagás?',
      retiro_wallet_title: 'Con el saldo de tu wallet',
      retiro_wallet_body: 'Tu respaldo vuelve entero: {vuelve}.',
      retiro_wallet_falta: 'Te faltan {falta}. Los cargás y pagás en el mismo paso.',
      retiro_respaldo_title: 'Con parte de tu respaldo',
      retiro_respaldo_body: 'Se descuentan {deuda} y vuelve el resto: {vuelve}.',
      retiro_respaldo_no_alcanza: 'Tu respaldo no alcanza para cubrir lo que debés',
      pago_cta: 'Pagar {ars} y liberar',
      pago_cta_cargar: 'Cargar {falta} y pagar',
      saber_mas: '¿Cómo funciona?',
      saber_title: 'Así te cuida tu respaldo',
      saber_b1: 'Sigue siendo tuyo. No se vende ni se mueve, y vuelve a tu saldo si bajás el límite o das de baja la tarjeta.',
      // El mismo bullet que en el alta: si se toca uno, se toca el otro (narrativa.md §9)
      saber_b_rinde: 'No queda quieto: mientras respalda sigue rindiendo a la misma tasa que en Earn —los pesos ≈20% anual, el dólar digital ≈4,5%— y capitaliza todos los días. Los intereses se suman a tu respaldo, así que tu límite también sube con ellos.',
      saber_b2: 'Dejás un poco más que tu límite: el límite es el {pct} de lo que dejás (para un límite de {limite}, dejás {respaldo}). Ese margen es tu colchón, y lo que te habilita la tarjeta sin historial crediticio.',
      saber_b3: 'Tu límite sigue el valor de tu respaldo en pesos: lo miramos una vez por día y, si cambió más de un 10%, tu límite se ajusta y te avisamos. Con pesos no se mueve nunca —es la misma moneda que tu deuda—; con Bitcoin se mueve mucho más que con dólar digital.',
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
      vence_body: 'Con el mínimo ({minimo}) antes del {fecha} alcanza para que no se congele. Si podés, pagá el total: lo que quede financiado paga {tna} anual.',
      retiro_title: 'Tu respaldo está volviendo',
      retiro_body: 'Vuelve a tu saldo en hasta 48 h hábiles. La tarjeta queda dada de baja.',
      // Paso 2: pediste el retiro y falta saldar la deuda
      retiro_pedido_title: 'Pagá {monto} para liberar tu respaldo',
      retiro_pedido_body: 'Pediste retirar tu respaldo y no pasan compras nuevas. Este total es el de hoy, {fecha}: si no lo pagás, mañana se recalcula. En cuanto pagues, el resto vuelve a tu saldo.',
      retiro_pedido_cta: 'Pagar y liberar'
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
