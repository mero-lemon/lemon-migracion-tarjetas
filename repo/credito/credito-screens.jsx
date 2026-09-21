// Pantallas de la Lemon Credit Card. Cada pantalla es una función pura de
// (estado, callbacks): así la vista de mapa puede renderizarlas todas con
// un estado prearmado. El selector de límite vive en credito-limite.jsx y
// TODOS los textos en credito-copy.js (ordenados por narrativa.md).
//
// Alta (Jero, 21/09) = límite → respaldo → cierre → débito automático →
// tu tarjeta → ya es tuya → Apple Pay. La tarjeta nace configurada y activa:
// no hay «activación» aparte, solo sumarla al celu cuando el usuario quiera.
const { useState: useStateS, useEffect: useEffectS, useRef: useRefS } = React;

const T = () => window.CreditoCopy;
const H1 = { font: '500 24px Geist', letterSpacing: '-0.02em', lineHeight: 1.15, color: CR.ink };
const SUB = { font: '400 14px Inter', lineHeight: 1.45, color: CR.ink2, marginTop: 6 };
const EYEBROW = { font: '600 12px Inter', letterSpacing: '0.06em', color: CR.ink3, textTransform: 'uppercase' };
const AUTOPAY_SHORT = { minimo: 'el mínimo', total: 'el total, pesos y dólares', total_pesos: 'el total en pesos' };
const autopayTitle = (mode) => ({ minimo: T().autopay.min_title, total: T().autopay.total_title, total_pesos: T().autopay.totalpesos_title })[mode];
const autopaySub = (mode) => ({ minimo: T().activated.autopay_min_sub, total: T().activated.autopay_total_sub, total_pesos: T().activated.autopay_totalpesos_sub })[mode];
const NOTE_BOX = { marginTop: 10, font: '400 12px Inter', color: CR.ink2, lineHeight: 1.45, background: '#F5F5F5', borderRadius: 12, padding: '8px 10px' };
// La misma card negra de «Elegí el límite» para la opción elegida
const invStyle = (inv, ok) => ({ background: inv ? CR.ink : ok ? '#fff' : 'var(--bg-layer-02)', boxShadow: inv ? '0 10px 28px rgba(20,20,20,0.18)' : ok ? 'var(--shadow-card)' : 'none', opacity: 1 });

// ═══════════════════════════════════════════════════════════════
// FLUJO 1 · Alta
// ═══════════════════════════════════════════════════════════════

