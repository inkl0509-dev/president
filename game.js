/* ============================================================
   PRESIDENT: Rise to Power — game logic & UI
   Plain JavaScript, no build step. Content lives in data.js.
   ============================================================ */
'use strict';

// ---------- helpers ----------
const $ = (s, r = document) => r.querySelector(s);
const clamp = (v, a = 0, b = 100) => Math.max(a, Math.min(b, v));
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const fmt = (n, d = 0) => Number(n).toFixed(d);
const sign = (n, d = 1) => (n >= 0 ? '+' : '−') + Math.abs(n).toFixed(d);
const bigMoney = b => { const a = Math.abs(b); return (b < 0 ? '−' : '') + (a >= 1000 ? '$' + (a / 1000).toFixed(a >= 10000 ? 1 : 2) + 'T' : a < 1 ? '$' + (a * 1000).toFixed(a < .01 ? 1 : 0) + 'M' : '$' + a.toFixed(a >= 100 ? 0 : 1) + 'B'); };
const money = n => bigMoney(n * ((S && S.scale) || 1));   // game money is in "Veloria units"; shown at the real country's scale
const gdpReal = () => S.gdp * (S.scale || 1);
const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
const zero = keys => Object.fromEntries(keys.map(k => [k, 0]));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const GK = Object.keys(GROUPS), SK = Object.keys(STATS), RK = REGIONS.map(r => r.id);
const partyById = id => PARTIES.find(p => p.id === id);
const reg = id => REGIONS.find(r => r.id === id);
const comp = id => COMPANIES.find(c => c.id === id);
const centroid = r => r.lab ? { x: r.lab[0], y: r.lab[1] } : ({ x: avg(r.pts.map(p => p[0])), y: avg(r.pts.map(p => p[1])) });
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const lerpColor = (a, b, t) => { const A = hex(a), B = hex(b); t = clamp(t, 0, 1); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
const approvalColor = v => { const t = clamp(v, 20, 80); return t < 50 ? lerpColor('#dc2626', '#f59e0b', (t - 20) / 30) : lerpColor('#f59e0b', '#16a34a', (t - 50) / 30); };
const stars = q => '★'.repeat(Math.max(1, Math.round(q / 20))) + '☆'.repeat(5 - Math.max(1, Math.round(q / 20)));

const SAVE_KEY = 'president.save.v2', BEST_KEY = 'president.best.v1';
// Save slots: one single-player game + one save per online game, so both can run side by side.
const mpKey = (gid, uid) => `president.save.mp.${gid}${uid ? '.' + uid : ''}`;
const saveKey = (st = S) => st && st.online && st.online.gid ? mpKey(st.online.gid, st.online.uid) : SAVE_KEY;
(() => {   // older versions kept an online game in the single-player slot: move it to its own slot
  try { const s0 = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); if (s0 && s0.online && s0.online.gid) { localStorage.setItem(mpKey(s0.online.gid, s0.online.uid), JSON.stringify(s0)); localStorage.removeItem(SAVE_KEY); } } catch (e) {}
})();

// ---------- country & role ----------
let COUNTRY = COUNTRIES[0];
const ROLE = { title: 'President', upper: 'PRESIDENT', race: 'Presidential', ev: 'electoral votes', palace: 'Presidential Palace' };
function applyCountry(id) {
  COUNTRY = COUNTRIES.find(c => c.id === id) || COUNTRIES[0];
  REGIONS.length = VELORIA_REGIONS.length;          // drop extra regions of the previous country
  REGIONS.forEach((r, i) => {
    const base = VELORIA_REGIONS[i], o = COUNTRY.regions ? COUNTRY.regions[r.id] : null;
    Object.assign(r, base, { mix: { ...base.mix }, city: [...base.city] });
    if (o) Object.assign(r, o, { mix: { ...o.mix }, city: [base.city[0], base.city[1], o.city] });
    if (o && COUNTRY.geo) {   // place the region's main town at its real latitude/longitude
      const c = (COUNTRY.cities || []).find(x => x[4] === r.id && x[0].startsWith(o.city)), a = (COUNTRY.atolls || []).find(x => x[2] === o.city);
      const ll = c ? [c[1], c[2]] : a ? [a[3], a[4]] : null;
      if (ll) r.city = [...COUNTRY.geo(ll), o.city];
    }
  });
  // countries with more than five regions (e.g. the Maldives: Fuvahmulah City)
  Object.values(COUNTRY.regions || {}).filter(o => o.extra).forEach(o => {
    const c = (COUNTRY.cities || []).find(x => x[4] === o.id && x[0].startsWith(o.city));
    REGIONS.push({ ...o, mix: { ...o.mix }, city: c && COUNTRY.geo ? [...COUNTRY.geo([c[1], c[2]]), o.city] : [200, 150, o.city] });
  });
  RK.length = 0; RK.push(...REGIONS.map(r => r.id));
  COMPANIES.forEach(c => { c.base = c.base || { name: c.name, tag: c.tag, icon: c.icon, spec: c.spec }; Object.assign(c, c.base, (COMPANY_LOCAL[COUNTRY.id] || {})[c.id] || {}); });
  if (typeof NAT !== 'undefined') GK.forEach(g => NAT[g] = REGIONS.reduce((t, r) => t + r.mix[g] * r.pop, 0) / 100);
  NEIGHBOR = COUNTRY.fictional ? 'Draskor Federation' : 'Hostile Coalition';
  const pres = COUNTRY.system === 'presidential';
  if (typeof Local !== 'undefined') Local.apply(COUNTRY.id);
  Object.assign(ROLE, { title: COUNTRY.title, upper: COUNTRY.title.toUpperCase(), race: pres ? 'Presidential' : 'General', ev: pres ? 'electoral votes' : 'seat share', palace: pres ? 'Presidential Palace' : 'Government House' });
}
const majority = () => Math.floor(((S && S.parl && S.parl.size) || 100) / 2) + 1;
const twoThirds = () => Math.ceil(((S && S.parl && S.parl.size) || 100) * 2 / 3);
const TT = () => (S && S.termTurns) || 8;          // half-years per term
const MAXT = () => (S && S.maxTerms) || 2;         // terms allowed
function startBuildingsFor(C) {
  if (C.fictional) return JSON.parse(JSON.stringify(START_BUILDINGS));
  const b = { capital: ['hospital', 'school', 'airport'], north: ['factory', 'coal'], coast: ['school'], farm: ['school'], high: ['base'] };
  RK.forEach(r => { if (!b[r]) b[r] = ['school']; });
  RK.forEach(r => { if (reg(r).coast && !b[r].includes('port')) b[r].push('port'); });
  if (C.infra >= 55) { ['north', 'coast', 'farm', 'high'].forEach(r => { if (!b[r].includes('hospital')) b[r].push('hospital'); }); ['north', 'coast'].forEach(r => b[r].push('airport')); b.capital.push('highway'); }
  if (C.infra >= 70) { ['farm', 'high'].forEach(r => b[r].push('airport')); b.north.push('highway'); b.farm.push('solar'); b.capital.push('park'); }
  return b;
}
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } },
  del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } },
};

// national share of each voter group (weighted by region population)
const NAT = Object.fromEntries(GK.map(g => [g, REGIONS.reduce((s, r) => s + r.mix[g] * r.pop, 0) / 100]));

// ---------- state ----------
let S = null;
const UI = {
  screen: 'title', region: 'capital', view: 'office', pin: true, tab: 'budget', speech: null, busy: false,
  walkFrom: null, revealed: 0, cloud: null,
  setup: { name: '', country: 'Republic of Veloria', party: 'prog', countryId: 'veloria', qual: 'teacher',
    look: { skin: '#e0ac69', hair: '#1f1308', style: 'short', suit: '#1e293b', tie: '#b91c1c' } },
};

function regionApproval(r) { return clamp(GK.reduce((s, g) => s + r.mix[g] * S.ga[g], 0) + (S.regionMods ? S.regionMods[r.id] : 0)); }
function approval() { if (!S || !S.ga) return 0; return REGIONS.reduce((s, r) => s + regionApproval(r) * r.pop / 100, 0); }
function debtPct() { return S && S.gdp ? S.debt / S.gdp * 100 : 0; }
function turnLabel(t = S.turn) { return `${t % 2 ? 'Jan–Jun' : 'Jul–Dec'} ${2026 + Math.ceil(t / 2)}`; }

// ---------- game clock: 2 real minutes = 1 month, 6 months = one half-year ----------
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const SEC_PER_MONTH = 120;
const Clock = {
  month() { return Math.min(5, Math.floor((S.clk || 0) / SEC_PER_MONTH)); },
  label() { return `${MONTHS[(S.turn % 2 ? 0 : 6) + this.month()]} ${2026 + Math.ceil(S.turn / 2)}`; },
  speed() { return UI.speed === undefined ? 1 : UI.speed; },
  html() {
    const sp = this.speed(), b = (v, i, t) => `<button class="${sp === v ? 'on' : ''}" data-act="speed" data-id="${v}" title="${t}">${i}</button>`;
    return `<div class="clock ${sp ? '' : 'paused'}" id="clock" title="Game time: 2 minutes = 1 month. The half-year ends automatically after June/December — or end it now with the button.">
      <div class="clk-d">📅 <b id="clk-m">${this.label()}</b></div>
      <div class="clk-bar">${'<i class="tick"></i>'.repeat(5)}<i class="fill" id="clk-f" style="width:${(S.clk || 0) / (SEC_PER_MONTH * 6) * 100}%"></i></div>
      <div class="clk-s">${b(0, '⏸', 'Pause')}${b(1, '▶', 'Normal: 2 min = 1 month')}${b(3, '⏩', 'Fast: 40 s = 1 month')}</div></div>`;
  },
};
function paintClock() {
  const m = $('#clk-m'), f = $('#clk-f'), c = $('#clock');
  if (m) m.textContent = Clock.label();
  if (f) f.style.width = `${(S.clk || 0) / (SEC_PER_MONTH * 6) * 100}%`;
  if (c) { c.classList.toggle('paused', !Clock.speed() || !!S.pendingEvent || !!$('#modal.open')); c.querySelectorAll('[data-act=speed]').forEach(x => x.classList.toggle('on', +x.dataset.id === Clock.speed())); }
}
function clockTick() {
  if (typeof S === 'undefined' || !S || S.phase !== 'govern') return;
  const sp = Clock.speed();
  if (!sp || UI.busy || S.pendingEvent || document.hidden || $('#modal.open')) return paintClock();
  const m0 = Clock.month(); S.clk = (S.clk || 0) + sp;
  if (S.clk >= SEC_PER_MONTH * 6) { S.clk = SEC_PER_MONTH * 6 - 1; toast(`📅 ${Clock.label()} is over — time for the half-year review.`, 'good'); endTurn(); return; }
  const m1 = Clock.month();
  if (m1 !== m0) { toast(`📅 ${Clock.label()}`, 'good'); if (m1 === 5) toast('⏳ Last month of the half-year. The budget review comes at the end of this month.'); save(); }
  paintClock();
}
setInterval(clockTick, 1000);
function mood() {
  if (!S) return 1;
  if (S.phase === 'campaign' && S.camp) { const n = nationalPoll(); return n.p > n.o + 2 ? 1 : n.p < n.o - 2 ? -1 : 0; }
  if (S.ga) { const a = approval(); return a > 55 ? 1 : a < 40 ? -1 : 0; }
  return 1;
}
function save() { if (S && S.phase !== 'over') store.set(saveKey(), S); if (typeof Online !== 'undefined' && S && S.online) Online.publishSoon(); }
function news(t) { S.news.unshift(t); S.news = S.news.slice(0, 14); }
function say(t) { UI.speech = t; }
function toast(msg, kind = '') {
  const el = document.createElement('div'); el.className = 'toast ' + kind; el.textContent = msg;
  $('#toasts').appendChild(el);
  setTimeout(() => el.classList.add('out'), 2300); setTimeout(() => el.remove(), 2800);
}

// ---------- country metrics ----------
const count = type => S.buildings ? RK.reduce((n, r) => n + S.buildings[r].filter(b => b === type).length, 0) : 0;
const totalBuildings = () => S.buildings ? RK.reduce((n, r) => n + S.buildings[r].length, 0) : 0;
function energy() { return { supply: 45 + count('coal') * 22 + count('solar') * 15 + (S.energyBonus || 0), demand: S.gdp * .6 }; }
function unemployment() { return clamp(13 - (S.stats.economy - 50) * .22 - count('factory') * .7 - (S.projects || []).length * .4, 2, 30); }
function milStrength() { const m = S.mil; return (COUNTRY.landlocked ? m.army * .6 + m.air * .4 : m.army * .5 + m.air * .3 + m.navy * .2) + count('base') * 6 + (m.alliance ? 15 : 0) + S.stats.security * .1; }
function devIndex() { return avg(['economy', 'health', 'education', 'housing'].map(k => S.stats[k])) * .6 + Math.min(100, totalBuildings() * 3.5) * .4; }
function devLevel(d = devIndex()) { return d < 40 ? 'Developing' : d < 55 ? 'Emerging' : d < 70 ? 'Developed' : 'Advanced'; }
function warRisk() { const gap = S.threat - milStrength(); return gap > 15 ? ['High', 'bad'] : gap > 0 ? ['Medium', 'warn'] : ['Low', 'good']; }

// ---------- avatar ----------
const LOOKS = {
  skin: ['#f5d0b5', '#e0ac69', '#c68642', '#8d5524', '#5c3a21'],
  hair: ['#1f1308', '#5a3825', '#b7791f', '#d6d3d1', '#7f1d1d'],
  style: ['short', 'side', 'long', 'curly', 'bald'],
  suit: ['#1e293b', '#1e3a8a', '#3f3f46', '#14532d', '#581c87'],
  tie: ['#b91c1c', '#1d4ed8', '#ca8a04', '#0f766e', '#f8fafc'],
};
function randomLook() { return { skin: pick(LOOKS.skin), hair: pick(LOOKS.hair), style: pick(LOOKS.style), suit: pick(LOOKS.suit), tie: pick(LOOKS.tie) }; }

function avatarInner(L, m = 0) {
  const back = L.style === 'long' ? `<path d="M30 62 Q26 20 60 20 Q94 20 90 62 L92 104 Q80 96 78 72 L42 72 Q40 96 28 104Z" fill="${L.hair}"/>` : '';
  let hair = '';
  switch (L.style) {
    case 'short': hair = `<path d="M33 55 Q31 24 60 23 Q89 24 87 55 Q84 39 71 36 Q58 42 45 37 Q36 42 33 55Z" fill="${L.hair}"/>`; break;
    case 'side': hair = `<path d="M33 57 Q30 22 62 22 Q92 24 87 55 Q86 41 76 36 Q56 45 40 40 Q35 46 33 57Z" fill="${L.hair}"/>`; break;
    case 'long': hair = `<path d="M34 58 Q34 25 60 24 Q86 25 86 58 Q81 37 60 35 Q42 37 34 58Z" fill="${L.hair}"/>`; break;
    case 'curly': hair = Array.from({ length: 9 }, (_, i) => { const a = Math.PI + i * Math.PI / 8; return `<circle cx="${(60 + 25 * Math.cos(a)).toFixed(1)}" cy="${(50 + 24 * Math.sin(a)).toFixed(1)}" r="8.5" fill="${L.hair}"/>`; }).join('') + `<ellipse cx="60" cy="33" rx="20" ry="9" fill="${L.hair}"/>`; break;
    case 'bald': hair = `<path d="M34 62 Q32 48 38 42 L41 60Z M86 62 Q88 48 82 42 L79 60Z" fill="${L.hair}"/>`; break;
  }
  const mouth = m > 0 ? 'M50 73 Q60 82 70 73' : m < 0 ? 'M51 78 Q60 71 69 78' : 'M52 75 L68 75';
  return `${back}
  <path d="M14 140 Q14 102 60 96 Q106 102 106 140Z" fill="${L.suit}"/>
  <path d="M46 97 L60 122 L74 97Z" fill="#f8fafc"/>
  <path d="M57 101 L63 101 L65.5 124 L60 131 L54.5 124Z" fill="${L.tie}"/>
  <path d="M46 97 L60 122 L52 132 L40 104Z M74 97 L60 122 L68 132 L80 104Z" fill="#000" opacity=".18"/>
  <rect x="52" y="80" width="16" height="18" rx="4" fill="${L.skin}"/>
  <circle cx="34" cy="60" r="5" fill="${L.skin}"/><circle cx="86" cy="60" r="5" fill="${L.skin}"/>
  <ellipse cx="60" cy="58" rx="26" ry="30" fill="${L.skin}"/>
  ${hair}
  <path d="M45 50 Q50 47 55 50 M65 50 Q70 47 75 50" stroke="#2b1b0e" stroke-width="2" fill="none" stroke-linecap="round"/>
  <circle cx="50" cy="58" r="2.8" fill="#1f2937"/><circle cx="70" cy="58" r="2.8" fill="#1f2937"/>
  <path d="M60 60 Q63 66 58 67" stroke="#000" stroke-opacity=".25" stroke-width="1.6" fill="none"/>
  <path d="${mouth}" stroke="#7f1d1d" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <circle cx="44" cy="68" r="4" fill="#f43f5e" opacity=".15"/><circle cx="76" cy="68" r="4" fill="#f43f5e" opacity=".15"/>
  <circle cx="84" cy="111" r="3" fill="#fbbf24"/>`;
}
function avatarSVG(L, m = 0, size = 120, cls = '') {
  return `<svg class="avatar ${cls}" viewBox="0 0 120 140" width="${size}" height="${Math.round(size * 140 / 120)}" aria-hidden="true">${avatarInner(L, m)}</svg>`;
}
function bubble() { return UI.speech ? `<div class="bubble">${esc(UI.speech)}</div>` : ''; }

