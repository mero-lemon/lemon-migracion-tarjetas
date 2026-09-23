// Lemon Credit Card — app raíz: estado, router, presets para la vista de
// mapa y el panel dev (saldos / cotizaciones / ratios / estado de la tarjeta).
// Todo el estado vive acá; las pantallas son funciones puras de (S, callbacks).
const { useState: useStateA, useEffect: useEffectA, useRef: useRefA, useMemo: useMemoA } = React;

const MODAL_EASE = 'cubic-bezier(0.32, 0.72, 0, 1)';
const qs = new URLSearchParams(location.search);
window.__CR_NOTAS = qs.get('notas') !== '0';

// ── Datos mock del período / resumen ────────────────────────────
// Las fechas se calculan relativas a "hoy" y al ciclo elegido, nunca son
// strings fijos: así los consumos del período siempre caen DESPUÉS del último
// cierre y los del resumen, antes. Los cuatro consumos en pesos del período
// suman $340.000 (el consumido default); si el panel dev lo cambia, la
// diferencia aparece como "Otros consumos".
const MOVS_PERIODO = [ // ago = días antes de hoy
{ kind: 'consumo', icon: 'food', title: 'Rappi', ago: 0, amount: '$23.900', sign: '−', v: 23900 },
{ kind: 'consumo', icon: 'shopping-cart', title: 'Coto Digital', ago: 1, amount: '$86.400', sign: '−', v: 86400 },
{ kind: 'consumo', icon: 'streaming', title: 'Netflix', ago: 1, amount: 'US$ 15,99', sign: '−', v: 0 },
{ kind: 'consumo', icon: 'car', title: 'YPF', ago: 2, amount: '$62.000', sign: '−', v: 62000 },
{ kind: 'consumo', icon: 'clothes', title: 'Zara', ago: 2, amount: '$167.700', sign: '−', v: 167700 }];
const MOVS_RESUMEN = [ // before = días antes del cierre del resumen
{ kind: 'consumo', icon: 'travel', title: 'Aerolíneas Argentinas', before: 3, amount: '$248.000', sign: '−' },
{ kind: 'consumo', icon: 'shopping-cart', title: 'Mercado Libre', before: 9, amount: '$129.900', sign: '−' },
{ kind: 'consumo', icon: 'streaming', title: 'Spotify', before: 13, amount: 'US$ 6,49', sign: '−' },
{ kind: 'consumo', icon: 'food', title: 'Carrefour', before: 17, amount: '$134.400', sign: '−' },
{ kind: 'consumo', icon: 'streaming', title: 'Netflix', before: 22, amount: 'US$ 15,99', sign: '−' }];
const dateLabel = (hoy, d) => { const k = M.daysBetween(d, hoy); return k === 0 ? 'Hoy' : k === 1 ? 'Ayer' : M.fmtDate(d); };
const periodMovs = (hoy, since, consumido) => {
  const movs = MOVS_PERIODO.filter((m) => M.addDays(hoy, -m.ago) > since).map((m) => ({ ...m, date: dateLabel(hoy, M.addDays(hoy, -m.ago)) }));
  const sum = movs.reduce((a, m) => a + m.v, 0);
  if (consumido > sum) movs.push({ kind: 'consumo', icon: 'shopping-cart', title: 'Otros consumos', date: dateLabel(hoy, M.addDays(hoy, -2)), amount: M.fmtArs(consumido - sum), sign: '−', v: consumido - sum });
  return movs;
};
const statementMovs = (cierre) => MOVS_RESUMEN.map((m) => ({ ...m, date: M.fmtDate(M.addDays(cierre, -m.before)) }));

const respaldoMov = (units, asset, sign, date = 'Hoy') => ({ kind: 'respaldo', icon: 'lock', coin: asset === 'BTC' ? 'btc' : undefined, title: sign === '−' ? 'Respaldo de tarjeta' : 'Respaldo liberado', date, amount: M.fmtUnits(units, asset), sign });

// ── Estado base ─────────────────────────────────────────────────
const baseState = () => ({
  hoy: M.HOY,
  order: { asset: null, limit: null },
  // cierre y débito se eligen ANTES de crear la tarjeta (Jero, 21/09):
  // son parte del alta, no de una activación posterior.
  draftCierre: null, draftAutopay: { ...M.AUTOPAY_DEFAULT },
  card: null,
  period: { consumidoArs: 0, consumidoUsd: 0, movs: [] },
  statement: null,
  sheet: null // 'pagar-total' | 'pagar-minimo' | 'prepaga'
});

