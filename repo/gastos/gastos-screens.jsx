// Mis gastos — pantallas: home (cómo viene tu mes, de un vistazo),
// buscador (período + categorías + medio de pago), detalle de movimiento
// (sheet) y splash de primer uso.
const { useState: useStateS, useEffect: useEffectS, useMemo: useMemoS } = React;

// ── Home: responde rápido "¿cuánto y en qué vengo gastando este mes?" ──
// La historia: entrás con miedo → primero el veredicto (¿estoy bien?),
// después la verdad fría (el número), después el detalle. El ambiente
// (degradé superior) acompaña el estado del mes.
// La carrera del mes: tu plata corre contra los días. Si al día 20
// consumiste menos del 20/31 de tu mes típico, le vas ganando.
const G_VERDICTS = {
  low: { tint: '#EAF6C9', text: 'Le vas ganando al mes.', fill: 'linear-gradient(90deg, #00CA57, #CFFF2E)' },
  ok: { tint: '#EAF6C9', text: 'Vas palo a palo con el mes.', fill: 'linear-gradient(90deg, #96C400, #CFFF2E)' },
  warn: { tint: '#FFF3E6', text: 'El mes te saca una ventaja corta.', fill: 'linear-gradient(90deg, #F0A20B, #FFA53F)' },
  high: { tint: '#FBE3E3', text: 'Este mes tu plata corre más rápido que los días.', fill: 'linear-gradient(90deg, #EA2B3C, #FF7933)' }
};

