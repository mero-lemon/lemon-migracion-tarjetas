// ════════════════════════════════════════════════════════════════
// Card experience — design picker, create/morph, virtual ready,
// card home (2 actions + Configurar), flip-to-reveal sensitive data.
// Estilo Cash App: poco texto, mucho aire, spring suave, morphs fluidos.
// ════════════════════════════════════════════════════════════════
const { useState: useStateCX, useEffect: useEffectCX, useRef: useRefCX } = React;

const SPRING = 'cubic-bezier(.34,1.56,.64,1)';

// marquee del picker (filas de tarjetas en movimiento constante)
const _pickerCSS = `@keyframes lc-marq{from{transform:translateX(0)}to{transform:translateX(-50%)}}`;
if (typeof document !== 'undefined' && !document.getElementById('lc-picker-style')) {
  const st = document.createElement('style');st.id = 'lc-picker-style';st.textContent = _pickerCSS;document.head.appendChild(st);
}

// fila marquee: las tarjetas duplicadas para loop sin costura; tap para elegir
function MarqueeRow({ items, selId, onPick, dur = 24, reverse = false, w = 96 }) {
  const loop = [...items, ...items];
  return (
    <div style={{ overflow: 'hidden', width: '100%', maskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)', WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)' }}>
      <div style={{ display: 'flex', gap: 12, width: 'max-content', animation: `lc-marq ${dur}s linear infinite${reverse ? ' reverse' : ''}` }}>
        {loop.map((d, i) =>
        <button key={i} onClick={() => onPick(d.id)} style={{
          flexShrink: 0, padding: 3, borderRadius: 14, cursor: 'pointer', background: 'transparent',
          border: d.id === selId ? '2px solid var(--c-lime-40)' : '2px solid transparent',
          transition: 'transform .2s', transform: d.id === selId ? 'scale(1.04)' : 'scale(1)'
        }}>
            <CardArt design={d.id} width={w} glow={d.id === selId} />
          </button>)}
      </div>
    </div>);

}

// ── Design picker ───────────────────────────────────────────────
// El diferencial: carrusel ↔ grilla, prueba social, tap para rotar + brillo.
function DesignPicker({ onBack, onClose, onChoose, headline = 'Elegí el diseño' }) {
  const [idx, setIdx] = useStateCX(0);
  const [grid, setGrid] = useStateCX(false);
  const [tilt, setTilt] = useStateCX(false); // tap → rota y brilla
  const design = CARD_DESIGNS[idx];

  // tap en la tarjeta del carrusel: pequeño giro + shimmer
  const poke = () => { setTilt(true); setTimeout(() => setTilt(false), 900); };
  // elegir un diseño desde las filas en movimiento
  const pick = (id) => { const i = CARD_DESIGNS.findIndex((d) => d.id === id); if (i >= 0) { setIdx(i); setTilt(true); setTimeout(() => setTilt(false), 700); } };

  return (
    <Screen footer={
    <Btn variant="primary" onClick={() => onChoose(design)}>
        Elegir y crear tarjeta
      </Btn>
    }>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', height: 52 }}>
        <button onClick={onBack} style={{ border: 0, background: 'transparent', cursor: 'pointer', width: 40, height: 40 }}>
          <LI name="arrow-back" size={22} color={LX.text1} />
        </button>
        <div style={{ flex: 1, textAlign: 'center', font: '600 16px Inter', color: LX.text1 }}>{headline}</div>
        <span style={{ width: 40, height: 40 }} />
      </div>

      {grid ?
      // ── GRILLA ──
      <div style={{ padding: '8px 16px 8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {CARD_DESIGNS.map((d, i) =>
          <button key={d.id} onClick={() => { setIdx(i); setGrid(false); }} style={{
            border: idx === i ? '2px solid var(--c-lime-40)' : '2px solid transparent',
            borderRadius: 16, padding: 6, background: 'transparent', cursor: 'pointer'
          }}>
                <CardArt design={d.id} width={140} />
                <div style={{ font: '600 13px Inter', color: LX.text1, marginTop: 8 }}>{d.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, font: '400 11px Inter', color: LX.text3, marginTop: 1 }}>
                  <LI name="user" size={11} color={LX.text3} /> {d.users} la eligieron
                </div>
              </button>
          )}
          </div>
        </div> :

      // ── CARRUSEL ──
      <div style={{ padding: '4px 0 8px' }}>
          <div
          onClick={poke}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: 230, perspective: 1000, cursor: 'pointer'
          }}>
            <div style={{
            transform: tilt ? 'rotateY(-18deg) rotateX(6deg) scale(1.03)' : 'rotateY(0) scale(1)',
            transition: `transform .9s ${SPRING}`, transformStyle: 'preserve-3d'
          }}>
              <CardArt design={design.id} width={300} glow shimmer={tilt} />
            </div>
          </div>

          {/* nombre + prueba social */}
          <div style={{ textAlign: 'center', marginTop: 14 }}>
            <div style={{ font: '500 24px Geist', letterSpacing: '-0.02em', color: LX.text1 }}>{design.name}</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, background: LX.layer3, padding: '6px 12px', borderRadius: 999 }}>
              <span style={{ display: 'flex' }}>
                {['#FFB35C', '#7B4EC8', '#2BE76B'].map((c, i) =>
              <span key={i} style={{ width: 18, height: 18, borderRadius: 999, background: c, border: '2px solid var(--bg-layer-01)', marginLeft: i ? -6 : 0 }} />)}
              </span>
              <span style={{ font: '600 12px Inter', color: LX.text2 }}>{design.users} la eligieron</span>
            </div>
            <div style={{ font: '400 12px Inter', color: LX.text3, marginTop: 8 }}>Tocá la tarjeta y disfruta la magia.</div>
          </div>

          {/* dos filas en movimiento constante — elegí tocando cualquiera */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
            <MarqueeRow items={CARD_DESIGNS} selId={design.id} onPick={pick} dur={26} />
            <MarqueeRow items={[...CARD_DESIGNS].slice().reverse()} selId={design.id} onPick={pick} dur={32} reverse />
          </div>
        </div>}

      <div style={{ padding: '6px 16px 0' }}>
        <div style={{ font: '400 12px Inter', color: LX.text3, textAlign: 'center', lineHeight: 1.4 }}>
          Al elegir y crear, aceptás los <span style={{ color: 'var(--text-brand)' }}>Términos y Condiciones</span>.
        </div>
      </div>
    </Screen>);

}

