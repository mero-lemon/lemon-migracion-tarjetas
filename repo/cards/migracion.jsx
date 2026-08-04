// ════════════════════════════════════════════════════════════════
// Migración de la virtual GP → Pomelo · experimento A/B
//   Camino A — "explícito": débitos automáticos como paso del flujo,
//              la vieja se apaga en 10 días (urgencia).
//   Camino B — "tranquilo": débitos como banner post-creación,
//              la vieja convive 30 días (sin fricción).
// Ambos comparten picker/morph/success de cards/; lo que cambia es
// la prominencia del mensaje de débitos y el plazo/copy del apagado.
// ════════════════════════════════════════════════════════════════
const { useState: useStateM, useEffect: useEffectM } = React;

// Parámetros del experimento (hoy simulado: lunes 4 de agosto)
const MIG = {
  A: { days: 10, offDate: '14 de agosto', urgente: true },
  B: { days: 30, offDate: '3 de septiembre', urgente: false }
};
const OLD_MASK = '•••• 4543';
const NEW_MASK = '•••• 2291';
const DEBITOS = [
  { icon: 'play-arrow', name: 'Netflix', detail: 'Se debita los 4 de cada mes', amount: '$ 12.999' },
  { icon: 'rewards', name: 'Spotify', detail: 'Se debita los 9 de cada mes', amount: '$ 6.499' },
  { icon: 'celphone', name: 'iCloud+', detail: 'Se debita los 15 de cada mes', amount: '$ 1.999' }];


