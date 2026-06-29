// Shared screens: Screen wrapper, Tarjetas hub (entry), Address, Confirmation.
const { useState: useStateSh } = React;

// Screen shell inside the iPhone frame (clears status bar + home indicator)
const Screen = ({ children, bg = LX.page, footer, scroll = true }) =>
<div style={{ height: '100%', background: bg, display: 'flex', flexDirection: 'column', paddingTop: 48 }}>
    <div style={{ flex: 1, minHeight: 0, overflowY: scroll ? 'auto' : 'visible' }}>{children}</div>
    {footer &&
  <div style={{ padding: '12px 16px 30px', background: bg, borderTop: 'none' }}>{footer}</div>
  }
  </div>;


// reusable little stat row (cashback / análisis) like the live app
const StatCards = () =>
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
    {[['Cashback', '0,42', 'USDC', '≈ 2% por compra'], ['Análisis', '128,90', 'USD', 'Gastos de mayo']].map(([t, n, c, sub]) =>
  <Surface key={t} pad={14}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ font: '500 14px Inter', color: LX.text2 }}>{t}</span>
          <LI name="arrow-foward" size={15} color={LX.text3} />
        </div>
        <div style={{ font: '500 20px Geist', color: LX.text1, marginTop: 10, letterSpacing: '-0.02em' }}>
          {n} <span style={{ color: LX.text2, fontSize: 13 }}>{c}</span>
        </div>
        <div style={{ font: '400 12px Inter', color: LX.text3, marginTop: 2 }}>{sub}</div>
      </Surface>
  )}
  </div>;


// fila de movimiento (estilo Figma: avatar 32, Comercio Geist 14, monto +/−)
const MoveRow = ({ icon, coin, title, date, amount, sign = '−' }) =>
<div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0' }}>
    <div style={{ position: 'relative', width: 32, height: 32, borderRadius: 999, background: 'rgba(8,8,9,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <LI name={icon} size={18} color="#141414" />
      {coin &&
      <span style={{ position: 'absolute', right: -3, bottom: -3, width: 15, height: 15, borderRadius: 999, background: coin === 'btc' ? '#F7931A' : '#5b6b8c', border: '2px solid var(--bg-layer-01)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 8px Inter', color: '#fff' }}>{coin === 'btc' ? '₿' : 'Ξ'}</span>}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ font: '500 14px Geist', color: '#141414', letterSpacing: '-0.01em' }}>{title}</div>
      <div style={{ font: '400 12px Inter', color: '#818181', marginTop: 1 }}>{date}</div>
    </div>
    <div style={{ font: '500 14px Geist', color: sign === '+' ? '#00AA18' : '#141414', letterSpacing: '-0.01em' }}>{sign} {amount}</div>
  </div>;


// Module listing the cards the user owns + moneda de pago
const CardsModule = ({ cards, onCardTap, onActivate }) =>
<Surface pad={0} style={{ overflow: 'hidden' }}>
    {cards.map((c, i) =>
  <React.Fragment key={i}>
        {i > 0 && <Divider style={{ margin: '0 18px' }} />}
        <CardListItem variant={c.variant} design={c.design} title={c.title} mask={c.mask} status={c.status} activate={c.activate} onTap={onCardTap} onActivate={onActivate} />
      </React.Fragment>
  )}
    <Divider style={{ margin: '0 18px' }} />
    <MonedaDePago />
  </Surface>;


// "Prepaga / Crédito" tabs (decorative — Prepaga active)
const CardTabs = () =>
<div style={{ display: 'flex', gap: 24, padding: '0 2px 4px' }}>
    <span style={{ font: '600 18px Inter', color: LX.text1, borderBottom: `2px solid ${LX.text1}`, paddingBottom: 8 }}>Prepaga</span>
    <span style={{ font: '600 18px Inter', color: LX.text3, paddingBottom: 8 }}>Crédito</span>
  </div>;


