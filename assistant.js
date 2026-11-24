/* ============================================================
   ASSISTANT MODE — a Chief of Staff who explains how to run a
   country and suggests what to do next. Can be switched off
   (☰ menu or the card itself); then all guidance is hidden.
   ============================================================ */

const LESSONS = [
  ['The governing cycle', 'Most governments work in a rhythm: hear the ministers (cabinet), set the budget, pass laws, deliver projects, explain decisions to the public, then review the results. Repeat every half-year.'],
  ['The budget is policy', 'Every promise costs money. Spending above revenue is a deficit, financed by borrowing — and debt must be repaid with interest. Good leaders know where every rufiyaa, dollar or euro comes from.'],
  ['Separation of powers', 'The president runs the government, parliament makes the laws and approves the budget, and the courts check that both obey the constitution. You need a majority in parliament to pass bills.'],
  ['Central bank independence', 'The central bank controls money and interest rates. Governments that force it to print money usually get high inflation, so most countries let it decide on its own.'],
  ['Transparent procurement', 'Public projects are won through open tenders judged on price, quality and capacity. Fair tenders get better value and protect the government from corruption scandals.'],
  ['Coalitions and compromise', 'When your party lacks a majority you must build coalitions. Partners expect posts and policies in return, and can walk out if you ignore them.'],
  ['Explain your decisions', 'Even good reforms fail if people do not understand them. Speeches, press conferences and town halls build the trust that tough decisions need.'],
  ['Crisis management', 'In a crisis act quickly, tell the truth, protect the most vulnerable first and fix the cause afterwards.'],
  ['Debt sustainability', 'Debt is safe when the economy grows faster than the interest rate and the budget stops adding to it. Cheap, long-term loans are better than expensive short ones.'],
  ['Diplomacy pays', 'Friendly partners provide trade, investment, tourists and help in emergencies. Summits and state visits build that trust.'],
  ['Accountability', 'A free press and an active opposition can be uncomfortable, but they expose mistakes early — before they become disasters.'],
  ['Megaprojects', 'Big projects almost always cost more and take longer than first planned (“optimism bias”). Good governments study feasibility first, assess the environment honestly, choose builders on quality not just price, and check progress with independent engineers.'],
  ['Long-term thinking', 'Schools, hospitals and clean energy pay off over decades, after your term ends. Great leaders invest for the next generation, not just the next election.'],
];

