// Menu screen, side-by-side Compare view, and the Stage root.
const { useState: useStateA, useEffect: useEffectA, useRef: useRefA } = React;

// ── Menu (initial chooser, lives inside the phone) ──────────────
function MenuScreen({ onPick }) {
  const sections = [
  { label: 'Tarjeta virtual', items: [
    { id: 'f1', icon: 'swap', bg: 'var(--c-lemon-5)', fg: 'var(--c-lemon-50)', t: 'Reemplazar la virtual de GP', s: 'Tenes una virtual de GP y querés una nueva (NFC).' },
    { id: 'f1b', icon: 'lemon-add', bg: 'var(--c-lemon-5)', fg: 'var(--c-lemon-50)', t: 'Crear tu primera virtual (Pomelo)', s: 'Ya tenés física y querés virtual.' }]
  },
  { label: 'Tarjeta física', items: [
    { id: 'pedirFisica', icon: 'celphone', bg: 'var(--c-greent-5)', fg: 'var(--c-greent-60)', t: 'Pedir física de Pomelo', s: 'Ya tengo virtual de Pomelo y quiero una física.' },
    { id: 'f4', icon: 'alert-time', bg: 'var(--c-orange-10)', fg: '#854600', t: 'Renovar física (por vencimiento)', s: 'Tu física actual de GP está por vencer y ya tenes la virtual de Pomelo.' },
    { id: 'f4b', icon: 'swap', bg: 'var(--c-nebula-5)', fg: 'var(--c-nebula-50)', t: 'Renovar física de GP (con virtual GP)', s: 'Tengo la virtual de GP: te ofrecemos la virtual NFC.' }]
  },
  { label: 'Sin tarjetas', items: [
    { id: 'f5', icon: 'card-on', bg: 'var(--c-nebula-5)', fg: 'var(--c-nebula-50)', t: 'Elegí tu tarjeta', s: 'Onboarding para usuarios sin ninguna.' }]
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
  const showReqToggle = view === 'pedirFisica' || view === 'f5' || view === 'f4' || view === 'f4b';

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
              <span style={{ font: '500 12px Inter', color: '#6a6965', whiteSpace: 'nowrap' }}>Requisito US$100:</span>
              <div style={{ display: 'flex', background: '#E0DFDA', borderRadius: 999, padding: 3 }}>
                {[['No cumple', false], ['Cumple', true]].map(([lbl, val]) =>
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
          {view === 'f1' && <Flow1 onMenu={toMenu} />}
          {view === 'f1b' && <Flow1 onMenu={toMenu} replace={false} />}
          {view === 'pedirFisica' && <Flow5 pomelo onMenu={toMenu} meets={meets} onMeet={() => setMeets(true)} />}
          {view === 'f4' && <Flow4 onMenu={toMenu} meets={meets} onMeet={() => setMeets(true)} />}
          {view === 'f4b' && <Flow4 onMenu={toMenu} meets={meets} onMeet={() => setMeets(true)} upsellVirtual />}
          {view === 'f5' && <Flow5 onMenu={toMenu} meets={meets} onMeet={() => setMeets(true)} />}
        </Phone>
      </div>
    </div>);

}

ReactDOM.createRoot(document.getElementById('root')).render(<Stage />);