// keyframes futuristas (se inyectan una vez)
const _morphCSS = `
@keyframes lc-halo{to{transform:rotate(360deg)}}
@keyframes lc-spin{to{transform:rotate(360deg)}}
@keyframes lc-ring{0%{transform:translate(-50%,-50%) scale(.45);opacity:.55}100%{transform:translate(-50%,-50%) scale(1.85);opacity:0}}
@keyframes lc-float{0%,100%{transform:translateY(0) rotateZ(-1.5deg)}50%{transform:translateY(-12px) rotateZ(1.5deg)}}
@keyframes lc-tilt{0%,100%{transform:translateY(0) rotateX(7deg) rotateY(-11deg)}50%{transform:translateY(-12px) rotateX(-5deg) rotateY(11deg)}}
@keyframes lc-scan{0%{transform:translateY(-140%)}100%{transform:translateY(240%)}}
@keyframes lc-spark{0%,100%{opacity:.2;transform:scale(.7)}50%{opacity:1;transform:scale(1)}}
@keyframes lc-converge{0%{transform:translate(var(--tx),var(--ty)) scale(.3);opacity:0}28%{opacity:1}100%{transform:translate(0,0) scale(.1);opacity:0}}
@keyframes lc-sweep{0%{transform:translateX(-180%) skewX(-14deg);opacity:0}16%{opacity:.95}52%{opacity:.95}100%{transform:translateX(220%) skewX(-14deg);opacity:0}}
@keyframes lc-flash{0%{transform:translate(-50%,-50%) scale(.25);opacity:0}38%{opacity:1}100%{transform:translate(-50%,-50%) scale(2.5);opacity:0}}
@keyframes lc-pulse{0%,100%{opacity:.4}50%{opacity:.8}}
@keyframes lc-pop{0%{transform:translateX(-50%) scale(0);opacity:0}60%{transform:translateX(-50%) scale(1.15);opacity:1}100%{transform:translateX(-50%) scale(1);opacity:1}}`;
if (typeof document !== 'undefined' && !document.getElementById('lc-morph-style')) {
  const st = document.createElement('style');st.id = 'lc-morph-style';st.textContent = _morphCSS;document.head.appendChild(st);
}

