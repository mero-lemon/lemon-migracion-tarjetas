// Análisis de Gastos — primitivas UI del producto (sobre el DS de lemon-ui.jsx).
// Formateo es-AR, selector de período, comparación, gráficos SVG y filas.
const { useState: useStateG, useEffect: useEffectG, useRef: useRefG } = React;

// ── Formateo es-AR ──────────────────────────────────────────────
const gFmt = (n) => '$ ' + Math.round(n).toLocaleString('es-AR');
const gFmt2 = (n) => '$ ' + n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const gFmtCompact = (n) => n >= 1000000 ? '$ ' + (n / 1000000).toLocaleString('es-AR', { maximumFractionDigits: 1 }) + ' M' :
  n >= 1000 ? '$ ' + Math.round(n / 1000).toLocaleString('es-AR') + ' mil' : gFmt(n);
const gHora = (d) => `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')} h`;

// método de pago → etiqueta + ícono
const G_METHODS = {
  tarjeta: { label: 'Tarjeta Lemon', icon: 'card-on' },
  qr: { label: 'Pago QR', icon: 'celphone' },
  debito: { label: 'Débito automático', icon: 'programed-tx' },
  transferencia: { label: 'Transferencia', icon: 'send-money' },
  pix: { label: 'PIX', icon: 'pix-on' }
};

// monto en moneda extranjera: "US$ 84,30" / "R$ 210,00"
const gCur = (cur, amount) => G_CUR[cur].sym + ' ' + amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ── Pantalla base dentro del frame ──────────────────────────────
const GScreen = ({ children, header, footer, bg = LX.page }) =>
  <div style={{ height: '100%', background: bg, display: 'flex', flexDirection: 'column', paddingTop: 48 }}>
    {header && <div style={{ flexShrink: 0 }}>{header}</div>}
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}>{children}</div>
    {footer && <div style={{ flexShrink: 0, padding: '10px 16px 24px' }}>{footer}</div>}
  </div>;

// ── Contador animado del número grande ──────────────────────────
// rAF para la suavidad + timeout de respaldo: si el rAF viene
// throttleado (tab de fondo), el valor final llega igual.
const GCountUp = ({ to, duration = 620, delay = 0, fromZero = false, render }) => {
  const [v, setV] = useStateG(fromZero ? 0 : to);
  const vRef = useRefG(fromZero ? 0 : to);
  useEffectG(() => {
    const from = vRef.current;
    if (to === from) { return; }
    let raf;
    const t0 = performance.now() + delay;
    const tick = (now) => {
      const p = Math.min(1, Math.max(0, (now - t0) / duration));
      const val = from + (to - from) * (1 - Math.pow(1 - p, 3));
      vRef.current = val; setV(val);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const safety = setTimeout(() => { vRef.current = to; setV(to); }, delay + duration + 90);
    return () => { cancelAnimationFrame(raf); clearTimeout(safety); };
  }, [to]);
  return render(v);
};

// ── Reveal coreografiado: cada bloque entra en orden de lectura ──
const GReveal = ({ delay = 0, children }) => {
  const [on, setOn] = useStateG(false);
  useEffectG(() => { const t = setTimeout(() => setOn(true), delay); return () => clearTimeout(t); }, []);
  return (
    <div style={{ opacity: on ? 1 : 0, transform: on ? 'none' : 'translateY(12px)', transition: 'opacity .5s ease, transform .55s cubic-bezier(.25,.8,.3,1)' }}>
      {children}
    </div>);
};

// saldo grande estilo app: entero en Geist + centavos chicos en gris
const GBigAmount = ({ value, size = 42, color = '#141414', prefix = '$ ' }) => {
  const ent = Math.floor(value);
  const cents = Math.round((value - ent) * 100);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
      <span style={{ font: `500 ${size}px Geist`, lineHeight: 1.15, letterSpacing: '-0.03em', color }}>
        {prefix}{ent.toLocaleString('es-AR')}
      </span>
      <span style={{ font: `500 ${Math.round(size * 0.55)}px Geist`, lineHeight: 1.45, letterSpacing: '-0.03em', color: '#B4B4B4' }}>
        ,{String(cents).padStart(2, '0')}
      </span>
    </div>);
};

