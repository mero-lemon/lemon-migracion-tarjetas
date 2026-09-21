// Componentes propios de la Lemon Credit Card. Todo lo que no existe en
// lemon-ui.jsx / screens-shared.jsx vive acá: íconos de activo, montos
// grandes, tarjetas de opción, toggle, avisos in-app, timeline de fechas,
// heros del onboarding y el marco/escala del teléfono para la vista de mapa.
// El selector de límite vive en credito-limite.jsx.
const { useState: useStateU, useEffect: useEffectU, useRef: useRefU, useMemo: useMemoU } = React;
const M = window.CreditoModel;

// ── Paleta propia (siempre vía tokens del DS) ───────────────────
const CR = {
  page: '#F3F3F3', // el fondo de la app real, el mismo que usan /cajas/, /onboarding/ y /gastos/
  ink: '#141414', ink2: '#5E5E5E', ink3: '#818181', hair: 'var(--c-gray-10)', // hair = la misma línea que Divider
  ok: 'var(--c-lemon-50)', okSoft: 'var(--c-lemon-5)',
  warn: 'var(--c-orange-40)', warnSoft: 'var(--bg-warning-01)',
  bad: 'var(--c-rose-40)', badSoft: 'var(--bg-negative-01)',
  info: 'var(--c-nebula-40)', infoSoft: 'var(--c-nebula-5)',
  lime: 'var(--c-lime-40)',
  // los tres números, cada uno con su color: nunca se confunden
  limite: '#141414', disponible: 'var(--c-lemon-50)', saldo: 'var(--c-nebula-50)'
};
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

// ── Activos ─────────────────────────────────────────────────────
// Badge redondo con el color del activo y el ícono currency-* del icon font
// (los mismos que declara el modelo), no un glifo tipográfico.
const AssetIcon = ({ id, size = 36, style }) => {
  const a = M.ASSETS[id];
  const bg = { ARS: 'linear-gradient(180deg, var(--c-lemon-40) 0%, var(--c-lime-40) 100%)', USDC: 'linear-gradient(180deg, var(--c-sky-40) 0%, var(--c-blue-40) 100%)', BTC: 'linear-gradient(180deg, var(--c-bitcoin-30) 0%, var(--c-bitcoin-40) 100%)' }[id];
  return (
    <span style={{ width: size, height: size, borderRadius: 999, background: bg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), 0 2px 6px rgba(0,0,0,0.12)', ...style }} title={a.long}>
      <LI name={a.icon} size={Math.round(size * (size < 20 ? 0.7 : 0.55))} color="#fff" />
    </span>);
};

// ── Montos ──────────────────────────────────────────────────────
// Entero grande + centavos chicos (misma anatomía que la home de la app)
const BigAmount = ({ value, size = 40, color = CR.ink, prefix = '$', cents = true, style }) => {
  const ent = Math.floor(Math.abs(value));
  const c = Math.round((Math.abs(value) - ent) * 100);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', ...style }}>
      <span style={{ font: `500 ${size}px Geist`, lineHeight: 1.15, letterSpacing: '-0.03em', color }}>{value < 0 ? '−' : ''}{prefix}{ent.toLocaleString('es-AR')}</span>
      {cents && <span style={{ font: `500 ${Math.round(size * 0.55)}px Geist`, lineHeight: 1.5, letterSpacing: '-0.03em', color: '#B4B4B4' }}>,{String(c).padStart(2, '0')}</span>}
    </div>);
};
// Monto en unidades de un activo, con el ícono chiquito
const AssetAmount = ({ units, asset, size = 14, color = CR.ink, approx, style }) =>
<span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6, ...style }}>
    <span style={{ font: `500 ${size}px Geist`, letterSpacing: '-0.01em', color }}>{M.fmtUnits(units, asset)}</span>
    {approx != null && asset !== 'ARS' && <span style={{ font: `400 ${Math.max(11, size - 3)}px Inter`, color: CR.ink3 }}>≈ {M.fmtArs(approx)}</span>}
  </span>;