// ── Create / morph ──────────────────────────────────────────────
// Creación 100% visual, estilo Apple Pay sobre fondo claro: la tarjeta flota,
// baja y se "guarda" detrás del frente de una wallet, con un barrido de luz y
// un check + destello lime al completarse.
function MorphCreate({ fromDesign = 'violeta', toDesign, replace = false, onDone }) {
  const [phase, setPhase] = useStateCX(0); // 0 from · 1 morph · 2 bloom final
  useEffectCX(() => {
    const t1 = setTimeout(() => setPhase(1), 700);   // empieza a guardarse
    const t2 = setTimeout(() => setPhase(2), 1950);  // ya guardada: check + destello
    const done = setTimeout(onDone, 2900);
    return () => { clearTimeout(t1);clearTimeout(t2);clearTimeout(done); };
  }, []);

  const CARD_W = 268;

  // Estilo Apple Pay: la tarjeta flota y se "guarda" en la wallet con un destello.
  return (
    <Screen scroll={false} bg="#FFFFFF">
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ position: 'relative', width: 320, height: 440, perspective: 1100 }}>

          {/* glow lime detrás del bolsillo */}
          <div style={{ position: 'absolute', left: '50%', bottom: 70, transform: 'translateX(-50%)', width: 250, height: 150, borderRadius: 999, filter: 'blur(48px)',
            background: 'radial-gradient(circle, rgba(207,255,46,0.55), transparent 70%)',
            opacity: phase >= 2 ? 1 : 0.35, transition: 'opacity .6s ease' }} />

          {/* tarjeta: flota arriba y baja a la wallet (z1, detrás del frente del bolsillo) */}
          <div style={{ position: 'absolute', left: '50%', top: 64, zIndex: 1, marginLeft: -CARD_W / 2,
            transform:
            phase === 0 ? 'translateY(0) scale(1) rotateX(0deg)' :
            phase === 1 ? 'translateY(126px) scale(0.86) rotateX(15deg)' :
            'translateY(118px) scale(0.86) rotateX(13deg)',
            transition: `transform 1.1s ${SPRING}`,
            filter: phase >= 1 ? 'drop-shadow(0 16px 22px rgba(0,0,0,0.30))' : 'drop-shadow(0 12px 26px rgba(0,0,0,0.16))',
            animation: phase === 0 ? 'lc-float 3.4s ease-in-out infinite' : 'none' }}>
            <div style={{ position: 'relative' }}>
              <CardArt design={toDesign} variant={replace ? undefined : undefined} width={CARD_W} glow shimmer={phase >= 1} />
              {/* barrido especular al guardarse */}
              <div style={{ position: 'absolute', inset: 0, borderRadius: 17, overflow: 'hidden', pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', top: '-25%', bottom: '-25%', width: '42%', left: 0,
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.65), transparent)',
                  animation: phase >= 1 ? 'lc-sweep 2.2s ease-in-out .1s 2' : 'none' }} />
              </div>
            </div>
          </div>

          {/* frente de la wallet (z2): la tarjeta se mete por detrás */}
          <div style={{ position: 'absolute', left: '50%', bottom: 60, marginLeft: -150, width: 300, height: 132, zIndex: 2,
            borderRadius: 24, background: 'linear-gradient(180deg, #26262d 0%, #141418 100%)',
            boxShadow: '0 18px 30px rgba(0,0,0,0.22), inset 0 2px 0 rgba(255,255,255,0.14)',
            transform: phase >= 2 ? 'translateY(-4px)' : 'none', transition: `transform .5s ${SPRING}` }}>
            {/* ranura superior */}
            <div style={{ position: 'absolute', top: 12, left: 24, right: 24, height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.10)' }} />
            {/* check al completarse */}
            {phase >= 2 &&
            <div style={{ position: 'absolute', left: '50%', top: -22, width: 44, height: 44, borderRadius: 999,
              background: 'var(--c-lime-40)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 6px 16px rgba(207,255,46,0.5)', animation: `lc-pop .5s ${SPRING} forwards` }}>
              <LI name="feedback-positive" size={24} color={LX.dark} />
            </div>}
          </div>

          {/* destello al guardarse */}
          {phase >= 2 &&
          <div key="flash" style={{ position: 'absolute', left: '50%', top: 210, marginLeft: -110, width: 220, height: 220, borderRadius: 999, pointerEvents: 'none', zIndex: 3,
            background: 'radial-gradient(circle, rgba(255,255,255,0.9), rgba(207,255,46,0.5) 40%, transparent 72%)',
            animation: 'lc-flash 0.8s ease-out forwards' }} />}
        </div>
      </div>
    </Screen>);

}