// ── Selector de período (segmented) ─────────────────────────────
const G_UNITS = [['day', 'Día'], ['week', 'Semana'], ['month', 'Mes'], ['year', 'Año']];
const GSegControl = ({ unit, onChange }) =>
  <div style={{ display: 'flex', background: 'rgba(8,8,9,0.06)', borderRadius: 999, padding: 3 }}>
    {G_UNITS.map(([id, lbl]) =>
      <button key={id} onClick={() => onChange(id)} style={{
        flex: 1, border: 0, cursor: 'pointer', borderRadius: 999, padding: '8px 0',
        background: unit === id ? '#fff' : 'transparent',
        boxShadow: unit === id ? '0 1px 4px rgba(18,18,18,0.12)' : 'none',
        font: `${unit === id ? 600 : 500} 13px Inter`, color: unit === id ? '#141414' : '#6E6E6E',
        transition: 'background .2s, box-shadow .2s, color .2s'
      }}>{lbl}</button>)}
  </div>;

// ── Navegación entre períodos: ‹ Julio 2026 › ───────────────────
const GPeriodNav = ({ info, onPrev, onNext }) => {
  const Arrow = ({ dir, disabled, onClick }) =>
    <button onClick={disabled ? undefined : onClick} style={{
      width: 34, height: 34, borderRadius: 999, border: 0, cursor: disabled ? 'default' : 'pointer',
      background: 'rgba(8,8,9,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: disabled ? 0.3 : 1, flexShrink: 0
    }}>
      <LI name={dir === 'l' ? 'arrow-left' : 'arrow-right'} size={16} color="#141414" />
    </button>;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
      <Arrow dir="l" onClick={onPrev} />
      <span style={{ font: '500 16px Geist', letterSpacing: '-0.01em', color: '#141414', textAlign: 'center' }}>{info.label}</span>
      <Arrow dir="r" disabled={!info.canNext} onClick={onNext} />
    </div>);
};

// ── Chip de comparación vs período anterior ─────────────────────
// Sube = rojo suave (alerta), baja = verde (control). Muestra $ y %.
const GCompareChip = ({ total, prevTotal, prevName, isCurrent, unit }) => {
  if (prevTotal <= 0) return null;
  const delta = total - prevTotal;
  const pct = Math.round(Math.abs(delta) / prevTotal * 100);
  const up = delta > 0;
  const flat = Math.abs(delta) < prevTotal * 0.015;
  const [bg, fg] = flat ? ['rgba(8,8,9,0.06)', '#5E5E5E'] : up ? ['#FBDFDF', '#C32432'] : ['var(--bg-positive-01)', '#0F7A35'];
  const ref = isCurrent ? `que a esta altura de ${prevName}` :
    (unit === 'month' || unit === 'year') ? `que en ${prevName}` : `que ${prevName}`;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: bg, color: fg, borderRadius: 999, padding: '6px 12px', font: '500 12px Inter' }}>
      {!flat && <span style={{ fontSize: 10, lineHeight: 1 }}>{up ? '▲' : '▼'}</span>}
      {flat ? `Venís parejo con ${prevName}` : `${gFmt(Math.abs(delta))} ${up ? 'más' : 'menos'} (${pct}%) ${ref}`}
    </div>);
};

// mini indicador vs anterior para filas de categoría
const GMiniDelta = ({ total, prevTotal }) => {
  if (prevTotal <= 0) return <span style={{ font: '500 11px Inter', color: '#B4B4B4' }}>nuevo</span>;
  const d = total - prevTotal;
  if (Math.abs(d) < prevTotal * 0.03) return <span style={{ font: '500 11px Inter', color: '#B4B4B4' }}>=</span>;
  const up = d > 0;
  return (
    <span style={{ font: '500 11px Inter', color: up ? '#C32432' : '#0F7A35' }}>
      {up ? '▲' : '▼'} {Math.round(Math.abs(d) / prevTotal * 100)}%
    </span>);
};