// tarjeta activa "con historia": límite $1M respaldado en dólar digital,
// cierre en la 3ª semana (cerró el 15/9, vence el 25/9), consumos en curso.
// El ratio con el que se constituyó el respaldo queda guardado en la card:
// si el panel dev cambia el % después, la tarjeta sigue diciendo el suyo.
const withActiveCard = (s, { status = 'activa', cierre = 3, asset = 'USDC', limit = 1000000, consumido = 340000, hoy, pagado = false } = {}) => {
  const ratio = M.ratioOf(asset);
  const rU = M.respaldoUnits(limit, asset, M.PRICES_DEFAULT);
  const H = hoy || s.hoy;
  const prev = M.previousCycleDates(cierre, H);
  const st = {
    // el resumen se nombra por el mes que cubre (cierre el 1 → el mes anterior)
    periodo: M.MESES[M.addDays(prev.cierre, -1).getMonth()], cierre: prev.cierre, vencimiento: prev.vencimiento, congela: prev.congela, liquida: prev.liquida,
    consumosArs: 512300, consumosUsd: 22.48, tcBna: 1420, totalArs: 512300, minimo: 51230, deudaAnterior: 0, pagado: 0, movs: statementMovs(prev.cierre)
  };
  if (status === 'congelada') { st.deudaAnterior = 84000; st.totalArs = 512300; st.minimo = 59630; }
  if (pagado) { st.pagado = st.totalArs + st.deudaAnterior; st.pagadoEl = M.addDays(prev.vencimiento, -1); }
  return {
    ...s, hoy: H,
    card: { status, asset, limit, ratio, respaldoUnits: rU, mask: '4324', nfc: true, fisica: 'entregada', cierre, autopay: { on: status !== 'congelada', mode: 'minimo' }, desde: '25 de mayo' },
    period: { consumidoArs: consumido, consumidoUsd: 15.99, movs: [...periodMovs(H, prev.cierre, consumido), respaldoMov(rU, asset, '−', '25 de mayo')] },
    statement: st
  };
};

// ── Presets: cada pantalla del mapa arranca acá ─────────────────
// La tarjeta recién creada: existe, con respaldo dejado y plástico en viaje,
// pero sin cierre ni débito hasta que el usuario la activa.
const justCreated = ({ status = 'camino', nfc = false, cierre = null, autopay = null } = {}) => {
  const s = baseState();
  const rU = M.respaldoUnits(1000000, 'USDC');
  return { ...s,
    order: { asset: 'USDC', limit: 1000000 },
    card: { status, asset: 'USDC', limit: 1000000, ratio: M.ratioOf('USDC'), respaldoUnits: rU, mask: '4324', nfc, fisica: 'camino', cierre, autopay, desde: 'Hoy' },
    period: { consumidoArs: 0, consumidoUsd: 0, movs: [respaldoMov(rU, 'USDC', '−')] } };
};
const activada = (nfc) => justCreated({ status: 'activa', nfc, cierre: 3, autopay: { ...M.AUTOPAY_DEFAULT } });
const PRESETS = [
{ group: 'Flujo 1 · Alta', id: 'home-vacia', name: 'Tarjetas sin crédito', route: 'home', make: baseState },
{ group: 'Flujo 1 · Alta', id: 'limit', name: '1 · Elegí el límite', route: 'limit', make: () => ({ ...baseState(), order: { asset: null, limit: 1000000 } }) },
{ group: 'Flujo 1 · Alta', id: 'respaldo-pick', name: '2 · Elegí tu respaldo', route: 'respaldo-pick', make: () => ({ ...baseState(), order: { asset: 'USDC', limit: 1000000 } }) },
{ group: 'Flujo 1 · Alta', id: 'summary', name: '3 · Tu Lemon Credit Card', route: 'summary', make: () => ({ ...baseState(), order: { asset: 'USDC', limit: 1000000 } }) },
{ group: 'Flujo 1 · Alta', id: 'home-camino', name: '4 · La home, ya con tarjeta', route: 'home', make: () => justCreated() },
{ group: 'Flujo 1 · Alta', id: 'confirm', name: 'Alt · Ya es tuya (suelta)', route: 'confirm', make: () => justCreated() },
{ group: 'Flujo 2 · Activación', id: 'cierre', name: '1 · Cuándo cierra', route: 'cierre', make: () => ({ ...justCreated(), draftCierre: 3, draftAutopay: { ...M.AUTOPAY_DEFAULT } }) },
{ group: 'Flujo 2 · Activación', id: 'autopay-cuanto', name: '2 · Débito automático', route: 'autopay-cuanto', make: () => ({ ...justCreated(), draftCierre: 3, draftAutopay: { ...M.AUTOPAY_DEFAULT } }) },
{ group: 'Flujo 2 · Activación', id: 'wallet', name: '3 · Pagá con el celu', route: 'wallet', make: () => activada(false) },
{ group: 'Flujo 2 · Activación', id: 'activated', name: '4 · Ya podés pagar', route: 'activated', make: () => activada(true) },
{ group: 'Flujo 3 · Landing', id: 'home-nueva', name: 'Activa · sin celu', route: 'home', make: () => activada(false) },
{ group: 'Flujo 3 · Landing', id: 'home-activa', name: 'Activa · resumen a pagar', route: 'home', make: () => withActiveCard(baseState()) },
{ group: 'Flujo 3 · Landing', id: 'home-pausada', name: 'Pausada · límite visible', route: 'home', make: () => withActiveCard(baseState(), { status: 'pausada' }) },
{ group: 'Flujo 3 · Landing', id: 'home-congelada', name: 'Congelada · aviso in-app', route: 'home', make: () => withActiveCard(baseState(), { status: 'congelada', cierre: 1, hoy: new Date(2026, 8, 14) }) },
{ group: 'Flujo 3 · Landing', id: 'limite', name: 'Límite y respaldo', route: 'limite', make: () => withActiveCard(baseState()) },
{ group: 'Flujo 3 · Landing', id: 'statement', name: 'Resumen (con deuda anterior)', route: 'statement', make: () => withActiveCard(baseState(), { status: 'congelada', cierre: 1, hoy: new Date(2026, 8, 14) }) },
{ group: 'Flujo 3 · Landing', id: 'pay', name: 'Pagar el resumen', route: 'home', make: () => ({ ...withActiveCard(baseState()), sheet: 'pagar-total' }) },
{ group: 'Flujo 4 · Editar límite', id: 'edit-limit', name: 'Editar el límite', route: 'edit-limit', make: () => withActiveCard(baseState()) },
{ group: 'Flujo 4 · Editar límite', id: 'edit-limit-low', name: 'Bajar por debajo de lo usado', route: 'edit-limit', make: () => withActiveCard(baseState(), { consumido: 640000, pagado: true }) }];
const presetById = (id) => PRESETS.find((p) => p.id === id) || PRESETS[0];

