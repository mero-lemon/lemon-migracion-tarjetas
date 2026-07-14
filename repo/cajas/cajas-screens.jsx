// Pantallas de la experiencia Cajas: Inicio, Portfolio, Pesos digitales,
// flujo de creación (plantilla → nombre/objetivo → monto), success y detalle.
const { useState: useStateX, useEffect: useEffectX } = React;

// ── Top bar de la app (avatar + search/rewards/notifications) ───
const TopBar = () =>
<div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px 10px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: LX.layer, borderRadius: 999, padding: '6px 14px 6px 6px', boxShadow: 'var(--shadow-card)' }}>
      <span style={{ width: 30, height: 30, borderRadius: 999, background: 'linear-gradient(180deg, #00DF1A 0%, #CFFF2E 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Leaf size={18} color="#fff" vein="rgba(0,0,0,0.2)" />
      </span>
      <span style={{ font: '500 16px Geist', letterSpacing: '-0.1px', color: '#080808' }}>$rawpower</span>
    </div>
    <div style={{ flex: 1 }} />
    <LI name="search" size={23} color="#141414" />
    <LI name="rewards" size={23} color="#141414" />
    <LI name="view-notification" size={23} color="#141414" />
  </div>;

// ── Nav inferior (pill blanca + botón QR) ───────────────────────
const NavPill = ({ active = 'home', onHome, onPortfolio }) => {
  const items = [
  ['home', active === 'home' ? 'home-on' : 'home-off', onHome],
  ['portfolio', active === 'portfolio' ? 'portfolio-on' : 'portfolio-off', onPortfolio],
  ['market', 'market-off', null],
  ['activity', 'activity-off', null],
  ['apps', 'mini-apps-off', null]];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-around', background: LX.layer, borderRadius: 999, padding: '12px 14px', boxShadow: 'var(--shadow-card)' }}>
        {items.map(([id, ic, fn]) =>
        <button key={id} onClick={fn || undefined} style={{ border: 0, background: id === active ? '#FAFAFA' : 'transparent', borderRadius: 999, padding: '6px 10px', cursor: fn ? 'pointer' : 'default', display: 'flex' }}>
            <LI name={ic} size={22} color={id === active ? '#080808' : '#818181'} />
          </button>)}
      </div>
      <div style={{ width: 52, height: 52, borderRadius: 999, background: '#141414', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <LI name="QR-Scanner" size={24} color="var(--c-lime-40)" />
      </div>
    </div>);
};

// ── Tabs Inicio / Portfolio de la balance card ──────────────────
// La tab inactiva asoma en lime (mismo patrón que la app real).
const BalanceTabs = ({ active, onInicio, onPortfolio }) =>
<div style={{ display: 'flex' }}>
    <button onClick={onInicio} style={{ flex: 1, border: 0, textAlign: 'center', font: '500 12px Inter', letterSpacing: '-0.1px', color: '#141414', padding: '14px 0', cursor: active === 'inicio' ? 'default' : 'pointer', background: active === 'inicio' ? 'transparent' : 'var(--c-lime-40)', borderRadius: active === 'inicio' ? 0 : '32px 0 24px 0' }}>Inicio</button>
    <button onClick={onPortfolio} style={{ flex: 1, border: 0, textAlign: 'center', font: '500 12px Inter', letterSpacing: '-0.1px', color: '#141414', padding: '14px 0', cursor: active === 'portfolio' ? 'default' : 'pointer', background: active === 'portfolio' ? 'transparent' : 'var(--c-lime-40)', borderRadius: active === 'portfolio' ? 0 : '0 32px 0 24px' }}>Portfolio</button>
  </div>;

// ── INICIO — tu plata del día a día ─────────────────────────────
function InicioHome({ disponible, cajas, totalCajas, onPortfolio, onCajas }) {
  return (
    <Screen bg="#F3F3F3" footer={<NavPill active="home" onPortfolio={onPortfolio} />}>
      <TopBar />
      <div style={{ padding: '4px 16px 8px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ background: LX.layer, borderRadius: 32, overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
          <BalanceTabs active="inicio" onPortfolio={onPortfolio} />
          <div style={{ padding: '20px 24px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ font: '500 16px Geist', color: '#818181', letterSpacing: '-0.1px' }}>Pesos digitales</span>
              <LI name="view-balance-on" size={18} color="#818181" />
            </div>
            <div style={{ marginTop: 6 }}><BigAmount value={disponible} /></div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 24 }}>
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

        {/* hook a cajas: la historia de "ordenarte" arranca acá */}
        {cajas.length === 0 ?
        <button onClick={onCajas} style={{
          position: 'relative', overflow: 'hidden', width: '100%', textAlign: 'left', cursor: 'pointer', border: 0,
          borderRadius: 26, minHeight: 96, padding: '16px 48px 16px 118px',
          background: 'radial-gradient(120% 150% at 88% 8%, #EEFF7A 0%, rgba(238,255,122,0) 46%), linear-gradient(100deg, #5AC005 0%, #8CE617 50%, #B7F53A 100%)',
          boxShadow: '0 12px 26px rgba(120,200,20,0.36)'
        }}>
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '26%', pointerEvents: 'none', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)', animation: 'lc-shine 3s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', left: -6, top: '50%', transform: 'translateY(-50%)' }}>
              <CajaHeroArt size={118} animate={false} />
            </div>
            <div style={{ position: 'relative' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(8,20,0,0.16)', color: '#0b1a00', font: '700 10px Inter', letterSpacing: '0.05em', padding: '3px 9px', borderRadius: 999 }}>
                <LI name="vault" size={11} color="#0b1a00" /> NUEVO
              </span>
              <div style={{ font: '800 17px Inter', color: '#0b1a00', lineHeight: 1.15, marginTop: 7 }}>Cajas de pesos</div>
              <div style={{ font: '500 13px Inter', color: 'rgba(11,26,0,0.78)', marginTop: 3, lineHeight: 1.3 }}>Apartá por objetivo y rendí {TNA_LABEL.replace(' TNA', '')} TNA.</div>
            </div>
            <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: 999, background: 'rgba(8,20,0,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LI name="arrow-foward" size={16} color="#0b1a00" />
            </span>
          </button> :

        <button onClick={onCajas} style={{ display: 'flex', alignItems: 'center', gap: 13, width: '100%', textAlign: 'left', cursor: 'pointer', border: 0, background: LX.layer, borderRadius: 24, padding: '14px 16px', boxShadow: 'var(--shadow-card)' }}>
            <IconBadge icon="vault" bg="var(--c-lime-10)" fg="var(--c-lime-60)" size={42} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ font: '500 14px Geist', color: '#141414', letterSpacing: '-0.01em' }}>Tus cajas de pesos están rindiendo</div>
              <div style={{ font: '400 12px Inter', color: '#818181', marginTop: 2 }}>{fmtP(totalCajas)} apartados en {cajas.length} {cajas.length === 1 ? 'caja' : 'cajas'}</div>
            </div>
            <TnaChip compact label={TNA_LABEL} />
            <LI name="arrow-foward" size={16} color="#818181" />
          </button>}
      </div>
    </Screen>);
}

// ── PORTFOLIO — fiel al Figma: balance total + 4 activos + 5º
//    contenedor apaisado de Cajas de pesos ────────────────────────
function PortfolioHome({ disponible, cajas, totalCajas, onInicio, onPesos, onCajas }) {
  const assets = [
  { id: 'pesos', icon: 'currency-peso', label: 'Pesos digitales', value: fmtP2(disponible), chip: true, onTap: onPesos },
  { id: 'dolares', icon: 'currency-dollar', label: 'Dólares digitales', value: 'U$2.234,15', chip: true },
  { id: 'crypto', icon: 'currency-bitcoin', label: 'Bitcoin & crypto', value: 'U$1.245,23' },
  { id: 'acciones', icon: 'stocks', label: 'Acciones', value: 'U$3.023,05' }];

  return (
    <Screen bg="#F3F3F3" footer={<NavPill active="portfolio" onHome={onInicio} />}>
      <TopBar />
      <div style={{ padding: '4px 16px 8px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* balance card */}
        <div style={{ background: LX.layer, borderRadius: 32, overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
          <BalanceTabs active="portfolio" onInicio={onInicio} />
          <div style={{ padding: '20px 24px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ font: '500 16px Geist', color: '#818181', letterSpacing: '-0.1px' }}>Balance total</span>
              <LI name="view-balance-on" size={18} color="#818181" />
            </div>
            <div style={{ marginTop: 6 }}><BigAmount value={7741.83} prefix="U$" /></div>
            <div style={{ font: '500 14px Inter', letterSpacing: '-0.1px', color: '#818181', marginTop: 8 }}>≈ $9.290.196,45</div>
          </div>
        </div>

        {/* grid de activos 2x2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {assets.map((a) =>
          <button key={a.id} onClick={a.onTap || undefined} style={{ position: 'relative', height: 160, textAlign: 'left', border: 0, cursor: a.onTap ? 'pointer' : 'default', background: LX.layer, borderRadius: 24, padding: 16, display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-card)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <IconBadge icon={a.icon} bg="#FAFAFA" fg="#818181" size={40} />
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {a.chip &&
                <span style={{ background: 'var(--c-lime-40)', color: 'rgba(8,8,8,0.7)', font: '400 12px Inter', letterSpacing: '-0.1px', padding: '3px 8px', borderRadius: 101 }}>{TNA_LABEL.replace(' TNA', '')}</span>}
                  <LI name="arrow-foward" size={17} color="#B4B4B4" />
                </span>
              </div>
              <div style={{ flex: 1 }} />
              <div style={{ font: '500 12px Inter', letterSpacing: '-0.1px', color: '#818181' }}>{a.label}</div>
              <div style={{ font: '500 20px Geist', lineHeight: '26px', letterSpacing: '-0.01em', color: '#141414', marginTop: 4 }}>{a.value}</div>
            </button>)}
        </div>

        {/* 5º contenedor apaisado: Cajas de pesos — mismo estilo que los 4 activos */}
        <button onClick={onCajas} style={{ position: 'relative', width: '100%', textAlign: 'left', border: 0, cursor: 'pointer', background: LX.layer, borderRadius: 24, padding: 16, boxShadow: 'var(--shadow-card)', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 999, background: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 20, lineHeight: 1 }}>
            <span style={{ filter: 'grayscale(1) contrast(0.85) brightness(1.15)' }}>💰</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ font: '500 12px Inter', letterSpacing: '-0.1px', color: '#818181' }}>Cajas de pesos</span>
              {cajas.length === 0 &&
              <span style={{ background: 'var(--c-lime-40)', color: '#080808', font: '600 10px Inter', letterSpacing: '0.03em', padding: '2px 7px', borderRadius: 101 }}>NUEVO</span>}
            </div>
            <div style={{ font: '500 20px Geist', lineHeight: '26px', letterSpacing: '-0.01em', color: '#141414', marginTop: 4 }}>{fmtP2(totalCajas)}</div>
          </div>
          <span style={{ background: 'var(--c-lime-40)', color: 'rgba(8,8,8,0.7)', font: '400 12px Inter', letterSpacing: '-0.1px', padding: '3px 8px', borderRadius: 101, flexShrink: 0 }}>{TNA_LABEL.replace(' TNA', '')}</span>
          <LI name="arrow-foward" size={17} color="#B4B4B4" style={{ flexShrink: 0 }} />
        </button>
      </div>
    </Screen>);
}

// ── WALLET PESOS — saldo grande + acciones + acceso a Cajas (Figma) ──
function PesosScreen({ disponible, hasCajas, onBack, onCajas }) {
  return (
    <Screen bg="#F3F3F3">
      {/* top nav: back + botón Usar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 16px', height: 70 }}>
        <button onClick={onBack} style={{ width: 40, height: 40, border: 0, background: 'transparent', cursor: 'pointer', marginLeft: -8 }}>
          <LI name="arrow-back" size={24} color="#080808" />
        </button>
        <button style={{ height: 32, border: 0, cursor: 'pointer', borderRadius: 100, padding: '0 12px', background: 'rgba(8,8,8,0.1)', font: '600 12px Inter', letterSpacing: '-0.1px', color: '#141414' }}>Usar</button>
      </div>

      <div style={{ padding: '16px 16px 28px', display: 'flex', flexDirection: 'column', gap: 32 }}>
        {/* saldo container */}
        <div>
          <div style={{ font: '500 16px Geist', letterSpacing: '-0.1px', color: '#141414' }}>Pesos</div>
          <div style={{ marginTop: 4 }}><BigAmount value={disponible} size={56} /></div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#CFFF2E', borderRadius: 101, padding: '4px 4px 4px 8px', marginTop: 8 }}>
            <span style={{ font: '400 12px Inter', letterSpacing: '-0.1px', color: '#141414' }}>Rendimiento estimado anual {TNA_LABEL.replace(' TNA', '')}</span>
            <LI name="arrow-foward" size={16} color="#141414" />
          </div>
        </div>

        {/* core buttons */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 32 }}>
          {[['deposit', 'Depositar'], ['swap-coins', 'Cambiar'], ['send-money', 'Enviar']].map(([ic, lb]) =>
          <div key={lb} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: 54 }}>
              <button style={{ width: 48, height: 48, border: 0, cursor: 'pointer', borderRadius: 60, background: '#141414', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LI name={ic} size={22} color="#FFFFFF" />
              </button>
              <span style={{ font: '500 12px Inter', letterSpacing: '-0.1px', color: '#141414', textAlign: 'center' }}>{lb}</span>
            </div>)}
        </div>

        {/* acceso a Cajas de pesos (card celeste, radius 32) */}
        <button onClick={onCajas} style={{ position: 'relative', width: '100%', height: 146, textAlign: 'left', border: 0, cursor: 'pointer', background: '#009DFF', borderRadius: 32, overflow: 'hidden', padding: 0 }}>
          <div style={{ position: 'absolute', top: -50, right: -30, width: 190, height: 190, borderRadius: 999, background: 'radial-gradient(circle, rgba(207,255,46,0.25), transparent 70%)' }} />
          <div style={{ position: 'absolute', left: 16, top: 16, font: '500 16px Geist', letterSpacing: '-0.1px', color: '#FFFFFF' }}>
            {hasCajas ? 'Tus cajas de pesos' : 'Guardá en cajas de pesos'}
          </div>
          <div style={{ position: 'absolute', left: 16, top: 48, fontFamily: 'LemonCitrus, serif', fontWeight: 400, fontSize: 56, lineHeight: '56px', color: '#CFFF2E' }}>
            {TNA_LABEL.replace(' TNA', '')}
          </div>
          <div style={{ position: 'absolute', left: 16, top: 112, font: '400 12px Inter', letterSpacing: '-0.1px', color: '#FFFFFF' }}>Rendimiento estimado anual</div>
          <span style={{ position: 'absolute', right: 16, bottom: 16, display: 'inline-flex', alignItems: 'center', height: 32, padding: '0 12px', background: 'rgba(8,8,8,0.1)', borderRadius: 100, font: '600 12px Inter', letterSpacing: '-0.1px', color: '#FFFFFF' }}>
            {hasCajas ? 'Mis cajas' : 'Crear caja'}
          </span>
        </button>

        {/* movimientos */}
        <div>
          <div style={{ font: '500 16px Geist', letterSpacing: '-0.01em', color: '#141414', margin: '0 2px 10px' }}>Movimientos</div>
          <Surface pad={4}>
            <div style={{ padding: '0 12px' }}>
              <MoveRow icon="deposit" title="Transferencia recibida" date="Hoy" amount="$120.000" sign="+" />
              <Divider />
              <MoveRow icon="food" title="Cuervo Café" date="Ayer" amount="$4.200" />
              <Divider />
              <MoveRow icon="streaming" title="DLO*PrimeVideo" date="28 de junio" amount="$7.863,79" />
            </div>
          </Surface>
        </div>
      </div>
    </Screen>);
}

// ── SECCIÓN CAJAS DE PESOS — solo tus cajas + crear ─────────────
function CajasHome({ cajas, totalCajas, totalEarned, onBack, onCreate, onOpenCaja, onSplash }) {
  const AddBtn =
  <button onClick={onCreate} style={{ width: 40, height: 40, borderRadius: 999, border: 0, background: LX.layer3, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
      <LI name="add-more" size={22} color={LX.text1} />
    </button>;

  return (
    <Screen bg="#F3F3F3">
      <BigHeader title="Cajas de pesos" onBack={onBack} right={cajas.length > 0 ? AddBtn : <span style={{ width: 40 }} />} />
      <div style={{ padding: '4px 16px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {cajas.length === 0 ?
        /* FTE: empty state que invita a conocer las cajas */
        <button onClick={onSplash} style={{ border: 0, cursor: 'pointer', textAlign: 'center', background: LX.layer, borderRadius: 24, padding: '26px 22px 24px', boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <CajaHeroArt size={168} animate={false} />
            <div style={{ font: '500 20px Geist', letterSpacing: '-0.01em', color: '#141414', marginTop: 6 }}>Ponéle nombre a tu plata</div>
            <div style={{ font: '400 13px Inter', color: '#818181', lineHeight: 1.45, maxWidth: 270 }}>
              Apartá pesos para lo que se viene, rindiendo {TNA_LABEL}. La tarjeta y el QR no los tocan.
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#141414', color: '#fff', font: '600 14px Inter', padding: '11px 22px', borderRadius: 999, marginTop: 14 }}>
              Crear mi primera caja <LI name="arrow-foward" size={15} color="var(--c-lime-40)" />
            </span>
          </button> :

        <>
          {/* resumen: total apartado + rendimiento */}
          <div style={{ position: 'relative', overflow: 'hidden', background: '#141414', borderRadius: 24, padding: '18px 20px' }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 170, height: 170, borderRadius: 999, background: 'radial-gradient(circle, rgba(207,255,46,0.22), transparent 70%)' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ font: '500 13px Inter', color: 'rgba(255,255,255,0.6)' }}>Apartado en cajas</span>
                <TnaChip compact label={TNA_LABEL} />
              </div>
              <div style={{ font: '500 32px Geist', letterSpacing: '-0.03em', color: '#fff', marginTop: 5 }}>{fmtP(totalCajas)}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 7 }}>
                <LI name="earn" size={14} color="var(--c-lime-40)" />
                <span style={{ font: '500 13px Inter', color: 'var(--c-lime-40)' }}>+{fmtP2(totalEarned)} generados</span>
                <span style={{ font: '400 12px Inter', color: 'rgba(255,255,255,0.45)' }}>· rinde a diario</span>
              </div>
            </div>
          </div>

          {cajas.map((c) => <CajaRow key={c.id} caja={c} onTap={() => onOpenCaja(c.id)} />)}

          <button onClick={onCreate} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', border: `1.5px dashed ${LX.text3}`, cursor: 'pointer', background: 'transparent', borderRadius: 20, padding: '14px 0', font: '600 14px Inter', color: '#141414' }}>
            <LI name="add-more" size={18} color="#141414" /> Nueva caja
          </button>
        </>}
      </div>
    </Screen>);
}

// ── FLUJO DE CREACIÓN ───────────────────────────────────────────
function CreateCajaFlow({ available, isFirst, onCancel, onDone }) {
  const [step, setStep] = useStateX('tpl'); // tpl | name | amount
  const [tpl, setTpl] = useStateX(null);
  const [name, setName] = useStateX('');
  const [emoji, setEmoji] = useStateX(null);
  const [goal, setGoal] = useStateX(null);
  const [customGoal, setCustomGoal] = useStateX(false);

  const pick = (t) => { setTpl(t); setName(t.id === 'custom' ? '' : t.name); setEmoji(t.emoji); setStep('name'); };

  if (step === 'tpl')
  return (
    <Screen bg="#F3F3F3">
      <StepHeader title={isFirst ? 'Tu primera caja' : 'Nueva caja'} onBack={onCancel} onClose={onCancel} />
      <div style={{ padding: '6px 16px 24px' }}>
        <div style={{ font: '500 24px Geist', letterSpacing: '-0.02em', color: LX.text1 }}>¿Para qué estás guardando?</div>
        <div style={{ font: '400 14px Inter', color: LX.text2, marginTop: 6, lineHeight: 1.45 }}>Elegí un objetivo o armá una caja desde cero. Después la podés renombrar.</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 18 }}>
          {CAJA_TEMPLATES.map((t) =>
          <button key={t.id} onClick={() => pick(t)} style={{ textAlign: 'left', border: 0, cursor: 'pointer', background: LX.layer, borderRadius: 20, padding: 16, display: 'flex', flexDirection: 'column', gap: 12, boxShadow: 'var(--shadow-card)' }}>
              <CajaBadge caja={{ emoji: t.emoji, bg: t.bg }} size={42} />
              <div>
                <div style={{ font: '500 14px Geist', letterSpacing: '-0.01em', color: '#141414', lineHeight: 1.25 }}>{t.name}</div>
                <div style={{ font: '400 12px Inter', color: '#818181', marginTop: 3, lineHeight: 1.35 }}>{t.sub}</div>
              </div>
            </button>)}
        </div>
      </div>
    </Screen>);

  if (step === 'name')
  return (
    <Screen bg="#F3F3F3" footer={<Btn variant="primary" disabled={!name.trim() || (customGoal && !goal)} onClick={() => setStep('amount')}>Continuar</Btn>}>
      <StepHeader title={isFirst ? 'Tu primera caja' : 'Nueva caja'} onBack={() => setStep('tpl')} onClose={onCancel} />
      <div style={{ padding: '6px 16px 8px', display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div>
          <div style={{ font: '500 24px Geist', letterSpacing: '-0.02em', color: LX.text1 }}>Hacela tuya</div>
          <div style={{ font: '400 14px Inter', color: LX.text2, marginTop: 6, lineHeight: 1.45 }}>Nombre, emoji y objetivo: que la caja te recuerde para qué la armaste.</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: LX.layer, borderRadius: 20, padding: 16, boxShadow: 'var(--shadow-card)' }}>
          <CajaBadge caja={{ emoji, bg: tpl.bg }} size={48} />
          <input
            value={name}
            autoFocus
            maxLength={28}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre de la caja"
            style={{ flex: 1, minWidth: 0, border: 0, outline: 'none', background: 'transparent', font: '500 20px Geist', letterSpacing: '-0.01em', color: '#141414' }} />
          {name && <button onClick={() => setName('')} style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: 4, display: 'flex' }}><LI name="close" size={16} color="#B4B4B4" /></button>}
        </div>

        {/* elegir emoji */}
        <div>
          <div style={{ font: '600 12px Inter', color: LX.text3, letterSpacing: '0.02em', textTransform: 'uppercase', margin: '0 2px 10px' }}>Emoji</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 6 }}>
            {CAJA_EMOJIS.map((e) =>
            <button key={e} onClick={() => setEmoji(e)} style={{ aspectRatio: '1', border: emoji === e ? '2px solid #141414' : `1.5px solid ${LX.border}`, cursor: 'pointer', borderRadius: 12, background: emoji === e ? tpl.bg : LX.layer, fontSize: 17, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>{e}</button>)}
          </div>
        </div>

        {/* objetivo */}
        <div>
          <div style={{ font: '600 12px Inter', color: LX.text3, letterSpacing: '0.02em', textTransform: 'uppercase', margin: '0 2px 10px' }}>Objetivo · opcional</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {[[null, 'Sin objetivo'], [500000, '$500.000'], [1000000, '$1.000.000']].map(([v, lb]) =>
            <button key={lb} onClick={() => { setGoal(v); setCustomGoal(false); }} style={{ border: !customGoal && goal === v ? '1.5px solid #141414' : `1.5px solid ${LX.border}`, cursor: 'pointer', borderRadius: 999, padding: '9px 16px', background: !customGoal && goal === v ? '#141414' : LX.layer, font: '600 13px Inter', color: !customGoal && goal === v ? '#fff' : '#141414' }}>{lb}</button>)}
            <button onClick={() => { setCustomGoal(true); setGoal(null); }} style={{ border: customGoal ? '1.5px solid #141414' : `1.5px solid ${LX.border}`, cursor: 'pointer', borderRadius: 999, padding: '9px 16px', background: customGoal ? '#141414' : LX.layer, font: '600 13px Inter', color: customGoal ? '#fff' : '#141414' }}>Otro monto</button>
          </div>
          {customGoal &&
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: LX.layer, borderRadius: 16, padding: '13px 16px', marginTop: 10, border: `1.5px solid ${LX.border}` }}>
              <span style={{ font: '500 18px Geist', color: '#B4B4B4' }}>$</span>
              <input
              autoFocus
              inputMode="numeric"
              value={goal ? goal.toLocaleString('es-AR') : ''}
              onChange={(e) => { const n = parseInt(e.target.value.replace(/\D/g, ''), 10); setGoal(n > 0 ? Math.min(n, 999999999) : null); }}
              placeholder="¿Cuánto querés juntar?"
              style={{ flex: 1, minWidth: 0, border: 0, outline: 'none', background: 'transparent', font: '500 18px Geist', letterSpacing: '-0.01em', color: '#141414' }} />
            </div>}
          <div style={{ font: '400 12px Inter', color: LX.text3, marginTop: 10, lineHeight: 1.4 }}>Con objetivo ves tu progreso; sin objetivo, la caja rinde libre. Lo cambiás cuando quieras desde Editar.</div>
        </div>
      </div>
    </Screen>);

  // step === 'amount'
  return (
    <AmountScreen
      headerTitle={isFirst ? 'Tu primera caja' : 'Nueva caja'}
      title={<><span style={{ display: 'inline-flex' }}><CajaBadge caja={{ emoji, bg: tpl.bg }} size={34} /></span>¿Cuánto le ponés a {name.trim()}?</>}
      max={available}
      cta="Poner a rendir"
      onBack={() => setStep('name')}
      onClose={onCancel}
      onConfirm={(amount) => onDone({ tplId: tpl.id, name: name.trim(), emoji, goal, amount })} />);
}

// ── SUCCESS — la caja quedó rindiendo ───────────────────────────
function CajaSuccess({ caja, onGoCaja, onGoPesos }) {
  return (
    <Screen bg="#F3F3F3" footer={
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Btn variant="primary" onClick={onGoCaja}>Ver mi caja</Btn>
        <Btn variant="ghost" onClick={onGoPesos}>Ver todas mis cajas</Btn>
      </div>
    }>
      <div style={{ padding: '46px 20px 8px', display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center', textAlign: 'center' }}>
        <div style={{ animation: 'lc-pop .5s cubic-bezier(.3,1.4,.5,1) both' }}>
          <div style={{ width: 76, height: 76, borderRadius: 999, background: 'var(--c-lime-40)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 26px rgba(150,196,0,0.4)' }}>
            <LI name="feedback-positive" size={40} color="#141414" />
          </div>
        </div>
        <div>
          <div style={{ font: '500 26px Geist', letterSpacing: '-0.02em', color: LX.text1 }}>¡Tu plata ya está rindiendo!</div>
          <div style={{ font: '400 14px Inter', color: LX.text2, marginTop: 8, lineHeight: 1.5 }}>
            Apartaste <b style={{ color: LX.text1 }}>{fmtP(caja.amount)}</b> en <b style={{ color: LX.text1 }}>{caja.name}</b>.<br />
            Desde hoy genera rendimientos todos los días.
          </div>
        </div>

        <div style={{ width: '100%', background: LX.layer, borderRadius: 22, padding: 18, boxShadow: 'var(--shadow-card)', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
            <CajaBadge caja={caja} size={46} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ font: '500 16px Geist', letterSpacing: '-0.01em', color: '#141414' }}>{caja.name}</div>
              <div style={{ font: '400 12px Inter', color: '#818181', marginTop: 2 }}>{caja.goal ? `Objetivo ${fmtP(caja.goal)}` : 'Caja libre'}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ font: '500 16px Geist', color: '#141414' }}>{fmtP(caja.amount)}</div>
              <TnaChip compact label={TNA_LABEL} />
            </div>
          </div>
          {caja.goal &&
          <div style={{ marginTop: 14 }}><Meter value={Math.min(1, caja.amount / caja.goal)} color={caja.fg} h={6} /></div>}
          <Divider style={{ margin: '14px 0' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <LI name="earn" size={17} color="var(--c-lime-60)" />
            <span style={{ font: '400 13px Inter', color: LX.text2, lineHeight: 1.4 }}>
              A este ritmo suma <b style={{ color: LX.text1 }}>≈ +{fmtP(monthlyYield(caja.amount))} por mes</b>, sin que hagas nada.
            </span>
          </div>
        </div>

        <div style={{ font: '400 12px Inter', color: LX.text3, lineHeight: 1.5, maxWidth: 300 }}>
          La tarjeta y el QR no ven esta plata: quedó apartada de verdad. La retirás cuando quieras, al instante.
        </div>
      </div>
    </Screen>);
}

// ── DETALLE DE CAJA — dos modos: libre (rendimiento protagonista)
//    y con objetivo (progreso + cómo el rendimiento te empuja) ───
function CajaDetail({ caja, onBack, onAdd, onWithdraw, onSave }) {
  const [editOpen, setEditOpen] = useStateX(false);
  const total = cajaTotal(caja);
  const daily = dailyYield(total);
  const monthly = monthlyYield(total);
  const pct = caja.goal ? total / caja.goal : null;
  const remaining = caja.goal ? Math.max(0, caja.goal - total) : null;
  const reached = caja.goal && remaining <= 0;

  return (
    <div style={{ height: '100%', position: 'relative' }}>
    <Screen bg="#F3F3F3">
      {/* header con Editar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', height: 52 }}>
        <button onClick={onBack} style={{ border: 0, background: 'transparent', cursor: 'pointer', width: 40, height: 40 }}>
          <LI name="arrow-back" size={22} color={LX.text1} />
        </button>
        <div style={{ flex: 1, textAlign: 'center', font: '600 16px Inter', color: LX.text1 }}>{caja.name}</div>
        <button onClick={() => setEditOpen(true)} style={{ border: 0, background: 'transparent', cursor: 'pointer', width: 40, height: 40 }}>
          <LI name="edit" size={20} color={LX.text1} />
        </button>
      </div>

      <div style={{ padding: '10px 16px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* hero: saldo + acciones */}
        <div style={{ background: LX.layer, borderRadius: 24, padding: '22px 20px 18px', boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <CajaBadge caja={caja} size={56} />
          <div style={{ marginTop: 12 }}><BigAmount value={total} size={38} /></div>
          {!caja.goal &&
          <div style={{ font: '400 12px Inter', color: '#818181', marginTop: 8 }}>Caja libre</div>}
          <div style={{ display: 'flex', gap: 10, marginTop: 18, width: '100%' }}>
            <button onClick={onAdd} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: 0, cursor: 'pointer', borderRadius: 999, padding: '13px 0', background: '#141414', color: '#fff', font: '600 14px Inter' }}>
              <LI name="deposit" size={17} color="var(--c-lime-40)" /> Agregar
            </button>
            <button onClick={onWithdraw} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: 0, cursor: 'pointer', borderRadius: 999, padding: '13px 0', background: 'rgba(8,8,9,0.07)', color: '#141414', font: '600 14px Inter' }}>
              <LI name="returns" size={17} color="#141414" /> Retirar
            </button>
          </div>
        </div>

        {!caja.goal ?
        /* ── MODO LIBRE: el rendimiento es EL feature ── */
        <div style={{ background: LX.layer, borderRadius: 24, padding: 18, boxShadow: 'var(--shadow-card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ font: '500 16px Geist', letterSpacing: '-0.01em', color: '#141414' }}>Tu rendimiento</span>
            <TnaChip compact label={TNA_LABEL} />
          </div>

          {caja.earned > 0 ?
          <>
            <div style={{ font: '500 30px Geist', letterSpacing: '-0.02em', color: 'var(--c-lemon-50)', marginTop: 12 }}>+{fmtP2(caja.earned)}</div>
            <div style={{ font: '400 12px Inter', color: '#818181', marginTop: 2 }}>generados desde que la creaste</div>
          </> :
          <>
            <div style={{ font: '500 30px Geist', letterSpacing: '-0.02em', color: 'var(--c-lemon-50)', marginTop: 12 }}>≈ +{fmtP(daily)} hoy</div>
            <div style={{ font: '400 12px Inter', color: '#818181', marginTop: 2 }}>tu primer rendimiento se acredita hoy mismo</div>
          </>}

          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            {[['Hoy', `≈ +${fmtP(daily)}`], ['Ritmo mensual', `≈ +${fmtP(monthly)}`]].map(([k, v]) =>
            <div key={k} style={{ flex: 1, background: 'rgba(8,8,9,0.04)', borderRadius: 14, padding: '10px 12px' }}>
                <div style={{ font: '400 11px Inter', color: '#818181' }}>{k}</div>
                <div style={{ font: '500 15px Geist', letterSpacing: '-0.01em', color: '#141414', marginTop: 2 }}>{v}</div>
              </div>)}
          </div>

          <Divider style={{ margin: '16px 0 14px' }} />

          <div style={{ font: '400 13px Inter', color: LX.text2, lineHeight: 1.45 }}>
            {caja.earned > 0 ?
            <>De tus <b style={{ color: '#141414' }}>{fmtP(total)}</b>, <b style={{ color: 'var(--c-lemon-50)' }}>{fmtP(caja.earned)}</b> los generó el rendimiento.</> :
            <>Todo tu saldo es aporte, por ahora: el rendimiento empieza a sumar hoy.</>}
          </div>
          <div style={{ marginTop: 10 }}><AporteVsRendBar caja={caja} /></div>

          <div style={{ marginTop: 16 }}><CajaSparkline caja={caja} /></div>
        </div> :

        /* ── MODO OBJETIVO: progreso + el rendimiento te empuja ── */
        <>
        <div style={{ background: LX.layer, borderRadius: 24, padding: 18, boxShadow: 'var(--shadow-card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <ProgressRing pct={pct} color={caja.fg} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ font: '400 12px Inter', color: '#818181' }}>Tu objetivo</div>
              <div style={{ font: '500 20px Geist', letterSpacing: '-0.01em', color: '#141414', marginTop: 2 }}>{fmtP(caja.goal)}</div>
              {reached ?
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--c-lime-40)', borderRadius: 999, padding: '5px 12px', font: '600 13px Inter', color: '#080808', marginTop: 8 }}>
                  <LI name="feedback-positive" size={15} color="#080808" /> ¡Llegaste!
                </div> :
              <div style={{ font: '500 14px Inter', color: '#141414', marginTop: 8 }}>Te faltan <b>{fmtP(remaining)}</b></div>}
            </div>
          </div>
        </div>

        <div style={{ background: LX.layer, borderRadius: 24, padding: 18, boxShadow: 'var(--shadow-card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <LI name="earn" size={18} color="var(--c-lime-60)" />
            <span style={{ flex: 1, font: '500 16px Geist', letterSpacing: '-0.01em', color: '#141414' }}>El rendimiento te empuja</span>
            <TnaChip compact label={TNA_LABEL} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            {[['Generado hasta ahora', `+${fmtP2(caja.earned)}`], ['Próximos 30 días', `≈ +${fmtP(daily * 30)}`]].map(([k, v]) =>
            <div key={k} style={{ flex: 1, background: 'rgba(8,8,9,0.04)', borderRadius: 14, padding: '10px 12px' }}>
                <div style={{ font: '400 11px Inter', color: '#818181' }}>{k}</div>
                <div style={{ font: '500 15px Geist', letterSpacing: '-0.01em', color: 'var(--c-lemon-50)', marginTop: 2 }}>{v}</div>
              </div>)}
          </div>
        </div>
        </>}

        <NoGastoHint />

        {/* movimientos */}
        <div style={{ font: '500 16px Geist', letterSpacing: '-0.01em', color: '#141414', margin: '6px 2px 0' }}>Movimientos</div>
        <Surface pad={4}>
          <div style={{ padding: '0 12px' }}>
            {caja.movs.map((m, i) =>
            <React.Fragment key={i}>
                {i > 0 && <Divider />}
                <MoveRow icon={m.icon} title={m.title} date={m.date} amount={m.amount} sign={m.sign} />
              </React.Fragment>)}
          </div>
        </Surface>
      </div>
    </Screen>

    <EditCajaSheet open={editOpen} caja={caja} onClose={() => setEditOpen(false)}
      onSave={(patch) => { onSave(patch); setEditOpen(false); }} />
    </div>);
}

// ── Editar caja: nombre + emoji + objetivo (libre ↔ objetivo) ────
function EditCajaSheet({ open, caja, onClose, onSave }) {
  const [name, setName] = useStateX(caja.name);
  const [emoji, setEmoji] = useStateX(caja.emoji);
  const [goal, setGoal] = useStateX(caja.goal);
  const [customGoal, setCustomGoal] = useStateX(false);
  useEffectX(() => {
    if (open) {
      setName(caja.name); setEmoji(caja.emoji); setGoal(caja.goal);
      setCustomGoal(caja.goal != null && ![500000, 1000000].includes(caja.goal));
    }
  }, [open]);

  const chips = [[null, 'Sin objetivo'], [500000, '$500.000'], [1000000, '$1.000.000']];

  return (
    <Sheet open={open} onClose={onClose}>
      <div style={{ font: '500 20px Geist', letterSpacing: '-0.01em', color: LX.text1, margin: '2px 2px 14px' }}>Editar caja</div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 16, padding: '12px 14px', border: `1px solid ${LX.border}` }}>
        <CajaBadge caja={{ emoji, icon: caja.icon, bg: caja.bg, fg: caja.fg }} size={38} />
        <input value={name} maxLength={28} onChange={(e) => setName(e.target.value)} placeholder="Nombre de la caja"
        style={{ flex: 1, minWidth: 0, border: 0, outline: 'none', background: 'transparent', font: '500 17px Geist', letterSpacing: '-0.01em', color: '#141414' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 5, marginTop: 12 }}>
        {CAJA_EMOJIS.map((e) =>
        <button key={e} onClick={() => setEmoji(e)} style={{ aspectRatio: '1', border: emoji === e ? '2px solid #141414' : `1.5px solid ${LX.border}`, cursor: 'pointer', borderRadius: 10, background: emoji === e ? caja.bg : '#fff', fontSize: 15, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>{e}</button>)}
      </div>

      <div style={{ font: '600 12px Inter', color: LX.text3, letterSpacing: '0.02em', textTransform: 'uppercase', margin: '18px 2px 10px' }}>Objetivo</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {chips.map(([v, lb]) =>
        <button key={lb} onClick={() => { setGoal(v); setCustomGoal(false); }} style={{ border: !customGoal && goal === v ? '1.5px solid #141414' : `1.5px solid ${LX.border}`, cursor: 'pointer', borderRadius: 999, padding: '9px 15px', background: !customGoal && goal === v ? '#141414' : '#fff', font: '600 13px Inter', color: !customGoal && goal === v ? '#fff' : '#141414' }}>{lb}</button>)}
        <button onClick={() => setCustomGoal(true)} style={{ border: customGoal ? '1.5px solid #141414' : `1.5px solid ${LX.border}`, cursor: 'pointer', borderRadius: 999, padding: '9px 15px', background: customGoal ? '#141414' : '#fff', font: '600 13px Inter', color: customGoal ? '#fff' : '#141414' }}>Otro monto</button>
      </div>
      {customGoal &&
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 14, padding: '11px 14px', marginTop: 10, border: `1.5px solid ${LX.border}` }}>
          <span style={{ font: '500 16px Geist', color: '#B4B4B4' }}>$</span>
          <input
          inputMode="numeric"
          value={goal ? goal.toLocaleString('es-AR') : ''}
          onChange={(e) => { const n = parseInt(e.target.value.replace(/\D/g, ''), 10); setGoal(n > 0 ? Math.min(n, 999999999) : null); }}
          placeholder="¿Cuánto querés juntar?"
          style={{ flex: 1, minWidth: 0, border: 0, outline: 'none', background: 'transparent', font: '500 16px Geist', letterSpacing: '-0.01em', color: '#141414' }} />
        </div>}
      <div style={{ font: '400 12px Inter', color: LX.text3, margin: '10px 2px 0', lineHeight: 1.45 }}>
        {goal ? 'Con objetivo, el detalle te muestra el progreso y cuánto te empuja el rendimiento.' : 'Sin objetivo, la caja rinde libre y el detalle se enfoca en tus rendimientos.'}
      </div>

      <Btn variant="primary" disabled={!name.trim() || (customGoal && !goal)} onClick={() => onSave({ name: name.trim(), emoji, goal })} style={{ marginTop: 18 }}>Guardar cambios</Btn>
    </Sheet>);
}

Object.assign(window, { TopBar, NavPill, BalanceTabs, InicioHome, PortfolioHome, PesosScreen, CajasHome, CreateCajaFlow, CajaSuccess, CajaDetail, EditCajaSheet });
