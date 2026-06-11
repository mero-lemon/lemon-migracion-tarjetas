// The three card flows. Each manages its own step state.
const { useState: useStateF } = React;

// ════════════════════════════════════════════════════════════════
// FLOW 1 — Nueva tarjeta virtual (reemplazo) + NFC / Wallet
// ════════════════════════════════════════════════════════════════
function Flow1({ onMenu, replace = true, startStep = 'hub', onActivated }) {
  const [step, setStep] = useStateF(startStep);
  const [ack, setAck] = useStateF(false);
  const [openCard, setOpenCard] = useStateF(null);
  const [pushOpen, setPushOpen] = useStateF(false);   // push visible en el home
  const [walletAdded, setWalletAdded] = useStateF(false); // ¿ya sumó la nueva a la wallet?
  // standalone (f1/f1b): al terminar caemos en el home de tarjetas con la nueva.
  // embebido (Flow4/Flow5): devolvemos el control al flujo padre.
  const standalone = startStep === 'hub';
  const finish = standalone ? () => setStep('home') : onMenu;

  if (step === 'hub')
  return <Anim k="f1hub"><TarjetasHub mode={replace ? 'replaceVirtual' : 'firstVirtual'} onBack={onMenu} onPrimary={() => {setAck(false);setStep(replace ? 'replace' : 'creating');}} /></Anim>;

  if (step === 'replace')
  return (
    <Anim k="f1rep">
        <Screen footer={
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Btn variant="primary" disabled={!ack} onClick={() => setStep('creating')}>Crear tarjeta nueva</Btn>
            <Btn variant="ghost" onClick={() => setStep('hub')}>Mejor no</Btn>
          </div>
      }>
          <StepHeader title="Nueva tarjeta virtual" onBack={() => setStep('hub')} onClose={onMenu} />
          <div style={{ padding: '6px 16px 8px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* old → new */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '8px 0 4px' }}>
              <div style={{ textAlign: 'center' }}>
                <CardArt variant="virtual" width={116} faded />
                <div style={{ font: '500 11px Inter', color: LX.text3, marginTop: 6 }}>•••• 8763 · se da de baja</div>
              </div>
              <LI name="arrow-foward" size={22} color={LX.text3} />
              <div style={{ textAlign: 'center' }}>
                <CardArt variant="virtual" width={116} glow />
                <div style={{ font: '600 11px Inter', color: 'var(--c-lemon-50)', marginTop: 6 }}>Nueva · al instante</div>
              </div>
            </div>

            <div>
              <div style={{ font: '500 24px Geist', letterSpacing: '-0.02em', color: LX.text1 }}>Esto reemplaza tu tarjeta actual</div>
              <div style={{ font: '400 14px Inter', color: LX.text2, marginTop: 6, lineHeight: 1.45 }}>
                No es una segunda tarjeta: al crear la nueva, damos de baja la <b style={{ color: LX.text1 }}>•••• 8763</b> en el acto.
              </div>
            </div>

            <Surface pad={0} style={{ overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '14px 16px 12px' }}>
                <LI name="programed-tx" size={18} color="#854600" />
                <div style={{ font: '600 14px Inter', color: LX.text1, flex: 1 }}>Débitos automáticos a revincular</div>
                <span style={{ font: '600 12px Inter', color: '#854600', background: 'var(--bg-warning-01)', padding: '3px 9px', borderRadius: 999 }}>3</span>
              </div>
              <div style={{ padding: '0 16px' }}>
                {[
              ['streaming', 'Netflix', 'US$ 12,99 / mes'],
              ['streaming', 'Spotify', '$ 2.499 / mes'],
              ['tech', 'iCloud+', '$ 1.100 / mes']].
              map(([icon, name, amt], i) =>
              <React.Fragment key={i}>
                    {i > 0 && <Divider />}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0' }}>
                      <div style={{ width: 38, height: 38, borderRadius: 999, background: LX.layer3, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <LI name={icon} size={18} color={LX.text1} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ font: '600 14px Inter', color: LX.text1 }}>{name}</div>
                        <div style={{ font: '400 12px Inter', color: LX.text2, marginTop: 1 }}>{amt}</div>
                      </div>
                      <span style={{ font: '600 12px Inter', color: '#854600', background: 'var(--bg-warning-01)', padding: '4px 10px', borderRadius: 999, whiteSpace: 'nowrap' }}>Revincular</span>
                    </div>
                  </React.Fragment>
              )}
              </div>
              <div style={{ padding: '0 16px 14px', marginTop: 4 }}>
                <div style={{ font: '400 12px Inter', color: LX.text2, lineHeight: 1.4 }}>
                  Como la nueva tarjeta tiene otro número, vas a tener que volver a cargarla en cada servicio para que no se te corten.
                </div>
              </div>
            </Surface>

            <PmNote>Después de crear la nueva, ofrezcamos revincular estos débitos en 1 toque — es el principal motivo de fricción al cambiar de número.</PmNote>

            <button onClick={() => setAck((a) => !a)} style={{ display: 'flex', alignItems: 'flex-start', gap: 11, background: 'transparent', border: 0, cursor: 'pointer', textAlign: 'left', padding: '2px 2px 4px' }}>
              <span style={{ width: 24, height: 24, borderRadius: 7, flexShrink: 0, marginTop: 1, border: `2px solid ${ack ? 'var(--c-lemon-50)' : LX.text3}`, background: ack ? 'var(--c-lemon-50)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', font: '700 14px Inter' }}>{ack ? '✓' : ''}</span>
              <span style={{ font: '500 14px Inter', color: LX.text1, lineHeight: 1.4 }}>Entiendo que mi tarjeta •••• 8763 se da de baja y no la voy a poder volver a usar.</span>
            </button>
          </div>
        </Screen>
      </Anim>);


  if (step === 'creating')
  return <Anim k="f1load"><LoadingScreen title="Creando tu nueva tarjeta…" sub={replace ? 'Damos de baja la anterior y generamos los datos nuevos.' : 'Generamos los datos de tu nueva tarjeta virtual.'} onDone={() => setStep('activating')} /></Anim>;

  if (step === 'activating')
  return <ActivatingCardScreen variant="virtual" onHome={() => {
    if (standalone) { setPushOpen(true); setStep('home'); } else { onActivated && onActivated(); }
  }} />;

  if (step === 'home') {
    // Home de tarjetas post-creación: se ve la nueva virtual y se entra al detalle de cada una.
    const cards = replace ?
    [{ variant: 'virtual', title: 'Tarjeta virtual', mask: '•••• 2291', status: 'Activa', nfc: true }] :
    [{ variant: 'fisica', title: 'Lemon Card', mask: '•••• 4971', status: 'Activa' },
     { variant: 'virtual', title: 'Tarjeta virtual', mask: '•••• 2291', status: 'Activa', nfc: true }];
    const newCard = cards.find((c) => c.variant === 'virtual') || cards[0];
    const openPush = () => { setPushOpen(false); setOpenCard(newCard); setStep('cardDetail'); };
    return (
      <Anim k="f1home">
        <div style={{ height: '100%', position: 'relative' }}>
          <Screen>
            <BigHeader title="Tarjetas" onBack={onMenu} />
            <div style={{ padding: '4px 16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <CardTabs />
              {!pushOpen &&
              <div style={{ display: 'flex', gap: 11, alignItems: 'center', background: 'var(--bg-positive-01)', borderRadius: 16, padding: '14px 16px' }}>
                <LI name="feedback-positive" size={22} color="var(--c-lemon-50)" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ font: '600 15px Inter', color: '#0F602C' }}>¡Tu tarjeta virtual está lista!</div>
                  <div style={{ font: '500 13px Inter', color: '#0F602C', opacity: 0.85, marginTop: 2 }}>Tocá una tarjeta para ver sus datos y opciones.</div>
                </div>
              </div>}
              <CardsModule cards={cards} onCardTap={(v) => { setOpenCard(cards.find((c) => c.variant === v) || cards[0]); setStep('cardDetail'); }} />
              <ExteriorBanner />
            </div>
          </Screen>
          {pushOpen && <WalletPush onTap={openPush} onDismiss={() => setPushOpen(false)} />}
        </div>
      </Anim>);
  }

  if (step === 'cardDetail' && openCard)
  return <CardDetail
    variant={openCard.variant} title={openCard.title} mask={openCard.mask}
    nfc={openCard.nfc} walletAdded={openCard.variant === 'virtual' ? walletAdded : true}
    onBack={() => setStep('home')} onClose={onMenu}
    onAddWallet={() => setWalletAdded(true)} />;

  return null;
}

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
  const back = () => startStep === 'hub' ? setStep('hub') : onMenu();
  if (step === 'hub')
  return <Anim k="f2hub"><TarjetasHub mode="fisica" onBack={onMenu} onPrimary={() => setStep('pay')} onActivate={() => setStep('activate')} /></Anim>;
  if (step === 'pay')
  return <Anim k="f2pay"><PaymentScreen onBack={back} onClose={onMenu} onPay={() => setStep('address')} /></Anim>;
  if (step === 'activate')
  return <CardActivation onBack={back} onClose={onMenu} onDone={() => setStep('activating')} />;
  if (step === 'activating')
  return <ActivatingCardScreen variant="fisica" onHome={onComplete || (() => setStep('hub'))} />;
  if (step === 'address')
  return <Anim k="f2addr"><AddressScreen onBack={() => setStep('pay')} onClose={onMenu} onConfirm={() => setStep('done')} /></Anim>;
  if (step === 'done')
  return <Anim k="f2done"><OrderConfirmation onDone={onComplete || (() => setStep('hub'))} onMenu={onMenu} /></Anim>;
  return null;
}

// ════════════════════════════════════════════════════════════════
// FLOW 3 — Física CON requisito (≥ US$50 invertidos)
// ════════════════════════════════════════════════════════════════
function Flow3({ onMenu, meets, onMeet, startStep = 'hub', onComplete }) {
  const [step, setStep] = useStateF(startStep);
  if (step === 'hub')
  return <Anim k="f3hub"><TarjetasHub mode="fisica" onBack={onMenu} onPrimary={() => setStep('req')} /></Anim>;
  if (step === 'req')
  return <Anim k={'f3req' + meets}><RequisitoScreen meets={meets} onBack={() => startStep === 'hub' ? setStep('hub') : onMenu()} onClose={onMenu} onContinue={() => setStep('address')} onInvest={() => setStep('portfolio')} /></Anim>;
  if (step === 'portfolio')
  return <PortfolioScreen onBack={() => setStep('req')} onClose={onMenu} onComply={() => {onMeet && onMeet();setStep('address');}} />;
  if (step === 'address')
  return <Anim k="f3addr"><AddressScreen onBack={() => setStep('req')} onClose={onMenu} onConfirm={() => setStep('done')} /></Anim>;
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

          {meets ?
          <div style={{ display: 'flex', gap: 9, alignItems: 'center', background: 'var(--bg-positive-01)', borderRadius: 12, padding: '12px 14px' }}>
                <LI name="feedback-positive" size={18} color="var(--c-lemon-50)" />
                <span style={{ font: '500 13px Inter', color: '#0F602C' }}>Listo, ya cumplís el requisito. Seguí para confirmar tu dirección.</span>
              </div> :
          <PmNote>Acá medimos el costo del piso: metés fricción en el pico de intención. Si lo dejamos, que el monto se sienta alcanzable y muestre el beneficio de invertir, no solo el bloqueo.</PmNote>}
        </div>
      </Screen>
    </Anim>);

}