// ── La app adentro del teléfono ─────────────────────────────────
// `dev` = { balances, prices, ratios } vive afuera (persiste entre presets).
// `apiRef` expone patch() para que el panel dev toque la tarjeta.

function CreditoApp({ preset, dev, setDev, apiRef, inert, onRoute }) {
  const [S, setS] = useStateA(() => preset.make());
  const [route, setRoute] = useStateA(preset.route);
  const [mounted, setMounted] = useStateA(preset.route !== 'home');
  const [shown, setShown] = useStateA(preset.route !== 'home');
  const closing = useRefA(null); // timeout del cierre del overlay: se cancela si se abre otra pantalla en el medio
  const patch = (fn) => setS((s) => ({ ...s, ...(typeof fn === 'function' ? fn(s) : fn) }));
  if (apiRef) apiRef.current = { patch, setRoute, S, route };
  // la nota de UX de al lado sigue a la pantalla (y al estado de la tarjeta)
  const cardStatus = S.card ? S.card.status : null;
  useEffectA(() => { if (onRoute) onRoute(route, S.card); }, [route, cardStatus]);

  // estado completo que ven las pantallas: lo de adentro + lo del panel dev
  const SS = { ...S, ...dev };

  // overlay iOS: la home escala hacia atrás cuando hay una pantalla arriba
  const go = (r) => {
    clearTimeout(closing.current);
    if (r === 'home') { setShown(false); closing.current = setTimeout(() => { setMounted(false); setRoute('home'); }, 560); }
    else if (!mounted || !shown) { setRoute(r); setMounted(true); setTimeout(() => setShown(true), 30); } // setTimeout, no rAF: en documentos ocultos rAF se suspende (gotcha visto en gastos/)
    else setRoute(r);
  };
  const adjBalance = (asset, delta) => setDev((d) => ({ ...d, balances: { ...d.balances, [asset]: M.roundTo(d.balances[asset] + delta, M.ASSETS[asset].decimals) } }));

  // ── acciones de negocio ──
  // La tarjeta se crea apenas queda elegido el respaldo (Jero, 21/09): existe
  // de verdad, con su límite y su respaldo, y el plástico ya viaja. Lo que
  // falta es el ritmo del resumen, y eso se pregunta al activarla.
  const placeOrder = () => {
    const { asset, limit } = S.order;
    const rU = M.respaldoUnits(limit, asset, dev.prices, dev.ratios);
    adjBalance(asset, -rU);
    patch((s) => ({
      card: { status: 'camino', asset, limit, ratio: M.ratioOf(asset, dev.ratios), respaldoUnits: rU, mask: '4324', nfc: false, fisica: 'camino', cierre: null, autopay: null, desde: 'Hoy' },
      period: { ...s.period, movs: [respaldoMov(rU, asset, '−'), ...s.period.movs] } }));
    // directo a la home (Jero, 21/09): ahí están los dos contenedores —usarla
    // ya y seguir el envío—, que es lo que el usuario necesita decidir ahora.
    go('home');
  };
  // Activar = elegir cuándo cierra y cuánto se paga solo, y terminar en el celu
  const startActivate = (via) => { patch({ activateVia: via, draftCierre: null, draftAutopay: { ...M.AUTOPAY_DEFAULT } }); go('cierre'); };
  // skip = «Prefiero pagarlo yo cada mes»: la tarjeta queda activa sin débito
  const finishActivate = (skip) => {
    patch((s) => ({ card: { ...s.card, status: 'activa', cierre: s.draftCierre, autopay: skip ? { on: false, mode: 'minimo' } : (s.draftAutopay || { ...M.AUTOPAY_DEFAULT }) } }));
    go('wallet');
  };
  const gotPlastico = () => patch((s) => ({ card: { ...s.card, fisica: 'entregada' } }));
  const addWallet = () => { patch((s) => ({ card: { ...s.card, nfc: true } })); go('activated'); };
  const togglePause = () => patch((s) => ({ card: { ...s.card, status: s.card.status === 'activa' ? 'pausada' : 'activa' } }));
  const pay = (amount) => {
    adjBalance('ARS', -amount);
    patch((s) => {
      const st = { ...s.statement, pagado: s.statement.pagado + amount };
      const saldo = st.totalArs + st.deudaAnterior - st.pagado;
      if (saldo <= 0) st.pagadoEl = s.hoy;
      const card = { ...s.card };
      // pagar el mínimo descongela (hoy solo lo revierte Lemon: decisión de producto de este prototipo)
      if (card.status === 'congelada' && st.pagado >= st.minimo) card.status = 'activa';
      return { statement: st, card, sheet: null, period: { ...s.period, movs: [{ kind: 'pago', icon: 'deposit', title: 'Pago del resumen', date: 'Hoy', amount: M.fmtArs(amount), sign: '+' }, ...s.period.movs] } };
    });
  };
  const applyLimit = (newLimit) => {
    // el delta se calcula contra el respaldo REAL de la tarjeta (no contra un recálculo del límite viejo)
    const c = S.card;
    const toU = M.respaldoUnits(newLimit, c.asset, dev.prices, dev.ratios);
    const deltaUnits = M.roundTo(toU - c.respaldoUnits, M.ASSETS[c.asset].decimals);
    adjBalance(c.asset, -deltaUnits);
    patch((s) => ({ card: { ...s.card, limit: newLimit, ratio: M.ratioOf(c.asset, dev.ratios), respaldoUnits: toU }, period: { ...s.period, movs: [respaldoMov(Math.abs(deltaUnits), c.asset, deltaUnits > 0 ? '−' : '+'), ...s.period.movs] } }));
    go('limite'); // se editó desde «Límite y respaldo»: volvemos ahí a ver el medidor nuevo
  };
  const retiro = () => { patch((s) => ({ card: { ...s.card, status: 'retiro' }, openRetiro: false })); go('home'); };

  const setOrder = (p) => patch((s) => ({ order: { ...s.order, ...p } }));

  // ── pantallas ──
  let over = null;
  if (route === 'limit') over = <LimitPicker S={SS} mode="create" value={S.order.limit} onChange={(limit) => setOrder({ limit })} onBack={() => go('home')} onContinue={() => go('respaldo-pick')} onAddFunds={adjBalance} />;
  else if (route === 'respaldo-pick') over = <RespaldoPicker S={SS} limit={S.order.limit} value={S.order.asset} onChange={(asset) => setOrder({ asset })} onBack={() => go('limit')} onContinue={() => go('summary')} onAddFunds={adjBalance} />;
  else if (route === 'summary') over = <OrderSummary S={SS} onBack={() => go('respaldo-pick')} onContinue={placeOrder} />;
  else if (route === 'confirm') over = <OrderConfirm S={SS} onHome={() => go('home')} onActivateNow={() => startActivate('nfc')} />;
  else if (route === 'cierre') over = <CierrePicker S={SS} value={S.draftCierre} onChange={(v) => patch({ draftCierre: v })} onBack={() => go('home')} onContinue={() => go('autopay-cuanto')} />;
  else if (route === 'autopay-cuanto') over = <AutopayCuanto S={SS} value={S.draftAutopay} onChange={(v) => patch({ draftAutopay: v })} onBack={() => go('cierre')} onSkip={() => finishActivate(true)} onContinue={() => finishActivate(false)} />;
  else if (route === 'wallet') over = <WalletScreen S={SS} onBack={() => go('home')} onAdd={addWallet} onSkip={() => go('activated')} />;
  else if (route === 'activated') over = <ActivatedScreen S={SS} onGo={() => go('home')} />;
  else if (route === 'edit-limit') over = <LimitPicker S={SS} mode="edit" asset={S.card.asset} value={S.card.limit} onBack={() => go('limite')} onConfirm={applyLimit} onAddFunds={adjBalance} />;
  else if (route === 'statement') over = <StatementScreen S={SS} onBack={() => go('home')} onPagar={(k) => patch({ sheet: 'pagar-' + k })} />;
  else if (route === 'limite') over = <LimiteRespaldoScreen S={SS} openRetiro={!!S.openRetiro} onBack={() => go('home')} onRetiro={retiro} onEditLimit={() => go('edit-limit')} />;
  else if (route === 'consumos') over = <ConsumosScreen S={SS} onBack={() => go('home')} />;

  const home =
  <TarjetasHome S={SS}
    onPedir={() => go('limit')}
    onLimite={() => { patch({ openRetiro: false }); go('limite'); }} onVerResumen={() => go('statement')} onPagar={(k) => patch({ sheet: 'pagar-' + k })}
    onConsumos={() => go('consumos')} onTogglePause={togglePause}
    onSimDelivery={gotPlastico} onActivate={(via) => (S.card && S.card.status === 'camino' ? startActivate(via) : go('wallet'))} onRetiro={() => { patch({ openRetiro: true }); go('limite'); }} onTab={() => patch({ sheet: 'prepaga' })} />;

  return (
    <div style={{ height: '100%', position: 'relative', overflow: 'hidden', background: '#0a0a0a', pointerEvents: inert ? 'none' : 'auto' }}>
      <div style={{ height: '100%', transform: shown ? 'scale(0.94) translateY(10px)' : 'none', borderRadius: shown ? 40 : 0, filter: shown ? 'brightness(0.72)' : 'none', overflow: 'hidden', transition: `transform .58s ${MODAL_EASE}, border-radius .58s ${MODAL_EASE}, filter .58s ${MODAL_EASE}` }}>
        {home}
      </div>
      {mounted &&
      <div style={{ position: 'absolute', inset: 0, zIndex: 10, overflow: 'hidden', background: CR.page, transform: shown ? 'none' : 'translateY(104%)', borderRadius: shown ? 0 : '34px 34px 0 0', transition: `transform .58s ${MODAL_EASE}, border-radius .58s ${MODAL_EASE}` }}>
          <div key={route} style={{ height: '100%', animation: `screenIn .35s ${EASE}` }}>{over}</div>
        </div>}
      {/* sheets globales */}
      <Sheet open={!!S.sheet && S.sheet.startsWith('pagar')} onClose={() => patch({ sheet: null })}>
        {S.sheet && S.sheet.startsWith('pagar') && S.statement && <PagarSheet S={SS} initial={S.sheet.split('-')[1]} onClose={() => patch({ sheet: null })} onPay={pay} onAddFunds={adjBalance} />}
      </Sheet>
      <Sheet open={S.sheet === 'prepaga'} onClose={() => patch({ sheet: null })}>
        {S.sheet === 'prepaga' &&
        <div style={{ padding: '6px 2px 2px' }}>
          <div style={{ font: '500 20px Geist', letterSpacing: '-0.01em', color: CR.ink }}>Tu Lemon Card pre-paga</div>
          <div style={{ font: '400 13px Inter', color: CR.ink2, marginTop: 6, lineHeight: 1.5 }}>Sigue igual que hoy. Este prototipo solo cubre la pestaña Crédito; la pre-paga y su migración viven en el prototipo de tarjetas (<code>/cards/</code>).</div>
          <div style={{ marginTop: 14 }}><Btn variant="light" onClick={() => patch({ sheet: null })}>Volver a Crédito</Btn></div>
        </div>}
      </Sheet>
    </div>);
}

