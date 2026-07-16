// Cajas de pesos — app raíz: estado de cajas y router. Arranca siempre
// desde cero (FTE): descubrís las cajas desde Inicio o Portfolio.
const { useState: useStateZ, useEffect: useEffectZ } = React;

const BASE_PESOS = 1487283.93; // pesos digitales al arrancar (antes de apartar en cajas)

// materializa la plantilla sobre cada caja (colores + ícono de respaldo)
const hydrate = (c) => { const t = getTemplate(c.tplId); return { ...c, icon: t.icon, bg: t.bg, fg: t.fg }; };

// ── Experiencia completa ────────────────────────────────────────
function CajasExperience() {
  const [route, setRoute] = useStateZ('inicio'); // inicio | portfolio | pesos | cajas | create | success | detail | add | withdraw
  const [cajas, setCajas] = useStateZ([]);
  // disponible vive en el estado: el rendimiento solo entra cuando lo retirás de una caja
  const [disponible, setDisponible] = useStateZ(BASE_PESOS);
  const [openId, setOpenId] = useStateZ(null);
  const [lastCreated, setLastCreated] = useStateZ(null);
  const [splashOpen, setSplashOpen] = useStateZ(false);
  const [splashSeen, setSplashSeen] = useStateZ(false);

  const totalCajas = cajas.reduce((a, c) => a + cajaTotal(c), 0); // saldo apartado (aportes + rendimiento)
  const totalEarned = cajas.reduce((a, c) => a + c.earned, 0);
  const openCaja = cajas.find((c) => c.id === openId);
  const open = openCaja ? hydrate(openCaja) : null;

  // FTE: al entrar por primera vez a la sección Cajas, sube el splash solo
  // (delay mínimo: lo justo para que la sección se pinte detrás)
  useEffectZ(() => {
    if (route === 'cajas' && !splashSeen && cajas.length === 0) {
      const t = setTimeout(() => { setSplashOpen(true); setSplashSeen(true); }, 30);
      return () => clearTimeout(t);
    }
  }, [route]);

  const createCaja = ({ tplId, name, emoji, goal, amount }) => {
    const nueva = {
      id: 'c' + Date.now(), tplId, name, emoji, goal, amount, earned: 0,
      ageDays: 0, events: [{ day: 0, amount }],
      movs: [{ icon: 'vault', title: 'Creaste el cofre', date: 'Hoy', amount: fmtP(amount), sign: '+' }]
    };
    setCajas((cs) => [nueva, ...cs]);
    setDisponible((d) => d - amount);
    setLastCreated(nueva.id);
    setRoute('success');
  };

  const addToCaja = (id, amount) => {
    setCajas((cs) => cs.map((c) => c.id === id ? {
      ...c, amount: c.amount + amount,
      events: [...c.events, { day: c.ageDays || 0, amount }],
      movs: [{ icon: 'deposit', title: 'Le pusiste plata', date: 'Hoy', amount: fmtP(amount), sign: '+' }, ...c.movs]
    } : c));
    setDisponible((d) => d - amount);
    setRoute('detail');
  };

  // retira del aporte primero; si no alcanza, el resto sale del rendimiento
  const withdrawFromCaja = (id, v) => {
    setCajas((cs) => cs.map((c) => {
      if (c.id !== id) return c;
      const fromAmount = Math.min(c.amount, v);
      const fromEarned = v - fromAmount;
      return {
        ...c, amount: c.amount - fromAmount, earned: c.earned - fromEarned,
        events: [...c.events, { day: c.ageDays || 0, amount: -fromAmount }],
        movs: [{ icon: 'returns', title: 'Retiraste a Pesos digitales', date: 'Hoy', amount: fmtP(v), sign: '−' }, ...c.movs]
      };
    }));
    setDisponible((d) => d + v);
    setRoute('detail');
  };

  // Editar: renombrar, cambiar emoji y convertir libre ↔ objetivo
  const updateCaja = (id, patch) => {
    setCajas((cs) => cs.map((c) => c.id === id ? { ...c, ...patch } : c));
  };

  const goCajas = () => setRoute('cajas');

  if (route === 'create')
  return <CreateCajaFlow available={disponible} isFirst={cajas.length === 0} onCancel={() => setRoute('cajas')} onDone={createCaja} />;

  if (route === 'success' && lastCreated)
  return <CajaSuccess caja={hydrate(cajas.find((c) => c.id === lastCreated))} onGoCaja={() => { setOpenId(lastCreated); setRoute('detail'); }} onGoPesos={() => setRoute('cajas')} />;

  if (route === 'detail' && open)
  return <CajaDetail caja={open} onBack={() => setRoute('cajas')} onAdd={() => setRoute('add')} onWithdraw={() => setRoute('withdraw')} onSave={(patch) => updateCaja(open.id, patch)} />;

  if (route === 'add' && open)
  return (
    <AmountScreen
      key="add"
      headerTitle={open.name}
      badge={<CajaBadge caja={open} size={46} />}
      title="¿Cuánto le agregás?"
      subtitle={open.name}
      max={disponible}
      cta="Agregar al cofre"
      onBack={() => setRoute('detail')}
      onClose={() => setRoute('detail')}
      onConfirm={(v) => addToCaja(open.id, v)} />);

  if (route === 'withdraw' && open)
  return (
    <AmountScreen
      key="withdraw"
      withdraw
      headerTitle={open.name}
      badge={<CajaBadge caja={open} size={46} />}
      title="¿Cuánto retirás?"
      subtitle={open.name}
      max={cajaTotal(open)}
      cta="Retirar al instante"
      onBack={() => setRoute('detail')}
      onClose={() => setRoute('detail')}
      onConfirm={(v) => withdrawFromCaja(open.id, v)} />);

  if (route === 'pesos')
  return <PesosScreen disponible={disponible} hasCajas={cajas.length > 0} onBack={() => setRoute('portfolio')} onCajas={goCajas} />;

  // pantallas con el splash superpuesto (inicio / portfolio / cajas)
  return (
    <div style={{ height: '100%', position: 'relative' }}>
      {route === 'inicio' &&
      <InicioHome disponible={disponible} cajas={cajas} totalCajas={totalCajas}
        onPortfolio={() => setRoute('portfolio')} onCajas={goCajas} />}

      {route === 'portfolio' &&
      <PortfolioHome disponible={disponible} cajas={cajas} totalCajas={totalCajas}
        onInicio={() => setRoute('inicio')} onPesos={() => setRoute('pesos')} onCajas={goCajas} />}

      {route === 'cajas' &&
      <CajasHome cajas={cajas.map(hydrate)} totalCajas={totalCajas} totalEarned={totalEarned}
        onBack={() => setRoute('portfolio')} onCreate={() => setRoute('create')}
        onOpenCaja={(id) => { setOpenId(id); setRoute('detail'); }}
        onSplash={() => splashSeen ? setRoute('create') : setSplashOpen(true)} />}

      <CajasSplash open={splashOpen} onClose={() => setSplashOpen(false)} onPrimary={() => { setSplashOpen(false); setRoute('create'); }} />
    </div>);
}

// ── Marco del teléfono ──────────────────────────────────────────
function PhoneC({ scale, children }) {
  return (
    <div style={{ width: 402 * scale, height: 874 * scale, flexShrink: 0 }}>
      <div style={{ width: 402, height: 874, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <IOSDevice>{children}</IOSDevice>
      </div>
    </div>);
}

// ── Stage root ──────────────────────────────────────────────────
function CajasStage() {
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
        <div style={{ font: '600 13px Inter', color: '#2a2a28' }}>Cofres <span style={{ color: '#8a8985', fontWeight: 500 }}>· prototipo</span></div>

        <button onClick={() => setResetKey((k) => k + 1)} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #D0CFCA', background: '#fff', borderRadius: 999, padding: '6px 14px', cursor: 'pointer', font: '600 12px Inter', color: '#2a2a28' }}>
          <LI name="swap" size={14} color="#2a2a28" /> Reiniciar
        </button>
      </div>

      {/* body */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 24px 28px' }}>
        <PhoneC scale={scale}>
          <CajasExperience key={resetKey} />
        </PhoneC>
      </div>
    </div>);
}

ReactDOM.createRoot(document.getElementById('root')).render(<CajasStage />);
