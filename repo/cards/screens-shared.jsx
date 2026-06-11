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


const MoveRow = ({ icon, title, date, amount }) =>
<div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0' }}>
    <div style={{ width: 40, height: 40, borderRadius: 999, background: LX.layer3, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <LI name={icon} size={20} color={LX.text1} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ font: '500 14px Inter', color: LX.text1 }}>{title}</div>
      <div style={{ font: '400 12px Inter', color: LX.text2, marginTop: 1 }}>{date}</div>
    </div>
    <div style={{ font: '500 14px Geist', color: LX.text1 }}>−{amount}</div>
  </div>;


// Module listing the cards the user owns + moneda de pago
const CardsModule = ({ cards, onCardTap, onActivate }) =>
<Surface pad={0} style={{ overflow: 'hidden' }}>
    {cards.map((c, i) =>
  <React.Fragment key={i}>
        {i > 0 && <Divider style={{ margin: '0 18px' }} />}
        <CardListItem variant={c.variant} title={c.title} mask={c.mask} status={c.status} activate={c.activate} onTap={onCardTap} onActivate={onActivate} />
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


// big NFC hero (used to push renewing the virtual card → pay from phone)
const NfcHero = ({ onPrimary, title = 'Pagá con el celu', body = 'Renová tu tarjeta y pagá directo desde tu celu con Apple Pay o Google Pay.', cta = 'Pedí tu nueva tarjeta virtual' }) =>
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
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(207,255,46,0.16)', color: 'var(--c-lime-30)', font: '600 11px Inter', padding: '4px 10px', borderRadius: 999, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
        <LI name="celphone" size={13} color="var(--c-lime-30)" /> NUEVA FORMA DE PAGAR
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
      <div style={{ transform: 'rotate(-8deg)', flexShrink: 0 }}><CardArt variant="fisica" width={66} portrait /></div>
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
    <div style={{ position: 'absolute', right: -34, top: '50%', transform: 'translateY(-50%) rotate(8deg)', opacity: 0.96 }}>
      <CardArt variant="fisica" width={132} portrait />
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

// mode: 'replaceVirtual' | 'firstVirtual' | 'fisica' | 'renewFisica' | 'twoCards'
// phase (renewFisica only): 'expiring' (default) | 'transit' | 'active'
function TarjetasHub({ mode, cards, phase = 'expiring', onPrimary, onActivate, onTrack, onBack, onCardTap, showExpiringBanner = true, showNfcBanner = false, onNfc }) {
  // sensible default ownership per mode
  const renewCards = phase === 'active' ?
  [{ variant: 'fisica', title: 'Lemon Card', mask: '•••• 5520', status: 'Activa' }, { variant: 'virtual', title: 'Tarjeta virtual', mask: '•••• 8763', status: 'Activa' }] :
  [{ variant: 'fisica', title: 'Lemon Card', mask: '•••• 4971', status: 'Vence pronto' }, { variant: 'virtual', title: 'Tarjeta virtual', mask: '•••• 8763', status: 'Activa' }];
  const owned = cards || {
    replaceVirtual: [{ variant: 'virtual', title: 'Tarjeta virtual', mask: '•••• 8763', status: 'Activa' }],
    firstVirtual: [{ variant: 'fisica', title: 'Lemon Card', mask: '•••• 4971', status: 'Activa' }],
    fisica: [{ variant: 'virtual', title: 'Tarjeta virtual', mask: '•••• 8763', status: 'Activa' }],
    renewFisica: renewCards,
    twoCards: [{ variant: 'fisica', title: 'Lemon Card', mask: '•••• 4971', status: 'Activa' }, { variant: 'virtual', title: 'Tarjeta virtual', mask: '•••• 8763', status: 'Activa' }]
  }[mode] || [];

  return (
    <Screen>
      <BigHeader title="Tarjetas" onBack={onBack} />
      <div style={{ padding: '4px 16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <CardTabs />

        {mode === 'fisica' && <BoutiqueHero onPrimary={onPrimary} onActivate={onActivate} />}

        {mode === 'replaceVirtual' && <NfcHero onPrimary={onPrimary} />}

        {mode === 'firstVirtual' &&
        <NfcHero onPrimary={onPrimary} body="Pagá directo desde tu celu con Apple Pay o Google Pay, sin sacar la tarjeta." cta="Creá tu tarjeta virtual" />
        }

        {mode === 'renewFisica' && phase === 'expiring' && showNfcBanner &&
        <NfcHero onPrimary={onNfc} cta="Pedí tu virtual con NFC" />
        }

        {mode === 'renewFisica' && phase === 'transit' &&
        <TransitBanner onActivate={onActivate} onTrack={onTrack} />
        }

        {mode === 'renewFisica' && phase === 'active' &&
        <div style={{ display: 'flex', gap: 11, alignItems: 'center', background: 'var(--bg-positive-01)', borderRadius: 16, padding: '14px 16px' }}>
            <LI name="feedback-positive" size={22} color="var(--c-lemon-50)" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ font: '600 15px Inter', color: '#0F602C' }}>Tarjeta activada</div>
              <div style={{ font: '500 13px Inter', color: '#0F602C', opacity: 0.85, marginTop: 2 }}>Tu nueva Lemon Card ya está lista para usar.</div>
            </div>
          </div>
        }

        {mode === 'renewFisica' && phase === 'expiring' && showExpiringBanner &&
        <div style={{ background: 'var(--bg-warning-01)', border: '1px solid var(--c-orange-10)', borderRadius: 16, padding: '15px 16px' }}>
            <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
              <LI name="alert-time" size={22} color="#854600" style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ flex: 1 }}>
                <div style={{ font: '600 15px Inter', color: '#854600' }}>Tu Lemon Card física vence pronto</div>
                <div style={{ font: '500 13px Inter', color: '#9a6a1a', marginTop: 3, lineHeight: 1.4 }}>Confirmá tu dirección para recibir la nueva y seguir pagando sin cortes.
              </div>
              </div>
            </div>
            <button onClick={onPrimary} style={{ width: '100%', marginTop: 13, border: 0, cursor: 'pointer', borderRadius: 999, padding: '12px 18px', background: '#854600', color: '#fff', font: '600 15px Inter' }}>Pedir mi nueva Lemon Card</button>
          </div>}

        <CardsModule cards={owned} onCardTap={onCardTap} />

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

        <PmNote>Sumá un tracking en vivo y un aviso push cuando salga del depósito — pedir la física es un momento "boutique", vale la pena cuidarlo.</PmNote>
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


// ── Activating screen (reemplaza la sheet "Agregar a Apple Wallet") ─
// Aparece justo después de crear/activar una tarjeta. El usuario vuelve
// al inicio y más tarde recibe una push para sumarla a la billetera.
function ActivatingCardScreen({ variant = 'virtual', onHome }) {
  const backVariant = variant === 'virtual' ? 'fisica' : 'virtual';
  return (
    <Anim k={'activating' + variant} noWrap>
      <Screen footer={<Btn variant="primary" onClick={onHome}>Volver al inicio</Btn>}>
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28, padding: '32px 24px 12px', textAlign: 'center' }}>
          <div style={{ position: 'relative', width: 240, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ position: 'absolute', top: 4, right: 22, font: '700 22px Geist', color: 'var(--c-nebula-50)' }}>✦</span>
            <span style={{ position: 'absolute', bottom: 12, left: 14, font: '700 18px Geist', color: 'var(--c-lemon-50)' }}>✦</span>
            <div style={{ position: 'absolute', transform: 'translate(-58px, 14px) rotate(-14deg)', opacity: 0.9, filter: 'saturate(0.92)' }}>
              <CardArt variant={backVariant} width={130} portrait />
            </div>
            <div style={{ position: 'absolute', transform: 'translate(58px, 18px) rotate(12deg)', opacity: 0.85 }}>
              <CardArt variant={backVariant === 'fisica' ? 'credito' : 'fisica'} width={130} portrait />
            </div>
            <div style={{ position: 'relative', zIndex: 2 }}>
              <CardArt variant={variant} width={150} portrait glow />
            </div>
          </div>
          <div>
            <div style={{ font: '500 26px Geist', letterSpacing: '-0.02em', color: LX.text1, lineHeight: 1.15 }}>Estamos activando tu tarjeta</div>
            <div style={{ font: '400 15px Inter', color: LX.text2, marginTop: 12, lineHeight: 1.5, maxWidth: 320, margin: '12px auto 0' }}>
              Te avisaremos cuando esté lista para que la adiciones a tu billetera virtual y comiences a pagar.
            </div>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderRadius: 999, background: 'var(--c-lemon-5)', color: 'var(--c-lemon-70)', font: '600 12px Inter' }}>
            <span className="lc-spin" style={{ width: 12, height: 12, borderRadius: 999, border: '2px solid var(--c-lemon-20)', borderTopColor: 'var(--c-lemon-50)', display: 'inline-block' }} />
            Esto puede tardar unos minutos
          </div>
        </div>
      </Screen>
    </Anim>);

}

Object.assign(window, { Screen, StatCards, MoveRow, CardsModule, CardTabs, BoutiqueHero, NfcHero, CtaCard, ExteriorBanner, TransitBanner, TarjetasHub, AddressScreen, OrderConfirmation, ActivatingCardScreen });