// ── Notas de UX: dos tarjetas dadas vuelta, que se giran al hacer clic ─
// Material de pitch, no parte de la app: primero se muestra la pantalla, se
// da vuelta NARRATIVA (qué le contamos al usuario) y, si hay que respaldarlo,
// CONTEXTO (la data que ya aprendimos). El contenido vive en credito-notas.js.
const noteKey = (route, card) => {
  if (route !== 'home') return route;
  if (!card) return 'home-vacia';
  return { camino: 'home-camino', pausada: 'home-pausada', congelada: 'home-congelada' }[card.status] || 'home-activa';
};
const NOTE_TONE = {
  narrativa: { label: 'Narrativa', hint: 'Qué le queremos contar al usuario', bg: '#141414', fg: '#fff', dim: 'rgba(255,255,255,0.62)', accent: 'var(--c-lime-40)' },
  contexto: { label: 'Contexto', hint: 'La data que respalda la propuesta', bg: '#2C3A47', fg: '#fff', dim: 'rgba(255,255,255,0.6)', accent: '#E0925A' }
};

// Una tarjeta con dos caras: el dorso (cerrada) y el contenido (abierta).
// Las dos caras ocupan la misma celda de grilla, así la altura no salta.
const CLOSED_H = 138; // alto del dorso: al girar, la tarjeta crece hasta su contenido
const NOTE_INK = '#1c1c1a', NOTE_INK2 = '#4a4a46', NOTE_INK3 = '#8a8985', NOTE_HAIR = '#ECEBE6';

