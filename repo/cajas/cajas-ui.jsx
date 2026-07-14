// Cajas de pesos — UI primitives del producto (sobre el DS de lemon-ui.jsx).
// Formateo es-AR, plantillas de cajas, splash FTE, keypad y pantalla de monto.
const { useState: useStateU, useEffect: useEffectU } = React;

// ── Constantes del producto ─────────────────────────────────────
const TNA = 0.362;
const TNA_LABEL = '36,2% TNA';
const monthlyYield = (n) => n * TNA / 12;
const dailyYield = (n) => n * TNA / 365;
const cajaTotal = (c) => c.amount + c.earned; // saldo = aportes + rendimiento

// formateo es-AR: $1.487.283 / $1.487.283,93
const fmtP = (n) => '$' + Math.round(n).toLocaleString('es-AR');
const fmtP2 = (n) => '$' + n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// saldo grande estilo app: entero en Geist 44 + centavos en 24 gris
const BigAmount = ({ value, prefix = '$', size = 44, color = '#141414' }) => {
  const ent = Math.floor(value);
  const cents = Math.round((value - ent) * 100);
  const centSize = Math.round(size * 0.545);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
      <span style={{ font: `500 ${size}px Geist`, lineHeight: 1.18, letterSpacing: '-0.03em', color }}>
        {prefix}{ent.toLocaleString('es-AR')}
      </span>
      <span style={{ font: `500 ${centSize}px Geist`, lineHeight: 1.5, letterSpacing: '-0.03em', color: '#B4B4B4' }}>
        ,{String(cents).padStart(2, '0')}
      </span>
    </div>);
};

// ── Plantillas de caja ──────────────────────────────────────────
const CAJA_TEMPLATES = [
  { id: 'emergencia', icon: 'shield-alt', emoji: '🛟', name: 'Fondo de emergencia', sub: 'Para dormir tranqui.', bg: 'var(--c-nebula-5)', fg: 'var(--c-nebula-50)' },
  { id: 'vacaciones', icon: 'travel', emoji: '✈️', name: 'Vacaciones', sub: 'El próximo viaje.', bg: '#E8F1FE', fg: '#2F6BDB' },
  { id: 'auto', icon: 'car', emoji: '🚗', name: 'El auto', sub: 'Cambiarlo o mantenerlo.', bg: 'var(--c-solar-5)', fg: 'var(--c-solar-50)' },
  { id: 'regalos', icon: 'view-gift', emoji: '🎁', name: 'Regalos', sub: 'Cumples y fiestas.', bg: '#FDEBF5', fg: '#D6006A' },
  { id: 'mudanza', icon: 'key', emoji: '🔑', name: 'Mudanza', sub: 'Depósito y flete.', bg: 'var(--c-greent-5)', fg: 'var(--c-greent-60)' },
  { id: 'custom', icon: 'vault', emoji: '📦', name: 'Otra cosa', sub: 'Armala a tu manera.', bg: 'var(--c-lime-10)', fg: 'var(--c-lime-60)' }];

const getTemplate = (id) => CAJA_TEMPLATES.find((t) => t.id === id) || CAJA_TEMPLATES[5];

// emojis elegibles al crear/editar una caja
const CAJA_EMOJIS = ['🛟', '✈️', '🚗', '🎁', '🔑', '📦', '🏠', '💻', '🎓', '🏖️', '⚽', '🎸', '💍', '🐶', '👶', '🎂'];