function MisGastosHome({ onBack, onBuscar, onOpenMov }) {
  const info = useMemoS(() => periodInfo('month', dayStart(G_TODAY)), []);
  const summary = useMemoS(() => ExpensesRepository.getSummary(info), []);
  const recent = useMemoS(() => ExpensesRepository.getMovements(info).slice(0, 4), []);
  const mes = G_MESES[G_TODAY.getMonth()];

  const delta = summary.total - summary.prevTotal;
  const up = delta > 0;

  // la carrera: cuántos "días de plata" consumiste vs. cuántos días pasaron
  const usualFull = summary.usualFull;
  const timePct = info.elapsedDays / info.totalDays;
  const moneyPct = usualFull > 0 ? summary.total / usualFull : null;
  const diff = moneyPct == null ? null : info.elapsedDays - moneyPct * info.totalDays; // >0 → vas adelante
  const status = diff == null ? 'ok' : diff >= 1 ? 'low' : diff > -1 ? 'ok' : diff > -3.5 ? 'warn' : 'high';
  const verdict = G_VERDICTS[status];
  // vs. junio: verde si gastaste menos, amarillo si fluctuó ±5% (normal), rojo si te pasaste
  const deltaPct = summary.prevTotal > 0 ? delta / summary.prevTotal : 0;
  const deltaColor = Math.abs(deltaPct) <= 0.05 ? '#D67100' : deltaPct < 0 ? '#0F7A35' : '#C32432';
  const raceCall = diff == null ? null :
    Math.abs(diff) < 1 ? 'Palo a palo: tu plata 💸 va justo donde está parado el calendario 📅.' :
    diff > 0 ? 'Tu plata 💸 todavía no alcanzó al calendario 📅: vas ganando.' :
    'Tu plata 💸 ya pasó al calendario 📅: vas gastando adelantado.';

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
          </div>
        </GReveal>

        {/* la carrera del mes, en un solo carril: el relleno es tu plata,
            la marca 📅 es el calendario, la meta 🏁 es tu mes típico.
            Indicador simple, sin números — lo que queda claro es el
            progreso del mes. */}
        {moneyPct != null &&
          <GReveal delay={200}>
            <Surface pad={16}>
              <span style={{ font: '500 15px Geist', letterSpacing: '-0.01em', color: '#141414' }}>La carrera del mes</span>
              <GRaceTrack
                timePct={timePct} moneyPct={moneyPct} moneyFill={verdict.fill}
                bottomRight={`Día ${info.elapsedDays} de ${info.totalDays}`}
                delay={520} />
              <div style={{ font: '400 11.5px Inter', color: '#818181', lineHeight: 1.45, marginTop: 10 }}>
                {raceCall} La meta 🏁 es tu mes típico (promedio de los últimos 3).
              </div>
            </Surface>
          </GReveal>}

        {/* en qué: diagrama de barras de los grupos más grandes */}
        <GReveal delay={340}>
          <Surface pad={16}>
            <div style={{ font: '500 15px Geist', letterSpacing: '-0.01em', color: '#141414', marginBottom: 16 }}>En qué se te va</div>
            <GBarChart byCategory={summary.byCategory} delay={600} onTap={(c) => onBuscar(c.others ? null : c.id)} />
          </Surface>
        </GReveal>

        {/* la verdad fría, en dos datos: vs junio + qué movió la aguja */}
        <GReveal delay={460}>
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

        {/* últimos movimientos */}
        {recent.length > 0 &&
          <GReveal delay={560}>
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

// ── Artes del splash (SVG a mano, estilo piezas de Cofres) ──────
// Barras por categoría que crecen + moneda que cae
const GArtBars = ({ size = 158, animate }) =>
  <svg width={size} height={size * 0.86} viewBox="0 0 240 206" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="120" cy="106" r="92" fill="#EAF6C9" />
    {[[54, 86, '#00AA18'], [96, 62, '#FF8700'], [138, 44, '#08C7E0'], [180, 30, '#925DEE']].map(([x, h, c], i) =>
      <g key={i} style={{ filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.16))' }}>
        <rect x={x} y={168 - h} width="30" height={h} rx="9" fill={c}
          style={animate ? { animation: `lc-grow-y .55s cubic-bezier(.25,.85,.3,1) ${0.25 + i * 0.09}s both`, transformOrigin: `${x + 15}px 168px` } : null} />
      </g>)}
    <rect x="46" y="168" width="172" height="6" rx="3" fill="rgba(8,8,9,0.12)" />
    {/* moneda cayendo */}
    <g style={animate ? { animation: 'lc-coin-drop 1.2s cubic-bezier(.3,1.4,.5,1) both', animationDelay: '.5s' } : null}>
      <circle cx="120" cy="46" r="16" fill="#141414" />
      <circle cx="120" cy="46" r="16" fill="none" stroke="#CFFF2E" strokeWidth="2.5" />
      <text x="120" y="52" textAnchor="middle" fill="#CFFF2E" style={{ font: '700 18px Inter' }}>$</text>
    </g>
    <path d="M46 58l3.5 8 8 3.5-8 3.5-3.5 8-3.5-8-8-3.5 8-3.5Z" fill="#96C400" />
    <path d="M198 44l2.5 5.5 5.5 2.5-5.5 2.5-2.5 5.5-2.5-5.5-5.5-2.5 5.5-2.5Z" fill="#00AA18" />
  </svg>;

// La carrera: la pista con el relleno corriendo hacia la marca 📅 y la meta 🏁
const GArtRace = ({ size = 158, animate }) =>
  <svg width={size} height={size * 0.86} viewBox="0 0 240 206" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gRaceFill" x1="42" y1="0" x2="150" y2="0" gradientUnits="userSpaceOnUse">
        <stop stopColor="#00CA57" /><stop offset="1" stopColor="#CFFF2E" />
      </linearGradient>
    </defs>
    <circle cx="120" cy="106" r="92" fill="#EAF6C9" />
    <g style={{ filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.14))' }}>
      <rect x="42" y="92" width="156" height="30" rx="15" fill="#fff" />
    </g>
    <rect x="42" y="92" width="106" height="30" rx="15" fill="url(#gRaceFill)"
      style={animate ? { animation: 'lc-grow-x 1.1s cubic-bezier(.3,.85,.3,1) .35s both', transformOrigin: '42px 107px' } : null} />
    <text x="140" y="114" textAnchor="middle" style={{ fontSize: 17, ...(animate ? { animation: 'lc-pop .4s cubic-bezier(.3,1.4,.5,1) 1.3s both' } : {}) }}>💸</text>
    {/* la marca del calendario */}
    <rect x="160" y="84" width="3" height="46" rx="1.5" fill="#141414" />
    <text x="162" y="76" textAnchor="middle" style={{ fontSize: 15 }}>📅</text>
    <text x="186" y="114" textAnchor="middle" style={{ fontSize: 14, opacity: 0.7 }}>🏁</text>
    {/* chip: vas ganando */}
    <g style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.16))' }}>
      <rect x="76" y="140" width="90" height="26" rx="13" fill="#141414" />
      <text x="121" y="157" textAnchor="middle" fill="#CFFF2E" style={{ font: '600 12px Inter' }}>vas ganando</text>
    </g>
    <path d="M50 56l3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" fill="#96C400" />
    <path d="M196 150l2.5 5.5 5.5 2.5-5.5 2.5-2.5 5.5-2.5-5.5-5.5-2.5 5.5-2.5Z" fill="#00AA18" />
  </svg>;

