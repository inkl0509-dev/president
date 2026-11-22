/* ============================================================
   A MORE REAL CAMPAIGN
   - Election rules & nomination: the election body, how to file,
     the voting system, campaign-finance limits.
   - Running mate (where the president & vice president are
     elected together, e.g. the Maldives, the USA, Brazil).
   - Weekly opinion polls by named pollsters: sample size,
     margin of error, trend.
   - Campaign finance ledger with a legal spending limit and
     a tempting over-the-limit donation.
   - Campaign silence and election day (turnout, observers).
   - Two-round systems: if nobody passes 50% of valid votes in
     round 1, the top two go to a runoff.
   ============================================================ */

const RULES = {
  veloria: { body: 'Electoral Commission of Veloria', system: 'ec', vp: false, nom: 'File nomination papers with 1,000 supporter signatures and a deposit.', limit: 45 },
  mv: { body: 'Elections Commission of Maldives (EC)', system: 'tworound', vp: true, nom: 'Submit the nomination form to the Elections Commission with the required supporter signatures, a running mate for vice president, and a declaration of assets. Party candidates are chosen in party primaries.', limit: 45, observers: 'domestic and international election observers', system_text: 'The president is elected directly. A candidate needs more than half of the valid votes; if nobody gets it, the top two face each other in a second round.' },
  uz: { body: 'Central Election Commission of Uzbekistan', system: 'tworound', vp: false, nom: 'Be nominated by a registered political party and collect voter signatures in several regions.', limit: 45, system_text: 'A candidate needs more than half of the votes; otherwise the top two go to a second round.' },
  kz: { body: 'Central Election Commission of Kazakhstan', system: 'tworound', vp: false, nom: 'Be nominated by a party or public association, pass the state-language exam and collect supporter signatures.', limit: 45, system_text: 'More than half of the votes wins in the first round; otherwise a runoff between the top two.' },
  tr: { body: 'Supreme Election Council (YSK)', system: 'tworound', vp: false, nom: 'Be nominated by a party group in parliament, by parties with enough votes, or by 100,000 voters\' signatures.', limit: 45, system_text: 'More than half of valid votes wins; otherwise a runoff two weeks later.' },
  fr: { body: 'Constitutional Council (validates candidates)', system: 'tworound', vp: false, nom: 'Collect 500 sponsorships (“parrainages”) from elected officials in at least 30 départements.', limit: 45, system_text: 'More than half of the votes wins in round one; otherwise the top two meet two weeks later.' },
  br: { body: 'Superior Electoral Court (TSE)', system: 'tworound', vp: true, nom: 'Be chosen at a party convention and register the ticket (president + vice president) with the electoral court.', limit: 45, system_text: 'Voting is compulsory and electronic. More than half of valid votes wins; otherwise a second round.' },
  us: { body: 'Federal Election Commission & state election officials', system: 'ec', vp: true, nom: 'Win your party\'s primaries and nomination at the convention; get on the ballot in every state.', limit: 60, system_text: 'Voters choose electors state by state; a candidate needs a majority of the Electoral College.' },
  uk: { body: 'The Electoral Commission', system: 'parl', vp: false, nom: 'Party candidates stand in each constituency with a deposit and 10 nominators.', limit: 45, system_text: 'First-past-the-post in each constituency; the leader who commands a majority in the Commons becomes Prime Minister.' },
  de: { body: 'Federal Returning Officer', system: 'parl', vp: false, nom: 'Parties submit constituency candidates and state lists.', limit: 45, system_text: 'Mixed-member proportional representation; the Bundestag then elects the Chancellor.' },
  jp: { body: 'Election administration commissions', system: 'parl', vp: false, nom: 'Candidates file with a deposit in single-member districts or on party lists.', limit: 45, system_text: 'Mixed system; the Diet elects the Prime Minister.' },
  in: { body: 'Election Commission of India', system: 'parl', vp: false, nom: 'File nomination papers with a deposit in a constituency; the Model Code of Conduct applies.', limit: 45, system_text: 'First-past-the-post in 543 constituencies with electronic voting machines; the Lok Sabha majority chooses the Prime Minister.' },
};

