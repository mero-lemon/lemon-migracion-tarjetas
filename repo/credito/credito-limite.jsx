// «Elegí el límite de tu tarjeta» — la pantalla del superpoder (21/09).
// Tres montos sugeridos y «Otro», con escenario: el límite elegido vive en un
// bloque negro con la tarjeta adentro, para que la decisión se vea tan
// grande como es («me parece medio apagada», Jero). Las opciones de abajo
// solo cambian de monto; el que no alcanza se apaga con el motivo y la salida.
// «Otro» (equipo, 29/09) es lo que hace literal la bandera: tres montos fijos
// siguen siendo el menú de otro, y acá el techo lo pone tu saldo. El que no
// alcanza ofrece comprar lo que falta, que es lo que 108.558 personas ya
// hicieron a mano después de chocar con «no tenés respaldo suficiente».
// El mismo componente edita el límite después (Flujo 4): subir pide más
// respaldo, bajar lo libera, y no se puede bajar por debajo de lo comprometido.
const { useState: useStateCr, useEffect: useEffectCr, useRef: useRefCr } = React;

const CR_PRESEL = new URLSearchParams(location.search).get('presel') !== '0';
const TL = () => window.CreditoCopy;
// La frase que dice qué te habilita cada límite (narrativa: el superpoder)
const POWER_KEY = { 5000000: 'power_5M', 1000000: 'power_1M', 500000: 'power_500k' };

