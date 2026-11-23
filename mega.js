/* ============================================================
   MEGAPROJECTS — nuclear plants, high-speed railways, sea bridges…
   The president launches a flagship project and follows it
   through the real stages:
     1. Feasibility study  2. Environmental & social impact (EIA)
     3. Financing          4. Tender & contract
     5. Construction, monitored half-year by half-year
   The dashboard shows what real project managers watch:
   progress against plan (S-curve), money spent against budget
   (earned value), safety, quality, a risk register and site
   inspections. Which projects exist depends on the country.
   Costs are game estimates in US dollars (rough real-world size).
   ============================================================ */

// cost multiplier: building is cheaper in some countries, dearer in others (labour, imports, regulation)
const MEGA_PRICE = { veloria: 1, uz: .8, kz: .85, tr: .8, in: .6, br: .8, mv: 1.25, us: 1.5, uk: 1.5, de: 1.3, fr: 1.2, jp: 1.3 };
const NOT_MV = ['veloria', 'uz', 'kz', 'tr', 'us', 'uk', 'de', 'fr', 'jp', 'in', 'br'];

const MEGA = [
  { id: 'nuclear', icon: '⚛️', name: 'Nuclear power plant (2 reactors)', usd: 18, turns: 10, site: 'coast',
    where: ['veloria', 'uz', 'kz', 'tr', 'us', 'uk', 'fr', 'jp', 'in', 'br'],
    why: 'About 2,400 MW of steady, low-carbon electricity for 60 years. Needs a strong nuclear regulator, cooling water and highly trained staff.',
    gain: { energy: 55, s: { environment: 4, economy: 3 }, g: { business: 4 }, gdp: 1.2, growth: .15 },
    risks: ['regulator', 'safety', 'supply', 'overrun', 'protest', 'claim'],
    protest: 'People living near the site fear an accident and say no one asked them.',
    lesson: 'Nuclear plants are among the hardest projects on Earth. Most have finished years late and far over budget. Countries that build them well keep one design, one experienced builder and a tough, independent safety regulator.' },
  { id: 'hsr', icon: '🚄', name: 'High-speed railway (500 km)', usd: 25, turns: 8, site: 'capital',
    where: ['veloria', 'uz', 'kz', 'tr', 'us', 'uk', 'de', 'fr', 'jp', 'in', 'br'],
    why: 'Trains at 300 km/h link the biggest cities in about two hours. Cuts flights and car traffic and brings towns along the line closer to jobs.',
    gain: { s: { economy: 4, environment: 3 }, g: { business: 4, youth: 3 }, gdp: 1, growth: .12 },
    risks: ['land', 'ground', 'overrun', 'supply', 'protest', 'claim'],
    protest: 'Families whose land is taken for the line say the compensation is too low.',
    lesson: 'Railways are mostly a land and tunnels problem. Buying land early, fairly and transparently is the best way to avoid years of delay.' },
  { id: 'metro', icon: '🚇', name: 'Capital city metro line (30 km)', usd: 6, turns: 6, site: 'capital',
    where: NOT_MV,
    why: 'An underground line that moves about 40,000 people an hour, cuts traffic jams and air pollution in the capital.',
    gain: { s: { economy: 2, environment: 3, health: 1 }, g: { workers: 4, youth: 3 }, gdp: .5, growth: .06 },
    risks: ['ground', 'safety', 'overrun', 'claim', 'protest'],
    protest: 'Shopkeepers say years of street works are killing their business.',
    lesson: 'Underground works are full of surprises: old pipes, water and soft soil. Good ground surveys before the tender save money later.' },
  { id: 'dam', icon: '🏞️', name: 'Hydropower dam and reservoir', usd: 7, turns: 8, site: 'high',
    where: ['veloria', 'uz', 'kz', 'tr', 'in', 'br', 'jp'],
    why: 'Clean electricity, water storage for farms and flood control. But villages are flooded and rivers change downstream.',
    gain: { energy: 30, s: { environment: 1, economy: 2 }, g: { farmers: 3 }, gdp: .6, growth: .06 },
    risks: ['land', 'ground', 'protest', 'overrun', 'weather'],
    protest: 'Villagers who must leave their homes for the reservoir block the access road.',
    lesson: 'Dams move people. Fair resettlement — new homes, land and jobs before the water rises — decides whether a dam is remembered as progress or injustice.' },
  { id: 'wind', icon: '🌬️', name: 'Offshore wind farm (1,500 MW)', usd: 6, turns: 6, site: 'coast',
    where: ['veloria', 'tr', 'us', 'uk', 'de', 'fr', 'jp', 'in', 'br'],
    why: 'Turbines at sea make clean power with no fuel bill. Output varies with the wind, so the grid also needs storage or backup.',
    gain: { energy: 25, s: { environment: 6, economy: 1 }, g: { youth: 4 }, gdp: .4, growth: .05 },
    risks: ['weather', 'supply', 'overrun', 'claim'],
    protest: 'Fishers say the turbines will close their fishing grounds.',
    lesson: 'Renewable projects are cheap to run but expensive to build, so the interest rate on the loan matters more than the price of the turbines.' },
  { id: 'newcity', icon: '🏙️', name: 'New planned city', usd: 25, turns: 10, site: 'farm',
    where: ['veloria', 'uz', 'tr', 'in', 'kz'],
    why: 'Homes, offices and services for half a million people, designed from scratch. Takes pressure off the crowded capital — if people and companies actually move.',
    gain: { s: { housing: 8, economy: 3 }, g: { youth: 4, business: 4 }, gdp: 1, growth: .1, homes: 3 },
    risks: ['land', 'overrun', 'corrupt', 'demand', 'claim'],
    protest: 'Farmers on the city site refuse to sell their land.',
    lesson: 'Planned cities succeed only if jobs move too. Many new cities stood half-empty for years because people would not leave the old capital.' },
  { id: 'irrig', icon: '💧', name: 'Water-saving irrigation network', usd: 3, turns: 5, site: 'farm',
    where: ['uz', 'kz', 'in', 'tr', 'br', 'veloria'],
    why: 'Lined canals and drip irrigation bring the same harvest with far less water — vital where rivers and seas are drying up.',
    gain: { s: { environment: 5, economy: 2 }, g: { farmers: 8 }, gdp: .4, growth: .04 },
    risks: ['land', 'corrupt', 'overrun', 'weather'],
    protest: 'Farmers downstream fear they will get less water.',
    lesson: 'Water projects need farmers on board: meters and canals fail if the people using them do not trust how the water is shared.' },
  // ---------------- Maldives ----------------
  { id: 'mv_bridge', icon: '🌉', name: 'Greater Malé sea bridge (Malé–Villimalé–Gulhifalhu–Thilafushi)', usd: .5, turns: 6, site: 'capital', where: ['mv'],
    why: 'A bridge and causeway linking Malé to the industrial islands, so workers, goods and waste no longer depend on ferries.',
    gain: { s: { economy: 3, housing: 2 }, g: { workers: 5, business: 4 }, gdp: .8, growth: .08 },
    risks: ['weather', 'ground', 'supply', 'overrun', 'claim'],
    protest: 'Villimalé residents fear traffic and noise on their quiet island.',
    lesson: 'Marine works depend on the weather: the southwest monsoon can stop barges and piling for weeks. Good schedules plan for it.' },
  { id: 'mv_reclaim', icon: '🏝️', name: 'Land reclamation & new island city (Hulhumalé-style)', usd: 1.5, turns: 8, site: 'capital', where: ['mv'],
    why: 'Pumping sand from the lagoon builds new land, higher above the sea, for tens of thousands of homes, schools and parks.',
    gain: { s: { housing: 9, economy: 2 }, g: { youth: 6, workers: 3 }, gdp: .8, growth: .08, homes: 3 },
    risks: ['reef', 'weather', 'overrun', 'corrupt', 'claim'],
    protest: 'Divers and young activists say dredging will kill the reef and lagoon.',
    lesson: 'Reclamation gives land and safety from rising seas, but destroys the reef where the sand is taken. An honest EIA weighs both.' },
  { id: 'mv_airport', icon: '🛫', name: 'New passenger terminal at Velana Airport', usd: 1, turns: 6, site: 'capital', where: ['mv'],
    why: 'A bigger terminal so more tourists can arrive — tourism brings most of the country\'s dollars.',
    gain: { s: { economy: 4 }, g: { business: 6, workers: 3 }, gdp: 1, growth: .1, reserves: 40 },
    risks: ['supply', 'overrun', 'claim', 'weather'],
    protest: 'Taxi and ferry operators fear losing business to new transport links.',
    lesson: 'Airports are paid back by passenger fees over decades. If tourist numbers fall, the debt stays.' },
  { id: 'mv_port', icon: '⚓', name: 'New commercial port at Gulhifalhu', usd: .4, turns: 6, site: 'capital', where: ['mv'],
    why: 'Moves the crowded Malé port to a bigger site, freeing Malé\'s waterfront and cutting import costs.',
    gain: { s: { economy: 3, housing: 1 }, g: { business: 5 }, gdp: .5, growth: .05 },
    risks: ['weather', 'ground', 'overrun', 'claim'],
    protest: 'Port workers worry about longer journeys to the new site.',
    lesson: 'Ports make everything a country imports cheaper or dearer. In an import-dependent country, a good port lowers the price of almost everything.' },
  { id: 'mv_seawall', icon: '🧱', name: 'Coastal protection for 30 islands', usd: .6, turns: 4, site: 'farm', where: ['mv'],
    why: 'Sea walls, revetments and beach nourishment protect homes from swell waves and rising seas.',
    gain: { s: { security: 4, environment: 2, housing: 2 }, g: { farmers: 8, elderly: 3 }, gdp: .2, growth: .02 },
    risks: ['weather', 'reef', 'supply', 'overrun'],
    protest: 'Some islanders want their natural beach, not a concrete wall.',
    lesson: 'Adapting to climate change is now part of the budget. Nature-based protection (healthy reefs and mangroves) can work alongside walls.' },
  { id: 'mv_solar', icon: '☀️', name: 'Solar and batteries on 100 islands', usd: .3, turns: 4, site: 'north', where: ['mv'],
    why: 'Most islands burn imported diesel for electricity. Solar with batteries cuts the fuel bill and saves scarce dollars.',
    gain: { energy: 12, s: { environment: 6, economy: 1 }, g: { farmers: 3, youth: 3 }, gdp: .3, growth: .03, reserves: 25 },
    risks: ['supply', 'weather', 'claim'],
    protest: 'The state power company\'s diesel crews fear for their jobs.',
    lesson: 'Every litre of diesel not imported keeps dollars in the country. For a small island state, energy policy is also currency policy.' },
  { id: 'mv_waste', icon: '♻️', name: 'Waste-to-energy plant at Thilafushi', usd: .2, turns: 4, site: 'capital', where: ['mv'],
    why: 'Burns Greater Malé\'s rubbish in a controlled plant that makes electricity, instead of open fires on Thilafushi.',
    gain: { energy: 6, s: { environment: 6, health: 3 }, g: { elderly: 2 }, gdp: .1, growth: .01 },
    risks: ['supply', 'overrun', 'safety'],
    protest: 'Residents of nearby islands worry about smoke from the chimney.',
    lesson: 'Waste plants need steady rubbish collection from every island; the boats and sorting matter as much as the plant.' },
];

