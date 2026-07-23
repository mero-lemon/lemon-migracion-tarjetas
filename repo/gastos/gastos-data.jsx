// Análisis de Gastos — capa de datos.
// Generador determinista (seed fijo) de ~6 meses de consumos argentinos +
// ExpensesRepository: la única puerta que la UI conoce. El backend real
// se enchufa reemplazando este objeto sin tocar pantallas.

// ── Fecha de referencia del prototipo ───────────────────────────
// "Hoy" es fijo para que la demo sea idéntica en cada run. Los
// escenarios de demo (ver G_SCENARIOS) pueden moverlo a otro mes.
let G_TODAY = new Date(2026, 6, 20, 19, 30); // lunes 20 de julio de 2026
const G_DATA_START = new Date(2026, 1, 1); // 1 de febrero de 2026

// ── Taxonomía fija (la del motor de clasificación real) ─────────
const G_CATS = [
  { id: 'super', name: 'Supermercado y almacén', short: 'Súper', icon: 'shopping-cart', color: '#00AA18' },
  { id: 'gastro', name: 'Gastronomía y delivery', short: 'Gastro', icon: 'food', color: '#FF8700' },
  { id: 'transporte', name: 'Transporte', short: 'Transporte', icon: 'bus', color: '#3B83F7' },
  { id: 'auto', name: 'Auto y nafta', short: 'Auto', icon: 'car', color: '#62688F' },
  { id: 'servicios', name: 'Servicios e impuestos', short: 'Servicios', icon: 'light', color: '#F0A20B' },
  { id: 'subs', name: 'Suscripciones y streaming', short: 'Subs', icon: 'streaming', color: '#925DEE' },
  { id: 'salud', name: 'Salud y farmacia', short: 'Salud', icon: 'health', color: '#06A192' },
  { id: 'ropa', name: 'Indumentaria y shopping', short: 'Shopping', icon: 'clothes', color: '#FF007A' },
  { id: 'tech', name: 'Tecnología', short: 'Tecno', icon: 'tech', color: '#274BBE' },
  { id: 'entretenimiento', name: 'Entretenimiento', short: 'Entret.', icon: 'entertainment', color: '#08C7E0' },
  { id: 'educacion', name: 'Educación', short: 'Educación', icon: 'education', color: '#EA2B3C' },
  { id: 'viajes', name: 'Viajes', short: 'Viajes', icon: 'travel', color: '#00CA57' },
  { id: 'otros', name: 'Transferencias / Otros', short: 'Transf.', icon: 'send-money', color: '#808080' }];

const G_CAT = {};
G_CATS.forEach((c) => { G_CAT[c.id] = c; });

