// Pantallas de la Lemon Credit Card. Cada pantalla es una función pura de
// (estado, callbacks): así la vista de mapa puede renderizarlas todas con
// un estado prearmado. El selector de límite vive en credito-limite.jsx y
// TODOS los textos en credito-copy.js (ordenados por narrativa.md).
//
// Alta (Jero, 21/09) = límite → respaldo → tu tarjeta → **se crea** → ya es tuya.
// Activación (29/09, feedback del equipo) = UNA pantalla: elegís cuándo cierra
// y la tarjeta queda activa, con Apple Pay en la misma confirmación. El débito
// automático salió de acá: activar no puede costar decisiones que todavía no
// son concretas. Se ofrece después, desde el banner de la home y desde la fila
// de «Ya podés pagar», que es cuando la decisión tiene algo que decidir.
const { useState: useStateS, useEffect: useEffectS, useRef: useRefS } = React;

const T = () => window.CreditoCopy;
const H1 = { font: '500 24px Geist', letterSpacing: '-0.02em', lineHeight: 1.15, color: CR.ink };
const SUB = { font: '400 14px Inter', lineHeight: 1.45, color: CR.ink2, marginTop: 6 };
const EYEBROW = { font: '600 12px Inter', letterSpacing: '0.06em', color: CR.ink3, textTransform: 'uppercase' };
const AUTOPAY_SHORT = { minimo: 'el mínimo', total: 'el total, pesos y dólares', total_pesos: 'el total en pesos' };
const autopayTitle = (mode) => ({ minimo: T().autopay.min_title, total: T().autopay.total_title, total_pesos: T().autopay.totalpesos_title })[mode];
const autopaySub = (mode) => ({ minimo: T().activated.autopay_min_sub, total: T().activated.autopay_total_sub, total_pesos: T().activated.autopay_totalpesos_sub })[mode];
// El helper del respaldo dice qué parte del respaldo es tu límite. Desde el
// 29/09 no es el mismo número para los tres activos —pesos 85%, el resto 80%—,
// así que el porcentaje y el ejemplo salen del activo elegido, no del copy.
const ejemploRespaldo = (assetId, limit, ratios) => ({
  pct: M.fmtPct(M.limitShare(M.ratioOf(assetId, ratios))),
  limite: M.fmtArs(limit || 1000000),
  respaldo: M.fmtArs(M.respaldoArs(limit || 1000000, assetId, ratios))
});
const NOTE_BOX = { marginTop: 10, font: '400 12px Inter', color: CR.ink2, lineHeight: 1.45, background: '#F5F5F5', borderRadius: 12, padding: '8px 10px' };
// La misma card negra de «Elegí el límite» para la opción elegida
const invStyle = (inv, ok) => ({ background: inv ? CR.ink : ok ? '#fff' : 'var(--bg-layer-02)', boxShadow: inv ? '0 10px 28px rgba(20,20,20,0.18)' : ok ? 'var(--shadow-card)' : 'none', opacity: 1 });

// ═══════════════════════════════════════════════════════════════
// FLUJO 1 · Alta
// ═══════════════════════════════════════════════════════════════

