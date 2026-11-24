/* ============================================================
   NATIONAL TARGETS — at the start of each term the government
   sets measurable goals, like real governments do (budget rules,
   inflation targets, job targets). A budget surplus is always
   one of them. A target is ACHIEVED when it is met for two
   half-years in a row (a full year). Achieved targets earn
   political capital, public trust and points; missed ones cost
   trust at the end of the term.
   ============================================================ */

const TARGETS = [
  { id: 'surplus', icon: '💰', must: true, name: () => 'Balanced budget or surplus', term: 'deficit',
    val: () => budgetCalc().bal * 2 / S.gdp * 100, show: v => `${sign(v)}% of GDP`, ok: v => v >= 0,
    how: 'Revenue must be at least as big as spending plus interest. Raise taxes a little, trim spending that does not work, sell assets, or grow the economy. Cut carefully: deep cuts can cause a recession.' },
  { id: 'debt', icon: '📉', name: t => `Debt below ${t.goal}% of GDP`, term: 'debt', setup: () => Math.max(20, Math.round(debtPct()) - 5),
    val: () => debtPct(), show: v => `${fmt(v)}%`, ok: (v, t) => v <= t.goal,
    how: 'Debt falls when the budget is in surplus or when GDP grows faster than the debt. Cheaper loans and lower interest help too.' },
  { id: 'infl', icon: '🏷️', name: () => 'Inflation between 1% and 5%', term: 'inflation',
    val: () => S.infl || 0, show: v => `${fmt(v, 1)}%`, ok: v => v >= 1 && v <= 5,
    how: 'Let the central bank raise rates when inflation is high, avoid printing money and keep deficits under control.' },
  { id: 'jobs', icon: '👷', name: t => `Unemployment below ${t.goal}%`, term: 'unemp', setup: () => Math.max(3, Math.round(unemployment()) - 1),
    val: () => unemployment(), show: v => `${fmt(v, 1)}%`, ok: (v, t) => v < t.goal,
    how: 'Construction projects, factories, a growing economy and training programmes create jobs.' },
  { id: 'growth', icon: '📈', name: () => 'Economic growth of at least 1% each half-year', term: 'growth',
    val: () => S.lastGrowth || 0, show: v => `${sign(v)}%`, ok: v => v >= 1,
    how: 'Investment in infrastructure, education and a stable, predictable economy encourage growth.' },
  { id: 'power', icon: '⚡', name: () => 'Enough electricity for everyone', term: 'feas',
    val: () => energy().supply - energy().demand, show: v => v >= 0 ? `spare ${fmt(v)}` : `short ${fmt(-v)}`, ok: v => v >= 0,
    how: 'Build power plants or solar farms, or start an energy megaproject.' },
  { id: 'reserves', icon: '💵', only: () => typeof Money !== 'undefined' && Money.peg(), name: () => 'Reserves of at least 3 months of imports', term: 'reserves',
    val: () => Money.cover(), show: v => `${fmt(v, 1)} months`, ok: v => v >= 3,
    how: 'Tourism and exports bring dollars in; less imported fuel and fewer dollar debts keep them in. See the 🏦 Money tab.' },
  { id: 'housing', icon: '🏠', name: () => 'Housing score of 60 or more', term: 'budget',
    val: () => S.stats.housing, show: v => `${fmt(v)}`, ok: v => v >= 60,
    how: 'Build housing estates and sell homes at fair prices; reclamation creates new land.' },
  { id: 'health', icon: '🏥', name: () => 'Health score of 65 or more', term: 'budget',
    val: () => S.stats.health, show: v => `${fmt(v)}`, ok: v => v >= 65,
    how: 'Fund health in the budget, build hospitals, and pass health laws.' },
  { id: 'approval', icon: '👍', name: () => 'Public approval above 55%', term: 'approval',
    val: () => approval(), show: v => `${fmt(v)}%`, ok: v => v > 55,
    how: 'Keep promises, explain decisions, and look after the groups that feel left behind.' },
];