// ---------- modals ----------
function modal(html, wide = false) { const m = $('#modal'); m.innerHTML = `<div class="modal-card ${wide === true ? 'wide' : wide || ''}">${html}</div>`; m.classList.add('open'); return m; }
function closeModal() { const m = $('#modal'); m.classList.remove('open'); m.innerHTML = ''; }
function infoModal(icon, title, html, btn = 'Continue') {
  return new Promise(res => {
    const m = modal(`<div class="m-icon">${icon}</div><h2>${title}</h2><div class="m-body">${html}</div><button class="btn primary big" id="m-ok">${btn}</button>`);
    $('#m-ok', m).onclick = () => { closeModal(); res(); };
  });
}
function fxChips(fx, mode) {
  const out = [];
  const arrow = v => v > 0 ? '▲' : '▼';
  const cls = v => v > 0 ? 'up' : 'down';
  const g = mode === 'camp' ? fx.p : fx.g;
  if (g) for (const k in g) out.push(`<span class="chip ${cls(g[k])}" title="${GROUPS[k].name}">${GROUPS[k].icon}${arrow(g[k])}</span>`);
  if (fx.s) for (const k in fx.s) out.push(`<span class="chip ${cls(fx.s[k])}" title="${STATS[k].name}">${STATS[k].icon}${arrow(fx.s[k])}</span>`);
  if (fx.all) out.push(`<span class="chip ${cls(fx.all)}" title="Everyone">👥${arrow(fx.all)}</span>`);
  if (fx.pAll) out.push(`<span class="chip ${cls(fx.pAll)}" title="All voters">👥${arrow(fx.pAll)}</span>`);
  if (fx.oAll) out.push(`<span class="chip ${cls(-fx.oAll)}" title="Your opponent">🎯 rival${arrow(fx.oAll)}</span>`);
  if (fx.cost) out.push(`<span class="chip ${cls(-fx.cost)}" title="Treasury">💰${arrow(-fx.cost)}</span>`);
  if (fx.funds) out.push(`<span class="chip ${cls(fx.funds)}" title="Campaign funds">💵${arrow(fx.funds)}</span>`);
  if (fx.gdp) out.push(`<span class="chip ${cls(fx.gdp)}" title="GDP">🏦${arrow(fx.gdp)}</span>`);
  if (fx.pc) out.push(`<span class="chip ${cls(fx.pc)}" title="Political capital">⭐${arrow(fx.pc)}</span>`);
  if (fx.threat) out.push(`<span class="chip ${cls(-fx.threat)}" title="Foreign threat">⚔️ threat${arrow(fx.threat)}</span>`);
  if (fx.air) out.push(`<span class="chip up" title="Air force">🛩️▲</span>`);
  if (fx.homes) out.push(`<span class="chip up" title="New homes">🏘️▲</span>`);
  if (fx.scandal) out.push(`<span class="chip warn" title="Scandal risk">⚠️ scandal risk</span>`);
  if (fx.rb) for (const k in fx.rb) out.push(`<span class="chip ${cls(fx.rb[k])}" title="${reg(k).name}">📍${reg(k).short}${arrow(fx.rb[k])}</span>`);
  if (fx.risk) out.push(`<span class="chip warn" title="Risky">⚠️ risky</span>`);
  return out.join('') || '<span class="chip">no effect</span>';
}
function choiceModal({ icon, title, text, choices, mode }) {
  return new Promise(res => {
    const m = modal(`<div class="m-icon">${icon}</div><h2>${title}</h2><p class="m-body">${text}</p>
      <div class="choices">${choices.map((c, i) => `<button class="choice" data-i="${i}" ${c.disabled ? 'disabled' : ''}><b>${c.t}</b><span class="fx">${c.note !== undefined ? c.note : fxChips(c.fx || {}, mode)}</span></button>`).join('')}</div>`);
    m.querySelectorAll('.choice').forEach(b => b.onclick = () => { closeModal(); res(+b.dataset.i); });
  });
}
// seats: array of {party, yes} — shows each seat in its party colour, then fills yes/no
function voteModal(title, seats, threshold, passLabel, failLabel) {
  return new Promise(res => {
    const order = PARTIES.map(p => p.id);
    seats = [...seats].sort((a, b) => order.indexOf(a.party) - order.indexOf(b.party));
    const yes = seats.filter(s => s.yes).length;
    const m = modal(`<div class="m-icon">🏛️</div><h2>${title}</h2>
      <div class="seats">${seats.map(s => `<i style="--pc:${partyById(s.party).color}"></i>`).join('')}</div>
      <div class="legend">${PARTIES.filter(p => S.parl.seats[p.id]).map(p => `<span><i style="background:${p.color}"></i>${p.name} ${S.parl.seats[p.id]}</span>`).join('')}</div>
      <div class="vote-count"><span class="y">Yes <b id="vy">0</b></span><span class="muted">${threshold} needed</span><span class="n">No <b id="vn">0</b></span></div>
      <div id="vres"></div>`);
    const dots = [...m.querySelectorAll('.seats i')];
    const reveal = shuffle([...Array(seats.length).keys()]);
    let i = 0, y = 0;
    const iv = setInterval(() => {
      for (let k = 0; k < 5 && i < seats.length; k++, i++) { const idx = reveal[i]; dots[idx].className = seats[idx].yes ? 'y' : 'n'; if (seats[idx].yes) y++; }
      $('#vy').textContent = y; $('#vn').textContent = i - y;
      if (i >= seats.length) {
        clearInterval(iv);
        const pass = yes >= threshold;
        $('#vres').innerHTML = `<div class="verdict ${pass ? 'good' : 'bad'}">${pass ? passLabel : failLabel}</div><button class="btn primary big" id="vok">Continue</button>`;
        $('#vok').onclick = () => { closeModal(); res(pass); };
      }
    }, 45);
  });
}
const promiseTaken = g => S.camp.newPromises.includes(g) || S.promises.some(p => p.g === g) || S.laws.includes(PROMISES[g].law);
const promisesLeft = () => GK.some(g => !promiseTaken(g));
function groupPicker(title, promiseMode) {
  return new Promise(res => {
    const c = S.camp;
    const m = modal(`<div class="m-icon">${promiseMode ? '🤝' : '🎤'}</div><h2>${title}</h2>
      ${promiseMode ? '<p class="m-body">A promise gives a big boost now. If you win, pass the matching law before the next election — or voters will punish you.</p>' : ''}
      <div class="choices">${GK.map(g => `<button class="choice" data-g="${g}" ${promiseMode && promiseTaken(g) ? 'disabled' : ''}>
        <b>${GROUPS[g].icon} ${GROUPS[g].name}${promiseMode ? ` — “${PROMISES[g].text}”` : ''}</b>
        <span class="fx">${promiseMode && promiseTaken(g) ? 'Already promised' : `You ${fmt(c.symP[g])} vs rival ${fmt(c.symO[g])}`}</span></button>`).join('')}</div>
      <button class="btn ghost" id="pk-x">Cancel</button>`);
    m.querySelectorAll('.choice').forEach(b => b.onclick = () => { closeModal(); res(b.dataset.g); });
    $('#pk-x', m).onclick = () => { closeModal(); res(null); };
  });
}

// ---------- campaign ----------
function appeal(sym, rb, r) { return GK.reduce((s, g) => s + r.mix[g] * sym[g], 0) + (rb[r.id] || 0); }
function poll(r) {
  const c = S.camp;
  const a = appeal(c.symP, c.rbP, r), b = appeal(c.symO, c.rbO, r);
  const share = 1 / (1 + Math.exp(-(a - b) / 14));
  const u = Math.max(4, 26 - (c.week - 1) * (22 / c.weeks));
  return { share, p: share * (100 - u), o: (1 - share) * (100 - u), u };
}
// diminishing returns: hard to push a region you already dominate
function boost(rb, r, amt, mine) { const sh = poll(r).share, lead = mine ? sh - .5 : .5 - sh; rb[r.id] += amt * Math.max(.2, 1 - Math.max(0, lead) * 2); }
function nationalPoll() {
  let p = 0, o = 0, u = 0, evP = 0, evO = 0;
  REGIONS.forEach(r => { const x = poll(r); p += x.p * r.pop / 100; o += x.o * r.pop / 100; u += x.u * r.pop / 100; if (x.share >= .5) evP += r.pop; else evO += r.pop; });
  return { p, o, u, evP, evO };
}

function newGame() {
  const su = UI.setup;
  applyCountry(su.countryId);
  S = {
    v: 2, phase: 'campaign', countryId: COUNTRY.id, flag: COUNTRY.flag,
    country: COUNTRY.fictional ? (su.country.trim() || 'Republic of Veloria') : COUNTRY.name,
    scale: COUNTRY.gdp / 100, pop: COUNTRY.pop, termTurns: COUNTRY.termYears * 2, maxTerms: COUNTRY.termLimit || 3,
    player: { name: su.name.trim() || 'Alex Morgan', party: su.party, look: { ...su.look }, qual: su.qual || 'teacher' },
    opp: { name: pick(oppNames()), party: pick(PARTIES.filter(p => p.id !== su.party)).id, look: randomLook() },
    term: 0, turn: 0, served: 0, promises: [], laws: [], news: [], hist: [], built: 0,
    buildings: startBuildingsFor(COUNTRY),
  };
  if (UI.pendingOnline) { S.online = UI.pendingOnline; UI.pendingOnline = null; }
  news(`${S.player.name} announces run for ${ROLE.title.toLowerCase()} of ${S.country}`);
  startCampaign(false);
  Qual.apply();
  say(`My fellow citizens of ${S.country} — I'm running for ${ROLE.title.toLowerCase()}!`);
  save(); render();
}

function startCampaign(re) {
  const pp = partyById(S.player.party), op = partyById(S.opp.party);
  const c = { re, week: 1, weeks: re ? 5 : 8, debateWeek: re ? 3 : 5, ap: 3,
    funds: re ? Math.round(25 + approval() / 2) : 30, symP: {}, symO: {}, rbP: {}, rbO: {}, newPromises: [], usedEvents: [], oppAt: null };
  GK.forEach(g => {
    if (!re) { c.symP[g] = 50 + pp.bias[g]; c.symO[g] = 52 + op.bias[g]; }
    else { c.symP[g] = clamp(10 + S.ga[g] * 0.8); c.symO[g] = 50 + op.bias[g] + (50 - S.ga[g]) * 0.3; }
  });
  REGIONS.forEach(r => { c.rbP[r.id] = re ? 1 + S.regionMods[r.id] * .5 : 0; c.rbO[r.id] = 0; });
  if (re) {
    S.promises.filter(p => !S.laws.includes(PROMISES[p.g].law)).forEach(p => {
      c.symP[p.g] -= 12; p.broken = true;
      news(`${GROUPS[p.g].name} furious: “${PROMISES[p.g].text}” promise broken`);
    });
    Manifesto.breakUnkept(c);
  }
  const used = [S.player.name, S.opp.name];
  c.minor = PARTIES.filter(p => p.id !== S.player.party && p.id !== S.opp.party).map(p => { const name = pick(oppNames().filter(n => !used.includes(n))); used.push(name); return { name, party: p.id, look: randomLook() }; });
  S.camp = c; S.phase = 'campaign'; UI.screen = 'campaign'; UI.walkFrom = null;
  c.raised = c.funds; c.spent = 0;
  setTimeout(() => { if (S && S.camp === c && UI.screen === 'campaign') RealCamp.intro(); }, 500);
}

async function campAction(id) {
  const c = S.camp, A = CAMP_ACTIONS[id];
  if (UI.busy) return;
  if (c.ap <= 0) return toast('No actions left — end the week.', 'bad');
  if (c.funds < A.cost) return toast('Not enough funds. Try a fundraiser.', 'bad');
  const before = nationalPoll().p, r = reg(UI.region);
  if (S.online) Online.pushLive({ region: UI.region, act: A.name.replace(/^(Make a|Hold a|Run an?|Give a) /i, '') });
  let g = null;
  if (A.group) { g = await groupPicker(id === 'promise' ? 'Make a promise to…' : 'Hold a town hall with…', id === 'promise'); if (!g) return; }
  switch (id) {
    case 'rally': boost(c.rbP, r, rnd(3.5, 5), true); say(pick(RALLY_LINES).replace('{r}', r.short)); news(`${S.player.name} draws huge crowd in ${r.name}`); break;
    case 'door': boost(c.rbP, r, rnd(1.5, 2.5), true); say(`Hi! I'm ${S.player.name.split(' ')[0]} — can I count on your vote?`); break;
    case 'townhall': c.symP[g] += rnd(2.5, 4); say(pick(SPEECH_LINES[g])); news(`${S.player.name} holds town hall with ${GROUPS[g].name.toLowerCase()}`); break;
    case 'tv': REGIONS.forEach(x => boost(c.rbP, x, 1.6, true)); say('Our new ad is on every channel tonight!'); news(`New ${S.player.name} TV ad airs nationwide`); break;
    case 'attack':
      GK.forEach(k => c.symO[k] -= 2.2);
      if (Math.random() < .3) { GK.forEach(k => c.symP[k] -= 1.5); news(`Backlash! Voters call ${S.player.name}'s attack ad “too negative”`); toast('The attack ad backfired!', 'bad'); }
      else news(`Attack ad on ${S.opp.name} hits hard`);
      say(`${S.opp.name} has no plan for this country!`); break;
    case 'fund': c.funds += 12; RealCamp.raise(12); c.symP.business += 1; c.symP.workers -= 1; say('Thank you all for your generous support!'); break;
    case 'promise': c.symP[g] += 6; c.newPromises.push(g); say(`I promise: ${PROMISES[g].text.toLowerCase()}!`); news(`${S.player.name} promises to ${PROMISES[g].text.toLowerCase()}`); break;
  }
  c.ap--; c.funds -= A.cost; RealCamp.spend(A.cost);
  const d = nationalPoll().p - before;
  if (Math.abs(d) >= 0.05) toast(`National poll ${sign(d)}%`, d >= 0 ? 'good' : 'bad');
  save(); render();
  City.event(id, { g, text: g ? PROMISES[g].text.toLowerCase() : '' });
  scrollToCity();
}

function applyCampFx(fx) {
  const c = S.camp;
  if (fx.p) for (const g in fx.p) c.symP[g] += fx.p[g];
  if (fx.o) for (const g in fx.o) c.symO[g] += fx.o[g];
  if (fx.pAll) GK.forEach(g => c.symP[g] += fx.pAll);
  if (fx.oAll) GK.forEach(g => c.symO[g] += fx.oAll);
  if (fx.funds) c.funds = Math.max(0, c.funds + fx.funds);
  if (fx.rb) for (const r in fx.rb) c.rbP[r] += fx.rb[r];
  if (fx.risk && Math.random() < fx.risk.chance) { applyCampFx(fx.risk.fx); news(fx.risk.news); toast(fx.risk.news, 'bad'); }
}

function opponentTurn() {
  const c = S.camp, moves = [];
  for (let i = 0; i < 3; i++) {
    const x = Math.random();
    if (x < .55) {
      const r = [...REGIONS].sort((a, b) => Math.abs(poll(a).share - .5) / a.pop - Math.abs(poll(b).share - .5) / b.pop)[0];
      boost(c.rbO, r, rnd(3, 4.2), false); c.oppAt = r.id; moves.push(`rallies in ${r.name}`);
    } else if (x < .85) {
      const g = [...GK].sort((a, b) => (c.symP[b] - c.symO[b]) - (c.symP[a] - c.symO[a]))[0];
      c.symO[g] += rnd(2, 3); moves.push(`courts ${GROUPS[g].name.toLowerCase()}`);
    } else { GK.forEach(g => c.symP[g] -= 1); moves.push('runs attack ads against you'); }
  }
  news(`${S.opp.name} ${[...new Set(moves)].join(', ')}`);
}

async function debate() {
  const c = S.camp;
  if (!c.minor) startCampaignMinors(c);
  const cast = [{ ...c.minor[0], role: 'minor' }, { ...S.player, role: 'player' }, { ...S.opp, role: 'opp' }, { ...c.minor[1], role: 'minor' }];
  Debate.open({ cast, country: S.country, race: `${ROLE.race} election` });
  const { PLAYER, OPP, MOD } = Debate;
  Debate.panel('<div class="dwait">Click the stage to skip ▶</div>');
  await Debate.say(MOD, `Good evening and welcome to the ${ROLE.race.toLowerCase()} election debate of ${S.country}!`, 2800);
  for (const i of [0, 1, 2, 3]) {
    const who = cast[i];
    await Debate.say(i, i === PLAYER ? `Good evening, ${S.country}! I'm ${who.name}.` : `Good evening. I'm ${who.name} of the ${partyById(who.party).name}.`, 1700);
    Debate.react(i === PLAYER ? 1 : 0);
  }
  const qs = debateQuestions(3);
  for (const [i, q] of qs.entries()) {
    await Debate.say(MOD, `Question ${i + 1}: ${q.q.replace(/"/g, '')}`, 2600);
    const k = await Debate.ask(`Question ${i + 1} of 3: ${q.q}`, q.a, a => fxChips(a.fx, 'camp'));
    applyCampFx(q.a[k].fx);
    const gain = Object.values(q.a[k].fx.p || {}).reduce((x, y) => x + y, 0);
    await Debate.say(PLAYER, q.a[k].t + '!', 2400);
    Debate.react(gain * 2.2 + rnd(-2, 3));
    await Debate.say(OPP, pick(DEBATE_LINES[S.opp.party]), 2200);
    Debate.react(-rnd(1, 5));
    if (Math.random() < .6) { const mi = pick([0, 3]); await Debate.say(mi, pick(DEBATE_LINES[cast[mi].party]), 1700); }
  }
  await Debate.say(MOD, 'Thank you all! And the audience has spoken...', 2200);
  const score = Debate.meter() + rnd(-6, 6), won = score > 50;
  const margin = Math.round(clamp(won ? Math.max(51, score) : Math.max(51, 100 - score), 51, 90));
  Debate.finish(won ? PLAYER : OPP);
  GK.forEach(g => won ? c.symP[g] += 2 : c.symO[g] += 2);
  news(won ? `${S.player.name} wins the debate, polls say` : `${S.opp.name} edges the TV debate`);
  say(won ? 'That went well! Let\'s keep the momentum.' : 'Not my best night. Back to work.');
  if (won) Confetti.burst(200);
  await new Promise(res => {
    Debate.panel(`<div class="dresult ${won ? 'good' : 'bad'}">${won ? '🏆 You won the debate!' : `😬 ${esc(S.opp.name)} won the debate`}</div>
      <p class="center muted">Instant poll: <b>${margin}%</b> of viewers think ${won ? 'you' : esc(S.opp.name)} won.</p>
      <div class="center"><button class="btn primary big" id="deb-ok">Continue campaign →</button></div>`);
    $('#deb-ok').onclick = res;
  });
  Debate.close();
}
function startCampaignMinors(c) {
  const used = [S.player.name, S.opp.name];
  c.minor = PARTIES.filter(p => p.id !== S.player.party && p.id !== S.opp.party).map(p => { const name = pick(oppNames().filter(n => !used.includes(n))); used.push(name); return { name, party: p.id, look: randomLook() }; });
}

async function campEvent() {
  const c = S.camp;
  const pool = CAMP_EVENTS.filter(e => !c.usedEvents.includes(e.id));
  if (!pool.length) return;
  const ev = pick(pool); c.usedEvents.push(ev.id);
  const k = await choiceModal({ ...ev, mode: 'camp' });
  applyCampFx(ev.choices[k].fx);
}

