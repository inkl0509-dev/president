/* ============================================================
   THE PRESIDENT'S ADVISERS — the personal team in the President's
   Office, separate from ministers and the expert roundtable:
   legal counsel, physician, foreign policy adviser, press
   secretary, national security adviser, political strategist and
   climate adviser. Each reads the situation and gives advice; you
   can ask them common questions. The physician also looks after
   the president's own health: stress builds up in a crisis, and an
   exhausted leader makes mistakes.
   Legal answers are simplified general explanations, not legal advice.
   ============================================================ */

const ADVISERS = [
  { id: 'lawyer', icon: '⚖️', role: () => 'Legal Counsel to the President' },
  { id: 'doctor', icon: '🩺', role: () => 'President\'s Physician' },
  { id: 'foreign', icon: '🌐', role: () => 'Foreign Policy Adviser' },
  { id: 'press', icon: '📣', role: () => 'Press Secretary' },
  { id: 'security', icon: '🛡️', role: () => 'National Security Adviser' },
  { id: 'strategist', icon: '🗳️', role: () => 'Political Strategist' },
  { id: 'climate', icon: '🌍', role: () => COUNTRY.id === 'mv' ? 'Climate Change & Environment Adviser' : 'Climate & Environment Adviser' },
];

const Advisers = (() => {
  const mv = () => COUNTRY.id === 'mv';
  const A = () => {
    if (!S.adv) S.adv = { me: { stress: 20, fit: 75, exercise: false } };
    if (!S.adv.people) S.adv.people = Object.fromEntries(ADVISERS.map(a => { const g = Math.random() < .45 ? 'f' : 'm'; const look = randomLook(); if (g === 'f') look.style = pick(['long', 'curly', 'side']); return [a.id, { name: personName(g), look, g }]; }));
    return S.adv;
  };
  const me = () => A().me;
  const defPct = () => { const b = budgetCalc(); return -b.bal * 2 / S.gdp * 100; };
  const left = () => TT() - (S.turn % TT() || TT()) + 1;   // half-years left in the term, including this one
  const cbName = () => (typeof Money !== 'undefined' ? Money.F().cb : 'the central bank');
  const megaFast = () => (S.mega ? S.mega.list.filter(p => p.eia === 'fast' && !['done', 'cancelled', 'shelved'].includes(p.phase)).length : 0);
  const directResorts = () => (S.resorts || []).filter(r => r.method === 'direct').length;
  const weakest = () => GK.slice().sort((a, b) => S.ga[a] - S.ga[b])[0];
  const go = (tab, label) => ['go', tab, label];
  const doit = (id, label) => ['do', id, label];

  // ---------- situational advice: [level 0 ok / 1 watch / 2 urgent, [ [text, action?], ... ]] ----------
  const ADV = {
    lawyer() {
      const L = [];
      let lv = 0;
      if (S.scandalRisk > 0) { lv = 2; L.push([`Some recent decisions could be challenged in court or investigated${mv() ? ' by the Anti-Corruption Commission' : ''} (scandal risk ${fmt(S.scandalRisk, 1)}). A legal audit now is cheaper than a scandal later.`, doit('audit', '🔎 Order a legal audit (⭐1)')]); }
      if (directResorts()) { lv = Math.max(lv, 1); L.push([`${directResorts()} resort island${directResorts() > 1 ? 's were' : ' was'} awarded without open bidding. Public property should normally be leased through open, competitive tenders.`]); }
      if (megaFast()) { lv = Math.max(lv, 1); L.push([`${megaFast()} megaproject${megaFast() > 1 ? 's have' : ' has'} a fast-tracked environmental assessment. Affected people can go to court; keep records of consultations.`, go('mega', 'Megaprojects →')]); }
      if (S.stats.freedom < 40) { lv = Math.max(lv, 1); L.push(['Freedom is low. Restrictions on protest and the press must be lawful, necessary and proportionate, or courts and international partners will object.']); }
      if (S.term >= MAXT() && S.turn % TT() >= TT() - 2) L.push([`This is your last term. The constitution allows ${COUNTRY.termLimit === 1 ? 'only one term' : COUNTRY.termLimit + ' terms'} of ${COUNTRY.termYears} years. Plan a clean handover.`]);
      if (!L.length) L.push(['No legal problems on my desk. Before a big decision, ask me whether it fits the constitution and the law.']);
      return [lv, L];
    },
    doctor() {
      const m = me(), L = []; let lv = m.stress > 75 || m.fit < 35 ? 2 : m.stress > 55 ? 1 : 0;
      L.push([`Your stress level is <b>${fmt(m.stress)}/100</b> and fitness <b>${fmt(m.fit)}/100</b>. ${m.stress > 75 ? 'You are close to exhaustion — tired leaders make poor decisions and gaffes.' : m.stress > 55 ? 'You are under heavy pressure. Sleep and short breaks matter.' : 'You are coping well.'}`, doit('checkup', '🩺 Check-up')]);
      if (m.stress > 45) L.push(['I recommend a few days of rest.', doit('rest', '🌴 Take a long weekend')]);
      if (!m.exercise) L.push(['A daily exercise routine lowers stress over time.', doit('exercise', '🏃 Start a routine')]);
      if (S.stats.health < 55) { lv = Math.max(lv, 1); L.push([`On public health: the national health score is ${fmt(S.stats.health)}. Prevention (vaccines, clean water, ${mv() ? 'dengue mosquito control' : 'screening'}) is the cheapest medicine.`, go('budget', 'Budget →')]); }
      return [lv, L];
    },
    foreign() {
      const L = []; let lv = S.threat > 60 || (S.rep || 50) < 35 ? 2 : S.threat > 45 ? 1 : 0;
      L.push([`Our international reputation is ${fmt(S.rep || 50)}/100. ${S.lastWorld ? `Latest from abroad: <i>${esc(S.lastWorld)}</i>.` : ''}`]);
      if (mv()) L.push(['As a small island state, we gain most by staying on good terms with all major partners, not depending on one lender, and speaking loudly on climate — the Maldives is one of the best-known voices of small island states.', go('foreign', '✈️ Plan a visit')]);
      else L.push([`Relations with the ${NEIGHBOR} are ${S.threat > 50 ? 'tense' : 'stable'}. ${COUNTRY.landlocked ? 'As a landlocked country, transit neighbours are our lifeline.' : 'New trade agreements would help our exporters.'}`, go('foreign', '✈️ Plan a visit')]);
      if (debtPct() > 90) L.push(['Our debt is high. Before taking another foreign loan, compare the interest, the grace period, the currency and any conditions attached.']);
      return [lv, L];
    },
    press() {
      const w = weakest(), L = []; let lv = approval() < 40 ? 2 : approval() < 50 ? 1 : 0;
      L.push([`Approval is ${fmt(approval())}%. The group most unhappy with us is <b>${GROUPS[w].icon} ${GROUPS[w].name}</b> (${fmt(S.ga[w])}%).`]);
      if (S.news && S.news[0]) L.push([`Today's top story: “${esc(S.news[0].t || S.news[0])}”. Get ahead of it: explain what we are doing and why.`]);
      L.push(['Open press conferences build trust — even when the news is bad. Admit problems early; cover-ups make scandals worse.', S.presser === S.turn ? null : doit('press', '🎙️ Hold a press conference')]);
      return [lv, L];
    },
    security() {
      const L = [], risk = warRisk()[0]; let lv = S.threat > 65 ? 2 : S.threat > 45 ? 1 : 0;
      L.push([`Threat level ${fmt(S.threat)}/100 — overall risk ${risk.toLowerCase()}.`, go('defense', 'Defense →')]);
      L.push([mv() ? 'Our biggest security tasks are at sea: coast guard patrols of a huge exclusive economic zone, illegal fishing, drug smuggling, and disaster response on scattered islands.' : 'Diplomacy is cheaper than defence: talks lower tension; spending only on weapons can start an arms race.']);
      if (S.stats.security < 45) { lv = Math.max(lv, 1); L.push(['Public safety is weak. Police training and community policing reduce crime more than harsh laws alone.', go('budget', 'Budget →')]); }
      return [lv, L];
    },
    strategist() {
      const L = [], need = majority(), seats = coalitionSeats(); let lv = left() <= 2 && approval() < 50 ? 2 : seats < need ? 1 : 0;
      L.push([`${left()} half-year${left() > 1 ? 's' : ''} until the ${S.term >= MAXT() ? 'end of your final term' : 'next election'}. Approval ${fmt(approval())}%.`]);
      L.push([seats >= need ? `We control ${seats} seats; ${need} are needed for a majority. Keep the coalition happy.` : `We have only ${seats} seats; ${need} are needed. Every law needs deals with other parties.`, go('parl', 'Parliament →')]);
      const c = typeof Agenda !== 'undefined' ? Agenda.counts() : { kept: 0, broken: 0 };
      if (c.kept + c.broken) L.push([`Manifesto pledges delivered so far: ${c.kept} of ${c.kept + c.broken}. Voters remember broken promises at election time.`, go('agenda', 'Manifesto →')]);
      if (S.tg && S.tg.list) L.push([`Targets: ${S.tg.list.filter(t => t.done).length} of ${S.tg.list.length} achieved this term.`, doit('targets', '🎯 Targets')]);
      return [lv, L];
    },
    climate() {
      const L = []; let lv = S.stats.environment < 40 ? 2 : S.stats.environment < 55 ? 1 : 0;
      L.push([`Environment score ${fmt(S.stats.environment)}. ${mv() ? 'Most of our islands are about one metre above the sea: coastal protection, healthy reefs and safe new land are national survival.' : 'Clean energy and less pollution improve health and save fuel imports.'}`, go('mega', mv() ? '🧱 Coastal & solar projects →' : 'Megaprojects →')]);
      const en = energy(); if (en.supply < en.demand) { lv = Math.max(lv, 1); L.push(['Electricity demand is higher than supply. Solar, wind or efficiency can close the gap.', go('build', 'Build →')]); }
      L.push(['Climate funds and development banks give grants and cheap loans for adaptation — but only for well-prepared projects with honest environmental assessments.']);
      return [lv, L];
    },
  };

  // ---------- questions you can ask ----------
  const ASK = {
    lawyer: () => [
      ['Can I stay in office longer than the limit?', `No. The constitution limits the ${ROLE.title.toLowerCase()} to ${COUNTRY.termLimit === 1 ? 'one term' : COUNTRY.termLimit + ' terms'} of ${COUNTRY.termYears} years. Changing that needs a constitutional amendment, which usually requires a large majority in parliament and sometimes a referendum. Leaders who bend term limits lose legitimacy at home and abroad.`],
      ['Can I order the central bank to cut rates or print money?', `No. ${cbName()} is independent by law so that elections cannot drive money printing. You can appoint its leadership through the legal process and talk to the governor, but not give orders on interest rates.`],
      ['Can I give a contract without a tender?', `Only in narrow cases the procurement law allows, such as genuine emergencies. Otherwise contracts must be openly tendered and evaluated. Direct awards are a classic route to corruption and are regularly examined by auditors${mv() ? ' and the Anti-Corruption Commission' : ''}.`],
      ['Can I ban a protest?', 'Peaceful assembly is a constitutional right. Authorities can set conditions — place, time, safety — when the law allows and the measure is necessary and proportionate. A blanket ban will likely be overturned by the courts.'],
      ['Can I sack a minister, or a judge?', `${mv() ? 'You appoint and dismiss ministers, but the People\'s Majlis must approve appointments to the cabinet.' : 'You can usually dismiss ministers; in many countries parliament must approve new ones.'} Judges are different: they can only be removed through the judicial disciplinary process, not by the ${ROLE.title.toLowerCase()} — that is what judicial independence means.`],
    ],
    doctor: () => [
      ['Why does my stress matter to the country?', 'Long hours, crises and little sleep impair judgement, memory and mood. Many leaders have made costly mistakes when exhausted. In the game, very high stress costs political capital and can lead to a collapse.'],
      ['What raises my stress?', 'Crises, low approval, scandals, big deficits, unresolved megaproject problems and security threats. Rest, exercise and delegation to good ministers lower it.'],
      ['What should the government do for public health?', 'Prevention gives the best return: vaccination, clean water and sanitation, healthy food, and primary care close to people. Hospitals matter, but most health is made outside them.'],
    ],
    foreign: () => [
      ['How do I choose which country to borrow from?', 'Compare the real cost (interest and fees), the grace period, the currency of repayment, whether contracts must go to the lender\'s companies, and what happens if you cannot pay. Spreading borrowing across several lenders reduces dependence on any one.'],
      ['How do we get climate finance?', mv() ? 'Through funds like the Green Climate Fund and development banks, plus bilateral partners. Strong, costed projects with environmental assessments get funded first. Speaking together with other small island states gives a small country a bigger voice.' : 'Through international climate funds, development banks and partner countries. Well-prepared, costed projects get funded first.'],
      ['Should we join a military alliance?', 'An alliance offers protection, but it can draw you into other countries\' conflicts and anger rivals. Many small states stay non-aligned and keep friendly ties with everyone; others decide an alliance is their best guarantee. Weigh both.'],
      ['What happens at the UN?', 'Every country has one vote in the General Assembly. It is where small states can build coalitions, raise issues like climate change, and meet many leaders in one week.'],
    ],
    press: () => [
      ['How do I handle a scandal?', 'Get the facts quickly, tell the truth early, take responsibility, and announce what will change. Denial followed by new revelations is the worst path.'],
      ['Why do journalists criticise me?', 'Holding power to account is the job of a free press. Fair criticism tells you what voters feel. Attacking journalists usually backfires and lowers freedom.'],
      ['How do I explain an unpopular decision?', 'Explain the problem first, then the options you considered, why you chose this one, and who will be protected from the pain.'],
    ],
    security: () => [
      ['How much should we spend on defence?', 'Enough to deter threats and protect citizens, but every extra coin is not spent on schools or hospitals. Look at real threats, not at what rivals spend.'],
      ['What is national security beyond the army?', mv() ? 'Food and fuel imports, water, cyber attacks, disasters, sea-level rise, drug trafficking and illegal fishing — all can threaten the nation.' : 'Energy supply, food, cyber attacks, pandemics, disasters and organised crime are all security issues.'],
    ],
    strategist: () => [
      ['How do I win re-election?', 'Deliver on visible promises, keep the economy stable, look after groups that feel ignored, and avoid scandals. Voters judge mostly the last year before the election.'],
      ['Should I make a deal with another party?', 'Coalitions let you pass laws, but every partner wants something in return. Agree on a written programme so everyone knows what was promised.'],
    ],
    climate: () => [
      ['What is adaptation vs mitigation?', 'Mitigation means cutting emissions (cleaner energy). Adaptation means protecting people from climate impacts that are already coming (sea walls, drought-proof farming). Small countries emit little, so for them adaptation is urgent.'],
      ['Is reclaiming land good or bad?', 'It creates safer, higher land, but dredging destroys reefs and lagoons where sand is taken. A careful environmental assessment and choosing the least harmful site make the difference.'],
    ],
  };

  // ---------- the president's own health, each half-year ----------
  function step() {
    const m = me(), msgs = [];
    const megaWorry = S.mega ? S.mega.list.filter(p => p.phase === 'build').length * 2 : 0;
    m.stress = clamp(m.stress + 3 + (approval() < 45 ? 4 : 0) + (S.scandalRisk > 0 ? 4 : 0) + (defPct() > 5 ? 3 : 0) + (S.threat > 60 ? 3 : 0) + megaWorry - (m.exercise ? 9 : 0) - (m.fit > 70 ? 3 : 0));
    m.fit = clamp(m.fit - 1 + (m.exercise ? 4 : 0) - (m.stress > 70 ? 3 : 0));
    if (m.stress > 90 && Math.random() < .4) {
      m.stress = 55; GK.forEach(g => S.ga[g] = clamp(S.ga[g] - 2)); S.pc = Math.max(0, S.pc - 1);
      news(`${ROLE.title} briefly hospitalised with exhaustion`);
      msgs.push('🏥 You collapsed from exhaustion and spent a week in hospital. Your physician insists you rest.');
    } else if (m.stress > 75) { S.pc = Math.max(0, S.pc - 1); msgs.push('😫 You are exhausted: ⭐−1 political capital. See your physician.'); }
    return msgs;
  }

  // ---------- actions ----------
  async function act(spec) {
    const [k, id, x] = spec.split('|');
    if (k === 'open') return detail(id);
    if (k === 'back') return office();
    if (k === 'go') { closeModal(); if (id === 'foreign') return ACT.foreign(); UI.tab = id; render(); const t = $('.tabs'); if (t) t.scrollIntoView({ behavior: 'smooth' }); return; }
    if (k !== 'do') return;
    const m = me();
    if (id === 'checkup') {
      const bp = `${Math.round(112 + m.stress * .35)}/${Math.round(72 + m.stress * .18)}`, sleep = (8 - m.stress / 22).toFixed(1);
      return info('🩺', 'Your check-up', `<div class="mg-rep"><div><span>Blood pressure</span><b class="${m.stress > 70 ? 'bad' : m.stress > 50 ? 'warn' : 'good'}">${bp}</b></div><div><span>Sleep a night</span><b>${sleep} h</b></div><div><span>Stress</span><b>${fmt(m.stress)}</b></div><div><span>Fitness</span><b>${fmt(m.fit)}</b></div></div><p>${m.stress > 70 ? 'Doctor: “This is not sustainable. Delegate more and take some rest.”' : 'Doctor: “Keep sleeping properly and moving every day.”'}</p>`);
    }
    if (id === 'rest') {
      if (A().rest === S.turn) return toast('You already rested this half-year.', 'bad');
      A().rest = S.turn; m.stress = clamp(m.stress - 25);
      const bad = approval() < 45 || S.pendingEvent;
      if (bad) { GK.forEach(g => S.ga[g] = clamp(S.ga[g] - 1)); news(`${ROLE.title} takes weekend off as problems pile up`); }
      else news(`${ROLE.title} takes a short break`);
      save(); render(); return toast(`🌴 Stress −25${bad ? ' · critics complain about the timing' : ''}`, bad ? 'bad' : 'good');
    }
    if (id === 'exercise') { m.exercise = true; save(); render(); detail('doctor'); return toast('🏃 Exercise routine started: stress falls each half-year', 'good'); }
    if (id === 'press') { closeModal(); return Presser.run(); }
    if (id === 'pressOld') {
      if (A().press === S.turn) return;
      A().press = S.turn; const w = weakest();
      S.ga[w] = clamp(S.ga[w] + 3); GK.forEach(g => S.ga[g] = clamp(S.ga[g] + .5)); m.stress = clamp(m.stress + 3);
      news(`${ROLE.title} answers journalists' questions for an hour`);
      save(); render(); detail('press'); return toast(`🎙️ Press conference: ${GROUPS[w].name} feel heard`, 'good');
    }
    if (id === 'audit') {
      if (S.pc < 1) return toast('You need ⭐1.', 'bad');
      S.pc -= 1; const before = S.scandalRisk; S.scandalRisk = Math.max(0, S.scandalRisk * .4 - .2); S.stats.freedom = clamp(S.stats.freedom + 1);
      news('President orders legal audit of government decisions');
      save(); render(); detail('lawyer'); return toast(`🔎 Legal audit: scandal risk ${fmt(before, 1)} → ${fmt(S.scandalRisk, 1)}`, 'good');
    }
    if (id === 'targets') { closeModal(); return Targets.details(); }
  }
  function info(icon, title, body) {
    const m = modal(`<div class="m-icon">${icon}</div><h2>${title}</h2>${body}<button class="btn primary big" id="m-ok">OK</button>`);
    $('#m-ok', m).onclick = closeModal;
  }
  const btn = a => a ? `<button class="btn small ${a[0] === 'do' ? 'primary' : 'ghost'}" data-act="adv" data-id="${a[0]}|${a[1]}">${a[2]}</button>` : '';
  const levelOf = id => { try { return ADV[id]()[0]; } catch (e) { return 0; } };
  const dot = lv => `<i class="adv-dot l${lv}" title="${['all fine', 'watch this', 'urgent'][lv]}"></i>`;
  function office() {
    const P = A().people;
    const m = modal(`<div class="m-icon">🧑‍💼</div><h2>The President's advisers</h2>
      <p class="m-body center">Your personal team in the President's Office. Ministers run ministries; these people advise <b>you</b>. Red means they want to see you now.</p>
      <div class="adv-grid">${ADVISERS.map(a => { let lv = 0, first = ''; try { const r = ADV[a.id](); lv = r[0]; first = r[1][0][0]; } catch (e) { } return `<button class="adv-card" data-act="adv" data-id="open|${a.id}">${avatarSVG(P[a.id].look, 0, 46)}<div><b>${a.icon} ${a.role()} ${dot(lv)}</b><small>${esc(P[a.id].name)}</small><p>${first.replace(/<[^>]+>/g, '').slice(0, 110)}${first.length > 110 ? '…' : ''}</p></div></button>`; }).join('')}</div>
      <button class="btn primary big" id="m-ok">Close</button>`, 'wide');
    $('#m-ok', m).onclick = closeModal;
  }
  function detail(id) {
    const a = ADVISERS.find(x => x.id === id), p = A().people[id], [lv, lines] = ADV[id](), qs = ASK[id]();
    const m = modal(`<div class="adv-head">${avatarSVG(p.look, 0, 64)}<div><h2>${a.icon} ${a.role()}</h2><small>${esc(p.name)} ${dot(lv)}</small></div></div>
      <div class="adv-lines">${lines.map(([t, act]) => `<div class="adv-line"><p>${t}</p>${btn(act)}</div>`).join('')}</div>
      <h4>Ask ${p.g === 'f' ? 'her' : 'him'}</h4>
      <div class="adv-qs">${qs.map(([q, ans]) => `<details><summary>❓ ${q}</summary><p>${ans}</p></details>`).join('')}</div>
      ${id === 'lawyer' ? '<p class="muted small">Simplified general explanations for learning, not legal advice.</p>' : ''}
      <div class="adv-foot"><button class="btn ghost" data-act="adv" data-id="back|">← All advisers</button><button class="btn primary" id="m-ok">Close</button></div>`, 'wide');
    $('#m-ok', m).onclick = closeModal;
  }
  const urgent = () => S && S.phase === 'govern' ? ADVISERS.filter(a => levelOf(a.id) === 2) : [];
  return { office, detail, act, step, urgent, me };
})();
