/* ============================================================
   gov.js — how government really works:
   • Legis   — a bill's journey: drafting → first reading → committee
               (expert witnesses, amendments) → debate → vote →
               upper house → signature / assent
   • Procure — public procurement: procedure, tender notice, public
               bid opening, evaluation committee scoring, award,
               bid protests, contract terms and milestone payments
   • Cabinet — ministers who brief you with real data and advice
   • World   — inflation, central bank, markets, currency and
               world economic news that hits your economy
   • Paper   — the national newspaper every half-year
   Uses globals from data.js and game.js at runtime.
   ============================================================ */
'use strict';

// ---------- people ----------
const NAME_POOLS = {
  uz: { m: ['Aziz', 'Sardor', 'Jasur', 'Bekzod', 'Timur', 'Rustam', 'Farrukh', 'Otabek', 'Sherzod', 'Ulugbek'], f: ['Dilnoza', 'Nodira', 'Malika', 'Gulnora', 'Shahnoza', 'Kamola', 'Feruza', 'Zarina', 'Madina', 'Laylo'], l: ['Rakhimov', 'Tursunov', 'Nazarov', 'Usmonov', 'Ismoilov', 'Saidov', 'Khamidov', 'Ergashev', 'Yuldashev', 'Sobirov'], fem: 'a' },
  mv: { m: ['Ahmed', 'Mohamed', 'Ibrahim', 'Hassan', 'Ali', 'Hussain', 'Moosa', 'Abdulla', 'Ismail', 'Yoosuf', 'Adam', 'Ilyas', 'Shiyam', 'Nihad'],
        f: ['Aishath', 'Fathimath', 'Mariyam', 'Hawwa', 'Aminath', 'Shifa', 'Shaheena', 'Mausooma', 'Nazima', 'Zeena', 'Raheema', 'Shazna'],
        l: ['Rasheed', 'Naseem', 'Shareef', 'Manik', 'Saleem', 'Latheef', 'Zahir', 'Shakir', 'Fikry', 'Riyaz', 'Areef', 'Zameer', 'Mausoom', 'Didi'] },
  kz: { m: ['Askar', 'Nurlan', 'Daulet', 'Yerlan', 'Arman', 'Marat', 'Bauyrzhan'], f: ['Aigerim', 'Dana', 'Gulnar', 'Saule', 'Aliya', 'Zhanna', 'Asel'], l: ['Abenov', 'Omarov', 'Sadykov', 'Zhumabekov', 'Iskakov', 'Bekov', 'Seitov'], fem: 'a' },
  tr: { m: ['Emre', 'Mehmet', 'Burak', 'Can', 'Kerem', 'Murat'], f: ['Elif', 'Zeynep', 'Ayşe', 'Selin', 'Deniz', 'Ebru'], l: ['Yılmaz', 'Kaya', 'Demir', 'Şahin', 'Çelik', 'Aydın', 'Öztürk', 'Arslan'] },
  en: { m: ['James', 'Daniel', 'Michael', 'Robert', 'Thomas', 'David'], f: ['Sarah', 'Emily', 'Laura', 'Rachel', 'Olivia', 'Hannah'], l: ['Carter', 'Bennett', 'Hughes', 'Morgan', 'Fletcher', 'Reed', 'Walsh', 'Porter'] },
  de: { m: ['Lukas', 'Jonas', 'Felix', 'Stefan', 'Matthias', 'Tobias'], f: ['Anna', 'Julia', 'Katrin', 'Lena', 'Sabine', 'Miriam'], l: ['Becker', 'Hoffmann', 'Wagner', 'Schäfer', 'Koch', 'Richter', 'Krüger', 'Lang'] },
  fr: { m: ['Julien', 'Antoine', 'Mathieu', 'Nicolas', 'Hugo', 'Pierre'], f: ['Camille', 'Claire', 'Sophie', 'Élise', 'Manon', 'Chloé'], l: ['Lefèvre', 'Moreau', 'Girard', 'Bonnet', 'Fontaine', 'Rousseau', 'Blanc', 'Lambert'] },
  jp: { m: ['Hiroshi', 'Kenji', 'Takeshi', 'Daiki', 'Yuto', 'Satoshi'], f: ['Yuki', 'Aiko', 'Haruka', 'Emi', 'Naoko', 'Sakura'], l: ['Tanaka', 'Suzuki', 'Takahashi', 'Watanabe', 'Ito', 'Yamamoto', 'Nakamura', 'Kobayashi'] },
  in: { m: ['Arjun', 'Rahul', 'Vikram', 'Rohan', 'Sanjay', 'Karan'], f: ['Priya', 'Ananya', 'Kavya', 'Neha', 'Meera', 'Divya'], l: ['Sharma', 'Iyer', 'Reddy', 'Menon', 'Patel', 'Verma', 'Nair', 'Joshi'] },
  br: { m: ['Lucas', 'Gabriel', 'Rafael', 'Pedro', 'Thiago', 'Bruno'], f: ['Ana', 'Beatriz', 'Juliana', 'Camila', 'Larissa', 'Fernanda'], l: ['Silva', 'Souza', 'Oliveira', 'Costa', 'Almeida', 'Ferreira', 'Ribeiro', 'Carvalho'] },
  intl: { m: ['Adrian', 'Marco', 'Viktor', 'Samuel', 'Leon', 'Omar'], f: ['Nina', 'Clara', 'Irina', 'Sofia', 'Lea', 'Yasmin'], l: ['Varga', 'Moreno', 'Lindqvist', 'Novak', 'Haddad', 'Petrov', 'Costa', 'Brandt'] },
};
const POOL_OF = { mv: 'mv', uz: 'uz', kz: 'kz', tr: 'tr', us: 'en', uk: 'en', de: 'de', fr: 'fr', jp: 'jp', in: 'in', br: 'br' };
function personName(gender) {
  const P = NAME_POOLS[POOL_OF[COUNTRY.id] || 'intl'];
  const first = pick(gender === 'f' ? P.f : P.m); let last = pick(P.l);
  if (gender === 'f' && P.fem) last += P.fem;
  return COUNTRY.id === 'jp' ? `${last} ${first}` : `${first} ${last}`;   // Japanese order: family name first
}
function docModal(html, buttons, cls = 'doc-card') {
  return new Promise(res => {
    const m = modal(`${html}<div class="doc-actions">${buttons.map((b, i) => `<button class="btn ${b.primary ? 'primary' : ''} ${b.danger ? 'danger' : ''}" data-i="${i}" ${b.disabled ? 'disabled' : ''} title="${b.title || ''}">${b.label}</button>`).join('')}</div>`, cls);
    m.querySelector('.modal-card').scrollTop = 0;
    m.querySelectorAll('.doc-actions button').forEach(b => b.onclick = () => { closeModal(); res(buttons[+b.dataset.i].id); });
  });
}
const stepsBar = (names, cur) => `<div class="steps">${names.map((n, i) => `<span class="${i < cur ? 'done' : i === cur ? 'on' : ''}">${i < cur ? '✓' : i + 1}. ${n}</span>`).join('')}</div>`;
const edu = t => `<div class="edu">📘 ${t}</div>`;
const yearNow = () => 2026 + Math.ceil((S.turn || 1) / 2);

// ============================================================
// WORLD ECONOMY
// ============================================================
const ECON = {
  veloria: { tags: ['agri', 'manufacturing'], infl: 3, target: 3, real: 1, cur: 'velor' },
  uz: { tags: ['gold', 'gas', 'agri', 'remittances', 'emerging'], infl: 6.2, target: 5, real: 7.5, cur: 'so\'m', upper: { name: 'Senate', seats: 65 }, assent: 'approved by the Senate, signed by the President and published — it enters into force.' },
  mv: { tags: ['tourism', 'emerging', 'energyImporter'], infl: 3, target: 3, real: 4, cur: 'rufiyaa', upper: null, assent: 'ratified by the President and published in the Government Gazette.' },
  kz: { tags: ['oil', 'metals', 'emerging'], infl: 10.2, target: 5, real: 6, cur: 'tenge', upper: { name: 'Senate', seats: 50 }, assent: 'approved by the Senate and signed by the President.' },
  tr: { tags: ['tourism', 'manufacturing', 'emerging', 'energyImporter', 'exporter'], infl: 31.7, target: 5, real: 7, cur: 'lira', upper: null, assent: 'approved by the President and published in the Official Gazette.' },
  us: { tags: ['tech', 'oil', 'reserve'], infl: 3.5, target: 2, real: .8, cur: 'dollar', upper: { name: 'Senate', seats: 100 }, assent: 'passed by the Senate and signed into law by the President.' },
  uk: { tags: ['tourism', 'finance', 'energyImporter'], infl: 3.1, target: 2, real: .8, cur: 'pound', upper: { name: 'House of Lords', seats: 0, revise: true }, assent: 'given Royal Assent — the Bill becomes an Act of Parliament.' },
  de: { tags: ['manufacturing', 'exporter', 'energyImporter'], infl: 2.5, target: 2, real: .3, cur: 'euro', upper: { name: 'Bundesrat', seats: 69 }, assent: 'signed by the Federal President and published in the Federal Law Gazette.' },
  fr: { tags: ['tourism', 'manufacturing', 'energyImporter'], infl: 1.8, target: 2, real: .3, cur: 'euro', upper: { name: 'Senate', seats: 348 }, assent: 'promulgated by the President of the Republic and published in the Journal Officiel.' },
  jp: { tags: ['tech', 'manufacturing', 'exporter', 'energyImporter'], infl: 1.5, target: 2, real: -.8, cur: 'yen', upper: { name: 'House of Councillors', seats: 248 }, assent: 'promulgated by the Emperor on the advice of the Cabinet.' },
  in: { tags: ['tech', 'agri', 'emerging', 'energyImporter', 'remittances'], infl: 5.6, target: 4, real: 0, cur: 'rupee', upper: { name: 'Rajya Sabha', seats: 245 }, assent: 'given the assent of the President of India.' },
  br: { tags: ['agri', 'oil', 'emerging'], infl: 4.4, target: 3, real: 10.5, cur: 'real', upper: { name: 'Federal Senate', seats: 81 }, assent: 'sanctioned by the President and published in the Diário Oficial.' },
};
const econ = () => ECON[COUNTRY.id] || ECON.veloria;
const hasTag = t => econ().tags.includes(t);

