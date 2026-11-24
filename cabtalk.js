/* ============================================================
   CABINET DISCUSSION & FOLLOW-UP — like a real cabinet:
   • A minister proposes; the president questions them (cost,
     time, risks, alternatives, the Finance Minister's view,
     expected result) without leaving the meeting.
   • The cabinet agrees (or asks for a revised proposal), and the
     MINISTER does the job: drafts and steers the bill through
     parliament, runs the tender with the ministry's committee,
     or carries out the measure.
   • The vice president (or chief of staff) follows up and reports
     at the start of the next half-year; ministers give updates at
     the next cabinet meeting.
   ============================================================ */

const CabTalk = (() => {
  const T = () => (S.cabTasks = S.cabTasks || []);
  const vpName = () => S.vp ? `Vice President ${S.vp.name}` : 'your Chief of Staff';
  const vpShort = () => S.vp ? S.vp.name : 'Chief of Staff';
  const Y = u => money(u * 2);
  const peek = a => { if (!/bill|tender/i.test(a.label)) return null; const keep = UI.region; const r = a.fn(); const out = r ? { ...r, rid: UI.region } : null; UI.region = keep; return out; };
  const kindOf = (a, r) => r && r.law ? 'law' : r && r.tender ? 'tender' : /🏦|review/i.test(a.label) ? 'review' : 'measure';
  const PREF = { economy: 'growth', energy: 'power', interior: 'crime', infra: 'roads' };
  const concernFor = min => { try { const A = Concerns.all(); return A.find(c => c.id === PREF[min]) || A.find(c => c.min === min && !c.id.startsWith('mega_')); } catch (e) { return null; } };
  const defPct = () => -budgetCalc().bal * 2 / S.gdp * 100;
  const clean = s => s.replace(/\s*\(.*\)$/, '').replace(/[🏦]/g, '').trim();

  // ---------- answers the minister gives ----------
  function answers(b, a, mi) {
    const r = peek(a), k = kindOf(a, r), lbl = a.label, c = concernFor(b.id);
    let plan = null; try { plan = c && c.plan(); } catch (e) { }
    const L = r && r.law ? LAWS.find(x => x.id === r.law) : null, Dd = L && LEGAL[L.id], P = r && r.tender ? PROJECTS[r.tender] : null;
    const pt = S.gdp * .005;   // one budget point, per half-year
    const cost = k === 'law' ? (L.cost ? `The ${Dd ? Dd.title : L.name} would cost about <b>${fmt(L.cost * 2, 1)}% of GDP a year</b> (≈ <b>${money(S.gdp * L.cost / 100 * 2)}</b>). Getting it through parliament needs ⭐${L.pc} political capital.` : `The bill itself costs the budget almost nothing; the cost falls on ${Object.entries(L.g).filter(x => x[1] < 0).map(x => GROUPS[x[0]].name.toLowerCase()).join(' and ') || 'nobody directly'}. It needs ⭐${L.pc} political capital in parliament.`)
      : k === 'tender' ? `The engineer's estimate is <b>${money(P.cost)}</b>. We pay 15% on signing and the rest as work is certified over ${P.turns} half-year${P.turns > 1 ? 's' : ''}.`
      : /tax rate \+(\d+)/i.test(lbl) ? `Each tax point brings about <b>${Y(S.gdp / 200)}</b> a year, so +${lbl.match(/\+(\d+)/)[1]} points ≈ <b>${Y(S.gdp / 200 * +lbl.match(/\+(\d+)/)[1])}</b> more revenue.`
      : /tax rate −(\d+)|cut tax/i.test(lbl) ? `Each tax point cut costs about <b>${Y(S.gdp / 200)}</b> a year in revenue.`
      : /\+1/.test(lbl) ? `One more budget point is about <b>${Y(pt)}</b> a year. The deficit would go from ${fmt(defPct(), 1)}% to about <b>${fmt(defPct() + pt * 2 / S.gdp * 100, 1)}%</b> of GDP.`
      : /−1/.test(lbl) ? `Cutting one budget point saves about <b>${Y(pt)}</b> a year.`
      : 'There is no direct cost; it is staff time in my ministry.';
    const time = k === 'law' ? `My ministry drafts it with the Attorney General's office now; I present it to the ${COUNTRY.parl || 'parliament'} and the vote is expected early next half-year.`
      : k === 'tender' ? `Tender notice for 30–45 days, then evaluation and award — contract signed by next half-year, and about ${P.turns} half-year${P.turns > 1 ? 's' : ''} of construction.`
      : k === 'review' ? 'We can bring a full paper with options to the next meeting.'
      : 'It starts in this budget. You will see the first effects in one or two half-years.';
    const losers = k === 'law' ? Object.entries(L.g).filter(x => x[1] < 0).map(x => GROUPS[x[0]].name) : /tax rate \+/i.test(lbl) ? [GROUPS.business.name, GROUPS.workers.name] : /−1|trim|cut/i.test(lbl) ? ['people who use that service'] : [];
    const risks = k === 'law' ? `${losers.length ? `${losers.join(' and ')} will oppose it. ` : ''}We have ${coalitionSeats()} seats and need ${majority()} — ${coalitionSeats() >= majority() ? 'it should pass if our coalition holds' : 'we will need votes from other parties'}.`
      : k === 'tender' ? 'Cost overruns and weak contractors. I will use an open tender and an independent engineer to check the work.'
      : `${losers.length ? `${losers.join(' and ')} will not like it. ` : ''}${/\+1|cut tax|−1 pt/i.test(lbl) && defPct() > 3 ? `With a deficit of ${fmt(defPct(), 1)}% of GDP, the Finance Minister will want savings elsewhere.` : 'The main risk is doing it badly — I will report the results to cabinet.'}`;
    const alts = plan && plan.steps ? `Other options my officials looked at:<ol class="qa-steps">${plan.steps.slice(0, 3).map(s => `<li>${s}</li>`).join('')}</ol>` : 'We could wait a half-year and see if the situation improves by itself — but that rarely works.';
    const fin = Cabinet.get(b.id === 'finance' ? 'economy' : 'finance');
    const finView = fin ? `<b>${esc(fin.name)} (${esc(fin.title)}):</b> ${b.id === 'finance' ? 'From the economy\'s side, this is the right direction if it is done gradually.' : defPct() > 3 ? `“We have a deficit of ${fmt(defPct(), 1)}% of GDP. If cabinet agrees, I need a matching saving or it adds to borrowing.”` : `“We have room in the budget for this. I support it, provided results are reported.”`}` : 'The Finance Minister has no objection.';
    const expect = plan && plan.target ? `${plan.facts}<br>🎯 ${plan.target}` : b.text;
    return { k, r, items: [
      ['💰', 'What will it cost?', cost],
      ['⏳', 'How long will it take?', time],
      ['⚠️', 'What are the risks — who will be unhappy?', risks],
      ['🔄', 'What are the alternatives?', alts],
      ['🏦', 'What does the Finance Minister think?', finView],
      ['📊', 'What result do you expect, and how will we measure it?', expect]] };
  }

  // ---------- discussion inside the meeting ----------
  function discuss(b, a) {
    const mi = Cabinet.get(b.id), A = answers(b, a, mi), asked = [];
    return new Promise(res => {
      const draw = () => {
        const m = modal(`<div class="scene-title">🏛️ Cabinet meeting · discussion</div>
          <div class="ct-head">${avatarSVG(mi.look, 1, 56)}<div><b>${mi.icon} ${esc(mi.name)}</b><small>${esc(mi.title)}</small><p>Proposal: <b>${esc(clean(a.label))}</b></p></div></div>
          <div class="ct-log">${`<div class="ct-msg min"><b>${esc(mi.name)}:</b> ${b.text}</div>`}${asked.map(i => `<div class="ct-msg you"><b>You:</b> ${A.items[i][1]}</div><div class="ct-msg min"><b>${i === 4 ? '' : esc(mi.name) + ':'}</b> ${A.items[i][2]}</div>`).join('')}</div>
          <div class="ct-qs">${A.items.map((q, i) => asked.includes(i) ? '' : `<button class="btn small" data-q="${i}">${q[0]} ${q[1]}</button>`).join('')}</div>
          <div class="ct-dec">
            <button class="choice" data-d="agree"><b>✅ Cabinet agrees — ${esc(mi.name.split(' ')[0])}, please carry it out</b><span class="fx">${A.k === 'law' ? 'the minister drafts the bill and steers it through parliament' : A.k === 'tender' ? 'the ministry runs an open tender and signs the contract' : A.k === 'review' ? 'the ministry prepares a full paper' : 'the measure starts now'} · ${esc(vpShort())} follows up</span></button>
            <button class="choice" data-d="revise"><b>🔁 Bring a revised proposal to the next meeting</b><span class="fx">ask for more work before deciding</span></button>
            ${A.k !== 'measure' ? `<button class="choice" data-d="self"><b>🙋 I will handle this myself now</b><span class="fx">leaves the meeting — you go through every step personally</span></button>` : ''}
            <button class="choice" data-d="no"><b>✖ Not now</b><span class="fx">back to the meeting</span></button></div>
          ${asked.length < 2 ? '<p class="muted small center">💡 Good leaders question a proposal before agreeing: cost, time, risks, alternatives.</p>' : ''}`, 'cab-card');
        m.querySelectorAll('[data-q]').forEach(x => x.onclick = () => { asked.push(+x.dataset.q); draw(); const l = $('.ct-log'); if (l) l.scrollTop = l.scrollHeight; });
        m.querySelectorAll('[data-d]').forEach(x => x.onclick = () => res({ d: x.dataset.d, k: A.k, r: A.r, asked: asked.length }));
      };
      draw();
    });
  }

  // ---------- the minister takes the job ----------
  function assign(b, a, r, k) {
    const mi = Cabinet.get(b.id), c = concernFor(b.id);
    const t = { id: 'ct' + S.turn + '_' + Math.floor(Math.random() * 9999), min: b.id, label: clean(a.label), kind: k, turn: S.turn, status: 'assigned', result: '' };
    if (c) { try { t.cid = c.id; t.base = c.metric(); } catch (e) { } }
    if (k === 'law') {
      const L = LAWS.find(x => x.id === r.law); t.law = r.law;
      if (S.pc >= L.pc) { S.pc -= L.pc; t.result = `Drafting the bill; ⭐${L.pc} political capital committed to whip the vote.`; }
      else { t.status = 'blocked'; t.result = `Not enough political capital (⭐${L.pc} needed) — the bill will wait.`; }
    }
    if (k === 'tender') { t.tender = r.tender; t.rid = r.rid || UI.region; t.result = 'Tender notice being prepared.'; }
    if (k === 'review') { t.tab = r && r.tab; t.result = 'Preparing a paper with options.'; }
    if (k === 'measure') { t.status = 'in progress'; t.result = 'Measure started.'; }
    T().push(t);
    news(`Cabinet tasks ${mi.title.toLowerCase()} with: ${t.label}`);
    return t;
  }
  // ---------- the job gets done (start of the next half-year) ----------
  function execute(t) {
    const mi = Cabinet.get(t.min);
    if (t.kind === 'law' && t.status === 'assigned') {
      const L = LAWS.find(x => x.id === t.law), D = LEGAL[t.law];
      if (S.laws.includes(t.law)) { t.status = 'done'; t.result = 'Already law.'; return; }
      const size = S.parl.size || 100, exp = Legis.expectedVotes(L, { lobby: true }), yes = Math.max(0, Math.min(size, Math.round(exp + rnd(-4, 4))));
      if (yes >= majority()) { applyLawPassed(L); t.status = 'done'; t.result = `${mi.name} presented the ${D ? D.title : L.name} — <b>passed ${yes}–${size - yes}</b>. It is now law.`; }
      else { t.status = 'failed'; t.result = `${mi.name} presented the bill but it was <b>defeated ${yes}–${size - yes}</b> (${majority()} needed). You can try again yourself with amendments and negotiation.`; news(`${D ? D.title : L.name} defeated in parliament`); }
    }
    if (t.kind === 'tender' && t.status === 'assigned') {
      const P = PROJECTS[t.tender]; let rid = REGIONS.some(x => x.id === t.rid) ? t.rid : (UI.region || REGIONS[0].id);
      if (buildBlock(t.tender, rid)) rid = (REGIONS.find(x => !buildBlock(t.tender, x.id)) || {}).id;
      if (!rid) { t.status = 'failed'; t.result = 'No suitable site was available.'; return; }
      const best = COMPANIES.filter(c => !c.shady).map(c => ({ c, q: clamp(c.quality + ((S.companies[c.id] || 50) - 50) * .3), price: Math.round(P.cost * c.price * 10) / 10 })).sort((x, y) => (y.q - y.price / P.cost * 40) - (x.q - x.price / P.cost * 40))[0];
      S.debt += best.price * .15;
      S.projects.push({ uid: Date.now() + Math.random(), type: t.tender, region: rid, company: best.c.id, turnsLeft: P.turns, total: P.turns, q: best.q, price: best.price, delays: 0, paid: .15, ref: `${COUNTRY.id.toUpperCase()}-${yearNow()}-${t.tender.slice(0, 3).toUpperCase()}-CAB` });
      t.status = 'done'; t.result = `Open tender completed by the ministry's committee: <b>${esc(best.c.name)}</b> won with <b>${money(best.price)}</b> (estimate ${money(P.cost)}). Construction of the ${P.name.toLowerCase()} in ${reg(rid).short} has started.`;
      news(`${best.c.name} wins ${P.name.toLowerCase()} tender in ${reg(rid).name}`);
    }
    if (t.kind === 'review' && t.status === 'assigned') { t.status = 'done'; t.result = 'The paper with options is ready for you.'; }
  }
  function progressLine(t) {
    if (!t.cid || t.base === undefined) return '';
    const c = Concerns.all().find(x => x.id === t.cid); if (!c) return '';
    let now; try { now = c.metric(); } catch (e) { return ''; }
    const better = c.good === 'down' ? now < t.base - .05 : now > t.base + .05, worse = c.good === 'down' ? now > t.base + .05 : now < t.base - .05;
    return ` ${better ? '📈' : worse ? '📉' : '➖'} ${c.show(t.base)} → <b>${c.show(now)}</b> since cabinet agreed.`;
  }
  // VP follow-up at the start of each half-year
  async function followUp() {
    const due = T().filter(t => t.turn < S.turn && !t.reported);
    if (!due.length) return;
    due.forEach(t => { try { execute(t); } catch (e) { console.error(e); t.status = 'failed'; t.result = 'The ministry could not complete this — try it yourself.'; } });
    const rows = due.map(t => { const mi = Cabinet.get(t.min) || { name: '?', look: randomLook(), title: '' }; return `<div class="ct-up ${t.status}">${avatarSVG(mi.look, t.status === 'failed' ? -1 : 1, 40)}<div><b>${esc(t.label)}</b><small>${esc(mi.name)} · ${esc(mi.title)}</small><p>${{ done: '✅', failed: '❌', blocked: '⏸️', 'in progress': '🔄', assigned: '📝' }[t.status] || ''} ${t.result}${t.kind === 'measure' ? progressLine(t) : ''}</p>
      ${t.status === 'failed' && t.kind === 'law' ? `<button class="btn small" data-ctl="${t.law}">🏛️ Take the bill to parliament myself</button>` : ''}${t.kind === 'review' && t.tab ? `<button class="btn small" data-ctt="${t.tab}">Open the paper →</button>` : ''}</div></div>`; }).join('');
    await new Promise(res => {
      const m = modal(`<div class="m-icon">🤝</div><h2>Follow-up from ${esc(vpName())}</h2>
        <p class="m-body">“Here is where things stand on what cabinet agreed last time.”</p><div class="ct-ups">${rows}</div>
        <p class="muted small">Ministers will also give these updates at the next cabinet meeting.</p><button class="btn primary big" id="m-ok">Thank you</button>`, 'wide keep');
      $('#m-ok', m).onclick = () => { closeModal(); res(); };
      m.querySelectorAll('[data-ctl]').forEach(x => x.onclick = async () => { closeModal(); res(); UI.tab = 'laws'; render(); setTimeout(() => Legis.run(x.dataset.ctl), 50); });
      m.querySelectorAll('[data-ctt]').forEach(x => x.onclick = () => { closeModal(); res(); UI.tab = x.dataset.ctt; render(); });
    });
    due.forEach(t => { t.reported = true; if (t.status === 'in progress' && S.turn - t.turn >= 2) t.status = 'done'; });
    T().splice(0, Math.max(0, T().length - 20));
    save(); render();
  }
  // ministers' updates shown at the top of the next cabinet meeting
  function updatesHTML() {
    const list = T().filter(t => t.turn < S.turn).slice(-5).reverse();
    if (!list.length) return '';
    return `<details class="ct-mtg" open><summary>📋 Updates on earlier cabinet decisions (${list.length})</summary>${list.map(t => { const mi = Cabinet.get(t.min) || { name: '?', title: '' }; return `<div class="ct-line"><b>${esc(mi.name)}</b> <small>${esc(mi.title)}</small>: ${{ done: '✅', failed: '❌', blocked: '⏸️', 'in progress': '🔄', assigned: '📝', revise: '🔁' }[t.status] || ''} <i>${esc(t.label)}</i> — ${t.status === 'revise' ? 'revised proposal ready for discussion.' : t.result}${t.kind === 'measure' ? progressLine(t) : ''}</div>`; }).join('')}</details>`;
  }
  function revise(b, a) { T().push({ id: 'rv' + S.turn, min: b.id, label: clean(a.label), kind: 'revise', turn: S.turn, status: 'revise', result: '', reported: true }); }
  return { discuss, assign, followUp, updatesHTML, revise };
})();