// El buscador: lupa sobre movimientos, uno resaltado en lime
const GArtSearch = ({ size = 158, animate }) =>
  <svg width={size} height={size * 0.86} viewBox="0 0 240 206" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="120" cy="106" r="92" fill="#EAF6C9" />
    {[[62, '#fff'], [90, '#CFFF2E'], [118, '#fff'], [146, '#fff']].map(([y, c], i) =>
      <g key={i} style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.10))', ...(animate ? { animation: `lc-pop .4s cubic-bezier(.3,1.4,.5,1) ${0.25 + i * 0.09}s both` } : {}) }}>
        <rect x="52" y={y} width="118" height="20" rx="10" fill={c} />
        <circle cx="64" cy={y + 10} r="6" fill={c === '#CFFF2E' ? '#141414' : 'rgba(8,8,9,0.14)'} />
        <rect x="76" y={y + 7} width={54 - i * 6} height="6" rx="3" fill={c === '#CFFF2E' ? 'rgba(8,8,8,0.45)' : 'rgba(8,8,9,0.14)'} />
      </g>)}
    {/* lupa */}
    <g style={{ filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.22))' }}>
      <circle cx="162" cy="100" r="27" fill="rgba(255,255,255,0.4)" stroke="#141414" strokeWidth="8" />
      <rect x="180" y="120" width="12" height="34" rx="6" transform="rotate(-45 186 122)" fill="#141414" />
    </g>
    <path d="M52 44l3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" fill="#96C400" />
  </svg>;

// ── Splash de primer uso — acordeón estilo Cofres, el 1º se abre solo ──
const GASTOS_SLIDES = [
  {
    id: 'todo', icon: '🧾', iconBg: 'var(--c-lime-10)',
    title: 'Todos tus gastos, juntos',
    body: 'Tarjeta, QR, débitos y servicios: cada consumo ordenado por categoría, para que veas tu mes de un vistazo.',
    chips: [['🛒', 'Súper'], ['🍔', 'Delivery'], ['📺', 'Suscripciones']],
    art: GArtBars
  },
  {
    id: 'carrera', icon: '🏁', iconBg: 'var(--c-nebula-5)',
    title: 'La carrera del mes',
    body: 'Tu plata corre contra los días: si va detrás del calendario, le vas ganando al mes. La meta es tu mes típico.',
    chips: [['📅', 'El calendario'], ['💸', 'Tu plata'], ['🏁', 'Tu mes típico']],
    art: GArtRace
  },
  {
    id: 'buscar', icon: '🔎', iconBg: 'var(--c-solar-5)',
    title: 'Encontrá cualquier gasto',
    body: 'Filtrá por período, categoría o medio de pago, y buscá por comercio. La verdad, clara y fría.',
    chips: [['📆', 'Por período'], ['🏷️', 'Por categoría'], ['💳', 'Por medio de pago']],
    art: GArtSearch
  }];