const RealCamp = (() => {
  const R = () => RULES[COUNTRY.id] || RULES.veloria;
  const two = () => R().system === 'tworound' && !(S.online && !S.camp?.re);
  const POLLSTERS = () => COUNTRY.id === 'mv' ? ['Atoll Insight Research', 'Raajje Opinion Lab', 'Malé Survey Centre'] : ['National Opinion Research', 'Civic Pulse Polling', 'Metro Survey Institute'];

  // ---------- 1. rules & nomination, 2. running mate ----------
  async function intro() {
    const c = S.camp; if (!c || c.introDone || S.rulesSeen) return; c.introDone = true; S.rulesSeen = true;
    const r = R();
    await docModal(`<div class="rc"><div class="scene-title">🗳️ ${esc(r.body)}</div><h2>Before the campaign: the rules</h2>
      <div class="rc-grid"><div><div class="lbl">📝 Nomination</div><p>${r.nom}</p></div>
        <div><div class="lbl">⚖️ How the winner is decided</div><p>${r.system_text || 'The candidate who wins the most electoral votes across the regions wins.'}</p></div>
        <div><div class="lbl">💰 Campaign finance</div><p>Spending is limited to <b>$${r.limit}M</b> (game estimate). Donations must be declared; anonymous or foreign donations are illegal in most countries.</p></div>
        <div><div class="lbl">📊 Polls & media</div><p>Independent pollsters publish surveys every week. Every poll has a <b>margin of error</b>; a lead smaller than that is a statistical tie.</p></div></div>
      ${edu('Free and fair elections need an independent election body, equal rules for all candidates, transparent campaign money, a secret ballot and observers who watch the count.')}</div>`,
      [{ id: 'ok', label: '📝 File my nomination', primary: true }]);
    news(`${S.player.name} files nomination papers with the ${r.body}`);
    if (r.vp && !c.re) await runningMate();
    render();
  }
  async function runningMate() {
    const c = S.camp;
    const OPTS = [
      ['An economist and former central-bank official', { business: 4, elderly: 1 }, 'Reassures investors.'],
      [COUNTRY.id === 'mv' ? 'A popular island council president from the atolls' : 'A popular regional governor', { farmers: 4, workers: 1 }, 'Strong outside the capital.'],
      ['A former trade-union leader', { workers: 4, youth: 1 }, 'Brings the unions on board.'],
      ['A young technology entrepreneur', { youth: 4, business: 1 }, 'Energises young voters.'],
      ['A respected retired judge', { elderly: 3, workers: 1 }, 'A symbol of integrity.'],
    ].sort(() => Math.random() - .5).slice(0, 3).map(([d, g, why]) => { const gender = Math.random() < .5 ? 'f' : 'm'; return { name: personName(gender), d, g, why }; });
    const k = await choiceModal({ icon: '🤝', title: 'Choose your running mate (vice-presidential candidate)', mode: 'camp',
      text: `<p>${COUNTRY.id === 'mv' ? 'In the Maldives the president and vice president are elected together on one ticket.' : 'The president and vice president run together on one ticket.'} A good running mate balances your weaknesses.</p>`,
      choices: OPTS.map(o => ({ t: `${o.name} — ${o.d}`, note: `${fxChips({ p: o.g }, 'camp')} <small class="muted">${o.why}</small>` })) });
    const o = OPTS[k] || OPTS[0];
    for (const g in o.g) c.symP[g] += o.g[g];
    S.vp = { name: o.name, d: o.d };
    news(`${S.player.name} names ${o.name} as running mate`);
    toast(`${o.name} joins your ticket`, 'good');
  }

  // ---------- 3. weekly poll ----------
  function poll() {
    const c = S.camp, np = nationalPoll(), n = Math.round(rnd(600, 1500)), moe = 1.96 * Math.sqrt(.25 / n) * 100;
    const noise = () => rnd(-moe / 2, moe / 2);
    let p = Math.max(1, np.p + noise()), o = Math.max(1, np.o + noise()), u = Math.max(0, np.u + noise() / 2);
    const tot = p + o + u; p = p / tot * 100; o = o / tot * 100; u = 100 - p - o;
    const P = { week: c.week, by: pick(POLLSTERS()), n, moe: Math.round(moe * 10) / 10, p: Math.round(p * 10) / 10, o: Math.round(o * 10) / 10, u: Math.round(u * 10) / 10 };
    (c.polls = c.polls || []).push(P);
    const tie = Math.abs(P.p - P.o) <= P.moe;
    news(`Poll (${P.by}, n=${P.n}, ±${P.moe}%): ${S.player.name} ${P.p}% – ${S.opp.name} ${P.o}%${tie ? ' — within the margin of error' : ''}`);
    return P;
  }
  function pollCard() {
    const c = S.camp; if (!c || !c.polls || !c.polls.length) return '';
    const P = c.polls[c.polls.length - 1], tie = Math.abs(P.p - P.o) <= P.moe, W = 160, H = 38, n = Math.max(2, c.weeks);
    const line = k => c.polls.map(x => `${((x.week - 1) / (n - 1) * W).toFixed(1)},${(H - x[k] / 70 * H).toFixed(1)}`).join(' ');
    return `<div class="rc-poll"><div><b>📊 Latest poll</b> <small class="muted">${esc(P.by)} · week ${P.week} · ${P.n.toLocaleString('en')} people · ±${P.moe}%</small><br>
      <span style="color:${partyById(S.player.party).color}">You ${P.p}%</span> · <span style="color:${partyById(S.opp.party).color}">${esc(S.opp.name.split(' ').slice(-1)[0])} ${P.o}%</span> · <span class="muted">Undecided ${P.u}%</span>
      ${tie ? '<span class="rc-tie">statistical tie</span>' : ''}</div>
      <svg viewBox="-2 -2 ${W + 4} ${H + 4}" class="rc-spark"><polyline points="${line('p')}" fill="none" stroke="${partyById(S.player.party).color}" stroke-width="2"/><polyline points="${line('o')}" fill="none" stroke="${partyById(S.opp.party).color}" stroke-width="2"/></svg>
      <button class="btn small ghost" data-act="pollInfo" title="What is a margin of error?">?</button></div>`;
  }
  async function pollInfo() {
    await infoModal('📊', 'How to read a poll', `<p>A poll asks a <b>random sample</b> of voters (say 1,000 people) instead of everyone. Because it is a sample, the result can be a bit off.</p>
      <p>The <b>margin of error</b> (about ±3% for 1,000 people) tells you how far off it could be, 95 times out of 100. If you lead by less than the margin, the race is a <b>statistical tie</b>.</p>
      <p>Bigger samples give smaller margins: the margin shrinks with the square root of the sample size (±${fmt(98 / Math.sqrt(1000), 1)}% for 1,000; ±${fmt(98 / Math.sqrt(4000), 1)}% for 4,000).</p>
      <p>Also watch <b>undecided</b> voters and the <b>trend</b> across several polls — one poll alone can mislead.</p>`, 'Got it');
  }

  // ---------- 4. campaign finance ----------
  function spend(amount) { const c = S.camp; c.spent = (c.spent || 0) + amount; }
  function raise(amount) { const c = S.camp; c.raised = (c.raised || 0) + amount; }
  function ledger() {
    const c = S.camp; if (!c) return ''; const lim = R().limit, sp = c.spent || 0, pct = Math.min(100, sp / lim * 100);
    return `<div class="rc-led" title="Campaign finance — declared to the ${esc(R().body)}"><span>💰 Raised <b>$${Math.round(c.raised || 0)}M</b></span><span>Spent <b class="${sp > lim ? 'bad' : ''}">$${Math.round(sp)}M</b> of $${lim}M legal limit</span>
      <div class="bar"><div style="width:${pct}%;background:${pct > 90 ? '#ef4444' : pct > 70 ? '#f59e0b' : '#22c55e'}"></div></div></div>`;
  }
  async function bigDonor() {
    const c = S.camp; if (c.re || c.donorDone || c.week < 3) return false; c.donorDone = true;
    const k = await choiceModal({ icon: '💼', title: 'A tycoon offers a huge donation', mode: 'camp',
      text: `<p>A wealthy resort and construction tycoon offers <b>$15M</b> in cash — three times the legal limit for one donor. “No paperwork needed. Just remember your friends after the election.”</p>`,
      choices: [{ t: 'Take the money quietly', note: '+$15M now · risk of an investigation by the election body' }, { t: 'Accept only the legal maximum and declare it', note: '+$5M · clean' }, { t: 'Refuse and tell the press', note: 'Workers and youth ▲ · business ▼' }] });
    if (k === 0) { c.funds += 15; raise(15); c.illegal = (c.illegal || 0) + 1; }
    else if (k === 1) { c.funds += 5; raise(5); }
    else { c.symP.workers += 2; c.symP.youth += 2; c.symP.business -= 2; news(`${S.player.name} rejects illegal donation offer`); }
    return true;
  }
  function audit() {    // after the vote: the election body checks the accounts
    const c = S.camp, lim = R().limit, over = (c.spent || 0) > lim, illegal = c.illegal && Math.random() < .55;
    if (!over && !illegal) return null;
    const why = [over ? `spending $${Math.round(c.spent)}M — above the $${lim}M limit` : '', illegal ? 'an undeclared donation far above the legal cap' : ''].filter(Boolean).join(' and ');
    S.scandalRisk = (S.scandalRisk || 0) + (illegal ? 1.5 : .6);
    news(`${R().body} fines the ${partyById(S.player.party).name} campaign for ${why}`);
    return `The ${R().body} audited your campaign accounts and found ${why}. Your party is fined, and the story will follow you.`;
  }

  // ---------- 5. silence & election day ----------
  async function electionDay() {
    const c = S.camp, r = R(), turnout = Math.round(clamp(62 + (c.week ? 8 : 0) + rnd(-4, 10) + (COUNTRY.id === 'br' ? 12 : 0), 45, 92));
    S.camp.turnout = turnout;
    await docModal(`<div class="rc"><h2>🤫 Campaign silence</h2><p class="m-body">The campaign is over. In the final hours before the vote, campaigning stops so voters can decide in peace — no rallies, no ads.</p>
      <h2>🗳️ Election day${c.runoff ? ' — second round' : ''}</h2>
      <ul class="rc-day"><li>🕖 Polling stations open early in every ${COUNTRY.id === 'mv' ? 'island, resort and abroad' : 'town and village'}.</li>
        <li>🪪 Voters show ID, get a ballot, vote in secret and ${COUNTRY.id === 'in' || COUNTRY.id === 'br' ? 'press the button on an electronic voting machine' : 'drop the ballot in a sealed box'}; a finger is often marked with ink.</li>
        <li>👀 ${r.observers || 'Party agents and election observers'} watch the voting and the count.</li>
        <li>📈 Turnout: about <b>${turnout}%</b> of registered voters.</li>
        <li>🧮 After polls close, ballots are counted at each polling station in front of observers, and results are sent to the ${esc(r.body)}.</li></ul>
      ${edu('A secret ballot, counting in public and published results from every polling station make it very hard to steal an election.')}</div>`,
      [{ id: 'ok', label: '📺 Watch the results', primary: true }]);
  }

  // ---------- 6. two-round systems ----------
  function firstRound(t) {
    const share = t.pv / (t.pv + t.ov), m = S.elec.minorShare || 0;
    return { p: share * (100 - m), o: (1 - share) * (100 - m), m };
  }
  async function runoff() {
    const c = S.camp, t = electionTotals(), fr = firstRound(t);
    c.runoff = true; c.weeks += 1; c.week = c.weeks; c.ap = 3; c.funds += 8;
    S.phase = 'campaign'; UI.screen = 'campaign';
    news(`No candidate reached 50%: ${S.player.name} (${fmt(fr.p, 1)}%) and ${S.opp.name} (${fmt(fr.o, 1)}%) go to a second round`);
    save(); render();
    // the eliminated candidates may endorse someone
    for (const mn of (c.minor || [])) {
      const k = await choiceModal({ icon: '🤝', title: `${mn.name} (${partyById(mn.party).name}) was eliminated`, mode: 'camp',
        text: '<p>Their voters are now up for grabs. You can ask for an endorsement.</p>',
        choices: [{ t: `Offer ${mn.name.split(' ')[0]} a cabinet post for an endorsement`, note: 'Their supporters swing to you · one ministry promised' }, { t: 'Ask for an endorsement on policy alone', note: 'May or may not work' }, { t: 'Don\'t ask', note: '' }] });
      const pb = partyById(mn.party).bias;
      if (k === 0 || (k === 1 && Math.random() < .45)) { GK.forEach(g => c.symP[g] += Math.max(0, pb[g]) / 6 + 1); news(`${mn.name} endorses ${S.player.name} in the runoff`); toast(`${mn.name} endorses you!`, 'good'); if (k === 0) S.promisedPost = mn.name; }
      else if (k === 1) { GK.forEach(g => c.symO[g] += 1); news(`${mn.name} endorses ${S.opp.name} in the runoff`); toast(`${mn.name} backed your rival`, 'bad'); }
    }
    await infoModal('🗳️', 'Second round', `<p>You have <b>one more week</b> to win the runoff against ${esc(S.opp.name)}. Only the two of you are on the ballot now — the voters of the eliminated candidates decide it.</p>`, 'Campaign →');
    save(); render();
  }
  return { intro, poll, pollCard, pollInfo, spend, raise, ledger, bigDonor, audit, electionDay, two, firstRound, runoff, rules: R };
})();
