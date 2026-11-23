/* ============================================================
   ACCOUNTABILITY — two ways leaders must answer questions:
   1. 🎙️ PRESIDENTIAL PRESS CONFERENCE: journalists ask about the
      country's current concerns. The president answers, or asks
      the responsible minister standing on the stage to answer.
   2. 🏛️ QUESTION TIME IN PARLIAMENT: opposition MPs question
      ministers in the chamber. Poor answers can lead to a motion
      of no confidence in the minister.
   Questions are built from what is actually happening in the
   game: deficit, prices, jobs, reserves, scandals, projects…
   ============================================================ */

const Concerns = (() => {
  const defPct = () => { const b = budgetCalc(); return -b.bal * 2 / S.gdp * 100; };
  function list() {
    const C = [], mv = COUNTRY.id === 'mv', add = (o, sev) => { if (sev > 0) C.push({ ...o, sev: Math.min(1, sev) }); };
    add({ id: 'deficit', icon: '💰', topic: 'the budget deficit', min: 'finance', g: ['business', 'elderly'], metric: defPct, good: 'down',
      j: `The deficit is ${fmt(defPct(), 1)}% of GDP. How will you pay for all this without more borrowing?`,
      mp: `Will the Minister admit that the government is borrowing ${fmt(defPct(), 1)}% of GDP a year, and tell this House when the budget will balance?` }, (defPct() - 2) / 6);
    add({ id: 'debt', icon: '📉', topic: 'public debt', min: 'finance', g: ['business', 'youth'], metric: () => debtPct(), good: 'down',
      j: `Debt is now ${fmt(debtPct())}% of GDP. Are we heading for a debt crisis?`,
      mp: `Debt has reached ${fmt(debtPct())}% of GDP. What is the Minister's plan to stop our children paying for today's spending?` }, (debtPct() - 60) / 60);
    add({ id: 'prices', icon: '🏷️', topic: 'rising prices', min: 'economy', g: ['workers', 'elderly'], metric: () => S.infl || 0, good: 'down',
      j: `Inflation is ${fmt(S.infl, 1)}%. Families say they can't afford food. What are you doing about it?`,
      mp: `Prices are rising ${fmt(S.infl, 1)}% a year. Why has the Minister done nothing for families who can no longer afford basic goods?` }, ((S.infl || 0) - 4) / 8);
    add({ id: 'jobs', icon: '👷', topic: 'unemployment', min: 'labour', g: ['youth', 'workers'], metric: () => unemployment(), good: 'down',
      j: `Unemployment is ${fmt(unemployment(), 1)}%. ${mv ? 'Young people say the only jobs are in resorts far from home.' : 'Young graduates cannot find work.'} What is your answer?`,
      mp: `With ${fmt(unemployment(), 1)}% unemployed, can the Minister name one programme that has actually created jobs?` }, (unemployment() - 5) / 8);
    if (typeof Money !== 'undefined' && Money.peg()) add({ id: 'dollars', icon: '💵', topic: 'the dollar shortage', min: 'finance', g: ['business', 'workers'], metric: () => Money.cover(), good: 'up',
      j: `Reserves cover only ${fmt(Money.cover(), 1)} months of imports and banks are rationing dollars. Will the ${mv ? 'rufiyaa' : 'currency'} be devalued?`,
      mp: `Businesses cannot get dollars to import goods. Will the Minister guarantee there will be no devaluation?` }, (3.5 - Money.cover()) / 2.5);
    add({ id: 'scandal', icon: '🕵️', topic: 'corruption allegations', min: 'interior', g: GK, metric: () => S.scandalRisk || 0, good: 'down',
      j: 'There are reports that contracts were handed out to friends of the government. Will you order an independent investigation?',
      mp: 'Will the Minister tell the House who approved these contracts, and whether any minister had a conflict of interest?' }, (S.scandalRisk || 0) / 2);
    add({ id: 'health', icon: '🏥', topic: 'hospitals', min: 'health', g: ['elderly', 'farmers'], metric: () => S.stats.health, good: 'up',
      j: mv ? 'Patients from the atolls still have to travel to Malé for basic treatment. When will island health centres improve?' : 'Waiting times at hospitals are getting longer. What will you do?',
      mp: 'Why are patients waiting months for treatment while the Minister cuts ribbons?' }, (60 - S.stats.health) / 25);
    add({ id: 'schools', icon: '📚', topic: 'schools', min: 'education', g: ['youth', 'workers'], metric: () => S.stats.education, good: 'up',
      j: 'Teachers say classes are overcrowded and books are missing. Is education really a priority?',
      mp: 'Can the Minister explain why exam results are falling?' }, (60 - S.stats.education) / 25);
    add({ id: 'housing', icon: '🏘️', topic: 'housing', min: 'housing', g: ['youth', 'workers'], metric: () => S.stats.housing, good: 'up',
      j: mv ? 'Families in Malé pay half their income for one crowded room. When will the promised flats be handed over?' : 'Young people cannot afford a home. Where are the homes you promised?',
      mp: 'How many of the homes promised in the manifesto have actually been finished?' }, (60 - S.stats.housing) / 25);
    add({ id: 'crime', icon: '🚓', topic: 'crime', min: 'interior', g: ['elderly', 'business'], metric: () => S.stats.security, good: 'up',
      j: mv ? 'Drug-related crime and gang violence are worrying families in Malé. What is the plan?' : 'People say they feel unsafe in their neighbourhoods. What is the plan?',
      mp: 'Crime is up. Will the Minister accept responsibility?' }, (55 - S.stats.security) / 25);
    const en = energy();
    add({ id: 'power', icon: '⚡', topic: 'power cuts', min: 'energy', g: ['business', 'workers'], metric: () => energy().supply - energy().demand, good: 'up',
      j: 'There are power cuts every week. Businesses are losing money. When will this end?',
      mp: 'Why has the Minister failed to keep the lights on?' }, (en.demand - en.supply) / 10);
    add({ id: 'environment', icon: '🌍', topic: 'the environment', min: 'energy', g: ['youth'], metric: () => S.stats.environment, good: 'up',
      j: mv ? 'Beaches are eroding and reefs are bleaching. Is the government doing enough to protect the islands?' : 'Pollution is getting worse. Is the environment being sacrificed for growth?',
      mp: 'Will the Minister publish the full environmental assessments of the government\'s projects?' }, (55 - S.stats.environment) / 25);
    if (S.mega) S.mega.list.filter(p => p.phase === 'build').forEach(p => {
      const m = MEGA.find(x => x.id === p.id), pl = Math.min(1, (S.turn - p.start) / p.turns), late = pl - p.prog, over = p.spent / Math.max(.01, p.budget * Math.max(.05, p.prog)) - 1;
      add({ id: 'mega_' + p.uid, icon: m.icon, topic: m.name, min: 'infra', g: ['business', 'workers'], metric: () => p.prog - Math.min(1, (S.turn - p.start) / p.turns), good: 'up',
        j: `The ${m.name} is ${late > .05 ? 'behind schedule' : 'costing more than planned'}. Who is responsible, and how much more will taxpayers pay?`,
        mp: `Will the Minister tell the House the true cost and completion date of the ${m.name}?` }, Math.max(late * 3, over > .1 ? .4 : 0, p.alerts.length ? .35 : 0));
    });
    if (S.resorts && S.resorts.some(r => r.method === 'direct')) add({ id: 'islands', icon: '🏝️', topic: 'islands given without bidding', min: 'tourism', g: ['farmers', 'youth'], metric: () => 0, good: 'up',
      j: 'Why were resort islands given to companies without open bidding? Who owns these companies?',
      mp: 'Will the Minister table every island lease agreement before this House?' }, .55);
    if (S.news && S.news[0]) add({ id: 'headline', icon: '📰', topic: 'today\'s headline', min: 'finance', g: GK, metric: () => 0, good: 'up',
      j: `About today's headline — “${String(S.news[0]).slice(0, 90)}” — what is the government's response?`,
      mp: `Will the government make a statement on: ${String(S.news[0]).slice(0, 90)}?` }, .25);
    return C.sort((a, b) => b.sev - a.sev);
  }
  return { list };
})();