const NoteLi = ({ children, color }) =>
<li style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
    <span style={{ width: 5, height: 5, borderRadius: 999, background: color, flexShrink: 0, marginTop: 8 }} />
    <span style={{ font: '400 13.5px Inter', lineHeight: 1.55, color: NOTE_INK2 }}>{children}</span>
  </li>;
const NoteUl = ({ children, gap = 9 }) =>
<ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap }}>{children}</ul>;
const NoteLabel = ({ color, children }) =>
<div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
    <span style={{ width: 6, height: 6, borderRadius: 999, background: color }} />
    <span style={{ font: '600 10.5px Inter', letterSpacing: '0.12em', textTransform: 'uppercase', color: NOTE_INK3 }}>{children}</span>
  </div>;

// Una tarjeta con dos caras: el dorso (cerrada) y el contenido (abierta).
// Las dos caras se superponen; la altura la fija el contenido, medido al montar.
function FlipCard({ tone, note }) {
  const t = NOTE_TONE[tone];
  const [open, setOpen] = useStateA(false);
  const back = useRefA(null);
  const [h, setH] = useStateA(CLOSED_H);
  // El alto sale de medir la cara de atrás. Se vuelve a medir al abrir, cuando
  // terminan de cargar las tipografías y si el bloque cambia de tamaño: medir
  // una sola vez al montar cortaba el texto (y, al estar oculto, no scrolleaba).
  const measure = () => { if (back.current) setH(Math.max(CLOSED_H, back.current.scrollHeight)); };
  useEffectA(() => {
    measure();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    if (ro && back.current) ro.observe(back.current.firstChild ? back.current : back.current);
    const t2 = setTimeout(measure, 350);
    return () => { if (ro) ro.disconnect(); clearTimeout(t2); };
  }, [note]);
  const face = { position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', borderRadius: 16, overflow: 'hidden' };
  return (
    <div onClick={() => { measure(); setOpen((v) => !v); }} style={{ perspective: 1400, cursor: 'pointer' }} role="button" aria-pressed={open}>
      <div style={{ position: 'relative', height: open ? h : CLOSED_H, transformStyle: 'preserve-3d', transition: 'transform .6s cubic-bezier(0.22, 1, 0.36, 1), height .6s cubic-bezier(0.22, 1, 0.36, 1)', transform: open ? 'rotateY(180deg)' : 'none' }}>
        {/* dorso */}
        <div style={{ ...face, background: t.bg, color: t.fg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 9, padding: '20px', textAlign: 'center' }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: t.accent }} />
          <div style={{ font: '600 17px Inter', letterSpacing: '-0.01em' }}>{t.label}</div>
          <div style={{ font: '400 12.5px Inter', color: t.dim, lineHeight: 1.45, maxWidth: 210 }}>{t.hint}</div>
        </div>
        {/* contenido */}
        <div ref={back} style={{ ...face, transform: 'rotateY(180deg)', background: '#fff', border: '1px solid #E3E2DD', padding: '20px 20px 22px', overflowY: open ? 'auto' : 'hidden' }}>
          <NoteLabel color={t.accent}>{t.label}</NoteLabel>
          {tone === 'narrativa' ? <NarrativaBody note={note} accent={t.accent} /> : <ContextoBody items={note.contexto} accent={t.accent} />}
        </div>
      </div>
    </div>);
}