// ── Elegí tu respaldo: pesos, dólar digital o Bitcoin ───────────
// El respaldo es tu garantía y tu seguro: te habilita el límite y sigue
// siendo tuyo. La relación con el límite (80%) vive en el helper.
//
// Tres decisiones del 29/09, todas del feedback del equipo:
//  · Entran los PESOS (Jero). El 52% los prefería y son la moneda de la deuda,
//    así que con pesos el límite no se mueve nunca.
//  · El MONTO es el protagonista de la opción, no una línea más: es el dato
//    que define la decisión (pedido del diseñador).
//  · El equivalente EN PESOS va abajo y en gris. Suma a la transparencia, pero
//    «dejás $1.250.000 para gastar $1.000.000» es una resta que el usuario
//    puede hacer solo y que nosotros no le servimos (Jero). Igual que el 80%,
//    que vive en el helper y no en la cara de la pantalla (narrativa.md §8).
function RespaldoPicker({ S, limit, value, onChange, onBack, onContinue, onAddFunds }) {
  const t = T().respaldo;
  const [sheet, setSheet] = useStateS(null); // 'help' | assetId
  const opts = M.RESPALDO_ASSETS.map((id) => ({ id, a: M.ASSETS[id], chk: M.check(limit, id, S.balances, S.prices, S.ratios) }));
  useEffectS(() => {
    const cur = opts.find((o) => o.id === value);
    if (!cur || !cur.chk.ok) { const f = opts.find((o) => o.chk.ok); onChange(f ? f.id : null); }
  }, [limit, S.balances.ARS, S.balances.USDC, S.balances.BTC]);
  const sel = opts.find((o) => o.id === value);
  return (
    <div style={{ height: '100%', position: 'relative' }}>
      <Screen bg={CR.page} footer={
      <FooterHelper label={t.helper_label} onClick={() => setSheet('help')}>
          <Btn variant="primary" disabled={!sel || !sel.chk.ok} onClick={onContinue}>{t.cta}</Btn>
        </FooterHelper>}>
        <StepHeader title="" onBack={onBack} />
        <div style={{ padding: '4px 16px 8px' }}>
          <div style={H1}>{t.h1}</div>
          {t.sub_opcional && <div style={SUB}>{t.sub_opcional}</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
            {opts.map(({ id, a, chk }) => {
              const inv = value === id && chk.ok;
              return (
              <OptionCard key={id} selected={inv} onClick={() => chk.ok ? onChange(id) : setSheet(id)} pad={inv ? '24px 22px' : '18px 20px'} style={invStyle(inv, chk.ok)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <AssetIcon id={id} size={inv ? 52 : 42} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ font: '400 12px Inter', color: inv ? 'rgba(255,255,255,0.6)' : CR.ink3 }}>{a.name}</div>
                    {chk.ok ?
                    /* propiedades separadas, no el shorthand `font`: el tamaño cambia
                       al seleccionar, y mezclar shorthand con lineHeight hace que React
                       avise y que, según el orden, una pise a la otra */
                    <div style={{ fontFamily: 'Geist', fontWeight: 500, fontSize: inv ? 27 : 21, letterSpacing: '-0.02em', lineHeight: 1.2, color: inv ? '#fff' : CR.ink, marginTop: inv ? 3 : 1 }}>{M.fmtUnits(chk.needUnits, id)}</div> :
                    <div style={{ font: '400 14px Inter', color: '#854600', marginTop: 3, lineHeight: 1.4 }}>
                      {T().tpl(t.locked_line, { faltante: M.fmtUnits(chk.faltanteUnits, id) })} · <span style={{ fontWeight: 600, color: 'var(--text-brand)' }}>{M.verboFaltante(id)}</span>
                    </div>}
                  </div>
                  {inv ? <SelCheck /> : chk.ok ? <Radio on={false} size={24} /> : <LI name="lock" size={20} color={CR.ink3} />}
                </div>
                {/* El detalle solo en la elegida (Jero, 29/09: «quedan demasiado
                    cargadas cada opción»). Lo que decide es el monto; lo que
                    tranquiliza aparece cuando ya elegiste esa moneda. Primero
                    cuánto rinde —es la noticia buena y lo que nadie espera de un
                    respaldo— y recién después el equivalente en pesos. */}
                {inv &&
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.14)', display: 'flex', flexDirection: 'column', gap: 10, animation: `screenIn .3s ${EASE}` }}>
                  {a.rinde &&
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <span style={{ width: 26, height: 26, borderRadius: 999, background: 'rgba(207,255,46,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <LI name="earn" size={14} color="var(--c-lime-40)" />
                    </span>
                    <span style={{ font: '500 14px Inter', color: 'var(--c-lime-40)' }}>{T().tpl(t.option_rinde, { tna: '≈' + M.fmtTna(a.tna) })}</span>
                  </div>}
                  {id !== 'ARS' &&
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                    <span style={{ width: 26, height: 26, borderRadius: 999, background: 'rgba(255,255,255,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <LI name="swap" size={13} color="rgba(255,255,255,0.6)" />
                    </span>
                    <span style={{ font: '400 12.5px Inter', lineHeight: 1.45, color: 'rgba(255,255,255,0.7)', paddingTop: 4 }}>{T().tpl(t.option_ars, { ars: M.fmtArs(chk.needArs) })}</span>
                  </div>}
                </div>}
              </OptionCard>);
            })}
          </div>
        </div>
      </Screen>
      <Sheet open={sheet === 'help'} onClose={() => setSheet(null)}>
        <HelperSheet title={t.helper_title} close={t.helper_close} onClose={() => setSheet(null)}
          items={[['limits', t.helper_b1], ['earn', t.helper_b_rinde], ['return-money', T().tpl(t.helper_b2, ejemploRespaldo(value || M.RESPALDO_ASSETS[0], limit, S.ratios))], ['stocks', t.helper_b3], ['shield-alt', t.helper_b4]]} />
      </Sheet>
      <Sheet open={!!sheet && sheet !== 'help'} onClose={() => setSheet(null)}>
        {sheet && sheet !== 'help' && <DepositoSheet asset={sheet} limite={limit} S={S} bal={S.balances} onClose={() => setSheet(null)}
          onSimulate={() => { const c = M.check(limit, sheet, S.balances, S.prices, S.ratios); onAddFunds(sheet, c.faltanteUnits); onChange(sheet); setSheet(null); }} />}
      </Sheet>
    </div>);
}

// ── Tu Lemon Credit Card: la tarjeta y lo único que falta decir ─
// Ni límite ni respaldo: los acaba de elegir y repetirlos convierte un
// momento en una factura (Jero, 21/09). Lo único nuevo es el costo, y desde el
// 29/09 el costo es cero: la tarjeta no cobra mantenimiento. El cero deja de
// ser letra chica y pasa a ser lo que la pantalla tiene para decir.
function OrderSummary({ S, onBack, onContinue }) {
  const t = T().pedido;
  const [help, setHelp] = useStateS(false);
  const [tyc, setTyc] = useStateS(false);
  const [verTyc, setVerTyc] = useStateS(false);
  return (
    <div style={{ height: '100%', position: 'relative' }}>
    <Screen bg={CR.page} footer={
    <FooterHelper label={t.helper_label} onClick={() => setHelp(true)}>
        {/* Aceptar los términos es lo último antes de crear la tarjeta, y va
            sin tildar: si lo dejáramos marcado, el usuario no estaría
            aceptando nada. El botón espera hasta que lo haga. */}
        <div onClick={() => setTyc((v) => !v)} role="checkbox" aria-checked={tyc}
          style={{ display: 'flex', alignItems: 'center', gap: 11, cursor: 'pointer', padding: '4px 2px 12px' }}>
          <CheckBox on={tyc} size={21} />
          <span style={{ font: '400 13px Inter', lineHeight: 1.45, color: CR.ink2 }}>
            {t.tyc_pre}
            <button onClick={(e) => { e.stopPropagation(); setVerTyc(true); }}
              style={{ border: 0, background: 'transparent', padding: 0, cursor: 'pointer', font: '600 13px Inter', color: CR.ink, textDecoration: 'underline', textUnderlineOffset: 3 }}>{t.tyc_link}</button>
          </span>
        </div>
        <Btn variant="primary" disabled={!tyc} onClick={onContinue}>{t.cta}</Btn>
      </FooterHelper>}>
      <StepHeader title="" onBack={onBack} />
      <div style={{ padding: '4px 16px 16px', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '18px 0 28px' }}>
          <CardArt variant="credito" width={252} glow shimmer style={{ boxShadow: '0 24px 48px -12px rgba(20,20,20,0.35)' }} />
        </div>
        <div style={{ font: '500 27px Geist', letterSpacing: '-0.025em', lineHeight: 1.12, color: CR.ink, textAlign: 'center', textWrap: 'balance' }}>{t.h1}</div>
        <div style={{ font: '400 15px Inter', lineHeight: 1.5, color: CR.ink2, marginTop: 10, textAlign: 'center', textWrap: 'pretty' }}>{t.sub}</div>
      </div>
    </Screen>
    <Sheet open={help} onClose={() => setHelp(false)}>
      <HelperSheet title={t.helper_title} close={t.helper_close} onClose={() => setHelp(false)}
        items={[['card-on', t.helper_b1], ['earn', t.helper_b2], ['percent', T().tpl(t.helper_b3, { tna: M.fmtTna(M.FEES.tnaFinanciacion) })]]} />
    </Sheet>
    <Sheet open={verTyc} onClose={() => setVerTyc(false)}>
      <div style={{ padding: '6px 2px 2px' }}>
        <div style={{ font: '500 20px Geist', letterSpacing: '-0.01em', color: CR.ink }}>{t.tyc_sheet_title}</div>
        <div style={{ font: '400 14px Inter', color: CR.ink2, lineHeight: 1.5, marginTop: 10 }}>{t.tyc_sheet_body}</div>
        <div style={{ marginTop: 16 }}><Btn variant="light" onClick={() => setVerTyc(false)}>{t.tyc_sheet_close}</Btn></div>
      </div>
    </Sheet>
    </div>);
}

// ── Ya tenés tu Lemon Credit Card: el momento de bienvenida ────────
// La tarjeta ya existe. Un solo botón grande: empezar a usarla ahora
// (activar → débito automático → Apple Pay).
function OrderConfirm({ S, onHome, onActivateNow }) {
  const t = T().confirm;
  return (
    <Screen bg={CR.page} footer={
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Btn variant="primary" onClick={onActivateNow} style={{ padding: '17px 20px', font: '600 17px Inter' }}>{t.cta}</Btn>
        <Btn variant="ghost" onClick={onHome}>{t.cta2}</Btn>
      </div>}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '8px 20px 24px', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(55% 40% at 50% 38%, rgba(255,140,60,0.16), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', animation: `ob-up .6s ${EASE}` }}>
          <div style={{ animation: 'lc-float 5s ease-in-out infinite' }}>
            <CardArt variant="credito" width={300} glow shimmer style={{ transform: 'rotate(-6deg)' }} />
          </div>
          <div style={{ width: 200, height: 22, margin: '18px auto 0', borderRadius: '50%', filter: 'blur(10px)', background: 'radial-gradient(50% 50% at 50% 50%, rgba(20,20,20,0.28), transparent 72%)' }} />
        </div>
        {t.eyebrow_opcional && <div style={{ ...EYEBROW, marginTop: 22, animation: `ob-up .5s .08s ${EASE} backwards` }}>{t.eyebrow_opcional}</div>}
        <div style={{ font: '500 28px Geist', letterSpacing: '-0.02em', lineHeight: 1.12, color: CR.ink, marginTop: t.eyebrow_opcional ? 8 : 26, textWrap: 'balance', animation: `ob-up .5s .12s ${EASE} backwards` }}>{t.h1}</div>
        <div style={{ font: '400 15px Inter', lineHeight: 1.5, color: CR.ink2, maxWidth: 300, marginTop: 10, animation: `ob-up .5s .2s ${EASE} backwards` }}>{t.sub}</div>
      </div>
    </Screen>);
}

// ═══════════════════════════════════════════════════════════════
// FLUJO 2 · Activación: cierre → listo (con Apple Pay en la confirmación)
// ═══════════════════════════════════════════════════════════════

// día aproximado de vencimiento para el título de cada opción (cierre + 10)
const vtoAprox = (closeDay) => { const d = closeDay + 10; return d <= 28 ? String(d) : `${d - 30} del mes siguiente`; };

// ── ¿Cuándo querés que cierre?: acordeón, solo cierre y vencimiento ─
// Las fechas son aproximadas: se corren por fines de semana y feriados.
function CierrePicker({ S, value, onChange, onBack, onContinue }) {
  const t = T().cierre;
  return (
    <Screen bg={CR.page} footer={<Btn variant="primary" disabled={!value} onClick={onContinue}>{t.cta}</Btn>}>
      <StepHeader title={t.header} onBack={onBack} />
      <div style={{ padding: '4px 16px 12px' }}>
        <div style={H1}>{t.h1}</div>
        <div style={SUB}>{t.sub}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 18 }}>
          {M.CIERRE_GROUPS.map((g) => {
            const open = value === g.id;
            const d = M.cycleDates(g, S.hoy);
            return (
              <OptionCard key={g.id} selected={open} onClick={() => onChange(g.id)} pad={0}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ font: '500 16px Geist', letterSpacing: '-0.01em', color: CR.ink }}>{T().tpl(t.option_title, { dia: g.closeDay })}</div>
                    <div style={{ font: '400 12px Inter', color: CR.ink3, marginTop: 2 }}>{T().tpl(t.option_sub, { dia_vto_aprox: vtoAprox(g.closeDay) })}</div>
                  </div>
                  <LI name={open ? 'arrow-expand-less' : 'arrow-expand-more'} size={20} color={CR.ink3} />
                </div>
                {open &&
                <div style={{ padding: '0 16px 14px', animation: `screenIn .3s ${EASE}` }}>
                  <DateTimeline dates={d} />
                  <div style={{ font: '400 11px Inter', color: CR.ink3, marginTop: 10, lineHeight: 1.45 }}>{t.footnote}</div>
                </div>}
              </OptionCard>);
          })}
        </div>
      </div>
    </Screen>);
}

