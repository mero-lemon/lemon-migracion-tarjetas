// Tests de credito-model.js — corren en node (node credito-model.test.js) o en tests.html
(function (root) {
  const M = root.CreditoModel || require('./credito-model.js');
  const results = [];
  const eq = (name, got, want) => results.push({ name, ok: JSON.stringify(got) === JSON.stringify(want), got, want });
  const close = (name, got, want, eps = 1e-9) => results.push({ name, ok: Math.abs(got - want) < eps, got, want });

  // respaldo = límite × 1,25 → el límite es el 80% del respaldo (Jero, 21/09)
  eq('USDC: $1M de límite pide $1.250.000', M.respaldoArs(1000000, 'USDC'), 1250000);
  eq('BTC: $1M de límite pide $1.250.000', M.respaldoArs(1000000, 'BTC'), 1250000);
  eq('el límite es el 80% del respaldo', M.fmtPct(M.limitShare(M.ratioOf('USDC'))), '80%');
  eq('ratio override', M.respaldoArs(1000000, 'BTC', { BTC: 1.5 }), 1500000);
  eq('nombre del producto', M.PRODUCT.name, 'Lemon Credit Card');

  // unidades del activo
  close('USDC units $1M', M.respaldoUnits(1000000, 'USDC'), 862.07, 0.01);
  close('BTC units $1M', M.respaldoUnits(1000000, 'BTC'), 0.00833333, 1e-8);
  eq('ARS units enteras', M.respaldoUnits(500000, 'ARS'), 625000);

  // check con los saldos mock: $500k alcanza con los dos, $1M solo con USDC, $5M con ninguno
  eq('USDC $500k ok', M.check(500000, 'USDC').ok, true);
  eq('USDC $1M ok', M.check(1000000, 'USDC').ok, true);
  eq('USDC $5M no', M.check(5000000, 'USDC').ok, false);
  close('USDC $5M faltan 3.410,34', M.check(5000000, 'USDC').faltanteUnits, 3410.34, 0.01);
  eq('BTC $500k ok', M.check(500000, 'BTC').ok, true);
  eq('BTC $1M no', M.check(1000000, 'BTC').ok, false);
  eq('máximo prefijado USDC', M.maxAffordablePreset('USDC'), 1000000);
  eq('presets 500k / 1M / 5M', M.LIMIT_PRESETS, [500000, 1000000, 5000000]);
  // Jero, 29/09: entran los pesos, en el orden de la recomendación
  eq('respaldan los tres, dólar digital primero', M.RESPALDO_ASSETS, ['USDC', 'ARS', 'BTC']);
  eq('pesos y dólar digital rinden', [M.ASSETS.ARS.rinde, M.ASSETS.USDC.rinde], [true, true]);
  eq('Bitcoin no rinde: ahí la propuesta es el precio', !!M.ASSETS.BTC.rinde, false);
  eq('ARS $500k ok ($720.000 respalda hasta $576.000)', M.check(500000, 'ARS').ok, true);
  eq('ARS $1M no', M.check(1000000, 'ARS').ok, false);
  eq('máximo exacto ARS = $550.000', M.maxAffordableLimit('ARS'), 550000);

  // el respaldo rinde a la tasa de Earn (Jero, 29/09)
  eq('pesos ≈20% anual', M.ASSETS.ARS.tna, 0.20);
  eq('dólar digital ≈4,5% anual', M.ASSETS.USDC.tna, 0.045);
  eq('Bitcoin no lleva tasa', M.ASSETS.BTC.tna, undefined);

  // margen para subir el límite: el límite NO sube solo, se avisa desde el 10%
  const card = (limit, rU) => ({ limit, respaldoUnits: rU, asset: 'ARS', ratio: 1.25 });
  eq('sin margen, no se avisa', M.margenLimite(card(500000, 625000)).vale, false);
  eq('con el respaldo justo, el posible es el límite', M.margenLimite(card(500000, 625000)).posible, 500000);
  eq('9% de margen todavía no avisa', M.margenLimite(card(500000, 681250)).vale, false);
  eq('12% de margen sí avisa', M.margenLimite(card(500000, 700000)).vale, true);
  eq('y dice hasta cuánto podés subir', M.margenLimite(card(500000, 700000)).posible, 550000);
  eq('el umbral es 10%', M.MARGEN_AVISO, 0.10);
  eq('sin tarjeta no rompe', M.margenLimite(null).vale, false);

  // la tarjeta nueva no cobra mantenimiento (Jero, 29/09)
  eq('sin mantenimiento', M.FEES.mantenimiento, 0);
  eq('la de hoy cobra $6.500, que es la comparación', M.FEES.mantenimientoHoy, 6500);

  // retirar el respaldo: la cuenta y con qué se puede pagar
  const rp = (deuda, wallet) => M.retiroPlan({ respaldoUnits: 862.07, asset: 'USDC', deudaArs: deuda, walletArs: wallet });
  eq('sin deuda, vuelve entero', rp(0, 0).vuelveConWallet, 862.07);
  eq('sin deuda se puede de las dos formas', [rp(0, 0).conWallet, rp(0, 0).conRespaldo], [true, true]);
  eq('con saldo en wallet podés pagar de las dos formas', [rp(300000, 500000).conWallet, rp(300000, 500000).conRespaldo], [true, true]);
  close('pagando con el respaldo vuelve menos', rp(300000, 500000).vuelveConRespaldo, 862.07 - 206.9, 0.02);
  eq('sin saldo en wallet solo queda el respaldo', rp(300000, 0).conWallet, false);
  eq('deuda mayor que el respaldo: solo con la wallet', M.retiroPlan({ respaldoUnits: 100, asset: 'USDC', deudaArs: 300000, walletArs: 500000 }).conRespaldo, false);
  eq('y si tampoco hay wallet, no se puede', M.retiroPlan({ respaldoUnits: 100, asset: 'USDC', deudaArs: 300000, walletArs: 0 }).conWallet, false);
  eq('$500k alcanza (USDC primero)', M.affordableAsset(500000), 'USDC');
  eq('$1M alcanza solo con USDC', M.affordableAsset(1000000), 'USDC');
  eq('$5M no alcanza con nada', M.affordableAsset(5000000), null);
  eq('para $5M el más cercano es USDC', M.closestAsset(5000000), 'USDC');
  eq('máximo prefijado BTC', M.maxAffordablePreset('BTC'), 500000);
  eq('máximo exacto USDC = $1.000.000 (900 USDC → $1.044.000 → paso de $50.000)', M.maxAffordableLimit('USDC'), 1000000);

  // editar límite
  eq('subir pide más', M.limitChange(1000000, 2000000, 'USDC').direction, 'up');
  eq('subir delta $1.250.000', M.limitChange(1000000, 2000000, 'USDC').deltaArs, 1250000);
  eq('bajar libera', M.limitChange(1000000, 500000, 'USDC').deltaArs, -625000);

  // débito automático: dos modalidades, default el mínimo, sin elección de origen
  eq('autopay: mínimo · total pesos y dólares · total en pesos', M.AUTOPAY_MODES.map((m) => m.id), ['minimo', 'total', 'total_pesos']);
  eq('autopay default: mínimo', M.AUTOPAY_DEFAULT, { on: true, mode: 'minimo' });

  // tres números
  const t = M.tresNumeros({ limit: 1000000, consumido: 340000, saldoImpago: 512300, saldoResumen: 512300, deudaAnterior: 0 });
  eq('disponible = límite − consumido − resumen impago', t.disponible, 147700);
  eq('comprometido = consumido + impago', t.comprometido, 852300);
  eq('saldo = resumen + anterior', t.saldo, 512300);
  eq('saldoImpago con pago parcial', M.saldoImpago({ totalArs: 512300, deudaAnterior: 84000, pagado: 59630 }), 536670);
  eq('saldoImpago sin statement', M.saldoImpago(null), 0);

  // grupos de cierre desde el 18/09/2026
  const g1 = M.cycleDates(1), g4 = M.cycleDates(4);
  eq('g1 cierra 1/10', [g1.cierre.getDate(), g1.cierre.getMonth()], [1, 9]);
  eq('g1 vence martes 13/10 (11/10 domingo, 12/10 feriado)', [g1.vencimiento.getDate(), g1.vencimiento.getDay()], [13, 2]);
  eq('feriado detectado', M.isFeriado(new Date(2026, 9, 12)), true);
  eq('g4 cierra 22/9 (todavía no pasó)', [g4.cierre.getDate(), g4.cierre.getMonth()], [22, 8]);
  eq('g4 vence 2/10', [g4.vencimiento.getDate(), g4.vencimiento.getMonth()], [2, 9]);
  eq('congela = vto + 1', M.daysBetween(g4.vencimiento, g4.congela), 1);
  eq('liquida = vto + 7', M.daysBetween(g4.vencimiento, g4.liquida), 7);
  const p1 = M.previousCycleDates(1);
  eq('ciclo anterior g1 cerró 1/9', [p1.cierre.getDate(), p1.cierre.getMonth()], [1, 8]);

  // formateo
  eq('fmtArs', M.fmtArs(1000000), '$1.000.000');
  // el dólar digital se escribe US$ y Bitcoin con su unidad (Jero, 21/09)
  eq('fmtUnits USDC → US$', M.fmtUnits(379.31, 'USDC'), 'US$ 379,31');
  eq('fmtUnits BTC', M.fmtUnits(0.00433333, 'BTC'), '0,004333 BTC');
  // el límite sigue el valor del respaldo: 862,07 USDC a $1.450 → $1.000.000
  eq('limiteHoy USDC', M.limiteHoy(862.07, 'USDC'), 1000000);
  eq('limiteHoy: si el respaldo vale menos, el límite baja', M.limiteHoy(862.07, 'USDC', { USDC: 1160 }), 800000);
  eq('fmtPct', M.fmtPct(0.55), '55%');
  eq('fmtTna entero', M.fmtTna(0.20), '20%');
  eq('fmtTna con decimal: 4,5% no es 5%', M.fmtTna(0.045), '4,5%');
  eq('fmtDateDow', M.fmtDateDow(new Date(2026, 9, 26)), 'lunes 26 de octubre');

  const failed = results.filter((r) => !r.ok);
  const out = (typeof console !== 'undefined' && console.log) ? console.log.bind(console) : (typeof print === 'function' ? print : null);
  if (typeof window === 'undefined' && out) {
    results.forEach((r) => out(`${r.ok ? '✓' : '✗'} ${r.name}${r.ok ? '' : `  → got ${JSON.stringify(r.got)} want ${JSON.stringify(r.want)}`}`));
    out(`\n${results.length - failed.length}/${results.length} ok`);
    if (typeof process !== 'undefined' && process.exit) process.exit(failed.length ? 1 : 0);
  }
  root.__creditoTests = results;
})(typeof window !== 'undefined' ? window : globalThis);
