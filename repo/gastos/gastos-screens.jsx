// Mis gastos — pantallas: home (cómo viene tu mes, de un vistazo),
// buscador (período + categorías + medio de pago), detalle de movimiento
// (sheet) y splash de primer uso.
const { useState: useStateS, useEffect: useEffectS, useMemo: useMemoS } = React;

// ── Home: responde rápido "¿cuánto y en qué vengo gastando este mes?" ──
// La historia: entrás con miedo → primero el veredicto (¿estoy bien?),
// después la verdad fría (el número), después el detalle. El ambiente
// (degradé superior) acompaña el estado del mes.
const G_VERDICTS = {
  low: { tint: '#EAF6C9', text: 'Venís gastando menos que de costumbre.' },
  ok: { tint: '#EAF6C9', text: 'Todo en orden: venís a tu ritmo de siempre.' },
  warn: { tint: '#FFF3E6', text: 'Venís un poco arriba de tu ritmo habitual.' },
  high: { tint: '#FBE3E3', text: 'Este mes se te está yendo más que de costumbre.' }
};

function MisGastosHome({ onBack, onBuscar, onOpenMov }) {
  const info = useMemoS(() => periodInfo('month', dayStart(G_TODAY)), []);
  const summary = useMemoS(() => ExpensesRepository.getSummary(info), []);
  const recent = useMemoS(() => ExpensesRepository.getMovements(info).slice(0, 4), []);
  const mes = G_MESES[G_TODAY.getMonth()];

  const delta = summary.total - summary.prevTotal;
  const up = delta > 0;
  const deltaColor = up ? '#C32432' : '#0F7A35';

  // veredicto contra tu propio ritmo (promedio de los últimos 3 meses a esta altura)
  const usual = summary.usual;
  const ratio = usual > 0 ? (summary.total - usual) / usual : null;
  const status = ratio == null ? 'ok' : ratio <= -0.08 ? 'low' : ratio < 0.08 ? 'ok' : ratio < 0.22 ? 'warn' : 'high';
  const verdict = G_VERDICTS[status];

  return (
    <GScreen>
      <div style={{ position: 'relative', padding: '2px 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ambiente: el color de fondo cuenta cómo venís, sin gritar */}
        <div style={{ position: 'absolute', left: -16, right: -16, top: -50, height: 350, pointerEvents: 'none', background: `radial-gradient(110% 72% at 50% 0%, ${verdict.tint} 0%, rgba(255,255,255,0) 74%)`, transition: 'background .6s' }} />

        {/* título + acceso al buscador */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={onBack} style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: 0, marginLeft: -2, display: 'flex' }}>
              <LI name="arrow-back" size={24} color="#141414" />
            </button>
            <div style={{ font: '500 28px Geist', letterSpacing: '-0.02em', color: '#141414' }}>Mis gastos</div>
          </div>
          <button onClick={() => onBuscar()} style={{ width: 40, height: 40, borderRadius: 999, border: 0, background: 'rgba(8,8,9,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <LI name="search" size={20} color="#141414" />
          </button>
        </div>

        {/* 1º el veredicto, 2º el número frío que lo respalda */}
        <GReveal delay={40}>
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 9, padding: '12px 8px 2px' }}>
            <span style={{ font: '600 11px Inter', letterSpacing: '0.08em', color: '#818181', textTransform: 'uppercase' }}>{mes} · Día {G_TODAY.getDate()}</span>
            <span style={{ font: '500 21px Geist', letterSpacing: '-0.01em', color: '#141414', lineHeight: 1.3, maxWidth: 300 }}>{verdict.text}</span>
            <GCountUp fromZero delay={420} duration={950} to={summary.total} render={(v) => <GBigAmount value={v} />} />
            {usual != null &&
              <span style={{ font: '400 12px Inter', color: '#818181' }}>Tu mes típico, a esta altura: {gFmt(usual)}</span>}
          </div>
        </GReveal>

        {/* en qué: diagrama de barras de los grupos más grandes */}
        <GReveal delay={220}>
          <Surface pad={16}>
            <div style={{ font: '500 15px Geist', letterSpacing: '-0.01em', color: '#141414', marginBottom: 16 }}>En qué se te va</div>
            <GBarChart byCategory={summary.byCategory} delay={480} onTap={(c) => onBuscar(c.others ? null : c.id)} />
          </Surface>
        </GReveal>

        {/* la verdad fría, en dos datos: vs junio + qué movió la aguja */}
        <GReveal delay={360}>
          <Surface pad={'6px 16px'}>
            <GDataRow icon="returns"
              label={`vs. ${info.prevName} a esta altura`}
              value={summary.prevTotal > 0 ? `${up ? '+' : '−'} ${gFmt(Math.abs(delta))} · ${up ? '▲' : '▼'} ${Math.round(Math.abs(delta) / summary.prevTotal * 100)}%` : '—'}
              valueColor={deltaColor} />
            {summary.insight &&
              <>
                <Divider />
                <GDataRow iconEl={<GCatIcon cat={summary.insight.cat} size={36} />}
                  label={`Tu mayor ${summary.insight.delta > 0 ? 'suba' : 'baja'}: ${summary.insight.cat.name}`}
                  value={`${summary.insight.delta > 0 ? '+' : '−'} ${gFmt(Math.abs(summary.insight.delta))}`}
                  valueColor={summary.insight.delta > 0 ? '#C32432' : '#0F7A35'} />
              </>}
          </Surface>
        </GReveal>

        {/* acceso al buscador, con pinta de buscador */}
        <GReveal delay={470}>
          <button onClick={() => onBuscar()} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', height: 48, padding: '0 16px', background: '#fff', border: `1px solid ${LX.border}`, borderRadius: 999, cursor: 'pointer', boxShadow: 'var(--shadow-card)' }}>
            <LI name="filter" size={18} color="#141414" />
            <span style={{ flex: 1, textAlign: 'left', font: '400 14px Inter', color: '#818181' }}>Buscar por período, categoría o comercio</span>
            <LI name="arrow-foward" size={16} color="#B4B4B4" />
          </button>
        </GReveal>

        {/* últimos movimientos */}
        {recent.length > 0 &&
          <GReveal delay={570}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '4px 2px 10px' }}>
                <span style={{ font: '500 15px Geist', letterSpacing: '-0.01em', color: '#141414' }}>Últimos movimientos</span>
                <button onClick={() => onBuscar()} style={{ border: 0, background: 'transparent', cursor: 'pointer', font: '600 13px Inter', color: 'var(--c-greent-50)', padding: 0 }}>Ver todos</button>
              </div>
              <Surface pad={'4px 14px'}>
                {recent.map((m, i) =>
                  <React.Fragment key={m.id}>
                    {i > 0 && <Divider />}
                    <GMovRow mov={m} onTap={() => onOpenMov(m)} />
                  </React.Fragment>)}
              </Surface>
            </div>
          </GReveal>}
      </div>
    </GScreen>);
}