// ── El escenario: el monto elegido, blanco sobre negro, con la tarjeta ──
// Es el único bloque oscuro del alta: el límite es LA decisión de la pantalla
// y el negro es el color de la tarjeta. El monto se reanima en cada cambio.
function LimitStage({ label, amount, line, lineColor, dim, empty }) {
  return (
    <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', background: '#0B0B0B', minHeight: 126, boxShadow: '0 14px 30px -20px rgba(11,11,11,0.5)', animation: `ob-up .45s ${EASE}` }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(85% 120% at 86% 6%, rgba(207,255,46,0.13), transparent 62%)' }} />
      <div style={{ position: 'absolute', right: -26, bottom: -46, filter: 'drop-shadow(0 14px 22px rgba(0,0,0,0.5))' }}>
        <CardArt variant="credito" width={146} style={{ transform: 'rotate(-16deg)' }} />
      </div>
      <div style={{ position: 'relative', padding: '17px 92px 18px 18px' }}>
        <div style={{ font: '600 11px Inter', letterSpacing: '0.09em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>{label}</div>
        {amount != null ?
        <>
          <div key={amount} style={{ marginTop: 6, animation: `ob-up .4s ${EASE}` }}>
            <BigAmount value={amount} size={31} color={dim ? 'rgba(255,255,255,0.55)' : '#fff'} cents={false} />
          </div>
          {line &&
          <div key={String(line)} style={{ marginTop: 8, font: '400 13px Inter', lineHeight: 1.4, color: lineColor || 'rgba(255,255,255,0.72)', animation: `ob-up .45s .04s ${EASE} backwards` }}>{line}</div>}
        </> :
        <div style={{ marginTop: 8, font: '500 21px Geist', letterSpacing: '-0.02em', lineHeight: 1.2, color: 'rgba(255,255,255,0.45)' }}>{empty}</div>}
      </div>
    </div>);
}

// ── Una opción: el monto y su estado. Tres estados ───────────────
//  · elegida:    borde tinta + check negro (el monto vive arriba, en el escenario)
//  · disponible: card blanca + radio vacío
//  · apagada:    gris y candado, sin decir cuánto falta
// El monto de la lista es más chico que el del escenario (Jero, 29/09: «ese
// banner compite demasiado con lo que elegís abajo»). Arriba se decide, abajo
// se elige: el mismo número a dos tamaños distintos ordena la jerarquía.
function LimitOption({ limite, selected, disabled, current, reason, action, sub, onSelect, onAction }) {
  const tappable = !current && !(disabled && !onAction);
  const click = () => { if (current) return; if (disabled) { onAction && onAction(); return; } onSelect(); };
  return (
    <OptionCard selected={selected && !disabled && !current} onClick={tappable ? click : undefined} pad="14px 18px"
      style={{ background: disabled ? 'var(--bg-layer-02)' : '#fff', boxShadow: disabled ? 'none' : undefined, opacity: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <BigAmount value={limite} size={20} cents={false} color={disabled ? CR.ink3 : CR.ink} />
          {disabled && reason &&
          <div style={{ font: '400 12.5px Inter', color: CR.ink3, marginTop: 4, lineHeight: 1.4 }}>{reason}{action && <> · <span style={{ fontWeight: 600, color: 'var(--text-brand)' }}>{action}</span></>}</div>}
          {!disabled && sub &&
          <div style={{ font: '400 13px Inter', color: CR.ink3, marginTop: 4, lineHeight: 1.4 }}>{sub}</div>}
        </div>
        {current ? <Tag tone="neutral">Actual</Tag> : disabled ? <LI name="lock" size={20} color={CR.ink3} /> : <Check on={selected} size={24} />}
      </div>
    </OptionCard>);
}

// ── «Otro monto»: el techo lo pone tu saldo, no nuestra lista ───
// Se abre al tocarla y el input queda listo. Mientras está abierta manda ella:
// el escenario de arriba muestra lo que vas escribiendo.
function OtroMonto({ open, value, max, onOpen, onChange }) {
  const T = TL();
  const ref = useRefCr(null);
  useEffectCr(() => { if (open && ref.current) ref.current.focus(); }, [open]);
  const digits = (str) => str.replace(/\D/g, '').slice(0, 9);
  const shown = value != null && value > 0 ? M.fmtInt(value) : '';
  const tooLow = value != null && value > 0 && value < M.LIMIT_MIN;
  const tooHigh = value != null && value > max;
  return (
    // Cerrada no es una opción más: es una puerta, y pesa lo que pesa una
    // puerta (Jero, 29/09). Recién al abrirla toma el lugar de una opción.
    open ?
    <OptionCard selected pad="14px 18px" style={{ background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
            <span style={{ font: '500 20px Geist', letterSpacing: '-0.02em', color: shown ? CR.ink : CR.ink3 }}>$</span>
            <input ref={ref} inputMode="numeric" value={shown} placeholder={T.limite.otro_placeholder}
              onChange={(e) => onChange(Number(digits(e.target.value)) || 0)}
              style={{ flex: 1, minWidth: 0, width: '100%', border: 0, outline: 'none', background: 'transparent', padding: 0, font: '500 20px Geist', letterSpacing: '-0.02em', color: CR.ink }} />
          </div>
          <div style={{ font: '400 12.5px Inter', color: tooLow || tooHigh ? '#854600' : CR.ink3, marginTop: 4, lineHeight: 1.4 }}>
            {tooLow ? T.tpl(T.limite.otro_min, { min: M.fmtArs(M.LIMIT_MIN) })
            : tooHigh ? T.tpl(T.limite.otro_max, { max: M.fmtArs(max) })
            : max > 0 ? T.tpl(T.limite.otro_sub, { max: M.fmtArs(max) })
            : T.limite.otro_sub_vacio}
          </div>
        </div>
        <Check on={!tooLow && !tooHigh && value > 0} size={24} />
      </div>
    </OptionCard> :
    <button onClick={onOpen} style={{ width: '100%', border: 0, background: 'transparent', cursor: 'pointer', padding: '12px 4px 2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
      <LI name="edit" size={15} color={CR.ink3} />
      <span style={{ font: '600 13px Inter', color: CR.ink2 }}>{T.limite.otro_label}</span>
    </button>);
}

// ── Cargar saldo (mock: suma el faltante) ───────────────────────
function DepositoSheet({ asset, limite, S, bal, onSimulate, onClose }) {
  const chk = M.check(limite, asset, bal, S.prices, S.ratios);
  const a = M.ASSETS[asset];
  return (
    <div style={{ padding: '6px 2px 2px' }}>
      <div style={{ font: '500 20px Geist', letterSpacing: '-0.01em', color: CR.ink }}>Te faltan {M.fmtUnits(chk.faltanteUnits, asset)}</div>
      <div style={{ font: '400 13px Inter', color: CR.ink2, marginTop: 6, lineHeight: 1.5 }}>
        Un límite de <b style={{ fontWeight: 600 }}>{M.fmtArs(limite)}</b> pide <b style={{ fontWeight: 600 }}>{M.fmtUnits(chk.needUnits, asset)}</b> de respaldo en {a.name.toLowerCase()} y tenés {M.fmtUnits(chk.have, asset)}.
      </div>
      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Btn variant="brand" leftIcon={asset === 'ARS' ? 'deposit' : 'buy-and-sell'} onClick={onSimulate}>{asset === 'ARS' ? 'Cargar' : 'Comprar'} {M.fmtUnits(chk.faltanteUnits, asset)}</Btn>
        <Btn variant="ghost" onClick={onClose}>Ahora no</Btn>
      </div>
      <div style={{ font: '400 11px Inter', color: CR.ink3, marginTop: 8, textAlign: 'center' }}>Prototipo: el botón suma el faltante a tu saldo.</div>
    </div>);
}

// ── La pantalla ─────────────────────────────────────────────────
// mode 'create': el límite vive en app.jsx (controlado) y todavía no hay
// activo elegido: una opción está activa si alcanza con dólar digital O con
// Bitcoin. mode 'edit': estado local, el activo es el de la tarjeta.
function LimitPicker({ S, mode = 'create', asset, value: valueProp, onChange: onChangeProp, onBack, onContinue, onConfirm, onAddFunds }) {
  const [localVal, setLocalVal] = useStateCr(valueProp);
  const value = onChangeProp ? valueProp : localVal;
  const onChange = onChangeProp || setLocalVal;
  const [sheet, setSheet] = useStateCr(null); // { asset, limite }
  const [otro, setOtro] = useStateCr(() => valueProp != null && !M.LIMIT_PRESETS.includes(valueProp));
  const edit = mode === 'edit';
  const card = S.card;
  // en edición, lo ya dejado como respaldo cuenta como disponible
  const bal = edit ? { ...S.balances, [asset]: M.roundTo(S.balances[asset] + card.respaldoUnits, M.ASSETS[asset].decimals) } : S.balances;
  // piso en edición: lo usado este período + el resumen cerrado sin pagar
  const comprometido = edit ? S.period.consumidoArs + M.saldoImpago(S.statement) : 0;
  // El techo de «Otro»: lo que tu saldo respalda hoy. En el alta, con la mejor
  // de tus monedas; editando, con la moneda que ya elegiste.
  const maxOtro = Math.min(M.LIMIT_MAX, edit
  ? M.maxAffordableLimit(asset, bal, S.prices, S.ratios)
  : Math.max(...M.RESPALDO_ASSETS.map((a) => M.maxAffordableLimit(a, bal, S.prices, S.ratios))));
  const assetFor = (l) => edit ? asset : (M.affordableAsset(l, bal, S.prices, S.ratios) || M.closestAsset(l, bal, S.prices, S.ratios));
  const okFor = (l) => M.check(l, assetFor(l), bal, S.prices, S.ratios).ok;
  const affordable = M.LIMIT_PRESETS.filter((l) => okFor(l) && !(edit && l < comprometido));

  // creación: arranca en el límite más alto que alcanza
  useEffectCr(() => {
    if (edit || !CR_PRESEL) return;
    if (value == null || !okFor(value)) onChange(affordable.length ? affordable[affordable.length - 1] : null);
  }, [S.balances.ARS, S.balances.USDC, S.balances.BTC, S.ratios.USDC, S.ratios.BTC, S.prices.USDC, S.prices.BTC]);

  const deltaFor = (l) => {
    const toU = M.respaldoUnits(l, asset, S.prices, S.ratios);
    return { dir: l > card.limit ? 'up' : l < card.limit ? 'down' : 'same', deltaUnits: M.roundTo(toU - card.respaldoUnits, M.ASSETS[asset].decimals) };
  };
  const simulate = () => {
    const c = M.check(sheet.limite, sheet.asset, bal, S.prices, S.ratios);
    onAddFunds(sheet.asset, c.faltanteUnits);
    onChange(sheet.limite);
    setSheet(null);
  };

  // ── el escenario: qué dice según el modo y el estado ──
  const T = TL();
  const WARN = '#FFD08A'; // el ámbar del «te falta», legible sobre negro
  const stageOk = value != null && okFor(value) && !(edit && value < comprometido);
  let stageLabel = T.limite.stage_label, stageLine = null, stageColor = null;
  if (edit) {
    const d = value != null ? deltaFor(value) : null;
    stageLabel = d && d.dir !== 'same' ? T.limite.stage_label_edit : T.limite.stage_label;
    if (value != null && value < comprometido) { stageLine = T.tpl(T.editar_limite.blocked, { ars: M.fmtArs(comprometido) }); stageColor = WARN; }
    else if (value != null && !stageOk) { stageLine = `Te faltan ${M.fmtUnits(M.check(value, asset, bal, S.prices, S.ratios).faltanteUnits, asset)} de respaldo`; stageColor = WARN; }
    else if (d && d.dir === 'up') stageLine = T.tpl(T.editar_limite.sub_subir, { unidades: M.fmtUnits(Math.abs(d.deltaUnits), asset) });
    else if (d && d.dir === 'down') { stageLine = T.tpl(T.editar_limite.sub_bajar, { unidades: M.fmtUnits(Math.abs(d.deltaUnits), asset) }); stageColor = 'var(--c-lime-40)'; }
    else stageLine = 'Es el límite que tenés hoy.';
  } else if (stageOk) stageLine = T.limite[POWER_KEY[value]] || T.tpl(T.limite.otro_sub, { max: M.fmtArs(maxOtro) });
  else if (value != null && value > 0) { stageLine = value < M.LIMIT_MIN ? T.tpl(T.limite.otro_min, { min: M.fmtArs(M.LIMIT_MIN) }) : T.limite.locked_reason; stageColor = WARN; }

  let footer;
  if (edit) {
    const d = value != null ? deltaFor(value) : null;
    if (value == null || value === card.limit) footer = <Btn variant="primary" disabled>Elegí un límite distinto</Btn>;
    else if (value < comprometido) footer = <Btn variant="primary" disabled>Por debajo de lo que usaste</Btn>;
    else if (!okFor(value)) footer = <Btn variant="brand" leftIcon={asset === 'ARS' ? 'deposit' : 'buy-and-sell'} onClick={() => setSheet({ asset, limite: value })}>{asset === 'ARS' ? 'Cargar' : 'Comprar'} {M.fmtUnits(M.check(value, asset, bal, S.prices, S.ratios).faltanteUnits, asset)}</Btn>;
    else footer = <Btn variant="primary" onClick={() => onConfirm(value)}>{T.tpl(d.dir === 'up' ? T.editar_limite.cta_subir : T.editar_limite.cta_bajar, { ars: M.fmtArs(value) })}</Btn>;
  } else footer = <Btn variant="primary" disabled={value == null || value < M.LIMIT_MIN || !okFor(value)} onClick={onContinue}>{T.limite.cta}</Btn>;

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      <Screen bg={CR.page} footer={edit ? footer :
      <FooterHelper label={T.limite.helper_label} onClick={() => setSheet('help')}>{footer}</FooterHelper>}>
        <StepHeader title={edit ? T.editar_limite.header : ''} onBack={onBack} />
        <div style={{ padding: '4px 16px 8px' }}>
          <div style={{ font: '500 24px Geist', letterSpacing: '-0.02em', lineHeight: 1.15, color: CR.ink }}>{edit ? T.editar_limite.h1 : T.limite.h1}</div>
          <div style={{ font: '400 14px Inter', lineHeight: 1.45, color: CR.ink2, marginTop: 6 }}>{edit ? T.editar_limite.sub : T.limite.sub_opcional}</div>
          <div style={{ marginTop: 18 }}>
            <LimitStage label={stageLabel} amount={value} line={stageLine} lineColor={stageColor} dim={!stageOk} empty={T.limite.stage_empty} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
            {[...M.LIMIT_PRESETS].reverse().map((l) => {
              const isCurrent = edit && l === card.limit;
              const useBlocked = edit && l < comprometido;
              const a = assetFor(l);
              const chk = M.check(l, a, bal, S.prices, S.ratios);
              const ok = chk.ok;
              let sub = null, reason = null, action = null;
              if (useBlocked) reason = T.tpl(T.editar_limite.blocked, { ars: M.fmtArs(comprometido) });
              // Jero, 29/09: «que sea un poco más misterioso». El monto que falta
              // y cómo conseguirlo viven en el sheet, al tocar la opción.
              else if (!ok) reason = T.limite.locked_reason;
              return (
                <LimitOption key={l} limite={l} selected={value === l} disabled={!ok || useBlocked} current={isCurrent}
                  reason={reason} action={action} sub={sub}
                  onSelect={() => { setOtro(false); onChange(l); }} onAction={!ok && !useBlocked ? () => setSheet({ asset: a, limite: l }) : undefined} />);
            })}
            <OtroMonto open={otro} value={otro ? value : null} max={maxOtro}
              onOpen={() => { setOtro(true); onChange(null); }} onChange={(v) => onChange(v || null)} />
          </div>
        </div>
      </Screen>
      <Sheet open={sheet === 'help'} onClose={() => setSheet(null)}>
        <HelperSheet title={T.limite.helper_title} close={T.limite.helper_close} onClose={() => setSheet(null)}
          items={[['edit', T.limite.helper_b1], ['return-money', T.limite.helper_b2], ['earn', T.limite.helper_b4], ['lock', T.limite.helper_b3]]} />
      </Sheet>
      <Sheet open={!!sheet && sheet !== 'help'} onClose={() => setSheet(null)}>
        {sheet && sheet !== 'help' && <DepositoSheet asset={sheet.asset} limite={sheet.limite} S={S} bal={bal} onSimulate={simulate} onClose={() => setSheet(null)} />}
      </Sheet>
    </div>);
}

Object.assign(window, { LimitPicker, LimitOption, LimitStage, DepositoSheet, CR_PRESEL });
