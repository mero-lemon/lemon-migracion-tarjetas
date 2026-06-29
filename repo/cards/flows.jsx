// The three card flows. Each manages its own step state.
const { useState: useStateF, useEffect: useEffectF } = React;

// ════════════════════════════════════════════════════════════════
// FLOW 1 — Nueva tarjeta virtual (reemplazo) + NFC / Wallet
// ════════════════════════════════════════════════════════════════
function Flow1({ onMenu, replace = true, startStep = 'hub', onActivated }) {
  const [step, setStep] = useStateF(startStep);
  const [ack, setAck] = useStateF(false);
  const [design, setDesign] = useStateF('violeta'); // diseño elegido en el picker
  const [walletAdded, setWalletAdded] = useStateF(false); // ya pasó por "Agregando a Apple Pay…"
  // standalone (f1/f1b): al terminar caemos en el home de la tarjeta nueva.
  // embebido (Flow4/Flow5): devolvemos el control al flujo padre vía onActivated/onMenu.
  const standalone = startStep === 'hub';
  const newMask = '•••• 2291';

  // "Quiero Apple Pay": corre el proceso de alta en la wallet y recién ahí avanza.
  const goWallet = () => { setWalletAdded(true); setStep('wallet'); };
  useEffectF(() => {
    if (step !== 'wallet') return;
    const t = setTimeout(() => { standalone ? setStep('home') : onActivated && onActivated(); }, 1800);
    return () => clearTimeout(t);
  }, [step]);

  if (step === 'hub')
  return <Anim k="f1hub"><TarjetasHub mode={replace ? 'replaceVirtual' : 'firstVirtual'} onBack={onMenu} onPrimary={() => {setAck(false);setStep(replace ? 'replace' : 'design');}} /></Anim>;

  // Pantalla de baja+alta — SOLO para quien ya tiene virtual activa (cambiá tu tarjeta).
  if (step === 'replace')
  return (
    <Anim k="f1rep">
        <Screen footer={
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Btn variant="primary" disabled={!ack} onClick={() => setStep('design')}>Elegir diseño y crear</Btn>
            <Btn variant="ghost" onClick={() => setStep('hub')}>Mejor no</Btn>
          </div>
      }>
          <StepHeader title="Cambiar tu tarjeta" onBack={() => setStep('hub')} onClose={onMenu} />
          <div style={{ padding: '6px 16px 8px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* old → new: escenario con la vieja apagada y la nueva flotando + glow */}
            <div style={{ position: 'relative', borderRadius: 22, overflow: 'hidden', padding: '24px 12px 18px', background: 'radial-gradient(120% 100% at 78% 0%, rgba(123,78,200,0.16), rgba(123,78,200,0.04) 55%, transparent)' }}>
              <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, borderRadius: 999, background: 'radial-gradient(circle, rgba(207,255,46,0.14), transparent 70%)' }} />
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <div style={{ textAlign: 'center', transform: 'rotate(-5deg)' }}>
                  <CardArt design="violeta" width={120} faded />
                  <div style={{ font: '500 11px Inter', color: LX.text3, marginTop: 8 }}>•••• 8763 · se da de baja</div>
                </div>
                <span style={{ width: 30, height: 30, borderRadius: 999, background: LX.layer, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-card)', flexShrink: 0 }}>
                  <LI name="arrow-foward" size={16} color={LX.text1} />
                </span>
                <div style={{ textAlign: 'center', transform: 'rotate(4deg)' }}>
                  <div style={{ animation: 'lc-float 3.6s ease-in-out infinite' }}><CardArt design="violeta" width={132} glow /></div>
                  <div style={{ font: '600 11px Inter', color: 'var(--c-lemon-50)', marginTop: 8 }}>Nueva · al instante</div>
                </div>
              </div>
            </div>

            <div>
              <div style={{ font: '500 24px Geist', letterSpacing: '-0.02em', color: LX.text1 }}>Cambiá tu tarjeta para pagar con el celu</div>
              <div style={{ font: '400 14px Inter', color: LX.text2, marginTop: 6, lineHeight: 1.45 }}>
                Creá tu nueva virtual y sumala a Apple Pay para pagar apoyando el celu. Al crearla, damos de baja la <b style={{ color: LX.text1 }}>•••• 8763</b> en el acto.
              </div>
            </div>

            <DebitosInfo />

            <button onClick={() => setAck((a) => !a)} style={{ display: 'flex', alignItems: 'flex-start', gap: 11, background: 'transparent', border: 0, cursor: 'pointer', textAlign: 'left', padding: '2px 2px 4px' }}>
              <span style={{ width: 24, height: 24, borderRadius: 7, flexShrink: 0, marginTop: 1, border: `2px solid ${ack ? 'var(--c-lemon-50)' : LX.text3}`, background: ack ? 'var(--c-lemon-50)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', font: '700 14px Inter' }}>{ack ? '✓' : ''}</span>
              <span style={{ font: '500 14px Inter', color: LX.text1, lineHeight: 1.4 }}>Entiendo que mi tarjeta •••• 8763 se da de baja y no la voy a poder volver a usar.</span>
            </button>
          </div>
        </Screen>
      </Anim>);


  // El plato fuerte: elegir el diseño.
  if (step === 'design')
  return <Anim k="f1design"><DesignPicker onBack={() => setStep(replace ? 'replace' : 'hub')} onClose={onMenu} onChoose={(d) => { setDesign(d.id); setStep('morph'); }} /></Anim>;

  // Morph: la virtual actual se transforma en el diseño elegido mientras corre el backend.
  if (step === 'morph')
  return <Anim k="f1morph"><MorphCreate fromDesign="violeta" toDesign={design} replace={replace} onDone={() => setStep('ready')} /></Anim>;

  // Success Cash App: la tarjeta sube, aparece la info, primero NFC.
  if (step === 'ready')
  return (
    <Anim k="f1ready">
        <VirtualReady
        design={design} mask={newMask}
        onWallet={goWallet}
        onSeeCard={standalone ? () => setStep('home') : onActivated || onMenu}
        onMenu={onMenu} />
      </Anim>);

  // "Agregando a Apple Pay…" — proceso real antes de avanzar.
  if (step === 'wallet')
  return (
    <Anim k="f1wallet">
        <Screen scroll={false} bg="radial-gradient(120% 80% at 50% 38%, #1c1838 0%, #0a0a10 72%)">
          <div style={{ height: '100%' }} />
          <WalletAddOverlay open design={design} />
        </Screen>
      </Anim>);


  if (step === 'home')
  return <Anim k="f1home"><CardHome design={design} variant="virtual" title="Tarjeta prepaga virtual" mask={newMask} balance={1} startInWallet={walletAdded} onBack={onMenu} onClose={onMenu} /></Anim>;

  return null;
}

// Info compacta de servicios asociados (antes era un banner grande de "revincular").
// Tono informativo: te los mandamos por mail para tenerlos a mano.
const DebitosInfo = () =>
<div style={{ display: 'flex', gap: 11, alignItems: 'flex-start', background: LX.layer3, borderRadius: 14, padding: '13px 14px' }}>
    <LI name="programed-tx" size={18} color={LX.text2} style={{ flexShrink: 0, marginTop: 1 }} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ font: '600 13px Inter', color: LX.text1 }}>Tenés 3 servicios asociados a esta tarjeta</div>
      <div style={{ font: '400 12px Inter', color: LX.text2, marginTop: 2, lineHeight: 1.4 }}>Netflix, Spotify e iCloud+. Te los mandamos por mail para que los tengas a mano y los revincules cuando quieras.</div>
    </div>
  </div>;


