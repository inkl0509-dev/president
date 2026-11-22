/* ============================================================
   DRAFT YOUR OWN BILL — with help from the assistant
   (the Attorney General's legislative drafter + Chief of Staff).
   Choose a policy area, write the title and purpose, pick the
   clauses (with funding and phase-in options). The assistant
   reviews the draft live: cost, winners and losers, expected
   votes and problems to fix. The bill then goes through the
   normal parliamentary process (first reading → committee →
   debate → vote → enactment).
   ============================================================ */

const Drafter = (() => {
  const mv = () => COUNTRY.id === 'mv';
  const unit = () => mv() ? 'inhabited island' : 'district';
  // clause: [id, label, legal text, groups, stats, cost (% of GDP per half-year; negative = revenue)]
  const AREAS = () => ({
    health: { icon: '🏥', name: 'Health', ministry: 'health', committee: 'Committee on Health and Social Affairs', clauses: [
      ['clinics', `A health centre on every ${unit()}`, `The Minister shall ensure that a primary health centre, staffed by at least one doctor and two nurses, operates on every ${unit()} within three years.`, { elderly: 3, farmers: 3 }, { health: 4 }, .25],
      ['meds', 'Free essential medicines', 'Medicines on the National Essential Medicines List shall be supplied free of charge at public health facilities.', { elderly: 4, workers: 2 }, { health: 2 }, .3],
      ['insure', mv() ? 'Expand Aasandha health insurance cover' : 'Universal health insurance', mv() ? 'The national health insurance scheme (Aasandha) shall be extended to cover treatment abroad that is not available in the Maldives, subject to referral rules.' : 'Every resident shall be covered by a national health insurance scheme funded from general taxation.', { elderly: 3, workers: 3, youth: 1 }, { health: 3 }, .4],
      ['evac', mv() ? 'Air and sea ambulance for the atolls' : 'Rural ambulance network', `The Minister shall establish an emergency ambulance service able to reach every ${unit()} within four hours.`, { farmers: 3, elderly: 2 }, { health: 2 }, .15],
      ['sugar', 'Tax on sugary drinks and tobacco', 'An excise duty shall be levied on sugar-sweetened beverages and tobacco products, the proceeds of which shall be paid into the Health Fund.', { business: -2, youth: -1 }, { health: 2 }, -.15],
      ['doctors', 'Scholarships for doctors & nurses who serve in the regions', `Scholarships shall be awarded to medical and nursing students who undertake to serve five years on an ${unit()} outside the capital.`, { youth: 2 }, { health: 2, education: 1 }, .1],
    ] },
    education: { icon: '📚', name: 'Education', ministry: 'education', committee: 'Committee on Education', clauses: [
      ['freeuni', 'Free first degree at public universities', 'Citizens admitted to a first degree at a public university shall pay no tuition fees.', { youth: 5, elderly: 1 }, { education: 4 }, .35],
      ['teachers', 'Raise teachers\' pay and set a career ladder', 'The salaries of public school teachers shall be increased and linked to a professional career framework.', { workers: 2, youth: 1 }, { education: 3 }, .2],
      ['meals', 'Free school meals', 'Every pupil in a public primary school shall receive a free nutritious meal on each school day.', { workers: 2, youth: 1 }, { education: 2, health: 1 }, .15],
      ['tvet', 'Vocational training & apprenticeships', mv() ? 'A national apprenticeship programme shall train young Maldivians for skilled jobs in tourism, fisheries, construction and technology.' : 'A national apprenticeship programme shall be established in partnership with employers.', { youth: 3, business: 2 }, { education: 2, economy: 1 }, .1],
      ['digital', 'Digital classrooms', 'Every public school shall be connected to high-speed internet and provided with digital learning devices.', { youth: 2 }, { education: 2 }, .1],
    ] },
    economy: { icon: '📈', name: 'Economy & jobs', ministry: 'economy', committee: 'Committee on Economic Affairs', clauses: [
      ['sme', 'Small-business loan fund', 'A fund shall provide low-interest loans and guarantees to small and medium enterprises.', { business: 4, youth: 1 }, { economy: 2 }, .15],
      ['onestop', 'One-stop shop: register a business in one day', 'All licences required to open a business shall be issued through a single online portal within one working day.', { business: 3, youth: 1 }, { economy: 2, freedom: 1 }, .02],
      ['sez', 'Special economic zones with tax holidays', 'The Minister may designate special economic zones in which approved investors enjoy a corporate tax holiday of up to ten years.', { business: 4, workers: 1 }, { economy: 3, environment: -1 }, .1],
      ['local', mv() ? 'Quota for Maldivian staff (fewer expatriate workers)' : 'Local hiring quota', mv() ? 'Employers with more than fifty staff shall ensure that at least half of their workforce are Maldivian citizens.' : 'Employers receiving public contracts shall hire at least half of their workforce locally.', { youth: 3, workers: 2, business: -4 }, { economy: -1 }, 0],
      ['wageflr', 'Minimum wage for the private sector', 'A minimum wage for the private sector shall be set by the Minister on the advice of a wage board and reviewed every two years.', { workers: 5, business: -4 }, { economy: -1 }, 0],
    ] },
    environment: { icon: '🌿', name: 'Environment & energy', ministry: 'energy', committee: 'Committee on Environment and Climate Change', clauses: [
      ['solar', '33% of electricity from renewables by 2030', 'At least one third of electricity generated shall come from renewable sources by 2030; the Minister shall publish an annual progress report.', { youth: 3 }, { environment: 4, economy: 1 }, .2],
      ['plastic', 'Ban single-use plastics', 'The import, manufacture and sale of listed single-use plastic products are prohibited.', { youth: 2, business: -2 }, { environment: 3 }, 0],
      ['reefs', mv() ? 'Protect reefs: new marine protected areas' : 'New national parks & protected areas', mv() ? 'The Minister shall designate marine protected areas covering at least 20% of the reef area, with rules on fishing and anchoring.' : 'At least 20% of the land and coastal area shall be designated as protected areas.', { youth: 2, farmers: -2 }, { environment: 4 }, .05],
      ['waste', 'Regional waste management centres', `Every province shall have a waste management centre; open burning and dumping on ${mv() ? 'islands' : 'land'} are prohibited.`, { farmers: 1, youth: 1 }, { environment: 3, health: 1 }, .15],
      ['coast', 'Coastal protection & climate adaptation fund', 'A Climate Adaptation Fund shall finance sea walls, beach nourishment and flood defences for vulnerable communities.', { farmers: 3, elderly: 1 }, { environment: 2, security: 1 }, .2],
    ] },
    housing: { icon: '🏘️', name: 'Housing', ministry: 'housing', committee: 'Committee on Housing and Urban Development', clauses: [
      ['social', 'Social housing programme', 'The Housing Authority shall build or acquire affordable rental homes for low-income families, allocated by public points system.', { workers: 3, youth: 3 }, { housing: 4 }, .3],
      ['firsthome', 'Loans for first-time buyers', 'First-time buyers shall be eligible for a government-backed mortgage with a deposit of 5%.', { youth: 4, workers: 1 }, { housing: 2 }, .1],
      ['rent', 'Rent stabilisation', 'Annual rent increases for residential tenancies shall not exceed the rate of inflation plus two percentage points.', { workers: 3, youth: 2, business: -3 }, { housing: 1, economy: -1 }, 0],
      ['land', mv() ? 'Land plots for islanders who have none' : 'Land for young families', mv() ? 'Island councils shall allocate residential plots to eligible citizens who own no land, in order of registration.' : 'Public land shall be released for affordable housing for young families.', { youth: 3, farmers: 2 }, { housing: 2 }, .05],
      ['codes', 'Building safety standards', 'All new buildings over four storeys shall comply with the national building code, certified by an independent engineer.', { business: -1 }, { housing: 1, security: 1 }, .02],
    ] },
    social: { icon: '🤝', name: 'Social protection', ministry: 'labour', committee: 'Committee on Social Affairs', clauses: [
      ['pension', 'Raise the basic old-age pension', 'The basic old-age pension shall be increased and indexed to inflation each year.', { elderly: 6 }, {}, .35],
      ['child', 'Child benefit for low-income families', 'A monthly benefit shall be paid for each child in a household below the income threshold.', { workers: 3, youth: 1 }, { health: 1 }, .2],
      ['disab', 'Disability allowance & accessible buildings', 'Persons with disabilities shall receive a monthly allowance; all new public buildings shall be accessible.', { elderly: 2, workers: 1 }, { freedom: 1 }, .1],
      ['unemp', 'Unemployment insurance', 'Employees who lose their job shall receive 60% of their previous wage for up to six months, funded by employer and employee contributions.', { workers: 4, business: -2 }, { economy: 1 }, .1],
    ] },
    security: { icon: '🛡️', name: 'Security & justice', ministry: 'interior', committee: 'Committee on National Security', clauses: [
      ['police', 'Community policing in every region', `A community police officer shall be assigned to every ${unit()}.`, { elderly: 3, business: 1 }, { security: 3 }, .15],
      ['rehab', 'Drug rehabilitation instead of prison for users', 'Persons convicted only of drug use shall be sent to treatment and rehabilitation rather than imprisonment.', { youth: 2, elderly: -1 }, { security: 1, health: 2 }, .1],
      ['courts', 'Faster courts: digital case management', 'Courts shall adopt electronic filing and publish judgments online; cases shall be heard within statutory time limits.', { business: 2 }, { security: 1, freedom: 2 }, .05],
      ['gangs', 'Tough penalties for gang violence', 'Penalties for gang-related violent offences shall be doubled.', { elderly: 3, youth: -2 }, { security: 2, freedom: -1 }, .03],
    ] },
    governance: { icon: '⚖️', name: 'Good governance', ministry: 'finance', committee: 'Committee on Independent Institutions', clauses: [
      ['acc', 'Stronger anti-corruption commission', 'The Anti-Corruption Commission shall have power to investigate and to freeze assets suspected to be proceeds of corruption.', { business: 1, youth: 2 }, { freedom: 2, economy: 1 }, .02],
      ['assets', 'Public asset declarations by officials', 'Ministers, members of parliament and senior officials shall publish an annual declaration of assets and interests.', { youth: 2, workers: 1 }, { freedom: 2 }, 0],
      ['rti', 'Right to information within 21 days', 'Public authorities shall answer requests for information within twenty-one days.', { youth: 2 }, { freedom: 3 }, 0],
      ['decent', mv() ? 'Decentralisation: 40% of revenue for island & city councils' : 'Decentralisation: more money for local councils', mv() ? 'Not less than forty per cent of state revenue from land and resort rents shall be transferred to island and city councils.' : 'A fixed share of national revenue shall be transferred to local councils.', { farmers: 4, workers: 1 }, { freedom: 1, economy: 1 }, .15],
    ] },
    ...(mv() ? { ocean: { icon: '🐟', name: 'Fisheries & tourism', ministry: 'tourism', committee: 'Committee on Economic Affairs', clauses: [
      ['pole', 'Support for pole-and-line tuna fishing', 'The Government shall guarantee a minimum purchase price for pole-and-line caught tuna and support fishers with fuel and ice.', { farmers: 5 }, { economy: 1, environment: 1 }, .15],
      ['guest', 'Guesthouse tourism on local islands', 'Guesthouses on inhabited islands shall receive reduced licence fees and access to a tourism promotion fund.', { business: 3, farmers: 2, youth: 2 }, { economy: 2 }, .05],
      ['training', 'Tourism jobs for Maldivians', 'Resorts shall train and employ Maldivian staff in at least half of their positions within five years.', { youth: 3, business: -3 }, { economy: 0, education: 1 }, 0],
    ] } } : {}),
  });
  const FUNDING = [
    ['none', 'No funding clause', '', 0, {}],
    ['levy', 'New levy to pay for it', 'The costs of this Act shall be met from a dedicated levy set by regulations and paid into a special fund.', -1, { business: -2, workers: -1 }],
    ['realloc', 'Pay for it by cutting other spending', 'The costs of this Act shall be met by reallocation within existing budget ceilings.', -.6, { workers: -1 }],
    ['borrow', 'Finance it by borrowing', 'The costs of this Act may be met from government borrowing.', 0, {}],
  ];
  const PROCESS = [
    ['phase', 'Phase it in over two years', 'This Act shall be brought into force in stages over a period of two years.', .5, .8],
    ['sunset', 'Review after three years (sunset clause)', 'This Act shall cease to have effect five years after commencement unless renewed, and shall be reviewed after three years.', .4, 1],
    ['pilot', 'Pilot it in one region first', 'This Act shall first apply as a pilot in one province or region designated by the Minister.', .7, .5],
  ];

  function build(st) {
    const A = AREAS()[st.area], cl = A.clauses.filter(c => st.clauses.includes(c[0]));
    const g = {}, s = {}; let cost = 0;
    cl.forEach(c => { for (const k in c[3]) g[k] = (g[k] || 0) + c[3][k]; for (const k in c[4]) s[k] = (s[k] || 0) + c[4][k]; cost += c[5]; });
    let mult = 1, ease = 0;
    PROCESS.filter(p => st.process.includes(p[0])).forEach(p => { ease += p[3] * 10; mult *= p[4]; });
    const F = FUNDING.find(f => f[0] === st.funding), raw = cost;
    if (F[0] === 'levy' || F[0] === 'realloc') { cost = cost > 0 ? cost * (1 + F[3]) : cost; for (const k in F[4]) g[k] = (g[k] || 0) + F[4][k]; }
    for (const k in g) g[k] = Math.round(g[k] * mult * 10) / 10; for (const k in s) s[k] = Math.round(s[k] * mult * 10) / 10;
    cost = Math.round(cost * mult * 100) / 100;
    const pc = Math.min(5, 2 + Math.floor(cl.length / 2));
    return { A, cl, g, s, cost, ease, pc, F, raw: Math.round(raw * mult * 100) / 100 };
  }
  function review(st, b) {
    const notes = [], good = [];
    if (!st.title.trim()) notes.push('Give the bill a short title, for example “' + suggestTitle(st) + '”.');
    else if (!/bill$/i.test(st.title.trim())) notes.push('By convention the title ends with the word “Bill” (it becomes an “Act” when passed).');
    if (st.purpose.trim().length < 20) notes.push('Write the purpose (long title): “A Bill to … and for connected purposes.” It tells courts what the law is for.');
    if (!b.cl.length) notes.push('Choose at least one substantive clause — what the law will actually do.');
    if (b.cl.length > 4) notes.push('More than four main clauses makes the bill hard to pass. Consider splitting it into two bills.');
    if (b.cost > .2 && st.funding === 'none') notes.push(`It costs about ${fmt(b.cost * 2, 1)}% of GDP a year with no funding clause — the Minister of Finance will object. Add a levy, a reallocation or a phase-in.`);
    if (b.cost > .5) notes.push('This is a very expensive law. A pilot or phase-in would lower the cost and win votes.');
    if (st.funding === 'borrow' && debtPct() > (S.debtSoft || 80)) notes.push('Financing it by borrowing while debt is already high will alarm investors.');
    const worst = Object.entries(b.g).sort((a, c) => a[1] - c[1])[0];
    if (worst && worst[1] <= -3 && !st.process.includes('phase')) notes.push(`${GROUPS[worst[0]].name} lose out. A phase-in clause would soften the blow and reduce opposition.`);
    if (b.cl.length && b.cost <= .2) good.push('Affordable.');
    if (st.process.includes('sunset')) good.push('The review clause reassures sceptical members.');
    if (st.funding === 'levy' || st.funding === 'realloc') good.push('It says where the money comes from — good budgeting practice.');
    return { notes, good };
  }
  const suggestTitle = st => ({ health: 'Island Health Services Bill', education: 'Education Opportunity Bill', economy: 'Jobs and Enterprise Bill', environment: 'Climate and Environment Bill', housing: 'Affordable Homes Bill', social: 'Social Protection Bill', security: 'Safer Communities Bill', governance: 'Integrity in Public Office Bill', ocean: 'Fisheries and Tourism Bill' }[st.area] || 'Public Benefit Bill');
  const suggestPurpose = (st, b) => `A Bill to ${b.cl.map(c => c[1].toLowerCase()).join(', ') || 'improve public services'}, and for connected purposes.`;

  async function open() {
    if (!S || S.phase !== 'govern' || UI.busy || S.pendingEvent) return;
    if (S.lawThisTurn) return toast('Only one bill per half-year. Try again next half-year.', 'bad');
    const st = { area: 'health', title: '', purpose: '', clauses: [], funding: 'none', process: [] };
    const res = await new Promise(resolve => {
      const draw = () => {
        const areas = AREAS(), b = build(st), rv = review(st, b);
        const L = { g: b.g, s: b.s, ease: b.ease }, votes = b.cl.length ? expectedYes(L) : 0, mi = Cabinet.get(areas[st.area].ministry) || Cabinet.get('finance');
        const ready = !rv.notes.length || (b.cl.length && st.title.trim() && st.purpose.trim().length >= 20);
        const m = modal(`<div class="dr"><div class="scene-title">✍️ Drafting studio — your own bill</div>
          <p class="m-body small">Write a law yourself. The legislative drafter turns your choices into legal language, and your assistant reviews the draft as you go.</p>
          <div class="dr-grid"><div class="dr-form">
            <div class="lbl">1. Policy area</div><div class="dr-areas">${Object.entries(areas).map(([k, a]) => `<button class="${st.area === k ? 'on' : ''}" data-area="${k}">${a.icon} ${a.name}</button>`).join('')}</div>
            <div class="lbl">2. Short title</div><input id="dr-title" maxlength="80" value="${esc(st.title)}" placeholder="${esc(suggestTitle(st))}">
            <div class="lbl">3. Purpose (long title)</div><textarea id="dr-purpose" maxlength="300" placeholder="A Bill to … and for connected purposes.">${esc(st.purpose)}</textarea>
            <button class="linkbtn" data-sug="1">✨ Let the assistant suggest a title and purpose</button>
            <div class="lbl">4. What the law does (choose clauses)</div>
            <div class="dr-cl">${areas[st.area].clauses.map(c => `<label class="dr-c ${st.clauses.includes(c[0]) ? 'on' : ''}"><input type="checkbox" data-cl="${c[0]}" ${st.clauses.includes(c[0]) ? 'checked' : ''}><span><b>${c[1]}</b><small>${fxChips({ g: c[3], s: c[4] }, 'gov')} ${c[5] > 0 ? `<span class="chip down">cost ${fmt(c[5] * 2, 1)}% GDP/yr</span>` : c[5] < 0 ? `<span class="chip up">revenue ${fmt(-c[5] * 2, 1)}% GDP/yr</span>` : ''}</small></span></label>`).join('')}</div>
            <div class="lbl">5. How it is paid for</div><div class="dr-areas">${FUNDING.map(f => `<button class="${st.funding === f[0] ? 'on' : ''}" data-fund="${f[0]}">${f[1]}</button>`).join('')}</div>
            <div class="lbl">6. Making it easier to pass</div><div class="dr-areas">${PROCESS.map(p => `<button class="${st.process.includes(p[0]) ? 'on' : ''}" data-proc="${p[0]}">${p[1]}</button>`).join('')}</div>
          </div>
          <div class="dr-side"><div class="dr-assist"><div class="cos-h"><div class="cos-av">${avatarSVG((S.cos || { look: S.player.look }).look, 1, 34)}</div><div><b>🧭 Assistant's review</b><small>${Assistant.on() ? 'Chief of Staff' : 'Legislative drafter'}</small></div></div>
              ${rv.notes.length ? `<ul class="dr-notes">${rv.notes.map(n => `<li>⚠️ ${n}</li>`).join('')}</ul>` : '<p class="good small">✅ The draft is ready to introduce.</p>'}
              ${rv.good.length ? `<ul class="dr-good">${rv.good.map(n => `<li>👍 ${n}</li>`).join('')}</ul>` : ''}
              <div class="dr-k"><span>Cost</span><b>${b.raw > 0 && b.raw !== b.cost ? `${fmt(b.raw * 2, 1)}% of GDP a year, ${b.cost <= 0 ? 'fully' : 'partly'} paid by ${st.funding === 'levy' ? 'the new levy' : 'cuts elsewhere'}` : b.cost > 0 ? fmt(b.cost * 2, 1) + '% of GDP a year' : b.cost < 0 ? 'raises ' + fmt(-b.cost * 2, 1) + '% of GDP' : 'no direct cost'}</b></div>
              <div class="dr-k"><span>Expected votes</span><b class="${votes >= majority() ? 'good' : 'bad'}">${b.cl.length ? `~${votes} of ${S.parl.size || 100}` : '—'} <small>(need ${majority()})</small></b></div>
              <div class="dr-k"><span>Political capital</span><b>⭐${b.pc} <small>(you have ${S.pc})</small></b></div>
              <div class="lbl">Effects</div><div class="fxrow">${b.cl.length ? fxChips({ g: b.g, s: b.s }, 'gov') : '<span class="muted small">choose clauses</span>'}</div>
              ${mi ? `<p class="small">Sponsoring minister: <b>${esc(mi.name)}</b>, ${esc(mi.title)}</p>` : ''}</div>
            <div class="dr-prev doc bill"><div class="doc-title">${esc((st.title || suggestTitle(st)).toUpperCase())}</div><p class="long"><i>${esc(st.purpose || suggestPurpose(st, b))}</i></p>
              ${b.cl.map((c, i) => `<div class="sec"><b>${i + 2}.</b> ${c[2]}</div>`).join('')}${b.F[2] ? `<div class="sec"><b>${b.cl.length + 2}.</b> ${b.F[2]}</div>` : ''}${PROCESS.filter(p => st.process.includes(p[0])).map((p, i) => `<div class="sec"><b>${b.cl.length + (b.F[2] ? 3 : 2) + i}.</b> ${p[2]}</div>`).join('')}</div>
          </div></div>
          ${edu('In real governments, ministers decide WHAT a law should do and professional drafters (often in the Attorney General\'s office) write it in precise legal language. Every bill needs a clear purpose, clauses that can be enforced, and an honest estimate of its cost.')}
          <div class="doc-actions"><button class="btn" id="dr-x">Close</button><button class="btn primary" id="dr-go" ${ready && b.cl.length && S.pc >= b.pc ? '' : 'disabled'}>📜 Send to parliament (⭐${b.pc})</button></div></div>`, 'wide');
        const keep = () => { st.title = $('#dr-title', m).value; st.purpose = $('#dr-purpose', m).value; };
        m.querySelectorAll('[data-area]').forEach(x => x.onclick = () => { keep(); if (st.area !== x.dataset.area) { st.area = x.dataset.area; st.clauses = []; } draw(); });
        m.querySelectorAll('[data-cl]').forEach(x => x.onchange = () => { keep(); const id = x.dataset.cl; st.clauses = x.checked ? [...st.clauses, id] : st.clauses.filter(c => c !== id); draw(); });
        m.querySelectorAll('[data-fund]').forEach(x => x.onclick = () => { keep(); st.funding = x.dataset.fund; draw(); });
        m.querySelectorAll('[data-proc]').forEach(x => x.onclick = () => { keep(); const id = x.dataset.proc; st.process = st.process.includes(id) ? st.process.filter(p => p !== id) : [...st.process, id]; draw(); });
        $('[data-sug]', m).onclick = () => { keep(); st.title = st.title || suggestTitle(st); st.purpose = suggestPurpose(st, build(st)); draw(); };
        $('#dr-title', m).onchange = () => { keep(); draw(); };
        $('#dr-purpose', m).onchange = () => { keep(); draw(); };
        $('#dr-x', m).onclick = () => resolve(null);
        $('#dr-go', m).onclick = () => { keep(); resolve(st); };
      };
      draw();
    });
    closeModal();
    if (!res) return;
    const b = build(res), id = 'my' + Date.now().toString(36);
    let title = res.title.trim() || suggestTitle(res); if (!/bill$/i.test(title)) title += ' Bill';
    const law = { id, name: title.replace(/ Bill$/i, ' Act'), icon: b.A.icon, pc: b.pc, cost: b.cost, desc: res.purpose.trim() || suggestPurpose(res, b), g: b.g, s: b.s, ease: b.ease, custom: true };
    const legal = {
      committee: b.A.committee, ministry: b.A.ministry, title, long: law.desc,
      clauses: [...b.cl.map(c => c[2]), ...(b.F[2] ? [b.F[2]] : []), ...PROCESS.filter(p => res.process.includes(p[0])).map(p => p[2])],
      amend: res.process.includes('phase') ? 'Add a requirement for the Minister to report to Parliament every year on implementation and cost.' : 'Phase the measures in over two years and require an annual report to Parliament.',
      wit: witnesses(b),
    };
    (S.customLaws = S.customLaws || []).push({ law, legal });
    register();
    UI.tab = 'laws'; render();
    await Legis.run(id);
  }
  function witnesses(b) {
    const ws = [], top = Object.entries(b.g).sort((a, c) => c[1] - a[1])[0], low = Object.entries(b.g).sort((a, c) => a[1] - c[1])[0];
    const ORG = { workers: 'Federation of Trade Unions', business: mv() ? 'Maldives National Chamber of Commerce and Industry' : 'Chamber of Commerce and Industry', farmers: mv() ? 'Island Councils Association' : 'Farmers\' Union', youth: 'National Youth Council', elderly: 'Senior Citizens\' Association' };
    if (top && top[1] > 0) ws.push([ORG[top[0]], 1, 'This bill responds to real needs of the people we represent. We urge members to support it.']);
    if (low && low[1] < 0) ws.push([ORG[low[0]], -1, 'The costs fall on our members. We ask for changes before it is passed.']);
    ws.push(['Fiscal Responsibility Council', b.cost > .25 ? -1 : 0, b.cost > .25 ? 'The bill has a significant cost. Parliament should be clear how it will be financed.' : 'The fiscal cost appears manageable.']);
    return ws;
  }
  // put the player's own laws into the law list (also after loading a saved game)
  function register() {
    (S && S.customLaws || []).forEach(({ law, legal }) => { if (!LAWS.some(l => l.id === law.id)) LAWS.push(law); LEGAL[law.id] = legal; });
  }
  return { open, register };
})();
