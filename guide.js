/* ============================================================
   HOW TO PLAY — a tabbed guide: the flow of the game, how to win
   the election, campaign money (how much you can spend and what
   happens if you overspend), governing tips, and stars.
   Shown once before your first game, and any time from the title
   screen, the setup screen or the ☰ menu. All numbers come from
   the game's own rules.
   ============================================================ */

const Guide = (() => {
  const SEEN = 'president.guideSeen';
  const R = () => (typeof RealCamp !== 'undefined' && typeof COUNTRY !== 'undefined' && COUNTRY) ? RealCamp.rules() : { limit: 45, body: 'the election commission', system: 'tworound' };
  const sys = () => ({ tworound: 'Two rounds: you need <b>more than 50%</b> of the national vote. If nobody gets it, the top two go to a <b>run-off</b> two weeks later.', ec: 'Each region is worth electoral votes; win a region and you get all its votes. You need <b>a majority of electoral votes</b>, not just the most votes nationally.', parl: 'Parliament is elected; the leader whose party (or coalition) holds <b>a majority of seats</b> forms the government.' }[R().system] || '');
  const tabs = {
    play: ['🎮 How to play', () => `
      <ol class="gd-steps">
        <li><b>Create your candidate.</b> Choose a country, your name, party, look and <b>qualification</b> (an economist already knows the economy; others learn key terms from the assistant).</li>
        <li><b>Campaign</b> — about 8 weeks (5 for re-election). Each week you get <b>3 actions</b>: rallies, door-to-door, town halls, TV ads, attack ads, fundraisers and promises. Then press <b>End week</b>.</li>
        <li><b>Debate</b> in the middle of the campaign — your answers move voter groups.</li>
        <li><b>Election night</b> — results come in region by region.</li>
        <li><b>Govern</b> in half-year turns (about 2 real minutes each, or press <b>End half-year</b>). Each turn: hold a <b>cabinet meeting</b>, set the <b>budget</b>, pass <b>laws</b>, run <b>tenders</b> for projects, answer <b>events</b>, and watch your <b>targets</b>.</li>
        <li><b>Re-election</b> at the end of your term. Two terms is a full career — then you retire with a final score.</li>
      </ol>
      <p class="gd-tip">💡 Turn on <b>assistant mode</b> (the Chief of Staff card): it tells you what to do next and explains terms. Tap any ⭐ to learn about stars.</p>`],
    win: ['🗳️ Win the election', () => `
      <p><b>How it is decided:</b> ${sys()}</p>
      <ul class="gd-list">
        <li>📊 <b>Watch the polls</b> every week — see which regions and voter groups you are losing, and focus there.</li>
        <li>📣 <b>Rallies</b> ($4M) give a big boost in one region; <b>door-to-door</b> ($1M) is a cheap small boost. Go where the race is close — not where you are already far ahead or hopelessly behind.</li>
        <li>🎤 <b>Town halls</b> ($2M) win over one voter group. Each group has its own worries (workers, business, farmers/islanders, youth, seniors).</li>
        <li>🤝 <b>Promises</b> are free and give a huge boost to one group — but <b>you must deliver them in office</b>, or that group turns on you.</li>
        <li>📺 <b>TV ads</b> ($12M) lift you everywhere — strong but expensive. Use them late in the campaign.</li>
        <li>🗡️ <b>Attack ads</b> ($8M) hurt your rival, but backfire about <b>3 times in 10</b>.</li>
        <li>🎙️ <b>The debate:</b> pick answers that please the groups you need, without angering your base.</li>
        <li>👥 <b>Running mate</b> (where there is one): choose someone who is strong where you are weak.</li>
        <li>⏱️ Never waste actions — <b>use all 3 every week</b>.</li>
      </ul>`],
    money: ['💰 Campaign money', () => { const r = R(); return `
      <div class="gd-nums">
        <div><span>You start with</span><b>$30M</b><small>re-election: $25M + half your approval</small></div>
        <div><span>Every week</span><b>+$3M</b><small>small donations</small></div>
        <div><span>Fundraiser</span><b>+$12M</b><small>uses 1 action · business ▲ workers ▼</small></div>
        <div><span>Legal spending limit</span><b>$${r.limit}M</b><small>for the whole campaign</small></div>
      </div>
      <p><b>How much can you spend?</b> You can only spend money you have — if funds run out, actions are blocked until you raise more. The law also caps total campaign spending at <b>$${r.limit}M</b>. The 💰 bar on the campaign screen shows spent vs the limit (it turns red near the limit).</p>
      <p><b>What if you spend more than $${r.limit}M?</b> Nothing stops you during the campaign — but after the vote ${esc(r.body)} <b>audits your accounts</b>. Overspending is found, your party is <b>fined</b>, it makes the news, and your <b>scandal risk</b> rises as you start governing. A scandal that breaks later costs <b>⭐2</b> and support from every group.</p>
      <p><b>The tempting donor:</b> at some point a tycoon may offer a large cash donation “with no paperwork” — far above the legal cap. Taking it gives you money now; there is about a <b>55% chance</b> the audit finds it, which adds a big scandal risk. Declining is the clean choice.</p>
      <p class="gd-tip">💡 Plan: about <b>$5M a week</b> keeps you under the limit. Spend more on the last 2–3 weeks, when voters decide.</p>`; }],
    govern: ['🏛️ Governing tips', () => `
      <ul class="gd-list">
        <li>👔 Start every half-year with a <b>cabinet meeting</b>. Question ministers before agreeing; they carry out the decision and report back.</li>
        <li>💰 <b>Watch the budget.</b> A deficit adds to debt. If debt rises far above where it started, a <b>debt crisis</b> hits: markets panic and you must cut or seek help. A surplus is always one of your targets.</li>
        <li>🎯 <b>Targets</b> met for two half-years in a row give ⭐2 and public trust.</li>
        <li>👍 Keep <b>approval above 25%</b> — below that, parliament may vote to <b>impeach</b> you. Above 60% you earn an extra ⭐ each half-year.</li>
        <li>🏗️ Always use <b>open tenders</b> and check documents; crony contracts give quick stars but cause scandals.</li>
        <li>🧑‍💼 Listen to your <b>advisers</b> (red dot = urgent) and rest when your physician says so.</li>
        <li>🎙️ Hold <b>press conferences</b> and <b>question time</b>: answer with figures, steps and targets.</li>
        <li>🤝 <b>Keep your promises</b> — voters remember at re-election.</li>
      </ul>`],
    stars: ['⭐ Stars', () => `<p>⭐ Stars are <b>political capital</b> — you spend them to pass laws and push reforms. You get ⭐2 every half-year (⭐3 if approval is above 60%), ⭐2 for each target achieved, ⭐1 for each Finance School lesson passed, and ⭐2 when re-elected.</p><button class="btn small" id="gd-stars">Full list: how to earn stars →</button>`],
  };
  function open(first = false, done) {
    let cur = 'play';
    const draw = () => {
      const m = modal(`<div class="m-icon">📖</div><h2>${first ? 'Before you start' : 'How to play'}</h2>
        <div class="gd-tabs">${Object.entries(tabs).map(([k, t]) => `<button class="${k === cur ? 'on' : ''}" data-g="${k}">${t[0]}</button>`).join('')}</div>
        <div class="gd-body">${tabs[cur][1]()}</div>
        <div class="gd-foot">${cur !== 'stars' ? `<button class="btn ghost" id="gd-next">Next: ${tabs[Object.keys(tabs)[Object.keys(tabs).indexOf(cur) + 1]][0]} →</button>` : ''}<button class="btn primary" id="m-ok">${first ? 'Let\'s play!' : 'Close'}</button></div>`, 'wide');
      m.querySelectorAll('[data-g]').forEach(b => b.onclick = () => { cur = b.dataset.g; draw(); });
      const nx = $('#gd-next', m); if (nx) nx.onclick = () => { cur = Object.keys(tabs)[Object.keys(tabs).indexOf(cur) + 1]; draw(); };
      const st = $('#gd-stars', m); if (st) st.onclick = () => Stars.open();
      $('#m-ok', m).onclick = () => { try { localStorage.setItem(SEEN, '1'); } catch (e) { } closeModal(); if (done) done(); };
    };
    draw();
  }
  const seen = () => { try { return !!localStorage.getItem(SEEN); } catch (e) { return true; } };
  return { open, seen };
})();