async function endWeek() {
  if (UI.busy) return; UI.busy = true;
  try {
    const c = S.camp;
    opponentTurn(); render();
    if (c.week === c.debateWeek) await debate();
    else if (!c.re && !c.donorDone && c.week >= 3 && Math.random() < .6) await RealCamp.bigDonor();
    else if (Math.random() < .55) await campEvent();
    RealCamp.poll();
    c.week++; c.ap = 3; c.funds += 3; RealCamp.raise(3);
    if (c.week > c.weeks) { c.week = c.weeks; save(); await RealCamp.electionDay(); electionNight(); return; }
    save(); render();
  } finally { UI.busy = false; }
}

// ---------- election ----------
function electionNight() {
  const res = REGIONS.map(r => {
    const share = Math.min(.97, Math.max(.03, poll(r).share + rnd(-.035, .035)));
    const v = r.pop * 52000 * rnd(.56, .78);
    return { id: r.id, share, pv: Math.round(v * share), ov: Math.round(v * (1 - share)) };
  });
  S.elec = { res, order: shuffle(res.map(x => x.id)), re: S.camp.re, round: S.camp.runoff ? 2 : 1, minorShare: RealCamp.two() && !S.camp.runoff ? clamp(nationalPoll().u * .5 + rnd(6, 13), 5, 24) : 0 };
  S.phase = 'election'; UI.screen = 'election'; UI.revealed = 0;
  news('Polls are closed. The counting begins!');
  save(); render();
  const step = () => { if (UI.screen !== 'election') return; UI.revealed++; render(); Sound.play('drum'); if (UI.revealed < S.elec.order.length) setTimeout(step, 1200); else if (electionTotals().win && !electionTotals().runoff) Confetti.burst(260); else if (!electionTotals().win && !electionTotals().runoff) setTimeout(() => Sound.play('lose'), 300); };
  setTimeout(step, 1000);
}
function electionTotals(n = S.elec.order.length) {
  let evP = 0, evO = 0, pv = 0, ov = 0;
  S.elec.order.slice(0, n).forEach(id => { const x = S.elec.res.find(y => y.id === id); if (x.share >= .5) evP += reg(id).pop; else evO += reg(id).pop; pv += x.pv; ov += x.ov; });
  if (RealCamp.two()) {            // two-round system: the national vote decides, 50% + 1 of valid votes
    const share = pv / Math.max(1, pv + ov);
    if (S.elec.round === 2) return { evP, evO, pv, ov, win: share > .5, p1: share * 100, o1: (1 - share) * 100 };
    const fr = RealCamp.firstRound({ pv, ov });
    return { evP, evO, pv, ov, win: fr.p > 50, runoff: fr.p <= 50 && fr.o <= 50, p1: fr.p, o1: fr.o, m: fr.m };
  }
  return { evP, evO, pv, ov, win: evP > evO || (evP === evO && pv > ov) };
}

// ---------- parliament ----------
function makeParliament(pv) {
  const n = COUNTRY.seats || 100;
  const me = S.player.party, opp = S.opp.party, others = PARTIES.map(p => p.id).filter(id => id !== me && id !== opp);
  const sh = { [me]: pv * .82, [opp]: (100 - pv) * .82 };
  const rest = 100 - sh[me] - sh[opp], k = rnd(.35, .65);
  sh[others[0]] = rest * k; sh[others[1]] = rest * (1 - k);
  const seats = {}, rems = []; let tot = 0;
  for (const id in sh) { const v = sh[id] * n / 100; seats[id] = Math.floor(v); tot += seats[id]; rems.push([id, v - seats[id]]); }
  rems.sort((a, b) => b[1] - a[1]);
  for (let i = 0; tot < n; i++, tot++) seats[rems[i % rems.length][0]]++;
  const dist = id => GK.reduce((s, g) => s + Math.abs(partyById(me).bias[g] - partyById(id).bias[g]), 0) / 5;
  const rel = {}; PARTIES.forEach(p => rel[p.id] = p.id === me ? 100 : clamp(55 - dist(p.id) * 1.2 - (p.id === opp ? 12 : 0)));
  const old = S.parl ? S.parl.coalition.filter(id => id !== me && seats[id]) : [];
  return { seats, coalition: [me, ...old], rel, size: n };
}
const coalitionSeats = () => S.parl.coalition.reduce((s, id) => s + (S.parl.seats[id] || 0), 0);
function lean(L, pid) { const b = partyById(pid).bias; return clamp(GK.reduce((s, g) => s + (L.g[g] || 0) * b[g], 0) / 120, -1, 1); }
function voteProb(L, pid) {
  const me = S.player.party, ln = lean(L, pid), ease = (L.ease || 0) / 100;
  let p;
  if (pid === me) p = .94;
  else if (S.parl.coalition.includes(pid)) p = .74 + ln * .25;
  else p = .2 + ln * .45 + (approval() - 50) / 150 + (S.parl.rel[pid] - 50) / 250;
  return Math.min(.98, Math.max(.02, p + ease));
}
const expectedYes = L => Math.round(PARTIES.reduce((s, p) => s + (S.parl.seats[p.id] || 0) * voteProb(L, p.id), 0));
function castVotes(probFn) {
  const out = [];
  PARTIES.forEach(p => { const pr = probFn(p.id); for (let i = 0; i < (S.parl.seats[p.id] || 0); i++) out.push({ party: p.id, yes: Math.random() < pr }); });
  return out;
}
async function inviteCoalition(pid) {
  if (UI.busy || S.pc < 3 || S.parl.coalition.includes(pid)) return;
  S.pc -= 3;
  const p = partyById(pid);
  if (Math.random() * 100 < S.parl.rel[pid] + 10) {
    S.parl.coalition.push(pid); S.parl.rel[pid] = clamp(S.parl.rel[pid] + 10); Cabinet.giveTo(pid);
    news(`${p.name} joins the government coalition`); toast(`${p.name} joined your coalition!`, 'good'); say('Together we have a majority!');
  } else {
    S.parl.rel[pid] = clamp(S.parl.rel[pid] - 5);
    news(`${p.name} rejects coalition offer`); toast(`${p.name} said no. Improve relations first.`, 'bad');
  }
  save(); render();
}
function leaveCoalition(pid) {
  S.parl.coalition = S.parl.coalition.filter(id => id !== pid); S.parl.rel[pid] = clamp(S.parl.rel[pid] - 15);
  news(`${partyById(pid).name} leaves the coalition`); save(); render();
}

async function afterElection() {
  const t = electionTotals(), re = S.elec.re;
  if (t.runoff && !(S.online && !re)) return RealCamp.runoff();
  const aud = RealCamp.audit(); if (aud) setTimeout(() => toast('⚖️ ' + aud, 'bad'), 1500);
  S.lastElection = { evP: t.evP, evO: t.evO, pvShare: t.pv / (t.pv + t.ov) * 100 };
  if (S.online && !re) {               // online game: the best vote share among players wins
    if (!S.online.result) return Online.reportResult(t);
    t.win = S.online.result === 'won';
    if (!t.win) return Online.becomeMember();
  }
  if (!t.win) return gameOver(re ? 'lost-re' : 'lost-first');
  const newP = S.camp.newPromises;
  if (!re) {
    S.term = 1; S.turn = 1;
    S.stats = COUNTRY.stats ? { ...COUNTRY.stats } : { economy: 52, health: 48, education: 46, security: 50, environment: 52, freedom: 58, housing: 45 };
    SK.forEach(k => S.stats[k] = clamp(S.stats[k] + rnd(-4, 4)));
    S.ga = {}; GK.forEach(g => S.ga[g] = clamp(S.camp.symP[g] + 4));
    S.eventMods = zero(GK); S.lawMods = zero(GK); S.lawStat = zero(SK); S.lawCost = 0;
    S.gdp = 100; S.debt = COUNTRY.debt; S.rate = COUNTRY.rate || .015; S.pc = 3; S.deck = shuffle(Local.deckIds()); S.localDeck = 1;
    S.debtSoft = Math.max(80, COUNTRY.debt + 10); S.crisisAt = Math.max(120, COUNTRY.debt + 35);
    S.mil = { ...(COUNTRY.mil || { army: 30, air: 20, navy: 20 }), alliance: false };
    const milUp = (S.mil.army + S.mil.air + S.mil.navy) * .012;
    S.budget = { tax: Math.round(clamp(2 * (12.5 + milUp + S.debt * S.rate) - 1, 10, 48)), health: 5, education: 5, security: 5, infra: 5, welfare: 5 };
    initGovExtras();
    World.init(); Cabinet.ensure();
    S.hist = [approval()];
  } else {
    S.term++; S.turn = (S.term - 1) * TT() + 1; S.pc += 2;
    GK.forEach(g => S.ga[g] = clamp(S.ga[g] + 3));
  }
  S.parl = makeParliament(S.lastElection.pvShare);
  S.promises.push(...newP.map(g => ({ g, term: S.term })));
  Manifesto.takeOffice();
  delete S.camp; delete S.elec;
  S.phase = 'govern'; S.lawThisTurn = false; S.diploThisTurn = false; S.pendingEvent = true;
  S.statsPrev = { ...S.stats }; S.gaPrev = { ...S.ga };
  UI.screen = 'govern'; UI.tab = 'build'; UI.walkFrom = null;
  news(`${S.player.name} sworn in as ${ROLE.title.toLowerCase()}${re ? ` for term ${S.term}` : ''}`);
  news(`New parliament: your ${partyById(S.player.party).name} wins ${S.parl.seats[S.player.party]} of 100 seats`);
  say(re ? 'Four more years! Let\'s finish what we started.' : `Thank you, ${S.country}. Let's get to work!`);
  save(); render();
  const mine = S.parl.seats[S.player.party], cs = coalitionSeats();
  await infoModal('🎉', re ? 'Re-elected!' : `You are the ${ROLE.title}!`,
    (re ? `<p>The people have given you term ${S.term}.${S.term >= MAXT() ? ' It\'s your last — make it count for your legacy.' : ''}</p>`
       : `<p>Welcome, ${ROLE.title} ${esc(S.player.name)}!</p>
          ${COUNTRY.fictional ? '' : `<p class="muted small">${myFlag()} ${esc(S.country)}: ${S.pop < 1 ? Math.round(S.pop * 1000).toLocaleString('en') + 'k' : fmt(S.pop, 1) + 'M'} people · GDP ${bigMoney(COUNTRY.gdp)} · debt ${fmt(COUNTRY.debt)}% of GDP · ${COUNTRY.termYears}-year terms${COUNTRY.termLimit ? `, max ${COUNTRY.termLimit}` : ''} · ${COUNTRY.parl}: ${COUNTRY.seats} seats. ${COUNTRY.note}</p>`}
          <ul class="tips"><li>🏗️ <b>Build</b>: tap a region, open a tender and award the project to a company.</li>
          <li>🏘️ <b>Housing</b>: sell new homes to citizens — choose affordable, market or luxury prices.</li>
          <li>🏛️ <b>Parliament</b>: you need ${majority()} of ${S.parl.size} votes to pass laws. Form a coalition if you lack a majority.</li>
          <li>🛡️ <b>Defense</b>: keep your military stronger than the ${NEIGHBOR}'s threat.</li>
          <li>💰 <b>Budget</b>: taxes and spending — watch the debt.</li>
          <li>🤝 Keep your campaign promises before the next election!</li></ul>`)
    + `<p class="advisor">🏛️ Parliament: your party has <b>${mine}</b> seats${cs !== mine ? `, your coalition <b>${cs}</b>` : ''}. ${cs >= majority() ? 'You have a majority.' : 'No majority — consider inviting a partner into a coalition.'}</p>`, 'Start governing');
  await turnStart();
}

function initGovExtras() {
  if (!S.stats.housing) S.stats.housing = 45;
  if (S.lawStat.housing === undefined) S.lawStat.housing = 0;
  if (!S.buildings) S.buildings = JSON.parse(JSON.stringify(START_BUILDINGS));
  if (!S.projects) S.projects = [];
  if (!S.companies) S.companies = Object.fromEntries(COMPANIES.map(c => [c.id, 50]));
  if (!S.housing) S.housing = { stock: zero(RK), price: 'market', sold: 0, lastSold: 0, lastRev: 0 };
  if (!S.regionMods) S.regionMods = zero(RK);
  if (!S.mil) S.mil = { army: 30, air: 20, navy: 20, alliance: false };
  if (S.threat === undefined) S.threat = COUNTRY.threat || 35;
  if (S.rep === undefined) S.rep = 50;
  if (!S.pop) S.pop = 24;
  if (!S.scandalRisk) S.scandalRisk = 0;
  if (!S.built) S.built = 0;
  if (!S.parl) S.parl = makeParliament(S.lastElection ? S.lastElection.pvShare : 52);
}

// ---------- projects & companies ----------
const MAX_PROJECTS = 4;
function buildBlock(type, rid) {
  const P = PROJECTS[type];
  if (type === 'port' && !reg(rid).coast) return COUNTRY.landlocked ? 'Landlocked country — no sea' : 'No coastline in this region';
  const n = S.buildings[rid].filter(b => b === type).length + S.projects.filter(p => p.type === type && p.region === rid).length;
  if (n >= P.max) return `Limit: ${P.max} per region`;
  if (S.projects.length >= MAX_PROJECTS) return `Max ${MAX_PROJECTS} projects at once`;
  return '';
}
function startTender(type) { return Procure.run(type); }
function progressProjects() {
  const msgs = [];
  S.projects.forEach(p => {
    const P = PROJECTS[p.type], c = comp(p.company), r = reg(p.region);
    if (p.paid === undefined) p.paid = 1;   // old saves were paid up front
    if (Math.random() < (100 - p.q) / 260) {
      p.delays++; S.companies[c.id] = clamp(S.companies[c.id] - 4);
      const ld = Math.round(p.price * .02 * 100) / 100; S.debt -= ld;
      msgs.push(`🚧 ${P.name} in ${r.short} delayed by ${c.name} — liquidated damages of ${money(ld)} deducted`);
      if (Math.random() < (100 - p.q) / 300) { const extra = Math.round(p.price * 2) / 10; S.debt += extra; p.price += extra; msgs.push(`💸 Cost overrun on ${P.name}: +${money(extra)}`); }
    } else {
      p.turnsLeft--;
      if (p.paid < 1) { const part = Math.min(1 - p.paid, .85 / p.total); S.debt += p.price * part; p.paid += part; }
    }
    if (p.turnsLeft <= 0) {
      (S.justOpened = S.justOpened || []).push({ type: p.type, region: p.region, company: p.company });
      p.done = true; S.buildings[p.region].push(p.type); S.built++;
      if (P.fx.s) for (const k in P.fx.s) S.lawStat[k] += P.fx.s[k];
      if (P.fx.g) for (const g in P.fx.g) { S.lawMods[g] += P.fx.g[g]; S.ga[g] = clamp(S.ga[g] + P.fx.g[g]); }
      S.regionMods[p.region] += 4;
      if (p.type === 'housing') S.housing.stock[p.region] += P.units;
      S.companies[c.id] = clamp(S.companies[c.id] + (p.delays ? 1 : 6));
      msgs.push(`✅ ${P.icon} ${P.name} opened in ${r.name}!`);
      news(`${ROLE.title} opens new ${P.name.toLowerCase()} in ${r.name}`);
      if (p.q < 55 && Math.random() < .35) {
        GK.forEach(g => S.ga[g] = clamp(S.ga[g] - 3)); S.regionMods[p.region] -= 5; S.companies[c.id] = clamp(S.companies[c.id] - 12);
        msgs.push(`⚠️ Defects found in the new ${P.name.toLowerCase()} built by ${c.name}!`);
        news(`Scandal: cracks found in new ${P.name.toLowerCase()} in ${r.name}`);
      }
    }
  });
  S.projects = S.projects.filter(p => !p.done);
  return msgs;
}

// ---------- housing ----------
function sellHomes() {
  const h = S.housing, P = HOUSE_PRICES[h.price];
  let sold = 0;
  REGIONS.forEach(r => {
    const stock = h.stock[r.id]; if (!stock) return;
    const demand = Math.round(r.pop * 45 * P.demand * (.6 + S.stats.economy / 125) * rnd(.8, 1.2));
    const s = Math.min(stock, demand);
    h.stock[r.id] -= s; sold += s;
    S.regionMods[r.id] += s / 1000 * (h.price === 'affordable' ? 1.5 : .7);
  });
  const k = sold / 1000, rev = k * P.price;
  S.debt -= rev; h.sold += sold; h.lastSold = sold; h.lastRev = rev;
  S.lawStat.housing += k * (h.price === 'affordable' ? 3 : h.price === 'market' ? 2 : 1.2);
  if (h.price === 'affordable') { S.eventMods.workers += k * 1.2; S.eventMods.youth += k * 1.2; }
  if (h.price === 'luxury') { S.eventMods.business += k * .8; S.eventMods.workers -= k * .6; }
  return { sold, rev };
}

