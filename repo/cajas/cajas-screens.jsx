// Pantallas de la experiencia Cajas: Inicio, Portfolio, Pesos digitales,
// flujo de creación (plantilla → nombre/objetivo → monto), success y detalle.
const { useState: useStateX, useEffect: useEffectX } = React;

// Haptic — en la app nativa esto dispara el Taptic Engine (Expo/RN Haptics:
// notificationAsync(Success) al crear el cofre). En web es solo la Vibration
// API: funciona en Android, y es no-op en iOS Safari (Apple nunca la implementó).
const haptic = (pattern) => { try { navigator.vibrate && navigator.vibrate(pattern); } catch (e) {} };

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
function InicioHome({ disponible, cajas, totalCajas, onPortfolio, onCajas, promoOff, onClosePromo }) {
  return (
    <Screen bg="#F3F3F3" footer={<NavPill active="home" onPortfolio={onPortfolio} />}>
      {/* columna a pantalla completa: la novedad vive abajo, sobre el nav,
          como el banner de la app real */}
      <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
        <TopBar />
        <div style={{ flex: 1, padding: '4px 16px 8px', display: 'flex', flexDirection: 'column', gap: 16 }}>
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

          <div style={{ flex: 1 }} />

          {/* hook a cajas: anatomía del banner real (card blanca 84px, arte
              60, título+bajada 12, X). La salience justa: el color vive en
              el arte, entrada animada y un brillo que pasa dos veces. Solo
              hasta crear la primera (después la sección vive en Portfolio). */}
          {(cajas.length === 0 || activeCamp()) && !promoOff &&
          <div style={{ position: 'relative', animation: 'screenIn .5s cubic-bezier(.25,.85,.3,1) .35s both' }}>
            <button onClick={onCajas} style={{ position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: 12, width: '100%', minHeight: 84, textAlign: 'left', cursor: 'pointer', background: '#fff', border: '1.5px solid rgba(207,255,46,0.9)', borderRadius: 24, padding: '12px 34px 12px 12px', boxShadow: '0 8px 20px rgba(160,220,20,0.22), 0 4px 8px rgba(43,42,40,0.04)' }}>
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '30%', pointerEvents: 'none', background: 'linear-gradient(90deg, transparent, rgba(207,255,46,0.4), transparent)', animation: 'lc-shine 3.2s ease-in-out 1s infinite' }} />
              <div style={{ position: 'relative', width: 60, height: 60, flexShrink: 0, borderRadius: 16, background: 'var(--c-lime-10)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <CajaHeroArt size={54} animate={false} />
              </div>
              {/* con campaña activa, el banner vende la promo (y sigue vivo
                  aunque ya tengas cofres); sin campaña, la novedad */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ font: '500 14px Geist', letterSpacing: '-0.01em', color: '#1C1C1C' }}>{activeCamp() ? activeCamp().banner.title : 'Llegaron los Cofres'}</span>
                  <span style={{ background: activeCamp() ? '#141414' : 'var(--c-lime-40)', color: activeCamp() ? 'var(--c-lime-40)' : '#080808', font: '700 9px Inter', letterSpacing: '0.06em', padding: '2px 7px', borderRadius: 999 }}>{activeCamp() ? 'PROMO' : 'NUEVO'}</span>
                </div>
                <div style={{ font: '400 12px Inter', lineHeight: '18px', letterSpacing: '-0.1px', color: '#5E5E5E', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activeCamp() ? activeCamp().banner.copy : `Apartá por objetivo y rendí ${TNA_LABEL.replace(' TNA', '')} TNA.`}</div>
              </div>
            </button>
            {onClosePromo &&
              <button onClick={onClosePromo} style={{ position: 'absolute', top: 8, right: 8, width: 26, height: 26, border: 0, borderRadius: 999, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LI name="close" size={14} color="#B4B4B4" />
              </button>}
          </div>}
        </div>
      </div>
    </Screen>);
}

// ── PORTFOLIO — fiel al Figma: balance total + 4 activos + 5º
//    contenedor apaisado de Cofres ────────────────────────
function PortfolioHome({ disponible, disponibleUSD, cajas, totalCajas, totalCajasUSD, onInicio, onPesos, onCajas }) {
  const assets = [
  { id: 'pesos', icon: 'currency-peso', label: 'Pesos digitales', value: fmtP2(disponible), chip: TNA_LABEL.replace(' TNA', ''), onTap: onPesos },
  { id: 'dolares', icon: 'currency-dollar', label: 'Dólares digitales', value: fmtC2(disponibleUSD, 'USD'), chip: '4,6%' },
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
                <span style={{ background: 'var(--c-lime-40)', color: 'rgba(8,8,8,0.7)', font: '400 12px Inter', letterSpacing: '-0.1px', padding: '3px 8px', borderRadius: 101 }}>{a.chip}</span>}
                  <LI name="arrow-foward" size={17} color="#B4B4B4" />
                </span>
              </div>
              <div style={{ flex: 1 }} />
              <div style={{ font: '500 12px Inter', letterSpacing: '-0.1px', color: '#818181' }}>{a.label}</div>
              <div style={{ font: '500 20px Geist', lineHeight: '26px', letterSpacing: '-0.01em', color: '#141414', marginTop: 4 }}>{a.value}</div>
            </button>)}
        </div>

        {/* 5º contenedor apaisado: Cofres — mismo estilo que los 4 activos */}
        <button onClick={onCajas} style={{ position: 'relative', width: '100%', textAlign: 'left', border: 0, cursor: 'pointer', background: LX.layer, borderRadius: 24, padding: 16, boxShadow: 'var(--shadow-card)', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 999, background: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 20, lineHeight: 1 }}>
            <span style={{ filter: 'grayscale(1) contrast(0.85) brightness(1.15)' }}>💰</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ font: '500 12px Inter', letterSpacing: '-0.1px', color: '#818181' }}>Cofres</span>
              {cajas.length === 0 &&
              <span style={{ background: 'var(--c-lime-40)', color: '#080808', font: '600 10px Inter', letterSpacing: '0.03em', padding: '2px 7px', borderRadius: 101 }}>NUEVO</span>}
            </div>
            {/* total en dólares, como el Balance total — sin chip de tasa:
                con cofres de pesos y USD conviviendo, una sola tasa mentiría */}
            <div style={{ font: '500 20px Geist', lineHeight: '26px', letterSpacing: '-0.01em', color: '#141414', marginTop: 4 }}>{fmtC2(totalCajasUSD + arsToUsd(totalCajas), 'USD')}</div>
          </div>
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

        {/* acceso a Cofres (card celeste, radius 32) */}
        <button onClick={onCajas} style={{ position: 'relative', width: '100%', height: 146, textAlign: 'left', border: 0, cursor: 'pointer', background: '#009DFF', borderRadius: 32, overflow: 'hidden', padding: 0 }}>
          <div style={{ position: 'absolute', top: -50, right: -30, width: 190, height: 190, borderRadius: 999, background: 'radial-gradient(circle, rgba(207,255,46,0.25), transparent 70%)' }} />
          <div style={{ position: 'absolute', left: 16, top: 16, font: '500 16px Geist', letterSpacing: '-0.1px', color: '#FFFFFF' }}>
            {hasCajas ? 'Tus cofres' : 'Guardá en cofres'}
          </div>
          <div style={{ position: 'absolute', left: 16, top: 48, fontFamily: 'LemonCitrus, serif', fontWeight: 400, fontSize: 56, lineHeight: '56px', color: '#CFFF2E' }}>
            {effShort('ARS')}
          </div>
          <div style={{ position: 'absolute', left: 16, top: 112, font: '400 12px Inter', letterSpacing: '-0.1px', color: '#FFFFFF' }}>
            {campFor('ARS') ? `Tasa de campaña hasta el ${campFor('ARS').end} · se activa por cofre` : 'Rendimiento estimado anual'}
          </div>
          <span style={{ position: 'absolute', right: 16, bottom: 16, display: 'inline-flex', alignItems: 'center', height: 32, padding: '0 12px', background: 'rgba(8,8,8,0.1)', borderRadius: 100, font: '600 12px Inter', letterSpacing: '-0.1px', color: '#FFFFFF' }}>
            {hasCajas ? 'Mis cofres' : 'Crear cofre'}
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