// ── Piezas chicas ───────────────────────────────────────────────
const IconBadge = ({ icon, bg, fg, size = 44 }) =>
<div style={{ width: size, height: size, borderRadius: 999, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
    <LI name={icon} size={Math.round(size * 0.5)} color={fg} />
  </div>;

// badge de caja: emoji elegido por el usuario sobre el color de la plantilla
const CajaBadge = ({ caja, size = 44 }) =>
caja.emoji ?
<div style={{ width: size, height: size, borderRadius: 999, background: caja.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: Math.round(size * 0.5), lineHeight: 1 }}>
      {caja.emoji}
    </div> :
<IconBadge icon={caja.icon} bg={caja.bg} fg={caja.fg} size={size} />;

const TnaChip = ({ label = TNA_LABEL, compact }) =>
<span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--c-lime-40)', color: '#080808', font: '400 12px Inter', padding: compact ? '2px 8px' : '3px 10px', borderRadius: 999, whiteSpace: 'nowrap' }}>
    {!compact && <LI name="earn" size={13} color="#080808" />}{label}
  </span>;

// ── Arte: caja de reserva (ilustración SVG, estilo pieza oficial) ──
// Una caja lime grande con ranura + moneda entrando, y dos cajas chicas
// atrás (hint: "distintas cajas"). Sin assets externos.
const CajaHeroArt = ({ size = 200, animate = true }) =>
<svg width={size} height={size * 0.86} viewBox="0 0 240 206" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="120" cy="106" r="92" fill="#EAF6C9" />
    {/* cajas chicas de atrás */}
    <g style={{ filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.14))' }}>
      <rect x="28" y="96" width="58" height="52" rx="12" fill="#925DEE" />
      <rect x="28" y="96" width="58" height="14" rx="7" fill="#7B4EC8" />
    </g>
    <g style={{ filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.14))' }}>
      <rect x="158" y="90" width="56" height="58" rx="12" fill="#141414" />
      <rect x="158" y="90" width="56" height="14" rx="7" fill="#2B2A28" />
      <circle cx="186" cy="124" r="9" fill="none" stroke="#CFFF2E" strokeWidth="3" />
    </g>
    {/* moneda cayendo a la ranura */}
    <g style={animate ? { animation: 'lc-coin-drop 1.4s cubic-bezier(.3,1.4,.5,1) both', animationDelay: '.35s' } : null}>
      <circle cx="120" cy="58" r="17" fill="#141414" />
      <circle cx="120" cy="58" r="17" fill="none" stroke="#CFFF2E" strokeWidth="2.5" />
      <text x="120" y="65" textAnchor="middle" fill="#CFFF2E" style={{ font: '700 19px Inter' }}>$</text>
    </g>
    {/* caja principal lime */}
    <g style={{ filter: 'drop-shadow(0 10px 18px rgba(120,180,20,0.35))' }}>
      <rect x="66" y="84" width="108" height="86" rx="18" fill="#CFFF2E" />
      <rect x="66" y="84" width="108" height="24" rx="12" fill="#B7F53A" />
      <rect x="98" y="92" width="44" height="7" rx="3.5" fill="#141414" />
      <rect x="84" y="126" width="52" height="9" rx="4.5" fill="rgba(8,8,8,0.18)" />
      <rect x="84" y="143" width="30" height="9" rx="4.5" fill="rgba(8,8,8,0.10)" />
    </g>
    {/* chip TNA flotando */}
    <g style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.16))' }}>
      <rect x="150" y="152" width="66" height="26" rx="13" fill="#141414" />
      <text x="183" y="169" textAnchor="middle" fill="#CFFF2E" style={{ font: '600 12px Inter' }}>+36,2%</text>
    </g>
    {/* destellos */}
    <path d="M52 62l3.5 8 8 3.5-8 3.5-3.5 8-3.5-8-8-3.5 8-3.5Z" fill="#96C400" />
    <path d="M196 48l2.5 5.5 5.5 2.5-5.5 2.5-2.5 5.5-2.5-5.5-5.5-2.5 5.5-2.5Z" fill="#00AA18" />
  </svg>;

