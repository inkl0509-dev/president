/* ============================================================
   MANIFESTO & GOVERNMENT AGENDA
   - The presidential manifesto: law promises (made on the
     campaign trail) + development pledges (projects).
   - A tracker that shows, for each pledge and each decision the
     cabinet adopted: what to do, the effect, and its progress.
   ============================================================ */

const DEV_PLEDGES = [
  { id: 'hospitals', icon: '🏥', type: 'hospital', n: 2, text: 'Build 2 new hospitals', g: { elderly: 3, workers: 1 } },
  { id: 'schools', icon: '🏫', type: 'school', n: 2, text: 'Build 2 new schools & colleges', g: { youth: 3 } },
  { id: 'homes', icon: '🏘️', type: 'housing', n: 2, text: 'Build 4,000 affordable homes (2 housing estates)', g: { youth: 2, workers: 2 } },
  { id: 'clean', icon: '☀️', type: 'solar', n: 1, text: 'Build a solar & wind farm', g: { youth: 2, farmers: 1 } },
  { id: 'airport', icon: '✈️', type: 'airport', n: 1, text: 'Build a new airport', g: { business: 3 } },
  { id: 'harbour', icon: '⚓', type: 'port', n: 1, text: 'Build a new seaport', g: { business: 2, workers: 1 }, coast: true },
  { id: 'jobs', icon: '🏭', type: 'factory', n: 1, text: 'Open an industrial park', g: { workers: 3 } },
];
const MV_PLEDGE_TEXT = { airport: 'Build a regional airport in the atolls', harbour: 'Build a new harbour & ferry terminal', homes: 'Build 4,000 flats (like the Hulhumalé estates)', jobs: 'Open a fisheries & processing zone', clean: 'Build solar farms to cut diesel imports' };
const pledgeText = P => (COUNTRY.id === 'mv' && MV_PLEDGE_TEXT[P.id]) || P.text;
const MIN_EFFECT = {
  finance: 'Smaller deficit → debt stops rising, lower interest bills', economy: 'More investment and jobs', labour: 'Workers and pensioners happier',
  health: 'Health index ▲ over the next half-years', education: 'Education index ▲, better long-run growth', infra: 'Better roads and links, regions grow',
  housing: 'More homes, housing index ▲', energy: 'More power, fewer blackouts', interior: 'Security index ▲', defense: 'Defence strength ▲', foreign: 'Lower threat, better trade', tourism: 'More tourists and more dollars',
};