// ── Controles ───────────────────────────────────────────────────
const Radio = ({ on, color = CR.ink, size = 22 }) =>
<span style={{ width: size, height: size, borderRadius: 999, border: `2px solid ${on ? color : '#C9C9C4'}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'border-color .2s' }}>
    <span style={{ width: size - 10, height: size - 10, borderRadius: 999, background: color, transform: on ? 'scale(1)' : 'scale(0)', transition: `transform .25s ${EASE}` }} />
  </span>;

const Check = ({ on, size = 22 }) =>
<span style={{ width: size, height: size, borderRadius: 999, background: on ? CR.ink : 'transparent', border: `2px solid ${on ? CR.ink : '#C9C9C4'}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .2s' }}>
    {on && <LI name="selected" size={size - 8} color="#fff" />}
  </span>;

const Toggle = ({ on, onChange, disabled }) =>
<button onClick={() => !disabled && onChange(!on)} aria-pressed={on} style={{ width: 51, height: 31, borderRadius: 999, border: 0, padding: 2, cursor: disabled ? 'default' : 'pointer', background: on ? CR.ok : 'var(--c-gray-30)', transition: 'background .25s', flexShrink: 0, opacity: disabled ? 0.5 : 1 }}>
    <span style={{ display: 'block', width: 27, height: 27, borderRadius: 999, background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.2)', transform: on ? 'translateX(20px)' : 'none', transition: `transform .25s ${EASE}` }} />
  </button>;

// Tarjeta seleccionable — blanca, borde fino; seleccionada = borde tinta 2px
const OptionCard = ({ selected, disabled, onClick, children, pad = 16, style, accent = CR.ink }) =>
<div onClick={disabled ? undefined : onClick} role="button" aria-disabled={disabled} aria-pressed={selected} style={{
  position: 'relative', background: '#fff', borderRadius: 16, padding: pad, cursor: disabled || !onClick ? 'default' : 'pointer',
  border: `2px solid ${selected ? accent : 'transparent'}`,
  boxShadow: selected ? '0 8px 24px rgba(20,20,20,0.10)' : 'var(--shadow-card)',
  opacity: disabled ? 0.92 : 1, transition: `border-color .2s, box-shadow .25s, background .25s, transform .2s ${EASE}`, ...style
}}
  onMouseDown={(e) => { if (!disabled && onClick) e.currentTarget.style.transform = 'scale(0.985)'; }}
  onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>{children}</div>;

// Control de «seleccionado» sobre la card negra: círculo lima con check
const SelCheck = ({ size = 24 }) =>
<span style={{ width: size, height: size, borderRadius: 999, background: 'var(--c-lime-40)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
    <LI name="selected" size={Math.round(size * 0.58)} color="#141414" />
  </span>;

// Cabecera de sección plana de la landing («Consumos del período →»)
const SectionHead = ({ label, onClick }) =>
<div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: onClick ? 'pointer' : 'inherit' }}>
    <span style={{ flex: 1, font: '400 14px Inter', color: CR.ink2 }}>{label}</span>
    <LI name="arrow-foward" size={18} color={CR.ink2} />
  </div>;

// Pill blanca flotante sobre una imagen hero (receta de /onboarding/)
const HeroPill = ({ icon, children }) =>
<span style={{ position: 'absolute', top: 14, left: 14, display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', borderRadius: 999, padding: '7px 12px', boxShadow: '0 6px 16px rgba(8,8,9,0.14)', font: '600 12px Inter', color: CR.ink }}>
    {icon && <LI name={icon} size={14} color={CR.ok} />}{children}
  </span>;

// ── Promo de la home sin tarjeta: el render real de la tarjeta, el único
// bloque oscuro del prototipo. Lo aspiracional lo dicen la imagen y el
// título; lo factual, el sub (respaldo, límite propio, sin historial).
const CreditoHeroPromo = ({ onPedir }) =>
<div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', background: '#0B0B0B', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)', animation: `ob-up .5s ${EASE}` }}>
    <img src="assets/credito-hero.png" alt="" style={{ display: 'block', width: '100%', height: 300, objectFit: 'cover', objectPosition: '50% 40%' }} />
    {/* velo: la tarjeta se funde en el negro antes de que empiece el texto */}
    <div style={{ position: 'absolute', left: 0, right: 0, top: 130, height: 170, background: 'linear-gradient(180deg, rgba(11,11,11,0) 0%, rgba(11,11,11,0.55) 40%, rgba(11,11,11,0.92) 68%, #0B0B0B 88%)' }} />
    <div style={{ position: 'relative', marginTop: -56, padding: '0 24px 24px', textAlign: 'center' }}>
      <div style={{ font: '500 30px Geist', letterSpacing: '-0.02em', lineHeight: 1.12, color: '#fff', textWrap: 'balance' }}>{window.CreditoCopy.promo.headline}</div>
      <div style={{ margin: '10px auto 0', maxWidth: 300, font: '400 15px Inter', lineHeight: 1.45, color: 'rgba(255,255,255,0.72)', textWrap: 'balance' }}>{window.CreditoCopy.promo.sub}</div>
      <div style={{ marginTop: 22 }}><Btn variant="primary" onClick={onPedir} style={{ background: '#fff', color: '#141414' }}>{window.CreditoCopy.promo.cta}</Btn></div>
    </div>
  </div>;

// ── Píldoras de estado de la tarjeta ────────────────────────────
const CardStatusPill = ({ status }) => {
  const m = {
    activa: ['#E6FEF0', '#1CB854', 'Activa'],
    pausada: ['var(--c-gray-20)', 'var(--c-gray-70)', 'Pausada'],
    congelada: ['#E8F1FF', '#274BBE', 'Congelada'],
    camino: ['#FDF4ED', '#F0A20B', 'En camino'],
    pedida: ['#FDF4ED', '#F0A20B', 'Pedido en curso'],
    retiro: ['var(--c-gray-20)', 'var(--c-gray-70)', 'Retiro en curso']
  }[status] || ['#E6FEF0', '#1CB854', status];
  return <span style={{ display: 'inline-flex', alignItems: 'center', background: m[0], color: m[1], font: '500 12px Inter', padding: '3px 9px', borderRadius: 999, whiteSpace: 'nowrap' }}>{m[2]}</span>;
};

const VolPill = ({ volatil }) =>
<span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: volatil ? CR.warnSoft : CR.okSoft, color: volatil ? '#854600' : '#0F602C', font: '600 11px Inter', padding: '3px 8px', borderRadius: 999, whiteSpace: 'nowrap' }}>
    <LI name={volatil ? 'stocks' : 'shield-alt'} size={11} color={volatil ? '#854600' : '#0F602C'} />
    {volatil ? 'Volátil' : 'Estable'}
  </span>;

// ── Filas de información (label gris · valor a la derecha) ──────
const InfoRow = ({ label, value, sub, strike, tag, onClick, last }) =>
<div onClick={onClick} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '13px 0', borderBottom: last ? 'none' : `1px solid ${CR.hair}`, cursor: onClick ? 'pointer' : 'default' }}>
    <span style={{ flex: 1, font: '400 14px Inter', color: CR.ink3, paddingTop: 1 }}>{label}</span>
    <span style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
      <span style={{ font: '500 16px Geist', letterSpacing: '-0.01em', color: strike ? CR.ink3 : CR.ink, textDecoration: strike ? 'line-through' : 'none' }}>{value}</span>
      {sub && <span style={{ font: '400 12px Inter', color: CR.ink3 }}>{sub}</span>}
      {tag}
    </span>
    {onClick && <LI name="arrow-foward" size={16} color={CR.ink3} style={{ marginTop: 3 }} />}
  </div>;

// ── Aviso in-app (lo que hoy sale solo por push/Braze) ──────────
const Notice = ({ tone = 'info', icon, title, body, actions, style }) => {
  const c = { info: [CR.infoSoft, 'var(--c-nebula-60)', 'var(--c-nebula-70)'], warn: [CR.warnSoft, '#B8600A', '#854600'], bad: [CR.badSoft, CR.bad, '#7A1420'], ok: [CR.okSoft, CR.ok, '#0F602C'], neutral: ['#F3F3F3', CR.ink2, CR.ink] }[tone];
  return (
    <div style={{ background: c[0], borderRadius: 16, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start', ...style }}>
      <span style={{ width: 34, height: 34, borderRadius: 999, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <LI name={icon || 'feedback-warning'} size={17} color={c[1]} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ font: '500 14px Geist', letterSpacing: '-0.01em', color: c[2] }}>{title}</div>
        {body && <div style={{ font: '400 13px Inter', lineHeight: 1.45, color: c[2], opacity: 0.85, marginTop: 3 }}>{body}</div>}
        {actions && <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>{actions}</div>}
      </div>
    </div>);
};
// botón chico para adentro de un Notice / fila
const MiniBtn = ({ children, onClick, tone = 'dark', icon }) => {
  const s = { dark: ['#141414', '#fff'], light: ['#fff', '#141414'], lime: ['var(--c-lime-40)', '#141414'], ghost: ['transparent', '#141414'] }[tone];
  return (
    <button onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: tone === 'ghost' ? '1px solid rgba(20,20,20,0.18)' : 0, cursor: 'pointer', background: s[0], color: s[1], font: '600 12px Inter', padding: '8px 12px', borderRadius: 999 }}>
      {icon && <LI name={icon} size={13} color={s[1]} />}{children}
    </button>);
};

// Dato a confirmar con producto (dashed, discreto) — se apaga con ?notas=0
const Flag = ({ children }) =>
window.__CR_NOTAS === false ? null :
<div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '8px 10px', border: '1px dashed #C9C9C4', borderRadius: 12, font: '400 11px Inter', lineHeight: 1.45, color: CR.ink3 }}>
    <LI name="help-variant" size={13} color={CR.ink3} style={{ marginTop: 1 }} />
    <span><b style={{ color: CR.ink2, fontWeight: 600 }}>A confirmar:</b> {children}</span>
  </div>;

