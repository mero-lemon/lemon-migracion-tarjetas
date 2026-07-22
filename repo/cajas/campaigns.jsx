// Cofres — campañas de incentivo de tasa, v2 (modelo opt-in).
// Marketing configura la campaña A MANO desde el panel (CampaignPanel, vive
// en el stage del proto): beneficio (puntos extra o tasa fija), moneda,
// alcance, vigencia y los guardrails de budget — tope por cofre, tope por
// usuario, MONTO MÁXIMO A ALCANZAR (cupo total de la campaña) y CANTIDAD
// MÁXIMA DE COFRES POR USUARIO.
// El boost NO se mezcla con la creación: el cofre se crea normal (tasa base)
// y después el usuario lo activa aceptando las condiciones (ActivationCard →
// sheet → "Aceptar y activar"). caja.boosted marca la adhesión por cofre.
// Legal: nada de rendimiento futuro prometido — solo tasas vigentes y el
// rendimiento que se HABRÍA generado los últimos 30 días (split30).
const { useState: useStateC, useEffect: useEffectC } = React;

// ── Estado global de la campaña activa ──────────────────────────
window.__campaign = null;
const setCampaign = (cfg) => { window.__campaign = cfg || null; };
const activeCamp = () => window.__campaign;
const campFor = (ck) => { const c = window.__campaign; return c && c.currency === ck ? c : null; };

// ── Tasas ───────────────────────────────────────────────────────
const pctShort = (t) => (Math.round(t * 1000) / 10).toLocaleString('es-AR') + '%';
// tasa del boost: fija paga max(base, promo); puntos suman sobre la base
const boostTna = (c) => { const base = CURRENCIES[c.currency].tna; return c.mode === 'fixed' ? Math.max(base, c.value) : base + c.value; };
// tasa "publicitada" para una moneda (superficies de marketing)
const effTna = (ck) => { const c = campFor(ck); return c ? boostTna(c) : CURRENCIES[ck].tna; };
const effShort = (ck) => pctShort(effTna(ck));
const effLabel = (ck) => effShort(ck) + ' TNA';

// tope efectivo del boost por cofre (proto mono-usuario: el tope por
// persona opera como tope del cofre si no hay tope por cofre)
const campCap = (c) => c ? (c.capPerCofre != null ? c.capPerCofre : c.capPerUser) : null;

// ── Rendimiento SOLO en pasado condicional (pedido de legales) ──
// "lo que habría generado los últimos 30 días" con las tasas vigentes;
// boosted respeta el tope: hasta ahí la tasa potenciada, el resto la base.
const y30 = (v, tna) => v * tna / 365 * 30;
const split30 = (v, ck, boosted) => {
  const base = CURRENCIES[ck].tna;
  const c = boosted ? campFor(ck) : null;
  if (!c) return y30(v, base);
  const cap = campCap(c), b = cap != null ? Math.min(v, cap) : v;
  return y30(b, boostTna(c)) + y30(v - b, base);
};

// ── Consumo de los guardrails (derivado del estado, no se muta) ──
const enrolledCount = (cajas) => cajas.filter((x) => x.boosted).length;
const poolUsed = (cajas) => {
  const c = activeCamp();
  if (!c) return 0;
  return cajas.filter((x) => x.boosted).reduce((a, x) => a + Math.min(cajaTotal(x), c.capPerCofre != null ? c.capPerCofre : Infinity), 0);
};
// ¿este cofre puede activar el boost? Si algún cupo se agotó, la promo
// desaparece para los que no entraron (nunca mostrar "llegaste tarde")
const canActivate = (caja, cajas) => {
  const c = activeCamp();
  if (!c || c.currency !== (caja.currency || 'ARS') || caja.boosted) return false;
  if (c.maxPerUser != null && enrolledCount(cajas) >= c.maxPerUser) return false;
  if (c.poolMax != null && poolUsed(cajas) >= c.poolMax) return false;
  return true;
};