// ── Buscador: período + categorías + medio de pago + comercio ───
function GastosBuscador({ filters, setFilters, onBack, onOpenMov }) {
  const { unit, anchor, cats, methods, text } = filters;
  const set = (patch) => setFilters({ ...filters, ...patch });
  const info = useMemoS(() => periodInfo(unit, anchor), [unit, +anchor]);
  const movs = useMemoS(() => ExpensesRepository.query(info, { cats, methods, text }), [unit, +anchor, cats, methods, text]);
  const total = movs.reduce((a, m) => a + m.amount, 0);
  const buckets = useMemoS(() => bucketize(info, movs), [movs]);
  const elapsed = buckets.filter((b) => !b.future);
  const avgBucket = elapsed.length ? elapsed.reduce((a, b) => a + b.total, 0) / elapsed.length : 0;
  const singleCat = cats.length === 1 ? cats[0] : null;
  const merchants = useMemoS(() => singleCat ? ExpensesRepository.getTopMerchants(info, singleCat) : [], [unit, +anchor, singleCat]);
  const maxMerchant = merchants.length ? merchants[0].total : 1;
  const hasFilters = cats.length > 0 || methods.length > 0 || text.trim().length > 0;

  const toggle = (list, id) => list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
  const Label = ({ children }) =>
    <div style={{ font: '600 12px Inter', color: LX.text3, letterSpacing: '0.02em', textTransform: 'uppercase', margin: '0 2px 10px' }}>{children}</div>;

  return (
    <GScreen>
      <div style={{ animation: 'screenIn .25s ease both' }}>
        <StepHeader title="Buscar gastos" onBack={onBack} />
        <div style={{ padding: '2px 16px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* 1. período */}
          <div>
            <Label>Período</Label>
            <Surface pad={12}>
              <GSegControl unit={unit} onChange={(u) => set({ unit: u, anchor: dayStart(G_TODAY) })} />
              <div style={{ marginTop: 10 }}>
                <GPeriodNav info={info} onPrev={() => set({ anchor: info.prevAnchor })} onNext={() => set({ anchor: info.nextAnchor })} />
              </div>
            </Surface>
          </div>

          {/* 2. categorías */}
          <div>
            <Label>Categorías</Label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <GFilterChip active={cats.length === 0} onTap={() => set({ cats: [] })} label="Todas" />
              {G_CATS.map((c) =>
                <GFilterChip key={c.id} active={cats.includes(c.id)} onTap={() => set({ cats: toggle(cats, c.id) })}
                  icon={c.icon} color={c.color} label={c.short} />)}
            </div>
          </div>

          {/* 3. medio de pago */}
          <div>
            <Label>Medio de pago</Label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <GFilterChip active={methods.length === 0} onTap={() => set({ methods: [] })} label="Todos" />
              {Object.entries(G_METHODS).map(([id, m]) =>
                <GFilterChip key={id} active={methods.includes(id)} onTap={() => set({ methods: toggle(methods, id) })}
                  icon={m.icon} label={m.label} />)}
            </div>
          </div>

          {/* 4. comercio */}
          <div>
            <Label>Comercio</Label>
            <GSearchInput value={text} onChange={(v) => set({ text: v })} />
          </div>

          {/* resultados */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '2px 2px 10px' }}>
              <span style={{ font: '500 15px Geist', letterSpacing: '-0.01em', color: '#141414' }}>Resultados</span>
              {hasFilters &&
                <button onClick={() => set({ cats: [], methods: [], text: '' })} style={{ border: 0, background: 'transparent', cursor: 'pointer', font: '600 13px Inter', color: 'var(--c-greent-50)', padding: 0 }}>Limpiar filtros</button>}
            </div>

            {movs.length === 0 ?
              <Surface pad={0}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 6, padding: '34px 32px' }}>
                  <div style={{ width: 64, height: 64, borderRadius: 999, background: 'var(--c-lime-10)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                    <LI name="search-off" size={30} color="var(--c-lime-60)" />
                  </div>
                  <div style={{ font: '500 16px Geist', letterSpacing: '-0.01em', color: '#141414' }}>Sin resultados</div>
                  <div style={{ font: '400 13px Inter', color: '#818181', lineHeight: 1.5 }}>No hay gastos que coincidan.{hasFilters ? ' Probá con otros filtros.' : ''}</div>
                </div>
              </Surface> :
              <>
                {/* resumen de la selección + ritmo */}
                <Surface pad={16}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div>
                      <div style={{ font: '400 12px Inter', color: '#818181', marginBottom: 4 }}>{movs.length} {movs.length === 1 ? 'movimiento' : 'movimientos'} · {info.label}</div>
                      <GCountUp to={total} render={(v) => <GBigAmount value={v} size={28} />} />
                    </div>
                    <span style={{ font: '400 11.5px Inter', color: '#818181', paddingBottom: 3 }}>
                      prom. {gFmtCompact(avgBucket)}{unit === 'year' ? '/mes' : unit === 'day' ? '' : '/día'}
                    </span>
                  </div>
                  <GRhythmChart buckets={buckets} avgBucket={avgBucket} />
                </Surface>

                {/* top comercios cuando mirás una sola categoría */}
                {singleCat && merchants.length > 0 &&
                  <Surface pad={16} style={{ marginTop: 12 }}>
                    <div style={{ font: '500 15px Geist', letterSpacing: '-0.01em', color: '#141414', marginBottom: 6 }}>Top comercios</div>
                    {merchants.slice(0, 5).map((m, i) =>
                      <React.Fragment key={m.mid}>
                        {i > 0 && <Divider />}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
                          <GMerchantAvatar name={m.name} cat={G_CAT[singleCat]} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ font: '500 14px Geist', letterSpacing: '-0.01em', color: '#141414', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</div>
                            <div style={{ marginTop: 6 }}><Meter value={m.total / maxMerchant} color={G_CAT[singleCat].color} h={5} /></div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ font: '500 14px Geist', letterSpacing: '-0.01em', color: '#141414' }}>{gFmt(m.total)}</div>
                            <div style={{ font: '400 11px Inter', color: '#B4B4B4', marginTop: 2 }}>{m.count} {m.count === 1 ? 'compra' : 'compras'}</div>
                          </div>
                        </div>
                      </React.Fragment>)}
                  </Surface>}

                {/* movimientos */}
                <div style={{ marginTop: 8 }}>
                  <GMovList movs={movs} onTap={onOpenMov} showChip={cats.length !== 1} />
                </div>
              </>}
          </div>
        </div>
      </div>
    </GScreen>);
}

