/* ============================================================
   MORE DEBATE QUESTIONS — a bigger pool, country-specific
   questions, and (at re-election) a question about your record.
   Questions already asked in this game are not repeated.
   ============================================================ */

const DEBATE_SKIP = { mv: ['"Farmers are struggling. Will you help?"'] };

const DEBATE_MORE = {
  all: [
    { q: '"Taxes: should they go up or down?"', a: [
      { t: 'Lower taxes for working families, higher for the richest', fx: { p: { workers: 3, business: -2 } } },
      { t: 'Cut taxes for everyone to boost growth', fx: { p: { business: 3, elderly: 1, workers: -1 } } },
      { t: 'Keep taxes stable and fix spending first', fx: { p: { elderly: 2, business: 1 } } }] },
    { q: '"How will you fight corruption?"', a: [
      { t: 'An independent anti-corruption agency with real powers', fx: { p: { youth: 3, business: 1 } } },
      { t: 'Publish every government contract online', fx: { p: { youth: 2, workers: 1 } } },
      { t: 'Tougher prison sentences for officials', fx: { p: { elderly: 3, youth: -1 } } }] },
    { q: '"Young people are leaving the country. Why should they stay?"', a: [
      { t: 'Start-up grants and first-job programmes', fx: { p: { youth: 4, business: 1 } } },
      { t: 'Affordable homes for young families', fx: { p: { youth: 3, workers: 1 } } },
      { t: 'Better pay in public services', fx: { p: { workers: 2, youth: 1, business: -1 } } }] },
    { q: '"Pensions are too low. What will you do for older people?"', a: [
      { t: 'Raise the basic pension', fx: { p: { elderly: 5, youth: -1 } } },
      { t: 'Free healthcare and transport for seniors', fx: { p: { elderly: 3, workers: 1 } } },
      { t: 'Reform pensions so they are affordable long-term', fx: { p: { business: 2, youth: 1, elderly: -2 } } }] },
    { q: '"Government debt is rising. Is that a problem?"', a: [
      { t: 'Yes — I will balance the budget', fx: { p: { business: 3, elderly: 1, workers: -1 } } },
      { t: 'Borrowing to invest is fine; borrowing to waste is not', fx: { p: { business: 1, workers: 1, youth: 1 } } },
      { t: 'People matter more than numbers', fx: { p: { workers: 3, business: -3 } } }] },
    { q: '"Should foreign companies own land and businesses here?"', a: [
      { t: 'Welcome investors — they bring jobs', fx: { p: { business: 4, workers: -1 } } },
      { t: 'Yes, but with local partners and local jobs', fx: { p: { workers: 2, business: 1 } } },
      { t: 'No — our land belongs to our people', fx: { p: { farmers: 3, elderly: 1, business: -3 } } }] },
    { q: '"Is the press free enough in this country?"', a: [
      { t: 'Protect journalists and open government data', fx: { p: { youth: 3 } } },
      { t: 'Freedom, but with laws against fake news', fx: { p: { elderly: 2, youth: -2 } } },
      { t: 'The press is already too powerful', fx: { p: { elderly: 1, youth: -4 } } }] },
    { q: '"Women earn less than men. Will you change that?"', a: [
      { t: 'Equal-pay law and free childcare', fx: { p: { workers: 2, youth: 2, business: -1 } } },
      { t: 'Training and loans for women entrepreneurs', fx: { p: { business: 2, youth: 1 } } },
      { t: 'It is not the government\'s job', fx: { p: { business: 1, youth: -3 } } }] },
    { q: '"Electricity bills are too high. Your plan?"', a: [
      { t: 'Cheap solar power for every home', fx: { p: { youth: 3, workers: 1 } } },
      { t: 'Subsidise bills for poor families', fx: { p: { workers: 3, elderly: 2, business: -1 } } },
      { t: 'Open the market to competition', fx: { p: { business: 3 } } }] },
    { q: '"Would you sell state-owned companies?"', a: [
      { t: 'Yes — the state should not run businesses', fx: { p: { business: 4, workers: -2 } } },
      { t: 'Only the ones that lose money', fx: { p: { business: 2, workers: -1 } } },
      { t: 'Never — they belong to the people', fx: { p: { workers: 3, business: -2 } } }] },
    { q: '"How will you make government services faster?"', a: [
      { t: 'Put all services online', fx: { p: { youth: 3, business: 2, elderly: -1 } } },
      { t: 'Hire more staff in local offices', fx: { p: { elderly: 2, workers: 2 } } },
      { t: 'Cut red tape and useless permits', fx: { p: { business: 3 } } }] },
    { q: '"Drugs are destroying young lives. What will you do?"', a: [
      { t: 'Treatment and rehabilitation for addicts', fx: { p: { youth: 2, elderly: 1 } } },
      { t: 'Hunt down the dealers and smugglers', fx: { p: { elderly: 3 } } },
      { t: 'Jobs and sport so young people have a future', fx: { p: { youth: 3, workers: 1 } } }] },
  ],
  mv: [
    { q: '"Families in Malé live in tiny, overcrowded rooms. What will you do?"', a: [
      { t: 'Thousands of social flats in Hulhumalé', fx: { p: { youth: 4, workers: 2 } } },
      { t: 'Develop regional cities so people need not move to Malé', fx: { p: { farmers: 4, youth: 1 } } },
      { t: 'Rent control for Malé', fx: { p: { workers: 3, business: -2 } } }] },
    { q: '"Rising seas threaten our islands. What is your climate plan?"', a: [
      { t: 'Coastal protection and higher reclaimed land', fx: { p: { farmers: 3, elderly: 2 } } },
      { t: 'Lead the world on climate diplomacy and finance', fx: { p: { youth: 3 } } },
      { t: 'Protect reefs and mangroves — nature\'s sea walls', fx: { p: { youth: 3, farmers: 1, business: -1 } } }] },
    { q: '"Fishers say they earn less every year. Will you help them?"', a: [
      { t: 'Guaranteed tuna price through the state fish company', fx: { p: { farmers: 5, business: -1 } } },
      { t: 'New cold storage and export markets', fx: { p: { farmers: 3, business: 1 } } },
      { t: 'Retrain fishers for tourism jobs', fx: { p: { business: 2, farmers: -2 } } }] },
    { q: '"Should resort islands be leased only through open bidding?"', a: [
      { t: 'Yes — every island through open tender', fx: { p: { youth: 3, business: 1 } } },
      { t: 'Faster leasing to bring investment', fx: { p: { business: 3, youth: -2 } } },
      { t: 'Give island councils a share of resort income', fx: { p: { farmers: 4 } } }] },
    { q: '"Most resort jobs go to foreign workers. How will you change that?"', a: [
      { t: 'Enforce local hiring and build staff housing', fx: { p: { workers: 4, business: -2 } } },
      { t: 'Free hospitality training for young Maldivians', fx: { p: { youth: 3, workers: 1 } } },
      { t: 'Let resorts hire who they want', fx: { p: { business: 3, workers: -3 } } }] },
    { q: '"Islanders must travel to Malé for hospitals. Is that fair?"', a: [
      { t: 'A full hospital in every atoll', fx: { p: { farmers: 4, elderly: 2 } } },
      { t: 'Air ambulances and telemedicine', fx: { p: { farmers: 2, elderly: 2, youth: 1 } } },
      { t: 'Better health insurance (Aasandha) coverage', fx: { p: { elderly: 3, workers: 1 } } }] },
    { q: '"Should islands be connected by bridges and fast ferries?"', a: [
      { t: 'A national ferry network for all atolls', fx: { p: { farmers: 4, workers: 1 } } },
      { t: 'Bridges between neighbouring islands', fx: { p: { farmers: 2, business: 2 } } },
      { t: 'Regional airports first', fx: { p: { business: 3, farmers: 1 } } }] },
  ],
  in: [
    { q: '"Farmers want a legal guarantee of minimum support prices. Yes or no?"', a: [
      { t: 'Yes — a legal MSP guarantee', fx: { p: { farmers: 5, business: -2 } } },
      { t: 'Better crop insurance and storage instead', fx: { p: { farmers: 2, business: 1 } } },
      { t: 'Let markets set prices', fx: { p: { business: 3, farmers: -4 } } }] },
    { q: '"Millions of young Indians need jobs every year. How?"', a: [
      { t: 'Make in India: factories and manufacturing', fx: { p: { workers: 3, business: 2 } } },
      { t: 'Skills training and apprenticeships', fx: { p: { youth: 3, workers: 1 } } },
      { t: 'Expand the rural job guarantee', fx: { p: { farmers: 3, workers: 2, business: -1 } } }] },
    { q: '"Air pollution chokes our cities every winter. Your plan?"', a: [
      { t: 'Help farmers stop stubble burning', fx: { p: { youth: 2, farmers: 2 } } },
      { t: 'Electric buses and cleaner industry', fx: { p: { youth: 3, business: -1 } } },
      { t: 'Growth first; pollution will fall as we get richer', fx: { p: { business: 2, youth: -3 } } }] },
  ],
  fr: [{ q: '"Should the retirement age go up?"', a: [
    { t: 'No — back to 62', fx: { p: { workers: 4, elderly: 2, business: -3 } } },
    { t: 'Yes, gradually, with exceptions for hard jobs', fx: { p: { business: 2, workers: -1 } } },
    { t: 'A points-based system for everyone', fx: { p: { business: 1, youth: 1 } } }] }],
  uk: [{ q: '"How will you cut NHS waiting lists?"', a: [
    { t: 'More money and more staff', fx: { p: { elderly: 4, workers: 1 } } },
    { t: 'Use private clinics to clear the backlog', fx: { p: { business: 2, elderly: 1, workers: -1 } } },
    { t: 'Reform how the NHS is run', fx: { p: { business: 1, elderly: 1 } } }] }],
  us: [{ q: '"How will you make healthcare affordable?"', a: [
    { t: 'Public option for everyone', fx: { p: { workers: 3, business: -2 } } },
    { t: 'Lower drug prices', fx: { p: { elderly: 4 } } },
    { t: 'More competition between insurers', fx: { p: { business: 3 } } }] }],
  kz: [{ q: '"Should fuel prices be controlled by the state?"', a: [
    { t: 'Yes — cap prices for families', fx: { p: { workers: 4, business: -2 } } },
    { t: 'Free prices, with help for the poor', fx: { p: { business: 2, workers: 1 } } },
    { t: 'Build new refineries to bring prices down', fx: { p: { workers: 2, business: 2 } } }] }],
  uz: [{ q: '"Millions work abroad in Russia. How will you bring them home?"', a: [
    { t: 'New factories in the regions', fx: { p: { workers: 3, farmers: 2 } } },
    { t: 'Land and loans for returning migrants', fx: { p: { farmers: 3, youth: 1 } } },
    { t: 'Remittances help families — protect them', fx: { p: { workers: 2 } } }] }],
  br: [{ q: '"Should the Amazon be protected or developed?"', a: [
    { t: 'Zero illegal deforestation', fx: { p: { youth: 4, farmers: -3 } } },
    { t: 'Sustainable development with local people', fx: { p: { farmers: 2, youth: 2 } } },
    { t: 'Farming and mining bring jobs', fx: { p: { farmers: 4, youth: -4 } } }] }],
  jp: [{ q: '"Japan\'s population is shrinking. What will you do?"', a: [
    { t: 'Big support for families and childcare', fx: { p: { youth: 3, workers: 1 } } },
    { t: 'Welcome more foreign workers', fx: { p: { business: 3, elderly: -2 } } },
    { t: 'Robots and automation', fx: { p: { business: 2, youth: 1 } } }] }],
  tr: [{ q: '"How will you bring inflation down?"', a: [
    { t: 'Independent central bank and higher rates', fx: { p: { business: 2, elderly: 2, workers: -1 } } },
    { t: 'Price controls on basic food', fx: { p: { workers: 3, business: -2 } } },
    { t: 'Grow our way out with exports', fx: { p: { business: 3 } } }] }],
  de: [{ q: '"Is the energy transition hurting industry?"', a: [
    { t: 'Faster renewables mean cheaper power', fx: { p: { youth: 3, business: -1 } } },
    { t: 'Cheaper electricity for industry now', fx: { p: { business: 3, workers: 2 } } },
    { t: 'Slow down the transition', fx: { p: { business: 2, youth: -3 } } }] }],
};

