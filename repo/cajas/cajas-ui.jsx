// Cajas de pesos — UI primitives del producto (sobre el DS de lemon-ui.jsx).
// Formateo es-AR, plantillas de cajas, splash FTE, keypad y pantalla de monto.
const { useState: useStateU, useEffect: useEffectU } = React;

// ── Constantes del producto ─────────────────────────────────────
const TNA = 0.362;
const TNA_LABEL = '36,2% TNA';

// cada cofre rinde en su moneda, con su tasa
const CURRENCIES = {
  ARS: { prefix: '$', tna: 0.362, label: '36,2% TNA', short: '36,2%', source: 'Pesos digitales', icon: 'currency-peso' },
  USD: { prefix: 'U$', tna: 0.046, label: '4,6% TNA', short: '4,6%', source: 'Dólares digitales', icon: 'currency-dollar' }
};
const curOf = (c) => CURRENCIES[(c && c.currency) || 'ARS'];

const monthlyYield = (n, tna = TNA) => n * tna / 12;
const dailyYield = (n, tna = TNA) => n * tna / 365;
const cajaTotal = (c) => c.amount + c.earned; // saldo = aportes + rendimiento

// formateo es-AR: $1.487.283 / $1.487.283,93 / U$2.234,15
const fmtP = (n) => '$' + Math.round(n).toLocaleString('es-AR');
const fmtP2 = (n) => '$' + n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtC = (n, cur = 'ARS') => CURRENCIES[cur].prefix + Math.round(n).toLocaleString('es-AR');
const fmtC2 = (n, cur = 'ARS') => CURRENCIES[cur].prefix + n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
// rendimientos: en dólares la tasa es baja y los montos chicos → siempre con centavos
const fmtY = (n, cur = 'ARS') => cur === 'USD' ? fmtC2(n, cur) : fmtC(n, cur);

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

// badge de caja: emoji elegido por el usuario sobre el color de la plantilla.
// fill (0..1) pinta el nivel de llenado hacia el objetivo desde abajo.
const CajaBadge = ({ caja, size = 44, fill = null }) =>
<div style={{ position: 'relative', width: size, height: size, borderRadius: 999, background: caja.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
    {fill != null &&
  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: `${Math.min(1, Math.max(0, fill)) * 100}%`, background: caja.fg, opacity: 0.24, transition: 'height .6s ease' }} />}
    {caja.emoji ?
  <span style={{ position: 'relative', fontSize: Math.round(size * 0.5), lineHeight: 1 }}>{caja.emoji}</span> :
  <LI name={caja.icon} size={Math.round(size * 0.5)} color={caja.fg} style={{ position: 'relative' }} />}
  </div>;

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

// ── Arte: cofre bajo llave (candado + escudo) ───────────────────
const CajaLockArt = ({ size = 200 }) =>
<svg width={size} height={size * 0.86} viewBox="0 0 240 206" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="120" cy="106" r="92" fill="#EAF6C9" />
    {/* cofre */}
    <g style={{ filter: 'drop-shadow(0 10px 18px rgba(120,180,20,0.35))' }}>
      <rect x="58" y="66" width="124" height="98" rx="18" fill="#CFFF2E" />
      <rect x="58" y="66" width="124" height="26" rx="13" fill="#B7F53A" />
      <rect x="94" y="75" width="52" height="8" rx="4" fill="#141414" />
    </g>
    {/* candado al frente */}
    <g style={{ filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.22))' }}>
      <path d="M102 122v-11a18 18 0 0 1 36 0v11" stroke="#2B2A28" strokeWidth="9" fill="none" strokeLinecap="round" />
      <rect x="92" y="120" width="56" height="44" rx="11" fill="#141414" />
      <circle cx="120" cy="138" r="6" fill="#CFFF2E" />
      <rect x="117" y="139" width="6" height="12" rx="3" fill="#CFFF2E" />
    </g>
    {/* escudo con check */}
    <g style={{ filter: 'drop-shadow(0 5px 9px rgba(0,0,0,0.18))' }}>
      <path d="M190 78l17 6.5v13c0 11-7.5 17.5-17 21.5-9.5-4-17-10.5-17-21.5v-13Z" fill="#925DEE" />
      <path d="M183.5 95.5l5 5 9-10" stroke="#fff" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    {/* destellos */}
    <path d="M44 68l3.5 8 8 3.5-8 3.5-3.5 8-3.5-8-8-3.5 8-3.5Z" fill="#96C400" />
    <path d="M196 152l2.5 5.5 5.5 2.5-5.5 2.5-2.5 5.5-2.5-5.5-5.5-2.5 5.5-2.5Z" fill="#00AA18" />
  </svg>;