// ── Banner de la home (punto de entrada) ────────────────────────
// A: urgente con countdown · B: novedad, mismo tono que el banner Apple Pay.
const MigHomeBanner = ({ variant, onClick }) => {
  const cfg = MIG[variant];
  if (cfg.urgente)
    return (
      <button onClick={onClick} style={{
        position: 'relative', overflow: 'hidden', width: '100%', textAlign: 'left', cursor: 'pointer', border: 0,
        borderRadius: 26, marginTop: 16, minHeight: 104, padding: '16px 52px 16px 122px',
        background: 'radial-gradient(120% 150% at 88% 8%, #3a3a44 0%, rgba(58,58,68,0) 46%), linear-gradient(100deg, #141414 0%, #23232a 55%, #2e2e36 100%)',
        boxShadow: '0 12px 26px rgba(10,10,14,0.36)'
      }}>
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '26%', pointerEvents: 'none', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)', animation: 'lc-shine 3s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', left: -24, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
          <div style={{ transform: 'rotate(-11deg)', filter: 'drop-shadow(0 7px 11px rgba(0,0,0,0.4))' }}><CardArt design="violeta" width={74} faded /></div>
          <div style={{ transform: 'rotate(9deg)', marginLeft: -42, filter: 'drop-shadow(0 7px 11px rgba(0,0,0,0.4))' }}><CardArt design="tetrish" width={74} /></div>
        </div>
        <div style={{ position: 'relative' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#CFFF2E', color: '#0b1a00', font: '700 10px Inter', letterSpacing: '0.05em', padding: '3px 9px', borderRadius: 999 }}>
            <LI name="alert-time" size={11} color="#0b1a00" /> SE APAGA EN {cfg.days} DÍAS
          </span>
          <div style={{ font: '800 18px Inter', color: '#fff', lineHeight: 1.12, marginTop: 8 }}>Cambiá tu tarjeta virtual hoy</div>
          <div style={{ font: '500 13px Inter', color: 'rgba(255,255,255,0.72)', marginTop: 3, lineHeight: 1.3 }}>Tu tarjeta actual deja de funcionar el {cfg.offDate}.</div>
        </div>
        <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: 999, background: 'rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LI name="arrow-foward" size={16} color="#fff" />
        </span>
      </button>);

  return (
    <button onClick={onClick} style={{
      position: 'relative', overflow: 'hidden', width: '100%', textAlign: 'left', cursor: 'pointer', border: 0,
      borderRadius: 26, marginTop: 16, minHeight: 104, padding: '16px 52px 16px 122px',
      background: 'radial-gradient(120% 150% at 88% 8%, #EEFF7A 0%, rgba(238,255,122,0) 46%), linear-gradient(100deg, #5AC005 0%, #8CE617 50%, #B7F53A 100%)',
      boxShadow: '0 12px 26px rgba(120,200,20,0.36)'
    }}>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '26%', pointerEvents: 'none', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)', animation: 'lc-shine 3s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', left: -24, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
        <div style={{ transform: 'rotate(-11deg)', filter: 'drop-shadow(0 7px 11px rgba(0,0,0,0.26))' }}><CardArt design="tetrish" width={74} /></div>
        <div style={{ transform: 'rotate(9deg)', marginLeft: -42, filter: 'drop-shadow(0 7px 11px rgba(0,0,0,0.26))' }}><CardArt design="green" width={74} /></div>
      </div>
      <div style={{ position: 'relative' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(8,20,0,0.16)', color: '#0b1a00', font: '700 10px Inter', letterSpacing: '0.05em', padding: '3px 9px', borderRadius: 999 }}>
          <LI name="lemon-add" size={11} color="#0b1a00" /> NUEVA LEMON CARD
        </span>
        <div style={{ font: '800 18px Inter', color: '#0b1a00', lineHeight: 1.12, marginTop: 8 }}>Llegó tu nueva tarjeta virtual</div>
        <div style={{ font: '500 13px Inter', color: 'rgba(11,26,0,0.78)', marginTop: 3, lineHeight: 1.3 }}>Cambiala gratis, con el diseño que quieras.</div>
      </div>
      <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: 999, background: 'rgba(8,20,0,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LI name="arrow-foward" size={16} color="#0b1a00" />
      </span>
    </button>);
};

// ── Intro (primera pantalla del flujo) ──────────────────────────
function MigIntro({ variant, onBack, onPrimary, onLater }) {
  const cfg = MIG[variant];
  const [up, setUp] = useStateM(false);
  useEffectM(() => { const t = setTimeout(() => setUp(true), 80); return () => clearTimeout(t); }, []);
  return (
    <Screen bg="#FFFFFF" footer={
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, opacity: up ? 1 : 0, transition: 'opacity .5s .45s' }}>
        <Btn variant="primary" onClick={onPrimary}>Cambiar mi tarjeta</Btn>
        <Btn variant="light" onClick={onLater}>Ahora no</Btn>
      </div>
    }>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', height: 52 }}>
        <button onClick={onBack} style={{ border: 0, background: 'transparent', cursor: 'pointer', width: 40, height: 40 }}>
          <LI name="close" size={22} color="#141414" />
        </button>
      </div>
      <div style={{ padding: '4px 24px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ transform: up ? 'translateY(0) scale(1)' : 'translateY(60px) scale(0.9)', opacity: up ? 1 : 0, transition: `transform .8s ${SPRING}, opacity .5s` }}>
          <div style={{ animation: 'lc-float 3.8s ease-in-out infinite' }}><CardArt design="tetrish" width={250} glow /></div>
        </div>
        <div style={{ textAlign: 'left', width: '100%', marginTop: 26, opacity: up ? 1 : 0, transform: up ? 'none' : 'translateY(14px)', transition: 'opacity .5s .2s, transform .6s .2s' }}>
          <div style={{ font: '500 30px Geist', letterSpacing: '-0.015em', lineHeight: 1.15, color: '#080808' }}>
            {cfg.urgente ? 'Es hora de cambiar tu tarjeta virtual' : 'Llegó tu nueva tarjeta virtual'}
          </div>
          <div style={{ font: '400 14px Inter', color: 'rgba(8,8,8,0.6)', marginTop: 12, lineHeight: 1.55 }}>
            {cfg.urgente ?
              <>Mejoramos la tecnología detrás de tu Lemon Card. Creá la nueva hoy: tu tarjeta actual <b style={{ color: '#080808' }}>deja de funcionar el {cfg.offDate}</b> — quedan {cfg.days} días.</> :
              <>Mejoramos la tecnología detrás de tu Lemon Card. Cambiala cuando quieras: tu tarjeta actual sigue funcionando como siempre hasta el <b style={{ color: '#080808' }}>{cfg.offDate}</b>.</>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 22 }}>
            <SplashFeature icon="pallete-color" title="Elegís el diseño" tag="Nuevo" sub="Tu tarjeta, con la piel que quieras." />
            <SplashFeature icon="click-to-pay" title="Compatible con Apple Pay" sub="Pagá apoyando el celu en cualquier posnet." />
            <SplashFeature icon="currency-bitcoin" title="Mismo cashback de siempre" sub="Seguís ganando cripto en cada compra." />
          </div>
        </div>
      </div>
    </Screen>);
}

// ── Comparativa vieja → nueva (pre-creación) ────────────────────
// Diseño "Ingreso datos extras": dos tiles con flecha. En A suma el banner
// lime de débitos + plazo (el mensaje va AL FRENTE); en B es una nota suave.
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
          // A · débitos AL FRENTE: banner lime del diseño, con plazo + mail.
          <div style={{ background: '#CFFF2E', borderRadius: 24, padding: 16 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <LI name="alert-time" size={19} color="#080808" style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ font: '400 14px Inter', color: '#080808', lineHeight: 1.55 }}>
                Tu tarjeta {OLD_MASK} <b>se apaga el {cfg.offDate}</b> — quedan {cfg.days} días. Si tenés débitos automáticos asociados, van a dejar de funcionar: en el próximo paso te mostramos cuáles son.
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
function MigDebitos({ variant, onBack, onClose, onVerMail, onContinue }) {
  const cfg = MIG[variant];
  return (
    <Screen footer={<Btn variant="primary" onClick={onContinue}>Entendido, crear mi tarjeta</Btn>}>
      <StepHeader title="Débitos automáticos" onBack={onBack} onClose={onClose} />
      <div style={{ padding: '6px 16px 8px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <div style={{ font: '500 24px Geist', letterSpacing: '-0.02em', color: LX.text1, lineHeight: 1.25 }}>Tenés {DEBITOS.length} débitos asociados a tu tarjeta actual</div>
          <div style={{ font: '400 14px Inter', color: LX.text2, marginTop: 6, lineHeight: 1.5 }}>
            Cuando la {OLD_MASK} se apague el <b style={{ color: LX.text1 }}>{cfg.offDate}</b>, estos pagos van a dejar de procesarse. Cargá los datos de tu nueva tarjeta en cada servicio.
          </div>
        </div>

        <Surface pad={0} style={{ overflow: 'hidden' }}>
          {DEBITOS.map((d, i) =>
            <React.Fragment key={d.name}>
              {i > 0 && <Divider style={{ margin: '0 16px' }} />}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px' }}>
                <div style={{ width: 36, height: 36, borderRadius: 999, background: LX.layer3, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <LI name={d.icon} size={18} color={LX.text1} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: '600 14px Inter', color: LX.text1 }}>{d.name}</div>
                  <div style={{ font: '400 12px Inter', color: LX.text2, marginTop: 1 }}>{d.detail}</div>
                </div>
                <span style={{ font: '500 14px Geist', color: LX.text1 }}>{d.amount}</span>
              </div>
            </React.Fragment>)}
        </Surface>

        <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start', background: LX.layer3, borderRadius: 14, padding: '13px 14px' }}>
          <LI name="view-notification" size={18} color={LX.text2} style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ font: '600 13px Inter', color: LX.text1 }}>Te mandamos esta lista por mail</div>
            <div style={{ font: '400 12px Inter', color: LX.text2, marginTop: 2, lineHeight: 1.4 }}>
              Apenas crees tu nueva tarjeta te llega un mail con el detalle y los datos nuevos, para tenerlo a mano.
            </div>
            <button onClick={onVerMail} style={{ marginTop: 8, border: 0, cursor: 'pointer', borderRadius: 999, padding: '7px 13px', background: LX.dark, color: '#fff', font: '600 12px Inter' }}>
              Ver el mail que te llega
            </button>
          </div>
        </div>
      </div>
    </Screen>);
}

// ── Mail de débitos (preview) ───────────────────────────────────
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
        {/* header verde de la pieza */}
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
// Diseño lote 2: tarjeta al 30%, Pausar/Ver datos deshabilitados,
// banner amarillo con el plazo, movimientos de siempre.
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
              <>Seguís pudiendo pagar con ella hasta ese día, pero ya no podés ver sus datos. Si tenés débitos automáticos, pasalos ya a tu nueva tarjeta.</> :
              <>Seguís pudiendo pagar con ella hasta ese día, pero ya no podés ver sus datos. Cuando quieras, pasá tus débitos automáticos a la nueva.</>}
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
            <MoveRow icon="card-on" coin="btc" title="Netflix · débito automático" date="4 de agosto" amount="$ 12.999" />
            <MoveRow icon="card-on" title="Pago con tarjeta" date="2 de agosto" amount="$ 8.150" />
            <MoveRow icon="card-on" title="Spotify · débito automático" date="9 de julio" amount="$ 6.499" />
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
    return (
      <Anim k="mig-home">
        <AppHome onCards={() => setStep('intro')} banner={<MigHomeBanner variant={variant} onClick={() => setStep('intro')} />} />
      </Anim>);

  if (step === 'intro')
    return <Anim k="mig-intro"><MigIntro variant={variant} onBack={() => setStep('home')} onPrimary={() => setStep('design')} onLater={() => setStep('home')} /></Anim>;

  if (step === 'design')
    return <Anim k="mig-design"><DesignPicker headline="Elegí el diseño" onBack={() => setStep('intro')} onClose={() => setStep('home')} onChoose={(d) => { setDesign(d.id); setStep('compare'); }} /></Anim>;

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

Object.assign(window, { FlowMigracion, MigHomeBanner, MigIntro, MigCompare, MigDebitos, MigEmail, MigHub, MigOldCard, MIG });