// ── Comercios (mercado argentino, montos ARS 2026) ──────────────
// w = peso relativo dentro de la categoría; hours = franja típica.
const G_MERCHANTS = [
  // Supermercado y almacén
  { id: 'carrefour', name: 'Carrefour', cat: 'super', min: 35000, max: 160000, w: 3, hours: [17, 20] },
  { id: 'coto', name: 'Coto', cat: 'super', min: 30000, max: 140000, w: 2.5, hours: [17, 20] },
  { id: 'dia', name: 'Día', cat: 'super', min: 12000, max: 60000, w: 2, hours: [18, 21] },
  { id: 'jumbo', name: 'Jumbo', cat: 'super', min: 45000, max: 175000, w: 1.2, hours: [16, 19] },
  { id: 'chino', name: 'Autoservicio Mei Hua', cat: 'super', min: 6000, max: 32000, w: 3, hours: [19, 22] },
  { id: 'kiosco', name: 'Kiosco 25hs', cat: 'super', min: 2000, max: 9000, w: 2.5, hours: [10, 23] },
  // Gastronomía y delivery
  { id: 'pedidosya', name: 'PedidosYa', cat: 'gastro', min: 14000, max: 28000, w: 3, hours: [20, 23], weekend: 1.6 },
  { id: 'rappi', name: 'Rappi', cat: 'gastro', min: 15000, max: 30000, w: 2.5, hours: [20, 23], weekend: 1.6 },
  { id: 'mcdonalds', name: "McDonald's", cat: 'gastro', min: 12000, max: 24000, w: 1.5, hours: [12, 22] },
  { id: 'mostaza', name: 'Mostaza', cat: 'gastro', min: 10000, max: 20000, w: 1.2, hours: [12, 22] },
  { id: 'cafemartinez', name: 'Café Martínez', cat: 'gastro', min: 6000, max: 15000, w: 2, hours: [9, 17] },
  { id: 'birreria', name: 'La Birrería de Palermo', cat: 'gastro', min: 20000, max: 48000, w: 1, hours: [21, 23], weekend: 2.5 },
  { id: 'luccianos', name: "Lucciano's", cat: 'gastro', min: 9000, max: 19000, w: 0.8, hours: [17, 22], weekend: 1.8 },
  { id: 'panaderia', name: 'Panadería La Espiga', cat: 'gastro', min: 4000, max: 12000, w: 1.6, hours: [8, 12] },
  // Transporte
  { id: 'sube', name: 'Recarga SUBE', cat: 'transporte', min: 4000, max: 9000, w: 0, hours: [8, 9] },
  { id: 'uber', name: 'Uber', cat: 'transporte', min: 5500, max: 17000, w: 2.5, hours: [19, 23], weekend: 1.5 },
  { id: 'cabify', name: 'Cabify', cat: 'transporte', min: 6000, max: 18000, w: 1, hours: [19, 23] },
  // Auto y nafta
  { id: 'ypf', name: 'YPF', cat: 'auto', min: 32000, max: 72000, w: 2.5, hours: [9, 19] },
  { id: 'shell', name: 'Shell', cat: 'auto', min: 32000, max: 76000, w: 1.5, hours: [9, 19] },
  { id: 'estacionamiento', name: 'Estacionamiento Libertador', cat: 'auto', min: 5000, max: 13000, w: 1.5, hours: [10, 18] },
  { id: 'lavadero', name: 'Lavadero El Rayo', cat: 'auto', min: 13000, max: 22000, w: 0.6, hours: [10, 17] },
  // Servicios e impuestos (los fijos van por G_RECURRING)
  { id: 'edenor', name: 'Edenor', cat: 'servicios', min: 0, max: 0, w: 0, hours: [7, 8] },
  { id: 'metrogas', name: 'Metrogas', cat: 'servicios', min: 0, max: 0, w: 0, hours: [7, 8] },
  { id: 'aysa', name: 'AySA', cat: 'servicios', min: 0, max: 0, w: 0, hours: [7, 8] },
  { id: 'personal', name: 'Personal Flow', cat: 'servicios', min: 0, max: 0, w: 0, hours: [7, 8] },
  { id: 'abl', name: 'ABL — GCBA', cat: 'servicios', min: 0, max: 0, w: 0, hours: [7, 8] },
  // Suscripciones y streaming (todas por G_RECURRING)
  { id: 'netflix', name: 'Netflix', cat: 'subs', min: 0, max: 0, w: 0, hours: [6, 7] },
  { id: 'spotify', name: 'Spotify', cat: 'subs', min: 0, max: 0, w: 0, hours: [6, 7] },
  { id: 'youtube', name: 'YouTube Premium', cat: 'subs', min: 0, max: 0, w: 0, hours: [6, 7] },
  { id: 'icloud', name: 'iCloud+', cat: 'subs', min: 0, max: 0, w: 0, hours: [6, 7] },
  { id: 'chatgpt', name: 'ChatGPT Plus', cat: 'subs', min: 0, max: 0, w: 0, hours: [6, 7] },
  { id: 'hbomax', name: 'HBO Max', cat: 'subs', min: 0, max: 0, w: 0, hours: [6, 7] },
  // Salud y farmacia
  { id: 'farmacity', name: 'Farmacity', cat: 'salud', min: 8000, max: 46000, w: 2.5, hours: [10, 20] },
  { id: 'farmaciadelpuente', name: 'Farmacia del Puente', cat: 'salud', min: 6000, max: 30000, w: 1, hours: [10, 20] },
  { id: 'osde', name: 'OSDE', cat: 'salud', min: 0, max: 0, w: 0, hours: [7, 8] },
  // Indumentaria y shopping
  { id: 'zara', name: 'Zara', cat: 'ropa', min: 60000, max: 180000, w: 1.5, hours: [15, 19], weekend: 1.6 },
  { id: 'nike', name: 'Nike', cat: 'ropa', min: 85000, max: 230000, w: 1, hours: [15, 19], weekend: 1.6 },
  { id: 'meli-ropa', name: 'Mercado Libre', cat: 'ropa', min: 25000, max: 120000, w: 2, hours: [11, 22] },
  // Tecnología
  { id: 'meli-tech', name: 'Mercado Libre', cat: 'tech', min: 45000, max: 350000, w: 2, hours: [11, 22] },
  { id: 'apple', name: 'Apple.com', cat: 'tech', min: 20000, max: 90000, w: 1, hours: [11, 22] },
  // Entretenimiento
  { id: 'hoyts', name: 'Hoyts Abasto', cat: 'entretenimiento', min: 13000, max: 32000, w: 2, hours: [19, 22], weekend: 2.2 },
  { id: 'steam', name: 'Steam', cat: 'entretenimiento', min: 10000, max: 45000, w: 1.2, hours: [20, 23] },
  { id: 'playstation', name: 'PlayStation Store', cat: 'entretenimiento', min: 15000, max: 60000, w: 0.8, hours: [20, 23] },
  { id: 'ticketek', name: 'Ticketek', cat: 'entretenimiento', min: 45000, max: 130000, w: 0.4, hours: [12, 18] },
  // Educación
  { id: 'udemy', name: 'Udemy', cat: 'educacion', min: 15000, max: 35000, w: 1, hours: [21, 23] },
  { id: 'cuspide', name: 'Librería Cúspide', cat: 'educacion', min: 14000, max: 42000, w: 1, hours: [12, 19] },
  // Viajes
  { id: 'aerolineas', name: 'Aerolíneas Argentinas', cat: 'viajes', min: 280000, max: 750000, w: 1, hours: [10, 22] },
  { id: 'booking', name: 'Booking.com', cat: 'viajes', min: 160000, max: 480000, w: 1, hours: [10, 22] },
  // Transferencias / Otros
  { id: 'tr-marcos', name: 'Transferencia a Marcos G.', cat: 'otros', min: 12000, max: 85000, w: 1.5, hours: [10, 22] },
  { id: 'tr-sofia', name: 'Transferencia a Sofía R.', cat: 'otros', min: 6000, max: 50000, w: 1.5, hours: [10, 22] },
  { id: 'tr-expensas', name: 'Transferencia — Expensas', cat: 'otros', min: 0, max: 0, w: 0, hours: [9, 10] }];

