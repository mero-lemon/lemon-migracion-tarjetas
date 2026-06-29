// Menu screen, side-by-side Compare view, and the Stage root.
const { useState: useStateA, useEffect: useEffectA, useRef: useRefA } = React;

// ── Menu (initial chooser, lives inside the phone) ──────────────
function MenuScreen({ onPick }) {
  const sections = [
  { label: 'Sin tarjetas', items: [
    { id: 'f5', icon: 'card-on', bg: 'var(--c-nebula-5)', fg: 'var(--c-nebula-50)', t: 'No tengo ninguna', s: 'Onboarding: elegir mi primera tarjeta.' }]
  },
  { label: 'Todavía en GP · te ofrecemos NFC', items: [
    { id: 'f1', icon: 'swap', bg: 'var(--c-lemon-5)', fg: 'var(--c-lemon-50)', t: 'Tengo virtual GP', s: 'La cambio por la virtual NFC (Pomelo).' },
    { id: 'f1b', icon: 'lemon-add', bg: 'var(--c-lemon-5)', fg: 'var(--c-lemon-50)', t: 'Tengo solo física GP', s: 'Creo mi primera virtual con NFC.' },
    { id: 'f4b', icon: 'alert-time', bg: 'var(--c-orange-10)', fg: '#854600', t: 'Se vence mi física GP · sin NFC', s: 'Pido la física nueva y activo NFC en la virtual.' }]
  },
  { label: 'Ya en Pomelo · ya tenés NFC', items: [
    { id: 'pedirFisica', icon: 'celphone', bg: 'var(--c-greent-5)', fg: 'var(--c-greent-60)', t: 'Tengo virtual Pomelo', s: 'Pido mi física (ya tengo NFC).' },
    { id: 'f4', icon: 'swap', bg: 'var(--c-nebula-5)', fg: 'var(--c-nebula-50)', t: 'Se vence mi física GP · con NFC', s: 'Solo renuevo la física, sin upsell de NFC.' }]
  }];

  return (
    <Screen>
      <div style={{ padding: '8px 16px 24px' }}>
        {/* brand row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0 18px' }}>
          <span style={{ width: 34, height: 34, borderRadius: 999, background: LX.dark, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Leaf size={20} color="var(--c-lime-40)" vein="rgba(0,0,0,0.3)" />
          </span>
          <span style={{ font: '600 14px Inter', color: LX.text1 }}>Lemon</span>
          <span style={{ marginLeft: 'auto', font: '600 13px Inter', color: LX.text2, background: LX.layer3, padding: '5px 12px', borderRadius: 999 }}>$mica</span>
        </div>

        <div style={{ font: '500 30px Geist', letterSpacing: '-0.02em', color: LX.text1 }}>Elegí un flujo</div>
        <div style={{ font: '400 14px Inter', color: LX.text2, marginTop: 6 }}>Prototipo · migración de tarjetas</div>

        {sections.map((sec) =>
        <div key={sec.label} style={{ marginTop: 22 }}>
            <div style={{ font: '700 11px Inter', letterSpacing: '0.06em', textTransform: 'uppercase', color: LX.text3, margin: '0 2px 10px' }}>{sec.label}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sec.items.map((o) =>
            <button key={o.id} onClick={() => onPick(o.id)} style={{
              display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', cursor: 'pointer',
              background: LX.layer, border: `1px solid ${LX.border}`, borderRadius: 16, padding: 14
            }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: o.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <LI name={o.icon} size={22} color={o.fg} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ font: '600 15px Inter', color: LX.text1 }}>{o.t}</div>
                    <div style={{ font: '400 13px Inter', color: LX.text2, marginTop: 2, lineHeight: 1.35 }}>{o.s}</div>
                  </div>
                  <LI name="arrow-foward" size={18} color={LX.text3} />
                </button>
            )}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 22, font: '400 12px Inter', color: LX.text3, justifyContent: 'center' }}>
          <LI name="user" size={13} color={LX.text3} /> Datos de ejemplo · Micaela · Malabia 1720
        </div>
      </div>
    </Screen>);

}

// ── Phone shell ─────────────────────────────────────────────────
function Phone({ scale, children }) {
  return (
    <div style={{ width: 402 * scale, height: 874 * scale, flexShrink: 0 }}>
      <div style={{ width: 402, height: 874, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <IOSDevice>{children}</IOSDevice>
      </div>
    </div>);

}

// ── App home (home real de la app) ──────────────────────────────
// Entrada de los usuarios "Todavía en GP": ven su home con el banner de la
// nueva virtual + Apple Pay; al tocarlo entran al flujo de tarjetas.
function AppHome({ onCards, bannerVariant = 'applepay' }) {
  const navIcons = ['home-on', 'portfolio-off', 'market-off', 'activity-off', 'mini-apps-off'];
  const expiring = bannerVariant === 'expiring';
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
        {/* balance card: una sola card radius 32 (tabs + saldo + botones); la lime asoma detrás */}
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'relative', zIndex: 2, background: LX.layer, borderRadius: 32, overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
            {/* tabs Inicio / Portfolio (labels 12px; Portfolio lime arriba-derecha) */}
            <div style={{ display: 'flex' }}>
              <div style={{ flex: 1, textAlign: 'center', font: '500 12px Inter', color: '#141414', padding: '14px 0' }}>Inicio</div>
              <div style={{ flex: 1, textAlign: 'center', font: '500 12px Inter', color: '#141414', padding: '14px 0', background: 'var(--c-lime-40)', borderRadius: '0 32px 0 24px' }}>Portfolio</div>
            </div>
            {/* saldo */}
            <div style={{ padding: '20px 24px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ font: '500 16px Inter', color: '#818181', letterSpacing: '-0.1px' }}>Pesos digitales</span>
                <LI name="view-balance-on" size={18} color="#818181" />
              </div>
              <div style={{ font: '500 44px Geist', lineHeight: '52px', letterSpacing: '-0.03em', color: '#141414', marginTop: 6 }}>$ 1.487.283</div>
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

          {/* card lime asomando por detrás (Tarjeta virtual) */}
          <div style={{ position: 'relative', zIndex: 1, marginTop: -86, padding: '94px 20px 18px', borderRadius: 32, overflow: 'hidden', background: 'var(--c-lime-40)' }}>
            <div style={{ position: 'absolute', inset: 0, opacity: 0.4, mixBlendMode: 'multiply', background: 'radial-gradient(80% 120% at 12% 130%, #9be01f 0%, transparent 55%), radial-gradient(70% 120% at 95% 130%, #e6ff8a 0%, transparent 52%)' }} />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div>
                <div style={{ font: '500 14px Inter', color: '#080808', letterSpacing: '-0.1px' }}>Tarjeta virtual</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
                  <span style={{ display: 'flex', gap: 2 }}><span style={{ width: 4, height: 4, borderRadius: 999, background: '#080808' }} /><span style={{ width: 4, height: 4, borderRadius: 999, background: '#080808' }} /></span>
                  <span style={{ font: '400 12px Inter', color: '#080808' }}>1234</span>
                </div>
              </div>
              <VisaMark size={22} color="#141414" shadow={false} />
            </div>
          </div>
        </div>

        {/* banner actionable (con X): vencimiento de la física o Apple Pay */}
        <button onClick={onCards} style={{ position: 'relative', width: '100%', textAlign: 'left', cursor: 'pointer', border: 0, background: LX.layer, borderRadius: 24, padding: '12px 16px 12px 12px', marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 8px rgba(8,8,9,0.05)' }}>
          <div style={{ display: 'flex', flexShrink: 0 }}>
            {expiring ?
            <div style={{ transform: 'rotate(-6deg)' }}><CardArt variant="fisica" width={56} faded /></div> :
            <>
              <div style={{ transform: 'rotate(-10deg)' }}><CardArt design="tetrish" width={52} /></div>
              <div style={{ transform: 'rotate(8deg)', marginLeft: -20 }}><CardArt design="green" width={52} /></div>
            </>}
          </div>
          <div style={{ flex: 1, minWidth: 0, paddingRight: 16 }}>
            <div style={{ font: '500 12px Geist', color: '#141414', lineHeight: 1.3 }}>{expiring ? 'Tu Lemon Card física vence pronto' : '¡Ya podés pagar con Apple Pay!'}</div>
            <div style={{ font: '400 12px Inter', color: '#818181', marginTop: 2, lineHeight: 1.35 }}>{expiring ? 'Renovala antes de que venza para seguir usándola sin cortes.' : 'Cambiá tu tarjeta virtual y empezá a pagar con tu wallet de Apple.'}</div>
          </div>
          <span onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', top: 12, right: 12, width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LI name="close" size={16} color="#141414" />
          </span>
        </button>
      </div>
    </Screen>);

}

// Wrapper: muestra la home de la app y, al tocar el banner, entra al flujo.
function GpHomeEntry({ flow, bannerVariant }) {
  const [entered, setEntered] = useStateA(false);
  if (!entered) return <AppHome onCards={() => setEntered(true)} bannerVariant={bannerVariant} />;
  return flow(() => setEntered(false));
}

// ── Stage root ──────────────────────────────────────────────────
function Stage() {
  const [view, setView] = useStateA('menu'); // menu | f1 | f2 | f3 | compare
  const [meets, setMeets] = useStateA(false);
  const [scale, setScale] = useStateA(1);
  const [cScale, setCScale] = useStateA(0.6);

  useEffectA(() => {
    const calc = () => {
      const vw = window.innerWidth,vh = window.innerHeight;
      setScale(Math.min(1, (vh - 132) / 874, (vw - 48) / 402));
      setCScale(Math.min(0.92, (vh - 150) / 874, (vw - 96) / 2 / 402));
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  const toMenu = () => setView('menu');
  const showReqToggle = view === 'f4' || view === 'f4b';

  return (
    <div style={{ minHeight: '100vh', background: '#E6E5E1', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui' }}>
      {/* control strip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid #D6D5D0', background: '#EFEEEA', flexWrap: 'wrap' }}>
        <span style={{ width: 26, height: 26, borderRadius: 999, background: LX.dark, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Leaf size={15} color="var(--c-lime-40)" vein="rgba(0,0,0,0.3)" />
        </span>
        <div style={{ font: '600 13px Inter', color: '#2a2a28' }}>Migración de tarjetas <span style={{ color: '#8a8985', fontWeight: 500 }}>· prototipo</span></div>

        {view !== 'menu' &&
        <button onClick={toMenu} style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #D0CFCA', background: '#fff', borderRadius: 999, padding: '6px 14px', cursor: 'pointer', font: '600 12px Inter', color: '#2a2a28' }}>
            <LI name="arrow-back" size={14} color="#2a2a28" /> Menú
          </button>
        }

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          {showReqToggle &&
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ font: '500 12px Inter', color: '#6a6965', whiteSpace: 'nowrap' }}>Renovación física:</span>
              <div style={{ display: 'flex', background: '#E0DFDA', borderRadius: 999, padding: 3 }}>
                {[['No paga', false], ['Paga', true]].map(([lbl, val]) =>
              <button key={lbl} onClick={() => setMeets(val)} style={{
                border: 0, cursor: 'pointer', borderRadius: 999, padding: '5px 13px', font: '600 12px Inter',
                background: meets === val ? '#fff' : 'transparent', color: meets === val ? '#2a2a28' : '#8a8985',
                boxShadow: meets === val ? '0 1px 2px rgba(0,0,0,0.08)' : 'none', whiteSpace: 'nowrap'
              }}>{lbl}</button>
              )}
              </div>
            </div>
          }
        </div>
      </div>

      {/* body */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 24px 28px', gap: 28, flexWrap: 'wrap' }}>
        <Phone scale={scale}>
          {view === 'menu' && <MenuScreen onPick={setView} />}
          {view === 'f1' && <GpHomeEntry flow={(toHome) => <Flow1 onMenu={toHome} />} />}
          {view === 'f1b' && <GpHomeEntry flow={(toHome) => <Flow1 onMenu={toHome} replace={false} />} />}
          {view === 'pedirFisica' && <Flow5 pomelo onMenu={toMenu} meets={meets} onMeet={() => setMeets(true)} />}
          {view === 'f4' && <Flow4 onMenu={toMenu} meets={meets} onMeet={() => setMeets(true)} />}
          {view === 'f4b' && <GpHomeEntry bannerVariant="expiring" flow={(toHome) => <Flow4 onMenu={toHome} meets={meets} onMeet={() => setMeets(true)} upsellVirtual />} />}
          {view === 'f5' && <Flow5 onMenu={toMenu} meets={meets} onMeet={() => setMeets(true)} />}
        </Phone>
      </div>
    </div>);

}

ReactDOM.createRoot(document.getElementById('root')).render(<Stage />);