// ── SECCIÓN COFRES — solo tus cofres + crear ────────────────────
// El total vive arriba como tenencia: en dólares con la aclaración en pesos
// (patrón del Balance total del Portfolio). Crear = botón primario abajo a
// lo ancho; el candado del header lleva al Blindaje (un PIN para todos).
function CajasHome({ cajas, totalCajas, totalEarned, totalCajasUSD, totalEarnedUSD, pinOn, onBack, onCreate, onOpenCaja, onSplash, onSecurity, onBeneficios }) {
  const LockBtn =
  <button onClick={onSecurity} style={{ width: 40, height: 40, borderRadius: 999, border: 0, background: pinOn ? '#141414' : LX.layer3, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
      <LI name="lock" size={19} color={pinOn ? 'var(--c-lime-40)' : LX.text1} />
    </button>;

  const totalUSD = totalCajasUSD + arsToUsd(totalCajas);
  const totalARS = totalCajas + usdToArs(totalCajasUSD);
  const hasEarned = totalEarned > 0 || totalEarnedUSD > 0;

  return (
    <Screen bg="#F3F3F3" footer={cajas.length > 0 &&
    <Btn variant="primary" leftIcon="add-more" onClick={onCreate}>Nuevo cofre</Btn>}>
      <BigHeader title="Cofres" onBack={onBack} right={cajas.length > 0 ? LockBtn : <span style={{ width: 40 }} />} />
      <div style={{ padding: '4px 16px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {cajas.length === 0 ?
        /* FTE: empty state que invita a conocer las cajas */
        <>
          <CampaignCard onOpen={onBeneficios} />
          <button onClick={onSplash} style={{ border: 0, cursor: 'pointer', textAlign: 'center', background: LX.layer, borderRadius: 24, padding: '26px 22px 24px', boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <CajaHeroArt size={168} animate={false} />
            <div style={{ font: '500 20px Geist', letterSpacing: '-0.01em', color: '#141414', marginTop: 6, maxWidth: 280 }}>Creá cofres para organizar tus ahorros</div>
            <div style={{ font: '400 13px Inter', color: '#818181', lineHeight: 1.45, maxWidth: 270, marginTop: 2 }}>
              Tu plata queda separada de tus gastos del día a día y rinde en pesos o dólares digitales.
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#141414', color: '#fff', font: '600 14px Inter', padding: '11px 22px', borderRadius: 999, marginTop: 14 }}>
              Crear mi primer cofre <LI name="arrow-foward" size={15} color="var(--c-lime-40)" />
            </span>
          </button>
        </> :

        <>
          {/* total en cofres, estilo tenencia total: U$ grande + pesos abajo */}
          <div style={{ padding: '4px 4px 2px' }}>
            <div style={{ font: '500 16px Geist', color: '#818181', letterSpacing: '-0.1px' }}>Total</div>
            <div style={{ marginTop: 6 }}><BigAmount value={totalUSD} prefix="U$" /></div>
            <div style={{ font: '500 14px Inter', letterSpacing: '-0.1px', color: '#818181', marginTop: 8 }}>≈ {fmtP2(totalARS)}</div>
            {hasEarned &&
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--c-lime-10)', borderRadius: 999, padding: '4px 12px', marginTop: 10 }}>
              <LI name="earn" size={14} color="var(--c-lime-60)" />
              <span style={{ font: '500 12px Inter', color: 'var(--c-lime-70)' }}>
                +{fmtP2(totalEarned)}{totalEarnedUSD > 0 && ` + ${fmtC2(totalEarnedUSD, 'USD')}`} generados
              </span>
            </div>}
          </div>

          {/* campaña activa: la puerta a Beneficios (activación por cofre) */}
          <CampaignCard onOpen={onBeneficios} />

          {cajas.map((c) =>
          <CajaRow key={c.id} caja={c} onTap={() => onOpenCaja(c.id)}
            boostState={c.boosted ? 'boosted' : canActivate(c, cajas) ? 'eligible' : null} />)}
        </>}
      </div>
    </Screen>);
}

// ── FLUJO DE CREACIÓN — 3 pantallas ─────────────────────────────
// 1. soñar: elegí y hacé tuyo el objetivo (nombre + emoji)
// 2. cuantificar: ponéle un número a ese sueño (o seguí sin objetivo)
// 3. arrancar: cuánto ponés hoy para empezar
function CreateCajaFlow({ available, availableUSD, isFirst, onCancel, onDone }) {
  const [step, setStep] = useStateX('dream'); // dream | goal | fund
  const [tpl, setTpl] = useStateX(null);
  const [name, setName] = useStateX('');
  const [emoji, setEmoji] = useStateX(null);
  const [goal, setGoal] = useStateX(null);
  const [currency, setCurrency] = useStateX('ARS');
  const [pickingEmoji, setPickingEmoji] = useStateX(false);
  const [sheetOpen, setSheetOpen] = useStateX(false);

  const headerTitle = isFirst ? 'Tu primer cofre' : 'Nuevo cofre';
  const pick = (t) => { setTpl(t); setName(t.id === 'custom' ? '' : t.name); setEmoji(t.emoji); setPickingEmoji(false); setSheetOpen(true); };
  // el Blindaje no es parte de la creación: es un PIN único para todos los
  // cofres y se configura desde el candado de la home (o al retirar)
  const finish = (amount) =>
  onDone({ tplId: tpl.id, name: name.trim(), emoji, goal, currency, amount });

  // ── 1. el sueño: elegís el objetivo; al elegir, sube el sheet con tu cofre ──
  if (step === 'dream')
  return (
    <div style={{ height: '100%', position: 'relative' }}>
      <Screen bg="#F3F3F3">
        <StepHeader title={headerTitle} onBack={onCancel} onClose={onCancel} />
        <div style={{ padding: '6px 16px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <div style={{ font: '500 24px Geist', letterSpacing: '-0.02em', color: LX.text1 }}>¿Qué querés lograr?</div>
            <div style={{ font: '400 14px Inter', color: LX.text2, marginTop: 6, lineHeight: 1.45 }}>Elegí tu próxima meta: creá un cofre y seguí su progreso.</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {CAJA_TEMPLATES.map((t) =>
            <button key={t.id} onClick={() => pick(t)} style={{ textAlign: 'left', cursor: 'pointer', background: LX.layer, borderRadius: 20, padding: 14, display: 'flex', flexDirection: 'column', gap: 10, boxShadow: 'var(--shadow-card)', border: tpl && tpl.id === t.id ? '2px solid #141414' : '2px solid transparent' }}>
                <CajaBadge caja={{ emoji: t.emoji, bg: t.bg }} size={40} />
                <div>
                  <div style={{ font: '500 14px Geist', letterSpacing: '-0.01em', color: '#141414', lineHeight: 1.25 }}>{t.name}</div>
                  <div style={{ font: '400 12px Inter', color: '#818181', marginTop: 3, lineHeight: 1.35 }}>{t.sub}</div>
                </div>
              </button>)}
          </div>
        </div>
      </Screen>

      {/* sube desde abajo: tu cofre armado como recap — confirmás o retocás.
          Se siente más "a confirmación" que empujar otra pantalla full.
          Es recap (no formulario): el nombre es editable pero SIN autofocus,
          así no dispara el teclado y no compite con el sheet. */}
      <Sheet open={sheetOpen} onClose={() => { setSheetOpen(false); setPickingEmoji(false); }}>
        {tpl &&
        <div style={{ textAlign: 'center', padding: '2px 2px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ font: '600 11px Inter', letterSpacing: '0.06em', textTransform: 'uppercase', color: LX.text3 }}>Tu cofre</div>
          <div key={tpl.id} style={{ marginTop: 18, animation: 'lc-pop .45s cubic-bezier(.3,1.4,.5,1) both' }}>
            <button
              onClick={() => setPickingEmoji((v) => !v)}
              style={{ position: 'relative', border: 0, background: 'transparent', padding: 0, cursor: 'pointer', lineHeight: 0 }}>
              <CajaBadge caja={{ emoji, bg: tpl.bg }} size={104} />
              <span style={{ position: 'absolute', right: -2, bottom: -2, width: 34, height: 34, borderRadius: 999, background: '#141414', border: `3px solid ${LX.page}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LI name={pickingEmoji ? 'close' : 'edit'} size={16} color="#fff" />
              </span>
            </button>
          </div>
          <input
            value={name}
            maxLength={28}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre de tu cofre"
            style={{ width: '100%', marginTop: 16, border: 0, outline: 'none', background: 'transparent', textAlign: 'center', font: '500 28px Geist', letterSpacing: '-0.02em', color: '#141414' }} />
          <div style={{ font: '400 12px Inter', color: LX.text3, marginTop: 6 }}>Tocá el nombre para cambiarlo, o el emoji para editarlo.</div>

          {pickingEmoji &&
          <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 7, marginTop: 18, animation: 'lc-pop .3s ease both' }}>
            {CAJA_EMOJIS.map((e) =>
            <button key={e} onClick={() => { setEmoji(e); setPickingEmoji(false); }} style={{ aspectRatio: '1', border: emoji === e ? '2px solid #141414' : `1.5px solid ${LX.border}`, cursor: 'pointer', borderRadius: 12, background: emoji === e ? tpl.bg : '#fff', fontSize: 18, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>{e}</button>)}
          </div>}

          {/* con qué rinde: pesos o dólares digitales */}
          <div style={{ width: '100%', display: 'flex', gap: 8, marginTop: 18 }}>
            {['ARS', 'USD'].map((k) =>
            <button key={k} onClick={() => setCurrency(k)} style={{ flex: 1, border: currency === k ? '2px solid #141414' : `1.5px solid ${LX.border}`, cursor: 'pointer', borderRadius: 14, padding: '10px 8px', background: currency === k ? '#141414' : '#fff', textAlign: 'center' }}>
                <div style={{ font: '600 13px Inter', color: currency === k ? '#fff' : '#141414' }}>{CURRENCIES[k].source}</div>
                {/* la creación es SIEMPRE a tasa base: el boost se activa
                    después, aceptando las condiciones (no se mezclan flujos) */}
                <div style={{ font: '400 12px Inter', color: currency === k ? 'var(--c-lime-40)' : '#818181', marginTop: 2 }}>Rinde {CURRENCIES[k].short} TNA</div>
              </button>)}
          </div>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6, marginTop: 22 }}>
            <Btn variant="primary" disabled={!name.trim()} onClick={() => setStep('goal')}>Confirmar</Btn>
            <Btn variant="ghost" onClick={() => { setSheetOpen(false); setPickingEmoji(false); }}>Elegir otro objetivo</Btn>
          </div>
        </div>}
      </Sheet>
    </div>);

  // ── 2. cuantificar el sueño: el monto del objetivo ──
  if (step === 'goal')
  return (
    <AmountScreen
      key={'goal' + currency}
      goalMode
      currency={currency}
      headerTitle={headerTitle}
      badge={<CajaBadge caja={{ emoji, bg: tpl.bg }} size={46} />}
      title={`¿Cuánto necesitás para ${name.trim()}?`}
      max={999999999}
      cta="Definir objetivo"
      hint="Es tu meta, no un límite: podés ajustarla cuando quieras desde “Editar”."
      secondary={{ label: 'Prefiero sin objetivo', onPress: () => { setGoal(null); setStep('fund'); } }}
      onBack={() => { setStep('dream'); setSheetOpen(true); }}
      onClose={onCancel}
      onConfirm={(v) => { setGoal(v); setStep('fund'); }} />);

  // ── 3. arrancar: cuánto ponés hoy (o creá el cofre vacío) ──
  return (
    <AmountScreen
      key={'fund' + currency}
      currency={currency}
      headerTitle={headerTitle}
      badge={<CajaBadge caja={{ emoji, bg: tpl.bg }} size={46} />}
      title="¿Con cuánto arrancás?"
      subtitle={goal ? `${name.trim()} · Objetivo ${fmtC(goal, currency)}` : name.trim()}
      max={currency === 'USD' ? availableUSD : available}
      cta="Poner a rendir"
      secondary={{ label: 'Crear sin poner plata', onPress: () => finish(0) }}
      onBack={() => setStep('goal')}
      onClose={onCancel}
      onConfirm={finish} />);
}

// ── Elegir el PIN de tus cofres (dos fases: elegir + repetir) ───
// Un único PIN que blinda los retiros de TODOS los cofres.
function PinSetScreen({ headerTitle = 'Blindaje', onBack, onSet }) {
  const [entered, setEntered] = useStateX('');
  const [first, setFirst] = useStateX(null);
  const [error, setError] = useStateX(false);
  const entRef = React.useRef('');

  const sync = (v) => { entRef.current = v; setEntered(v); };
  const digit = (d) => {
    if (entRef.current.length >= 4) return;
    const next = entRef.current + String(d);
    sync(next);
    setError(false);
    if (next.length === 4) {
      if (first == null) setTimeout(() => { setFirst(next); sync(''); }, 240);
      else if (next === first) setTimeout(() => onSet(next), 180);
      else { setError(true); setTimeout(() => { setFirst(null); sync(''); }, 550); }
    }
  };

  return (
    <Screen bg="#F3F3F3" scroll={false}>
      <StepHeader title={headerTitle} onBack={onBack} />
      <div style={{ height: 'calc(100% - 52px)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '18px 16px 0' }}>
        <span style={{ width: 64, height: 64, borderRadius: 999, background: 'var(--c-nebula-5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, lineHeight: 1 }}>🛡️</span>
        <div style={{ font: '500 22px Geist', letterSpacing: '-0.02em', color: '#141414', marginTop: 16 }}>
          {first == null ? 'Elegí el PIN de tus cofres' : 'Repetilo para confirmar'}
        </div>
        <div style={{ font: '400 13px Inter', color: '#818181', marginTop: 5, textAlign: 'center', maxWidth: 280 }}>
          {first == null ? 'Uno solo para todos: te lo vamos a pedir al retirar plata de cualquier cofre.' : 'Una vez más, así no hay dudas.'}
        </div>

        <div style={{ display: 'flex', gap: 14, marginTop: 26 }}>
          {[0, 1, 2, 3].map((i) =>
          <span key={i} style={{ width: 14, height: 14, borderRadius: 999, transition: 'background .15s', background: error ? 'var(--c-rose-40)' : i < entered.length ? '#141414' : 'rgba(8,8,9,0.12)' }} />)}
        </div>
        <div style={{ font: '500 13px Inter', color: 'var(--c-rose-40)', marginTop: 14, minHeight: 18 }}>{error ? 'No coinciden: arranquemos de nuevo.' : ''}</div>

        <div style={{ flex: 1 }} />
        <div style={{ width: '100%', paddingBottom: 34 }}>
          <Keypad onDigit={digit} onBackspace={() => { sync(entRef.current.slice(0, -1)); setError(false); }} />
        </div>
      </div>
    </Screen>);
}

// ── SUCCESS — la moneda entra a TU cofre + el monto cuenta + confetti ──
// Si hay campaña, acá se prende el banner de activación: el cofre ya existe
// (flujo de creación limpio) y este es el momento de máxima atención.
function CajaSuccess({ caja, cajas, onActivate, onGoCaja, onGoPesos }) {
  const cur = curOf(caja);
  const ck = caja.currency || 'ARS';
  const empty = caja.amount === 0;
  const goalPct = caja.goal ? Math.min(1, caja.amount / caja.goal) : 0;
  // recompensa táctil: success haptic al crear el cofre (en nativo = notification success)
  useEffectX(() => { haptic([16, 55, 32]); }, []);
  // la barrita crece sola: arranca en 0 y, apenas entra la pantalla, sube
  // hasta el progreso real — la transición del Meter hace el resto. Es el
  // gesto de "tu plata ya está rindiendo hacia el objetivo".
  const [meterFill, setMeterFill] = useStateX(0);
  useEffectX(() => {
    const t = setTimeout(() => setMeterFill(goalPct), 450);
    return () => clearTimeout(t);
  }, []);
  return (
    <Screen bg="#F3F3F3" footer={
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Btn variant="primary" onClick={onGoCaja}>Ver mi cofre</Btn>
        <Btn variant="ghost" onClick={onGoPesos}>Ver todos mis cofres</Btn>
      </div>
    }>
      <div style={{ padding: '26px 20px 8px', display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', textAlign: 'center' }}>
        <div style={{ position: 'relative' }}>
          <CajaSuccessArt caja={caja} />
          <ConfettiBurst />
        </div>
        <div>
          {/* título genérico a propósito: "¡Tu cofre ya está listo!" nunca
              choca en género/número con el nombre elegido (Vacaciones, etc.) */}
          <div style={{ font: '500 30px Geist', lineHeight: 1.15, letterSpacing: '-0.02em', color: '#141414' }}>¡Tu cofre ya está listo!</div>
          {empty &&
          <div style={{ font: '400 14px Inter', color: LX.text2, marginTop: 8, lineHeight: 1.5 }}>
            Ponele plata cuando quieras: rinde {cur.label} desde el primer peso.
          </div>}
        </div>

        <div style={{ width: '100%', background: LX.layer, borderRadius: 22, padding: 18, boxShadow: 'var(--shadow-card)', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
            <CajaBadge caja={caja} size={46} fill={caja.goal ? meterFill : null} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ font: '500 16px Geist', letterSpacing: '-0.01em', color: '#141414' }}>{caja.name}</div>
              <div style={{ font: '400 12px Inter', color: '#818181', marginTop: 2 }}>{caja.goal ? `Objetivo ${fmtC(caja.goal, ck)}` : 'Cofre libre'}</div>
            </div>
            <div style={{ font: '500 16px Geist', color: '#141414' }}>{fmtC(caja.amount, ck)}</div>
          </div>
          {caja.goal &&
          <div style={{ marginTop: 14 }}><Meter value={meterFill} color={caja.fg} h={6} /></div>}
          {/* sin línea de rendimiento acá: el "habría generado" vive solo en
              la pantalla de monto (decisión 22-jul). El vacío conserva su hint. */}
          {empty &&
          <>
            <Divider style={{ margin: '14px 0' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <LI name="earn" size={17} color="var(--c-lime-60)" />
              <span style={{ flex: 1, font: '400 13px Inter', color: LX.text2, lineHeight: 1.4 }}>
                Está vacío por ahora: agregale plata desde el cofre cuando quieras.
              </span>
              <YieldChip ck={ck} boosted={caja.boosted} compact />
            </div>
          </>}
        </div>

        {!empty &&
        <div style={{ font: '400 14px Inter', color: LX.text2, lineHeight: 1.5, maxWidth: 300 }}>
          Esta plata queda apartada y la podés retirar cuando quieras, al instante.
        </div>}

        {/* el hook de la campaña: activable acá mismo, o queda esperando
            en el detalle del cofre */}
        <div style={{ width: '100%' }}>
          <CampaignCofreCard caja={caja} cajas={cajas} onActivate={onActivate} />
        </div>
      </div>
    </Screen>);
}

// ── DETALLE DE CAJA — dos modos: libre (rendimiento protagonista)
//    y con objetivo (progreso + cómo el rendimiento te empuja) ───
function CajaDetail({ caja, cajas, pinOn, onActivate, onBack, onAdd, onWithdraw, onSave, onDelete, onMovs }) {
  const [editOpen, setEditOpen] = useStateX(false);
  const [confirmDelete, setConfirmDelete] = useStateX(false);
  const cur = curOf(caja);
  const ck = caja.currency || 'ARS';
  const total = cajaTotal(caja);
  const pct = caja.goal ? total / caja.goal : null;
  const remaining = caja.goal ? Math.max(0, caja.goal - total) : null;
  const reached = caja.goal && remaining <= 0;

  return (
    <div style={{ height: '100%', position: 'relative' }}>
    <Screen bg="#F3F3F3" footer={
    onDelete &&
    <button onClick={() => setConfirmDelete(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', border: 0, cursor: 'pointer', background: 'transparent', padding: '4px 0', font: '500 13px Inter', color: LX.text3 }}>
        Eliminar cofre
      </button>}>
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

        {/* hero: saldo + estado + progreso/rendimiento + acciones, todo en uno */}
        <div style={{ background: LX.layer, borderRadius: 24, padding: '22px 20px 18px', boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <CajaBadge caja={caja} size={56} fill={pct} />
          <div style={{ marginTop: 12 }}><BigAmount value={total} size={38} prefix={cur.prefix} /></div>
          {pinOn &&
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, font: '500 12px Inter', color: '#818181', background: 'rgba(8,8,9,0.05)', padding: '3px 10px', borderRadius: 999, marginTop: 8 }}>
            <LI name="lock" size={12} color="#818181" /> Retiros con PIN
          </span>}

          {caja.goal ?
          /* con objetivo: el progreso vive junto al saldo */
          <div style={{ width: '100%', marginTop: 16 }}>
            <Meter value={Math.min(1, pct)} color={caja.fg} h={6} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 8 }}>
              {reached ?
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--c-lime-40)', borderRadius: 999, padding: '3px 10px', font: '600 12px Inter', color: '#080808' }}>
                  <LI name="feedback-positive" size={14} color="#080808" /> ¡Llegaste!
                </span> :
              <span style={{ font: '400 13px Inter', color: '#141414' }}>Te faltan <b>{fmtC(remaining, ck)}</b></span>}
              <span style={{ font: '400 12px Inter', color: '#818181' }}>Objetivo {fmtC(caja.goal, ck)}</span>
            </div>
          </div> :
          /* libre: el rendimiento vive junto al saldo — solo lo ya generado
             (legales); sin historia todavía, la tasa habla por sí sola */
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
            {caja.earned > 0 ?
            <span style={{ font: '500 13px Inter', color: 'var(--c-lemon-50)' }}>+{fmtC2(caja.earned, ck)} <span style={{ fontWeight: 400, color: '#818181' }}>de rendimiento</span></span> :
            <span style={{ font: '400 13px Inter', color: '#818181' }}>Rinde todos los días</span>}
            <YieldChip ck={ck} boosted={caja.boosted} compact />
          </div>}

          <div style={{ display: 'flex', gap: 10, marginTop: 18, width: '100%' }}>
            <button onClick={onAdd} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: 0, cursor: 'pointer', borderRadius: 999, padding: '13px 0', background: '#141414', color: '#fff', font: '600 14px Inter' }}>
              <LI name="deposit" size={17} color="var(--c-lime-40)" /> Agregar
            </button>
            <button onClick={onWithdraw} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: 0, cursor: 'pointer', borderRadius: 999, padding: '13px 0', background: 'rgba(8,8,9,0.07)', color: '#141414', font: '600 14px Inter' }}>
              <LI name="returns" size={17} color="#141414" /> Retirar
            </button>
          </div>
        </div>

        {/* la campaña baja de tono en el detalle: una fila sobria — la
            difusión fuerte vive en la home de cofres y en Beneficios */}
        <CampaignCofreCard compact caja={caja} cajas={cajas} onActivate={onActivate} />

        {/* con objetivo, el rendimiento acompaña en su propia card — en tonos
            apagados a propósito: informa sin pelearle la atención al progreso.
            Con boost activo muestra cuánto rinde a cada tasa: la campaña tiene
            topes y la prioridad la tiene el cofre que activó primero. */}
        {caja.goal && (() => {
          const camp = caja.boosted ? campFor(ck) : null;
          const alloc = camp ? boostAlloc(caja, cajas) : null;
          return (
            <div style={{ background: LX.layer, borderRadius: 24, padding: 18, boxShadow: 'var(--shadow-card)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <LI name="earn" size={18} color="#818181" />
                <span style={{ flex: 1, font: '500 16px Geist', letterSpacing: '-0.01em', color: '#141414' }}>El rendimiento te empuja</span>
                {!camp &&
                <span style={{ font: '400 12px Inter', color: 'var(--c-lime-70)', whiteSpace: 'nowrap' }}>{curOf(caja).label}</span>}
              </div>
              <div style={{ background: 'rgba(8,8,9,0.04)', borderRadius: 14, padding: '0 14px', marginTop: 14 }}>
                {camp &&
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '11px 0' }}>
                    <div style={{ font: '400 12px Inter', color: '#818181' }}>Rinde al <b style={{ fontWeight: 500, color: 'var(--c-lime-70)' }}>{pctShort(boostTna(camp))} TNA</b></div>
                    <div style={{ font: '500 14px Geist', letterSpacing: '-0.01em', color: '#141414' }}>{fmtC(alloc.hot, ck)}</div>
                  </div>
                  {alloc.cold > 0 &&
                  <>
                    <Divider />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '11px 0' }}>
                      <div style={{ font: '400 12px Inter', color: '#818181' }}>Rinde al {curOf(caja).label} <span style={{ color: '#B4B4B4' }}>· sobre el tope</span></div>
                      <div style={{ font: '500 14px Geist', letterSpacing: '-0.01em', color: '#141414' }}>{fmtC(alloc.cold, ck)}</div>
                    </div>
                  </>}
                  <Divider />
                </>}
                {/* solo lo YA generado (legales) */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: camp ? '11px 0' : '12px 0' }}>
                  <div style={{ font: '400 12px Inter', color: '#818181' }}>Generado hasta ahora</div>
                  <div style={{ font: '500 17px Geist', letterSpacing: '-0.01em', color: 'var(--c-lemon-50)' }}>+{fmtC2(caja.earned, ck)}</div>
                </div>
              </div>
            </div>);
        })()}

        <NoGastoHint source={cur.source.toLowerCase()} />

        {/* movimientos: acceso a la pantalla con el historial completo */}
        <button onClick={onMovs} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', border: 0, cursor: 'pointer', background: LX.layer, borderRadius: 20, padding: '14px 16px', boxShadow: 'var(--shadow-card)' }}>
          <IconBadge icon="activity-off" bg="#FAFAFA" fg="#141414" size={40} />
          <span style={{ flex: 1, font: '500 14px Geist', letterSpacing: '-0.01em', color: '#141414' }}>Movimientos</span>
          <span style={{ font: '400 12px Inter', color: '#818181' }}>{caja.movs.length}</span>
          <LI name="arrow-foward" size={16} color="#B4B4B4" style={{ flexShrink: 0 }} />
        </button>
      </div>
    </Screen>

    {/* confirmación de borrado en bottom sheet: sube desde abajo con la
        consecuencia clara y un Cancelar real (el disparador vive discreto
        en el footer de la pantalla) */}
    <Sheet open={confirmDelete} onClose={() => setConfirmDelete(false)}>
      <div style={{ font: '500 20px Geist', letterSpacing: '-0.01em', color: LX.text1, margin: '2px 2px 8px' }}>¿Eliminar este cofre?</div>
      <div style={{ font: '400 14px Inter', color: LX.text2, lineHeight: 1.5, margin: '0 2px 20px' }}>
        {total > 0 ? `Tus ${fmtC(total, ck)} vuelven a ${cur.source} al instante.` : 'No tiene plata: se elimina y listo.'}
      </div>
      <Btn variant="danger" onClick={onDelete}>Eliminar cofre</Btn>
      <Btn variant="ghost" onClick={() => setConfirmDelete(false)} style={{ marginTop: 4 }}>Cancelar</Btn>
    </Sheet>

    <EditCajaSheet open={editOpen} caja={caja} onClose={() => setEditOpen(false)}
      onSave={(patch) => { onSave(patch); setEditOpen(false); }} />
    </div>);
}

// ── Movimientos del cofre: historial completo en su pantalla ────
function CajaMovsScreen({ caja, onBack }) {
  return (
    <Screen bg="#F3F3F3">
      <StepHeader title={caja.name} onBack={onBack} />
      <div style={{ padding: '10px 16px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ padding: '0 2px' }}>
          <div style={{ font: '500 24px Geist', letterSpacing: '-0.02em', color: LX.text1 }}>Movimientos</div>
          <div style={{ font: '400 13px Inter', color: LX.text2, marginTop: 4 }}>Todo lo que entró y salió de este cofre.</div>
        </div>
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
    </Screen>);
}

// ── Editar cofre: nombre + emoji + objetivo + eliminar ──────────
// (el Blindaje ya no vive acá: es un único PIN para todos los cofres,
// se configura desde el candado de la home de Cofres)
function EditCajaSheet({ open, caja, onClose, onSave }) {
  const [name, setName] = useStateX(caja.name);
  const [emoji, setEmoji] = useStateX(caja.emoji);
  const [goal, setGoal] = useStateX(caja.goal);
  const [customGoal, setCustomGoal] = useStateX(false);
  const [pickingEmoji, setPickingEmoji] = useStateX(false);
  useEffectX(() => {
    if (open) {
      setName(caja.name); setEmoji(caja.emoji); setGoal(caja.goal);
      setCustomGoal(caja.goal != null && ![500000, 1000000].includes(caja.goal));
      setPickingEmoji(false);
    }
  }, [open]);

  const cur = curOf(caja);
  const chips = [[null, 'Sin objetivo'], [500000, '$500.000'], [1000000, '$1.000.000']];

  return (
    <Sheet open={open} onClose={onClose} minHeight="58%">
      <div style={{ font: '500 20px Geist', letterSpacing: '-0.01em', color: LX.text1, margin: '2px 2px 14px' }}>Editar cofre</div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 16, padding: '12px 14px', border: `1px solid ${LX.border}` }}>
        {/* tocás el emoji para abrir el picker (viene cerrado) */}
        <button onClick={() => setPickingEmoji((v) => !v)} style={{ position: 'relative', border: 0, background: 'transparent', padding: 0, cursor: 'pointer', lineHeight: 0, flexShrink: 0 }}>
          <CajaBadge caja={{ emoji, icon: caja.icon, bg: caja.bg, fg: caja.fg }} size={38} />
          <span style={{ position: 'absolute', right: -4, bottom: -4, width: 18, height: 18, borderRadius: 999, background: '#141414', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LI name={pickingEmoji ? 'close' : 'edit'} size={9} color="#fff" />
          </span>
        </button>
        <input value={name} maxLength={28} onChange={(e) => setName(e.target.value)} placeholder="Nombre de tu cofre"
        style={{ flex: 1, minWidth: 0, border: 0, outline: 'none', background: 'transparent', font: '500 17px Geist', letterSpacing: '-0.01em', color: '#141414' }} />
      </div>

      {pickingEmoji &&
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 5, marginTop: 12, animation: 'lc-pop .3s ease both' }}>
        {CAJA_EMOJIS.map((e) =>
        <button key={e} onClick={() => { setEmoji(e); setPickingEmoji(false); }} style={{ aspectRatio: '1', border: emoji === e ? '2px solid #141414' : `1.5px solid ${LX.border}`, cursor: 'pointer', borderRadius: 10, background: emoji === e ? caja.bg : '#fff', fontSize: 15, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>{e}</button>)}
      </div>}

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
        {goal ? 'Con objetivo, el detalle te muestra el progreso y cuánto te empuja el rendimiento.' : 'Sin objetivo, el cofre rinde libre y el detalle se enfoca en tus rendimientos.'}
      </div>

      <Btn variant="primary" disabled={!name.trim() || (customGoal && !goal)} onClick={() => onSave({ name: name.trim(), emoji, goal })} style={{ marginTop: 18 }}>Guardar cambios</Btn>
      {/* eliminar cofre ya no vive acá: se movió al fondo del detalle,
          con su propia zona que se despliega para confirmar */}
    </Sheet>);
}

// ── Confirmar el retiro con el PIN de tus cofres ────────────────
// El Blindaje actúa acá, donde importa: autorizando la salida de plata.
function PinGate({ caja, amount, pin, onBack, onUnlock }) {
  const [entered, setEntered] = useStateX('');
  const [error, setError] = useStateX(false);
  const entRef = React.useRef('');
  const ck = (caja && caja.currency) || 'ARS';

  const sync = (v) => { entRef.current = v; setEntered(v); };
  const digit = (d) => {
    if (entRef.current.length >= 4) return;
    const next = entRef.current + String(d);
    sync(next);
    setError(false);
    if (next.length === 4) {
      if (next === pin) setTimeout(onUnlock, 180);
      else { setError(true); setTimeout(() => sync(''), 450); }
    }
  };

  return (
    <Screen bg="#F3F3F3" scroll={false}>
      <StepHeader title={caja.name} onBack={onBack} />
      <div style={{ height: 'calc(100% - 52px)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '18px 16px 0' }}>
        <div style={{ position: 'relative' }}>
          <CajaBadge caja={caja} size={64} />
          <span style={{ position: 'absolute', right: -6, bottom: -4, fontSize: 22 }}>🛡️</span>
        </div>
        <div style={{ font: '500 22px Geist', letterSpacing: '-0.02em', color: '#141414', marginTop: 16 }}>Confirmá el retiro</div>
        <div style={{ font: '400 13px Inter', color: '#818181', marginTop: 5, textAlign: 'center', maxWidth: 280 }}>
          {amount != null ? <>Ingresá el PIN de tus cofres para retirar <b style={{ color: '#141414' }}>{fmtC(amount, ck)}</b>.</> : 'Ingresá el PIN de tus cofres.'}
        </div>

        {/* puntos del PIN */}
        <div style={{ display: 'flex', gap: 14, marginTop: 26 }}>
          {[0, 1, 2, 3].map((i) =>
          <span key={i} style={{ width: 14, height: 14, borderRadius: 999, transition: 'background .15s', background: error ? 'var(--c-rose-40)' : i < entered.length ? '#141414' : 'rgba(8,8,9,0.12)' }} />)}
        </div>
        <div style={{ font: '500 13px Inter', color: 'var(--c-rose-40)', marginTop: 14, minHeight: 18 }}>{error ? 'PIN incorrecto, probá de nuevo.' : ''}</div>

        <div style={{ flex: 1 }} />
        <div style={{ width: '100%', paddingBottom: 34 }}>
          <Keypad onDigit={digit} onBackspace={() => { sync(entRef.current.slice(0, -1)); setError(false); }} />
        </div>
      </div>
    </Screen>);
}

// ── BLINDAJE — la sección del PIN único (candado de la home) ────
// Sin PIN: pitch + crear. Con PIN: estado activo + cambiar / quitar.
function CofresPinScreen({ pinOn, onBack, onSetPin, onRemovePin }) {
  const [confirmOff, setConfirmOff] = useStateX(false);

  return (
    <Screen bg="#F3F3F3" footer={!pinOn &&
    <Btn variant="primary" onClick={onSetPin}>Crear mi PIN</Btn>}>
      <BigHeader title="Blindaje" onBack={onBack} right={<span style={{ width: 40 }} />} />
      <div style={{ padding: '4px 16px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {!pinOn ?
        /* pitch: un único PIN para todos los cofres */
        <div style={{ background: LX.layer, borderRadius: 24, padding: '26px 22px 24px', boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <CajaLockArt size={168} />
          <div style={{ font: '500 20px Geist', letterSpacing: '-0.01em', color: '#141414', marginTop: 6 }}>Blindá tus cofres</div>
          <div style={{ font: '400 13px Inter', color: '#818181', lineHeight: 1.45, maxWidth: 280, marginTop: 4 }}>
            Un único PIN protege todos tus cofres: te lo pedimos cada vez que retires plata de cualquiera de ellos.
          </div>
        </div> :

        <>
          <div style={{ background: LX.layer, borderRadius: 24, padding: '24px 20px', boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <span style={{ width: 64, height: 64, borderRadius: 999, background: 'var(--c-lime-10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, lineHeight: 1 }}>🛡️</span>
            <div style={{ font: '500 20px Geist', letterSpacing: '-0.01em', color: '#141414', marginTop: 12 }}>Blindaje activado</div>
            <div style={{ font: '400 13px Inter', color: '#818181', lineHeight: 1.45, maxWidth: 280, marginTop: 4 }}>
              Todos tus cofres piden tu PIN para retirar plata. Uno solo, para todos.
            </div>
          </div>

          <button onClick={onSetPin} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', border: 0, cursor: 'pointer', background: LX.layer, borderRadius: 20, padding: '14px 16px', boxShadow: 'var(--shadow-card)' }}>
            <IconBadge icon="lock" bg="#FAFAFA" fg="#141414" size={40} />
            <span style={{ flex: 1, font: '500 14px Geist', letterSpacing: '-0.01em', color: '#141414' }}>Cambiar PIN</span>
            <LI name="arrow-foward" size={16} color="#B4B4B4" style={{ flexShrink: 0 }} />
          </button>

          <Btn variant="ghost" style={{ color: 'var(--c-rose-40)' }}
            onClick={() => confirmOff ? onRemovePin() : setConfirmOff(true)}>
            {confirmOff ? '¿Seguro? Tus retiros quedan sin PIN' : 'Quitar el blindaje'}
          </Btn>
        </>}
      </div>
    </Screen>);
}

Object.assign(window, { TopBar, NavPill, BalanceTabs, InicioHome, PortfolioHome, PesosScreen, CajasHome, CreateCajaFlow, CajaSuccess, CajaDetail, CajaMovsScreen, EditCajaSheet, PinGate, PinSetScreen, CofresPinScreen });