const G_MER = {};
G_MERCHANTS.forEach((m) => { G_MER[m.id] = m; });

// ── Moneda extranjera y PIX ─────────────────────────────────────
// Los consumos que no son en pesos viven en su propio grupo (USD o PIX):
// se muestran aparte, sin desglose interno por categoría. El monto se
// guarda también en pesos (curAmount·fx) para que los totales del mes cierren.
const G_FX = { usd: 1350, brl: 245 }; // pesos por unidad (valores de demo)
const G_CUR = {
  ars: { code: 'ars', label: 'Pesos', short: 'Pesos', sym: '$', icon: 'currency-peso', color: '#00AA18' },
  usd: { code: 'usd', label: 'Dólares', short: 'USD', sym: 'US$', icon: 'currency-dollar', color: '#1F8A4C' },
  brl: { code: 'brl', label: 'PIX', short: 'PIX', sym: 'R$', icon: 'pix-on', color: '#00B3A4' }
};

// Comercios en moneda extranjera (montos en su moneda original).
// pm = consumos esperados por mes (probabilidad ≈ pm/30 por día).
// day = suscripción mensual fija (siempre cae ese día del mes).
const G_FOREIGN = [
  // USD — servicios y compras internacionales, pagados con tarjeta
  { id: 'f-openai', name: 'OpenAI', cat: 'tech', cur: 'usd', min: 20, max: 20, day: 5, hours: [6, 8] },
  { id: 'f-apple', name: 'Apple.com', cat: 'tech', cur: 'usd', min: 2.99, max: 129, pm: 3, hours: [11, 22] },
  { id: 'f-steam', name: 'Steam', cat: 'entretenimiento', cur: 'usd', min: 4.99, max: 59.99, pm: 1.5, hours: [20, 23] },
  { id: 'f-amazon', name: 'Amazon', cat: 'ropa', cur: 'usd', min: 12, max: 180, pm: 1.5, hours: [11, 22] },
  { id: 'f-booking', name: 'Booking.com', cat: 'viajes', cur: 'usd', min: 55, max: 320, pm: 0.5, hours: [10, 22] },
  // PIX — reales, consumos en Brasil
  { id: 'f-ifood', name: 'iFood', cat: 'gastro', cur: 'brl', min: 28, max: 120, pm: 2, hours: [12, 23] },
  { id: 'f-uberbr', name: 'Uber · Brasil', cat: 'transporte', cur: 'brl', min: 11, max: 55, pm: 1.5, hours: [9, 23] },
  { id: 'f-mercadobr', name: 'Mercado · Rio', cat: 'super', cur: 'brl', min: 35, max: 160, pm: 1, hours: [10, 20] },
  { id: 'f-pousada', name: 'Pousada Trancoso', cat: 'viajes', cur: 'brl', min: 180, max: 720, pm: 0.4, hours: [10, 20] }];
const G_FOR = {};
G_FOREIGN.forEach((f) => { G_FOR[f.id] = f; });

// Qué monedas extranjeras hay en cada mes, para que el demo muestre
// todos los casos de "En otras monedas": ambas, solo una, o ninguna.
// (meses fuera del mapa = ambas, historia normal).
const G_CUR_MONTHS = {
  6: ['usd', 'brl'], // julio  → ambas
  5: ['usd'],        // junio  → solo dólares
  4: ['brl'],        // mayo   → solo PIX
  3: []              // abril  → ninguna
};
const curEnabled = (monthIdx, cur) => (G_CUR_MONTHS[monthIdx] || ['usd', 'brl']).includes(cur);

// ── Gastos fijos mensuales (día de facturación + monto base) ────
// Alimentan al generador Y a la proyección de cierre de mes:
// lo que todavía no facturó este mes se suma como "fijo pendiente".
const G_RECURRING = [
  { mid: 'osde', day: 2, base: 148000, method: 'debito' },
  { mid: 'aysa', day: 3, base: 15500, method: 'debito' },
  { mid: 'netflix', day: 4, base: 12999, method: 'debito' },
  { mid: 'edenor', day: 5, base: 39500, method: 'debito' },
  { mid: 'abl', day: 6, base: 19800, method: 'debito' },
  { mid: 'metrogas', day: 7, base: 23800, method: 'debito' },
  { mid: 'personal', day: 8, base: 32500, method: 'debito' },
  { mid: 'tr-expensas', day: 9, base: 185000, method: 'transferencia' },
  { mid: 'spotify', day: 9, base: 6499, method: 'debito' },
  { mid: 'hbomax', day: 11, base: 9500, method: 'debito' },
  { mid: 'youtube', day: 15, base: 7899, method: 'debito' },
  { mid: 'icloud', day: 21, base: 4299, method: 'debito' },
  { mid: 'chatgpt', day: 26, base: 19500, method: 'debito' }];

