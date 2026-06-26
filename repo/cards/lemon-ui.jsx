// Lemon Cash UI primitives + CSS card art — for the cards-migration prototype.
// Tokens come from colors_and_type.css (var(--*)); icons from lemon-icons.css (.li.li-*)
const { useState, useEffect, useRef } = React;

// quick color refs
const LX = {
  page: '#F3F2EE', // warm light page bg (matches current app)
  layer: 'var(--bg-layer-01)',
  layer2: 'var(--bg-layer-02)',
  layer3: 'var(--bg-layer-03)',
  text1: 'var(--text-primary)',
  text2: 'var(--text-secondary)',
  text3: 'var(--text-tertiary)',
  brand: 'var(--text-brand)',
  lime: 'var(--c-lime-40)',
  limeDk: 'var(--c-lime-60)',
  border: 'var(--border-card)',
  hair: 'var(--c-gray-10)',
  dark: 'var(--c-gray-95)',
  btc: 'var(--c-bitcoin-40)',
  nebula: 'var(--c-nebula-40)',
  green: 'var(--c-green-40)',
  posBg: 'var(--bg-positive-01)',
  warnBg: 'var(--bg-warning-01)'
};

// ── Icon helper (lemon icon font) ───────────────────────────────
const LI = ({ name, size = 22, color, style }) =>
<i className={`li li-${name}`} style={{ fontSize: size, color, lineHeight: 1, ...style }} />;


// ── Leaf mark (brand isotype, recreated as crisp SVG) ───────────
const Leaf = ({ size = 40, color = '#fff', vein = 'rgba(0,0,0,0.25)' }) =>
<svg width={size} height={size} viewBox="0 0 64 64" fill="none" style={{ display: 'block' }}>
    <path d="M46 10C22 11 9 28 12 51c1 1 2 1 3 1 23-2 39-19 36-41-1-1-3-1-5-1Z" fill={color} />
    <path d="M17 49C25 38 35 29 47 21" stroke={vein} strokeWidth="3.4" strokeLinecap="round" />
  </svg>;


// ── NFC waves ───────────────────────────────────────────────────
const Nfc = ({ size = 22, color = 'rgba(255,255,255,0.92)' }) =>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M7 5c4 3.2 4 10.8 0 14M11 7.5c2.4 2 2.4 7 0 9M15 10c1 .9 1 3.1 0 4"
  stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>;