const WORLD_EVENTS = [
  { id: 'ratesup', head: 'Major central banks raise interest rates as energy prices push inflation up',
    body: 'The US Federal Reserve and the European Central Bank have lifted their policy rates to fight inflation driven by energy prices. Higher global rates make borrowing more expensive everywhere and pull investment money toward the US dollar.',
    learn: 'When big central banks raise rates, investors can earn more on safe US or European bonds, so money flows out of riskier markets. Emerging-market currencies tend to weaken and their governments must pay more to borrow.',
    fx: () => ({ rate: .002, fx: hasTag('emerging') ? -3 : -1, stock: -4, gdp: -.3, infl: .3, note: 'Our borrowing costs rise and the currency comes under pressure.' }) },
  { id: 'ratesdown', head: 'Global central banks begin cutting interest rates',
    body: 'With inflation easing, major central banks have started to lower rates, making credit cheaper worldwide.',
    learn: 'Lower global rates reduce interest costs on government debt and encourage investment and home buying. Stock markets usually rise.',
    fx: () => ({ rate: -.002, stock: 5, gdp: .3, fx: hasTag('emerging') ? 2 : 0, note: 'Cheaper credit supports investment and our currency.' }) },
  { id: 'oilup', head: 'Oil prices jump as major producers cut output', world: { oil: 18 },
    body: 'Benchmark crude rose sharply after leading exporters agreed to reduce supply.',
    learn: 'Oil is an input to almost everything — transport, plastics, fertiliser. When it gets more expensive, importers see higher inflation, while exporters earn windfall revenue.',
    fx: () => hasTag('oil') ? { gdp: 1.2, cost: -1.5, infl: .6, fx: 2, note: 'As an oil exporter, our export earnings and tax revenue rise.' } : { gdp: -.6, infl: hasTag('energyImporter') ? 1.6 : 1, note: 'Fuel and transport costs rise, pushing up inflation.' } },
  { id: 'oildown', head: 'Oil prices slump on weak global demand', world: { oil: -20 },
    body: 'Crude prices fell as factories in major economies slowed and stockpiles grew.',
    learn: 'Cheap oil is good news for importers (lower inflation) and bad news for exporters, whose budgets often depend on oil revenue.',
    fx: () => hasTag('oil') ? { gdp: -1.2, cost: 1.5, fx: -3, note: 'Our oil revenue falls and the budget feels the pain.' } : { infl: -.8, gdp: .4, note: 'Cheaper fuel lowers costs for families and businesses.' } },
  { id: 'gold', head: 'Gold hits a record high as investors seek safety',
    body: 'Central banks and investors are buying gold as a hedge against uncertainty.',
    learn: 'Gold is a classic "safe haven". Countries that mine and export gold earn more foreign currency and build up reserves.',
    fx: () => hasTag('gold') ? { cost: -1.5, gdp: .8, fx: 1.5, note: 'As a major gold producer, our export earnings and reserves rise.' } : { note: 'Little direct effect on our economy.' } },
  { id: 'recession', head: 'Global growth slows as trade and factory output weaken',
    body: 'International forecasters have cut their world growth outlook as demand for manufactured goods falls.',
    learn: 'Economies are linked through trade. When big markets slow, they buy fewer exports, so a slowdown abroad becomes a slowdown at home.',
    fx: () => ({ gdp: hasTag('manufacturing') || hasTag('exporter') ? -1.2 : -.6, stock: -6, cost: .5, note: 'Weaker foreign demand hits our exports and investment.' }) },
  { id: 'boom', head: 'World trade rebounds strongly',
    body: 'Shipping volumes and global orders are at multi-year highs.',
    learn: 'Strong global demand lifts exporters first, then spreads through jobs and wages to the rest of the economy.',
    fx: () => ({ gdp: hasTag('exporter') || hasTag('manufacturing') ? 1 : .5, stock: 5, cost: -.5, note: 'Export orders and tax receipts rise.' }) },
  { id: 'shipping', head: 'Shipping disruptions push up freight costs',
    body: 'Conflict and congestion on key sea routes are forcing ships to take longer journeys.',
    learn: 'Higher freight costs raise the price of imported goods. Landlocked countries are hit harder because goods must cross several borders.',
    fx: () => ({ infl: COUNTRY.landlocked ? 1.2 : .7, gdp: -.3, note: COUNTRY.landlocked ? 'As a landlocked country, our import costs rise more than most.' : 'Import costs and prices rise.' }) },
  { id: 'ai', head: 'AI investment boom lifts technology stocks',
    body: 'Companies are pouring money into data centres and AI chips.',
    learn: 'New technologies can raise productivity — producing more with the same workers — which is the main source of long-run growth.',
    fx: () => hasTag('tech') ? { gdp: 1, stock: 8, note: 'Our tech sector attracts investment and jobs.' } : { stock: 2, note: 'Small spill-over to our markets; we should build our own tech sector.' } },
  { id: 'remit', head: 'Migrant workers send home record remittances',
    body: 'Strong labour demand abroad has raised the money migrants send to their families.',
    learn: 'Remittances are money sent home by citizens working abroad. In some countries they are over 10% of GDP and support household spending and the currency.',
    fx: () => hasTag('remittances') ? { gdp: .8, fx: 1.5, g: { workers: 2 }, note: 'Families spend more and the currency strengthens.' } : { note: 'No major effect for us.' } },
  { id: 'food', head: 'Food prices spike after droughts in key exporting countries',
    body: 'Harvest failures have cut global wheat and rice supplies.',
    learn: 'Food makes up a much bigger share of spending for poorer households, so food inflation hits them hardest.',
    fx: () => hasTag('agri') ? { infl: .8, gdp: .4, g: { farmers: 4, workers: -1 }, note: 'Our farmers earn more, but food costs rise at home.' } : { infl: 1.2, g: { workers: -2 }, note: 'Food import costs rise.' } },
  { id: 'tariffs', head: 'Trade war escalates as major economies raise tariffs',
    body: 'New import taxes have been announced on billions of dollars of goods.',
    learn: 'A tariff is a tax on imports. It protects some domestic producers but raises prices for consumers and invites retaliation.',
    fx: () => ({ gdp: hasTag('exporter') || hasTag('manufacturing') ? -1 : -.4, infl: .4, stock: -4, note: 'Global trade slows; exporters lose orders.' }) },
  { id: 'dollar', head: 'US dollar climbs to a multi-year high',
    body: 'Higher US yields are attracting capital from around the world.',
    learn: 'A strong dollar makes imports priced in dollars — oil, machinery, debt payments — more expensive for other countries.',
    fx: () => COUNTRY.id === 'us' ? { infl: -.3, note: 'Imports get cheaper for Americans, but exporters lose competitiveness.' } : { fx: hasTag('emerging') ? -4 : -2, infl: .5, note: 'Our currency weakens; imports and dollar debt cost more.' } },
  { id: 'tourism', head: 'Global tourism has a record year',
    body: 'Air travel and hotel bookings have exceeded pre-pandemic levels.',
    learn: 'Tourism earns foreign currency and creates many jobs in hotels, transport and restaurants.',
    fx: () => hasTag('tourism') ? { gdp: .8, fx: 1, g: { business: 3, youth: 1 }, note: 'Hotels, restaurants and airports are busy.' } : { gdp: .2, note: 'A small boost to our travel sector.' } },
  { id: 'gas', head: 'Natural gas prices rise in Europe and Asia',
    body: 'Cold weather and supply outages have tightened the gas market.',
    learn: 'Gas heats homes and powers factories and power plants. Exporters gain; importers pay more for electricity and heating.',
    fx: () => hasTag('gas') ? { cost: -1, gdp: .5, note: 'Our gas exports earn more.' } : hasTag('energyImporter') ? { infl: 1, gdp: -.4, note: 'Heating and electricity bills rise.' } : { infl: .3, note: 'A small rise in energy costs.' } },
];

const World = (() => {
  function init() {
    const e = econ();
    S.infl = e.infl; S.inflTarget = e.target; S.realRate = e.real; S.cb = cbRate();
    S.stock = 1000; S.fx = 100; S.oil = 82; S.firstWorld = true; S.worldDeck = shuffle(WORLD_EVENTS.map(x => x.id));
  }
  function cbRate() { return Math.max(.25, S.infl + S.realRate + (S.infl - S.inflTarget) * .25); }
  function step(r) {
    if (S.infl === undefined) init();
    const bc = budgetCalc(), defPct = Math.max(0, -bc.bal * 2 / S.gdp * 100);
    let ev = null, efx = {};
    if (S.firstWorld) { ev = WORLD_EVENTS[0]; S.firstWorld = false; }
    else if (Math.random() < .65) { if (!S.worldDeck || !S.worldDeck.length) S.worldDeck = shuffle(WORLD_EVENTS.map(x => x.id)); const id = S.worldDeck.pop(); ev = WORLD_EVENTS.find(x => x.id === id); }
    if (ev) {
      efx = ev.fx() || {};
      if (efx.gdp) S.gdp *= 1 + efx.gdp / 100;
      if (efx.cost) S.debt += efx.cost;
      if (efx.rate) S.rate = Math.max(.002, (S.rate || .015) + efx.rate);
      if (efx.g) for (const g in efx.g) { S.ga[g] = clamp(S.ga[g] + efx.g[g]); S.eventMods[g] += efx.g[g] * .6; }
      if (ev.world && ev.world.oil) S.oil = clamp(S.oil + ev.world.oil, 35, 160);
      news(ev.head);
    }
    const prev = { infl: S.infl, cb: S.cb, stock: S.stock, fx: S.fx };
    const en = energy();
    S.infl = clamp(S.infl + (S.inflTarget - S.infl) * .2 + defPct * .1 + (efx.infl || 0) + Math.max(0, en.demand - en.supply) * .03 + rnd(-.3, .3), -2, 90);
    S.cb = cbRate();
    S.stock *= 1 + (r.growth * 1.5 + (efx.stock || 0) - (S.cb - prev.cb) * 2 + rnd(-3, 3)) / 100;
    S.fx *= 1 + ((efx.fx || 0) - (S.infl - 2.5) * .15 + rnd(-.5, .5)) / 100;
    S.oil = clamp(S.oil + rnd(-4, 4), 35, 160);
    return { ev, efx, defPct, prev };
  }
  const bondYield = () => S.cb * .7 + debtPct() * .015 + 1;
  return { init, step, bondYield };
})();