// inflación mensual simulada: los fijos suben ~2,2% por mes desde julio hacia atrás
const G_INFLA = 0.022;
const inflate = (base, date) => {
  const monthsBack = (2026 - date.getFullYear()) * 12 + (6 - date.getMonth());
  return base / Math.pow(1 + G_INFLA, monthsBack);
};

// ── RNG determinista (mulberry32, seed fijo) ────────────────────
const mulberry32 = (a) => () => {
  a |= 0; a = a + 0x6D2B79F5 | 0;
  let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
};

// ── Generador ───────────────────────────────────────────────────
// Pesos por categoría para el gasto variable: [día de semana, finde]
const G_CAT_WEIGHTS = {
  super: [2.6, 2.2], gastro: [2.8, 5.2], transporte: [2.2, 1.3], auto: [0.9, 0.7],
  salud: [0.75, 0.5], ropa: [0.22, 0.5], tech: [0.11, 0.16], entretenimiento: [0.7, 2.1],
  educacion: [0.12, 0.08], viajes: [0.014, 0.02], otros: [0.8, 0.6]
};

const buildMovements = () => {
  const rng = mulberry32(20260720);
  const movs = [];
  let seq = 0;

  const push = (date, mid, amount, method, h, min) => {
    const m = G_MER[mid];
    const dt = new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, min);
    if (dt > G_TODAY) return; // hoy: nada "del futuro"
    movs.push({ id: 'g' + seq++, date: dt, cat: m.cat, mid, name: m.name, amount, method });
  };

  // consumo en moneda extranjera: guarda el monto original (curAmount) y su
  // equivalente en pesos (amount) para que los totales del mes cierren.
  const pushForeign = (date, f, curAmount, h, min) => {
    const dt = new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, min);
    if (dt > G_TODAY) return;
    movs.push({
      id: 'g' + seq++, date: dt, cat: f.cat, mid: f.id, name: f.name,
      amount: Math.round(curAmount * G_FX[f.cur]), method: f.cur === 'brl' ? 'pix' : 'tarjeta',
      cur: f.cur, curAmount
    });
  };

  const amountFor = (m) => {
    let v = m.min + rng() * (m.max - m.min);
    v = Math.round(v / 10) * 10;
    if (rng() < 0.55) v += Math.round(rng() * 99) / 100; // centavos verosímiles
    return v;
  };

  const pickWeighted = (pairs) => {
    const total = pairs.reduce((a, p) => a + p[1], 0);
    let r = rng() * total;
    for (const [item, w] of pairs) { r -= w; if (r <= 0) return item; }
    return pairs[pairs.length - 1][0];
  };

  for (let d = new Date(G_DATA_START); d <= G_TODAY; d.setDate(d.getDate() + 1)) {
    const dow = d.getDay(); // 0=dom
    const weekend = dow === 0 || dow === 6;
    const dom = d.getDate();

    // 1. fijos del mes (suscripciones, servicios, expensas)
    G_RECURRING.forEach((r) => {
      if (r.day === dom) {
        const jitter = 1 + (rng() - 0.5) * 0.03;
        push(d, r.mid, Math.round(inflate(r.base, d) * jitter), r.method, G_MER[r.mid].hours[0], Math.floor(rng() * 50));
      }
    });

    // 1.5 consumos en moneda extranjera / PIX (su propio grupo)
    G_FOREIGN.forEach((f) => {
      if (!curEnabled(d.getMonth(), f.cur)) return; // este mes no tiene esa moneda
      const hit = f.day != null ? dom === f.day : rng() < f.pm / 30;
      if (hit) {
        const amt = f.day != null ? f.min : Math.round((f.min + rng() * (f.max - f.min)) * 100) / 100;
        const h = f.hours[0] + Math.floor(rng() * (f.hours[1] - f.hours[0] + 1));
        pushForeign(d, f, amt, h, Math.floor(rng() * 60));
      }
    });

    // 2. recarga SUBE recurrente (días hábiles, cada ~3 días)
    if (!weekend && rng() < 0.36)
      push(d, 'sube', Math.round((4000 + rng() * 5000) / 500) * 500, 'tarjeta', 8, Math.floor(rng() * 55));

    // 3. gasto variable del día (más movimiento el finde)
    if (rng() < 0.04 && !weekend) continue; // algún día sin gastos variables
    const n = (weekend ? 4 : 2) + Math.floor(rng() * (weekend ? 5 : 4));
    for (let i = 0; i < n; i++) {
      const cat = pickWeighted(Object.entries(G_CAT_WEIGHTS).map(([id, w]) => [id, w[weekend ? 1 : 0]]));
      const opts = G_MERCHANTS.filter((m) => m.cat === cat && m.w > 0);
      if (!opts.length) continue;
      const mer = pickWeighted(opts.map((m) => [m, m.w * (weekend && m.weekend ? m.weekend : 1)]));
      const h = mer.hours[0] + Math.floor(rng() * (mer.hours[1] - mer.hours[0] + 1));
      const method = mer.cat === 'otros' ? 'transferencia' : rng() < 0.62 ? 'tarjeta' : 'qr';
      push(d, mer.id, amountFor(mer), method, h, Math.floor(rng() * 60));
    }
  }

  movs.sort((a, b) => b.date - a.date);
  return movs;
};

