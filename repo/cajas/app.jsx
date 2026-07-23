// Cajas de pesos — app raíz: estado de cajas y router. Arranca siempre
// desde cero (FTE): descubrís las cajas desde Inicio o Portfolio.
const { useState: useStateZ, useEffect: useEffectZ } = React;

const BASE_PESOS = 1487283.93; // pesos digitales al arrancar (antes de apartar en cofres)
const BASE_USD = 2234.15; // dólares digitales al arrancar

// materializa la plantilla sobre cada caja (colores + ícono de respaldo)
const hydrate = (c) => { const t = getTemplate(c.tplId); return { ...c, icon: t.icon, bg: t.bg, fg: t.fg }; };

// ── Experiencia completa ────────────────────────────────────────
function CajasExperience() {
  const [route, setRoute] = useStateZ('inicio'); // inicio | portfolio | pesos | cajas | create | success | detail | movs | add | withdraw | withdrawpin | security | armpin | beneficios
  const [cajas, setCajas] = useStateZ([]);
  // los disponibles viven en el estado: el rendimiento solo entra cuando lo retirás de un cofre
  const [disponible, setDisponible] = useStateZ(BASE_PESOS);
  const [disponibleUSD, setDisponibleUSD] = useStateZ(BASE_USD);
  const [openId, setOpenId] = useStateZ(null);
  const [lastCreated, setLastCreated] = useStateZ(null);
  const [splashOpen, setSplashOpen] = useStateZ(false);
  const [splashSeen, setSplashSeen] = useStateZ(false);
  // el banner de novedad se puede cerrar (X), como en la app real
  const [promoOff, setPromoOff] = useStateZ(false);
  // Blindaje: UN solo PIN protege los retiros de todos los cofres
  const [pin, setPin] = useStateZ(null);
  // a dónde volver después de setear el PIN ('security' | 'withdraw')
  const [afterPin, setAfterPin] = useStateZ('security');
  // retiro esperando la confirmación con PIN
  const [pendingWithdraw, setPendingWithdraw] = useStateZ(null);

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

  const createCaja = ({ tplId, name, emoji, goal, currency, amount }) => {
    const nueva = {
      id: 'c' + Date.now(), tplId, name, emoji, goal, currency, amount, earned: 0,
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
  // siempre al instante; con Blindaje activo, antes pasó por el PIN.
  const withdrawFromCaja = (id, v) => {
    const caja = cajas.find((c) => c.id === id);
    setCajas((cs) => cs.map((c) => {
      if (c.id !== id) return c;
      const fromAmount = Math.min(c.amount, v);
      const fromEarned = v - fromAmount;
      return {
        ...c, amount: c.amount - fromAmount, earned: c.earned - fromEarned,
        events: [...c.events, { day: c.ageDays || 0, amount: -fromAmount }],
        movs: [{ icon: 'returns', title: `Retiraste a ${curOf(c).source}`, date: 'Hoy', amount: fmtC(v, c.currency || 'ARS'), sign: '−' }, ...c.movs]
      };
    }));
    shiftBalance(caja.currency || 'ARS', v);
    setPendingWithdraw(null);
    setRoute('detail');
  };

  // con Blindaje activo el retiro pide el PIN antes de ejecutarse
  const requestWithdraw = (id, v) => {
    if (pin) { setPendingWithdraw({ id, amount: v }); setRoute('withdrawpin'); }
    else withdrawFromCaja(id, v);
  };

  // opt-in de campaña: el usuario acepta las condiciones y ESE cofre
  // pasa a rendir la tasa potenciada (queda en el historial del cofre)
  const activateBoost = (id) => {
    setCajas((cs) => cs.map((c) => c.id === id ? {
      ...c, boosted: true,
      movs: [{ icon: 'rewards', title: 'Activaste la tasa potenciada', date: 'Hoy', amount: activeCamp() ? `${pctShort(boostTna(activeCamp()))} TNA` : '', sign: '' }, ...c.movs]
    } : c));
  };

  // el panel de marketing (afuera del teléfono) lee el consumo de acá
  window.__campUsage = { used: poolUsed(cajas), count: enrolledCount(cajas) };

  // Editar: renombrar, cambiar emoji, convertir libre ↔ objetivo
  const updateCaja = (id, patch) =>
  setCajas((cs) => cs.map((c) => c.id === id ? { ...c, ...patch } : c));

  // Eliminar: lo que haya en el cofre vuelve al saldo de su moneda
  const deleteCaja = (id) => {
    const caja = cajas.find((c) => c.id === id);
    if (caja) shiftBalance(caja.currency || 'ARS', cajaTotal(caja));
    setCajas((cs) => cs.filter((c) => c.id !== id));
    setRoute('cajas');
  };

  // abrir un cofre va directo al detalle: el PIN protege el retiro, no la vista
  const openCofre = (id) => { setOpenId(id); setRoute('detail'); };

  const goCajas = () => setRoute('cajas');

  if (route === 'create')
  return <CreateCajaFlow available={disponible} availableUSD={disponibleUSD} isFirst={cajas.length === 0} onCancel={() => setRoute('cajas')} onDone={createCaja} />;

  if (route === 'success' && lastCreated)
  return <CajaSuccess caja={hydrate(cajas.find((c) => c.id === lastCreated))} cajas={cajas} onActivate={() => activateBoost(lastCreated)}
    onGoCaja={() => { setOpenId(lastCreated); setRoute('detail'); }} onGoPesos={() => setRoute('cajas')} />;

  if (route === 'movs' && open)
  return <CajaMovsScreen caja={open} onBack={() => setRoute('detail')} />;

  if (route === 'detail' && open)
  return <CajaDetail caja={open} cajas={cajas} pinOn={!!pin} onActivate={() => activateBoost(open.id)} onBack={() => setRoute('cajas')} onAdd={() => setRoute('add')} onWithdraw={() => setRoute('withdraw')}
    onSave={(patch) => updateCaja(open.id, patch)} onDelete={() => deleteCaja(open.id)} onMovs={() => setRoute('movs')} />;

  // Blindaje: la sección del PIN único (desde el candado de la home)
  if (route === 'security')
  return <CofresPinScreen pinOn={!!pin} onBack={() => setRoute('cajas')}
    onSetPin={() => { setAfterPin('security'); setRoute('armpin'); }}
    onRemovePin={() => { setPin(null); setRoute('cajas'); }} />;

  // elegir (o cambiar) el PIN de todos los cofres
  if (route === 'armpin')
  return <PinSetScreen onBack={() => setRoute(afterPin === 'withdraw' ? 'withdraw' : 'security')}
    onSet={(p) => { setPin(p); setRoute(afterPin === 'withdraw' ? 'withdraw' : 'security'); }} />;

  // confirmar el retiro con el PIN (solo con Blindaje activo)
  if (route === 'withdrawpin' && open && pendingWithdraw)
  return <PinGate caja={open} amount={pendingWithdraw.amount} pin={pin}
    onBack={() => { setPendingWithdraw(null); setRoute('withdraw'); }}
    onUnlock={() => withdrawFromCaja(pendingWithdraw.id, pendingWithdraw.amount)} />;

  // Beneficios: activación de la campaña cofre por cofre
  if (route === 'beneficios')
  return <BeneficiosScreen cajas={cajas.map(hydrate)} onActivate={activateBoost}
    onBack={() => setRoute('cajas')} onCreate={() => setRoute('create')} />;

  if (route === 'add' && open)
  return (
    <AmountScreen
      key="add"
      currency={open.currency || 'ARS'}
      boosted={!!open.boosted}
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
      cta="Retirar al instante"
      quick="Retirar todo"
      armorOffer={!pin ? () => { setAfterPin('withdraw'); setRoute('armpin'); } : undefined}
      onBack={() => setRoute('detail')}
      onClose={() => setRoute('detail')}
      onConfirm={(v) => requestWithdraw(open.id, v)} />);

  if (route === 'pesos')
  return <PesosScreen disponible={disponible} hasCajas={cajas.length > 0} onBack={() => setRoute('portfolio')} onCajas={goCajas} />;

  // pantallas con el splash superpuesto (inicio / portfolio / cajas)
  return (
    <div style={{ height: '100%', position: 'relative' }}>
      {route === 'inicio' &&
      <InicioHome disponible={disponible} cajas={cajas} totalCajas={totalCajas}
        onPortfolio={() => setRoute('portfolio')} onCajas={goCajas}
        promoOff={promoOff} onClosePromo={() => setPromoOff(true)} />}

      {route === 'portfolio' &&
      <PortfolioHome disponible={disponible} disponibleUSD={disponibleUSD} cajas={cajas} totalCajas={totalCajas} totalCajasUSD={totalCajasUSD}
        onInicio={() => setRoute('inicio')} onPesos={() => setRoute('pesos')} onCajas={goCajas} />}

      {route === 'cajas' &&
      <CajasHome cajas={cajas.map(hydrate)} totalCajas={totalCajas} totalEarned={totalEarned} totalCajasUSD={totalCajasUSD} totalEarnedUSD={totalEarnedUSD}
        pinOn={!!pin}
        onBack={() => setRoute('portfolio')} onCreate={() => setRoute('create')}
        onOpenCaja={openCofre}
        onSecurity={() => setRoute('security')}
        onBeneficios={() => setRoute('beneficios')}
        onSplash={() => { if (splashSeen) { setSplashOpen(false); setRoute('create'); } else setSplashOpen(true); }} />}

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
  // panel de marketing: setea la campaña a mano; publicar (o apagar)
  // reinicia la experiencia para ver el impacto desde el descubrimiento
  const [panelOpen, setPanelOpen] = useStateZ(false);
  const publishCampaign = (cfg) => { setCampaign(cfg); setPanelOpen(false); setResetKey((k) => k + 1); };
  const stopCampaign = () => { setCampaign(null); setPanelOpen(false); setResetKey((k) => k + 1); };

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

        {/* abre el panel de marketing donde se setea la campaña a mano */}
        <button onClick={() => setPanelOpen(true)} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #D0CFCA', background: '#fff', borderRadius: 999, padding: '6px 12px', cursor: 'pointer', font: '600 12px Inter', color: '#2a2a28' }}>
          <LI name="rewards" size={14} color={activeCamp() ? '#2a2a28' : '#8a8985'} />
          <span style={{ color: '#8a8985', fontWeight: 500 }}>Campaña</span>
          {activeCamp() ?
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>{activeCamp().name}
            <span style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--c-lemon-40, #00DF1A)' }} /></span> :
          'Sin campaña'}
        </button>

        <button onClick={() => setResetKey((k) => k + 1)} style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #D0CFCA', background: '#fff', borderRadius: 999, padding: '6px 14px', cursor: 'pointer', font: '600 12px Inter', color: '#2a2a28' }}>
          <LI name="swap" size={14} color="#2a2a28" /> Reiniciar
        </button>
      </div>

      {/* body */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 24px 28px' }}>
        <PhoneC scale={scale}>
          <CajasExperience key={resetKey} />
        </PhoneC>
      </div>

      <CampaignPanel open={panelOpen} onClose={() => setPanelOpen(false)} onPublish={publishCampaign} onStop={stopCampaign} />
    </div>);
}

ReactDOM.createRoot(document.getElementById('root')).render(<CajasStage />);