// ============================================================
// NEWSPAPER
// ============================================================
const Paper = (() => {
  const short = () => S.country.replace(/^Republic of /, '');
  const paperName = () => (S.paper = S.paper || pick(COUNTRY.id === 'mv' ? ['The Raajje Herald', 'Dhivehi Raajje Daily', 'The Maalé Tribune'] : [`The ${short()} Herald`, `${short()} Daily News`, `The ${short()} Tribune`, `The ${short()} Times`]));
  const annual = g => ((1 + g / 100) ** 2 - 1) * 100;
  function chg(now, before, d = 1, suffix = '', lowerIsGood = false) { const c = now - before; return `<em class="${(c >= 0) !== lowerIsGood ? 'up' : 'down'}">${c >= 0 ? '▲' : '▼'} ${Math.abs(c).toFixed(d)}${suffix}</em>`; }
  function show(r, a0, a1, w) {
    const g = annual(r.growth), opened = r.msgs.filter(m => m.startsWith('✅'));
    let head, sub;
    if (g < 0) { head = `ECONOMY SHRINKS ${fmt(-g, 1)}%`; sub = `Output falls as ${w.ev ? 'global headwinds and ' : ''}weak demand weigh on business.`; }
    else if (w.prev && S.infl - w.prev.infl > 1) { head = `PRICES SURGE: INFLATION HITS ${fmt(S.infl, 1)}%`; sub = 'Families feel the squeeze as the cost of living climbs.'; }
    else if (opened.length) { head = opened[0].replace('✅ ', '').replace(/[!]/g, '').toUpperCase(); sub = `${ROLE.title} ${S.player.name} cuts the ribbon as the economy grows ${fmt(g, 1)}% (annual rate).`; }
    else if (Math.abs(a1 - a0) >= 3) { head = `${ROLE.title.toUpperCase()}'S APPROVAL ${a1 > a0 ? 'CLIMBS' : 'SLUMPS'} TO ${fmt(a1)}%`; sub = 'New poll shows voters are taking note.'; }
    else { head = `ECONOMY GROWS ${fmt(g, 1)}%`; sub = `Steady half-year for the ${ROLE.title.toLowerCase()} as unemployment stands at ${fmt(unemployment(), 1)}%.`; }
    const bc = budgetCalc(), defPct = -r.bal * 2 / S.gdp * 100;
    const lead = `The economy grew at an annual rate of <b>${fmt(g, 1)}%</b> in the last six months. Inflation is <b>${fmt(S.infl, 1)}%</b> against the central bank's ${fmt(S.inflTarget)}% target, and unemployment is <b>${fmt(unemployment(), 1)}%</b>.
      The government ran a ${defPct >= 0 ? 'deficit' : 'surplus'} of <b>${fmt(Math.abs(defPct), 1)}% of GDP</b> (${money(Math.abs(r.bal) * 2)} a year), taking public debt to <b>${fmt(debtPct())}% of GDP</b>.
      ${S.cb > w.prev.cb + .2 ? `The central bank raised its policy rate to <b>${fmt(S.cb, 2)}%</b>.` : S.cb < w.prev.cb - .2 ? `The central bank cut its policy rate to <b>${fmt(S.cb, 2)}%</b>.` : `The central bank held rates at <b>${fmt(S.cb, 2)}%</b>.`}`;
    const world = w.ev ? `<div class="p-sec"><div class="p-kicker">🌍 World</div><h3>${w.ev.head}</h3><p>${w.ev.body}</p>
      <p class="p-impact"><b>What it means for ${esc(short())}:</b> ${w.efx.note || ''} ${fxChipsWorld(w.efx)}</p>
      <div class="p-learn">📘 <b>Economics explained:</b> ${w.ev.learn}</div></div>` : `<div class="p-sec"><div class="p-kicker">🌍 World</div><p>A quiet half-year on world markets.</p></div>`;
    const markets = `<div class="p-box"><div class="p-kicker">📈 Markets</div><table>
      <tr><td>Stock index</td><td>${fmt(S.stock)}</td><td>${chg(S.stock / w.prev.stock * 100, 100, 1, '%')}</td></tr>
      <tr><td>${esc(econ().cur)} (index)</td><td>${fmt(S.fx, 1)}</td><td>${chg(S.fx, w.prev.fx, 1)}</td></tr>
      <tr><td>Inflation</td><td>${fmt(S.infl, 1)}%</td><td>${chg(S.infl, w.prev.infl, 1, '', true)}</td></tr>
      <tr><td>Central bank rate</td><td>${fmt(S.cb, 2)}%</td><td>${chg(S.cb, w.prev.cb, 2, '', true)}</td></tr>
      <tr><td>10-yr bond yield</td><td>${fmt(World.bondYield(), 2)}%</td><td></td></tr>
      <tr><td>Oil (US$/barrel)</td><td>$${fmt(S.oil)}</td><td></td></tr></table>
      <div class="p-small">Currency index starts at 100; lower = weaker ${esc(econ().cur)}. Rates are simulated from inflation.</div></div>`;
    const poll = `<div class="p-box"><div class="p-kicker">🗳️ Opinion poll</div>${GK.map(g2 => `<div class="p-poll"><span>${GROUPS[g2].icon} ${GROUPS[g2].name}</span><div class="bar"><div style="width:${S.ga[g2]}%;background:${approvalColor(S.ga[g2])}"></div></div><b>${fmt(S.ga[g2])}%</b></div>`).join('')}
      <div class="p-poll total"><span>Overall</span><b>${fmt(a0)}% → ${fmt(a1)}%</b></div></div>`;
    const brief = [...r.msgs, ...S.news.slice(0, 4).filter(n => !r.msgs.includes(n))].slice(0, 7);
    return new Promise(res => {
      const m = modal(`<div class="paper">
        <div class="p-mast"><div class="p-name">${esc(paperName())}</div><div class="p-date">${myFlag()} ${esc(S.country)} · ${turnLabel()} · ${yearNow()} edition</div></div>
        <div class="p-head">${esc(head)}</div><div class="p-sub">${esc(sub)}</div>
        <div class="p-cols">
          <div class="p-main"><p class="p-lead">${lead}</p>${world}
            ${brief.length ? `<div class="p-sec"><div class="p-kicker">🗞️ In brief</div><ul>${brief.map(b => `<li>${esc(b)}</li>`).join('')}</ul></div>` : ''}
            <div class="p-sec p-edit"><div class="p-kicker">✍️ Editorial</div><p>${advisorTip().replace('🧑‍💼 Advisor: ', '')}</p></div></div>
          <div class="p-side">${markets}${poll}</div>
        </div>
        <div class="center"><button class="btn primary big" id="p-ok">Continue</button></div></div>`, 'paper-card');
      m.querySelector('.modal-card').scrollTop = 0;
      $('#p-ok', m).onclick = () => { closeModal(); res(); };
    });
  }
  function fxChipsWorld(e) {
    const c = [];
    if (e.gdp) c.push(`<span class="chip ${e.gdp > 0 ? 'up' : 'down'}">GDP ${sign(e.gdp)}%</span>`);
    if (e.infl) c.push(`<span class="chip ${e.infl < 0 ? 'up' : 'down'}">inflation ${sign(e.infl)} pts</span>`);
    if (e.cost) c.push(`<span class="chip ${e.cost < 0 ? 'up' : 'down'}">budget ${e.cost < 0 ? '+' : '−'}${money(Math.abs(e.cost))}</span>`);
    if (e.fx) c.push(`<span class="chip ${e.fx > 0 ? 'up' : 'down'}">currency ${sign(e.fx)}%</span>`);
    if (e.rate) c.push(`<span class="chip ${e.rate < 0 ? 'up' : 'down'}">borrowing costs ${e.rate > 0 ? '▲' : '▼'}</span>`);
    return c.join(' ');
  }
  return { show };
})();