// ── Detalle de movimiento (bottom sheet) ────────────────────────
function GMovSheet({ mov, open, onClose, onFlag }) {
  if (!mov) return null;
  const cat = G_CAT[mov.cat];
  const method = G_METHODS[mov.method];
  const d = mov.date;
  const fecha = cap1(`${G_DIAS[d.getDay()]} ${d.getDate()} de ${G_MESES[d.getMonth()]} · ${gHora(d)}`);
  const Row = ({ icon, label, value }) =>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 2px' }}>
      <div style={{ width: 36, height: 36, borderRadius: 999, background: 'rgba(8,8,9,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <LI name={icon} size={17} color="#141414" />
      </div>
      <span style={{ flex: 1, font: '400 13px Inter', color: '#818181' }}>{label}</span>
      <span style={{ font: '500 13px Inter', color: '#141414', textAlign: 'right' }}>{value}</span>
    </div>;
  return (
    <Sheet open={open} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 10, padding: '4px 0 10px' }}>
        <GMerchantAvatar name={mov.name} cat={cat} size={52} />
        <div style={{ font: '500 17px Geist', letterSpacing: '-0.01em', color: '#141414' }}>{mov.name}</div>
        <GBigAmount value={mov.amount} size={32} />
        <GCatChip cat={cat} size={12} />
      </div>
      <Divider style={{ margin: '2px 0 4px' }} />
      <Row icon="programed-tx" label="Fecha" value={fecha} />
      <Divider />
      <Row icon={method.icon} label="Medio de pago" value={method.label} />
      <Divider />
      {/* affordance de corrección: dummy en v1, alimenta el motor a futuro */}
      <button onClick={onFlag} style={{ width: '100%', border: 0, background: 'transparent', cursor: 'pointer', padding: '14px 2px 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, font: '600 13px Inter', color: '#818181' }}>
        <LI name="feedback-warning" size={15} color="#818181" /> ¿Está mal la categoría?
      </button>
      <Btn variant="light" onClick={onClose} style={{ marginTop: 10 }}>Cerrar</Btn>
    </Sheet>);
}

// ── Splash de primer uso ────────────────────────────────────────
function GastosSplash({ open, onClose }) {
  const [mounted, setMounted] = useStateS(false);
  const [shown, setShown] = useStateS(false);
  useEffectS(() => {
    if (open) { setMounted(true); const t = setTimeout(() => setShown(true), 30); return () => clearTimeout(t); }
    setShown(false);
    const t = setTimeout(() => setMounted(false), 300);
    return () => clearTimeout(t);
  }, [open]);
  if (!mounted) return null;
  const Feature = ({ icon, color, title, sub }) =>
    <div style={{ display: 'flex', alignItems: 'center', gap: 13, width: '100%' }}>
      <div style={{ width: 40, height: 40, borderRadius: 999, background: color + '1F', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <LI name={icon} size={20} color={color} />
      </div>
      <div style={{ flex: 1, textAlign: 'left' }}>
        <div style={{ font: '500 14px Geist', letterSpacing: '-0.01em', color: '#141414' }}>{title}</div>
        <div style={{ font: '400 12px Inter', color: '#818181', marginTop: 2, lineHeight: 1.4 }}>{sub}</div>
      </div>
    </div>;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', pointerEvents: shown ? 'auto' : 'none' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'var(--overlay)', opacity: shown ? 1 : 0, transition: 'opacity .3s' }} />
      <div style={{
        position: 'relative', background: '#fff', borderRadius: '30px 30px 0 0',
        transform: shown ? 'translateY(0)' : 'translateY(100%)', transition: 'transform .3s cubic-bezier(.2,.85,.25,1)',
        boxShadow: '0 -12px 44px rgba(0,0,0,0.24)', padding: '30px 22px calc(36px + env(safe-area-inset-bottom))',
        display: 'flex', flexDirection: 'column', gap: 22
      }}>
        <div>
          <div style={{ font: '500 27px Geist', lineHeight: '33px', letterSpacing: '-0.01em', color: '#141414' }}>Entendé en qué se va tu plata</div>
          <div style={{ font: '400 14px Inter', color: '#5E5E5E', marginTop: 8, lineHeight: 1.5 }}>Todos tus gastos — tarjeta, QR, servicios — juntos y ordenados por primera vez.</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Feature icon="summary" color="#00AA18" title="Tu mes, de un vistazo" sub="Cuánto llevás gastado, en qué, y cómo venís vs. el mes pasado." />
          <Feature icon="filter" color="#925DEE" title="Buscá y filtrá lo que quieras" sub="Por período, categoría, medio de pago o comercio." />
          <Feature icon="auto-complete-magic" color="#F0A20B" title="Sabé cómo termina el mes" sub="Una proyección simple de cierre, a tu ritmo de gasto real." />
        </div>
        <button onClick={onClose} style={{ width: '100%', height: 48, border: 0, borderRadius: 16, cursor: 'pointer', background: '#141414', color: '#fff', font: '600 16px Inter' }}>Ver mis gastos</button>
      </div>
    </div>);
}

Object.assign(window, { MisGastosHome, GastosBuscador, GMovSheet, GastosSplash });
