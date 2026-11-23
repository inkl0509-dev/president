/* ============================================================
   OIL & GAS EXPLORATION — any country can look for oil, even the
   Maldives. But geology decides, not the president: past searches
   in Maldivian waters found no commercial oil, so the chance is low,
   while Kazakhstan, Brazil or the USA have rich basins.
   Steps: offer exploration blocks → seismic survey → exploration
   well (paid by the oil company) → if oil is found: choose the
   contract terms, develop the field, and decide what to do with
   the money (budget or a sovereign wealth fund — the "resource
   curse" lesson). Chances and sizes are game estimates.
   ============================================================ */

const OIL_CHANCE = { mv: .08, veloria: .35, uz: .35, kz: .6, tr: .25, us: .6, uk: .4, de: .12, fr: .12, jp: .08, in: .35, br: .6 };
const OIL_NOTE = {
  mv: 'Oil companies explored Maldivian waters in past decades without finding commercial oil. A new search is a long shot — and drilling near reefs puts tourism, the country\'s main income, at risk.',
  kz: 'Kazakhstan already has giant fields such as Tengiz and Kashagan; new discoveries are likely but often deep and costly.',
  br: 'Brazil\'s deep-water “pre-salt” fields are among the world\'s biggest finds of recent decades.',
  us: 'The USA is one of the largest oil producers; shale and the Gulf of Mexico still hold oil.',
  uk: 'The North Sea is a mature basin: smaller finds, and pressure to stop new licences for climate reasons.',
  jp: 'Japan has almost no oil and imports nearly all of it — finds are very unlikely.',
  de: 'Germany has only small oil fields; most oil is imported.',
  fr: 'France produces very little oil and has banned new oil and gas exploration licences since 2017 — a new licence round would need a law change.',
  in: 'India has fields in Assam, Rajasthan and offshore Mumbai High but imports most of its oil.',
  uz: 'Uzbekistan is mainly a gas producer, with fields in the Bukhara–Khiva region.',
  tr: 'Türkiye produces little oil but found large gas in the Black Sea in 2020.',
};
const OIL_COS = ['Meridian Petroleum', 'Bluewater Energy', 'Atlas Exploration', 'Sundar Oil & Gas', 'Northcape Resources'];   // fictional