// risks: likelihood is worked out from the project's state; mitigation reduces it
const MRISK = {
  regulator: { icon: '🧪', name: 'Safety regulator finds defects', mit: 'eng' },
  safety: { icon: '⛑️', name: 'Serious site accident', mit: 'eng' },
  supply: { icon: '📦', name: 'Equipment delivered late', mit: 'hedge' },
  overrun: { icon: '💸', name: 'Price of materials jumps', mit: 'hedge' },
  protest: { icon: '🪧', name: 'Local protest', mit: 'community' },
  claim: { icon: '📑', name: 'Contractor claims extra money', mit: 'eng' },
  land: { icon: '🗺️', name: 'Land purchase disputes', mit: 'community' },
  ground: { icon: '🪨', name: 'Unexpected ground conditions', mit: 'eng' },
  weather: { icon: '🌧️', name: 'Bad weather stops work', mit: 'hedge' },
  corrupt: { icon: '🕵️', name: 'Bribes and inflated invoices', mit: 'eng' },
  demand: { icon: '🏚️', name: 'Too few people move in', mit: 'community' },
  reef: { icon: '🪸', name: 'Reef and lagoon damage', mit: 'community' },
};
const MITIG = {
  eng: { icon: '👷', name: 'Independent supervision engineer', cost: .02, what: 'checks every invoice, weld and test; reports the true progress' },
  community: { icon: '🤝', name: 'Community fund & liaison office', cost: .015, what: 'fair compensation, local jobs and a place to complain' },
  hedge: { icon: '📄', name: 'Fixed-price supply contracts & insurance', cost: .02, what: 'locks in prices and insures against delays' },
};

