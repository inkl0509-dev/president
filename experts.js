/* ============================================================
   ASK THE EXPERTS — a policy roundtable on the current problem.
   The president picks an issue (deficit, debt, inflation, jobs,
   dollar reserves, approval). A panel of advisers explains the
   situation, each recommends options, and every option shows
   its pros, cons and effects before you decide.
   ============================================================ */

const Experts = (() => {
  const defPct = () => { const bc = budgetCalc(); return -bc.bal * 2 / S.gdp * 100; };
  const intShare = () => { const bc = budgetCalc(); return bc.interest / Math.max(.01, bc.rev) * 100; };
  const growth = () => S.lastGrowth || 0;
  const mv = () => COUNTRY.id === 'mv';
  const cbShort = () => (typeof Money !== 'undefined' ? Money.F().short : 'central bank');

  // ---- the panel (generated once per game, local names) ----
  const PANEL = [
    { id: 'econ', icon: '📊', role: () => mv() ? 'Chief Economist, Ministry of Finance and Public Enterprises' : 'Chief Economist, Ministry of Finance' },
    { id: 'cb', icon: '🏦', role: () => `Governor, ${typeof Money !== 'undefined' ? Money.F().cb : 'Central Bank'}` },
    { id: 'imf', icon: '🌐', role: () => 'IMF mission chief (visiting)' },
    { id: 'biz', icon: '💼', role: () => mv() ? 'President, Maldives National Chamber of Commerce and Industry' : 'President, National Chamber of Commerce' },
    { id: 'union', icon: '🔧', role: () => 'Leader, workers\' union' },
    { id: 'opp', icon: '🗣️', role: () => 'Opposition finance spokesperson' },
  ];
  function people() {
    if (!S.experts) S.experts = Object.fromEntries(PANEL.map(p => { const g = Math.random() < .45 ? 'f' : 'm'; const look = randomLook(); if (g === 'f') look.style = pick(['long', 'curly', 'side']); return [p.id, { name: p.id === 'imf' ? pick(['A. Lindqvist', 'R. Okafor', 'M. Tanaka', 'P. Moreau', 'S. Haddad']) : personName(g), look, g }]; }));
    return S.experts;
  }

  // ---- options (shared between issues) ----
  const topLines = n => ['health', 'education', 'security', 'infra', 'welfare'].sort((a, b) => S.budget[b] - S.budget[a]).slice(0, n);
  const LBL = { health: 'health', education: 'education', security: 'police & security', infra: 'infrastructure', welfare: 'welfare' };
  const OPT = {
    cut: { t: () => `Cut spending: ${topLines(2).map(k => LBL[k]).join(' and ')} −1 each`, pc: 1,
      pros: 'Deficit ▼ about 2% of GDP a year — the fastest fix.', cons: () => `Fewer services: ${topLines(2).map(k => LBL[k]).join(', ')} ▼; the groups that use them are unhappy.`,
      ok: () => topLines(2).every(k => S.budget[k] > 0),
      run() { topLines(2).forEach(k => S.budget[k]--); return 'Spending cut. The deficit will shrink from this half-year.'; } },
    tax: { t: () => `Raise the main tax rate ${S.budget.tax}% → ${S.budget.tax + 2}%`, pc: 1,
      pros: 'Revenue ▲ about 2% of GDP a year.', cons: 'Business and workers ▼; slightly slower growth.', ok: () => S.budget.tax <= 48,
      run() { S.budget.tax += 2; return `Tax rate raised to ${S.budget.tax}%.`; } },
    base: { t: () => mv() ? 'Broaden the tax base: collect GST and income tax better through MIRA' : 'Fight tax evasion and close loopholes', pc: 2,
      pros: 'Revenue ▲ about 1% of GDP a year without raising rates.', cons: 'Business ▼ a little; takes political capital.',
      run() { S.lawCost -= .5; S.ga.business = clamp(S.ga.business - 2); return 'Tax administration reform launched.'; } },
    subsidy: { t: () => mv() ? 'Target subsidies: replace blanket electricity, fuel and food subsidies with help for poor households' : 'Target subsidies to the poor instead of everyone', pc: 2,
      pros: 'Spending ▼ about 1.2% of GDP a year; the poorest stay protected.', cons: 'Prices of electricity/fuel ▲ for most families: workers ▼, inflation ▲ a little.',
      run() { S.lawCost -= .6; S.ga.workers = clamp(S.ga.workers - 3); S.ga.elderly = clamp(S.ga.elderly - 1); S.infl += .5; return 'Subsidy reform announced.'; } },
    soe: { t: () => mv() ? 'Reform loss-making state companies (cut transfers to SOEs)' : 'Reform loss-making state companies', pc: 1,
      pros: 'Budget transfers ▼ (about 0.6% of GDP a year); better-run companies.', cons: 'Job cuts in state companies: workers ▼.',
      run() { S.lawCost -= .3; S.ga.workers = clamp(S.ga.workers - 2); return 'State-company reform begins.'; } },
    rule: { t: () => 'Pass a fiscal responsibility rule (deficit and debt limits in law)', pc: 2,
      pros: 'Investors trust you more: interest rate ▼, reputation ▲.', cons: 'Needs a majority in parliament; limits future spending.',
      run() { if (coalitionSeats() < majority()) return '✗ Parliament rejected the fiscal rule — you need a majority.'; S.rate = Math.max(.005, S.rate - .002); S.rep = clamp((S.rep || 50) + 4); S.fiscalRule = true; return 'Fiscal responsibility rule enacted.'; } },
    privat: { t: () => 'Sell minority stakes in state companies (privatisation)', pc: 2,
      pros: 'One-off: debt ▼ about 3% of GDP.', cons: 'Workers and youth ▼; you lose future dividends.',
      run() { S.debt = Math.max(0, S.debt - S.gdp * .03); S.ga.workers = clamp(S.ga.workers - 3); S.ga.youth = clamp(S.ga.youth - 1); return 'Shares sold; debt reduced.'; } },
    refi: { t: () => 'Refinance expensive debt with cheaper long-term loans (World Bank, ADB, friendly governments)', pc: 1,
      pros: 'Interest bill ▼.', cons: () => `Only works if lenders trust you (reputation ${fmt(S.rep || 50)} — needs 50+).`,
      run() { if ((S.rep || 50) < 50) return '✗ Lenders declined: improve your international reputation first.'; S.rate = Math.max(.005, S.rate - .003); return 'Debt refinanced on cheaper terms.'; } },
    borrow: { t: () => 'Do nothing for now — keep borrowing', pc: 0,
      pros: 'No one is upset today.', cons: () => `Debt keeps rising by about ${fmt(Math.max(0, defPct()), 1)}% of GDP a year; interest already takes ${fmt(intShare())}% of revenue.`,
      run() { S.rep = clamp((S.rep || 50) - 1); return 'You chose to wait. The debt keeps growing.'; } },
    tight: { t: () => `Ask the ${cbShort()} to tighten monetary policy`, pc: 0,
      pros: 'Inflation ▼ over the next half-years.', cons: 'Growth ▼ a little. The central bank decides — you can only ask.',
      run() { if (Math.random() < .8 || S.infl > S.inflTarget + 1) { S.infl -= .8; S.realRate = (S.realRate || 1) + .5; S.stats.economy = clamp(S.stats.economy - 1); return `The ${cbShort()} agreed to tighten.`; } return `The ${cbShort()} decided to wait.`; } },
    duty: { t: () => mv() ? 'Cut import duties on staple foods (rice, flour, sugar)' : 'Cut import duties on basic foods', pc: 1,
      pros: 'Food prices ▼ quickly: inflation ▼, workers and elderly ▲.', cons: 'Revenue ▼ (deficit ▲ ~0.4% of GDP); local farmers ▼.',
      run() { S.infl -= .7; S.lawCost += .2; S.ga.workers = clamp(S.ga.workers + 2); S.ga.elderly = clamp(S.ga.elderly + 2); S.ga.farmers = clamp(S.ga.farmers - 2); return 'Import duties on staples cut.'; } },
    cap: { t: () => 'Impose price controls', pc: 1,
      pros: 'Prices frozen right now: workers ▲.', cons: 'Economists warn: shortages and a black market follow; business ▼, inflation returns later.',
      run() { S.infl -= 1; S.ga.workers = clamp(S.ga.workers + 3); S.ga.business = clamp(S.ga.business - 5); S.stats.economy = clamp(S.stats.economy - 2); S.inflRebound = (S.inflRebound || 0) + 1.6; return 'Price controls imposed. Watch for shortages.'; } },
    works: { t: () => 'Public works programme: infrastructure budget +1', pc: 1,
      pros: 'Jobs ▲, economy ▲, regions grow.', cons: 'Deficit ▲ about 1% of GDP a year.', ok: () => S.budget.infra < 10,
      run() { S.budget.infra++; S.stats.economy = clamp(S.stats.economy + 1.5); return 'Infrastructure budget increased.'; } },
    biztax: { t: () => `Cut the tax rate ${S.budget.tax}% → ${S.budget.tax - 2}% to attract investment`, pc: 1,
      pros: 'Business ▲, investment and growth ▲.', cons: 'Revenue ▼ about 2% of GDP a year.', ok: () => S.budget.tax >= 7,
      run() { S.budget.tax -= 2; S.ga.business = clamp(S.ga.business + 4); return `Tax rate cut to ${S.budget.tax}%.`; } },
    skills: { t: () => mv() ? 'Skills programme: train young Maldivians for tourism, fisheries and IT jobs now held by expatriate workers' : 'Skills & apprenticeship programme', pc: 1,
      pros: 'Unemployment ▼ over time; youth ▲.', cons: 'Costs about 0.4% of GDP a year.',
      run() { S.lawCost += .2; S.lawStat.education += 2; S.ga.youth = clamp(S.ga.youth + 3); S.lawStat.economy += 1; return 'Skills programme launched.'; } },
    cash: { t: () => 'Targeted cash support for the poorest families', pc: 1,
      pros: 'Workers and elderly ▲ quickly.', cons: 'Deficit ▲ about 0.6% of GDP a year.',
      run() { S.lawCost += .3; S.ga.workers = clamp(S.ga.workers + 4); S.ga.elderly = clamp(S.ga.elderly + 3); return 'Cash support approved.'; } },
    tour: { t: () => 'Go on a listening tour of the regions', pc: 1,
      pros: 'Approval ▲ everywhere a little.', cons: 'Takes political capital.',
      run() { GK.forEach(g => S.ga[g] = clamp(S.ga[g] + 1.5)); return 'The tour went well.'; } },
    reshuffle: { t: () => 'Reshuffle the cabinet', pc: 1,
      pros: 'A fresh start: approval ▲ slightly, new ministers.', cons: 'Sacked ministers become critics.',
      run() { S.cabinet = null; Cabinet.get('finance'); GK.forEach(g => S.ga[g] = clamp(S.ga[g] + 2)); news('President reshuffles the cabinet'); return 'New cabinet sworn in.'; } },
    speech: { t: () => 'Address the nation and explain your plan', pc: 0, after: () => Speech.give('nation'),
      pros: 'Approval ▲ if you explain clearly.', cons: 'Costs ⭐2 when you give it.', run() { return 'Speech scheduled.'; } },
  };
  const moneyOpt = id => ({ t: () => `🏦 ${id === 'swap' ? 'Currency swap with India' : id === 'tgst' ? 'Raise tourism GST' : id === 'fca' ? 'Enforce the Foreign Currency Act' : id === 'sukuk' ? 'Issue a sukuk' : 'Request an IMF programme'} (opens the decision)`, pc: 0, money: id,
    pros: 'See full details and effects before you approve.', cons: 'Costs political capital in the next step.', run() { return ''; } });

  // ---- issues ----
  const ISSUES = [
    { id: 'deficit', icon: '📉', name: 'The budget deficit is too big', sev: () => defPct() > 5 ? 2 : defPct() > 3 ? 1 : 0,
      facts: () => `The budget deficit is <b>${fmt(defPct(), 1)}% of GDP</b> a year. Public debt is <b>${fmt(debtPct())}% of GDP</b>, and interest takes <b>${fmt(intShare())}%</b> of revenue.`,
      opts: ['cut', 'tax', 'base', 'subsidy', 'soe', 'rule', 'borrow'],
      say: {
        econ: () => `Every year we borrow ${fmt(defPct(), 1)}% of GDP. The cheapest permanent fixes are better tax collection and ending blanket subsidies — they hurt less than raising rates.`,
        cb: () => `Please do not ask us to finance the gap by printing money — that would push up prices${mv() ? ' and drain our dollar reserves' : ''}. A credible plan to cut the deficit is the best support you can give the currency.`,
        imf: () => `We recommend a gradual but credible consolidation of about 2–3% of GDP over the next years, protecting the poorest with targeted transfers. A fiscal rule makes the plan believable.`,
        biz: () => 'Please do not raise taxes on companies now — investment is fragile. Cut waste and loss-making state companies first.',
        union: () => 'Do not balance the budget on the backs of workers. Make the rich and tax evaders pay before you touch subsidies or services.',
        opp: () => 'The government spent recklessly on prestige projects. Cancel them before you cut people\'s services.',
      },
      rec: { econ: ['base', 'subsidy'], cb: ['rule', 'cut'], imf: ['subsidy', 'rule', 'base'], biz: ['cut', 'soe'], union: ['base'], opp: ['cut'] } },
    { id: 'debt', icon: '🏔️', name: 'Public debt is too high', sev: () => { const d = debtPct(), adv = ['us', 'uk', 'de', 'fr', 'jp'].includes(COUNTRY.id); return d > (S.crisisAt || 120) * .9 || (!adv && d > 100) ? 2 : d > (adv ? 90 : 70) ? 1 : 0; },
      facts: () => `Public debt is <b>${fmt(debtPct())}% of GDP</b> (for emerging economies the IMF sees risks rising above about 70%). The interest rate on new borrowing is <b>${fmt((S.rate || .015) * 100, 1)}%</b>.`,
      opts: ['refi', 'privat', 'rule', 'cut', '$imf', 'borrow'],
      say: {
        econ: () => 'Debt falls when growth is higher than the interest rate and the budget stops adding to it. Cheaper refinancing buys time; a primary surplus solves it.',
        cb: () => 'High debt makes every shock dangerous. Lengthen maturities so a big repayment never falls in a single year.',
        imf: () => `Debt at ${fmt(debtPct())}% of GDP carries a high risk of distress. A fiscal anchor and concessional financing are priorities.`,
        biz: () => 'Selling minority shares in state companies would cut the debt and improve how they are run.',
        union: () => 'Privatisation means job losses. Find the money elsewhere.',
        opp: () => 'The debt is the result of this government\'s borrowing spree.',
      },
      rec: { econ: ['refi', 'rule'], cb: ['refi'], imf: ['rule', '$imf', 'refi'], biz: ['privat'], union: ['refi'], opp: ['cut'] } },
    { id: 'infl', icon: '🔥', name: 'Prices are rising too fast', sev: () => S.infl > S.inflTarget + 4 ? 2 : S.infl > S.inflTarget + 1.5 ? 1 : 0,
      facts: () => `Inflation is <b>${fmt(S.infl, 1)}%</b> against a target of ${S.inflTarget}%. Workers and pensioners feel it first.`,
      opts: ['tight', 'duty', 'cut', 'cap', 'borrow'],
      say: {
        econ: () => 'A smaller deficit cools demand. Cutting duties on staple foods gives quick relief to poor families.',
        cb: () => `${mv() ? 'With the rufiyaa pegged, our main tools are reserve requirements and open market operations.' : 'We can raise interest rates.'} But monetary policy works slowly — 12 to 18 months.`,
        imf: () => 'Avoid price controls: they cause shortages. Tighten policy and protect the poor with targeted support.',
        biz: () => 'Price controls would empty the shelves. Please do not.',
        union: () => 'Families cannot wait 18 months. Freeze prices of basics now.',
        opp: () => 'The government\'s money printing caused this.',
      },
      rec: { econ: ['duty', 'cut'], cb: ['tight'], imf: ['tight', 'cut'], biz: ['duty'], union: ['cap'], opp: ['tight'] } },
    { id: 'jobs', icon: '🧰', name: 'Growth is weak and jobs are scarce', sev: () => unemployment() > 12 || growth() < 0 ? 2 : unemployment() > 8 || growth() < 1.5 ? 1 : 0,
      facts: () => `Unemployment is <b>${fmt(unemployment(), 1)}%</b> and the economy grew <b>${fmt(growth(), 1)}%</b> last half-year.`,
      opts: ['works', 'biztax', 'skills', 'cash'],
      say: {
        econ: () => 'Public investment in roads, harbours and power gives the quickest boost — but it adds to the deficit, so choose projects with high returns.',
        cb: () => 'Don\'t expect us to cut rates while inflation and the currency are under pressure.',
        imf: () => 'Skills and a better business climate raise growth for years; temporary stimulus fades.',
        biz: () => 'Cut taxes and red tape and we will hire.',
        union: () => mv() ? 'Young Maldivians need training for the jobs now done by expatriate workers.' : 'Train young people for real jobs and support families hit hardest.',
        opp: () => 'The government has no plan for jobs.',
      },
      rec: { econ: ['works', 'skills'], cb: ['skills'], imf: ['skills'], biz: ['biztax'], union: ['skills', 'cash'], opp: ['works'] } },
    { id: 'fx', icon: '💵', name: 'Dollar reserves are running low', when: () => typeof Money !== 'undefined' && Money.peg(),
      sev: () => Money.cover() < 1.5 ? 2 : Money.cover() < 3 ? 1 : 0,
      facts: () => `Official reserves are <b>$${Math.round(Money.ensure().res)}M</b> — ${fmt(Money.cover(), 1)} months of imports. The black-market dollar costs much more than the official MVR ${fmt(Money.ensure().peg || 15.42, 2)}.`,
      opts: ['$swap', '$tgst', '$fca', '$sukuk', '$imf', 'cut'],
      say: {
        econ: () => 'We need more dollars coming in and fewer going out. Tourism taxes in dollars are our best source.',
        cb: () => 'Keep enforcing the Foreign Currency Act and plan every big foreign repayment months in advance.',
        imf: () => 'Reserves are too low to protect the peg for long. Large fiscal adjustment is needed; external borrowing only buys time.',
        biz: () => 'Importers cannot get dollars from the banks. Fuel and food suppliers are worried.',
        union: () => 'If the peg breaks, prices will jump and workers will suffer most.',
        opp: () => 'The government let reserves fall to dangerous levels.',
      },
      rec: { econ: ['$tgst', '$fca'], cb: ['$fca', '$swap'], imf: ['cut', '$imf'], biz: ['$swap'], union: ['$swap'], opp: ['cut'] } },
    { id: 'pop', icon: '📣', name: 'The public is unhappy with the government', sev: () => approval() < 40 ? 2 : approval() < 50 ? 1 : 0,
      facts: () => `Approval is <b>${fmt(approval())}%</b>. The least happy group is ${(g => `${GROUPS[g].icon} ${GROUPS[g].name.toLowerCase()} (${fmt(S.ga[g])}%)`)([...GK].sort((a, b) => S.ga[a] - S.ga[b])[0])}.`,
      opts: ['speech', 'cash', 'tour', 'reshuffle'],
      say: {
        econ: () => 'Popular spending now makes the deficit worse later. Choose targeted help.',
        cb: () => 'Please keep the central bank out of politics.',
        imf: () => 'Explaining reforms clearly is as important as the reforms themselves.',
        biz: () => 'Confidence matters: show you have a plan.',
        union: () => 'People feel ignored. Go and listen to them.',
        opp: () => 'Call early elections!',
      },
      rec: { econ: ['speech'], cb: ['speech'], imf: ['speech'], biz: ['reshuffle'], union: ['tour', 'cash'], opp: [] } },
  ];
  const live = () => ISSUES.filter(i => !i.when || i.when());
  const getOpt = k => k[0] === '$' ? moneyOpt(k.slice(1)) : OPT[k];
  const val = (f) => typeof f === 'function' ? f() : f;
  function urgent() { return live().filter(i => i.sev() > 0).sort((a, b) => b.sev() - a.sev()); }

  async function open(issueId) {
    if (UI.busy || S.pendingEvent) return;
    const iss = live(), cur = iss.find(i => i.id === issueId) || urgent()[0] || iss[0], P = people();
    const sevTag = i => i.sev() === 2 ? '<b class="bad">urgent</b>' : i.sev() === 1 ? '<b class="warn">watch</b>' : '<span class="muted">ok</span>';
    const recBy = k => PANEL.filter(p => (cur.rec[p.id] || []).includes(k));
    const optKeys = cur.opts.filter(k => { if (k === '$imf' && S.fin && S.fin.imf) return false; if (k === 'rule' && S.fiscalRule) return false; const o = getOpt(k); return o && (!o.ok || o.ok()); });
    const doneHere = (S.expertDone && S.expertDone.turn === S.turn) ? S.expertDone.ids : [];
    const html = `<div class="experts"><div class="doc-top">${myFlag()} PRESIDENT'S OFFICE · POLICY ROUNDTABLE · ${typeof Clock !== 'undefined' ? Clock.label() : turnLabel()}</div>
      <h2>🧠 Ask the experts</h2>
      <div class="ex-issues">${iss.map(i => `<button class="ex-iss ${i === cur ? 'on' : ''}" data-iss="${i.id}">${i.icon} ${i.name} ${sevTag(i)}</button>`).join('')}</div>
      <div class="ex-facts">${cur.icon} ${cur.facts()}</div>
      <div class="ex-panel">${PANEL.map(p => `<div class="ex-p"><div class="ex-av">${avatarSVG(P[p.id].look, p.id === 'opp' ? -1 : 0, 46)}</div>
        <div><b>${p.icon} ${esc(P[p.id].name)}</b><small>${p.role()}</small><p>“${cur.say[p.id]()}”</p>
        ${(cur.rec[p.id] || []).length ? `<div class="ex-rec">Recommends: ${(cur.rec[p.id] || []).map(k => `<span>${String.fromCharCode(65 + optKeys.indexOf(k))}</span>`).join(' ')}</div>` : ''}</div></div>`).join('')}</div>
      <h3>Your options</h3>
      <div class="ex-opts">${optKeys.map((k, n) => { const o = getOpt(k), rb = recBy(k), dn = doneHere.includes(k);
        return `<button class="ex-o" data-opt="${k}" ${dn || S.pc < o.pc ? 'disabled' : ''}><div class="ex-oh"><span class="ex-l">${String.fromCharCode(65 + n)}</span><b>${o.t()}</b>${o.pc ? `<small class="pc">⭐${o.pc}</small>` : ''}</div>
          <div class="ex-pc"><span class="good">✔ ${val(o.pros)}</span><span class="bad">✘ ${val(o.cons)}</span></div>
          <div class="ex-who">${dn ? '✓ done this half-year' : rb.length ? `Backed by: ${rb.map(p => p.icon).join(' ')}` : '<span class="muted">No expert backs this</span>'}</div></button>`; }).join('')}</div>
      ${edu('Real presidents rarely decide alone. They hear economists, the central bank, international institutions, business and unions — who often disagree — and then weigh the trade-offs.')}
      <div class="doc-actions"><button class="btn" id="ex-x">Close</button></div></div>`;
    const choice = await new Promise(res => {
      modal(html, true);
      document.querySelectorAll('#modal [data-iss]').forEach(b => b.onclick = () => res({ iss: b.dataset.iss }));
      document.querySelectorAll('#modal [data-opt]').forEach(b => b.onclick = () => res({ opt: b.dataset.opt }));
      $('#ex-x').onclick = () => res(null);
    });
    closeModal();
    if (!choice) return;
    if (choice.iss) return open(choice.iss);
    const k = choice.opt, o = getOpt(k);
    if (o.money) { UI.tab = 'money'; render(); return Money.decide(o.money); }
    if (S.pc < o.pc) return;
    S.pc -= o.pc;
    const msg = o.run();
    if (!S.expertDone || S.expertDone.turn !== S.turn) S.expertDone = { turn: S.turn, ids: [] };
    S.expertDone.ids.push(k);
    const fail = msg.startsWith('✗');
    if (fail) S.pc += o.pc;
    toast(msg.replace('✗ ', ''), fail ? 'bad' : 'good');
    if (!fail) (S.agenda = S.agenda || []).push({ turn: S.turn, min: 'finance', label: o.t(), kind: 'expert', result: msg, issue: cur.name });
    save(); render();
    if (o.after && !fail) await o.after();
  }
  return { open, urgent, defPct };
})();