// ── Splash FTE (full-screen, sube de abajo — mismo patrón que NfcSplash) ──
const CajasSplash = ({ open, onClose, onPrimary }) => {
  const [mounted, setMounted] = useStateU(false);
  const [shown, setShown] = useStateU(false);
  useEffectU(() => {
    if (open) {
      setMounted(true);
      const t = setTimeout(() => setShown(true), 20);
      return () => clearTimeout(t);
    }
    setShown(false);
    const t = setTimeout(() => setMounted(false), 340);
    return () => clearTimeout(t);
  }, [open]);
  if (!mounted) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', pointerEvents: shown ? 'auto' : 'none' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'var(--overlay)', opacity: shown ? 1 : 0, transition: 'opacity .3s' }} />
      <div style={{
        position: 'relative', background: '#fff', borderRadius: '30px 30px 0 0', height: '95%',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        transform: shown ? 'translateY(0)' : 'translateY(100%)', transition: 'transform .3s cubic-bezier(.2,.85,.25,1)',
        boxShadow: '0 -12px 44px rgba(0,0,0,0.24)'
      }}>
        {/* hero ilustrado */}
        <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', padding: '34px 0 6px' }}>
          <CajaHeroArt size={232} animate={shown} />
        </div>

        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 24, padding: '8px 16px 8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'center', padding: '0 8px' }}>
            <div style={{ font: '500 32px Geist', lineHeight: '38px', letterSpacing: '-0.01em', color: '#141414' }}>Ordená tu plata en cajas de pesos</div>
            <div style={{ font: '400 14px Inter', lineHeight: '22px', letterSpacing: '-0.1px', color: '#141414' }}>Apartá pesos por objetivo y dejalos rindiendo, lejos de tus gastos de todos los días.</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 22, padding: '0 4px' }}>
            <SplashFeature icon="earn" title="Rinden todos los días" tag={TNA_LABEL} sub="También los findes y feriados. Sin hacer nada." />
            <SplashFeature icon="card-off" title="Apartada de verdad" sub="La tarjeta y el QR no la ven: lo que guardás acá no se gasta sin querer." />
            <SplashFeature icon="money" title="Volvela a usar cuando quieras" sub="La podés retirar al instante." />
          </div>
        </div>

        <div style={{ flexShrink: 0, padding: '16px 16px calc(40px + env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <button onClick={onPrimary} style={{ width: '100%', height: 48, border: 0, borderRadius: 16, cursor: 'pointer', background: '#141414', color: '#FFFFFF', font: '600 16px Inter', letterSpacing: '-0.1px' }}>Crear mi primera caja</button>
          <button onClick={onClose} style={{ width: '100%', height: 48, border: 0, borderRadius: 16, cursor: 'pointer', background: 'rgba(8,8,8,0.1)', color: '#141414', font: '600 16px Inter', letterSpacing: '-0.1px' }}>Ahora no</button>
        </div>
      </div>
    </div>);
};

// ── Fila de caja (lista en Pesos digitales) ─────────────────────
const CajaRow = ({ caja, onTap }) => {
  const total = cajaTotal(caja);
  const pct = caja.goal ? Math.min(1, total / caja.goal) : null;
  return (
    <button onClick={onTap} style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left', cursor: 'pointer', background: LX.layer, border: 0, borderRadius: 20, padding: 16, boxShadow: 'var(--shadow-card)' }}>
      <CajaBadge caja={caja} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ font: '500 16px Geist', letterSpacing: '-0.01em', color: '#141414', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{caja.name}</span>
          <span style={{ font: '500 16px Geist', letterSpacing: '-0.01em', color: '#141414', flexShrink: 0 }}>{fmtP(total)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 3 }}>
          <span style={{ font: '400 12px Inter', color: '#818181' }}>
            {caja.goal ? `Objetivo ${fmtP(caja.goal)}` : 'Caja libre'}
          </span>
          <span style={{ font: '500 12px Inter', color: 'var(--c-lemon-50)', flexShrink: 0 }}>+{fmtP2(caja.earned)}</span>
        </div>
        {pct !== null &&
        <div style={{ marginTop: 9 }}><Meter value={pct} color={caja.fg} h={5} /></div>}
      </div>
    </button>);
};

// ── Aviso "apartada de verdad" (tarjeta/QR no la ven) ───────────
const NoGastoHint = () =>
<div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '2px 6px' }}>
    <LI name="card-off" size={16} color="#818181" style={{ marginTop: 2, flexShrink: 0 }} />
    <span style={{ font: '400 12px Inter', color: '#818181', lineHeight: 1.45 }}>
      La tarjeta y el QR no ven esta plata. Para gastarla, retirala: vuelve a tus pesos digitales al instante, sin penalidad.
    </span>
  </div>;

