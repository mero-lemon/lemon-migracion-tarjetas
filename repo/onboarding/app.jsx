// Stage root del onboarding "sin tarjetas": la home real de la app +
// el pager de 3 pantallas como modal iOS (la home escala hacia atrás),
// conectado a los flujos ya construidos en cards/ (design picker → morph
// → success → card-home / dirección → pago → confirmación).
const { useState: useStateA, useEffect: useEffectA } = React;

const OB_MODAL_EASE = 'cubic-bezier(0.32, 0.72, 0, 1)';

function ObApp() {
  const [ob, setOb] = useStateA(false); // overlay montado
  const [shown, setShown] = useStateA(false); // overlay visible (para la transición)
  const [route, setRoute] = useStateA(null); // null = pager · virtual | cardDetail | fisicaAddr | fisicaPay | fisicaDone | credAddr | credDone
  const [card, setCard] = useStateA(null); // virtual creada { design, mask, nfc }
  const [transit, setTransit] = useStateA(null); // 'fisica' | 'credito'
  const [addr, setAddr] = useStateA(undefined);

  const openOb = () => {
    setOb(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
  };
  const closeOb = () => {
    setShown(false);
    setTimeout(() => { setOb(false); setRoute(null); }, 580);
  };
  const toPager = () => setRoute(null);

  // contenido del overlay: pager o el flujo elegido
  let overlay = null;
  if (route === 'virtual')
  overlay =
  <Flow1 onMenu={toPager} replace={false} startStep="design" onActivated={(inWallet, dsg) => {
    setCard({ design: dsg || 'violeta', mask: '•••• 2291', nfc: !!inWallet });
    setRoute('cardDetail');
  }} />;else

  if (route === 'cardDetail' && card)
  overlay = <Anim k="obdetail"><CardHome design={card.design} variant="virtual" title="Tarjeta prepaga virtual" mask={card.mask} balance={0} startInWallet={card.nfc} onBack={closeOb} onClose={closeOb} /></Anim>;else
  if (route === 'fisicaAddr')
  overlay = <Anim k="obfaddr"><AddressSearch onBack={toPager} onClose={closeOb} onPick={(a) => { setAddr(a); setRoute('fisicaPay'); }} /></Anim>;else
  if (route === 'fisicaPay')
  overlay = <Anim k="obfpay"><PagarFisica onBack={() => setRoute('fisicaAddr')} onClose={closeOb} onChangeAddress={() => setRoute('fisicaAddr')} address={addr} onContinue={() => { setTransit('fisica'); setRoute('fisicaDone'); }} /></Anim>;else
  if (route === 'fisicaDone')
  overlay = <Anim k="obfdone"><ObConfirm kind="fisica" addr={addr} onDone={closeOb} /></Anim>;else
  if (route === 'credAddr')
  overlay = <Anim k="obcaddr"><AddressSearch onBack={toPager} onClose={closeOb} onPick={(a) => { setAddr(a); setTransit('credito'); setRoute('credDone'); }} /></Anim>;else
  if (route === 'credDone')
  overlay = <Anim k="obcdone"><ObConfirm kind="credito" addr={addr} onDone={closeOb} /></Anim>;else

  overlay = <OnboardingPager onClose={closeOb} onPick={(id) => setRoute(id === 'virtual' ? 'virtual' : id === 'fisica' ? 'fisicaAddr' : 'credAddr')} />;

  return (
    <div style={{ height: '100%', position: 'relative', overflow: 'hidden', background: '#0a0a0a' }}>
      {/* home detrás: escala hacia atrás cuando el modal está arriba (iOS) */}
      <div style={{
        height: '100%',
        transform: shown ? 'scale(0.94) translateY(10px)' : 'none',
        borderRadius: shown ? 40 : 0,
        filter: shown ? 'brightness(0.72)' : 'none',
        overflow: 'hidden',
        transition: `transform .58s ${OB_MODAL_EASE}, border-radius .58s ${OB_MODAL_EASE}, filter .58s ${OB_MODAL_EASE}`
      }}>
        <ObHome
          card={card}
          transit={transit}
          onExplore={openOb}
          onOpenCard={() => { setRoute('cardDetail'); openOb(); }} />
      </div>

      {/* overlay del onboarding: sube desde abajo */}
      {ob &&
      <div style={{
        position: 'absolute', inset: 0, zIndex: 10, overflow: 'hidden', background: '#F6F6F4',
        transform: shown ? 'none' : 'translateY(104%)',
        borderRadius: shown ? 0 : '34px 34px 0 0',
        transition: `transform .58s ${OB_MODAL_EASE}, border-radius .58s ${OB_MODAL_EASE}`
      }}>
          {overlay}
        </div>
      }
    </div>);

}

// ── Phone shell + chrome del prototipo ──────────────────────────
function ObStage() {
  const [scale, setScale] = useStateA(1);
  const [rk, setRk] = useStateA(0); // remonta ObApp para reiniciar el estado

  useEffectA(() => {
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid #D6D5D0', background: '#EFEEEA', flexWrap: 'wrap' }}>
        <span style={{ width: 26, height: 26, borderRadius: 999, background: LX.dark, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Leaf size={15} color="var(--c-lime-40)" vein="rgba(0,0,0,0.3)" />
        </span>
        <div style={{ font: '600 13px Inter', color: '#2a2a28' }}>Tarjetas · onboarding sin tarjetas <span style={{ color: '#8a8985', fontWeight: 500 }}>· prototipo</span></div>
        <div style={{ marginLeft: 'auto' }}>
          <button onClick={() => setRk((k) => k + 1)} style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #D0CFCA', background: '#fff', borderRadius: 999, padding: '6px 14px', cursor: 'pointer', font: '600 12px Inter', color: '#2a2a28' }}>
            <LI name="return-money" size={14} color="#2a2a28" /> Reiniciar
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 24px 28px' }}>
        <div style={{ width: 402 * scale, height: 874 * scale, flexShrink: 0 }}>
          <div style={{ width: 402, height: 874, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
            <IOSDevice>
              <ObApp key={rk} />
            </IOSDevice>
          </div>
        </div>
      </div>
    </div>);

}

ReactDOM.createRoot(document.getElementById('root')).render(<ObStage />);
