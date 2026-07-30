// Onboarding "sin tarjetas": home vacía + pager horizontal de 3 pantallas
// (virtual / física / crédito). El affordance del scroll horizontal se
// resuelve con tres señales redundantes: la pantalla siguiente asoma en el
// borde (peek), page dots tipo píldora, y un nudge automático al entrar que
// "enseña" el gesto sin tutorial.
const { useState: useStateO, useRef: useRefO, useEffect: useEffectO } = React;

const OB_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const OB_SLIDE_W = 330, OB_GAP = 12, OB_STEP = OB_SLIDE_W + OB_GAP, OB_PAD = 36;

// ── Contenido de los 3 slides ───────────────────────────────────
const OB_SLIDES = [
{
  id: 'virtual',
  name: 'Tarjeta virtual',
  cta: 'Crear tarjeta virtual',
  heroImg: 'assets/virtual.png',
  tint: 'radial-gradient(120% 80% at 50% 0%, rgba(140,190,235,0.22), rgba(246,246,244,0) 62%), #F6F6F4',
  chip: 'GRATIS · LISTA EN SEGUNDOS',
  title: 'Pagá con el celu, desde hoy',
  body: 'Creá tu tarjeta virtual, elegí el diseño y sumala a Apple Pay. Pagás apoyando el celu: el bondi, el súper, las birras.',
  items: [
  { icon: 'currency-bitcoin', t: 'Con cashback en Bitcoin', s: 'Un poco de cada compra vuelve a tu wallet.' },
  { icon: 'tax', t: 'Sin el impuesto al 30%', s: 'Comprá en dólares sin el recargo.' }],

  frame: {
    slot: 'ob-frame-virtual', slotSrc: 'assets/otra_opcion.png', slotHint: 'Imagen: pagando con el celu',
    title: 'Tocás, pagás, listo',
    body: 'Con NFC pagás desde el celu en cualquier posnet del mundo, sin sacar la tarjeta.',
    benefits: [
    { icon: 'wifi-off', t: 'Funciona sin internet ni datos' },
    { icon: 'shield-alt', t: 'Tus datos viajan protegidos' },
    { icon: 'click-to-pay', t: 'Transacciones al instante' },
    { icon: 'bus', t: 'Promos en transporte y comercios' }]

  }
},
{
  id: 'fisica',
  name: 'Tarjeta física',
  cta: 'Pedir tarjeta física',
  heroImg: 'assets/prepaga.png',
  tint: 'radial-gradient(120% 80% at 50% 0%, rgba(0,163,71,0.14), rgba(246,246,244,0) 62%), #F6F6F4',
  chip: 'TE LLEGA A CASA · CONTACTLESS',
  title: 'Tu Lemon, en la mano',
  body: 'La física va donde el celu no llega: metal-look, contactless y cashback en cripto en cada compra.',
  items: [
  { icon: 'currency-bitcoin', t: 'Con cashback en Bitcoin', s: 'Un poco de cada compra vuelve a tu wallet.' },
  { icon: 'tax', t: 'Sin el impuesto al 30%', s: 'Comprá en dólares sin el recargo.' },
  { icon: 'celphone', t: 'También va en Apple Pay', s: 'Sumala al celu y usá la que tengas a mano.' }],

  frame: {
    slot: 'ob-frame-fisica', slotSrc: 'assets/nfc-hero-phone-pos.webp', slotHint: 'Imagen: la física en el mundo real',
    title: 'Para el mundo real',
    body: 'Cuando se corta la batería o los datos, la física sigue funcionando igual.',
    benefits: [
    { icon: 'card-on', t: 'Funciona sin celu y sin batería' },
    { icon: 'click-to-pay', t: 'Contactless: apoyás y listo' },
    { icon: 'world', t: 'La usás en cualquier país' },
    { icon: 'bus', t: 'Promos en subtes y bondis' }]

  }
},
{
  id: 'credito',
  name: 'Tarjeta de crédito',
  cta: 'Pedir tarjeta de crédito',
  heroImg: 'assets/credito.png',
  tint: 'radial-gradient(120% 80% at 50% 0%, rgba(255,150,60,0.16), rgba(246,246,244,0) 62%), #F6F6F4',
  chip: 'NUEVA · LÍMITE CLARO, EN EL ACTO',
  title: 'Crédito sin letra chica',
  body: 'Comprá ahora y pagá a fin de mes o en cuotas. Límite claro, resumen simple y beneficios que suman.',
  items: [
  { icon: 'currency-bitcoin', t: 'Con cashback en Bitcoin', s: 'Un poco de cada compra vuelve a tu wallet.' },
  { icon: 'limits', t: 'Mejor tasa y límite', s: 'Crece con el uso que le des.' }],

  frame: {
    slot: 'ob-frame-credito', slotSrc: 'assets/rewards-chests.png', slotHint: 'Imagen: beneficios y rewards',
    title: 'Beneficios que suman',
    body: 'Cashback extra, cuotas sin sorpresas y promos exclusivas para vos.',
    benefits: [
    { icon: 'rewards', t: 'Extra cashback en tus compras' },
    { icon: 'programed-tx', t: 'Cuotas sin sorpresas' },
    { icon: 'view-gift', t: 'Beneficios exclusivos' },
    { icon: 'percent', t: 'Promos en comercios' }],

    pill: 'Conocer mi límite'
  }
}];