const G_BASE = buildMovements(); // la historia completa, sin escalar
let G_ALL = G_BASE;

// ── Ingresos: la plata que ENTRÓ (para "Tu balance del mes") ────
// Sueldo el 1° (en abril cae el 10: al día 8 del escenario todavía
// no entró → caso "salió más de lo que entró"), aguinaldo el 1/7 y
// algunas transferencias recibidas. Los escenarios NO escalan esto:
// el gasto se calibra, lo que entra queda fijo, y el balance de cada
// mes cae en un caso distinto (jul holgado · jun justo · may cómodo
// · abr negativo). Framing honesto: es flujo ("entró"), no "ingresos"
// contables — a una billetera entra plata que no es ingreso.
const G_SALARY_BASE = 4650000; // sueldo de julio 2026; hacia atrás desinfla como los fijos
const G_SALARY_DAY = { 3: 10 }; // mes (0-index) → día de cobro distinto del 1°
const G_INCOME_SENDERS = ['Transferencia de Marcos G.', 'Transferencia de Sofía R.', 'Transferencia de Caro M.'];

const buildIncomes = () => {
  const rng = mulberry32(20260721);
  const list = [];
  let seq = 0;
  const push = (mo, day, name, amount, kind, h) => {
    list.push({ id: 'in' + seq++, date: new Date(2026, mo, day, h, Math.floor(rng() * 55)), name, amount: Math.round(amount), kind, in: true });
  };
  for (let mo = G_DATA_START.getMonth(); mo <= 6; mo++) {
    const sueldo = inflate(G_SALARY_BASE, new Date(2026, mo, 1)) * (1 + (rng() - 0.5) * 0.02);
    push(mo, G_SALARY_DAY[mo] || 1, 'Sueldo', sueldo, 'sueldo', 9);
    if (mo === 6) push(mo, 1, 'Aguinaldo', sueldo / 2, 'aguinaldo', 9);
    const n = 2 + Math.floor(rng() * 2); // 2-3 transferencias recibidas por mes
    // la primera cae en los primeros días: aunque "hoy" sea temprano
    // (abril = día 8), "Entró" nunca queda en cero pelado
    for (let i = 0; i < n; i++)
      push(mo, 2 + Math.floor(rng() * (i === 0 ? 6 : 26)), G_INCOME_SENDERS[Math.floor(rng() * G_INCOME_SENDERS.length)],
        15000 + rng() * 105000, 'transferencia', 10 + Math.floor(rng() * 12));
  }
  list.sort((a, b) => b.date - a.date);
  return list;
};
const G_INCOMES = buildIncomes();

// ── Períodos ────────────────────────────────────────────────────
const G_MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const G_DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const dayStart = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const monday = (d) => addDays(dayStart(d), -((d.getDay() + 6) % 7));
const cap1 = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// periodInfo(unit, anchor) → todo lo que la UI necesita para navegar y comparar
const periodInfo = (unit, anchor) => {
  const a = dayStart(anchor);
  let start, end, label, prevAnchor, nextAnchor;
  if (unit === 'day') {
    start = a; end = addDays(a, 1);
    label = sameDay(a, G_TODAY) ? 'Hoy' : sameDay(a, addDays(G_TODAY, -1)) ? 'Ayer' : cap1(`${G_DIAS[a.getDay()]} ${a.getDate()} de ${G_MESES[a.getMonth()]}`);
    prevAnchor = addDays(a, -1); nextAnchor = addDays(a, 1);
  } else if (unit === 'week') {
    start = monday(a); end = addDays(start, 7);
    const e = addDays(end, -1);
    label = `Semana del ${start.getDate()}${start.getMonth() !== e.getMonth() ? ' de ' + G_MESES[start.getMonth()] : ''} al ${e.getDate()} de ${G_MESES[e.getMonth()]}`;
    prevAnchor = addDays(start, -7); nextAnchor = addDays(start, 7);
  } else if (unit === 'month') {
    start = new Date(a.getFullYear(), a.getMonth(), 1); end = new Date(a.getFullYear(), a.getMonth() + 1, 1);
    label = `${cap1(G_MESES[a.getMonth()])} ${a.getFullYear()}`;
    prevAnchor = new Date(a.getFullYear(), a.getMonth() - 1, 1); nextAnchor = new Date(a.getFullYear(), a.getMonth() + 1, 1);
  } else {
    start = new Date(a.getFullYear(), 0, 1); end = new Date(a.getFullYear() + 1, 0, 1);
    label = String(a.getFullYear());
    prevAnchor = new Date(a.getFullYear() - 1, 0, 1); nextAnchor = new Date(a.getFullYear() + 1, 0, 1);
  }
  const isCurrent = G_TODAY >= start && G_TODAY < end;
  const elapsedEnd = isCurrent ? addDays(dayStart(G_TODAY), 1) : end; // fin del tramo transcurrido
  const elapsedDays = Math.round((elapsedEnd - start) / 86400000);
  const totalDays = Math.round((end - start) / 86400000);
  const canNext = nextAnchor <= G_TODAY;
  // nombre del período anterior, para la frase de comparación
  const prevName = unit === 'day' ? (sameDay(a, G_TODAY) ? 'ayer' : 'el día anterior') :
    unit === 'week' ? 'la semana pasada' :
    unit === 'month' ? G_MESES[(start.getMonth() + 11) % 12] :
    String(start.getFullYear() - 1);
  return { unit, start, end, label, prevAnchor, nextAnchor, canNext, isCurrent, elapsedEnd, elapsedDays, totalDays, prevName };
};