// ---------- defense ----------
function upgradeMil(b) {
  const U = MIL_UPGRADES[b];
  if (UI.busy || S.pendingEvent || S.mil[b] >= 100 || (b === 'navy' && COUNTRY.landlocked)) return;
  S.mil[b] = Math.min(100, S.mil[b] + 8); S.debt += U.cost;
  S.eventMods.elderly += .5;
  say(`Our ${U.name.toLowerCase()} grows stronger.`); toast(`${U.name} +8 (−${money(U.cost)})`, 'good');
  save(); render();
}
function diplomacy() {
  if (S.pc < 2 || S.diploThisTurn || S.pendingEvent) return;
  S.pc -= 2; S.diploThisTurn = true; S.threat = clamp(S.threat - 12, 5, 100);
  news(`Peace summit with the ${NEIGHBOR} eases tensions`); say('Dialogue is our strongest weapon.');
  save(); render();
}
function toggleAlliance() {
  if (S.pendingEvent) return;
  if (S.mil.alliance) { S.mil.alliance = false; news('Country leaves the defense alliance'); }
  else { if (S.pc < 4) return; S.pc -= 4; S.mil.alliance = true; S.threat = clamp(S.threat - 8, 5, 100); news('Country joins the Northern Defense Alliance'); say('Our allies have our back.'); }
  save(); render();
}
async function invasion() {
  const str = milStrength();
  const choices = [
    { t: '⚔️ Defend the country', fx: {}, note: `Your strength ${fmt(str)} vs their ${fmt(S.threat)} — about ${fmt(clamp(str / (str + S.threat) * 100 + 5, 5, 95))}% chance to win` },
    { t: '🕊️ Sign a peace treaty', fx: {}, note: `Pay ${money(5)} and lose some pride (everyone ▼)` },
  ];
  if (S.mil.alliance) choices.push({ t: '🤝 Call on our allies', fx: {}, note: 'Allies send troops. High chance to win, costs ⭐2' });
  const k = await choiceModal({ icon: '🚨', title: 'INVASION!', text: `Troops of the ${NEIGHBOR} have crossed the border into ${reg('high').name}!`, choices });
  if (k === 1) {
    S.debt += 5; GK.forEach(g => S.ga[g] = clamp(S.ga[g] - 4)); S.threat = clamp(S.threat - 20, 5, 100);
    news(`Peace treaty signed with the ${NEIGHBOR}`);
    return infoModal('🕊️', 'Peace at a price', '<p>The invaders withdraw after you sign the treaty. Many call it a humiliation, but nobody died.</p>');
  }
  const chance = k === 2 ? .85 : clamp(str / (str + S.threat) + .05, .05, .95);
  if (k === 2) S.pc = Math.max(0, S.pc - 2);
  const won = Math.random() < chance;
  S.mil.army = Math.max(0, S.mil.army - (won ? 8 : 15)); S.mil.air = Math.max(0, S.mil.air - 5);
  if (won) {
    GK.forEach(g => { S.ga[g] = clamp(S.ga[g] + 6); S.eventMods[g] += 3; }); S.stats.security = clamp(S.stats.security + 5); S.threat = clamp(S.threat - 30, 5, 100);
    news(`VICTORY! ${S.country} repels the ${NEIGHBOR} invasion`); say('We defended our homeland!');
    return infoModal('🏆', 'Victory!', '<p>Your forces push the invaders back across the border. The nation rallies behind you.</p>');
  }
  S.gdp *= .94; GK.forEach(g => S.ga[g] = clamp(S.ga[g] - 10)); S.regionMods.high -= 10; S.threat = clamp(S.threat - 15, 5, 100);
  const lost = S.buildings.high.length ? S.buildings.high.splice(Math.floor(Math.random() * S.buildings.high.length), 1)[0] : null;
  news(`Defeat: ${S.country} forced into ceasefire after losing battle`); say('A dark day for our nation.');
  return infoModal('💥', 'Defeat', `<p>The army is beaten back. The economy shrinks 6%${lost ? ` and the ${PROJECTS[lost].name.toLowerCase()} in the Highlands was destroyed` : ''}. A ceasefire is signed.</p>`);
}

// ---------- governing ----------
function budgetCalc() {
  const b = S.budget;
  const rev = S.gdp * b.tax / 200;
  const spend = (b.health + b.education + b.security + b.infra + b.welfare) * S.gdp * 0.005;
  const laws = S.lawCost * S.gdp / 100;
  const mil = (S.mil.army + S.mil.air + S.mil.navy) * .012 + (S.mil.alliance ? .5 : 0);
  const interest = Math.max(0, S.debt) * (S.rate || 0.015);
  return { rev, spend, laws, mil, interest, bal: rev - spend - laws - mil - interest };
}
function groupTarget(g) {
  const s = S.stats, b = S.budget, d = k => s[k] - 50, bias = partyById(S.player.party).bias[g] * 0.5;
  let t = 50 + bias;
  switch (g) {
    case 'workers': t += .3 * d('economy') + .15 * d('health') + .1 * d('housing') + .05 * d('security') + (b.welfare - 5) * 2 - (b.tax - 25) * .25 - (unemployment() - 8) * 1.2; break;
    case 'business': t += .6 * d('economy') + .1 * d('security') - (b.tax - 25) * 1.0 - Math.max(0, debtPct() - (S.debtSoft || 80) - 10) * .2; break;
    case 'farmers': t += .3 * d('economy') + .2 * d('environment') + .1 * d('security') + (b.infra - 5) * 1.2; break;
    case 'youth': t += .15 * d('economy') + .25 * d('education') + .25 * d('environment') + .25 * d('freedom') + .25 * d('housing') - Math.max(0, b.security - 6) * 1.5; break;
    case 'elderly': t += .1 * d('economy') + .45 * d('health') + .3 * d('security') + (b.welfare - 5) * 1.5; break;
  }
  t -= Math.max(0, S.threat - milStrength()) * .15; // fear of war
  if (g === 'workers' || g === 'elderly') t -= Math.max(0, (S.infl || 3) - (S.inflTarget || 3) - 2) * .5; // cost of living
  return clamp(t + S.lawMods[g] + S.eventMods[g] - S.served * .6 * 8 / TT()); // voter fatigue
}
function simulateTurn() {
  const b = S.budget, st = S.stats, ls = S.lawStat;
  S.statsPrev = { ...st }; S.gaPrev = { ...S.ga };
  const msgs = progressProjects();
  const hs = sellHomes();
  if (hs.sold) msgs.push(`🏘️ ${hs.sold.toLocaleString()} homes sold to citizens (+${money(hs.rev)})`);
  const en = energy();
  const shortage = Math.max(0, en.demand - en.supply);
  if (shortage > 0) msgs.push(`⚡ Energy shortage! Demand ${fmt(en.demand)} vs supply ${fmt(en.supply)} — build power plants`);
  const T = {
    health: 25 + b.health * 6 + ls.health,
    education: 25 + b.education * 6 + ls.education,
    security: 25 + b.security * 6 + ls.security,
    environment: 72 - b.infra * 2.2 - (st.economy - 50) * .2 + ls.environment,
    economy: 44 + b.infra * 2.2 - (b.tax - 25) * .9 - Math.max(0, debtPct() - (S.debtSoft || 80)) * .35 + (b.welfare - 5) * .5 - shortage * .6 + ls.economy,
    freedom: 68 - Math.max(0, b.security - 5) * 3 + ls.freedom,
    housing: 40 - S.served * 8 / TT() + ls.housing,
  };
  SK.forEach(k => st[k] = clamp(st[k] + (clamp(T[k]) - st[k]) * .3 + rnd(-1.5, 1.5)));
  const growth = (st.economy - 45) / 25 + rnd(-.4, .4) - Math.max(0, (S.infl || 0) - (S.inflTarget || 3) - 4) * .04;
  S.gdp *= 1 + growth / 100;
  S.pop *= 1 + (.25 + (st.health - 50) * .01 + (st.housing - 50) * .01) / 100;
  const bc = budgetCalc();
  S.debt -= bc.bal;
  S.lastGrowth = growth; S.lastBalance = bc.bal;
  // military ages, neighbour grows bolder
  ['army', 'air', 'navy'].forEach(k => S.mil[k] = Math.max(0, S.mil[k] - 1));
  S.threat = clamp(S.threat + rnd(0, 5) - (S.mil.alliance ? 2 : 0), 5, 100);
  GK.forEach(g => { S.ga[g] = clamp(S.ga[g] + (groupTarget(g) - S.ga[g]) * .4); S.eventMods[g] *= .75; });
  RK.forEach(r => S.regionMods[r] *= .9);
  S.pc = Math.min(12, S.pc + 2 + (approval() > 60 ? 1 : 0));
  S.served++;
  S.hist.push(approval());
  news(`Economy ${growth >= 0 ? 'grows' : 'shrinks'} ${Math.abs(growth).toFixed(1)}% · budget ${bc.bal >= 0 ? 'surplus' : 'deficit'} ${money(Math.abs(bc.bal))}`);
  return { growth, bal: bc.bal, msgs };
}
function applyGovFx(fx) {
  if (fx.g) for (const g in fx.g) { S.ga[g] = clamp(S.ga[g] + fx.g[g]); S.eventMods[g] += fx.g[g] * .6; }
  if (fx.all) GK.forEach(g => { S.ga[g] = clamp(S.ga[g] + fx.all); S.eventMods[g] += fx.all * .6; });
  if (fx.s) for (const k in fx.s) S.stats[k] = clamp(S.stats[k] + fx.s[k]);
  if (fx.cost) S.debt += fx.cost;
  if (fx.gdp) S.gdp *= 1 + fx.gdp / 100;
  if (fx.debtMul) S.debt *= fx.debtMul;
  if (fx.pc) S.pc = Math.max(0, S.pc + fx.pc);
  if (fx.threat) S.threat = clamp(S.threat + fx.threat, 5, 100);
  if (fx.air) S.mil.air = Math.min(100, S.mil.air + fx.air);
  if (fx.homes) for (const r in fx.homes) S.housing.stock[r] += fx.homes[r];
  if (fx.scandal) S.scandalRisk += fx.scandal;
}
async function turnStart() {
  if (!S || S.phase !== 'govern' || !S.pendingEvent) return;
  Qual.onGovern();
  await Targets.choose();
  await CabTalk.followUp();
  let ev;
  if (debtPct() > (S.crisisAt || 120) && !(S.crisisTurn && S.turn - S.crisisTurn < 4)) { ev = DEBT_EVENT; S.crisisTurn = S.turn; }
  else {
    if (!S.deck || !S.deck.length) S.deck = shuffle(Local.deckIds());
    const id = S.deck.pop();
    ev = Local.find(id) || pick(Local.events());
  }
  const k = await choiceModal({ ...ev, text: ev.text.replace(/\{NEIGHBOR\}/g, NEIGHBOR), mode: 'gov' });
  const before = Impact.snap();
  applyGovFx(ev.choices[k].fx); news(ev.choices[k].news || ev.title);
  S.pendingEvent = false; save(); render();
  Impact.show(`${ev.title}: ${ev.choices[k].t.replace(/<[^>]+>/g, '').slice(0, 60)}`, before, { lesson: 'Events test leaders. Every choice has winners and losers — the art is deciding who must be protected and explaining why.' });
}
function advisorTip() {
  const lowG = [...GK].sort((a, b) => S.ga[a] - S.ga[b])[0];
  const lowS = [...SK].sort((a, b) => S.stats[a] - S.stats[b])[0];
  const pending = S.promises.filter(p => p.term === S.term && !S.laws.includes(PROMISES[p.g].law));
  const en = energy();
  if (pending.length && (S.turn % TT()) >= TT() * .6) return `🧑‍💼 Advisor: the election is coming — you still haven't delivered “${PROMISES[pending[0].g].text}”.`;
  if (S.threat - milStrength() > 10) return `🧑‍💼 Advisor: the ${NEIGHBOR} is getting dangerous. Strengthen the military or hold a peace summit.`;
  if (en.demand > en.supply) return '🧑‍💼 Advisor: we are running out of electricity. Build a power plant or solar farm.';
  if (debtPct() > (S.debtSoft || 80) + 15) return '🧑‍💼 Advisor: debt is dangerously high. Raise taxes, cut spending or sell homes at market price.';
  if (S.ga[lowG] < 40) return `🧑‍💼 Advisor: ${GROUPS[lowG].name} are unhappy (${fmt(S.ga[lowG])}%). A speech or a law for them could help.`;
  if (S.stats[lowS] < 40) return `🧑‍💼 Advisor: ${STATS[lowS].name} is weak (${fmt(S.stats[lowS])}). ${lowS === 'housing' ? 'Build housing estates and sell homes.' : 'Consider more funding or a new project.'}`;
  if (!S.projects.length) return '🧑‍💼 Advisor: no construction going on. A new project would create jobs.';
  return `🧑‍💼 Advisor: steady progress, ${ROLE.title}. Keep it up.`;
}
async function endTurn() {
  if (UI.busy || S.pendingEvent) return; UI.busy = true; S.clk = 0;
  try {
    const a0 = approval(), r = simulateTurn(), a1 = approval();
    r.msgs.push(...Money.step(r), ...TBills.step(), ...Mega.step(), ...Resorts.step(), ...Targets.step(), ...Advisers.step(), ...Oil.step(), ...Presser.checkPromises());
    Concerns.record();
    say(a1 >= a0 ? 'Good news this half-year.' : 'Tough months. We must do better.');
    S.diploThisTurn = false;
    render();
    const w = World.step(r);
    if (w.ev) S.lastWorld = w.ev.head;
    render();
    await Paper.show(r, a0, approval(), w);
    await ceremonies();
    await Mega.ceremony();
    if (S.scandalRisk > 0 && Math.random() < .12 * S.scandalRisk) {
      S.scandalRisk = 0; GK.forEach(g => { S.ga[g] = clamp(S.ga[g] - 6); S.eventMods[g] -= 3; }); S.pc = Math.max(0, S.pc - 2);
      news(`BRIBERY SCANDAL: secret gifts to the ${ROLE.title.toLowerCase()} exposed`);
      await infoModal('🕵️', 'Bribery scandal!', '<p>Journalists have uncovered the secret “gifts” you accepted from contractors. Approval drops across the country.</p>');
    }
    const str = milStrength();
    if (S.threat > str + 8 && Math.random() < (S.threat - str) / 50) await invasion();
    const ap = approval();
    if (ap < 25) { const removed = await impeachment(ap); if (removed) return gameOver('impeached'); }
    if (S.turn >= TT() * MAXT()) return gameOver('retired');
    if (S.turn % TT() === 0) {
      S.opp = { name: pick(oppNames().filter(n => n !== S.opp.name)), party: pick(PARTIES.filter(p => p.id !== S.player.party)).id, look: randomLook() };
      await infoModal('🗳️', 'Election season!', `<p>Your term is ending. <b>${esc(S.opp.name)}</b> of the ${partyById(S.opp.party).name} wants your job. Parliament is up for election too.</p><p>Your approval of <b>${fmt(ap)}%</b> sets your starting position. Projects you built help you in those regions. Broken promises will cost you.</p>`, 'Start re-election campaign');
      startCampaign(true); say('Four more years? Let\'s earn it.'); save(); render(); return;
    }
    S.turn++; S.lawThisTurn = false; S.pendingEvent = true; save(); render();
    await turnStart(); scrollToCity();
  } finally { UI.busy = false; }
}
async function impeachment(ap) {
  await infoModal('⚖️', 'Impeachment motion!', `<p>With approval at just <b>${fmt(ap)}%</b>, the opposition calls a vote to remove you. They need <b>${twoThirds()} of ${S.parl.size || 100}</b> votes in parliament.</p>`, 'Watch the vote');
  const me = S.player.party, x = (25 - ap) * .03;
  const seats = castVotes(pid => pid === me ? .03 + x / 3 : S.parl.coalition.includes(pid) ? .1 + x : .62 + x);
  const passed = await voteModal('Impeachment vote', seats, twoThirds(), 'REMOVED FROM OFFICE', 'You survive — barely');
  if (!passed) { news(`${S.player.name} survives impeachment vote`); GK.forEach(g => S.ga[g] = clamp(S.ga[g] + 2)); }
  return passed;
}
function proposeLaw(id) { return Legis.run(id); }
function applyLawPassed(L, k = 1) {
  const before = Impact.snap();
  S.laws.push(L.id);
  for (const g in L.g) { S.lawMods[g] += L.g[g] * k; S.ga[g] = clamp(S.ga[g] + L.g[g] * .5 * k); }
  for (const st in L.s) { S.lawStat[st] += L.s[st] * k; S.stats[st] = clamp(S.stats[st] + L.s[st] * .3 * k); }
  S.lawCost += L.cost * k;
  news(`${(LEGAL[L.id] ? LEGAL[L.id].title.replace(' Bill', ' Act') : L.name)} becomes law${k < 1 ? ' (as amended)' : ''}`); Confetti.burst(90);
  S.parl.coalition.filter(pid => pid !== S.player.party && lean(L, pid) < -.3).forEach(pid => {
    S.parl.coalition = S.parl.coalition.filter(x => x !== pid);
    news(`${partyById(pid).name} quits coalition in protest over ${L.name}`); toast(`${partyById(pid).name} left your coalition!`, 'bad');
  });
  setTimeout(() => Impact.show(`${L.name} becomes law`, before, { fx: { g: L.g, s: L.s }, expected: L.cost ? `Costs about ${fmt(L.cost * k * 2, 1)}% of GDP a year.` : '', lesson: 'Laws change behaviour slowly: their full effect builds up over the following half-years, while the cost starts at once.' }), 600);
  const pg = GK.find(g => PROMISES[g].law === L.id && S.promises.some(p => p.g === g));
  if (pg) { S.ga[pg] = clamp(S.ga[pg] + 5); S.eventMods[pg] += 4; toast(`Promise kept! ${GROUPS[pg].name} are delighted.`, 'good'); say('A promise made is a promise kept!'); }
  else say(`The ${L.name} is now law!`);
}
function speech(g) { return Speech.give(g); }

// ---------- game over & legacy ----------
function legacy(reason) {
  const pc = Manifesto.counts();
  const kept = S.promises.filter(p => S.laws.includes(PROMISES[p.g].law)).length + pc.kept;
  const broken = S.promises.length + (S.pledges || []).length - kept;
  const avgAp = avg(S.hist || []);
  const statsAvg = S.stats ? avg(SK.map(k => S.stats[k])) : 0;
  const dev = S.stats ? devIndex() : 0;
  let score;
  if (reason === 'lost-first') score = Math.round((S.lastElection ? S.lastElection.pvShare : 0) * 10);
  else {
    score = Math.round(avgAp * 8 + statsAvg * 4 + dev * 5 + (S.gdp - 100) * 6 + S.built * 15 + kept * 60 - broken * 40 + S.served * 30 * 8 / TT() - Math.max(0, debtPct() - Math.max(60, (S.debtSoft || 80) - 20)) * 6);
    score += (S.tgDone || 0) * 150;
    if (reason === 'retired') score += 400;
    if (reason === 'impeached') score -= 200;
  }
  let title;
  if (reason === 'lost-first') title = 'The President Who Never Was';
  else if (reason === 'impeached') title = 'Impeached & Disgraced';
  else if (reason === 'lost-re') title = score >= 1200 ? 'One-Term Wonder' : 'Voted Out';
  else title = score >= 2400 ? 'Legendary Statesman' : score >= 1900 ? 'Respected Leader' : score >= 1400 ? 'Steady Hand' : 'Forgettable Leader';
  return { reason, score, title, kept, broken, avgAp, statsAvg, dev, served: S.served, terms: S.term || 0 };
}
function gameOver(reason) {
  S.result = legacy(reason); S.phase = 'over'; UI.screen = 'over';
  const best = store.get(BEST_KEY) || [];
  best.push({ name: S.player.name, country: S.country, party: S.player.party, score: S.result.score, title: S.result.title, terms: S.result.terms, date: new Date().toISOString().slice(0, 10) });
  best.sort((a, b) => b.score - a.score);
  store.set(BEST_KEY, best.slice(0, 10));
  store.del(saveKey());
  render();
}

