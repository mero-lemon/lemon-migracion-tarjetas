// Shell de la app Lemon: home, portfolio y la home de Mini apps.
// Portado de los otros prototipos (cards/cajas) + la home de Mini apps
// según el Figma Proto_MiniApps_Home (tiles con gradiente, banner de
// novedad lime, tabs Para vos / Descubrí, nav flotante + QR).
const { useState: useStateA } = React;

// ── Top bar de la app (lemontag + search/rewards/notifications) ──
const GTopBar = () =>
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px 10px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 999, padding: '6px 14px 6px 6px', boxShadow: 'var(--shadow-card)' }}>
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

// ── Nav flotante (pill blanca + QR) — mismo estilo activo que Cofres ──
const GNavBar = ({ active, onHome, onPortfolio, onMiniApps }) => {
  const items = [
    ['home', 'home', onHome],
    ['portfolio', 'portfolio', onPortfolio],
    ['activity', 'activity', null],
    ['apps', 'mini-apps', onMiniApps]];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-around', background: '#fff', borderRadius: 999, padding: '12px 14px', boxShadow: '0 10px 28px rgba(0,0,0,0.10)' }}>
        {items.map(([id, ic, fn]) => {
          const on = id === active;
          return (
            <button key={id} onClick={fn || undefined} style={{
              border: 0, background: on ? '#FAFAFA' : 'transparent', borderRadius: 999, padding: '6px 10px',
              cursor: fn && !on ? 'pointer' : 'default', display: 'flex', transition: 'background .2s'
            }}>
              <LI name={`${ic}-${on ? 'on' : 'off'}`} size={22} color={on ? '#080808' : '#818181'} />
            </button>);
        })}
      </div>
      <div style={{ width: 52, height: 52, borderRadius: 999, background: '#141414', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 10px 28px rgba(0,0,0,0.18)' }}>
        <LI name="QR-Scanner" size={24} color="var(--c-lime-40)" />
      </div>
    </div>);
};

// ── Tabs Inicio / Portfolio de la balance card ──────────────────
const GBalanceTabs = ({ active, onInicio, onPortfolio }) =>
  <div style={{ display: 'flex' }}>
    <button onClick={onInicio} style={{ flex: 1, border: 0, textAlign: 'center', font: '500 12px Inter', letterSpacing: '-0.1px', color: '#141414', padding: '14px 0', cursor: active === 'inicio' ? 'default' : 'pointer', background: active === 'inicio' ? 'transparent' : 'var(--c-lime-40)', borderRadius: active === 'inicio' ? 0 : '32px 0 24px 0' }}>Inicio</button>
    <button onClick={onPortfolio} style={{ flex: 1, border: 0, textAlign: 'center', font: '500 12px Inter', letterSpacing: '-0.1px', color: '#141414', padding: '14px 0', cursor: active === 'portfolio' ? 'default' : 'pointer', background: active === 'portfolio' ? 'transparent' : 'var(--c-lime-40)', borderRadius: active === 'portfolio' ? 0 : '0 32px 0 24px' }}>Portfolio</button>
  </div>;

// ── Mini apps de Lemon (gradientes del Figma) ───────────────────
const MINI_APPS = [
  { id: 'servicios', name: 'Servicios', icon: 'receipt', bg: 'linear-gradient(316.38deg, #520071 0%, #7B4EC8 92.46%)', inset: 'inset 1px 1px 4px rgba(113,60,180,0.6)' },
  { id: 'gastos', name: 'Tus gastos', icon: 'spend', bg: 'linear-gradient(180deg, #282828 0%, #141414 100%)', inset: 'inset 1px 1px 4px -1px rgba(255,255,255,0.25)', lime: true, nuevo: true },
  { id: 'earn', name: 'Earn', icon: 'earn', bg: 'linear-gradient(135deg, #FF8200 0%, #854600 100%)', inset: 'inset 1px 1px 4px -1px rgba(255,255,255,0.36)' },
  { id: 'p2p', name: 'P2P', icon: 'friends', bg: 'linear-gradient(137.7deg, #007D36 9.86%, #003D1B 95.32%)', inset: 'inset 1px 1px 4px -1px rgba(0,240,104,0.38)' },
  { id: 'euros', name: 'Euros', glyph: '€', bg: 'linear-gradient(315deg, #0E1B44 0%, #1B3381 100%)', inset: 'inset 1px 1px 4px -1px #1A317C' },
  { id: 'usd', name: 'USD', glyph: 'U$', bg: 'linear-gradient(135deg, #1CB854 0%, #0F602C 100%)', inset: 'inset 1px 1px 4px -1px #BCBC99' },
  { id: 'pix', name: 'PIX', icon: 'pix-on', bg: 'linear-gradient(314.43deg, #01201D 4.9%, #05877B 95.08%)', inset: 'inset 1px 1px 4px -1px #057E73' },
  { id: 'amigos', name: 'Amigos', emoji: '🍋', bg: 'linear-gradient(137.7deg, #2D2D2D 9.86%, #191919 95.32%)', inset: 'inset 1px 1px 4px -1px #2C2C2C' }];

// badge de la esquina: mini-app oficial de Lemon
const LemonTag = () =>
  <span style={{ position: 'absolute', top: 0, right: 0, width: 17, height: 16, background: '#000', borderRadius: '0 12px 0 9px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Leaf size={10} color="#0DEA68" vein="rgba(0,0,0,0.45)" />
  </span>;

const MiniAppTile = ({ app, onTap, size = 56, labeled = true }) =>
  <button onClick={onTap || undefined} style={{ border: 0, background: 'transparent', padding: 0, cursor: onTap ? 'pointer' : 'default', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 0 }}>
    <div style={{ position: 'relative', width: size, height: size, borderRadius: 12, background: app.bg, boxShadow: app.inset, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {app.emoji ?
        <span style={{ fontSize: Math.round(size * 0.44), lineHeight: 1, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}>{app.emoji}</span> :
        app.glyph ?
          <span style={{ font: `500 ${Math.round(size * 0.36)}px Geist`, letterSpacing: '-0.02em', color: '#fff', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}>{app.glyph}</span> :
          <LI name={app.icon} size={Math.round(size * 0.46)} color={app.lime ? 'var(--c-lime-40)' : '#fff'} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }} />}
      <LemonTag />
    </div>
    {labeled &&
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, font: '500 11px Inter', letterSpacing: '-0.1px', color: '#141414' }}>
        {app.name}
        {app.nuevo && <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--c-lemon-40)' }} />}
      </span>}
  </button>;

// ── Lemon Card en el home (Per_Home real: card lime 328x204 r32 con
//    label "Tarjeta virtual" → acá "Lemon Card" + •• 1234 y MC mono) ──
const LemonCardHome = () =>
  <div style={{ position: 'relative', width: '100%', aspectRatio: '328 / 204', borderRadius: 32, background: '#CFFF2E', border: '1px solid rgba(255,255,255,0.2)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
    {/* eco de la textura cromatográfica del arte real, en gradientes */}
    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(95% 130% at 85% -12%, rgba(0,202,87,0.5) 0%, rgba(0,202,87,0) 55%), radial-gradient(75% 105% at 6% 112%, rgba(150,196,0,0.55) 0%, rgba(150,196,0,0) 58%), linear-gradient(118deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 34%)', opacity: 0.5 }} />
    <div style={{ position: 'absolute', left: 24, top: 22 }}>
      <Leaf size={26} color="#141414" vein="rgba(207,255,46,0.5)" />
    </div>
    <div style={{ position: 'absolute', left: 24, bottom: 18 }}>
      <div style={{ font: '500 14px Inter', letterSpacing: '-0.1px', color: '#1C1C1C' }}>Lemon Card</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
        <span style={{ display: 'flex', gap: 2 }}>
          <span style={{ width: 4, height: 4, borderRadius: 999, background: '#1C1C1C' }} />
          <span style={{ width: 4, height: 4, borderRadius: 999, background: '#1C1C1C' }} />
        </span>
        <span style={{ font: '400 12px Inter', letterSpacing: '-0.1px', color: '#1C1C1C' }}>1234</span>
      </div>
    </div>
    {/* mastercard mono */}
    <div style={{ position: 'absolute', right: 24, bottom: 20, display: 'flex' }}>
      <span style={{ width: 17, height: 17, borderRadius: 999, background: '#1C1C1C' }} />
      <span style={{ width: 17, height: 17, borderRadius: 999, background: '#1C1C1C', marginLeft: -6, opacity: 0.8 }} />
    </div>
  </div>;

// ── Banner de novedad — anatomía del banner real de la app (card
//    blanca 84px, arte 60, título Geist 13 + bajada Inter 12 gris, X
//    para cerrar, abajo del home). Contra la ceguera de banner, tres
//    señales medidas: el color vive en el arte, entrada animada al
//    cargar, y un brillo lime que pasa dos veces y se apaga.
const GastosNovedadBanner = ({ onTap, onClose }) =>
  <div style={{ position: 'relative', animation: 'lc-toast .5s cubic-bezier(.25,.85,.3,1) .35s both' }}>
    <button onClick={onTap} style={{ position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: 12, width: '100%', minHeight: 84, textAlign: 'left', cursor: 'pointer', background: '#fff', border: '1.5px solid rgba(207,255,46,0.9)', borderRadius: 24, padding: '12px 34px 12px 12px', boxShadow: '0 8px 20px rgba(160,220,20,0.22), 0 4px 8px rgba(43,42,40,0.04)' }}>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '30%', pointerEvents: 'none', background: 'linear-gradient(90deg, transparent, rgba(207,255,46,0.4), transparent)', animation: 'lc-shine 3.2s ease-in-out 1s infinite' }} />
      <div style={{ position: 'relative', width: 60, height: 60, flexShrink: 0, borderRadius: 16, background: 'linear-gradient(180deg, #282828 0%, #141414 100%)', boxShadow: 'inset 1px 1px 4px -1px rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LI name="spend" size={27} color="var(--c-lime-40)" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }} />
        <LemonTag />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ font: '500 14px Geist', letterSpacing: '-0.01em', color: '#1C1C1C' }}>Llegó Tus gastos</span>
          <span style={{ background: 'var(--c-lime-40)', color: '#080808', font: '700 9px Inter', letterSpacing: '0.06em', padding: '2px 7px', borderRadius: 999 }}>NUEVO</span>
        </div>
        {/* una sola línea: misma altura que el banner de Cofres */}
        <div style={{ font: '400 12px Inter', lineHeight: '18px', letterSpacing: '-0.1px', color: '#5E5E5E', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Entendé en qué se va tu plata.</div>
      </div>
    </button>
    {onClose &&
      <button onClick={onClose} style={{ position: 'absolute', top: 8, right: 8, width: 26, height: 26, border: 0, borderRadius: 999, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LI name="close" size={14} color="#B4B4B4" />
      </button>}
  </div>;

// ── HOME de la app ──────────────────────────────────────────────
function AppHome({ onPortfolio, onMiniApps, onGastos, promoOff, onClosePromo }) {
  return (
    <GScreen bg="#F3F3F3" footer={<GNavBar active="home" onPortfolio={onPortfolio} onMiniApps={onMiniApps} />}>
      {/* columna a pantalla completa: la novedad vive abajo, sobre el nav,
          como el banner de la app real */}
      <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
        <GTopBar />
        <div style={{ flex: 1, padding: '4px 16px 8px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#fff', borderRadius: 32, overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
            <GBalanceTabs active="inicio" onPortfolio={onPortfolio} />
            <div style={{ padding: '20px 24px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ font: '500 16px Geist', color: '#818181', letterSpacing: '-0.1px' }}>Pesos digitales</span>
                <LI name="view-balance-on" size={18} color="#818181" />
              </div>
              <div style={{ marginTop: 6 }}><GBigAmount value={1487283.93} prefix="$" size={44} /></div>
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

          {/* tu Lemon Card, como en la home real */}
          <LemonCardHome />

          <div style={{ flex: 1 }} />

          {/* la novedad: Mis gastos */}
          {!promoOff && <GastosNovedadBanner onTap={onGastos} onClose={onClosePromo} />}
        </div>
      </div>
    </GScreen>);
}

// ── PORTFOLIO ───────────────────────────────────────────────────
function AppPortfolio({ onHome, onMiniApps }) {
  const assets = [
    { id: 'pesos', icon: 'currency-peso', label: 'Pesos digitales', value: '$1.487.283,93', chip: '36,2%' },
    { id: 'dolares', icon: 'currency-dollar', label: 'Dólares digitales', value: 'U$2.234,15', chip: '4,6%' },
    { id: 'crypto', icon: 'currency-bitcoin', label: 'Bitcoin & crypto', value: 'U$1.245,23' },
    { id: 'acciones', icon: 'stocks', label: 'Acciones', value: 'U$3.023,05' }];

  return (
    <GScreen bg="#F3F3F3" footer={<GNavBar active="portfolio" onHome={onHome} onMiniApps={onMiniApps} />}>
      <GTopBar />
      <div style={{ padding: '4px 16px 8px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ background: '#fff', borderRadius: 32, overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
          <GBalanceTabs active="portfolio" onInicio={onHome} />
          <div style={{ padding: '20px 24px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ font: '500 16px Geist', color: '#818181', letterSpacing: '-0.1px' }}>Balance total</span>
              <LI name="view-balance-on" size={18} color="#818181" />
            </div>
            <div style={{ marginTop: 6 }}><GBigAmount value={7741.83} prefix="U$" size={44} /></div>
            <div style={{ font: '500 14px Inter', letterSpacing: '-0.1px', color: '#818181', marginTop: 8 }}>≈ $9.290.196,45</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {assets.map((a) =>
            <div key={a.id} style={{ position: 'relative', height: 160, background: '#fff', borderRadius: 24, padding: 16, display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-card)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ width: 40, height: 40, borderRadius: 999, background: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LI name={a.icon} size={20} color="#818181" />
                </div>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {a.chip && <span style={{ background: 'var(--c-lime-40)', color: 'rgba(8,8,8,0.7)', font: '400 12px Inter', letterSpacing: '-0.1px', padding: '3px 8px', borderRadius: 101 }}>{a.chip}</span>}
                  <LI name="arrow-foward" size={17} color="#B4B4B4" />
                </span>
              </div>
              <div style={{ flex: 1 }} />
              <div style={{ font: '500 12px Inter', letterSpacing: '-0.1px', color: '#818181' }}>{a.label}</div>
              <div style={{ font: '500 20px Geist', lineHeight: '26px', letterSpacing: '-0.01em', color: '#141414', marginTop: 4 }}>{a.value}</div>
            </div>)}
        </div>
      </div>
    </GScreen>);
}

// ── HOME DE MINI APPS — tabs Para vos / Descubrí (Figma) ────────
const DISCOVER_APPS = [
  { name: 'Beefy', sub: 'Optimizá rendimientos DeFi en un tap', users: '15k usuarios', emoji: '🐮', bg: '#050505' },
  { name: 'Curve', sub: 'Cambiá stables con el mejor precio', users: '8k usuarios', emoji: '🌀', bg: 'linear-gradient(135deg, #1A2B6B 0%, #0E1B44 100%)' },
  { name: 'Aave', sub: 'Prestá y pedí prestado, sin banco', users: '22k usuarios', emoji: '👻', bg: 'linear-gradient(135deg, #2B2F6B 0%, #05877B 100%)' }];

function MiniAppsHome({ onHome, onPortfolio, onOpenGastos, promoOff, onClosePromo }) {
  const [tab, setTab] = useStateA('vos'); // vos | descubri

  return (
    <GScreen bg="#F3F3F3" footer={<GNavBar active="apps" onHome={onHome} onPortfolio={onPortfolio} />}>
      {/* top nav + tabs */}
      <div style={{ padding: '12px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ flex: 1, font: '500 24px Geist', lineHeight: '30px', letterSpacing: '-0.01em', color: '#141414' }}>Mini apps</span>
          <button style={{ width: 40, height: 40, borderRadius: 999, border: 0, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LI name="search" size={22} color="#141414" />
          </button>
        </div>
        <div style={{ display: 'flex', gap: 20, marginTop: 14 }}>
          {[['vos', 'Para vos'], ['descubri', 'Descubrí']].map(([id, lb]) =>
            <button key={id} onClick={() => setTab(id)} style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: '1px 0 7px', font: '500 16px Inter', letterSpacing: '-0.1px', color: tab === id ? '#141414' : '#818181', borderBottom: tab === id ? '2px solid #141414' : '2px solid transparent' }}>{lb}</button>)}
        </div>
      </div>

      {tab === 'vos' ?
        <div key="vos" style={{ animation: 'screenIn .25s ease both', padding: '20px 16px 8px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* grid de mini apps Lemon */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', rowGap: 20, justifyItems: 'center' }}>
            {MINI_APPS.map((app) =>
              <MiniAppTile key={app.id} app={app} onTap={app.id === 'gastos' ? onOpenGastos : undefined} />)}
          </div>

          {/* banner de novedad */}
          {!promoOff && <GastosNovedadBanner onTap={onOpenGastos} onClose={onClosePromo} />}
        </div> :

        <div key="descubri" style={{ animation: 'screenIn .25s ease both', padding: '18px 16px 8px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ font: '500 20px Geist', lineHeight: '26px', letterSpacing: '-0.01em', color: '#141414' }}>Descubrí</div>

          {/* nuevas mini-apps */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ font: '500 16px Geist', letterSpacing: '-0.1px', color: '#141414' }}>Nuevas mini-apps</span>
              <LI name="arrow-foward" size={16} color="#141414" />
            </div>
            {DISCOVER_APPS.map((a) =>
              <div key={a.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0' }}>
                <div style={{ width: 56, height: 56, borderRadius: 12, background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 26, lineHeight: 1, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}>{a.emoji}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ font: '500 14px Geist', letterSpacing: '-0.01em', color: '#141414' }}>{a.name}</span>
                    <span style={{ width: 14, height: 14, borderRadius: 999, background: 'linear-gradient(180deg, #00DF1A, #CFFF2E)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Leaf size={9} color="#fff" vein="rgba(0,0,0,0.2)" />
                    </span>
                    <span style={{ font: '400 12px Inter', letterSpacing: '-0.1px', color: '#B4B4B4' }}>{a.users}</span>
                  </div>
                  <div style={{ font: '400 12px Inter', lineHeight: '18px', letterSpacing: '-0.1px', color: '#818181', marginTop: 2 }}>{a.sub}</div>
                </div>
                <button style={{ height: 32, border: 0, cursor: 'pointer', borderRadius: 100, padding: '0 12px', background: 'rgba(8,8,8,0.1)', font: '600 12px Inter', letterSpacing: '-0.1px', color: '#141414', flexShrink: 0 }}>Ver</button>
              </div>)}
          </div>

          {/* card destacada con strip de types (blur) */}
          <div style={{ position: 'relative', height: 278, borderRadius: 32, overflow: 'hidden', background: 'radial-gradient(120% 90% at 78% 6%, #3a5a12 0%, #1d2b0c 40%, #191A19 78%)' }}>
            <div style={{ position: 'absolute', top: 26, left: 24, right: 24 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(207,255,46,0.16)', color: 'var(--c-lime-30)', font: '600 10px Inter', letterSpacing: '0.05em', padding: '3px 9px', borderRadius: 999 }}>
                <Leaf size={10} color="var(--c-lime-30)" /> HECHAS POR LEMON
              </span>
              <div style={{ font: '500 22px Geist', letterSpacing: '-0.01em', color: '#fff', marginTop: 10, lineHeight: 1.2 }}>Todo lo que tu plata puede hacer, en un solo lugar</div>
            </div>
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 105, background: 'linear-gradient(90deg, rgba(0,0,0,0.6) 0%, rgba(102,102,102,0.6) 100%)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 12px' }}>
              {MINI_APPS.slice(0, 4).map((app) =>
                <div key={app.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <MiniAppTile app={app} labeled={false} onTap={app.id === 'gastos' ? onOpenGastos : undefined} />
                  <span style={{ font: '500 12px Inter', letterSpacing: '-0.1px', color: '#fff' }}>{app.name}</span>
                </div>)}
            </div>
          </div>

          {/* links para devs */}
          {['Documentación para desarrolladores', 'Subí tu mini-app'].map((t) =>
            <div key={t} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ font: '500 12px Geist', letterSpacing: '-0.01em', color: '#818181' }}>{t}</span>
              <LI name="open-in-web" size={15} color="#818181" />
            </div>)}
        </div>}
    </GScreen>);
}

Object.assign(window, { GTopBar, GNavBar, GBalanceTabs, MINI_APPS, MiniAppTile, LemonTag, LemonCardHome, GastosNovedadBanner, AppHome, AppPortfolio, MiniAppsHome });
