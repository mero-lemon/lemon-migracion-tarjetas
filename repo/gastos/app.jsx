// Mis gastos — app raíz: home (mes en curso) + buscador, con skeleton
// de carga y splash de primer uso.
const { useState: useStateZ, useEffect: useEffectZ } = React;

function GastosExperience() {
  const [route, setRoute] = useStateZ('home'); // home | portfolio | miniapps | gastos | buscar
  const [gastosFrom, setGastosFrom] = useStateZ('home'); // desde dónde entraste a Mis gastos
  // los filtros del buscador viven acá: volver atrás no los pierde
  const [filters, setFilters] = useStateZ({ unit: 'month', anchor: dayStart(G_TODAY), cats: [], methods: [], text: '' });
  const [openMov, setOpenMov] = useStateZ(null);
  const [sheetOpen, setSheetOpen] = useStateZ(false);
  const [gastosLoading, setGastosLoading] = useStateZ(false);
  const [gastosSeen, setGastosSeen] = useStateZ(false);
  const [splash, setSplash] = useStateZ(false);
  const [toast, setToast] = useStateZ(null);

  // primera entrada a Mis gastos: skeleton breve → splash de primer uso
  const openGastos = (from) => {
    setGastosFrom(from);
    setRoute('gastos');
    if (!gastosSeen) {
      setGastosSeen(true);
      setGastosLoading(true);
      setTimeout(() => setGastosLoading(false), 750);
      setTimeout(() => setSplash(true), 1050);
    }
  };

  // entrar al buscador; catId opcional (tap en una barra del home)
  const openBuscar = (catId) => {
    if (catId) setFilters((f) => ({ ...f, unit: 'month', anchor: dayStart(G_TODAY), cats: [catId] }));
    setRoute('buscar');
  };
  const openMovement = (m) => { setOpenMov(m); setSheetOpen(true); };
  const flagCategory = () => {
    setSheetOpen(false);
    setToast('¡Gracias! Vamos a revisar la categoría 🙌');
    setTimeout(() => setToast(null), 2200);
  };

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      {route === 'home' &&
        <AppHome onPortfolio={() => setRoute('portfolio')} onMiniApps={() => setRoute('miniapps')} onGastos={() => openGastos('home')} />}

      {route === 'portfolio' &&
        <AppPortfolio onHome={() => setRoute('home')} onMiniApps={() => setRoute('miniapps')} />}

      {route === 'miniapps' &&
        <MiniAppsHome onHome={() => setRoute('home')} onPortfolio={() => setRoute('portfolio')} onOpenGastos={() => openGastos('miniapps')} />}

      {route === 'gastos' && (gastosLoading ?
        <GScreen>
          <div style={{ padding: '10px 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <GSkel w={150} h={26} r={10} />
            <GSkel w={40} h={40} r={999} />
          </div>
          <GSkeletonHome />
        </GScreen> :
        <MisGastosHome onBack={() => setRoute(gastosFrom)} onBuscar={openBuscar} onOpenMov={openMovement} />)}

      {route === 'buscar' &&
        <GastosBuscador filters={filters} setFilters={setFilters}
          onBack={() => setRoute('gastos')} onOpenMov={openMovement} />}

      <GMovSheet mov={openMov} open={sheetOpen} onClose={() => setSheetOpen(false)} onFlag={flagCategory} />
      <GastosSplash open={splash} onClose={() => setSplash(false)} onBuscar={() => { setSplash(false); openBuscar(); }} />
      {toast && <GToast text={toast} />}
    </div>);
}

// ── Marco del teléfono ──────────────────────────────────────────
function PhoneG({ scale, children }) {
  return (
    <div style={{ width: 402 * scale, height: 874 * scale, flexShrink: 0 }}>
      <div style={{ width: 402, height: 874, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <IOSDevice>{children}</IOSDevice>
      </div>
    </div>);
}

// ── Stage root ──────────────────────────────────────────────────
function GastosStage() {
  const [scale, setScale] = useStateZ(1);
  const [resetKey, setResetKey] = useStateZ(0);

  useEffectZ(() => {
    const calc = () => {
      const vw = window.innerWidth, vh = window.innerHeight;
      setScale(Math.min(1, (vh - 132) / 874, (vw - 48) / 402));
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#E6E5E1', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui' }}>
      {/* control strip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid #D6D5D0', background: '#EFEEEA', flexWrap: 'wrap' }}>
        <span style={{ width: 26, height: 26, borderRadius: 999, background: LX.dark, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Leaf size={15} color="var(--c-lime-40)" vein="rgba(0,0,0,0.3)" />
        </span>
        <div style={{ font: '600 13px Inter', color: '#2a2a28' }}>Mis gastos <span style={{ color: '#8a8985', fontWeight: 500 }}>· prototipo</span></div>
        <div style={{ font: '400 12px Inter', color: '#8a8985' }}>“Hoy” es el lunes 20/7/2026 · data seedeada, idéntica en cada run</div>

        <button onClick={() => setResetKey((k) => k + 1)} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #D0CFCA', background: '#fff', borderRadius: 999, padding: '6px 14px', cursor: 'pointer', font: '600 12px Inter', color: '#2a2a28' }}>
          <LI name="swap" size={14} color="#2a2a28" /> Reiniciar
        </button>
      </div>

      {/* body */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 24px 28px' }}>
        <PhoneG scale={scale}>
          <GastosExperience key={resetKey} />
        </PhoneG>
      </div>
    </div>);
}

ReactDOM.createRoot(document.getElementById('root')).render(<GastosStage />);