// ── Serie diaria de la caja (aportes + rendimiento acumulado) ───
// Reconstruye el crecimiento del saldo desde events [{day, amount}]. El
// rendimiento simulado se escala para cerrar exacto contra caja.earned.
const buildSeries = (caja) => {
  const evs = caja.events && caja.events.length ? caja.events : [{ day: 0, amount: caja.amount }];
  const days = Math.max(0, caja.ageDays || 0);
  const pts = [];
  let earnedRaw = 0;
  for (let d = 0; d <= days; d++) {
    const contributed = evs.filter((e) => e.day <= d).reduce((a, e) => a + e.amount, 0);
    earnedRaw += dailyYield(Math.max(0, contributed));
    pts.push({ contributed, earnedRaw });
  }
  const f = caja.earned > 0 && earnedRaw > 0 ? caja.earned / earnedRaw : 0;
  return pts.map((p) => ({ contributed: p.contributed, earned: p.earnedRaw * f, total: p.contributed + p.earnedRaw * f }));
};

// ── Sparkline del saldo: banda gris = aportes, banda lime = rendimiento ──
// Caja recién creada (sin historia): proyección punteada de los próximos 30 días.
const CajaSparkline = ({ caja }) => {
  const W = 320, H = 92, PAD = 4;
  const isNew = (caja.ageDays || 0) < 1;
  const total = cajaTotal(caja);

  let label;
  let content;
  if (isNew) {
    const end = total + dailyYield(total) * 30;
    const y = (v, min, max) => H - PAD - (v - min) / (max - min || 1) * (H - PAD * 2);
    const min = total * 0.999, max = end * 1.001;
    const pts = Array.from({ length: 31 }, (_, i) => `${PAD + i * (W - PAD * 2) / 30},${y(total + dailyYield(total) * i, min, max)}`);
    label = 'Próximos 30 días · proyección';
    content =
    <>
        <polygon points={`${PAD},${H - PAD} ${pts.join(' ')} ${W - PAD},${H - PAD}`} fill="rgba(8,8,9,0.05)" />
        <polyline points={pts.join(' ')} fill="none" stroke="var(--c-lime-50)" strokeWidth="2.5" strokeDasharray="6 5" strokeLinecap="round" />
        <circle cx={W - PAD} cy={y(end, min, max)} r="4" fill="var(--c-lime-40)" stroke="#141414" strokeWidth="1.5" />
      </>;
  } else {
    const s = buildSeries(caja);
    const maxT = Math.max(...s.map((p) => p.total));
    const minC = Math.min(...s.map((p) => p.contributed));
    const min = minC * 0.985, max = maxT * 1.002;
    const x = (i) => PAD + i * (W - PAD * 2) / (s.length - 1 || 1);
    const y = (v) => H - PAD - (v - min) / (max - min || 1) * (H - PAD * 2);
    const cPts = s.map((p, i) => `${x(i)},${y(p.contributed)}`);
    const tPts = s.map((p, i) => `${x(i)},${y(p.total)}`);
    label = `Desde que la creaste · hace ${caja.ageDays} días`;
    content =
    <>
        {/* aportes (base gris) */}
        <polygon points={`${PAD},${H - PAD} ${cPts.join(' ')} ${W - PAD},${H - PAD}`} fill="rgba(8,8,9,0.07)" />
        {/* banda de rendimiento entre aportes y total */}
        <polygon points={`${cPts.join(' ')} ${[...tPts].reverse().join(' ')}`} fill="var(--c-lime-40)" opacity="0.9" />
        <polyline points={tPts.join(' ')} fill="none" stroke="var(--c-lime-60)" strokeWidth="2" strokeLinejoin="round" />
      </>;
  }

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 84, borderRadius: 10 }}>
        {content}
      </svg>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
        <span style={{ font: '400 11px Inter', color: '#B4B4B4' }}>{label}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, font: '400 11px Inter', color: '#818181' }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: 'rgba(8,8,9,0.18)' }} /> Tus aportes
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, font: '400 11px Inter', color: '#818181' }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--c-lime-40)', border: '1px solid var(--c-lime-60)' }} /> Rendimiento
          </span>
        </span>
      </div>
    </div>);
};

