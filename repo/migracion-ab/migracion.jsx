// ════════════════════════════════════════════════════════════════
// Migración de la virtual GP → Pomelo · experimento A/B
//   Camino A — "explícito": aviso de débitos como paso del flujo,
//              la vieja se apaga en 10 días (urgencia).
//   Camino B — "tranquilo": aviso de débitos como banner post-creación,
//              la vieja convive 30 días (sin fricción).
// REGLA DE NEGOCIO: la app NO puede mostrar información de los débitos
// automáticos (ni cuáles, ni cuántos, ni montos). Lo único que puede
// hacer es avisar que, si existen, llega un MAIL con el detalle.
// El detalle vive solo dentro del mail (MigEmail es su vista previa).
// ════════════════════════════════════════════════════════════════
const { useState: useStateM, useEffect: useEffectM } = React;

// Parámetros del experimento (hoy simulado: lunes 4 de agosto)
const MIG = {
  A: { days: 10, offDate: '14 de agosto', urgente: true },
  B: { days: 30, offDate: '3 de septiembre', urgente: false }
};
const OLD_MASK = '•••• 4543';
const NEW_MASK = '•••• 2291';
// SOLO para el contenido del mail (nunca se muestra en la app)
const DEBITOS = [
  { icon: 'play-arrow', name: 'Netflix', detail: 'Se debita los 4 de cada mes', amount: '$ 12.999' },
  { icon: 'rewards', name: 'Spotify', detail: 'Se debita los 9 de cada mes', amount: '$ 6.499' },
  { icon: 'celphone', name: 'iCloud+', detail: 'Se debita los 15 de cada mes', amount: '$ 1.999' }];


// ── Splash de entrada (full-bleed verde ácido, diseño oficial) ──
// "Empezá a pagar con tu celular" + posnet/celu. Igual en A y B.
function MigSplash({ onClose, onPrimary, onLater }) {
  const BG = 'radial-gradient(58% 30% at 74% 6%, rgba(255,255,120,0.85), transparent 70%), radial-gradient(46% 26% at 12% 44%, rgba(244,255,94,0.6), transparent 70%), radial-gradient(64% 34% at 62% 92%, rgba(246,255,88,0.75), transparent 72%), linear-gradient(168deg, #74F62A 0%, #46E512 34%, #7DFF2E 62%, #C9FF37 100%)';
  return (
    <Screen scroll={false} bg={BG}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '0 16px 26px' }}>
        <div style={{ height: 52, display: 'flex', alignItems: 'center' }}>
          <button onClick={onClose} style={{ border: 0, background: 'transparent', cursor: 'pointer', width: 40, height: 40, marginLeft: -8 }}>
            <LI name="close" size={24} color="#0b1a00" />
          </button>
        </div>

        {/* posnet + celu */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <image-slot
            id="mig-splash-hero"
            shape="rect"
            fit="contain"
            src="assets/nfc-splash-hero.png"
            placeholder="Posnet + celu (render 3D)"
            style={{ width: 310, height: 270, filter: 'drop-shadow(0 22px 30px rgba(20,60,0,0.30))' }}>
          </image-slot>
        </div>

        <div style={{ padding: '4px 4px 0' }}>
          <div style={{ font: '500 31px Geist', lineHeight: 1.12, letterSpacing: '-0.015em', color: '#0b1a00' }}>
            Empezá a pagar con tu celular, cambiá tu tarjeta virtual
          </div>
          <div style={{ font: '400 14px Inter', lineHeight: 1.5, color: 'rgba(11,26,0,0.72)', marginTop: 12 }}>
            Olvidate de salir con tu billetera, cambiá tu tarjeta y agregala a tu Apple Wallet.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 22 }}>
          <button onClick={onPrimary} style={{ height: 48, border: 0, borderRadius: 16, cursor: 'pointer', background: '#141414', color: '#FFFFFF', font: '600 16px Inter', letterSpacing: '-0.1px' }}>Cambiar mi tarjeta virtual</button>
          <button onClick={onLater} style={{ height: 48, border: 0, borderRadius: 16, cursor: 'pointer', background: 'rgba(255,255,255,0.34)', color: '#0b1a00', font: '600 16px Inter', letterSpacing: '-0.1px' }}>Ahora no</button>
        </div>
      </div>
    </Screen>);
}