// ── Virtual lista (success) ─────────────────────────────────────
// Cash App style: la tarjeta sube y aparece la info; primero NFC.
function VirtualReady({ design = 'violeta', mask = '•••• 2291', onWallet, onSeeCard, onMenu }) {
  const [up, setUp] = useStateCX(false);
  useEffectCX(() => { const t = setTimeout(() => setUp(true), 80);return () => clearTimeout(t); }, []);
  return (
    <Screen footer={
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, opacity: up ? 1 : 0, transition: 'opacity .5s .4s' }}>
        <WalletBtn brand="apple" onClick={onWallet} />
        <Btn variant="light" onClick={onSeeCard}>Ir a tu tarjeta creada</Btn>
      </div>
    }>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 28px', gap: 26 }}>
        <div style={{
          transform: up ? 'translateY(0) scale(1)' : 'translateY(80px) scale(0.9)',
          opacity: up ? 1 : 0, transition: `transform .8s ${SPRING}, opacity .5s`
        }}>
          <CardArt design={design} width={300} glow />
        </div>
        <div style={{ textAlign: 'center', opacity: up ? 1 : 0, transform: up ? 'translateY(0)' : 'translateY(16px)', transition: 'opacity .5s .25s, transform .6s .25s' }}>
          <div style={{ font: '500 24px Geist', letterSpacing: '-0.02em', color: LX.text1 }}>Tu tarjeta virtual ya está lista</div>
          <div style={{ font: '400 15px Inter', color: LX.text2, marginTop: 8, lineHeight: 1.5, maxWidth: 290 }}>
            Sumala a Apple Pay y salí solo con el celu — la billetera, dejala en casa.
          </div>
          <div style={{ font: '500 13px Geist', color: LX.text3, marginTop: 10 }}>{mask}</div>
        </div>
      </div>
    </Screen>);

}

