// Cajas de pesos — app raíz: estado de cajas y router. Arranca siempre
// desde cero (FTE): descubrís las cajas desde Inicio o Portfolio.
const { useState: useStateZ, useEffect: useEffectZ } = React;

const BASE_PESOS = 1487283.93; // pesos digitales al arrancar (antes de apartar en cofres)
const BASE_USD = 2234.15; // dólares digitales al arrancar

// materializa la plantilla sobre cada caja (colores + ícono de respaldo)
const hydrate = (c) => { const t = getTemplate(c.tplId); return { ...c, icon: t.icon, bg: t.bg, fg: t.fg }; };

// ── Experiencia completa ────────────────────────────────────────
function CajasExperience() {
  const [route, setRoute] = useStateZ('inicio'); // inicio | portfolio | pesos | cajas | create | success | detail | add | withdraw | pin
  const [cajas, setCajas] = useStateZ([]);
  // los disponibles viven en el estado: el rendimiento solo entra cuando lo retirás de un cofre
  const [disponible, setDisponible] = useStateZ(BASE_PESOS);
  const [disponibleUSD, setDisponibleUSD] = useStateZ(BASE_USD);
  const [openId, setOpenId] = useStateZ(null);
  const [lastCreated, setLastCreated] = useStateZ(null);
  const [splashOpen, setSplashOpen] = useStateZ(false);
  const [splashSeen, setSplashSeen] = useStateZ(false);

  const isUSD = (c) => (c.currency || 'ARS') === 'USD';
  const totalCajas = cajas.filter((c) => !isUSD(c)).reduce((a, c) => a + cajaTotal(c), 0);
  const totalEarned = cajas.filter((c) => !isUSD(c)).reduce((a, c) => a + c.earned, 0);
  const totalCajasUSD = cajas.filter(isUSD).reduce((a, c) => a + cajaTotal(c), 0);
  const totalEarnedUSD = cajas.filter(isUSD).reduce((a, c) => a + c.earned, 0);
  const openCaja = cajas.find((c) => c.id === openId);
  const open = openCaja ? hydrate(openCaja) : null;

  // mover plata entre el saldo de la moneda que corresponda y el cofre
  const shiftBalance = (currency, delta) =>
  currency === 'USD' ? setDisponibleUSD((d) => d + delta) : setDisponible((d) => d + delta);

  // FTE: al entrar por primera vez a la sección Cajas, sube el splash solo
  // (delay mínimo: lo justo para que la sección se pinte detrás)
  useEffectZ(() => {
    if (route === 'cajas' && !splashSeen && cajas.length === 0) {
      const t = setTimeout(() => { setSplashOpen(true); setSplashSeen(true); }, 30);
      return () => clearTimeout(t);
    }
  }, [route]);

  const createCaja = ({ tplId, name, emoji, goal, currency, armored, pin, amount }) => {
    const nueva = {
      id: 'c' + Date.now(), tplId, name, emoji, goal, currency, amount, earned: 0,
      armored: !!armored, pin: pin || null, pendingOut: 0,
      ageDays: 0, events: [{ day: 0, amount }],
      movs: [{ icon: 'vault', title: 'Creaste el cofre', date: 'Hoy', amount: fmtC(amount, currency), sign: '+' }]
    };
    setCajas((cs) => [nueva, ...cs]);
    shiftBalance(currency, -amount);
    setLastCreated(nueva.id);
    setRoute('success');
  };

  const addToCaja = (id, amount) => {
    const caja = cajas.find((c) => c.id === id);
    setCajas((cs) => cs.map((c) => c.id === id ? {
      ...c, amount: c.amount + amount,
      events: [...c.events, { day: c.ageDays || 0, amount }],
      movs: [{ icon: 'deposit', title: 'Le pusiste plata', date: 'Hoy', amount: fmtC(amount, c.currency || 'ARS'), sign: '+' }, ...c.movs]
    } : c));
    shiftBalance(caja.currency || 'ARS', -amount);
    setRoute('detail');
  };

  // retira del aporte primero; si no alcanza, el resto sale del rendimiento.
  // cofre blindado: el retiro queda programado 24 h (no acredita al instante).
  const withdrawFromCaja = (id, v) => {
    const caja = cajas.find((c) => c.id === id);
    const armored = caja.armored;
    setCajas((cs) => cs.map((c) => {
      if (c.id !== id) return c;
      const fromAmount = Math.min(c.amount, v);
      const fromEarned = v - fromAmount;
      return {
        ...c, amount: c.amount - fromAmount, earned: c.earned - fromEarned,
        pendingOut: (c.pendingOut || 0) + (armored ? v : 0),
        events: [...c.events, { day: c.ageDays || 0, amount: -fromAmount }],
        movs: [{ icon: armored ? 'alert-time' : 'returns', title: armored ? 'Retiro programado' : `Retiraste a ${curOf(c).source}`, date: armored ? 'Llega mañana' : 'Hoy', amount: fmtC(v, c.currency || 'ARS'), sign: '−' }, ...c.movs]
      };
    }));
    if (!armored) shiftBalance(caja.currency || 'ARS', v);
    setRoute('detail');
  };

  // Editar: renombrar, cambiar emoji, convertir libre ↔ objetivo, PIN
  const updateCaja = (id, patch) => {
    if (patch.pin === null) patch = { ...patch, armored: false };
    setCajas((cs) => cs.map((c) => c.id === id ? { ...c, ...patch } : c));
  };

  // Eliminar: lo que haya en el cofre vuelve al saldo de su moneda
  const deleteCaja = (id) => {
    const caja = cajas.find((c) => c.id === id);
    if (caja) shiftBalance(caja.currency || 'ARS', cajaTotal(caja));
    setCajas((cs) => cs.filter((c) => c.id !== id));
    setRoute('cajas');
  };

  // abrir un cofre: si tiene PIN, siempre lo pide primero
  const openCofre = (id) => {
    const caja = cajas.find((c) => c.id === id);
    setOpenId(id);
    setRoute(caja && caja.pin ? 'pin' : 'detail');
  };

  const goCajas = () => setRoute('cajas');

  if (route === 'create')
  return <CreateCajaFlow available={disponible} availableUSD={disponibleUSD} isFirst={cajas.length === 0} onCancel={() => setRoute('cajas')} onDone={createCaja} />;

  if (route === 'success' && lastCreated)
  return <CajaSuccess caja={hydrate(cajas.find((c) => c.id === lastCreated))} onGoCaja={() => { setOpenId(lastCreated); setRoute('detail'); }} onGoPesos={() => setRoute('cajas')} />;

  if (route === 'pin' && open)
  return <PinGate caja={open} onBack={() => setRoute('cajas')} onUnlock={() => setRoute('detail')} />;

  if (route === 'detail' && open)
  return <CajaDetail caja={open} onBack={() => setRoute('cajas')} onAdd={() => setRoute('add')} onWithdraw={() => setRoute('withdraw')}
    onSave={(patch) => updateCaja(open.id, patch)} onDelete={() => deleteCaja(open.id)} onArm={() => setRoute('armpin')} />;

  // blindar un cofre existente: elegís el PIN y queda blindado
  if (route === 'armpin' && open)
  return <PinSetScreen headerTitle={open.name} caja={open} onBack={() => setRoute('detail')}
    onSet={(pin) => { updateCaja(open.id, { pin, armored: true }); setRoute('detail'); }} />;

  if (route === 'add' && open)
  return (
    <AmountScreen
      key="add"
      currency={open.currency || 'ARS'}
      headerTitle={open.name}
      badge={<CajaBadge caja={open} size={46} />}
      title="¿Cuánto le agregás?"
      subtitle={open.name}
      max={(open.currency || 'ARS') === 'USD' ? disponibleUSD : disponible}
      cta="Agregar al cofre"
      onBack={() => setRoute('detail')}
      onClose={() => setRoute('detail')}
      onConfirm={(v) => addToCaja(open.id, v)} />);

  if (route === 'withdraw' && open)
  return (
    <AmountScreen
      key="withdraw"
      withdraw
      currency={open.currency || 'ARS'}
      headerTitle={open.name}
      badge={<CajaBadge caja={open} size={46} />}
      title="¿Cuánto retirás?"
      subtitle={open.name}
      max={cajaTotal(open)}
      cta={open.armored ? 'Programar retiro' : 'Retirar al instante'}
      hint={open.armored ? 'Cofre blindado: tu plata llega en 24 h.' : undefined}
      quick="Retirar todo"
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
      <PortfolioHome disponible={disponible} disponibleUSD={disponibleUSD} cajas={cajas} totalCajas={totalCajas} totalCajasUSD={totalCajasUSD}
        onInicio={() => setRoute('inicio')} onPesos={() => setRoute('pesos')} onCajas={goCajas} />}

      {route === 'cajas' &&
      <CajasHome cajas={cajas.map(hydrate)} totalCajas={totalCajas} totalEarned={totalEarned} totalCajasUSD={totalCajasUSD} totalEarnedUSD={totalEarnedUSD}
        onBack={() => setRoute('portfolio')} onCreate={() => setRoute('create')}
        onOpenCaja={openCofre}
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