// ── Ícono de categoría (círculo tintado, consistente en toda la sección) ──
const GCatIcon = ({ cat, size = 40 }) =>
  <div style={{ width: size, height: size, borderRadius: 999, background: cat.color + '1F', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
    <LI name={cat.icon} size={Math.round(size * 0.5)} color={cat.color} />
  </div>;

// ── Ícono de moneda (círculo tintado, para los grupos USD / PIX) ──
const GCurIcon = ({ cur, size = 40 }) => {
  const c = G_CUR[cur];
  return (
    <div style={{ width: size, height: size, borderRadius: 999, background: c.color + '1F', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <LI name={c.icon} size={Math.round(size * 0.5)} color={c.color} />
    </div>);
};

// chip chico de categoría (en filas de movimiento y sheet)
const GCatChip = ({ cat, size = 11 }) =>
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: cat.color + '1A', color: cat.color, borderRadius: 999, padding: '2px 8px', font: `500 ${size}px Inter`, whiteSpace: 'nowrap' }}>
    <LI name={cat.icon} size={size + 1} color={cat.color} /> {cat.name}
  </span>;

// avatar de comercio: inicial sobre tinta de su categoría
const GMerchantAvatar = ({ name, cat, size = 38 }) =>
  <div style={{ width: size, height: size, borderRadius: 999, background: cat.color + '1F', color: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `600 ${Math.round(size * 0.42)}px Inter`, flexShrink: 0 }}>
    {name.replace(/^(Transferencia a |Transferencia — |Recarga )/, '').charAt(0).toUpperCase()}
  </div>;

// formato corto para leyendas: 769 mil / 2,7 M
const gBarLabel = (n) => n >= 1000000 ? (n / 1000000).toLocaleString('es-AR', { maximumFractionDigits: 1 }) + ' M' :
  n >= 1000 ? Math.round(n / 1000).toLocaleString('es-AR') + ' mil' : Math.round(n).toLocaleString('es-AR');

// ── Diagrama de barras del desglose: columnas redondeadas por grupo ──
// Top 5 categorías + "Otros". Tap en una columna → buscador con esa
// categoría precargada.
const GBarChart = ({ byCategory, onTap, h = 126, delay = 80 }) => {
  const [on, setOn] = useStateG(false);
  useEffectG(() => { const t = setTimeout(() => setOn(true), delay); return () => clearTimeout(t); }, []);
  const top = byCategory.slice(0, 5);
  const rest = byCategory.slice(5);
  const restTotal = rest.reduce((a, c) => a + c.total, 0);
  const cols = top.map((c) => ({ id: c.cat.id, cat: c.cat, total: c.total }));
  if (restTotal > 0) cols.push({ id: '_otros', others: true, total: restTotal, n: rest.length });
  const max = Math.max(...cols.map((c) => c.total)) || 1;
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
      {cols.map((c, i) =>
        <button key={c.id} onClick={() => onTap(c)} style={{ flex: 1, minWidth: 0, border: 0, background: 'transparent', cursor: 'pointer', padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
          <span style={{ font: '500 11px Geist', letterSpacing: '-0.01em', color: '#5E5E5E', whiteSpace: 'nowrap' }}>{gBarLabel(c.total)}</span>
          <div style={{ width: '100%', height: h, display: 'flex', alignItems: 'flex-end' }}>
            <div style={{
              width: '100%', height: on ? `${Math.max(7, c.total / max * 100)}%` : '7%', borderRadius: 12,
              background: c.others ? 'linear-gradient(180deg, #D8D8D8, #C4C4C2)' : `linear-gradient(180deg, ${c.cat.color}, ${c.cat.color}B0)`,
              boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.3)',
              transition: `height .65s cubic-bezier(.25,.8,.3,1) ${i * 0.07}s`
            }} />
          </div>
          {c.others ?
            <div style={{ width: 30, height: 30, borderRadius: 999, background: 'rgba(8,8,9,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '600 11px Inter', color: '#5E5E5E' }}>+{c.n}</div> :
            <GCatIcon cat={c.cat} size={30} />}
          <span style={{ font: '400 10px Inter', color: '#818181', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.others ? 'Otros' : c.cat.short}</span>
        </button>)}
    </div>);
};

// ── Fila de dato (card "Cómo viene tu mes") ─────────────────────
const GDataRow = ({ icon, iconEl, label, value, valueColor = '#141414', sub }) =>
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0' }}>
    {iconEl ||
      <div style={{ width: 36, height: 36, borderRadius: 999, background: 'rgba(8,8,9,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <LI name={icon} size={17} color="#141414" />
      </div>}
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ font: '400 13px Inter', color: '#5E5E5E' }}>{label}</div>
      {sub && <div style={{ font: '400 11px Inter', color: '#B4B4B4', marginTop: 1 }}>{sub}</div>}
    </div>
    <span style={{ font: '500 14px Geist', letterSpacing: '-0.01em', color: valueColor, textAlign: 'right', flexShrink: 0 }}>{value}</span>
  </div>;

// ── Chip de filtro del buscador (toggle) ────────────────────────
const GFilterChip = ({ active, onTap, icon, color, label }) =>
  <button onClick={onTap} style={{
    display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 999, padding: '8px 13px',
    border: active ? '1.5px solid #141414' : '1.5px solid rgba(8,8,9,0.1)', cursor: 'pointer',
    background: active ? '#141414' : '#fff', transition: 'background .15s, border-color .15s'
  }}>
    {icon && <LI name={icon} size={14} color={active ? '#fff' : color || '#141414'} />}
    <span style={{ font: '500 12.5px Inter', color: active ? '#fff' : '#141414', whiteSpace: 'nowrap' }}>{label}</span>
  </button>;

// ── Ritmo de gasto: barras + línea de promedio ──────────────────
const GRhythmChart = ({ buckets, avgBucket }) => {
  const W = 320, H = 96, PADB = 4;
  const [on, setOn] = useStateG(false);
  useEffectG(() => { const t = setTimeout(() => setOn(true), 80); return () => clearTimeout(t); }, []);
  const max = Math.max(avgBucket, ...buckets.map((b) => b.total)) || 1;
  const n = buckets.length;
  const gap = n > 20 ? 2 : 4;
  const bw = (W - gap * (n - 1)) / n;
  const yAvg = H - PADB - (avgBucket / max) * (H - 16);
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H + 14}`} style={{ display: 'block', width: '100%' }}>
        {buckets.map((b, i) => {
          const bh = Math.max(b.total > 0 ? 3 : 0, (b.total / max) * (H - 16));
          return (
            <g key={i}>
              <rect x={i * (bw + gap)} y={H - PADB - (on ? bh : 0)} width={bw} height={on ? bh : 0} rx={Math.min(3, bw / 2.5)}
                fill={b.future ? 'rgba(8,8,9,0.05)' : b.today ? '#141414' : 'var(--c-lime-40)'}
                stroke={b.today ? 'none' : b.future ? 'none' : 'var(--c-lime-50)'} strokeWidth="0.6"
                style={{ transition: `height .5s cubic-bezier(.25,.8,.3,1) ${i * 0.012}s, y .5s cubic-bezier(.25,.8,.3,1) ${i * 0.012}s` }} />
              {b.future && <rect x={i * (bw + gap)} y={H - PADB - 2} width={bw} height={2} rx={1} fill="rgba(8,8,9,0.12)" />}
              {b.label && <text x={i * (bw + gap) + bw / 2} y={H + 10} textAnchor="middle" style={{ font: '400 8.5px Inter', fill: '#B4B4B4' }}>{b.label}</text>}
            </g>);
        })}
        {avgBucket > 0 &&
          <>
            <line x1="0" x2={W} y1={yAvg} y2={yAvg} stroke="#818181" strokeWidth="1.2" strokeDasharray="4 4" opacity={on ? 0.8 : 0} style={{ transition: 'opacity .4s .4s' }} />
          </>}
      </svg>
    </div>);
};

// ── La carrera del mes: un solo carril ──────────────────────────
// La pista es tu mes típico (la meta 🏁). El relleno es tu plata 💸;
// la marca 📅 es dónde está parado el calendario hoy. Si el relleno
// todavía no alcanzó la marca, vas ganando.
const GRaceTrack = ({ timePct, moneyPct, moneyFill, bottomLeft, bottomRight, delay = 400 }) => {
  const [on, setOn] = useStateG(false);
  useEffectG(() => { const t = setTimeout(() => setOn(true), delay); return () => clearTimeout(t); }, []);
  const tp = Math.max(5, Math.min(98, timePct * 100));
  const mw = Math.max(5, Math.min(100, moneyPct * 100));
  return (
    <div>
      <div style={{ position: 'relative', height: 30, borderRadius: 999, background: 'rgba(8,8,9,0.05)', marginTop: 22 }}>
        {/* relleno: tu plata */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: on ? `${mw}%` : '5%', borderRadius: 999, background: moneyFill, transition: 'width 1.4s cubic-bezier(.3,.85,.3,1)' }} />
        <span style={{ position: 'absolute', top: '50%', left: on ? `${mw}%` : '5%', transform: 'translate(-85%, -50%)', fontSize: 16, lineHeight: 1, transition: 'left 1.4s cubic-bezier(.3,.85,.3,1)', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))', zIndex: 2 }}>💸</span>
        {/* la marca del calendario: hoy */}
        <div style={{ position: 'absolute', top: -5, bottom: -5, left: on ? `${tp}%` : '5%', width: 2.5, borderRadius: 999, background: '#141414', transition: 'left .9s cubic-bezier(.3,.85,.3,1)', zIndex: 1 }} />
        <span style={{ position: 'absolute', top: -22, left: on ? `${tp}%` : '5%', transform: 'translateX(-50%)', fontSize: 13, lineHeight: 1, transition: 'left .9s cubic-bezier(.3,.85,.3,1)' }}>📅</span>
        <span style={{ position: 'absolute', top: '50%', right: 9, transform: 'translateY(-50%)', fontSize: 13, lineHeight: 1, opacity: 0.55 }}>🏁</span>
      </div>
      {(bottomLeft || bottomRight) &&
        <div style={{ display: 'flex', justifyContent: bottomLeft ? 'space-between' : 'flex-end', alignItems: 'baseline', marginTop: 9 }}>
          {bottomLeft && <span style={{ font: '400 11.5px Inter', color: '#818181' }}>{bottomLeft}</span>}
          {bottomRight && <span style={{ font: '400 11.5px Inter', color: '#818181' }}>{bottomRight}</span>}
        </div>}
    </div>);
};

// ── Balance del mes: una sola pista, lo que salió sobre lo que entró ──
// Si entró más: el relleno oscuro es lo que salió y el tramo verde que
// queda a la vista ES lo que te queda a favor. Si salió más: el relleno
// verde es lo que entró y el resto ámbar es lo que salió de más. La
// etiqueta izquierda nombra al relleno; la derecha, al total de la pista.
const GBalanceBar = ({ inTotal, outTotal, delay = 350 }) => {
  const [on, setOn] = useStateG(false);
  useEffectG(() => { const t = setTimeout(() => setOn(true), delay); return () => clearTimeout(t); }, []);
  const positive = inTotal >= outTotal;
  const max = Math.max(inTotal, outTotal) || 1;
  const pct = Math.max(3, Math.min(100, (positive ? outTotal : inTotal) / max * 100));
  return (
    <div>
      <div style={{ display: 'flex', height: 14, borderRadius: 999, overflow: 'hidden', background: positive ? '#D6EDDA' : '#F2C083' }}>
        <div style={{ width: on ? `${pct}%` : '3%', background: positive ? '#141414' : '#00AA18', borderRadius: pct >= 99 ? 0 : '0 999px 999px 0', transition: 'width 1.1s cubic-bezier(.3,.85,.3,1)' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 9 }}>
        <span style={{ font: '400 11.5px Inter', color: '#818181' }}>{positive ? 'Salió' : 'Entró'} {gFmt(positive ? outTotal : inTotal)}</span>
        <span style={{ font: '400 11.5px Inter', color: '#818181' }}>{positive ? 'Entró' : 'Salió'} {gFmt(positive ? inTotal : outTotal)}</span>
      </div>
    </div>);
};

// ── Insight automático ──────────────────────────────────────────
const GInsight = ({ insight, prevName }) => {
  if (!insight) return null;
  const up = insight.delta > 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: `1px solid ${LX.border}`, borderRadius: 14, padding: '10px 13px' }}>
      <GCatIcon cat={insight.cat} size={30} />
      <span style={{ font: '400 12.5px Inter', color: '#3d3d3d', lineHeight: 1.4, flex: 1 }}>
        Tu mayor {up ? 'suba' : 'baja'}: <b>{insight.cat.name}</b>, {up ? '+' : '−'}{gFmt(Math.abs(insight.delta))} vs. {prevName}.
      </span>
    </div>);
};

// ── Fila de movimiento ──────────────────────────────────────────
const GMovRow = ({ mov, onTap, showChip = true }) => {
  const cat = G_CAT[mov.cat];
  return (
    <button onClick={onTap} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', border: 0, background: 'transparent', cursor: 'pointer', padding: '9px 0' }}>
      <GMerchantAvatar name={mov.name} cat={cat} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ font: '500 14px Geist', letterSpacing: '-0.01em', color: '#141414', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mov.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
          {showChip && <GCatChip cat={cat} size={10} />}
          <span style={{ font: '400 11px Inter', color: '#B4B4B4' }}>{gHora(mov.date)}</span>
        </div>
      </div>
      {mov.cur && mov.cur !== 'ars' ?
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ font: '500 14px Geist', letterSpacing: '-0.01em', color: '#141414' }}>− {gCur(mov.cur, mov.curAmount)}</div>
          <div style={{ font: '400 11px Inter', color: '#B4B4B4', marginTop: 1 }}>≈ {gFmt(mov.amount)}</div>
        </div> :
        <span style={{ font: '500 14px Geist', letterSpacing: '-0.01em', color: '#141414', flexShrink: 0 }}>− {gFmt2(mov.amount)}</span>}
    </button>);
};

// agrupador por día: Hoy / Ayer / Miércoles 15 de julio
const gDayLabel = (d) => sameDay(d, G_TODAY) ? 'Hoy' :
  sameDay(d, addDays(G_TODAY, -1)) ? 'Ayer' :
  cap1(`${G_DIAS[d.getDay()]} ${d.getDate()} de ${G_MESES[d.getMonth()]}`);

const groupByDay = (movs) => {
  const groups = [];
  movs.forEach((m) => {
    const last = groups[groups.length - 1];
    if (last && sameDay(last.date, m.date)) { last.movs.push(m); last.total += m.amount; }
    else groups.push({ date: m.date, movs: [m], total: m.amount });
  });
  return groups;
};

const GMovList = ({ movs, onTap, showChip = true, groupTotals = true }) => {
  const groups = groupByDay(movs);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {groups.map((g) =>
        <div key={+g.date}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 2px 4px' }}>
            <span style={{ font: '600 12px Inter', color: '#818181' }}>{gDayLabel(g.date)}</span>
            {groupTotals && <span style={{ font: '500 12px Inter', color: '#B4B4B4' }}>{gFmt(g.total)}</span>}
          </div>
          <Surface pad={'4px 14px'}>
            {g.movs.map((m, i) =>
              <React.Fragment key={m.id}>
                {i > 0 && <Divider />}
                <GMovRow mov={m} onTap={() => onTap(m)} showChip={showChip} />
              </React.Fragment>)}
          </Surface>
        </div>)}
    </div>);
};

// ── Búsqueda ────────────────────────────────────────────────────
const GSearchInput = ({ value, onChange, placeholder = 'Buscá por comercio' }) =>
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 44, padding: '0 14px', background: 'rgba(8,8,9,0.05)', border: '1px solid #E6E6E6', borderRadius: 999 }}>
    <LI name="search" size={18} color="#818181" />
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      style={{ flex: 1, border: 0, outline: 'none', background: 'transparent', font: '400 14px Inter', color: '#141414' }} />
    {value && <button onClick={() => onChange('')} style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: 0, display: 'flex' }}>
      <LI name="cancel" size={16} color="#B4B4B4" /></button>}
  </div>;

// ── Campo de monto (objetivos): $ + miles es-AR mientras tipeás ──
const gDigits = (s) => (s || '').replace(/\D/g, '');
const gGroup = (digits) => digits ? Number(digits).toLocaleString('es-AR') : '';
const GMoneyField = ({ value, onChange, placeholder = 'Monto', sm = false }) =>
  <div style={{ display: 'flex', alignItems: 'center', gap: 6, height: sm ? 38 : 44, padding: '0 12px', background: '#fff', border: '1px solid #E6E6E6', borderRadius: sm ? 12 : 14, minWidth: 0 }}>
    <span style={{ font: '500 14px Geist', color: value ? '#141414' : '#B4B4B4' }}>$</span>
    <input inputMode="numeric" value={gGroup(value)} onChange={(e) => onChange(gDigits(e.target.value))} placeholder={placeholder}
      style={{ flex: 1, minWidth: 0, border: 0, outline: 'none', background: 'transparent', font: '500 14px Geist', color: '#141414', textAlign: 'right' }} />
  </div>;

// ── Estados ─────────────────────────────────────────────────────
const GEmptyState = ({ unit, isCurrent }) => {
  const [title, sub] = unit === 'day' ?
    ['Día sin gastos', 'No registramos consumos este día. Tu plata te lo agradece 🙌'] :
    ['Nada por acá', 'No hay gastos registrados en este período.'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 6, padding: '38px 32px' }}>
      <div style={{ width: 74, height: 74, borderRadius: 999, background: 'var(--c-lime-10)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8, animation: 'lc-pop .4s cubic-bezier(.3,1.4,.5,1) both' }}>
        <LI name="search-off" size={34} color="var(--c-lime-60)" />
      </div>
      <div style={{ font: '500 18px Geist', letterSpacing: '-0.01em', color: '#141414' }}>{title}</div>
      <div style={{ font: '400 13px Inter', color: '#818181', lineHeight: 1.5, maxWidth: 250 }}>{sub}</div>
    </div>);
};

const GSkel = ({ w = '100%', h = 16, r = 8, style }) =>
  <div style={{ width: w, height: h, borderRadius: r, background: 'rgba(8,8,9,0.07)', animation: 'lc-skel 1.3s ease-in-out infinite', ...style }} />;

const GSkeletonHome = () =>
  <div style={{ padding: '4px 16px', display: 'flex', flexDirection: 'column', gap: 18 }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, paddingTop: 18 }}>
      <GSkel w={90} h={13} />
      <GSkel w={210} h={40} r={12} />
      <GSkel w={240} h={26} r={999} />
    </div>
    <GSkel h={52} r={14} />
    <div style={{ background: '#fff', border: `1px solid ${LX.border}`, borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <GSkel w={130} h={14} />
      <GSkel h={14} r={999} />
      {[0, 1, 2].map((i) =>
        <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <GSkel w={40} h={40} r={999} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}><GSkel w="62%" h={13} /><GSkel w="34%" h={11} /></div>
          <GSkel w={70} h={13} />
        </div>)}
    </div>
    <GSkel h={150} r={16} />
  </div>;

// ── Toast ───────────────────────────────────────────────────────
const GToast = ({ text }) =>
  <div style={{ position: 'absolute', left: 24, right: 24, bottom: 52, zIndex: 60, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
    <div style={{ background: '#141414', color: '#fff', borderRadius: 999, padding: '11px 18px', font: '500 13px Inter', boxShadow: '0 8px 24px rgba(0,0,0,0.28)', animation: 'lc-toast .28s cubic-bezier(.2,.85,.25,1) both' }}>
      {text}
    </div>
  </div>;

Object.assign(window, {
  gFmt, gFmt2, gFmtCompact, gBarLabel, gHora, gCur, G_METHODS, GScreen, GCountUp, GReveal, GBigAmount, GSegControl, GPeriodNav,
  GCompareChip, GMiniDelta, GCatIcon, GCurIcon, GCatChip, GMerchantAvatar, GBarChart, GDataRow, GFilterChip, GRhythmChart, GRaceTrack, GBalanceBar,
  GInsight, GMovRow, GMovList, groupByDay, gDayLabel, GSearchInput, GMoneyField, GEmptyState, GSkel, GSkeletonHome, GToast
});