// ── Arte: cofre que rinde (flecha de crecimiento + moneda) ──────
const CajaYieldArt = ({ size = 200 }) =>
<svg width={size} height={size * 0.86} viewBox="0 0 240 206" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="120" cy="106" r="92" fill="#EAF6C9" />
    {/* curva de crecimiento detrás */}
    <polyline points="42,148 84,116 112,130 168,74" stroke="#00AA18" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M158 68l20 2-6 19Z" fill="#00AA18" />
    {/* moneda entrando */}
    <g>
      <circle cx="120" cy="64" r="16" fill="#141414" stroke="#CFFF2E" strokeWidth="2.5" />
      <text x="120" y="70" textAnchor="middle" fill="#CFFF2E" style={{ font: '700 18px Inter' }}>$</text>
    </g>
    {/* cofre */}
    <g style={{ filter: 'drop-shadow(0 10px 18px rgba(120,180,20,0.35))' }}>
      <rect x="62" y="90" width="116" height="82" rx="18" fill="#CFFF2E" />
      <rect x="62" y="90" width="116" height="24" rx="12" fill="#B7F53A" />
      <rect x="96" y="98" width="48" height="7" rx="3.5" fill="#141414" />
      <rect x="80" y="130" width="54" height="9" rx="4.5" fill="rgba(8,8,8,0.18)" />
      <rect x="80" y="147" width="32" height="9" rx="4.5" fill="rgba(8,8,8,0.10)" />
    </g>
    {/* chip al instante */}
    <g style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.16))' }}>
      <rect x="142" y="150" width="76" height="26" rx="13" fill="#141414" />
      <text x="180" y="167" textAnchor="middle" fill="#CFFF2E" style={{ font: '600 11px Inter' }}>al instante</text>
    </g>
    {/* destellos */}
    <path d="M48 78l3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" fill="#96C400" />
  </svg>;

// ── Value props del splash (acordeón) ───────────────────────────
// Cimientos, en orden: 1) orden (la necesidad), 2) seguridad (el
// diferencial de largo plazo), 3) rinde y siempre es tuya (sin resignar).
const SPLASH_SLIDES = [
  {
    id: 'orden', icon: '🎯', iconBg: 'var(--c-lime-10)',
    title: 'Un cofre para cada objetivo',
    body: 'Separá tu plata como en frascos: cada meta con su nombre, su emoji y su progreso, lejos de tus gastos de todos los días.',
    chips: [['🏖️', 'Bariloche'], ['🛟', 'Emergencias'], ['🚗', 'El auto']]
  },
  {
    id: 'seguro', icon: '🛡️', iconBg: 'var(--c-nebula-5)',
    title: 'Bajo llave, de verdad',
    body: 'La tarjeta y el QR no ven esta plata: no se gasta sin querer. Y si guardás mucho, blindalo: PIN para abrirlo y 24 h para retirar.',
    chips: [['🛡️', 'Blindaje opcional'], ['💳', 'Invisible para la tarjeta']]
  },
  {
    id: 'rinde', icon: '📈', iconBg: 'var(--c-lemon-5)',
    title: 'Rinde, y siempre es tuya',
    body: 'Tu plata genera rendimientos todos los días mientras está guardada. Y la retirás al instante, sin plazos ni penalidades.',
    chips: [['📈', '36,2% TNA en pesos'], ['💵', '4,6% TNA en dólares']]
  }];