// ============================================================
// CABINET
// ============================================================
const MINISTRIES = [
  { id: 'finance', title: 'Minister of Finance', icon: '💰' },
  { id: 'economy', title: 'Minister of Economy & Trade', icon: '📈' },
  { id: 'labour', title: 'Minister of Labour & Social Protection', icon: '🔧' },
  { id: 'health', title: 'Minister of Health', icon: '🏥' },
  { id: 'education', title: 'Minister of Education', icon: '📚' },
  { id: 'infra', title: 'Minister of Construction & Infrastructure', icon: '🏗️' },
  { id: 'housing', title: 'Minister of Housing', icon: '🏘️' },
  { id: 'energy', title: 'Minister of Energy & Environment', icon: '⚡' },
  { id: 'interior', title: 'Minister of Interior', icon: '🚓' },
  { id: 'defense', title: 'Minister of Defence', icon: '🛡️' },
  { id: 'foreign', title: 'Minister of Foreign Affairs', icon: '🌐' },
  { id: 'tourism', title: 'Minister of Tourism', icon: '🏝️', only: ['mv'] },
];
const MIN_TITLES = {
  // Maldives: ministries as restructured by the President's Office in April 2026
  mv: { finance: 'Minister of Finance and Public Enterprises', economy: 'Minister of Economic Development, Transport and Trade', labour: 'State Minister for Labour (Homeland Security, Labour & Technology)',
    health: 'Minister of Health, Family and Welfare', education: 'Minister of Education, Higher Education and Skills Development', infra: 'Minister of Infrastructure, Housing and Urban Development',
    housing: 'State Minister for Housing (Infrastructure, Housing & Urban Development)', energy: 'Minister of Climate Change, Environment and Energy', interior: 'Minister of Homeland Security, Labour and Technology',
    defense: 'Minister of Defence', foreign: 'Minister of Foreign Affairs', tourism: 'Minister of Tourism and Civil Aviation' },
  us: { finance: 'Secretary of the Treasury', economy: 'Secretary of Commerce', labour: 'Secretary of Labor', health: 'Secretary of Health & Human Services', education: 'Secretary of Education', infra: 'Secretary of Transportation', housing: 'Secretary of Housing & Urban Development', energy: 'Secretary of Energy', interior: 'Secretary of Homeland Security', defense: 'Secretary of Defense', foreign: 'Secretary of State' },
  uk: { finance: 'Chancellor of the Exchequer', economy: 'Business & Trade Secretary', labour: 'Work & Pensions Secretary', health: 'Health Secretary', education: 'Education Secretary', infra: 'Transport Secretary', housing: 'Housing Secretary', energy: 'Energy Secretary', interior: 'Home Secretary', defense: 'Defence Secretary', foreign: 'Foreign Secretary' },
  de: { finance: 'Federal Minister of Finance', economy: 'Federal Minister for Economic Affairs', labour: 'Federal Minister of Labour', health: 'Federal Minister of Health', education: 'Federal Minister of Education', infra: 'Federal Minister of Transport', housing: 'Federal Minister for Housing', energy: 'Federal Minister for the Environment', interior: 'Federal Minister of the Interior', defense: 'Federal Minister of Defence', foreign: 'Federal Foreign Minister' },
};
const Cabinet = (() => {
  const titleFor = id => (MIN_TITLES[COUNTRY.id] && MIN_TITLES[COUNTRY.id][id]) || MINISTRIES.find(m => m.id === id).title;
  const mins = () => MINISTRIES.filter(m => !m.only || m.only.includes(COUNTRY.id));
  function ensure() {
    if (S.cabinet) { mins().filter(m => !S.cabinet.some(c => c.id === m.id)).forEach(m => { const g = Math.random() < .45 ? 'f' : 'm'; S.cabinet.push({ id: m.id, name: personName(g), gender: g, look: randomLook(), party: S.player.party, skill: 60 }); }); return; }
    S.cabinet = mins().map(m => { const gender = Math.random() < .45 ? 'f' : 'm', look = randomLook(); if (gender === 'f') look.style = pick(['long', 'curly', 'side']); return { id: m.id, name: personName(gender), gender, look, party: S.player.party, skill: Math.round(rnd(60, 92)) }; });
  }
  function get(id) { ensure(); const m = S.cabinet.find(x => x.id === id); return m ? { ...m, title: titleFor(id), icon: MINISTRIES.find(x => x.id === id).icon } : null; }
  function giveTo(pid) {
    ensure();
    const pref = { prog: 'labour', cons: 'interior', green: 'energy', lib: 'economy' }[pid] || 'economy';
    const m = S.cabinet.find(x => x.id === pref); if (!m || m.party === pid) return;
    m.party = pid; m.gender = Math.random() < .45 ? 'f' : 'm'; m.name = personName(m.gender); m.look = randomLook();
    news(`Coalition deal: ${partyById(pid).name}'s ${m.name} becomes ${titleFor(pref)}`);
  }
  const lowestRegion = () => [...REGIONS].sort((a, b) => regionApproval(a) - regionApproval(b))[0];
  const tenderAct = (type, label) => { const r = REGIONS.find(x => !buildBlock(type, x.id)) ; return r ? { label: `${label} (${r.short})`, fn: () => { UI.region = r.id; return { tender: type }; } } : null; };
  function briefings() {
    const bc = budgetCalc(), defPct = -bc.bal * 2 / S.gdp * 100, debt = debtPct(), intShare = bc.interest / bc.rev * 100;
    const out = [];
    const B = S.budget;
    // FINANCE
    {
      const st = debt > (S.debtSoft || 80) + 15 || defPct > 5 ? 'red' : defPct > 3 ? 'amber' : 'green';
      const acts = st !== 'green' ? [{ label: 'Raise tax rate +2 pts', fn: () => { B.tax = Math.min(50, B.tax + 2); } }, { label: 'Trim infrastructure upkeep −1', fn: () => { B.infra = Math.max(0, B.infra - 1); } }]
        : defPct < 0 ? [{ label: 'Invest surplus: education +1', fn: () => { B.education = Math.min(10, B.education + 1); } }] : [];
      if (Money.peg() && Money.cover() < 2.5) { acts.unshift({ label: 'Review dollar reserves & financing 🏦', fn: () => ({ tab: 'money' }) }); }
      out.push({ id: 'finance', st: Money.peg() && Money.cover() < 1.5 ? 'red' : st, text: `The budget is projected to run a ${defPct >= 0 ? 'deficit' : 'surplus'} of <b>${fmt(Math.abs(defPct), 1)}% of GDP</b> (${money(Math.abs(bc.bal) * 2)} a year). Public debt is <b>${fmt(debt)}% of GDP</b> and interest payments take <b>${fmt(intShare)}%</b> of tax revenue. ${st === 'red' ? 'Markets will demand higher yields if we do not act. I recommend a credible consolidation plan: a modest tax rise and spending restraint, while protecting health and education.' : st === 'amber' ? 'The deficit is above the 3% of GDP that many fiscal rules use as a ceiling. We should tighten gradually.' : 'Public finances are sound. We have room for growth-enhancing investment.'}${Money.brief()}`,
        learn: 'A deficit adds to debt every year. Many fiscal rules (for example the EU\'s) cap deficits at 3% of GDP and debt at 60%. What matters most is whether debt is stable relative to GDP — growth helps, high interest rates hurt.', acts });
    }
    // ECONOMY
    {
      const g = ((1 + (S.lastGrowth || 0) / 100) ** 2 - 1) * 100, u = unemployment();
      const st = g < 0 || u > 11 ? 'red' : g < 2 || u > 8 ? 'amber' : 'green';
      const acts = [];
      if (!S.laws.includes('techhub')) acts.push({ label: 'Draft Tech Innovation Zones bill', fn: () => ({ law: 'techhub' }) });
      const t = tenderAct('factory', 'Tender an industrial park'); if (t && u > 8) acts.push(t);
      if (B.tax > 30) acts.push({ label: 'Cut tax rate −1 pt', fn: () => { B.tax -= 1; } });
      out.push({ id: 'economy', st, text: `Growth is running at <b>${fmt(g, 1)}%</b> a year, unemployment is <b>${fmt(u, 1)}%</b> and inflation <b>${fmt(S.infl || 0, 1)}%</b>. ${st === 'green' ? 'The economy is healthy; we should focus on productivity — skills, technology and infrastructure.' : 'Investment is weak. Special economic zones, better roads and a stable tax regime would attract investors.'} ${S.cb > 10 ? `High interest rates (${fmt(S.cb, 1)}%) are making business loans expensive.` : ''}`,
        learn: 'Okun\'s law: when an economy grows faster than its potential, unemployment falls. Long-run growth comes from more capital, more skilled workers and better technology (productivity).', acts });
    }
    // LABOUR
    {
      const w = S.ga.workers, st = w < 40 ? 'red' : w < 55 ? 'amber' : 'green';
      const acts = [];
      if (!S.laws.includes('minwage') && w < 55) acts.push({ label: 'Draft Minimum Wage bill', fn: () => ({ law: 'minwage' }) });
      if (B.welfare < 8 && w < 55) acts.push({ label: 'Welfare budget +1', fn: () => { B.welfare += 1; } });
      out.push({ id: 'labour', st, text: `Workers' approval is <b>${fmt(w)}%</b>. ${(S.infl || 0) > (S.inflTarget || 3) + 2 ? `With inflation at ${fmt(S.infl, 1)}%, real wages are falling — that is the main complaint I hear from unions.` : 'Wages are keeping up with prices.'} ${S.ga.elderly < 45 ? 'Pensioners are also struggling.' : ''}`,
        learn: 'Real wages = wages adjusted for inflation. If pay rises 5% but prices rise 8%, workers are 3% poorer. A minimum wage protects low earners but if set too high can reduce hiring.', acts });
    }
    // HEALTH
    {
      const h = S.stats.health, st = h < 40 ? 'red' : h < 55 ? 'amber' : 'green';
      const acts = [];
      if (h < 60 && B.health < 9) acts.push({ label: 'Health budget +1', fn: () => { B.health += 1; } });
      const t = tenderAct('hospital', 'Tender a new hospital'); if (t && h < 60) acts.push(t);
      if (!S.laws.includes('uhc') && h < 55) acts.push({ label: 'Draft Universal Health Coverage bill', fn: () => ({ law: 'uhc' }) });
      out.push({ id: 'health', st, text: `The national health index is <b>${fmt(h)}</b>. ${st === 'green' ? 'Hospitals are coping well. Prevention — vaccination, screening, clean air — gives the best return now.' : 'Waiting lists are growing and rural clinics are short of doctors. Primary care is the most cost-effective place to invest.'}`,
        learn: 'The WHO recommends universal health coverage: everyone gets essential care without financial hardship. Primary care (local clinics, family doctors) prevents expensive hospital stays.', acts });
    }
    // EDUCATION
    {
      const e = S.stats.education, st = e < 40 ? 'red' : e < 55 ? 'amber' : 'green';
      const acts = [];
      if (e < 62 && B.education < 9) acts.push({ label: 'Education budget +1', fn: () => { B.education += 1; } });
      const t = tenderAct('school', 'Tender a new school'); if (t && e < 60) acts.push(t);
      out.push({ id: 'education', st, text: `The education index is <b>${fmt(e)}</b>. ${st === 'green' ? 'Results are improving. Teacher training and digital skills should be our next priority.' : 'Classes are overcrowded and teacher pay is low. Every year of schooling raises a person\'s lifetime earnings.'}`,
        learn: 'Economists estimate each extra year of schooling raises earnings by roughly 8–10% on average worldwide. Early-years and teacher quality have the biggest impact.', acts });
    }
    // INFRASTRUCTURE
    {
      const late = S.projects.filter(p => p.delays), st = late.length > 1 ? 'red' : late.length ? 'amber' : 'green';
      const acts = [];
      const t = tenderAct('highway', 'Tender a highway'); if (t && !S.projects.length) acts.push(t);
      if (B.infra < 6) acts.push({ label: 'Infrastructure upkeep +1', fn: () => { B.infra += 1; } });
      out.push({ id: 'infra', st, text: `${S.projects.length} project${S.projects.length === 1 ? '' : 's'} under construction${late.length ? `, <b>${late.length} delayed</b> (${late.map(p => comp(p.company).name).join(', ')})` : ', all on schedule'}. ${late.length ? 'I recommend we use restricted tenders and weight technical quality more heavily — the cheapest bid often costs more in the end.' : 'Our contractors are performing. Transport links between regions are the best way to spread growth.'}`,
        learn: 'Large public works worldwide often run over budget. Good practice: independent cost estimates, competitive tenders, performance guarantees and penalties for delay (liquidated damages).', acts });
    }
    // HOUSING
    {
      const hs = S.stats.housing, stock = RK.reduce((a, r) => a + S.housing.stock[r], 0), st = hs < 40 ? 'red' : hs < 52 ? 'amber' : 'green';
      const acts = [];
      if (hs < 55) { const t = tenderAct('housing', 'Tender a housing estate'); if (t) acts.push(t); }
      if (stock > 3000 && S.housing.price !== 'affordable') acts.push({ label: 'Switch to affordable prices', fn: () => { S.housing.price = 'affordable'; } });
      if (stock > 0 && debtPct() > (S.debtSoft || 80) && S.housing.price === 'affordable') acts.push({ label: 'Sell at market price', fn: () => { S.housing.price = 'market'; } });
      out.push({ id: 'housing', st, text: `Housing index <b>${fmt(hs)}</b>; <b>${stock.toLocaleString()}</b> state-built homes unsold; ${S.housing.sold.toLocaleString()} sold so far at "${HOUSE_PRICES[S.housing.price].name}". ${st === 'green' ? 'Supply is keeping up with population growth.' : 'Young families cannot afford to buy. We need more supply, especially affordable homes near jobs.'}`,
        learn: 'Housing affordability is often measured as house price ÷ annual household income. Above about 5 is considered severely unaffordable. The lasting fix is more supply.', acts });
    }
    // ENERGY
    {
      const en = energy(), env = S.stats.environment, st = en.demand > en.supply ? 'red' : en.supply - en.demand < 6 || env < 40 ? 'amber' : 'green';
      const acts = [];
      const t = tenderAct('solar', 'Tender a solar & wind farm'); if (t && st !== 'green') acts.push(t);
      if (!S.laws.includes('renew') && env < 55) acts.push({ label: 'Draft Renewable Energy bill', fn: () => ({ law: 'renew' }) });
      out.push({ id: 'energy', st, text: `Power supply <b>${fmt(en.supply)}</b> vs demand <b>${fmt(en.demand)}</b> (demand grows with GDP). Environment index <b>${fmt(env)}</b>. ${en.demand > en.supply ? 'We are having blackouts — this is costing us growth. New capacity is urgent.' : 'Supply is adequate. New capacity should be clean: solar and wind are now the cheapest new power in most countries.'}`,
        learn: 'Electricity demand rises with economic growth. Building a power plant takes years, so planners keep a reserve margin above peak demand.', acts });
    }
    // INTERIOR
    {
      const sec = S.stats.security, st = sec < 40 ? 'red' : sec < 52 ? 'amber' : 'green';
      const acts = sec < 55 && B.security < 8 ? [{ label: 'Police budget +1', fn: () => { B.security += 1; } }] : [];
      out.push({ id: 'interior', st, text: `Security index <b>${fmt(sec)}</b>, civil freedoms <b>${fmt(S.stats.freedom)}</b>. ${st === 'green' ? 'Crime is under control. Community policing keeps public trust high.' : 'Crime is rising in cities. More officers on patrol and youth programmes both work.'}`,
        learn: 'Research shows the certainty of being caught deters crime more than the severity of punishment.', acts });
    }
    // DEFENCE
    {
      const s = milStrength(), st = S.threat > s + 10 ? 'red' : S.threat > s ? 'amber' : 'green';
      const acts = st !== 'green' ? [{ label: `Strengthen army (${money(MIL_UPGRADES.army.cost)})`, fn: () => { upgradeMil('army'); } }] : [];
      out.push({ id: 'defense', st, text: `Our defence strength is <b>${fmt(s)}</b> against an estimated threat of <b>${fmt(S.threat)}</b>. ${st === 'green' ? 'Deterrence is credible.' : 'We are falling behind. Modern equipment ages quickly — regular investment is cheaper than catching up.'}`,
        learn: 'NATO members aim to spend at least 2% of GDP on defence. Deterrence works when potential aggressors believe an attack would fail or cost too much.', acts });
    }
    // TOURISM (Maldives)
    if (COUNTRY.id === 'mv') {
      const fin = Money.ensure(), e = S.stats.economy, env = S.stats.environment, st = e < 45 || env < 40 ? 'amber' : 'green';
      const acts = [{ label: 'Review tourism taxes (T-GST, Green Tax) 🏦', fn: () => ({ tab: 'money' }) }];
      const t = tenderAct('airport', 'Tender a regional airport'); if (t) acts.push(t);
      out.push({ id: 'tourism', st, text: `Tourism earns most of our dollars. Resorts charge <b>${fin.tgst}% T-GST</b> and a <b>$${fin.green}</b> nightly Green Tax. ${env < 45 ? 'Reef damage and beach erosion are starting to put visitors off — protecting the environment protects tourism.' : 'Arrivals are strong; guesthouse tourism on local islands is spreading the income to the atolls.'} More flights to regional airports bring tourists — and dollars — to the outer atolls.`,
        learn: 'Tourism is the largest industry in the Maldives and its main source of foreign currency. Taxes paid in dollars (T-GST, Green Tax, land rent, airport fees) help the MMA keep the rufiyaa peg.', acts });
    }
    // FOREIGN
    {
      const st = S.threat > milStrength() ? 'amber' : 'green';
      const acts = [];
      if (S.pc >= 2 && !S.diploThisTurn && S.threat > 25) acts.push({ label: 'Hold a peace summit (⭐2)', fn: () => { diplomacy(); } });
      if (!S.mil.alliance && S.pc >= 4 && st !== 'green') acts.push({ label: 'Join defence alliance (⭐4)', fn: () => { toggleAlliance(); } });
      out.push({ id: 'foreign', st, text: `${S.lastWorld ? `On the world stage: <i>${esc(S.lastWorld)}</i>. ` : ''}Relations with the ${NEIGHBOR} are ${S.threat > 50 ? 'tense' : 'stable'}. ${COUNTRY.landlocked ? 'As a landlocked country, good relations with transit neighbours are vital for our trade routes.' : 'Trade agreements open markets for our exporters.'}`,
        learn: 'Diplomacy is the cheapest form of security. Trade links raise the cost of conflict for everyone involved.', acts });
    }
    return out;
  }
  const RANK = { red: 3, amber: 2, green: 1 };
  async function meeting() {
    ensure();
    if (UI.busy || S.pendingEvent) return;
    UI.busy = true;
    try {
      const done = S.cabinetDone && S.cabinetDone.turn === S.turn ? S.cabinetDone.ids : [];
      S.cabinetDone = { turn: S.turn, ids: done };
      let follow = null;
      await new Promise(res => {
        const draw = () => {
          const list = briefings().sort((a, b) => RANK[b.st] - RANK[a.st]);
          const seats = S.cabinet.map((c, i) => { const a = Math.PI * (.08 + .84 * i / (S.cabinet.length - 1)); return { x: 300 - Math.cos(a) * 250, y: 92 - Math.sin(a) * 58, c }; });
          const table = `<svg viewBox="0 0 600 150" class="cab-table"><ellipse cx="300" cy="104" rx="236" ry="40" fill="#5b3a1e"/><ellipse cx="300" cy="100" rx="228" ry="35" fill="#7c4a24"/>
            ${seats.map(s2 => `<g transform="translate(${s2.x - 14},${s2.y - 20}) scale(.24)">${avatarInner(s2.c.look, 0)}</g>`).join('')}
            <g transform="translate(286,110) scale(.26)">${avatarInner(S.player.look, 1)}</g><text x="300" y="148" class="cab-you">You</text></svg>`;
          const m = modal(`<div class="scene-title">🏛️ Cabinet meeting · ${turnLabel()}</div><canvas id="cab-cv" class="scene-cv cab-cv"></canvas><p class="m-body small">${S.cabinet.length} ministers present. Most urgent briefings first — hover a card to hear that minister. Each minister's advice can be adopted once per half-year.</p>
            <div class="cab-list">${list.map(b => { const mi = get(b.id); return `<div class="cab ${b.st}"><div class="cab-h">${avatarSVG(mi.look, b.st === 'red' ? -1 : b.st === 'green' ? 1 : 0, 46)}<div><b>${mi.icon} ${esc(mi.name)}</b><small>${esc(mi.title)}${mi.party !== S.player.party ? ` · <span style="color:${partyById(mi.party).color}">${partyById(mi.party).name}</span>` : ''}</small></div><span class="dot ${b.st}"></span></div>
              <p>${b.text}</p><details><summary>📘 Why it matters</summary><p>${b.learn}</p></details>
              <div class="cab-acts">${done.includes(b.id) ? '<span class="good small">✓ Advice adopted</span>' : b.acts.map((a, j) => `<button class="btn small" data-b="${b.id}" data-j="${j}">${a.label}</button>`).join('') || '<span class="muted small">No action needed.</span>'}</div></div>`; }).join('')}</div>
            <div class="center"><button class="btn primary big" id="cab-x">End meeting</button></div>`, 'cab-card');
          let speaker = list[0] && list[0].id, spoke = 0;
          const lineOf = id => { const b2 = list.find(x => x.id === id); return b2 ? b2.text.replace(/<[^>]+>/g, '').split('. ')[0] + '.' : ''; };
          Scenes.modal.attach($('#cab-cv', m), 'cabinet', { ministers: S.cabinet, speaker: () => speaker, line: () => lineOf(speaker) }, 260);
          const cyc = setInterval(() => { if (!m.isConnected || !$('#cab-cv')) return clearInterval(cyc); spoke = (spoke + 1) % Math.min(5, list.length); speaker = list[spoke].id; }, 4500);
          m.querySelectorAll('.cab').forEach((el, i) => el.onmouseenter = () => { speaker = list[i].id; });
          m.querySelectorAll('[data-b]').forEach(btn => btn.onclick = () => {
            const b = list.find(x => x.id === btn.dataset.b), a = b.acts[+btn.dataset.j];
            const r = a.fn(); done.push(b.id);
            (S.agenda = S.agenda || []).push({ turn: S.turn, min: b.id, label: a.label.replace(/\s*\(.*\)$/, ''), law: r && r.law, tender: r && r.tender, base: r && r.tender ? count(r.tender) : undefined });
            news(`Cabinet adopts ${get(b.id).title.toLowerCase()}'s proposal: ${a.label.replace(/\(.*\)/, '').trim()}`);
            toast(`Adopted: ${a.label}`, 'good'); save();
            if (r && (r.law || r.tender || r.tab)) { follow = r; closeModal(); res(); return; }
            draw();
          });
          $('#cab-x', m).onclick = () => { closeModal(); res(); };
        };
        draw();
      });
      render();
      UI.busy = false;
      if (follow && follow.tab) { UI.tab = follow.tab; render(); }
      if (follow && follow.law) { UI.tab = 'laws'; render(); await Legis.run(follow.law); }
      if (follow && follow.tender) await Procure.run(follow.tender);
    } finally { UI.busy = false; }
  }
  return { ensure, get, giveTo, meeting, titleFor };
})();