// ── Repositorio (la interfaz que después implementa el backend) ─
const inRange = (m, s, e) => m.date >= s && m.date < e;
const isArs = (m) => !m.cur || m.cur === 'ars'; // pesos (los grupos USD/PIX van aparte)

// ritmo: barras del período (día → por hora, mes/semana → por día, año → por mes)
// Sirve tanto para el resumen del período como para una selección filtrada.
const bucketize = (p, movs) => {
  const buckets = [];
  if (p.unit === 'year') {
    for (let m = 0; m < 12; m++) {
      const s = new Date(p.start.getFullYear(), m, 1), e = new Date(p.start.getFullYear(), m + 1, 1);
      const mine = movs.filter((x) => inRange(x, s, e));
      buckets.push({ label: 'EFMAMJJASOND'[m], total: mine.reduce((a, x) => a + x.amount, 0), count: mine.length, future: s > G_TODAY, focus: cap1(G_MESES[m]) });
    }
  } else if (p.unit === 'day') {
    for (let h = 7; h <= 23; h += 2) {
      const mine = movs.filter((x) => x.date.getHours() >= h && x.date.getHours() < h + 2);
      buckets.push({ label: h % 4 === 3 ? String(h) : '', total: mine.reduce((a, x) => a + x.amount, 0), count: mine.length, future: p.isCurrent && h > G_TODAY.getHours(), focus: `${h} a ${h + 2} h` });
    }
  } else {
    for (let i = 0; i < p.totalDays; i++) {
      const s = addDays(p.start, i), e = addDays(p.start, i + 1);
      const lbl = p.unit === 'week' ? 'LMXJVSD'[i] : (s.getDate() === 1 || s.getDate() % 7 === 0 ? String(s.getDate()) : '');
      const mine = movs.filter((x) => inRange(x, s, e));
      const focus = sameDay(s, G_TODAY) ? 'Hoy' : sameDay(s, addDays(G_TODAY, -1)) ? 'Ayer' : cap1(`${G_DIAS[s.getDay()]} ${s.getDate()}`);
      buckets.push({ label: lbl, total: mine.reduce((a, x) => a + x.amount, 0), count: mine.length, future: s >= addDays(dayStart(G_TODAY), 1), today: sameDay(s, G_TODAY), focus });
    }
  }
  return buckets;
};