// Portfolio / Inicio home — adonde te lleva el accionable del requisito.
// Botón "Ya cumplí el objetivo" → continúa a "¿Dónde te la mandamos?".
function PortfolioScreen({ onBack, onClose, onComply }) {
  const assets = [
  { icon: 'currency-peso', name: 'Pesos digitales', amt: '$ ***' },
  { icon: 'currency-dollar', name: 'Dólares digitales', amt: 'U$ ***' },
  { icon: 'currency-bitcoin', name: 'Bitcoin & crypto', amt: 'U$ ***' },
  { icon: 'stocks', name: 'Acciones', amt: 'U$ ***', soon: true }];

  const tabs = ['home-on', 'new-swap-coins', 'alert-time', 'widgets'];
  return (
    <Anim k="portfolio" noWrap>
      <Screen footer={
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Btn variant="brand" leftIcon="feedback-positive" onClick={onComply}>Ya cumplí el objetivo</Btn>
          {/* decorative bottom tab bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-around', background: LX.layer, borderRadius: 999, padding: '12px 14px', boxShadow: 'var(--shadow-card)' }}>
              {tabs.map((t, i) => <LI key={i} name={t} size={22} color={i === 0 ? LX.text1 : LX.text3} />)}
            </div>
            <div style={{ width: 52, height: 52, borderRadius: 999, background: LX.dark, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <LI name="QR-Scanner" size={24} color="var(--c-lime-40)" />
            </div>
          </div>
        </div>
      }>
        {/* top bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px 6px' }}>
          <span style={{ width: 34, height: 34, borderRadius: 999, background: LX.dark, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Leaf size={19} color="var(--c-lime-40)" vein="rgba(0,0,0,0.3)" />
          </span>
          <span style={{ font: '600 18px Inter', color: LX.text1 }}>$mica</span>
          <div style={{ flex: 1 }} />
          <LI name="search" size={22} color={LX.text1} />
          <LI name="view-notification" size={22} color={LX.text1} />
          <LI name="card-on" size={22} color={LX.text1} />
        </div>

        <div style={{ padding: '4px 16px 8px' }}>
          {/* tabs + balance card */}
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex' }}>
              <div style={{ background: 'var(--c-lime-40)', color: LX.dark, font: '600 16px Inter', padding: '12px 30px', borderRadius: '16px 16px 0 0' }}>Inicio</div>
              <div style={{ flex: 1, color: LX.text2, font: '500 16px Inter', padding: '12px 0', textAlign: 'center' }}>Portfolio</div>
            </div>
            <div style={{ background: LX.layer, borderRadius: '0 16px 16px 16px', padding: '20px', boxShadow: 'var(--shadow-card)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ font: '600 17px Inter', color: LX.text1, whiteSpace: 'nowrap' }}>Balance total</span>
                <LI name="view-balance-off" size={18} color={LX.text2} />
              </div>
              <div style={{ font: '500 38px Geist', letterSpacing: '-0.03em', color: LX.text1, marginTop: 6 }}>U$ <span style={{ letterSpacing: '2px' }}>•••••</span></div>
            </div>
          </div>

          {/* asset grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
            {assets.map((a, i) =>
            <Surface key={i} pad={16} style={{ minHeight: 120, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 999, background: LX.layer3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LI name={a.icon} size={20} color={LX.text2} />
                  </div>
                  {a.soon && <span style={{ background: 'var(--c-green-40)', color: '#fff', font: '600 11px Inter', padding: '4px 10px', borderRadius: 999 }}>Próximo</span>}
                </div>
                <div style={{ flex: 1 }} />
                <div style={{ font: '400 14px Inter', color: LX.text2 }}>{a.name}</div>
                <div style={{ font: '500 18px Geist', color: LX.text1, marginTop: 2 }}>{a.amt}</div>
              </Surface>
            )}
          </div>

          <div style={{ marginTop: 14 }}>
            <PmNote>El accionable del requisito te trae a tu portfolio para invertir. Atajo de prototipo: tocá “Ya cumplí el objetivo” para simular que llegaste a los US$100 y seguir.</PmNote>
          </div>
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

          <PmNote>Reemplazamos el piso de inversión por un cobro único: bajamos la fricción de "tenés que invertir" a "pagás un monto chico". Probar el precio y dejar el envío gratis como gancho.</PmNote>
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
  const [pushOpen, setPushOpen] = useStateF(false);
  const [walletAddedNew, setWalletAddedNew] = useStateF(false); // wallet en la nueva física
  if (step === 'hub')
  return (
    <Anim k={'f4hub' + phase}>
        <div style={{ height: '100%', position: 'relative' }}>
          <TarjetasHub
          mode="renewFisica" phase={phase} onBack={onMenu}
          showExpiringBanner={meets}
          showNfcBanner={Boolean(upsellVirtual)}
          onNfc={() => setStep('virtual')}
          onCardTap={phase === 'active' ? ((v) => { if (v === 'fisica') setStep('detailNew'); }) : (!meets ? ((v) => { if (v === 'fisica') setStep('detail'); }) : undefined)}
          onPrimary={() => setStep(upsellVirtual && !virtualDone ? 'upsell' : 'renew')}
          onActivate={() => setStep('delivery')}
          onTrack={() => setTrack(true)} />

          <Sheet open={track} onClose={() => setTrack(false)}>
            <TrackingContent onClose={() => setTrack(false)} />
          </Sheet>
          {pushOpen &&
          <WalletPush
            onTap={() => { setPushOpen(false); setStep('detailNew'); }}
            onDismiss={() => setPushOpen(false)}
            title="Tu nueva Lemon Card ya está activa"
            body="Ya podés sumar tu tarjeta a tu Apple Wallet." />}
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
            <Btn variant="primary" onClick={() => { setReqFrom('renew'); setStep('pay'); }}>Pedir mi nueva física</Btn>
            <Btn variant="ghost" onClick={() => setStep('hub')}>Ahora no</Btn>
          </div>
      }>
          <StepHeader title="Renovar Lemon Card" onBack={() => setStep('hub')} onClose={onMenu} />
          <div style={{ padding: '6px 16px 8px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '8px 0 4px' }}>
              <div style={{ textAlign: 'center' }}>
                <CardThumb variant="fisica" w={86} portrait />
                <div style={{ font: '500 11px Inter', color: LX.text3, marginTop: 6 }}>•••• 4971 · vence 06/26</div>
              </div>
              <LI name="arrow-foward" size={22} color={LX.text3} />
              <div style={{ textAlign: 'center' }}>
                <CardThumb variant="fisica" w={86} portrait />
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
                <Bullet icon="programed-tx" t="La vieja se da de baja al activar la nueva" s="Re-vinculá tus débitos automáticos cuando la actives." tone="warn" />
              </div>
            </Surface>
            <PmNote>Disparamos esto solo a 30 días del vencimiento, con push + banner. Así la renovación se siente proactiva y no un trámite de último momento.</PmNote>
          </div>
        </Screen>
      </Anim>);

  if (step === 'detail')
  return <CardDetail variant="fisica" title="Lemon Card" mask="•••• 4971" expiring onBack={() => setStep('hub')} onClose={onMenu} onRenew={() => { setReqFrom('detail'); setStep('pay'); }} />;
  if (step === 'pay')
  return <Anim k="f4pay"><PaymentScreen onBack={() => setStep(reqFrom)} onClose={onMenu} onPay={() => setStep('address')} /></Anim>;
  if (step === 'address')
  return <Anim k="f4addr"><AddressScreen onBack={() => setStep('pay')} onClose={onMenu} onConfirm={() => setStep('done')} /></Anim>;
  if (step === 'done')
  return <Anim k="f4done"><OrderConfirmation renewal onDone={() => {setPhase('transit');setStep('hub');}} onMenu={onMenu} /></Anim>;
  if (step === 'delivery')
  return <Anim k="f4deliv"><DeliveryOnboarding onDone={() => setStep('activating')} onMenu={onMenu} /></Anim>;
  if (step === 'activating')
  return <ActivatingCardScreen variant="fisica" onHome={() => { setPhase('active'); setPushOpen(true); setStep('hub'); }} />;
  if (step === 'detailNew')
  return <CardDetail variant="fisica" title="Lemon Card" mask="•••• 5520" nfc walletAdded={walletAddedNew} onBack={() => setStep('hub')} onClose={onMenu} onAddWallet={() => setWalletAddedNew(true)} />;
  return null;
}

// Card-home / detail screen (como el home real de cada tarjeta). Sirve para
// virtual y física. Si la tarjeta vence (expiring) muestra debajo de la imagen
// el banner de renovación — el único acceso a renovar para quien no cumple.
// Si la tarjeta soporta NFC pero el usuario todavía no la sumó a la billetera,
// mostramos el botón "Agregar a Apple Wallet" en vez del badge "En NFC".
function CardDetail({ variant = 'fisica', title = 'Lemon Card', mask, nfc = false, walletAdded = false, expiring = false, onBack, onClose, onRenew, onAddWallet }) {
  const showWalletBtn = nfc && !walletAdded;
  const showNfcBadge = nfc && walletAdded;
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
              {showNfcBadge && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, font: '600 11px Inter', color: 'var(--c-lemon-60)' }}><LI name="celphone" size={13} color="var(--c-lemon-60)" /> En NFC</span>}
            </div>}
          </div>

          {showWalletBtn &&
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <WalletBtn brand="apple" onClick={onAddWallet} />
            <div style={{ font: '400 12px Inter', color: LX.text2, textAlign: 'center', lineHeight: 1.4 }}>
              Sumá tu tarjeta al celu y pagá apoyándolo en el posnet.
            </div>
          </div>}

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

          {expiring &&
          <PmNote>El usuario que no cumple el piso ya paga con NFC, así que no lo empujamos con un banner en el home: la renovación queda acá adentro, debajo de la tarjeta.</PmNote>}
        </div>
      </Screen>
    </Anim>);

}

// virtual-card upsell shown after "Pedir mi nueva Lemon Card" (Pomelo-migration user, no virtual yet)
function VirtualUpsell({ onBack, onClose, onVirtual, onFisica }) {
  return (
    <Anim k="vupsell" noWrap>
      <Screen footer={
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Btn variant="primary" leftIcon="celphone" onClick={onVirtual}>Quiero mi tarjeta virtual</Btn>
          <Btn variant="ghost" onClick={onFisica}>Prefiero mi tarjeta física</Btn>
        </div>
      }>
        <StepHeader title="Antes de renovar" onBack={onBack} onClose={onClose} />
        <div style={{ padding: '6px 16px 8px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* NFC hero visual */}
          <div style={{
            position: 'relative', borderRadius: 22, overflow: 'hidden',
            background: 'radial-gradient(120% 95% at 78% 0%, #6a3fb0 0%, #3a1c64 52%, #1c0c36 100%)',
            padding: '26px 20px 22px', color: '#fff', textAlign: 'center'
          }}>
            <div style={{ position: 'absolute', top: -34, right: -44, width: 190, height: 190, borderRadius: 999, background: 'radial-gradient(circle, rgba(207,255,46,0.18), transparent 70%)' }} />
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <div style={{ transform: 'rotate(-7deg)' }}><CardArt variant="virtual" width={150} glow /></div>
            </div>
            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(207,255,46,0.16)', color: 'var(--c-lime-30)', font: '600 11px Inter', padding: '4px 10px', borderRadius: 999, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
              <Nfc size={13} color="var(--c-lime-30)" /> NUEVO
            </div>
          </div>

          <div>
            <div style={{ font: '500 24px Geist', letterSpacing: '-0.02em', color: LX.text1 }}>Ahora podés pagar sin tarjeta</div>
            <div style={{ font: '400 14px Inter', color: LX.text2, marginTop: 6, lineHeight: 1.45 }}>
              Con nuestra nueva <b style={{ color: LX.text1 }}>tarjeta virtual</b> pagás desde tu celu en cualquier lugar, sin necesidad de una tarjeta física.
            </div>
          </div>

          <Surface pad={4}>
            <div style={{ padding: '4px 12px' }}>
              <Bullet icon="celphone" t="Pagá con el celu en el posnet" s="Apple Pay o Google Pay, en un toque." />
              <Divider />
              <Bullet icon="rocket" t="La tenés al instante" s="Sin esperar el envío de la física." />
              <Divider />
              <Bullet icon="shield-alt" t="Mismo cashback y misma cuenta" s="Cripto en cada compra, como siempre." />
            </div>
          </Surface>

          <PmNote>Aprovechamos la renovación para empujar NFC: el usuario que viene de Pomelo todavía no tiene virtual. Es el mejor momento para mostrarle que puede pagar sin plástico.</PmNote>
        </div>
      </Screen>
    </Anim>);

}

// shipment tracking (opens from the "Tarjeta en proceso" banner)
function TrackingContent({ onClose }) {
  const steps = [
  ['Pedido confirmado', 'Mar 3 jun · 10:24', true],
  ['Tu tarjeta salió del depósito', 'Mié 4 jun · 08:10', true],
  ['En camino a tu domicilio', 'Llega hoy, entre las 14 y 18 h', 'now'],
  ['Entregada', 'Malabia 1720, Palermo', false]];

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <div style={{ font: '500 22px Geist', letterSpacing: '-0.02em', color: LX.text1 }}>Seguimiento del envío</div>
        <div style={{ font: '400 13px Inter', color: LX.text2, marginTop: 6 }}>Tu Lemon Card •••• 5520 está en camino</div>
      </div>
      <Surface pad={16} style={{ margin: '16px 0' }}>
        {steps.map(([t, d, state], i) =>
        <div key={i} style={{ display: 'flex', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{
              width: 24, height: 24, borderRadius: 999, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center', font: '600 12px Inter',
              background: state === true ? 'var(--c-lemon-50)' : state === 'now' ? 'var(--c-lime-40)' : LX.layer3,
              color: state === true ? '#fff' : LX.dark
            }}>{state === true ? '✓' : ''}</span>
              {i < steps.length - 1 && <span style={{ width: 2, flex: 1, minHeight: 22, background: LX.hair, margin: '2px 0' }} />}
            </div>
            <div style={{ paddingBottom: i < steps.length - 1 ? 16 : 0 }}>
              <div style={{ font: '600 14px Inter', color: state === false ? LX.text3 : LX.text1 }}>{t}</div>
              <div style={{ font: '400 12px Inter', color: LX.text2, marginTop: 1 }}>{d}</div>
            </div>
          </div>
        )}
      </Surface>
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
  const [pushOpen, setPushOpen] = useStateF(false);           // push "tu tarjeta ya está activa"
  const [pushVariant, setPushVariant] = useStateF(null);      // 'virtual' | 'fisica'
  const [walletAdded, setWalletAdded] = useStateF({ virtual: !!pomelo, fisica: false });
  const triggerPush = (v) => { setPushVariant(v); setPushOpen(true); };

  // virtual → activá tu tarjeta virtual (creando → lista → tab de tarjetas, ya activa)
  if (route === 'virtual') return <Flow1 onMenu={() => setRoute(null)} replace={false} startStep="creating" onActivated={() => { setActivated(true); setRoute(null); triggerPush('virtual'); }} />;
  if (route === 'cardDetail' && openCard) return <CardDetail variant={openCard.variant} title={openCard.title} mask={openCard.mask} nfc={openCard.nfc} walletAdded={walletAdded[openCard.variant]} onBack={() => setRoute(null)} onClose={onMenu} onAddWallet={() => setWalletAdded((w) => ({ ...w, [openCard.variant]: true }))} />;
  // física → mismo flujo que "Pedir física de Pomelo"; al terminar, vuelve acá con seguimiento
  if (route === 'fisica') return <PedirFisicaFlow onMenu={() => setRoute(null)} onboarding onComplete={() => { setFisicaTransit(true); setRoute(null); }} />;
  if (route === 'fisicaActivate') return <CardActivation onBack={() => setRoute(null)} onClose={onMenu} onDone={() => { setFisicaActive(true); setFisicaTransit(false); setRoute('fisicaActivating'); }} />;
  if (route === 'fisicaActivating') return <ActivatingCardScreen variant="fisica" onHome={() => { setRoute(null); triggerPush('fisica'); }} />;
  if (route === 'fisicaDelivery') return <Anim k="f5deliv"><DeliveryOnboarding onDone={() => { setFisicaActive(true); setFisicaTransit(false); setRoute('fisicaActivating'); }} onMenu={onMenu} /></Anim>;

  const cards = [
  activated ?
  { variant: 'virtual', title: 'Tarjeta virtual', mask: pomelo ? '•••• 8763' : '•••• 2291', status: 'Activa', nfc: true } :
  { variant: 'virtual', title: 'Tarjeta virtual', mask: '••••', activate: true }];

  if (fisicaActive) cards.push({ variant: 'fisica', title: 'Lemon Card', mask: '•••• 5520', status: 'Activa', nfc: true });

  const openCardDetail = (v) => { const c = cards.find((x) => x.variant === v); if (c && !c.activate) { setOpenCard(c); setRoute('cardDetail'); } };
  const openPushTarget = () => {
    const c = cards.find((x) => x.variant === pushVariant);
    if (c) { setOpenCard(c); setRoute('cardDetail'); }
    setPushOpen(false);
  };

  let aboveCards = null, belowCards = null;
  if (fisicaTransit) {
    const tb = <TransitBanner onActivate={() => setRoute('fisicaActivate')} onTrack={() => setTrack(true)} />;
    if (pomelo) aboveCards = tb; else belowCards = tb;
  } else if (!fisicaActive) {
    belowCards = <BoutiqueHero compact onPrimary={() => setRoute('fisica')} onActivate={() => setRoute('fisicaActivate')} />;
  }

  return (
    <Anim k={'f5hub' + activated + fisicaTransit + fisicaActive}>
      <div style={{ height: '100%', position: 'relative' }}>
      <Screen>
        <BigHeader title="Tarjetas" onBack={onMenu} />
        <div style={{ padding: '4px 16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <CardTabs />
          {!activated &&
          <NfcHero
            onPrimary={() => setRoute('virtual')}
            body="Con tu tarjeta virtual pagás directo desde tu celu con Apple Pay o Google Pay."
            cta="Activá tu tarjeta virtual" />}
          {aboveCards}
          <CardsModule cards={cards} onActivate={() => setRoute('virtual')} onCardTap={openCardDetail} />
          {belowCards}
          {pomelo &&
          <>
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
          </>}
        </div>
      </Screen>
      <Sheet open={track} onClose={() => setTrack(false)}>
        <TrackingContent onClose={() => setTrack(false)} />
      </Sheet>
      {pushOpen &&
      <WalletPush
        onTap={openPushTarget}
        onDismiss={() => setPushOpen(false)}
        title={pushVariant === 'fisica' ? 'Tu Lemon Card ya está activa' : 'Tu tarjeta virtual ya está activa'}
        body="Ya podés sumar tu tarjeta a tu Apple Wallet." />}
      </div>
    </Anim>);

}

// ════════════════════════════════════════════════════════════════
// PEDIR FÍSICA — pedir la tarjeta tiene un costo (pago, no requisitos)
// ════════════════════════════════════════════════════════════════
function PedirFisicaFlow({ onMenu, onComplete, onboarding }) {
  // En onboarding entramos directo al pago; si no, mostramos el hub con el pitch.
  return <Flow2 onMenu={onMenu} onComplete={onComplete} startStep={onboarding ? 'pay' : 'hub'} />;
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
        <PmNote>Esta pantalla es solo del prototipo, para comparar las dos experiencias. En producción el usuario entra directo a una sola.</PmNote>
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
              <CardThumb variant={o.variant} w={56} portrait />
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
  const [num, setNum] = useStateF('');
  const [pin, setPin] = useStateF('');
  const numClean = num.replace(/\D/g, '').slice(0, 16);
  const pinClean = pin.replace(/\D/g, '').slice(0, 4);
  const ready = numClean.length === 16 && pinClean.length === 4;
  const fmt = numClean.replace(/(.{4})/g, '$1 ').trim();
  return (
    <Anim k="cardact" noWrap>
      <Screen footer={<Btn variant="primary" disabled={!ready} onClick={onDone}>Activar</Btn>}>
        <StepHeader title="Activá tu tarjeta" onBack={onBack} onClose={onClose} />
        <div style={{ padding: '6px 16px 8px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <div style={{ font: '500 24px Geist', letterSpacing: '-0.02em', color: LX.text1 }}>Activá tu tarjeta</div>
            <div style={{ font: '400 14px Inter', color: LX.text2, marginTop: 6, lineHeight: 1.45 }}>
              Ingresá los 16 números de tu Lemon Card y creá una clave de 4 dígitos.
            </div>
          </div>

          <div>
            <div style={{ background: LX.layer, border: `1px solid ${LX.border}`, borderRadius: 12, padding: '15px 16px' }}>
              <input
                inputMode="numeric" value={fmt}
                onChange={(e) => setNum(e.target.value)}
                placeholder="Ingresá los 16 números de tu tarjeta"
                style={{ width: '100%', border: 0, outline: 'none', background: 'transparent', font: '500 16px Geist', letterSpacing: '0.04em', color: LX.text1 }} />
            </div>
            <div style={{ textAlign: 'right', font: '400 12px Inter', color: LX.text3, marginTop: 6 }}>{numClean.length}/16</div>
          </div>

          <div style={{ background: LX.layer, border: `1px solid ${LX.border}`, borderRadius: 12, padding: '15px 16px' }}>
            <input
              inputMode="numeric" type="password" value={pinClean}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Creá tu clave de 4 dígitos"
              style={{ width: '100%', border: 0, outline: 'none', background: 'transparent', font: '500 16px Geist', letterSpacing: '0.3em', color: LX.text1 }} />
          </div>

          <div>
            <div style={{ font: '400 13px Inter', color: LX.text2, marginBottom: 6 }}>La clave no puede tener:</div>
            <ul style={{ margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: 3 }}>
              <li style={{ font: '400 13px Inter', color: LX.text2 }}>Números repetidos: 1111</li>
              <li style={{ font: '400 13px Inter', color: LX.text2 }}>Secuencias ascendentes: 1234</li>
              <li style={{ font: '400 13px Inter', color: LX.text2 }}>Secuencias descendentes: 4321</li>
            </ul>
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

          <Surface pad={0} style={{ overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '14px 16px 12px' }}>
              <LI name="programed-tx" size={18} color="#854600" />
              <div style={{ font: '600 14px Inter', color: LX.text1, flex: 1 }}>Débitos automáticos a revincular</div>
              <span style={{ font: '600 12px Inter', color: '#854600', background: 'var(--bg-warning-01)', padding: '3px 9px', borderRadius: 999 }}>3</span>
            </div>
            <div style={{ padding: '0 16px' }}>
              {[
              ['streaming', 'Netflix', 'US$ 12,99 / mes'],
              ['streaming', 'Spotify', '$ 2.499 / mes'],
              ['tech', 'iCloud+', '$ 1.100 / mes']].
              map(([icon, name, amt], i) =>
              <React.Fragment key={i}>
                  {i > 0 && <Divider />}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 999, background: LX.layer3, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <LI name={icon} size={18} color={LX.text1} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ font: '600 14px Inter', color: LX.text1 }}>{name}</div>
                      <div style={{ font: '400 12px Inter', color: LX.text2, marginTop: 1 }}>{amt}</div>
                    </div>
                    <span style={{ font: '600 12px Inter', color: '#854600', background: 'var(--bg-warning-01)', padding: '4px 10px', borderRadius: 999, whiteSpace: 'nowrap' }}>Revincular</span>
                  </div>
                </React.Fragment>
              )}
            </div>
            <div style={{ padding: '0 16px 14px', marginTop: 4 }}>
              <div style={{ font: '400 12px Inter', color: LX.text2, lineHeight: 1.4 }}>
                Como la nueva tarjeta tiene otro número, vas a tener que volver a cargarla en cada servicio para que no se te corten.
              </div>
            </div>
          </Surface>

          <PmNote>Quick win del benchmark: un onboarding de entrega que despeja la duda #1 — “¿mis débitos siguen funcionando?”. Como la nueva tarjeta tiene otro número, le mostramos qué débitos revincular y lo resolvemos en 1 toque.</PmNote>
        </div>
      </Screen>
    </Anim>);

}

// screen transition wrapper (plain — animation removed: it was unreliable
// inside the scaled/overflow-clipped device frame, leaving screens stuck hidden)
const Anim = ({ children, k, noWrap }) =>
noWrap ? children : <div key={k} style={{ height: '100%' }}>{children}</div>;

Object.assign(window, { Flow1, Flow2, Flow3, Flow4, Flow5, PedirFisicaFlow, RequisitoChooser, ChooserScreen, NfcSuccess, RequisitoScreen, PortfolioScreen, DeliveryOnboarding, CardActivation, VirtualUpsell, LoadingScreen, Anim, Bullet, Breakdown });