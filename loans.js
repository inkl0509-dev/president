/* ============================================================
   LOANS — discussed with ministers in the cabinet room.
   The Minister of Finance tables the offers; other ministers
   give their views; the president picks the lender, amount and
   purpose. Cheap long loans lower the average interest rate,
   expensive ones raise it; foreign-currency loans add dollars.
   Terms are typical/approximate (game estimates).
   ============================================================ */

const Loans = (() => {
  const mv = () => COUNTRY.id === 'mv';
  const peg = () => typeof Money !== 'undefined' && Money.peg();
  const LENDERS = () => [
    { id: 'dom', icon: '🏦', name: mv() ? 'Local banks (Bank of Maldives, MIB, SBI Malé)' : 'Domestic banks (government bonds & loans)', rate: mv() ? 8 : Math.max(3, (S.cb || 4) + 1.5), years: 3, fx: false, tied: false,
      terms: 'Fast, in local currency. Banks lend less to businesses (crowding out) and hold more government debt.', min: 'finance' },
    { id: 'comm', icon: '🌍', name: 'Foreign commercial banks (syndicated loan)', rate: mv() ? 11 : Math.max(5, (S.cb || 4) + 3 + Math.max(0, debtPct() - 80) / 20), years: 5, fx: true, tied: false,
      terms: 'Quick and flexible, but expensive for a country with high debt. Repaid in dollars.', min: 'economy', needCover: true },
    { id: 'wb', icon: '🌐', name: mv() ? 'World Bank / Asian Development Bank (concessional)' : 'World Bank / regional development bank', rate: 1.5, years: 25, fx: true, tied: true,
      terms: 'Very cheap and long, but only for specific projects, with strict procurement and environmental rules. Money arrives as the project is built.', min: 'infra', needRep: 45 },
    ...(mv() ? [
      { id: 'inx', icon: '🇮🇳', name: 'India EXIM Bank line of credit', rate: 1.75, years: 20, fx: true, tied: true,
        terms: 'Cheap and long; contracts usually go to Indian companies. Strengthens ties with India.', min: 'foreign' },
      { id: 'cnx', icon: '🇨🇳', name: 'China EXIM Bank loan', rate: 2, years: 20, fx: true, tied: true,
        terms: 'Cheap and large; contracts usually go to Chinese companies. Some partners may be wary.', min: 'foreign' },
      { id: 'isdb', icon: '🕌', name: 'Islamic Development Bank / Saudi Fund for Development', rate: 1.5, years: 25, fx: true, tied: true,
        terms: 'Shariah-compliant, concessional; for health, education, water and housing projects.', min: 'health' },
    ] : [
      { id: 'bil', icon: '🤝', name: 'Bilateral loan from a partner government', rate: 2.5, years: 15, fx: true, tied: true,
        terms: 'Cheap; contracts often go to the lender\'s companies.', min: 'foreign' },
    ]),
  ];
  const SIZES = () => mv() ? [[50, '$50M'], [100, '$100M'], [200, '$200M']] : [[1, '1% of GDP'], [2, '2% of GDP'], [4, '4% of GDP']];
  const toUnits = v => mv() ? v / ((S.scale || 1) * 1000) : S.gdp * v / 100;   // $M (Maldives) or % of GDP → game units
  const toUSD = v => mv() ? v : Math.round(S.gdp * v / 100 * (S.scale || 1) * 1000);
  const PURPOSES = ['budget', 'hospital', 'school', 'housing', 'solar', 'port', 'airport', 'highway'];
  const purposeName = p => p === 'budget' ? 'General budget support' : (PROJECTS[p] ? `${PROJECTS[p].icon} ${PROJECTS[p].name} projects` : p);

  // what each minister says about a lender
  function view(minId, L) {
    const def = -budgetCalc().bal * 2 / S.gdp * 100;
    const T = {
      finance: L.rate >= 8 ? `At ${L.rate}% this is expensive. With debt at ${fmt(debtPct())}% of GDP I would only use it as a last resort.` : `At ${L.rate}% over ${L.years} years this is the cheapest money we can get — I support it, but only for productive projects.`,
      economy: L.tied ? 'Tied loans mean foreign contractors. I want local firms to get sub-contracts.' : 'Quick money keeps the economy moving — but higher rates hurt our credit rating.',
      infra: L.tied ? 'This finances exactly the harbours, roads and housing we need. The paperwork is heavy, but it is worth it.' : 'Any money for projects is welcome; we have a long waiting list in the atolls.',
      foreign: L.id === 'inx' ? 'Good for our partnership with India — our largest neighbour and a key supporter in emergencies.' : L.id === 'cnx' ? 'China lends big, but we must balance our relationships carefully.' : L.id === 'comm' ? 'Markets will see this as a sign of stress. Investors watch every loan we take.' : 'Development banks improve our reputation for good governance.',
      health: L.id === 'isdb' ? 'This could finally fund the regional hospitals we have been asking for.' : 'Please keep some for health — clinics in the islands are overcrowded.',
      tourism: 'If it builds airports and harbours, tourism and dollar income will grow.',
      education: 'Schools need investment, but please do not saddle the next generation with expensive debt.',
    };
    return T[minId] || (def > 4 ? 'Our deficit is already high. Borrow only what we can repay.' : 'I support it if the money is spent well.');
  }
  async function discuss() {
    if (!S || S.phase !== 'govern') return;
    Cabinet.ensure();
    let sel = LENDERS()[0].id, size = SIZES()[1][0], purpose = 'budget';
    const panelMins = ['finance', 'economy', 'infra', 'foreign', mv() ? 'tourism' : 'health'].filter(id => S.cabinet.some(c => c.id === id));
    const draw = () => {
      const Ls = LENDERS(), L = Ls.find(x => x.id === sel), amt = toUSD(size), avg = (S.rate || .02) * 100;
      const blocked = (L.needCover && peg() && Money.cover() < 1) ? 'Banks will not lend: reserves are too low.' : (L.needRep && (S.rep || 50) < L.needRep) ? `Needs international reputation ${L.needRep}+ (now ${fmt(S.rep || 50)}).` : (L.tied && purpose === 'budget') ? 'This lender only finances specific projects — choose a purpose.' : '';
      const html = `<div class="loans"><div class="scene-title">🏛️ Cabinet meeting · 💳 Financing & bank loans</div>
        <p class="m-body small">The ${esc(Cabinet.get('finance').title)} has tabled the loan offers. Debt is <b>${fmt(debtPct())}% of GDP</b>, average interest <b>${fmt(avg, 2)}%</b>${peg() ? `, reserves <b>$${Math.round(S.fin.res)}M</b>` : ''}.</p>
        <div class="ln-list">${Ls.map(x => `<button class="ln ${x.id === sel ? 'on' : ''}" data-ln="${x.id}"><b>${x.icon} ${esc(x.name)}</b><span class="ln-t"><span>${x.rate}% a year</span><span>${x.years} years</span><span>${x.fx ? 'foreign currency' : 'local currency'}</span>${x.tied ? '<span>project-tied</span>' : ''}</span><small>${esc(x.terms)}</small></button>`).join('')}</div>
        <h3>🗣️ The ministers discuss</h3>
        <div class="ln-mins">${panelMins.map(id => { const mi = Cabinet.get(id); return `<div class="ex-p"><div class="ex-av">${avatarSVG(mi.look, 0, 40)}</div><div><b>${mi.icon} ${esc(mi.name)}</b><small>${esc(mi.title)}</small><p>“${esc(view(id, L))}”</p></div></div>`; }).join('')}</div>
        <h3>Your decision</h3>
        <div class="ln-dec"><div><div class="lbl">Amount</div>${SIZES().map(([v, l]) => `<button class="btn small ${v === size ? 'primary' : ''}" data-sz="${v}">${l}</button>`).join(' ')}</div>
          <div><div class="lbl">Purpose</div><select id="ln-purpose">${PURPOSES.filter(p => p === 'budget' || PROJECTS[p]).map(p => `<option value="${p}" ${p === purpose ? 'selected' : ''}>${purposeName(p)}</option>`).join('')}</select></div></div>
        <div class="ln-sum">Borrow <b>${mv() ? '$' + amt + 'M' : money(toUnits(size))}</b> at <b>${L.rate}%</b> for <b>${L.years} years</b> → interest about <b>${mv() ? '$' + Math.round(amt * L.rate / 100) + 'M' : money(toUnits(size) * L.rate / 100)} a year</b>. Your average interest rate goes ${L.rate > avg ? 'up' : 'down'}.${L.fx && peg() ? ' Dollars go into the reserves now and must be repaid in dollars.' : ''}</div>
        ${blocked ? `<p class="bad small">⚠️ ${blocked}</p>` : ''}
        ${edu('Governments compare loans on interest rate, length, currency and conditions. Cheap, long, concessional loans from development banks are best for projects; expensive short commercial loans are risky. Borrowing in foreign currency is dangerous if your own currency falls.')}
        <div class="doc-actions"><button class="btn" id="ln-x">Not now</button><button class="btn primary" id="ln-ok" ${blocked ? 'disabled' : ''}>✅ Take this loan</button></div></div>`;
      const m = modal(html, 'wide');
      m.querySelectorAll('[data-ln]').forEach(b => b.onclick = () => { sel = b.dataset.ln; draw(); });
      m.querySelectorAll('[data-sz]').forEach(b => b.onclick = () => { size = +b.dataset.sz; draw(); });
      $('#ln-purpose', m).onchange = e => { purpose = e.target.value; draw(); };
      $('#ln-x', m).onclick = () => done(false);
      const okb = $('#ln-ok', m); if (okb) okb.onclick = () => done(true);
      return m;
    };
    let done;
    const ok = await new Promise(res => { done = res; draw(); });
    closeModal();
    if (!ok) return;
    const L = LENDERS().find(x => x.id === sel), units = toUnits(size), usd = toUSD(size);
    Impact.run(`Loan: ${L.name}`, () => {
      const d = Math.max(S.debt, units);
      S.rate = Math.max(.003, ((S.rate || .02) * (d - units) + L.rate / 100 * units) / d);    // refinance part of the debt at the loan's rate
      if (L.fx && peg()) { S.fin.res += usd; S.fin.sched.push({ turn: S.turn + Math.min(L.years * 2, 12), amt: Math.round(usd * (1 + L.rate / 100 * Math.min(L.years, 6))), what: `Repay ${L.name}` }); }
      if (L.id === 'dom') { if (S.fin) S.fin.exp = Math.min(90, (S.fin.exp || 40) + 6); S.stats.economy = clamp(S.stats.economy - 1); }
      if (L.id === 'comm') S.rep = clamp((S.rep || 50) - 2);
      if (L.id === 'wb' || L.id === 'isdb') S.rep = clamp((S.rep || 50) + 2);
      if (purpose !== 'budget') S.loanFor = { type: purpose, lender: L.name, until: S.turn + 4 };
      (S.loans = S.loans || []).push({ lender: L.name, icon: L.icon, amt: mv() ? `$${usd}M` : money(units), rate: L.rate, years: L.years, turn: S.turn, purpose: purposeName(purpose) });
      news(`Government signs ${mv() ? '$' + usd + 'M' : money(units)} loan with ${L.name} at ${L.rate}%`);
    }, { expected: `${purpose === 'budget' ? 'Finances the budget' : `Finances new ${purposeName(purpose).toLowerCase()} — tender one now`}. Interest about ${L.rate}% a year for ${L.years} years.`,
      lesson: 'A loan does not create money — it brings spending forward and must be repaid with interest. The cheaper and longer the loan, the lighter the burden on future budgets.' });
    (S.agenda = S.agenda || []).push({ turn: S.turn, min: 'finance', label: `Loan from ${L.name} (${L.rate}%, ${L.years} yrs)`, kind: 'money', result: 'Loan agreement signed' });
    save(); render();
    if (purpose !== 'budget' && PROJECTS[purpose]) { const r = REGIONS.find(x => !buildBlock(purpose, x.id)); if (r) { UI.region = r.id; await Procure.run(purpose); } }
  }
  function table() {
    const L = S.loans || []; if (!L.length) return '<p class="muted small">No loans signed yet. Discuss financing in a cabinet meeting.</p>';
    return `<table class="fin-t"><tr><th>When</th><th>Lender</th><th>Amount</th><th>Rate</th><th>Years</th><th>Purpose</th></tr>${L.map(l => `<tr><td>${turnLabel(l.turn)}</td><td>${l.icon} ${esc(l.lender)}</td><td>${l.amt}</td><td>${l.rate}%</td><td>${l.years}</td><td>${esc(l.purpose)}</td></tr>`).join('')}</table>`;
  }
  return { discuss, table };
})();