// big NFC hero (push: pedí la nueva virtual → sumala a Apple Pay → pagá)
// Mensaje central: pedí tu nueva virtual, sumala a Apple Pay y empezá a pagar.
const NfcHero = ({ onPrimary, title = 'Dejá la billetera en casa', body = 'Pedí tu nueva virtual, sumala a Apple Pay y pagá apoyando el celu — el bondi, el súper, las birras.', cta = 'Quiero Apple Pay' }) =>
<div style={{
  position: 'relative', borderRadius: 22, overflow: 'hidden', minHeight: 300,
  background: 'radial-gradient(120% 90% at 78% 0%, #6a3fb0 0%, #3a1c64 52%, #1c0c36 100%)',
  color: '#fff', boxShadow: '0 14px 30px rgba(40,18,72,0.42)',
  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'
}}>
    {/* full-bleed image behind the text */}
    <image-slot
    id="nfc-hero-phone-pos"
    class="nfc-hero-img"
    shape="rect"
    src="cards/assets/nfc-hero-phone-pos.webp"
    position="50% 28%"
    placeholder="Celu pagando en posnet"
    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', background: 'rgba(255,255,255,0.04)' }}>
    </image-slot>
    {/* legibility scrim */}
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(28,12,54,0.15) 0%, rgba(28,12,54,0.55) 52%, rgba(20,8,40,0.92) 100%)' }} />
    <div style={{ position: 'absolute', top: -34, right: -44, width: 190, height: 190, borderRadius: 999, background: 'radial-gradient(circle, rgba(207,255,46,0.18), transparent 70%)' }} />
    {/* text + CTA over the image */}
    <div style={{ position: 'relative', padding: '22px 20px 20px' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.16)', color: '#fff', font: '600 11px Inter', padding: '4px 10px', borderRadius: 999, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
        <LI name="celphone" size={13} color="#fff" /> NUEVA FORMA DE PAGAR
      </div>
      <div style={{ font: '500 23px Geist', letterSpacing: '-0.02em', marginTop: 10, lineHeight: 1.15, textShadow: '0 1px 12px rgba(20,8,40,0.6)' }}>{title}</div>
      <div style={{ font: '400 14px Inter', color: 'rgba(255,255,255,0.82)', marginTop: 6, lineHeight: 1.45, textShadow: '0 1px 10px rgba(20,8,40,0.5)' }}>{body}</div>
      <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
        <button onClick={onPrimary} style={{ flex: 1, border: 0, cursor: 'pointer', borderRadius: 999, padding: '13px 18px', background: '#fff', color: LX.dark, font: '600 15px Inter' }}>{cta}</button>
      </div>
    </div>
  </div>;


// boutique física pitch (used when the user has no física yet)
const BoutiqueHero = ({ onPrimary, onActivate, compact, title = 'Tu Lemon, en la mano', badge = 'EDICIÓN FÍSICA', body = 'Metal-look, contactless y cashback en cripto en cada compra. Te llega a tu casa, lista para activar.', cta = 'Pedir tarjeta' }) =>
compact ?
<div style={{
  position: 'relative', overflow: 'hidden', borderRadius: 18, width: '100%',
  background: 'radial-gradient(120% 130% at 88% 10%, #14342f 0%, #0c1f23 60%, #080f12 100%)',
  padding: '14px 16px', color: '#fff'
}}>
    <button onClick={onPrimary} style={{ border: 0, background: 'transparent', cursor: 'pointer', textAlign: 'left', padding: 0, width: '100%', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ transform: 'rotate(-8deg)', flexShrink: 0 }}><CardArt variant="fisica" width={92} /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ font: '600 15px Inter', color: '#fff' }}>Pedí tu Lemon Card física</div>
        <div style={{ font: '400 12px Inter', color: 'rgba(255,255,255,0.66)', marginTop: 2, lineHeight: 1.35 }}>Edición boutique, con envío a tu casa.</div>
      </div>
      <LI name="arrow-foward" size={18} color="var(--c-lime-30)" style={{ flexShrink: 0 }} />
    </button>
    <button onClick={onActivate} style={{ marginTop: 12, width: '100%', border: 0, cursor: 'pointer', borderRadius: 999, padding: '9px 14px', background: 'rgba(255,255,255,0.12)', color: '#fff', font: '600 13px Inter' }}>¿Ya tenés una? Activala</button>
  </div> :

<div style={{
  position: 'relative', borderRadius: 22, overflow: 'hidden',
  background: 'radial-gradient(120% 90% at 80% 0%, #14342f 0%, #0c1f23 55%, #080f12 100%)',
  padding: '22px 20px 20px', color: '#fff', boxShadow: '0 14px 30px rgba(8,23,29,0.4)'
}}>
    <div style={{ position: 'absolute', top: -30, right: -40, width: 180, height: 180, borderRadius: 999, background: 'radial-gradient(circle, rgba(207,255,46,0.16), transparent 70%)' }} />
    <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0 18px' }}>
      <div style={{ transform: 'rotate(-7deg)' }}><CardArt variant="fisica" width={210} glow /></div>
    </div>
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(207,255,46,0.16)', color: 'var(--c-lime-30)', font: '600 11px Inter', padding: '4px 10px', borderRadius: 999, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
      <LI name="trusted-icon" size={13} color="var(--c-lime-30)" /> {badge}
    </div>
    <div style={{ font: '500 23px Geist', letterSpacing: '-0.02em', marginTop: 10, lineHeight: 1.15 }}>{title}</div>
    <div style={{ font: '400 14px Inter', color: 'rgba(255,255,255,0.72)', marginTop: 6, lineHeight: 1.45 }}>{body}</div>
    <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
      <button onClick={onPrimary} style={{ flex: 1, border: 0, cursor: 'pointer', borderRadius: 999, padding: '13px 18px', background: '#fff', color: LX.dark, font: '600 15px Inter' }}>{cta}</button>
      <button onClick={onActivate} style={{ border: 0, cursor: 'pointer', borderRadius: 999, padding: '13px 18px', background: 'rgba(255,255,255,0.12)', color: '#fff', font: '600 15px Inter', whiteSpace: 'nowrap' }}>Activar</button>
    </div>
  </div>;