// ── Débito automático: cuánto (mínimo o total). De dónde, en el helper ─
function AutopayCuanto({ S, value, onChange, onBack, onContinue, onSkip }) {
  const t = T().autopay;
  const v = value || M.AUTOPAY_DEFAULT;
  const set = (patch) => onChange({ ...v, on: true, ...patch });
  const [help, setHelp] = useStateS(false);
  const modes = [{ id: 'minimo', title: t.min_title, body: t.min_body }, { id: 'total', title: t.total_title, body: t.total_body }, { id: 'total_pesos', title: t.totalpesos_title, body: t.totalpesos_body }];
  return (
    <div style={{ height: '100%', position: 'relative' }}>
      <Screen bg={CR.page} footer={
      <FooterHelper label={t.helper_label} onClick={() => setHelp(true)}>
          <Btn variant="ghost" onClick={onSkip}>{t.skip}</Btn>
          <Btn variant="primary" onClick={onContinue}>{t.cta}</Btn>
        </FooterHelper>}>
        <StepHeader title={t.header} onBack={onBack} />
        <div style={{ padding: '4px 16px 12px' }}>
          <div style={H1}>{t.h1}</div>
          <div style={SUB}>{t.sub}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18 }}>
            {modes.map((m) =>
            <OptionCard key={m.id} selected={v.mode === m.id} onClick={() => set({ mode: m.id })} pad={16}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ font: '500 16px Geist', letterSpacing: '-0.01em', color: CR.ink }}>{m.title}</div>
                    <div style={{ font: '400 13px Inter', lineHeight: 1.45, color: CR.ink3, marginTop: 4 }}>{T().tpl(m.body, { tna: M.fmtTna(M.FEES.tnaFinanciacion) })}</div>
                  </div>
                  <Radio on={v.mode === m.id} />
                </div>
              </OptionCard>)}
          </div>
        </div>
      </Screen>
      <Sheet open={help} onClose={() => setHelp(false)}>
        <div style={{ padding: '6px 2px 2px' }}>
          <div style={{ font: '500 20px Geist', letterSpacing: '-0.01em', color: CR.ink }}>{t.helper_title}</div>
          <div style={{ font: '400 14px Inter', color: CR.ink, lineHeight: 1.5, marginTop: 10 }}>{t.helper_body}</div>
          <div style={{ marginTop: 16 }}><Btn variant="light" onClick={() => setHelp(false)}>Entendido</Btn></div>
        </div>
      </Sheet>
    </div>);
}

