// Mis gastos — app raíz: home (mes en curso) + buscador, con skeleton
// de carga y splash de primer uso.
const { useState: useStateZ, useEffect: useEffectZ } = React;

function GastosExperience({ initialRoute = 'home', introSeen = false }) {
  const [route, setRoute] = useStateZ(initialRoute); // home | portfolio | miniapps | gastos | buscar
  const [gastosFrom, setGastosFrom] = useStateZ('home'); // desde dónde entraste a Tus gastos
  // los filtros del buscador viven acá: volver atrás no los pierde
  const [filters, setFilters] = useStateZ({ unit: 'month', anchor: dayStart(G_TODAY), cats: [], methods: [], curs: [], text: '' });
  const [openMov, setOpenMov] = useStateZ(null);
  const [sheetOpen, setSheetOpen] = useStateZ(false);
  const [recatOpen, setRecatOpen] = useStateZ(false);
  const [gastosLoading, setGastosLoading] = useStateZ(false);
  const [gastosSeen, setGastosSeen] = useStateZ(introSeen);
  const [splash, setSplash] = useStateZ(false);
  const [toast, setToast] = useStateZ(null);
  // sube al recategorizar/crear categoría → home y buscador recalculan
  const [dataVersion, setDataVersion] = useStateZ(0);
  // objetivo del mes (opcional): total + por categoría. null/{} = usar promedio
  const [goals, setGoals] = useStateZ({ total: null, byCat: {} });
  const [goalsOpen, setGoalsOpen] = useStateZ(false);
  // el banner de novedad se puede cerrar (X), como en la app real
  const [promoOff, setPromoOff] = useStateZ(false);

  // primera entrada a Tus gastos: el splash sube ya (con el skeleton
  // pintándose detrás) y la sección recién se carga cuando lo cerrás
  const openGastos = (from) => {
    setGastosFrom(from);
    setRoute('gastos');
    if (!gastosSeen) {
      setGastosSeen(true);
      setGastosLoading(true);
      setTimeout(() => setSplash(true), 60);
    }
  };
  const closeSplash = () => {
    setSplash(false);
    // el home entra con su coreografía apenas el splash termina de bajar
    setTimeout(() => setGastosLoading(false), 200);
  };

  // entrar al buscador con un filtro precargado (tap en una barra o en un
  // grupo de moneda). patch = { cats:[...] } | { curs:[...] } | undefined.
  const openBuscar = (patch) => {
    if (patch) setFilters({ unit: 'month', anchor: dayStart(G_TODAY), cats: [], methods: [], curs: [], text: '', ...patch });
    setRoute('buscar');
  };
  const openMovement = (m) => { setOpenMov(m); setSheetOpen(true); };
  // recategorizar: se abre encima del detalle; cancelar vuelve al detalle
  const openRecat = () => { setSheetOpen(false); setRecatOpen(true); };
  const cancelRecat = () => { setRecatOpen(false); setSheetOpen(true); };
  const applyRecat = (catId, scope) => {
    recategorize(openMov, catId, scope);
    setRecatOpen(false);
    const cat = G_CAT[catId];
    const merchant = openMov.name.replace(/^(Transferencia a |Transferencia — |Recarga )/, '');
    setToast(scope === 'all' ?
      `Listo. Movimos todos los consumos de ${merchant} a ${cat.name} 🙌` :
      `Listo. Movimos este movimiento a ${cat.name} 🙌`);
    setDataVersion((v) => v + 1);
    setTimeout(() => setToast(null), 2800);
  };
  const saveGoals = (g) => {
    setGoals(g);
    setGoalsOpen(false);
    const any = g.total || (g.byCat && Object.keys(g.byCat).length);
    setToast(any ? '¡Listo! Guardamos tus objetivos 🎯' : 'Volviste a tu promedio de 3 meses');
    setTimeout(() => setToast(null), 2400);
  };

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      {route === 'home' &&
        <AppHome onPortfolio={() => setRoute('portfolio')} onMiniApps={() => setRoute('miniapps')} onGastos={() => openGastos('home')}
          promoOff={promoOff} onClosePromo={() => setPromoOff(true)} />}

      {route === 'portfolio' &&
        <AppPortfolio onHome={() => setRoute('home')} onMiniApps={() => setRoute('miniapps')} />}

      {route === 'miniapps' &&
        <MiniAppsHome onHome={() => setRoute('home')} onPortfolio={() => setRoute('portfolio')} onOpenGastos={() => openGastos('miniapps')}
          promoOff={promoOff} onClosePromo={() => setPromoOff(true)} />}

      {route === 'gastos' && (gastosLoading ?
        <GScreen>
          <div style={{ padding: '10px 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <GSkel w={150} h={26} r={10} />
            <GSkel w={40} h={40} r={999} />
          </div>
          <GSkeletonHome />
        </GScreen> :
        <MisGastosHome onBack={() => setRoute(gastosFrom)} onBuscar={openBuscar} onOpenMov={openMovement} dataVersion={dataVersion} goals={goals} onEditGoals={() => setGoalsOpen(true)} />)}

      {route === 'buscar' &&
        <GastosBuscador filters={filters} setFilters={setFilters}
          onBack={() => setRoute('gastos')} onOpenMov={openMovement} dataVersion={dataVersion} />}

      <GMovSheet mov={openMov} open={sheetOpen} onClose={() => setSheetOpen(false)} onRecat={openRecat} />
      <GRecategorizeSheet mov={openMov} open={recatOpen} onClose={cancelRecat} onApply={applyRecat} />
      <GGoalsSheet open={goalsOpen} goals={goals} onClose={() => setGoalsOpen(false)} onSave={saveGoals} />
      <GastosSplash open={splash} onClose={closeSplash} onBuscar={() => { closeSplash(); openBuscar(); }} />
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
  const [scenario, setScenario] = useStateZ('jul');
  const [visited, setVisited] = useStateZ(false); // ya pasó el intro alguna vez

  useEffectZ(() => {
    const calc = () => {
      const vw = window.innerWidth, vh = window.innerHeight;
      setScale(Math.min(1, (vh - 132) / 874, (vw - 48) / 402));
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  // cambiar de mes = cambiar de caso: recalibra la data y entra directo a la
  // sección (el contador fuerza el remount aunque toques el mes ya activo)
  const [jump, setJump] = useStateZ(0);
  const pickScenario = (id) => {
    setGastosScenario(id);
    setScenario(id);
    setVisited(true);
    setJump((j) => j + 1);
  };
  const reset = () => {
    setGastosScenario('jul');
    setScenario('jul');
    setVisited(false);
    setResetKey((k) => k + 1);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#E6E5E1', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui' }}>
      {/* control strip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid #D6D5D0', background: '#EFEEEA', flexWrap: 'wrap' }}>
        <span style={{ width: 26, height: 26, borderRadius: 999, background: LX.dark, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Leaf size={15} color="var(--c-lime-40)" vein="rgba(0,0,0,0.3)" />
        </span>
        <div style={{ font: '600 13px Inter', color: '#2a2a28' }}>Tus gastos <span style={{ color: '#8a8985', fontWeight: 500 }}>· prototipo</span></div>
        <div style={{ font: '400 12px Inter', color: '#8a8985' }}>“Hoy” es el {G_TODAY.getDate()}/{G_TODAY.getMonth() + 1}/2026 · data seedeada, idéntica en cada run</div>

        {/* selector de escenarios: un mes por caso de la carrera */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, background: '#fff', border: '1px solid #D0CFCA', borderRadius: 999, padding: 3 }}>
          {G_SCENARIOS.map((s) =>
            <button key={s.id} onClick={() => pickScenario(s.id)} title={s.caso} style={{
              border: 0, borderRadius: 999, padding: '5px 11px', cursor: 'pointer',
              background: scenario === s.id ? '#141414' : 'transparent',
              font: `600 12px Inter`, color: scenario === s.id ? '#fff' : '#5E5E5E', transition: 'background .15s'
            }}>{s.label}</button>)}
        </div>

        <button onClick={reset} style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #D0CFCA', background: '#fff', borderRadius: 999, padding: '6px 14px', cursor: 'pointer', font: '600 12px Inter', color: '#2a2a28' }}>
          <LI name="swap" size={14} color="#2a2a28" /> Reiniciar
        </button>
      </div>

      {/* body */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 24px 28px' }}>
        <PhoneG scale={scale}>
          <GastosExperience key={`${resetKey}-${scenario}-${jump}`} initialRoute={visited ? 'gastos' : 'home'} introSeen={visited} />
        </PhoneG>
      </div>
    </div>);
}

ReactDOM.createRoot(document.getElementById('root')).render(<GastosStage />);