// ── Heros: arte por slide con la CardArt real del DS ────────────
// (la misma tarjeta que el usuario después elige en el design picker)
const ObHeroPill = ({ style, dark, children }) =>
<span style={{
  position: 'absolute', display: 'inline-flex', alignItems: 'center', gap: 6,
  background: dark ? '#0b0b0f' : '#fff', color: dark ? '#fff' : '#141414',
  font: '600 11px Inter', padding: '7px 12px', borderRadius: 999,
  boxShadow: '0 10px 22px rgba(8,8,9,0.18)', whiteSpace: 'nowrap', zIndex: 2, ...style
}}>{children}</span>;

const ObHero = ({ kind }) => {
  const scenes = {
    virtual: {
      aura: 'radial-gradient(95% 75% at 50% 34%, rgba(123,78,200,0.22), rgba(123,78,200,0.05) 55%, transparent 78%)',
      ring: 'rgba(123,78,200,0.35)',
      card: <CardArt design="violeta" width={225} glow />, rot: -7,
      pills: [
      { style: { right: 22, top: 64, animation: 'lc-float 5s 0.6s ease-in-out infinite' }, dark: true, label: <> Pay · listo</> },
      { style: { left: 20, top: 190, animation: 'lc-float 5.6s 1.1s ease-in-out infinite' }, label: <><LI name="lemon-add" size={13} color="var(--c-lemon-50)" /> $ 0 de costo</> }]

    },
    fisica: {
      aura: 'radial-gradient(95% 75% at 50% 34%, rgba(0,163,71,0.20), rgba(0,163,71,0.05) 55%, transparent 78%)',
      ring: 'rgba(0,163,71,0.30)',
      card: <CardArt variant="fisica" width={228} glow />, rot: 7,
      pills: [
      { style: { right: 20, top: 66, animation: 'lc-float 5s 0.6s ease-in-out infinite' }, dark: true, label: <><LI name="click-to-pay" size={13} color="#fff" /> Contactless</> },
      { style: { left: 22, top: 192, animation: 'lc-float 5.6s 1.1s ease-in-out infinite' }, label: <>Metal-look</> }]

    },
    credito: {
      aura: 'radial-gradient(95% 75% at 50% 34%, rgba(255,150,60,0.22), rgba(255,150,60,0.06) 55%, transparent 78%)',
      ring: 'rgba(255,150,60,0.35)',
      card: <CardArt variant="credito" width={228} glow />, rot: -6,
      pills: [
      { style: { right: 20, top: 66, animation: 'lc-float 5s 0.6s ease-in-out infinite' }, dark: true, label: <>Hasta 12 cuotas</> },
      { style: { left: 22, top: 192, animation: 'lc-float 5.6s 1.1s ease-in-out infinite' }, label: <><LI name="limits" size={13} color="var(--c-lemon-50)" /> Límite en el acto</> }]

    }
  };
  const sc = scenes[kind];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', inset: 0, background: sc.aura }} />
      {/* ondas NFC que emanan de la tarjeta */}
      {[0, 1, 2].map((i) =>
      <span key={i} style={{
        position: 'absolute', left: '50%', top: '46%', width: 214, height: 214,
        margin: '-107px 0 0 -107px', borderRadius: 999,
        border: `1.5px solid ${sc.ring}`, animation: `ob-ring 3.2s ${i * 1.05}s ease-out infinite`
      }} />
      )}
      <div style={{ position: 'absolute', left: '50%', top: '46%', transform: 'translate(-50%,-50%)' }}>
        <div style={{ transform: `rotate(${sc.rot}deg)` }}>
          <div style={{ animation: 'lc-float 4.4s ease-in-out infinite' }}>{sc.card}</div>
        </div>
      </div>
      {sc.pills.map((p, i) => <ObHeroPill key={i} style={p.style} dark={p.dark}>{p.label}</ObHeroPill>)}
    </div>);

};

