// Shell del prototipo "Migración virtual GP → Pomelo · Test A/B".
// Solo dos entradas: Camino A (débitos al frente · 10 días) y
// Camino B (convivencia tranquila · 30 días). Los flujos viven en migracion.jsx.
const { useState: useStateA, useEffect: useEffectA } = React;

// screen transition wrapper (plain — ver nota en el proto de cards/)
const Anim = ({ children, k, noWrap }) =>
noWrap ? children : <div key={k} style={{ height: '100%' }}>{children}</div>;

// ── Menu (elegir el camino a testear) ───────────────────────────
function MenuScreen({ onPick }) {
  const items = [
  { id: 'migA', icon: 'alert-time', bg: 'var(--c-orange-10)', fg: '#854600', t: 'Camino A · Débitos al frente', s: 'El aviso de débitos es un paso del flujo · la vieja se apaga en 10 días.' },
  { id: 'migB', icon: 'swap', bg: 'var(--c-greent-5)', fg: 'var(--c-greent-60)', t: 'Camino B · Convivencia tranquila', s: 'El aviso es un banner post-creación · la vieja convive 30 días.' }];

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

        <div style={{ font: '500 30px Geist', letterSpacing: '-0.02em', color: LX.text1, lineHeight: 1.15 }}>Migración de la virtual</div>
        <div style={{ font: '400 14px Inter', color: LX.text2, marginTop: 6 }}>Test A/B · GP → Pomelo · elegí el camino a probar</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 22 }}>
          {items.map((o) =>
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

        {/* qué comparar entre caminos (guía para el que corre el test) */}
        <div style={{ marginTop: 22, background: LX.layer3, borderRadius: 14, padding: '13px 14px' }}>
          <div style={{ font: '700 11px Inter', letterSpacing: '0.06em', textTransform: 'uppercase', color: LX.text3 }}>Qué cambia entre caminos</div>
          <div style={{ font: '400 12px Inter', color: LX.text2, marginTop: 6, lineHeight: 1.55 }}>
            La prominencia del aviso de débitos automáticos (paso del flujo vs banner) y el plazo de apagado de la tarjeta vieja (10 vs 30 días). Todo lo demás es idéntico.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 18, font: '400 12px Inter', color: LX.text3, justifyContent: 'center' }}>
          <LI name="user" size={13} color={LX.text3} /> Datos de ejemplo · Micaela · hoy = 4 de agosto
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
// Punto de entrada del test: la home con el banner de migración (A o B).
function AppHome({ onCards, banner }) {
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
        {/* balance card: una sola card radius 32 (tabs + saldo + botones); la lime asoma detrás */}
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'relative', zIndex: 2, background: LX.layer, borderRadius: 32, overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
            {/* tabs Inicio / Portfolio */}
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
                  <span style={{ font: '400 12px Inter', color: '#080808' }}>4543</span>
                </div>
              </div>
              <VisaMark size={22} color="#141414" shadow={false} />
            </div>
          </div>
        </div>

        {/* banner de migración (lo trae el flujo: urgente en A, novedad en B) */}
        {banner}
      </div>
    </Screen>);

}

// ── Stage root ──────────────────────────────────────────────────
function Stage() {
  const [view, setView] = useStateA('menu'); // menu | migA | migB
  const [scale, setScale] = useStateA(1);

  useEffectA(() => {
    const calc = () => {
      const vw = window.innerWidth, vh = window.innerHeight;
      setScale(Math.min(1, (vh - 132) / 874, (vw - 48) / 402));
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  const toMenu = () => setView('menu');

  return (
    <div style={{ minHeight: '100vh', background: '#E6E5E1', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui' }}>
      {/* control strip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid #D6D5D0', background: '#EFEEEA', flexWrap: 'wrap' }}>
        <span style={{ width: 26, height: 26, borderRadius: 999, background: LX.dark, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Leaf size={15} color="var(--c-lime-40)" vein="rgba(0,0,0,0.3)" />
        </span>
        <div style={{ font: '600 13px Inter', color: '#2a2a28' }}>Migración virtual GP → Pomelo <span style={{ color: '#8a8985', fontWeight: 500 }}>· test A/B</span></div>

        {view !== 'menu' &&
        <>
          <button onClick={toMenu} style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #D0CFCA', background: '#fff', borderRadius: 999, padding: '6px 14px', cursor: 'pointer', font: '600 12px Inter', color: '#2a2a28' }}>
            <LI name="arrow-back" size={14} color="#2a2a28" /> Menú
          </button>
          <span style={{ font: '600 12px Inter', color: '#8a8985' }}>
            {view === 'migA' ? 'Camino A · débitos al frente · 10 días' : 'Camino B · convivencia · 30 días'}
          </span>
        </>
        }
      </div>

      {/* body */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 24px 28px', gap: 28 }}>
        <Phone scale={scale}>
          {view === 'menu' && <MenuScreen onPick={setView} />}
          {view === 'migA' && <FlowMigracion variant="A" onMenu={toMenu} />}
          {view === 'migB' && <FlowMigracion variant="B" onMenu={toMenu} />}
        </Phone>
      </div>
    </div>);

}

Object.assign(window, { Anim, AppHome, Phone, MenuScreen });
ReactDOM.createRoot(document.getElementById('root')).render(<Stage />);