// Narrativa: la idea en una frase y lo que se le suma. Nada de «cómo lo
// resolvimos» (Jero, 23/09): la experiencia tiene que explicarse sola, y el
// cómo es lo que el equipo de diseño tiene que poder proponer.
const NarrativaBody = ({ note, accent }) =>
<>
    <div style={{ font: '500 15.5px Inter', lineHeight: 1.45, letterSpacing: '-0.012em', color: NOTE_INK, margin: '13px 0 0', paddingLeft: 12, borderLeft: `2px solid ${accent}`, textWrap: 'pretty' }}>{note.lead}</div>
    {note.parrafo &&
    <p style={{ font: '400 13.5px Inter', lineHeight: 1.65, color: NOTE_INK2, margin: '14px 0 0', textWrap: 'pretty' }}>{note.parrafo}</p>}
    {note.narrativa && note.narrativa.length > 0 &&
    <div style={{ marginTop: 14 }}><NoteUl gap={10}>{note.narrativa.map((p, i) => <NoteLi key={i} color={accent}>{p}</NoteLi>)}</NoteUl></div>}
  </>;

// Contexto: el número a la izquierda, alineado; el hecho al lado.
const ContextoBody = ({ items, accent }) =>
<div style={{ marginTop: 14, display: 'flex', flexDirection: 'column' }}>
    {(items || []).map((it, i) => {
      const item = typeof it === 'string' ? { t: it } : it;
      return (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: item.n ? 'minmax(58px, auto) 1fr' : '1fr', gap: 12, alignItems: 'baseline', padding: '9px 0', borderTop: i === 0 ? 'none' : `1px solid ${NOTE_HAIR}` }}>
          {item.n &&
          <b style={{ font: '600 13.5px Inter', letterSpacing: '-0.015em', color: accent, textAlign: 'right', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{item.n}</b>}
          <span>
            <span style={{ display: 'block', font: '400 13px Inter', lineHeight: 1.55, color: NOTE_INK2, textWrap: 'pretty' }}>{item.t}</span>
            {item.f && <span style={{ display: 'block', font: '500 9.5px Inter', letterSpacing: '0.07em', textTransform: 'uppercase', color: '#B4B3AE', marginTop: 5 }}>{item.f}</span>}
          </span>
        </div>);
    })}
  </div>;