// ── Card designs (CSS recreations) ──────────────────────────────
// The design selection is the "plato fuerte": each entry is a fantasy
// name + social proof + a CSS skin. `art:'tetris'` renders the green
// LEMN-blocks design; everything else is a gradient + centered isotipo.
// NOTE: placeholders — swap for real Lemon design assets when available.
const CARD_DESIGNS = [
  { id: 'tetrish', name: 'Tetrish', users: '110k', art: 'tetris', dark: true,
    bg: '#2BE76B' },
  { id: 'sticker', name: 'Sticker', users: '92k', art: 'sticker',
    bg: 'radial-gradient(120% 120% at 80% 10%, #1c2a1c 0%, #121712 55%, #0a0d0a 100%)',
    ring: 'radial-gradient(circle at 40% 34%, #2BE76B, #11924a)', leaf: '#06160c', vein: 'rgba(6,22,12,0.4)', ringBorder: '1px solid rgba(43,231,107,0.4)' },
  { id: 'violeta', name: 'Violeta', users: '78k',
    bg: 'linear-gradient(120deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 24%, rgba(255,255,255,0) 58%, rgba(255,255,255,0.12) 76%, rgba(255,255,255,0) 100%), radial-gradient(150% 130% at 76% 12%, #9460e0 0%, #6a3fb0 28%, #3a1c64 62%, #1c0c36 100%)',
    ring: 'radial-gradient(circle at 38% 32%, #2c1550, #160a2c)', leaf: 'rgba(214,196,255,0.95)', vein: 'rgba(40,18,72,0.55)', ringBorder: '1px solid rgba(190,160,255,0.35)' },
  { id: 'pink', name: 'Pink', users: '64k',
    bg: 'linear-gradient(120deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 24%, rgba(255,255,255,0) 58%, rgba(255,255,255,0.14) 76%, rgba(255,255,255,0) 100%), radial-gradient(150% 130% at 74% 12%, #ff4fb0 0%, #d6006a 34%, #7a0b46 70%, #3a0723 100%)',
    ring: 'radial-gradient(circle at 38% 32%, #5a0d34, #2c0419)', leaf: 'rgba(255,205,231,0.95)', vein: 'rgba(90,13,52,0.55)', ringBorder: '1px solid rgba(255,160,210,0.4)' },
  { id: 'green', name: 'Green', users: '120k',
    bg: 'radial-gradient(130% 120% at 22% 18%, #2ea36f 0%, #11614f 30%, #0c3338 60%, #08171d 100%), linear-gradient(120deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 26%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.08) 80%, rgba(255,255,255,0) 100%)',
    ring: 'radial-gradient(circle at 40% 34%, #d9ff4a, #a8df00)', leaf: '#0c241c', vein: 'rgba(12,36,28,0.35)', ringBorder: '1px solid rgba(255,255,255,0.18)' },
  { id: 'blue', name: 'Blue', users: '55k',
    bg: 'linear-gradient(120deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 24%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.12) 80%, rgba(255,255,255,0) 100%), radial-gradient(150% 130% at 30% 18%, #2f8bff 0%, #1a4fc4 36%, #102a78 68%, #08163a 100%)',
    ring: 'radial-gradient(circle at 40% 34%, #0f2a6e, #08163a)', leaf: 'rgba(190,214,255,0.95)', vein: 'rgba(15,42,110,0.55)', ringBorder: '1px solid rgba(150,190,255,0.4)' },
  { id: 'acid', name: 'Acid', users: '41k',
    bg: 'radial-gradient(120% 120% at 78% 14%, #5e7d00 0%, #2a3a00 50%, #0e1400 100%)',
    ring: 'radial-gradient(circle at 40% 34%, #CFFF2E, #5e7d00)', leaf: '#1a2400', vein: 'rgba(26,36,0,0.4)', ringBorder: '1px solid rgba(207,255,46,0.45)' }];

const getDesign = (id) => CARD_DESIGNS.find((d) => d.id === id) || CARD_DESIGNS[2];

// shimmer keyframe (a moving highlight sweep) — used on the picker
const _shimmerCSS = `@keyframes lc-shimmer{0%{transform:translateX(-130%) rotate(8deg)}100%{transform:translateX(130%) rotate(8deg)}}`;
if (typeof document !== 'undefined' && !document.getElementById('lc-shimmer-style')) {
  const st = document.createElement('style');st.id = 'lc-shimmer-style';st.textContent = _shimmerCSS;document.head.appendChild(st);
}