const Oil = (() => {
  const st = () => { if (!S.oilx) S.oilx = { blocks: [], fund: 0 }; return S.oilx; };
  const U = usdM => usdM / ((S.scale || 1) * 1000);
  const $m = v => v >= 1000 ? '$' + (v / 1000).toFixed(1) + 'B' : '$' + fmt(v, v < 10 ? 1 : 0) + 'M';
  const chance = () => OIL_CHANCE[COUNTRY.id] ?? .3;
  const mv = () => COUNTRY.id === 'mv';
  const active = () => st().blocks.filter(b => !['dry', 'closed'].includes(b.phase));
  const B = uid => st().blocks.find(b => b.uid === uid);
  const SIZES = { small: { bpd: 15000, name: 'small field' }, medium: { bpd: 60000, name: 'medium field' }, large: { bpd: 200000, name: 'large field' } };

  async function offer() {
    if (active().length >= 2) return toast('Two exploration blocks are already active.', 'bad');
    if (st().blocks.length >= 4) return toast('All promising areas have been offered.', 'bad');
    const where = mv() ? ['Deep water west of the atolls', 'Between the northern atolls', 'Southern basin near Huvadhu'] : ['Offshore basin', REGIONS.find(r => r.id === 'farm').name + ' (onshore)', REGIONS.find(r => r.id === 'high').name + ' (onshore)'];
    const area = where[st().blocks.length % where.length];
    const k = await choiceModal({ icon: '🛢️', title: `Offer exploration block: ${area}`, text: `${OIL_NOTE[COUNTRY.id] || 'Nobody knows yet whether there is oil here.'}<br><br><b>Geologists' estimate of finding commercial oil: about ${Math.round(chance() * 100)}%.</b> Oil companies take the risk: they pay for the surveys and the wells. The state collects a signature bonus now and its share only if oil is found.`,
      choices: [
        { t: 'Open international licensing round', note: '⏳ 1 half-year · best bonus and terms · transparent' },
        { t: 'Direct deal with one company', note: '⚡ now · smaller bonus · questions about who benefits' },
        { t: 'Not now', note: '' }] });
    if (k === 2) return;
    let strict = true;
    if (mv() || /Offshore|Deep|Between|basin/i.test(area)) {
      const e = await choiceModal({ icon: '🪸', title: 'Environmental rules', text: mv() ? 'An oil spill near the atolls could destroy reefs, beaches and the tourism industry. What rules apply?' : 'Offshore drilling risks spills that harm fishing and coasts.',
        choices: [{ t: 'Strict: no drilling near reefs, spill insurance, emergency response plan', note: 'smaller spill risk · companies bid a little less' }, { t: 'Light rules to attract companies', note: 'higher bonus · higher spill risk' }] });
      strict = e === 0;
    }
    const b = { uid: 'ob' + S.turn + '_' + Math.floor(Math.random() * 999), area, phase: k === 0 ? 'round' : 'seismic', t0: S.turn, strict, co: pick(OIL_COS), method: k === 0 ? 'open' : 'direct', log: [] };
    if (k === 1) { b.bonus = (mv() ? 3 : 20) * (strict ? .9 : 1.1) * .5; S.debt -= U(b.bonus); S.scandalRisk += .3; b.log.push(`Direct deal with ${b.co}, bonus ${$m(b.bonus)}`); news(`Exploration block awarded directly to ${b.co}`); }
    else news(`Licensing round opens for oil exploration: ${area}`);
    st().blocks.push(b); save(); render();
  }
  function step() {
    const msgs = [], o = st();
    for (const b of o.blocks) {
      if (b.phase === 'round' && S.turn >= b.t0) { b.bonus = (mv() ? 3 : 20) * (b.strict ? .9 : 1.1) * rnd(.8, 1.3); S.debt -= U(b.bonus); b.phase = 'seismic'; b.t0 = S.turn + 1; msgs.push(`🛢️ ${b.co} wins the licensing round for ${b.area} — signature bonus ${$m(b.bonus)} paid to the state`); continue; }
      if (b.phase === 'seismic' && S.turn >= b.t0) {
        b.found = Math.random() < chance(); b.lead = b.found ? rnd(.45, .8) : rnd(.1, .45);
        b.phase = 'drill'; b.t0 = S.turn + 1; msgs.push(`📡 Seismic survey of ${b.area} done: ${b.lead > .45 ? 'a promising structure' : 'only weak signs'} — the company will drill an exploration well`); continue;
      }
      if (b.phase === 'drill' && S.turn >= b.t0) {
        if (b.found) { b.size = Math.random() < .2 ? 'large' : Math.random() < .55 ? 'medium' : 'small'; b.phase = 'found'; msgs.push(`🎉 OIL FOUND in ${b.area}: a ${SIZES[b.size].name}! Decide the development terms in the Megaprojects tab.`); news(`Oil discovered in ${b.area}!`); GK.forEach(g => S.ga[g] = clamp(S.ga[g] + 2)); }
        else { b.phase = 'dry'; msgs.push(`🕳️ Dry well in ${b.area}: no commercial oil. ${b.co} paid for the well — the state lost nothing but hope.`); news(`Exploration well in ${b.area} comes up dry`); }
        continue;
      }
      if (b.phase === 'develop' && S.turn >= b.t0 + 3) { b.phase = 'produce'; msgs.push(`🛢️ First oil from ${b.area}!`); news(`First oil flows from ${b.area}`); continue; }
      if (b.phase === 'produce') {
        const share = { psa: .6, royalty: .45, noc: .85 }[b.terms], bpd = SIZES[b.size].bpd;
        const rev = bpd * 182 * (S.oil || 80) * share / 1e6 * (b.terms === 'noc' ? .8 : 1);   // US$ million per half-year to the state
        b.earned = (b.earned || 0) + rev;
        if (o.fundMode === 'fund') { S.debt -= U(rev * .5); o.fund += rev * .5; }
        else { S.debt -= U(rev); S.infl = (S.infl || 3) + .25; S.stats.economy = clamp(S.stats.economy - .3); }
        if (S.fin && S.fin.res !== undefined) S.fin.res += rev * .5;
        S.gdp *= 1 + Math.min(.6, U(rev) / S.gdp * 100 * .05) / 100;
        msgs.push(`🛢️ ${b.area}: ${$m(rev)} oil revenue this half-year${o.fundMode === 'fund' ? ' (half saved in the wealth fund)' : ''}`);
        if (Math.random() < (b.strict ? .02 : .07)) {
          const hit = mv() ? 10 : 6;
          S.stats.environment = clamp(S.stats.environment - hit); S.ga.farmers = clamp(S.ga.farmers - (mv() ? 8 : 4)); S.ga.youth = clamp(S.ga.youth - 4);
          if (mv()) S.ga.workers = clamp(S.ga.workers - 5);
          news(`Oil spill near ${b.area}`); msgs.push(`⚠️ OIL SPILL at ${b.area}! ${mv() ? 'Reefs and resort beaches are hit; tourists cancel.' : 'Coasts and fishing grounds are polluted.'}`);
        }
      }
    }
    return msgs;
  }
  async function act(spec) {
    const [a, uid] = spec.split('|');
    if (a === 'offer') return offer();
    const b = B(uid); if (!b) return;
    if (a === 'develop') {
      const k = await choiceModal({ icon: '📜', title: 'How will the oil be developed?', text: `A ${SIZES[b.size].name} (about ${fmt(SIZES[b.size].bpd / 1000)},000 barrels a day). Development takes about 2 years.`,
        choices: [
          { t: 'Production sharing agreement (PSA)', note: 'company invests and recovers costs, then the state takes ~60% of the profit oil' },
          { t: 'Royalty and tax', note: 'simpler · state gets ~45% · company keeps more upside' },
          { t: 'National oil company develops it alone', note: `state invests ${$m(SIZES[b.size].bpd * .02)} now · keeps ~85% · needs skills it may not have` }] });
      b.terms = ['psa', 'royalty', 'noc'][k];
      if (b.terms === 'noc') S.debt += U(SIZES[b.size].bpd * .02);
      const f = await choiceModal({ icon: '🏦', title: 'What will we do with the oil money?', text: 'Countries that spend all their oil money at once often suffer the <b>“resource curse”</b>: prices rise, other industries (like tourism, farming or factories) become less competitive, and the budget collapses when oil prices fall. Norway saves its oil money in a sovereign wealth fund.',
        choices: [{ t: 'Save half in a sovereign wealth fund', note: 'slower benefit · protects the future · steadier economy' }, { t: 'Put it all in the budget', note: 'more money now · inflation and dependence on oil' }] });
      st().fundMode = f === 0 ? 'fund' : 'budget';
      b.phase = 'develop'; b.t0 = S.turn; news(`Development of ${b.area} oil field approved`); save(); render(); return;
    }
    if (a === 'close') { b.phase = 'closed'; save(); render(); }
  }
  function html() {
    const o = st(), lab = { round: '📨 licensing round under way', seismic: '📡 seismic survey', drill: '⛏️ drilling exploration well', found: '🎉 oil found — decide terms', develop: '🏗️ developing the field', produce: '🛢️ producing', dry: '🕳️ dry well', closed: '— closed' };
    return `<h3>🛢️ Oil & gas exploration</h3>
      <p class="muted small">${OIL_NOTE[COUNTRY.id] || 'Your country has never been fully explored for oil.'} Chance of a commercial find per block: about ${Math.round(chance() * 100)}% (game estimate).</p>
      ${o.blocks.length ? `<div class="mg-pick">${o.blocks.slice().reverse().map(b => `<div class="mg-opt"><div class="mg-head"><span class="mg-ic">🛢️</span><div><b>${esc(b.area)}</b><small>${esc(b.co)} · ${b.method === 'open' ? 'open round' : 'direct deal'} · ${b.strict ? 'strict rules' : 'light rules'}</small></div></div>
        <p>${lab[b.phase]}${b.size ? ` · ${SIZES[b.size].name}` : ''}${b.bonus ? `<br><small>bonus ${$m(b.bonus)}${b.earned ? ` · revenue so far ${$m(b.earned)}` : ''}</small>` : ''}</p>
        ${b.phase === 'found' ? `<button class="btn small primary" data-act="oil" data-id="develop|${b.uid}">Decide development terms →</button>` : ''}</div>`).join('')}</div>` : ''}
      ${o.fund ? `<p>🏦 Sovereign wealth fund: <b>${$m(o.fund)}</b> saved for the future.</p>` : ''}
      <button class="btn small ${active().length < 2 && o.blocks.length < 4 ? 'primary' : ''}" data-act="oil" data-id="offer|" ${active().length < 2 && o.blocks.length < 4 ? '' : 'disabled'}>🛢️ Offer an exploration block →</button>`;
  }
  return { step, act, html };
})();
