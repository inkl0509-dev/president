/* ============================================================
   ACCOUNTABILITY — two ways leaders must answer questions:
   1. 🎙️ PRESIDENTIAL PRESS CONFERENCE: journalists ask about the
      country's current concerns, aimed at the ministers on stage.
   2. 🏛️ QUESTION TIME IN PARLIAMENT: opposition MPs question
      ministers in the chamber. Poor answers can lead to a motion
      of no confidence in the minister.
   Questions come from what is actually happening in the game,
   rotate so the same question is not asked again and again, and
   follow up on earlier answers. Good answers give the real
   figures, the causes, numbered steps with amounts, and a
   measurable target with a date.
   ============================================================ */

const Concerns = (() => {
  const mvc = () => COUNTRY.id === 'mv';
  const Y = u => money(u * 2);                                  // half-year game units → money per year
  const pct = (v, d = 1) => fmt(v, d) + '%';
  const when = n => turnLabel(S.turn + n);
  const b = () => budgetCalc();
  const defPct = () => -b().bal * 2 / S.gdp * 100;
  const labour = () => (S.pop || 1) * .45;                         // labour force, millions
  const people = m => m >= 1 ? fmt(m, 1) + ' million' : Math.round(m * 1000).toLocaleString('en') + ',000';
  const spendLine = k => S.budget[k] * S.gdp * .005;               // per half-year, game units
  const taxAuth = () => (typeof Money !== 'undefined' && Money.F().taxAuth) || 'the tax authority';
  const cb = () => (typeof Money !== 'undefined' && (Money.F().short || Money.F().cb)) || 'the central bank';
  const minName = id => { const m = Cabinet.get(id); return m ? m.title : 'the minister'; };

  // ---------- each concern: figures, severity, questions, and a real plan ----------
  const DEF = [
    { id: 'deficit', icon: '💰', topic: 'the budget deficit', min: 'finance', g: ['business', 'elderly'], good: 'down',
      metric: defPct, show: v => v >= 0 ? `a deficit of ${pct(v)} of GDP` : `a surplus of ${pct(-v)} of GDP`, sev: v => (v - 2) / 6,
      plan() {
        const B = b(), d = defPct(), cats = ['health', 'education', 'security', 'infra', 'welfare'].sort((x, y) => S.budget[y] - S.budget[x]);
        return {
          facts: `This year we expect revenue of <b>${Y(B.rev)}</b> and spending of <b>${Y(B.rev - B.bal)}</b>, of which <b>${Y(B.interest)}</b> is interest. That is ${this.show(d)}.`,
          cause: `The biggest costs are ${cats[0]} (${Y(spendLine(cats[0]))}) and ${cats[1]} (${Y(spendLine(cats[1]))}), and interest keeps rising with the debt.`,
          steps: [`Freeze new hiring and cut non-essential spending by 5% — saving about <b>${Y(B.spend * .05)}</b> a year.`,
            `Close tax loopholes and collect arrears through ${taxAuth()} — about <b>${money(S.gdp * .003)}</b>.`,
            `Target subsidies to those who need them instead of everyone — about <b>${money(S.gdp * .004)}</b>.`,
            `Borrow only for projects that pay back, and publish a quarterly budget report.`],
          target: `Cut the deficit to <b>${pct(Math.max(0, d - 1.5))}</b> of GDP by ${when(2)}.`, goal: Math.max(0, d - 1.5) };
      } },
    { id: 'debt', icon: '📉', topic: 'public debt', min: 'finance', g: ['business', 'youth'], good: 'down',
      metric: () => debtPct(), show: v => `public debt of ${pct(v, 0)} of GDP`, sev: v => (v - 60) / 60,
      plan() {
        const B = b(), d = debtPct();
        return {
          facts: `Total public debt is <b>${money(S.debt)}</b>, about <b>${pct(d, 0)}</b> of GDP. We pay <b>${Y(B.interest)}</b> a year in interest — money that cannot go to schools or hospitals.`,
          cause: 'Years of deficits, borrowing at high interest rates, and debt in foreign currency.',
          steps: [`Run a primary surplus (budget before interest) of about 1% of GDP — <b>${money(S.gdp * .01)}</b> a year.`,
            'Swap expensive short-term loans for longer, cheaper ones, including concessional loans from development banks.',
            'Use any income from selling state assets to repay the most expensive debt first.',
            'Publish a medium-term debt strategy with a ceiling that parliament can check.'],
          target: `Bring debt down to <b>${pct(Math.max(20, d - 4), 0)}</b> of GDP by ${when(4)}.`, goal: Math.max(20, d - 4) };
      } },
    { id: 'prices', icon: '🏷️', topic: 'rising prices', min: 'economy', g: ['workers', 'elderly'], good: 'down',
      metric: () => S.infl || 0, show: v => `${pct(v)} inflation`, sev: v => (v - 4) / 8,
      plan() {
        const i = S.infl || 0;
        return {
          facts: `Prices are rising by <b>${pct(i)}</b> a year. ${cb()} rate is ${S.cb !== undefined ? '<b>' + pct(S.cb, 2) + '</b>' : 'set independently'}.`,
          cause: mvc() ? 'We import almost all food and fuel, so world prices and shipping costs pass straight to shops.' : 'Higher import and energy prices, and too much government spending pushing up demand.',
          steps: [`Remove import duty on staple foods (${mvc() ? 'rice, flour, sugar' : 'bread, rice, cooking oil'}) for six months.`,
            `Give a targeted cash top-up to the poorest families instead of subsidising everyone — cost about <b>${money(S.gdp * .002)}</b>.`,
            `Cut the deficit so the government is not adding to demand.`,
            `Support ${cb()} in keeping inflation on target — it decides interest rates independently.`],
          target: `Bring inflation below <b>${pct(Math.max(3, i - 2))}</b> by ${when(2)}.`, goal: Math.max(3, i - 2) };
      } },
    { id: 'jobs', icon: '👷', topic: 'unemployment', min: 'labour', g: ['youth', 'workers'], good: 'down',
      metric: () => unemployment(), show: v => `${pct(v)} unemployment`, sev: v => (v - 5) / 8,
      plan() {
        const u = unemployment(), n = labour() * u / 100;
        return {
          facts: `Unemployment is <b>${pct(u)}</b> — about <b>${people(n)}</b> people who want work.`,
          cause: mvc() ? 'Many jobs are in resorts far from home and go to foreign workers; outside Malé there are few private jobs.' : 'Slow growth, skills that do not match what employers need, and few new factories.',
          steps: [`Train <b>${people(n * .1)}</b> young people a year in skills employers ask for${mvc() ? ' (hospitality, marine engineering, nursing)' : ''}.`,
            `Wage subsidy: pay 30% of the salary for the first year for companies hiring first-time workers — about <b>${money(S.gdp * .003)}</b>.`,
            mvc() ? 'Enforce local hiring rules in resorts and build staff housing so islanders can take those jobs.' : 'Speed up permits for new factories and small businesses (one-stop shop, 30 days).',
            'Start labour-intensive public works: roads, harbours, school repairs.'],
          target: `Cut unemployment to <b>${pct(Math.max(3, u - 1.5))}</b> by ${when(2)}.`, goal: Math.max(3, u - 1.5) };
      } },
    { id: 'dollars', icon: '💵', topic: 'the dollar shortage', min: 'finance', g: ['business', 'workers'], good: 'up', only: () => typeof Money !== 'undefined' && Money.peg(),
      metric: () => Money.cover(), show: v => `${fmt(v, 1)} months of import cover`, sev: v => (3.5 - v) / 2.5,
      plan() {
        const c = Money.cover();
        return {
          facts: `Official reserves are <b>$${fmt(S.fin.res || 0)}M</b>, enough for <b>${fmt(c, 1)} months</b> of imports. The usual safe minimum is 3 months.`,
          cause: mvc() ? 'Tourism earns dollars, but much of it stays abroad, while we pay dollars for fuel, food and foreign debt.' : 'Imports and foreign debt payments are larger than the dollars we earn.',
          steps: [mvc() ? 'Require tourism businesses to sell a share of their dollar earnings to local banks.' : 'Encourage exporters to bring their earnings home.',
            `Activate the currency swap line with a partner central bank (see the Money tab).`,
            mvc() ? 'Cut diesel imports with island solar — every litre not imported saves dollars.' : 'Reduce fuel imports with renewable power.',
            'Delay non-urgent imports by state companies and refinance dollar debt falling due this year.'],
          target: `Raise reserves to at least <b>3 months</b> of imports by ${when(2)}.`, goal: 3 };
      } },
    { id: 'scandal', icon: '🕵️', topic: 'corruption allegations', min: 'interior', g: null, good: 'down',
      metric: () => S.scandalRisk || 0, show: v => `scandal risk ${fmt(v, 1)}`, sev: v => v / 2,
      plan() {
        return {
          facts: `There are open questions about contracts and decisions made by this government (risk level ${fmt(S.scandalRisk || 0, 1)}).`,
          cause: 'Decisions taken without open tenders and without enough checks.',
          steps: ['Ask the Auditor General for a special audit of every contract above the tender limit, reporting within 90 days.',
            `Refer any evidence to ${mvc() ? 'the Anti-Corruption Commission and the police' : 'anti-corruption investigators and the police'} — no one is protected.`,
            'Suspend the officials involved during the investigation.',
            'Publish all government contracts online, with prices and winners.'],
          target: `Publish the audit results by ${when(1)}.`, goal: 0 };
      } },
    { id: 'health', icon: '🏥', topic: 'health services', min: 'health', g: ['elderly', 'farmers'], good: 'up',
      metric: () => S.stats.health, show: v => `a health score of ${fmt(v)}/100`, sev: v => (60 - v) / 25,
      plan() {
        return {
          facts: `Our health score is <b>${fmt(S.stats.health)}/100</b>. We spend <b>${Y(spendLine('health'))}</b> a year on health.`,
          cause: mvc() ? 'Specialist doctors are concentrated in Malé, so islanders must travel for treatment.' : 'Too few doctors and nurses, long waiting lists and little prevention.',
          steps: [`Raise the health budget by one point — <b>${Y(S.gdp * .005)}</b> more a year.`,
            mvc() ? 'Specialist clinics in each atoll hospital and an air-ambulance service for emergencies.' : 'Hire more family doctors and nurses in poor and rural areas.',
            'Prevention first: vaccination, screening and dengue/mosquito control campaigns.',
            'Publish waiting times for every hospital every month.'],
          target: `Raise the health score to <b>${fmt(Math.min(100, S.stats.health + 5))}</b> by ${when(2)}.`, goal: Math.min(100, S.stats.health + 5) };
      } },
    { id: 'schools', icon: '📚', topic: 'schools and education', min: 'education', g: ['youth', 'workers'], good: 'up',
      metric: () => S.stats.education, show: v => `an education score of ${fmt(v)}/100`, sev: v => (60 - v) / 25,
      plan() {
        return {
          facts: `Our education score is <b>${fmt(S.stats.education)}/100</b>. Education receives <b>${Y(spendLine('education'))}</b> a year.`,
          cause: 'Overcrowded classes, too few trained teachers, and weak links between schools and jobs.',
          steps: [`Add one point to the education budget — <b>${Y(S.gdp * .005)}</b> a year — for teachers and books.`,
            'Recruit and train new teachers, with a bonus for working on remote islands or in rural areas.',
            'Expand technical and vocational courses linked to local employers.',
            'Test reading and maths every year and publish the results by school.'],
          target: `Raise the education score to <b>${fmt(Math.min(100, S.stats.education + 5))}</b> by ${when(2)}.`, goal: Math.min(100, S.stats.education + 5) };
      } },
    { id: 'housing', icon: '🏘️', topic: 'housing', min: 'housing', g: ['youth', 'workers'], good: 'up',
      metric: () => S.stats.housing, show: v => `a housing score of ${fmt(v)}/100`, sev: v => (60 - v) / 25,
      plan() {
        return {
          facts: `Our housing score is <b>${fmt(S.stats.housing)}/100</b>.${mvc() ? ' Thousands of families in Malé live in overcrowded rented rooms.' : ''}`,
          cause: mvc() ? 'Too little land in Malé, high rents and slow handover of social flats.' : 'Not enough homes built, high land prices and slow permits.',
          steps: [mvc() ? 'Finish and hand over the social flats under construction in Hulhumalé, by lottery with published lists.' : 'Build social housing estates in the fastest-growing regions.',
            mvc() ? 'Release reclaimed land plots to young families on islands with space.' : 'Release public land for affordable homes.',
            `Rent support for low-income families — about <b>${money(S.gdp * .002)}</b> a year.`,
            'Cut permit time for new homes to 60 days.'],
          target: `Raise the housing score to <b>${fmt(Math.min(100, S.stats.housing + 5))}</b> by ${when(2)}.`, goal: Math.min(100, S.stats.housing + 5) };
      } },
    { id: 'crime', icon: '🚓', topic: 'crime and safety', min: 'interior', g: ['elderly', 'business'], good: 'up',
      metric: () => S.stats.security, show: v => `a security score of ${fmt(v)}/100`, sev: v => (55 - v) / 25,
      plan() {
        return {
          facts: `Our security score is <b>${fmt(S.stats.security)}/100</b>. We spend <b>${Y(spendLine('security'))}</b> a year on police and justice.`,
          cause: mvc() ? 'Drug trafficking, gangs and young people without jobs or activities.' : 'Too few police on the streets, slow courts and youth unemployment.',
          steps: ['Community police officers in every neighbourhood or island.',
            mvc() ? 'Drug treatment and rehabilitation places for young addicts, and tougher action on traffickers.' : 'Faster courts: more judges and clear time limits for cases.',
            'Street lighting and CCTV in crime hotspots.',
            'Sports and job programmes for young people at risk.'],
          target: `Raise the security score to <b>${fmt(Math.min(100, S.stats.security + 5))}</b> by ${when(2)}.`, goal: Math.min(100, S.stats.security + 5) };
      } },
    { id: 'power', icon: '⚡', topic: 'electricity supply', min: 'energy', g: ['business', 'workers'], good: 'up',
      metric: () => energy().supply - energy().demand, show: v => v >= 0 ? `${fmt(v)} units of spare power` : `a power shortfall of ${fmt(-v)} units`, sev: v => -v / 10,
      plan() {
        const e = energy(), gap = e.demand - e.supply;
        return {
          facts: `Demand is <b>${fmt(e.demand)}</b> and supply <b>${fmt(e.supply)}</b> (game power units) — ${gap > 0 ? `a shortfall of <b>${fmt(gap)}</b>` : `<b>${fmt(-gap)}</b> spare`}.`,
          cause: mvc() ? 'Each island runs its own diesel generators, and fuel deliveries are expensive.' : 'Demand grows with the economy faster than new power plants are built.',
          steps: [`Build ${Math.max(1, Math.ceil(Math.max(0, gap) / 15))} solar farm${gap > 15 ? 's' : ''} (each adds about 15 units).`,
            mvc() ? 'Add batteries so solar can replace diesel at night.' : 'Upgrade the grid to cut losses.',
            'Efficiency programme: LED lighting and efficient air-conditioning in public buildings.',
            'Fix the tariff so the power company can maintain its plants, with help for poor households.'],
          target: `No power shortfall by ${when(2)}.`, goal: 0 };
      } },
    { id: 'environment', icon: '🌍', topic: 'the environment', min: 'energy', g: ['youth'], good: 'up',
      metric: () => S.stats.environment, show: v => `an environment score of ${fmt(v)}/100`, sev: v => (55 - v) / 25,
      plan() {
        return {
          facts: `Our environment score is <b>${fmt(S.stats.environment)}/100</b>.`,
          cause: mvc() ? 'Coastal erosion, reef damage from dredging, and open burning of waste.' : 'Pollution from old power plants, traffic and waste.',
          steps: [mvc() ? 'Protect house reefs and mangroves: no dredging near living reefs without a full EIA.' : 'Stricter limits on factory and power-plant emissions.',
            'Proper waste collection and recycling, ending open burning.',
            'Shift power from diesel and coal to solar and wind.',
            'Publish every environmental impact assessment online.'],
          target: `Raise the environment score to <b>${fmt(Math.min(100, S.stats.environment + 5))}</b> by ${when(2)}.`, goal: Math.min(100, S.stats.environment + 5) };
      } },
    // routine questions, asked when a minister is on stage and things are not in crisis
    { id: 'growth', icon: '📈', topic: 'economic growth', min: 'economy', g: ['business', 'workers'], good: 'up', routine: true,
      metric: () => S.lastGrowth || 0, show: v => `growth of ${fmt(v, 1)}% last half-year`, sev: v => (1 - v) / 4,
      plan() {
        return {
          facts: `GDP is about <b>${bigMoney(gdpReal())}</b> and grew <b>${fmt(S.lastGrowth || 0, 1)}%</b> last half-year.`,
          cause: mvc() ? 'Growth depends heavily on tourist arrivals and construction.' : 'Investment, exports and confidence drive growth.',
          steps: [mvc() ? 'Diversify: fisheries processing, agriculture on larger islands, digital services.' : 'Cut red tape for investors with a one-stop shop.',
            'Invest in ports, roads and power that businesses need.',
            'Keep the budget and prices stable so companies can plan.'],
          target: `Growth of at least <b>1.5%</b> per half-year by ${when(2)}.`, goal: 1.5 };
      } },
    { id: 'tourism', icon: '🏖️', topic: 'tourism', min: 'tourism', g: ['business', 'workers'], good: 'up', routine: true, only: () => mvc(),
      metric: () => (S.resorts || []).filter(r => r.phase === 'open').length, show: v => `${v} new resorts opened`, sev: () => .1,
      plan() {
        const o = (S.resorts || []).filter(r => r.phase === 'open').length, rooms = (S.resorts || []).filter(r => r.phase === 'open').reduce((t, r) => t + RESORT_SIZES[r.size].rooms, 0);
        return {
          facts: `Tourism brings most of our foreign currency. This government has opened <b>${o}</b> new resort${o === 1 ? '' : 's'} with <b>${rooms}</b> villas.`,
          cause: 'Competition from other destinations and the need to share tourism benefits with islanders.',
          steps: ['Lease new islands only through open international bidding.', 'More guesthouse tourism on inhabited islands so income reaches local families.', 'Train Maldivians for management jobs in resorts.'],
          target: `Open at least one more resort island through open bidding by ${when(3)}.`, goal: o + 1 };
      } },
    { id: 'foreign', icon: '🌐', topic: 'foreign relations', min: 'foreign', g: ['business'], good: 'up', routine: true,
      metric: () => S.rep || 50, show: v => `an international reputation of ${fmt(v)}/100`, sev: v => (45 - v) / 30,
      plan() {
        return {
          facts: `Our international reputation is <b>${fmt(S.rep || 50)}/100</b>.`,
          cause: mvc() ? 'Small states depend on good relations with all major partners and on climate diplomacy.' : 'Trade, security and investment all depend on trust abroad.',
          steps: ['Balanced relations with all major partners — no single lender or ally.', mvc() ? 'Lead small island states on climate finance at the UN.' : 'New trade agreements for our exporters.', 'Protect our citizens working and studying abroad.'],
          target: `Raise our reputation to <b>${fmt(Math.min(100, (S.rep || 50) + 5))}</b> by ${when(2)}.`, goal: Math.min(100, (S.rep || 50) + 5) };
      } },
    { id: 'defence', icon: '🛡️', topic: 'national defence', min: 'defense', g: ['elderly'], good: 'down', routine: true,
      metric: () => S.threat || 0, show: v => `a threat level of ${fmt(v)}/100`, sev: v => (v - 50) / 30,
      plan() {
        return {
          facts: `The threat level is <b>${fmt(S.threat || 0)}/100</b>; overall risk is ${warRisk()[0].toLowerCase()}.`,
          cause: mvc() ? 'Our challenges are at sea: illegal fishing, smuggling and disasters across a huge ocean area.' : 'Tension in the region and old equipment.',
          steps: [mvc() ? 'More coast guard patrol vessels and maritime surveillance.' : 'Modernise equipment where the gaps are biggest.', 'Disaster response teams on every atoll/region.', 'Diplomacy to lower tension before it becomes conflict.'],
          target: `Keep the threat level below <b>50</b> through ${when(2)}.`, goal: 50 };
      } },
    { id: 'roads', icon: '🛣️', topic: 'infrastructure', min: 'infra', g: ['workers', 'farmers'], good: 'up', routine: true,
      metric: () => totalBuildings(), show: v => `${v} public projects built`, sev: () => .05,
      plan() {
        return {
          facts: `We have <b>${totalBuildings()}</b> public buildings and projects in service.`,
          cause: mvc() ? 'Building on 180+ inhabited islands means every harbour, school and clinic must be shipped in.' : 'Ageing roads and bridges need repair before new building.',
          steps: ['Fix what we have first: a maintenance budget for harbours, roads and schools.', 'Open tenders for every project, with progress published online.', 'Independent engineers to inspect large projects.'],
          target: `Complete the projects now under construction on time by ${when(2)}.`, goal: totalBuildings() + 1 };
      } },
  ];
  function megaConcerns() {
    return (S.mega ? S.mega.list.filter(p => p.phase === 'build') : []).map(p => {
      const m = MEGA.find(x => x.id === p.id), plan = () => Math.min(1, (S.turn - p.start) / p.turns);
      return { id: 'mega_' + p.uid, icon: m.icon, topic: m.name, min: 'infra', g: ['business', 'workers'], good: 'up',
        metric: () => p.prog - plan(), show: v => `${fmt(p.prog * 100)}% complete vs ${fmt(plan() * 100)}% planned`, sev: v => Math.max(-v * 3, p.spent > p.budget * Math.max(.05, p.prog) * 1.1 ? .4 : 0, p.alerts.length ? .35 : 0),
        plan() {
          const spi = plan() ? p.prog / plan() : 1, cpi = p.spent ? p.prog * p.budget / p.spent : 1;
          return {
            facts: `The ${m.name} is <b>${fmt(p.prog * 100)}%</b> complete against <b>${fmt(plan() * 100)}%</b> planned. We have spent <b>${money(p.spent)}</b> of a <b>${money(p.budget)}</b> budget; the forecast final cost is <b>${money(p.budget / Math.max(.3, cpi))}</b>.`,
            cause: p.alerts.length ? `Open problems on site: ${p.alerts.map(a => a.title.toLowerCase()).join(', ')}.` : 'Delays in equipment, weather and contractor claims.',
            steps: [p.mit.eng ? 'The independent supervision engineer now checks every invoice and test.' : `Hire an independent supervision engineer (about ${money(p.budget * .02)}).`,
              'Monthly site inspections, with the results published.',
              'Negotiate contractor claims line by line — no payment without measured work.',
              `Recovery plan: extra shifts on the critical path to save ${Math.max(1, Math.round((1 - spi) * p.turns))} half-year${(1 - spi) * p.turns > 1.5 ? 's' : ''}.`],
            target: `Open the project by ${turnLabel(Math.ceil(S.turn + (1 - p.prog) * p.turns / Math.max(.5, spi)))}.`, goal: 0 };
        } };
    });
  }
  function islandConcern() {
    const n = (S.resorts || []).filter(r => r.method === 'direct').length;
    if (!n) return [];
    return [{ id: 'islands', icon: '🏝️', topic: 'islands leased without bidding', min: 'tourism', g: ['farmers', 'youth'], good: 'down',
      metric: () => (S.resorts || []).filter(r => r.method === 'direct' && r.phase !== 'revoked').length, show: v => `${v} island${v === 1 ? '' : 's'} awarded without bidding`, sev: () => .55,
      plan() {
        return { facts: `<b>${n}</b> resort island${n > 1 ? 's were' : ' was'} awarded directly, without open bidding.`, cause: 'Speed was put ahead of transparency.',
          steps: ['Publish every island lease agreement and the owners of the companies.', 'Review each direct award; leases with no construction will be revoked.', 'From now on, every island goes through open international bidding.'],
          target: `Publish all agreements by ${when(1)}.`, goal: 0 };
      } }];
  }
  // ---------- history of figures, for "up from…" and follow-up questions ----------
  function record() {
    S.mhist = S.mhist || [];
    const v = {}; all().forEach(c => { try { v[c.id] = c.metric(); } catch (e) { } });
    S.mhist.push({ t: S.turn, term: S.term, v }); S.mhist = S.mhist.slice(-24);
  }
  const prevVal = id => { const h = (S.mhist || []).slice().reverse().find(x => x.t < S.turn && x.v[id] !== undefined); return h ? h.v[id] : undefined; };
  const startVal = id => { const h = (S.mhist || []).find(x => x.term === S.term && x.v[id] !== undefined); return h ? h.v[id] : undefined; };
  function trend(c) {
    const now = c.metric(), p = prevVal(c.id); if (p === undefined || Math.abs(now - p) < .05) return '';
    const better = c.good === 'down' ? now < p : now > p;
    return ` (${better ? 'better' : 'worse'} than ${c.show(p)} six months ago)`;
  }
  function all() {
    return [...DEF.filter(c => !c.only || c.only()), ...megaConcerns(), ...islandConcern()];
  }
  function list(includeRoutine = false) {
    const out = [];
    for (const c of all()) {
      let s = 0; try { s = c.sev(c.metric()); } catch (e) { continue; }
      if (s > 0 || includeRoutine) out.push({ ...c, g: c.g || GK, sev: Math.min(1, Math.max(s, includeRoutine ? .02 : 0)) });
    }
    return out.filter(c => c.sev > 0).sort((a, b) => b.sev - a.sev);
  }
  // ---------- questions: rotate phrasing, follow up on earlier promises ----------
  function question(c, kind, addressee) {
    const log = (S.qaLog = S.qaLog || {}), L = log[c.id] = log[c.id] || { n: 0, last: -9 };
    const now = c.metric(), N = c.show(now), T = trend(c), to = addressee ? `${addressee}, ` : '';
    const promised = (S.pressPromises || []).find(p => p.id === c.id && p.done === false);
    const prev = L.lastVal !== undefined && L.last < S.turn ? c.show(L.lastVal) : null;
    let vs;
    if (kind === 'mp') vs = [
      `Can the ${to ? addressee : 'Minister'} tell the House why we now have ${N}${T}, and what exactly the government will do about it?`,
      `When the government took office, the figure was ${startVal(c.id) !== undefined ? c.show(startVal(c.id)) : 'different'}. Today it is ${N}. Will the Minister accept responsibility?`,
      `Will the Minister give this House a date by which ${c.topic} will improve, and the figure the government is aiming for?`,
      `What has the Minister's ministry actually spent on ${c.topic} this year, and what has the public got for it?`];
    else vs = c.sev < .1 ? [
      `${to}on ${c.topic}: we have ${N}${T}. What is the next step, and what could still go wrong?`,
      `${to}people say ${c.topic} is not a crisis but not good enough either. What will be different in six months?`] : [
      `${to}we now have ${N}${T}. What exactly will you do about ${c.topic} — and by when?`,
      `${to}families tell us ${c.topic} is their biggest worry. Can you give us one concrete measure and its cost?`,
      `${to}why should people believe your plan on ${c.topic}, when the figures show ${N}?`,
      `${to}what is the government's target for ${c.topic}, and how will we know if you miss it?`];
    const s0 = startVal(c.id);
    if (kind === 'mp' && (s0 === undefined || Math.abs(s0 - now) < .05)) vs.splice(1, 1);   // no "when you took office" if nothing changed
    let q = vs[L.n % vs.length];
    if (kind !== 'mp' && prev && L.n > 0) q = `${to}last time you were asked about ${c.topic}, it was ${prev}. Now it is ${N}. ${promised ? 'You promised quick action — where is it?' : 'What has changed?'}`;
    L.n++; L.last = S.turn; L.lastVal = now;
    return q;
  }
  // score for choosing questions: severity, minus a penalty if asked recently
  const score = c => { const L = (S.qaLog || {})[c.id]; return c.sev - (L && L.last >= S.turn - 1 ? .6 : L && L.last >= S.turn - 3 ? .25 : 0) + Math.random() * .08; };
  // ---------- answers ----------
  function answer(c, style) {
    const P = c.plan(), steps = P.steps, N = c.show(c.metric()), s0 = startVal(c.id);
    const ol = n => `<ol class="qa-steps">${steps.slice(0, n).map(x => `<li>${x}</li>`).join('')}</ol>`;
    if (style === 'full') return `${P.facts}<br><i>Why:</i> ${P.cause}<br><b>What we are doing:</b>${ol(4)}🎯 <b>Target:</b> ${P.target}`;
    if (style === 'partial') return `${P.facts} We are working on it. For example: ${steps[0].replace(/^./, x => x.toLowerCase())}`;
    if (style === 'bad') { const wrong = c.show(c.metric() * (Math.random() < .5 ? .6 : 1.5)); return `Er… I believe it is ${wrong}… sorry, ${N}… the situation is broadly under control and we are looking at several options…`; }
    if (style === 'defend') {
      const was = s0 !== undefined && Math.abs(s0 - c.metric()) > .05 ? `When we took office it was ${c.show(s0)}; today it is ${N}.` : `The figure is ${N}.`;
      return `${was} ${S.oil > 95 ? `World oil prices are at $${fmt(S.oil)} a barrel, which hits every importing country.` : 'Much of this was inherited from the previous government.'} Even so, we have started: ${steps[0].replace(/^./, x => x.toLowerCase())}`;
    }
    if (style === 'promise') return `${P.facts}<br>I make a clear promise: 🎯 ${P.target} First measure, starting this month: ${steps[0].replace(/^./, x => x.toLowerCase())}`;
    if (style === 'attack') return `Before the Honourable Member lectures us: when his party ran this country, ${c.topic} was handled no better. ${P.facts.replace(/<[^>]+>/g, '')}`;
    if (style === 'report') return `I will place a full report before the committee by ${turnLabel(S.turn + 1)}. It will set out: ${steps.slice(0, 3).map((x, i) => `(${i + 1}) ${x.replace(/<[^>]+>/g, '').replace(/\.$/, '')}`).join('; ')}. ${P.target.replace(/<[^>]+>/g, '')}`;
    return P.facts;
  }
  return { list, all, question, answer, record, score, minName };
})();