// ── Picker de diseño (tarjetas VERTICALES, carrusel ↔ grilla) ───
// Diseño oficial: carrusel con la siguiente asomando a la derecha,
// toggle a grilla de 3 columnas con el ícono del header. CTA fija.
const PICKER_DESIGNS = ['tetrish', 'sticker', 'violeta', 'green', 'blue', 'acid'].map(getDesign);

const AvatarStack = ({ users }) =>
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
    <span style={{ display: 'flex' }}>
      {['#FFB35C', '#7B4EC8', '#2BE76B'].map((c, i) =>
        <span key={i} style={{ width: 16, height: 16, borderRadius: 999, background: c, border: '2px solid #fff', marginLeft: i ? -6 : 0 }} />)}
    </span>
    <span style={{ font: '500 13px Inter', color: '#818181' }}>{users}</span>
  </div>;

function MigPicker({ onBack, onClose, onChoose }) {
  const [idx, setIdx] = useStateM(0);
  const [grid, setGrid] = useStateM(false);
  const N = PICKER_DESIGNS.length;
  const d = PICKER_DESIGNS[idx];
  const next = PICKER_DESIGNS[(idx + 1) % N];

  return (
    <Screen bg="#FFFFFF" footer={<Btn variant="primary" onClick={() => onChoose(d)}>Elegir y continuar</Btn>}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', height: 52 }}>
        <button onClick={onBack} style={{ border: 0, background: 'transparent', cursor: 'pointer', width: 40, height: 40 }}>
          <LI name="arrow-back" size={22} color="#141414" />
        </button>
        <div style={{ flex: 1, textAlign: 'center', font: '500 14px Inter', color: '#141414' }}>Elegí el diseño</div>
        <button onClick={() => setGrid((g) => !g)} style={{ border: 0, background: 'transparent', cursor: 'pointer', width: 40, height: 40 }}>
          <LI name={grid ? 'card-on' : 'mini-apps-on'} size={22} color="#141414" />
        </button>
      </div>

      {grid ?
        // ── GRILLA (3 columnas, verticales, la elegida con borde lime) ──
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px 10px', padding: '14px 16px 8px' }}>
          {PICKER_DESIGNS.map((dd, i) =>
            <button key={dd.id} onClick={() => { setIdx(i); setGrid(false); }} style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <span style={{ display: 'block', padding: 3, borderRadius: 14, border: `3px solid ${idx === i ? 'var(--c-lime-40)' : 'transparent'}` }}>
                <CardArt design={dd.id} width={86} portrait />
              </span>
              <span style={{ font: '500 12px Geist', color: idx === i ? '#141414' : '#818181' }}>{dd.name}</span>
            </button>)}
        </div> :

        // ── CARRUSEL (una grande centrada + la siguiente asomando) ──
        <>
          <div style={{ position: 'relative', overflow: 'hidden', marginTop: 10, height: 374 }}>
            <div key={d.id} style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', animation: 'screenIn .35s ease' }}>
              <CardArt design={d.id} width={230} portrait glow />
            </div>
            {/* tap en la que asoma → pasa a la siguiente */}
            <button onClick={() => setIdx((idx + 1) % N)} style={{ position: 'absolute', right: -180, top: 14, border: 0, background: 'transparent', cursor: 'pointer', padding: 0, opacity: 0.55 }}>
              <CardArt design={next.id} width={214} portrait />
            </button>
          </div>
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <div style={{ font: '500 24px Geist', letterSpacing: '-0.01em', color: '#141414' }}>{d.name}</div>
            <div style={{ marginTop: 8 }}><AvatarStack users={d.users} /></div>
          </div>
        </>}
    </Screen>);
}

