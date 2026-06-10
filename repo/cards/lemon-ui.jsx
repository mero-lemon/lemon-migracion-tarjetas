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


// ── Card art (virtual = purple radial · física = boutique teal/lime) ──
function CardArt({ variant = 'virtual', width = 320, portrait = false, faded = false, glow = false, style = {} }) {
  const h = Math.round(width / (portrait ? 0.63 : 1.585));
  const r = Math.max(8, Math.round(width * 0.062));
  const pad = Math.round(width * 0.058);
  const logo = Math.round(width * 0.30);

  const skins = {
    virtual: {
      bg: 'linear-gradient(120deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 24%, rgba(255,255,255,0) 58%, rgba(255,255,255,0.12) 76%, rgba(255,255,255,0) 100%), radial-gradient(150% 130% at 76% 12%, #9460e0 0%, #6a3fb0 28%, #3a1c64 62%, #1c0c36 100%)',
      ring: 'radial-gradient(circle at 38% 32%, #2c1550, #160a2c)',
      leaf: 'rgba(214,196,255,0.95)', vein: 'rgba(40,18,72,0.55)',
      ringBorder: '1px solid rgba(190,160,255,0.35)'
    },
    fisica: {
      bg: 'radial-gradient(130% 120% at 22% 18%, #2ea36f 0%, #11614f 30%, #0c3338 60%, #08171d 100%), linear-gradient(120deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 26%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.08) 80%, rgba(255,255,255,0) 100%)',
      ring: 'radial-gradient(circle at 40% 34%, #d9ff4a, #a8df00)',
      leaf: '#0c241c', vein: 'rgba(12,36,28,0.35)',
      ringBorder: '1px solid rgba(255,255,255,0.18)'
    },
    credito: {
      bg: 'radial-gradient(130% 120% at 70% 15%, #3a3a3c 0%, #1f1f21 45%, #131315 100%), linear-gradient(120deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 24%, rgba(255,255,255,0) 62%, rgba(255,140,60,0.10) 82%, rgba(255,255,255,0) 100%)',
      ring: 'radial-gradient(circle at 40% 34%, #2a2a2c, #161617)',
      leaf: 'rgba(255,160,90,0.9)', vein: 'rgba(0,0,0,0.4)',
      ringBorder: '1px solid rgba(255,255,255,0.14)'
    }
  };
  const s = skins[variant];

  return (
    <div style={{
      width, height: h, borderRadius: r, position: 'relative', overflow: 'hidden',
      background: s.bg, color: '#fff', flexShrink: 0,
      boxShadow: glow ?
      `0 18px 40px rgba(${variant === 'virtual' ? '76,48,124' : '14,61,79'},0.45), inset 0 1px 0 rgba(255,255,255,0.18)` :
      'inset 0 1px 0 rgba(255,255,255,0.16), 0 6px 16px rgba(0,0,0,0.18)',
      opacity: faded ? 0.4 : 1, filter: faded ? 'grayscale(0.4)' : 'none',
      transition: 'opacity .3s, filter .3s', ...style
    }}>
      {/* NFC top-right */}
      <div style={{ position: 'absolute', top: pad, right: pad }}>
        <Nfc size={Math.round(width * 0.072)} />
      </div>
      {/* center logo */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: logo, height: logo, borderRadius: 999, background: s.ring,
          border: s.ringBorder, display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.3)'
        }}>
          <Leaf size={logo * 0.56} color={s.leaf} vein={s.vein} />
        </div>
      </div>
      {/* coin badges bottom-left (física) / dots (virtual) */}
      <div style={{ position: 'absolute', left: pad, bottom: pad, display: 'flex', gap: width * 0.018, alignItems: 'center' }}>
        {variant === 'fisica' ?
        <>
            <Coin label="₿" bg="#F7931A" size={Math.round(width * 0.066)} />
            <Coin label="Ξ" bg="#5b6b8c" size={Math.round(width * 0.066)} />
          </> :

        <>
            <span style={{ width: width * 0.04, height: width * 0.04, borderRadius: 999, border: '1.5px solid rgba(255,255,255,0.6)', display: 'inline-block' }} />
            <span style={{ width: width * 0.032, height: width * 0.032, background: 'rgba(255,255,255,0.5)', transform: 'rotate(45deg)', display: 'inline-block' }} />
          </>
        }
      </div>
      {/* VISA bottom-right */}
      <div style={{
        position: 'absolute', right: pad, bottom: Math.round(pad * 0.7),
        fontFamily: 'Georgia, "Times New Roman", serif', fontStyle: 'italic', fontWeight: 800,
        fontSize: Math.round(width * 0.082), letterSpacing: '0.5px', color: '#fff',
        textShadow: '0 1px 2px rgba(0,0,0,0.3)'
      }}>VISA</div>
    </div>);

}
const Coin = ({ label, bg, size, style }) =>
<span style={{
  width: size, height: size, borderRadius: 999, background: bg, color: '#fff',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  fontSize: size * 0.6, fontWeight: 700, border: '1px solid rgba(255,255,255,0.25)', ...style
}}>{label}</span>;