// ── Elegí tu respaldo: dólar digital o Bitcoin, solo cuánto dejás ─
// El respaldo es tu garantía y tu seguro: te habilita el límite y sigue
// siendo tuyo. La relación con el límite (80%) vive en el helper.
function RespaldoPicker({ S, limit, value, onChange, onBack, onContinue, onAddFunds }) {
  const t = T().respaldo;
  const [sheet, setSheet] = useStateS(null); // 'help' | assetId
  const opts = M.RESPALDO_ASSETS.map((id) => ({ id, a: M.ASSETS[id], chk: M.check(limit, id, S.balances, S.prices, S.ratios) }));
  useEffectS(() => {
    const cur = opts.find((o) => o.id === value);
    if (!cur || !cur.chk.ok) { const f = opts.find((o) => o.chk.ok); onChange(f ? f.id : null); }
  }, [limit, S.balances.USDC, S.balances.BTC]);
  const sel = opts.find((o) => o.id === value);
  return (
    <div style={{ height: '100%', position: 'relative' }}>
      <Screen bg={CR.page} footer={<Btn variant="primary" disabled={!sel || !sel.chk.ok} onClick={onContinue}>{t.cta}</Btn>}>
        <StepHeader title="" onBack={onBack} />
        <div style={{ padding: '4px 16px 8px' }}>
          <div style={H1}>{t.h1}</div>
          {t.sub_opcional && <div style={SUB}>{t.sub_opcional}</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
            {opts.map(({ id, a, chk }) => {
              const inv = value === id && chk.ok;
              return (
              <OptionCard key={id} selected={inv} onClick={() => chk.ok ? onChange(id) : setSheet(id)} pad="20px 20px" style={invStyle(inv, chk.ok)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <AssetIcon id={id} size={44} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ font: '500 17px Geist', letterSpacing: '-0.01em', color: inv ? '#fff' : chk.ok ? CR.ink : CR.ink3 }}>{a.name}</div>
                    <div style={{ font: '400 14px Inter', color: inv ? 'rgba(255,255,255,0.8)' : chk.ok ? CR.ink2 : '#854600', marginTop: 4, lineHeight: 1.4 }}>
                      {chk.ok ? T().tpl(t.option_line, { monto: M.fmtUnits(chk.needUnits, id) })
                      : <>{T().tpl(t.locked_line, { faltante: M.fmtUnits(chk.faltanteUnits, id) })} · <span style={{ fontWeight: 600, color: 'var(--text-brand)' }}>Comprar</span></>}
                    </div>
                  </div>
                  {inv ? <SelCheck /> : chk.ok ? <Radio on={false} size={24} /> : <LI name="lock" size={20} color={CR.ink3} />}
                </div>
              </OptionCard>);
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 14 }}>
            <HelperLink onClick={() => setSheet('help')}>{t.helper_label}</HelperLink>
          </div>
        </div>
      </Screen>
      <Sheet open={sheet === 'help'} onClose={() => setSheet(null)}>
        <HelperSheet title={t.helper_title} close={t.helper_close} onClose={() => setSheet(null)}
          items={[['limits', t.helper_b1], ['return-money', t.helper_b2], ['stocks', t.helper_b3], ['shield-alt', t.helper_b4]]} />
      </Sheet>
      <Sheet open={!!sheet && sheet !== 'help'} onClose={() => setSheet(null)}>
        {sheet && sheet !== 'help' && <DepositoSheet asset={sheet} limite={limit} S={S} bal={S.balances} onClose={() => setSheet(null)}
          onSimulate={() => { const c = M.check(limit, sheet, S.balances, S.prices, S.ratios); onAddFunds(sheet, c.faltanteUnits); onChange(sheet); setSheet(null); }} />}
      </Sheet>
    </div>);
}

// ── Tu Lemon Credit Card: la tarjeta quieta, el título y lo que elegiste ─
// Último paso antes de que la tarjeta exista: acá ya están el cierre y el
// débito automático, porque se eligen antes de crearla. Las dos fechas van
// con ≈: quedan fijas recién cuando la tarjeta nace.
function OrderSummary({ S, onBack, onContinue }) {
  const t = T().pedido;
  const { asset, limit } = S.order;
  const chk = M.check(limit, asset, S.balances, S.prices, S.ratios);
  const a = M.ASSETS[asset];
  const d = S.draftCierre ? M.cycleDates(S.draftCierre, S.hoy) : null;
  const ap = S.draftAutopay && S.draftAutopay.on ? S.draftAutopay : null;
  return (
    <Screen bg={CR.page} footer={<Btn variant="primary" onClick={onContinue}>{t.cta}</Btn>}>
      <StepHeader title="" onBack={onBack} />
      <div style={{ padding: '4px 16px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0 14px' }}>
          <CardArt variant="credito" width={178} style={{ boxShadow: '0 22px 44px -14px rgba(20,20,20,0.35)' }} />
        </div>
        <div style={{ ...H1, textAlign: 'center' }}>{t.h1}</div>
        <div style={{ ...SUB, textAlign: 'center' }}>{t.sub}</div>
        <Surface pad={16} style={{ marginTop: 18 }}>
          <InfoRow label={t.row_limite} value={M.fmtArs(limit)} />
          <InfoRow label={t.row_respaldo} value={M.fmtUnits(chk.needUnits, asset)} sub={T().tpl(t.row_respaldo_sub, { ars: M.fmtArs(chk.needArs), activo: a.name.toLowerCase() })} />
          {d && <InfoRow label={t.row_cierre} value={`≈ ${M.fmtDate(d.cierre)}`} sub={T().tpl(t.row_cierre_sub, { vto: M.fmtDate(d.vencimiento) })} />}
          <InfoRow label={t.row_autopay} value={ap ? autopayTitle(ap.mode) : t.row_autopay_off} sub={ap ? autopaySub(ap.mode) : T().activated.autopay_off_sub} />
          <InfoRow label={t.row_mantenimiento} value={`${M.fmtArs(M.FEES.mantenimiento)}/mes`} strike tag={<Tag tone="positive">{T().tpl(t.tag_bonificado, { n: M.FEES.bonifMeses })}</Tag>} last />
        </Surface>
      </div>
    </Screen>);
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
// FLUJO 2 · Activación: cierre → débito automático → Apple Pay → listo
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Btn variant="ghost" onClick={onSkip}>{t.skip}</Btn>
          <Btn variant="primary" onClick={onContinue}>{t.cta}</Btn>
        </div>}>
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
                    <div style={{ font: '400 13px Inter', lineHeight: 1.45, color: CR.ink3, marginTop: 4 }}>{m.body}</div>
                  </div>
                  <Radio on={v.mode === m.id} />
                </div>
              </OptionCard>)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 14 }}>
            <HelperLink onClick={() => setHelp(true)}>{t.helper_label}</HelperLink>
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
function ActivatedScreen({ S, onGo }) {
  const t = T().activated;
  const c = S.card;
  const d = M.cycleDates(c.cierre, S.hoy);
  const ap = c.autopay && c.autopay.on ? c.autopay : null;
  return (
    <Screen bg={CR.page} footer={<Btn variant="primary" onClick={onGo}>{t.cta}</Btn>}>
      <div style={{ padding: '12px 16px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 18 }}>
        {c.nfc ?
        <div style={{ position: 'relative', width: '100%', height: 230, borderRadius: 24, overflow: 'hidden', animation: `ob-up .5s ${EASE}` }}>
            <img src="assets/nfc-hero.png" alt="" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 30%' }} />
            <HeroPill icon="feedback-positive">En tu billetera</HeroPill>
          </div> :
        <div style={{ padding: '18px 0 6px', animation: `ob-up .5s ${EASE}` }}><CardArt variant="credito" width={240} glow style={{ transform: 'rotate(-6deg)' }} /></div>}
        <div style={{ font: '500 26px Geist', letterSpacing: '-0.02em', lineHeight: 1.15, color: CR.ink, textWrap: 'balance', animation: `ob-up .5s .08s ${EASE} backwards` }}>{c.nfc ? t.h1 : t.h1_sin_wallet}</div>
        <div style={{ font: '400 15px Inter', lineHeight: 1.5, color: CR.ink2, maxWidth: 300, marginTop: -8, animation: `ob-up .5s .16s ${EASE} backwards` }}>{c.nfc ? t.sub : t.sub_sin_wallet}</div>
        <Surface pad={16} style={{ width: '100%', textAlign: 'left', animation: `ob-up .5s .24s ${EASE} backwards` }}>
          <InfoRow label={t.row_limite} value={M.fmtArs(c.limit)} />
          <InfoRow label={t.row_cierre} value={M.fmtDate(d.cierre)} sub={T().tpl(t.row_cierre_sub, { vto: M.fmtDate(d.vencimiento) })} />
          <InfoRow label={t.row_autopay} value={ap ? autopayTitle(ap.mode) : t.autopay_off} sub={ap ? autopaySub(ap.mode) : t.autopay_off_sub} last />
        </Surface>
      </div>
    </Screen>);
}

// ═══════════════════════════════════════════════════════════════
// FLUJO 3 · Landing (Lemon Card · Crédito)
// ═══════════════════════════════════════════════════════════════

// Los tres números, cada uno con su forma, en el orden de la app de hoy:
//  · CONSUMOS DEL PERÍODO: sección plana con cierre y vto del grupo elegido
//  · LÍMITE DISPONIBLE = número grande verde + «Límite total $X» → abre «Límite y respaldo»
//  · RESUMEN = tarjeta violeta tipo comprobante con «Pagar» (lo que DEBÉS)
// Nunca se muestra el límite en 0 con la tarjeta pausada ni congelada.
function TresNumeros({ S, n, onLimite, onVerResumen, onPagar, onConsumos }) {
  const th = T().home;
  const c = S.card, st = S.statement;
  const dNext = M.cycleDates(c.cierre, S.hoy);
  const saldo = M.saldoImpago(st);
  const diasVto = st ? M.daysBetween(S.hoy, st.vencimiento) : null;
  const vencido = st && saldo > 0 && diasVto < 0;
  const frozen = c.status === 'congelada', retiro = c.status === 'retiro', offline = frozen || retiro;
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
        {stateNote && <div style={NOTE_BOX}>{stateNote}</div>}
      </div>

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
          </Surface>) :
        <div style={{ font: '400 13px Inter', color: CR.ink3, lineHeight: 1.45 }}>{T().tpl(th.sin_resumen, { fecha: M.fmtDate(dNext.cierre) })}</div>}
      </div>
    </>);
}