// ── Sumala a Apple Pay: el último paso de la activación ─────────
function WalletScreen({ S, onBack, onAdd, onSkip }) {
  const t = T().wallet;
  const [adding, setAdding] = useStateS(false);
  const start = () => { setAdding(true); setTimeout(onAdd, 1400); };
  return (
    <div style={{ height: '100%', position: 'relative' }}>
      <Screen bg={CR.page} footer={
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <WalletBtn label={t.cta} onClick={start} />
          <Btn variant="ghost" onClick={onSkip}>{t.skip}</Btn>
        </div>}>
        <StepHeader title={t.header} onBack={onBack} />
        <div style={{ padding: '4px 16px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 18 }}>
          <div style={{ position: 'relative', width: '100%', height: 250, borderRadius: 24, overflow: 'hidden', animation: `ob-up .5s ${EASE}` }}>
            <img src="assets/nfc-hero.png" alt="" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 30%' }} />
          </div>
          <div style={{ font: '500 26px Geist', letterSpacing: '-0.02em', lineHeight: 1.15, color: CR.ink, textWrap: 'balance', animation: `ob-up .5s .08s ${EASE} backwards` }}>{t.h1}</div>
          <div style={{ font: '400 15px Inter', lineHeight: 1.5, color: CR.ink2, maxWidth: 300, marginTop: -8, animation: `ob-up .5s .16s ${EASE} backwards` }}>{t.sub}</div>
        </div>
      </Screen>
      {adding &&
      <div style={{ position: 'absolute', inset: 0, zIndex: 60, background: 'rgba(8,8,9,0.82)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, animation: `screenIn .3s ${EASE}` }}>
          <div style={{ animation: 'lc-float 3s ease-in-out infinite' }}><CardArt variant="credito" width={200} glow shimmer /></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, color: '#fff', font: '600 15px Inter' }}>
            <span style={{ width: 18, height: 18, borderRadius: 999, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'cr-spin .8s linear infinite' }} /> Agregando a Apple Pay…
          </div>
        </div>}
    </div>);
}

// ── Ya podés pagar con el celu ──────────────────────────────────
// Bottom sheet sobre la home, no pantalla (Jero, 29/09). Y sin repetir límite,
// cierre ni débito: se los acaba de mostrar. Lo único que queda por hacer es
// ponerla en el celu, así que el sheet es ese botón y nada más.
function ActivadaSheet({ S, onAddWallet, onClose }) {
  const t = T().activated;
  const c = S.card;
  const [adding, setAdding] = useStateS(false);
  const add = () => { setAdding(true); setTimeout(() => { setAdding(false); onAddWallet(); }, 1400); };
  return (
    <div style={{ padding: '2px 2px 2px', textAlign: 'center', position: 'relative' }}>
      {/* La terminal con el celu apoyado, recortada y sin fondo (Jero, 29/09).
          Va sin marco ni card: el PNG tiene alpha, así que flota sobre la hoja
          y el gesto —apoyar el celu— es lo primero que se ve. */}
      <div style={{ padding: '4px 0 0', display: 'flex', justifyContent: 'center', animation: `ob-up .5s ${EASE}` }}>
        <img src="assets/posnet.png" alt="" style={{ display: 'block', width: '100%', maxWidth: 304, aspectRatio: '554 / 362', objectFit: 'contain' }} />
      </div>
      <div style={{ font: '500 24px Geist', letterSpacing: '-0.02em', lineHeight: 1.15, color: CR.ink, marginTop: 16, textWrap: 'balance' }}>{c.nfc ? t.h1 : t.h1_sin_wallet}</div>
      <div style={{ font: '400 14px Inter', lineHeight: 1.5, color: CR.ink2, marginTop: 8, textWrap: 'pretty' }}>{c.nfc ? t.sub : t.sub_sin_wallet}</div>
      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {c.nfc ? <Btn variant="primary" onClick={onClose}>{t.cta}</Btn> :
        <>
          <WalletBtn label={t.cta_wallet} onClick={add} />
          <Btn variant="ghost" onClick={onClose}>{t.cta_skip}</Btn>
        </>}
      </div>
      {adding &&
      <div style={{ position: 'absolute', inset: -18, zIndex: 60, background: 'rgba(255,255,255,0.94)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, borderRadius: 20 }}>
        <div style={{ animation: 'lc-float 3s ease-in-out infinite' }}><CardArt variant="credito" width={150} glow shimmer /></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, color: CR.ink, font: '600 14px Inter' }}>
          <span style={{ width: 16, height: 16, borderRadius: 999, border: '3px solid rgba(20,20,20,0.18)', borderTopColor: CR.ink, animation: 'cr-spin .8s linear infinite' }} /> Agregando a Apple Pay…
        </div>
      </div>}
    </div>);
}

// ═══════════════════════════════════════════════════════════════
// FLUJO 3 · Landing (Lemon Card · Crédito)
// ═══════════════════════════════════════════════════════════════

// Los tres números, cada uno con su forma, en el orden de la app de hoy:
//  · CONSUMOS DEL PERÍODO: sección plana con cierre y vto del grupo elegido
//  · LÍMITE DISPONIBLE = número grande verde + «Límite total $X» → abre «Límite y respaldo»
//  · RESUMEN = tarjeta violeta tipo comprobante con «Pagar» (lo que DEBÉS)
// Nunca se muestra el límite en 0 con la tarjeta pausada ni congelada.
// El aviso del ajuste (Jero, 29/09): el límite acompaña al respaldo solo, en
// las dos direcciones, cuando el valor se mueve más de un 10%. Esto no invita
// a nada —ya pasó—: informa, con el monto nuevo y el porqué. El mismo aviso
// sale por push; acá va su versión in-app.
function AjusteLimite({ ajuste, onLimite }) {
  const th = T().home;
  const up = ajuste.dir === 'up';
  return (
    <button onClick={onLimite} style={{ width: '100%', textAlign: 'left', border: 0, cursor: 'pointer', marginTop: 12, background: up ? 'var(--c-lime-5, #F4FBD9)' : CR.infoSoft, borderRadius: 16, padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 11 }}>
      <span style={{ width: 32, height: 32, borderRadius: 999, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <LI name={up ? 'earn' : 'stocks'} size={16} color={up ? 'var(--text-brand)' : 'var(--c-nebula-60)'} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', font: '500 14px Geist', letterSpacing: '-0.01em', color: CR.ink }}>{T().tpl(up ? th.ajuste_up_title : th.ajuste_down_title, { ars: M.fmtArs(ajuste.posible) })}</span>
        <span style={{ display: 'block', font: '400 12px Inter', color: CR.ink2, lineHeight: 1.4, marginTop: 2 }}>
          {up ? th.ajuste_up_body : th.ajuste_down_body}{ajuste.piso ? ' ' + T().tpl(th.ajuste_piso, { ars: M.fmtArs(ajuste.posible) }) : ''}
        </span>
      </span>
      <LI name="arrow-foward" size={16} color={CR.ink3} />
    </button>);
}

// El banner del débito automático (Jero, 29/09): va debajo de «Límite
// disponible», no arriba de todo. Ahí está pegado al número que le importa.
function AutopayBanner({ onAutopay }) {
  const ta = T().home_autopay;
  return (
    <Surface pad={18} style={{ marginTop: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <span style={{ width: 36, height: 36, borderRadius: 999, background: CR.okSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <LI name="programed-tx" size={17} color={CR.ok} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ font: '500 16px Geist', letterSpacing: '-0.01em', color: CR.ink }}>{ta.title}</div>
          <div style={{ font: '400 13px Inter', color: CR.ink2, lineHeight: 1.45, marginTop: 4 }}>{ta.body}</div>
          <div style={{ marginTop: 12 }}><MiniBtn tone="ghost" icon="programed-tx" onClick={onAutopay}>{ta.cta}</MiniBtn></div>
        </div>
      </div>
    </Surface>);
}

function TresNumeros({ S, n, onLimite, onVerResumen, onPagar, onConsumos, onAutopay }) {
  const th = T().home;
  const c = S.card, st = S.statement;
  // El ajuste ya ocurrió: la tarjeta guarda en `ajuste` lo que pasó y desde dónde
  const ajuste = c && c.ajuste ? c.ajuste : null;
  const dNext = M.cycleDates(c.cierre, S.hoy);
  const saldo = M.saldoImpago(st);
  const diasVto = st ? M.daysBetween(S.hoy, st.vencimiento) : null;
  const vencido = st && saldo > 0 && diasVto < 0;
  const frozen = c.status === 'congelada', retiro = c.status === 'retiro' || c.status === 'retiro-pedido', offline = frozen || retiro;
  const stateNote = c.status === 'pausada' ? <>Pausada: no se aprueban compras, pero <b style={{ fontWeight: 500 }}>tu límite sigue siendo {M.fmtArs(n.limite)}</b>.</>
    : frozen ? <>Congelada: no se aprueban compras, pero <b style={{ fontWeight: 500 }}>tu límite sigue siendo {M.fmtArs(n.limite)}</b>. Vuelve al pagar el mínimo.</>
    : retiro ? <>Tu límite era <b style={{ fontWeight: 500 }}>{M.fmtArs(n.limite)}</b>. El respaldo vuelve a tu saldo cuando termine el retiro.</> : null;
  const linkBtn = (fg) => ({ border: 0, background: 'transparent', cursor: 'pointer', font: '600 12px Inter', color: fg, display: 'inline-flex', alignItems: 'center', gap: 4, padding: 0 });
  return (
    <>
      <div role="button" onClick={onConsumos} style={{ marginTop: 28, cursor: 'pointer' }}>
        <SectionHead label={th.sec_consumos} />
        <div style={{ marginTop: 6 }}><BigAmount value={S.period.consumidoArs} size={32} cents /></div>
        {S.period.consumidoUsd > 0 && <div style={{ marginTop: 2 }}><BigAmount value={S.period.consumidoUsd} prefix="US$ " size={20} color={CR.ink2} cents /></div>}
        <div style={{ display: 'flex', gap: 16, marginTop: 8, font: '400 13px Inter', color: CR.ink3 }}>
          <span>Cierre: <b style={{ color: CR.ink2, fontWeight: 500 }}>{M.fmtDate(dNext.cierre)}</b></span>
          <span>Vto: <b style={{ color: CR.ink2, fontWeight: 500 }}>{M.fmtDate(dNext.vencimiento)}</b></span>
        </div>
      </div>

      <div role="button" onClick={onLimite} style={{ marginTop: 28, cursor: 'pointer' }}>
        <SectionHead label={retiro ? 'Ya no podés gastar: retiro en curso' : frozen ? 'Disponible cuando la descongeles' : th.sec_disponible} />
        <div style={{ marginTop: 6 }}><BigAmount value={n.disponible} size={40} color={offline ? CR.ink3 : CR.disponible} cents={false} /></div>
        <div style={{ marginTop: 6, font: '400 13px Inter', color: CR.ink3 }}>{th.sec_limite_total} <b style={{ color: CR.limite, fontWeight: 500 }}>{M.fmtArs(n.limite)}</b></div>
        {!offline && ajuste && <div onClick={(e) => e.stopPropagation()}><AjusteLimite ajuste={ajuste} onLimite={onLimite} /></div>}
        {stateNote && <div style={NOTE_BOX}>{stateNote}</div>}
      </div>

      {onAutopay && <div onClick={(e) => e.stopPropagation()}><AutopayBanner onAutopay={onAutopay} /></div>}

      <div style={{ marginTop: 28 }}>
        {st ? (saldo > 0 ?
        <div style={{ background: vencido ? 'var(--c-nebula-80)' : 'var(--c-nebula-70)', borderRadius: 16, padding: 16, color: '#fff', boxShadow: '0 8px 20px rgba(76,48,124,0.18)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <LI name="receipt" size={16} color="rgba(255,255,255,0.7)" />
              <span style={{ font: '500 14px Inter', color: 'rgba(255,255,255,0.7)' }}>Resumen de {st.periodo}</span>
              <span style={{ flex: 1 }} />
              <button onClick={onVerResumen} style={linkBtn('#fff')}>Ver resumen <LI name="arrow-foward" size={13} color="#fff" /></button>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginTop: 8 }}>
              <BigAmount value={saldo} size={32} color="#fff" cents />
              <span style={{ font: '400 12px Inter', color: 'rgba(255,255,255,0.7)', paddingBottom: 5 }}>{th.resumen_apagar}</span>
            </div>
            <div style={{ marginTop: 8, font: '400 13px Inter', color: 'rgba(255,255,255,0.75)', lineHeight: 1.4 }}>
              {vencido ? <b style={{ color: 'var(--c-solar-20)', fontWeight: 600 }}>Venció el {M.fmtDate(st.vencimiento)}</b> : <>Vence el <b style={{ color: '#fff', fontWeight: 500 }}>{M.fmtDateDow(st.vencimiento)}</b></>} · Mínimo {M.fmtArs(st.minimo)}
              {st.deudaAnterior > 0 && <> · Incluye {M.fmtArs(st.deudaAnterior)} del período anterior</>}
            </div>
            <button onClick={() => onPagar('total')} style={{ marginTop: 14, width: '100%', border: 0, cursor: 'pointer', background: '#fff', color: CR.ink, font: '600 14px Inter', padding: '12px', borderRadius: 999 }}>{th.resumen_cta}</button>
            {c.autopay && c.autopay.on && !vencido &&
            <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, font: '400 12px Inter', color: 'rgba(255,255,255,0.72)' }}><LI name="programed-tx" size={14} color="var(--c-lime-40)" /> Débito automático el {M.fmtDateShort(st.vencimiento)} · {AUTOPAY_SHORT[c.autopay.mode]}</div>}
          </div> :
        <Surface pad={16} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LI name="feedback-positive" size={18} color={CR.ok} />
            <span style={{ flex: 1, font: '400 13px Inter', color: CR.ink2 }}>Pagado el {M.fmtDate(st.pagadoEl || S.hoy)}. No debés nada.</span>
            <button onClick={onVerResumen} style={linkBtn(CR.ink)}>Ver resumen</button>
          </Surface>) : null}
      </div>
    </>);
}

// Aviso in-app según estado (lo que hoy sale solo por push)
function EstadoAviso({ S, onPagar, onReactivar, onRetiro, onRetiroPago }) {
  const te = T().estados;
  const c = S.card, st = S.statement;
  const saldo = M.saldoImpago(st);
  // El retiro manda sobre cualquier otro aviso: una tarjeta que se está dando
  // de baja no tiene que recibir recordatorios de débito automático.
  if (c.status === 'retiro')
  return <Notice tone="info" icon="returns" title={te.retiro_title} body={te.retiro_body} />;
  // Paso 2 del retiro (Jero, 29/09): pediste retirar y falta saldar la deuda.
  // El aviso trae el monto adelante, que es lo que el push también dice.
  if (c.status === 'retiro-pedido') {
    const deuda = M.tresNumeros({ limit: c.limit, consumido: S.period.consumidoArs, saldoImpago: saldo }).comprometido;
    return <Notice tone="warn" icon="returns" title={T().tpl(te.retiro_pedido_title, { monto: M.fmtArs(deuda) })}
      body={T().tpl(te.retiro_pedido_body, { fecha: M.fmtDate(S.hoy) })}
      actions={<MiniBtn onClick={onRetiroPago} tone="dark" icon="deposit">{te.retiro_pedido_cta}</MiniBtn>} />;
  }
  if (c.status === 'congelada' && st) {
    const dias = Math.max(0, M.daysBetween(S.hoy, st.liquida));
    return (
      <Notice tone="bad" icon="lock" title={T().tpl(te.congelada_title, { minimo: M.fmtArs(st.minimo) })}
        body={<>{T().tpl(te.congelada_body, { minimo: M.fmtArs(st.minimo) })} {dias > 0 ? <>Si el {M.fmtDate(st.liquida)} sigue impago, <b style={{ fontWeight: 600 }}>usamos {M.fmtUnits(Math.min(c.respaldoUnits, M.roundTo(saldo / S.prices[c.asset], M.ASSETS[c.asset].decimals)), c.asset)} de tu respaldo</b> para cubrir la deuda — faltan {dias} días.</> : 'Hoy usamos parte de tu respaldo para cubrir la deuda.'}</>}
        actions={<>
          <MiniBtn onClick={() => onPagar('minimo')} tone="dark" icon="deposit">Pagar el mínimo</MiniBtn>
          <MiniBtn onClick={onRetiro} tone="light" icon="returns">Pagar con el respaldo</MiniBtn>
        </>} />);
  }
  if (c.status === 'pausada') {
    return <Notice tone="neutral" icon="pause" title={te.pausada_title} body={te.pausada_body} actions={<MiniBtn onClick={onReactivar} tone="dark" icon="play-arrow">{te.pausada_cta}</MiniBtn>} />;
  }
  if (st && saldo > 0) {
    const dias = M.daysBetween(S.hoy, st.vencimiento);
    const ap = c.autopay && c.autopay.on ? c.autopay : null;
    if (dias <= 7 && dias >= 0 && !ap)
    return <Notice tone="warn" icon="alert-time" title={T().tpl(te.vence_title, { cuando: dias === 0 ? 'hoy' : `en ${dias} días` })} body={T().tpl(te.vence_body, { minimo: M.fmtArs(st.minimo), fecha: M.fmtDate(st.vencimiento), tna: M.fmtTna(M.FEES.tnaFinanciacion) })} actions={<MiniBtn onClick={() => onPagar('total')} tone="dark">Pagar ahora</MiniBtn>} />;
    if (dias <= 7 && dias >= 0 && ap) {
      // «pesos y dólares»: cada moneda paga lo suyo y se completa con la otra → cuentan pesos + dólar digital.
      // «mínimo» y «en pesos»: solo los pesos.
      const need = ap.mode === 'minimo' ? Math.min(st.minimo, saldo) : saldo;
      const bi = ap.mode === 'total';
      const haveArs = M.unitsToArs(S.balances.ARS, 'ARS', S.prices) + (bi ? M.unitsToArs(S.balances.USDC, 'USDC', S.prices) : 0);
      if (haveArs < need)
      return <Notice tone="warn" icon="alert-time" title={`El débito automático del ${M.fmtDateShort(st.vencimiento)} no alcanza`} body={`${bi ? 'Entre tus pesos y tu dólar digital tenés' : 'En pesos tenés'} ${M.fmtArs(Math.round(haveArs))} y se van a debitar ${M.fmtArs(need)}: te faltan ${M.fmtArs(need - Math.round(haveArs))}. Cargá saldo antes del ${M.fmtDate(st.vencimiento)} o pagá ahora.`} actions={<MiniBtn onClick={() => onPagar(ap.mode === 'minimo' ? 'minimo' : 'total')} tone="dark">Pagar ahora</MiniBtn>} />;
    }
  }
  return null;
}

// ── Seguimiento del plástico: el segundo contenedor de la home ──────
// El envío es una preocupación aparte de usar la tarjeta, así que tiene su
// propia caja y su propio ritmo: cuatro pasos, el rango de fechas y nada más.
// El seguimiento del envío nace colapsado (Jero, 29/09): en la home recién
// creada lo central es la tarjeta virtual, que ya se puede usar, y el plástico
// va en segundo orden. Es una fila con el estado y un chevron; si el usuario
// quiere el detalle, la abre. Así el envío está sin robarle la pantalla a lo
// único que hoy se puede hacer.
function EnvioCard({ S, onSimDelivery, colapsable }) {
  const t = T().home_envio;
  const c = S.card;
  const [abierto, setAbierto] = useStateS(!colapsable);
  const desde = M.addDays(S.hoy, 5), hasta = M.addDays(S.hoy, 7);
  const rango = desde.getMonth() === hasta.getMonth()
    ? `${desde.getDate()} y el ${M.fmtDate(hasta)}`
    : `${M.fmtDate(desde)} y el ${M.fmtDate(hasta)}`;
  const entregada = c.fisica === 'entregada';
  const pasos = [
    { k: 'pedida', label: t.paso_pedida, done: true },
    { k: 'preparando', label: t.paso_preparando, done: entregada, now: !entregada },
    { k: 'despachada', label: t.paso_despachada, done: entregada },
    { k: 'entregada', label: t.paso_entregada, done: entregada, now: entregada }];
  if (colapsable && !abierto)
  return (
    <Surface pad={0} style={{ marginTop: 12, overflow: 'hidden' }}>
      <div role="button" onClick={() => setAbierto(true)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer' }}>
        <CardThumb variant="credito" w={32} portrait />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ font: '500 14px Geist', letterSpacing: '-0.01em', color: CR.ink }}>{t.eyebrow}</div>
          <div style={{ font: '400 12.5px Inter', color: CR.ink3, marginTop: 2 }}>
            {entregada ? t.entregada_title : T().tpl(t.colapsado_sub, { desde: rango.split(' y el ')[0], hasta: rango.split(' y el ')[1] })}
          </div>
        </div>
        <LI name="arrow-expand-more" size={20} color={CR.ink3} />
      </div>
    </Surface>);

  return (
    <Surface pad={18} style={{ marginTop: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={EYEBROW}>{t.eyebrow}</div>
          <div style={{ font: '500 20px Geist', letterSpacing: '-0.02em', color: CR.ink, marginTop: 6 }}>{entregada ? t.entregada_title : t.title}</div>
          <div style={{ font: '400 13px Inter', color: CR.ink2, lineHeight: 1.45, marginTop: 4 }}>
            {entregada ? t.entregada_sub : T().tpl(t.sub, { desde: rango.split(' y el ')[0], hasta: rango.split(' y el ')[1] })}
          </div>
        </div>
        {colapsable ?
        <button onClick={() => setAbierto(false)} style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: 4, flexShrink: 0 }}>
          <LI name="arrow-expand-less" size={20} color={CR.ink3} />
        </button> :
        <CardThumb variant="credito" w={44} portrait />}
      </div>

      {/* los cuatro pasos, en línea: hecho · en curso · pendiente */}
      <div style={{ display: 'flex', alignItems: 'flex-start', marginTop: 16 }}>
        {pasos.map((p, i) => {
          const on = p.done || p.now;
          return (
            <div key={p.k} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative' }}>
              {i > 0 && <span style={{ position: 'absolute', right: '50%', left: '-50%', top: 7, height: 2, background: p.done || p.now ? CR.ink : CR.hair }} />}
              <span style={{ position: 'relative', width: 16, height: 16, borderRadius: 999, background: p.done ? CR.ink : '#fff', border: `2px solid ${on ? CR.ink : CR.hair}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {p.done && <LI name="selected" size={9} color="#fff" />}
                {p.now && !p.done && <span style={{ width: 6, height: 6, borderRadius: 999, background: CR.ink }} />}
              </span>
              <span style={{ font: `${on ? 500 : 400} 11px Inter`, color: on ? CR.ink : CR.ink3, textAlign: 'center', lineHeight: 1.25 }}>{p.label}</span>
            </div>);
        })}
      </div>

      {!entregada &&
      <>
        <div style={{ font: '400 12px Inter', color: CR.ink3, lineHeight: 1.45, marginTop: 14, textAlign: 'center' }}>{t.body}</div>
        <button onClick={onSimDelivery} style={{ marginTop: 10, width: '100%', border: '1px dashed #C9C9C4', background: 'transparent', cursor: 'pointer', borderRadius: 14, padding: '9px', font: '500 12px Inter', color: CR.ink3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <LI name="rocket" size={13} color={CR.ink3} /> Prototipo: simular que ya me llegó el plástico
        </button>
      </>}
    </Surface>);
}

// La landing «Lemon Card · Crédito», con la estructura de la app de hoy:
// header · solapas · card row · aviso · Consumos · Límite disponible ·
// Resumen · Actividad. Sin tarjeta: solo el promo con el render real.
function TarjetasHome({ S, onPedir, onLimite, onVerResumen, onPagar, onConsumos, onTogglePause, onSimDelivery, onActivate, onRetiro, onRetiroPago, onTab, onAutopay }) {
  const th = T().home, tu = T().home_usar, tw = T().home_wallet;
  const c = S.card;
  const n = c ? M.tresNumeros({ limit: c.limit, consumido: S.period.consumidoArs, saldoImpago: M.saldoImpago(S.statement) }) : null;
  const aviso = c && c.status !== 'camino' ? EstadoAviso({ S, onPagar, onReactivar: onTogglePause, onRetiro, onRetiroPago }) : null;
  const chip = { background: '#fff', boxShadow: 'var(--shadow-card)' };
  return (
    <Screen bg={CR.page}>
      <div style={{ padding: '6px 16px 4px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ font: '500 30px Geist', letterSpacing: '-0.02em', color: CR.ink, flex: 1 }}>{th.title}</div>
        <button onClick={onPedir} style={{ ...chip, border: 0, cursor: 'pointer', font: '600 13px Inter', color: CR.ink, padding: '9px 14px', borderRadius: 999 }}>+ Pedir</button>
        <span style={{ ...chip, width: 38, height: 38, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LI name="promotion" size={18} color={CR.ink} /></span>
      </div>
      <div style={{ padding: '10px 16px 0' }}>
        <SegTabs tabs={[{ id: 'prepaga', label: th.tab_prepaga }, { id: 'credito', label: th.tab_credito }]} active="credito" onChange={(id) => id === 'prepaga' && onTab && onTab()} />
      </div>

      <div style={{ padding: '16px 16px 32px' }}>
        {!c && <CreditoHeroPromo onPedir={onPedir} />}

        {c &&
        <>
          <Surface pad={0} style={{ overflow: 'hidden' }}>
            <div role="button" onClick={onLimite} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', cursor: 'pointer' }}>
              <CardThumb variant="credito" w={46} portrait />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: '500 16px Geist', letterSpacing: '-0.01em', color: CR.ink }}>{th.card_name}</div>
                <div style={{ font: '400 13px Inter', color: CR.ink3, marginTop: 2 }}>•••• {c.mask}</div>
                <div style={{ marginTop: 6 }}><CardStatusPill status={c.status} /></div>
              </div>
              {(c.status === 'activa' || c.status === 'pausada') &&
              <button onClick={(e) => { e.stopPropagation(); onTogglePause(); }} title={c.status === 'activa' ? 'Pausar' : 'Reactivar'} style={{ width: 40, height: 40, borderRadius: 999, border: 0, background: 'rgba(8,8,8,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                  <LI name={c.status === 'activa' ? 'pause' : 'play-arrow'} size={18} color={CR.ink} />
                </button>}
              <LI name="arrow-foward" size={16} color={CR.ink3} />
            </div>
          </Surface>

          {/* Contenedor 1 · recién creada: usarla ya. La tarjeta existe, solo
              falta elegir el ritmo del resumen y sumarla al celu. */}
          {c.status === 'camino' &&
          <Surface pad={20} style={{ marginTop: 12 }}>
            <div style={EYEBROW}>{tu.eyebrow}</div>
            <div style={{ font: '500 20px Geist', letterSpacing: '-0.02em', lineHeight: 1.2, color: CR.ink, marginTop: 6 }}>{tu.title}</div>
            <div style={{ font: '400 13px Inter', color: CR.ink2, lineHeight: 1.45, marginTop: 8 }}>{tu.body}</div>
            <div style={{ marginTop: 16 }}><Btn variant="primary" onClick={() => onActivate('nfc')} style={{ padding: '16px 20px' }}>{tu.cta}</Btn></div>
          </Surface>}

          {aviso && <div style={{ marginTop: 12 }}>{aviso}</div>}

          {/* ya activa: lo único pendiente es el celu */}
          {!c.nfc && c.status !== 'camino' && c.status !== 'retiro' && c.status !== 'retiro-pedido' &&
          <Surface pad={20} style={{ marginTop: 12, textAlign: 'center' }}>
            <div style={{ font: '500 20px Geist', letterSpacing: '-0.02em', lineHeight: 1.15, color: CR.ink }}>{tw.title}</div>
            <div style={{ font: '400 13px Inter', color: CR.ink2, lineHeight: 1.45, marginTop: 8 }}>{tw.body}</div>
            <div style={{ marginTop: 16 }}><Btn variant="primary" onClick={() => onActivate('nfc')} style={{ padding: '16px 20px' }}>{tw.cta}</Btn></div>
          </Surface>}

          {/* Contenedor 2 · el plástico. Con la tarjeta recién creada va arriba,
              porque es la mitad de la pantalla; con la tarjeta ya andando baja
              debajo de los números (Jero, 29/09): el envío no puede competir
              con lo primero que el usuario viene a mirar. */}
          {c.status === 'camino' && c.fisica === 'camino' && <EnvioCard S={S} onSimDelivery={onSimDelivery} colapsable />}

          {c.status !== 'camino' &&
          <>
            <TresNumeros S={S} n={n} onLimite={onLimite} onVerResumen={onVerResumen} onPagar={onPagar} onConsumos={onConsumos}
              onAutopay={c.status !== 'retiro' && c.status !== 'retiro-pedido' && !(c.autopay && c.autopay.on) ? onAutopay : null} />
            {c.fisica === 'camino' && c.status !== 'retiro' && c.status !== 'retiro-pedido' && <div style={{ marginTop: 24 }}><EnvioCard S={S} onSimDelivery={onSimDelivery} /></div>}
            <div style={{ marginTop: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '0 2px 4px' }}>
                <span style={EYEBROW}>{th.sec_actividad}</span>
                <span style={{ flex: 1 }} />
                <LI name="arrow-foward" size={16} color={CR.ink3} />
              </div>
              {S.period.movs.slice(0, 4).map((m, i) => <MoveRow key={i} icon={m.icon} coin={m.coin} title={m.title} date={m.date} amount={m.amount} sign={m.sign} />)}
            </div>
          </>}
        </>}
      </div>
    </Screen>);
}

// ── Límite y respaldo: el medidor de hoy + tu respaldo, en una pantalla ─
function LimiteRespaldoScreen({ S, onBack, onEditLimit, onRetiro, openRetiro }) {
  const t = T().limite_respaldo;
  const c = S.card, st = S.statement, a = M.ASSETS[c.asset];
  const n = M.tresNumeros({ limit: c.limit, consumido: S.period.consumidoArs, saldoImpago: M.saldoImpago(st) });
  const rArs = Math.round(M.unitsToArs(c.respaldoUnits, c.asset, S.prices) / 100) * 100; // redondeo: las unidades ya vienen redondeadas
  const deudaTotal = n.comprometido;
  const [sheet, setSheet] = useStateS(openRetiro ? 'retiro' : null); // 'retiro' | 'saber'
  // Con qué saldás lo que debés antes de retirar (equipo, 29/09). Arranca en la
  // wallet: es la opción que devuelve el respaldo entero.
  const plan = M.retiroPlan({ respaldoUnits: c.respaldoUnits, asset: c.asset, deudaArs: deudaTotal, walletArs: S.balances.ARS, prices: S.prices });

  const offline = c.status === 'congelada' || c.status === 'retiro';
  const ratio = c.ratio != null ? c.ratio : M.ratioOf(c.asset, S.ratios);
  return (
    <div style={{ height: '100%', position: 'relative' }}>
      <Screen bg={CR.page}>
        <StepHeader title={t.header} onBack={onBack} />
        <div style={{ padding: '4px 16px 16px' }}>
          <Surface pad={18}>
            <Gauge value={n.limite ? n.disponible / n.limite : 0} color={offline ? CR.ink3 : CR.disponible}>
              <div style={{ font: '400 14px Inter', color: CR.ink3 }}>{t.gauge_label}</div>
              <BigAmount value={n.disponible} size={34} color={offline ? CR.ink3 : CR.disponible} cents={false} />
            </Gauge>
            <div style={{ marginTop: 12 }}>
              <InfoRow label={t.row_usado} value={M.fmtArs(n.consumido)} />
              {n.saldoImpago > 0 && <InfoRow label={t.row_sin_pagar} value={M.fmtArs(n.saldoImpago)} sub={t.row_sin_pagar_sub} />}
              <InfoRow label={t.row_limite_total} value={M.fmtArs(n.limite)} last />
            </div>
            {!offline && <div style={{ marginTop: 8 }}><Btn variant="light" leftIcon="edit" onClick={onEditLimit}>{t.edit_cta}</Btn></div>}
          </Surface>

          <div style={{ ...EYEBROW, margin: '22px 2px 8px' }}>{t.section_respaldo}</div>
          <Surface pad={16}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <AssetIcon id={c.asset} size={44} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: '400 12px Inter', color: CR.ink3 }}>{t.apartaste_label}</div>
                <div style={{ font: '500 24px Geist', letterSpacing: '-0.02em', color: CR.ink, lineHeight: 1.2 }}>{M.fmtUnits(c.respaldoUnits, c.asset)}</div>
                <div style={{ font: '400 12px Inter', color: CR.ink3, marginTop: 2 }}>{c.asset === 'ARS' ? t.apartaste_sub_ars : T().tpl(t.apartaste_sub, { ars: M.fmtArs(rArs), pct: M.fmtPct(M.limitShare(ratio)) })}</div>
                {a.rinde &&
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
                  <LI name="earn" size={13} color="var(--text-brand)" />
                  <span style={{ font: '500 12px Inter', color: 'var(--text-brand)' }}>{T().tpl(t.rinde_row, { tna: '≈' + M.fmtTna(a.tna) })}</span>
                </div>}
              </div>
            </div>
            {/* La regla, dicha donde vive el respaldo: el límite lo sigue solo
                (Jero, 29/09), y cambiarlo a mano sigue estando a un toque. */}
            {!offline &&
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${CR.hair}` }}>
              <div style={{ font: '500 14px Geist', letterSpacing: '-0.01em', color: CR.ink }}>{t.ajuste_title}</div>
              <div style={{ font: '400 12.5px Inter', color: CR.ink3, lineHeight: 1.45, marginTop: 4 }}>{t.ajuste_body}</div>
            </div>}
            <div style={{ display: 'flex', gap: 8, marginTop: 14, alignItems: 'center' }}>
              {c.status !== 'retiro' && c.status !== 'retiro-pedido' && <MiniBtn tone="ghost" icon="returns" onClick={() => setSheet('retiro')}>{t.retirar_cta}</MiniBtn>}
              <button onClick={() => setSheet('saber')} style={{ border: 0, background: 'transparent', cursor: 'pointer', font: '600 12px Inter', color: CR.ink3, padding: '8px 6px' }}>{t.saber_mas}</button>
            </div>
          </Surface>
        </div>
      </Screen>

      <Sheet open={sheet === 'retiro'} onClose={() => setSheet(null)}>
        <RetiroSheet S={S} plan={plan} onPedir={() => { setSheet(null); onRetiro(); }} onClose={() => setSheet(null)} />
      </Sheet>
      <Sheet open={sheet === 'saber'} onClose={() => setSheet(null)}>
        <HelperSheet title={t.saber_title} close={t.saber_close} onClose={() => setSheet(null)}
          items={[['limits', t.saber_b1], ['earn', t.saber_b_rinde], ['return-money', T().tpl(t.saber_b2, ejemploRespaldo(c.asset, c.limit, S.ratios))], ['stocks', t.saber_b3], ['shield-alt', t.saber_b4]]} />
      </Sheet>
    </div>);
}

// ── Retirar el respaldo: un proceso de cuatro pasos ─────────────
// Jero, 29/09: «siempre hay que dar la opción de que el usuario retire el
// respaldo sin pagar su deuda con el respaldo». El paso a paso es: pedís el
// retiro → te avisamos lo que debés → lo pagás (con el saldo de tu wallet o
// con parte del respaldo) → se libera el resto. Por eso son dos sheets, no uno:
// pedirlo y pagarlo son momentos distintos, y entre medio la tarjeta queda en
// «Retiro pendiente» con el aviso en la home.

// Paso 1 · la cuenta y el pedido. Todavía no se elige nada: se ve y se pide.
function RetiroSheet({ S, plan, onPedir, onClose }) {
  const t = T().limite_respaldo, c = S.card;
  const sinDeuda = plan.deudaArs <= 0;
  return (
    <div style={{ padding: '6px 2px 2px' }}>
      <div style={{ font: '500 20px Geist', letterSpacing: '-0.01em', color: CR.ink }}>{t.retiro_h1}</div>
      <div style={{ font: '400 13px Inter', color: CR.ink3, marginTop: 3, lineHeight: 1.45 }}>{sinDeuda ? t.retiro_sin_deuda : t.retiro_sub}</div>
      <Surface pad={16} style={{ marginTop: 14 }}>
        <InfoRow label={t.retiro_row_respaldo} value={M.fmtUnits(c.respaldoUnits, c.asset)} />
        {!sinDeuda && <InfoRow label={t.retiro_row_deuda} value={`− ${M.fmtArs(plan.deudaArs)}`} sub={`≈ ${M.fmtUnits(plan.deudaUnits, c.asset)}`} />}
        <InfoRow label={t.retiro_row_vuelve} value={M.fmtUnits(sinDeuda ? plan.vuelveConWallet : plan.vuelveConWallet, c.asset)} sub={t.retiro_plazo} last />
      </Surface>
      {!sinDeuda && <div style={{ ...NOTE_BOX }}>{t.retiro_pasos} {t.retiro_recalculo}</div>}
      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Btn variant="primary" onClick={onPedir}>{sinDeuda ? t.retiro_cta : t.retiro_pedir_cta}</Btn>
        <Btn variant="ghost" onClick={onClose}>{t.retiro_volver}</Btn>
      </div>
    </div>);
}

// Paso 3 · con qué saldás la deuda. La wallet NUNCA se bloquea: si no alcanza,
// se carga la diferencia en el mismo paso. Pagar con el respaldo es la opción
// cómoda, no la obligatoria.
function RetiroPagoSheet({ S, plan, pago, onPago, onConfirm, onClose }) {
  const t = T().limite_respaldo, c = S.card;
  const falta = plan.faltaWalletArs > 0;
  const opciones = [
    { id: 'wallet', title: t.retiro_wallet_title, ok: true,
      body: plan.conWallet ? T().tpl(t.retiro_wallet_body, { vuelve: M.fmtUnits(plan.vuelveConWallet, c.asset) }) : T().tpl(t.retiro_wallet_falta, { falta: M.fmtArs(plan.faltaWalletArs) }) },
    { id: 'respaldo', title: t.retiro_respaldo_title, ok: plan.conRespaldo,
      body: plan.conRespaldo ? T().tpl(t.retiro_respaldo_body, { deuda: M.fmtUnits(plan.deudaUnits, c.asset), vuelve: M.fmtUnits(plan.vuelveConRespaldo, c.asset) }) : t.retiro_respaldo_no_alcanza }
  ];
  const vuelve = pago === 'wallet' ? plan.vuelveConWallet : plan.vuelveConRespaldo;
  const cargando = pago === 'wallet' && falta;
  return (
    <div style={{ padding: '6px 2px 2px' }}>
      <div style={{ font: '500 20px Geist', letterSpacing: '-0.01em', color: CR.ink }}>{t.pago_h1}</div>
      <div style={{ font: '400 13px Inter', color: CR.ink3, marginTop: 3, lineHeight: 1.45 }}>{t.pago_sub}</div>
      {/* El total vale por hoy: se calcula el día del pedido y se recalcula
          cada día que pasa sin pagar (Jero, 29/09). Decirlo acá evita que el
          usuario vuelva mañana y encuentre otro número sin aviso. */}
      <Surface pad={14} style={{ marginTop: 14 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ font: '400 13px Inter', color: CR.ink3, flex: 1 }}>{t.retiro_row_deuda}</span>
          <BigAmount value={plan.deudaArs} size={22} cents={false} />
        </div>
        <div style={{ font: '400 11.5px Inter', color: CR.ink3, marginTop: 6, lineHeight: 1.4 }}>{T().tpl(t.pago_fecha, { fecha: M.fmtDate(S.hoy) })}</div>
      </Surface>
      <div style={{ ...EYEBROW, margin: '18px 2px 8px' }}>{t.retiro_como}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {opciones.map((o) =>
        <OptionCard key={o.id} selected={pago === o.id && o.ok} onClick={o.ok ? () => onPago(o.id) : undefined} pad={14}
          style={{ background: o.ok ? '#fff' : 'var(--bg-layer-02)', boxShadow: o.ok ? undefined : 'none' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: '500 15px Geist', letterSpacing: '-0.01em', color: o.ok ? CR.ink : CR.ink3 }}>{o.title}</div>
                <div style={{ font: '400 12.5px Inter', lineHeight: 1.45, color: o.ok ? CR.ink3 : '#854600', marginTop: 4 }}>{o.body}</div>
              </div>
              {o.ok ? <Radio on={pago === o.id} /> : <LI name="lock" size={18} color={CR.ink3} />}
            </div>
          </OptionCard>)}
      </div>
      <Surface pad={16} style={{ marginTop: 14 }}>
        <InfoRow label={t.retiro_row_vuelve} value={M.fmtUnits(vuelve, c.asset)} sub={t.retiro_plazo} last />
      </Surface>
      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Btn variant="primary" onClick={() => onConfirm(pago)}>
          {cargando ? T().tpl(t.pago_cta_cargar, { falta: M.fmtArs(plan.faltaWalletArs) }) : T().tpl(t.pago_cta, { ars: M.fmtArs(plan.deudaArs) })}
        </Btn>
        <Btn variant="ghost" onClick={onClose}>{t.retiro_volver}</Btn>
      </div>
    </div>);
}

// ── Resumen (statement): visible en la app, con la deuda anterior ─
function StatementScreen({ S, onBack, onPagar }) {
  const st = S.statement, c = S.card;
  const saldo = M.saldoImpago(st);
  return (
    <Screen bg={CR.page} footer={saldo > 0 ?
    <div style={{ display: 'flex', gap: 8 }}>
        <Btn variant="light" onClick={() => onPagar('minimo')} style={{ flex: 1 }}>Pagar el mínimo</Btn>
        <Btn variant="primary" onClick={() => onPagar('total')} style={{ flex: 1.4 }}>Pagar {M.fmtArs(saldo)}</Btn>
      </div> : undefined}>
      <StepHeader title={`Resumen de ${st.periodo}`} onBack={onBack} />
      <div style={{ padding: '4px 16px 16px' }}>
        <div style={{ font: '400 14px Inter', color: CR.ink3 }}>{saldo > 0 ? 'Total a pagar' : 'Pagado'}</div>
        <BigAmount value={saldo > 0 ? saldo : st.totalArs + st.deudaAnterior} size={40} color={saldo > 0 ? CR.saldo : CR.ink} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px', marginTop: 6, font: '400 12px Inter', color: CR.ink3 }}>
          <span>Cerró el {M.fmtDate(st.cierre)}</span><span>Vence el <b style={{ color: CR.ink2, fontWeight: 500 }}>{M.fmtDateDow(st.vencimiento)}</b></span>
        </div>
        {saldo > 0 && c.autopay && c.autopay.on &&
        <div style={{ marginTop: 10 }}><Notice tone="ok" icon="programed-tx" title={`Débito automático el ${M.fmtDate(st.vencimiento)}`} body={`Se paga ${AUTOPAY_SHORT[c.autopay.mode]}${c.autopay.mode === 'total' ? ': pesos con pesos, dólares con tu dólar digital' : c.autopay.mode === 'total_pesos' ? ', todo desde tus pesos' : ', desde tus pesos'}. Podés adelantar el pago cuando quieras.`} /></div>}
        <Surface pad={16} style={{ marginTop: 14 }}>
          <InfoRow label="Consumos en pesos" value={M.fmtArs(st.consumosArs)} />
          <InfoRow label="Consumos en dólares" value={st.consumosUsd > 0 ? `US$ ${st.consumosUsd.toLocaleString('es-AR')}` : '—'} sub={st.consumosUsd > 0 ? `≈ ${M.fmtArs(Math.round(st.consumosUsd * st.tcBna))} al BNA del día de pago` : undefined} />
          <InfoRow label="Mantenimiento" value={M.fmtArs(M.FEES.mantenimiento)} strike tag={<Tag tone="positive">Bonificado</Tag>} />
          <InfoRow label="Deuda del período anterior" value={st.deudaAnterior > 0 ? M.fmtArs(st.deudaAnterior) : '$0'} sub={st.deudaAnterior > 0 ? 'Lo que quedó sin pagar del resumen pasado, con intereses' : undefined} />
          {st.pagado > 0 && <InfoRow label="Ya pagaste" value={`− ${M.fmtArs(st.pagado)}`} />}
          <InfoRow label="Pago mínimo" value={M.fmtArs(st.minimo)} last />
        </Surface>
        <div style={{ font: '400 12px Inter', color: CR.ink3, marginTop: 12, lineHeight: 1.45 }}>Si pagás el total no pagás intereses. Si pagás solo el mínimo, el resto pasa al próximo resumen con interés.</div>
        <div style={{ marginTop: 16 }}>
          <div style={{ ...EYEBROW, padding: '0 2px 6px' }}>Movimientos del período</div>
          <Surface pad={0} style={{ padding: '2px 16px' }}>
            {st.movs.map((m, i) => <React.Fragment key={i}>{i > 0 && <Divider />}<MoveRow icon={m.icon} coin={m.coin} title={m.title} date={m.date} amount={m.amount} sign={m.sign} /></React.Fragment>)}
          </Surface>
        </div>
      </div>
    </Screen>);
}

// ── Pagar: sheet con total / mínimo / otro monto ────────────────
function PagarSheet({ S, initial = 'total', onClose, onPay, onAddFunds }) {
  const st = S.statement;
  const saldo = M.saldoImpago(st);
  const [opt, setOpt] = useStateS(initial);
  const [otro, setOtro] = useStateS(Math.round(saldo / 2));
  const amount = opt === 'total' ? saldo : opt === 'minimo' ? Math.min(st.minimo, saldo) : Math.min(otro, saldo);
  const have = S.balances.ARS;
  const ok = have >= amount;
  return (
    <div style={{ padding: '6px 2px 2px' }}>
      <div style={{ font: '500 20px Geist', letterSpacing: '-0.01em', color: CR.ink }}>Pagar el resumen</div>
      <div style={{ font: '400 13px Inter', color: CR.ink3, marginTop: 3 }}>Desde tus pesos · tenés {M.fmtArs(have)}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
        {[['total', 'El total', M.fmtArs(saldo), 'Sin intereses'], ['minimo', 'El mínimo', M.fmtArs(Math.min(st.minimo, saldo)), 'El resto pasa al próximo resumen con interés'], ['otro', 'Otro monto', null, null]].map(([id, t, v, s]) =>
        <OptionCard key={id} selected={opt === id} onClick={() => setOpt(id)} pad={14}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Radio on={opt === id} />
              <div style={{ flex: 1 }}>
                <div style={{ font: '500 16px Geist', color: CR.ink }}>{t}</div>
                {s && <div style={{ font: '400 12px Inter', color: CR.ink3, marginTop: 1 }}>{s}</div>}
              </div>
              {v && <span style={{ font: '500 16px Geist', color: CR.ink }}>{v}</span>}
            </div>
            {id === 'otro' && opt === 'otro' &&
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="range" min={Math.min(st.minimo, saldo)} max={saldo} step={1000} value={Math.min(otro, saldo)} onChange={(e) => setOtro(+e.target.value)} style={{ flex: 1, accentColor: '#141414' }} />
                <span style={{ font: '500 16px Geist', color: CR.ink, minWidth: 96, textAlign: 'right' }}>{M.fmtArs(Math.min(otro, saldo))}</span>
              </div>}
          </OptionCard>)}
      </div>
      {!ok && <div style={{ marginTop: 10 }}><Notice tone="warn" title={`Te faltan ${M.fmtArs(amount - have)} en pesos`} body="Depositá pesos o pagá un monto menor. (Prototipo: el botón suma el faltante a tu saldo.)" actions={<MiniBtn tone="dark" icon="deposit" onClick={() => onAddFunds && onAddFunds('ARS', amount - have)}>Depositar {M.fmtArs(amount - have)}</MiniBtn>} /></div>}
      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Btn variant="primary" disabled={!ok || amount <= 0} onClick={() => onPay(amount)}>Pagar {M.fmtArs(amount)}</Btn>
        <Btn variant="ghost" onClick={onClose}>Ahora no</Btn>
      </div>
    </div>);
}

// ── Consumos del período ────────────────────────────────────────
// Sigue la estructura de la pantalla que existe hoy (Jero, 29/09, con el
// detalle del diseño en mano): «Consumiste hasta el momento», los dos montos
// con su moneda al lado, cierre y vencimiento en una fila, las dos acciones, y
// después PAGOS ADELANTADOS Y DEVOLUCIONES y CONSUMOS, con la aclaración al
// pie. Lo que suma esta propuesta son los PERÍODOS ANTERIORES: el historial
// deja de vivir en un mail.
const TAG_ARS = '#2F6FE0', TAG_USD = '#0E9F57';

const MontoMoneda = ({ value, prefix, moneda, color }) =>
<div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
    <BigAmount value={value} prefix={prefix} size={30} cents />
    <span style={{ font: '400 15px Inter', color, paddingBottom: 4 }}>{moneda}</span>
  </div>;

function ConsumosScreen({ S, onBack, onVerResumen, onPagar }) {
  const t = T().consumos;
  const c = S.card, d = M.cycleDates(c.cierre, S.hoy);
  const movs = S.period.movs || [];
  const consumos = movs.filter((m) => m.kind === 'consumo');
  // Pagos adelantados y devoluciones: todo lo que suma a favor del usuario
  const creditos = movs.filter((m) => m.kind === 'credito' || m.kind === 'pago');
  const prev = M.previousCycleDates(c.cierre, S.hoy);
  const st = S.statement;
  const saldo = M.saldoImpago(st);
  const anteriores = st ? [{ mes: st.periodo, pagado: saldo <= 0, total: st.totalArs }] : [];
  for (let i = 1; i <= 2; i++) {
    const cl = new Date(prev.cierre.getFullYear(), prev.cierre.getMonth() - i, prev.cierre.getDate());
    anteriores.push({ mes: M.MESES[cl.getMonth()], pagado: true, total: null });
  }
  const lista = (items) => items.map((m, i) =>
  <React.Fragment key={i}>{i > 0 && <Divider />}
      <MoveRow icon={m.icon} coin={m.coin} title={m.title} date={m.date} amount={m.amount} sub={m.sub} estado={m.estado} sign={m.sign} />
    </React.Fragment>);

  return (
    <Screen bg={CR.page}>
      <StepHeader title={t.header} onBack={onBack} />
      <div style={{ padding: '4px 16px 16px' }}>
        <div style={{ font: '500 16px Inter', color: CR.ink }}>{t.titulo}</div>
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <MontoMoneda value={S.period.consumidoArs} moneda="ARS" color={TAG_ARS} />
          <MontoMoneda value={S.period.consumidoUsd} prefix="US$ " moneda="USD" color={TAG_USD} />
        </div>
        <div style={{ display: 'flex', gap: 24, marginTop: 14, font: '500 14px Inter', color: CR.ink3 }}>
          <span>{T().tpl(t.cierre_label, { fecha: M.fmtDate(d.cierre) })}</span>
          <span>{T().tpl(t.vto_label, { fecha: M.fmtDate(d.vencimiento) })}</span>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          {saldo > 0 && <MiniBtn tone="dark" icon="deposit" onClick={() => onPagar && onPagar('total')}>{t.cta_pagar}</MiniBtn>}
          <MiniBtn tone="light" icon="receipt" onClick={onVerResumen}>{t.cta_resumen}</MiniBtn>
        </div>

        <div style={{ ...EYEBROW, margin: '30px 2px 8px' }}>{t.sec_creditos}</div>
        <Surface pad={0} style={{ padding: creditos.length ? '2px 16px' : '16px' }}>
          {creditos.length ? lista(creditos) :
          <div style={{ font: '400 13px Inter', color: CR.ink3, lineHeight: 1.45 }}>{t.sin_creditos}</div>}
        </Surface>

        <div style={{ ...EYEBROW, margin: '26px 2px 8px' }}>{t.sec_consumos}</div>
        <Surface pad={0} style={{ padding: '2px 16px' }}>{lista(consumos)}</Surface>
        <div style={{ font: '400 12px Inter', color: CR.ink3, lineHeight: 1.5, margin: '14px 2px 0' }}>{t.nota}</div>

        <div style={{ ...EYEBROW, margin: '30px 2px 4px' }}>{t.anteriores}</div>
        <div style={{ font: '400 12px Inter', color: CR.ink3, margin: '0 2px 8px', lineHeight: 1.45 }}>{t.anteriores_sub}</div>
        <Surface pad={16}>
          {anteriores.map((p, i) =>
          <InfoRow key={i} label={T().tpl(t.anterior_row, { mes: p.mes })} value={p.total != null ? M.fmtArs(p.total) : '—'}
            sub={p.pagado ? t.anterior_pagado : t.anterior_impago} last={i === anteriores.length - 1}
            onClick={i === 0 && onVerResumen ? onVerResumen : undefined} />)}
        </Surface>
      </div>
    </Screen>);
}

Object.assign(window, { AUTOPAY_SHORT, RetiroSheet, RetiroPagoSheet, RespaldoPicker, OrderSummary, OrderConfirm, CierrePicker, AutopayCuanto, WalletScreen, ActivadaSheet, TresNumeros, EstadoAviso, TarjetasHome, LimiteRespaldoScreen, StatementScreen, PagarSheet, ConsumosScreen });