// ── Card art (virtual designs + física/crédito skins) ───────────
// `design` (Tetrish, Pink, …) wins for virtual cards; otherwise `variant`
// (fisica = boutique teal/lime · credito = black VISA).
function CardArt({ variant = 'virtual', design, width = 320, portrait = false, faded = false, glow = false, shimmer = false, style = {} }) {
  const h = Math.round(width / (portrait ? 0.63 : 1.585));
  const r = Math.max(8, Math.round(width * 0.062));
  const pad = Math.round(width * 0.058);
  const logo = Math.round(width * 0.30);

  const variantSkins = {
    fisica: {
      bg: 'radial-gradient(130% 120% at 22% 18%, #2ea36f 0%, #11614f 30%, #0c3338 60%, #08171d 100%), linear-gradient(120deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 26%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.08) 80%, rgba(255,255,255,0) 100%)',
      ring: 'radial-gradient(circle at 40% 34%, #d9ff4a, #a8df00)',
      leaf: '#0c241c', vein: 'rgba(12,36,28,0.35)',
      ringBorder: '1px solid rgba(255,255,255,0.18)', coins: true
    },
    credito: {
      bg: 'radial-gradient(130% 120% at 70% 15%, #3a3a3c 0%, #1f1f21 45%, #131315 100%), linear-gradient(120deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 24%, rgba(255,255,255,0) 62%, rgba(255,140,60,0.10) 82%, rgba(255,255,255,0) 100%)',
      ring: 'radial-gradient(circle at 40% 34%, #2a2a2c, #161617)',
      leaf: 'rgba(255,160,90,0.9)', vein: 'rgba(0,0,0,0.4)',
      ringBorder: '1px solid rgba(255,255,255,0.14)'
    }
  };
  // resolve the skin: design (virtual) overrides; física/crédito keep their look
  const s = (variant === 'fisica' || variant === 'credito') ? variantSkins[variant] : getDesign(design || 'violeta');
  const isTetris = s.art === 'tetris';
  const chromeDark = isTetris || s.dark;
  const chrome = chromeDark ? 'rgba(18,18,18,0.85)' : '#fff';
  const glowRGB = variant === 'fisica' ? '14,61,79' : isTetris ? '20,160,70' : '76,48,124';

  return (
    <div style={{
      width, height: h, borderRadius: r, position: 'relative', overflow: 'hidden',
      background: s.bg, color: chrome, flexShrink: 0,
      border: isTetris ? `${Math.max(4, Math.round(width * 0.022))}px solid #121212` : 'none',
      boxShadow: glow ?
      `0 18px 40px rgba(${glowRGB},0.45), inset 0 1px 0 rgba(255,255,255,0.18)` :
      'inset 0 1px 0 rgba(255,255,255,0.16), 0 6px 16px rgba(0,0,0,0.18)',
      opacity: faded ? 0.4 : 1, filter: faded ? 'grayscale(0.4)' : 'none',
      transition: 'opacity .3s, filter .3s, background .6s ease', ...style
    }}>
      {isTetris ?
      // green LEMN-blocks design (the "Tetrish")
      <svg viewBox="0 0 100 63" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <g fill="#121212">
            <rect x="20" y="10" width="4" height="20" /><rect x="30" y="10" width="4" height="26" />
            <rect x="40" y="22" width="14" height="4" /><rect x="44" y="10" width="4" height="14" />
            <rect x="14" y="40" width="20" height="4" /><rect x="18" y="44" width="4" height="9" />
            <path d="M40 38 L52 50 L46 52 Z" /><rect x="60" y="10" width="4" height="26" />
            <rect x="70" y="22" width="14" height="4" /><rect x="74" y="38" width="4" height="14" />
          </g>
        </svg> :
      isTetris === false &&
      // center isotipo ring
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
          width: logo, height: logo, borderRadius: 999, background: s.ring,
          border: s.ringBorder, display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.3)'
        }}>
            <Leaf size={logo * 0.56} color={s.leaf} vein={s.vein} />
          </div>
        </div>}

      {/* NFC top-right */}
      <div style={{ position: 'absolute', top: pad, right: pad }}>
        <Nfc size={Math.round(width * 0.072)} color={chromeDark ? 'rgba(18,18,18,0.7)' : 'rgba(255,255,255,0.92)'} />
      </div>

      {!isTetris &&
      <>
        {/* coin badges bottom-left (física) / dots (virtual) */}
        <div style={{ position: 'absolute', left: pad, bottom: pad, display: 'flex', gap: width * 0.018, alignItems: 'center' }}>
          {s.coins ?
          <>
              <Coin label="₿" bg="#F7931A" size={Math.round(width * 0.066)} />
              <Coin label="Ξ" bg="#5b6b8c" size={Math.round(width * 0.066)} />
            </> :
          <>
              <span style={{ width: width * 0.04, height: width * 0.04, borderRadius: 999, border: '1.5px solid rgba(255,255,255,0.6)', display: 'inline-block' }} />
              <span style={{ width: width * 0.032, height: width * 0.032, background: 'rgba(255,255,255,0.5)', transform: 'rotate(45deg)', display: 'inline-block' }} />
            </>}
        </div>
        {/* VISA bottom-right */}
        <div style={{
          position: 'absolute', right: pad, bottom: Math.round(pad * 0.7),
          fontFamily: 'Georgia, "Times New Roman", serif', fontStyle: 'italic', fontWeight: 800,
          fontSize: Math.round(width * 0.082), letterSpacing: '0.5px', color: chrome,
          textShadow: chromeDark ? 'none' : '0 1px 2px rgba(0,0,0,0.3)'
        }}>VISA</div>
      </>}

      {/* shimmer sweep (selection screen) */}
      {shimmer &&
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{
          position: 'absolute', top: '-30%', left: 0, width: '45%', height: '160%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)',
          animation: 'lc-shimmer 2.4s ease-in-out infinite'
        }} />
        </div>}
    </div>);

}
const Coin = ({ label, bg, size, style }) =>
<span style={{
  width: size, height: size, borderRadius: 999, background: bg, color: '#fff',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  fontSize: size * 0.6, fontWeight: 700, border: '1px solid rgba(255,255,255,0.25)', ...style
}}>{label}</span>;