const Targets = (() => {
  const T = id => TARGETS.find(t => t.id === id);
  const st = () => S.tg;
  const list = () => (S.tg && S.tg.list) || [];
  const cur = t => { try { return T(t.id).val(); } catch (e) { return 0; } };
  const met = t => T(t.id).ok(cur(t), t);
  async function choose() {
    if (S.tg && S.tg.term === S.term) return;
    const avail = TARGETS.filter(t => !t.only || t.only());
    const pre = new Set(['surplus', 'debt', avail.some(t => t.id === 'reserves') ? 'reserves' : 'jobs']);
    await new Promise(res => {
      const m = modal(`<div class="m-icon">🎯</div><h2>Set your government's targets</h2>
        <p class="m-body">Real governments publish measurable goals so people can judge them. A <b>budget surplus</b> is required. Choose up to 3 more. A target counts as <b>achieved</b> when it is met for a full year (two half-years in a row): ⭐+2 and more public trust. Missed targets at the end of the term cost trust.</p>
        <div class="tg-pick">${avail.map(t => { const g = t.setup ? t.setup() : null, o = { goal: g }; return `<button class="tg-opt ${pre.has(t.id) ? 'on' : ''} ${t.must ? 'must' : ''}" data-id="${t.id}" ${t.must ? 'disabled' : ''}><span>${t.icon}</span><b>${t.name(o)}</b><small>now: ${t.show(t.val())} ${t.ok(t.val(), o) ? '✓' : ''}</small></button>`; }).join('')}</div>
        <button class="btn primary big" id="m-ok">Publish targets</button>`, 'wide keep');
      m.querySelectorAll('.tg-opt:not(.must)').forEach(b => b.onclick = () => {
        const on = m.querySelectorAll('.tg-opt.on:not(.must)').length;
        if (!b.classList.contains('on') && on >= 3) return toast('Up to 3 targets besides the budget.', 'bad');
        b.classList.toggle('on');
      });
      $('#m-ok', m).onclick = () => {
        const ids = [...m.querySelectorAll('.tg-opt.on')].map(b => b.dataset.id);
        S.tg = { term: S.term, list: ids.map(id => ({ id, goal: T(id).setup ? T(id).setup() : null, streak: 0, done: false, hist: [] })) };
        news(`Government publishes ${ids.length} targets: ${ids.map(id => T(id).name(S.tg.list.find(x => x.id === id)).toLowerCase()).join('; ')}`);
        closeModal(); save(); render(); res();
      };
    });
  }
  function step() {
    const msgs = [];
    if (!S.tg || S.tg.term !== S.term) return msgs;
    for (const t of list()) {
      const ok = met(t), D = T(t.id); t.hist.push(ok ? 1 : 0); t.streak = ok ? t.streak + 1 : 0;
      if (!t.done && t.streak >= 2) {
        t.done = true; S.tgDone = (S.tgDone || 0) + 1; S.pc += 2; GK.forEach(g => S.ga[g] = clamp(S.ga[g] + 2));
        news(`Target achieved: ${D.name(t)}`); msgs.push(`🎯 Target achieved: ${D.name(t)} — ⭐+2 and public trust up`);
      }
    }
    if (S.turn % TT() === 0) {      // end of term: report card
      const missed = list().filter(t => !t.done);
      if (missed.length) { GK.forEach(g => S.ga[g] = clamp(S.ga[g] - missed.length)); news(`Government missed ${missed.length} of its ${list().length} targets`); msgs.push(`🎯 Missed targets this term: ${missed.map(t => T(t.id).name(t)).join(', ')}`); }
    }
    return msgs;
  }
  function card() {
    if (!S.tg || S.tg.term !== S.term) return '';
    return `<div class="card tg-strip"><b>🎯 Targets</b>${list().map(t => { const D = T(t.id), ok = met(t); return `<span class="tg-chip ${t.done ? 'done' : ok ? 'ok' : 'no'}" title="${esc(D.name(t))}">${D.icon} ${t.done ? '🏆' : ok ? '✓' : '✗'} ${D.show(cur(t))}</span>`; }).join('')}<button class="btn small ghost" data-act="targets">Details</button></div>`;
  }
  function details() {
    const m = modal(`<div class="m-icon">🎯</div><h2>Government targets — term ${S.term}</h2>
      <div class="tg-list">${list().map(t => { const D = T(t.id), ok = met(t); return `<div class="tg-row ${t.done ? 'done' : ok ? 'ok' : 'no'}"><div><b>${D.icon} ${D.name(t)}</b> <span>${t.done ? '🏆 achieved' : ok ? `✓ on track (${t.streak}/2 half-years)` : '✗ not met'}</span></div>
        <div class="tg-now">Now: <b>${D.show(cur(t))}</b> · history ${t.hist.map(h => h ? '🟩' : '🟥').join('') || '—'}</div><p>${D.how}</p><button class="btn small ghost" data-act="glossary" data-id="${D.term}">📖 What does this mean?</button></div>`; }).join('')}</div>
      <p class="muted small">Achieved so far in your career: ${S.tgDone || 0} (each adds 150 points to your final score).</p>
      <button class="btn primary big" id="m-ok">Close</button>`, 'wide');
    $('#m-ok', m).onclick = closeModal;
  }
  return { choose, step, card, details };
})();
