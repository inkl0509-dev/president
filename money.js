/* ============================================================
   MONEY & BANKS — central bank, currency, banks, taxes, reserves
   and financing decisions. The Maldives is modelled in detail
   (MMA, rufiyaa peg, foreign-currency reserves, swap with India,
   sukuk, T-GST, Green Tax); other countries get their real
   central bank and largest banks with a simpler model.
   ============================================================ */

const FIN = {
  veloria: { cb: 'Central Bank of Veloria', short: 'CBV', cur: 'Veloria crown', regime: 'float', regimeText: 'Floating exchange rate with an inflation target',
    banks: [['National Bank of Veloria', 'State-owned · largest lender'], ['Crown Commercial Bank', 'Private'], ['Harbor Savings Bank', 'Private · mortgages'], ['Farmers Cooperative Bank', 'Cooperative']] },
  mv: { cb: 'Maldives Monetary Authority (MMA)', short: 'MMA', since: 1981, cur: 'Maldivian rufiyaa (MVR)', regime: 'peg', peg: 15.42,
    regimeText: 'Rufiyaa pegged to the US dollar at about MVR 15.42 per dollar',
    tools: '1-week reverse repo rate 7% · overnight deposit facility 0.25% · minimum reserve requirement · open market operations',
    taxAuth: 'MIRA (Maldives Inland Revenue Authority)',
    taxes: [['G-GST (general sector)', '8%'], ['T-GST (tourism sector)', '17% since 1 July 2025 — also charged on offshore booking platforms'], ['Green Tax', '$12 per tourist per night at resorts · $6 at small guesthouses'], ['Tourism land rent, departure tax, airport development fee', 'paid in US dollars — a key source of dollars']],
    exchange: 'Maldives Stock Exchange (MSE)',
    banks: [['Bank of Maldives (BML)', 'Local · majority state-owned · listed on the MSE · over half the market'], ['State Bank of India — Malé', 'Foreign branch · the first bank in the Maldives (1974)'],
      ['Maldives Islamic Bank (MIB)', 'Local · Islamic banking · part-owned by the state'], ['Bank of Ceylon (BOC)', 'Foreign branch'], ['Habib Bank Limited (HBL)', 'Foreign branch'],
      ['Mauritius Commercial Bank (MCB) Maldives', 'Foreign-owned subsidiary'], ['Commercial Bank of Maldives (CBM)', 'Local · opened 2016']],
    banksNote: 'The MMA has also issued pre-operational licences to BIC Bank Maldives and Maldives Finance and Leasing Bank.',
    reserves: 590, importsM: 285,          // official reserves (US$ million) and imports per month
    premium: 33,                            // parallel-market premium: MVR 20.50 vs the 15.42 peg
    swap: { amt: 320, due: 1, text: 'Reserve Bank of India currency swap (INR 30 billion ≈ $320M)' },
    sched: [[5, 175, 'Treasury bonds held by India — first tranche'], [7, 175, 'Treasury bonds held by India — second tranche']],
    other: 60 },                            // other external debt service per half-year (game estimate)
  uz: { cb: 'Central Bank of the Republic of Uzbekistan', short: 'CBU', cur: "Uzbek so'm (UZS)", regime: 'float', regimeText: 'Managed float with an inflation target',
    banks: [['National Bank of Uzbekistan (NBU)', 'State-owned · largest bank'], ['Uzpromstroybank (SQB)', 'State-owned'], ['Kapitalbank', 'Private'], ['Hamkorbank', 'Private · small business'], ['TBC Bank Uzbekistan', 'Digital bank']] },
  kz: { cb: 'National Bank of Kazakhstan', short: 'NBK', cur: 'Kazakhstani tenge (KZT)', regime: 'float', regimeText: 'Floating tenge with an inflation target',
    banks: [['Halyk Bank', 'Largest bank'], ['Kaspi.kz', 'Payments, shopping and banking super-app'], ['ForteBank', 'Private'], ['Otbasy Bank', 'State housing savings bank']] },
  tr: { cb: 'Central Bank of the Republic of Türkiye (CBRT)', short: 'CBRT', cur: 'Turkish lira (TRY)', regime: 'float', regimeText: 'Floating lira; one-week repo rate is the policy rate',
    banks: [['Ziraat Bankası', 'State-owned · largest bank'], ['Türkiye İş Bankası', 'Private'], ['Garanti BBVA', 'Private'], ['Akbank', 'Private'], ['VakıfBank', 'State-owned']] },
  us: { cb: 'Federal Reserve (the Fed)', short: 'Fed', cur: 'US dollar (USD)', regime: 'float', regimeText: "The world's main reserve currency; the Fed targets 2% inflation and maximum employment",
    banks: [['JPMorgan Chase', 'Largest US bank'], ['Bank of America', 'Retail & investment'], ['Citigroup', 'Global bank'], ['Wells Fargo', 'Retail & mortgages']] },
  uk: { cb: 'Bank of England', short: 'BoE', cur: 'Pound sterling (GBP)', regime: 'float', regimeText: 'Floating pound; the Monetary Policy Committee targets 2% inflation',
    banks: [['HSBC', 'Global bank, London HQ'], ['Barclays', 'Retail & investment'], ['Lloyds Banking Group', 'Largest UK retail bank'], ['NatWest Group', 'Retail & business']] },
  de: { cb: 'Deutsche Bundesbank (part of the Eurosystem)', short: 'Bundesbank', cur: 'Euro (EUR)', regime: 'euro', regimeText: 'Euro area member: interest rates are set by the European Central Bank in Frankfurt',
    banks: [['Deutsche Bank', 'Largest private bank'], ['Commerzbank', 'Private'], ['Sparkassen', 'Public savings banks in every town'], ['DZ Bank', 'Central bank of the cooperative banks']] },
  fr: { cb: 'Banque de France (part of the Eurosystem)', short: 'Banque de France', cur: 'Euro (EUR)', regime: 'euro', regimeText: 'Euro area member: interest rates are set by the European Central Bank',
    banks: [['BNP Paribas', 'Largest French bank'], ['Crédit Agricole', 'Cooperative group'], ['Société Générale', 'Private'], ['Groupe BPCE', 'Cooperative group']] },
  jp: { cb: 'Bank of Japan (BoJ)', short: 'BoJ', cur: 'Japanese yen (JPY)', regime: 'float', regimeText: 'Floating yen; the BoJ targets 2% inflation',
    banks: [['MUFG', 'Largest bank group'], ['Sumitomo Mitsui (SMBC)', 'Megabank'], ['Mizuho', 'Megabank'], ['Japan Post Bank', 'Huge deposit base']] },
  in: { cb: 'Reserve Bank of India (RBI)', short: 'RBI', cur: 'Indian rupee (INR)', regime: 'float', regimeText: 'Managed float; the RBI targets 4% inflation (±2%)',
    banks: [['State Bank of India', 'State-owned · largest bank'], ['HDFC Bank', 'Largest private bank'], ['ICICI Bank', 'Private'], ['Punjab National Bank', 'State-owned']] },
  br: { cb: 'Banco Central do Brasil', short: 'BCB', cur: 'Brazilian real (BRL)', regime: 'float', regimeText: 'Floating real with an inflation target; the Selic is the policy rate',
    banks: [['Itaú Unibanco', 'Largest private bank'], ['Banco do Brasil', 'State-controlled'], ['Bradesco', 'Private'], ['Caixa Econômica Federal', 'State-owned · housing loans']] },
};