const Manifesto = (() => {
  const built = type => count(type);
  const building = type => S.projects.filter(p => p.type === type).length;
  const lawById = id => LAWS.find(l => l.id === id);
  const status = (cls, text) => `<span class="mstat ${cls}">${text}</span>`;
  const btn = (act, id, label, extra = '') => `<button class="btn small" data-act="${act}" data-id="${id}" ${extra}>${label}</button>`;
  const chips = fx => fxChips(fx, 'gov');
  const bar = v => `<div class="bar mbar"><div style="width:${Math.round(v * 100)}%"></div></div>`;
  function pledgeAvailable(P) { return !(P.coast && COUNTRY.landlocked); }

  // ---- one card per promise / pledge ----
  function lawCard(p) {
    const L = lawById(PROMISES[p.g].law), passed = S.laws.includes(L.id);
    const st = passed ? status('ok', '✅ Kept') : p.broken ? status('bad', '❌ Broken') : status('wait', '⏳ To do');
    const steps = [['Draft the ' + L.name, passed], ['Pass it in the ' + COUNTRY.parl, passed], [`${ROLE.title} signs it into law`, passed]];
    return `<div class="mcard ${passed ? 'kept' : p.broken ? 'broken' : ''}">
      <div class="mh"><span class="mi">${GROUPS[p.g].icon}</span><div><b>${PROMISES[p.g].text}</b><small>Promised to ${GROUPS[p.g].name.toLowerCase()} · term ${p.term}</small></div>${st}</div>
      <div class="mgrid"><div><div class="lbl">What to do</div><ol class="msteps">${steps.map(([t, d]) => `<li class="${d ? 'done' : ''}">${d ? '✓' : '○'} ${t}</li>`).join('')}</ol>
        <small class="muted">Costs ⭐${L.pc} political capital${L.cost ? ` and ${fmt(L.cost, 1)}% of GDP a year` : ''}.</small></div>
      <div><div class="lbl">Effect when kept</div><div class="fxrow">${chips({ g: L.g, s: L.s })}</div><small class="muted">${L.desc}</small></div></div>
      ${passed || p.broken ? '' : `<div class="mact">${btn('tab', 'laws', '📜 Go to Laws → draft it')}</div>`}</div>`;
  }
  function devCard(d) {
    const P = DEV_PLEDGES.find(x => x.id === d.id), done = Math.max(0, built(P.type) - d.base), now = building(P.type), prog = Math.min(1, done / P.n);
    const kept = done >= P.n, PR = PROJECTS[P.type];
    const st = kept ? status('ok', '✅ Kept') : d.broken ? status('bad', '❌ Broken') : now ? status('go', `🚧 ${now} under construction`) : status('wait', '⏳ To do');
    return `<div class="mcard ${kept ? 'kept' : d.broken ? 'broken' : ''}">
      <div class="mh"><span class="mi">${P.icon}</span><div><b>${pledgeText(P)}</b><small>Development pledge · term ${d.term}</small></div>${st}</div>
      <div class="mgrid"><div><div class="lbl">What to do</div><ol class="msteps">
        <li class="${now || kept ? 'done' : ''}">${now || kept ? '✓' : '○'} Run a public tender (Build tab)</li>
        <li class="${now || kept ? 'done' : ''}">${now || kept ? '✓' : '○'} Evaluation committee picks a company</li>
        <li class="${kept ? 'done' : ''}">${kept ? '✓' : '○'} Construction & opening ceremony (${done}/${P.n} opened)</li></ol>
        <small class="muted">Each ${PR.name.toLowerCase()} costs about ${money(PR.cost)} and takes ${PR.turns} half-years.</small></div>
      <div><div class="lbl">Effect when kept</div><div class="fxrow">${chips(PR.fx)}</div><small class="muted">${PR.desc}</small></div></div>
      ${bar(prog)}${kept || d.broken ? '' : `<div class="mact">${btn('tender', P.type, `🏗️ Tender a ${PR.name.toLowerCase()} in ${reg(UI.region).short}`, typeof buildBlock === 'function' && buildBlock(P.type, UI.region) ? 'disabled' : '')}</div>`}</div>`;
  }
  // ---- cabinet decisions ----
  function decisionRow(a) {
    const mi = a.kind === 'expert' ? { icon: '🧠', title: 'Expert roundtable' } : Cabinet.get(a.min) || { icon: '👔', title: 'Minister' };
    let st, act = '';
    if (a.law) { const ok = S.laws.includes(a.law); st = ok ? status('ok', '✅ Law enacted') : status('wait', '📜 Bill not passed yet'); if (!ok) act = btn('tab', 'laws', 'Laws →'); }
    else if (a.tender) {
      const p = S.projects.find(x => x.type === a.tender && (x.started || 0) >= a.turn) || S.projects.find(x => x.type === a.tender);
      const opened = built(a.tender) > (a.base || 0);
      st = opened ? status('ok', `✅ ${PROJECTS[a.tender].name} opened`) : p ? status('go', `🚧 Building · ${p.turnsLeft} half-year${p.turnsLeft === 1 ? '' : 's'} left`) : status('wait', '⏳ Tender not launched');
      if (!opened && !p) act = btn('tender', a.tender, 'Tender →');
    } else if (a.kind === 'expert') st = status('ok', '✅ ' + esc(a.result || 'Done'));
    else if (a.kind === 'money') st = status(/agreed|Passed|approved|sold|lent|begins/i.test(a.result || '') ? 'ok' : 'wait', esc(a.result || 'Decided'));
    else st = status('ok', '✅ Done');
    return `<tr><td class="nowrap">${turnLabel(a.turn)}</td><td>${mi.icon} <small>${esc(mi.title)}</small></td><td><b>${esc(a.label)}</b><br><small class="muted">${a.kind === 'money' ? 'Financing decision' : a.kind === 'expert' ? 'On: ' + esc(a.issue || '') : MIN_EFFECT[a.min] || ''}</small></td><td>${st} ${act}</td></tr>`;
  }
  // ---- "what to do next" ----
  function nextSteps() {
    const out = [];
    if (Money.peg()) {
      const due = Money.dueNow(S.turn).filter(x => x.swap || x.amt !== Money.F().other).reduce((a, x) => a + x.amt, 0);
      if (due && Money.cover() * Money.F().importsM - due < Money.F().importsM * 1.5) out.push(['💵', `$${due}M of foreign debt is due this half-year and reserves are thin. Look at financing options.`, btn('tab', 'money', '🏦 Money & banks')]);
      else if (Money.cover() < 2) out.push(['💵', `Reserves cover only ${fmt(Money.cover(), 1)} months of imports.`, btn('tab', 'money', '🏦 Money & banks')]);
    }
    S.promises.filter(p => p.term === S.term && !p.broken && !S.laws.includes(PROMISES[p.g].law)).slice(0, 2).forEach(p => out.push(['📜', `Pass the ${lawById(PROMISES[p.g].law).name} — you promised it.`, btn('tab', 'laws', 'Laws →')]));
    (S.pledges || []).filter(d => d.term === S.term && !d.broken).forEach(d => { const P = DEV_PLEDGES.find(x => x.id === d.id); if (built(P.type) - d.base < P.n && !building(P.type)) out.push([P.icon, `${pledgeText(P)} — no tender running yet.`, btn('tender', P.type, 'Tender →')]); });
    const iss = typeof Experts !== 'undefined' ? Experts.urgent() : [];
    if (iss.length) out.push(['🧠', `${iss[0].name}. Ask the experts what to do.`, `<button class="btn small" data-act="experts" data-id="${iss[0].id}">Ask the experts →</button>`]);
    if (!(S.cabinetDone && S.cabinetDone.turn === S.turn)) out.push(['👔', 'Hold this half-year\'s cabinet meeting to hear your ministers.', `<button class="btn small" data-act="cabinet">Cabinet →</button>`]);
    const left = TT() - ((S.turn - 1) % TT() + 1);
    return { list: out.slice(0, 4), left };
  }
  function html() {
    const pr = S.promises, dv = S.pledges || [], ag = (S.agenda || []).slice().reverse();
    const kept = pr.filter(p => S.laws.includes(PROMISES[p.g].law)).length + dv.filter(d => built(DEV_PLEDGES.find(x => x.id === d.id).type) - d.base >= DEV_PLEDGES.find(x => x.id === d.id).n).length;
    const total = pr.length + dv.length, ns = nextSteps();
    return `<div class="manifesto">
      <div class="mtitle">${myFlag()} <div><b>Presidential Manifesto</b><small>${esc(S.player.name)} · ${partyById(S.player.party).name} · ${esc(S.country)}</small></div>
        <div class="mscore"><b>${kept}/${total}</b><small>pledges kept</small></div></div>
      ${bar(total ? kept / total : 0)}
      <h3>▶ What to do next <small class="muted">${ns.left} half-year${ns.left === 1 ? '' : 's'} left in this term</small></h3>
      <div class="next">${ns.list.length ? ns.list.map(([i, t, b]) => `<div class="nx"><span>${i}</span><p>${t}</p>${b}</div>`).join('') : '<p class="muted small">Everything is on track. 👏</p>'}</div>
      <h3>📜 Pledges</h3>
      ${total ? [...pr.map(lawCard), ...dv.map(devCard)].join('') : '<p class="muted small">You made no pledges. Next campaign, use 🤝 Promise and 📜 Manifesto to win votes — then deliver them here.</p>'}
      <h3>👔 Cabinet decisions & projects</h3>
      ${ag.length ? `<table class="fin-t mdec"><tr><th>When</th><th>Minister</th><th>Decision → effect</th><th>Progress</th></tr>${ag.map(decisionRow).join('')}</table>` : '<p class="muted small">No decisions yet. Advice you adopt in cabinet meetings, and financing decisions, are tracked here.</p>'}
      ${edu('Real governments publish a programme and track delivery. Many have a "delivery unit" that follows every pledge from law or tender to the ribbon-cutting. Voters remember broken promises at the next election.')}
    </div>`;
  }
  // ---- campaign: publish development pledges in the manifesto ----
  async function campaignDoc() {
    const c = S.camp; c.newPledges = c.newPledges || [];
    const taken = id => c.newPledges.includes(id) || (S.pledges || []).some(d => d.id === id && !d.broken && (built(DEV_PLEDGES.find(x => x.id === id).type) - d.base < DEV_PLEDGES.find(x => x.id === id).n));
    const avail = DEV_PLEDGES.filter(pledgeAvailable);
    const choices = avail.map(P => ({ t: `${P.icon} ${pledgeText(P)}`, note: taken(P.id) ? '✓ In your manifesto' : `${fxChips({ p: P.g }, 'camp')} <small class="muted">voters will expect this built in your term</small>`, disabled: taken(P.id) || c.newPledges.length >= 3 }));
    const promised = [...S.promises.filter(p => !p.broken && !S.laws.includes(PROMISES[p.g].law)).map(p => p.g), ...c.newPromises];
    const k = await choiceModal({ icon: '📜', title: `Your ${ROLE.race.toLowerCase()} manifesto`,
      text: `<p><b>Laws you promised:</b> ${promised.length ? promised.map(g => `${GROUPS[g].icon} ${PROMISES[g].text}`).join(' · ') : '<span class="muted">none yet — use 🤝 Promise in a region</span>'}</p>
        <p>Add up to <b>3 development pledges</b> (${3 - c.newPledges.length} left). Each wins support from the groups shown — but in office you must tender and build them, or they count as broken.</p>`,
      choices: [...choices, { t: 'Close', note: '' }], mode: 'camp' });
    if (k >= avail.length) return;
    const P = avail[k]; c.newPledges.push(P.id);
    for (const g in P.g) c.symP[g] += P.g[g];
    news(`${S.player.name} pledges to ${pledgeText(P).toLowerCase()}`); say(`I pledge: ${pledgeText(P).toLowerCase()}!`); save(); render();
  }
  function takeOffice() {
    const c = S.camp; if (!c || !c.newPledges) return;
    S.pledges = S.pledges || [];
    c.newPledges.forEach(id => { const P = DEV_PLEDGES.find(x => x.id === id); S.pledges.push({ id, term: S.term, base: built(P.type) }); });
  }
  function breakUnkept(c) {
    (S.pledges || []).forEach(d => { const P = DEV_PLEDGES.find(x => x.id === d.id); if (!d.broken && built(P.type) - d.base < P.n) { d.broken = true; for (const g in P.g) c.symP[g] -= 6; news(`Voters angry: “${pledgeText(P)}” pledge broken`); } });
  }
  function counts() {
    const dv = S.pledges || [];
    const k = dv.filter(d => { const P = DEV_PLEDGES.find(x => x.id === d.id); return built(P.type) - d.base >= P.n; }).length;
    return { kept: k, broken: dv.length - k };
  }
  return { html, campaignDoc, takeOffice, breakUnkept, counts };
})();