const ExpensesRepository = {
  categories: () => G_CATS,

  getMovements(p, catId) {
    return G_ALL.filter((m) => inRange(m, p.start, p.end) && (!catId || m.cat === catId));
  },

  search(p, q) {
    const s = q.trim().toLowerCase();
    return this.getMovements(p).filter((m) => m.name.toLowerCase().includes(s));
  },

  // Buscador: período + categorías + medios de pago + moneda + texto, todo opcional
  query(p, { cats = [], methods = [], curs = [], text = '' } = {}) {
    let list = this.getMovements(p);
    if (cats.length) list = list.filter((m) => cats.includes(m.cat));
    if (methods.length) list = list.filter((m) => methods.includes(m.method));
    if (curs.length) list = list.filter((m) => curs.includes(m.cur || 'ars'));
    if (text.trim()) { const s = text.trim().toLowerCase(); list = list.filter((m) => m.name.toLowerCase().includes(s)); }
    return list;
  },

  // Resumen del período: total, comparación honesta (mismos N días del
  // período anterior si el actual está en curso), desglose, ritmo,
  // proyección de cierre e insight calculado.
  getSummary(p) {
    const movs = this.getMovements(p);
    const total = movs.reduce((a, m) => a + m.amount, 0);

    // comparación: mismos N días del período anterior
    const prev = periodInfo(p.unit, p.prevAnchor);
    const prevCmpEnd = p.isCurrent ? addDays(prev.start, p.elapsedDays) : prev.end;
    const prevMovs = G_ALL.filter((m) => inRange(m, prev.start, prevCmpEnd));
    const prevTotal = prevMovs.reduce((a, m) => a + m.amount, 0);
    const hasPrev = prev.start >= G_DATA_START || prevTotal > 0;

    // los grupos USD/PIX se muestran aparte → el desglose por categoría
    // (y su comparación) mira solo los consumos en pesos.
    const arsMovs = movs.filter(isArs);
    const prevArs = prevMovs.filter(isArs);

    // desglose por categoría (con su vs-anterior)
    const byCategory = G_CATS.map((c) => {
      const mine = arsMovs.filter((m) => m.cat === c.id);
      const t = mine.reduce((a, m) => a + m.amount, 0);
      const pt = prevArs.filter((m) => m.cat === c.id).reduce((a, m) => a + m.amount, 0);
      return { cat: c, total: t, count: mine.length, prevTotal: pt, pct: total > 0 ? t / total : 0 };
    }).filter((c) => c.total > 0).sort((a, b) => b.total - a.total);

    // grupos de moneda extranjera / PIX (total en pesos + total en su moneda)
    const byCurrency = ['usd', 'brl'].map((cur) => {
      const mine = movs.filter((m) => m.cur === cur);
      return {
        cur, meta: G_CUR[cur], count: mine.length,
        total: mine.reduce((a, m) => a + m.amount, 0),
        curTotal: mine.reduce((a, m) => a + m.curAmount, 0)
      };
    }).filter((c) => c.count > 0);

    const buckets = bucketize(p, movs);
    const elapsedBuckets = buckets.filter((b) => !b.future);
    const avgBucket = elapsedBuckets.length ? elapsedBuckets.reduce((a, b) => a + b.total, 0) / elapsedBuckets.length : 0;

    // proyección de cierre (solo mes en curso): variable extrapolado + fijos pendientes.
    // Los primeros días el ritmo variable todavía miente → rango, no número seco.
    let projection = null;
    if (p.unit === 'month' && p.isCurrent) {
      const recMids = new Set(G_RECURRING.map((r) => r.mid));
      const fixedSpent = movs.filter((m) => recMids.has(m.mid)).reduce((a, m) => a + m.amount, 0);
      const pendingFixed = G_RECURRING.filter((r) => r.day > G_TODAY.getDate()).reduce((a, r) => a + inflate(r.base, G_TODAY), 0);
      const variableRate = Math.max(0, total - fixedSpent) / p.elapsedDays;
      const value = total + variableRate * (p.totalDays - p.elapsedDays) + pendingFixed;
      projection = p.elapsedDays <= 5 ?
        { low: value * 0.85, high: value * 1.15, value: null } :
        { value, low: null, high: null };
    }

    // "tu ritmo habitual": promedio de los últimos 3 períodos equivalentes,
    // medido sobre el mismo tramo transcurrido. Es la base del veredicto:
    // compararte con vos mismo tranquiliza más que compararte con un mes puntual.
    const samples = [];
    const fullSamples = [];
    const catSamples = {}; // gasto ARS por categoría en esos mismos tramos
    let cur = p;
    for (let i = 0; i < 3; i++) {
      const prevP = periodInfo(p.unit, cur.prevAnchor);
      if (prevP.start < G_DATA_START) break;
      const end = addDays(prevP.start, Math.min(p.elapsedDays, prevP.totalDays));
      const tramo = G_ALL.filter((m) => m.date >= prevP.start && m.date < end);
      samples.push(tramo.reduce((a, m) => a + m.amount, 0));
      tramo.filter(isArs).forEach((m) => { catSamples[m.cat] = (catSamples[m.cat] || 0) + m.amount; });
      // el período anterior completo — la "meta" de la carrera del mes
      fullSamples.push(G_ALL.filter((m) => m.date >= prevP.start && m.date < prevP.end).reduce((a, m) => a + m.amount, 0));
      cur = prevP;
    }
    const usual = samples.length >= 2 ? samples.reduce((a, b) => a + b, 0) / samples.length : null;
    const usualFull = fullSamples.length >= 2 ? fullSamples.reduce((a, b) => a + b, 0) / fullSamples.length : null;
    // la misma vara, por categoría: promedio a esta altura del período.
    // Alimenta el modo comparación del diagrama de barras del home.
    if (samples.length >= 2) byCategory.forEach((c) => { c.avg3 = (catSamples[c.cat.id] || 0) / samples.length; });

    // insight: la categoría que más movió la aguja vs. el período anterior
    let insight = null;
    if (hasPrev && prevTotal > 0) {
      const movers = byCategory.concat(
        // categorías que desaparecieron también cuentan como baja
        G_CATS.filter((c) => !byCategory.find((b) => b.cat.id === c.id))
          .map((c) => ({ cat: c, total: 0, prevTotal: prevArs.filter((m) => m.cat === c.id).reduce((a, m) => a + m.amount, 0) }))
          .filter((c) => c.prevTotal > 0)
      ).map((c) => ({ ...c, delta: c.total - c.prevTotal })).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
      if (movers.length && Math.abs(movers[0].delta) > Math.max(4000, prevTotal * 0.02))
        insight = { cat: movers[0].cat, delta: movers[0].delta };
    }

    return { total, count: movs.length, prevTotal, hasPrev, byCategory, byCurrency, buckets, avgBucket, projection, usual, usualFull, insight };
  },

  // Balance del período: cuánta plata entró vs. salió. Descriptivo,
  // sin veredicto (el único juez del home es la carrera). "salió" =
  // el mismo total que el hero (incluye otras monedas en pesos).
  getBalance(p) {
    const incomes = G_INCOMES.filter((m) => m.date >= p.start && m.date < p.end && m.date <= G_TODAY);
    const inTotal = incomes.reduce((a, m) => a + m.amount, 0);
    const outTotal = this.getMovements(p).reduce((a, m) => a + m.amount, 0);
    return { inTotal, outTotal, net: inTotal - outTotal, incomes };
  },

  // Top comercios de una categoría en el período
  getTopMerchants(p, catId) {
    const movs = this.getMovements(p, catId);
    const by = {};
    movs.forEach((m) => {
      if (!by[m.mid]) by[m.mid] = { mid: m.mid, name: m.name, total: 0, count: 0 };
      by[m.mid].total += m.amount; by[m.mid].count++;
    });
    return Object.values(by).sort((a, b) => b.total - a.total);
  }
};