// ── Barra apilada: aportes vs rendimiento ───────────────────────
const AporteVsRendBar = ({ caja }) => {
  const total = cajaTotal(caja);
  const pctE = total > 0 ? caja.earned / total : 0;
  return (
    <div style={{ display: 'flex', height: 12, borderRadius: 999, overflow: 'hidden', background: 'rgba(8,8,9,0.09)' }}>
      <div style={{ width: `${(1 - pctE) * 100}%` }} />
      {caja.earned > 0 &&
      <div style={{ width: `${Math.max(2.5, pctE * 100)}%`, background: 'var(--c-lime-40)', borderRadius: 999, boxShadow: 'inset 0 0 0 1px var(--c-lime-50)' }} />}
    </div>);
};

// ── Anillo de progreso (cajas con objetivo) ─────────────────────
const ProgressRing = ({ pct, color, size = 104 }) => {
  const R = (size - 14) / 2, C = 2 * Math.PI * R;
  const p = Math.min(1, Math.max(0, pct));
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke="rgba(8,8,9,0.08)" strokeWidth="11" />
        <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke={color} strokeWidth="11" strokeLinecap="round"
        strokeDasharray={`${C * p} ${C}`} style={{ transition: 'stroke-dasharray .6s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', font: '500 22px Geist', letterSpacing: '-0.02em', color: '#141414' }}>
        {Math.round(p * 100)}%
      </div>
    </div>);
};

// ── Keypad numérico (estilo app) ────────────────────────────────
const Keypad = ({ onDigit, onBackspace }) => {
  const Key = ({ children, onPress, dim }) =>
  <button onClick={onPress} style={{ height: 58, border: 0, borderRadius: 14, background: 'transparent', cursor: onPress ? 'pointer' : 'default', font: '500 26px Geist', letterSpacing: '-0.01em', color: dim ? '#B4B4B4' : '#141414', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    onMouseDown={(e) => { if (onPress) e.currentTarget.style.background = 'rgba(8,8,8,0.06)'; }}
    onMouseUp={(e) => { e.currentTarget.style.background = 'transparent'; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
      {children}
    </button>;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, padding: '0 8px' }}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => <Key key={d} onPress={() => onDigit(d)}>{d}</Key>)}
      <Key dim>,</Key>
      <Key onPress={() => onDigit(0)}>0</Key>
      <Key onPress={onBackspace}><LI name="backspace" size={24} color="#141414" /></Key>
    </div>);
};