// ── Comparativa vieja → nueva (pre-creación) ────────────────────
// Diseño "Ingreso datos extras": dos tiles con flecha. En A suma el banner
// lime con plazo + referencia al mail de débitos (el mensaje va AL FRENTE);
// en B es una nota suave sin débitos.
function MigCompare({ variant, design, onBack, onClose, onContinue }) {
  const cfg = MIG[variant];
  const [ack, setAck] = useStateM(false);
  const Tile = ({ label, name, art, faded }) =>
    <div style={{ flex: 1, background: 'rgba(8,8,9,0.05)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 62, borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.14)' }}>
        <CardArt design={art} width={62} portrait faded={faded} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ font: '400 12px Inter', color: '#818181', lineHeight: 1.4 }}>{label}</div>
        <div style={{ font: '500 16px Geist', color: '#141414', marginTop: 2 }}>{name}</div>
      </div>
    </div>;

  return (
    <Screen footer={
      <Btn variant="primary" disabled={!ack} onClick={onContinue}>
        {variant === 'A' ? 'Continuar' : 'Crear mi nueva tarjeta'}
      </Btn>
    }>
      <StepHeader title="Cambiar tu tarjeta" onBack={onBack} onClose={onClose} />
      <div style={{ padding: '6px 16px 8px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <div style={{ font: '500 24px Geist', letterSpacing: '-0.02em', color: LX.text1, lineHeight: 1.25 }}>Tu nueva tarjeta reemplaza a la actual</div>
          <div style={{ font: '400 14px Inter', color: LX.text2, marginTop: 6, lineHeight: 1.45 }}>
            Así queda el cambio. Los datos (número, vencimiento y CVV) son nuevos.
          </div>
        </div>

        {/* vieja → nueva */}
        <div style={{ position: 'relative', display: 'flex', gap: 24 }}>
          <Tile label="Vieja Lemon Card virtual" name={OLD_MASK} art="violeta" faded />
          <Tile label="Nueva Lemon Card virtual" name={getDesign(design).name} art={design} />
          <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 32, height: 32, borderRadius: 999, background: '#E1E1E1', border: '2px solid #CECECE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LI name="arrow-foward" size={15} color="#818181" />
          </span>
        </div>

        {variant === 'A' ?
          // A · débitos AL FRENTE: banner lime del diseño — solo referencia al mail.
          <div style={{ background: '#CFFF2E', borderRadius: 24, padding: 16 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <LI name="alert-time" size={19} color="#080808" style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ font: '400 14px Inter', color: '#080808', lineHeight: 1.55 }}>
                Tu tarjeta {OLD_MASK} <b>se apaga el {cfg.offDate}</b> — quedan {cfg.days} días. Si tenés débitos automáticos asociados, te mandamos un mail con el detalle para que los pases a la nueva.
              </div>
            </div>
          </div> :
          // B · nota suave: la vieja convive, no hay nada que hacer hoy.
          <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start', background: LX.layer3, borderRadius: 14, padding: '13px 14px' }}>
            <LI name="alert-time" size={18} color={LX.text2} style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ font: '400 13px Inter', color: LX.text2, lineHeight: 1.5 }}>
              Tu tarjeta {OLD_MASK} sigue funcionando como siempre hasta el <b style={{ color: LX.text1 }}>{cfg.offDate}</b>. Después se apaga sola — no tenés que hacer nada.
            </div>
          </div>}

        <button onClick={() => setAck((a) => !a)} style={{ display: 'flex', alignItems: 'flex-start', gap: 11, background: 'transparent', border: 0, cursor: 'pointer', textAlign: 'left', padding: '2px 2px 4px' }}>
          <span style={{ width: 24, height: 24, borderRadius: 7, flexShrink: 0, marginTop: 1, border: `2px solid ${ack ? 'var(--c-lemon-50)' : LX.text3}`, background: ack ? 'var(--c-lemon-50)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', font: '700 14px Inter' }}>{ack ? '✓' : ''}</span>
          <span style={{ font: '500 14px Inter', color: LX.text1, lineHeight: 1.4 }}>
            Entiendo que mi tarjeta {OLD_MASK} deja de funcionar el {cfg.offDate}.
          </span>
        </button>
      </div>
    </Screen>);
}