// ============================================================
// PUBLIC PROCUREMENT
// ============================================================
const Procure = (() => {
  const STEPS = ['Procedure', 'Tender notice', 'Bid opening', 'Evaluation', 'Award', 'Contract'];
  const W = { price: 40, tech: 30, exp: 15, time: 15 };
  async function run(type) {
    const rid = UI.region, r = reg(rid), P = PROJECTS[type];
    if (UI.busy || S.pendingEvent || buildBlock(type, rid)) return;
    UI.busy = true;
    try {
      const mi = Cabinet.get('infra'), ministry = mi ? mi.title.replace(/^(Minister|Secretary) (of|for) /, 'Ministry of ').replace(/ Secretary$/, ' Department') : 'Ministry of Construction';
      const est = P.cost, ref = `${COUNTRY.id.toUpperCase()}-${yearNow()}-${type.slice(0, 3).toUpperCase()}-${String(Math.floor(rnd(100, 999)))}`;
      // 1. procedure
      const proc = await docModal(`${stepsBar(STEPS, 0)}<h2>${P.icon} ${P.name} — ${r.name}</h2>
        <p class="m-body">Engineer's cost estimate <b>${money(est)}</b> · planned duration ${P.turns} half-year${P.turns > 1 ? 's' : ''}. ${mi ? `<b>${esc(mi.name)}</b> (${esc(mi.title)}) asks which procurement method to use.` : ''}</p>
        <div class="proc-grid">
          <div class="proc"><b>🌐 Open competitive tender</b><p>Advertised publicly; any qualified firm may bid. The most competition and usually the best value for money — the standard method in most procurement laws and World Bank rules.</p></div>
          <div class="proc"><b>🔒 Restricted tender</b><p>Only firms that passed pre-qualification (experience, finances, equipment) are invited. Fewer bids, higher quality, slightly higher prices. Used for complex works.</p></div>
          <div class="proc"><b>⚡ Direct contracting</b><p>Single source, no competition. Only justified in genuine emergencies. About half a year faster but typically ~15% more expensive — auditors may investigate.</p></div>
        </div>
        ${edu('Public procurement is how governments buy works, goods and services. In OECD countries it is around 12–13% of GDP, so open, competitive and transparent tenders are one of the strongest tools against waste and corruption.')}`,
        [{ id: 'open', label: '🌐 Open tender', primary: true }, { id: 'restricted', label: '🔒 Restricted tender' }, { id: 'direct', label: '⚡ Direct contracting' }, { id: 'x', label: 'Cancel' }]);
      if (proc === 'x') return;
      if (proc === 'direct') return direct(type, rid, est, ref);
      // 2. tender notice
      const deadline = `${30 + Math.floor(rnd(0, 15))} days`;
      const ok = await docModal(`${stepsBar(STEPS, 1)}<div class="doc">
        <div class="doc-top">${myFlag()} ${esc(ministry.toUpperCase())}</div>
        <div class="doc-title">INVITATION FOR BIDS</div><div class="doc-ref">Ref. No. ${ref} · ${proc === 'open' ? 'Open National & International Competitive Bidding' : 'Restricted Tender — pre-qualified bidders only'}</div>
        <ol>
          <li><b>Project:</b> ${P.name} in ${esc(r.name)} (${esc(r.city[2])}).</li>
          <li><b>Scope:</b> design, construction and commissioning; ${P.desc.toLowerCase()}.</li>
          <li><b>Engineer's estimate:</b> ${money(est)} (bids above 120% may be rejected).</li>
          <li><b>Completion period:</b> ${P.turns * 6} months from the commencement order.</li>
          <li><b>Eligibility:</b> registered firms with similar completed contracts in the last 5 years, audited accounts, no unresolved debarment.</li>
          <li><b>Bid security:</b> 2% of the bid price as a bank guarantee.</li>
          <li><b>Evaluation:</b> best value — Price ${W.price}%, Technical proposal ${W.tech}%, Experience & track record ${W.exp}%, Completion time ${W.time}%. Integrity checks are pass/fail.</li>
          <li><b>Deadline:</b> sealed bids within ${deadline}; bids will be opened in public immediately after the deadline.</li>
        </ol></div>`, [{ id: 'go', label: '📢 Publish tender', primary: true }, { id: 'x', label: 'Cancel' }]);
      if (ok === 'x') return;
      // 3. bids
      const pool = COMPANIES.filter(c => proc === 'open' ? true : c.quality >= 65);
      const spec = shuffle(pool.filter(c => c.spec !== 'all' && c.spec.includes(type)));
      const gen = shuffle(pool.filter(c => c.spec === 'all' || !c.spec.includes(type)));
      const bidders = [...spec.slice(0, 2), ...gen].slice(0, proc === 'open' ? 4 : 3);
      const bids = bidders.map(c => {
        const q = clamp(c.quality + (S.companies[c.id] - 50) * .3 + rnd(-5, 5) + (c.spec !== 'all' && c.spec.includes(type) ? 6 : 0));
        const price = Math.round(est * c.price * rnd(.9, 1.1) * (proc === 'restricted' ? 1.05 : 1) * 10) / 10;
        const turns = Math.max(1, P.turns + (c.speed >= 70 ? -1 : c.speed < 50 ? 1 : 0));
        const docs = c.shady ? Math.random() < .6 : Math.random() < .95;
        return { c, q, price, turns, docs };
      });
      await docModal(`${stepsBar(STEPS, 2)}<h2>📬 Public bid opening</h2>
        <p class="m-body">Sealed envelopes are opened in front of bidders' representatives and an independent observer. Prices are read aloud and recorded in the minutes.</p>
        <table class="bidtable"><tr><th>Bidder</th><th>Bid price</th><th>vs estimate</th><th>Completion</th><th>Bid security</th><th>Documents</th></tr>
        ${bids.map(b => `<tr><td>${b.c.icon} ${b.c.name} <span class="tag-c ${b.c.tag.toLowerCase()}">${b.c.tag}</span></td><td><b>${money(b.price)}</b></td><td class="${b.price > est * 1.05 ? 'bad' : b.price < est * .85 ? 'warn' : 'good'}">${sign((b.price / est - 1) * 100, 0)}%</td><td>${b.turns * 6} months</td><td class="good">✓</td><td class="${b.docs ? 'good' : 'bad'}">${b.docs ? '✓ complete' : '✗ incomplete'}</td></tr>`).join('')}</table>
        ${edu('Public bid opening prevents prices from being changed after the deadline. Bids that are far below the estimate ("abnormally low tenders") are checked carefully — they often lead to delays or claims for extra money later.')}`,
        [{ id: 'go', label: '📋 Send to evaluation committee', primary: true }]);
      // 4. evaluation
      const board = [
        { role: 'Chair (Deputy Minister)', g: 'm' }, { role: 'Civil engineer — technical', g: 'f' }, { role: 'Financial analyst', g: 'm' },
        { role: 'Legal & compliance officer', g: 'f' }, { role: 'Independent observer (anti-corruption)', g: Math.random() < .5 ? 'f' : 'm' },
      ].map(b => ({ ...b, name: personName(b.g) }));
      bids.forEach(b => {
        b.flags = [];
        if (b.c.shady) b.flags.push('Beneficial owners not disclosed; director linked to a past bid-rigging case');
        if (!b.docs) b.flags.push('Missing mandatory documents');
        if (b.q < 45) b.flags.push('Technical proposal below the minimum threshold');
        b.alt = b.price < est * .82;
        b.ok = !b.flags.length;
      });
      const okBids = bids.filter(b => b.ok).length ? bids.filter(b => b.ok) : bids;   // scores compare against responsive bids only
      const lowest = Math.min(...okBids.map(b => b.price)), fastest = Math.min(...okBids.map(b => b.turns));
      bids.forEach(b => {
        b.s = { price: W.price * lowest / b.price, tech: W.tech * b.q / 100, exp: W.exp * S.companies[b.c.id] / 100, time: W.time * fastest / b.turns };
        b.total = b.s.price + b.s.tech + b.s.exp + b.s.time;
      });
      const ranked = [...bids].sort((a, b) => (b.ok - a.ok) || (b.total - a.total));
      const rec = ranked.find(b => b.ok);
      const bestTech = [...bids].sort((a, b) => b.q - a.q)[0], cheapest = [...bids].sort((a, b) => a.price - b.price)[0];
      const comments = [
        `${board[1].name}: "${bestTech.c.name} submitted the strongest technical proposal — method statement, equipment and key staff are convincing."`,
        `${board[2].name}: "${cheapest.c.name} is the lowest price.${cheapest.alt ? ' It is more than 18% below the estimate — an abnormally low tender; we asked for a price breakdown.' : ''}"`,
        `${board[3].name}: "${bids.filter(b => !b.ok).length ? bids.filter(b => !b.ok).map(b => `${b.c.name} is disqualified (${b.flags[0].toLowerCase()})`).join('; ') : 'All bidders passed the integrity and eligibility checks'}."`,
        `${board[4].name}: "${bids.some(b => b.c.shady) ? 'I recommend the disqualification stands. Awarding to a firm with hidden owners would be a serious red flag.' : 'The process was transparent and followed the published criteria.'}"`,
      ];
      const pick2 = await docModal(`${stepsBar(STEPS, 3)}<h2>⚖️ Evaluation committee report</h2>
        <div class="board">${board.map(b => `<div class="bm"><b>${esc(b.name)}</b><small>${b.role}</small></div>`).join('')}</div>
        <table class="bidtable score"><tr><th>Bidder</th><th>Price /${W.price}</th><th>Technical /${W.tech}</th><th>Experience /${W.exp}</th><th>Time /${W.time}</th><th>Total /100</th><th>Status</th></tr>
        ${ranked.map(b => `<tr class="${b === rec ? 'win' : ''} ${b.ok ? '' : 'dq'}"><td>${b.c.icon} ${b.c.name}</td><td>${fmt(b.s.price, 1)}</td><td>${fmt(b.s.tech, 1)}</td><td>${fmt(b.s.exp, 1)}</td><td>${fmt(b.s.time, 1)}</td><td><b>${fmt(b.total, 1)}</b></td><td>${b.ok ? (b === rec ? '🏆 Recommended' : 'Responsive') : '❌ Disqualified'}</td></tr>`).join('')}</table>
        <div class="comments">${comments.map(c => `<p>💬 ${esc(c)}</p>`).join('')}</div>
        ${rec ? `<p class="m-body"><b>Recommendation:</b> award to <b>${rec.c.name}</b> as the most economically advantageous tender (${money(rec.price)}, ${rec.turns * 6} months).</p>` : '<p class="bad">No responsive bid. The tender must be cancelled.</p>'}
        ${edu('Price score = 40 × (lowest price ÷ this price). The other criteria are scored the same way. "Most economically advantageous tender" means best overall value — not simply the cheapest.')}`,
        [...(rec ? [{ id: 'rec', label: `✅ Approve: award to ${rec.c.name}`, primary: true }] : []),
         ...ranked.filter(b => b !== rec).map(b => ({ id: b.c.id, label: `Override → ${b.c.name}${b.c.shady ? ' 💰' : ''}`, danger: true, title: 'Overriding the committee is legal only with written justification and is often challenged' })),
         { id: 'x', label: 'Cancel tender' }]);
      if (pick2 === 'x') { news(`Tender ${ref} cancelled`); return; }
      const chosen = pick2 === 'rec' ? rec : bids.find(b => b.c.id === pick2);
      const override = pick2 !== 'rec';
      // 5. award & protest
      let protest = '';
      const second = ranked.find(b => b !== chosen && b.ok);
      if (second && (override || (rec && second.total > rec.total - 3)) && Math.random() < (override ? .7 : .3)) {
        const upheld = override && Math.random() < .6;
        protest = `<div class="protest ${upheld ? 'bad' : ''}"><b>⚠️ Bid protest:</b> ${second.c.name} filed a complaint with the Public Procurement Review Board during the 10-day standstill period. ${upheld ? `<b>Complaint upheld</b> — the board found the award did not follow the published criteria. The contract goes to ${rec ? rec.c.name : second.c.name} and the press calls it a scandal.` : '<b>Complaint dismissed</b> — the board found the evaluation followed the rules.'}</div>`;
        if (upheld) { GK.forEach(g => S.ga[g] = clamp(S.ga[g] - 2)); news(`Review board overturns ${P.name.toLowerCase()} contract award`); return finish(rec || second, true, protest); }
      }
      if (override) {
        S.scandalRisk += chosen.c.shady ? 1.5 : .7; S.companies[rec ? rec.c.id : chosen.c.id] = clamp(S.companies[rec ? rec.c.id : chosen.c.id] - 3);
        if (chosen.c.shady) S.pc += 2;
        news(`Government overrides tender committee on ${P.name.toLowerCase()} contract`);
      }
      return finish(chosen, override, protest);

      async function finish(b, flagged, prot) {
        // 6. contract
        const adv = b.price * .15;
        await docModal(`${stepsBar(STEPS, 5)}<div class="doc"><div class="doc-top">${myFlag()} ${esc(ministry.toUpperCase())}</div>
          <div class="doc-title">CONTRACT AGREEMENT</div><div class="doc-ref">Contract No. ${ref}/C · ${P.name}, ${esc(r.name)}</div>
          ${prot}
          <ol>
            <li><b>Parties:</b> the ${esc(ministry)} ("the Employer") and <b>${b.c.name}</b> ("the Contractor").</li>
            <li><b>Contract price:</b> ${money(b.price)}, fixed price, paid against certified progress milestones.</li>
            <li><b>Advance payment:</b> 15% (${money(adv)}) against an advance-payment guarantee.</li>
            <li><b>Performance guarantee:</b> 10% of the contract price, valid until completion.</li>
            <li><b>Time for completion:</b> ${b.turns * 6} months. <b>Liquidated damages</b> for delay: 0.1% of the price per day, capped at 10%.</li>
            <li><b>Retention:</b> 5% of each payment, released after the 12-month defects-liability period.</li>
            <li><b>Variations</b> above 10% of the price require ministry approval; disputes go to adjudication, then arbitration.</li>
          </ol>
          <div class="sign"><span>For the Employer<br><i>${esc(mi ? mi.name : S.player.name)}</i></span><span>For the Contractor<br><i>${esc(personName('m'))}, CEO</i></span></div></div>
          ${edu('Most public works contracts follow standard forms such as FIDIC, used worldwide. Guarantees and liquidated damages protect taxpayers if the contractor fails to deliver.')}`,
          [{ id: 'sign', label: '✍️ Sign contract', primary: true }]);
        createProject(type, rid, b, ref, flagged);
      }
    } finally { UI.busy = false; }
  }
  async function direct(type, rid, est, ref) {
    const P = PROJECTS[type];
    const choices = COMPANIES.map(c => ({ t: `${c.icon} ${c.name} <span class="tag-c ${c.tag.toLowerCase()}">${c.tag}</span>`, note: `quote ≈ ${money(est * c.price * 1.15)} · reputation ${fmt(S.companies[c.id])}` }));
    choices.push({ t: 'Cancel', note: '' });
    const k = await choiceModal({ icon: '⚡', title: 'Direct contracting', text: 'Choose a firm to negotiate with. No competition means no price discipline — expect a premium, and auditors will review the justification.', choices });
    if (k >= COMPANIES.length) return;
    const c = COMPANIES[k];
    const b = { c, q: clamp(c.quality + (S.companies[c.id] - 50) * .3), price: Math.round(est * c.price * 1.15 * 10) / 10, turns: Math.max(1, PROJECTS[type].turns - 1) };
    S.scandalRisk += c.shady ? 1.5 : .5; if (c.shady) S.pc += 2;
    news(`Audit Chamber questions single-source ${P.name.toLowerCase()} contract with ${c.name}`);
    createProject(type, rid, b, ref, true);
  }
  function createProject(type, rid, b, ref, flagged) {
    const P = PROJECTS[type], r = reg(rid);
    S.debt += b.price * .15;
    S.projects.push({ uid: Date.now() + Math.random(), type, region: rid, company: b.c.id, turnsLeft: b.turns, total: b.turns, q: b.q, price: b.price, delays: 0, paid: .15, ref });
    if (b.c.tag === 'Foreign') { S.eventMods.business += 1; S.eventMods.workers -= 1.5; }
    if (b.c.tag === 'State') S.eventMods.workers += 1;
    news(`${b.c.name} signs ${money(b.price)} contract for ${P.name} in ${r.name}`);
    say(`Construction of the ${P.name.toLowerCase()} in ${r.short} begins!`);
    toast(`Contract signed with ${b.c.name}`, flagged ? '' : 'good');
    UI.busy = false;
    save(); render(); City.visit('site'); scrollToCity();
  }
  return { run };
})();