// small rounded card thumbnail used in list rows
const CardThumb = ({ variant, w = 56, portrait = false }) =>
<div style={{ width: w, borderRadius: portrait ? 8 : 10, overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.14)' }}>
    <CardArt variant={variant} width={w} portrait={portrait} />
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

// a card row inside the "Tus tarjetas" module — vertical thumbnail, more margin
const CardListItem = ({ variant, title, mask, status = 'Activa', activate, onTap, onActivate }) =>
<div onClick={() => onTap && onTap(variant)} style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '18px 18px', cursor: onTap ? 'pointer' : 'default' }}>
    <CardThumb variant={variant} w={52} portrait />
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
    <button style={{ width: 46, height: 46, borderRadius: 999, border: 0, background: LX.layer3, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
      <LI name={status === 'Pausada' ? 'play-arrow' : 'pause'} size={18} color={LX.text1} />
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

// Apple / Google wallet add button
const WalletBtn = ({ brand = 'apple', onClick }) =>
<button onClick={onClick} style={{
  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
  border: 0, cursor: 'pointer', borderRadius: 12, padding: '14px 18px',
  background: '#000', color: '#fff', font: '600 16px Inter, system-ui'
}}>
    {brand === 'apple' ?
  <svg width="18" height="22" viewBox="0 0 18 22" fill="#fff"><path d="M14.6 11.5c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.8-3.5.8s-1.8-.8-3-.8C3.3 6.3 1.9 7.2 1.1 8.7c-1.5 2.6-.4 6.4 1.1 8.5.7 1 1.6 2.2 2.7 2.2 1.1 0 1.5-.7 2.8-.7s1.7.7 2.8.7c1.2 0 1.9-1 2.6-2 .8-1.2 1.2-2.3 1.2-2.4-.1 0-2.3-.9-2.3-3.5ZM12.3 4.5c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.5 1.3-.5.6-1 1.6-.9 2.6 1 .1 2-.5 2.5-1.2Z" /></svg> :
  <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.5 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.9c-.3 1.4-1 2.5-2.2 3.3v2.8h3.6c2.1-1.9 3.2-4.8 3.2-8Z" /><path fill="#34A853" d="M12 23c2.9 0 5.4-1 7.2-2.7l-3.6-2.8c-1 .7-2.3 1.1-3.6 1.1-2.8 0-5.1-1.9-6-4.4H2.3v2.9C4.1 20.7 7.8 23 12 23Z" /><path fill="#FBBC05" d="M6 14.2c-.2-.7-.4-1.4-.4-2.2s.1-1.5.4-2.2V6.9H2.3C1.5 8.4 1 10.1 1 12s.5 3.6 1.3 5.1L6 14.2Z" /><path fill="#EA4335" d="M12 5.4c1.6 0 3 .5 4.1 1.6l3.1-3.1C17.4 2.1 14.9 1 12 1 7.8 1 4.1 3.3 2.3 6.9L6 9.8c.9-2.5 3.2-4.4 6-4.4Z" /></svg>}
    Agregar a {brand === 'apple' ? 'Apple Wallet' : 'Google Wallet'}
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
  StatusPill, CardListItem, MonedaDePago
});