// ── Splash FTE (full-screen, sube de abajo — mismo patrón que NfcSplash) ──
const CajasSplash = ({ open, onClose, onPrimary }) => {
  const [mounted, setMounted] = useStateU(false);
  const [shown, setShown] = useStateU(false);
  const [openId, setOpenId] = useStateU(null);
  useEffectU(() => {
    if (open) {
      setMounted(true);
      setOpenId(null);
      const t = setTimeout(() => setShown(true), 20);
      // el primero se abre solo: enseña la interacción sin explicarla
      const t2 = setTimeout(() => setOpenId((v) => v == null ? 'orden' : v), 620);
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
        {/* título + acordeón: tocás cada propuesta y se despliega */}
        <div style={{ flexShrink: 0, padding: '28px 24px 2px' }}>
          <div style={{ font: '500 30px Geist', lineHeight: '36px', letterSpacing: '-0.01em', color: '#141414' }}>Ordená tu plata en cofres</div>
        </div>

        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '16px 16px 4px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {SPLASH_SLIDES.map((sl) => {
            const abierto = openId === sl.id;
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
                        {sl.id === 'orden' ? <CajaHeroArt size={158} animate={abierto} /> :
                        sl.id === 'seguro' ? <CajaLockArt size={158} /> : <CajaYieldArt size={158} />}
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
          <button onClick={onPrimary} style={{ width: '100%', height: 48, border: 0, borderRadius: 16, cursor: 'pointer', background: '#141414', color: '#FFFFFF', font: '600 16px Inter', letterSpacing: '-0.1px' }}>Crear mi primer cofre</button>
          <button onClick={onClose} style={{ width: '100%', height: 48, border: 0, borderRadius: 16, cursor: 'pointer', background: 'rgba(8,8,8,0.1)', color: '#141414', font: '600 16px Inter', letterSpacing: '-0.1px' }}>Ahora no</button>
        </div>
      </div>
    </div>);
};

// ── Fila de caja (lista en Pesos digitales) ─────────────────────
const CajaRow = ({ caja, onTap }) => {
  const total = cajaTotal(caja);
  const ck = caja.currency || 'ARS';
  const pct = caja.goal ? Math.min(1, total / caja.goal) : null;
  return (
    <button onClick={onTap} style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left', cursor: 'pointer', background: LX.layer, border: 0, borderRadius: 20, padding: 16, boxShadow: 'var(--shadow-card)' }}>
      <CajaBadge caja={caja} fill={pct} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ font: '500 16px Geist', letterSpacing: '-0.01em', color: '#141414', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: 6 }}>
            {caja.pin && <LI name="lock" size={13} color="#B4B4B4" />}{caja.name}
          </span>
          <span style={{ font: '500 16px Geist', letterSpacing: '-0.01em', color: '#141414', flexShrink: 0 }}>{fmtC(total, ck)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 3 }}>
          <span style={{ font: '400 12px Inter', color: '#818181' }}>
            {caja.goal ? `Objetivo ${fmtC(caja.goal, ck)}` : 'Cofre libre'}{ck === 'USD' && ' · Dólares'}
          </span>
          <span style={{ font: '500 12px Inter', color: 'var(--c-lemon-50)', flexShrink: 0 }}>+{fmtC2(caja.earned, ck)}</span>
        </div>
        {pct !== null &&
        <div style={{ marginTop: 9 }}><Meter value={pct} color={caja.fg} h={5} /></div>}
      </div>
    </button>);
};