// Hero con render del diseñador: la tarjeta "flota" sobre el fondo.
// Truco de dos capas: la imagen completa abajo + una copia enmascarada
// (elipse con borde difuso sobre la zona de la tarjeta) que sube y baja;
// como el cielo es suave, el borde de la máscara no se nota. Una sombra
// elíptica respira en contrafase para vender la levitación.
const ObHeroImg = ({ src }) => {
  const imgStyle = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 22%' };
  const mask = 'radial-gradient(48% 42% at 50% 38%, #000 52%, transparent 78%)';
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <img src={src} alt="" style={imgStyle} />
      {/* sombra bajo la tarjeta, respira en contrafase con el hover */}
      <div style={{ position: 'absolute', left: '50%', top: '63%', width: 160, height: 26, marginLeft: -80, borderRadius: '50%', filter: 'blur(7px)', background: 'radial-gradient(50% 50% at 50% 50%, rgba(10,20,30,0.38), transparent 72%)', animation: 'ob-shadow 4.8s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', inset: 0, animation: 'ob-hover 4.8s ease-in-out infinite', WebkitMaskImage: mask, maskImage: mask, willChange: 'transform' }}>
        <img src={src} alt="" style={imgStyle} />
      </div>
    </div>);

};

// ── Un slide del pager ──────────────────────────────────────────
function ObSlide({ slide, dist, dragging, onGhost }) {
  const c = Math.min(Math.abs(dist), 1);
  const tr = dragging ? 'none' : `transform .58s ${OB_EASE}, opacity .58s ${OB_EASE}`;

  // foco tipo profundidad de campo: al entrar, el frame de abajo está
  // difuso; al scrollear, el bloque de arriba se difumina y el frame
  // toma foco — nunca compiten los dos por atención.
  // Sin rAF a propósito: en documentos ocultos rAF se suspende (gotcha ya
  // visto en gastos/) y el scroll ya llega throttleado por el browser.
  const [focus, setFocus] = useStateO(0); // 0 = arriba nítido · 1 = frame nítido
  const onScroll = (e) => setFocus(Math.max(0, Math.min(1, e.currentTarget.scrollTop / 240)));
  const focusTr = 'filter .2s ease-out, opacity .2s ease-out, transform .2s ease-out';

  return (
    <div style={{
      width: OB_SLIDE_W, flexShrink: 0, height: '100%',
      transform: `scale(${1 - 0.055 * c}) translateY(${10 * c}px)`, opacity: 1 - 0.35 * c,
      transition: tr, willChange: 'transform,opacity'
    }}>
      <div style={{ height: '100%', borderRadius: 30, background: '#fff', overflow: 'hidden', boxShadow: '0 24px 48px rgba(8,8,9,0.12)', position: 'relative' }}>
        <div onScroll={onScroll} style={{ height: '100%', overflowY: 'auto', paddingBottom: 165 }}>

          {/* hero: render del diseñador (o arte del DS) con parallax */}
          <div style={{ position: 'relative', height: 318, overflow: 'hidden', filter: `blur(${(focus * 3).toFixed(2)}px)`, transition: focusTr }}>
            <div style={{ position: 'absolute', inset: -20, transform: `translateX(${dist * -26}px)`, transition: tr, willChange: 'transform' }}>
              {slide.heroImg ? <ObHeroImg src={slide.heroImg} /> : <ObHero kind={slide.id} />}
            </div>
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 120, background: 'linear-gradient(180deg, rgba(255,255,255,0), #fff 85%)' }} />
          </div>

          <div style={{ padding: '0 20px', marginTop: -24, position: 'relative' }}>
            <div style={{ filter: `blur(${(focus * 5).toFixed(2)}px)`, opacity: 1 - 0.3 * focus, transition: focusTr }}>
            {/* chip lime con barrido de brillo */}
            <span style={{ position: 'relative', overflow: 'hidden', display: 'inline-flex', alignItems: 'center', background: 'var(--c-lime-40)', color: '#080808', font: '600 10px Inter', letterSpacing: '0.06em', padding: '5px 11px', borderRadius: 999 }}>
              <span style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '30%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)', animation: 'lc-shine 3.4s ease-in-out infinite' }} />
              {slide.chip}
            </span>

            <div style={{ font: '500 29px Geist', lineHeight: 1.16, letterSpacing: '-0.01em', color: '#141414', marginTop: 10 }}>{slide.title}</div>
            <div style={{ font: '400 14px Inter', lineHeight: 1.55, letterSpacing: '-0.1px', color: '#818181', marginTop: 8 }}>{slide.body}</div>

            {/* list items */}
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 13 }}>
              {slide.items.map((it) =>
              <div key={it.t} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 999, background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <LI name={it.icon} size={17} color="#141414" />
                  </div>
                  <div>
                    <div style={{ font: '500 14px Geist', letterSpacing: '-0.01em', color: '#141414' }}>{it.t}</div>
                    <div style={{ font: '400 12px Inter', color: '#818181', marginTop: 1 }}>{it.s}</div>
                  </div>
                </div>
              )}
            </div>

            {/* ghost verde: costos */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
              <button onClick={onGhost} style={{ border: 0, background: 'transparent', cursor: 'pointer', font: '600 12px Inter', letterSpacing: '-0.1px', color: 'var(--c-lemon-50)', padding: '8px 12px', borderRadius: 999 }}>
                Ver costos y comisiones
              </button>
            </div>
            </div>

            {/* frame gris: imagen (slot arrastrable) + beneficios 2×2.
                Arranca fuera de foco y lo toma cuando el scroll llega. */}
            <div style={{ marginTop: 8, background: '#F3F3F3', borderRadius: 24, padding: 16, filter: `blur(${((1 - focus) * 5).toFixed(2)}px)`, opacity: 0.55 + 0.45 * focus, transform: `scale(${0.97 + 0.03 * focus})`, transformOrigin: '50% 0%', transition: focusTr }}>
              <image-slot
                id={slide.frame.slot}
                shape="rounded" radius="16"
                src={slide.frame.slotSrc}
                placeholder={slide.frame.slotHint}
                style={{ width: '100%', height: 140, display: 'block' }}>
              </image-slot>
              <div style={{ font: '500 20px Geist', letterSpacing: '-0.01em', color: '#141414', marginTop: 14 }}>{slide.frame.title}</div>
              <div style={{ font: '400 13px Inter', lineHeight: 1.5, letterSpacing: '-0.1px', color: '#818181', marginTop: 6 }}>{slide.frame.body}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
                {slide.frame.benefits.map((b) =>
                <div key={b.t} style={{ background: '#fff', borderRadius: 20, padding: '14px 14px 16px' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 999, background: '#F3F3F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <LI name={b.icon} size={17} color="#8a8a8a" />
                    </div>
                    <div style={{ font: '500 12px Inter', lineHeight: 1.45, letterSpacing: '-0.1px', color: '#818181', marginTop: 20 }}>{b.t}</div>
                  </div>
                )}
              </div>
              {slide.frame.pill &&
              <button style={{ width: '100%', border: 0, cursor: 'pointer', marginTop: 14, background: 'var(--c-lime-40)', color: '#141414', font: '600 14px Inter', padding: '11px 12px', borderRadius: 999 }}>
                  {slide.frame.pill}
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    </div>);

}

// ── Pager: peek + dots + nudge ──────────────────────────────────
function OnboardingPager({ onClose, onPick }) {
  const [index, setIndex] = useStateO(0);
  const [drag, setDrag] = useStateO(0);
  const [dragging, setDragging] = useStateO(false);
  const [nudge, setNudge] = useStateO(0);
  const [sheet, setSheet] = useStateO(null);
  const touched = useRefO(false);
  const ptr = useRefO(null);
  const wheelAcc = useRefO(0);
  const wheelLock = useRefO(false);

  const N = OB_SLIDES.length;
  const go = (i) => { touched.current = true; setIndex(Math.max(0, Math.min(N - 1, i))); };

  // nudge de bienvenida: si el usuario todavía no tocó nada, la vista se
  // corre 44px y vuelve con resorte — enseña el gesto sin tutorial.
  useEffectO(() => {
    const t1 = setTimeout(() => { if (!touched.current) setNudge(-44); }, 950);
    const t2 = setTimeout(() => setNudge(0), 1550);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // flechas del teclado (útil demostrando en desktop)
  useEffectO(() => {
    const h = (e) => {
      if (e.key === 'ArrowRight') go(index + 1);else
      if (e.key === 'ArrowLeft') go(index - 1);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [index]);

  // drag con lock de eje: horizontal lo manejamos acá, vertical queda
  // para el scroll interno del slide.
  const down = (e) => {
    touched.current = true;
    ptr.current = { x: e.clientX, y: e.clientY, axis: null, id: e.pointerId };
  };
  const move = (e) => {
    const p = ptr.current;
    if (!p) return;
    const dx = e.clientX - p.x, dy = e.clientY - p.y;
    if (!p.axis) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      p.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (p.axis === 'x') { setDragging(true); try { e.currentTarget.setPointerCapture(p.id); } catch (_) {} }
    }
    if (p.axis === 'x') {
      let d = dx;
      // resistencia elástica en los extremos
      if (index === 0 && dx > 0 || index === N - 1 && dx < 0) d = dx * 0.35;
      setDrag(d);
    }
  };
  const up = (e) => {
    const p = ptr.current;
    ptr.current = null;
    if (!p || p.axis !== 'x') { setDragging(false); setDrag(0); return; }
    const dx = e.clientX - p.x;
    setDragging(false); setDrag(0);
    if (dx < -60) go(index + 1);else if (dx > 60) go(index - 1);
  };
  const wheel = (e) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || wheelLock.current) return;
    wheelAcc.current += e.deltaX;
    if (wheelAcc.current > 70) { go(index + 1); lockWheel(); } else
    if (wheelAcc.current < -70) { go(index - 1); lockWheel(); }
  };
  const lockWheel = () => {
    wheelAcc.current = 0; wheelLock.current = true;
    setTimeout(() => { wheelLock.current = false; }, 550);
  };

  const slide = OB_SLIDES[index];
  const cur = index - (drag + nudge) / OB_STEP; // posición continua (para parallax/escala)

  return (
    <div
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onWheel={wheel}
      style={{ height: '100%', position: 'relative', overflow: 'hidden', background: slide.tint, transition: 'background .7s ease', touchAction: 'pan-y' }}>

      {/* volver */}
      <button onClick={onClose} style={{ position: 'absolute', top: 58, left: 18, zIndex: 6, width: 40, height: 40, borderRadius: 999, border: 0, cursor: 'pointer', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(6px)', boxShadow: '0 6px 16px rgba(8,8,9,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LI name="arrow-back" size={20} color="#141414" />
      </button>

      {/* track */}
      <div style={{
        position: 'absolute', top: 54, bottom: 14, left: 0, display: 'flex', gap: OB_GAP, paddingLeft: OB_PAD,
        transform: `translateX(${-(index * OB_STEP) + drag + nudge}px)`,
        transition: dragging ? 'none' : `transform .58s ${OB_EASE}`, willChange: 'transform'
      }}>
        {OB_SLIDES.map((s, i) =>
        <ObSlide key={s.id} slide={s} dist={i - cur} dragging={dragging} onGhost={() => setSheet(s.id)} />
        )}
      </div>

      {/* dots + CTA flotante (el label muta con el slide activo) */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 5, padding: '0 24px 30px', display: 'flex', flexDirection: 'column', gap: 12, pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'auto', alignSelf: 'center', display: 'flex', gap: 6, alignItems: 'center', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', padding: '7px 10px', borderRadius: 999, boxShadow: '0 6px 16px rgba(8,8,9,0.10)' }}>
          {OB_SLIDES.map((s, i) =>
          <button key={s.id} onClick={() => go(i)} aria-label={s.name} style={{
            width: i === index ? 22 : 7, height: 7, borderRadius: 999, border: 0, padding: 0, cursor: 'pointer',
            background: i === index ? '#141414' : '#C9C9C4', transition: `all .45s ${OB_EASE}`
          }} />
          )}
        </div>
        <div style={{ pointerEvents: 'auto', borderRadius: 999, boxShadow: '0 16px 34px rgba(8,8,9,0.26)' }}>
          <Btn variant="primary" onClick={() => onPick(slide.id)}>
            <span key={slide.id} style={{ display: 'inline-block', animation: `ob-up .34s ${OB_EASE}` }}>{slide.cta}</span>
          </Btn>
        </div>
      </div>

      <Sheet open={!!sheet} onClose={() => setSheet(null)}>
        {sheet && <ObCostSheet kind={sheet} onClose={() => setSheet(null)} />}
      </Sheet>
    </div>);

}

// ── Sheet de costos ─────────────────────────────────────────────
function ObCostSheet({ kind, onClose }) {
  const data = {
    virtual: { name: 'Tarjeta virtual', rows: [['Creación', 'Gratis'], ['Mantenimiento', 'Gratis'], ['Reposición', 'Gratis']] },
    fisica: { name: 'Tarjeta física', rows: [['Creación', 'Gratis'], ['Mantenimiento', 'Gratis'], ['Envío a tu casa', '$ 9.500'], ['Reposición', '$ 9.500']] },
    credito: { name: 'Tarjeta de crédito', rows: [['Emisión', 'Gratis'], ['Mantenimiento', 'Gratis'], ['Pago a fin de mes', 'Sin interés'], ['Financiación en cuotas', 'Según resumen']] }
  }[kind];
  return (
    <div style={{ padding: '6px 2px 2px' }}>
      <div style={{ font: '500 20px Geist', letterSpacing: '-0.01em', color: LX.text1 }}>Costos y comisiones</div>
      <div style={{ font: '400 13px Inter', color: LX.text2, marginTop: 3 }}>{data.name}</div>
      <Surface pad={4} style={{ marginTop: 14 }}>
        <div style={{ padding: '0 12px' }}>
          {data.rows.map(([k, v], i) =>
          <React.Fragment key={k}>
              {i > 0 && <Divider />}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0' }}>
                <span style={{ font: '400 14px Inter', color: LX.text2 }}>{k}</span>
                <span style={{ font: '500 14px Geist', color: v === 'Gratis' || v === 'Sin interés' ? 'var(--c-lemon-50)' : LX.text1 }}>{v}</span>
              </div>
            </React.Fragment>
          )}
        </div>
      </Surface>
      <div style={{ font: '400 11px Inter', color: LX.text3, marginTop: 10, lineHeight: 1.45 }}>Valores de ejemplo del prototipo. Los finales se definen con el equipo de producto.</div>
      <div style={{ marginTop: 12 }}>
        <Btn variant="light" onClick={onClose}>Entendido</Btn>
      </div>
    </div>);

}

// ── Home de la app en estado "sin tarjetas" ─────────────────────
// Misma home real (AppHome de cards/), pero la card lime que asoma detrás
// del balance —donde la tarjeta vive cuando existe— se convierte en la
// puerta de entrada al onboarding.
function ObHome({ onExplore, card, transit, onOpenCard }) {
  const navIcons = ['home-on', 'portfolio-off', 'market-off', 'activity-off', 'mini-apps-off'];
  return (
    <Screen footer={
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-around', background: LX.layer, borderRadius: 999, padding: '12px 14px', boxShadow: 'var(--shadow-card)' }}>
          {navIcons.map((t, i) => <LI key={i} name={t} size={22} color={i === 0 ? LX.text1 : LX.text3} />)}
        </div>
        <div style={{ width: 52, height: 52, borderRadius: 999, background: LX.dark, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <LI name="QR-Scanner" size={24} color="var(--c-lime-40)" />
        </div>
      </div>
    }>
      {/* top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: LX.layer, borderRadius: 999, padding: '6px 14px 6px 6px', boxShadow: 'var(--shadow-card)' }}>
          <span style={{ width: 30, height: 30, borderRadius: 999, background: 'var(--c-lemon-40)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 16px Inter', color: LX.dark }}>R</span>
          <span style={{ font: '600 16px Inter', color: LX.text1 }}>$rawww</span>
        </div>
        <div style={{ flex: 1 }} />
        <LI name="search" size={23} color={LX.text1} />
        <LI name="rewards" size={23} color={LX.text1} />
        <LI name="view-notification" size={23} color={LX.text1} />
      </div>

      <div style={{ padding: '4px 16px 8px' }}>
        <div style={{ position: 'relative' }}>
          {/* balance card */}
          <div style={{ position: 'relative', zIndex: 2, background: LX.layer, borderRadius: 32, overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ display: 'flex' }}>
              <div style={{ flex: 1, textAlign: 'center', font: '500 12px Inter', color: '#141414', padding: '14px 0' }}>Inicio</div>
              <div style={{ flex: 1, textAlign: 'center', font: '500 12px Inter', color: '#141414', padding: '14px 0', background: 'var(--c-lime-40)', borderRadius: '0 32px 0 24px' }}>Portfolio</div>
            </div>
            <div style={{ padding: '20px 24px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ font: '500 16px Inter', color: '#818181', letterSpacing: '-0.1px' }}>Pesos digitales</span>
                <LI name="view-balance-on" size={18} color="#818181" />
              </div>
              <div style={{ font: '500 44px Geist', lineHeight: '52px', letterSpacing: '-0.03em', color: '#141414', marginTop: 6 }}>$ 235.412</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--c-lime-40)', color: '#080808', font: '400 12px Inter', padding: '3px 12px', borderRadius: 999, marginTop: 10 }}>
                Crece 36,2% <LI name="arrow-foward" size={14} color="#080808" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 22 }}>
                {[['deposit', 'Depositar'], ['currency-peso', 'Usar'], ['send-money', 'Enviar']].map(([ic, lb]) =>
                <div key={lb} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 60, background: '#141414', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <LI name={ic} size={22} color="var(--c-lime-40)" />
                    </div>
                    <span style={{ font: '500 12px Inter', color: '#141414', letterSpacing: '-0.1px' }}>{lb}</span>
                  </div>)}
              </div>
            </div>
          </div>

          {/* card lime asomando detrás: acá vive la tarjeta. Sin tarjeta,
              es la invitación a conocerlas (entrada al onboarding). */}
          <button onClick={card ? onOpenCard : onExplore} style={{
            position: 'relative', zIndex: 1, width: '100%', textAlign: 'left', border: 0, cursor: 'pointer',
            marginTop: -86, padding: '94px 20px 18px', borderRadius: 32, overflow: 'hidden', background: 'var(--c-lime-40)'
          }}>
            <div style={{ position: 'absolute', inset: 0, opacity: 0.4, mixBlendMode: 'multiply', background: 'radial-gradient(80% 120% at 12% 130%, #9be01f 0%, transparent 55%), radial-gradient(70% 120% at 95% 130%, #e6ff8a 0%, transparent 52%)' }} />
            {!card &&
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '26%', pointerEvents: 'none', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)', animation: 'lc-shine 3.2s ease-in-out infinite' }} />
            }
            <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10 }}>
              {card ?
              <>
                  <div>
                    <div style={{ font: '500 14px Inter', color: '#080808', letterSpacing: '-0.1px' }}>Tarjeta virtual</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
                      <span style={{ display: 'flex', gap: 2 }}><span style={{ width: 4, height: 4, borderRadius: 999, background: '#080808' }} /><span style={{ width: 4, height: 4, borderRadius: 999, background: '#080808' }} /></span>
                      <span style={{ font: '400 12px Inter', color: '#080808' }}>{card.mask.replace('•••• ', '')}</span>
                      {card.nfc &&
                    <span style={{ font: '600 10px Inter', background: 'rgba(8,8,8,0.12)', color: '#080808', padding: '2px 8px', borderRadius: 999, marginLeft: 4 }}> Pay</span>
                    }
                    </div>
                  </div>
                  <VisaMark size={22} color="#141414" shadow={false} />
                </> :

              <>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ font: '600 14px Inter', color: '#080808', letterSpacing: '-0.1px' }}>Tu primera Lemon Card</div>
                    <div style={{ font: '400 12px Inter', color: 'rgba(8,8,8,0.65)', marginTop: 3 }}>Virtual, física o de crédito · conocelas</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ transform: 'rotate(-9deg)', filter: 'drop-shadow(0 5px 9px rgba(0,0,0,0.22))' }}><CardArt design="violeta" width={52} /></div>
                      <div style={{ transform: 'rotate(7deg)', marginLeft: -30, filter: 'drop-shadow(0 5px 9px rgba(0,0,0,0.22))' }}><CardArt variant="fisica" width={52} /></div>
                    </div>
                    <span style={{ width: 32, height: 32, borderRadius: 999, background: 'rgba(8,20,0,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <LI name="arrow-foward" size={16} color="#0b1a00" />
                    </span>
                  </div>
                </>
              }
            </div>
          </button>
        </div>

        {/* pedido en camino (física / crédito) */}
        {transit &&
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: LX.layer, borderRadius: 24, padding: '14px 16px', marginTop: 16, boxShadow: '0 4px 8px rgba(8,8,9,0.05)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 999, background: 'var(--c-lemon-5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <LI name="rocket" size={20} color="var(--c-lemon-50)" />
            </div>
            <div>
              <div style={{ font: '500 13px Geist', color: LX.text1 }}>Tu Lemon Card {transit === 'fisica' ? 'física' : 'de crédito'} está en camino</div>
              <div style={{ font: '400 12px Inter', color: LX.text2, marginTop: 2 }}>Llega en 5 a 7 días hábiles. Te avisamos por push.</div>
            </div>
          </div>
        }
      </div>
    </Screen>);

}

// ── Confirmación de pedido (física / crédito) ───────────────────
const ObStep = ({ n, t, sub, done, last }) =>
<div style={{ display: 'flex', gap: 12 }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <span style={{ width: 24, height: 24, borderRadius: 999, background: done ? 'var(--c-lemon-50)' : LX.layer3, color: done ? '#fff' : LX.text2, display: 'flex', alignItems: 'center', justifyContent: 'center', font: '600 12px Inter', flexShrink: 0 }}>
        {done ? '✓' : n}
      </span>
      {!last && <span style={{ width: 2, flex: 1, minHeight: 18, background: LX.hair, margin: '2px 0' }} />}
    </div>
    <div style={{ paddingBottom: last ? 0 : 14 }}>
      <div style={{ font: '600 14px Inter', color: LX.text1 }}>{t}</div>
      {sub && <div style={{ font: '400 12px Inter', color: LX.text2, marginTop: 1 }}>{sub}</div>}
    </div>
  </div>;

function ObConfirm({ kind, addr, onDone }) {
  const fisica = kind === 'fisica';
  const line = addr && addr[0] || 'Malabia 1720';
  const zone = addr && addr[1] || 'Palermo, CABA';
  return (
    <Screen footer={<Btn variant="primary" onClick={onDone}>Volver al inicio</Btn>}>
      <div style={{ padding: '24px 20px 8px', display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: 999, background: 'var(--bg-positive-01)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: `ob-up .5s ${OB_EASE}` }}>
          <LI name="feedback-positive" size={38} color="var(--c-lemon-50)" />
        </div>
        <div style={{ animation: `ob-up .5s .08s ${OB_EASE} backwards` }}>
          <div style={{ font: '500 25px Geist', letterSpacing: '-0.02em', color: LX.text1 }}>¡Pedido confirmado!</div>
          <div style={{ font: '400 15px Inter', color: LX.text2, marginTop: 8, lineHeight: 1.5 }}>
            Te mandamos tu Lemon Card {fisica ? 'física' : 'de crédito'} a<br /><b style={{ color: LX.text1 }}>{line}</b>, {zone.split(' · ')[0]}.
          </div>
        </div>

        <div style={{ width: '100%', borderRadius: 20, overflow: 'hidden', background: fisica ? 'radial-gradient(120% 90% at 80% 0%, #14342f, #0a181c)' : 'radial-gradient(120% 90% at 80% 0%, #33261a, #131315)', padding: '20px 18px', color: '#fff', display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left', animation: `ob-up .5s .16s ${OB_EASE} backwards` }}>
          <div style={{ transform: 'rotate(-6deg)', flexShrink: 0 }}>
            <CardArt variant={kind} width={120} glow />
          </div>
          <div>
            <div style={{ font: '600 15px Inter' }}>Llega en su estuche</div>
            <div style={{ font: '400 13px Inter', color: 'rgba(255,255,255,0.72)', marginTop: 4, lineHeight: 1.45 }}>
              Activala desde la app apenas la tengas{fisica ? ' y sumala al celu para pagar con NFC' : ''}.
            </div>
          </div>
        </div>

        <Surface pad={14} style={{ width: '100%', textAlign: 'left', animation: `ob-up .5s .24s ${OB_EASE} backwards` }}>
          <ObStep n="1" t="Preparamos tu tarjeta" done />
          <ObStep n="2" t="Sale del depósito" sub="Te avisamos por push" />
          <ObStep n="3" t="Llega a tu casa" sub="5 a 7 días hábiles" last />
        </Surface>
      </div>
    </Screen>);

}

Object.assign(window, { OnboardingPager, ObHome, ObConfirm, ObCostSheet, OB_SLIDES });