// ── Chip de tasa de un cofre: potenciada SOLO si ese cofre activó ──
const YieldChip = ({ ck = 'ARS', boosted = false, compact }) => {
  const c = boosted ? campFor(ck) : null;
  if (!c) return <TnaChip compact label={CURRENCIES[ck].label} />;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--c-lime-10)', color: 'var(--c-lime-60)', font: '600 12px Inter', padding: compact ? '2px 9px' : '3px 10px', borderRadius: 999, whiteSpace: 'nowrap' }}>
      <s style={{ opacity: 0.55, fontWeight: 400 }}>{CURRENCIES[ck].short}</s> {pctShort(boostTna(c))} TNA
    </span>);
};

// ── Sheet de condiciones: la transparencia habilita la promo ────
// onAccept (opcional) agrega el CTA "Aceptar y activar" — es el consenso
// explícito que pide legales, por cofre.
function CampaignConditions({ open, camp, onClose, onAccept }) {
  if (!camp) return null;
  const cur = CURRENCIES[camp.currency];
  const moneda = camp.currency === 'USD' ? 'dólares' : 'pesos';
  const rows = [
  ['Tasa', `${cur.short} → ${pctShort(boostTna(camp))} TNA${camp.mode === 'extra' ? ` (+${pctShort(camp.value)} extra sobre la tasa base vigente)` : ' (promocional: siempre cobrás la mayor entre la base y la promo)'}`],
  ['Cómo se activa', 'Vos elegís: creás tu cofre como siempre y aceptás estas condiciones para activar el boost en ese cofre. Sin activarlo, rinde la tasa base.'],
  ['Alcance', camp.scope === 'new' ? `Cofres en ${moneda} creados durante la campaña.` : `Todos tus cofres en ${moneda}.`],
  camp.capPerCofre != null && ['Tope por cofre', `${fmtC(camp.capPerCofre, camp.currency)}. Lo que supere ese monto rinde la tasa base (${cur.label}).`],
  camp.capPerUser != null && ['Tope por persona', `${fmtC(camp.capPerUser, camp.currency)} sumando todos tus cofres con boost.`],
  camp.maxPerUser != null && ['Cofres por persona', `Podés activar el boost en hasta ${camp.maxPerUser} ${camp.maxPerUser === 1 ? 'cofre' : 'cofres'}.`],
  camp.poolMax != null && ['Cupo de la campaña', `Alcanza hasta ${fmtC(camp.poolMax, camp.currency)} en cofres con boost. Al llegar, se cierra para nuevas activaciones; los boosts ya activados se mantienen.`],
  ['Vigencia', `Hasta el ${camp.end}, para todos por igual.`],
  ['Al terminar', `Tu cofre sigue rindiendo la tasa base (${cur.label}) automáticamente. Tu plata nunca queda atrapada: retirás cuando quieras.`],
  ['Importante', 'Las tasas son variables. El rendimiento generado en el pasado no garantiza resultados futuros.']].
  filter(Boolean);
  return (
    <Sheet open={open} onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '2px 2px 6px' }}>
        <span style={{ width: 44, height: 44, borderRadius: 999, background: 'var(--c-lime-10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 21, flexShrink: 0 }}>{camp.emoji}</span>
        <div>
          <div style={{ font: '500 20px Geist', letterSpacing: '-0.01em', color: LX.text1 }}>{camp.name}</div>
          <div style={{ font: '400 12px Inter', color: LX.text3, marginTop: 1 }}>Condiciones de la campaña</div>
        </div>
      </div>
      <div style={{ maxHeight: 380, overflowY: 'auto', background: '#fff', borderRadius: 18, padding: '4px 16px', border: `1px solid ${LX.border}`, marginTop: 10, textAlign: 'left' }}>
        {rows.map(([k, v], i) =>
        <React.Fragment key={k}>
            {i > 0 && <Divider />}
            <div style={{ padding: '11px 0' }}>
              <div style={{ font: '600 11px Inter', letterSpacing: '0.04em', textTransform: 'uppercase', color: LX.text3 }}>{k}</div>
              <div style={{ font: '400 13px Inter', color: '#141414', lineHeight: 1.45, marginTop: 3 }}>{v}</div>
            </div>
          </React.Fragment>)}
      </div>
      {onAccept ?
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 14 }}>
          <Btn variant="primary" onClick={onAccept}>Aceptar y activar el boost</Btn>
          <Btn variant="ghost" onClick={onClose}>Ahora no</Btn>
        </div> :
      <Btn variant="primary" onClick={onClose} style={{ marginTop: 14 }}>Entendido</Btn>}
    </Sheet>);
}