// ── Card chooser (onboarding sin tarjetas) ──────────────────────
// Minimal y futurista: 3 tarjetas con SOLO el título; tap → se dan vuelta
// (flip 3D) y muestran los beneficios + CTA de cada una.
function CardChooser({ onVirtual, onFisica, onCredito, onBack }) {
  const [mounted, setMounted] = useStateCX(false);
  const [flipped, setFlipped] = useStateCX(null);
  useEffectCX(() => { const t = setTimeout(() => setMounted(true), 60);return () => clearTimeout(t); }, []);

  const W = 290, H = Math.round(290 / 1.585);
  const opts = [
  { id: 'virtual', design: 'violeta', title: 'Tarjeta virtual', tagline: 'Al instante, en tu celu', badge: 'NFC', onPick: onVirtual, cta: 'Crear',
    glow: 'rgba(150,96,224,0.60)', back: 'linear-gradient(155deg, #2c2552 0%, #16122a 100%)',
    benefits: ['Pagás con el celu · Apple Pay', 'La tenés al instante', 'Cashback en cripto'] },
  { id: 'fisica', variant: 'fisica', title: 'Lemon Card', tagline: 'Edición boutique, a tu casa', onPick: onFisica, cta: 'Pedir',
    glow: 'rgba(43,231,107,0.50)', back: 'linear-gradient(155deg, #1d3c23 0%, #0f1e15 100%)',
    benefits: ['Cashback en cripto', 'Internacional sin impuesto'] },
  { id: 'credito', variant: 'credito', title: 'Tarjeta de crédito', tagline: 'Respaldada con Bitcoin', soon: true, cta: 'Pronto',
    glow: 'rgba(255,150,80,0.42)', back: 'linear-gradient(155deg, #28282e 0%, #141417 100%)',
    benefits: ['Respaldada con Bitcoin', 'Sin historial crediticio'] }];


  return (
    <Screen bg="#FFFFFF">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', height: 52 }}>
        <button onClick={onBack} style={{ border: 0, background: 'transparent', cursor: 'pointer', width: 40, height: 40 }}>
          <LI name="arrow-back" size={22} color="#141414" />
        </button>
        <div style={{ flex: 1 }} />
      </div>

      <div style={{ padding: '4px 20px 32px' }}>
        <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(14px)', transition: 'opacity .5s, transform .6s' }}>
          <div style={{ font: '500 32px Geist', letterSpacing: '-0.025em', color: '#141414', lineHeight: 1.08 }}>Elegí tu tarjeta</div>
          <div style={{ font: '400 14px Inter', color: '#818181', marginTop: 10 }}>Tocá una tarjeta para ver sus beneficios</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, marginTop: 28 }}>
          {opts.map((o, i) => {
            const isFlip = flipped === o.id;
            return (
              <div key={o.id} style={{
                width: W,
                opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(28px)',
                transition: `opacity .5s ${0.1 + i * 0.09}s, transform .7s ${SPRING} ${0.1 + i * 0.09}s`
              }}>
              <div onClick={() => setFlipped(isFlip ? null : o.id)} style={{ width: W, height: H, perspective: 1200, cursor: 'pointer' }}>
                <div style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', transition: `transform .7s ${SPRING}`, transform: isFlip ? 'rotateY(180deg)' : 'rotateY(0)' }}>
                  {/* FRONT: tarjeta limpia, sin texto encima */}
                  <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', borderRadius: 18, filter: `drop-shadow(0 16px 30px ${o.glow}) drop-shadow(0 0 12px ${o.glow})` }}>
                    <CardArt design={o.design} variant={o.variant} width={W} glow />
                    {/* borde fino que recorta la tarjeta del fondo */}
                    <div style={{ position: 'absolute', inset: 0, borderRadius: 18, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.16), inset 0 1px 0 rgba(255,255,255,0.22)', pointerEvents: 'none' }} />
                    {(o.badge || o.soon) &&
                    <span style={{ position: 'absolute', top: 13, left: 14, display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(10,10,15,0.42)', color: o.soon ? 'rgba(255,255,255,0.92)' : 'var(--c-lime-30)', font: '700 9.5px Inter', padding: '5px 10px', borderRadius: 999, letterSpacing: '0.08em', border: '1px solid rgba(255,255,255,0.16)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
                      {o.soon ? 'PRÓXIMAMENTE' : <><Nfc size={11} color="var(--c-lime-30)" /> CON NFC</>}
                    </span>}
                  </div>
                  {/* BACK: beneficios + CTA, temático por tarjeta */}
                  <div style={{ position: 'absolute', inset: 0, transform: 'rotateY(180deg)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
                    borderRadius: 18, background: o.back, border: '1px solid rgba(255,255,255,0.12)', boxShadow: `0 18px 38px ${o.glow}`,
                    padding: '16px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }}>
                    <div>
                      <div style={{ font: '700 10px Inter', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 11 }}>{o.title}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                        {o.benefits.map((b, j) =>
                        <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                            <span style={{ width: 18, height: 18, borderRadius: 999, background: 'rgba(207,255,46,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <LI name="feedback-positive" size={13} color="var(--c-lime-40)" />
                            </span>
                            <span style={{ font: '400 12.5px Inter', color: 'rgba(255,255,255,0.9)' }}>{b}</span>
                          </div>)}
                      </div>
                    </div>
                    {o.soon ?
                    <span style={{ alignSelf: 'flex-start', font: '600 12px Inter', color: 'rgba(255,255,255,0.45)' }}>Disponible pronto</span> :
                    <button onClick={(e) => { e.stopPropagation();o.onPick(); }} style={{ alignSelf: 'stretch', border: 0, cursor: 'pointer', borderRadius: 14, padding: '12px 20px', background: 'var(--c-lime-40)', color: LX.dark, font: '600 14px Inter' }}>{o.cta}</button>}
                  </div>
                </div>
              </div>

              {/* info debajo de la tarjeta (no se pisa con el arte) */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 13, padding: '0 2px' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ font: '600 17px Geist', letterSpacing: '-0.01em', color: '#141414' }}>{o.title}</div>
                  <div style={{ font: '400 13px Inter', color: '#818181', marginTop: 2 }}>{o.tagline}</div>
                </div>
                <span style={{ width: 30, height: 30, borderRadius: 999, background: 'rgba(8,8,8,0.06)', border: '1px solid rgba(8,8,8,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: `transform .4s ${SPRING}`, transform: isFlip ? 'rotate(180deg)' : 'none' }}>
                  <LI name={isFlip ? 'arrow-back' : 'arrow-foward'} size={15} color="#818181" />
                </span>
              </div>
              </div>);

          })}
        </div>
      </div>
    </Screen>);

}

// ── Biometric gate (Face ID) ────────────────────────────────────
function FaceIdGate({ open, onDone, onCancel }) {
  useEffectCX(() => { if (open) { const t = setTimeout(onDone, 1100);return () => clearTimeout(t); } }, [open]);
  if (!open) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 60, background: 'var(--overlay)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ width: 78, height: 78, borderRadius: 20, background: LX.layer, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-pop)' }}>
        <LI name="face-ID" size={42} color="var(--c-lemon-50)" />
      </div>
      <div style={{ font: '600 15px Inter', color: '#fff' }}>Verificá tu identidad</div>
      <button onClick={onCancel} style={{ border: 0, background: 'transparent', color: 'rgba(255,255,255,0.7)', font: '600 14px Inter', cursor: 'pointer' }}>Cancelar</button>
    </div>);

}

// ── Card detail / home ──────────────────────────────────────────
// Horizontal, 2 acciones + Configurar; "Agregar a Wallet" que desaparece
// al sumarla; estado vacío (sin fondos / con fondos); tap → flip → datos.
// Sirve para virtual / física / crédito. `expiring`+`onRenew`: vencimiento.
function CardHome({ design = 'violeta', variant = 'virtual', title, mask = '•••• 2291',
  balance = 0, startInWallet = false, expiring = false, peek = true,
  onRenew, onPay, onBack, onClose }) {
  const kind = variant === 'fisica' ? 'fisica' : variant === 'credito' ? 'credito' : 'virtual';
  const isVirtual = kind === 'virtual';
  const heading = title || { virtual: 'Tarjeta prepaga virtual', fisica: 'Lemon Card física', credito: 'Tarjeta crédito física' }[kind];
  const [inWallet, setInWallet] = useStateCX(startInWallet);
  const [walletAdding, setWalletAdding] = useStateCX(false);
  const [config, setConfig] = useStateCX(false);
  const [paused, setPaused] = useStateCX(false);
  const [bio, setBio] = useStateCX(false);
  const [revealed, setRevealed] = useStateCX(false);

  const askData = () => setBio(true);
  const onBio = () => { setBio(false);setRevealed(true); };
  const togglePause = () => setPaused((p) => !p);
  const addToWallet = () => { setWalletAdding(true);setTimeout(() => { setWalletAdding(false);setInWallet(true); }, 1500); };

  const actions = kind === 'credito' ?
  [{ icon: 'currency-dollar', label: 'Pagar', onClick: onPay },
   { icon: 'view-balance-on', label: 'Ver datos', onClick: askData },
   { icon: 'summary', label: 'Resúmenes', onClick: null },
   { icon: 'settings', label: 'Configurar', onClick: () => setConfig(true) }] :
  [{ icon: paused ? 'play-arrow' : 'pause', label: paused ? 'Reanudar' : 'Pausar', onClick: togglePause },
   { icon: 'view-balance-on', label: 'Ver datos', onClick: askData },
   { icon: 'settings', label: 'Configurar', onClick: () => setConfig(true) }];

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      <Screen>
        <StepHeader title={heading} onBack={onBack} onClose={onClose} />
        <div style={{ padding: '6px 16px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* tarjeta horizontal con peek del carrusel + flip a datos */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200, perspective: 1200 }}>
            {peek &&
            <div style={{ position: 'absolute', right: -2, top: '50%', transform: 'translateY(-50%) scale(0.86)', opacity: 0.4, filter: 'blur(0.4px)' }}>
              <CardArt design={isVirtual ? 'sticker' : design} variant={isVirtual ? undefined : variant} width={150} />
            </div>}
            <FlipCard design={design} variant={isVirtual ? undefined : variant} revealed={revealed} mask={mask}
              onTapFront={askData} onHide={() => setRevealed(false)} />
          </div>

          {/* acciones: 2-3 importantes + Configurar */}
          <div style={{ display: 'flex', justifyContent: actions.length > 3 ? 'space-between' : 'center', gap: actions.length > 3 ? 4 : 26, padding: actions.length > 3 ? '0 6px' : 0 }}>
            {actions.map((a) => <Action key={a.label} icon={a.icon} label={a.label} onClick={a.onClick} dark={!isVirtual} />)}
          </div>

          {/* Banner de vencimiento (física que vence) — único acceso a renovar */}
          {expiring && <RenovarBanner onRenew={onRenew} />}

          {/* Agregar a Wallet — destacado, solo virtual, desaparece al sumarla */}
          {isVirtual && !inWallet &&
          <WalletBtn brand="apple" onClick={addToWallet} />}
          {isVirtual && inWallet &&
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'var(--bg-positive-01)', borderRadius: 12, padding: '12px 14px' }}>
            <LI name="feedback-positive" size={18} color="var(--c-lemon-50)" />
            <span style={{ font: '600 13px Inter', color: '#0F602C' }}>Ya está en Apple Pay. Pagá apoyando el celu.</span>
          </div>}

          {/* estado vacío segun fondos */}
          {balance <= 0 && isVirtual ?
          <EmptyState title="¿Qué estás esperando?"
            sub="Depositá plata para empezar a usar tu tarjeta." cta="Depositar" /> :

          <Surface pad={0} style={{ overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 16px 4px' }}>
                <span style={{ font: '500 16px Geist', color: '#141414', letterSpacing: '-0.01em' }}>Movimientos</span>
                <LI name="arrow-foward" size={16} color="#141414" />
              </div>
              <div style={{ padding: '0 16px 8px' }}>
                <MoveRow icon="card-on" coin="btc" title="Pago con tarjeta" date="15 de diciembre" amount="$ 150" />
                <MoveRow icon="deposit" title="Transferencia bancaria" date="15 de diciembre" amount="$ 300,45" sign="+" />
                <MoveRow icon="send-money" title="Envío por Lemontag" date="15 de diciembre" amount="$ 300,45" />
              </div>
            </Surface>}
        </div>
      </Screen>

      {/* Configurar — el resto de las opciones, fuera del home */}
      <Sheet open={config} onClose={() => setConfig(false)}>
        <div style={{ font: '500 20px Geist', letterSpacing: '-0.02em', color: LX.text1, textAlign: 'center', marginBottom: 12 }}>Configurar</div>
        {[
        ['view-balance-on', 'Ver datos sensibles', askData],
        ['limits', 'Cambiar límite', null],
        ['positive-location', 'Aviso de viaje', null],
        ['click-to-pay', 'Click to Pay', null],
        [paused ? 'play-arrow' : 'pause', paused ? 'Reanudar tarjeta' : 'Pausar tarjeta', togglePause],
        ['delete', 'Eliminar tarjeta', null, true]].
        map(([icon, label, onClick, danger], i) =>
        <button key={i} onClick={() => { setConfig(false);onClick && onClick(); }} style={{
          display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left',
          background: 'transparent', border: 0, borderTop: i ? `1px solid ${LX.hair}` : 'none',
          padding: '15px 4px', cursor: 'pointer'
        }}>
            <LI name={icon} size={22} color={danger ? 'var(--text-negative)' : LX.text1} />
            <span style={{ flex: 1, font: '500 16px Inter', color: danger ? 'var(--text-negative)' : LX.text1 }}>{label}</span>
            <LI name="arrow-foward" size={16} color={LX.text3} />
          </button>)}
      </Sheet>

      <WalletAddOverlay open={walletAdding} design={design} variant={isVirtual ? undefined : variant} />
      <FaceIdGate open={bio} onDone={onBio} onCancel={() => setBio(false)} />
    </div>);

}

// Add-to-wallet: la tarjeta sube y se "guarda" con un check (animación, no spinner).
function WalletAddOverlay({ open, design, variant }) {
  const [lift, setLift] = useStateCX(false);
  useEffectCX(() => { if (open) { setLift(false);const t = setTimeout(() => setLift(true), 80);return () => clearTimeout(t); } }, [open]);
  if (!open) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 60, background: 'var(--overlay)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22 }}>
      <div style={{ position: 'relative', width: 220, height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ transform: lift ? 'translateY(-14px) scale(0.96)' : 'translateY(30px) scale(1)', opacity: lift ? 1 : 0, transition: `transform .7s ${SPRING}, opacity .4s` }}>
          <CardArt design={design} variant={variant} width={200} glow shimmer />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, color: '#fff' }}>
        <span className="lc-spin" style={{ width: 18, height: 18, borderRadius: 999, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
        <span style={{ font: '600 15px Inter' }}>Agregando a Apple Pay…</span>
      </div>
    </div>);

}

const Action = ({ icon, label, onClick, dark }) =>
<button onClick={onClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, background: 'transparent', border: 0, cursor: onClick ? 'pointer' : 'default', opacity: onClick ? 1 : 0.5 }}>
    <div style={{ width: 48, height: 48, borderRadius: 999, background: dark ? '#141414' : LX.layer3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <LI name={icon} size={22} color={dark ? '#fff' : LX.text1} />
    </div>
    <span style={{ font: '500 12px Inter', letterSpacing: '-0.1px', color: '#141414' }}>{label}</span>
  </button>;

// Sticker lime con flecha para abajo (recreación del PNG, estilo "deposit").
const DepositSticker = () =>
<svg width="116" height="96" viewBox="0 0 116 96" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
    <defs>
      <radialGradient id="lc-dep-lime" cx="40%" cy="32%" r="78%">
        <stop offset="0%" stopColor="#E9FF85" />
        <stop offset="58%" stopColor="#B6F33A" />
        <stop offset="100%" stopColor="#8AD81E" />
      </radialGradient>
    </defs>
    <g transform="rotate(-8 58 48)">
      <rect x="20" y="8" width="76" height="80" rx="34" fill="#fff" />
      <rect x="24" y="12" width="68" height="72" rx="30" fill="url(#lc-dep-lime)" />
      <rect x="25.5" y="13.5" width="65" height="69" rx="28.5" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2.5" />
      <path d="M58 29 V61" stroke="#fff" strokeWidth="9" strokeLinecap="round" />
      <path d="M43 50 L58 66 L73 50" stroke="#fff" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <path d="M101 16 l2.6 6.4 6.4 2.6 -6.4 2.6 -2.6 6.4 -2.6 -6.4 -6.4 -2.6 6.4 -2.6 z" fill="#fff" />
    <path d="M16 60 l1.8 4.6 4.6 1.8 -4.6 1.8 -1.8 4.6 -1.8 -4.6 -4.6 -1.8 4.6 -1.8 z" fill="#B6F33A" />
  </svg>;

const EmptyState = ({ title, sub, cta, onCta }) =>
<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '24px 16px', gap: 24 }}>
    <DepositSticker />
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ font: '500 16px Geist', letterSpacing: '-0.1px', color: '#141414' }}>{title}</div>
      <div style={{ font: '400 14px Inter', letterSpacing: '-0.1px', color: '#818181', lineHeight: 1.57, maxWidth: 296 }}>{sub}</div>
    </div>
    <button onClick={onCta} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 32, padding: '0 16px', background: '#141414', border: 0, borderRadius: 100, cursor: 'pointer', font: '600 12px Inter', letterSpacing: '-0.1px', color: '#fff' }}>{cta}</button>
  </div>;