// small rounded card thumbnail used in list rows
const CardThumb = ({ variant, design, w = 56, portrait = false }) =>
<div style={{ width: w, borderRadius: portrait ? 8 : 10, overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.14)' }}>
    <CardArt variant={variant} design={design} width={w} portrait={portrait} />
  </div>;


// status pill (solid, like the live app)
const StatusPill = ({ status }) => {
  const m = {
    Activa: ['var(--c-green-40)', '#fff'],
    Pausada: ['var(--c-gray-30)', 'var(--c-gray-80)'],
    'Vence pronto': ['var(--bg-warning-01)', '#854600']
  }[status] || ['var(--c-green-40)', '#fff'];
  return <span style={{ display: 'inline-block', background: m[0], color: m[1], font: '600 12px Inter', padding: '4px 12px', borderRadius: 999, whiteSpace: 'nowrap' }}>{status}</span>;
};

// a card row inside the "Tus tarjetas" module — horizontal thumbnail (match wallet)
const CardListItem = ({ variant, design, title, mask, status = 'Activa', activate, onTap, onActivate }) =>
<div onClick={() => onTap && onTap(variant)} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 18px', cursor: onTap ? 'pointer' : 'default' }}>
    <CardThumb variant={variant} design={design} w={64} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ font: '600 17px Inter', color: LX.text1 }}>{title}</div>
      <div style={{ font: '500 14px Geist', color: LX.text2, margin: '2px 0 8px' }}>{mask}</div>
      {activate ?
        <button onClick={(e) => { e.stopPropagation(); onActivate && onActivate(); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: 0, cursor: 'pointer', background: 'var(--c-lemon-5)', color: 'var(--text-brand)', font: '600 13px Inter', padding: '7px 14px', borderRadius: 999 }}>
          Activá tu tarjeta <LI name="arrow-foward" size={14} color="var(--text-brand)" />
        </button> :
        <StatusPill status={status} />}
    </div>
    {!activate &&
    <button onClick={(e) => { e.stopPropagation(); onTap && onTap(variant); }} style={{ width: 46, height: 46, borderRadius: 999, border: 0, background: LX.layer3, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
      <LI name="view-balance-on" size={18} color={LX.text1} />
    </button>}
    <LI name="arrow-foward" size={18} color={LX.text3} style={{ flexShrink: 0 }} />
  </div>;


// moneda de pago row (Argentine flag) — matches the live screen
const MonedaDePago = () =>
<div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px' }}>
    <span style={{ font: '400 16px Inter', color: LX.text2, flex: 1 }}>Moneda de pago</span>
    <img src="cards/assets/flag-ar.png" alt="ARS" style={{ width: 26, height: 26, borderRadius: 999, objectFit: 'cover', boxShadow: '0 0 0 1px rgba(0,0,0,0.06)' }} />
    <LI name="arrow-foward" size={18} color={LX.text3} />
  </div>;


// ── Buttons ─────────────────────────────────────────────────────
const Btn = ({ children, variant = 'primary', leftIcon, disabled, onClick, style }) => {
  const v = {
    primary: { bg: LX.dark, fg: '#fff' },
    brand: { bg: LX.lime, fg: LX.dark },
    secondary: { bg: 'var(--button-secondary)', fg: LX.text1 },
    light: { bg: LX.layer3, fg: LX.text1 },
    ghost: { bg: 'transparent', fg: LX.text2 },
    danger: { bg: 'var(--button-destructive)', fg: '#fff' }
  }[variant];
  return (
    <button onClick={disabled ? undefined : onClick} disabled={disabled} style={{
      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      border: 0, cursor: disabled ? 'default' : 'pointer', borderRadius: 999,
      padding: '15px 20px', font: '600 16px Inter, system-ui',
      background: disabled ? 'var(--button-disabled)' : v.bg,
      color: disabled ? 'var(--text-disabled)' : v.fg,
      transition: 'transform .08s, opacity .15s', ...style
    }}
    onMouseDown={(e) => {if (!disabled) e.currentTarget.style.transform = 'scale(0.985)';}}
    onMouseUp={(e) => {e.currentTarget.style.transform = 'scale(1)';}}
    onMouseLeave={(e) => {e.currentTarget.style.transform = 'scale(1)';}}>
      {leftIcon && <LI name={leftIcon} size={20} color={disabled ? 'var(--text-disabled)' : v.fg} />}
      {children}
    </button>);

};

// Apple Pay add button (solo Apple Pay — sin Google)
const WalletBtn = ({ label = 'Quiero Apple Pay', onClick }) =>
<button onClick={onClick} style={{
  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
  border: 0, cursor: 'pointer', borderRadius: 12, padding: '14px 18px',
  background: '#000', color: '#fff', font: '600 16px Inter, system-ui'
}}>
    <svg width="18" height="22" viewBox="0 0 18 22" fill="#fff"><path d="M14.6 11.5c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.8-3.5.8s-1.8-.8-3-.8C3.3 6.3 1.9 7.2 1.1 8.7c-1.5 2.6-.4 6.4 1.1 8.5.7 1 1.6 2.2 2.7 2.2 1.1 0 1.5-.7 2.8-.7s1.7.7 2.8.7c1.2 0 1.9-1 2.6-2 .8-1.2 1.2-2.3 1.2-2.4-.1 0-2.3-.9-2.3-3.5ZM12.3 4.5c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.5 1.3-.5.6-1 1.6-.9 2.6 1 .1 2-.5 2.5-1.2Z" /></svg>
    {label}
  </button>;


// ── Surfaces ────────────────────────────────────────────────────
const Surface = ({ children, style, pad = 16 }) =>
<div style={{ background: LX.layer, border: `1px solid ${LX.border}`, borderRadius: 16, padding: pad, ...style }}>{children}</div>;


const Divider = ({ style }) => <div style={{ height: 1, background: LX.hair, ...style }} />;

const Tag = ({ children, tone = 'positive' }) => {
  const m = {
    positive: ['var(--bg-positive-01)', '#0F602C'],
    warning: ['var(--bg-warning-01)', '#854600'],
    neutral: [LX.layer3, LX.text1],
    promo: ['var(--c-lime-10)', 'var(--c-lime-70)']
  }[tone];
  return <span style={{ background: m[0], color: m[1], font: '600 12px Inter', padding: '3px 9px', borderRadius: 999 }}>{children}</span>;
};

// scallop "%" badge from top-right of card screens
const PromoBadge = () =>
<div style={{ width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg width="34" height="34" viewBox="0 0 34 34">
      <path fill={LX.dark} d="M17 2.5l2.6 2 3.2-.7 1.4 3 3 1.4-.7 3.2 2 2.6-2 2.6.7 3.2-3 1.4-1.4 3-3.2-.7-2.6 2-2.6-2-3.2.7-1.4-3-3-1.4.7-3.2-2-2.6 2-2.6-.7-3.2 3-1.4 1.4-3 3.2.7 2.6-2Z" />
      <path d="M13 13l8 8M13.5 14a1 1 0 100-.1M20.5 21a1 1 0 100-.1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  </div>;


// ── Headers ─────────────────────────────────────────────────────
// Large title header (home-style)
const BigHeader = ({ title, onBack, right }) =>
<div style={{ padding: '6px 16px 8px' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 40 }}>
      <button onClick={onBack} style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: 0, marginLeft: -2 }}>
        <LI name="arrow-back" size={24} color={LX.text1} />
      </button>
      {right || <PromoBadge />}
    </div>
    <div style={{ font: '500 30px Geist, system-ui', letterSpacing: '-0.02em', color: LX.text1, marginTop: 6 }}>{title}</div>
  </div>;


// Compact centered header (in-flow)
const StepHeader = ({ title, onBack, onClose }) =>
<div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', height: 52 }}>
    <button onClick={onBack} style={{ border: 0, background: 'transparent', cursor: 'pointer', width: 40, height: 40 }}>
      <LI name="arrow-back" size={22} color={LX.text1} />
    </button>
    <div style={{ flex: 1, textAlign: 'center', font: '600 16px Inter', color: LX.text1 }}>{title}</div>
    <button onClick={onClose} style={{ border: 0, background: 'transparent', cursor: 'pointer', width: 40, height: 40, opacity: onClose ? 1 : 0 }}>
      <LI name="close" size={22} color={LX.text2} />
    </button>
  </div>;


// ── Progress meter ──────────────────────────────────────────────
const Meter = ({ value, color = LX.dark, h = 8 }) =>
<div style={{ height: h, borderRadius: 999, background: LX.layer3, overflow: 'hidden' }}>
    <div style={{ width: `${Math.min(100, Math.round(value * 100))}%`, height: '100%', background: color, borderRadius: 999, transition: 'width .5s ease' }} />
  </div>;


// ── PM suggestion annotation ────────────────────────────────────
const PmNote = ({ children }) =>
<div style={{
  display: 'flex', gap: 9, alignItems: 'flex-start', padding: '10px 12px',
  border: `1px dashed ${LX.nebula}`, borderRadius: 12, background: 'var(--c-nebula-5)'
}}>
    <LI name="bulb" size={16} color={LX.nebula} style={{ marginTop: 1 }} />
    <div style={{ flex: 1, color: 'var(--c-nebula-70)' }}>
      <div style={{ font: '700 11px Inter', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 2 }}>Propuesta</div>
      <div style={{ font: '500 12px Inter', lineHeight: 1.4 }}>{children}</div>
    </div>
  </div>;


// ── Bottom sheet (within phone) ─────────────────────────────────
const Sheet = ({ open, children, onClose }) => {
  const [mounted, setMounted] = useState(open);
  useEffect(() => {if (open) setMounted(true);}, [open]);
  if (!mounted && !open) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 40, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'var(--overlay)', opacity: open ? 1 : 0, transition: 'opacity .3s' }} />
      <div style={{
        position: 'relative', background: LX.page, borderRadius: '28px 28px 0 0',
        padding: '12px 20px calc(20px + env(safe-area-inset-bottom))',
        transform: open ? 'translateY(0)' : 'translateY(100%)', transition: 'transform .35s cubic-bezier(.2,.8,.2,1)',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.2)'
      }} onTransitionEnd={() => {if (!open) setMounted(false);}}>
        <div style={{ width: 40, height: 5, borderRadius: 999, background: LX.text3, margin: '0 auto 14px' }} />
        {children}
      </div>
    </div>);

};

Object.assign(window, {
  LX, LI, Leaf, Nfc, CardArt, Coin, CardThumb, Btn, WalletBtn, Surface, Divider,
  Tag, PromoBadge, BigHeader, StepHeader, Meter, PmNote, Sheet,
  StatusPill, CardListItem, MonedaDePago, CARD_DESIGNS, getDesign
});