// ── Contador animado (para el success: cuenta de $0 al monto) ───
const CountUp = ({ to, duration = 950, delay = 400, render }) => {
  const [v, setV] = useStateU(0);
  useEffectU(() => {
    let raf;
    const t0 = performance.now() + delay;
    const tick = (now) => {
      const p = Math.min(1, Math.max(0, (now - t0) / duration));
      setV(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return render(v);
};

// ── Micro-confetti lime (una sola ráfaga al montar) ─────────────
const ConfettiBurst = ({ count = 18 }) => {
  const [parts] = useStateU(() =>
  Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
    const d = 55 + Math.random() * 80;
    return {
      dx: Math.cos(a) * d, dy: Math.sin(a) * d * 0.75 + 34,
      rot: 140 + Math.random() * 420, delay: 0.62 + Math.random() * 0.18,
      dur: 0.9 + Math.random() * 0.5, w: 5 + Math.random() * 4, h: 7 + Math.random() * 5,
      round: Math.random() < 0.35, color: ['#CFFF2E', '#00DF1A', '#B7F53A', '#141414'][i % 4]
    };
  }));
  return (
    <div style={{ position: 'absolute', inset: -34, pointerEvents: 'none' }}>
      {parts.map((p, i) =>
      <span key={i} style={{
        position: 'absolute', left: '50%', top: '44%', width: p.w, height: p.round ? p.w : p.h,
        borderRadius: p.round ? 999 : 2, background: p.color,
        '--dx': `${p.dx}px`, '--dy': `${p.dy}px`, '--rot': `${p.rot}deg`,
        animation: `lc-confetti ${p.dur}s cubic-bezier(.15,.55,.45,1) ${p.delay}s both`
      }} />)}
    </div>);
};

// ── Arte del success: la moneda cae adentro de TU caja ──────────
// Secuencia: moneda cae (0.15s) → la caja rebota al recibirla → check pop.
const CajaSuccessArt = ({ caja, size = 210 }) =>
<svg width={size} height={size * 0.72} viewBox="0 0 210 151" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="105" cy="86" r="62" fill="#EAF6C9" />
    {/* moneda que cae a la ranura */}
    <g style={{ animation: 'lc-coin-fall 1.05s cubic-bezier(.35,1.3,.5,1) both', animationDelay: '.15s' }}>
      <circle cx="105" cy="42" r="15" fill="#141414" stroke="#CFFF2E" strokeWidth="2.5" />
      <text x="105" y="48" textAnchor="middle" fill="#CFFF2E" style={{ font: '700 17px Inter' }}>$</text>
    </g>
    {/* la caja, con el emoji del usuario en el frente */}
    <g style={{ animation: 'lc-box-squash 1.35s ease both', animationDelay: '.15s', transformOrigin: '105px 132px', filter: 'drop-shadow(0 10px 16px rgba(120,180,20,0.32))' }}>
      <rect x="58" y="62" width="94" height="70" rx="16" fill="#CFFF2E" />
      <rect x="58" y="62" width="94" height="20" rx="10" fill="#B7F53A" />
      <rect x="86" y="68" width="38" height="6" rx="3" fill="#141414" />
      <text x="105" y="119" textAnchor="middle" style={{ fontSize: 27 }}>{caja.emoji || '📦'}</text>
    </g>
    {/* check al final de la secuencia */}
    <g style={{ animation: 'lc-pop .45s cubic-bezier(.3,1.4,.5,1) both', animationDelay: '1.05s', transformOrigin: '154px 122px' }}>
      <circle cx="154" cy="122" r="15" fill="#141414" />
      <path d="M147.5 122.5l4.5 4.5 8.5-9" stroke="#CFFF2E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </g>
    {/* destellos */}
    <path d="M46 52l3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" fill="#96C400" />
    <path d="M172 58l2 4.5 4.5 2-4.5 2-2 4.5-2-4.5-4.5-2 4.5-2Z" fill="#00AA18" />
  </svg>;

// ── Aviso "apartada de verdad" (tarjeta/QR no la ven) ───────────
const NoGastoHint = ({ source = 'pesos digitales', armored = false }) =>
<div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '2px 6px' }}>
    <LI name="card-off" size={16} color="#818181" style={{ marginTop: 2, flexShrink: 0 }} />
    <span style={{ font: '400 12px Inter', color: '#818181', lineHeight: 1.45 }}>
      {armored ?
    <>La tarjeta y el QR no ven esta plata. Es un cofre blindado: los retiros llegan a tus {source} en 24 h.</> :
    <>La tarjeta y el QR no ven esta plata. Para gastarla, retirala: vuelve a tus {source} al instante, sin penalidad.</>}
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
    earnedRaw += dailyYield(Math.max(0, contributed), curOf(caja).tna);
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
    const tna = curOf(caja).tna;
    const end = total + dailyYield(total, tna) * 30;
    const y = (v, min, max) => H - PAD - (v - min) / (max - min || 1) * (H - PAD * 2);
    const min = total * 0.999, max = end * 1.001;
    const pts = Array.from({ length: 31 }, (_, i) => `${PAD + i * (W - PAD * 2) / 30},${y(total + dailyYield(total, tna) * i, min, max)}`);
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