// FlipCard — tap/Ver datos → (biometría afuera) → revela datos.
// CONSTRAINT POMELO: los datos sensibles llegan por webview/iFrame (token).
// Un iframe cross-origin NO se puede rotar en 3D de forma confiable, así que
// NO giramos el iframe: hacemos el flip del SHELL y, ya asentado, montamos
// el panel de datos (acá simulado). En prod, montar el iframe Pomelo recién
// cuando revealed===true (sin transform 3D vivo encima). [FLAG: validar]
function FlipCard({ design, variant, revealed, mask, onTapFront, onHide }) {
  return (
    <div style={{ position: 'relative', width: 300, transformStyle: 'preserve-3d', transition: `transform .6s ${SPRING}`, transform: revealed ? 'rotateY(180deg)' : 'rotateY(0)' }}>
      {/* front */}
      <div style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
        <div onClick={onTapFront} style={{ cursor: onTapFront ? 'pointer' : 'default' }}>
          <CardArt design={design} variant={variant} width={300} glow />
        </div>
      </div>
      {/* back: panel de datos asentado (placeholder del iframe Pomelo) */}
      <div style={{ position: 'absolute', inset: 0, transform: 'rotateY(180deg)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
        <div style={{ width: 300, height: Math.round(300 / 1.585), borderRadius: 19, background: 'radial-gradient(120% 120% at 80% 10%, #2a2a2c, #131315)', color: '#fff', padding: 18, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 6px 16px rgba(0,0,0,0.18)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, font: '500 10px Inter', color: 'rgba(255,255,255,0.6)' }}>
              <LI name="shield-alt" size={12} color="rgba(255,255,255,0.6)" /> Datos protegidos · Pomelo
            </span>
            <button onClick={onHide} style={{ border: 0, background: 'rgba(255,255,255,0.12)', borderRadius: 999, width: 26, height: 26, cursor: 'pointer', color: '#fff' }}>✕</button>
          </div>
          <div>
            <div style={{ font: '500 11px Inter', color: 'rgba(255,255,255,0.5)' }}>Número</div>
            <div style={{ font: '500 19px Geist', letterSpacing: '0.06em' }}>4539 8842 1190 {mask.replace(/\D/g, '') || '2291'}</div>
          </div>
          <div style={{ display: 'flex', gap: 28 }}>
            <div><div style={{ font: '500 11px Inter', color: 'rgba(255,255,255,0.5)' }}>Vence</div><div style={{ font: '500 15px Geist' }}>08/29</div></div>
            <div><div style={{ font: '500 11px Inter', color: 'rgba(255,255,255,0.5)' }}>CVV</div><div style={{ font: '500 15px Geist' }}>•••</div></div>
            <button style={{ marginLeft: 'auto', alignSelf: 'center', border: 0, background: 'rgba(255,255,255,0.14)', color: '#fff', font: '600 12px Inter', padding: '7px 12px', borderRadius: 999, cursor: 'pointer' }}>Copiar</button>
          </div>
        </div>
      </div>
    </div>);

}

Object.assign(window, { DesignPicker, MorphCreate, VirtualReady, CardHome, CardChooser, FlipCard, FaceIdGate, WalletAddOverlay, Action, EmptyState, SPRING });