function UxNote({ k }) {
  const n = (window.CreditoNotas || {})[k];
  if (!n) return null;
  return (
    <aside style={{ width: 340, flexShrink: 0, alignSelf: 'flex-start', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <FlipCard key={k + ':n'} tone="narrativa" note={n} />
      {n.contexto && n.contexto.length > 0 && <FlipCard key={k + ':c'} tone="contexto" note={n} />}
    </aside>);
}

// ── Vista de mapa: todas las pantallas, vivas, en grilla ─────────
function MapView({ dev, onJump }) {
  const groups = [...new Set(PRESETS.map((p) => p.group))];
  return (
    <div style={{ padding: '18px 24px 40px', display: 'flex', flexDirection: 'column', gap: 26 }}>
      {groups.map((g) =>
      <div key={g}>
          <div style={{ font: '600 13px Inter', color: '#2a2a28', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--c-lime-40)' }} />{g}</div>
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
            {PRESETS.filter((p) => p.group === g).map((p) =>
          <div key={p.id} role="button" tabIndex={0} onClick={() => onJump(p.id)} onKeyDown={(e) => { if (e.key === 'Enter') onJump(p.id); }} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 10px 24px rgba(0,0,0,0.12)', transition: 'transform .2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
                  <PhoneCr scale={0.3}><CreditoApp key={p.id} preset={p} dev={dev} setDev={() => {}} inert /></PhoneCr>
                </div>
                <div style={{ font: '500 12px Inter', color: '#2a2a28', maxWidth: 120, lineHeight: 1.3 }}>{p.name}</div>
              </div>)}
          </div>
        </div>)}
    </div>);
}

// ── Panel dev: saldos, cotizaciones, ratios, estado de la tarjeta ─
const NumField = ({ label, value, onChange, step = 1, suffix }) =>
<label style={{ display: 'flex', alignItems: 'center', gap: 8, font: '500 12px Inter', color: '#2a2a28' }}>
    <span style={{ flex: 1 }}>{label}</span>
    <input type="number" value={value} step={step} onChange={(e) => onChange(+e.target.value)} style={{ width: 120, border: '1px solid #D0CFCA', borderRadius: 8, padding: '5px 8px', font: '500 12px Geist', textAlign: 'right' }} />
    {suffix && <span style={{ color: '#8a8985', width: 34 }}>{suffix}</span>}
  </label>;

function DevPanel({ dev, setDev, apiRef, onClose }) {
  const [, force] = useStateA(0);
  useEffectA(() => { const t = setInterval(() => force((x) => x + 1), 400); return () => clearInterval(t); }, []);
  const api = apiRef.current;
  const S = api && api.S;
  const setB = (k, v) => setDev((d) => ({ ...d, balances: { ...d.balances, [k]: v } }));
  const setP = (k, v) => setDev((d) => ({ ...d, prices: { ...d.prices, [k]: v } }));
  const setR = (k, v) => setDev((d) => ({ ...d, ratios: { ...d.ratios, [k]: v } }));
  const H = { font: '600 11px Inter', letterSpacing: '0.06em', color: '#8a8985', margin: '14px 0 8px' };
  return (
    <div style={{ width: 300, background: '#F6F6F4', borderLeft: '1px solid #D6D5D0', padding: '14px 18px 24px', overflowY: 'auto', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ font: '600 13px Inter', color: '#2a2a28', flex: 1 }}>Panel dev</span><button onClick={onClose} style={{ border: 0, background: 'transparent', cursor: 'pointer' }}><LI name="close" size={16} color="#2a2a28" /></button></div>
      <div style={{ font: '400 11px Inter', color: '#8a8985', marginTop: 4, lineHeight: 1.4 }}>Hoy es el {S ? `${S.hoy.getDate()}/${S.hoy.getMonth() + 1}/2026` : '18/9/2026'}. Todo lo de acá se refleja en vivo en el teléfono.</div>

      <div style={H}>SALDOS DEL USUARIO</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <NumField label="Pesos" value={dev.balances.ARS} step={10000} onChange={(v) => setB('ARS', v)} suffix="ARS" />
        <NumField label="Dólar digital" value={dev.balances.USDC} step={10} onChange={(v) => setB('USDC', v)} suffix="USDC" />
        <NumField label="Bitcoin" value={dev.balances.BTC} step={0.0005} onChange={(v) => setB('BTC', v)} suffix="BTC" />
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
        <StripBtn onClick={() => setDev((d) => ({ ...d, balances: { ARS: 150000, USDC: 40, BTC: 0.0004 } }))}>No le alcanza nada</StripBtn>
        <StripBtn onClick={() => setDev((d) => ({ ...d, balances: { ARS: 3200000, USDC: 4800, BTC: 0.05 } }))}>Le sobra ($5M)</StripBtn>
        <StripBtn onClick={() => setDev((d) => ({ ...d, balances: { ...M.BALANCES_DEFAULT } }))}>Default</StripBtn>
      </div>

      <div style={H}>COTIZACIONES</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <NumField label="1 USDC" value={dev.prices.USDC} step={10} onChange={(v) => setP('USDC', v)} suffix="ARS" />
        <NumField label="1 BTC" value={dev.prices.BTC} step={1000000} onChange={(v) => setP('BTC', v)} suffix="ARS" />
      </div>

      <div style={H}>RESPALDO EXIGIDO (% DEL LÍMITE · 125% = el límite es el 80% del respaldo)</div>
      {M.RESPALDO_ASSETS.map((id) =>
      <label key={id} style={{ display: 'flex', alignItems: 'center', gap: 8, font: '500 12px Inter', color: '#2a2a28', marginBottom: 6 }}>
          <span style={{ width: 84 }}>{M.ASSETS[id].name}</span>
          <input type="range" min={0.2} max={1.6} step={0.05} value={dev.ratios[id]} onChange={(e) => setR(id, +e.target.value)} style={{ flex: 1, accentColor: '#141414' }} />
          <span style={{ width: 40, textAlign: 'right', font: '500 12px Geist' }}>{M.fmtPct(dev.ratios[id])}</span>
        </label>)}
      <div style={{ font: '400 10px Inter', color: '#8a8985', lineHeight: 1.4 }}>Regla vigente (Jero, 21/09): el límite es aprox. el 80% del respaldo → 125%, igual para los dos activos. Si Bitcoin pide más colchón, movelo acá: todo se recalcula solo.</div>

      {S && S.card && S.card.status !== 'camino' &&
      <>
        <div style={H}>ESTADO DE LA TARJETA</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['activa', 'pausada', 'congelada'].map((st) => <StripBtn key={st} active={S.card.status === st} onClick={() => api.patch((s) => ({ card: { ...s.card, status: st } }))}>{st}</StripBtn>)}
        </div>
        <div style={H}>USADO ESTE PERÍODO</div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, font: '500 12px Inter' }}>
          <input type="range" min={0} max={Math.max(0, S.card.limit - M.saldoImpago(S.statement))} step={10000} value={S.period.consumidoArs} onChange={(e) => api.patch((s) => ({ period: { ...s.period, consumidoArs: +e.target.value, movs: [...periodMovs(s.hoy, M.previousCycleDates(s.card.cierre, s.hoy).cierre, +e.target.value), ...s.period.movs.filter((m) => m.kind !== 'consumo')] } }))} style={{ flex: 1, accentColor: '#141414' }} />
          <span style={{ width: 80, textAlign: 'right', font: '500 12px Geist' }}>{M.fmtArs(S.period.consumidoArs)}</span>
        </label>
        {S.statement &&
        <>
          <div style={H}>RESUMEN</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <StripBtn active={S.statement.pagado === 0} onClick={() => api.patch((s) => ({ statement: { ...s.statement, pagado: 0, pagadoEl: null } }))}>Sin pagar</StripBtn>
            <StripBtn active={S.statement.pagado > 0 && S.statement.pagado < S.statement.totalArs + S.statement.deudaAnterior} onClick={() => api.patch((s) => ({ statement: { ...s.statement, pagado: s.statement.minimo } }))}>Pagó el mínimo</StripBtn>
            <StripBtn active={S.statement.pagado >= S.statement.totalArs + S.statement.deudaAnterior} onClick={() => api.patch((s) => ({ statement: { ...s.statement, pagado: s.statement.totalArs + s.statement.deudaAnterior, pagadoEl: s.hoy } }))}>Pagado</StripBtn>
          </div>
        </>}
      </>}

      <div style={H}>NOTAS "A CONFIRMAR"</div>
      <StripBtn active={window.__CR_NOTAS} onClick={() => { window.__CR_NOTAS = !window.__CR_NOTAS; force((x) => x + 1); api && api.patch({}); }}>{window.__CR_NOTAS ? 'Visibles' : 'Ocultas'}</StripBtn>
      <div style={{ font: '400 10px Inter', color: '#8a8985', marginTop: 12, lineHeight: 1.4 }}>Por URL: <code>?p=home-congelada</code> abre en una pantalla · <code>?mapa=1</code> abre el mapa · <code>?notas=0</code> oculta las notas.</div>
    </div>);
}