// a question about your record, built from the real numbers (re-election only)
function recordQuestion() {
  const b = budgetCalc(), def = -b.bal * 2 / S.gdp * 100, ap = approval();
  const worst = def > 3 ? `the deficit is ${fmt(def, 1)}% of GDP` : (S.infl || 0) > 6 ? `inflation is ${fmt(S.infl, 1)}%` : unemployment() > 8 ? `unemployment is ${fmt(unemployment(), 1)}%` : `only ${fmt(ap)}% approve of your government`;
  return { id: 'record', q: `"After your term, ${worst}. Why should voters trust you again?"`, a: [
    { t: 'Defend the record: we inherited a mess and fixed a lot', fx: { p: { elderly: 1, business: 1 } } },
    { t: 'Admit mistakes and set out a clear plan', fx: { p: { youth: 2, workers: 2, farmers: 1 } } },
    { t: 'Blame the opposition and the world economy', fx: { p: { elderly: 1, youth: -2 } } }] };
}

function debateQuestions(n = 3) {
  const seen = S.debateSeen = S.debateSeen || [];
  const skip = DEBATE_SKIP[COUNTRY.id] || [];
  const local = DEBATE_MORE[COUNTRY.id] || [];
  const fresh = list => list.filter(q => !seen.includes(q.q) && !skip.includes(q.q));
  let pool = fresh([...DEBATE_Q, ...DEBATE_MORE.all]), loc = fresh(local);
  if (pool.length + loc.length < n) { S.debateSeen = []; return debateQuestions(n); }   // everything asked: start again
  const out = [];
  if (S.camp && S.camp.re) out.push(recordQuestion());
  shuffle(loc).slice(0, local.length ? 1 + (Math.random() < .5 ? 1 : 0) : 0).forEach(q => out.push(q));
  shuffle(pool).forEach(q => { if (out.length < n) out.push(q); });
  const qs = shuffle(out.slice(0, n));
  qs.forEach(q => { if (q.id !== 'record') S.debateSeen.push(q.q); });
  return qs;
}