// ============================================================
// LEGISLATION
// ============================================================
const LEGAL = {
  minwage: { committee: 'Committee on Labour and Social Affairs', ministry: 'labour', title: 'National Minimum Wage (Amendment) Bill',
    long: 'A Bill to increase the national minimum wage by twenty per cent, to provide for its annual review, and for connected purposes.',
    clauses: ['The hourly rate of the national minimum wage shall be increased by twenty per cent with effect from the commencement date.', 'The Minister shall, after consulting an independent Low Pay Commission, review the rate each year having regard to inflation and productivity.', 'An employer who fails to pay the minimum wage shall be liable to a civil penalty of up to two hundred per cent of the arrears owed.'],
    amend: 'Phase the increase in over two years and exempt micro-enterprises with fewer than five employees for the first year.',
    wit: [['Federation of Trade Unions', 1, 'A fair wage lifts working families out of poverty and boosts spending in local economies.'], ['Chamber of Commerce and Industry', -1, 'A sudden 20% rise will force small firms to cut hours or jobs. We ask for a gradual approach.']] },
  corptax: { committee: 'Committee on Budget and Finance', ministry: 'finance', title: 'Corporate Income Tax (Rate Reduction) Bill',
    long: 'A Bill to reduce the rate of corporate income tax in order to promote investment, and for connected purposes.',
    clauses: ['The main rate of corporate income tax shall be reduced by five percentage points for tax periods beginning on or after the commencement date.', 'Companies claiming the reduced rate shall comply with country-by-country reporting to prevent profit shifting.'],
    amend: 'Make the cut conditional on reinvesting at least half of the savings in the country, with a review after three years.',
    wit: [['Foreign Investors Council', 1, 'A competitive tax rate is one of the first things investors compare between countries.'], ['Tax Justice Coalition', -1, 'Revenue lost here must be made up by ordinary taxpayers or by cuts to public services.']] },
  farmsub: { committee: 'Committee on Agriculture and Food Security', ministry: 'economy', title: 'Agricultural Support Bill',
    long: 'A Bill to establish a programme of direct income support for farmers and investment in water-saving irrigation, and for connected purposes.',
    clauses: ['A registered farmer shall be entitled to an annual direct payment per hectare of cultivated land, subject to environmental conditions.', 'Not less than thirty per cent of the programme budget shall be allocated to modern water-saving irrigation.'],
    amend: 'Cap payments per farm so that large agro-holdings do not receive most of the money.',
    wit: [['Farmers\' Council', 1, 'Input costs have doubled; without support many family farms will close.'], ['Institute for Fiscal Studies', -1, 'Untargeted subsidies tend to flow to the largest landowners and distort markets.']] },
  freeuni: { committee: 'Committee on Education, Science and Youth', ministry: 'education', title: 'Higher Education (Tuition Fees Abolition) Bill',
    long: 'A Bill to abolish tuition fees at state higher education institutions, to establish need-based maintenance grants, and for connected purposes.',
    clauses: ['No tuition fee shall be charged to a citizen enrolled in a first degree at a state higher education institution.', 'The State shall compensate institutions through a per-student funding formula linked to graduate outcomes.'],
    amend: 'Introduce free tuition first for students from low-income families and in priority fields such as engineering, medicine and teaching.',
    wit: [['National Students\' Union', 1, 'Talent is equally distributed; opportunity is not. Free tuition changes that.'], ['Association of Universities', 0, 'We support access, but funding per student must not fall or quality will suffer.']] },
  pensions: { committee: 'Committee on Labour and Social Affairs', ministry: 'labour', title: 'State Pensions (Uprating) Bill',
    long: 'A Bill to increase the basic state pension and to index it annually to the higher of inflation or average earnings growth.',
    clauses: ['The basic state pension shall be increased by twelve per cent.', 'Thereafter it shall be uprated each year by the higher of consumer price inflation or average earnings growth.'],
    amend: 'Index pensions to inflation only, which costs less in the long run.',
    wit: [['Pensioners\' Association', 1, 'Our members cannot afford heating and medicine.'], ['Society of Actuaries', -1, 'An ageing population makes this commitment very expensive over the coming decades.']] },
  uhc: { committee: 'Committee on Health', ministry: 'health', title: 'Universal Health Coverage Bill',
    long: 'A Bill to establish a National Health Insurance Fund guaranteeing a basic package of health services to every resident, and for connected purposes.',
    clauses: ['There is established a National Health Insurance Fund financed by contributions and general taxation.', 'Every resident shall be entitled to a guaranteed package of primary care, emergency care, maternal care and essential medicines free at the point of use.', 'The Fund shall purchase services from public and accredited private providers.'],
    amend: 'Roll out in two phases: primary care and essential medicines first, hospital care later.',
    wit: [['Medical Association', 1, 'Universal coverage, as recommended by the WHO, protects families from catastrophic health costs.'], ['Private Clinics Association', -1, 'The tariffs proposed are too low for private providers to take part.']] },
  carbon: { committee: 'Committee on Environment and Climate', ministry: 'energy', title: 'Carbon Pricing Bill',
    long: 'A Bill to introduce a tax on greenhouse-gas emissions from fossil fuels and large industrial installations, and for connected purposes.',
    clauses: ['A carbon tax shall be levied per tonne of carbon-dioxide equivalent emitted, starting at a moderate rate and rising each year.', 'Not less than one third of the revenue shall be returned to low-income households as a climate dividend.'],
    amend: 'Start at a lower rate and give heavy industry a three-year transition period.',
    wit: [['Climate Scientists Network', 1, 'Putting a price on carbon is the most cost-effective way to cut emissions.'], ['Union of Industrialists', -1, 'Our exporters will lose ground to countries without a carbon price.']] },
  rail: { committee: 'Committee on Transport and Infrastructure', ministry: 'infra', title: 'High-Speed Rail Network Bill',
    long: 'A Bill to authorise the construction of a national high-speed railway linking the main regional cities, and for connected purposes.',
    clauses: ['The Minister may acquire land and award construction contracts for the railway described in Schedule 1.', 'All contracts shall be awarded by open international competitive tender and audited annually.'],
    amend: 'Build in phases, starting with the busiest corridor to the capital.',
    wit: [['Institute of Railway Engineers', 1, 'Rail moves people and freight with a fraction of the emissions of roads and flights.'], ['Audit Chamber', -1, 'Mega-projects worldwide often overrun their budgets; strict oversight is essential.']] },
  police: { committee: 'Committee on Defence, Security and Justice', ministry: 'interior', title: 'Public Safety and Policing Powers Bill',
    long: 'A Bill to expand police powers, increase sentences for violent offences, and for connected purposes.',
    clauses: ['A police officer may stop and search a person on reasonable suspicion of carrying a weapon.', 'The minimum sentence for robbery with violence shall be increased to five years.'],
    amend: 'Add independent oversight of police complaints and body-worn cameras for all patrol officers.',
    wit: [['Police Federation', 1, 'Officers need clear powers to protect the public.'], ['Bar Association', -1, 'Longer sentences alone rarely cut crime; the certainty of being caught matters more.']] },
  press: { committee: 'Committee on Human Rights and Media', ministry: 'interior', title: 'Freedom of Information and Media Bill',
    long: 'A Bill to guarantee public access to government information and to protect journalists and their sources, and for connected purposes.',
    clauses: ['Every person has the right to request information held by a public authority, which shall respond within twenty working days.', 'A journalist shall not be compelled to disclose a confidential source except by order of a court.'],
    amend: 'Exempt national security matters and ongoing criminal investigations.',
    wit: [['Union of Journalists', 1, 'Open information is the foundation of accountable government.'], ['Government Legal Service', 0, 'We support the principle but need time and staff to process requests.']] },
  anticorrupt: { committee: 'Committee on Legal Affairs and Anti-Corruption', ministry: 'interior', title: 'Anti-Corruption Agency Bill',
    long: 'A Bill to establish an independent Anti-Corruption Agency with powers to investigate public officials, to require declarations of assets, and for connected purposes.',
    clauses: ['There is established an independent Anti-Corruption Agency accountable to Parliament.', 'Every senior public official shall publish an annual declaration of assets and interests.', 'A person who reports corruption in good faith shall be protected from dismissal or retaliation.'],
    amend: 'Require the Agency head to be appointed by a two-thirds vote of Parliament to guarantee independence.',
    wit: [['Transparency watchdog', 1, 'Independent agencies with real powers are what make anti-corruption laws work.'], ['Civil Service Association', 0, 'Asset declarations must protect officials\' privacy and family safety.']] },
  renew: { committee: 'Committee on Energy and Natural Resources', ministry: 'energy', title: 'Renewable Energy Development Bill',
    long: 'A Bill to promote investment in solar and wind power through competitive auctions and guaranteed grid access, and for connected purposes.',
    clauses: ['The Minister shall hold annual competitive auctions for long-term renewable power purchase agreements.', 'Grid operators shall connect renewable generators within twelve months of application.'],
    amend: 'Require battery storage with new large solar plants to keep the grid stable.',
    wit: [['Renewable Energy Association', 1, 'Solar and wind are now the cheapest new sources of electricity in most of the world.'], ['National Grid Operator', 0, 'We need investment in transmission lines and storage to absorb variable power.']] },
  austerity: { committee: 'Committee on Budget and Finance', ministry: 'finance', title: 'Fiscal Consolidation Bill',
    long: 'A Bill to reduce the budget deficit through expenditure restraint and the phasing out of inefficient subsidies.',
    clauses: ['Total primary expenditure shall not grow faster than nominal GDP for the next three fiscal years.', 'Energy subsidies shall be phased out over three years, with targeted compensation for the poorest households.'],
    amend: 'Protect the health and education budgets from the cuts.',
    wit: [['Central Bank Governor', 1, 'A credible fiscal path lowers inflation expectations and borrowing costs.'], ['Federation of Trade Unions', -1, 'Cuts during a slowdown risk deepening it and hurt the most vulnerable.']] },
  techhub: { committee: 'Committee on Economy and Innovation', ministry: 'economy', title: 'Technology Parks and Innovation Bill',
    long: 'A Bill to establish special technology zones with tax incentives for innovative companies, and for connected purposes.',
    clauses: ['Companies registered in a Technology Zone shall be exempt from corporate income tax for ten years, provided at least eighty per cent of income comes from software and IT services.', 'Foreign specialists employed in a Zone shall receive simplified work visas.'],
    amend: 'Require every resident company to train local graduates.',
    wit: [['IT Industry Association', 1, 'Similar parks in other countries have created tens of thousands of jobs and exports.'], ['Economists\' Society', 0, 'Tax holidays work best alongside good universities and fast internet.']] },
  tariffs: { committee: 'Committee on Economy and Trade', ministry: 'economy', title: 'Customs Tariff (Amendment) Bill',
    long: 'A Bill to raise import duties on selected manufactured and agricultural goods in order to protect domestic producers.',
    clauses: ['Import duties on the goods listed in Schedule 2 shall be increased to twenty per cent ad valorem.', 'The duties shall expire after three years unless renewed by Parliament.'],
    amend: 'Exclude machinery and raw materials used by local factories.',
    wit: [['Manufacturers\' Union', 1, 'Our factories cannot compete with heavily subsidised imports.'], ['Consumer Rights Society', -1, 'Tariffs are a tax paid by consumers through higher prices.']] },
};
const Legis = (() => {
  const STEPS = ['Drafting', 'First reading', 'Committee', 'Debate', 'Vote', 'Upper house', 'Enactment'];
  const stepsFor = () => econ().upper ? STEPS : STEPS.filter(s2 => s2 !== 'Upper house');
  async function run(id) {
    const L = LAWS.find(l => l.id === id), D = LEGAL[id];
    if (!L || !D || UI.busy || S.laws.includes(id) || S.lawThisTurn || S.pc < L.pc || S.pendingEvent) return;
    UI.busy = true;
    const ST = stepsFor(), at = n => ST.indexOf(n);
    try {
      const mi = Cabinet.get(D.ministry);
      const no = `${yearNow()}/${String(S.laws.length + 1 + Math.floor(rnd(10, 90)))}`;
      const yearCost = L.cost * S.gdp / 100 * 2;
      const best = Object.entries(L.g).sort((a, b) => b[1] - a[1])[0], worst = Object.entries(L.g).sort((a, b) => a[1] - b[1])[0];
      const chamber = COUNTRY.parl || 'Parliament';
      // 1. Draft
      const go = await docModal(`${stepsBar(ST, 0)}<div class="doc bill">
        <div class="doc-top">${myFlag()} ${esc(chamber.toUpperCase())}</div>
        <div class="doc-title">${D.title.toUpperCase()}</div><div class="doc-ref">Bill No. ${no} · Government Bill · Presented by ${mi ? `${esc(mi.name)}, ${esc(mi.title)}` : `the ${ROLE.title}`}</div>
        <p class="long"><i>${D.long}</i></p>
        <p class="enact">BE IT ENACTED by the ${esc(chamber)} of ${esc(S.country)} as follows:</p>
        <div class="sec"><b>1. Short title and commencement.</b> This Act may be cited as the ${D.title.replace(' Bill', ' Act')} ${yearNow()} and comes into force six months after it is signed.</div>
        ${D.clauses.map((c, i) => `<div class="sec"><b>${i + 2}.</b> ${c}</div>`).join('')}
        <div class="sec"><b>${D.clauses.length + 2}. Regulations.</b> The ${mi ? esc(mi.title) : 'Minister'} may make regulations to give effect to this Act.</div>
        <div class="memo"><div class="memo-h">EXPLANATORY MEMORANDUM</div>
          <p><b>Purpose:</b> ${L.desc}</p>
          <p><b>Financial impact:</b> ${yearCost > 0 ? `estimated cost <b>${money(yearCost)}</b> per year` : yearCost < 0 ? `estimated additional revenue <b>${money(-yearCost)}</b> per year` : 'no significant direct cost to the budget'}.</p>
          <p><b>Expected effects:</b> ${fxChips({ g: L.g, s: L.s }, 'gov')}</p>
          <p><b>Political capital required:</b> ⭐${L.pc} · <b>Expected support:</b> ~${expectedYes(L)} of ${S.parl.size || 100} votes (${majority()} needed)</p></div></div>
        ${edu('A bill is a proposed law. It is written in precise legal language so courts can apply it; the explanatory memorandum explains it in plain words and estimates the cost to taxpayers.')}`,
        [{ id: 'go', label: `📜 Introduce bill (⭐${L.pc})`, primary: true }, { id: 'x', label: 'Withdraw draft' }]);
      if (go === 'x') return;
      S.pc -= L.pc; S.lawThisTurn = true;
      news(`${D.title} introduced in the ${chamber}`);
      // 2. First reading
      await docModal(`${stepsBar(ST, 1)}<h2>📖 First reading</h2>
        <p class="m-body">The Clerk reads the short title of the <b>${D.title}</b>. There is no debate at first reading. The bill is printed, published, and referred to the <b>${D.committee}</b> for detailed scrutiny.</p>
        ${edu('First reading is a formality that makes the bill public. Most real scrutiny happens in committee, where members examine each clause and hear from experts.')}`, [{ id: 'go', label: 'Continue →', primary: true }]);
      // 3. Committee
      const shares = PARTIES.map(p => [p.id, (S.parl.seats[p.id] || 0) / (S.parl.size || 100) * 9]);
      const cseats = {}; let t = 0; shares.forEach(([pid, v]) => { cseats[pid] = Math.floor(v); t += cseats[pid]; });
      shares.sort((a, b) => (b[1] % 1) - (a[1] % 1)).forEach(([pid]) => { if (t < 9) { cseats[pid]++; t++; } });
      const members = []; PARTIES.forEach(p => { for (let i = 0; i < cseats[p.id]; i++) members.push({ party: p.id, yes: Math.random() < voteProb(L, p.id) }); });
      const cyes = members.filter(m => m.yes).length;
      const baseEY = expectedYes(L), amendEY = Math.round(expectedVotes(L, { amend: true }));
      const choice = await docModal(`${stepsBar(ST, 2)}<h2>🏛️ ${D.committee}</h2>
        <div class="committee">${members.map(m => `<span class="cm" style="--pc:${partyById(m.party).color}" title="${partyById(m.party).name}">${m.yes ? '👍' : '👎'}</span>`).join('')}<small class="muted">9 members in proportion to party seats · ${cyes} in favour</small></div>
        <h3>Expert evidence</h3>
        ${D.wit.map(w => `<div class="wit ${w[1] > 0 ? 'pro' : w[1] < 0 ? 'con' : 'neu'}"><b>${w[0]}</b> ${w[1] > 0 ? '(supports)' : w[1] < 0 ? '(opposes)' : '(neutral)'}<p>“${w[2]}”</p></div>`).join('')}
        <div class="wit neu"><b>${mi ? esc(mi.name) + ', ' + esc(mi.title) : 'Sponsoring minister'}</b> (government)<p>“${best ? `This bill will help ${GROUPS[best[0]].name.toLowerCase()}` : 'This bill serves the national interest'}. The costs are affordable and fully reflected in the budget.”</p></div>
        <div class="memo"><div class="memo-h">COMMITTEE REPORT</div>
          <p>The Committee ${cyes >= 5 ? 'recommends that the bill proceed' : 'is divided on the bill'} and proposes the following <b>amendment</b>:</p>
          <p class="amend">“${D.amend}”</p>
          <p>If accepted: about <b>${amendEY}</b> expected votes (now ~${baseEY}); the law's effects and costs will be about 30% smaller.</p></div>
        ${edu('Amendments are how bills are improved and how compromises are built. Accepting an opposition amendment can win votes — at the price of a weaker law.')}`,
        [{ id: 'accept', label: '✅ Accept amendment', primary: true }, { id: 'reject', label: '✖ Keep original text' }]);
      const amend = choice === 'accept';
      // 4. Debate
      const me = S.player.party, oppP = [...PARTIES].filter(p => p.id !== me && S.parl.seats[p.id]).sort((a, b) => lean(L, a.id) - lean(L, b.id));
      const speakers = [{ p: me, pro: true }, { p: oppP[0].id, pro: lean(L, oppP[0].id) > .1 }, { p: oppP[oppP.length - 1].id, pro: lean(L, oppP[oppP.length - 1].id) > -.1 }];
      const speech = s2 => s2.pro
        ? `Speaker, this bill will ${best ? `help ${GROUPS[best[0]].name.toLowerCase()}` : 'serve our country'}${Object.keys(L.s).length ? ` and improve ${STATS[Object.keys(L.s)[0]].name.toLowerCase()}` : ''}. ${pick(['Our constituents have waited long enough.', 'I urge the House to support it.', 'It is the right thing to do.'])}`
        : `Speaker, this bill ${yearCost > 0 ? `will cost taxpayers ${money(yearCost)} a year` : 'is poorly drafted'}${worst && worst[1] < 0 ? ` and will hurt ${GROUPS[worst[0]].name.toLowerCase()}` : ''}. ${pick(['The government has not done its homework.', 'We will vote against it.', 'There are better ways to achieve this.'])}`;
      const lobbyOk = S.pc >= 1;
      const deb = await docModal(`${stepsBar(ST, 3)}<h2>🗣️ Second reading debate</h2>
        <p class="m-body">The ${esc(chamber)} debates the general principles of the bill${amend ? ' as amended in committee' : ''}.</p>
        ${speakers.map(s2 => `<div class="mp" style="--pc:${partyById(s2.p).color}"><b>${esc(personName(Math.random() < .5 ? 'f' : 'm'))}</b> <small>${partyById(s2.p).name}</small><p>“${speech(s2)}”</p></div>`).join('')}
        <p class="m-body">Expected votes: <b>~${Math.round(expectedVotes(L, { amend }))}</b> of ${S.parl.size || 100} · ${majority()} needed.</p>
        ${edu('Party whips make sure members vote with their party. Governments also negotiate with independent or wavering members — openly, through concessions in their regions.')}`,
        [{ id: 'lobby', label: '🤝 Whip & negotiate with waverers (⭐1)', disabled: !lobbyOk }, { id: 'vote', label: '🗳️ Proceed to the vote', primary: true }]);
      const lobby = deb === 'lobby';
      if (lobby) S.pc -= 1;
      // 5. Vote
      const seats = castVotes(pid => Math.min(.98, voteProb(L, pid) + adj(L, pid, { amend, lobby })));
      const passed = await voteModal(`${chamber}: ${D.title}`, seats, majority(), 'BILL PASSED ✓', 'Bill defeated ✗');
      PARTIES.forEach(p => { if (p.id !== me) S.parl.rel[p.id] = clamp(S.parl.rel[p.id] + lean(L, p.id) * 8 + (amend && lean(L, p.id) < 0 ? 3 : 0)); });
      if (!passed) { news(`${D.title} defeated in the ${chamber}`); say('We\'ll try again next time.'); save(); render(); return; }
      // 6. Upper house
      const up = econ().upper;
      if (up) {
        const pYes = clamp(.55 + approval() / 400 + (amend ? .1 : 0) + rnd(-.08, .08), .2, .95);
        const ok = up.revise ? true : Math.random() < Math.min(.95, pYes + .25);
        const yes = up.seats ? Math.round(up.seats * (ok ? Math.max(.51, pYes) : Math.min(.49, pYes))) : 0;
        await docModal(`${stepsBar(ST, at('Upper house'))}<h2>🏛️ ${up.name}</h2>
          <p class="m-body">${up.revise ? `The ${up.name} scrutinises the bill and proposes minor drafting amendments, which the ${chamber} accepts. Under the Parliament Acts the elected chamber has the final say.` : ok ? `The ${up.name} approves the bill by <b>${yes}</b> votes out of ${up.seats}.` : `The ${up.name} <b>rejects</b> the bill (${yes} of ${up.seats} in favour). The bill falls.`}</p>
          ${edu(`Most countries have two chambers. The upper house (${up.name}) reviews laws passed by the lower house — a "second look" that can catch mistakes or represent the regions.`)}`, [{ id: 'go', label: 'Continue →', primary: true }]);
        if (!ok) { news(`${up.name} rejects the ${D.title}`); save(); render(); return; }
      }
      // 7. Enactment
      await docModal(`${stepsBar(ST, ST.length - 1)}<div class="doc bill enacted"><div class="doc-top">${myFlag()} OFFICIAL GAZETTE OF ${esc(S.country.toUpperCase())}</div>
        <div class="doc-title">${D.title.replace(' Bill', ' Act').toUpperCase()} ${yearNow()}</div>
        <p class="m-body">The bill has been ${econ().assent || 'signed by the President and published in the official gazette.'}</p>
        <div class="seal">⚜️ ENACTED</div></div>`, [{ id: 'go', label: '🖋️ Done', primary: true }]);
      applyLawPassed(L, amend ? .7 : 1);
      UI.view = 'office'; save(); render(); officeEvent('signing', { title: D.title.replace(' Bill', ' Act').toUpperCase() });
    } finally { UI.busy = false; }
  }
  function adj(L, pid, o) { let a = 0; if (o.amend && lean(L, pid) < .1 && pid !== S.player.party) a += .15; if (o.lobby && pid !== S.player.party) a += .07; return a; }
  function expectedVotes(L, o) { return PARTIES.reduce((s2, p) => s2 + (S.parl.seats[p.id] || 0) * Math.min(.98, voteProb(L, p.id) + adj(L, p.id, o)), 0); }
  return { run };
})();