// ── Stage: control strip + teléfono (o mapa) + panel dev ─────────
function CreditoStage() {
  const scale = useStageScale(132);
  const [presetId, setPresetId] = useStateA(qs.get('p') || 'home-vacia');
  const [rk, setRk] = useStateA(0);
  const [mapa, setMapa] = useStateA(qs.get('mapa') === '1');
  const ux = qs.get('ux') !== '0';                           // notas al lado del teléfono (?ux=0 las apaga)
  const [uxKey, setUxKey] = useStateA('home-vacia');
  const [dev, setDev] = useStateA({ balances: { ...M.BALANCES_DEFAULT }, prices: { ...M.PRICES_DEFAULT }, ratios: { ARS: M.ASSETS.ARS.ratio, USDC: M.ASSETS.USDC.ratio, BTC: M.ASSETS.BTC.ratio } });
  const apiRef = useRefA(null);
  const preset = presetById(presetId);
  const jump = (id) => { setPresetId(id); setRk((k) => k + 1); setMapa(false); };
  const mobile = typeof window !== 'undefined' && window.innerWidth < 560;

  if (mobile) return <div style={{ height: '100vh', background: '#000' }}><CreditoApp key={presetId + rk} preset={preset} dev={dev} setDev={setDev} apiRef={apiRef} /></div>;

  return (
    <div style={{ minHeight: '100vh', background: '#E6E5E1', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderBottom: '1px solid #D6D5D0', background: '#EFEEEA', flexWrap: 'wrap' }}>
        <span style={{ width: 26, height: 26, borderRadius: 999, background: LX.dark, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Leaf size={15} color="var(--c-lime-40)" vein="rgba(0,0,0,0.3)" /></span>
        <div style={{ font: '600 13px Inter', color: '#2a2a28' }}>Nueva Lemon Credit Card</div>
        {/* Barra de presentación: solo lo que se usa al pitchear. El selector de
            pantallas y el panel dev salieron (Jero, 21/09): se navega por el mapa. */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {!mapa && <div style={{ font: '500 12px Inter', color: '#8a8985', marginRight: 2 }}>{preset.name}</div>}
          <StripBtn icon="widgets" active={mapa} onClick={() => setMapa((m) => !m)}>Mapa</StripBtn>
          <StripBtn icon="return-money" onClick={() => { setRk((k) => k + 1); }}>Reiniciar</StripBtn>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'stretch' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: mapa ? 0 : '24px 24px 28px', overflow: 'auto' }}>
          {mapa ? <MapView dev={dev} onJump={jump} /> :
          <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
            <PhoneCr scale={scale}><CreditoApp key={presetId + ':' + rk} preset={preset} dev={dev} setDev={setDev} apiRef={apiRef} onRoute={(r, card) => setUxKey(noteKey(r, card))} /></PhoneCr>
            {ux && <UxNote k={uxKey} />}
          </div>}
        </div>
        {/* DevPanel sigue definido más arriba por si hace falta volver a
            mostrarlo, pero no se monta: el prototipo de pitch va sin él. */}
      </div>
    </div>);
}

ReactDOM.createRoot(document.getElementById('root')).render(<CreditoStage />);