// ── Pantalla de monto (crear / agregar / retirar / objetivo) ────
// max = tope disponible. goalMode: sin origen de fondos ni tope real
// (define una meta, no mueve plata); hint = leyenda bajo el monto;
// secondary = { label, onPress } botón fantasma bajo el CTA;
// quick = etiqueta de acceso rápido que carga el máximo (p.ej. Retirar todo);
// currency define prefijo, tasa y origen de fondos del cofre.
function AmountScreen({ headerTitle, title, subtitle, currency = 'ARS', max, cta, onBack, onClose, onConfirm, badge, withdraw, goalMode, hint, secondary, quick }) {
  const [value, setValue] = useStateU(0);
  const [assetSheet, setAssetSheet] = useStateU(false);
  const cur = CURRENCIES[currency];
  const over = value > max;
  const ok = value > 0 && !over;

  const digit = (d) => setValue((v) => Math.floor(v) * 10 + d > 999999999 ? v : Math.floor(v) * 10 + d);
  const back = () => setValue((v) => Math.floor(Math.floor(v) / 10));
  const fmtVal = (n) => cur.prefix + (Number.isInteger(n) ? n.toLocaleString('es-AR') : n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      <Screen scroll={false} footer={
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Btn variant="primary" disabled={!ok} onClick={() => onConfirm(value)}>{cta}</Btn>
          {secondary && <Btn variant="ghost" onClick={secondary.onPress}>{secondary.label}</Btn>}
        </div>
      }>
        <StepHeader title={headerTitle} onBack={onBack} onClose={onClose} />
        <div style={{ height: 'calc(100% - 52px)', display: 'flex', flexDirection: 'column', padding: '4px 16px 0' }}>

          {/* cabecera centrada: el cofre arriba, la pregunta abajo */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12, padding: '4px 8px 0' }}>
            {badge}
            <div>
              <div style={{ font: '500 21px Geist', letterSpacing: '-0.02em', color: LX.text1, lineHeight: 1.25 }}>{title}</div>
              {subtitle && <div style={{ font: '400 13px Inter', color: '#818181', marginTop: 5 }}>{subtitle}</div>}
            </div>
          </div>

          {/* monto grande centrado */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, minHeight: 0 }}>
            <div style={{ font: `500 ${value >= 10000000 ? 40 : 48}px Geist`, letterSpacing: '-0.03em', color: over ? 'var(--c-rose-40)' : value === 0 ? '#B4B4B4' : '#141414', transition: 'color .15s' }}>
              {fmtVal(value)}
            </div>

            {goalMode ?
            /* definiendo una meta: sin origen de fondos ni tope */
            hint &&
            <div style={{ font: '400 13px Inter', color: '#818181', lineHeight: 1.45, maxWidth: 280, textAlign: 'center' }}>{hint}</div> :

            <>
              {/* origen de fondos */}
              <button onClick={() => setAssetSheet(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, border: 0, cursor: 'pointer', background: 'rgba(8,8,9,0.05)', borderRadius: 999, padding: '7px 14px' }}>
                <LI name={cur.icon} size={16} color="#141414" />
                <span style={{ font: '500 13px Inter', color: '#141414' }}>{withdraw ? `Vuelve a ${cur.source}` : cur.source}</span>
                <span style={{ font: '400 13px Inter', color: '#818181' }}>· {withdraw ? 'en el cofre' : 'disponible'} {fmtC2(max, currency)}</span>
                {!withdraw && <LI name="arrow-expand-more" size={15} color="#818181" />}
              </button>

              {/* acceso rápido: cargar el máximo (Retirar todo / Total disponible) */}
              {quick &&
              <button onClick={() => setValue(max)} style={{ border: `1.5px solid ${LX.border}`, cursor: 'pointer', borderRadius: 999, padding: '8px 18px', background: value === max ? '#141414' : LX.layer, font: '600 13px Inter', color: value === max ? '#fff' : '#141414' }}>{quick}</button>}

              {over ?
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, font: '500 13px Inter', color: 'var(--c-rose-40)' }}>
                  <LI name="feedback-warning" size={16} color="var(--c-rose-40)" /> Te pasás de lo {withdraw ? 'que hay en el cofre' : 'disponible'}
                </div> :
              withdraw ?
              hint &&
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'var(--c-solar-5)', borderRadius: 999, padding: '6px 14px', font: '500 12px Inter', color: 'var(--c-solar-60)', maxWidth: 320 }}>
                  <LI name="alert-time" size={14} color="var(--c-solar-50)" /> {hint}
                </div> :
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'var(--c-lime-10)', borderRadius: 999, padding: '6px 14px', font: '500 13px Inter', color: 'var(--c-lime-70)' }}>
                  <LI name="earn" size={15} color="var(--c-lime-60)" />
                  {value > 0 ? `Rinde ≈ +${fmtY(monthlyYield(value, cur.tna), currency)} por mes` : `Rinde ${cur.label}, todos los días`}
                </div>}
            </>}
          </div>

          {/* keypad */}
          <div style={{ flexShrink: 0, paddingBottom: 6 }}>
            <Keypad onDigit={digit} onBackspace={back} />
          </div>
        </div>
      </Screen>

      {/* sheet: con qué activo rinde este cofre */}
      <Sheet open={assetSheet} onClose={() => setAssetSheet(false)}>
        <div style={{ font: '500 20px Geist', letterSpacing: '-0.01em', color: LX.text1, margin: '2px 2px 4px' }}>¿Con qué rinde?</div>
        <div style={{ font: '400 13px Inter', color: LX.text2, margin: '0 2px 14px' }}>Cada cofre rinde en su moneda. Pronto se suman cripto y acciones.</div>
        {[
        ['ARS', 'currency-peso', 'Pesos digitales', CURRENCIES.ARS.label, false],
        ['USD', 'currency-dollar', 'Dólares digitales', CURRENCIES.USD.label, false],
        ['BTC', 'currency-bitcoin', 'Bitcoin y cripto', 'Pronto', true],
        ['STK', 'stocks', 'Acciones', 'Pronto', true]].map(([id, ic, t, tag, soon]) =>
        <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 2px', opacity: soon ? 0.55 : 1 }}>
            <IconBadge icon={ic} bg="rgba(8,8,9,0.05)" fg="#141414" size={40} />
            <span style={{ flex: 1, font: '500 15px Inter', color: '#141414' }}>{t}</span>
            {soon ?
          <span style={{ font: '600 11px Inter', color: LX.text2, background: LX.layer3, padding: '4px 10px', borderRadius: 999 }}>{tag}</span> :
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <TnaChip compact label={tag} />
                {id === currency && <LI name="selected" size={20} color="var(--c-lemon-50)" />}
              </span>}
          </div>)}
        <Btn variant="primary" onClick={() => setAssetSheet(false)} style={{ marginTop: 12 }}>Listo</Btn>
      </Sheet>
    </div>);
}

Object.assign(window, {
  TNA, TNA_LABEL, CURRENCIES, curOf, monthlyYield, dailyYield, cajaTotal, fmtP, fmtP2, fmtC, fmtC2, fmtY, BigAmount,
  CAJA_TEMPLATES, getTemplate, CAJA_EMOJIS, IconBadge, CajaBadge, TnaChip, CajaHeroArt, CajaLockArt, CajaYieldArt, CajasSplash, CajaRow,
  NoGastoHint, Keypad, AmountScreen, buildSeries, CajaSparkline, AporteVsRendBar, ProgressRing, CountUp,
  ConfettiBurst, CajaSuccessArt
});