// generic CTA card row
const CtaCard = ({ icon, iconBg = 'var(--c-lemon-5)', iconFg = 'var(--c-lemon-50)', title, sub, onClick }) =>
<button onClick={onClick} style={{
  display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', width: '100%',
  background: LX.layer, border: `1px solid ${LX.border}`, borderRadius: 16, padding: 16, cursor: 'pointer'
}}>
    <div style={{ width: 44, height: 44, borderRadius: 12, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <LI name={icon} size={24} color={iconFg} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ font: '600 15px Inter', color: LX.text1 }}>{title}</div>
      <div style={{ font: '400 13px Inter', color: LX.text2, marginTop: 2, lineHeight: 1.35 }}>{sub}</div>
    </div>
    <LI name="arrow-foward" size={18} color={LX.text3} />
  </button>;


// "Tarjeta en proceso" — seguimiento de envío + activar (post-renovación)
const TransitBanner = ({ onActivate, onTrack }) =>
<div style={{
  position: 'relative', overflow: 'hidden', borderRadius: 18,
  background: 'var(--c-lime-40)', padding: '20px 18px'
}}>
    {/* card peeking on the right */}
    <div style={{ position: 'absolute', right: -28, top: '50%', transform: 'translateY(-50%) rotate(8deg)', opacity: 0.96 }}>
      <CardArt variant="fisica" width={150} />
    </div>
    <div style={{ position: 'relative', maxWidth: 215 }}>
      <div style={{ font: '500 22px Geist', letterSpacing: '-0.02em', color: LX.dark }}>Tarjeta en proceso</div>
      <div style={{ font: '500 14px Inter', color: 'rgba(12,36,28,0.6)', marginTop: 4, lineHeight: 1.35 }}>Seguí el estado del envío en tiempo real.</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16 }}>
        <button onClick={onActivate} style={{ border: 0, cursor: 'pointer', borderRadius: 999, padding: '10px 20px', background: '#fff', color: LX.dark, font: '600 14px Inter' }}>Activar</button>
        <button onClick={onTrack} style={{ border: 0, cursor: 'pointer', borderRadius: 999, padding: '10px 18px', background: 'rgba(12,36,28,0.12)', color: LX.dark, font: '600 14px Inter', whiteSpace: 'nowrap' }}>Seguir envío</button>
        <button onClick={onTrack} style={{ width: 36, height: 36, borderRadius: 999, border: 0, cursor: 'pointer', background: 'rgba(12,36,28,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <LI name="view-help" size={18} color={LX.dark} />
        </button>
      </div>
    </div>
  </div>;


// "Compras al exterior sin impuesto" promo banner (all prepaga homes)
const ExteriorBanner = () =>
<button style={{
  display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', cursor: 'pointer', border: 0,
  background: 'linear-gradient(100deg, #0a3d1e 0%, #0f5226 55%, #0a3d1e 100%)',
  borderRadius: 16, padding: '14px 16px'
}}>
    <span style={{ font: '500 23px Geist', letterSpacing: '-0.03em', color: 'var(--c-lime-40)', flexShrink: 0 }}>−30%</span>
    <span style={{ width: 1, alignSelf: 'stretch', background: 'rgba(255,255,255,0.18)' }} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ font: '600 14px Inter', color: '#fff' }}>Compras al exterior sin impuesto</div>
      <div style={{ font: '400 12px Inter', color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>Pagá con pesos o dólares digitales</div>
    </div>
    <LI name="arrow-foward" size={18} color="var(--c-lime-40)" style={{ flexShrink: 0 }} />
  </button>;

// "+" del header → elegí qué tarjeta sumar (física / crédito). La virtual
// se crea desde el banner, no acá. No empuja: el usuario entra a propósito.
function AddCardScreen({ onBack, onClose, onFisica, onCredito }) {
  const opts = [
  { id: 'fisica', variant: 'fisica', t: 'Prepaga física', s: 'Edición boutique, con envío a tu casa. Cashback en cripto.', cta: 'Pedir', onPick: onFisica },
  { id: 'credito', variant: 'credito', t: 'Tarjeta de crédito', s: 'Respaldada con Bitcoin, sin historial crediticio.', cta: 'Próximamente', onPick: onCredito, soon: true }];

  return (
    <Screen>
      <StepHeader title="Pedí una tarjeta" onBack={onBack} onClose={onClose} />
      <div style={{ padding: '6px 16px 8px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <div style={{ font: '500 24px Geist', letterSpacing: '-0.02em', color: LX.text1 }}>¿Qué tarjeta querés sumar?</div>
          <div style={{ font: '400 14px Inter', color: LX.text2, marginTop: 6, lineHeight: 1.45 }}>Elegí la que más te sirva. La sumás a tu cuenta sin costo.</div>
        </div>
        {opts.map((o) =>
        <button key={o.id} onClick={o.soon ? undefined : o.onPick} disabled={o.soon} style={{ display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left', cursor: o.soon ? 'default' : 'pointer', background: LX.layer, border: `1px solid ${LX.border}`, borderRadius: 16, padding: 16, opacity: o.soon ? 0.6 : 1 }}>
            <CardThumb variant={o.variant} w={72} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ font: '600 16px Inter', color: LX.text1 }}>{o.t}</div>
              <div style={{ font: '400 13px Inter', color: LX.text2, marginTop: 3, lineHeight: 1.4 }}>{o.s}</div>
            </div>
            <span style={{ flexShrink: 0, border: 0, borderRadius: 999, padding: '8px 16px', font: '600 14px Inter', whiteSpace: 'nowrap', background: o.soon ? 'var(--button-disabled)' : LX.dark, color: o.soon ? 'var(--text-disabled)' : '#fff' }}>{o.cta}</span>
          </button>)}
      </div>
    </Screen>);

}

// Requisito física = pagar la tarjeta (costo único que se descuenta del saldo).
function PagarFisica({ onBack, onClose, onContinue, onChangeAddress, price = 5, balance = 240, address = ['Malabia 1720', 'Palermo, CABA · C1414AAP'] }) {
  const labelStyle = { font: '600 12px Inter', color: LX.text3, letterSpacing: '0.02em', textTransform: 'uppercase', margin: '0 2px 8px' };
  return (
    <Screen footer={<Btn variant="primary" onClick={onContinue}>Pagar y pedir</Btn>}>
      <StepHeader title="Confirmá tu pedido" onBack={onBack} onClose={onClose} />
      <div style={{ padding: '6px 16px 8px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <div style={{ font: '500 24px Geist', letterSpacing: '-0.02em', color: LX.text1 }}>Revisá tu pedido</div>
          <div style={{ font: '400 14px Inter', color: LX.text2, marginTop: 6, lineHeight: 1.45 }}>
            Confirmá los datos y pagá para que salga a tu casa.
          </div>
        </div>

        {/* 1. resumen de la tarjeta */}
        <Surface pad={14}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ flexShrink: 0, filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.18))' }}>
              <CardArt variant="fisica" width={78} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ font: '600 16px Inter', color: LX.text1 }}>Lemon Card física</div>
              <div style={{ font: '400 13px Inter', color: LX.text2, marginTop: 2, lineHeight: 1.4 }}>Activala cuándo la recibas.</div>
            </div>
          </div>
        </Surface>

        {/* 2. confirmar dirección */}
        <div>
          <div style={labelStyle}>Enviar a</div>
          <Surface pad={0} style={{ overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
              <div style={{ width: 40, height: 40, borderRadius: 999, background: LX.layer3, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <LI name="positive-location" size={20} color={LX.text1} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: '600 14px Inter', color: LX.text1 }}>{address[0]}</div>
                <div style={{ font: '400 12px Inter', color: LX.text2, marginTop: 1 }}>{address[1]}</div>
              </div>
              {onChangeAddress &&
              <button onClick={onChangeAddress} style={{ border: 0, background: 'transparent', cursor: 'pointer', font: '600 13px Inter', color: 'var(--c-greent-50)', flexShrink: 0 }}>Cambiar</button>}
            </div>
          </Surface>
        </div>

        {/* 3. pago — todo de una, sin desglose */}
        <div>
          <div style={labelStyle}>Pago</div>
          <Surface pad={0} style={{ overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
              <div style={{ width: 40, height: 40, borderRadius: 999, background: LX.layer3, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <LI name="wallet" size={20} color={LX.text1} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: '600 14px Inter', color: LX.text1 }}>Pagás con tu saldo</div>
                <div style={{ font: '400 12px Inter', color: LX.text2, marginTop: 1 }}>Disponible: US$ {balance}</div>
              </div>
              <LI name="arrow-foward" size={18} color={LX.text3} />
            </div>
            <Divider />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
              <div>
                <div style={{ font: '600 15px Inter', color: LX.text1 }}>Total a pagar</div>
                <div style={{ font: '400 12px Inter', color: LX.text2, marginTop: 1 }}>Pago único, con envío incluido.</div>
              </div>
              <span style={{ font: '500 20px Geist', letterSpacing: '-0.02em', color: LX.text1 }}>US$ {price}</span>
            </div>
          </Surface>
        </div>
      </div>
    </Screen>);

}

// Paso 1 de pedir física: value prop con animación (estilo Cash App).
function FisicaValueProp({ onBack, onClose, onContinue }) {
  const [up, setUp] = useStateSh(false);
  React.useEffect(() => { const t = setTimeout(() => setUp(true), 80);return () => clearTimeout(t); }, []);
  const props = [
  ['currency-bitcoin', 'Cashback en cripto', 'En cada compra, en pesos o dólar digital.'],
  ['currency-dollar', 'Internacional, sin impuesto extra', 'Pagá en todo el mundo con dólar digital.'],
  ['celphone', 'Contactless', 'Apoyala en el posnet y listo.'],
  ['deposit', 'Envío gratis a tu casa', 'Te la mandamos sin cargo, lista para activar.']];

  return (
    <Screen bg="radial-gradient(120% 70% at 50% 0%, #14342f 0%, #0a0a10 62%)" footer={
    <div style={{ opacity: up ? 1 : 0, transition: 'opacity .5s .5s' }}>
        <Btn variant="brand" onClick={onContinue}>Pedir mi Lemon Card</Btn>
      </div>
    }>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', height: 52 }}>
        <button onClick={onBack} style={{ border: 0, background: 'transparent', cursor: 'pointer', width: 40, height: 40 }}>
          <LI name="arrow-back" size={22} color="#fff" />
        </button>
      </div>
      <div style={{ padding: '8px 24px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* card animada: sube + flota + glow */}
        <div style={{ transform: up ? 'translateY(0) scale(1)' : 'translateY(60px) scale(0.9)', opacity: up ? 1 : 0, transition: 'transform .8s cubic-bezier(.34,1.56,.64,1), opacity .5s' }}>
          <div style={{ animation: 'lc-float 3.8s ease-in-out infinite' }}><CardArt variant="fisica" width={250} glow /></div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 24, opacity: up ? 1 : 0, transform: up ? 'none' : 'translateY(14px)', transition: 'opacity .5s .2s, transform .6s .2s' }}>
          <div style={{ font: '500 26px Geist', letterSpacing: '-0.02em', color: '#fff' }}>Tu Lemon, en la mano</div>
          <div style={{ font: '400 14px Inter', color: 'rgba(255,255,255,0.7)', marginTop: 8, lineHeight: 1.45, maxWidth: 300 }}>Edición boutique, con envío a tu casa. Esto es lo que sumás:</div>
        </div>
        {/* value props con stagger */}
        <div style={{ width: '100%', marginTop: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {props.map(([ic, t, s], i) =>
          <div key={i} style={{ display: 'flex', gap: 13, alignItems: 'flex-start', opacity: up ? 1 : 0, transform: up ? 'none' : 'translateY(16px)', transition: `opacity .5s ${0.3 + i * 0.1}s, transform .6s ${0.3 + i * 0.1}s` }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <LI name={ic} size={20} color="var(--c-lime-40)" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ font: '600 15px Inter', color: '#fff' }}>{t}</div>
                <div style={{ font: '400 12px Inter', color: 'rgba(255,255,255,0.6)', marginTop: 2, lineHeight: 1.4 }}>{s}</div>
              </div>
            </div>)}
        </div>
      </div>
    </Screen>);

}

// Paso 2 de pedir física: completar dirección (search + resultados, estilo Figma).
function AddressSearch({ onBack, onClose, onPick }) {
  const [q, setQ] = useStateSh('');
  const all = [
  ['Malabia 1720', 'Palermo, CABA · C1414AAP'],
  ['Thames 2280', 'Palermo, CABA · C1425FIF'],
  ['Av. Corrientes 4850', 'Almagro, CABA · C1414AJR'],
  ['Gurruchaga 1085', 'Villa Crespo, CABA · C1414DLR'],
  ['Av. Cabildo 2230', 'Belgrano, CABA · C1428AAV'],
  ['Defensa 670', 'San Telmo, CABA · C1065AAN']];

  const results = all.filter((a) => a[0].toLowerCase().includes(q.toLowerCase().trim()) || !q.trim());

  return (
    <Screen footer={
    <Btn variant="ghost" onClick={() => onPick(all[0])} style={{ color: 'var(--c-greent-50)' }}>No encuentro mi dirección</Btn>
    }>
      <BigHeader title="¿Dónde te la enviamos?" onBack={onBack} right={<span style={{ width: 40 }} />} />
      <div style={{ padding: '8px 16px 4px' }}>
        {/* search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: 56, padding: '0 16px', background: 'rgba(8,8,9,0.05)', border: '1px solid #E6E6E6', borderRadius: 100 }}>
          <LI name="search" size={22} color="#818181" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscá tu dirección" style={{ flex: 1, border: 0, outline: 'none', background: 'transparent', font: '400 16px Inter', color: LX.text1, letterSpacing: '-0.1px' }} />
        </div>
        <div style={{ font: '500 14px Inter', color: '#808080', margin: '20px 2px 4px' }}>Resultados</div>
      </div>
      <div>
        {results.map(([a, b], i) =>
        <button key={i} onClick={() => onPick([a, b])} style={{ display: 'block', width: '100%', textAlign: 'left', border: 0, background: 'transparent', cursor: 'pointer', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 999, background: LX.layer3, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <LI name="positive-location" size={20} color={LX.text2} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: '600 16px Inter', color: '#050505' }}>{a}</div>
                <div style={{ font: '400 14px Inter', color: '#808080', marginTop: 1 }}>{b}</div>
              </div>
            </div>
          </button>)}
      </div>
    </Screen>);

}

// Banner neutro de renovación (física por vencer) — estilo Figma: gris, 2 pills.
const RenovarBanner = ({ onRenew, onLater, title = 'Tu Lemon Card física vence pronto', body = 'Renovala antes de que venza para seguir usándola sin cortes.', cta = 'Renovar mi tarjeta', later = 'Ahora no' }) =>
<div style={{ background: 'rgba(8,8,8,0.07)', borderRadius: 24, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
    <div>
      <div style={{ font: '500 14px Geist', color: '#080808', letterSpacing: '-0.01em' }}>{title}</div>
      <div style={{ font: '400 12px Inter', color: 'rgba(8,8,8,0.7)', marginTop: 3, lineHeight: 1.5 }}>{body}</div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button onClick={onRenew} style={{ border: 0, cursor: 'pointer', borderRadius: 100, padding: '8px 14px', font: '600 12px Inter', background: LX.dark, color: '#fff' }}>{cta}</button>
      {onLater && <button onClick={onLater} style={{ border: 0, cursor: 'pointer', borderRadius: 100, padding: '8px 14px', font: '600 12px Inter', background: 'transparent', color: '#080808' }}>{later}</button>}
    </div>
  </div>;


// Banner lime "Cambia gratis tu tarjeta virtual · Apple Pay" (home de tarjetas)
// Estilo de la pieza oficial: gradiente lime con blob, tarjetas sangrando por izquierda.
const CambiaBanner = ({ onPrimary, first }) =>
<button onClick={onPrimary} style={{
  position: 'relative', overflow: 'hidden', width: '100%', textAlign: 'left', cursor: 'pointer', border: 0,
  borderRadius: 26, minHeight: 98, padding: '18px 20px 18px 126px',
  background: 'radial-gradient(110% 130% at 86% 14%, #EAFF6B 0%, rgba(234,255,107,0) 48%), linear-gradient(100deg, #6FD60A 0%, #97EC1C 52%, #B7F53A 100%)'
}}>
    {/* tarjetas sangrando por la izquierda */}
    <div style={{ position: 'absolute', left: -26, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
      <div style={{ transform: 'rotate(7deg)', filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.22))' }}><CardArt design="sticker" width={80} /></div>
      <div style={{ transform: 'rotate(-9deg)', marginLeft: -48, filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.22))' }}><CardArt design="tetrish" width={80} /></div>
    </div>
    <div style={{ position: 'relative' }}>
      <div style={{ font: '700 17px Inter', color: '#0b1a00', lineHeight: 1.18 }}>{first ? 'Creá tu tarjeta virtual' : 'Cambia gratis tu tarjeta virtual'}</div>
      <div style={{ font: '500 14px Inter', color: 'rgba(11,26,0,0.74)', marginTop: 3, lineHeight: 1.3 }}>{first ? 'Sumala a Apple Pay y empezá a pagar.' : 'Y empezá a pagar con Apple Pay'}</div>
    </div>
  </button>;


// mode: 'replaceVirtual' | 'firstVirtual' | 'fisica' | 'renewFisica' | 'twoCards'
// phase (renewFisica only): 'expiring' (default) | 'transit' | 'active'
function TarjetasHub({ mode, cards, phase = 'expiring', onPrimary, onActivate, onTrack, onBack, onCardTap, showExpiringBanner = true, showNfcBanner = false, onNfc }) {
  // sensible default ownership per mode
  const renewCards = phase === 'active' ?
  [{ variant: 'fisica', title: 'Prepaga física', mask: '•••• 5520', status: 'Activa' }, { variant: 'virtual', title: 'Prepaga virtual', mask: '•••• 8763', status: 'Activa' }] :
  [{ variant: 'fisica', title: 'Prepaga física', mask: '•••• 4971', status: 'Próximo a vencer' }, { variant: 'virtual', title: 'Prepaga virtual', mask: '•••• 8763', status: 'Activa' }];
  const owned = cards || {
    replaceVirtual: [{ variant: 'virtual', title: 'Prepaga virtual', mask: '•••• 8763', status: 'Activa' }],
    firstVirtual: [{ variant: 'fisica', title: 'Prepaga física', mask: '•••• 4971', status: 'Activa' }],
    fisica: [{ variant: 'virtual', title: 'Prepaga virtual', mask: '•••• 8763', status: 'Activa' }],
    renewFisica: renewCards,
    twoCards: [{ variant: 'fisica', title: 'Prepaga física', mask: '•••• 4971', status: 'Activa' }, { variant: 'virtual', title: 'Prepaga virtual', mask: '•••• 8763', status: 'Activa' }]
  }[mode] || [];

  // Subflujo "pedir tarjeta" (botón +): física = value prop → dirección → pago.
  const [sub, setSub] = useStateSh(null);
  const [shipAddr, setShipAddr] = useStateSh(undefined);
  if (sub === 'add')
  return <AddCardScreen onBack={() => setSub(null)} onClose={() => setSub(null)} onFisica={() => setSub('fvp')} onCredito={() => setSub('addrC')} />;
  if (sub === 'fvp')
  return <FisicaValueProp onBack={() => setSub('add')} onClose={() => setSub(null)} onContinue={() => setSub('addr')} />;
  if (sub === 'addr')
  return <AddressSearch onBack={() => setSub('fvp')} onClose={() => setSub(null)} onPick={(a) => { setShipAddr(a); setSub('pay'); }} />;
  if (sub === 'pay')
  return <PagarFisica onBack={() => setSub('addr')} onClose={() => setSub(null)} onChangeAddress={() => setSub('addr')} address={shipAddr} onContinue={() => setSub('done')} />;
  if (sub === 'addrC')
  return <AddressSearch onBack={() => setSub('add')} onClose={() => setSub(null)} onPick={() => setSub('done')} />;
  if (sub === 'done')
  return <OrderConfirmation onDone={() => setSub(null)} onMenu={() => setSub(null)} />;

  const AddBtn =
  <button onClick={() => setSub('add')} style={{ width: 40, height: 40, borderRadius: 999, border: 0, background: LX.layer3, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
      <LI name="add-more" size={22} color={LX.text1} />
    </button>;

  return (
    <Screen>
      <BigHeader title="Tarjetas" onBack={onBack} right={AddBtn} />
      <div style={{ padding: '4px 16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {mode === 'renewFisica' && phase === 'transit' &&
        <TransitBanner onActivate={onActivate} onTrack={onTrack} />
        }

        {mode === 'renewFisica' && phase === 'active' &&
        <>
          <div style={{ display: 'flex', gap: 11, alignItems: 'center', background: 'var(--bg-positive-01)', borderRadius: 16, padding: '14px 16px' }}>
            <LI name="feedback-positive" size={22} color="var(--c-lemon-50)" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ font: '600 15px Inter', color: '#0F602C' }}>Tarjeta activada</div>
              <div style={{ font: '500 13px Inter', color: '#0F602C', opacity: 0.85, marginTop: 2 }}>Tu nueva Lemon Card ya está lista para usar.</div>
            </div>
          </div>
          <DebitosInfo />
        </>
        }

        {mode === 'renewFisica' && phase === 'expiring' && showExpiringBanner &&
        <RenovarBanner onRenew={onPrimary} />}

        <CardsModule cards={owned} onCardTap={onCardTap} />

        {/* Banner NFC: entre las tarjetas y los movimientos (incentiva la nueva virtual).
            En renovación NO va: ahí el banner relevante es el de vencimiento. */}
        {(mode === 'replaceVirtual' || mode === 'firstVirtual') &&
        <CambiaBanner onPrimary={onPrimary} first={mode === 'firstVirtual'} />}

        <ExteriorBanner />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
          <span style={{ font: '600 15px Inter', color: LX.text1 }}>Movimientos</span>
          <LI name="arrow-foward" size={16} color={LX.text3} />
        </div>
        <Surface pad={4}>
          <div style={{ padding: '0 12px' }}>
            <MoveRow icon="streaming" title="DLO*PrimeVideo" date="29 de mayo" amount="$ 7.863,79" />
            <Divider />
            <MoveRow icon="food" title="Cuervo Café" date="28 de mayo" amount="$ 4.200" />
          </div>
        </Surface>
      </div>
    </Screen>);

}

// ── Address confirm (shared by flow 2 & 3) ──────────────────────
function AddressScreen({ onBack, onClose, onConfirm }) {
  const [sel, setSel] = useStateSh(0);
  const addrs = [
  ['Malabia 1720', 'Palermo, CABA · C1414AAP'],
  ['Av. Corrientes 3200', 'Almagro, CABA · C1193AAQ']];

  return (
    <Screen footer={<Btn variant="primary" onClick={onConfirm}>Confirmar dirección</Btn>}>
      <StepHeader title="Tarjeta física" onBack={onBack} onClose={onClose} />
      <div style={{ padding: '8px 16px 8px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <div style={{ font: '500 24px Geist', letterSpacing: '-0.02em', color: LX.text1 }}>¿Dónde te la mandamos?</div>
          <div style={{ font: '400 14px Inter', color: LX.text2, marginTop: 6, lineHeight: 1.45 }}>
            Revisá que la dirección esté bien. Te la llevamos a tu puerta, sin costo.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {addrs.map(([a, b], i) =>
          <button key={i} onClick={() => setSel(i)} style={{
            display: 'flex', alignItems: 'center', gap: 13, textAlign: 'left', cursor: 'pointer',
            background: LX.layer, borderRadius: 14, padding: 14,
            border: `1.5px solid ${sel === i ? 'var(--c-lemon-50)' : LX.border}`
          }}>
              <div style={{ width: 40, height: 40, borderRadius: 999, background: sel === i ? 'var(--c-lemon-5)' : LX.layer3, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <LI name="positive-location" size={20} color={sel === i ? 'var(--c-lemon-50)' : LX.text2} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: '600 15px Inter', color: LX.text1 }}>{a}</div>
                <div style={{ font: '400 13px Inter', color: LX.text2, marginTop: 1 }}>{b}</div>
              </div>
              <span style={{ width: 22, height: 22, borderRadius: 999, border: `2px solid ${sel === i ? 'var(--c-lemon-50)' : LX.text3}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {sel === i && <span style={{ width: 11, height: 11, borderRadius: 999, background: 'var(--c-lemon-50)' }} />}
              </span>
            </button>
          )}
          <button style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: 0, cursor: 'pointer', padding: '4px 2px', color: LX.text1, font: '600 14px Inter' }}>
            <LI name="add-more" size={18} color={LX.text1} /> Agregar otra dirección
          </button>
        </div>

        <Surface pad={14}>
          <div style={{ font: '600 13px Inter', color: LX.text2, marginBottom: 10 }}>Resumen del pedido</div>
          {[['Lemon Card física', 'Gratis'], ['Envío a domicilio', 'Gratis'], ['Demora estimada', '5 a 7 días']].map(([k, v]) =>
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
              <span style={{ font: '400 14px Inter', color: LX.text2 }}>{k}</span>
              <span style={{ font: '600 14px Inter', color: LX.text1 }}>{v}</span>
            </div>
          )}
        </Surface>

      </div>
    </Screen>);

}

// ── Order confirmation (shared by flow 2 & 3) ───────────────────
function OrderConfirmation({ onDone, onMenu, renewal, onDelivery }) {
  return (
    <Screen footer={
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {onDelivery && <Btn variant="primary" leftIcon="rocket" onClick={onDelivery}>Simular: ya me llegó</Btn>}
        <Btn variant={onDelivery ? 'light' : 'primary'} onClick={onDone}>Volver a mis tarjetas</Btn>
        <Btn variant="ghost" onClick={onMenu}>Ir al menú del prototipo</Btn>
      </div>
    }>
      <div style={{ padding: '24px 20px 8px', display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: 999, background: 'var(--bg-positive-01)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LI name="feedback-positive" size={38} color="var(--c-lemon-50)" />
        </div>
        <div>
          <div style={{ font: '500 25px Geist', letterSpacing: '-0.02em', color: LX.text1 }}>¡Pedido confirmado!</div>
          <div style={{ font: '400 15px Inter', color: LX.text2, marginTop: 8, lineHeight: 1.5 }}>
            Te mandamos tu Lemon Card física a<br /><b style={{ color: LX.text1 }}>Malabia 1720</b>, Palermo.
          </div>
        </div>

        <div style={{ width: '100%', borderRadius: 20, overflow: 'hidden', background: 'radial-gradient(120% 90% at 80% 0%, #14342f, #0a181c)', padding: '20px 18px', color: '#fff', display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left' }}>
          <div style={{ transform: 'rotate(-6deg)', flexShrink: 0 }}>
            <CardArt variant="fisica" width={120} glow />
          </div>
          <div>
            <div style={{ font: '600 15px Inter' }}>Llega en su estuche</div>
            <div style={{ font: '400 13px Inter', color: 'rgba(255,255,255,0.72)', marginTop: 4, lineHeight: 1.45 }}>
              Activala desde la app y sumala al celu para pagar con NFC apenas la tengas.
            </div>
          </div>
        </div>

        <Surface pad={14} style={{ width: '100%', textAlign: 'left' }}>
          <Step n="1" t="Preparamos tu tarjeta" done />
          <Step n="2" t="Sale del depósito" sub="Te avisamos por push" />
          <Step n="3" t="Llega a tu casa" sub="5 a 7 días hábiles" last />
        </Surface>
      </div>
    </Screen>);

}
const Step = ({ n, t, sub, done, last }) =>
<div style={{ display: 'flex', gap: 12 }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <span style={{ width: 24, height: 24, borderRadius: 999, background: done ? 'var(--c-lemon-50)' : LX.layer3, color: done ? '#fff' : LX.text2, display: 'flex', alignItems: 'center', justifyContent: 'center', font: '600 12px Inter', flexShrink: 0 }}>
        {done ? '✓' : n}
      </span>
      {!last && <span style={{ width: 2, flex: 1, minHeight: 18, background: LX.hair, margin: '2px 0' }} />}
    </div>
    <div style={{ paddingBottom: last ? 0 : 14 }}>
      <div style={{ font: '600 14px Inter', color: LX.text1 }}>{t}</div>
      {sub && <div style={{ font: '400 12px Inter', color: LX.text2, marginTop: 1 }}>{sub}</div>}
    </div>
  </div>;


Object.assign(window, { Screen, StatCards, MoveRow, CardsModule, CardTabs, BoutiqueHero, NfcHero, CtaCard, ExteriorBanner, TransitBanner, TarjetasHub, AddressScreen, OrderConfirmation, AddCardScreen, PagarFisica, CambiaBanner, RenovarBanner, FisicaValueProp, AddressSearch });