/* shared Q&A stage: a row of officials at the top, questioners below */
const QA = (() => {
  let resolveNext = null;
  function open(o) {
    const m = modal(`<div class="qa ${o.cls}"><div class="qa-title">${o.title}</div>
      <div class="qa-stage"><div class="qa-row qa-top">${o.top.map((p, i) => `<div class="qa-p" data-k="t${i}">${avatarSVG(p.look, 0, 56)}<b>${esc(p.name)}</b><small>${p.role}</small></div>`).join('')}</div>
      <div class="qa-bubble" id="qa-bub"></div>
      <div class="qa-row qa-bot">${o.bot.map((p, i) => `<div class="qa-p" data-k="b${i}">${avatarSVG(p.look, 0, 44)}<b>${esc(p.name)}</b><small>${p.role}</small></div>`).join('')}</div></div>
      <div class="qa-panel" id="qa-panel"></div></div>`, 'wide');
    return m;
  }
  function say(k, who, text) {
    document.querySelectorAll('.qa-p').forEach(e => e.classList.toggle('on', e.dataset.k === k));
    const b = $('#qa-bub'); if (b) b.innerHTML = `<b>${esc(who)}:</b> ${text}`;
  }
  const panel = h => { const p = $('#qa-panel'); if (p) p.innerHTML = h; return p; };
  function next(label = 'Continue ▶') {
    return new Promise(res => { const p = panel(`<div class="center"><button class="btn primary" id="qa-next">${label}</button></div>`); $('#qa-next', p).onclick = res; });
  }
  function choose(prompt, choices) {
    return new Promise(res => {
      const p = panel(`<div class="qa-q">${prompt}</div><div class="qa-ch">${choices.map((c, i) => `<button class="choice" data-i="${i}"><b>${c.t}</b>${c.n ? `<span class="fx">${c.n}</span>` : ''}</button>`).join('')}</div>`);
      p.querySelectorAll('.choice').forEach(b => b.onclick = () => res(+b.dataset.i));
    });
  }
  return { open, say, panel, next, choose };
})();