const Bullet = ({ icon, t, s, tone }) =>
<div style={{ display: 'flex', gap: 12, padding: '11px 0', alignItems: 'flex-start' }}>
    <div style={{ width: 36, height: 36, borderRadius: 999, background: tone === 'warn' ? 'var(--bg-warning-01)' : LX.layer3, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <LI name={icon} size={18} color={tone === 'warn' ? '#854600' : LX.text1} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ font: '600 14px Inter', color: LX.text1 }}>{t}</div>
      <div style={{ font: '400 12px Inter', color: LX.text2, marginTop: 1, lineHeight: 1.4 }}>{s}</div>
    </div>
  </div>;


// Final NFC success — shared by flow1 wallet end
function NfcSuccess({ onDone, onMenu }) {
  return (
    <Screen footer={
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Btn variant="primary" onClick={onDone}>Listo, volver a mis tarjetas</Btn>
        <Btn variant="ghost" onClick={onMenu}>Ir al menú del prototipo</Btn>
      </div>
    }>
      <div style={{ padding: '28px 22px 8px', display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center', textAlign: 'center' }}>
        <div style={{ position: 'relative', width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ position: 'absolute', inset: 0, borderRadius: 999, background: 'var(--c-lemon-5)' }} />
          <span style={{ position: 'absolute', inset: 18, borderRadius: 999, background: 'var(--c-lemon-10)' }} />
          <div style={{ position: 'relative', width: 64, height: 64, borderRadius: 999, background: 'var(--c-lemon-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Nfc size={34} />
          </div>
        </div>
        <div>
          <div style={{ font: '500 25px Geist', letterSpacing: '-0.02em', color: LX.text1 }}>Lista para pagar con el celu</div>
          <div style={{ font: '400 15px Inter', color: LX.text2, marginTop: 8, lineHeight: 1.5 }}>
            Tu Lemon ya está en Apple Wallet. Acercá el celu a cualquier posnet y pagá en un toque.
          </div>
        </div>
        <Surface pad={16} style={{ width: '100%', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <CardThumb variant="virtual" w={50} />
            <div style={{ flex: 1 }}>
              <div style={{ font: '600 15px Inter', color: LX.text1 }}>Tarjeta virtual</div>
              <div style={{ font: '500 13px Geist', color: LX.text2, marginTop: 1 }}>•••• 2291</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              <Tag tone="positive">Activa</Tag>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, font: '600 11px Inter', color: 'var(--c-lemon-60)', whiteSpace: 'nowrap' }}><LI name="celphone" size={13} color="var(--c-lemon-60)" />En NFC</span>
            </div>
          </div>
        </Surface>
      </div>
    </Screen>);

}

// ════════════════════════════════════════════════════════════════
// FLOW 2 — Física SIN requisitos (camino directo)
// ════════════════════════════════════════════════════════════════
function Flow2({ onMenu, startStep = 'hub', onComplete }) {
  const [step, setStep] = useStateF(startStep);
  const [addr, setAddr] = useStateF(undefined);
  const back = () => startStep === 'hub' ? setStep('hub') : onMenu();
  if (step === 'hub')
  return <Anim k="f2hub"><TarjetasHub mode="fisica" onBack={onMenu} onPrimary={() => setStep('fvp')} onActivate={() => setStep('activate')} /></Anim>;
  if (step === 'fvp')
  return <Anim k="f2fvp"><FisicaValueProp onBack={back} onClose={onMenu} onContinue={() => setStep('address')} /></Anim>;
  if (step === 'activate')
  return <CardActivation onBack={back} onClose={onMenu} onDone={onComplete || (() => setStep('hub'))} />;
  if (step === 'address')
  return <Anim k="f2addr"><AddressSearch onBack={() => setStep('fvp')} onClose={onMenu} onPick={(a) => { setAddr(a); setStep('pay'); }} /></Anim>;
  if (step === 'pay')
  return <Anim k="f2pay"><PagarFisica onBack={() => setStep('address')} onClose={onMenu} onChangeAddress={() => setStep('address')} address={addr} onContinue={() => setStep('done')} /></Anim>;
  if (step === 'done')
  return <Anim k="f2done"><OrderConfirmation onDone={onComplete || (() => setStep('hub'))} onMenu={onMenu} /></Anim>;
  return null;
}

// ════════════════════════════════════════════════════════════════
// FLOW 3 — Física CON requisito (≥ US$50 invertidos)
// ════════════════════════════════════════════════════════════════
function Flow3({ onMenu, meets, onMeet, startStep = 'hub', onComplete }) {
  const [step, setStep] = useStateF(startStep);
  const [addr, setAddr] = useStateF(undefined);
  if (step === 'hub')
  return <Anim k="f3hub"><TarjetasHub mode="fisica" onBack={onMenu} onPrimary={() => setStep('fvp')} /></Anim>;
  if (step === 'fvp')
  return <Anim k="f3fvp"><FisicaValueProp onBack={() => startStep === 'hub' ? setStep('hub') : onMenu()} onClose={onMenu} onContinue={() => setStep('address')} /></Anim>;
  if (step === 'address')
  return <Anim k="f3addr"><AddressSearch onBack={() => setStep('fvp')} onClose={onMenu} onPick={(a) => { setAddr(a); setStep('pay'); }} /></Anim>;
  if (step === 'pay')
  return <Anim k="f3pay"><PagarFisica onBack={() => setStep('address')} onClose={onMenu} onChangeAddress={() => setStep('address')} address={addr} onContinue={() => setStep('done')} /></Anim>;
  if (step === 'done')
  return <Anim k="f3done"><OrderConfirmation onDone={onComplete || (() => setStep('hub'))} onMenu={onMenu} /></Anim>;
  return null;
}

function RequisitoScreen({ meets, onBack, onClose, onContinue, onInvest }) {
  const have = meets ? 240 : 40;
  const need = 50;
  return (
    <Anim k="reqinner" noWrap>
      <Screen footer={
      meets ?
      <Btn variant="primary" onClick={onContinue}>Continuar</Btn> :
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Btn variant="brand" leftIcon="stocks" onClick={onInvest}>Invertir para cumplir</Btn>
              <Btn variant="light" leftIcon="currency-dollar" onClick={onInvest}>Comprar dólares digitales</Btn>
            </div>
      }>
        <StepHeader title="Tarjeta física" onBack={onBack} onClose={onClose} />
        <div style={{ padding: '6px 16px 8px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ font: '500 24px Geist', letterSpacing: '-0.02em', color: LX.text1 }}>
              {meets ? 'Ya podés pedir tu física' : 'Un paso antes de pedirla'}
            </div>
            <div style={{ font: '400 14px Inter', color: LX.text2, marginTop: 6, lineHeight: 1.45 }}>
              Para tener tu Lemon Card física necesitás al menos <b style={{ color: LX.text1 }}>US$50</b> entre dólares digitales y acciones invertidas.
            </div>
          </div>

          {/* progress card */}
          <Surface pad={18}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div style={{ font: '400 12px Inter', color: LX.text2 }}>Tenés invertido</div>
                <div style={{ font: '500 30px Geist', letterSpacing: '-0.03em', color: meets ? 'var(--c-lemon-50)' : LX.text1 }}>US$ {have}</div>
              </div>
              {meets ?
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, font: '600 13px Inter', color: 'var(--c-lemon-60)' }}><LI name="feedback-positive" size={17} color="var(--c-lemon-50)" /> Cumplís</span> :
              <div style={{ font: '600 13px Inter', color: '#854600', background: 'var(--bg-warning-01)', padding: '5px 10px', borderRadius: 999, whiteSpace: 'nowrap' }}>Te faltan US$ {need - have}</div>}
            </div>
            <Meter value={Math.min(1, have / need)} color={meets ? 'var(--c-lemon-50)' : LX.dark} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, font: '400 11px Inter', color: LX.text3 }}>
              <span>US$ 0</span><span>Meta US$ 50</span>
            </div>
            <Divider style={{ margin: '14px 0' }} />
            <Breakdown label="Dólares digitales (USDC)" icon="currency-dollar" v={meets ? 150 : 25} />
            <Breakdown label="Acciones invertidas" icon="stocks" v={meets ? 90 : 15} />
          </Surface>

          {meets &&
          <div style={{ display: 'flex', gap: 9, alignItems: 'center', background: 'var(--bg-positive-01)', borderRadius: 12, padding: '12px 14px' }}>
                <LI name="feedback-positive" size={18} color="var(--c-lemon-50)" />
                <span style={{ font: '500 13px Inter', color: '#0F602C' }}>Listo, ya cumplís el requisito. Seguí para confirmar tu dirección.</span>
              </div>}
        </div>
      </Screen>
    </Anim>);

}
const Breakdown = ({ label, icon, v }) =>
<div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '6px 0' }}>
    <div style={{ width: 32, height: 32, borderRadius: 999, background: LX.layer3, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <LI name={icon} size={17} color={LX.text1} />
    </div>
    <span style={{ flex: 1, font: '400 14px Inter', color: LX.text2 }}>{label}</span>
    <span style={{ font: '500 14px Geist', color: LX.text1, whiteSpace: 'nowrap' }}>US$ {v}</span>
  </div>;


// Pantalla de pago — reemplaza al requisito: pedir la física tiene un costo
// que se descuenta del saldo. Se muestra a quien va a pedir/renovar la física.
function PaymentScreen({ onBack, onClose, onPay, price = 5 }) {
  return (
    <Anim k="payinner" noWrap>
      <Screen footer={<Btn variant="primary" leftIcon="currency-dollar" onClick={onPay}>Pagar y pedir mi tarjeta</Btn>}>
        <StepHeader title="Tarjeta física" onBack={onBack} onClose={onClose} />
        <div style={{ padding: '6px 16px 8px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ font: '500 24px Geist', letterSpacing: '-0.02em', color: LX.text1 }}>Pedí tu Lemon Card física</div>
            <div style={{ font: '400 14px Inter', color: LX.text2, marginTop: 6, lineHeight: 1.45 }}>
              Tiene un costo único de <b style={{ color: LX.text1 }}>US$ {price}</b>. Lo descontamos de tu saldo y te la enviamos a tu casa.
            </div>
          </div>

          {/* detalle del cobro */}
          <Surface pad={18}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
              <span style={{ font: '400 14px Inter', color: LX.text2 }}>Lemon Card física</span>
              <span style={{ font: '500 14px Geist', color: LX.text1 }}>US$ {price}</span>
            </div>
            <Divider style={{ margin: '10px 0' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
              <span style={{ font: '400 14px Inter', color: LX.text2 }}>Envío a domicilio</span>
              <span style={{ font: '600 13px Inter', color: 'var(--c-lemon-60)' }}>Gratis</span>
            </div>
            <Divider style={{ margin: '10px 0' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
              <span style={{ font: '600 15px Inter', color: LX.text1 }}>Total</span>
              <span style={{ font: '500 18px Geist', letterSpacing: '-0.02em', color: LX.text1 }}>US$ {price}</span>
            </div>
          </Surface>

          {/* método de pago */}
          <Surface pad={0} style={{ overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
              <div style={{ width: 40, height: 40, borderRadius: 999, background: LX.layer3, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <LI name="wallet" size={20} color={LX.text1} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: '600 14px Inter', color: LX.text1 }}>Pagás con tu saldo</div>
                <div style={{ font: '400 12px Inter', color: LX.text2, marginTop: 1 }}>Disponible: US$ 240</div>
              </div>
              <LI name="arrow-foward" size={18} color={LX.text3} />
            </div>
          </Surface>

        </div>
      </Screen>
    </Anim>);

}


// ── helpers ─────────────────────────────────────────────────────
function LoadingScreen({ title, sub, onDone }) {
  React.useEffect(() => {const t = setTimeout(onDone, 1500);return () => clearTimeout(t);}, []);
  return (
    <Screen scroll={false}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, padding: 32, textAlign: 'center' }}>
        <div className="lc-spin" style={{ width: 52, height: 52, borderRadius: 999, border: '4px solid var(--c-gray-20)', borderTopColor: 'var(--c-lemon-50)' }} />
        <div>
          <div style={{ font: '500 20px Geist', letterSpacing: '-0.02em', color: LX.text1 }}>{title}</div>
          <div style={{ font: '400 14px Inter', color: LX.text2, marginTop: 8, lineHeight: 1.5, maxWidth: 280 }}>{sub}</div>
        </div>
      </div>
    </Screen>);

}

// ════════════════════════════════════════════════════════════════
// FLOW 4 — Renovación de tarjeta física (por vencimiento)
// ════════════════════════════════════════════════════════════════
function Flow4({ onMenu, meets, onMeet, upsellVirtual }) {
  const [step, setStep] = useStateF('hub');
  const [phase, setPhase] = useStateF('expiring'); // expiring → transit → active
  const [track, setTrack] = useStateF(false);
  const [virtualDone, setVirtualDone] = useStateF(false); // ya pasó por el upsell de la virtual
  const [reqFrom, setReqFrom] = useStateF('renew'); // adónde vuelve el back del requisito
  const [addr, setAddr] = useStateF(undefined);
  if (step === 'hub')
  return (
    <Anim k={'f4hub' + phase}>
        <div style={{ height: '100%', position: 'relative' }}>
          <TarjetasHub
          mode="renewFisica" phase={phase} onBack={onMenu}
          showExpiringBanner={meets}
          showNfcBanner={Boolean(upsellVirtual)}
          onNfc={() => setStep('virtual')}
          onCardTap={!meets ? ((v) => { if (v === 'fisica') setStep('detail'); }) : undefined}
          onPrimary={() => setStep(upsellVirtual && !virtualDone ? 'upsell' : 'renew')}
          onActivate={() => setStep('activate')}
          onTrack={() => setTrack(true)} />
        
          <Sheet open={track} onClose={() => setTrack(false)}>
            <TrackingContent onClose={() => setTrack(false)} />
          </Sheet>
        </div>
      </Anim>);

  if (step === 'upsell')
  return <Anim k="f4upsell"><VirtualUpsell onBack={() => setStep('hub')} onClose={onMenu} onVirtual={() => setStep('virtual')} onFisica={() => setStep('renew')} /></Anim>;
  if (step === 'virtual')
  return <Flow1 onMenu={() => {setVirtualDone(true);setStep('hub');}} startStep="replace" />;
  if (step === 'renew')
  return (
    <Anim k="f4renew">
        <Screen footer={
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Btn variant="primary" onClick={() => { setReqFrom('renew'); setStep('address'); }}>Pedir mi nueva física</Btn>
            <Btn variant="ghost" onClick={() => setStep('hub')}>Ahora no</Btn>
          </div>
      }>
          <StepHeader title="Renovar Lemon Card" onBack={() => setStep('hub')} onClose={onMenu} />
          <div style={{ padding: '6px 16px 8px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '8px 0 4px' }}>
              <div style={{ textAlign: 'center' }}>
                <CardArt variant="fisica" width={120} faded />
                <div style={{ font: '500 11px Inter', color: LX.text3, marginTop: 6 }}>•••• 4971 · vence 06/26</div>
              </div>
              <LI name="arrow-foward" size={22} color={LX.text3} />
              <div style={{ textAlign: 'center' }}>
                <CardArt variant="fisica" width={120} glow />
                <div style={{ font: '600 11px Inter', color: 'var(--c-greent-60)', marginTop: 6 }}>Nueva · en camino</div>
              </div>
            </div>
            <div>
              <div style={{ font: '500 24px Geist', letterSpacing: '-0.02em', color: LX.text1 }}>Te renovamos la física</div>
              <div style={{ font: '400 14px Inter', color: LX.text2, marginTop: 6, lineHeight: 1.45 }}>
                Tu <b style={{ color: LX.text1 }}>•••• 4971</b> está por vencer. Pedí la nueva para no cortar nada.
              </div>
            </div>
            <Surface pad={4}>
              <div style={{ padding: '4px 12px' }}>
                <Bullet icon="shield-alt" t="Misma cuenta y mismo cashback" s="Solo cambia el plástico y la fecha de vencimiento." />
                <Divider />
                <Bullet icon="celphone" t="Seguís pagando con NFC mientras llega" s="Usá la virtual en el celu sin interrupciones." />
                <Divider />
                <Bullet icon="programed-tx" t="La vieja se da de baja al activar la nueva" s="Hasta entonces seguí usándola normal." tone="warn" />
              </div>
            </Surface>
            <DebitosInfo />
          </div>
        </Screen>
      </Anim>);

  if (step === 'detail')
  return <Anim k="f4detail"><CardHome variant="fisica" mask="•••• 4971" balance={1} expiring onBack={() => setStep('hub')} onClose={onMenu} onRenew={() => { setReqFrom('detail'); setStep('address'); }} /></Anim>;
  if (step === 'address')
  return <Anim k="f4addr"><AddressSearch onBack={() => setStep(reqFrom)} onClose={onMenu} onPick={(a) => { setAddr(a); setStep('pay'); }} /></Anim>;
  if (step === 'pay')
  return <Anim k="f4pay"><PagarFisica onBack={() => setStep('address')} onClose={onMenu} onChangeAddress={() => setStep('address')} address={addr} onContinue={() => setStep('done')} /></Anim>;
  if (step === 'done')
  return <Anim k="f4done"><OrderConfirmation renewal onDone={() => {setPhase('transit');setStep('hub');}} onMenu={onMenu} /></Anim>;
  if (step === 'activate')
  return <CardActivation onBack={() => setStep('hub')} onClose={onMenu} onDone={() => {setPhase('active');setStep('hub');}} />;
  return null;
}

// Card-home / detail screen (como el home real de cada tarjeta). Sirve para
// virtual y física. Si la tarjeta vence (expiring) muestra debajo de la imagen
// el banner de renovación — el único acceso a renovar para quien no cumple.
function CardDetail({ variant = 'fisica', title = 'Lemon Card', mask, nfc = false, expiring = false, onBack, onClose, onRenew }) {
  const actions = variant === 'virtual' ?
  [{ icon: 'pause', label: 'Pausar' }, { icon: 'view-balance-on', label: 'Ver datos' }, { icon: 'limits', label: 'Límites' }, { icon: 'celphone', label: 'Apple Pay' }] :
  [{ icon: 'pause', label: 'Pausar' }, { icon: 'view-balance-on', label: 'Ver datos' }, { icon: 'limits', label: 'Límites' }, { icon: 'click-to-pay', label: 'Eliminar de\nClick to Pay' }];

  return (
    <Anim k={'carddetail' + variant} noWrap>
      <Screen>
        <StepHeader title={title} onBack={onBack} onClose={onClose} />
        <div style={{ padding: '10px 16px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9, padding: '4px 0 2px' }}>
            <CardArt variant={variant} width={210} portrait glow />
            {mask &&
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ font: '500 13px Geist', color: LX.text2 }}>{mask}</span>
              {nfc && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, font: '600 11px Inter', color: 'var(--c-lemon-60)' }}><LI name="celphone" size={13} color="var(--c-lemon-60)" /> En NFC</span>}
            </div>}
          </div>

          {expiring &&
          <div style={{ background: 'var(--bg-warning-01)', border: '1px solid var(--c-orange-10)', borderRadius: 16, padding: '15px 16px' }}>
            <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
              <LI name="alert-time" size={22} color="#854600" style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ flex: 1 }}>
                <div style={{ font: '600 15px Inter', color: '#854600' }}>Tu Lemon Card física vence pronto</div>
                <div style={{ font: '500 13px Inter', color: '#9a6a1a', marginTop: 3, lineHeight: 1.4 }}>Renovala para seguir usándola sin cortes.</div>
              </div>
            </div>
            <button onClick={onRenew} style={{ width: '100%', marginTop: 13, border: 0, cursor: 'pointer', borderRadius: 999, padding: '12px 18px', background: '#854600', color: '#fff', font: '600 15px Inter' }}>Renovar mi Lemon Card</button>
          </div>}

          {/* acciones de la tarjeta */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {actions.map((a) =>
            <div key={a.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 56, height: 56, borderRadius: 999, background: LX.layer3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LI name={a.icon} size={22} color={LX.text1} />
                </div>
                <span style={{ font: '500 11px Inter', color: LX.text2, textAlign: 'center', lineHeight: 1.2, whiteSpace: 'pre-line' }}>{a.label}</span>
              </div>
            )}
          </div>

          <button style={{ alignSelf: 'center', display: 'inline-flex', alignItems: 'center', gap: 6, border: 0, background: 'transparent', cursor: 'pointer', font: '600 15px Inter', color: 'var(--text-brand)' }}>
            Ver más <LI name="arrow-expand-more" size={18} color="var(--text-brand)" />
          </button>
        </div>
      </Screen>
    </Anim>);

}

// shipment tracking (opens from the "Tarjeta en proceso" banner)
function TrackingContent({ onClose }) {
  const GREEN = '#00CA57';
  const steps = [
  { t: 'Pediste tu tarjeta', s: 'Solicitaste tu tarjeta el día 21 de enero.', done: true },
  { t: 'El correo tiene tu tarjeta', s: 'Nº de envío: GP0870730420NA', link: 'Seguir envío en Andreani', done: true },
  { t: '¡Llega hoy!', s: 'Puede ser recibida por cualquier persona mayor de 13 años presentando su DNI.', done: true },
  { t: 'Pendiente de entrega', s: 'Recibirás la tarjeta entre el 28 de enero y el 7 de febrero.', done: false }];

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <div style={{ font: '500 22px Geist', letterSpacing: '-0.02em', color: LX.text1 }}>Seguí tu envío</div>
      </div>
      <div style={{ padding: '2px 0 4px' }}>
        {steps.map((st, i) => {
          const last = i === steps.length - 1;
          // el tramo verde llega hasta el último paso cumplido; lo pendiente, gris
          const lineColor = st.done && steps[i + 1] && steps[i + 1].done ? GREEN : 'rgba(5,5,5,0.2)';
          return (
            <div key={i} style={{ display: 'flex', gap: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 999, flexShrink: 0, boxSizing: 'border-box',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: st.done ? GREEN : 'transparent',
                  border: st.done ? 'none' : '2px solid rgba(5,5,5,0.2)'
                }}>{st.done && <LI name="feedback-positive" size={13} color="#fff" />}</span>
                {!last && <span style={{ width: 2, flex: 1, minHeight: 30, background: lineColor, margin: '3px 0' }} />}
              </div>
              <div style={{ paddingBottom: last ? 0 : 18, flex: 1, minWidth: 0 }}>
                <div style={{ font: '700 16px Inter', letterSpacing: '0.01em', color: st.done ? '#050505' : 'rgba(5,5,5,0.45)' }}>{st.t}</div>
                <div style={{ font: '400 14px Inter', color: '#808080', marginTop: 3, lineHeight: 1.43 }}>{st.s}</div>
                {st.link &&
                <button onClick={(e) => e.preventDefault()} style={{ border: 0, background: 'transparent', padding: 0, marginTop: 4, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, font: '600 14px Inter', color: GREEN }}>
                  {st.link}<LI name="arrow-foward" size={14} color={GREEN} />
                </button>}
              </div>
            </div>);

        })}
      </div>
      <Btn variant="primary" onClick={onClose}>Entendido</Btn>
    </div>);

}

// ════════════════════════════════════════════════════════════════
// FLOW 5 — Usuario SIN tarjetas → "Elegí tu tarjeta"
// ════════════════════════════════════════════════════════════════
function Flow5({ onMenu, meets, onMeet, pomelo }) {
  const [route, setRoute] = useStateF(null);
  const [activated, setActivated] = useStateF(!!pomelo);   // virtual activada (Pomelo ya tiene)
  const [fisicaTransit, setFisicaTransit] = useStateF(false); // física pedida, en camino
  const [fisicaActive, setFisicaActive] = useStateF(false);   // física activada
  const [track, setTrack] = useStateF(false);
  const [openCard, setOpenCard] = useStateF(null);            // tarjeta abierta en su detalle
  const [addr, setAddr] = useStateF(undefined);               // dirección de envío elegida

  // virtual → activá tu tarjeta virtual (creando → lista → tab de tarjetas, ya activa)
  if (route === 'virtual') return <Flow1 onMenu={() => setRoute(null)} replace={false} startStep="design" onActivated={() => { setActivated(true); setRoute(null); }} />;
  // Onboarding sin tarjetas (f5, !pomelo): recién creada, sin fondos → estado vacío.
  // Usuario que ya tenía tarjeta (pomelo): mostramos sus movimientos.
  if (route === 'cardDetail' && openCard) return <Anim k="f5detail"><CardHome variant={openCard.variant} design={openCard.design || 'violeta'} mask={openCard.mask} balance={pomelo ? 1 : 0} startInWallet={!!openCard.nfc} onBack={() => setRoute(null)} onClose={onMenu} /></Anim>;
  // Pedir tarjeta (botón +): elegir → física (3 pagos QR) o crédito → dirección.
  if (route === 'add') return <Anim k="f5add"><AddCardScreen onBack={() => setRoute(null)} onClose={onMenu} onFisica={() => setRoute('fvp')} onCredito={() => setRoute('creditoAddr')} /></Anim>;
  if (route === 'fvp') return <Anim k="f5fvp"><FisicaValueProp onBack={() => setRoute(activated ? 'add' : null)} onClose={onMenu} onContinue={() => setRoute('fisicaAddr')} /></Anim>;
  if (route === 'fisicaAddr') return <Anim k="f5faddr"><AddressSearch onBack={() => setRoute('fvp')} onClose={onMenu} onPick={(a) => { setAddr(a); setRoute('fisicaPay'); }} /></Anim>;
  if (route === 'fisicaPay') return <Anim k="f5fpay"><PagarFisica onBack={() => setRoute('fisicaAddr')} onClose={onMenu} onChangeAddress={() => setRoute('fisicaAddr')} address={addr} onContinue={() => { setFisicaTransit(true); setRoute(null); }} /></Anim>;
  if (route === 'creditoAddr') return <Anim k="f5caddr"><AddressSearch onBack={() => setRoute('add')} onClose={onMenu} onPick={() => setRoute('creditoDone')} /></Anim>;
  if (route === 'creditoDone') return <Anim k="f5cdone"><OrderConfirmation onDone={() => setRoute(null)} onMenu={onMenu} /></Anim>;
  if (route === 'fisicaActivate') return <CardActivation onBack={() => setRoute(null)} onClose={onMenu} onDone={() => { setFisicaActive(true); setFisicaTransit(false); setRoute(null); }} />;
  if (route === 'fisicaDelivery') return <Anim k="f5deliv"><DeliveryOnboarding onDone={() => { setFisicaActive(true); setFisicaTransit(false); setRoute(null); }} onMenu={onMenu} /></Anim>;

  // Sin NINGUNA tarjeta todavía → onboarding inmersivo (elegí tu primera tarjeta).
  if (!activated && !fisicaTransit && !fisicaActive)
  return <Anim k="f5chooser"><CardChooser onBack={onMenu} onVirtual={() => setRoute('virtual')} onFisica={() => setRoute('fvp')} /></Anim>;

  const cards = [
  activated ?
  { variant: 'virtual', title: 'Tarjeta virtual', mask: pomelo ? '•••• 8763' : '•••• 2291', status: 'Activa', nfc: true } :
  { variant: 'virtual', title: 'Tarjeta virtual', mask: '••••', activate: true }];

  if (fisicaActive) cards.push({ variant: 'fisica', title: 'Lemon Card', mask: '•••• 5520', status: 'Activa' });

  const openCardDetail = (v) => { const c = cards.find((x) => x.variant === v); if (c && !c.activate) { setOpenCard(c); setRoute('cardDetail'); } };

  // Solo seguimiento de envío si la física está en camino. NO incentivamos
  // pedir física: eso vive en el botón + (el usuario entra a propósito).
  let aboveCards = null, belowCards = null;
  if (fisicaTransit) {
    const tb = <TransitBanner onActivate={() => setRoute('fisicaActivate')} onTrack={() => setTrack(true)} />;
    if (pomelo) aboveCards = tb; else belowCards = tb;
  }

  const AddBtn =
  <button onClick={() => setRoute('add')} style={{ width: 40, height: 40, borderRadius: 999, border: 0, background: LX.layer3, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
      <LI name="add-more" size={22} color={LX.text1} />
    </button>;

  return (
    <Anim k={'f5hub' + activated + fisicaTransit + fisicaActive}>
      <div style={{ height: '100%', position: 'relative' }}>
      <Screen>
        <BigHeader title="Tarjetas" onBack={onMenu} right={AddBtn} />
        <div style={{ padding: '4px 16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {!activated &&
          <NfcHero
            onPrimary={() => setRoute('virtual')}
            body="Con tu tarjeta virtual pagás directo desde tu celu con Apple Pay."
            cta="Activá tu tarjeta virtual" />}
          {aboveCards}
          <CardsModule cards={cards} onActivate={() => setRoute('virtual')} onCardTap={openCardDetail} />
          {belowCards}
          {(activated || fisicaActive) && <ExteriorBanner />}
          {pomelo &&
          <>
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
          </>}
        </div>
      </Screen>
      <Sheet open={track} onClose={() => setTrack(false)}>
        <TrackingContent onClose={() => setTrack(false)} />
      </Sheet>
      </div>
    </Anim>);

}

// ════════════════════════════════════════════════════════════════
// PEDIR FÍSICA — pedir la tarjeta tiene un costo (pago, no requisitos)
// ════════════════════════════════════════════════════════════════
function PedirFisicaFlow({ onMenu, onComplete, onboarding }) {
  // En onboarding entramos directo al value prop; si no, mostramos el hub con el pitch.
  return <Flow2 onMenu={onMenu} onComplete={onComplete} startStep={onboarding ? 'fvp' : 'hub'} />;
}

function RequisitoChooser({ onBack, onPick, headerTitle = 'Pedir tarjeta física', title = '¿Qué experiencia querés ver?', subtitle = 'Estamos evaluando si pedimos un piso de inversión. Entrá a cualquiera de las dos para recorrerla.' }) {
  const opts = [
  { id: 'sin', icon: 'celphone', bg: 'var(--c-greent-5)', fg: 'var(--c-greent-60)', t: 'Sin requisitos', s: 'Camino directo: validás la dirección y la pedís.', tag: 'Más simple' },
  { id: 'con', icon: 'stocks', bg: 'var(--c-solar-5)', fg: 'var(--c-solar-50)', t: 'Con requisito de US$50', s: 'Pide tener US$50 invertidos antes de pedir la física.', tag: 'Más fricción' }];

  return (
    <Screen>
      <StepHeader title={headerTitle} onBack={onBack} />
      <div style={{ padding: '6px 16px 8px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <div style={{ font: '500 24px Geist', letterSpacing: '-0.02em', color: LX.text1 }}>{title}</div>
          <div style={{ font: '400 14px Inter', color: LX.text2, marginTop: 6, lineHeight: 1.45 }}>
            {subtitle}
          </div>
        </div>
        {opts.map((o) =>
        <button key={o.id} onClick={() => onPick(o.id)} style={{
          display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', cursor: 'pointer',
          background: LX.layer, border: `1px solid ${LX.border}`, borderRadius: 16, padding: 16
        }}>
            <div style={{ width: 46, height: 46, borderRadius: 13, background: o.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <LI name={o.icon} size={24} color={o.fg} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ font: '600 16px Inter', color: LX.text1 }}>{o.t}</div>
                <span style={{ flexShrink: 0, whiteSpace: 'nowrap', background: LX.layer3, color: LX.text2, font: '600 11px Inter', padding: '4px 9px', borderRadius: 999 }}>{o.tag}</span>
              </div>
              <div style={{ font: '400 13px Inter', color: LX.text2, marginTop: 4, lineHeight: 1.4 }}>{o.s}</div>
            </div>
            <LI name="arrow-foward" size={18} color={LX.text3} />
          </button>
        )}
      </div>
    </Screen>);

}

function ChooserScreen({ onBack, onPick }) {
  const opts = [
  { id: 'virtual', variant: 'virtual', t: 'Tarjeta virtual', cta: 'Crear', bullets: ['Instantánea, prepaga y gratis con cashback.', 'La sumás al celu y pagás con NFC.'] },
  { id: 'fisica', variant: 'fisica', t: 'Lemon Card', cta: 'Pedir', bullets: ['Prepaga, gratis y con envío a domicilio.', 'Cashback en cripto en cada compra.'] },
  { id: 'credito', variant: 'credito', t: 'Tarjeta de crédito', cta: 'Pedir', soon: true, bullets: ['Respaldada con Bitcoin.', 'Sin historial crediticio.'] }];

  return (
    <Screen>
      <BigHeader title="Elegí tu tarjeta" onBack={onBack} right={<LI name="view-help" size={24} color={LX.text2} />} />
      <div style={{ padding: '4px 16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ font: '400 14px Inter', color: LX.text2, lineHeight: 1.45, margin: '0 2px 2px' }}>
          Todavía no tenés ninguna. Empezá por la que más te sirva — después podés sumar las otras.
        </div>
        {opts.map((o) =>
        <Surface key={o.id} pad={16}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <CardThumb variant={o.variant} w={72} />
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ font: '600 16px Inter', color: LX.text1 }}>{o.t}</div>
                  {o.soon && <Tag tone="neutral">Pronto</Tag>}
                </div>
                <ul style={{ margin: 0, padding: '0 0 0 16px', display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {o.bullets.map((b, i) => <li key={i} style={{ font: '400 13px Inter', color: LX.text2, lineHeight: 1.4 }}>{b}</li>)}
                </ul>
                <div>
                  <button onClick={o.soon ? undefined : () => onPick(o.id)} style={{
                  border: 0, borderRadius: 999, padding: '9px 22px', font: '600 14px Inter',
                  cursor: o.soon ? 'default' : 'pointer',
                  background: o.soon ? 'var(--button-disabled)' : LX.dark,
                  color: o.soon ? 'var(--text-disabled)' : '#fff'
                }}>{o.cta}</button>
                </div>
              </div>
            </div>
          </Surface>
        )}
      </div>
    </Screen>);

}

// Activación de tarjeta física — ingresá 16 dígitos + clave de 4 (onboarding)
function CardActivation({ onBack, onClose, onDone }) {
  const [code, setCode] = useStateF('');
  const clean = code.replace(/\D/g, '').slice(0, 4);
  const ready = clean.length === 4;
  return (
    <Anim k="cardact" noWrap>
      <Screen footer={<Btn variant="primary" disabled={!ready} onClick={onDone}>Activar</Btn>}>
        <StepHeader title="Activá tu tarjeta" onBack={onBack} onClose={onClose} />
        <div style={{ padding: '6px 16px 8px', display: 'flex', flexDirection: 'column', gap: 26 }}>
          <div>
            <div style={{ font: '500 24px Geist', letterSpacing: '-0.02em', color: LX.text1 }}>Activá tu Lemon Card</div>
            <div style={{ font: '400 14px Inter', color: LX.text2, marginTop: 6, lineHeight: 1.45 }}>
              Ingresá los <b style={{ color: LX.text1 }}>últimos 4 números</b> que figuran al frente de tu tarjeta física.
            </div>
          </div>

          {/* tarjeta de referencia */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2px 0' }}>
            <div style={{ position: 'relative' }}>
              <CardArt variant="fisica" width={216} />
              <div style={{ position: 'absolute', right: 16, bottom: 14, font: '600 12px Geist', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.55)' }}>•••• ••••</div>
            </div>
          </div>

          {/* 4 casilleros con input invisible encima (toca para enfocar) */}
          <label style={{ position: 'relative', display: 'block' }}>
            <input
              inputMode="numeric" autoFocus value={clean}
              onChange={(e) => setCode(e.target.value)}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, border: 0, cursor: 'text' }} />
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              {[0, 1, 2, 3].map((i) =>
              <div key={i} style={{
                width: 60, height: 68, borderRadius: 16, background: LX.layer,
                border: `2px solid ${clean.length === i ? LX.text1 : LX.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                font: '500 28px Geist', color: LX.text1, transition: 'border-color .15s'
              }}>{clean[i] || ''}</div>
              )}
            </div>
          </label>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, font: '400 13px Inter', color: LX.text3, lineHeight: 1.45 }}>
            <LI name="shield-alt" size={16} color={LX.text3} style={{ flexShrink: 0, marginTop: 1 }} />
            Solo para confirmar que la tarjeta es tuya. Nunca te pedimos los 16 números completos.
          </div>
        </div>
      </Screen>
    </Anim>);

}

// Delivery onboarding (quick win) — claridad al recibir la tarjeta nueva
function DeliveryOnboarding({ onDone, onMenu }) {
  return (
    <Anim k="delivery" noWrap>
      <Screen footer={
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Btn variant="primary" leftIcon="celphone" onClick={onDone}>Activar mi tarjeta nueva</Btn>
          <Btn variant="ghost" onClick={onMenu}>Ir al menú del prototipo</Btn>
        </div>
      }>
        <StepHeader title="Tu tarjeta llegó" onClose={onMenu} />
        <div style={{ padding: '8px 16px 8px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0 2px' }}>
            <div style={{ transform: 'rotate(-6deg)' }}><CardArt variant="fisica" width={150} glow /></div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ font: '500 24px Geist', letterSpacing: '-0.02em', color: LX.text1 }}>¡Llegó tu nueva Lemon Card!</div>
            <div style={{ font: '400 14px Inter', color: LX.text2, marginTop: 6, lineHeight: 1.45 }}>Tu tarjeta vieja sirve hasta el 30/06. Una vez que actives la nueva, la vieja se da de baja.

            </div>
          </div>

          <DebitosInfo />

        </div>
      </Screen>
    </Anim>);

}

// screen transition wrapper (plain — animation removed: it was unreliable
// inside the scaled/overflow-clipped device frame, leaving screens stuck hidden)
const Anim = ({ children, k, noWrap }) =>
noWrap ? children : <div key={k} style={{ height: '100%' }}>{children}</div>;

Object.assign(window, { Flow1, Flow2, Flow3, Flow4, Flow5, PedirFisicaFlow, RequisitoChooser, ChooserScreen, NfcSuccess, RequisitoScreen, PortfolioScreen, DeliveryOnboarding, CardActivation, VirtualUpsell, LoadingScreen, Anim, Bullet, Breakdown });