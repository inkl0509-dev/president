/* ============================================================
   ONLINE MULTIPLAYER
   Lobby → everyone joins a party, some run for president
   → each candidate plays their own campaign → best vote share
   (plus party volunteers) wins → the winner governs and offers
   posts (ministers, SOE managing directors). Players accept or
   decline and join the opposition. Ministers and MDs send
   proposals; the opposition asks questions and tables motions.
   Storage: games/{gid} (host / president writes),
            games/{gid}/players/{uid} (each player writes their own),
            games/{gid}/acts/{id} (proposals & statements).
   ============================================================ */

const Online = (() => {
  const O = { gid: null, g: null, players: [], acts: [], list: null, subs: [], listSub: null, err: '', pendingRender: false, lastPub: '', pubT: null, seen: {} };
  const me = () => Net.me.id;
  const myP = () => O.players.find(p => p.id === me()) || null;
  const active = () => !!(O.gid && O.g);
  const isHost = () => O.g && O.g.host === me();
  const isPresident = () => O.g && O.g.president === me();
  const pathG = (gid = O.gid) => `games/${gid}`;
  const partyName = id => (PARTIES.find(p => p.id === id) || { name: '—' }).name;
  const countryName = id => (COUNTRIES.find(c => c.id === id) || { name: id }).name;
  const ACT_LIMIT = 3;
  const offersOf = () => Array.isArray(O.g && O.g.offers) ? [...O.g.offers] : [];
  const offerFor = uid => offersOf().find(o => o.uid === uid);

  // ---------- subscriptions ----------
  function unsubAll() { O.subs.forEach(u => { try { u(); } catch (e) {} }); O.subs = []; }
  function rerender() {
    const a = document.activeElement;
    if (a && /INPUT|TEXTAREA|SELECT/.test(a.tagName) && a.closest('#app')) { O.pendingRender = true; return; }
    if (UI.screen === 'online' || (UI.screen === 'govern' && UI.tab === 'team')) render();
  }
  document.addEventListener('focusout', () => setTimeout(() => { if (O.pendingRender && !(document.activeElement && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))) { O.pendingRender = false; rerender(); } }, 50));

  function enter(gid) {
    if (O.gid === gid && O.subs.length) return;
    unsubAll(); O.gid = gid; O.g = null; O.players = []; O.acts = [];
    localStorage.setItem('president.online', gid);
    O.subs.push(Net.watch(pathG(), g => { O.g = g; onGame(); rerender(); }));
    O.subs.push(Net.watchColl(`${pathG()}/players`, ps => { O.players = ps; onPlayers(); rerender(); }));
    O.subs.push(Net.watchColl(`${pathG()}/acts`, as => { O.acts = as.sort((a, b) => (b.ts || 0) - (a.ts || 0)); onActs(); rerender(); }, { order: ['ts', 'desc'], limit: 60 }));
  }
  function leave() { unsubAll(); O.gid = null; O.g = null; localStorage.removeItem('president.online'); }

  // ---------- open the online screen ----------
  async function open() {
    UI.screen = 'online'; O.err = ''; render();
    const ok = await Net.ready();
    if (!ok) { O.err = 'offline'; render(); return; }
    if (!O.listSub) O.listSub = Net.watchColl('games', gs => { O.list = gs.filter(g => g.phase !== 'over'); rerender(); }, { order: ['created', 'desc'], limit: 30 });
    const saved = (S && S.online && S.online.gid) || localStorage.getItem('president.online');
    if (saved) enter(saved);
    render();
  }

  // ---------- lobby actions ----------
  async function create() {
    const name = ($('#on-gname') || {}).value || 'Election night';
    const country = ($('#on-gcountry') || {}).value || 'mv', myName = ($('#on-name') || {}).value;
    const gid = 'g' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    await Net.set(pathG(gid), { name: name.slice(0, 40), country, host: me(), phase: 'lobby', created: Date.now(), offers: [], president: null, results: null, cabinet: [], soes: [], snap: null });
    enter(gid); await join(true, myName);
  }
  async function join(silent, typed) {
    const nm = (typed || ($('#on-name') || {}).value || Net.me.name || UI.setup.name || '').trim().slice(0, 32) || 'Player ' + me().slice(-3);
    const existing = myP();
    if (existing) return;
    await Net.set(`${pathG()}/players/${me()}`, { name: nm, party: UI.setup.party || 'prog', role: 'member', joined: Date.now(), volunteer: 0, look: UI.setup.look });
    if (!silent) toast('You joined the game', 'good');
  }
  const updMe = data => Net.set(`${pathG()}/players/${me()}`, { ...(myP() || {}), ...data, id: undefined });

  // ---------- election ----------
  function startCampaign() {
    const p = myP(); if (!p) return;
    UI.setup = { ...UI.setup, countryId: O.g.country, name: p.name, party: p.party, look: p.look || UI.setup.look, country: '' };
    newGame();
    S.online = { gid: O.gid, uid: me() };
    news(`Online election “${O.g.name}”: ${p.name} is on the campaign trail`);
    save(); render();
  }
  async function reportResult(t) {          // called by afterElection() for online candidates
    const share = t.pv / (t.pv + t.ov) * 100;
    S.online.share = share; S.phase = 'waiting'; save();
    await updMe({ campaign: { done: true, share: Math.round(share * 10) / 10, at: Date.now() } });
    UI.screen = 'online'; enter(S.online.gid); render();
    toast(`Result sent: ${fmt(share, 1)}% of the vote`, 'good');
  }
  function tally() {
    const cands = O.players.filter(p => p.role === 'candidate');
    return cands.map(c => {
      const bonus = O.players.filter(p => p.party === c.party && p.role !== 'candidate').reduce((s, p) => s + Math.min(6, p.volunteer || 0) * .4, 0);
      const share = c.campaign && c.campaign.done ? c.campaign.share : null;
      return { uid: c.id, name: c.name, party: c.party, share, bonus: Math.round(bonus * 10) / 10, total: share === null ? null : Math.round((share + bonus) * 10) / 10 };
    }).sort((a, b) => (b.total || -1) - (a.total || -1));
  }
  async function declare() {
    const res = tally().filter(r => r.total !== null); if (!res.length) return toast('No candidate has finished their campaign yet.', 'bad');
    const w = res[0];
    await Net.update(pathG(), { phase: 'govern', president: w.uid, presidentName: w.name, presidentParty: w.party, results: res, decided: Date.now() });
  }
  function onGame() {
    if (!O.g || typeof S === 'undefined' || !S || !S.online || S.online.gid !== O.gid) return;
    if (O.g.phase === 'govern' && O.g.president && !S.online.result && (S.phase === 'waiting' || S.phase === 'election')) {
      S.online.result = O.g.president === me() ? 'won' : 'lost';
      if (S.phase === 'waiting') afterElection();
    }
  }
  function becomeMember() {   // a candidate who lost the online election
    S.phase = 'member'; save(); UI.screen = 'online'; render();
    updMe({ role: 'opposition' });
    toast('You lost the election — lead the opposition, or accept a post if the president offers one.', 'bad');
  }

  // ---------- president side ----------
  function publishSoon(now) {
    if (!active() || !isPresident() || !S || S.phase !== 'govern') return;
    clearTimeout(O.pubT); O.pubT = setTimeout(publish, now ? 300 : 5000);
  }
  function snapOf() {
    const bc = budgetCalc();
    return {
      date: typeof Clock !== 'undefined' ? Clock.label() : turnLabel(), turn: S.turn, term: S.term,
      approval: Math.round(approval()), gdp: bigMoney(S.gdp * S.scale), debt: Math.round(debtPct()), deficit: Math.round(-bc.bal * 2 / S.gdp * 1000) / 10,
      infl: Math.round(S.infl * 10) / 10, unemp: Math.round(unemployment() * 10) / 10, rep: Math.round(S.rep || 50),
      budget: { ...S.budget }, stats: Object.fromEntries(SK.map(k => [k, Math.round(S.stats[k])])), news: S.news.slice(0, 8), laws: [...S.laws],
      seats: coalitionSeats(), parl: S.parl.size, majority: majority(),
    };
  }
  async function publish() {
    if (!active() || !isPresident()) return;
    const data = {
      snap: snapOf(), presidentName: S.player.name,
      cabinet: S.cabinet.map(m => ({ id: m.id, title: Cabinet.get(m.id).title, icon: Cabinet.get(m.id).icon, name: m.name, uid: m.uid || null })),
      soes: Team.soes().map(s => ({ id: s.id, short: s.short, name: s.name, icon: s.icon, md: s.md.name, uid: s.md.uid || null })),
    };
    const key = JSON.stringify(data); if (key === O.lastPub) return; O.lastPub = key;
    try { await Net.update(pathG(), { ...data, updated: Date.now() }); } catch (e) { console.warn(e); }
  }
  async function offer(uid, post) {
    if (!isPresident() || !post) return;
    const offers = offersOf().filter(o => o.uid !== uid); offers.push({ uid, post, label: Team.postLabel(post), at: Date.now() });
    await Net.update(pathG(), { offers });
    const p = O.players.find(x => x.id === uid); news(`${ROLE.title} offers ${p ? p.name : 'a player'} the post of ${Team.postLabel(post)}`); toast('Offer sent', 'good'); save();
  }
  async function unseat(key) {
    const h = Team.holder(key); if (!h || !h.uid) return;
    const name = h.name; Team.freshPerson(h); news(`${name} dismissed as ${Team.postLabel(key)}`); save(); render(); publishSoon(true);
  }
  function onPlayers() {
    if (!isPresident() || !S || S.phase !== 'govern' || !S.online || S.online.gid !== O.gid) return;
    let changed = false; let offers = offersOf();
    O.players.forEach(p => {
      const r = p.response, of = offers.find(o => o.uid === p.id);
      if (r && of && r.post === of.post && !O.seen[p.id + r.at]) {
        O.seen[p.id + r.at] = 1; offers = offers.filter(o => o.uid !== p.id); changed = true;
        if (r.accept) {
          const h = Team.holder(r.post);
          if (h) { Object.assign(h, { name: p.name, uid: p.id, human: true, gender: h.gender }); news(`${p.name} accepts and becomes ${Team.postLabel(r.post)}`); toast(`🌐 ${p.name} accepted: ${Team.postLabel(r.post)}`, 'good'); }
        } else { news(`${p.name} declines the offer and joins the opposition`); toast(`🌐 ${p.name} declined your offer`, 'bad'); }
      }
      // a seated player who resigned or went to the opposition
      if (p.role === 'opposition' || p.role === 'member') {
        Team.posts().forEach(po => { const h = Team.holder(po.key); if (h && h.uid === p.id) { Team.freshPerson(h); news(`${p.name} resigns as ${po.label}`); changed = true; } });
      }
    });
    if (changed) { Net.update(pathG(), { offers }); save(); publishSoon(true); if (UI.screen === 'govern') render(); }
  }
  // ---------- acts (proposals, statements) ----------
  const KIND_OF_ROLE = { minister: 'proposal', md: 'proposal', opposition: 'statement', member: 'statement' };
  const BUDGET_LINE = { finance: 'tax', health: 'health', education: 'education', interior: 'security', infra: 'infra', housing: 'infra', labour: 'welfare', defense: 'security', energy: 'infra', economy: 'infra', foreign: null, tourism: null };
  function onActs() {
    if (!isPresident() || !S || S.phase !== 'govern' || !S.online || S.online.gid !== O.gid) return;
    O.acts.filter(a => a.status === 'new').forEach(a => {
      if (O.seen['a' + a.id]) return; O.seen['a' + a.id] = 1;
      if (a.kind === 'statement') {           // opposition & party members: applied automatically
        const n = applyStatement(a); Net.update(`${pathG()}/acts/${a.id}`, { status: 'noted', note: n, decidedAt: Date.now() });
      } else toast(`📨 Proposal from ${a.name}: ${describe(a)}`, 'good');
    });
    save();
  }
  function applyStatement(a) {
    const txt = (a.text || '').slice(0, 160);
    if (a.type === 'question') { news(`Majlis question from ${a.name}: “${txt}”`); GK.forEach(g => S.ga[g] = clamp(S.ga[g] - .3)); return 'Question asked in parliament'; }
    if (a.type === 'noconf') {
      const ok = coalitionSeats() >= majority();
      news(`No-confidence motion by ${a.name} ${ok ? 'defeated' : 'passes a first vote — the government is shaken'}`);
      if (!ok) { GK.forEach(g => S.ga[g] = clamp(S.ga[g] - 2)); S.pc = Math.max(0, S.pc - 1); }
      return ok ? 'Motion defeated: the government kept its majority' : 'Motion succeeded: the president lost support and political capital';
    }
    if (a.type === 'campaign') { GK.forEach(g => S.ga[g] = clamp(S.ga[g] + .3)); news(`${a.name} campaigns for the government`); return 'Support for the government rose a little'; }
    news(`${a.role === 'opposition' ? 'Opposition' : 'Party'} statement — ${a.name}: “${txt}”`);
    if (a.role === 'opposition') GK.forEach(g => S.ga[g] = clamp(S.ga[g] - .2));
    return 'Published in the newspapers';
  }
  function describe(a) {
    const p = a.payload || {};
    switch (a.type) {
      case 'budget': return `${p.dir > 0 ? 'Raise' : 'Cut'} the ${p.line === 'tax' ? 'tax rate' : p.line + ' budget'} by 1`;
      case 'tender': return `Tender a new ${(PROJECTS[p.type] || {}).name || p.type}`;
      case 'bill': return `Draft the ${(LAWS.find(l => l.id === p.law) || {}).name || 'bill'}`;
      case 'capital': return `Capital injection for ${p.soe} (expand services)`;
      case 'tariff': return `Raise ${p.soe} tariffs to cut state subsidies`;
      case 'question': return `Question in parliament: “${(a.text || '').slice(0, 90)}”`;
      case 'statement': return `Press statement: “${(a.text || '').slice(0, 90)}”`;
      case 'noconf': return 'No-confidence motion against the government';
      case 'campaign': return 'Campaigned for the government';
      default: return a.text ? `Memo: “${a.text.slice(0, 80)}”` : a.type;
    }
  }
  async function decide(id, yes) {
    const a = O.acts.find(x => x.id === id); if (!a || a.status !== 'new') return;
    let note = yes ? 'Approved by the President' : 'Rejected by the President';
    if (yes) {
      const p = a.payload || {};
      if (a.type === 'budget') { const lo = p.line === 'tax' ? 5 : 0, hi = p.line === 'tax' ? 50 : 10; S.budget[p.line] = Math.max(lo, Math.min(hi, S.budget[p.line] + p.dir)); }
      if (a.type === 'capital') { S.debt += S.gdp * .004; S.lawStat.economy += 1; S.lawStat.environment += .5; news(`${p.soe} receives a capital injection`); }
      if (a.type === 'tariff') { S.lawCost -= .2; S.ga.workers = clamp(S.ga.workers - 2); news(`${p.soe} tariffs rise`); }
      if (a.type === 'memo') news(`${ROLE.title} adopts a proposal from ${a.name}`);
      (S.agenda = S.agenda || []).push({ turn: S.turn, min: (a.post || '').replace(/^min:/, '') || 'finance', label: `${a.name}: ${describe(a)}`, kind: 'expert', result: 'Approved', issue: 'Player proposal' });
    }
    await Net.update(`${pathG()}/acts/${a.id}`, { status: yes ? 'approved' : 'rejected', note, decidedAt: Date.now() });
    save(); render(); publishSoon();
    if (yes && a.type === 'tender') { UI.region = (REGIONS.find(r => !buildBlock(a.payload.type, r.id)) || REGIONS[0]).id; startTender(a.payload.type); }
    if (yes && a.type === 'bill') { UI.tab = 'laws'; render(); Legis.run(a.payload.law); }
  }
  async function submit(type, payload, text) {
    const p = myP(), snap = O.g.snap || {};
    const mine = O.acts.filter(a => a.uid === me() && a.turn === snap.turn).length;
    if (mine >= ACT_LIMIT) return toast(`You can send ${ACT_LIMIT} items per half-year.`, 'bad');
    const r = roleOf();
    await Net.add(`${pathG()}/acts`, { uid: me(), name: p.name, role: r.role, post: r.post || null, kind: KIND_OF_ROLE[r.role] || 'statement', type, payload: payload || {}, text: (text || '').slice(0, 400), status: 'new', ts: Date.now(), turn: snap.turn || 0 });
    toast('Sent to the President\'s Office', 'good');
  }
  // ---------- roles ----------
  function roleOf(uid = me()) {
    const g = O.g || {};
    if (g.president === uid) return { role: 'president', label: `${ROLE.title}` };
    const m = (g.cabinet || []).find(x => x.uid === uid); if (m) return { role: 'minister', post: 'min:' + m.id, label: m.title, min: m.id };
    const s = (g.soes || []).find(x => x.uid === uid); if (s) return { role: 'md', post: 'soe:' + s.id, label: `MD, ${s.short}`, soe: s.short };
    const p = O.players.find(x => x.id === uid) || {};
    if (p.role === 'candidate' && g.phase !== 'govern') return { role: 'candidate', label: 'Candidate for president' };
    return { role: p.role === 'opposition' ? 'opposition' : 'member', label: p.role === 'opposition' ? 'Opposition' : `${partyName(p.party)} member` };
  }

  // ---------- rendering ----------
  const roleTag = uid => { const r = roleOf(uid); return `<span class="on-role r-${r.role}">${esc(r.label)}</span>`; };
  function playersList() {
    return `<div class="on-players">${O.players.map(p => `<div class="on-pl ${p.id === me() ? 'me' : ''}"><div class="on-av">${avatarSVG(p.look || UI.setup.look, 0, 34)}</div>
      <div><b>${esc(p.name)}</b>${p.id === me() ? ' <small>(you)</small>' : ''}${O.g.host === p.id ? ' <small title="Created this game">👑 host</small>' : ''}<small>${esc(partyName(p.party))}</small></div>${roleTag(p.id)}</div>`).join('') || '<p class="muted small">No players yet.</p>'}</div>`;
  }
  function renderLobby() {
    const opts = COUNTRIES.map(c => `<option value="${c.id}" ${c.id === 'mv' ? 'selected' : ''}>${c.name}</option>`).join('');
    return `<div class="card on-card"><h2>🌐 Online multiplayer</h2>
      <p class="muted">${Net.mode === 'artifact' ? 'Play with people this page is shared with. They need <b>Contributor</b> access (“can use and change data”) to join.' : 'Play with anyone who opens this site.'}</p>
      <div class="on-me"><label>Your name in the game <input id="on-name" maxlength="32" value="${esc(Net.me.name || UI.setup.name || '')}" placeholder="Type your name"></label></div>
      <h3>Open games</h3>
      <div class="on-games">${O.list === null ? '<p class="muted small">Loading games…</p>' : O.list.length ? O.list.map(g => `<div class="on-g"><div><b>${esc(g.name)}</b><small>${esc(countryName(g.country))} · ${g.phase === 'lobby' ? 'waiting for players' : g.phase === 'campaign' ? 'campaign under way' : 'in government'}</small></div><button class="btn small primary" data-on="enter" data-id="${g.id}">${g.phase === 'lobby' ? 'Join' : 'Open'}</button></div>`).join('') : '<p class="muted small">No open games yet — create one.</p>'}</div>
      <h3>Create a game</h3>
      <div class="on-create"><input id="on-gname" maxlength="40" placeholder="Game name, e.g. Majlis 2028" value="Election ${2026 + 2}"><select id="on-gcountry">${opts}</select><button class="btn primary" data-on="create">Create & join</button></div>
      <div class="center"><button class="btn ghost" data-act="home">← Back</button></div></div>`;
  }
  function renderRoom() {
    const g = O.g, p = myP(), r = roleOf();
    if (!g) return `<div class="card on-card"><p class="muted">Loading the game…</p><button class="btn ghost" data-on="leave">← Games</button></div>`;
    const head = `<div class="on-head"><div><h2>${myFlagFor(g.country)} ${esc(g.name)}</h2><small class="muted">${esc(countryName(g.country))} · ${g.phase === 'lobby' ? 'Lobby' : g.phase === 'campaign' ? 'Election campaign' : 'In government'}${g.snap ? ` · ${esc(g.snap.date)}` : ''}</small></div><button class="btn ghost small" data-on="leave">← Games</button></div>`;
    let body = '';
    if (!p) body = `<div class="on-box"><p>Join this game to take part.</p><label>Your name <input id="on-name" maxlength="32" value="${esc(Net.me.name || UI.setup.name || '')}"></label> <button class="btn primary" data-on="join">Join game</button></div>`;
    else if (g.phase === 'lobby' || g.phase === 'campaign') body = renderElection(g, p);
    else body = renderGov(g, p, r);
    return `<div class="card on-card">${head}${body}<h3>👥 Players</h3>${playersList()}</div>`;
  }
  function myFlagFor(cid) { const c = COUNTRIES.find(x => x.id === cid); return c ? Flags.svg(Flags.code(cid), 22) : ''; }
  function renderElection(g, p) {
    const T = tally(), cands = O.players.filter(x => x.role === 'candidate');
    const mineLocal = S && S.online && S.online.gid === O.gid;
    const partyOpts = PARTIES.map(x => `<option value="${x.id}" ${p.party === x.id ? 'selected' : ''}>${x.name}</option>`).join('');
    let you = `<div class="on-box"><h3>You</h3>
      <label>Name <input class="on-upd" data-f="name" maxlength="32" value="${esc(p.name)}"></label>
      <label>Party <select class="on-upd" data-f="party" ${p.role === 'candidate' && g.phase === 'campaign' ? 'disabled' : ''}>${partyOpts}</select></label>
      <div class="on-roles">${g.phase === 'lobby' ? `<button class="btn small ${p.role === 'candidate' ? 'primary' : ''}" data-on="role" data-id="candidate">🎤 Run for ${ROLE.title.toLowerCase()}</button><button class="btn small ${p.role !== 'candidate' ? 'primary' : ''}" data-on="role" data-id="member">🤝 Party member / campaigner</button>` : ''}</div>`;
    if (g.phase === 'campaign') {
      if (p.role === 'candidate') {
        if (p.campaign && p.campaign.done) you += `<p>✅ Your result: <b>${p.campaign.share}%</b> of the vote. Waiting for the count…</p>`;
        else if (mineLocal && S.phase === 'campaign') you += `<button class="btn primary" data-act="continue">▶ Continue my campaign</button>`;
        else you += `<button class="btn primary" data-on="play">🎤 Play my campaign</button><p class="muted small">You campaign against computer rivals; your national vote share is your score. Party members' volunteering adds to it.</p>`;
      } else {
        const c = cands.find(x => x.party === p.party);
        you += c ? `<button class="btn primary" data-on="volunteer" ${(p.volunteer || 0) >= 6 ? 'disabled' : ''}>🚪 Knock on doors for ${esc(c.name)} (${p.volunteer || 0}/6)</button><p class="muted small">Each shift adds +0.4 points to your candidate.</p>` : `<p class="muted small">Your party has no candidate. Switch party to campaign for someone.</p>`;
      }
    }
    you += '</div>';
    const board = `<div class="on-box"><h3>🗳️ Candidates</h3>${cands.length ? `<table class="fin-t"><tr><th>Candidate</th><th>Party</th><th>Vote share</th><th>Volunteers</th><th>Total</th></tr>${T.map(x => `<tr><td>${esc(x.name)}</td><td>${esc(partyName(x.party))}</td><td>${x.share === null ? '<span class="muted">campaigning…</span>' : x.share + '%'}</td><td>+${x.bonus}</td><td><b>${x.total === null ? '—' : x.total + '%'}</b></td></tr>`).join('')}</table>` : '<p class="muted small">Nobody is running yet.</p>'}
      ${isHost() ? (g.phase === 'lobby' ? `<button class="btn primary" data-on="startcamp" ${cands.length ? '' : 'disabled'}>📣 Start the campaign</button>` : `<button class="btn primary" data-on="declare" ${T.some(x => x.total !== null) ? '' : 'disabled'}>📊 Count the votes & declare the winner</button><small class="muted"> ${T.filter(x => x.total === null).length ? 'Some candidates are still campaigning.' : 'All candidates have finished.'}</small>`) : '<p class="muted small">The host starts the campaign and declares the result.</p>'}</div>`;
    return `<div class="on-grid">${you}${board}</div>`;
  }
  function renderGov(g, p, r) {
    const s = g.snap || {}, res = g.results || [];
    const winner = `<div class="on-win">🏛️ <b>${esc(g.presidentName || '')}</b> (${esc(partyName(g.presidentParty))}) won the election${res.length ? ` with ${res[0].total}%` : ''}.</div>`;
    const dash = s.date ? `<div class="overview">${[['📅', 'Date', s.date], ['👍', 'Approval', s.approval + '%'], ['💰', 'GDP', s.gdp], ['📉', 'Debt', s.debt + '% of GDP'], ['🧾', 'Deficit', s.deficit + '% of GDP'], ['💹', 'Inflation', s.infl + '%'], ['🧰', 'Unemployment', s.unemp + '%'], ['🏛️', 'Majority', `${s.seats}/${s.parl} (need ${s.majority})`]].map(([i, l, v]) => `<div class="ov"><span>${i} ${l}</span><b>${esc(String(v))}</b></div>`).join('')}</div>
      <div class="on-news">${(s.news || []).map(n => `<div>📰 ${esc(n)}</div>`).join('')}</div>` : '<p class="muted small">The president has not published the government\'s figures yet.</p>';
    const of = offerFor(me());
    let mine = `<div class="on-box"><h3>Your role: ${roleTag(me())}</h3>`;
    if (r.role === 'president') mine += `<button class="btn primary" data-on="office">🏛️ Go to my office</button><p class="muted small">Offer posts to players in the 👥 Government tab.</p>`;
    if (of && r.role !== 'president') mine += `<div class="on-offer">📩 The ${ROLE.title} offers you the post of <b>${esc(of.label)}</b>.<div><button class="btn primary small" data-on="accept">✅ Accept</button> <button class="btn small" data-on="decline">✋ Decline — join the opposition</button></div></div>`;
    mine += actionForms(r) + '</div>';
    const cab = `<div class="on-box"><h3>👔 The government</h3><div class="on-cab">${(g.cabinet || []).map(m => `<div>${m.icon} <small>${esc(m.title)}</small><b>${esc(m.name)}${m.uid ? ' 🌐' : ''}</b></div>`).join('')}${(g.soes || []).map(x => `<div>${x.icon} <small>MD, ${esc(x.short)}</small><b>${esc(x.md)}${x.uid ? ' 🌐' : ''}</b></div>`).join('')}</div></div>`;
    const feed = `<div class="on-box"><h3>📨 Proposals & statements</h3>${O.acts.slice(0, 15).map(a => `<div class="on-act s-${a.status}"><b>${esc(a.name)}</b> <small class="muted">${esc(a.role)}</small> — ${esc(describe(a))}<span class="on-st">${a.status === 'new' ? '⏳ waiting' : a.status === 'approved' ? '✅ approved' : a.status === 'rejected' ? '❌ rejected' : '📰 ' + esc(a.note || 'noted')}</span></div>`).join('') || '<p class="muted small">Nothing yet.</p>'}</div>`;
    return `${winner}<div class="on-grid">${mine}<div class="on-box"><h3>📊 State of the nation</h3>${dash}</div></div><div class="on-grid">${cab}${feed}</div>`;
  }
  function actionForms(r) {
    const s = (O.g && O.g.snap) || {}, mine = O.acts.filter(a => a.uid === me() && a.turn === s.turn).length, left = ACT_LIMIT - mine;
    const lim = `<p class="muted small">${left} of ${ACT_LIMIT} actions left this half-year.</p>`;
    if (r.role === 'minister') {
      const line = BUDGET_LINE[r.min];
      const projOpts = Object.entries(PROJECTS).map(([k, P]) => `<option value="${k}">${P.icon} ${P.name}</option>`).join('');
      const lawOpts = LAWS.filter(l => !(s.laws || []).includes(l.id)).map(l => `<option value="${l.id}">${l.name}</option>`).join('');
      return `<div class="on-forms"><h4>Send a proposal to the ${ROLE.title}</h4>
        ${line ? `<div class="on-f"><span>💰 ${line === 'tax' ? 'Tax rate' : line + ' budget'} (now ${(s.budget || {})[line] ?? '—'})</span><button class="btn small" data-on="prop" data-t="budget" data-line="${line}" data-dir="1">+1</button><button class="btn small" data-on="prop" data-t="budget" data-line="${line}" data-dir="-1">−1</button></div>` : ''}
        <div class="on-f"><span>🏗️ Project</span><select id="on-proj">${projOpts}</select><button class="btn small" data-on="prop" data-t="tender">Propose tender</button></div>
        <div class="on-f"><span>📜 Bill</span><select id="on-law">${lawOpts}</select><button class="btn small" data-on="prop" data-t="bill">Propose bill</button></div>
        <div class="on-f col"><textarea id="on-memo" maxlength="400" placeholder="Policy memo: your advice to the President…"></textarea><button class="btn small" data-on="prop" data-t="memo">Send memo</button></div>
        ${lim}<button class="btn ghost small" data-on="resign">Resign from the cabinet</button></div>`;
    }
    if (r.role === 'md') return `<div class="on-forms"><h4>Proposals as MD of ${esc(r.soe)}</h4>
        <div class="on-f"><button class="btn small" data-on="prop" data-t="capital">💵 Ask for a capital injection to expand services</button></div>
        <div class="on-f"><button class="btn small" data-on="prop" data-t="tariff">🧾 Propose higher tariffs to cut subsidies</button></div>
        <div class="on-f col"><textarea id="on-memo" maxlength="400" placeholder="Report to the government…"></textarea><button class="btn small" data-on="prop" data-t="memo">Send report</button></div>
        ${lim}<button class="btn ghost small" data-on="resign">Resign</button></div>`;
    if (r.role === 'opposition') return `<div class="on-forms"><h4>Hold the government to account</h4>
        <div class="on-f col"><textarea id="on-memo" maxlength="400" placeholder="Your question or statement…"></textarea>
        <div><button class="btn small" data-on="prop" data-t="question">❓ Ask in parliament</button> <button class="btn small" data-on="prop" data-t="statement">📢 Press statement</button></div></div>
        <div class="on-f"><button class="btn small" data-on="prop" data-t="noconf">⚖️ Table a no-confidence motion</button></div>${lim}
        <button class="btn ghost small" data-on="role2" data-id="member">Leave the opposition</button></div>`;
    if (r.role === 'member') return `<div class="on-forms"><h4>Party member</h4>
        <div class="on-f"><button class="btn small" data-on="prop" data-t="campaign">📣 Campaign for the government</button></div>
        <div class="on-f col"><textarea id="on-memo" maxlength="400" placeholder="Statement…"></textarea><button class="btn small" data-on="prop" data-t="statement">📢 Press statement</button></div>${lim}
        <button class="btn ghost small" data-on="role2" data-id="opposition">Join the opposition</button></div>`;
    return '';
  }
  function render_() {
    if (O.err === 'offline') return `<div class="card on-card"><h2>🌐 Online multiplayer</h2><p>Online play is not available here.</p>
      <ul class="tips"><li>In the published Claude page: share it with people as <b>Contributor</b> and make sure you are signed in.</li>
      <li>On your own site (GitHub + Vercel): add your Firebase settings to <code>config.js</code> and publish <code>firestore.rules</code>.</li></ul>
      <button class="btn ghost" data-act="home">← Back</button></div>`;
    if (!Net.mode) return `<div class="card on-card"><p class="muted">Connecting…</p></div>`;
    return O.gid ? renderRoom() : renderLobby();
  }
  // ---- President: panel inside the 👥 Government tab ----
  function teamPanel() {
    const others = O.players.filter(p => p.id !== me());
    const postOpts = Team.posts().map(p => `<option value="${p.key}">${p.icon} ${esc(p.label)}</option>`).join('');
    const inbox = O.acts.filter(a => a.status === 'new' && a.kind === 'proposal');
    return `<div class="on-team"><h3>🌐 Players in “${esc(O.g.name)}”</h3>
      <div class="tm-list">${others.map(p => { const r = roleOf(p.id), of = offerFor(p.id);
        return `<div class="tm-row"><div class="tm-av">${avatarSVG(p.look || UI.setup.look, 0, 34)}</div><div class="tm-post"><b>${esc(p.name)}</b><small>${esc(partyName(p.party))}</small></div>${roleTag(p.id)}
        <div class="tm-ctl">${r.post ? `<button class="btn small" data-on="unseat" data-id="${r.post}">Dismiss</button>` : of ? `<span class="muted small">Offer sent: ${esc(of.label)} ⏳</span>` : `<select id="of-${p.id}">${postOpts}</select><button class="btn small primary" data-on="offer" data-id="${p.id}">Offer post</button>`}</div></div>`; }).join('') || '<p class="muted small">No other players yet.</p>'}</div>
      <h3>📨 Proposals waiting for you ${inbox.length ? `<span class="badge">${inbox.length}</span>` : ''}</h3>
      ${inbox.map(a => `<div class="on-act"><b>${esc(a.name)}</b> <small class="muted">${esc(roleOf(a.uid).label)}</small><p>${esc(describe(a))}${a.text && a.type !== 'memo' ? ` — “${esc(a.text)}”` : ''}</p>
        <button class="btn small primary" data-on="approve" data-id="${a.id}">✅ Approve</button> <button class="btn small" data-on="reject" data-id="${a.id}">❌ Reject</button></div>`).join('') || '<p class="muted small">No proposals waiting.</p>'}</div>`;
  }

  // ---------- click / change routing ----------
  document.addEventListener('click', async e => {
    const b = e.target.closest('[data-on]'); if (!b || b.disabled) return;
    const id = b.dataset.id;
    try {
      switch (b.dataset.on) {
        case 'create': await create(); break;
        case 'enter': enter(id); render(); break;
        case 'join': await join(); break;
        case 'leave': leave(); render(); break;
        case 'role': await updMe({ role: id }); break;
        case 'role2': await updMe({ role: id }); break;
        case 'startcamp': await Net.update(pathG(), { phase: 'campaign', campStart: Date.now() }); break;
        case 'play': startCampaign(); break;
        case 'volunteer': { const p = myP(); await updMe({ volunteer: Math.min(6, (p.volunteer || 0) + 1) }); toast('Thank you, volunteer! +0.4 for your candidate', 'good'); break; }
        case 'declare': await declare(); break;
        case 'office': if (S && S.online && S.online.gid === O.gid && S.phase === 'govern') { UI.screen = 'govern'; render(); } else toast('Your government is open in the browser where you played the campaign.', 'bad'); break;
        case 'accept': case 'decline': { const of = offerFor(me()); if (!of) break; const yes = b.dataset.on === 'accept'; await updMe({ response: { post: of.post, accept: yes, at: Date.now() }, role: yes ? (of.post.startsWith('soe') ? 'md' : 'minister') : 'opposition' }); toast(yes ? 'You accepted the post' : 'You declined and joined the opposition', yes ? 'good' : 'bad'); break; }
        case 'resign': await updMe({ role: 'member', response: null }); toast('You resigned', 'bad'); break;
        case 'prop': {
          const t = b.dataset.t, memo = ($('#on-memo') || {}).value || '';
          const payload = t === 'budget' ? { line: b.dataset.line, dir: +b.dataset.dir } : t === 'tender' ? { type: $('#on-proj').value } : t === 'bill' ? { law: $('#on-law').value } : (t === 'capital' || t === 'tariff') ? { soe: roleOf().soe } : {};
          if (['memo', 'question', 'statement'].includes(t) && !memo.trim()) { toast('Write something first.', 'bad'); break; }
          await submit(t, payload, memo); if ($('#on-memo')) $('#on-memo').value = ''; break;
        }
        case 'offer': await offer(id, ($('#of-' + id) || {}).value); break;
        case 'unseat': await unseat(id); break;
        case 'approve': await decide(id, true); break;
        case 'reject': await decide(id, false); break;
      }
    } catch (err) { console.warn(err); toast(err && err.code === 'invalid_argument' ? 'You cannot change this game (ask the owner for Contributor access).' : 'Could not reach the online game. Try again.', 'bad'); }
  });
  document.addEventListener('change', e => {
    const t = e.target; if (!t.classList.contains('on-upd')) return;
    const v = t.value.trim().slice(0, 32); if (!v) return;
    updMe({ [t.dataset.f]: v }).catch(() => toast('Could not save.', 'bad'));
  });

  return { open, render: render_, active, isPresident, isHost, publishSoon, reportResult, becomeMember, teamPanel, enter, roleOf, state: O };
})();