const Assistant = (() => {
  const KEY = 'president.assist';
  const on = () => localStorage.getItem(KEY) !== '0';
  function set(v) { localStorage.setItem(KEY, v ? '1' : '0'); render(); toast(v ? '🧭 Assistant mode on' : 'Assistant mode off', 'good'); }
  function cos() { if (!S.cos) { const g = Math.random() < .5 ? 'f' : 'm', look = randomLook(); if (g === 'f') look.style = pick(['long', 'curly', 'side']); S.cos = { name: personName(g), look }; } return S.cos; }
  // the next useful things to do, in the order a real government would
  function steps() {
    const out = [], bc = budgetCalc(), def = -bc.bal * 2 / S.gdp * 100, m = typeof Clock !== 'undefined' ? Clock.month() : 0;
    const btn = (act, id, label) => `<button class="btn small" data-act="${act}"${id ? ` data-id="${id}"` : ''}>${label}</button>`;
    if (!(S.cabinetDone && S.cabinetDone.turn === S.turn)) out.push(['👔', 'Start the half-year with a <b>cabinet meeting</b> — each minister reports on their sector and proposes action.', btn('cabinet', '', 'Hold cabinet →')]);
    const urgent = typeof Experts !== 'undefined' ? Experts.urgent() : [];
    if (urgent.length) out.push(['🧠', `<b>${urgent[0].name}.</b> Ask the experts what the options are before you act.`, btn('experts', urgent[0].id, 'Ask experts →')]);
    if (S.pc < 2) out.push(['⭐', `You have only <b>⭐ ${S.pc}</b> political capital. Earn more by achieving targets, passing Finance School lessons, and keeping approval above 60%.`, btn('stars', '', 'How to earn ⭐ →')]);
    if (typeof Advisers !== 'undefined' && Advisers.urgent().length) out.push(['🧑‍💼', `Your ${Advisers.urgent().map(a => a.role().replace(/^President's /, '').toLowerCase()).join(' and ')} want${Advisers.urgent().length > 1 ? '' : 's'} to see you urgently.`, btn('advisers', '', 'Advisers →')]);
    if (typeof Mega !== 'undefined' && Mega.alerts()) out.push(['🚧', `A <b>megaproject</b> needs your decision (${Mega.alerts()} warning${Mega.alerts() > 1 ? 's' : ''}). If you do not decide, the site manager will.`, btn('tab', 'mega', 'Megaprojects →')]);
    else if (typeof Mega !== 'undefined' && Mega.active().some(p => p.phase === 'build' && p.insp !== S.turn && S.turn - (p.insp || p.start) >= 2)) out.push(['🔍', 'Nobody has inspected your megaproject for a year. Reported progress may be too optimistic — <b>visit the site</b>.', btn('tab', 'mega', 'Megaprojects →')]);
    if (def > 4) out.push(['💰', `The deficit is ${fmt(def, 1)}% of GDP. Review the <b>budget</b>: trim spending or raise revenue, or discuss cheaper loans in cabinet.`, btn('tab', 'budget', 'Budget →')]);
    if (Money.peg() && Money.cover() < 2) out.push(['💵', `Dollar reserves cover only ${fmt(Money.cover(), 1)} months of imports. Plan financing now.`, btn('tab', 'money', 'Money →')]);
    const unkept = S.promises.filter(p => p.term === S.term && !p.broken && !S.laws.includes(PROMISES[p.g].law));
    if (unkept.length && S.pc >= 2 && !S.lawThisTurn) out.push(['📜', `You promised the <b>${LAWS.find(l => l.id === PROMISES[unkept[0].g].law).name}</b>. Draft it and take it to parliament.`, btn('tab', 'laws', 'Laws →')]);
    if (!S.projects.length) out.push(['🏗️', 'No projects are being built. Pick a region that needs a school, hospital or homes and run a <b>public tender</b>.', btn('buildPick', '', 'Build →')]);
    if (approval() < 45) out.push(['🎤', 'Approval is low. <b>Explain your plan</b> in a speech or visit the regions.', btn('speechPick', '', 'Speech →')]);
    if (S.tripTurn !== S.turn && S.turn % 2 === 0) out.push(['✈️', 'A summit or state visit this half-year can bring trade, investment and help.', btn('foreign', '', 'Foreign affairs →')]);
    if (m >= 5 || !out.length) out.push(['⏭️', 'When you have done what you planned, <b>end the half-year</b> to see the results in the newspaper.', btn('endTurn', '', 'End half-year →')]);
    return out.slice(0, 4);
  }
  function card() {
    if (!on() || !S || S.phase !== 'govern') return '';
    const c = cos(), L = LESSONS[(S.turn - 1) % LESSONS.length], open = UI.cosOpen !== false;
    return `<div class="card cos ${open ? '' : 'closed'}">
      <div class="cos-h"><div class="cos-av">${avatarSVG(c.look, 1, 40)}</div><div><b>🧭 ${esc(c.name)}</b><small>Chief of Staff · assistant mode</small></div>
        <button class="btn small ghost" data-act="cosToggle">${open ? 'Hide' : 'Show'}</button><button class="btn small ghost" data-act="assistOff" title="Turn assistant mode off">Turn off</button></div>
      ${open ? `<div class="cos-b"><div class="cos-next"><div class="lbl">What to do next</div>${steps().map(([i, t, b]) => `<div class="nx"><span>${i}</span><p>${t}</p>${b}</div>`).join('')}</div>
        ${typeof Qual !== 'undefined' ? Qual.termCard() : ''}
        <div class="cos-lesson"><div class="lbl">📘 How to run a country — ${L[0]}</div><p>${L[1]}</p><button class="btn small" data-act="school">📘 Finance School lessons</button></div></div>` : ''}
    </div>`;
  }
  return { on, set, card, steps };
})();