// ── Card por cofre: invita a activar, o muestra el boost activo ──
// El corazón del modelo opt-in: aparece DESPUÉS de crear el cofre (success
// y detalle). Si el cofre ya activó → estado "Tasa potenciada". Si puede
// activar → invitación con las condiciones a un tap. Si no hay cupo → nada.
function CampaignCofreCard({ caja, cajas, onActivate }) {
  const [condOpen, setCondOpen] = useStateC(false);
  const camp = activeCamp();
  const ck = caja.currency || 'ARS';
  if (!camp || camp.currency !== ck) return null;

  if (caja.boosted)
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--c-lime-10)', border: '1.5px solid var(--c-lime-40)', borderRadius: 20, padding: '13px 16px', boxShadow: 'var(--shadow-card)' }}>
        <span style={{ position: 'relative', width: 38, height: 38, borderRadius: 999, background: 'var(--c-lime-40)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
          {camp.emoji}
          <span style={{ position: 'absolute', right: -3, bottom: -3, width: 17, height: 17, borderRadius: 999, background: 'var(--c-lime-60)', border: '2px solid var(--c-lime-10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LI name="trusted-icon" size={9} color="#fff" />
          </span>
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ font: '500 13px Inter', color: '#141414' }}>Tasa potenciada: <b style={{ color: 'var(--c-lime-60)' }}>{pctShort(boostTna(camp))} TNA</b></div>
          <div style={{ font: '400 11px Inter', color: '#818181', marginTop: 2 }}>
            Hasta el {camp.end}{campCap(camp) != null && <> · hasta {fmtC(campCap(camp), ck)}</>}
          </div>
        </div>
        <button onClick={() => setCondOpen(true)} style={{ border: 0, background: 'transparent', cursor: 'pointer', font: '600 12px Inter', color: 'var(--c-lime-60)', flexShrink: 0, padding: 0 }}>Condiciones</button>
      </div>
      <CampaignConditions open={condOpen} camp={camp} onClose={() => setCondOpen(false)} />
    </>);

  if (!canActivate(caja, cajas)) return null;
  return (
    <>
      <div style={{ position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: '1.5px solid rgba(207,255,46,0.9)', borderRadius: 20, padding: '13px 16px', boxShadow: '0 8px 20px rgba(160,220,20,0.22)' }}>
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '30%', pointerEvents: 'none', background: 'linear-gradient(90deg, transparent, rgba(207,255,46,0.35), transparent)', animation: 'lc-shine 3.2s ease-in-out 1s infinite' }} />
        <span style={{ width: 38, height: 38, borderRadius: 999, background: 'var(--c-lime-10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{camp.emoji}</span>
        <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
          <div style={{ font: '500 13px Inter', color: '#141414' }}>Boost disponible: <b>{pctShort(boostTna(camp))} TNA</b> en este cofre</div>
          <div style={{ font: '400 11px Inter', color: '#818181', marginTop: 2 }}>Aceptá las condiciones y activalo. Hasta el {camp.end}.</div>
        </div>
        <button onClick={() => setCondOpen(true)} style={{ position: 'relative', border: 0, cursor: 'pointer', background: '#141414', color: 'var(--c-lime-40)', font: '600 12px Inter', padding: '9px 14px', borderRadius: 999, flexShrink: 0 }}>Activar</button>
      </div>
      <CampaignConditions open={condOpen} camp={camp} onClose={() => setCondOpen(false)}
        onAccept={() => { setCondOpen(false); onActivate(); }} />
    </>);
}