const Money = (() => {
  const F = () => FIN[COUNTRY.id] || FIN.veloria;
  const peg = () => F().regime === 'peg';
  const usdToUnits = m => m / ((S.scale || 1) * 1000);   // US$ million → game money units
  function init() {
    const f = F();
    S.fin = { exp: 40, adv: 0, fca: false, tgst: 17, green: 12, imf: false, done: { turn: 0, ids: [] }, log: [] };
    if (f.regime === 'peg') Object.assign(S.fin, { peg: f.peg, res: f.reserves, prem: f.premium, swap: { ...f.swap }, sched: f.sched.map(x => ({ turn: x[0], amt: x[1], what: x[2] })) });
  }
  const ensure = () => { if (!S.fin) init(); return S.fin; };
  const cover = () => ensure().res / F().importsM;
  const pegRate = () => ensure().peg || F().peg;
  const rate = () => pegRate() * (1 + (S.fin.prem || 0) / 100);
  function risk() {
    if (!peg()) return debtPct() > (S.crisisAt || 120) ? ['High', 'bad'] : debtPct() > (S.debtSoft || 80) ? ['Moderate', 'warn'] : ['Low', 'good'];
    const c = cover();
    return c < 1 ? ['Very high — default danger', 'bad'] : c < 2 ? ['High', 'bad'] : c < 3 ? ['Elevated', 'warn'] : ['Moderate', 'good'];
  }
  function dueNow(t = S.turn) {
    const fin = ensure(), out = (fin.sched || []).filter(x => x.turn === t).map(x => ({ amt: x.amt, what: x.what }));
    if (fin.swap && fin.swap.amt && fin.swap.due === t) out.push({ amt: fin.swap.amt, what: 'Repay the India currency swap', swap: true });
    if (F().other) out.push({ amt: F().other, what: 'Other external loans (game estimate)' });
    return out;
  }
  // ---- called once per half-year, after the budget is settled ----
  function step(r) {
    const fin = ensure();
    if (S.inflRebound) { S.infl += S.inflRebound; S.inflRebound = 0; }   // price controls wear off
    if (!peg()) return [];
    const f = F(), msgs = [];
    const airports = typeof count === 'function' ? count('airport') : 0;
    let inflow = (70 + (S.stats.economy - 50) * 2.5 + (fin.fca ? 50 : 0) + (fin.tgst - 17) * 25 + (fin.green - 12) * 6 + airports * 12 - Math.max(0, S.infl - S.inflTarget) * 6 - fin.adv * 15) * rnd(.8, 1.2);
    const due = dueNow(); let paid = 0;
    due.forEach(d => { paid += d.amt; if (d.swap) fin.swap = { amt: 0, due: null }; });
    fin.res = Math.round(fin.res + inflow - paid);
    if (paid > F().other) msgs.push(`🏦 Paid $${Math.round(paid)}M of foreign debt: ${due.filter(d => d.amt !== F().other || d.swap).map(d => d.what).join(', ')}`);
    const c = cover(), target = (c < 1 ? 50 : c < 2 ? 32 : c < 3 ? 18 : 6) + fin.adv * 4;
    fin.prem = Math.max(0, fin.prem + (target - fin.prem) * .45);
    if (fin.res < 0) {            // the peg breaks
      fin.res = 120; fin.devalued = (fin.devalued || 0) + 1;
      const old = pegRate(); fin.peg = Math.round(old * 1.3 * 100) / 100; fin.prem = 10;
      S.infl += 12; S.debt *= 1.15; GK.forEach(g => { S.ga[g] = clamp(S.ga[g] - 8); S.eventMods[g] -= 5; }); S.rep = clamp((S.rep || 50) - 12);
      news(`CURRENCY CRISIS: rufiyaa devalued from ${old} to ${fin.peg} per dollar after reserves run dry`);
      msgs.push(`💥 Reserves ran out — the rufiyaa peg broke (MVR ${old} → ${fin.peg}). Imports cost more; foreign debt jumped.`);
    } else if (c < 1) {
      GK.forEach(g => { if (g === 'workers' || g === 'elderly' || g === 'business') { S.ga[g] = clamp(S.ga[g] - 3); S.eventMods[g] -= 2; } });
      msgs.push(`⚠️ Dollar shortage: reserves cover only ${fmt(c, 1)} months of imports — fuel and food importers queue at the banks`);
      news(`Importers struggle to find dollars; black-market rate hits MVR ${fmt(rate(), 2)}`);
    }
    fin.log.unshift({ turn: S.turn, res: fin.res, inflow: Math.round(inflow), paid: Math.round(paid) }); fin.log = fin.log.slice(0, 8);
    return msgs;
  }

  // ---------------- financing decisions ----------------
  const visitedIndia = () => { const v = (S.visits || {}).in; return v && S.turn - v < 6; };
  const ACTS = [
    { id: 'swap', icon: '🇮🇳', when: () => peg() && COUNTRY.id === 'mv', pc: 1,
      title: () => S.fin.swap && S.fin.swap.amt ? 'Ask India to roll over the currency swap' : 'Request a new currency-swap drawdown from India',
      what: () => S.fin.swap && S.fin.swap.amt ? `The ${F().swap.text} falls due in ${turnLabel(S.fin.swap.due)}. Ask the Reserve Bank of India for another year.` : 'Ask the Reserve Bank of India for a new rupee swap under the SAARC framework (about $320M).',
      fx: 'Reserves stay up (or +$320M). Must be repaid later. Success depends on your relations with India — a state visit helps a lot.',
      edu: 'A currency swap is a short-term loan between central banks. India has given the Maldives swap support since 2012; the $400M dollar swap of 2024 was settled in April 2026 and replaced by an INR 30 billion (≈$320M) rupee swap, which India rolled over in October 2026.',
      run() {
        const ok = Math.random() < .35 + (S.rep || 50) / 200 + (visitedIndia() ? .3 : 0);
        if (!ok) return ['India has not agreed yet. A state visit to New Delhi would strengthen your case.', 'bad'];
        if (S.fin.swap && S.fin.swap.amt) { S.fin.swap.due += 2; news('India rolls over currency swap for the Maldives'); return [`India agreed. The swap now falls due in ${turnLabel(S.fin.swap.due)}.`, 'good']; }
        S.fin.res += 320; S.fin.swap = { amt: 320, due: S.turn + 2 }; news('India approves new currency swap drawdown for the Maldives'); return ['India approved. Reserves +$320M; repay in one year.', 'good'];
      } },
    { id: 'bankfx', icon: '🏦', when: () => peg(), pc: 1, title: () => 'Borrow US dollars from local banks',
      what: () => 'Ask Bank of Maldives and other banks to lend the government $150M of their dollar deposits, repayable in two years.',
      fx: 'Reserves +$150M now. Banks hold even more government debt (less credit for businesses). Repay $160M later.',
      edu: 'The IMF warns about the "sovereign–bank nexus": when banks lend too much to their own government, trouble for the state becomes trouble for the banks — and the reverse.',
      run() { S.fin.res += 150; S.fin.exp = Math.min(90, S.fin.exp + 8); S.fin.sched.push({ turn: S.turn + 4, amt: 160, what: 'Repay dollar loan from local banks' }); S.ga.business = clamp(S.ga.business - 2); S.stats.economy = clamp(S.stats.economy - 1); return ['Banks lent $150M. Their exposure to the government rose.', 'good']; } },
    { id: 'tgst', icon: '🏝️', when: () => COUNTRY.id === 'mv' && S.fin.tgst < 20, pc: 2, title: () => `Raise tourism GST (T-GST) ${S.fin.tgst}% → ${S.fin.tgst + 1}%`,
      what: () => 'Send a GST Act amendment to the People\'s Majlis. Tourists pay T-GST in dollars, so this earns foreign currency.',
      fx: 'Every half-year: more dollars into reserves and lower deficit. Resort owners and business are unhappy; too high could put tourists off.',
      edu: 'The Maldives raised T-GST from 16% to 17% on 1 July 2025. Tourism taxes are attractive because they are paid mostly by foreigners and in dollars.',
      run() { if (coalitionSeats() < majority()) return ['The Majlis rejected the amendment — you need a majority.', 'bad']; S.fin.tgst++; S.lawCost -= .35; S.ga.business = clamp(S.ga.business - 4); news(`Majlis raises tourism GST to ${S.fin.tgst}%`); return [`Passed. T-GST is now ${S.fin.tgst}%.`, 'good']; } },
    { id: 'green', icon: '🌴', when: () => COUNTRY.id === 'mv' && S.fin.green < 18, pc: 1, title: () => `Raise the Green Tax $${S.fin.green} → $${S.fin.green + 3} per night`,
      what: () => 'Raise the nightly Green Tax on resort guests; the money is earmarked for waste, water and coastal protection.',
      fx: 'More dollars and environment ▲. Resorts complain.',
      edu: 'The Green Tax doubled in December 2024 to $12 a night at resorts and $6 at small guesthouses on inhabited islands.',
      run() { if (coalitionSeats() < majority()) return ['The Majlis rejected the amendment.', 'bad']; S.fin.green += 3; S.lawCost -= .12; S.lawStat.environment += 2; S.ga.business = clamp(S.ga.business - 2); return [`Passed. Green Tax is now $${S.fin.green} a night.`, 'good']; } },
    { id: 'fca', icon: '💵', when: () => peg() && !S.fin.fca, pc: 1, title: () => 'Strictly enforce the Foreign Currency Act',
      what: () => 'Require tourism businesses to sell their dollars to local banks, and banks to sell a share to the MMA. Domestic payments must be in rufiyaa.',
      fx: 'Every half-year: about +$50M more into reserves. Business ▼, freedom ▼.',
      edu: 'The IMF said in 2026 that the Foreign Currency Act helped ease dollar shortages and rebuild reserves — but that bigger budget reforms are still needed to protect the peg.',
      run() { S.fin.fca = true; S.ga.business = clamp(S.ga.business - 4); S.lawStat.freedom -= 1; return ['Enforcement begins. Dollar inflows will rise.', 'good']; } },
    { id: 'print', icon: '🖨️', when: () => F().regime !== 'euro', pc: 1, title: () => `Ask the ${F().short} to finance the budget (print money)`,
      what: () => `The ${F().short} lends directly to the government by creating new money.`,
      fx: 'Debt ▼ a little now. Inflation ▲, black-market dollar rate ▲, reserves leak, international reputation ▼.',
      edu: 'Central-bank financing is quick but dangerous: more money chasing the same goods raises prices. The Maldives stopped exceptional use of MMA advances in 2024–25, which the IMF welcomed.',
      run() { S.debt -= S.gdp * .01; S.infl += 2.2; S.fin.adv++; if (peg()) { S.fin.prem += 8; S.fin.res -= 40; } S.rep = clamp((S.rep || 50) - 5); news(`${F().short} told to fund the budget; economists warn of inflation`); return ['Money printed. Watch inflation.', 'warn']; } },
    { id: 'sukuk', icon: '🕌', when: () => peg() && cover() >= 1, pc: 2, title: () => 'Issue a $500M international sukuk',
      what: () => 'Sell an Islamic bond (sukuk) to foreign investors, repayable in 5 years. With high debt, investors demand a very high profit rate.',
      fx: 'Reserves +$500M now. Interest costs ▲ for years; $525M to repay at maturity.',
      edu: 'The Maldives repaid its $500M 2021 sukuk in April 2026 — about $525M including the final profit payment — one of the biggest single payments in its history.',
      run() { S.fin.res += 500; S.rate += .004; S.fin.sched.push({ turn: S.turn + 10, amt: 525, what: 'Repay international sukuk' }); news('Maldives sells $500M sukuk at a high yield'); return ['Sukuk sold. Reserves +$500M.', 'good']; } },
    { id: 'imf', icon: '🌐', when: () => !S.fin.imf && ((peg() && cover() < 2.5) || debtPct() > (S.crisisAt || 120) * .9), pc: 2, title: () => 'Request an IMF programme',
      what: () => 'Ask the International Monetary Fund for a loan. In return you must cut the deficit (spending cuts, tax reform).',
      fx: 'Reserves/credibility ▲, interest rate ▼. Austerity: welfare and infrastructure budgets −1, everyone a little less happy.',
      edu: 'IMF loans come with conditions. In its 2026 review the IMF said the Maldives still has a high risk of debt distress and needs credible fiscal consolidation.',
      run() { S.fin.imf = true; if (peg()) S.fin.res += 300; S.rate = Math.max(.005, S.rate - .004); S.budget.welfare = Math.max(0, S.budget.welfare - 1); S.budget.infra = Math.max(0, S.budget.infra - 1); GK.forEach(g => S.ga[g] = clamp(S.ga[g] - 3)); S.rep = clamp((S.rep || 50) + 8); news('Government agrees IMF programme with tough conditions'); return ['IMF programme agreed (game estimate: $300M).', 'good']; } },
    { id: 'tighten', icon: '📈', when: () => F().regime !== 'euro', pc: 0, title: () => peg() ? `Ask the ${F().short} to tighten money (open market operations)` : `Ask the ${F().short} to cut interest rates`,
      what: () => peg() ? `Recommend that the ${F().short} soak up excess rufiyaa liquidity by selling bills to banks.` : `Publicly ask the ${F().short} to cut rates to boost growth.`,
      fx: 'The central bank is independent: the board decides. With a peg — tighter money, smaller black-market premium, slightly slower growth. Otherwise — a rate cut only if inflation is near target.',
      edu: 'Central banks are usually independent so politicians cannot print money before elections. The president can advise, but the board decides.',
      run() {
        if (peg()) { if (Math.random() < .75) { S.fin.prem = Math.max(0, S.fin.prem - 6); S.infl -= .6; S.stats.economy = clamp(S.stats.economy - 1); return ['The MMA board agreed and resumed open market operations.', 'good']; } return ['The MMA board decided to wait.', 'warn']; }
        if (S.infl <= S.inflTarget + 1) { S.realRate -= .5; S.stats.economy = clamp(S.stats.economy + 1.5); return [`The ${F().short} cut rates.`, 'good']; }
        S.rep = clamp((S.rep || 50) - 2); return [`The Governor declined: inflation (${fmt(S.infl, 1)}%) is above target.`, 'warn'];
      } },
  ];
  const doneThisTurn = id => S.fin.done.turn === S.turn && S.fin.done.ids.includes(id);
  async function decide(id) {
    ensure(); const A = ACTS.find(a => a.id === id); if (!A || UI.busy || S.pendingEvent) return;
    const can = S.pc >= A.pc && !doneThisTurn(id);
    const ch = await docModal(`<div class="doc"><div class="doc-top">${myFlag()} ${esc(F().cb.toUpperCase())} · MINISTRY OF FINANCE</div>
      <h2>${A.icon} ${A.title()}</h2>
      <div class="doc-sec"><b>What it is</b><p>${A.what()}</p></div>
      <div class="doc-sec"><b>Expected effect</b><p>${A.fx}</p></div>${edu(A.edu)}
      <p class="muted small">Cost: ⭐${A.pc} political capital · one decision of each kind per half-year.</p></div>`,
      [{ id: 'go', label: `Approve ${A.pc ? '⭐' + A.pc : ''}`, primary: true, disabled: !can }, { id: 'no', label: 'Not now' }]);
    if (ch !== 'go') return;
    S.pc -= A.pc; if (S.fin.done.turn !== S.turn) S.fin.done = { turn: S.turn, ids: [] }; S.fin.done.ids.push(id);
    const before = Impact.snap(), [msg, cls] = A.run(); toast(msg, cls === 'bad' ? 'bad' : 'good');
    if (cls !== 'bad') setTimeout(() => Impact.show(A.title(), before, { expected: A.fx, lesson: A.edu }), 200);
    (S.agenda = S.agenda || []).push({ turn: S.turn, min: 'finance', label: A.title(), kind: 'money', result: msg });
    save(); render();
  }

  // ---------------- panel (🏦 Money tab) ----------------
  function html() {
    const f = F(), fin = ensure(), [rk, rc] = risk();
    const box = (icon, label, val, cls = '') => `<div class="ov"><span>${icon} ${label}</span><b class="${cls}">${val}</b></div>`;
    let top = `<div class="overview">
      ${box('🏛️', 'Policy rate', `${fmt(COUNTRY.id === 'mv' ? 7 : S.cb, 2)}%`)}
      ${box('💹', 'Inflation', `${fmt(S.infl, 1)}% <small class="muted">target ${S.inflTarget}%</small>`, S.infl > S.inflTarget + 2 ? 'bad' : '')}
      ${box('📉', 'Public debt', `${fmt(debtPct())}% of GDP`, debtPct() > (S.debtSoft || 80) ? 'bad' : '')}
      ${box('⚠️', 'Debt-distress risk', rk, rc)}`;
    if (peg()) top += `${box('💵', 'Official reserves', `$${Math.round(fin.res)}M`, cover() < 2 ? 'bad' : '')}
      ${box('📦', 'Import cover', `${fmt(cover(), 1)} months`, cover() < 3 ? 'bad' : 'good')}
      ${box('💱', 'Official rate', `MVR ${fmt(pegRate(), 2)} / $`)}
      ${box('🕶️', 'Black-market rate', `MVR ${fmt(rate(), 2)} / $`, fin.prem > 15 ? 'bad' : '')}`;
    top += '</div>';
    const upcoming = peg() ? [...Array(6)].map((_, i) => S.turn + i).map(t => ({ t, d: dueNow(t).filter(x => x.amt !== f.other || x.swap) })).filter(x => x.d.length) : [];
    const cal = peg() ? `<h3>📅 Foreign debt to repay</h3>${upcoming.length ? `<table class="fin-t">${upcoming.map(x => x.d.map(d => `<tr><td>${turnLabel(x.t)}${x.t === S.turn ? ' <b class="bad">this half-year</b>' : ''}</td><td>${d.what}</td><td><b>$${d.amt}M</b></td></tr>`).join('')).join('')}</table>` : '<p class="muted small">No big repayments in the next 3 years.</p>'}
      <p class="muted small">Plus about $${f.other}M of other external loans every half-year (game estimate). Reserves fall when repayments are larger than the dollars coming in from tourism.</p>` : '';
    const acts = ACTS.filter(a => a.when()).map(a => `<button class="choice fin-act" data-act="finAct" data-id="${a.id}" ${doneThisTurn(a.id) || S.pc < a.pc || S.pendingEvent ? 'disabled' : ''}>
      <b>${a.icon} ${a.title()} ${a.pc ? `<small>⭐${a.pc}</small>` : ''}</b><span class="fx">${doneThisTurn(a.id) ? '✓ decided this half-year' : a.fx}</span></button>`).join('');
    return `<div class="money">
      <div class="cb-card"><div class="cb-h">🏦 <div><b>${f.cb}</b><small>${f.since ? `Founded ${f.since} · ` : ''}${f.cur}</small></div></div>
        <p class="small">${f.regimeText}.${f.tools ? `<br><span class="muted">Tools: ${f.tools}</span>` : ''}</p></div>
      ${top}<button class="btn small" data-act="experts" data-id="${peg() ? 'fx' : 'deficit'}">🧠 Ask the experts what to do</button>${cal}
      <h3>💳 Loans <button class="btn small" data-act="loans">Discuss a loan with ministers</button></h3>${Loans.table()}
      <h3>🧾 Financing decisions</h3><p class="muted small">Proposals from the Minister of Finance. Each shows what happens before you approve.</p>
      <div class="choices tight">${acts || '<p class="muted small">No financing decisions available.</p>'}</div>
      ${f.taxes ? `<h3>💰 Taxes <small class="muted">collected by ${f.taxAuth}</small></h3><table class="fin-t">${f.taxes.map(([k, v], i) => `<tr><td>${k}</td><td>${i === 1 && fin.tgst !== 17 ? `<b>${fin.tgst}%</b> (game)` : i === 2 && fin.green !== 12 ? `<b>$${fin.green}</b> a night (game)` : v}</td></tr>`).join('')}</table>` : ''}
      <h3>🏛️ Banks</h3><div class="banks">${f.banks.map(([n, t]) => `<div class="bank"><b>${n}</b><small>${t}</small></div>`).join('')}</div>
      ${f.banksNote ? `<p class="muted small">${f.banksNote}</p>` : ''}${f.exchange ? `<p class="muted small">Shares and bonds trade on the ${f.exchange}.</p>` : ''}
      ${peg() ? `<div class="kv"><span>Share of bank assets lent to the government</span><b class="${fin.exp > 50 ? 'bad' : ''}">${fmt(fin.exp)}% (game estimate)</b></div>` : ''}
      ${edu(peg() ? 'Why reserves matter: the Maldives imports almost everything — fuel, food, building materials — and pays in dollars. The MMA keeps the rufiyaa fixed at about 15.42 per dollar by selling dollars from its reserves. When reserves run low, banks ration dollars and a black market appears. If reserves run out, the peg breaks and prices jump.' : 'Central banks control the money supply and short-term interest rates. Higher rates cool inflation but slow growth; lower rates do the opposite.')}
    </div>`;
  }
  function brief() {   // one line for the cabinet's finance minister
    if (!peg()) return '';
    ensure(); const c = cover(), due = dueNow(S.turn).filter(x => x.amt !== F().other || x.swap).reduce((a, x) => a + x.amt, 0);
    return ` Official reserves are <b>$${Math.round(S.fin.res)}M</b> — ${fmt(c, 1)} months of imports; the black-market dollar trades at MVR ${fmt(rate(), 2)}.${due ? ` <b>$${due}M of foreign debt falls due this half-year.</b>` : ''}`;
  }
  return { init, ensure, step, html, decide, brief, cover, risk, peg, F, dueNow };
})();
