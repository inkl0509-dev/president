/* ============================================================
   ISLAND RESORTS (Maldives) — "one island, one resort".
   The state owns uninhabited islands and leases them to
   developers, who build and run the resort. The government
   earns a lease fee, rent and tourism taxes, and the country
   earns dollars and jobs. How islands are leased matters:
   the Maldives has had real scandals over islands handed out
   without open bidding, and many leased islands stayed empty
   for years. Money figures are game estimates.
   ============================================================ */

const RESORT_SIZES = {
  boutique: { name: 'Boutique — 40 villas', rooms: 40, turns: 3 },
  mid: { name: 'Mid-size — 100 villas', rooms: 100, turns: 4 },
  large: { name: 'Large integrated resort — 200 rooms', rooms: 200, turns: 5 },
};
const RESORT_DEVS = ['Coral Crest Hotels', 'Blue Lagoon Holdings', 'Atoll Horizon Group', 'Sunreef Hospitality', 'Indigo Isles Resorts', 'Moonsand Developments'];   // fictional

const Resorts = (() => {
  const L = () => { if (!S.resorts) S.resorts = []; return S.resorts; };
  const U = usdM => usdM / ((S.scale || 1) * 1000);          // US$ million → game units
  const $m = usdM => usdM >= 1000 ? '$' + (usdM / 1000).toFixed(1) + 'B' : '$' + fmt(usdM, usdM < 10 ? 1 : 0) + 'M';
  const atolls = () => (COUNTRY.atolls || []).filter(a => a[0] !== 'S' && a[0] !== 'Gn');   // Addu and Fuvahmulah are single-city atolls
  const atoll = code => (COUNTRY.atolls || []).find(a => a[0] === code) || ['?', 'an atoll', '', 0, 0, 'coast'];
  const name = r => `Resort island, ${atoll(r.atoll)[1]} Atoll`;
  const open = () => L().filter(r => r.phase === 'open');
  const staff = r => Math.round(RESORT_SIZES[r.size].rooms * 1.6);

  async function lease() {
    const code = ($('#rs-atoll') || {}).value, size = ($('#rs-size') || {}).value;
    if (!code || !RESORT_SIZES[size]) return;
    if (L().filter(r => ['bid', 'build'].includes(r.phase)).length >= 4) return toast('Four resorts are already being leased or built. Wait for some to open.', 'bad');
    const Z = RESORT_SIZES[size], A = atoll(code);
    const k = await choiceModal({ icon: '🏝️', title: `Lease an uninhabited island in ${A[1]} Atoll`, text: `A ${Z.name.toLowerCase()} resort. <b>The developer pays to build it</b>; the state earns an acquisition fee now, then lease rent and tourism taxes every year. How should the island be awarded?`,
      choices: [
        { t: 'Open international bidding', note: `⏳ 1 half-year · highest fee ≈ ${$m(Z.rooms * .15)} · serious developers` },
        { t: 'Joint venture with the state tourism company', note: `💰 state invests ${$m(Z.rooms * .3)} · gets 30% of profits too` },
        { t: 'Direct award to a well-connected company', note: `⚡ now · low fee ≈ ${$m(Z.rooms * .04)} · scandal risk · may never be built` }] });
    const method = ['open', 'jv', 'direct'][k];
    const e = await choiceModal({ icon: '🪸', title: 'Environmental conditions', text: 'Resort building can damage the house reef and lagoon: dredged channels, sand pumping, sewage. What rules apply?',
      choices: [{ t: 'Strict: no reef blasting, protected house reef, sewage treatment', note: '⏳ +1 half-year to build · reef stays healthy' }, { t: 'Relaxed: let the developer decide', note: '⚡ faster · reef damage, divers and young people angry' }] });
    const h = await choiceModal({ icon: '🧑‍🍳', title: 'Jobs for Maldivians', text: `The resort will employ about ${Math.round(Z.rooms * 1.6)} staff. Many resorts rely on foreign workers.`,
      choices: [{ t: 'Enforce local hiring, training and staff housing', note: 'more jobs for islanders · slightly lower profits' }, { t: 'Let the developer hire freely', note: 'cheaper for the resort · fewer local jobs' }] });
    const before = Impact.snap();
    const r = { uid: 'rs' + S.turn + '_' + Math.floor(Math.random() * 9999), atoll: code, size, method, strict: e === 0, local: h === 0, dev: pick(RESORT_DEVS), t0: S.turn, prog: 0, earned: 0, log: [] };
    if (method === 'open') { r.phase = 'bid'; news(`Island in ${A[1]} Atoll offered to resort developers in open bidding`); }
    else {
      r.phase = 'build'; r.start = S.turn;
      r.fee = method === 'jv' ? 0 : Z.rooms * .04;
      if (method === 'jv') S.debt += U(Z.rooms * .3);
      else { S.debt -= U(r.fee); r.earned += r.fee; S.scandalRisk = (S.scandalRisk || 0) + .6; S.stats.freedom = clamp(S.stats.freedom - 1); }
      news(method === 'jv' ? `State tourism company to co-develop resort in ${A[1]} Atoll` : `Island in ${A[1]} Atoll awarded without bidding to ${r.dev}`);
    }
    if (!r.strict) { S.stats.environment = clamp(S.stats.environment - 2); S.ga.youth = clamp(S.ga.youth - 2); }
    L().push(r); save(); render();
    Impact.show(`Resort island lease: ${A[1]} Atoll`, before, { lesson: method === 'direct' ? 'Islands handed out without open bidding earn the state far less and invite corruption. The Maldives has seen real scandals of this kind.' : 'Open, competitive leasing gets the best price and serious developers who will actually build.' });
  }
  function step() {
    const msgs = [];
    for (const r of L()) {
      const Z = RESORT_SIZES[r.size], A = atoll(r.atoll);
      if (r.phase === 'bid' && S.turn >= r.t0) {
        r.fee = Z.rooms * rnd(.12, .2); S.debt -= U(r.fee); r.earned += r.fee; r.phase = 'build'; r.start = S.turn + 1;
        msgs.push(`🏝️ ${r.dev} wins the open bid for an island in ${A[1]} Atoll — fee ${$m(r.fee)} paid to the state`);
        news(`${r.dev} wins resort island bid with ${$m(r.fee)} offer`);
        continue;
      }
      if (r.phase !== 'build') continue;
      const quit = { open: .03, jv: .02, direct: .14 }[r.method];
      if (Math.random() < quit) {
        r.phase = 'stalled'; msgs.push(`🚧 ${r.dev} has stopped building on the island in ${A[1]} Atoll — the lease sits unused`);
        news(`Resort project in ${A[1]} Atoll abandoned by developer`); continue;
      }
      r.prog = Math.min(1, r.prog + 1 / (Z.turns + (r.strict ? 1 : 0)) * rnd(.8, 1.1));
      S.ga.workers = clamp(S.ga.workers + .4);
      if (r.prog >= .999) {
        r.phase = 'open'; r.opened = S.turn + 1;
        msgs.push(`🎉 New resort opens in ${A[1]} Atoll — ${Z.rooms} villas, about ${staff(r)} jobs`);
        news(`New ${Z.rooms}-villa resort opens in ${A[1]} Atoll`);
        S.ga.farmers = clamp(S.ga.farmers + (r.local ? 4 : 1)); S.ga.business = clamp(S.ga.business + 3);
      }
    }
    // open resorts: rent + tourism taxes to the budget, dollars to the reserves, a little growth
    let inc = 0, usd = 0;
    for (const r of open()) {
      const Z = RESORT_SIZES[r.size], tour = 1;
      const tax = Z.rooms * .06 * (r.local ? .95 : 1) * tour + (r.method === 'jv' ? Z.rooms * .03 : 0);
      inc += tax; r.earned += tax; usd += Z.rooms * .25;
      S.gdp *= 1 + Z.rooms / 100 * .04 / 100;
      if (r.local) S.ga.farmers = clamp(S.ga.farmers + .3), S.ga.workers = clamp(S.ga.workers + .2);
      if (!r.strict) S.stats.environment = clamp(S.stats.environment - .3);
    }
    if (inc) { S.debt -= U(inc); msgs.push(`🏝️ Resorts paid ${$m(inc)} in rent and tourism taxes this half-year`); }
    if (usd && S.fin && S.fin.res !== undefined) S.fin.res += usd;
    return msgs;
  }
  async function act(spec) {
    const [a, uid] = spec.split('|'), r = L().find(x => x.uid === uid);
    if (a === 'lease') return lease();
    if (!r) return;
    if (a === 'revoke') {
      const k = await choiceModal({ icon: '📜', title: 'Take back the island?', text: 'The developer has not built anything. Cancelling the lease frees the island for an open tender, but the developer may sue and the fee is not returned.',
        choices: [{ t: 'Revoke the lease and re-tender later', note: '⭐ −1 political capital' }, { t: 'Give them more time', note: '' }] });
      if (k) return;
      S.pc = Math.max(0, S.pc - 1); r.phase = 'revoked'; news(`Government takes back unused resort island in ${atoll(r.atoll)[1]} Atoll`); save(); render();
    }
  }
  function html() {
    const list = L(), o = open(), rooms = o.reduce((t, r) => t + RESORT_SIZES[r.size].rooms, 0), jobs = o.reduce((t, r) => t + staff(r), 0);
    const lab = { bid: '📨 open bidding', build: '🏗️ under construction', open: '✅ open', stalled: '🚧 stalled — developer stopped', revoked: '📜 lease revoked' };
    return `<h3>🏝️ Island resorts</h3>
      <p class="muted">In the Maldives each resort usually has its own island. The state leases uninhabited islands; developers build and run the resorts and pay fees, rent and taxes. ${o.length ? `<b>${o.length} new resort${o.length > 1 ? 's' : ''} open:</b> ${rooms} villas, about ${jobs} jobs.` : ''}</p>
      ${list.length ? `<div class="mg-pick">${list.slice().reverse().map(r => { const Z = RESORT_SIZES[r.size]; return `<div class="mg-opt"><div class="mg-head"><span class="mg-ic">🏝️</span><div><b>${name(r)}</b><small>${Z.name} · ${esc(r.dev)} · ${{ open: 'open bidding', jv: 'joint venture', direct: 'direct award' }[r.method]}</small></div></div>
        <p>${lab[r.phase]}${r.phase === 'build' ? ` · ${fmt(Math.min(1, r.prog) * 100)}%` : ''}<br><small>${r.strict ? '🪸 reef protected' : '⚠️ relaxed reef rules'} · ${r.local ? '🇲🇻 local hiring' : 'free hiring'} · state income so far ${$m(r.earned)}</small></p>
        ${r.phase === 'stalled' ? `<button class="btn small" data-act="resort" data-id="revoke|${r.uid}">📜 Revoke lease</button>` : ''}</div>`; }).join('')}</div>` : ''}
      <div class="mg-opt rs-form"><b>Lease a new resort island</b>
        <div class="rs-row"><label>Atoll <select id="rs-atoll">${atolls().map(a => `<option value="${a[0]}">${a[1]} (${a[0]})</option>`).join('')}</select></label>
        <label>Size <select id="rs-size">${Object.entries(RESORT_SIZES).map(([k, z]) => `<option value="${k}" ${k === 'mid' ? 'selected' : ''}>${z.name}</option>`).join('')}</select></label>
        <button class="btn primary small" data-act="resort" data-id="lease|">Lease the island →</button></div>
        <small class="muted">Building the resort is paid by the developer, not the government. Income and fees are game estimates.</small></div>`;
  }
  return { step, act, html, open };
})();