// ── Paso débitos (solo Camino A: el mensaje interrumpe el flujo) ─
// La app no puede mostrar cuáles son: solo avisa que llega un mail.
function MigDebitos({ variant, onBack, onClose, onVerMail, onContinue }) {
  const cfg = MIG[variant];
  return (
    <Screen footer={<Btn variant="primary" onClick={onContinue}>Entendido, crear mi tarjeta</Btn>}>
      <StepHeader title="Débitos automáticos" onBack={onBack} onClose={onClose} />
      <div style={{ padding: '6px 16px 8px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0 2px' }}>
          <div style={{ width: 96, height: 96, borderRadius: 999, background: '#CFFF2E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LI name="mail" size={44} color="#080808" />
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '0 8px' }}>
          <div style={{ font: '500 24px Geist', letterSpacing: '-0.02em', color: LX.text1, lineHeight: 1.25 }}>¿Tenés débitos automáticos?</div>
          <div style={{ font: '400 14px Inter', color: LX.text2, marginTop: 8, lineHeight: 1.55 }}>
            Si hay pagos que se debitan automáticamente de tu tarjeta {OLD_MASK}, te mandamos un mail con el detalle para que los pases a tu nueva tarjeta antes del <b style={{ color: LX.text1 }}>{cfg.offDate}</b>.
          </div>
        </div>

        <Surface pad={0} style={{ overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
            <div style={{ width: 40, height: 40, borderRadius: 999, background: LX.layer3, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <LI name="view-notification" size={20} color={LX.text1} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ font: '600 14px Inter', color: LX.text1 }}>Te llega a mica@gmail.com</div>
              <div style={{ font: '400 12px Inter', color: LX.text2, marginTop: 1 }}>Apenas crees tu nueva tarjeta.</div>
            </div>
            <button onClick={onVerMail} style={{ border: 0, cursor: 'pointer', borderRadius: 999, padding: '8px 14px', background: LX.dark, color: '#fff', font: '600 12px Inter', flexShrink: 0 }}>
              Ver el mail
            </button>
          </div>
        </Surface>
      </div>
    </Screen>);
}

// ── Mail de débitos (vista previa — el detalle vive SOLO acá) ───
function MigEmail({ variant, onBack }) {
  const cfg = MIG[variant];
  return (
    <Screen bg="#FFFFFF">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', height: 52 }}>
        <button onClick={onBack} style={{ border: 0, background: 'transparent', cursor: 'pointer', width: 40, height: 40 }}>
          <LI name="arrow-back" size={22} color="#141414" />
        </button>
        <div style={{ flex: 1, textAlign: 'center', font: '600 16px Inter', color: LX.text1 }}>Mail · vista previa</div>
        <span style={{ width: 40 }} />
      </div>

      {/* chrome de mail */}
      <div style={{ padding: '2px 16px 10px', borderBottom: `1px solid ${LX.hair}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 36, height: 36, borderRadius: 999, background: LX.dark, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Leaf size={20} color="var(--c-lime-40)" vein="rgba(0,0,0,0.3)" />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ font: '600 14px Inter', color: '#141414' }}>Lemon <span style={{ font: '400 12px Inter', color: '#818181' }}>· hola@lemon.me</span></div>
            <div style={{ font: '400 12px Inter', color: '#818181', marginTop: 1 }}>Para: mica@gmail.com</div>
          </div>
          <span style={{ font: '400 12px Inter', color: '#818181' }}>10:42</span>
        </div>
      </div>

      {/* cuerpo del mail */}
      <div style={{ padding: '18px 16px 28px' }}>
        <div style={{ height: 64, borderRadius: 14, overflow: 'hidden', position: 'relative', background: 'linear-gradient(100deg, #5AC005 0%, #8CE617 55%, #B7F53A 100%)' }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Leaf size={22} color="#0b1a00" vein="rgba(255,255,255,0.35)" />
            <span style={{ font: '700 15px Inter', color: '#0b1a00' }}>Lemon</span>
          </div>
        </div>

        <div style={{ font: '500 24px Geist', letterSpacing: '-0.015em', color: '#050505', lineHeight: 1.25, marginTop: 20 }}>
          Pasá tus débitos automáticos a tu nueva Lemon Card virtual
        </div>
        <div style={{ font: '400 14px Inter', color: '#050505', marginTop: 10, lineHeight: 1.55 }}>
          ¡Hola, Mica! Creaste tu nueva tarjeta virtual {NEW_MASK}. Tu tarjeta anterior ({OLD_MASK}) deja de funcionar el <b>{cfg.offDate}</b>{cfg.urgente ? ` — quedan ${cfg.days} días` : ''}. Estos son los servicios que se debitan de la tarjeta anterior:
        </div>

        <div style={{ border: `1px solid ${LX.hair}`, borderRadius: 14, marginTop: 16, overflow: 'hidden' }}>
          {DEBITOS.map((d, i) =>
            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderTop: i ? `1px solid ${LX.hair}` : 'none' }}>
              <div style={{ width: 32, height: 32, borderRadius: 999, background: 'rgba(8,8,9,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <LI name={d.icon} size={16} color="#141414" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: '600 13px Inter', color: '#141414' }}>{d.name}</div>
                <div style={{ font: '400 11px Inter', color: '#818181', marginTop: 1 }}>{d.detail}</div>
              </div>
              <span style={{ font: '500 13px Geist', color: '#141414' }}>{d.amount}</span>
            </div>)}
        </div>

        <div style={{ font: '400 14px Inter', color: '#050505', marginTop: 16, lineHeight: 1.55 }}>
          Entrá a cada servicio y actualizá el medio de pago con los datos de tu nueva tarjeta. Los encontrás en la app, en <b>Tarjetas → tu nueva virtual → Ver datos</b>.
        </div>

        <div style={{ marginTop: 16, borderRadius: 14, background: '#141414', color: '#fff', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <CardThumb design="tetrish" w={44} />
          <div style={{ flex: 1 }}>
            <div style={{ font: '600 13px Inter' }}>Nueva Lemon Card virtual</div>
            <div style={{ font: '400 12px Inter', color: 'rgba(255,255,255,0.65)', marginTop: 1 }}>{NEW_MASK} · datos en la app</div>
          </div>
          <span style={{ border: 0, borderRadius: 999, padding: '8px 14px', background: '#CFFF2E', color: '#080808', font: '600 12px Inter', whiteSpace: 'nowrap' }}>Abrir la app</span>
        </div>

        <div style={{ font: '400 11px Inter', color: '#818181', marginTop: 20, lineHeight: 1.5, textAlign: 'center' }}>
          Recibís este mail porque cambiaste tu tarjeta virtual Lemon.<br />Lemon Cash · Av. Siempreviva 742, CABA
        </div>
      </div>
    </Screen>);
}

// ── Fila de tarjeta del hub (con estado "se apaga") ─────────────
const MigCardRow = ({ design, variant, title, mask, dying, days, onTap }) =>
  <div onClick={onTap} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', cursor: onTap ? 'pointer' : 'default' }}>
    <div style={{ width: 62, borderRadius: 10, overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.14)' }}>
      <CardArt design={design} variant={variant} width={62} faded={dying} />
    </div>
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div>
        <div style={{ font: '500 16px Geist', color: '#323230', letterSpacing: '-0.1px' }}>{title}</div>
        <div style={{ font: '400 14px Inter', color: 'rgba(28,28,26,0.5)', marginTop: 1 }}>{mask}</div>
      </div>
      {dying ?
        <span style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', background: '#FEE8E6', color: '#EA2B3C', font: '500 12px Inter', padding: '3px 9px', borderRadius: 999, whiteSpace: 'nowrap' }}>
          Se apaga en {days} días
        </span> :
        <span style={{ alignSelf: 'flex-start' }}><StatusPill status="Activa" /></span>}
    </div>
    <span style={{ width: 40, height: 40, borderRadius: 999, background: dying ? 'rgba(8,8,9,0.05)' : 'rgba(8,8,8,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <LI name="view-balance-on" size={20} color={dying ? 'rgba(8,8,8,0.2)' : '#141414'} />
    </span>
    <LI name="arrow-foward" size={16} color="#818181" style={{ flexShrink: 0 }} />
  </div>;

// ── Hub de tarjetas post-migración (nueva + vieja conviviendo) ──
function MigHub({ variant, design, onBack, onOldTap, onNewTap, onVerMail }) {
  const cfg = MIG[variant];
  const [showDebitos, setShowDebitos] = useStateM(variant === 'B');
  return (
    <Screen>
      <BigHeader title="Tarjetas" onBack={onBack} right={<span style={{ width: 40 }} />} />
      <div style={{ display: 'flex', gap: 24, padding: '0 18px 4px' }}>
        <span style={{ font: '600 17px Inter', color: LX.text1, borderBottom: `2px solid ${LX.text1}`, paddingBottom: 8 }}>Prepaga</span>
        <span style={{ font: '600 17px Inter', color: LX.text3, paddingBottom: 8 }}>Crédito</span>
      </div>
      <div style={{ padding: '10px 16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        <Surface pad={0} style={{ overflow: 'hidden' }}>
          <MigCardRow design={design} title="Virtual" mask={NEW_MASK} onTap={onNewTap} />
          <Divider style={{ margin: '0 18px' }} />
          <MigCardRow design="violeta" title="Virtual" mask={OLD_MASK} dying days={cfg.days} onTap={onOldTap} />
          <Divider style={{ margin: '0 18px' }} />
          <MigCardRow variant="fisica" design={undefined} title="Física" mask="•••• 4323" />
          <Divider style={{ margin: '0 18px' }} />
          <MonedaDePago />
        </Surface>

        {/* B · el mensaje de débitos vive acá: banner descartable post-creación */}
        {showDebitos &&
          <div style={{ position: 'relative', background: '#FFEB37', borderRadius: 24, padding: 16 }}>
            <button onClick={() => setShowDebitos(false)} style={{ position: 'absolute', top: 12, right: 12, border: 0, background: 'transparent', cursor: 'pointer', padding: 0 }}>
              <LI name="close" size={16} color="#080808" />
            </button>
            <div style={{ font: '500 14px Geist', color: '#080808', lineHeight: 1.4, paddingRight: 22 }}>¿Tenés débitos automáticos en tu tarjeta anterior?</div>
            <div style={{ font: '400 12px Inter', color: '#080808', marginTop: 4, lineHeight: 1.5 }}>
              Te mandamos un mail con el detalle para que los pases a la nueva antes del {cfg.offDate}.
            </div>
            <button onClick={onVerMail} style={{ marginTop: 12, border: 0, cursor: 'pointer', borderRadius: 100, padding: '8px 14px', background: 'rgba(8,8,8,0.1)', color: '#080808', font: '600 12px Inter' }}>
              Ver el mail
            </button>
          </div>}

        {/* incentivo de migración (igual en ambos caminos, para no meter ruido) */}
        <button style={{
          display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', cursor: 'pointer', border: 0,
          background: '#00530D', borderRadius: 24, padding: '14px 16px'
        }}>
          <span style={{ font: '500 24px Geist', letterSpacing: '-0.03em', color: '#CFFF2E', flexShrink: 0 }}>30%</span>
          <span style={{ width: 1, alignSelf: 'stretch', background: '#CFFF2E', opacity: 0.7 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ font: '500 12px Geist', color: '#fff' }}>De cashback extra esta semana</div>
            <div style={{ font: '400 12px Inter', color: 'rgba(255,255,255,0.85)', marginTop: 1 }}>Pagando con tu nueva Lemon Card virtual</div>
          </div>
          <LI name="arrow-foward" size={16} color="#CFFF2E" style={{ flexShrink: 0 }} />
        </button>
      </div>
    </Screen>);
}

// ── Detalle de la vieja (apagándose) ────────────────────────────
// Diseño: tarjeta al 30%, Pausar/Ver datos deshabilitados, banner
// amarillo con el plazo, movimientos (sin info de débitos).
function MigOldCard({ variant, onBack, onClose, onGoNew, onVerMail }) {
  const cfg = MIG[variant];
  const DisabledAction = ({ icon, label }) =>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 48, height: 48, borderRadius: 999, background: 'rgba(8,8,9,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LI name={icon} size={22} color="rgba(8,8,8,0.2)" />
      </div>
      <span style={{ font: '500 12px Inter', color: 'rgba(8,8,8,0.25)' }}>{label}</span>
    </div>;

  return (
    <Screen>
      <StepHeader title="Tarjeta prepaga virtual" onBack={onBack} onClose={onClose} />
      <div style={{ padding: '6px 16px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 190 }}>
          <div style={{ opacity: 0.35 }}><CardArt design="violeta" width={290} /></div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 32 }}>
          <DisabledAction icon="pause" label="Pausar" />
          <DisabledAction icon="view-balance-on" label="Ver datos" />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 48, height: 48, borderRadius: 999, background: 'rgba(8,8,8,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LI name="settings" size={22} color="#141414" />
            </div>
            <span style={{ font: '500 12px Inter', color: '#141414' }}>Configurar</span>
          </div>
        </div>

        {/* banner amarillo del diseño: plazo + acción */}
        <div style={{ background: '#FFEB37', borderRadius: 24, padding: 16 }}>
          <div style={{ font: '500 14px Geist', color: '#080808', lineHeight: 1.4 }}>
            Esta tarjeta se apaga el {cfg.offDate}{cfg.urgente ? ` — quedan ${cfg.days} días` : ''}
          </div>
          <div style={{ font: '400 12px Inter', color: '#080808', marginTop: 4, lineHeight: 1.5 }}>
            {cfg.urgente ?
              <>Seguís pudiendo pagar con ella hasta ese día, pero ya no podés ver sus datos. Si tenés débitos automáticos, revisá el mail que te mandamos y pasalos ya.</> :
              <>Seguís pudiendo pagar con ella hasta ese día, pero ya no podés ver sus datos. Cuando quieras, revisá el mail que te mandamos para pasar tus débitos automáticos.</>}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button onClick={onGoNew} style={{ border: 0, cursor: 'pointer', borderRadius: 100, padding: '8px 14px', background: 'rgba(8,8,8,0.1)', color: '#080808', font: '600 12px Inter' }}>Usar mi nueva tarjeta</button>
            <button onClick={onVerMail} style={{ border: 0, cursor: 'pointer', borderRadius: 100, padding: '8px 14px', background: 'transparent', color: '#080808', font: '600 12px Inter' }}>Ver mail de débitos</button>
          </div>
        </div>

        <Surface pad={0} style={{ overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 16px 4px' }}>
            <span style={{ font: '500 16px Geist', color: '#141414', letterSpacing: '-0.01em' }}>Movimientos</span>
            <LI name="arrow-foward" size={16} color="#141414" />
          </div>
          <div style={{ padding: '0 16px 8px' }}>
            <MoveRow icon="card-on" coin="btc" title="Pago con tarjeta" date="2 de agosto" amount="$ 8.150" />
            <MoveRow icon="card-on" title="Pago con tarjeta" date="28 de julio" amount="$ 3.020" />
            <MoveRow icon="deposit" title="Transferencia recibida" date="15 de julio" amount="$ 300,45" sign="+" />
          </div>
        </Surface>
      </div>
    </Screen>);
}

// ── Flujo completo (A o B) ──────────────────────────────────────
function FlowMigracion({ variant, onMenu }) {
  const [step, setStep] = useStateM('home');
  const [design, setDesign] = useStateM('tetrish');
  const [walletAdded, setWalletAdded] = useStateM(false);
  const [mailFrom, setMailFrom] = useStateM(null); // pantalla a la que vuelve el mail

  const openMail = (from) => { setMailFrom(from); setStep('mail'); };

  // "Quiero Apple Pay" → overlay de alta y a las tarjetas
  useEffectM(() => {
    if (step !== 'wallet') return;
    const t = setTimeout(() => setStep('hub'), 1800);
    return () => clearTimeout(t);
  }, [step]);

  if (step === 'home')
    return <Anim k="mig-home"><AppHome variant={variant} onCards={() => setStep('intro')} /></Anim>;

  if (step === 'intro')
    return <Anim k="mig-intro"><MigSplash onClose={() => setStep('home')} onPrimary={() => setStep('design')} onLater={() => setStep('home')} /></Anim>;

  if (step === 'design')
    return <Anim k="mig-design"><MigPicker onBack={() => setStep('intro')} onClose={() => setStep('home')} onChoose={(d) => { setDesign(d.id); setStep('compare'); }} /></Anim>;

  if (step === 'compare')
    return (
      <Anim k="mig-compare">
        <MigCompare variant={variant} design={design}
          onBack={() => setStep('design')} onClose={() => setStep('home')}
          onContinue={() => setStep(variant === 'A' ? 'debitos' : 'morph')} />
      </Anim>);

  if (step === 'debitos')
    return (
      <Anim k="mig-debitos">
        <MigDebitos variant={variant}
          onBack={() => setStep('compare')} onClose={() => setStep('home')}
          onVerMail={() => openMail('debitos')} onContinue={() => setStep('morph')} />
      </Anim>);

  if (step === 'morph')
    return <Anim k="mig-morph"><MorphCreate fromDesign="violeta" toDesign={design} replace onDone={() => setStep('ready')} /></Anim>;

  if (step === 'ready')
    return (
      <Anim k="mig-ready">
        <VirtualReady design={design} mask={NEW_MASK}
          onWallet={() => { setWalletAdded(true); setStep('wallet'); }}
          onSeeCard={() => setStep('hub')} onMenu={onMenu} />
      </Anim>);

  if (step === 'wallet')
    return (
      <Anim k="mig-wallet">
        <Screen scroll={false} bg="radial-gradient(120% 80% at 50% 38%, #1c1838 0%, #0a0a10 72%)">
          <div style={{ height: '100%' }} />
          <WalletAddOverlay open design={design} />
        </Screen>
      </Anim>);

  if (step === 'hub')
    return (
      <Anim k="mig-hub">
        <MigHub variant={variant} design={design} onBack={onMenu}
          onOldTap={() => setStep('old')} onNewTap={() => setStep('new')}
          onVerMail={() => openMail('hub')} />
      </Anim>);

  if (step === 'old')
    return (
      <Anim k="mig-old">
        <MigOldCard variant={variant}
          onBack={() => setStep('hub')} onClose={() => setStep('hub')}
          onGoNew={() => setStep('new')} onVerMail={() => openMail('old')} />
      </Anim>);

  if (step === 'new')
    return <Anim k="mig-new"><CardHome design={design} variant="virtual" title="Tarjeta prepaga virtual" mask={NEW_MASK} balance={1} startInWallet={walletAdded} onBack={() => setStep('hub')} onClose={() => setStep('hub')} /></Anim>;

  if (step === 'mail')
    return <Anim k="mig-mail"><MigEmail variant={variant} onBack={() => setStep(mailFrom || 'hub')} /></Anim>;

  return null;
}

Object.assign(window, { FlowMigracion, MigSplash, MigPicker, MigCompare, MigDebitos, MigEmail, MigHub, MigOldCard, MIG });