// Aviso in-app según estado (lo que hoy sale solo por push)
function EstadoAviso({ S, onPagar, onReactivar, onRetiro }) {
  const te = T().estados;
  const c = S.card, st = S.statement;
  const saldo = M.saldoImpago(st);
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
    return <Notice tone="warn" icon="alert-time" title={T().tpl(te.vence_title, { cuando: dias === 0 ? 'hoy' : `en ${dias} días` })} body={T().tpl(te.vence_body, { minimo: M.fmtArs(st.minimo), fecha: M.fmtDate(st.vencimiento) })} actions={<MiniBtn onClick={() => onPagar('total')} tone="dark">Pagar ahora</MiniBtn>} />;
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
  if (c.status === 'retiro')
  return <Notice tone="info" icon="returns" title={te.retiro_title} body={te.retiro_body} />;
  return null;
}

// La landing «Lemon Card · Crédito», con la estructura de la app de hoy:
// header · solapas · card row · aviso · Consumos · Límite disponible ·
// Resumen · Actividad. Sin tarjeta: solo el promo con el render real.
function TarjetasHome({ S, onPedir, onLimite, onVerResumen, onPagar, onConsumos, onTogglePause, onSimDelivery, onActivate, onRetiro, onTab }) {
  const th = T().home, tw = T().home_wallet, tf = T().home_fisica;
  const c = S.card;
  const n = c ? M.tresNumeros({ limit: c.limit, consumido: S.period.consumidoArs, saldoImpago: M.saldoImpago(S.statement) }) : null;
  const aviso = c ? EstadoAviso({ S, onPagar, onReactivar: onTogglePause, onRetiro }) : null;
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

          {aviso && <div style={{ marginTop: 12 }}>{aviso}</div>}

          {/* la tarjeta ya nace activa: lo único pendiente es el celu */}
          {!c.nfc && c.status !== 'retiro' &&
          <Surface pad={20} style={{ marginTop: 12, textAlign: 'center' }}>
            <div style={{ font: '500 20px Geist', letterSpacing: '-0.02em', lineHeight: 1.15, color: CR.ink }}>{tw.title}</div>
            <div style={{ font: '400 13px Inter', color: CR.ink2, lineHeight: 1.45, marginTop: 8 }}>{tw.body}</div>
            <div style={{ marginTop: 16 }}><Btn variant="primary" onClick={() => onActivate('nfc')} style={{ padding: '16px 20px' }}>{tw.cta}</Btn></div>
          </Surface>}

          {c.fisica === 'camino' &&
          <>
            <Notice tone="info" icon="card-on" title={tf.title} body={tf.body} style={{ marginTop: 12 }} />
            <button onClick={onSimDelivery} style={{ marginTop: 10, width: '100%', border: '1px dashed #C9C9C4', background: 'transparent', cursor: 'pointer', borderRadius: 14, padding: '10px', font: '500 12px Inter', color: CR.ink3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <LI name="rocket" size={13} color={CR.ink3} /> Prototipo: simular que ya me llegó el plástico
            </button>
          </>}

          <TresNumeros S={S} n={n} onLimite={onLimite} onVerResumen={onVerResumen} onPagar={onPagar} onConsumos={onConsumos} />
          <div style={{ marginTop: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 2px 4px' }}>
              <span style={EYEBROW}>{th.sec_actividad}</span>
              <span style={{ flex: 1 }} />
              <LI name="arrow-foward" size={16} color={CR.ink3} />
            </div>
            {S.period.movs.slice(0, 4).map((m, i) => <MoveRow key={i} icon={m.icon} coin={m.coin} title={m.title} date={m.date} amount={m.amount} sign={m.sign} />)}
          </div>
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
  const deudaUnits = M.roundTo(deudaTotal / S.prices[c.asset], a.decimals);
  const restoUnits = Math.max(0, M.roundTo(c.respaldoUnits - deudaUnits, a.decimals));
  const [sheet, setSheet] = useStateS(openRetiro ? 'retiro' : null); // 'retiro' | 'saber'
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
                <div style={{ font: '400 12px Inter', color: CR.ink3, marginTop: 2 }}>{T().tpl(t.apartaste_sub, { ars: M.fmtArs(rArs), pct: M.fmtPct(M.limitShare(ratio)) })}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14, alignItems: 'center' }}>
              {c.status !== 'retiro' && <MiniBtn tone="ghost" icon="returns" onClick={() => setSheet('retiro')}>{t.retirar_cta}</MiniBtn>}
              <button onClick={() => setSheet('saber')} style={{ border: 0, background: 'transparent', cursor: 'pointer', font: '600 12px Inter', color: CR.ink3, padding: '8px 6px' }}>{t.saber_mas}</button>
            </div>
          </Surface>
        </div>
      </Screen>

      <Sheet open={sheet === 'retiro'} onClose={() => setSheet(null)}>
        <div style={{ padding: '6px 2px 2px' }}>
          <div style={{ font: '500 20px Geist', letterSpacing: '-0.01em', color: CR.ink }}>Retirar el respaldo</div>
          <div style={{ font: '400 13px Inter', color: CR.ink3, marginTop: 3, lineHeight: 1.45 }}>La tarjeta se da de baja. Así queda la cuenta:</div>
          <Surface pad={16} style={{ marginTop: 14 }}>
            <InfoRow label="Tu respaldo" value={M.fmtUnits(c.respaldoUnits, c.asset)} />
            <InfoRow label="Lo que debés hoy" value={`− ${M.fmtArs(deudaTotal)}`} sub={deudaTotal > 0 ? `≈ ${M.fmtUnits(deudaUnits, c.asset)} · se paga con el respaldo` : 'No debés nada'} />
            <InfoRow label="Vuelve a tu saldo" value={M.fmtUnits(restoUnits, c.asset)} sub="Hasta 48 h hábiles" last />
          </Surface>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Btn variant="primary" onClick={() => { setSheet(null); onRetiro(); }}>Confirmar el retiro</Btn>
            <Btn variant="ghost" onClick={() => setSheet(null)}>Volver</Btn>
          </div>
        </div>
      </Sheet>
      <Sheet open={sheet === 'saber'} onClose={() => setSheet(null)}>
        <HelperSheet title={t.saber_title} close={t.saber_close} onClose={() => setSheet(null)}
          items={[['limits', t.saber_b1], ['return-money', t.saber_b2], ['stocks', t.saber_b3], ['shield-alt', t.saber_b4]]} />
      </Sheet>
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

// ── Consumos del período (lista) ────────────────────────────────
function ConsumosScreen({ S, onBack }) {
  const c = S.card, d = M.cycleDates(c.cierre, S.hoy);
  return (
    <Screen bg={CR.page}>
      <StepHeader title={T().home.sec_consumos} onBack={onBack} />
      <div style={{ padding: '4px 16px 16px' }}>
        <BigAmount value={S.period.consumidoArs} size={36} />
        <div style={{ font: '400 12px Inter', color: CR.ink3, marginTop: 4 }}>Desde el {M.fmtDate(M.addDays(M.previousCycleDates(c.cierre, S.hoy).cierre, 1))} · cierra el {M.fmtDate(d.cierre)} y vence el {M.fmtDate(d.vencimiento)}</div>
        <Surface pad={0} style={{ padding: '2px 16px', marginTop: 14 }}>
          {S.period.movs.filter((m) => m.kind === 'consumo').map((m, i) => <React.Fragment key={i}>{i > 0 && <Divider />}<MoveRow icon={m.icon} title={m.title} date={m.date} amount={m.amount} sign={m.sign} /></React.Fragment>)}
        </Surface>
      </div>
    </Screen>);
}

Object.assign(window, { AUTOPAY_SHORT, RespaldoPicker, OrderSummary, OrderConfirm, CierrePicker, AutopayCuanto, WalletScreen, ActivatedScreen, TresNumeros, EstadoAviso, TarjetasHome, LimiteRespaldoScreen, StatementScreen, PagarSheet, ConsumosScreen });