// ---------- online Hall of Fame (Firebase, optional) ----------
const Cloud = {
  enabled: false, api: null,
  async init() {
    const cfg = window.FIREBASE_CONFIG;
    if (!cfg || !cfg.apiKey) return;
    try { this.api = await import('./firebase.js'); this.api.init(cfg); this.enabled = true; render(); }
    catch (e) { console.warn('Firebase unavailable — playing offline.', e); }
  },
};
async function submitCloud() {
  if (!Cloud.enabled || !S || !S.result || S.result.submitted) return;
  const btn = $('#submitBtn'); if (btn) { btn.disabled = true; btn.textContent = 'Submitting…'; }
  try {
    await Cloud.api.submitScore({ name: S.player.name.slice(0, 24), country: S.country.slice(0, 40), party: S.player.party,
      score: S.result.score, title: S.result.title, terms: S.result.terms, approval: Math.round(S.result.avgAp) });
    S.result.submitted = true; toast('Added to the online Hall of Fame!', 'good');
  } catch (e) { console.error(e); toast('Could not reach the Hall of Fame.', 'bad'); }
  render();
}
async function loadCloud() {
  if (!Cloud.enabled) return;
  UI.cloud = 'loading'; render();
  try { UI.cloud = await Cloud.api.topScores(20); } catch (e) { console.error(e); UI.cloud = 'error'; }
  if (UI.screen === 'hall') render();
}

// ---------- rendering ----------
function chip(icon, text, cls = '') { return `<span class="tchip ${cls}">${icon} ${text}</span>`; }
function renderTop() {
  const t = $('#topstats');
  if (!S || UI.screen === 'title' || UI.screen === 'setup' || UI.screen === 'hall' || UI.screen === 'online') { t.innerHTML = ''; return; }
  if (S.phase === 'campaign' && S.camp) {
    const c = S.camp;
    t.innerHTML = chip('🗓️', `Week ${c.week}/${c.weeks}`) + chip('💵', `$${Math.round(c.funds)}M`) + chip('⚡', `${c.ap} actions`);
  } else if (S.ga && S.phase === 'govern') {
    const a = approval();
    t.innerHTML = chip('🗓️', turnLabel()) + chip('👍', fmt(a) + '%', a < 35 ? 'bad' : a > 55 ? 'good' : '') + chip('🏦', bigMoney(gdpReal())) + chip('📉', `Debt ${fmt(debtPct())}%`, debtPct() > 100 ? 'bad' : '') + chip('💹', `Infl ${fmt(S.infl || 0, 1)}%`, (S.infl || 0) > (S.inflTarget || 3) + 3 ? 'bad' : '') + chip('⭐', `${S.pc} PC`);
  } else t.innerHTML = '';
}
function renderTicker() {
  const el = $('#tickerText');
  const items = S && S.news.length ? S.news.slice(0, 8) : ['Welcome to PRESIDENT: Rise to Power', 'Campaign. Win. Govern. Build your country.'];
  el.innerHTML = items.map(n => `<span>${esc(n)}</span>`).join('<i>◆</i>');
}

// Real-geography layer for archipelagos (Maldives): reef rings at true lat/long, Thaana atoll codes, cities, Equator
function atollLayer() {
  const G = COUNTRY.geo, eq = G([0, 73])[1];
  const rings = COUNTRY.atolls.map(([code, name, cap, lat, lon, rid, rx, ry, th, trad]) => {
    const [x, y] = G([lat, lon]), left = (x < 215 || code === 'K') && code !== 'S';
    return `<g class="atoll"><title>${name} Atoll (${th}) — ${trad}\nCapital island: ${cap}</title>
      <ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" class="reef"/><ellipse cx="${x}" cy="${y}" rx="${Math.max(1, rx - 3)}" ry="${Math.max(1, ry - 3)}" class="lagoon"/>
      <text x="${left ? x - rx - 3 : x + rx + 3}" y="${y + 3}" style="text-anchor:${left ? 'end' : 'start'}" class="aname">${name}</text>
      <text x="${x}" y="${y + 2.6}" style="text-anchor:middle" class="athaana">${th}</text></g>`;
  }).join('');
  const cities = (COUNTRY.cities || []).map(([n, lat, lon, note, rid, side], i) => {
    const [x, y] = G([lat, lon]), cap = i === 0, hide = n === 'Hulhumalé';
    return `<g class="city mvcity"><title>${n} — ${note}</title><circle cx="${x}" cy="${y}" r="${cap ? 4 : 2.6}"/>${hide ? '' : `<text x="${side === 'L' ? x - 6 : x + 6}" y="${side === 'L' ? y - 5 : y - 4}" style="text-anchor:${side === 'L' ? 'end' : 'start'}">${cap ? '★ ' : ''}${n}</text>`}</g>`;
  }).join('');
  return `<line x1="20" y1="${eq}" x2="330" y2="${eq}" class="equator"/><text x="22" y="${eq - 3}" class="eqlbl" style="text-anchor:start">Equator 0°</text>
    <text x="22" y="150" class="ocean" style="text-anchor:start">Indian Ocean</text>
    <g class="atolls">${rings}</g>${cities}`;
}
// Rival candidates get names from the chosen country (Maldivian names in the Maldives)
function atollList(rid) {
  if (!COUNTRY.atolls) return '';
  const at = COUNTRY.atolls.filter(a => a[5] === rid), ci = (COUNTRY.cities || []).filter(c => c[4] === rid);
  return `<div class="atoll-list">${ci.length ? `<div><b>🏙️ Cities:</b> ${ci.map(c => `<span title="${c[3]}">${c[0]}</span>`).join(' · ')}</div>` : ''}
    <div><b>🏝️ Atolls:</b></div><ul>${at.map(a => `<li><span class="thaana">${a[8]}</span> <b>${a[1]}</b> <small class="muted">${a[9]} · capital ${a[2]}</small></li>`).join('')}</ul></div>`;
}
function oppNames() {
  if (!COUNTRY || COUNTRY.fictional || typeof personName !== 'function') return OPP_NAMES;
  const out = new Set(); for (let i = 0; out.size < 12 && i < 300; i++) out.add(personName(i % 3 === 0 ? 'f' : 'm'));
  return [...out];
}
function mapSVG(mode) {
  const pp = partyById(S.player.party), op = S.opp ? partyById(S.opp.party) : pp;
  const shown = mode === 'elec' ? S.elec.order.slice(0, UI.revealed) : [];
  const clickable = mode === 'camp' || mode === 'gov';
  const polys = REGIONS.map(r => {
    let fill = '#334155', label = '…';
    if (mode === 'camp') { const p = poll(r); fill = p.share >= .5 ? lerpColor('#475569', pp.color, (p.share - .5) / .2) : lerpColor('#475569', op.color, (.5 - p.share) / .2); label = `${Math.round(p.share * 100)}%`; }
    else if (mode === 'gov') { const a = regionApproval(r); fill = approvalColor(a); label = `${Math.round(a)}%`; }
    else if (mode === 'elec' && shown.includes(r.id)) { const x = S.elec.res.find(y => y.id === r.id); fill = x.share >= .5 ? pp.color : op.color; label = `${(x.share * 100).toFixed(1)}%`; }
    const c = centroid(r), sel = clickable && UI.region === r.id;
    return `<g class="region ${sel ? 'sel' : ''} ${clickable ? 'click' : ''}" ${clickable ? `data-act="region" data-id="${r.id}"` : ''}>
      <polygon points="${r.pts.map(p => p.join(',')).join(' ')}" fill="${fill}"/>
      <text x="${c.x}" y="${c.y - 8}" class="rname">${r.short}</text>
      <text x="${c.x}" y="${c.y + 6}" class="rval">${label}</text></g>`;
  }).join('');
  // roads & rail between cities
  const hasHw = id => S.buildings && S.buildings[id].includes('highway');
  const roads = (COUNTRY.roads || ROADS).map(([a, b]) => {
    const A = reg(a).city, B = reg(b).city, hw = hasHw(a) || hasHw(b);
    return `<line x1="${A[0]}" y1="${A[1]}" x2="${B[0]}" y2="${B[1]}" class="${COUNTRY.atolls ? 'searoute' : 'road'} ${hw ? 'hw' : ''}"/>`;
  }).join('') + (S.laws && S.laws.includes('rail') ? (COUNTRY.roads || ROADS).slice(0, 4).map(([a, b]) => { const A = reg(a).city, B = reg(b).city; return `<line x1="${A[0]}" y1="${A[1]}" x2="${B[0]}" y2="${B[1]}" class="rail"/>`; }).join('') : '');
  const geo = COUNTRY.atolls ? atollLayer() : '';
  const cities = geo ? '' : REGIONS.map(r => `<g class="city"><circle cx="${r.city[0]}" cy="${r.city[1]}" r="${r.id === 'capital' ? 4 : 3}"/><text x="${r.city[0] + 6}" y="${r.city[1] + 3}">${r.id === 'capital' ? '★ ' : ''}${r.city[2]}</text></g>`).join('');
  // buildings & construction sites
  let blds = '';
  if (S.buildings) REGIONS.forEach(r => {
    const c = centroid(r);
    const items = [...S.buildings[r.id].map(t => ({ t, icon: PROJECTS[t].icon })), ...(S.projects || []).filter(p => p.region === r.id).map(p => ({ t: p.type, icon: '🚧', site: true }))];
    items.forEach((it, i) => {
      const x = c.x - 24 + (i % 5) * 12, y = c.y + 20 + Math.floor(i / 5) * 12;
      blds += `<text x="${x}" y="${y}" class="bld ${it.site ? 'site' : ''}"><title>${it.site ? 'Under construction: ' : ''}${PROJECTS[it.t].name}</title>${it.icon}</text>`;
    });
  });
  // planes between airports
  let planes = '';
  const ap = S.buildings ? RK.filter(id => S.buildings[id].includes('airport')) : [];
  if (ap.length >= 2) planes = ap.slice(1).map((id, i) => { const A = reg(ap[0]).city, B = reg(id).city; return `<text class="plane" font-size="11">✈️<animateMotion dur="${7 + i * 2}s" repeatCount="indefinite" path="M${A[0]},${A[1]} Q${(A[0] + B[0]) / 2},${Math.min(A[1], B[1]) - 40} ${B[0]},${B[1]}"/></text>`; }).join('');
  let walker = '';
  if (clickable) {
    const tc = centroid(reg(UI.region));
    const target = { x: tc.x + 34, y: tc.y + 4 };
    const from = UI.walkFrom || target;
    UI.walkTo = target;
    walker = `<g id="walker" style="transform:translate(${from.x}px,${from.y}px)"><g class="bob"><ellipse cx="0" cy="1" rx="9" ry="3" fill="#000" opacity=".35"/><g transform="translate(-13,-31) scale(.22)">${avatarInner(S.player.look, mood())}</g>${mode === 'gov' ? '<text x="9" y="-22" font-size="10">📋</text>' : ''}</g></g>`;
  }
  let oppMark = '';
  if (mode === 'camp' && S.camp.oppAt) {
    const oc = centroid(reg(S.camp.oppAt));
    oppMark = `<g transform="translate(${oc.x - 34},${oc.y + 4})" opacity=".9"><ellipse cx="0" cy="1" rx="8" ry="3" fill="#000" opacity=".3"/><g transform="translate(-11,-27) scale(.19)">${avatarInner(S.opp.look, 0)}</g><text x="0" y="-30" class="oppflag">📢</text></g>`;
  }
  const navy = S.mil && S.mil.navy > 25 ? `<text x="378" y="200" class="bld">🚢</text>` : '';
  return `<svg class="map" viewBox="0 0 400 300" role="img" aria-label="Map of ${esc(S.country)}">
    <defs><radialGradient id="sea" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="#12304f"/><stop offset="1" stop-color="#0a1a2e"/></radialGradient>
    <filter id="sh" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#000" flood-opacity=".45"/></filter></defs>
    <rect width="400" height="300" rx="14" fill="url(#sea)"/>
    <path d="M10 40 q10 -6 20 0 t20 0 M350 260 q10 -6 20 0 t20 0 M20 270 q10 -6 20 0 t20 0 M360 20 q10 -6 20 0" stroke="#1e4a73" stroke-width="2" fill="none" stroke-linecap="round"/>
    <text x="8" y="292" class="neighbor">← ${NEIGHBOR}</text>
    <g filter="url(#sh)" class="${geo ? 'zones' : ''}">${polys}</g>${geo}
    <g class="roads">${roads}</g>${cities}${blds}${navy}${planes}
    ${oppMark}${walker}</svg>`;
}
function postRender() {
  const cv = $('#city');
  const office = cv && S && S.phase === 'govern' && UI.view === 'office';
  if (office) { City.attach(null); Scenes.top.attach(cv, 'office', {}, 300); }
  else { Scenes.top.attach(null); City.attach(cv); }
  document.body.classList.toggle('pinned', !!cv && UI.pin !== false);
  const w = $('#walker');
  if (w && UI.walkTo) {
    const t = UI.walkTo;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (!w.isConnected) return;
      const moving = !UI.walkFrom || UI.walkFrom.x !== t.x || UI.walkFrom.y !== t.y;
      if (moving) { w.classList.add('walking'); setTimeout(() => w.classList.remove('walking'), 950); }
      w.style.transform = `translate(${t.x}px,${t.y}px)`;
      UI.walkFrom = t;
    }));
  }
}