/* shared Q&A stage: a row of officials at the top, questioners below */
const QA = (() => {
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
    const b = $('#qa-bub'); if (b) { b.innerHTML = `<b>${esc(who)}:</b> ${text}`; b.scrollTop = 0; }
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
  const short = t => t.replace(/^Minister (of|for) /, '').replace(/^State Minister for /, '');
  function checkPromises() {
    const msgs = [];
    (S.pressPromises || []).filter(p => !p.done && S.turn > p.turn).forEach(p => {
      p.done = true;
      const c = Concerns.all().find(x => x.id === p.id); let now = p.base; try { if (c) now = c.metric(); } catch (e) { }
      const better = !c || (p.good === 'down' ? now < p.base - .01 : now > p.base + .01);
      if (better) { fx(p.g, 2); msgs.push(`✅ Promise kept: you said you would act on ${p.topic} — and the figures improved.`); }
      else { fx(p.g, -4); news(`Broken promise: no progress on ${p.topic} despite pledge`); msgs.push(`❌ Promise broken: you promised action on ${p.topic}, but the figures did not improve. Trust falls.`); }
    });
    return msgs;
  }
  // pick questions: at least one for each minister on stage, then the most pressing remaining ones
  function pickQuestions(ministerIds, n = 4) {
    const cs = Concerns.list(true), used = new Set(), out = [];
    for (const id of ministerIds) {
      const c = cs.filter(x => x.min === id && !used.has(x.id)).sort((a, b) => Concerns.score(b) - Concerns.score(a))[0];
      if (c) { used.add(c.id); out.push({ c, to: id }); }
    }
    cs.filter(x => !used.has(x.id) && x.sev > .05).sort((a, b) => Concerns.score(b) - Concerns.score(a)).forEach(c => { if (out.length < n) { used.add(c.id); out.push({ c, to: ministerIds.includes(c.min) ? c.min : null }); } });
    return out.slice(0, n).sort((a, b) => Concerns.score(b.c) - Concerns.score(a.c));
  }
  async function run() {
    if (S.presser === S.turn) return toast('You already held a press conference this half-year.', 'bad');
    const cs = Concerns.list(), top = cs.slice(0, 4);
    const all = S.cabinet.map(m => m.id);
    let chosen = [...new Set(top.map(c => c.min))].filter(id => Cabinet.get(id)).slice(0, 3);
    await new Promise(res => {
      const m = modal(`<div class="m-icon">🎙️</div><h2>Press conference</h2><p class="m-body">The biggest concerns right now: <b>${top.map(c => c.icon + ' ' + c.topic).join(', ') || 'no crisis — expect routine questions'}</b>. Choose up to 3 ministers to stand with you. <b>Journalists will direct questions at the ministers you bring</b>, so bring the ones who can explain their area.</p>
        <div class="pc-mins">${all.map(id => { const g = Cabinet.get(id); return `<button class="pc-min ${chosen.includes(id) ? 'on' : ''}" data-id="${id}">${avatarSVG(g.look, 0, 40)}<span><b>${g.icon} ${esc(g.name)}</b><small>${esc(g.title)} · skill ${g.skill || 70}${top.some(c => c.min === id) ? ' · ⚠️ hot topic' : ''}</small></span></button>`; }).join('')}</div>
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
    QA.open({ cls: 'presser', title: `🎙️ Press conference · ${ROLE.title}'s Office`, top: [{ name: S.player.name, role: ROLE.title, look: S.player.look }, ...mins.map(g => ({ name: g.name, role: short(g.title), look: g.look }))], bot: J.map(j => ({ name: j.name, role: j.beat, look: j.look })) });
    const before = Impact.snap();
    QA.say('t0', S.player.name, `Good afternoon. ${mins.length ? `With me are ${mins.map(g => `${g.name}, ${g.title}`).join('; ')}.` : ''} I will take your questions.`);
    await QA.next('Take the first question ▶');
    const qs = pickQuestions(chosen);
    const heads = [];
    for (const [i, { c, to }] of qs.entries()) {
      const jk = i % J.length, tm = to ? minOf(to) : null;
      QA.say('b' + jk, J[jk].name, Concerns.question(c, 'press', tm ? tm.title : ROLE.title));
      const ch = [
        { t: 'Answer yourself: the facts, the steps and a target', n: 'trust ↑ · gives the real numbers and the plan' },
        { t: 'Defend the government: compare with the past and blame outside factors', n: 'can backfire if people are suffering' },
        { t: 'Make a firm promise with a date', n: 'popular now · checked next half-year' },
        ...mins.map(g => ({ t: `Ask ${g.name} (${short(g.title)}) to answer`, n: `skill ${g.skill || 70}${g.id === c.min ? ' · their area' + (to === g.id ? ' · the question was addressed to them' : '') : ' · not their area'}` })),
      ];
      const k = await QA.choose(`${c.icon} Question on <b>${c.topic}</b>${tm ? ` — addressed to the <b>${esc(tm.title)}</b>` : ''}`, ch);
      let v, said, who = 't0', name = S.player.name;
      if (k === 0) { v = 1.6 - c.sev * 1.2; said = Concerns.answer(c, 'full'); GK.forEach(g => S.ga[g] = clamp(S.ga[g] + .3)); }
      else if (k === 1) { v = -.5 - c.sev * 2; said = Concerns.answer(c, 'defend'); }
      else if (k === 2) { v = 3; said = Concerns.answer(c, 'promise'); (S.pressPromises = S.pressPromises || []).push({ id: c.id, topic: c.topic, g: c.g, base: c.metric(), good: c.good, turn: S.turn, done: false }); }
      else {
        const g = mins[k - 3], own = g.id === c.min, s = (g.skill || 70) / 100 + (own ? .1 : -.2);
        who = 't' + (k - 2); name = g.name;
        if (s >= .78) { v = 2.2 - c.sev; said = Concerns.answer(c, 'full'); const real = S.cabinet.find(x => x.id === g.id); if (real) real.skill = Math.min(99, (real.skill || 70) + 2); }
        else if (s < .6 && Math.random() < .5) { v = -3; said = Concerns.answer(c, 'bad'); heads.push(`Minister's blunder at press conference: ${g.name} gets the figures wrong on ${c.topic}`); }
        else { v = .5; said = Concerns.answer(c, 'partial'); }
        if (to && to !== g.id) v -= .5;   // dodging: a different minister answered
      }
      QA.say(who, name, said);
      c.g.forEach(gr => S.ga[gr] = clamp(S.ga[gr] + v));
      await QA.next(i < qs.length - 1 ? 'Next question ▶' : 'End the press conference ▶');
    }
    Advisers.me().stress = clamp(Advisers.me().stress + 3);
    news(heads[0] || `${ROLE.title} and ministers answer journalists on ${qs.slice(0, 2).map(q => q.c.topic).join(' and ')}`);
    closeModal(); save(); render();
    Impact.show('Press conference', before, { lesson: 'Good answers give the real figures, the causes, concrete steps with costs, and a target with a date — so the public can check later.' });
  }
  return { run, checkPromises, short };
})();

const QTime = (() => {
  const minOf = id => Cabinet.get(id) || Cabinet.get('finance');
  const mv = () => COUNTRY.id === 'mv';
  function replace(id) {
    const m = S.cabinet.find(x => x.id === id); if (!m) return;
    const g = Math.random() < .45 ? 'f' : 'm', look = randomLook(); if (g === 'f') look.style = pick(['long', 'curly', 'side']);
    Object.assign(m, { name: personName(g), gender: g, look, skill: Math.round(rnd(60, 85)), qt: 0, motion: false });
  }
  async function run() {
    if (S.qtime === S.turn) return toast('Question time has already been held this half-year.', 'bad');
    S.qtime = S.turn;
    const opp = PARTIES.filter(p => S.parl.seats[p.id] && !S.parl.coalition.includes(p.id));
    const mps = (opp.length ? opp : PARTIES.filter(p => p.id !== S.player.party)).slice(0, 3).map(p => { const g = Math.random() < .5 ? 'f' : 'm', look = randomLook(); if (g === 'f') look.style = pick(['long', 'curly', 'side']); return { name: personName(g), role: `MP · ${p.name}`, look, party: p.id }; });
    // pressing concerns first, rotating away from ones asked recently, one per ministry
    const seen = new Set(), cs = [];
    Concerns.list(true).sort((a, b) => Concerns.score(b) - Concerns.score(a)).forEach(c => { if (cs.length < 3 && !seen.has(c.min) && Cabinet.get(c.min)) { seen.add(c.min); cs.push(c); } });
    const mins = cs.map(c => minOf(c.min));
    const speaker = { name: S.speakerName || (S.speakerName = personName(Math.random() < .5 ? 'f' : 'm')), role: mv() ? 'Speaker of the People\'s Majlis' : `Speaker, ${COUNTRY.parl || 'Parliament'}`, look: S.speakerLook || (S.speakerLook = randomLook()) };
    QA.open({ cls: 'qtime', title: `🏛️ Question time · ${COUNTRY.parl || 'Parliament'}`, top: [speaker, ...mins.map(g => ({ name: g.name, role: Presser.short(g.title), look: g.look }))], bot: mps });
    const before = Impact.snap();
    QA.say('t0', speaker.name, `Order, order! Questions to ministers. Today the House will hear from ${mins.map(g => 'the ' + g.title).join(', ')}.`);
    await QA.next();
    for (const [i, c] of cs.entries()) {
      const mp = mps[i % mps.length], g = mins[i], mk = 't' + (1 + i);
      QA.say('b' + (i % mps.length), mp.name, Concerns.question(c, 'mp', g.title));
      const k = await QA.choose(`${c.icon} The <b>${esc(g.title)}</b> (${esc(g.name)}, skill ${g.skill || 70}) must answer. How should ${g.gender === 'f' ? 'she' : 'he'} reply?`, [
        { t: 'Give the figures, the causes, the steps and a target', n: 'best if the minister knows the brief (skill)' },
        { t: 'Attack the opposition\'s own record', n: 'pleases our side · angers the opposition · dodges the question' },
        { t: 'Promise a full report to the committee with the plan', n: 'buys time · must show progress' },
      ]);
      const real = S.cabinet.find(x => x.id === g.id) || {}; real.qt = real.qt || 0;
      let said, v;
      if (k === 0) {
        const ok = Math.random() < (g.skill || 70) / 100 + .1;
        said = ok ? Concerns.answer(c, 'full') : Concerns.answer(c, 'bad');
        v = ok ? 2 - c.sev : -2; real.qt += ok ? 1 : -1;
        if (ok) S.parl.rel[mp.party] = clamp((S.parl.rel[mp.party] || 40) + 2);
      } else if (k === 1) {
        said = Concerns.answer(c, 'attack');
        v = -.8; real.qt -= .5; S.parl.rel[mp.party] = clamp((S.parl.rel[mp.party] || 40) - 5);
        S.parl.coalition.forEach(p => S.parl.rel[p] = clamp((S.parl.rel[p] || 60) + 1));
      } else {
        said = Concerns.answer(c, 'report');
        v = .5; (S.pressPromises = S.pressPromises || []).push({ id: c.id, topic: c.topic, g: c.g, base: c.metric(), good: c.good, turn: S.turn, done: false });
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
        if (d === 0 && (have >= need ? Math.random() < .85 : Math.random() < .25)) { real.qt = 0; QA.say('t0', speaker.name, `The Ayes have it… the Noes have it! The motion is defeated. The ${g.title} stays.`); news(`${g.name} survives no-confidence vote`); }
        else { const old = g.name; replace(g.id); QA.say('t0', speaker.name, d === 0 ? 'The motion is carried. The minister must go.' : `The House notes the resignation of ${old}.`); news(`${old} ${d === 0 ? 'loses no-confidence vote' : 'resigns'}; new ${g.title} appointed`); GK.forEach(x => S.ga[x] = clamp(S.ga[x] - (d === 0 ? 2 : .5))); }
        await QA.next('Continue ▶');
      }
    }
    news(`Ministers questioned in the ${COUNTRY.parl || 'parliament'} on ${cs.map(c => c.topic).join(', ')}`);
    closeModal(); save(); render();
    Impact.show('Question time', before, { lesson: 'In a democracy, ministers answer to the elected representatives. A strong answer gives figures, causes, steps with costs, and a target the House can check later.' });
  }
  return { run };
})();