const Presser = (() => {
  const minOf = id => Cabinet.get(id) || Cabinet.get('finance');
  const fx = (groups, v) => groups.forEach(g => S.ga[g] = clamp(S.ga[g] + v));
  function checkPromises() {
    const msgs = [];
    (S.pressPromises || []).filter(p => !p.done && S.turn > p.turn).forEach(p => {
      p.done = true;
      const c = Concerns.list().find(x => x.id === p.id), now = c ? c.metric() : p.base;
      const better = !c || (p.good === 'down' ? now < p.base - .01 : now > p.base + .01);
      if (better) { fx(p.g, 2); msgs.push(`✅ Promise kept: you said you would act on ${p.topic} — and things improved.`); }
      else { fx(p.g, -4); news(`Broken promise: no progress on ${p.topic} despite pledge`); msgs.push(`❌ Promise broken: you promised quick action on ${p.topic}, but nothing improved. Trust falls.`); }
    });
    return msgs;
  }
  async function run() {
    if (S.presser === S.turn) return toast('You already held a press conference this half-year.', 'bad');
    const cs = Concerns.list(), pickIds = [...new Set(cs.slice(0, 4).map(c => c.min))].filter(id => Cabinet.get(id));
    // choose who stands with you
    const all = S.cabinet.map(m => m.id);
    let chosen = pickIds.slice(0, 3);
    await new Promise(res => {
      const m = modal(`<div class="m-icon">🎙️</div><h2>Press conference</h2><p class="m-body">Journalists will ask about the country's main concerns right now: <b>${cs.slice(0, 4).map(c => c.icon + ' ' + c.topic).join(', ') || 'general questions'}</b>. Choose up to 3 ministers to stand with you — you can ask them to answer questions on their area.</p>
        <div class="pc-mins">${all.map(id => { const g = Cabinet.get(id); return `<button class="pc-min ${chosen.includes(id) ? 'on' : ''}" data-id="${id}">${avatarSVG(g.look, 0, 40)}<span><b>${g.icon} ${esc(g.name)}</b><small>${g.title} · skill ${g.skill || 70}</small></span></button>`; }).join('')}</div>
        <button class="btn primary big" id="m-ok">Start the press conference →</button>`, 'wide');
      m.querySelectorAll('.pc-min').forEach(b => b.onclick = () => {
        const id = b.dataset.id;
        if (chosen.includes(id)) chosen = chosen.filter(x => x !== id); else if (chosen.length < 3) chosen.push(id); else return toast('Up to 3 ministers.', 'bad');
        b.classList.toggle('on', chosen.includes(id));
      });
      $('#m-ok', m).onclick = res;
    });
    S.presser = S.turn;
    const J = Paper.journalists().concat([{ name: personName('f'), beat: 'Foreign news agency' }]);
    J.forEach(j => j.look = j.look || randomLook());
    const mins = chosen.map(minOf);
    const top = [{ name: S.player.name, role: ROLE.title, look: S.player.look }, ...mins.map(g => ({ name: g.name, role: g.title.replace(/^Minister of /, ''), look: g.look }))];
    QA.open({ cls: 'presser', title: `🎙️ Press conference · ${ROLE.title}'s Office`, top, bot: J.map(j => ({ name: j.name, role: j.beat, look: j.look })) });
    const before = Impact.snap();
    QA.say('t0', S.player.name, 'Good afternoon. I will take your questions — and my ministers are here to answer on their areas.');
    await QA.next('Take the first question ▶');
    const qs = cs.length ? cs.slice(0, 4) : [{ id: 'general', icon: '❓', topic: 'your plans', min: 'finance', g: GK, sev: 0, metric: () => 0, good: 'up', j: 'What is your main priority for the next six months?' }];
    const heads = [];
    for (const [i, c] of qs.entries()) {
      const jk = i % J.length;
      QA.say('b' + jk, J[jk].name, c.j);
      const onStage = chosen.includes(c.min) ? minOf(c.min) : null;
      const ch = [
        { t: 'Answer honestly: admit the problem and explain the plan', n: 'trust ↑ · works best when the problem is not too big' },
        { t: 'Defend the government: blame the world or the last government', n: 'can backfire if people are suffering' },
        { t: 'Promise quick action', n: 'popular now · must show progress by next half-year or trust falls' },
        ...mins.map(g => ({ t: `Ask ${g.name} (${g.title.replace(/^Minister of /, '')}) to answer`, n: `skill ${g.skill || 70}${g.id === c.min ? ' · this is their area' : ' · not their area'}` })),
      ];
      const k = await QA.choose(`${c.icon} Question on <b>${c.topic}</b>${onStage ? '' : ' — the responsible minister is not on stage'}`, ch);
      let v, said, who = 't0', name = S.player.name;
      if (k === 0) { v = 1.6 - c.sev * 1.2; said = `You are right to ask. ${c.topic[0].toUpperCase() + c.topic.slice(1)} is a real problem, and here is exactly what we are doing about it, step by step.`; GK.forEach(g => S.ga[g] = clamp(S.ga[g] + .3)); }
      else if (k === 1) { v = -.5 - c.sev * 2; said = 'Let us be clear: this problem was created long before we came to office, and global conditions are against us.'; }
      else if (k === 2) { v = 3; said = `I promise you: within six months you will see real improvement on ${c.topic}.`; (S.pressPromises = S.pressPromises || []).push({ id: c.id, topic: c.topic, g: c.g, base: c.metric(), good: c.good, turn: S.turn }); }
      else {
        const g = mins[k - 3], own = g.id === c.min, s = (g.skill || 70) / 100 + (own ? .1 : -.2);
        who = 't' + (k - 2); name = g.name;
        if (s >= .78) { v = 2.2 - c.sev; said = 'Thank you. Here are the numbers, what has gone wrong, and the three things my ministry is doing this month.'; const real = S.cabinet.find(x => x.id === g.id); if (real) real.skill = Math.min(99, (real.skill || 70) + 2); }
        else if (s < .6 && Math.random() < .5) { v = -3; said = 'Er… I would need to check the figures… I believe the situation is under control, more or less…'; heads.push(`Minister's blunder at press conference: ${g.name} struggles on ${c.topic}`); }
        else { v = .5; said = 'We are aware of the issue and working on it with all relevant agencies.'; }
      }
      QA.say(who, name, said);
      c.g.forEach(gr => S.ga[gr] = clamp(S.ga[gr] + v));
      await QA.next(i < qs.length - 1 ? 'Next question ▶' : 'End the press conference ▶');
    }
    Advisers.me().stress = clamp(Advisers.me().stress + 3);
    news(heads[0] || `${ROLE.title} takes questions from journalists for an hour`);
    closeModal(); save(); render();
    Impact.show('Press conference', before, { lesson: 'Answering hard questions in public is part of accountability. Honest answers build trust; empty promises are remembered.' });
  }
  return { run, checkPromises };
})();