function renderTitle() {
  const saved = store.get(SAVE_KEY);
  return `<div class="title-screen">
    <div class="title-art">${avatarSVG(UI.setup.look, 1, 170, 'float')}<div class="podium">🏛️</div></div>
    <h1>PRESIDENT</h1><div class="subtitle">Rise to Power</div>
    <p class="lead">Run a campaign. Win the election. Build your country — housing, airports, hospitals, an army — work with parliament and leave a legacy.</p>
    <div class="menu">
      ${saved ? `<button class="btn primary big" data-act="continue">▶ Continue as ${esc(saved.player.name)}</button>` : ''}
      <button class="btn ${saved ? '' : 'primary'} big" data-act="newGame">✨ New game</button>
      <button class="btn big" data-act="online">🌐 Online multiplayer</button>
      <button class="btn big ghost" data-act="school">📘 Finance School</button>
      ${PWA.canShow() ? `<button class="btn big ghost ${PWA.hasPrompt() ? 'glow' : ''}" data-act="install">📲 Install app</button>` : ''}
      <button class="btn big ghost" data-act="hall">🏆 Hall of Fame</button>
    </div>
    <p class="muted small">${Cloud.enabled ? '🟢 Online Hall of Fame connected' : 'Progress is saved in this browser.'}</p>
  </div>`;
}
function swatches(k, list) {
  return `<div class="sw-row"><span>${k[0].toUpperCase() + k.slice(1)}</span>${list.map(v => k === 'style'
    ? `<button class="sw-txt ${UI.setup.look[k] === v ? 'on' : ''}" data-act="look" data-k="${k}" data-v="${v}">${v}</button>`
    : `<button class="sw ${UI.setup.look[k] === v ? 'on' : ''}" style="background:${v}" data-act="look" data-k="${k}" data-v="${v}" aria-label="${k} ${v}"></button>`).join('')}</div>`;
}
function renderSetup() {
  const su = UI.setup;
  return `<div class="card setup">
    <h2>Create your candidate</h2>
    <div class="setup-grid">
      <div class="preview">${avatarSVG(su.look, 1, 190, 'float')}<div class="pname">${esc(su.name || 'Your Name')}</div>
        <div class="party-chip" style="--pc:${partyById(su.party).color}">${partyById(su.party).name}</div>
        <button class="btn ghost small" data-act="randomLook">🎲 Random look</button></div>
      <div class="setup-form">
        <label>Your name<input data-input="name" maxlength="24" placeholder="e.g. Alex Morgan" value="${esc(su.name)}"></label>
        <div class="lbl">Country</div>
        <div class="country-grid">${COUNTRIES.map(c => `<button class="country ${su.countryId === c.id ? 'on' : ''}" data-act="setCountry" data-id="${c.id}"><span class="cflag">${Flags.svg(Flags.code(c.id), 30)}</span><b>${c.fictional ? 'Fictional country' : c.name}</b><small>${c.fictional ? 'Name it yourself' : `${c.pop >= 100 ? fmt(c.pop) : fmt(c.pop, 1)}M · ${bigMoney(c.gdp)}`}</small></button>`).join('')}</div>
        ${(() => { const c = COUNTRIES.find(x => x.id === su.countryId) || COUNTRIES[0]; return c.fictional ? `<label>Country name<input data-input="country" maxlength="40" value="${esc(su.country)}"></label>` :
          `<div class="cfacts"><b>${Flags.svg(Flags.code(c.id), 22)} ${c.name}</b> — ${c.system === 'presidential' ? 'presidential republic' : 'parliamentary system'}. You run for <b>${c.title}</b>.
          <ul><li>👥 Population ${c.pop >= 100 ? fmt(c.pop) : fmt(c.pop, 1)} million · 💵 GDP ${bigMoney(c.gdp)} (IMF 2025) · 📉 Debt ${fmt(c.debt, 1)}% of GDP</li>
          <li>🗓️ ${c.termYears}-year terms${c.termLimit ? ` · limit: ${c.termLimit} term${c.termLimit > 1 ? 's' : ''}` : ' · no term limit'} · 🏛️ ${c.parl}: ${c.seats} seats</li>
          <li>🗺️ ${Object.values(c.regions).map(r => r.city).join(', ')}${c.landlocked ? ' · 🚫 landlocked' : ''}</li></ul>
          <span class="muted small">${c.note} Parties and candidates are fictional.</span></div>`; })()}
        <div class="lbl">Party</div>
        <div class="party-grid">${PARTIES.map(p => `<button class="party ${su.party === p.id ? 'on' : ''}" data-act="setParty" data-id="${p.id}" style="--pc:${p.color}">
          <b>${p.name}</b><small>“${p.slogan}”</small>
          <span class="bias">${GK.filter(g => p.bias[g] >= 6).map(g => GROUPS[g].icon).join('')}<em>love you</em> ${GK.filter(g => p.bias[g] <= -6).map(g => GROUPS[g].icon).join('')}<em>${GK.some(g => p.bias[g] <= -6) ? 'distrust you' : ''}</em></span></button>`).join('')}</div>
        <div class="lbl">Qualification <span class="muted small">— your background. With assistant mode on, your Chief of Staff explains the terms you don't know yet.</span></div>
        <div class="qual-grid">${Object.entries(QUALS).map(([k, q]) => `<button class="qual ${(su.qual || 'teacher') === k ? 'on' : ''}" data-act="setQual" data-id="${k}"><span>${q.icon}</span><b>${q.name}</b><small>${q.perk}</small><em>${q.knows.length ? 'Knows: ' + q.knows.map(f => QFIELDS[f]).join(', ') : 'Will learn all key terms'}</em></button>`).join('')}</div>
        <div class="lbl">Look</div>
        ${swatches('skin', LOOKS.skin)}${swatches('hair', LOOKS.hair)}${swatches('style', LOOKS.style)}${swatches('suit', LOOKS.suit)}${swatches('tie', LOOKS.tie)}
        <div class="row-end"><button class="btn ghost" data-act="home">Back</button><button class="btn primary big" data-act="startGame">Launch campaign →</button></div>
      </div>
    </div></div>`;
}
function groupVs(g) {
  const c = S.camp, a = c.symP[g], b = c.symO[g], tot = a + b, pp = partyById(S.player.party), op = partyById(S.opp.party);
  return `<div class="gvs"><span class="gname">${GROUPS[g].icon} ${GROUPS[g].name}</span>
    <div class="split"><div style="width:${a / tot * 100}%;background:${pp.color}"></div><div style="width:${b / tot * 100}%;background:${op.color}"></div></div>
    <span class="gnum">${fmt(a)} : ${fmt(b)}</span></div>`;
}
function pollBar(p, u, o, sm = '') {
  const pp = partyById(S.player.party), op = partyById(S.opp.party);
  return `<div class="pollbar ${sm}"><div style="width:${p}%;background:${pp.color}">${p > 9 ? fmt(p) + '%' : ''}</div>${u ? `<div class="und" style="width:${u}%">${u > 9 ? fmt(u) + '%' : ''}</div>` : ''}<div style="width:${o}%;background:${op.color}">${o > 9 ? fmt(o) + '%' : ''}</div></div>`;
}
function renderCampaign() {
  const c = S.camp, np = nationalPoll(), pp = partyById(S.player.party), op = partyById(S.opp.party);
  const r = reg(UI.region), pr = poll(r);
  const promised = c.newPromises.map(g => ({ g }));
  return `${S.online ? Online.rivalsStrip() : ''}<div class="card camp-head">
    <div class="vs">
      <div class="cand">${avatarSVG(S.player.look, mood(), 58)}<div><b>${esc(S.player.name)}</b><small style="color:${pp.color}">${pp.name}</small>${Qual.badge()}</div></div>
      <div class="vs-mid"><div class="kicker">${c.re ? 'Re-election campaign' : `${ROLE.race} election campaign`}</div><div class="weeks">Week ${c.week} of ${c.weeks}${c.week === c.debateWeek ? ' · 🎙️ TV debate this week' : ''}</div></div>
      <div class="cand right"><div><b>${esc(S.opp.name)}</b><small style="color:${op.color}">${op.name}</small></div>${avatarSVG(S.opp.look, 0, 58)}</div>
    </div>
    ${c.minor ? `<div class="also"><span class="muted small">Also running:</span>${c.minor.map(m => `<span class="mini">${avatarSVG(m.look, 0, 26)}<span>${esc(m.name)}<small style="color:${partyById(m.party).color}">${partyById(m.party).name}</small></span></span>`).join('')}</div>` : ''}
    ${pollBar(np.p, np.u, np.o)}
    ${RealCamp.two() ? `<div class="ev">${esc(RealCamp.rules().body)} · two-round system: more than <b>50%</b> of valid votes wins, otherwise a runoff${c.runoff ? ' — <b>this is the runoff</b>' : ''}</div>` : `<div class="ev">Projected ${ROLE.ev}: <b style="color:${pp.color}">${np.evP}</b> – <b style="color:${op.color}">${np.evO}</b> <span class="muted">· 51 to win</span></div>`}
    <div class="rc-row">${RealCamp.pollCard()}${RealCamp.ledger()}</div>${S.vp ? `<p class="muted small center">🤝 Running mate: <b>${esc(S.vp.name)}</b> — ${esc(S.vp.d)}</p>` : ''}
  </div>
  ${Qual.termCard() ? `<div class="card cos-camp">${Qual.termCard()}</div>` : ''}
  ${cityCard()}
  <div class="grid3">
    <div class="card mapcard">${bubble()}${mapSVG('camp')}<p class="muted small center">Tap a region to travel there.</p></div>
    <div class="card">
      <h3>📍 ${r.name} <small class="muted">${r.pop}% of ${ROLE.ev} · ${r.city[2]}</small></h3>
      ${pollBar(pr.p, pr.u, pr.o, 'sm')}
      <p class="muted small">${r.desc}</p>${atollList(r.id)}
      <div class="mix">${GK.filter(g => r.mix[g] > 0).map(g => `<span>${GROUPS[g].icon} ${Math.round(r.mix[g] * 100)}%</span>`).join('')}</div>
      <p class="muted small">👆 Use the action bar under the city view — every action plays out right there.</p>
    </div>
    <div class="card">
      <h3>Voter groups <small class="muted">you : rival</small></h3>
      ${GK.map(groupVs).join('')}
      <h3>🤝 Promises</h3>
      ${promised.length ? promised.map(p => `<div class="promise">${GROUPS[p.g].icon} ${PROMISES[p.g].text}</div>`).join('') : '<p class="muted small">No promises yet. They win votes — but you must keep them.</p>'}
      ${c.re && S.promises.some(p => p.broken) ? `<p class="bad small">Broken promises are hurting you: ${S.promises.filter(p => p.broken).map(p => GROUPS[p.g].icon).join(' ')}</p>` : ''}
    </div>
  </div>`;
}
function renderElection() {
  const E = S.elec, pp = partyById(S.player.party), op = partyById(S.opp.party);
  const t = electionTotals(UI.revealed), done = UI.revealed >= E.order.length;
  const rows = E.order.map((id, i) => {
    const r = reg(id), x = E.res.find(y => y.id === id);
    if (i >= UI.revealed) return `<div class="erow pending"><b>${r.name} <small>${r.pop}${RealCamp.two() ? '% of voters' : ' EV'}</small></b><span class="counting">Counting votes…</span></div>`;
    return `<div class="erow in"><b>${r.name} <small>${r.pop}${RealCamp.two() ? '% of voters' : ' EV'}</small></b>${pollBar(x.share * 100, 0, (1 - x.share) * 100, 'sm')}<span class="winner" style="color:${x.share >= .5 ? pp.color : op.color}">${x.share >= .5 ? '✓ ' + esc(S.player.name) : '✓ ' + esc(S.opp.name)}</span></div>`;
  }).join('');
  const full = electionTotals();
  return `<div class="card election">
    <div class="kicker center">🗳️ Election night in ${esc(S.country)}</div>
    ${RealCamp.two() ? `<div class="kicker center">${E.round === 2 ? 'Second round' : 'First round'} · ${t.p1 !== undefined ? 'popular vote counted so far' : ''}</div>
      <div class="evbig"><div style="color:${pp.color}"><b>${fmt(t.p1 || 0, 1)}%</b><small>${esc(S.player.name)}</small></div><div class="muted">more than 50% to win</div><div style="color:${op.color}"><b>${fmt(t.o1 || 0, 1)}%</b><small>${esc(S.opp.name)}</small></div></div>
      ${E.round !== 2 && t.m ? `<p class="center muted small">Other candidates: ${fmt(t.m, 1)}%</p>` : ''}`
    : `<div class="evbig"><div style="color:${pp.color}"><b>${t.evP}</b><small>${esc(S.player.name)}</small></div><div class="muted">51 to win</div><div style="color:${op.color}"><b>${t.evO}</b><small>${esc(S.opp.name)}</small></div></div>`}
    ${RealCamp.two() ? `<div class="evtrack"><div style="width:${t.p1 || 0}%;background:${pp.color}"></div><div style="width:${t.o1 || 0}%;background:${op.color};margin-left:auto"></div><i></i></div>` : `<div class="evtrack"><div style="width:${t.evP}%;background:${pp.color}"></div><div style="width:${t.evO}%;background:${op.color};margin-left:auto"></div><i></i></div>`}
    <div class="grid2">${mapSVG('elec')}<div class="erows">${rows}</div></div>
    ${done ? `<div class="verdict big ${full.runoff ? '' : full.win ? 'good' : 'bad'}">${full.runoff ? '⚖️ Nobody passed 50% — a SECOND ROUND will decide it' : full.win ? `🎉 ${esc(S.player.name)} WINS!` : `${esc(S.opp.name)} wins the election`}</div>
      ${S.camp && S.camp.turnout ? `<p class="center muted small">Turnout ${S.camp.turnout}% · results certified by the ${esc(RealCamp.rules().body)}</p>` : ''}
      <p class="center muted">Popular vote: ${fmt(full.pv / (full.pv + full.ov) * 100, 1)}% – ${fmt(full.ov / (full.pv + full.ov) * 100, 1)}%</p>
      <div class="center"><button class="btn primary big" data-act="afterElection">${S.online && !E.re ? (S.online.result ? 'See the online result →' : 'Send my result to the online game →') : full.win ? (E.re ? 'Begin second term →' : 'Go to the palace →') : 'See your story →'}</button></div>` : ''}
  </div>`;
}
function statBar(k) {
  const v = S.stats[k], d = S.statsPrev ? v - S.statsPrev[k] : 0;
  return `<div class="stat"><span>${STATS[k].icon} ${STATS[k].name}</span><div class="bar"><div style="width:${v}%;background:${approvalColor(v)}"></div></div><b>${fmt(v)}</b><em class="${d >= 0 ? 'up' : 'down'}">${Math.abs(d) >= .5 ? (d > 0 ? '▲' : '▼') : ''}</em></div>`;
}
function chartSVG() {
  const h = S.hist, W = 300, H = 80, n = Math.max(TT() * MAXT(), h.length - 1);
  const pts = h.map((v, i) => `${(i / n * W).toFixed(1)},${(H - v / 100 * H).toFixed(1)}`).join(' ');
  const last = h.length ? [(h.length - 1) / n * W, H - h[h.length - 1] / 100 * H] : [0, H / 2];
  return `<svg class="chart" viewBox="-4 -4 ${W + 8} ${H + 8}" preserveAspectRatio="none">
    <line x1="0" x2="${W}" y1="${H / 2}" y2="${H / 2}" class="mid"/><line x1="0" x2="${W}" y1="${H * .75}" y2="${H * .75}" class="danger"/>
    ${Array.from({ length: MAXT() - 1 }, (_, i) => `<line x1="${(i + 1) * TT() / n * W}" x2="${(i + 1) * TT() / n * W}" y1="0" y2="${H}" class="term"/>`).join('')}
    <polyline points="${pts}" class="line"/><circle cx="${last[0]}" cy="${last[1]}" r="3.5" class="dot"/></svg>
    <div class="chart-legend muted small"><span>— 50%</span><span class="bad">— 25% impeachment risk</span><span>| re-election</span></div>`;
}
function promisesHTML() {
  if (!S.promises.length) return (S.pledges || []).length ? `<div class="plist"><button class="linkbtn" data-act="tab" data-id="agenda" data-scroll="1">📜 Your manifesto →</button></div>` : '';
  return `<div class="plist"><div class="lbl">🤝 Promises <button class="linkbtn" data-act="tab" data-id="agenda" data-scroll="1">full manifesto →</button></div>${S.promises.map(p => {
    const kept = S.laws.includes(PROMISES[p.g].law);
    return `<div class="promise ${kept ? 'kept' : p.broken ? 'broken' : ''}">${kept ? '✅' : p.broken ? '❌' : '⏳'} ${PROMISES[p.g].text}</div>`; }).join('')}</div>`;
}
function overviewHTML() {
  const en = energy(), u = unemployment(), d = devIndex();
  const box = (icon, label, val, cls = '') => `<div class="ov"><span>${icon} ${label}</span><b class="${cls}">${val}</b></div>`;
  return `<div class="overview">
    ${box('👥', 'Population', `${fmt(S.pop, 1)}M`)}
    ${box('💵', 'GDP per person', `$${fmt(gdpReal() / S.pop, 1)}k`)}
    ${box('🧰', 'Unemployment', `${fmt(u, 1)}%`, u > 10 ? 'bad' : u < 6 ? 'good' : '')}
    ${box('⚡', 'Energy', `${fmt(en.supply)} / ${fmt(en.demand)}`, en.supply < en.demand ? 'bad' : 'good')}
    ${box('🏗️', 'Buildings', `${totalBuildings()}${S.projects.length ? ` +${S.projects.length}🚧` : ''}`)}
    ${box('🌐', 'Development', `${devLevel(d)} (${fmt(d)})`)}
  </div>`;
}
function budgetHTML() {
  const B = S.budget;
  const sl = [['tax', '💰 Tax rate', 10, 50, '%'], ['health', '🏥 Health', 0, 10, ''], ['education', '📚 Education', 0, 10, ''], ['security', '🚓 Police & justice', 0, 10, ''], ['infra', '🏗️ Infrastructure upkeep', 0, 10, ''], ['welfare', '🤲 Welfare', 0, 10, '']];
  return `<div class="budget">${sl.map(([k, l, mn, mx, u]) => `<div class="slider"><label><span>${l}</span><b id="v-${k}">${B[k]}${u}</b></label>
    <input type="range" min="${mn}" max="${mx}" step="1" value="${B[k]}" data-budget="${k}" ${S.pendingEvent ? 'disabled' : ''}></div>`).join('')}
    <div id="proj">${projHTML()}</div>
    <p class="muted small">Spending slowly raises the matching stat. Infrastructure grows the economy but hurts the environment. High taxes anger business and slow growth. Construction projects and military upgrades are paid up front from the treasury.</p></div>`;
}
function projHTML() {
  const b = budgetCalc();
  return `<div class="proj"><div><span>Tax revenue</span><b>${money(b.rev)}</b></div><div><span>Public services</span><b>${money(b.spend + b.laws)}</b></div><div><span>Military upkeep</span><b>${money(b.mil)}</b></div><div><span>Debt interest</span><b>${money(b.interest)}</b></div>
    <div class="tot"><span>Balance / half-year</span><b class="${b.bal >= 0 ? 'up' : 'down'}">${b.bal >= 0 ? '+' : '−'}${money(Math.abs(b.bal))}</b></div>
    <div class="muted small">+ home sales last half-year: ${money(S.housing.lastRev)}</div></div>`;
}
function regionPicker() {
  const office = S.phase === 'govern' ? `<button class="${UI.view === 'office' ? 'on' : ''}" data-act="office">🏛️ Office</button>` : '';
  return `<div class="rpick">${office}${REGIONS.map(r => `<button class="${UI.region === r.id && UI.view !== 'office' ? 'on' : ''}" data-act="region" data-id="${r.id}">${r.short}</button>`).join('')}</div>`;
}
function buildHTML() {
  const r = reg(UI.region), here = S.buildings[r.id];
  const counts = {}; here.forEach(t => counts[t] = (counts[t] || 0) + 1);
  return `${regionPicker()}
  <div class="rinfo"><b>${r.name}</b> <span class="muted small">· ${r.city[2]} · approval ${fmt(regionApproval(r))}%</span>
    <div class="have">${Object.keys(counts).length ? Object.entries(counts).map(([t, n]) => `<span class="chip">${PROJECTS[t].icon} ${PROJECTS[t].name}${n > 1 ? ' ×' + n : ''}</span>`).join('') : '<span class="muted small">Nothing built here yet.</span>'}</div>${COUNTRY.atolls ? `<details class="atoll-d"><summary>🏝️ Atolls & cities in ${r.short}</summary>${atollList(r.id)}</details>` : ''}</div>
  ${S.projects.length ? `<h3>🚧 Under construction <small class="muted">${S.projects.length}/${MAX_PROJECTS}</small></h3>${S.projects.map(p => {
    const P = PROJECTS[p.type], c = comp(p.company), done = p.total - p.turnsLeft;
    return `<div class="pjob"><span class="pi">${P.icon}</span><div class="pt"><b>${P.name} · ${reg(p.region).short}</b><small>${c.icon} ${c.name} · <span class="stars">${stars(p.q)}</span>${p.delays ? ` · <span class="bad">${p.delays} delay${p.delays > 1 ? 's' : ''}</span>` : ''}</small>
      <div class="bar"><div style="width:${Math.max(6, done / p.total * 100)}%;background:var(--gold)"></div></div></div><span class="muted small">${p.turnsLeft} left</span></div>`; }).join('')}` : ''}
  <h3>🏗️ New project in ${r.short}</h3>
  <div class="plist2">${Object.entries(PROJECTS).map(([k, P]) => {
    const why = buildBlock(k, r.id), can = !why && !S.pendingEvent;
    return `<button class="proj-btn" data-act="tender" data-id="${k}" ${can ? '' : 'disabled'} title="${why}">
      <span class="pi">${P.icon}</span><span class="pt"><b>${P.name}</b><small>${why || P.desc}</small></span><span class="pc">${money(P.cost)}<small>${P.turns} turns</small></span></button>`;
  }).join('')}</div>
  <details class="companies"><summary>🏢 Construction companies</summary>${COMPANY_LOCAL[COUNTRY.id] ? '<p class="muted small">Real state-owned companies and foreign contractors bid alongside fictional ones. How each performs in the game is simulated, not a rating of the real company.</p>' : ''}${COMPANIES.map(c => `<div class="crow"><span>${c.icon} ${c.name} <span class="tag-c ${c.tag.toLowerCase()}">${c.tag}</span></span><div class="bar"><div style="width:${S.companies[c.id]}%;background:${approvalColor(S.companies[c.id])}"></div></div><b>${fmt(S.companies[c.id])}</b></div>`).join('')}
    <p class="muted small">Reputation rises when projects finish on time and falls with delays and defects. Better reputation = better bids.</p></details>`;
}
function housingHTML() {
  const h = S.housing, stock = RK.reduce((s, r) => s + h.stock[r], 0);
  return `<div class="hstats">
    <div class="ov"><span>🏠 Homes for sale</span><b>${stock.toLocaleString()}</b></div>
    <div class="ov"><span>🔑 Sold to citizens</span><b>${h.sold.toLocaleString()}</b></div>
    <div class="ov"><span>📈 Last half-year</span><b>${h.lastSold.toLocaleString()} · ${money(h.lastRev)}</b></div>
    <div class="ov"><span>🏠 Housing index</span><b>${fmt(S.stats.housing)}</b></div></div>
  <h3>Price policy</h3>
  <div class="choices tight">${Object.entries(HOUSE_PRICES).map(([k, P]) => `<button class="choice ${h.price === k ? 'on' : ''}" data-act="housePrice" data-id="${k}"><b>${P.icon} ${P.name} — ${money(P.price)} per 1,000 homes</b><span class="fx">${P.desc}</span></button>`).join('')}</div>
  <h3>Stock by region</h3>
  ${REGIONS.map(r => `<div class="stat"><span>${r.short}</span><div class="bar"><div style="width:${Math.min(100, h.stock[r.id] / 40)}%;background:var(--gold)"></div></div><b>${h.stock[r.id].toLocaleString()}</b><em></em></div>`).join('')}
  <p class="muted small">Housing estates built in the 🏗️ Build tab add 2,000 homes each. Homes sell every half-year depending on price and the economy. The population grows — keep building or the housing index falls.</p>
  <button class="btn wide" data-act="buildHousing">🏘️ Build a housing estate in ${reg(UI.region).short}</button>`;
}
function lawsHTML() {
  const promisedLaws = S.promises.map(p => PROMISES[p.g].law);
  return `<div class="dr-cta"><div><b>✍️ Write your own bill</b><small>Choose what the law does; your assistant helps you draft it, estimates the cost and counts the votes.</small></div><button class="btn primary" data-act="draftBill" ${S.lawThisTurn || S.pendingEvent ? 'disabled' : ''}>Open drafting studio</button></div>
  <p class="muted small">One bill per half-year. ⭐ ${S.pc} political capital. ${majority()} of ${S.parl.size || 100} votes needed — see the 🏛️ Parliament tab.</p>
  <div class="laws">${LAWS.filter(L => !L.custom || (S.customLaws || []).some(c => c.law.id === L.id)).map(L => {
    const passed = S.laws.includes(L.id), can = !passed && !S.lawThisTurn && S.pc >= L.pc && !S.pendingEvent;
    const ey = passed ? 0 : expectedYes(L);
    const fx = { g: L.g, s: L.s, cost: L.cost };
    return `<div class="law ${passed ? 'passed' : ''}"><div class="lh"><span class="li">${L.icon}</span><div><b>${L.name}</b>${promisedLaws.includes(L.id) && !passed ? '<span class="tag-p">🤝 promised</span>' : ''}<small>${L.desc}</small></div></div>
      <div class="fx">${fxChips(fx, 'gov')}</div>
      <div class="lf">${passed ? '<span class="good">✓ In force</span>' : `<span class="small ${ey >= majority() * 1.08 ? 'good' : ey >= majority() * .94 ? 'warn' : 'bad'}">⭐${L.pc} · expected ~${ey} votes</span><button class="btn small ${can ? 'primary' : ''}" data-act="law" data-id="${L.id}" ${can ? '' : 'disabled'}>Draft bill</button>`}</div></div>`;
  }).join('')}</div>`;
}
function hemicycle() {
  const n = S.parl.size || 100, rowsN = n <= 120 ? 5 : n <= 300 ? 8 : 11, r0 = 48, r1 = 112, pos = [];
  const radii = Array.from({ length: rowsN }, (_, i) => r0 + (r1 - r0) * i / (rowsN - 1)), sumR = radii.reduce((a, b) => a + b, 0);
  let left = n;
  radii.forEach((R, i) => { const k = i === rowsN - 1 ? left : Math.round(n * R / sumR); left -= k; for (let j = 0; j < k; j++) { const a = Math.PI - (k === 1 ? .5 : j / (k - 1)) * Math.PI; pos.push({ x: 120 + R * Math.cos(a), y: 118 - R * Math.sin(a), a }); } });
  pos.sort((p, q) => q.a - p.a);
  const dot = Math.max(1.3, Math.min(4.2, 300 / n * .9));
  const order = [...PARTIES].sort((a, b) => (S.parl.coalition.includes(b.id) ? 1 : 0) - (S.parl.coalition.includes(a.id) ? 1 : 0));
  const seq = []; order.forEach(p => { for (let i = 0; i < (S.parl.seats[p.id] || 0); i++) seq.push(p); });
  return `<svg viewBox="0 0 240 134" class="hemi">${pos.map((p, i) => seq[i] ? `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${dot}" fill="${seq[i].color}" ${S.parl.coalition.includes(seq[i].id) ? '' : 'opacity=".6"'}/>` : '').join('')}
    <text x="120" y="112" class="hnum">${coalitionSeats()}</text><text x="120" y="128" class="hlbl">coalition seats · ${majority()} = majority</text></svg>`;
}
function parlHTML() {
  const me = S.player.party, cs = coalitionSeats();
  return `${hemicycle()}
  <div class="muted small center">${esc(COUNTRY.parl || 'Parliament')} · ${S.parl.size || 100} seats</div>
  <div class="qt-box"><div><b>🏛️ Question time</b><small>Opposition MPs question your ministers in the chamber about current problems. Weak answers can lead to a no-confidence motion.</small></div><button class="btn small ${S.qtime === S.turn ? '' : 'primary'}" data-act="qtime" ${S.qtime === S.turn || S.pendingEvent ? 'disabled' : ''}>${S.qtime === S.turn ? 'Held this half-year' : 'Hold question time →'}</button></div>
  <div class="verdict ${cs >= majority() ? 'good' : 'bad'} small-v">${cs >= majority() ? `✓ Your coalition has a majority (${cs}/${S.parl.size || 100})` : `✗ No majority (${cs}/${S.parl.size || 100}) — laws need opposition votes`}</div>
  ${PARTIES.filter(p => S.parl.seats[p.id]).map(p => {
    const inC = S.parl.coalition.includes(p.id), rel = S.parl.rel[p.id];
    return `<div class="prow" style="--pc:${p.color}"><div class="pn"><b>${p.name}</b><small>${S.parl.seats[p.id]} seats · ${p.id === me ? 'Your party' : inC ? 'Coalition partner' : p.id === S.opp.party ? 'Main opposition' : 'Opposition'}</small></div>
      ${p.id === me ? '<span class="chip">👑 Leader</span>' : `<div class="rel"><small>Relations</small><div class="bar"><div style="width:${rel}%;background:${approvalColor(rel)}"></div></div></div>
      ${inC ? `<button class="btn small" data-act="leaveCoal" data-id="${p.id}">Dismiss</button>` : `<button class="btn small ${S.pc >= 3 ? 'primary' : ''}" data-act="invite" data-id="${p.id}" ${S.pc >= 3 && !S.pendingEvent ? '' : 'disabled'}>Invite ⭐3</button>`}`}</div>`;
  }).join('')}
  <p class="muted small">Parties vote for laws that help the groups they care about. Passing laws a party likes improves relations; better relations make coalition offers succeed. Partners quit if you pass laws they strongly oppose. Parliament is re-elected with you after term 1.</p>`;
}
function defenseHTML() {
  const str = milStrength(), risk = warRisk(), m = S.mil;
  return `<div class="dgauge"><div><span>🛡️ Your strength</span><b>${fmt(str)}</b></div><div class="vsx">vs</div><div><span>⚔️ ${NEIGHBOR} threat</span><b class="bad">${fmt(S.threat)}</b></div></div>
  <div class="verdict ${risk[1] === 'good' ? 'good' : 'bad'} small-v">Invasion risk: ${risk[0]}</div>
  ${Object.entries(MIL_UPGRADES).map(([k, U]) => `<div class="mrow"><span class="pi">${U.icon}</span><div class="pt"><b>${U.name} <small class="muted">${fmt(m[k])}/100</small></b><div class="bar"><div style="width:${m[k]}%;background:var(--gold)"></div></div><small class="muted">${U.desc}</small></div>
    ${k === 'navy' && COUNTRY.landlocked ? '<span class="muted small">Landlocked</span>' : `<button class="btn small" data-act="mil" data-id="${k}" ${S.pendingEvent || m[k] >= 100 ? 'disabled' : ''}>+8 · ${money(U.cost)}</button>`}</div>`).join('')}
  <div class="mrow"><span class="pi">🪖</span><div class="pt"><b>Military bases: ${count('base')}</b><small class="muted">Each base adds +6 strength. Build more in the 🏗️ Build tab.</small></div></div>
  <div class="mrow"><span class="pi">🕊️</span><div class="pt"><b>Peace summit</b><small class="muted">Talks with the ${NEIGHBOR}: threat −12. Once per half-year.</small></div>
    <button class="btn small" data-act="diplo" ${S.pc >= 2 && !S.diploThisTurn && !S.pendingEvent ? '' : 'disabled'}>⭐2</button></div>
  <div class="mrow"><span class="pi">🤝</span><div class="pt"><b>Defense alliance ${m.alliance ? '<span class="good">· member</span>' : ''}</b><small class="muted">+15 strength, allies can help in war. Costs ${money(.5)} per half-year.</small></div>
    <button class="btn small" data-act="alliance" ${m.alliance || (S.pc >= 4 && !S.pendingEvent) ? '' : 'disabled'}>${m.alliance ? 'Leave' : 'Join ⭐4'}</button></div>
  <p class="muted small">Equipment ages: every branch loses 1 point each half-year. Upkeep is paid from the budget. If the threat is much bigger than your strength, the ${NEIGHBOR} may invade.</p>`;
}
function peopleHTML() {
  return `${Impact.feed()}<p class="muted small">A speech costs ⭐1 and gives a quick boost.</p>${GK.map(g => {
    const v = S.ga[g], d = S.gaPrev ? v - S.gaPrev[g] : 0;
    return `<div class="grp"><span class="gname">${GROUPS[g].icon} ${GROUPS[g].name} <small class="muted">${Math.round(NAT[g] * 100)}% of voters</small></span>
      <div class="bar"><div style="width:${v}%;background:${approvalColor(v)}"></div></div><b>${fmt(v)}%</b><em class="${d >= 0 ? 'up' : 'down'}">${Math.abs(d) >= .5 ? sign(d, 0) : ''}</em>
      <button class="btn small" data-act="speech" data-g="${g}" ${S.pc < 1 || S.pendingEvent ? 'disabled' : ''}>🎤 Speech</button></div>`;
  }).join('')}
  <h3>Regions</h3>${REGIONS.map(r => { const a = regionApproval(r); return `<div class="stat"><span>${r.name}</span><div class="bar"><div style="width:${a}%;background:${approvalColor(a)}"></div></div><b>${fmt(a)}%</b><em></em></div>`; }).join('')}
  <h3>Approval</h3>${chartSVG()}`;
}
async function ceremonies() {
  const list = (S.justOpened || []).slice(0, 2); S.justOpened = [];
  for (const o of list) {
    const P = PROJECTS[o.type], r = reg(o.region);
    UI.view = 'city'; UI.region = o.region; render();
    await new Promise(res => setTimeout(res, 80));
    City.event('ceremony', { type: o.type, company: o.company });
    await new Promise(res => {
      const wrap = $('.cv-wrap'); if (!wrap) return res();
      const b = document.createElement('div'); b.className = 'cv-banner';
      b.innerHTML = `🎀 <b>Grand opening:</b> ${P.icon} ${P.name} in ${esc(r.city[2])} <button class="btn small primary">Continue ▶</button>`;
      wrap.appendChild(b);
      const done = () => { clearTimeout(tm); b.remove(); res(); };
      const tm = setTimeout(done, 11000); b.querySelector('button').onclick = done;
    });
  }
  if (list.length) { UI.view = 'office'; render(); }
}
function cityMood(g, rid) {
  if (S.phase === 'campaign' && S.camp) { const c = S.camp; return clamp(50 + (c.symP[g] - c.symO[g]) * 2.2 + ((c.rbP[rid] || 0) - (c.rbO[rid] || 0)) * 1.5); }
  return clamp(S.ga[g] + S.regionMods[rid] * .5);
}
function cityBar(camp) {
  if (camp) {
    const c = S.camp, r = reg(UI.region);
    return `<div class="cv-bar">
      <div class="cvb-info"><span class="ap">${'<i class="on"></i>'.repeat(c.ap)}${'<i></i>'.repeat(3 - c.ap)}</span><b>💵 $${Math.round(c.funds)}M</b><small class="muted">in ${r.short}</small></div>
      ${Object.entries(CAMP_ACTIONS).map(([id, a]) => `<button class="cvb" data-act="camp" data-id="${id}" title="${a.desc}" ${c.ap <= 0 || c.funds < a.cost || (id === 'promise' && !promisesLeft()) ? 'disabled' : ''}><span>${a.icon}</span>${(n => n[0].toUpperCase() + n.slice(1))(a.name.replace('Make a ', '').replace('Hold a ', ''))}<small>${a.cost ? '$' + a.cost + 'M' : 'free'}</small></button>`).join('')}
      <button class="cvb" data-act="manifesto"><span>📜</span>Manifesto<small>${(c.newPledges || []).length}/3 pledges</small></button>
      <button class="btn primary cvb-end" data-act="endWeek">${c.week === c.weeks ? 'Election Day 🗳️' : 'End week →'}</button></div>`;
  }
  return `<div class="cv-bar">
    ${Clock.html()}<div class="cvb-info"><b>⭐ ${S.pc} PC</b></div>
    <button class="cvb" data-act="cabinet" ${S.pendingEvent ? 'disabled' : ''}><span>👔</span>Cabinet<small>${S.cabinetDone && S.cabinetDone.turn === S.turn ? 'held' : 'briefings'}</small></button>
    <button class="cvb ${Experts.urgent().length ? 'alert' : ''}" data-act="experts" ${S.pendingEvent ? 'disabled' : ''} title="Ask economists, the central bank, the IMF, business and unions what to do"><span>🧠</span>Experts<small>${Experts.urgent().length ? Experts.urgent().length + ' issue' + (Experts.urgent().length > 1 ? 's' : '') : 'advice'}</small></button>
    <button class="cvb ${Advisers.urgent().length ? 'alert' : ''}" data-act="advisers" ${S.pendingEvent ? 'disabled' : ''} title="Your legal counsel, physician, foreign policy adviser, press secretary and more"><span>🧑‍💼</span>Advisers<small>${Advisers.urgent().length ? Advisers.urgent().length + ' want to see you' : 'lawyer · doctor · more'}</small></button>
    <button class="cvb" data-act="buildPick" ${S.pendingEvent ? 'disabled' : ''}><span>🏗️</span>Build<small>tender in ${reg(UI.region).short}</small></button>
    <button class="cvb" data-act="tab" data-id="laws" data-scroll="1"><span>📜</span>Bill<small>draft a law</small></button>
    <button class="cvb" data-act="presser" ${S.presser === S.turn || S.pendingEvent ? 'disabled' : ''} title="Journalists ask about current concerns; your ministers join you"><span>🎙️</span>Press<small>${S.presser === S.turn ? 'held' : 'conference'}</small></button>
    <button class="cvb" data-act="speechPick" ${S.pc < 1 || S.pendingEvent ? 'disabled' : ''}><span>🎤</span>Speech<small>⭐1</small></button>
    <button class="cvb" data-act="foreign" ${S.pendingEvent ? 'disabled' : ''}><span>✈️</span>Foreign<small>${S.tripTurn === S.turn ? 'trip done' : 'UN · summits · visits'}</small></button>
    <button class="cvb" data-act="tab" data-id="parl" data-scroll="1"><span>🏛️</span>Parliament<small>${coalitionSeats()}/${S.parl.size || 100}</small></button>
    <button class="cvb" data-act="tab" data-id="defense" data-scroll="1"><span>🛡️</span>Defense<small>risk ${warRisk()[0].toLowerCase()}</small></button>
    <button class="btn primary cvb-end" data-act="endTurn" ${S.pendingEvent ? 'disabled' : ''}>${S.turn % TT() === 0 ? (S.term >= MAXT() ? 'Finish →' : 'End term →') : 'End half-year →'}</button></div>`;
}
function scrollToCity() {
  const el = $('.citycard'); if (!el || UI.pin !== false) return;
  const r = el.getBoundingClientRect();
  if (r.top < 40 || r.top > window.innerHeight * .35) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
async function buildPick() {
  if (UI.busy || S.pendingEvent) return;
  const r = reg(UI.region), keys = Object.keys(PROJECTS);
  const choices = keys.map(k => { const P = PROJECTS[k], why = buildBlock(k, r.id); return { t: `${P.icon} ${P.name} — ${money(P.cost)}`, note: why ? `<span class="bad">${why}</span>` : `${P.desc} · ${P.turns} half-year${P.turns > 1 ? 's' : ''}`, disabled: !!why }; });
  choices.push({ t: 'Cancel', note: '' });
  const k = await choiceModal({ icon: '🏗️', title: `Build in ${r.name}`, text: 'Pick a project. Companies will then bid for the contract.', choices });
  if (k < keys.length) startTender(keys[k]);
}
async function speechPick() {
  if (S.pc < 1 || S.pendingEvent) return;
  const choices = GK.map(g => ({ t: `${GROUPS[g].icon} Speech to ${GROUPS[g].name.toLowerCase()} in ${reg(UI.region).city[2]}`, note: `Approval ${fmt(S.ga[g])}% · +3 · ⭐1` }));
  choices.push({ t: '📺 Address to the Nation (live TV)', note: 'Everyone +1.5 · ⭐2', disabled: S.pc < 2 });
  choices.push({ t: 'Cancel', note: '' });
  const k = await choiceModal({ icon: '🎤', title: 'Give a speech', text: 'Your speechwriters have prepared the text. You will deliver it from the podium.', choices });
  if (k < GK.length) speech(GK[k]); else if (k === GK.length) speech('nation');
}
function cityCard() {
  const r = reg(UI.region), camp = S.phase === 'campaign';
  const ra = camp ? poll(r).share * 100 : regionApproval(r);
  const people = r.pop * (S.pop || 24) / 100;
  const moodChip = g => { const v = cityMood(g, r.id); return `<span class="chip" title="${GROUPS[g].name}">${GROUPS[g].icon} ${v >= 60 ? '😊' : v < 40 ? '😠' : '😐'} ${fmt(v)}%</span>`; };
  const office = !camp && UI.view === 'office';
  const title = office ? `<b>🏛️ Office of the ${ROLE.title}</b><span class="muted small">${myFlag()} ${esc(S.country)} · ${turnLabel()} · approval ${fmt(approval())}%</span>`
    : `<b>${camp ? '📣 Campaign trail:' : '🏙️'} ${r.city[2]}</b><span class="muted small">${r.name} · ${people < .1 ? Math.round(people * 1000).toLocaleString('en') + 'k' : fmt(people, 1) + 'M'} people · ${camp ? 'support for you' : 'mood'} ${ra >= 60 ? '😊' : ra < 40 ? '😠' : '😐'} ${fmt(ra)}%</span>`;
  return `<div class="card citycard ${UI.pin !== false ? 'pin' : ''} ${UI.mini ? 'mini' : ''}">
    <div class="cv-head"><div class="cv-title">${title}</div><button class="pinbtn" data-act="mini" title="${UI.mini ? 'Show' : 'Hide'} the animated scene">${UI.mini ? '🔽' : '🔼'}</button><button class="pinbtn" data-act="pin" title="Keep the panel pinned at the top">${UI.pin !== false ? '📌' : '📍'}</button>
      <div class="moods">${GK.filter(g => r.mix[g] > 0).map(moodChip).join('')}</div>${regionPicker()}</div>
    <div class="cv-wrap"><canvas id="city" aria-label="Animated view of ${r.city[2]}"></canvas><div id="cv-tip"></div><div class="cv-hint">${office ? 'your office · aides bring papers · the TV shows the latest news' : 'drag to explore · hover people &amp; buildings'}</div></div>
    ${cityBar(camp)}
  </div>`;
}
const TABS = [['agenda', '📜 Manifesto'], ['team', '👥 Government'], ['money', '🏦 Money'], ['budget', '💰 Budget'], ['build', '🏗️ Build'], ['mega', '🚧 Megaprojects'], ['housing', '🏘️ Housing'], ['laws', '📜 Laws'], ['parl', '🏛️ Parliament'], ['defense', '🛡️ Defense'], ['people', '👥 People']];
function renderGovern() {
  const ap = approval(), pp = partyById(S.player.party), inTerm = (S.turn - 1) % TT() + 1;
  const tabHTML = { team: () => Team.html(), agenda: () => Manifesto.html(), money: () => Money.html(), mega: () => Mega.html(), budget: budgetHTML, build: buildHTML, housing: housingHTML, laws: lawsHTML, parl: parlHTML, defense: defenseHTML, people: peopleHTML }[UI.tab]();
  return `${cityCard()}${Targets.card()}${Assistant.card()}<div class="grid3 gov">
    <div class="card leader">
      <div class="portrait">${bubble()}${avatarSVG(S.player.look, mood(), 110, 'float')}</div>
      <h2>${esc(S.player.name)}</h2><div class="muted">${ROLE.title} of ${myFlag()} ${esc(S.country)}</div>
      <div class="party-chip" style="--pc:${pp.color}">${pp.name}</div>${Qual.badge()}
      <div class="ring" style="--v:${ap};--c:${approvalColor(ap)}"><div><b>${fmt(ap)}%</b><small>approval</small></div></div>
      <div class="kv"><span>Term</span><b>${S.term} of ${MAXT()} · half-year ${inTerm}/${TT()}</b></div>
      <div class="kv"><span>Political capital</span><b>⭐ ${S.pc}</b></div>
      <div class="kv"><span>GDP</span><b>${bigMoney(gdpReal())} ${S.lastGrowth !== undefined ? `<em class="${S.lastGrowth >= 0 ? 'up' : 'down'}">${sign(S.lastGrowth)}%</em>` : ''}</b></div>
      <div class="kv"><span>Debt</span><b class="${debtPct() > (S.debtSoft || 80) + 20 ? 'bad' : ''}">${fmt(debtPct())}% of GDP</b></div>
      <div class="kv"><span>Parliament</span><b class="${coalitionSeats() >= majority() ? 'good' : 'bad'}">${coalitionSeats()}/${S.parl.size || 100} seats</b></div>
      <div class="kv"><span>International reputation</span><b>🌐 ${fmt(S.rep || 50)}</b></div>
      <div class="kv"><span>War risk</span><b class="${warRisk()[1]}">${warRisk()[0]}</b></div>
      ${promisesHTML()}
      <button class="btn primary big wide" data-act="endTurn" ${S.pendingEvent ? 'disabled' : ''}>${S.turn % TT() === 0 ? (S.term >= MAXT() ? 'Finish your time in office →' : 'End term → election') : 'End half-year →'}</button>
    </div>
    <div class="card">
      ${mapSVG('gov')}
      <p class="muted small center">Tap a region to inspect it and build there.</p>
      ${overviewHTML()}
      <h3>The nation</h3>${SK.map(statBar).join('')}
    </div>
    <div class="card">
      <div class="tabs">${TABS.map(([k, l]) => `<button class="${UI.tab === k ? 'on' : ''}" data-act="tab" data-id="${k}">${l}</button>`).join('')}</div>
      ${tabHTML}
    </div>
  </div>`;
}
function renderOver() {
  const R = S.result;
  const head = { 'lost-first': ['🗳️', 'You lost the election'], 'impeached': ['⚖️', 'Removed from office'], 'lost-re': ['📦', 'Voted out after one term'], 'retired': ['🎖️', 'Two terms complete!'] }[R.reason];
  const m = R.reason === 'retired' ? 1 : R.reason === 'lost-re' && R.score >= 1200 ? 0 : -1;
  return `<div class="card over">
    <div class="m-icon">${head[0]}</div><div class="kicker center">${head[1]}</div>
    ${avatarSVG(S.player.look, m, 140, 'float')}
    <h1 class="legacy-title">${R.title}</h1>
    <div class="score">Legacy score <b>${R.score}</b></div>
    ${R.reason !== 'lost-first' ? `<div class="report">
      <div><span>Half-years in office</span><b>${R.served}</b></div>
      <div><span>Average approval</span><b>${fmt(R.avgAp)}%</b></div>
      <div><span>Development</span><b>${devLevel(R.dev)} (${fmt(R.dev)})</b></div>
      <div><span>Population</span><b>${fmt(S.pop, 1)}M</b></div>
      <div><span>Final GDP</span><b>${bigMoney(gdpReal())}</b></div>
      <div><span>Final debt</span><b>${fmt(debtPct())}% of GDP</b></div>
      <div><span>Projects completed</span><b>${S.built}</b></div>
      <div><span>Homes sold to citizens</span><b>${S.housing.sold.toLocaleString()}</b></div>
      <div><span>Laws passed</span><b>${S.laws.length}</b></div>
      <div><span>Promises kept</span><b>${R.kept} / ${R.kept + R.broken}</b></div></div>
      <div class="statchanges">${SK.map(k => `<span class="chip">${STATS[k].icon} ${fmt(S.stats[k])}</span>`).join('')}</div>`
      : `<p class="center muted">You won ${S.lastElection.evP} of 100 ${ROLE.ev} and ${fmt(S.lastElection.pvShare, 1)}% of the popular vote. Try a different strategy — promises, rallies in big regions, and a good debate night.</p>`}
    <div class="menu row">
      ${Cloud.enabled ? `<button class="btn" id="submitBtn" data-act="submitScore" ${R.submitted ? 'disabled' : ''}>${R.submitted ? '✓ Submitted' : '🌍 Submit to online Hall of Fame'}</button>` : ''}
      <button class="btn primary big" data-act="playAgain">Play again</button>
      <button class="btn ghost" data-act="hall">🏆 Hall of Fame</button>
    </div></div>`;
}
function renderHall() {
  const best = store.get(BEST_KEY) || [];
  const row = (e, i) => `<div class="hrow"><span class="rank">${i + 1}</span><span class="hname"><b>${esc(e.name)}</b><small>${esc(e.country || '')} · ${esc(e.title || '')}</small></span><span class="hparty" style="color:${(partyById(e.party) || {}).color || '#ccc'}">●</span><b>${e.score}</b></div>`;
  let cloud = '';
  if (Cloud.enabled) {
    cloud = `<h3>🌍 Online</h3>` + (UI.cloud === 'loading' || UI.cloud === null ? '<p class="muted">Loading…</p>' : UI.cloud === 'error' ? '<p class="bad">Could not load the online board.</p>' : UI.cloud.length ? UI.cloud.map(row).join('') : '<p class="muted">No entries yet — be the first!</p>');
  }
  return `<div class="card hall"><h2>🏆 Hall of Fame</h2>
    <h3>On this device</h3>${best.length ? best.map(row).join('') : '<p class="muted">No finished games yet.</p>'}
    ${cloud}
    <div class="center"><button class="btn primary" data-act="home">Back</button></div></div>`;
}

function render() {
  const app = $('#app');
  document.body.dataset.screen = UI.screen;
  let html = '';
  switch (UI.screen) {
    case 'title': html = renderTitle(); break;
    case 'setup': html = renderSetup(); break;
    case 'campaign': html = renderCampaign(); break;
    case 'election': html = renderElection(); break;
    case 'govern': html = renderGovern(); break;
    case 'over': html = renderOver(); break;
    case 'hall': html = renderHall(); break;
    case 'online': html = Online.render(); break;
  }
  app.innerHTML = html;
  renderTop(); renderTicker(); postRender();
}

// ---------- input ----------
const ACT = {
  home: () => { UI.screen = 'title'; render(); },
  newGame: () => { if (S) save(); UI.pendingOnline = null; UI.screen = 'setup'; render(); },
  continue: () => { if (S && S.online) save(); const s = store.get(SAVE_KEY); if (s) { S = s; resume(); } },
  hall: () => { UI.screen = 'hall'; render(); loadCloud(); },
  online: () => Online.open(),
  install: () => PWA.install(),
  cosToggle: () => { UI.cosOpen = UI.cosOpen === false; render(); },
  assistOff: () => Assistant.set(false),
  loans: () => Loans.discuss(),
  draftBill: () => Drafter.open(),
  tbIssue: () => TBills.issue(),
  learn: d => School.open(d.id),
  school: () => School.open(),
  pollInfo: () => RealCamp.pollInfo(),
  setParty: d => { UI.setup.party = d.id; render(); },
  setQual: d => { UI.setup.qual = d.id; render(); },
  learnTerm: d => Qual.learn(d.id),
  glossary: d => Qual.glossary(d.id),
  targets: () => Targets.details(),
  advisers: () => Advisers.office(),
  presser: () => Presser.run(),
  qtime: () => QTime.run(),
  oil: d => Oil.act(d.id),
  adv: d => Advisers.act(d.id),
  look: d => { UI.setup.look[d.k] = d.v; render(); },
  randomLook: () => { UI.setup.look = randomLook(); render(); },
  startGame: () => newGame(),
  region: d => { UI.view = 'city'; if (S.phase === 'govern' && !['build', 'housing'].includes(UI.tab)) UI.tab = 'build'; UI.region = d.id; render(); if (S.phase === 'campaign' && S.online) Online.pushLive({ region: d.id, act: 'Touring' }); },
  camp: d => campAction(d.id),
  endWeek: () => endWeek(),
  afterElection: () => afterElection(),
  tab: d => { UI.tab = d.id; render(); if (d.scroll) { const t = $('.tabs'), card = $('.citycard'); if (t) { const off = (UI.pin !== false && card ? card.offsetHeight : 0) + 70; window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - off, behavior: 'smooth' }); } } },
  office: () => { UI.view = 'office'; render(); },
  pin: () => { UI.pin = UI.pin === false; render(); },
  foreign: () => Diplomacy.menu(),
  buildPick: () => buildPick(),
  cabinet: () => Cabinet.meeting(),
  speechPick: () => speechPick(),
  law: d => proposeLaw(d.id),
  speech: d => speech(d.g),
  tender: d => startTender(d.id),
  finAct: d => Money.decide(d.id),
  experts: d => Experts.open(d.id),
  speed: d => { UI.speed = +d.id; paintClock(); },
  mini: () => { UI.mini = !UI.mini; render(); },
  manifesto: () => Manifesto.campaignDoc(),
  housePrice: d => { S.housing.price = d.id; save(); render(); },
  buildHousing: () => { UI.tab = 'build'; render(); startTender('housing'); },
  invite: d => inviteCoalition(d.id),
  leaveCoal: d => leaveCoalition(d.id),
  mil: d => upgradeMil(d.id),
  diplo: () => diplomacy(),
  alliance: () => toggleAlliance(),
  endTurn: () => endTurn(),
  mega: d => Mega.act(d.id),
  resort: d => Resorts.act(d.id),
  submitScore: () => submitCloud(),
  setCountry: d => { UI.setup.countryId = d.id; applyCountry(d.id); render(); },
  playAgain: () => { S = null; UI.speech = null; UI.screen = 'setup'; render(); },
  menu: () => openMenu(),
};
function openMenu() {
  if (UI.busy || $('#modal').classList.contains('open')) return;
  const m = modal(`<div class="m-icon">☰</div><h2>Menu</h2><div class="choices">
    <button class="choice" id="mn-resume"><b>▶ Resume</b></button>
    <button class="choice" id="mn-title"><b>🏠 Save & go to title screen</b></button>
    <button class="choice" id="mn-sound"><b>🔊 Sound & music</b><span class="fx">Sound effects ${Sound.pref().fx ? 'on' : 'off'} · music ${Sound.pref().music ? 'on' : 'off'}</span></button>
    <button class="choice" id="mn-gloss"><b>📖 Key terms glossary</b><span class="fx">GDP, deficit, debt, inflation, reserves, majority… explained simply</span></button>
    <button class="choice" id="mn-school"><b>📘 Finance School</b><span class="fx">Lessons & quizzes: T-bills, currency swaps, bonds, reserves, inflation…</span></button>
    <button class="choice" id="mn-assist"><b>🧭 Assistant mode: ${Assistant.on() ? 'ON' : 'OFF'}</b><span class="fx">${Assistant.on() ? 'Tap to hide the Chief of Staff and all guidance' : 'Tap to get step-by-step guidance on running the country'}</span></button>
    ${PWA.canShow() ? '<button class="choice" id="mn-inst"><b>📲 Install as an app</b><span class="fx">Home-screen icon, full screen, works offline</span></button>' : ''}
    ${S && S.phase !== 'over' ? '<button class="choice" id="mn-quit"><b>🗑️ Abandon this game</b><span class="fx">Deletes your saved progress</span></button>' : ''}</div>`);
  $('#mn-resume', m).onclick = closeModal;
  $('#mn-sound', m).onclick = () => { closeModal(); Sound.panel(); };
  $('#mn-gloss', m).onclick = () => { closeModal(); Qual.glossary(); };
  $('#mn-school', m).onclick = () => { closeModal(); School.open(); };
  $('#mn-assist', m).onclick = () => { closeModal(); Assistant.set(!Assistant.on()); };
  const ins = $('#mn-inst', m); if (ins) ins.onclick = () => { closeModal(); PWA.install(); };
  $('#mn-title', m).onclick = () => { closeModal(); save(); UI.screen = 'title'; render(); };
  const q = $('#mn-quit', m);
  if (q) q.onclick = () => { closeModal(); store.del(saveKey()); S = null; UI.screen = 'title'; render(); };
}
function resume() {
  UI.walkFrom = null; UI.speech = 'Welcome back!';
  applyCountry(S.countryId || 'veloria');
  RK.forEach(r => {          // a region added after this game was saved (e.g. Fuvahmulah City)
    if (S.buildings && !S.buildings[r]) S.buildings[r] = reg(r).coast ? ['school', 'port'] : ['school'];
    if (S.regionMods && S.regionMods[r] === undefined) S.regionMods[r] = 0;
    if (S.housing && S.housing.stock && S.housing.stock[r] === undefined) S.housing.stock[r] = 0;
    if (S.camp) { if (S.camp.rbP && S.camp.rbP[r] === undefined) S.camp.rbP[r] = 0; if (S.camp.rbO && S.camp.rbO[r] === undefined) S.camp.rbO[r] = 0; }
  });
  Drafter.register();
  if (S.player && !S.player.qual) { S.player.qual = 'teacher'; S.qualDone = 1; }   // saves from before qualifications
  if (S.deck && !S.localDeck) { S.localDeck = 1; if (!Local.has(S.deck)) S.deck = shuffle(Local.deckIds()); }   // older saves: add the country's own events
  if (typeof Mega !== 'undefined') Mega.init();
  if (S.online && S.online.gid) Net.ready().then(ok => { if (ok) Online.enter(S.online.gid); });
  if (!S.scale) S.scale = 1; if (!S.termTurns) S.termTurns = 8; if (!S.maxTerms) S.maxTerms = 2;
  if (S.stats && S.infl === undefined) World.init();
  if (S.stats) initGovExtras();
  if (!S.buildings) S.buildings = JSON.parse(JSON.stringify(START_BUILDINGS));
  if (S.phase === 'campaign') UI.screen = 'campaign';
  else if (S.phase === 'election') { UI.screen = 'election'; UI.revealed = S.elec.order.length; }
  else if (S.phase === 'govern') UI.screen = 'govern';
  else if (S.phase === 'waiting' || S.phase === 'member') { UI.screen = 'online'; setTimeout(() => Online.open(), 0); }
  else UI.screen = 'title';
  render();
  if (S.phase === 'govern' && S.pendingEvent) turnStart();
}

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el || el.disabled) return;
  const fn = ACT[el.dataset.act];
  if (fn) fn(el.dataset, el);
});
document.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.input) {
    UI.setup[t.dataset.input] = t.value;
    if (t.dataset.input === 'name') { const p = $('.pname'); if (p) p.textContent = t.value || 'Your Name'; }
  } else if (t.dataset.budget && S && S.budget) {
    const k = t.dataset.budget; S.budget[k] = +t.value;
    $('#v-' + k).textContent = t.value + (k === 'tax' ? '%' : '');
    $('#proj').innerHTML = projHTML();
    save();
  }
});
// budget sliders: show the expected impact when the slider is released
document.addEventListener('change', e => {
  const t = e.target; if (!t.dataset || !t.dataset.budget || !S || !S.budget) return;
  const k = t.dataset.budget, v = +t.value, old = UI.budgetWas && UI.budgetWas[k] !== undefined ? UI.budgetWas[k] : v;
  UI.budgetWas = { ...S.budget }; if (v === old) return;
  const up = v > old, d = Math.abs(v - old);
  const FX = { tax: { g: { business: up ? -3 : 3, workers: up ? -1 : 1 }, s: { economy: up ? -1 : 1 } }, health: { g: { elderly: up ? 2 : -2 }, s: { health: up ? 2 : -2 } }, education: { g: { youth: up ? 2 : -2 }, s: { education: up ? 2 : -2 } },
    security: { g: { elderly: up ? 1 : -1, youth: up ? -1 : 1 }, s: { security: up ? 2 : -2 } }, infra: { g: { farmers: up ? 2 : -2 }, s: { economy: up ? 1 : -1 } }, welfare: { g: { workers: up ? 2 : -2, elderly: up ? 2 : -2 } } }[k];
  const money1 = k === 'tax' ? `Revenue ${up ? '+' : '−'}${fmt(d, 0)}% of GDP a year` : `Spending ${up ? '+' : '−'}${fmt(d, 0)}% of GDP a year`;
  Impact.show(`Budget: ${k === 'tax' ? 'tax rate' : k} ${up ? '▲' : '▼'} to ${v}${k === 'tax' ? '%' : ''}`, null, { fx: FX, expected: `${money1}, so the deficit ${(k === 'tax') === up ? 'falls' : 'rises'}.`, when: 'from this half-year', lesson: 'Budget changes act slowly on services (a new hospital budget takes time to show) but at once on the deficit.' });
});
['focusin', 'pointerdown'].forEach(ev => document.addEventListener(ev, e => { if (e.target.dataset && e.target.dataset.budget && S && S.budget) UI.budgetWas = { ...S.budget }; }));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('#modal').classList.contains('open') && $('#pk-x')) $('#pk-x').click(); });

// ---------- boot ----------
render();
Cloud.init();