// ── Hero de la campaña en la sección Cofres (superficie de difusión) ──
function CampaignCard() {
  const [condOpen, setCondOpen] = useStateC(false);
  const camp = activeCamp();
  if (!camp) return null;
  const cur = CURRENCIES[camp.currency];
  return (
    <>
      <button onClick={() => setCondOpen(true)} style={{ width: '100%', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: '1.5px solid var(--c-lime-40)', borderRadius: 20, padding: '12px 14px', boxShadow: 'var(--shadow-card)' }}>
        <span style={{ width: 38, height: 38, borderRadius: 999, background: 'var(--c-lime-10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{camp.emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ font: '500 14px Geist', letterSpacing: '-0.01em', color: '#141414', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{camp.name}</div>
          <div style={{ font: '400 11px Inter', color: '#818181', marginTop: 1 }}>Hasta el {camp.end} · tocá para ver detalles</div>
        </div>
        <span style={{ background: 'var(--c-lime-40)', color: '#080808', font: '600 12px Inter', padding: '4px 10px', borderRadius: 999, whiteSpace: 'nowrap', flexShrink: 0 }}>
          <s style={{ opacity: 0.55, fontWeight: 400 }}>{cur.short}</s> {pctShort(boostTna(camp))} TNA
        </span>
        <LI name="arrow-foward" size={15} color="#B4B4B4" style={{ flexShrink: 0 }} />
      </button>
      <CampaignConditions open={condOpen} camp={camp} onClose={() => setCondOpen(false)} />
    </>);
}

// ── PANEL DE MARKETING — acá se setea la campaña a mano ─────────
// Vive en el stage (fuera del teléfono): es la herramienta interna, no UI
// de la app. Publicar reinicia la experiencia para ver el impacto desde
// el descubrimiento.
const CAMPAIGN_TEMPLATES = [
{ key: 'launch', label: '🚀 Lanzamiento 50%', form: { name: 'Tasa de lanzamiento', currency: 'ARS', mode: 'fixed', pct: 50, scope: 'new', capPerCofre: 500000, capPerUser: 1500000, poolMax: 100000000, maxPerUser: 1, end: '31/8' } },
{ key: 'plus6', label: '⚡ +6 puntos', form: { name: 'Puntos extra', currency: 'ARS', mode: 'extra', pct: 6, scope: 'all', capPerCofre: 2000000, capPerUser: null, poolMax: 5000000, maxPerUser: 3, end: '31/8' } },
{ key: 'usd', label: '💵 Dólares +2', form: { name: 'Boost en dólares', currency: 'USD', mode: 'extra', pct: 2, scope: 'new', capPerCofre: null, capPerUser: 1000, poolMax: 500000, maxPerUser: 1, end: '30/9' } },
{ key: 'custom', label: '✏️ Otra', form: { name: '', currency: 'ARS', mode: 'extra', pct: 0, scope: 'all', capPerCofre: null, capPerUser: null, poolMax: null, maxPerUser: null, end: '' } }];

// del formulario al objeto campaña (deriva emoji, banner y pitch)
const buildCampaign = (f) => {
  const base = CURRENCIES[f.currency].tna;
  const value = f.pct / 100;
  const eff = f.mode === 'extra' ? base + value : Math.max(base, value);
  const short = pctShort(eff);
  const usd = f.currency === 'USD';
  const pp = (Math.round(f.pct * 10) / 10).toLocaleString('es-AR');
  return {
    name: (f.name || '').trim() || (f.mode === 'fixed' ? 'Tasa promocional' : 'Puntos extra'),
    emoji: usd ? '💵' : f.mode === 'fixed' ? '🚀' : '⚡',
    currency: f.currency, mode: f.mode, value,
    scope: f.scope, capPerCofre: f.capPerCofre, capPerUser: f.capPerUser,
    poolMax: f.poolMax, maxPerUser: f.maxPerUser, end: (f.end || '').trim() || '31/8',
    banner: {
      title: f.mode === 'extra' ? `+${pp} puntos en tus cofres${usd ? ' en dólares' : ''}` : `Cofres al ${short} TNA`,
      copy: `Creá tu cofre, activá el boost y listo. Hasta el ${f.end}.`
    },
    pitch: `${f.scope === 'all' ? 'Activá el boost en tus cofres' : 'Creá un cofre y activale el boost'}${usd ? ' en dólares' : ''}: rinden ${short} TNA hasta el ${f.end}.`
  };
};
const campToForm = (c) => ({
  name: c.name, currency: c.currency, mode: c.mode, pct: Math.round(c.value * 1000) / 10,
  scope: c.scope, capPerCofre: c.capPerCofre, capPerUser: c.capPerUser,
  poolMax: c.poolMax, maxPerUser: c.maxPerUser, end: c.end
});

function CampaignPanel({ open, onClose, onPublish, onStop }) {
  const [f, setF] = useStateC(() => activeCamp() ? campToForm(activeCamp()) : { ...CAMPAIGN_TEMPLATES[0].form });
  const [tpl, setTpl] = useStateC(activeCamp() ? null : 'launch');
  useEffectC(() => { if (open && activeCamp()) { setF(campToForm(activeCamp())); setTpl(null); } }, [open]);

  const set = (patch) => { setF((v) => ({ ...v, ...patch })); setTpl(null); };
  const cur = CURRENCIES[f.currency];
  const base = cur.tna;
  const eff = f.mode === 'extra' ? base + f.pct / 100 : Math.max(base, f.pct / 100);
  const delta = Math.max(0, eff - base);
  const live = activeCamp();
  const usage = window.__campUsage || { used: 0, count: 0 };

  const L = ({ children }) => <div style={{ font: '600 10px Inter', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#8a8985', margin: '0 0 6px' }}>{children}</div>;
  const SubL = ({ children }) => <div style={{ display: 'flex', alignItems: 'center', gap: 6, font: '700 11px Inter', color: '#141414', margin: '0 0 8px' }}><span style={{ width: 4, height: 4, borderRadius: 999, background: 'var(--c-lime-60)' }} />{children}</div>;
  const inputS = { width: '100%', border: '1.5px solid #E3E2DD', borderRadius: 12, padding: '9px 12px', font: '500 13px Inter', color: '#141414', outline: 'none', background: '#fff' };
  const Seg = ({ options, value, onChange }) =>
  <div style={{ display: 'flex', gap: 6 }}>
      {options.map(([v, lb]) =>
    <button key={v} onClick={() => onChange(v)} style={{ flex: 1, border: value === v ? '1.5px solid #141414' : '1.5px solid #E3E2DD', cursor: 'pointer', borderRadius: 999, padding: '8px 10px', background: value === v ? '#141414' : '#fff', font: '600 12px Inter', color: value === v ? '#fff' : '#141414', whiteSpace: 'nowrap' }}>{lb}</button>)}
    </div>;
  const Money = ({ label, value, onChange, prefix, placeholder = 'Sin tope' }) =>
  <div style={{ flex: 1, minWidth: 0 }}>
      <L>{label}</L>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1.5px solid #E3E2DD', borderRadius: 12, padding: '9px 12px', background: '#fff' }}>
        <span style={{ font: '500 13px Inter', color: '#B4B4B4', flexShrink: 0 }}>{prefix != null ? prefix : cur.prefix}</span>
        <input inputMode="numeric" value={value != null ? value.toLocaleString('es-AR') : ''} placeholder={placeholder}
      onChange={(e) => { const n = parseInt(e.target.value.replace(/\D/g, ''), 10); onChange(n > 0 ? n : null); }}
      style={{ flex: 1, minWidth: 0, border: 0, outline: 'none', background: 'transparent', font: '500 13px Inter', color: '#141414' }} />
      </div>
    </div>;

  return (
    <>
      {/* overlay */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(20,20,20,0.32)', opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none', transition: 'opacity .25s' }} />
      {/* drawer */}
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 91, width: 392, maxWidth: '94vw', background: '#F7F6F3', boxShadow: '-16px 0 48px rgba(0,0,0,0.18)', transform: open ? 'translateX(0)' : 'translateX(105%)', transition: 'transform .3s cubic-bezier(.2,.85,.25,1)', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '18px 20px 14px', borderBottom: '1px solid #E3E2DD', flexShrink: 0 }}>
          <span style={{ width: 32, height: 32, borderRadius: 10, background: '#141414', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LI name="rewards" size={17} color="var(--c-lime-40)" />
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ font: '600 14px Inter', color: '#141414' }}>Campañas de incentivo</div>
            <div style={{ font: '400 11px Inter', color: '#8a8985' }}>Panel interno de marketing · no es UI de la app</div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, border: 0, borderRadius: 999, background: 'rgba(8,8,8,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LI name="close" size={14} color="#141414" />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* estado vivo de la campaña activa: cómo viene el consumo */}
          {live &&
          <div style={{ background: '#141414', borderRadius: 16, padding: '13px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 15 }}>{live.emoji}</span>
              <span style={{ flex: 1, font: '600 13px Inter', color: '#fff' }}>{live.name} · activa</span>
              <span style={{ font: '500 11px Inter', color: 'var(--c-lime-40)' }}>{pctShort(boostTna(live))} TNA</span>
            </div>
            {live.poolMax != null &&
            <div style={{ marginTop: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', font: '400 10px Inter', color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>
                <span>Monto alcanzado</span><span>{fmtC(usage.used, live.currency)} de {fmtC(live.poolMax, live.currency)}</span>
              </div>
              <div style={{ height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.14)', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, usage.used / live.poolMax * 100)}%`, height: '100%', background: 'var(--c-lime-40)', borderRadius: 999, transition: 'width .4s' }} />
              </div>
            </div>}
            {live.maxPerUser != null &&
            <div style={{ font: '400 10px Inter', color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>
              Cofres activados por este usuario: {usage.count} de {live.maxPerUser}
            </div>}
          </div>}

          {/* plantillas rápidas */}
          <div>
            <L>Plantillas</L>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {CAMPAIGN_TEMPLATES.map((t) =>
              <button key={t.key} onClick={() => { setF({ ...t.form }); setTpl(t.key); }} style={{ border: tpl === t.key ? '1.5px solid #141414' : '1.5px solid #E3E2DD', cursor: 'pointer', borderRadius: 12, padding: '9px 8px', background: '#fff', font: '600 11px Inter', color: '#141414', whiteSpace: 'nowrap' }}>{t.label}</button>)}
            </div>
          </div>

          <div>
            <L>Nombre de la campaña</L>
            <input value={f.name} onChange={(e) => set({ name: e.target.value })} placeholder="Tasa de lanzamiento" style={inputS} />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <L>Moneda</L>
              <Seg options={[['ARS', 'Pesos'], ['USD', 'Dólares']]} value={f.currency} onChange={(v) => set({ currency: v })} />
            </div>
            <div style={{ flex: 1 }}>
              <L>Alcance</L>
              <Seg options={[['new', 'Nuevos'], ['all', 'Todos']]} value={f.scope} onChange={(v) => set({ scope: v })} />
            </div>
          </div>

          <div>
            <L>Beneficio</L>
            <Seg options={[['extra', 'Puntos extra'], ['fixed', 'Tasa fija']]} value={f.mode} onChange={(v) => set({ mode: v })} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1.5px solid #E3E2DD', borderRadius: 12, padding: '9px 12px', background: '#fff', width: 130 }}>
                {f.mode === 'extra' && <span style={{ font: '500 13px Inter', color: '#B4B4B4' }}>+</span>}
                <input inputMode="decimal" value={f.pct} onChange={(e) => { const n = parseFloat(e.target.value.replace(',', '.')); set({ pct: isNaN(n) ? 0 : Math.min(n, 200) }); }}
                style={{ width: '100%', border: 0, outline: 'none', background: 'transparent', font: '500 13px Inter', color: '#141414' }} />
                <span style={{ font: '500 12px Inter', color: '#B4B4B4', flexShrink: 0 }}>{f.mode === 'extra' ? 'puntos' : '% TNA'}</span>
              </div>
              {/* la tasa resultante, siempre a la vista */}
              <div style={{ flex: 1, font: '500 13px Inter', color: '#141414' }}>
                <s style={{ color: '#B4B4B4', fontWeight: 400 }}>{cur.short}</s> → <b style={{ color: 'var(--c-lemon-50)' }}>{pctShort(eff)} TNA</b>
              </div>
            </div>
          </div>

          <div>
            <L>Restricciones</L>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* límites de lo que gana cada persona */}
              <div>
                <SubL>Por usuario</SubL>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <Money label="Tope por cofre" value={f.capPerCofre} onChange={(v) => set({ capPerCofre: v })} />
                    <Money label="Tope por usuario" value={f.capPerUser} onChange={(v) => set({ capPerUser: v })} />
                  </div>
                  <div style={{ width: 'calc(50% - 5px)' }}>
                    <L>Cofres por usuario</L>
                    <input inputMode="numeric" value={f.maxPerUser != null ? f.maxPerUser : ''} placeholder="Sin límite"
                    onChange={(e) => { const n = parseInt(e.target.value.replace(/\D/g, ''), 10); set({ maxPerUser: n > 0 ? n : null }); }}
                    style={inputS} />
                  </div>
                </div>
              </div>

              {/* techo global de toda la campaña, sumando a todos */}
              <div>
                <SubL>Total de la campaña</SubL>
                <div style={{ width: 'calc(50% - 5px)' }}>
                  <Money label="Monto máx. a alcanzar" value={f.poolMax} onChange={(v) => set({ poolMax: v })} placeholder="Sin límite" />
                </div>
                <div style={{ font: '400 11px Inter', color: '#8a8985', lineHeight: 1.45, marginTop: 6 }}>Cupo máximo de la campaña sumando a todos los usuarios. Al alcanzarlo, se cierra para nuevas activaciones.</div>
              </div>
            </div>
          </div>

          <div style={{ width: 130 }}>
            <L>Termina el</L>
            <input value={f.end} onChange={(e) => set({ end: e.target.value })} placeholder="31/8" style={inputS} />
          </div>

          {/* el costo máximo, calculado antes de publicar: el budget se
              dimensiona acá, no rezando después */}
          {f.poolMax != null && delta > 0 &&
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: '#EFEEEA', borderRadius: 14, padding: '11px 14px' }}>
            <LI name="earn" size={16} color="#141414" style={{ marginTop: 1, flexShrink: 0 }} />
            <div style={{ font: '400 12px Inter', color: '#5E5E5E', lineHeight: 1.5 }}>
              Costo máximo del incentivo: <b style={{ color: '#141414' }}>≈ {fmtC(f.poolMax * delta / 12, f.currency)} por mes</b> con el cupo lleno ({fmtC(f.poolMax, f.currency)} rindiendo +{pctShort(delta)} extra).
            </div>
          </div>}
        </div>

        <div style={{ flexShrink: 0, padding: '14px 20px 18px', borderTop: '1px solid #E3E2DD', display: 'flex', gap: 8 }}>
          {live &&
          <button onClick={onStop} style={{ border: '1.5px solid #E3E2DD', cursor: 'pointer', borderRadius: 999, padding: '11px 18px', background: '#fff', font: '600 13px Inter', color: 'var(--c-rose-40)' }}>Apagar</button>}
          <button onClick={() => onPublish(buildCampaign(f))} disabled={!(f.pct > 0)} style={{ flex: 1, border: 0, cursor: f.pct > 0 ? 'pointer' : 'default', borderRadius: 999, padding: '11px 18px', background: f.pct > 0 ? '#141414' : '#D6D5D0', font: '600 13px Inter', color: '#fff' }}>
            Publicar y ver en el proto
          </button>
        </div>
      </div>
    </>);
}

Object.assign(window, {
  setCampaign, activeCamp, campFor, pctShort, boostTna, effTna, effShort, effLabel,
  campCap, split30, enrolledCount, poolUsed, canActivate,
  YieldChip, CampaignConditions, CampaignCofreCard, CampaignCard, CampaignPanel, CAMPAIGN_TEMPLATES, buildCampaign
});