// ── Timeline horizontal de fechas (cierre → vence → congela) ────
const DateTimeline = ({ dates, compact, keys = ['cierre', 'vencimiento'], approx = true }) => {
  // Solo cierre y vencimiento (Jero, 21/09): el «se congela» no va acá.
  // Con approx, las DOS fechas llevan ≈: mientras el usuario elige el grupo
  // todavía no se puede prometer el día exacto de cierre ni el de vencimiento.
  // Una vez creada la tarjeta quedan fijas y se muestran sin el signo.
  const all = {
    cierre: { k: 'cierre', label: approx ? 'Cierra aprox.' : 'Cierra', d: dates.cierre, color: CR.ink },
    vencimiento: { k: 'vencimiento', label: approx ? 'Vence aprox.' : 'Vence', d: dates.vencimiento, color: CR.saldo },
    congela: { k: 'congela', label: 'Se congela', d: dates.congela, color: CR.bad }
  };
  const pts = keys.map((k) => all[k]);
  return (
    <div style={{ position: 'relative', padding: compact ? '6px 0 0' : '10px 0 0' }}>
      <div style={{ position: 'absolute', left: '16%', right: '16%', top: compact ? 11 : 15, height: 2, background: CR.hair }} />
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${pts.length}, 1fr)` }}>
        {pts.map((p) =>
        <div key={p.k} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, position: 'relative' }}>
            <span style={{ width: compact ? 10 : 12, height: compact ? 10 : 12, borderRadius: 999, background: p.color, border: '2px solid #fff', boxShadow: '0 0 0 1px ' + CR.hair }} />
            <span style={{ font: `500 ${compact ? 12 : 13}px Geist`, letterSpacing: '-0.01em', color: CR.ink }}>{approx && p.k !== 'congela' ? '≈ ' : ''}{M.fmtDateShort(p.d)}</span>
            <span style={{ font: `400 ${compact ? 10 : 11}px Inter`, color: CR.ink3, marginTop: -3 }}>{p.label}</span>
          </div>)}
      </div>
    </div>);
};

// Link de ayuda tocable («¿Cómo funciona el respaldo?») que abre una sheet
const HelperLink = ({ children, onClick, style }) =>
<button onClick={onClick} style={{ border: 0, background: 'transparent', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, font: '500 13px Inter', color: CR.ink2, padding: '10px 4px', ...style }}>
    <LI name="view-help" size={16} color={CR.ink2} />{children}
  </button>;

// Sheet de ayuda: título + viñetas con ícono + cerrar
const HelperSheet = ({ title, items, close = 'Entendido', onClose }) =>
<div style={{ padding: '6px 2px 2px' }}>
    <div style={{ font: '500 20px Geist', letterSpacing: '-0.01em', color: CR.ink }}>{title}</div>
    <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {items.map(([ic, t]) =>
      <div key={t} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{ width: 34, height: 34, borderRadius: 999, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'var(--shadow-card)' }}><LI name={ic} size={16} color={CR.ink} /></span>
          <div style={{ font: '400 14px Inter', color: CR.ink, lineHeight: 1.45, paddingTop: 6 }}>{t}</div>
        </div>)}
    </div>
    <div style={{ marginTop: 16 }}><Btn variant="light" onClick={onClose}>{close}</Btn></div>
  </div>;

// ── Tabs "Pre-paga / Crédito" clickeables ───────────────────────
const SegTabs = ({ tabs, active, onChange }) =>
<div style={{ display: 'flex', gap: 24, padding: '0 2px' }}>
    {tabs.map((t) =>
  <button key={t.id} onClick={() => onChange && onChange(t.id)} style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: '0 0 8px', font: '600 18px Inter', color: t.id === active ? CR.ink : '#B4B4B4', borderBottom: `2px solid ${t.id === active ? CR.ink : 'transparent'}`, transition: 'color .2s' }}>{t.label}</button>
  )}
  </div>;

// ── Medidor semicircular (como el de la app de hoy): el arco entero es el
// LÍMITE; lo pintado es lo DISPONIBLE. Nunca se muestra en 0 por una pausa.
const Gauge = ({ value = 0, color = CR.disponible, track = '#EDEDED', size = 236, children }) => {
  const r = 96, cx = 110, cy = 106, w = 14;
  const len = Math.PI * r;
  const pct = Math.max(0, Math.min(1, value));
  const d = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  return (
    <div style={{ position: 'relative', width: size, height: size * 0.53, margin: '0 auto' }}>
      <svg viewBox="0 0 220 116" width={size} height={size * 0.53} style={{ display: 'block' }}>
        <path d={d} fill="none" stroke={track} strokeWidth={w} strokeLinecap="round" />
        <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeDasharray={`${len} ${len}`} strokeDashoffset={len * (1 - pct)} style={{ transition: `stroke-dashoffset .6s ${EASE}, stroke .3s` }} />
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>{children}</div>
    </div>);
};

// ── Marco del teléfono + escala (compartido por stage y mapa) ────
function useStageScale(pad = 132) {
  const [scale, setScale] = useStateU(1);
  useEffectU(() => {
    const calc = () => setScale(Math.min(1, (window.innerHeight - pad) / 874, (window.innerWidth - 48) / 402));
    calc(); window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);
  return scale;
}
const PhoneCr = ({ scale = 1, children, style }) =>
<div style={{ width: 402 * scale, height: 874 * scale, flexShrink: 0, ...style }}>
    <div style={{ width: 402, height: 874, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
      <IOSDevice>{children}</IOSDevice>
    </div>
  </div>;

// Botón del control strip de arriba
const StripBtn = ({ children, onClick, active, icon }) =>
<button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 6, border: `1px solid ${active ? '#141414' : '#D0CFCA'}`, background: active ? '#141414' : '#fff', color: active ? '#fff' : '#2a2a28', borderRadius: 999, padding: '6px 14px', cursor: 'pointer', font: '600 12px Inter' }}>
    {icon && <LI name={icon} size={14} color={active ? '#fff' : '#2a2a28'} />}{children}
  </button>;

Object.assign(window, {
  CR, EASE, AssetIcon, BigAmount, AssetAmount, Radio, Check, SelCheck, SectionHead, HeroPill, HelperLink, HelperSheet, CreditoHeroPromo, Toggle, OptionCard, CardStatusPill, VolPill,
  InfoRow, Notice, MiniBtn, Flag, DateTimeline, SegTabs, Gauge, useStageScale, PhoneCr, StripBtn
});
