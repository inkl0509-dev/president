/* ============================================================
   TREASURY BILLS — the government borrows short-term at home.
   1. Plan: choose how much to offer at each tenor (28/91/182/364
      days) and the rate (Maldives: fixed "tap" rates, as the
      MMA uses; other countries: an auction).
   2. Investors subscribe (banks, the pension fund, insurers…).
   3. Allotment & settlement: cash arrives in the Treasury.
   4. Every half-year maturing bills must be repaid — usually by
      selling new ones ("rolling over"). If buyers stay away,
      that is a funding crisis.
   ============================================================ */

const TBills = (() => {
  const mv = () => COUNTRY.id === 'mv';
  const TEN = [28, 91, 182, 364];
  const label = d => mv() && d === 91 ? '91/98-day' : `${d}-day`;
  const peg = () => (S.fin && S.fin.peg) || 15.42;
  // amounts: game money units internally; shown as MVR millions in the Maldives
  const toLocal = u => mv() ? u * (S.scale || 1) * 1000 * peg() : u;
  const fromLocal = v => mv() ? v / ((S.scale || 1) * 1000 * peg()) : v;
  const show = u => mv() ? `MVR ${Math.round(toLocal(u)).toLocaleString('en')}M` : money(u);
  const STEP = () => mv() ? fromLocal(250) : S.gdp * .0025;
  const price = (r, d) => 100 / (1 + r / 100 * d / 365);
  const INVESTORS = () => mv() ? [
    ['Bank of Maldives', .30, 'short'], ['State Bank of India (Malé)', .11, 'short'], ['Mauritius Commercial Bank', .06, 'short'], ['Commercial Bank of Maldives', .06, 'short'],
    ['Bank of Ceylon', .05, 'short'], ['Habib Bank', .04, 'short'], ['Maldives Pension Administration Office (pension fund)', .2, 'long'],
    ['Insurance companies', .05, 'long'], ['State-owned enterprises', .07, 'short'], ['Individual investors', .03, 'long'],
  ] : [['Commercial banks', .55, 'short'], ['Pension funds', .2, 'long'], ['Insurance companies', .1, 'long'], ['Money-market funds', .1, 'short'], ['Individual investors', .05, 'long']];

  function st() {
    if (!S.tb) S.tb = { out: [], series: 0, bump: 0, liq: mv() ? fromLocal(7000) : S.gdp * .07, hist: [] };
    return S.tb;
  }
  const rates = () => { const b = st().bump, cb = (S.cb || 4); return mv() ? { 28: 3.5 + b, 91: 3.87 + b, 182: 4.23 + b, 364: 4.6 + b } : { 28: Math.max(.5, cb - .3 + b), 91: cb + b, 182: cb + .3 + b, 364: cb + .6 + b }; };
  // how much investors want to buy this half-year
  function appetite() {
    const t = st(), conf = clamp(1 - Math.max(0, debtPct() - 90) / 250, .35, 1) * (S.fin ? clamp(1 - Math.max(0, S.fin.exp - 45) / 100, .5, 1) : 1);
    return t.liq * conf * (1 + st().bump * .35);
  }
  const outstanding = () => st().out.reduce((s, l) => s + l.face, 0);
  const dueAt = t => st().out.filter(l => l.due === t);

  // ---------- issuing ----------
  async function issue() {
    if (!S || S.phase !== 'govern' || UI.busy || S.pendingEvent) return;
    const t = st();
    if (t.lastIssue === S.turn) return toast('One T-bill issue per half-year. You can issue again next half-year.', 'bad');
    const amt = { 28: STEP() * 2, 91: STEP(), 182: STEP(), 364: STEP() * 2 };
    const bc = budgetCalc(), need = Math.max(0, -bc.bal), due = dueAt(S.turn).reduce((s, l) => s + l.face, 0);
    const plan = await new Promise(res => {
      const draw = () => {
        const R = rates(), tot = TEN.reduce((s, d) => s + amt[d], 0), cash = TEN.reduce((s, d) => s + amt[d] * price(R[d], d) / 100, 0);
        const m = modal(`<div class="tb"><div class="scene-title">📜 ${mv() ? 'Ministry of Finance · Maldives Monetary Authority (agent)' : 'Ministry of Finance · Central Bank (agent)'}</div>
          <h2>Treasury bills — Invitation to subscribe</h2>
          <p class="m-body small">Series <b>TB-${yearNow()}-${String(t.series + 1).padStart(3, '0')}</b>. This half-year the budget needs about <b>${show(need)}</b>${due ? ` and <b>${show(due)}</b> of old T-bills fall due` : ''}. Investors have about <b>${show(appetite())}</b> they could put into T-bills.</p>
          <table class="bidtable tb-t"><tr><th>Tenor</th><th>Rate</th><th>Price per 100</th><th>Amount offered (face value)</th><th>Cash you receive</th></tr>
          ${TEN.map(d => `<tr><td><b>${label(d)}</b></td><td>${fmt(R[d], 2)}%</td><td>${price(R[d], d).toFixed(4)}</td>
            <td><button class="btn small" data-a="${d}" data-s="-1">−</button> <b>${show(amt[d])}</b> <button class="btn small" data-a="${d}" data-s="1">+</button></td><td>${show(amt[d] * price(R[d], d) / 100)}</td></tr>`).join('')}
          <tr><td colspan="3"><b>Total</b></td><td><b>${show(tot)}</b> to repay at maturity</td><td><b>${show(cash)}</b> today</td></tr></table>
          <div class="tb-rate">${mv() ? 'Tap rates are fixed by the government (the MMA sells at these rates to anyone).' : 'Indicative auction rates — the final rate depends on bids.'}
            <button class="btn small" data-bump="-0.25" ${t.bump <= -0.5 ? 'disabled' : ''}>Lower rates −0.25</button> <button class="btn small" data-bump="0.25" ${t.bump >= 2 ? 'disabled' : ''}>Raise rates +0.25</button>
            <small class="muted">Higher rates attract more buyers but cost more interest.</small></div>
          <p class="small">The difference between what you repay (<b>${show(tot)}</b>) and the cash you get today (<b>${show(cash)}</b>) — <b>${show(tot - cash)}</b> — is the interest.</p>
          ${edu('A T-bill is sold below its face value and repaid at face value on maturity. Short bills are cheap but must be refinanced again and again (“rolled over”); longer bills cost a little more but give the Treasury breathing space.')}
          <div class="doc-actions"><button class="btn" id="tb-learn">📘 How T-bills work</button><button class="btn" id="tb-x">Cancel</button><button class="btn primary" id="tb-go" ${tot > 0 ? '' : 'disabled'}>📣 Publish the invitation</button></div></div>`, 'wide');
        m.querySelectorAll('[data-a]').forEach(b => b.onclick = () => { const d = +b.dataset.a; amt[d] = Math.max(0, amt[d] + STEP() * +b.dataset.s); draw(); });
        m.querySelectorAll('[data-bump]').forEach(b => b.onclick = () => { t.bump = Math.round((t.bump + +b.dataset.bump) * 100) / 100; draw(); });
        $('#tb-x', m).onclick = () => res(null);
        $('#tb-learn', m).onclick = () => res('learn');
        $('#tb-go', m).onclick = () => res({ ...amt });
      };
      draw();
    });
    if (plan === 'learn') { await School.open('tbills'); return issue(); }
    if (!plan) return closeModal();
    // ---------- subscriptions ----------
    const R = rates(), app = appetite(), inv = INVESTORS();
    const bids = inv.map(([name, share, pref]) => {
      const row = {}; TEN.forEach(d => { const w = pref === 'short' ? { 28: 1.3, 91: 1.1, 182: .9, 364: .6 }[d] : { 28: .5, 91: .8, 182: 1.1, 364: 1.5 }[d]; row[d] = Math.max(0, app * share * w / 4 * rnd(.6, 1.4)); });
      return { name, row };
    });
    const subs = {}; TEN.forEach(d => subs[d] = bids.reduce((s, b) => s + b.row[d], 0));
    const allot = {}; TEN.forEach(d => allot[d] = Math.min(plan[d], subs[d]));
    const html = `<div class="tb"><h2>📨 Subscriptions received</h2>
      <p class="m-body small">The ${mv() ? 'MMA' : 'central bank'} closed the book at 1 pm. Bids by investor (face value):</p>
      <div class="tb-scroll"><table class="bidtable tb-t"><tr><th>Investor</th>${TEN.map(d => `<th>${label(d)}</th>`).join('')}</tr>
      ${bids.map((b, i) => `<tr class="tb-row" style="animation-delay:${i * .12}s"><td>${esc(b.name)}</td>${TEN.map(d => `<td>${b.row[d] > STEP() / 10 ? show(b.row[d]) : '—'}</td>`).join('')}</tr>`).join('')}
      <tr><td><b>Total bids</b></td>${TEN.map(d => `<td><b>${show(subs[d])}</b></td>`).join('')}</tr>
      <tr><td><b>Offered</b></td>${TEN.map(d => `<td>${show(plan[d])}</td>`).join('')}</tr>
      <tr><td><b>Cover ratio</b></td>${TEN.map(d => `<td class="${subs[d] >= plan[d] ? 'good' : 'bad'}"><b>${plan[d] ? fmt(subs[d] / plan[d], 2) + '×' : '—'}</b></td>`).join('')}</tr></table></div>
      ${edu('The cover ratio compares bids with the amount offered. Above 1× the issue is oversubscribed and bids are cut back (allotted pro rata); below 1× the government gets less money than it wanted — a warning sign about confidence or bank liquidity.')}</div>`;
    await docModal(html, [{ id: 'ok', label: 'Allot & settle →', primary: true }]);
    // ---------- allotment & settlement ----------
    let face = 0, cash = 0;
    TEN.forEach(d => { const f = allot[d]; if (f <= 0) return; const c = f * price(R[d], d) / 100; face += f; cash += c;
      t.out.push({ tenor: d, face: f, rate: R[d], turn: S.turn, due: S.turn + (d === 364 ? 2 : 1) }); });
    t.series++; t.lastIssue = S.turn; t.liq = Math.max(0, t.liq - face);
    const before = Impact.snap(), avgR = face ? TEN.reduce((s, d) => s + allot[d] * R[d], 0) / face : 0;
    if (face > 0) {
      const dd = Math.max(S.debt, face);
      S.rate = Math.max(.003, ((S.rate || .02) * (dd - face) + avgR / 100 * face) / dd);
      if (S.fin) S.fin.exp = Math.min(90, (S.fin.exp || 40) + face / Math.max(1, S.gdp) * 60);
      if (face > S.gdp * .03) S.stats.economy = clamp(S.stats.economy - .5);   // crowding out
    }
    t.hist.unshift({ turn: S.turn, face, cash, avgR }); t.hist = t.hist.slice(0, 8);
    const short = TEN.filter(d => allot[d] < plan[d] - 1e-9);
    news(`Government raises ${show(cash)} in Treasury bills${short.length ? ' — issue undersubscribed' : ''}`);
    (S.agenda = S.agenda || []).push({ turn: S.turn, min: 'finance', label: `T-bill issue ${show(face)} at ${fmt(avgR, 2)}% average`, kind: 'money', result: short.length ? 'Partly subscribed' : 'Fully subscribed' });
    await docModal(`<div class="tb"><h2>✅ Settlement</h2>
      <p class="m-body">The Treasury's account at the ${mv() ? 'MMA' : 'central bank'} received <b>${show(cash)}</b>. The government owes <b>${show(face)}</b> (face value), repaid as the bills mature.</p>
      <table class="bidtable tb-t"><tr><th>Tenor</th><th>Allotted</th><th>Matures</th></tr>${TEN.filter(d => allot[d] > 0).map(d => `<tr><td>${label(d)}</td><td>${show(allot[d])}</td><td>${turnLabel(S.turn + (d === 364 ? 2 : 1))}${d < 364 ? ' (rolled within the half-year)' : ''}</td></tr>`).join('')}</table>
      ${short.length ? `<p class="bad small">⚠️ Undersubscribed at ${short.map(label).join(', ')}: investors did not want all the bills at these rates. Raise rates, issue less, or find other financing.</p>` : '<p class="good small">Fully subscribed.</p>'}
      ${edu('Domestic borrowing in local currency avoids exchange-rate risk, but it is not free: banks that buy T-bills lend less to businesses, and if most debt is short-term the Treasury must keep coming back to the market.')}</div>`,
      [{ id: 'ok', label: 'Done', primary: true }]);
    save(); render();
    Impact.show(`T-bills issued: ${show(cash)}`, before, { expected: `Repay ${show(face)} at maturity. Average rate ${fmt(avgR, 2)}%.`, lesson: 'Selling T-bills moves savings from banks and pension funds to the government. It finances the deficit without foreign currency — but every bill must be repaid or rolled over.' });
  }

  // ---------- every half-year: maturities & rollover ----------
  function step() {
    if (!S.tb) return [];
    const t = st(), msgs = [];
    t.liq += (mv() ? fromLocal(3500) : S.gdp * .035) * clamp((S.stats.economy + 50) / 100, .6, 1.3);   // new deposits flow into banks
    t.liq = Math.min(t.liq, mv() ? fromLocal(14000) : S.gdp * .14);
    const mat = dueAt(S.turn); if (!mat.length) return msgs;
    const face = mat.reduce((s, l) => s + l.face, 0), app = appetite(), rolled = Math.min(face, app * .85), gap = face - rolled;
    t.out = t.out.filter(l => l.due !== S.turn);
    if (rolled > 0) { const R = rates(); t.out.push({ tenor: 182, face: rolled, rate: R[182], turn: S.turn, due: S.turn + 1, roll: true }); t.liq = Math.max(0, t.liq - rolled); }
    msgs.push(`📜 ${show(face)} of T-bills matured: ${show(rolled)} rolled over${gap > 1e-6 ? `, ${show(gap)} repaid from the budget` : ''}`);
    if (gap > S.gdp * .01) { S.rate += .002; S.ga.business = clamp(S.ga.business - 2); news(`T-bill rollover falls short by ${show(gap)}; government pays more to borrow`); msgs.push('⚠️ Rollover shortfall: investors would not buy enough new bills — borrowing costs rise.'); }
    return msgs;
  }
  function html() {
    const t = st(), byT = TEN.map(d => [d, t.out.filter(l => l.tenor === d).reduce((s, l) => s + l.face, 0)]);
    const nextDue = dueAt(S.turn).reduce((s, l) => s + l.face, 0);
    return `<h3>📜 Treasury bills <button class="btn small" data-act="tbIssue" ${t.lastIssue === S.turn || S.pendingEvent ? 'disabled' : ''}>Issue T-bills</button> <button class="btn small ghost" data-act="learn" data-id="tbills">📘 How they work</button></h3>
      <div class="overview">${byT.map(([d, v]) => `<div class="ov"><span>${label(d)}</span><b>${show(v)}</b></div>`).join('')}
        <div class="ov"><span>Outstanding</span><b>${show(outstanding())}</b></div><div class="ov"><span>Due this half-year</span><b class="${nextDue ? 'warn' : ''}">${show(nextDue)}</b></div>
        <div class="ov"><span>Investor appetite</span><b>${show(appetite())}</b></div></div>
      ${t.lastIssue === S.turn ? '<p class="muted small">✓ This half-year\'s issue is done.</p>' : ''}`;
  }
  return { issue, step, html, outstanding };
})();
