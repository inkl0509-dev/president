/* ============================================================
   IMPACT OF DECISIONS + PUBLIC OPINION
   Every decision shows a panel: what changed right away, what
   is expected later, and what ordinary people say about it.
   Reactions are kept as "voices" (People tab, newspaper).
   ============================================================ */

const Impact = (() => {
  const OCC = {
    workers: ['nurse', 'bus driver', 'shop assistant', 'construction worker', 'teacher'],
    business: ['shop owner', 'guesthouse owner', 'engineer', 'importer', 'entrepreneur'],
    farmers: ['farmer', 'fisher', 'boat builder', 'island farmer'],
    youth: ['student', 'graduate', 'junior designer', 'trainee'],
    elderly: ['pensioner', 'retired teacher', 'retired fisherman', 'grandmother'],
  };
  const MV_OCC = { workers: ['resort worker', 'nurse', 'ferry crew', 'teacher'], business: ['guesthouse owner', 'importer', 'dive-shop owner'], farmers: ['tuna fisher', 'island farmer', 'boat builder'] };
  const SAY = {
    workers: { pos: ['Finally something for working families like mine.', 'This will make a real difference for us.', 'Good. Now keep the promise on wages too.'],
               neg: ['Prices are already high — this hurts working people.', 'Nobody asked us before deciding this.', 'Ministers don\'t feel it. We do.'] },
    business: { pos: ['Good for investment — we can plan ahead now.', 'We may hire more people this year.', 'A sensible, business-friendly move.'],
                neg: ['More costs for us. We might have to cut staff.', 'Uncertainty like this scares investors.', 'Red tape and taxes keep growing.'] },
    farmers: { pos: ['At last the government remembers people outside the capital.', 'Good news for our island.', 'This helps those of us who live off the land and sea.'],
               neg: ['Once again the capital gets everything.', 'This does nothing for us in the islands.', 'Our costs keep rising and nobody listens.'] },
    youth: { pos: ['Love this, sharing it with all my friends! 🙌', 'A real step toward a better future.', 'Finally a government that thinks about our generation.'],
             neg: ['Our generation will be paying for this for years.', 'Where are the jobs for young people?', 'Same old politics. 🙄'] },
    elderly: { pos: ['The government is thinking of us older people.', 'I hope they keep their word this time.', 'Good. We built this country, after all.'],
               neg: ['My pension buys less every month.', 'They always forget the elderly.', 'I have seen promises like this before.'] },
  };
  const snap = () => ({ ga: { ...S.ga }, stats: { ...S.stats }, debt: debtPct(), def: -budgetCalc().bal * 2 / S.gdp * 100, infl: S.infl, ap: approval(), pc: S.pc,
    res: (typeof Money !== 'undefined' && Money.peg() && S.fin) ? S.fin.res : null, rate: (S.rate || 0) * 100 });

  function citizen(g) {
    const gender = Math.random() < .5 ? 'f' : 'm', age = g === 'youth' ? Math.round(rnd(18, 29)) : g === 'elderly' ? Math.round(rnd(65, 84)) : Math.round(rnd(28, 60));
    const occ = pick((COUNTRY.id === 'mv' && MV_OCC[g]) || OCC[g]), place = pick(REGIONS).city[2];
    return { name: personName(gender), age, occ, place, g };
  }
  function voice(g, mood, title) {
    const c = citizen(g), text = pick(SAY[g][mood > 0 ? 'pos' : 'neg']);
    const v = { turn: S.turn, g, mood, text, who: `${c.name}, ${c.age}, ${c.occ}, ${c.place}`, about: title };
    S.voices = [v, ...(S.voices || [])].slice(0, 40);
    return v;
  }
  // ---- the floating panel ----
  let hideT = null;
  function panel(html) {
    let el = document.getElementById('impact');
    if (!el) { el = document.createElement('div'); el.id = 'impact'; document.body.appendChild(el); el.addEventListener('mouseenter', () => clearTimeout(hideT)); el.addEventListener('touchstart', () => clearTimeout(hideT), { passive: true }); }
    el.innerHTML = html; el.classList.add('show');
    el.querySelector('.imp-x').onclick = () => el.classList.remove('show');
    clearTimeout(hideT); hideT = setTimeout(() => el.classList.remove('show'), 22000);
    shownAt = Date.now();
  }
  let shownAt = 0;
  // tap anywhere else to dismiss (after a moment, so the tap that made the decision doesn't close it)
  document.addEventListener('pointerdown', e => {
    const el = document.getElementById('impact');
    if (el && el.classList.contains('show') && !el.contains(e.target) && Date.now() - shownAt > 1200) el.classList.remove('show');
  }, true);
  const arrow = (v, good = true, d = 1, suf = '') => `<b class="${(v > 0) === good ? 'good' : 'bad'}">${v > 0 ? '▲' : '▼'} ${Math.abs(v).toFixed(d)}${suf}</b>`;

  /** before: a snapshot from Impact.snap() (or null); opts: { fx:{g,s}, expected, lesson, money } */
  function show(title, before, opts = {}) {
    if (!S || S.phase !== 'govern') return;
    const now = snap(), rows = [];
    if (before) {
      GK.forEach(g => { const d = now.ga[g] - before.ga[g]; if (Math.abs(d) >= .3) rows.push(`<span>${GROUPS[g].icon} ${GROUPS[g].name} ${arrow(d)}</span>`); });
      SK.forEach(k => { const d = now.stats[k] - before.stats[k]; if (Math.abs(d) >= .3) rows.push(`<span>${STATS[k].icon} ${STATS[k].name} ${arrow(d)}</span>`); });
      if (Math.abs(now.def - before.def) >= .05) rows.push(`<span>🧾 Deficit ${arrow(now.def - before.def, false, 1, '% GDP')}</span>`);
      if (Math.abs(now.debt - before.debt) >= .1) rows.push(`<span>📉 Debt ${arrow(now.debt - before.debt, false, 1, '% GDP')}</span>`);
      if (Math.abs(now.infl - before.infl) >= .05) rows.push(`<span>💹 Inflation ${arrow(now.infl - before.infl, false, 1, ' pts')}</span>`);
      if (Math.abs(now.rate - before.rate) >= .01) rows.push(`<span>🏦 Interest rate ${arrow(now.rate - before.rate, false, 2, ' pts')}</span>`);
      if (now.res !== null && before.res !== null && Math.abs(now.res - before.res) >= 1) rows.push(`<span>💵 Reserves ${arrow(now.res - before.res, true, 0, 'M $')}</span>`);
      if (Math.abs(now.ap - before.ap) >= .2) rows.push(`<span>👍 Approval ${arrow(now.ap - before.ap)}</span>`);
    }
    const exp = opts.fx ? fxChips(opts.fx, 'gov') : '';
    // who reacts: groups that moved most, now or later
    const score = {}; GK.forEach(g => score[g] = (before ? now.ga[g] - before.ga[g] : 0) + ((opts.fx && opts.fx.g && opts.fx.g[g]) || 0));
    const movers = GK.filter(g => Math.abs(score[g]) >= .3).sort((a, b) => Math.abs(score[b]) - Math.abs(score[a])).slice(0, 3);
    const pickG = movers.length ? movers : [pick(GK)];
    const vs = pickG.map(g => voice(g, score[g] || (Math.random() < .5 ? 1 : -1), title));
    const assist = typeof Assistant !== 'undefined' && Assistant.on();
    const html = `<div class="imp-h"><b>📊 Impact: ${esc(title)}</b><button class="imp-x" aria-label="Close">✕</button></div>
      ${rows.length ? `<div class="imp-sec"><div class="lbl">Right now</div><div class="imp-rows">${rows.join('')}</div></div>` : ''}
      ${exp || opts.expected ? `<div class="imp-sec"><div class="lbl">Expected ${opts.when || 'over the next half-years'}</div>${exp ? `<div class="fxrow">${exp}</div>` : ''}${opts.expected ? `<p>${opts.expected}</p>` : ''}</div>` : ''}
      <div class="imp-sec"><div class="lbl">🗣️ What people say</div>${vs.map(v => `<div class="imp-v ${v.mood > 0 ? 'pos' : 'neg'}"><span>${GROUPS[v.g].icon}</span><p>“${esc(v.text)}”<small>— ${esc(v.who)}</small></p></div>`).join('')}</div>
      ${assist && opts.lesson ? `<div class="imp-sec imp-learn">📘 ${opts.lesson}</div>` : ''}`;
    panel(html);
    (S.decLog = S.decLog || []).unshift({ turn: S.turn, title, rows: rows.map(r => r.replace(/<[^>]+>/g, '')).slice(0, 4), voices: vs.map(v => ({ text: v.text, who: v.who, mood: v.mood })), pub: false });
    S.decLog = S.decLog.slice(0, 30);
  }
  /** run a synchronous decision and show what it changed */
  function run(title, fn, opts) { const b = snap(); const r = fn(); show(title, b, opts); return r; }
  function feed(n = 8) {
    const vs = (S.voices || []).slice(0, n);
    return vs.length ? `<div class="voices"><h3>🗣️ What people are saying</h3>${vs.map(v => `<div class="imp-v ${v.mood > 0 ? 'pos' : 'neg'}"><span>${GROUPS[v.g].icon}</span><p>“${esc(v.text)}” <small>— ${esc(v.who)} · on <i>${esc(v.about)}</i></small></p></div>`).join('')}</div>` : '';
  }
  return { snap, show, run, voice, feed, citizen };
})();