function GastosSplash({ open, onClose, onBuscar }) {
  const [mounted, setMounted] = useStateS(false);
  const [shown, setShown] = useStateS(false);
  const [openId, setOpenId] = useStateS(null);
  useEffectS(() => {
    if (open) {
      setMounted(true);
      setOpenId(null);
      const t = setTimeout(() => setShown(true), 20);
      // el primero se abre solo: enseña la interacción sin explicarla
      const t2 = setTimeout(() => setOpenId((v) => v == null ? 'todo' : v), 620);
      return () => { clearTimeout(t); clearTimeout(t2); };
    }
    setShown(false);
    const t = setTimeout(() => setMounted(false), 260);
    return () => clearTimeout(t);
  }, [open]);
  if (!mounted) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', pointerEvents: shown ? 'auto' : 'none' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'var(--overlay)', opacity: shown ? 1 : 0, transition: 'opacity .3s' }} />
      <div style={{
        position: 'relative', background: '#fff', borderRadius: '30px 30px 0 0', height: '95%',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        transform: shown ? 'translateY(0)' : 'translateY(100%)', transition: 'transform .22s cubic-bezier(.2,.85,.25,1)',
        boxShadow: '0 -12px 44px rgba(0,0,0,0.24)'
      }}>
        <div style={{ flexShrink: 0, padding: '28px 24px 2px' }}>
          <div style={{ font: '500 30px Geist', lineHeight: '36px', letterSpacing: '-0.01em', color: '#141414' }}>Entendé en qué se va tu plata</div>
        </div>

        {/* acordeón: tocás cada propuesta y se despliega con su arte */}
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '16px 16px 4px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {GASTOS_SLIDES.map((sl) => {
            const abierto = openId === sl.id;
            const Art = sl.art;
            return (
              <button key={sl.id} onClick={() => setOpenId(abierto ? null : sl.id)} style={{ textAlign: 'left', width: '100%', background: '#FAFAFA', border: abierto ? '2px solid #141414' : '2px solid transparent', borderRadius: 20, padding: '14px 16px', cursor: 'pointer', transition: 'border-color .25s' }}>
                {/* fila del título, siempre visible */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 40, height: 40, borderRadius: 999, background: sl.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, lineHeight: 1, flexShrink: 0 }}>{sl.icon}</span>
                  <span style={{ flex: 1, font: '500 16px Geist', letterSpacing: '-0.01em', color: '#141414', lineHeight: 1.25 }}>{sl.title}</span>
                  <LI name="arrow-expand-more" size={18} color="#818181" style={{ flexShrink: 0, transform: abierto ? 'rotate(180deg)' : 'none', transition: 'transform .3s' }} />
                </div>

                {/* contenido desplegable */}
                <div style={{ display: 'grid', gridTemplateRows: abierto ? '1fr' : '0fr', transition: 'grid-template-rows .38s cubic-bezier(.25,.85,.3,1)' }}>
                  <div style={{ minHeight: 0, overflow: 'hidden' }}>
                    <div style={{ paddingTop: 12, opacity: abierto ? 1 : 0, transition: 'opacity .25s .1s' }}>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <Art size={158} animate={abierto} />
                      </div>
                      <div style={{ font: '400 13px Inter', lineHeight: '20px', letterSpacing: '-0.1px', color: '#5E5E5E', marginTop: 8 }}>{sl.body}</div>
                      <div style={{ display: 'flex', gap: 7, marginTop: 12, flexWrap: 'wrap' }}>
                        {sl.chips.map(([e, t]) =>
                          <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', border: `1px solid ${LX.border}`, borderRadius: 999, padding: '5px 12px', font: '500 12px Inter', color: '#141414' }}>
                            <span style={{ fontSize: 13, lineHeight: 1 }}>{e}</span> {t}
                          </span>)}
                      </div>
                    </div>
                  </div>
                </div>
              </button>);
          })}
        </div>

        <div style={{ flexShrink: 0, padding: '16px 16px calc(40px + env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <button onClick={onClose} style={{ width: '100%', height: 48, border: 0, borderRadius: 16, cursor: 'pointer', background: '#141414', color: '#FFFFFF', font: '600 16px Inter', letterSpacing: '-0.1px' }}>Ver mis gastos</button>
          <button onClick={() => { onClose(); onBuscar && onBuscar(); }} style={{ width: '100%', height: 48, border: 0, borderRadius: 16, cursor: 'pointer', background: 'rgba(8,8,8,0.1)', color: '#141414', font: '600 16px Inter', letterSpacing: '-0.1px' }}>Probar el buscador</button>
        </div>
      </div>
    </div>);
}

Object.assign(window, { MisGastosHome, GastosBuscador, GMovSheet, GastosSplash });