const QTime = (() => {
  const minOf = id => Cabinet.get(id) || Cabinet.get('finance');
  function replace(id) {
    const m = S.cabinet.find(x => x.id === id); if (!m) return;
    const g = Math.random() < .45 ? 'f' : 'm', look = randomLook(); if (g === 'f') look.style = pick(['long', 'curly', 'side']);
    Object.assign(m, { name: personName(g), gender: g, look, skill: Math.round(rnd(60, 85)), qt: 0 });
  }
  async function run() {
    if (S.qtime === S.turn) return toast('Question time has already been held this half-year.', 'bad');
    S.qtime = S.turn;
    const opp = PARTIES.filter(p => S.parl.seats[p.id] && !S.parl.coalition.includes(p.id));
    const mps = (opp.length ? opp : PARTIES.filter(p => p.id !== S.player.party)).slice(0, 3).map((p, i) => { const g = Math.random() < .5 ? 'f' : 'm', look = randomLook(); if (g === 'f') look.style = pick(['long', 'curly', 'side']); return { name: personName(g), role: `MP · ${p.name}`, look, party: p.id }; });
    const cs = Concerns.list().filter(c => c.id !== 'headline').slice(0, 3);
    if (!cs.length) cs.push({ id: 'general', icon: '❓', topic: 'the government\'s priorities', min: 'finance', g: GK, sev: 0, metric: () => 0, good: 'up', mp: 'Will the Minister tell the House what the government\'s top priority is for the coming year?' });
    const mins = [...new Set(cs.map(c => c.min))].map(minOf);
    const speaker = { name: S.speakerName || (S.speakerName = personName(Math.random() < .5 ? 'f' : 'm')), role: mv() ? 'Speaker of the People\'s Majlis' : `Speaker, ${COUNTRY.parl || 'Parliament'}`, look: S.speakerLook || (S.speakerLook = randomLook()) };
    QA.open({ cls: 'qtime', title: `🏛️ Question time · ${COUNTRY.parl || 'Parliament'}`, top: [speaker, ...mins.map(g => ({ name: g.name, role: g.title.replace(/^Minister of /, 'Min. '), look: g.look }))], bot: mps });
    const before = Impact.snap(), msgs = [];
    QA.say('t0', speaker.name, 'Order, order! Questions to ministers. The Minister will answer the Honourable Member.');
    await QA.next();
    for (const [i, c] of cs.entries()) {
      const mp = mps[i % mps.length], g = minOf(c.min), mk = 't' + (1 + mins.findIndex(x => x.id === g.id));
      QA.say('b' + (i % mps.length), mp.name, c.mp);
      const k = await QA.choose(`${c.icon} The <b>${g.title}</b> (${esc(g.name)}, skill ${g.skill || 70}) must answer. How should ${g.gender === 'f' ? 'she' : 'he'} reply?`, [
        { t: 'Give the facts, accept what went wrong, set out the plan', n: 'best if the minister knows the brief (skill)' },
        { t: 'Attack the opposition\'s own record', n: 'pleases our side · angers the opposition · dodges the question' },
        { t: 'Promise a full report to the committee within three months', n: 'buys time · must deliver' },
      ]);
      const real = S.cabinet.find(x => x.id === g.id) || {}; real.qt = real.qt || 0;
      let said, v;
      if (k === 0) {
        const ok = Math.random() < (g.skill || 70) / 100 + .1;
        said = ok ? 'The Member raises a fair point. Here are the figures, the causes, and the steps we are taking, with dates.' : 'I… have the figures somewhere… the situation is improving, I am told.';
        v = ok ? 2 - c.sev : -2; real.qt += ok ? 1 : -1;
        if (ok) S.parl.rel[mp.party] = clamp((S.parl.rel[mp.party] || 40) + 2);
      } else if (k === 1) {
        said = 'Before the Honourable Member lectures us, perhaps he should remember the mess his own party left behind!';
        v = -.8; real.qt -= .5; S.parl.rel[mp.party] = clamp((S.parl.rel[mp.party] || 40) - 5);
        S.parl.coalition.forEach(p => S.parl.rel[p] = clamp((S.parl.rel[p] || 60) + 1));
      } else {
        said = 'I will place a full report before the committee within three months.';
        v = .5; (S.pressPromises = S.pressPromises || []).push({ id: c.id, topic: c.topic, g: c.g, base: c.metric(), good: c.good, turn: S.turn });
      }
      QA.say(mk, g.name, said);
      c.g.forEach(gr => S.ga[gr] = clamp(S.ga[gr] + v));
      await QA.next(i < cs.length - 1 ? 'Next question ▶' : 'End question time ▶');
      if (real.qt <= -2 && !real.motion) {
        real.motion = true;
        const need = majority(), have = coalitionSeats();
        QA.say('b' + (i % mps.length), mp.name, `This House has lost confidence in the ${g.title}. I table a motion of no confidence!`);
        const d = await QA.choose(`📜 <b>Motion of no confidence</b> in ${esc(g.name)}. Your coalition has ${have} of ${S.parl.size || 100} seats (${need} needed).`, [
          { t: 'Defend the minister and fight the vote', n: have >= need ? 'you have the votes — probably survives' : 'you do NOT have a majority — likely to lose' },
          { t: 'Ask the minister to resign and appoint someone new', n: 'clean break · the opposition claims a win' }]);
        if (d === 0 && (have >= need ? Math.random() < .85 : Math.random() < .25)) { real.qt = 0; QA.say('t0', speaker.name, `The Ayes to the left… the Noes to the right… The motion is defeated! The ${g.title} stays.`); news(`${g.name} survives no-confidence vote`); }
        else { const old = g.name; replace(g.id); QA.say('t0', speaker.name, d === 0 ? 'The motion is carried. The minister must go.' : `The House notes the resignation of ${old}.`); news(`${old} ${d === 0 ? 'loses no-confidence vote' : 'resigns'}; new ${g.title} appointed`); GK.forEach(x => S.ga[x] = clamp(S.ga[x] - (d === 0 ? 2 : .5))); msgs.push(`${old} replaced as ${g.title}`); }
        await QA.next('Continue ▶');
      }
    }
    news(`Ministers face tough questions in the ${COUNTRY.parl || 'parliament'}`);
    closeModal(); save(); render();
    Impact.show('Question time', before, { lesson: 'In a parliamentary democracy, ministers answer to the elected representatives. Question time lets the opposition hold the government to account in public.' });
  }
  const mv = () => COUNTRY.id === 'mv';
  return { run };
})();