const Mega = (() => {
  const st = () => { if (!S.mega) S.mega = { list: [] }; return S.mega; };
  const init = () => st();
  const avail = () => MEGA.filter(m => m.where.includes(COUNTRY.id));
  const M = id => MEGA.find(m => m.id === id);
  const P = uid => st().list.find(p => p.uid === uid);
  const active = () => st().list.filter(p => !['done', 'cancelled', 'shelved'].includes(p.phase));
  const base = m => m.usd * (MEGA_PRICE[COUNTRY.id] || 1) / (S.scale || 1);   // game units (GDP = 100)
  const usd = u => money(u);
  const pct = v => fmt(v * 100) + '%';
  const site = p => (reg(M(p.id).site) || REGIONS[0]);
  const plan = p => p.phase === 'build' ? Math.min(1, (S.turn - p.start) / p.turns) : 0;
  const alerts = () => active().reduce((n, p) => n + (p.alerts || []).length, 0);

  // ---------- 1. feasibility ----------
  async function start(id) {
    const m = M(id); if (!m) return;
    if (active().length >= 2) return toast('Two megaprojects are already running. Finish or cancel one first.', 'bad');
    if (st().list.some(p => p.id === id && p.phase !== 'cancelled' && p.phase !== 'shelved')) return toast('This project already exists.', 'bad');
    const fee = base(m) * .01;
    const k = await choiceModal({ icon: m.icon, title: `Start: ${m.name}?`, text: `<b>Step 1 — Feasibility study.</b> Engineers and economists check if the project makes sense: real cost, demand, best site, risks and the benefit–cost ratio. It takes one half-year and costs about <b>${usd(fee)}</b> (1% of the first estimate of ${usd(base(m))}).<br><br><i>Real lesson: skipping this step is the most common reason big projects fail.</i>`,
      choices: [{ t: 'Commission the feasibility study', note: `💰 ${usd(fee)} · ⏳ 1 half-year` }, { t: 'Not now', note: '' }] });
    if (k) return;
    const bias = rnd(.1, .55);   // optimism bias: early estimates are almost always too low
    st().list.push({ uid: id + '_' + S.turn + '_' + Math.floor(Math.random() * 999), id, phase: 'feas', t0: S.turn, est: base(m), bias, turns: m.turns,
      prog: 0, rep: 0, spent: 0, safety: 70, quality: 70, qKnown: false, mit: {}, alerts: [], hist: [], log: [`${turnLabel()}: feasibility study commissioned`], insp: 0 });
    S.debt += fee;
    news(`${ROLE.title} orders feasibility study for ${m.name}`);
    save(); render();
  }
  function feasReport(p) {
    const m = M(p.id), g = m.gain, cost = p.est * (1 + p.bias * .5);
    const v = (g.gdp + (g.growth || 0) * 10 + (g.energy || 0) * .02 + Object.values(g.s || {}).reduce((a, b) => a + b, 0) * .1) * 3;
    if (!p.noise) p.noise = rnd(-.15, .15);
    return { cost, bcr: clamp(.7 + v / (cost / S.gdp * 100 + 2) + p.noise, .6, 2.8) };
  }
  // ---------- 2–4. EIA, financing, tender ----------
  async function decide(uid) {
    const p = P(uid), m = M(p.id); if (!p) return;
    if (p.phase === 'feasDone') {
      const f = feasReport(p);
      const k = await choiceModal({ icon: '📋', title: 'Feasibility report', text: `<div class="mg-rep"><div><span>Updated cost estimate</span><b>${usd(f.cost)}</b><small>first guess was ${usd(p.est)}</small></div><div><span>Benefit–cost ratio</span><b class="${f.bcr >= 1.2 ? 'good' : f.bcr >= 1 ? 'warn' : 'bad'}">${fmt(f.bcr, 1)}</b><small>above 1 = benefits exceed costs</small></div><div><span>Build time</span><b>${p.turns / 2} years</b><small>if all goes to plan</small></div></div><p>${m.why}</p><p><b>Main risks:</b> ${m.risks.map(r => MRISK[r].icon + ' ' + MRISK[r].name).join(' · ')}</p><p><b>Step 2 — Environmental & social impact assessment (EIA).</b> Who and what will be affected, and how to reduce the harm?</p>`,
        choices: [
          { t: 'Full EIA with public hearings', note: '⏳ 1 half-year · fewer protests and court cases later' },
          { t: 'Fast-track the EIA', note: '⚡ start now · protests and legal challenges more likely' },
          { t: 'Shelve the project', note: 'the study is not wasted — it showed what we needed to know' }] });
      p.est = f.cost; p.bcr = f.bcr;
      if (k === 2) { p.phase = 'shelved'; p.log.push(`${turnLabel()}: shelved after feasibility`); news(`${m.name} shelved after feasibility study`); save(); render(); return; }
      if (k === 0) { p.phase = 'eia'; p.eia = 'full'; p.t1 = S.turn; p.log.push(`${turnLabel()}: full EIA and public hearings started`); news(`Public hearings begin on ${m.name}`); save(); render(); return; }
      p.eia = 'fast'; p.log.push(`${turnLabel()}: EIA fast-tracked`); S.stats.freedom = clamp(S.stats.freedom - 1); p.phase = 'fin';
    }
    if (p.phase === 'eiaDone') p.phase = 'fin';
    if (p.phase === 'fin') {
      const mv = COUNTRY.id === 'mv';
      const k = await choiceModal({ icon: '🏦', title: 'Step 3 — How will we pay?', text: `Total estimate: <b>${usd(p.est)}</b> (${fmt(p.est / S.gdp * 100, 1)}% of GDP). Big projects are rarely paid from one year's taxes — the question is <i>who lends, on what terms, and who carries the risk</i>.`,
        choices: [
          { t: mv ? 'Government budget + sukuk/bonds' : 'Government budget + bonds', note: 'paid as it is built · all the debt is ours · free to choose any contractor' },
          { t: 'Bilateral development loan from a partner country', note: '10% cheaper money and a grace period · but their companies get the contract' },
          { t: 'Public–private partnership (PPP)', note: 'private partner pays 60% now · the state pays it back with interest for years after it opens' }] });
      p.fin = ['budget', 'loan', 'ppp'][k]; if (p.fin === 'loan') S.rep = clamp((S.rep || 50) + 2);
      p.log.push(`${turnLabel()}: financing — ${['budget and bonds', 'bilateral development loan', 'public–private partnership'][k]}`);
      p.phase = 'tender';
    }
    if (p.phase === 'tender') {
      const bids = p.fin === 'loan'
        ? [{ n: 'Lender country\'s state contractor', price: .97, q: 70, sp: 1, local: 0 }]
        : [{ n: 'Experienced international consortium', price: 1.06, q: 85, sp: 1.02, local: 0 },
           { n: 'Lowest bidder (little experience at this size)', price: .82, q: 52, sp: .9, local: 0 },
           { n: COUNTRY.id === 'mv' ? 'Local contractor + foreign partner' : 'National state-owned builder', price: .96, q: 66, sp: .9, local: 1 }];
      const k = await choiceModal({ icon: '📑', title: 'Step 4 — Tender and contract', text: `${p.fin === 'loan' ? 'The loan agreement names the contractor, so there is only one bid.' : 'Three bids passed the technical check. Price is only one part — experience, method and the team decide whether it is finished on time.'}`,
        choices: bids.map(b => ({ t: b.n, note: `💰 ${usd(p.est * b.price)} · quality ${b.q}/100 · speed ${b.sp >= 1 ? 'on plan' : 'slower'}${b.local ? ' · more local jobs' : ''}` })) });
      const b = bids[k]; Object.assign(p, { con: b.n, budget: p.est * b.price, quality: b.q, sp: b.sp, local: b.local, phase: 'build', start: S.turn, hist: [{ t: 0, plan: 0, prog: 0, spent: 0 }] });
      p.true = p.budget * (1 + p.bias * .5);   // what it would REALLY cost if nothing is done about the risks
      const before = Impact.snap();
      if (m.gain.g) { S.ga.workers = clamp(S.ga.workers + 3 + b.local * 2); }
      S.stats.economy = clamp(S.stats.economy + 1);
      p.log.push(`${turnLabel()}: contract signed with ${b.n} for ${usd(p.budget)} — construction starts`);
      news(`Construction begins: ${m.name}`);
      save(); render();
      Impact.show(`Construction starts: ${m.name}`, before, { lesson: 'From now on the job is monitoring: compare progress and spending with the plan every month, inspect the site and act early on risks.' });
    }
  }
  // ---------- 5. construction, every half-year ----------
  function likelihood(p, r) {
    const mit = MRISK[r].mit && p.mit[MRISK[r].mit] ? .45 : 1, q = (100 - p.quality) / 100, s = (100 - p.safety) / 100;
    const L = { regulator: .15 + q * .5, safety: .05 + s * .5, supply: .2, overrun: .18 + p.bias * .3, protest: (p.eia === 'fast' ? .35 : .1), claim: .15 + q * .2,
      land: (p.eia === 'fast' ? .3 : .12), ground: .15, weather: COUNTRY.id === 'mv' ? .3 : .15, corrupt: S.laws.includes('anticorrupt') ? .06 : .18, demand: .12, reef: p.eia === 'fast' ? .35 : .12 }[r] || .1;
    return Math.min(.9, L * mit);
  }
  function makeAlert(p, r) {
    const m = M(p.id), c = p.budget;
    const A = {
      regulator: { text: 'The safety regulator found faulty welds and missing test records. It wants the work redone.', ch: [['Redo the work properly', { cost: .04, delay: .06, quality: 15, safety: 10 }], ['Ask the regulator to accept it', { quality: -20, safety: -15, scandal: 1, pc: -1 }]], def: 1 },
      safety: { text: 'A crane collapse has seriously injured workers. Unions demand an investigation.', ch: [['Stop work and investigate', { delay: .05, safety: 25, g: { workers: 2 } }], ['Keep working, pay compensation', { cost: .01, safety: -5, g: { workers: -6 } }]], def: 1 },
      supply: { text: 'Key equipment is stuck at the factory abroad. The schedule is slipping.', ch: [['Pay for air freight and extra shifts', { cost: .025 }], ['Accept the delay', { delay: .08 }]], def: 1 },
      overrun: { text: 'Steel, cement and fuel prices have jumped. The contractor says the budget is no longer enough.', ch: [['Approve the extra money', { cost: .06 }], ['Cut the scope (fewer features)', { cost: .02, quality: -8 }]], def: 0 },
      protest: { text: m.protest, ch: [['Meet them, adjust the design and compensate', { cost: .02, delay: .02, g: { farmers: 3, workers: 2 } }], ['Send the police to clear the site', { g: { farmers: -6, youth: -4 }, s: { freedom: -3 } }]], def: 1 },
      claim: { text: 'The contractor submits a claim for extra payment, blaming design changes and site delays.', ch: [['Check it with engineers and negotiate', { cost: .015, delay: .01 }], ['Pay in full to keep the peace', { cost: .05 }], ['Refuse and go to arbitration', { delay: .05, cost: Math.random() < .5 ? .07 : 0 }]], def: 1 },
      land: { text: 'Some landowners refuse to sell and others have gone to court over the price.', ch: [['Raise compensation to market value', { cost: .02, g: { farmers: 3 } }], ['Use compulsory purchase', { delay: .04, g: { farmers: -6 }, s: { freedom: -2 } }]], def: 1 },
      ground: { text: 'Drilling found much weaker ground than the survey showed. The foundations must change.', ch: [['Redesign the foundations', { cost: .04, delay: .05, quality: 5 }], ['Carry on as designed', { quality: -18, safety: -10 }]], def: 1 },
      weather: { text: COUNTRY.id === 'mv' ? 'Southwest monsoon swells have stopped barges and dredgers working for weeks.' : 'Storms and floods have stopped work on the site.', ch: [['Add crews and night shifts to catch up', { cost: .02 }], ['Accept the lost time', { delay: .05 }]], def: 1 },
      corrupt: { text: 'An official on the project is accused of taking bribes to approve inflated invoices.', ch: [['Suspend him and order an audit', { pc: 1, delay: .01, s: { freedom: 1 } }], ['Hush it up', { cost: .04, scandal: 1 }]], def: 1 },
      demand: { text: 'Few companies and families have signed up to move. Some blocks may stand empty.', ch: [['Move government offices there first', { cost: .02, g: { business: 2 } }], ['Hope they come', { quality: -5 }]], def: 1 },
      reef: { text: 'Divers report sediment from dredging smothering coral on nearby reefs.', ch: [['Install silt curtains and slow dredging', { cost: .01, delay: .03, s: { environment: 2 } }], ['Keep dredging at full speed', { s: { environment: -5 }, g: { youth: -4 } }]], def: 1 },
    }[r];
    return { id: r, icon: MRISK[r].icon, title: MRISK[r].name, text: A.text, ch: A.ch.map(([t, fx]) => ({ t, fx })), def: A.def, born: S.turn };
  }
  function applyAlert(p, a, k, auto) {
    const fx = a.ch[k].fx;
    if (fx.cost) p.true += p.budget * fx.cost, p.overrun = (p.overrun || 0) + fx.cost;
    if (fx.delay) p.prog = Math.max(0, p.prog - fx.delay), p.rep = Math.max(p.prog, p.rep - fx.delay);
    if (fx.quality) p.quality = clamp(p.quality + fx.quality);
    if (fx.safety) p.safety = clamp(p.safety + fx.safety);
    applyGovFx({ g: fx.g, s: fx.s, pc: fx.pc, scandal: fx.scandal });
    p.log.push(`${turnLabel()}: ${a.title} — ${auto ? 'no decision, site manager chose: ' : ''}${a.ch[k].t}`);
    p.alerts = p.alerts.filter(x => x !== a);
  }
  function step() {
    const msgs = [];
    for (const p of st().list) {
      const m = M(p.id);
      if (p.phase === 'feas' && S.turn >= p.t0) { p.phase = 'feasDone'; msgs.push(`📋 Feasibility study ready: ${m.name} — decide in the Megaprojects tab`); }
      if (p.phase === 'eia' && S.turn >= p.t1) { p.phase = 'eiaDone'; p.log.push(`${turnLabel()}: EIA approved with conditions`); msgs.push(`🌿 Environmental assessment approved: ${m.name} — choose financing`); }
      if (p.phase !== 'build') continue;
      // ignored alerts: the site manager decides, usually badly
      (p.alerts || []).slice().forEach(a => { applyAlert(p, a, a.def, true); msgs.push(`⚠️ ${m.name}: you did not decide on “${a.title}” — the site manager did`); });
      if (p.paused) { p.hist.push({ t: S.turn - p.start, plan: plan(p), prog: p.prog, spent: p.spent / p.budget }); continue; }
      const prod = rnd(.75, 1.12) * p.sp * (.75 + p.quality / 400) * (p.safety < 40 ? .85 : 1);
      const d = Math.min(1 - p.prog, prod / p.turns);
      p.prog += d;
      const pay = d * p.true * (p.fin === 'ppp' ? .4 : 1);
      p.spent += d * p.true; S.debt += pay;
      // contractors like to report good news: without inspections, the reported progress drifts above the truth
      const blind = S.turn - (p.insp || p.start);
      p.rep = p.mit.eng ? p.prog : Math.min(1, Math.max(p.prog, p.rep + d + (blind >= 1 ? rnd(.01, .05) : 0)));
      p.safety = clamp(p.safety + (p.mit.eng ? 2 : -4) + (blind >= 2 ? -3 : 0));
      if (p.local) S.ga.workers = clamp(S.ga.workers + .5);
      // new risks this half-year (at most two)
      shuffle(m.risks).filter(r => Math.random() < likelihood(p, r)).slice(0, 2).forEach(r => { const a = makeAlert(p, r); p.alerts.push(a); msgs.push(`${a.icon} ${m.name}: ${a.title} — decision needed`); });
      p.hist.push({ t: S.turn - p.start + 1, plan: Math.min(1, (S.turn - p.start + 1) / p.turns), prog: p.prog, spent: p.spent / p.budget });
      if (p.prog >= .999) complete(p, msgs);
    }
    // finished projects keep paying off; PPP payments keep coming
    for (const p of st().list.filter(x => x.phase === 'done')) {
      const m = M(p.id), k = p.quality / 80;
      if (m.gain.growth) S.gdp *= 1 + m.gain.growth * k / 100;
      if (p.fin === 'ppp' && (p.pppLeft || 0) > 0) { const a = p.true * .6 * 1.25 / 10; S.debt += a; p.pppLeft--; if (p.pppLeft === 9) msgs.push(`🤝 PPP payments begin for ${m.name}: ${usd(a)} every half-year for 5 years`); }
    }
    return msgs;
  }
  function complete(p, msgs) {
    const m = M(p.id), k = clamp(p.quality, 30, 100) / 80, g = m.gain;
    p.phase = 'done'; p.end = S.turn + 1; p.prog = 1; p.alerts = []; p.rep = 1; p.pppLeft = p.fin === 'ppp' ? 10 : 0;
    S.energyBonus = (S.energyBonus || 0) + (g.energy || 0) * k;
    applyGovFx({ s: Object.fromEntries(Object.entries(g.s || {}).map(([a, v]) => [a, v * k])), g: g.g, gdp: g.gdp * k });
    if (g.homes) RK.forEach(r => S.housing.stock[r] += r === m.site ? g.homes : 0);
    if (g.reserves && S.fin && S.fin.res !== undefined) S.fin.res += g.reserves;
    const late = (S.turn + 1 - p.start) - p.turns, over = p.spent / p.budget - 1;
    p.log.push(`${turnLabel()}: opened — ${late > 0 ? late / 2 + ' years late' : 'on time'}, ${over > .02 ? pct(over) + ' over budget' : 'on budget'}`);
    news(`${m.name} opens${late > 0 ? ` ${late / 2} years late` : ' on time'}`);
    msgs.push(`🎉 ${m.name} is complete!`);
    S.megaOpened = (S.megaOpened || []).concat(p.uid);
  }
  async function ceremony() {
    const list = S.megaOpened || []; S.megaOpened = [];
    for (const uid of list) {
      const p = P(uid), m = M(p.id), late = (p.end - p.start) - p.turns, over = p.spent / p.budget - 1;
      await infoModal(m.icon, `${m.name} is open!`, `<p>The ${ROLE.title.toLowerCase()} cuts the ribbon in ${site(p).name}.</p>
        <div class="mg-rep"><div><span>Time</span><b class="${late > 0 ? 'bad' : 'good'}">${late > 0 ? '+' + late / 2 + ' yrs late' : 'On time'}</b></div><div><span>Final cost</span><b class="${over > .1 ? 'bad' : over > .02 ? 'warn' : 'good'}">${usd(p.spent)}</b><small>budget ${usd(p.budget)} (${over >= 0 ? '+' : ''}${pct(over)})</small></div><div><span>Quality</span><b class="${p.quality >= 70 ? 'good' : p.quality >= 50 ? 'warn' : 'bad'}">${fmt(p.quality)}/100</b><small>affects benefits</small></div></div>
        <p class="lesson">📘 ${m.lesson}</p>`, 'Celebrate 🎉');
    }
  }
  // ---------- monitoring actions ----------
  async function act(spec) {
    const [act, uid, x] = spec.split('|'), p = P(uid);
    if (act === 'start') return start(uid);
    if (!p) return;
    const m = M(p.id);
    if (act === 'decide') return decide(uid);
    if (act === 'alert') { const a = p.alerts[+x.split(':')[0]]; if (!a) return; const before = Impact.snap(); applyAlert(p, a, +x.split(':')[1]); save(); render(); Impact.show(`${m.name}: ${a.title}`, before, { lesson: 'Problems on big projects are cheapest when solved early. Ignored risks come back bigger.' }); return; }
    if (act === 'inspect') {
      if (p.insp === S.turn) return toast('You already inspected the site this half-year.', 'bad');
      if (S.pc < 1) return toast('You need ⭐1 political capital for a site visit.', 'bad');
      S.pc -= 1; p.insp = S.turn; p.qKnown = true;
      const gap = p.rep - p.prog; p.rep = p.prog; p.safety = clamp(p.safety + 12);
      const found = [];
      if (gap > .015) found.push(`The contractor reported <b>${pct(p.prog + gap)}</b> done, but inspectors measured only <b>${pct(p.prog)}</b>.`);
      if (p.quality < 60) { found.push('Inspectors found <b>poor workmanship</b>: cracks, missing reinforcement or untested materials. It was fixed now — far cheaper than after opening.'); p.true += p.budget * .015; p.quality = clamp(p.quality + 10); }
      if (p.safety < 55) found.push('Workers had <b>no proper safety gear</b> and fall protection. Work is paused for a day of safety training.');
      if (!found.length) found.push('The site is well run. Progress, safety and quality match the reports.');
      p.log.push(`${turnLabel()}: site inspection by the ${ROLE.title.toLowerCase()}`);
      news(`${ROLE.title} inspects ${m.name} site`);
      S.ga.workers = clamp(S.ga.workers + 1);
      save(); render();
      return infoModal('🔍', `Site inspection: ${m.name}`, `<ul class="mg-find">${found.map(f => `<li>${f}</li>`).join('')}</ul><p class="lesson">📘 “Trust, but verify.” Contractors are paid for progress, so they report it generously. Independent checks keep the numbers honest.</p>`);
    }
    if (act === 'mit') {
      const g = MITIG[x]; if (p.mit[x]) return;
      const c = p.budget * g.cost;
      p.mit[x] = 1; S.debt += c; p.spent += c;
      if (x === 'eng') { p.rep = p.prog; p.qKnown = true; p.quality = clamp(p.quality + 6); }
      p.log.push(`${turnLabel()}: ${g.name} added (${usd(c)})`);
      toast(`${g.icon} ${g.name} hired — ${usd(c)}`, 'good'); save(); render(); return;
    }
    if (act === 'pause') { p.paused = !p.paused; p.log.push(`${turnLabel()}: work ${p.paused ? 'paused' : 'resumed'}`); save(); render(); return; }
    if (act === 'brief') {
      if (p.brief === S.turn) return toast('Already briefed the public this half-year.', 'bad');
      p.brief = S.turn; const honest = p.rep - p.prog < .02;
      GK.forEach(g => S.ga[g] = clamp(S.ga[g] + (honest ? 1 : .5)));
      news(`${ROLE.title} gives public update on ${m.name}: ${pct(p.rep)} complete`);
      save(); render(); return toast('📣 Public update published — open projects build trust', 'good');
    }
    if (act === 'cancel') {
      const k = await choiceModal({ icon: '🛑', title: `Cancel ${m.name}?`, text: `Already spent: <b>${usd(p.spent)}</b>. Cancelling costs a termination fee of <b>${usd(p.budget * .06)}</b> and the money already spent is lost.<br><br>📘 <i>The “sunk cost trap”: money already spent should not decide the choice. Ask only: is the money still needed to finish worth more or less than the benefits?</i>`,
        choices: [{ t: 'Cancel the project', note: `💰 ${usd(p.budget * .06)} fee` }, { t: 'Keep building', note: '' }] });
      if (k) return;
      const before = Impact.snap();
      S.debt += p.budget * .06; p.phase = 'cancelled'; p.alerts = [];
      GK.forEach(g => S.ga[g] = clamp(S.ga[g] - 2)); S.ga.workers = clamp(S.ga.workers - 3);
      p.log.push(`${turnLabel()}: cancelled`); news(`${m.name} cancelled after ${usd(p.spent)} spent`);
      save(); render(); Impact.show(`Cancelled: ${m.name}`, before, {}); return;
    }
    if (act === 'view') { UI.megaView = UI.megaView === uid ? null : uid; render(); }
  }
  // ---------- dashboard ----------
  function curve(p) {
    const W = 300, H = 120, T = Math.max(p.turns, ...p.hist.map(h => h.t)) || 1;
    const X = t => 26 + t / T * (W - 34), Y = v => H - 16 - Math.min(1.3, v) * (H - 30);
    const line = (k, c, dash) => `<polyline fill="none" stroke="${c}" stroke-width="2.5" ${dash ? 'stroke-dasharray="5 4"' : ''} points="${p.hist.map(h => X(h.t) + ',' + Y(h[k])).join(' ')}"/>`;
    const planLine = `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(p.turns)}" y2="${Y(1)}" stroke="#94a3b8" stroke-width="2" stroke-dasharray="5 4"/>`;
    return `<svg viewBox="0 0 ${W} ${H}" class="mg-curve" role="img" aria-label="Progress against plan">
      ${[0, .5, 1].map(v => `<line x1="24" x2="${W - 6}" y1="${Y(v)}" y2="${Y(v)}" stroke="currentColor" opacity=".12"/><text x="2" y="${Y(v) + 4}" font-size="9" fill="currentColor" opacity=".6">${v * 100}%</text>`).join('')}
      ${planLine}${line('spent', '#f59e0b')}${line('prog', '#22c55e')}
      <text x="${W - 6}" y="${H - 3}" font-size="9" text-anchor="end" fill="currentColor" opacity=".6">half-years →</text></svg>
      <div class="mg-legend"><span><i style="background:#94a3b8"></i>Plan</span><span><i style="background:#22c55e"></i>Real progress</span><span><i style="background:#f59e0b"></i>Money spent (of budget)</span></div>`;
  }
  function kpis(p) {
    const pl = plan(p), spi = pl ? p.prog / pl : 1, cpi = p.spent ? (p.prog * p.budget) / p.spent : 1, eac = p.budget / Math.max(.3, cpi);
    const left = (1 - p.prog) * p.turns / Math.max(.4, spi), finish = Math.ceil(S.turn + left);
    const c = (v, a, b) => v >= a ? 'good' : v >= b ? 'warn' : 'bad';
    return `<div class="mg-kpi">
      <div><span>Progress (reported)</span><b>${pct(p.rep)}</b><small>plan: ${pct(pl)}</small></div>
      <div><span>Schedule index</span><b class="${c(spi, .97, .85)}">${fmt(spi, 2)}</b><small>${spi >= .97 ? 'on schedule' : 'behind'} · opens ~${turnLabel(finish)}</small></div>
      <div><span>Spent</span><b>${usd(p.spent)}</b><small>of ${usd(p.budget)}</small></div>
      <div><span>Cost index</span><b class="${c(cpi, .97, .85)}">${fmt(cpi, 2)}</b><small>forecast at end ${usd(eac)}</small></div>
      <div><span>Safety</span><b class="${c(p.safety, 70, 50)}">${fmt(p.safety)}</b><small>${p.safety < 50 ? 'accident risk high' : 'out of 100'}</small></div>
      <div><span>Quality</span><b class="${p.qKnown ? c(p.quality, 70, 50) : ''}">${p.qKnown ? fmt(p.quality) : '?'}</b><small>${p.qKnown ? 'from inspections' : 'unknown — inspect'}</small></div>
    </div>`;
  }
  function register(p) {
    const m = M(p.id);
    return `<table class="mg-risk"><thead><tr><th>Risk</th><th>Chance this half-year</th><th>Mitigation</th></tr></thead><tbody>${m.risks.map(r => {
      const L = likelihood(p, r), mt = MRISK[r].mit;
      return `<tr><td>${MRISK[r].icon} ${MRISK[r].name}</td><td><span class="mg-bar"><i style="width:${L * 100}%;background:${L > .3 ? '#ef4444' : L > .15 ? '#f59e0b' : '#22c55e'}"></i></span> ${fmt(L * 100)}%</td><td>${p.mit[mt] ? `<span class="good">✓ ${MITIG[mt].icon}</span>` : `<button class="btn small" data-act="mega" data-id="mit|${p.uid}|${mt}">${MITIG[mt].icon} ${usd(p.budget * MITIG[mt].cost)}</button>`}</td></tr>`;
    }).join('')}</tbody></table>
    <p class="muted small">${Object.entries(MITIG).map(([k, g]) => `${g.icon} <b>${g.name}</b>: ${g.what}.`).join(' ')}</p>`;
  }
  function card(p) {
    const m = M(p.id), open = UI.megaView === p.uid || p.alerts.length;
    const steps = ['Feasibility', 'EIA', 'Financing', 'Tender', 'Construction', 'Open'];
    const at = { feas: 0, feasDone: 0, eia: 1, eiaDone: 2, fin: 2, tender: 3, build: 4, done: 5 }[p.phase] ?? 5;
    const head = `<div class="mg-head"><span class="mg-ic">${m.icon}</span><div><b>${m.name}</b><small>${site(p).name}${p.con ? ' · ' + esc(p.con) : ''}${p.fin ? ' · ' + { budget: 'budget & bonds', loan: 'development loan', ppp: 'PPP' }[p.fin] : ''}</small></div>${p.alerts.length ? `<span class="mg-badge">${p.alerts.length} ⚠️</span>` : ''}</div>
      <ol class="mg-steps">${steps.map((s, i) => `<li class="${i < at ? 'ok' : i === at ? 'now' : ''}">${s}</li>`).join('')}</ol>`;
    if (p.phase === 'feas') return `<div class="mg-card">${head}<p>⏳ Engineers and economists are working on the feasibility study. Report due at the end of this half-year.</p></div>`;
    if (p.phase === 'eia') return `<div class="mg-card">${head}<p>🌿 Public hearings and environmental surveys are under way. Approval due at the end of this half-year.</p></div>`;
    if (['feasDone', 'eiaDone', 'fin', 'tender'].includes(p.phase)) return `<div class="mg-card">${head}<p>${p.phase === 'feasDone' ? '📋 The feasibility report is ready.' : p.phase === 'eiaDone' ? '🌿 The EIA is approved with conditions. Next: financing and tender.' : 'Next: financing and contract.'}</p><button class="btn primary" data-act="mega" data-id="decide|${p.uid}">Continue →</button></div>`;
    if (p.phase === 'done') return `<div class="mg-card done">${head}<p>✅ Opened ${turnLabel(p.end)} · cost ${usd(p.spent)} (budget ${usd(p.budget)}) · quality ${fmt(p.quality)}/100${p.pppLeft ? ` · PPP payments left: ${p.pppLeft}` : ''}</p></div>`;
    if (p.phase === 'cancelled' || p.phase === 'shelved') return `<div class="mg-card off">${head}<p>${p.phase === 'cancelled' ? '🛑 Cancelled' : '🗄️ Shelved'} · ${usd(p.spent)} spent</p></div>`;
    return `<div class="mg-card">${head}
      ${p.alerts.map((a, i) => `<div class="mg-alert"><b>${a.icon} ${a.title}</b><p>${a.text}</p><div class="mg-ch">${a.ch.map((c, k) => `<button class="btn small ${k === 0 ? 'primary' : ''}" data-act="mega" data-id="alert|${p.uid}|${i}:${k}">${c.t}</button>`).join('')}</div><small class="muted">If you do not decide before the half-year ends, the site manager picks “${a.ch[a.def].t}”.</small></div>`).join('')}
      ${kpis(p)}
      ${p.paused ? '<p class="bad">⏸️ Work is paused.</p>' : ''}
      <div class="mg-actions">
        <button class="btn small primary" data-act="mega" data-id="inspect|${p.uid}">🔍 Inspect site (⭐1)</button>
        <button class="btn small" data-act="mega" data-id="brief|${p.uid}">📣 Public update</button>
        <button class="btn small" data-act="mega" data-id="pause|${p.uid}">${p.paused ? '▶️ Resume' : '⏸️ Pause'}</button>
        <button class="btn small" data-act="mega" data-id="view|${p.uid}">${open ? '▲ Less' : '📊 Full dashboard'}</button>
        <button class="btn small danger" data-act="mega" data-id="cancel|${p.uid}">🛑 Cancel</button>
      </div>
      ${open ? `<div class="mg-dash"><h4>S-curve: plan vs reality</h4>${curve(p)}<h4>Risk register</h4>${register(p)}<h4>Project diary</h4><ul class="mg-log">${p.log.slice(-6).reverse().map(l => `<li>${esc(l)}</li>`).join('')}</ul></div>` : ''}
    </div>`;
  }
  function html() {
    const list = st().list, av = avail(), running = active().length;
    const extra = COUNTRY.id === 'mv' ? '<p class="muted small">🇲🇻 A nuclear plant is not offered here: the Maldives has no grid big enough, no nuclear regulator and only sand islands a metre above the sea. Its megaprojects are about land, sea, ports and energy imports.</p>'
      : COUNTRY.id === 'de' ? '<p class="muted small">🇩🇪 Germany closed its last nuclear plants in 2023, so no nuclear plant is offered.</p>' : '';
    return `<div class="mega">
      <p class="muted">Flagship projects take years and cost a large part of the budget. Launch one, then <b>monitor it closely</b>: progress vs plan, money vs budget, safety, quality and risks. You can run up to two at once.</p>
      ${list.length ? list.slice().reverse().map(card).join('') : ''}
      <h3>Start a new megaproject</h3>${extra}
      <div class="mg-pick">${av.map(m => {
        const used = list.some(p => p.id === m.id && !['cancelled', 'shelved'].includes(p.phase));
        return `<div class="mg-opt"><div class="mg-head"><span class="mg-ic">${m.icon}</span><div><b>${m.name}</b><small>≈ ${usd(base(m))} (${fmt(base(m) / S.gdp * 100, 1)}% of GDP) · ${m.turns / 2} years · ${(reg(m.site) || REGIONS[0]).name}</small></div></div><p>${m.why}</p>
          <button class="btn small ${used || running >= 2 ? '' : 'primary'}" data-act="mega" data-id="start|${m.id}" ${used || running >= 2 ? 'disabled' : ''}>${used ? 'Already started' : 'Feasibility study →'}</button></div>`;
      }).join('')}</div></div>`;
  }
  return { init, step, html, act, ceremony, alerts, avail, active, MEGA };
})();
