// Reglas puras de la Lemon Credit Card — sin React, sin fixtures.
// Todo lo que se "discute" del producto vive acá: activos de respaldo y su
// ratio, cálculo respaldo ↔ límite, grupos de cierre con fechas concretas,
// modalidades de débito automático y formateo de montos. Se testea aparte
// (credito-model.test.js / tests.html), como da-rules.js en /pagos-automaticos/.
(function (root) {
  'use strict';

  // ── "Hoy" del prototipo: fijo, para que la demo sea idéntica en cada run ──
  const HOY = new Date(2026, 8, 18); // jueves 18/09/2026

  // ── Activos de respaldo ─────────────────────────────────────────
  // ratio = qué porcentaje del límite hay que dejar inmovilizado.
  // Regla vigente (Jero, 21/09): el respaldo es MAYOR que el límite —
  // «el límite va a representar aprox. el 80% del respaldo» → respaldo =
  // límite × 1,25, igual para los tres activos (a confirmar si BTC pide más
  // colchón). Editable desde el panel dev: es un parámetro de producto, no
  // de diseño.
  //
  // `rinde` / `tna` (Jero, 29/09): el respaldo NO es plata quieta, genera
  // intereses **a la tasa de Earn**, y esos intereses **se quedan dentro del
  // respaldo** —no van a la wallet—. Rinden los pesos (≈20%) y el dólar digital
  // (≈4,5%); con Bitcoin la propuesta es el precio, no el rendimiento.
  //
  // El respaldo crece, y el límite lo acompaña solo: ver `ajusteLimite` y
  // AJUSTE_UMBRAL. Los intereses no se retiran, se acumulan como respaldo.
  const ASSETS = {
    ARS: { id: 'ARS', name: 'Pesos', long: 'Pesos', symbol: '$', unit: 'ARS', ratio: 1.25, decimals: 0, volatil: false, rinde: true, tna: 0.20, icon: 'currency-peso', color: 'var(--c-lemon-50)', soft: 'var(--c-lemon-5)',
      why: 'Es la misma moneda que tu deuda: tu límite no se mueve.' },
    // Unidad de los montos (Jero, 21/09): el dólar digital se muestra como
    // «US$ 862», no «862 USDC» — la voz dice «dólar digital» en todas las
    // pantallas y el ticker la contradecía. Bitcoin sí lleva su unidad.
    USDC: { id: 'USDC', name: 'Dólar digital', long: 'Dólar digital', symbol: 'US$', prefix: 'US$ ', unit: 'USDC', ratio: 1.25, decimals: 2, volatil: false, rinde: true, tna: 0.045, icon: 'currency-dollar', color: 'var(--c-sky-40)', soft: '#EAF1FE',
      why: 'Sigue al dólar: tu límite se mueve mucho menos que con Bitcoin.' },
    BTC: { id: 'BTC', name: 'Bitcoin', long: 'Bitcoin', symbol: '', unit: 'BTC', ratio: 1.25, decimals: 8, volatil: true, rinde: false, icon: 'currency-bitcoin', color: 'var(--c-bitcoin-40)', soft: 'var(--c-bitcoin-5)',
      why: 'Su precio cambia todos los días: tu límite se mueve con él.' }
  };
  // Nombre del producto (Jero, 21/09): la tarjeta es «Lemon Credit Card»; la
  // home de tarjetas es «Lemon Card» con solapas Prepaga / Crédito.
  const PRODUCT = { name: 'Lemon Credit Card', short: 'Credit Card', family: 'Lemon Card' };
  // Qué parte del respaldo es el límite (1 / ratio → 80%)
  const limitShare = (ratio) => 1 / ratio;
  const ASSET_ORDER = ['ARS', 'USDC', 'BTC'];

  // Cotizaciones mock (ARS por unidad). Editables desde el panel dev.
  const PRICES_DEFAULT = { ARS: 1, USDC: 1450, BTC: 150000000 };

  // Saldos mock del usuario. Con ratio 1,25: $500.000 alcanza con los dos
  // activos, $1.000.000 solo con dólar digital y $5.000.000 con ninguno —
  // los tres estados de una opción se ven sin tocar nada.
  const BALANCES_DEFAULT = { ARS: 720000, USDC: 900, BTC: 0.0045 };

  // Tres montos sugeridos + «Otro» (equipo, 29/09): tres opciones fijas siguen
  // siendo el menú de otro, y es lo último del alta que contradice la bandera.
  // El techo lo pone el saldo (maxAffordableLimit), no una decisión nuestra.
  const LIMIT_PRESETS = [500000, 1000000, 5000000];
  const LIMIT_MIN = 200000, LIMIT_MAX = 5000000, LIMIT_STEP = 50000;
  // Los tres activos respaldan (Jero, 29/09: entran los pesos). El orden es el
  // de la recomendación, no el del saldo: el dólar digital primero porque es la
  // mejora del caso y no se devalúa, los pesos después —no mueven nada el
  // límite—, Bitcoin al final. Una tarjeta, un respaldo: no se combinan
  // monedas; eso es otro producto, no otra pantalla.
  const RESPALDO_ASSETS = ['USDC', 'ARS', 'BTC'];

  // ── Cálculo respaldo ↔ límite ───────────────────────────────────
  // respaldo en pesos = límite × ratio del activo
  const respaldoArs = (limit, assetId, ratios) => Math.round(limit * ratioOf(assetId, ratios));
  const ratioOf = (assetId, ratios) => (ratios && ratios[assetId] != null) ? ratios[assetId] : ASSETS[assetId].ratio;

  // respaldo expresado en unidades del activo (ARS → entero; USDC → 2 dec; BTC → 8 dec)
  const respaldoUnits = (limit, assetId, prices, ratios) => {
    const ars = respaldoArs(limit, assetId, ratios);
    const px = (prices || PRICES_DEFAULT)[assetId] || 1;
    return roundTo(ars / px, ASSETS[assetId].decimals);
  };

  // valor en pesos de un saldo del activo
  const unitsToArs = (units, assetId, prices) => units * ((prices || PRICES_DEFAULT)[assetId] || 1);

  // El límite no es un número congelado: es el valor en pesos del respaldo por
  // `limitShare` (Jero, 21/09 — «el límite va fluctuando en función del valor
  // del respaldo convertido a ARS»). Vale para los dos activos; con Bitcoin se
  // mueve mucho más. El prototipo lo muestra recalculando contra el precio del
  // panel dev, sin modelar el momento exacto en que se revisa.
  const limiteHoy = (respaldoUnits, assetId, prices, ratios) =>
    Math.floor(unitsToArs(respaldoUnits, assetId, prices) / ratioOf(assetId, ratios) / 1000) * 1000;

  // ¿alcanza el saldo del usuario para respaldar ese límite? + cuánto falta
  const check = (limit, assetId, balances, prices, ratios) => {
    const needUnits = respaldoUnits(limit, assetId, prices, ratios);
    const have = (balances || BALANCES_DEFAULT)[assetId] || 0;
    const ok = have + 1e-12 >= needUnits;
    const faltanteUnits = ok ? 0 : roundTo(needUnits - have, ASSETS[assetId].decimals);
    return {
      ok, needUnits, needArs: respaldoArs(limit, assetId, ratios), have,
      haveArs: unitsToArs(have, assetId, prices),
      faltanteUnits, faltanteArs: Math.round(unitsToArs(faltanteUnits, assetId, prices)),
      pct: ratioOf(assetId, ratios),
      // fracción del saldo que quedaría inmovilizada (para la barra "de tu saldo")
      shareOfBalance: have > 0 ? Math.min(1, needUnits / have) : 1
    };
  };

  // el límite más alto de los prefijados que el usuario puede respaldar hoy
  const maxAffordablePreset = (assetId, balances, prices, ratios) =>
    LIMIT_PRESETS.filter((l) => check(l, assetId, balances, prices, ratios).ok).pop() || null;

  // ¿algún activo de respaldo alcanza para este límite? → el primero que sí, o null
  const affordableAsset = (limit, balances, prices, ratios) =>
    RESPALDO_ASSETS.find((a) => check(limit, a, balances, prices, ratios).ok) || null;
  // el activo al que menos le falta (para el atajo "cargar saldo" cuando ninguno alcanza)
  const closestAsset = (limit, balances, prices, ratios) =>
    RESPALDO_ASSETS.map((a) => ({ a, f: check(limit, a, balances, prices, ratios).faltanteArs })).sort((x, y) => x.f - y.f)[0].a;

  // límite máximo exacto que respalda el saldo actual (redondeado al step para abajo)
  const maxAffordableLimit = (assetId, balances, prices, ratios) => {
    const haveArs = unitsToArs((balances || BALANCES_DEFAULT)[assetId] || 0, assetId, prices);
    const raw = haveArs / ratioOf(assetId, ratios);
    return Math.max(0, Math.floor(raw / LIMIT_STEP) * LIMIT_STEP);
  };

  // ── Retirar el respaldo ─────────────────────────────────────────
  // Retirar el respaldo da de baja la tarjeta (el retiro parcial se llama
  // «bajar el límite» y ya existe). Antes de confirmar hay que saldar lo que
  // debés, y el equipo pidió que eso sea una elección (29/09): pagarlo con el
  // saldo de tu wallet —y el respaldo vuelve entero— o con parte del propio
  // respaldo. Si la deuda es más grande que el respaldo, la segunda no existe:
  // no se puede saldar con algo que no alcanza.
  const retiroPlan = ({ respaldoUnits: rU, asset, deudaArs = 0, walletArs = 0, prices }) => {
    const px = (prices || PRICES_DEFAULT)[asset] || 1;
    const dec = ASSETS[asset].decimals;
    const respArs = unitsToArs(rU, asset, prices);
    const deudaUnits = roundTo(deudaArs / px, dec);
    const conRespaldo = deudaArs <= respArs;
    return {
      deudaArs, deudaUnits, respaldoArs: respArs, walletArs,
      conWallet: deudaArs === 0 || walletArs >= deudaArs,
      conRespaldo: deudaArs === 0 || conRespaldo,
      // lo que vuelve a tu saldo según con qué lo pagues
      vuelveConWallet: rU,
      vuelveConRespaldo: conRespaldo ? roundTo(rU - deudaUnits, dec) : 0,
      faltaWalletArs: Math.max(0, deudaArs - walletArs)
    };
  };

  // ── El límite acompaña al respaldo ──────────────────────────────
  // El respaldo se mueve: crece por los intereses, sube o baja por el precio
  // del activo. El límite lo acompaña **solo** (Jero, 29/09) y en las dos
  // direcciones, porque la alternativa era asimétrica: pedir permiso para
  // subir y bajar sin pedirlo. El umbral es 10% para que el límite no tiemble
  // todos los días por un movimiento de precio. Cada ajuste se avisa, in-app y
  // por push.
  //
  // El único borde: **no puede bajar por debajo de lo que ya usaste**, que es
  // la misma regla que en «Editar límite». Si el respaldo cae más que eso, el
  // límite se planta ahí (`piso: true`) y no se convierte en una deuda que ya
  // no entra en su propio techo.
  const AJUSTE_UMBRAL = 0.10;
  const ajusteLimite = (card, prices, ratios, comprometido = 0) => {
    if (!card) return { posible: 0, delta: 0, pct: 0, ajusta: false, dir: 'same', piso: false };
    const r = card.ratio != null ? card.ratio : ratioOf(card.asset, ratios);
    const bruto = Math.max(0, Math.min(LIMIT_MAX, Math.floor(unitsToArs(card.respaldoUnits, card.asset, prices) / r / LIMIT_STEP) * LIMIT_STEP));
    const piso = bruto < comprometido;
    const posible = Math.max(bruto, comprometido);
    const delta = posible - card.limit;
    const pct = card.limit > 0 ? delta / card.limit : 0;
    return { posible, delta, pct, ajusta: Math.abs(pct) >= AJUSTE_UMBRAL, dir: delta > 0 ? 'up' : delta < 0 ? 'down' : 'same', piso };
  };

  // El verbo para conseguir lo que falta: los pesos se cargan, lo demás se compra
  const verboFaltante = (assetId) => assetId === 'ARS' ? 'Cargar saldo' : 'Comprar';

  // Editar el límite: diferencia de respaldo entre el actual y el nuevo
  const limitChange = (fromLimit, toLimit, assetId, prices, ratios) => {
    const fromU = respaldoUnits(fromLimit, assetId, prices, ratios);
    const toU = respaldoUnits(toLimit, assetId, prices, ratios);
    const deltaUnits = roundTo(toU - fromU, ASSETS[assetId].decimals);
    return {
      direction: toLimit > fromLimit ? 'up' : toLimit < fromLimit ? 'down' : 'same',
      fromUnits: fromU, toUnits: toU, deltaUnits,
      deltaArs: respaldoArs(toLimit, assetId, ratios) - respaldoArs(fromLimit, assetId, ratios)
    };
  };

  // ── Los tres números ────────────────────────────────────────────
  // límite: techo. disponible: límite − TODO lo comprometido (lo consumido en
  // este período + lo del resumen cerrado que todavía no pagaste: "el límite no
  // se libera hasta que el usuario paga"). saldo: lo que hay que pagar del
  // resumen ya cerrado (+ deuda anterior).
  const saldoImpago = (st) => st ? Math.max(0, st.totalArs + st.deudaAnterior - st.pagado) : 0;
  const tresNumeros = ({ limit, consumido = 0, saldoImpago: impago = 0, saldoResumen = 0, deudaAnterior = 0 }) => {
    const comprometido = consumido + impago;
    return {
      limite: limit,
      consumido, saldoImpago: impago, comprometido,
      disponible: Math.max(0, limit - comprometido),
      saldo: saldoResumen + deudaAnterior,
      saldoResumen, deudaAnterior,
      usoPct: limit > 0 ? Math.min(1, comprometido / limit) : 0,
      impagoPct: limit > 0 ? Math.min(1, impago / limit) : 0,
      consumidoPct: limit > 0 ? Math.min(1, consumido / limit) : 0
    };
  };

  // ── Grupos de cierre ────────────────────────────────────────────
  // Cuatro grupos, uno por semana del mes: cierran el 1, 8, 15 y 22.
  // Vencimiento = cierre + 10 días (como muestra hoy la app: cierre 31/05 →
  // vto 10/06); si cae sábado, domingo o feriado pasa al próximo día hábil
  // (regla del core de Pomelo). Feriados: lista parcial de AR 2026 (ver supuestos S4).
  // Resumen = cierre + 2. Congela = vencimiento + 1. Liquida = vencimiento + 7
  // (con aviso 7 días antes, o sea el mismo día del vencimiento).
  const CIERRE_GROUPS = [
    { id: 1, label: '1ª semana', closeDay: 1, hint: 'Si cobrás entre el 1 y el 10' },
    { id: 2, label: '2ª semana', closeDay: 8, hint: 'Si cobrás a mitad de mes' },
    { id: 3, label: '3ª semana', closeDay: 15, hint: 'Si cobrás después del 20' },
    { id: 4, label: '4ª semana', closeDay: 22, hint: 'Si cobrás a fin de mes o el 1º' }
  ];
  const addDays = (d, n) => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() + n); return x; };
  const FERIADOS = ['2026-10-12', '2026-11-23', '2026-12-08', '2026-12-25', '2027-01-01'];
  const isoDay = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const isFeriado = (d) => FERIADOS.includes(isoDay(d));
  const nextBusinessDay = (d) => { let x = d; while (x.getDay() === 0 || x.getDay() === 6 || isFeriado(x)) x = addDays(x, 1); return x; };
  const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  // próximo cierre del grupo a partir de "desde" (incluye el mismo día)
  const nextClose = (group, desde) => {
    const g = typeof group === 'number' ? CIERRE_GROUPS.find((x) => x.id === group) : group;
    const from = desde || HOY;
    let c = new Date(from.getFullYear(), from.getMonth(), g.closeDay);
    if (c < new Date(from.getFullYear(), from.getMonth(), from.getDate())) c = new Date(from.getFullYear(), from.getMonth() + 1, g.closeDay);
    return c;
  };
  // fechas concretas del próximo ciclo de un grupo
  const cycleDates = (group, desde) => {
    const cierre = nextClose(group, desde);
    const resumen = addDays(cierre, 2);
    const vencimiento = nextBusinessDay(addDays(cierre, 10));
    const congela = addDays(vencimiento, 1);
    const liquida = addDays(vencimiento, 7);
    const aviso = vencimiento; // 7 días antes de liquidar
    return { cierre, resumen, vencimiento, congela, liquida, aviso };
  };
  // ciclo ANTERIOR (para el resumen ya emitido en la landing)
  const previousCycleDates = (group, desde) => {
    const next = nextClose(group, desde);
    const prevClose = new Date(next.getFullYear(), next.getMonth() - 1, next.getDate());
    return cycleDates(group, prevClose);
  };

  // ── Débito automático del resumen ───────────────────────────────
  // Tres modalidades (Jero, 21/09): solo el mínimo (default) · el total en
  // pesos y dólares (cada moneda paga lo suyo → los dólares con dólar
  // digital, sin la percepción del 30%) · el total en pesos. El origen no se
  // elige más allá de eso: si en una moneda no alcanza se completa con la
  // otra; nunca otra moneda. Los textos de UI viven en credito-copy.js.
  const AUTOPAY_MODES = [
    { id: 'minimo', title: 'Solo el mínimo', body: 'El resto pasa al próximo resumen, con interés.' },
    { id: 'total', title: 'El total, en pesos y dólares', body: 'Cada moneda paga lo suyo: te ahorrás el 30% en dólares.' },
    { id: 'total_pesos', title: 'El total, en pesos', body: 'Todo el resumen desde tus pesos.' }
  ];
  const AUTOPAY_SOURCES = [
    { id: 'ARS', title: 'Pesos', body: 'Paga los consumos en pesos' },
    { id: 'USDC', title: 'Dólar digital', body: 'Paga los consumos en dólares' }
  ];
  const AUTOPAY_DEFAULT = { on: true, mode: 'minimo' };

  // ── Costos ──────────────────────────────────────────────────────
  // Mantenimiento: la tarjeta de hoy cobra $6.500/mes. La propuesta (Jero,
  // 29/09) es que la nueva NO lo cobre: pedir respaldo ya es fricción
  // suficiente, y cobrar por encima de eso no es estratégico. El número viejo
  // queda como `mantenimientoHoy` porque es el punto de comparación.
  // tolerancia: hoy hay ~10% por encima del límite; en la nueva TC no la modelamos (supuestos S17)
  const FEES = { mantenimiento: 0, mantenimientoHoy: 6500, bonifMeses: 3, comisionCripto: 0, minimoPct: 0.10, tolerancia: 0 };

  // ── Formateo ────────────────────────────────────────────────────
  const roundTo = (n, dec) => { const f = Math.pow(10, dec); return Math.round(n * f) / f; };
  const fmtInt = (n) => Math.round(n).toLocaleString('es-AR');
  const fmtArs = (n) => '$' + fmtInt(n);
  // monto en unidades del activo, con la cantidad justa de decimales
  const fmtUnits = (units, assetId, opts) => {
    const a = ASSETS[assetId];
    if (assetId === 'ARS') return fmtArs(units);
    let dec = a.decimals;
    if (assetId === 'BTC') {
      // ceros iniciales + 4 cifras significativas, máximo 8 decimales
      const f = units.toFixed(8).split('.')[1] || '';
      const zeros = (f.match(/^0*/) || [''])[0].length;
      dec = Math.min(8, Math.max(4, zeros + 4));
    }
    const str = units.toLocaleString('es-AR', { minimumFractionDigits: assetId === 'USDC' ? 0 : Math.min(dec, 4), maximumFractionDigits: dec });
    if (opts && opts.bare) return str;
    return a.prefix ? `${a.prefix}${str}` : `${str} ${a.unit}`;
  };
  const fmtPct = (r) => Math.round(r * 100) + '%';
  // Las tasas piden un decimal: fmtPct convertía 4,5% en 5% y eso ya es otra tasa
  const fmtTna = (r) => {
    const v = r * 100;
    return (Number.isInteger(v) ? String(v) : v.toFixed(1).replace('.', ',')) + '%';
  };
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const MESES_CORTO = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const fmtDate = (d) => `${d.getDate()} de ${MESES[d.getMonth()]}`;
  const fmtDateShort = (d) => `${d.getDate()} ${MESES_CORTO[d.getMonth()]}`;
  const fmtDateDow = (d) => `${DIAS[d.getDay()]} ${fmtDate(d)}`;
  const daysBetween = (a, b) => Math.round((new Date(b.getFullYear(), b.getMonth(), b.getDate()) - new Date(a.getFullYear(), a.getMonth(), a.getDate())) / 86400000);

  const CreditoModel = {
    HOY, PRODUCT, ASSETS, ASSET_ORDER, RESPALDO_ASSETS, PRICES_DEFAULT, BALANCES_DEFAULT, LIMIT_PRESETS, LIMIT_MIN, LIMIT_MAX, LIMIT_STEP, limitShare,
    ratioOf, respaldoArs, respaldoUnits, unitsToArs, limiteHoy, check, maxAffordablePreset, affordableAsset, closestAsset, maxAffordableLimit, limitChange, retiroPlan, verboFaltante, AJUSTE_UMBRAL, ajusteLimite, tresNumeros, saldoImpago,
    CIERRE_GROUPS, FERIADOS, isFeriado, nextBusinessDay, nextClose, cycleDates, previousCycleDates, addDays, sameDay, daysBetween,
    AUTOPAY_MODES, AUTOPAY_SOURCES, AUTOPAY_DEFAULT, FEES,
    roundTo, fmtInt, fmtArs, fmtUnits, fmtPct, fmtTna, fmtDate, fmtDateShort, fmtDateDow, MESES, MESES_CORTO
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = CreditoModel;
  root.CreditoModel = CreditoModel;
})(typeof window !== 'undefined' ? window : globalThis);