// ── Pantalla de monto (crear / agregar / retirar) ───────────────
// max = tope disponible; note = leyenda de rendimiento bajo el monto.
function AmountScreen({ headerTitle, title, sourceLabel = 'Pesos digitales', max, cta, onBack, onClose, onConfirm, badge, withdraw }) {
  const [value, setValue] = useStateU(0);
  const [assetSheet, setAssetSheet] = useStateU(false);
  const over = value > max;
  const ok = value > 0 && !over;

  const digit = (d) => setValue((v) => Math.min(v * 10 + d, 999999999));
  const back = () => setValue((v) => Math.floor(v / 10));

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      <Screen scroll={false} footer={<Btn variant="primary" disabled={!ok} onClick={() => onConfirm(value)}>{cta}</Btn>}>
        <StepHeader title={headerTitle} onBack={onBack} onClose={onClose} />
        <div style={{ height: 'calc(100% - 52px)', display: 'flex', flexDirection: 'column', padding: '4px 16px 0' }}>

          <div style={{ font: '500 22px Geist', letterSpacing: '-0.02em', color: LX.text1, display: 'flex', alignItems: 'center', gap: 10 }}>
            {badge}{title}
          </div>

          {/* monto grande centrado */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, minHeight: 0 }}>
            <div style={{ font: `500 ${value >= 10000000 ? 40 : 48}px Geist`, letterSpacing: '-0.03em', color: over ? 'var(--c-rose-40)' : value === 0 ? '#B4B4B4' : '#141414', transition: 'color .15s' }}>
              {fmtP(value)}
            </div>

            {/* origen de fondos */}
            <button onClick={() => setAssetSheet(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, border: 0, cursor: 'pointer', background: 'rgba(8,8,9,0.05)', borderRadius: 999, padding: '7px 14px' }}>
              <LI name="currency-peso" size={16} color="#141414" />
              <span style={{ font: '500 13px Inter', color: '#141414' }}>{withdraw ? `Vuelve a ${sourceLabel}` : sourceLabel}</span>
              <span style={{ font: '400 13px Inter', color: '#818181' }}>· {withdraw ? 'en la caja' : 'disponible'} {fmtP2(max)}</span>
              {!withdraw && <LI name="arrow-expand-more" size={15} color="#818181" />}
            </button>

            {over ?
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, font: '500 13px Inter', color: 'var(--c-rose-40)' }}>
                <LI name="feedback-warning" size={16} color="var(--c-rose-40)" /> Te pasás de lo {withdraw ? 'que hay en la caja' : 'disponible'}
              </div> :
            !withdraw &&
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'var(--c-lime-10)', borderRadius: 999, padding: '6px 14px', font: '500 13px Inter', color: 'var(--c-lime-70)' }}>
                <LI name="earn" size={15} color="var(--c-lime-60)" />
                {value > 0 ? `Rinde ≈ +${fmtP(monthlyYield(value))} por mes` : `Rinde ${TNA_LABEL}, todos los días`}
              </div>}
          </div>

          {/* keypad */}
          <div style={{ flexShrink: 0, paddingBottom: 6 }}>
            <Keypad onDigit={digit} onBackspace={back} />
          </div>
        </div>
      </Screen>

      {/* sheet: con qué activo fondeás (v1 solo pesos) */}
      <Sheet open={assetSheet} onClose={() => setAssetSheet(false)}>
        <div style={{ font: '500 20px Geist', letterSpacing: '-0.01em', color: LX.text1, margin: '2px 2px 4px' }}>¿Con qué la fondeás?</div>
        <div style={{ font: '400 13px Inter', color: LX.text2, margin: '0 2px 14px' }}>Por ahora las cajas rinden con pesos digitales. Pronto se suman más activos.</div>
        {[
        ['currency-peso', 'Pesos digitales', TNA_LABEL, false],
        ['currency-dollar', 'Dólares digitales', 'Pronto', true],
        ['currency-bitcoin', 'Bitcoin y cripto', 'Pronto', true],
        ['stocks', 'Acciones', 'Pronto', true]].map(([ic, t, tag, soon]) =>
        <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 2px', opacity: soon ? 0.55 : 1 }}>
            <IconBadge icon={ic} bg="rgba(8,8,9,0.05)" fg="#141414" size={40} />
            <span style={{ flex: 1, font: '500 15px Inter', color: '#141414' }}>{t}</span>
            {soon ?
          <span style={{ font: '600 11px Inter', color: LX.text2, background: LX.layer3, padding: '4px 10px', borderRadius: 999 }}>{tag}</span> :
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <TnaChip compact label={tag} />
                <LI name="selected" size={20} color="var(--c-lemon-50)" />
              </span>}
          </div>)}
        <Btn variant="primary" onClick={() => setAssetSheet(false)} style={{ marginTop: 12 }}>Listo</Btn>
      </Sheet>
    </div>);
}

Object.assign(window, {
  TNA, TNA_LABEL, monthlyYield, dailyYield, cajaTotal, fmtP, fmtP2, BigAmount, CAJA_TEMPLATES, getTemplate,
  CAJA_EMOJIS, IconBadge, CajaBadge, TnaChip, CajaHeroArt, CajasSplash, CajaRow, NoGastoHint, Keypad, AmountScreen,
  buildSeries, CajaSparkline, AporteVsRendBar, ProgressRing
});