// ── Escenarios de demo: cada mes cae en un caso distinto ────────
// El selector del stage mueve "hoy" al día 20 de otro mes y escala el
// gasto de ese mes para calibrar la carrera a un diff exacto de días.
// Así los 4 casos posibles del veredicto quedan cubiertos con data real:
// nada se hardcodea, todos los indicadores se derivan igual que siempre.
// day = "hoy" de cada escenario (distinto en cada mes). Julio ≤ 20:
// la data seedeada llega hasta el 20/7, no hay nada después.
const G_SCENARIOS = [
  { id: 'jul', label: 'Julio', month: 6, day: 20, targetDiff: 3, caso: 'Le vas ganando al mes · USD + PIX · balance holgado (aguinaldo)' },
  { id: 'jun', label: 'Junio', month: 5, day: 26, targetDiff: 0, caso: 'Palo a palo con el mes · solo USD · balance justo' },
  { id: 'may', label: 'Mayo', month: 4, day: 12, targetDiff: -2.2, caso: 'Un poco más de lo habitual · solo PIX · balance cómodo' },
  { id: 'abr', label: 'Abril', month: 3, day: 8, targetDiff: -5, caso: 'Gastando más que los últimos meses · sin moneda extranjera · balance negativo (el sueldo cae el 10)' }];

const setGastosScenario = (id) => {
  const s = G_SCENARIOS.find((x) => x.id === id) || G_SCENARIOS[0];
  G_TODAY = new Date(2026, s.month, s.day || 20, 19, 30);
  window.G_TODAY = G_TODAY;
  const cut = G_BASE.filter((m) => m.date <= G_TODAY);
  const p = periodInfo('month', G_TODAY);
  const baseTotal = cut.filter((m) => m.date >= p.start).reduce((a, m) => a + m.amount, 0);
  // la meta de la carrera: promedio de los meses previos completos
  const fulls = [];
  let cur = p;
  for (let i = 0; i < 3; i++) {
    const prevP = periodInfo('month', cur.prevAnchor);
    if (prevP.start < G_DATA_START) break;
    fulls.push(cut.filter((m) => m.date >= prevP.start && m.date < prevP.end).reduce((a, m) => a + m.amount, 0));
    cur = prevP;
  }
  const usualFull = fulls.length >= 2 ? fulls.reduce((a, b) => a + b, 0) / fulls.length : null;
  // factor tal que diff = elapsed − (total/usualFull)·totalDays == targetDiff
  let factor = 1;
  if (s.targetDiff != null && usualFull && baseTotal > 0)
    factor = ((p.elapsedDays - s.targetDiff) / p.totalDays) * usualFull / baseTotal;
  G_ALL = cut.map((m) => m.date >= p.start ?
    { ...m, amount: Math.round(m.amount * factor * 100) / 100, ...(m.curAmount != null ? { curAmount: Math.round(m.curAmount * factor * 100) / 100 } : {}) } :
    m);
};
setGastosScenario('jul'); // arranca calibrado: julio = ganando

// ── Recategorización de gastos (Proposal 3) ─────────────────────
// Mutamos la data en memoria (base + actual) para que el cambio se vea
// reflejado al toque en el desglose. scope 'one' = solo ese movimiento;
// 'all' = todos los consumos del comercio (viejos y nuevos).
const recategorize = (mov, catId, scope) => {
  const hit = (m) => scope === 'all' ? m.mid === mov.mid : m.id === mov.id;
  G_BASE.forEach((m) => { if (hit(m)) m.cat = catId; });
  G_ALL.forEach((m) => { if (hit(m)) m.cat = catId; });
};

// Crea una categoría de usuario y la suma a la taxonomía viva.
let G_USER_SEQ = 0;
const createCategory = ({ name, color, icon }) => {
  const id = 'user-' + (++G_USER_SEQ);
  const cat = { id, name, short: name.length > 10 ? name.slice(0, 9) + '…' : name, icon, color, user: true };
  G_CATS.push(cat);
  G_CAT[id] = cat;
  return cat;
};

Object.assign(window, { G_TODAY, G_DATA_START, G_CATS, G_CAT, G_MER, ExpensesRepository, periodInfo, bucketize, G_MESES, G_DIAS, dayStart, addDays, sameDay, cap1, G_SCENARIOS, setGastosScenario, G_CUR, G_FX, G_FOREIGN, G_FOR, recategorize, createCategory, G_INCOMES });
