/* ============================================================
   City view — an animated side-view scene of the selected region.
   Draws every building the player owns, construction sites,
   citizens (with their mood), cars, planes, ships and the president.
   Uses globals from data.js and game.js at runtime.
   ============================================================ */
'use strict';
const City = (() => {
  const H = 300, HORIZON = 188, BASE = 244, WALK = 255, ROAD_T = 262, ROAD_B = 294;
  const FILLERS = { capital: ['townhall', 'shops', 'apartments'], industry: ['houses', 'shops'], coast: ['cafe', 'houses'], farm: ['barn', 'houses'], mountain: ['chalets', 'mine'], desert: ['bazaar', 'houses'], jungle: ['houses', 'barn'] };
  const themeOf = id => (reg(id) && reg(id).theme) || 'farm';
  const LOT_W = { bazaar: 150, housing: 170, hospital: 150, school: 175, airport: 290, port: 250, factory: 155, solar: 185, coal: 135, base: 185, park: 175, site: 160,
    townhall: 175, shops: 150, apartments: 120, houses: 150, cafe: 125, barn: 160, chalets: 140, mine: 120 };
  const FILLER_NAMES = { bazaar: '🧺 Bazaar', townhall: '🏛️ Palace', shops: '🛍️ Shops', apartments: '🏢 Apartments', houses: '🏡 Homes', cafe: '☕ Beach café', barn: '🐄 Family farm', chalets: '🏔️ Mountain homes', mine: '⛏️ Old mine' };
  const WORK = { workers: ['factory', 'site', 'port', 'coal', 'mine', 'shops', 'bazaar'], business: ['bazaar', 'shops', 'townhall', 'airport', 'port', 'apartments'], farmers: ['barn', 'solar', 'shops'], youth: ['school', 'park', 'cafe', 'shops'], elderly: ['park', 'hospital', 'shops', 'cafe'] };
  const GLOOK = {
    workers: { shirt: '#f97316', pants: '#1e3a8a', hat: 'hard' },
    business: { shirt: '#1f2937', pants: '#111827', hair: '#3b2a1a', brief: true },
    farmers: { shirt: '#65a30d', pants: '#3f6212', hat: 'straw' },
    youth: { pants: '#1d4ed8', hair: '#1f1308', pack: true },
    elderly: { shirt: '#94a3b8', pants: '#475569', hair: '#e5e7eb', cane: true },
    soldier: { shirt: '#4d7c0f', pants: '#365314', hat: 'helmet' },
  };
  const YOUTH_SHIRTS = ['#ec4899', '#06b6d4', '#a855f7', '#eab308', '#ef4444', '#14b8a6'];
  const SKINS = ['#f5d0b5', '#e0ac69', '#c68642', '#8d5524', '#5c3a21'];
  const CAR_COLORS = ['#ef4444', '#3b82f6', '#f8fafc', '#facc15', '#22c55e', '#111827', '#a855f7', '#f97316'];
  const SIGNS = { workers: 'JOBS NOW!', business: 'LOWER TAXES', farmers: 'SAVE FARMS', youth: 'OUR FUTURE', elderly: 'PENSIONS!' };
  const EMO = { 1: '😊', 0: '😐', '-1': '😠' };
  const LINES = {
    happy: {
      workers: ['Good jobs in this town!', 'Fair pay at last!', 'Proud of my work.'],
      business: ['Business is booming!', 'Great time to invest.', 'Sales are up!'],
      farmers: ['Good harvest this year!', 'Life is good on the farm.'],
      youth: ['Love this city!', 'So much to do here!', 'The future looks bright.'],
      elderly: ['Things are getting better.', 'I feel safe here.', 'Lovely day for a walk.'],
    },
    neutral: {
      workers: ['Could be better.', 'Another long shift...'], business: ['Hmm, we\'ll see.', 'Markets are nervous.'],
      farmers: ['Need some rain.', 'Prices could be better.'], youth: ['Rent is pretty high...', 'Bit boring here.'],
      elderly: ['Prices keep rising...', 'In my day...'],
    },
    angry: {
      workers: ['We need jobs!', 'Wages are too low!', 'Who cares about us?'], business: ['Taxes are killing us!', 'Too much red tape!'],
      farmers: ['Nobody cares about farmers!', 'Our roads are terrible!'], youth: ['Rent is way too high!', 'We want a future!'],
      elderly: ['My pension is too small!', 'Hospital queues are endless!'],
    },
  };
  const LOT_LINES = { hospital: 'Great new hospital!', school: 'My kids love this school.', park: 'What a lovely park!', factory: 'Good jobs at the factory.',
    airport: 'Flying abroad next week!', port: 'So many ships today!', solar: 'Clean energy, nice!', coal: 'That smoke though...', base: 'I feel safe.',
    housing: 'I just bought a home here!', site: 'What are they building?', townhall: 'There\'s the palace!', shops: 'Shopping time!', cafe: 'Best coffee in town.',
    barn: 'Busy harvest season.', mine: 'Long shift today.', apartments: 'Nice neighbours here.', houses: 'Home sweet home.', chalets: 'Fresh mountain air!' };
  const PREZ_LINES = { site: 'Keep up the great work!', hospital: 'How are the patients?', school: 'Study hard, kids!', factory: 'Our workers are the best!',
    airport: 'Welcome to our country!', port: 'Exports are booming!', solar: 'Clean power for all!', coal: 'We need more energy.', base: 'Thank you for your service!',
    park: 'Enjoy the park, everyone!', housing: 'Homes for every family!', townhall: 'Back to the office...', shops: 'How is business?', barn: 'Our farmers feed the nation!' };

  let cv = null, ctx = null, raf = 0, region = null, sig = '', cssW = 0, cssH = 0;
  let lots = [], people = [], parts = [], cars = [], hwCars = [], clouds = [];
  let worldW = 1000, viewW = 1000, scale = 1, cam = 0, lastT = 0, time = 0;
  let drag = null, lastInteract = -99, autoDir = 1, prez = null, highway = false, env = .55, ev = null, oppStage = null;
  const imgCache = {};
  const camp = () => S && S.phase === 'campaign' && S.camp;
  function imgFor(look, m) {
    const key = JSON.stringify(look) + m;
    if (!imgCache[key]) { const im = new Image(); im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140">${avatarInner(look, m)}</svg>`); imgCache[key] = im; }
    return imgCache[key];
  }
  function wrapLines(t, maxW, size) {
    ctx.font = `800 ${size}px Inter, system-ui, sans-serif`;
    const out = []; let cur = '';
    t.split(' ').forEach(w => { const n = cur ? cur + ' ' + w : w; if (ctx.measureText(n).width > maxW && cur) { out.push(cur); cur = w; } else cur = n; });
    if (cur) out.push(cur); return out;
  }

  // ---------- helpers ----------
  const rand = (a, b) => a + Math.random() * (b - a);
  const choose = a => a[Math.floor(Math.random() * a.length)];
  const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
  function poly(pts, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]); ctx.closePath(); ctx.fill(); }
  function circ(x, y, r, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
  function line(x1, y1, x2, y2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
  function rr(x, y, w, h, r, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); ctx.fill(); }
  function windows(x, y, w, h, cols, rows, lit, seed) {
    const gw = w / cols, gh = h / rows;
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) R(x + i * gw + gw * .22, y + j * gh + gh * .22, gw * .56, gh * .52, hash(seed + i * 7 + j * 13) < lit ? '#fde68a' : '#1e3a5f');
  }
  function text(t, x, y, size, color, weight = 700, align = 'center') { ctx.font = `${weight} ${size}px Inter, system-ui, sans-serif`; ctx.textAlign = align; ctx.fillStyle = color; ctx.fillText(t, x, y); }
  function tree(x, y, s, c) { R(x - 1.5 * s, y - 10 * s, 3 * s, 10 * s, '#78350f'); circ(x, y - 14 * s, 7 * s, c); circ(x - 4 * s, y - 10 * s, 5 * s, c); circ(x + 4 * s, y - 10 * s, 5 * s, c); }
  const leaf = () => env > .55 ? '#16a34a' : env > .35 ? '#65a30d' : '#a16207';
  const face = v => v >= 60 ? 1 : v < 40 ? -1 : 0;
  function moodOf(g) {
    if (!GROUPS[g]) return 65;
    if (camp()) { const c = S.camp; return Math.max(0, Math.min(100, 50 + (c.symP[g] - c.symO[g]) * 2.2 + ((c.rbP[region] || 0) - (c.rbO[region] || 0)) * 1.5)); }
    if (!S || !S.ga) return 55;
    return Math.max(0, Math.min(100, S.ga[g] + (S.regionMods ? S.regionMods[region] * .5 : 0)));
  }
  const lotAt = x => lots.find(l => x >= l.x && x <= l.x + l.w);
  function lotName(l) { if (l.type === 'townhall') return '🏛️ ' + ROLE.palace; return l.type === 'site' ? `🚧 ${PROJECTS[l.p.type].name}` : PROJECTS[l.type] ? `${PROJECTS[l.type].icon} ${PROJECTS[l.type].name}` : FILLER_NAMES[l.type]; }

  // ---------- scene setup ----------
  function signature() {
    if (!S || !S.buildings) return '';
    const rid = UI.region;
    return JSON.stringify([rid, S.buildings[rid], (S.projects || []).filter(p => p.region === rid).map(p => [p.type, p.turnsLeft]),
      S.housing ? S.housing.stock[rid] > 0 : 0, S.ga && S.phase === 'govern' ? GK.filter(g => S.ga[g] + S.regionMods[rid] * .5 < 35) : [], S.turn, Math.round(viewW / 50),
      S.phase, S.camp ? [S.camp.week, S.camp.oppAt, S.opp.name] : 0]);
  }
  function pickGroup(r) { let x = Math.random(), acc = 0; for (const g of GK) { acc += r.mix[g]; if (x <= acc) return g; } return 'workers'; }
  function newWalker(g) {
    return { kind: 'walker', g, x: Math.random() * worldW, y: WALK + rand(-2, 2), dir: Math.random() < .5 ? 1 : -1, speed: rand(14, 26), phase: Math.random() * 6,
      size: rand(.92, 1.05), skin: choose(SKINS), shirt: g === 'youth' ? choose(YOUTH_SHIRTS) : null, state: 'walk', timer: rand(2, 6), bubble: null, nextTalk: rand(1, 9) };
  }
  function newCar(lane) { return { x: Math.random() * worldW, lane, speed: rand(35, 70), color: choose(CAR_COLORS), bus: Math.random() < .15 }; }
  function build() {
    const r = reg(region);
    const bl = S.buildings[region] || [];
    const sites = (S.projects || []).filter(p => p.region === region);
    highway = bl.includes('highway');
    const fill = FILLERS[themeOf(region)] || FILLERS.farm;
    const main = bl.filter(b => b !== 'highway').sort((a, b) => (a === 'airport' ? -1 : 0) - (b === 'airport' ? -1 : 0));
    const order = [{ type: fill[0] }, ...main.map(t => ({ type: t })), ...sites.map(p => ({ type: 'site', p })), ...fill.slice(1).map(t => ({ type: t }))];
    const pi = order.findIndex(o => o.type === 'port'); if (pi >= 0) order.push(order.splice(pi, 1)[0]);
    let x = 30;
    lots = order.map(o => { const l = { ...o, x, w: LOT_W[o.type] }; x += l.w + 24; return l; });
    worldW = Math.max(x + 6, viewW);
    if (x + 6 < viewW) { const off = (viewW - x - 6) / 2; lots.forEach(l => l.x += off); }
    people = []; parts = [];
    const n = Math.round(8 + r.pop * .55);
    for (let i = 0; i < n; i++) people.push(newWalker(pickGroup(r)));
    lots.forEach(l => {
      if (l.type === 'site') for (let k = 0; k < 3; k++) people.push({ kind: 'builder', g: 'workers', x: l.x + 28 + k * 32, y: WALK - 3, dir: k % 2 ? -1 : 1, phase: k * 2, size: 1, skin: choose(SKINS), state: 'work' });
      if (l.type === 'school') for (let k = 0; k < 4; k++) people.push({ kind: 'kid', g: 'youth', x: l.x + 115 + Math.random() * 45, y: WALK - 4, dir: 1, speed: rand(15, 30), phase: 0, size: .68, skin: choose(SKINS), shirt: choose(YOUTH_SHIRTS), state: 'walk', lo: l.x + 110, hi: l.x + l.w - 6 });
      if (l.type === 'base') for (let k = 0; k < 4; k++) people.push({ kind: 'soldier', g: 'soldier', x: l.x + 20 + k * 14, y: WALK - 1, dir: 1, speed: 18, phase: k, size: 1, skin: choose(SKINS), state: 'walk', lo: l.x + 10 + k * 14, hi: l.x + l.w - 60 + k * 14 });
      if (l.type === 'park') for (let k = 0; k < 2; k++) people.push({ kind: 'sitter', g: choose(['elderly', 'youth']), x: l.x + 36 + k * 13, y: WALK - 6, dir: 1, size: 1, skin: choose(SKINS), shirt: choose(YOUTH_SHIRTS), state: 'sit', phase: 0 });
    });
    const angry = S.ga && S.phase === 'govern' ? GK.filter(g => moodOf(g) < 35 && r.mix[g] > 0).sort((a, b) => moodOf(a) - moodOf(b)) : [];
    if (angry.length) { const c = lots[0]; for (let k = 0; k < 5; k++) people.push({ kind: 'protester', g: angry[0], x: c.x + 25 + k * 22, y: WALK + (k % 2) * 2, dir: 1, phase: k * 1.3, size: 1, skin: choose(SKINS), shirt: angry[0] === 'youth' ? choose(YOUTH_SHIRTS) : null, state: 'protest' }); }
    oppStage = null;
    if (camp() && S.camp.oppAt === region) {
      oppStage = { x: Math.max(200, worldW - 190), bubble: null };
      const oc = partyById(S.opp.party).color;
      for (let k = 0; k < 6; k++) { const fx = oppStage.x - 66 + k * 26 + rand(-3, 3); people.push({ kind: 'oppfan', g: pickGroup(r), x: fx, y: WALK + (k % 2) * 3, dir: fx < oppStage.x ? 1 : -1, phase: k, size: 1, skin: choose(SKINS), shirt: k % 2 ? oc : null, state: 'cheer', flag: oc }); }
    }
    if (ev && ev.region !== region) ev = null;
    const econ = S.stats ? S.stats.economy : 50;
    cars = []; const nc = Math.round(2 + econ / 18);
    for (let i = 0; i < nc; i++) cars.push(newCar(i % 2));
    if (lots.some(l => l.type === 'hospital')) cars.push({ ...newCar(0), amb: true, color: '#f8fafc' });
    hwCars = highway ? Array.from({ length: 8 }, () => ({ x: Math.random() * worldW, dir: Math.random() < .5 ? 1 : -1, speed: rand(70, 120), color: choose(CAR_COLORS) })) : [];
    clouds = Array.from({ length: 6 }, () => ({ x: Math.random() * worldW, y: rand(18, 80), s: rand(.6, 1.3), v: rand(4, 10) }));
    env = S.stats ? S.stats.environment / 100 : .55;
    if (!prez) prez = { x: lots[0].x + lots[0].w / 2, target: null, wait: 1.5, dir: 1, phase: 0, bubble: null };
    prez.x = Math.min(Math.max(prez.x, 20), worldW - 20);
  }

  // ---------- simulation ----------
  function issues() {
    const out = [];
    if (!S.stats) return out;
    if (S.stats.housing < 40) out.push('Can\'t find a home...');
    if (unemployment() > 10) out.push('No jobs around here...');
    const e = energy(); if (e.demand > e.supply) out.push('Power cut again!');
    if (S.stats.environment < 40) out.push('The air is so dirty!');
    if (S.stats.health < 40) out.push('Hospital queues are endless!');
    if (S.budget && S.budget.tax > 35) out.push('Taxes are too high!');
    if (S.threat - milStrength() > 10) out.push('Will there be a war?');
    return out;
  }
  function campLine(m) {
    const me = S.player.name.split(' ')[0], op = S.opp.name.split(' ')[0];
    if (m > 0) return choose([`Vote ${me}!`, `I'm with ${me}!`, `${me} for president!`, 'Great speech yesterday!', `${me} gets it.`]);
    if (m < 0) return choose([`${op} all the way!`, `Never voting ${me}!`, `${op} has my vote.`, 'Same old promises...']);
    return choose(['Still undecided...', 'Who should I vote for?', 'They all sound the same.', 'Show me your plan!']);
  }
  function talk(p) {
    const m = face(moodOf(p.g)), lot = lotAt(p.x), iss = issues();
    if (camp() && Math.random() < .7) { p.bubble = { text: campLine(m), until: time + 3.2 }; return; }
    let t;
    if (lot && m >= 0 && LOT_LINES[lot.type] && Math.random() < .5) t = LOT_LINES[lot.type];
    else if (m < 1 && iss.length && Math.random() < .5) t = choose(iss);
    else t = choose(LINES[m === 1 ? 'happy' : m === 0 ? 'neutral' : 'angry'][p.g]);
    p.bubble = { text: t, until: time + 3.2 };
  }
  function update(dt) {
    time += dt;
    const maxCam = Math.max(0, worldW - viewW);
    if (!drag && time - lastInteract > 5 && maxCam > 0) { cam += autoDir * 16 * dt; if (cam >= maxCam) autoDir = -1; if (cam <= 0) autoDir = 1; }
    cam = Math.max(0, Math.min(maxCam, cam));
    const talking = people.filter(q => q.bubble && q.bubble.until > time).length;
    if (ev && time > ev.t0 + ev.dur) endEvent();
    if (oppStage && !oppStage.bubble && Math.random() < dt * .35) oppStage.bubble = { text: choose(DEBATE_LINES[S.opp.party]), until: time + 2.6 };
    if (oppStage && oppStage.bubble && oppStage.bubble.until < time) oppStage.bubble = null;
    if (ev) spawnEventParts(dt);
    people.forEach(p => {
      if (p.bubble && p.bubble.until < time) p.bubble = null;
      p.phase += dt * (p.state === 'walk' || p.state === 'crowd' ? (p.speed || 26) / 3.2 : 5);
      if (p.state === 'crowd') {
        const d = p.cx - p.x;
        if (Math.abs(d) < 2) { p.x = p.cx; p.state = ev && ev.type === 'townhall' ? 'sit' : ev && ev.type === 'fund' ? 'idle' : 'cheer'; p.dir = ev ? (Math.sign(ev.x - p.x) || 1) : 1; p.timer = 99; }
        else { p.dir = Math.sign(d); p.x += p.dir * 40 * dt; }
        return;
      }
      if (p.cx != null && ev && (p.state === 'cheer' || p.state === 'sit' || p.state === 'idle')) {
        if (!p.bubble && talking < 4 && Math.random() < dt * .08) p.bubble = { text: ev.type === 'townhall' ? choose(['What about jobs?', 'How will you pay for it?', 'Thank you for coming!', 'What about rents?']) : ev.type === 'fund' ? choose(['Cheers!', 'Happy to help!', 'To victory!']) : choose([`${ev.first}! ${ev.first}!`, 'Woohoo!', `We love you, ${ev.first}!`, 'Four more years!'.replace('Four more years!', ev.chant)]), until: time + 2 };
        return;
      }
      if (p.kind === 'resident') { if (!p.said && time > p.talkAt) { p.said = true; p.bubble = { text: ev && ev.happy ? choose(['You\'ve got my vote!', 'Love your ideas!', 'Come in for tea!']) : choose(['I\'ll think about it...', 'Not interested, sorry.', 'Hmm, convince me.']), until: time + 3 }; } return; }
      if (p.kind === 'walker') {
        if (p.state === 'walk') {
          p.x += p.dir * p.speed * dt;
          if (p.x < 8) { p.x = 8; p.dir = 1; } if (p.x > worldW - 8) { p.x = worldW - 8; p.dir = -1; }
          p.timer -= dt;
          if (p.timer <= 0) {
            const lot = lotAt(p.x);
            if (lot && WORK[p.g].includes(lot.type) && Math.random() < .5) { p.state = 'inside'; p.timer = rand(3, 7); }
            else if (Math.random() < .35) { p.state = 'idle'; p.timer = rand(1.5, 4); }
            else { p.timer = rand(2, 6); if (Math.random() < .3) p.dir *= -1; }
          }
        } else { p.timer -= dt; if (p.timer <= 0) { p.state = 'walk'; p.timer = rand(3, 8); if (Math.random() < .5) p.dir *= -1; } }
        p.nextTalk -= dt;
        if (p.nextTalk <= 0 && p.state !== 'inside') { if (talking < 3) talk(p); p.nextTalk = rand(7, 16); }
      } else if (p.kind === 'kid' || p.kind === 'soldier') {
        p.x += p.dir * p.speed * dt;
        if (p.x < p.lo) { p.x = p.lo; p.dir = 1; } if (p.x > p.hi) { p.x = p.hi; p.dir = -1; }
        if (p.kind === 'kid' && Math.random() < dt * .4) p.dir *= -1;
      } else if (p.kind === 'protester' && !p.bubble && Math.random() < dt * .15) p.bubble = { text: SIGNS[p.g], until: time + 2 };
    });
    cars.forEach(c => { c.x += (c.lane ? -1 : 1) * c.speed * dt; if (c.x > worldW + 40) c.x = -40; if (c.x < -40) c.x = worldW + 40; });
    hwCars.forEach(c => { c.x += c.dir * c.speed * dt; if (c.x > worldW + 20) c.x = -20; if (c.x < -20) c.x = worldW + 20; });
    clouds.forEach(c => { c.x += c.v * dt; if (c.x > worldW + 60) c.x = -60; });
    lots.forEach(l => {
      if (l.type === 'factory' && Math.random() < dt * 7) [l.x + 28, l.x + 53].forEach(cx => parts.push({ x: cx + rand(-2, 2), y: BASE - 102, vx: rand(4, 10), vy: rand(-14, -8), r: rand(3, 6), life: 0, max: rand(3, 5), c: '110,110,120' }));
      if (l.type === 'coal' && Math.random() < dt * 6) parts.push({ x: l.x + 40 + rand(-10, 10), y: BASE - 92, vx: rand(2, 8), vy: rand(-16, -10), r: rand(6, 10), life: 0, max: rand(3, 5), c: '240,240,245' });
      if (l.type === 'park' && Math.random() < dt * 30) parts.push({ x: l.x + l.w / 2 + 20, y: BASE - 20, vx: rand(-12, 12), vy: rand(-42, -30), r: 1.4, life: 0, max: 1.1, c: '125,200,255', g: true });
    });
    parts.forEach(q => { q.life += dt; q.x += q.vx * dt; q.y += q.vy * dt; if (q.g) q.vy += 70 * dt; else if (q.conf) { q.rot += dt * 6; q.x += Math.sin(time * 3 + q.rot) * .3; } else if (!q.txt) q.r += dt * 3; });
    parts = parts.filter(q => q.life < q.max).slice(-300);
    updatePrez(dt);
  }
  function updatePrez(dt) {
    const p = prez; if (!p) return;
    if (p.bubble && p.bubble.until < time) p.bubble = null;
    if (ev && ev.prezX != null) {
      const d = ev.prezX - p.x, step = 70 * dt;
      if (Math.abs(d) > step) { p.dir = Math.sign(d); p.walking = true; p.phase += dt * 10; p.x += Math.sign(d) * step; p.onStage = false; }
      else {
        p.x = ev.prezX; p.walking = false; p.onStage = !!ev.stage; p.dir = ev.face || p.dir;
        if (!p.bubble && time - (p.lastSay || -9) > 3.3) { p.bubble = { text: choose(ev.lines), until: time + 2.6 }; p.lastSay = time; }
      }
      return;
    }
    p.onStage = false;
    if (p.wait > 0) { p.wait -= dt; p.walking = false; if (p.wait <= 0) { p.lot = choose(lots); p.target = p.lot.x + p.lot.w / 2 + rand(-25, 25); } return; }
    if (p.target == null) { p.wait = 1; return; }
    const d = p.target - p.x, step = 42 * dt;
    p.dir = Math.sign(d) || 1; p.walking = true; p.phase += dt * 9;
    if (Math.abs(d) <= step) { p.x = p.target; p.target = null; p.wait = rand(3, 5); p.walking = false; p.bubble = { text: PREZ_LINES[p.lot.type] || 'Hello, everyone!', until: time + 3 }; }
    else p.x += Math.sign(d) * step;
  }

  // ---------- campaign events ----------
  function endEvent() {
    people.forEach(p => { if (p.cx != null) { p.cx = null; p.state = 'walk'; p.timer = rand(1, 4); p.bubble = null; } });
    people = people.filter(p => p.kind !== 'resident');
    ev = null;
    if (prez) { prez.onStage = false; prez.wait = 1.5; prez.target = null; }
  }
  function event(type, data = {}) {
    if (!cv || !lots.length || !camp()) return;
    if (ev) endEvent();
    const pc = partyById(S.player.party).color, first = S.player.name.split(' ')[0], last = S.player.name.split(' ').slice(-1)[0], city = reg(region).city[2], oppN = S.opp.name.split(' ')[0];
    const x = Math.max(120, Math.min(worldW - 120, cam + viewW / 2));
    const L = {
      rally: [`Thank you, ${city}!`, 'Together we will win!', 'Are you ready for change?!', `${partyById(S.player.party).name} — forward!`],
      promise: [`I promise: ${data.text}!`, 'A promise made is a promise kept!'],
      townhall: ['Great question!', 'I hear you.', 'Here is my plan...', `${data.g ? GROUPS[data.g].name : 'You'} deserve better!`],
      tv: ['Have you seen my new ad?', 'Vote for real change!'],
      attack: [`${oppN} has no plan!`, `Can you really trust ${oppN}?`],
      fund: ['Thank you for your support!', 'Every dollar counts!', 'Cheers, everyone!'],
      door: ['Hi! Can I count on your vote?', `I'm ${first} — nice to meet you!`],
    };
    ev = { type, t0: time, dur: type === 'door' ? 7 : 10, x, data, region, lines: L[type] || ['Hello!'], stage: type === 'rally' || type === 'promise', pc, first, last: last.toUpperCase(), chant: `${first} for ${ROLE.title.toLowerCase()}!` };
    if (type === 'door') {
      const homes = lots.filter(l => ['houses', 'apartments', 'chalets', 'housing', 'barn'].includes(l.type));
      const l = homes.sort((a, b) => Math.abs(a.x + a.w / 2 - x) - Math.abs(b.x + b.w / 2 - x))[0] || lots[0];
      ev.doorX = l.x + 24; ev.x = ev.doorX; ev.prezX = ev.doorX - 16; ev.face = 1;
      const g = pickGroup(reg(region)); ev.happy = moodOf(g) >= 45;
      people.push({ kind: 'resident', g, x: ev.doorX + 2, y: WALK - 2, dir: -1, phase: 0, size: 1, skin: choose(SKINS), shirt: g === 'youth' ? choose(YOUTH_SHIRTS) : null, state: 'idle', bubble: null, talkAt: time + 2.8 });
    } else if (type === 'tv' || type === 'attack') { ev.prezX = x + 96; ev.face = -1; }
    else ev.prezX = x;
    cam = Math.max(0, Math.min(worldW - viewW, ev.x - viewW / 2)); lastInteract = time + 6;
    if (prez) { if (Math.abs(prez.x - ev.prezX) > viewW * .45) prez.x = ev.prezX + (prez.x < ev.prezX ? -1 : 1) * viewW * .45; prez.bubble = null; prez.lastSay = time - 2.5; }
    if (['rally', 'promise', 'townhall', 'fund'].includes(type)) {
      const n = type === 'fund' ? 8 : type === 'townhall' ? 10 : 16;
      people.filter(p => p.kind === 'walker' && p.state !== 'inside').sort((a, b) => Math.abs(a.x - x) - Math.abs(b.x - x)).slice(0, n).forEach((p, i) => {
        const side = i % 2 ? 1 : -1, row = Math.floor(i / 2);
        p.cx = type === 'townhall' ? x + side * (24 + row * 15) : type === 'fund' ? x + side * (14 + row * 20) : x + side * (16 + row * 12) + rand(-3, 3);
        p.state = 'crowd'; p.bubble = null; p.y = WALK + (row % 2) * 3;
      });
    }
  }
  function spawnEventParts(dt) {
    const e = ev;
    if (e.stage && Math.random() < dt * 34) parts.push({ x: e.x + rand(-110, 110), y: rand(10, 70), vx: rand(-8, 8), vy: rand(28, 50), r: rand(2, 3.5), life: 0, max: 4.5, conf: choose(['#f43f5e', '#facc15', '#22c55e', '#3b82f6', '#a855f7', '#ffffff', e.pc]), rot: rand(0, 6) });
    if (e.stage && Math.random() < dt * 2.5) parts.push({ x: e.x + rand(-70, 70), y: WALK - 40, vx: rand(-4, 4), vy: rand(-22, -14), r: 10, life: 0, max: 2, txt: choose(['👏', '🙌', '❤️', '🎉']) });
    if (e.type === 'fund' && Math.random() < dt * 4) parts.push({ x: e.x + rand(-70, 70), y: BASE - 34, vx: rand(-4, 4), vy: rand(-24, -14), r: 10, life: 0, max: 2.4, txt: choose(['💵', '💰', '🥂']) });
    if (e.type === 'door' && e.happy && time - e.t0 > 3 && Math.random() < dt * 3) parts.push({ x: e.doorX + rand(-8, 8), y: WALK - 36, vx: rand(-4, 4), vy: rand(-20, -12), r: 10, life: 0, max: 2, txt: '❤️' });
    if (e.type === 'townhall' && Math.random() < dt * .8) parts.push({ x: e.x + rand(-60, 60), y: WALK - 40, vx: 0, vy: -14, r: 10, life: 0, max: 1.6, txt: choose(['✋', '❓', '👍']) });
  }
  function stageAt(x, color, label, big) {
    const w = big ? 160 : 120, bh = big ? 92 : 72, top = BASE - 20;
    ctx.strokeStyle = '#334155'; ctx.lineWidth = 3; line(x - w / 2 - 6, top, x - w / 2 - 6, top - bh - 14); line(x + w / 2 + 6, top, x + w / 2 + 6, top - bh - 14); line(x - w / 2 - 6, top - bh - 14, x + w / 2 + 6, top - bh - 14);
    R(x - w / 2, top - bh, w, bh, color); R(x - w / 2, top - bh, w, 6, 'rgba(255,255,255,.35)'); R(x - w / 2, top - 8, w, 8, 'rgba(0,0,0,.2)');
    text('★  ★  ★', x, top - bh + 18, 9, 'rgba(255,255,255,.9)');
    const lines = wrapLines(label, w - 14, big ? 11 : 9);
    lines.slice(0, 3).forEach((l, i) => text(l, x, top - bh + 36 + i * (big ? 14 : 11), big ? 11 : 9, '#fff', 800));
    for (let i = 0; i < 8; i++) circ(x - w / 2 + 10 + i * (w - 20) / 7, top - bh - 14, 3, Math.sin(time * 6 + i) > 0 ? '#fde68a' : '#78350f');
    R(x - w / 2 - 12, top, w + 24, 20, '#1f2937'); R(x - w / 2 - 12, top, w + 24, 3, '#64748b');
    for (let i = 0; i < 10; i++) poly([x - w / 2 - 12 + i * (w + 24) / 10, top + 3, x - w / 2 - 12 + (i + 1) * (w + 24) / 10, top + 3, x - w / 2 - 12 + (i + .5) * (w + 24) / 10, top + 11], i % 2 ? color : '#ffffff');
    [x - w / 2 - 24, x + w / 2 + 12].forEach(sx => { R(sx, BASE - 46, 14, 46, '#0f172a'); circ(sx + 7, BASE - 36, 4, '#334155'); circ(sx + 7, BASE - 18, 5.5, '#334155'); });
    if (big) R(x + 18, top - 24, 14, 24, '#0f172a');
  }
  function billboard(x, attack) {
    const bx = x - 82, by = BASE - 168, bw = 164, bh = 92;
    R(x - 54, by + bh, 6, BASE - by - bh, '#475569'); R(x + 48, by + bh, 6, BASE - by - bh, '#475569');
    R(bx - 5, by - 5, bw + 10, bh + 10, '#0f172a');
    for (let i = 0; i < 14; i++) { const on = Math.floor(time * 6 + i) % 2; circ(bx - 2 + i * (bw + 4) / 13, by - 3, 2, on ? '#fde68a' : '#57534e'); circ(bx - 2 + i * (bw + 4) / 13, by + bh + 3, 2, on ? '#57534e' : '#fde68a'); }
    const g = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
    const pc = partyById(S.player.party).color;
    if (attack) { g.addColorStop(0, '#450a0a'); g.addColorStop(1, '#dc2626'); } else { g.addColorStop(0, pc); g.addColorStop(1, '#0f172a'); }
    ctx.fillStyle = g; ctx.fillRect(bx, by, bw, bh);
    const im = imgFor(attack ? S.opp.look : S.player.look, attack ? -1 : 1);
    if (im.complete) ctx.drawImage(im, bx + 4, by + 8, 70, 82);
    if (attack) {
      ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 5; line(bx + 10, by + 14, bx + 68, by + 86); line(bx + 68, by + 14, bx + 10, by + 86);
      if (Math.floor(time * 3) % 2) text('NO PLAN!', bx + 120, by + 42, 15, '#fff', 800);
      text(`${S.opp.name.split(' ').slice(-1)[0].toUpperCase()}?`, bx + 120, by + 62, 10, '#fecaca', 800); text('Think again.', bx + 120, by + 78, 8, '#fff', 600);
    } else {
      text('VOTE', bx + 120, by + 32, 12, '#fde68a', 800);
      text(S.player.name.split(' ').slice(-1)[0].toUpperCase(), bx + 120, by + 54, S.player.name.length > 12 ? 12 : 16, '#fff', 800);
      text(partyById(S.player.party).name, bx + 120, by + 72, 7, '#e2e8f0', 700); text('✔', bx + 120, by + 86, 10, '#4ade80', 800);
    }
    R(bx, by + (time * 40) % bh, bw, 2, 'rgba(255,255,255,.15)');
  }
  function gala(x) {
    const w = 190;
    R(x - w / 2, BASE - 72, 4, 72, '#e5e7eb'); R(x + w / 2 - 4, BASE - 72, 4, 72, '#e5e7eb');
    poly([x - w / 2 - 10, BASE - 72, x, BASE - 116, x + w / 2 + 10, BASE - 72], '#f8fafc');
    for (let i = 0; i < 10; i++) { ctx.fillStyle = i % 2 ? '#fbbf24' : '#fff'; ctx.beginPath(); ctx.arc(x - w / 2 - 1 + i * (w + 2) / 9.5, BASE - 72, (w + 2) / 19, 0, Math.PI); ctx.fill(); }
    text('FUNDRAISING GALA', x, BASE - 82, 8, '#a16207', 800);
    for (let i = 0; i < 13; i++) circ(x - w / 2 + 8 + i * 14.5, BASE - 62 + Math.sin(i * 1.3) * 3, 2.2, ['#fde68a', '#f472b6', '#93c5fd'][(i + Math.floor(time * 3)) % 3]);
    [-60, 0, 60].forEach(dx => { ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.ellipse(x + dx, BASE - 16, 18, 5, 0, 0, Math.PI * 2); ctx.fill(); R(x + dx - 16, BASE - 16, 32, 8, '#f1f5f9'); R(x + dx - 1, BASE - 26, 2, 8, '#fef3c7'); circ(x + dx, BASE - 27, 1.8, Math.random() < .5 ? '#f59e0b' : '#fde047'); });
    rr(x + w / 2 + 14, BASE - 14, 60, 12, 3, '#0f172a'); R(x + w / 2 + 28, BASE - 20, 30, 7, '#1e293b'); circ(x + w / 2 + 22, BASE - 2, 3, '#111'); circ(x + w / 2 + 66, BASE - 2, 3, '#111');
  }
  function townhallSet(x) {
    R(x - 100, BASE - 96, 4, 96, '#cbd5e1'); R(x + 96, BASE - 96, 4, 96, '#cbd5e1');
    R(x - 108, BASE - 100, 216, 16, '#1e40af');
    for (let i = 0; i < 12; i++) { ctx.fillStyle = i % 2 ? '#1e40af' : '#f8fafc'; ctx.beginPath(); ctx.arc(x - 99 + i * 18, BASE - 84, 9, 0, Math.PI); ctx.fill(); }
    ctx.fillStyle = 'rgba(15,23,42,.55)'; ctx.fillRect(x - 96, BASE - 75, 192, 75);
    R(x - 1, BASE - 70, 2, 50, '#475569'); rr(x - 44, BASE - 86, 88, 18, 4, '#1e3a8a'); text('TOWN HALL MEETING', x, BASE - 74, 7.5, '#fff', 800);
    R(x + 14, BASE - 26, 14, 26, '#1e293b'); R(x + 14, BASE - 26, 14, 3, ev.pc);
    people.forEach(p => { if (p.cx != null) { R(p.cx - 5, WALK - 9, 11, 2, '#78350f'); R(p.cx - 5, WALK - 9, 1.5, 9, '#78350f'); R(p.cx + 4.5, WALK - 9, 1.5, 9, '#78350f'); R(p.cx - (p.dir > 0 ? 6 : -4.5), WALK - 18, 1.5, 10, '#78350f'); } });
  }
  function drawEventBack() {
    if (oppStage) stageAt(oppStage.x, partyById(S.opp.party).color, `${S.opp.name.split(' ').slice(-1)[0].toUpperCase()} FOR ${ROLE.upper}`, false);
    if (!ev) return;
    const e = ev;
    if (e.stage) {
      [e.x - 112, e.x + 112].forEach(lx => { R(lx - 2, BASE - 130, 4, 130, '#334155'); R(lx - 7, BASE - 136, 14, 8, '#111827'); });
      stageAt(e.x, e.pc, e.type === 'promise' ? `I PROMISE: ${e.data.text.toUpperCase()}` : `${e.last} FOR ${ROLE.upper}`, true);
      for (let i = 0; i < 7; i++) { const bx = e.x - 96 + i * 32, by = BASE - 130 - ((time * 14 + i * 23) % 90); ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = .6; line(bx, by + 8, bx + Math.sin(time + i) * 2, by + 22); ctx.fillStyle = i % 2 ? e.pc : '#ffffff'; ctx.beginPath(); ctx.ellipse(bx, by, 5, 6.5, 0, 0, Math.PI * 2); ctx.fill(); }
    }
    if (e.type === 'tv' || e.type === 'attack') billboard(e.x, e.type === 'attack');
    if (e.type === 'fund') gala(e.x);
    if (e.type === 'townhall') townhallSet(e.x);
    if (e.type === 'door') { const open = Math.min(1, (time - e.t0 - 1.5) / .6); if (open > 0) R(e.doorX - 6, BASE - 18, 10 * open, 18, '#1c1917'); }
  }
  function drawEventFront() {
    if (oppStage) {
      drawCandidate(S.opp.look, 0, oppStage.x, BASE - 20, false, 0, -1, S.opp.name.split(' ').slice(-1)[0].toUpperCase(), partyById(S.opp.party).color, '#fff');
      if (oppStage.bubble) drawBubble(oppStage.x, BASE - 94, oppStage.bubble.text);
    }
    if (ev && ev.stage) {
      ctx.globalCompositeOperation = 'lighter';
      [[ev.x - 112, 0], [ev.x + 112, 2]].forEach(([lx, ph]) => {
        const tx = ev.x + Math.sin(time * 1.3 + ph) * 40;
        ctx.fillStyle = 'rgba(254,249,195,.16)'; ctx.beginPath(); ctx.moveTo(lx - 4, BASE - 134); ctx.lineTo(lx + 4, BASE - 134); ctx.lineTo(tx + 26, BASE - 10); ctx.lineTo(tx - 26, BASE - 10); ctx.closePath(); ctx.fill();
      });
      ctx.globalCompositeOperation = 'source-over';
    }
  }
  function drawCandidate(look, m, x, y, walking, phase, dir, label, labelBg, labelFg = '#1a1205') {
    const im = imgFor(look, m);
    const sw = walking ? Math.sin(phase) * 4 : 0;
    ctx.lineCap = 'round'; ctx.strokeStyle = look.suit; ctx.lineWidth = 3.4;
    line(x, y - 14, x + sw, y); line(x, y - 14, x - sw, y);
    R(x + sw - 3, y - 1, 5, 2, '#111'); R(x - sw - 3, y - 1, 5, 2, '#111');
    if (im.complete) { ctx.save(); if (dir < 0) { ctx.translate(x * 2, 0); ctx.scale(-1, 1); } ctx.drawImage(im, x - 18, y - 56, 36, 42); ctx.restore(); }
    if (label) { ctx.font = '800 5.8px Inter, system-ui, sans-serif'; const w = ctx.measureText(label).width + 10; rr(x - w / 2, y - 70, w, 10, 5, labelBg); text(label, x, y - 62.5, 5.8, labelFg, 800); }
  }

  // ---------- background ----------
  function drawSky() {
    const g = ctx.createLinearGradient(0, 0, 0, HORIZON);
    const dirty = Math.max(0, .45 - env) * 2;
    g.addColorStop(0, lerpColor('#3b82d6', '#7c8594', dirty)); g.addColorStop(1, lerpColor('#bfe6ff', '#c9c2a8', dirty));
    ctx.fillStyle = g; ctx.fillRect(0, 0, viewW, HORIZON + 10);
    circ(viewW - 70, 46, 18, 'rgba(255,236,150,.95)'); circ(viewW - 70, 46, 28, 'rgba(255,236,150,.25)');
  }
  function drawClouds() {
    clouds.forEach(c => { const x = c.x - cam * .2, s = c.s; ['#ffffff', '#ffffff', '#ffffff'].forEach((col, i) => circ(x + i * 14 * s, c.y - (i === 1 ? 6 * s : 0), (i === 1 ? 13 : 10) * s, 'rgba(255,255,255,.85)')); });
  }
  function drawBackground() {
    const W = worldW;
    switch (themeOf(region)) {
      case 'capital':
        for (let i = 0; i * 34 < W; i++) { const h = 40 + hash(i) * 70; R(i * 34, HORIZON - h, 28, h + 10, 'rgba(100,122,160,.55)'); for (let j = 0; j < h / 10 - 1; j++) if (hash(i * 3 + j) > .55) R(i * 34 + 6 + (j % 2) * 10, HORIZON - h + 6 + j * 10, 4, 4, 'rgba(255,240,180,.6)'); }
        break;
      case 'industry':
        for (let i = 0; i * 140 < W + 140; i++) poly([i * 140 - 40, HORIZON, i * 140 + 40, HORIZON - 70 - hash(i) * 30, i * 140 + 140, HORIZON], 'rgba(90,100,120,.65)');
        for (let i = 0; i * 180 < W; i++) { R(i * 180 + 60, HORIZON - 55, 8, 55, 'rgba(70,75,90,.7)'); R(i * 180 + 40, HORIZON - 22, 50, 22, 'rgba(70,75,90,.7)'); }
        break;
      case 'coast':
        R(0, HORIZON - 26, W, 36, '#2f7fd8');
        ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1;
        for (let i = 0; i * 40 < W; i++) line(i * 40 + (time * 6 % 40), HORIZON - 14 + (i % 3) * 7, i * 40 + 14 + (time * 6 % 40), HORIZON - 14 + (i % 3) * 7);
        { const bx = (time * 10) % (W + 100) - 50; poly([bx, HORIZON - 20, bx + 20, HORIZON - 20, bx + 16, HORIZON - 15, bx + 4, HORIZON - 15], '#f8fafc'); poly([bx + 10, HORIZON - 21, bx + 10, HORIZON - 40, bx + 22, HORIZON - 22], '#fff'); }
        break;
      case 'farm':
        for (let i = 0; i * 160 < W + 160; i++) { ctx.fillStyle = i % 2 ? '#9acd52' : '#c5d86d'; ctx.beginPath(); ctx.ellipse(i * 160, HORIZON + 4, 120, 34, 0, Math.PI, 0); ctx.fill(); }
        for (let i = 0; i * 90 < W; i++) R(i * 90, HORIZON - 3, 80, 4, i % 2 ? '#eab308' : '#84cc16');
        break;
      case 'desert':
        for (let i = 0; i * 150 < W + 150; i++) { ctx.fillStyle = i % 2 ? '#e8c98a' : '#dcb877'; ctx.beginPath(); ctx.ellipse(i * 150, HORIZON + 6, 130, 30, 0, Math.PI, 0); ctx.fill(); }
        for (let i = 0; i * 240 < W; i++) { const x = i * 240 + 60; R(x, HORIZON - 46, 22, 46, 'rgba(56,189,248,.55)'); ctx.fillStyle = 'rgba(14,116,144,.6)'; ctx.beginPath(); ctx.arc(x + 11, HORIZON - 46, 11, Math.PI, 0); ctx.fill(); R(x + 28, HORIZON - 62, 7, 62, 'rgba(194,120,60,.7)'); }
        for (let i = 0; i * 120 < W; i++) { const x = i * 120 + 30; R(x - 1, HORIZON - 22, 3, 22, '#7c5a2a'); ctx.strokeStyle = '#3f7d20'; ctx.lineWidth = 2; for (let k = 0; k < 5; k++) line(x, HORIZON - 22, x + Math.cos(k * 1.2 + 3.6) * 10, HORIZON - 22 + Math.sin(k * 1.2 + 3.6) * 6); }
        break;
      case 'jungle':
        for (let i = 0; i * 30 < W + 30; i++) { const x = i * 30, h = 50 + hash(i) * 40; R(x + 12, HORIZON - h * .4, 4, h * .4, '#3f2a14'); circ(x + 14, HORIZON - h * .45, 18 + hash(i + 3) * 8, i % 2 ? '#166534' : '#15803d'); }
        R(0, HORIZON - 4, W, 8, '#3b82a6');
        break;
      case 'mountain':
        for (let i = 0; i * 170 < W + 170; i++) { const hh = 100 + hash(i) * 50, cx = i * 170 + 40; poly([cx - 110, HORIZON, cx, HORIZON - hh, cx + 110, HORIZON], 'rgba(100,116,139,.8)'); poly([cx - 24, HORIZON - hh + 24, cx, HORIZON - hh, cx + 24, HORIZON - hh + 24, cx + 8, HORIZON - hh + 20, cx - 6, HORIZON - hh + 28], '#f8fafc'); }
        for (let i = 0; i * 26 < W; i++) { const x = i * 26 + hash(i) * 10; poly([x - 7, HORIZON + 2, x, HORIZON - 20, x + 7, HORIZON + 2], '#166534'); }
        break;
    }
  }
  function drawGround() {
    const th = themeOf(region); R(0, HORIZON, worldW, BASE - HORIZON, th === 'desert' ? lerpColor('#c9a86a', '#d9c08a', env) : th === 'jungle' ? lerpColor('#8a9a4a', '#2f9e44', env) : lerpColor('#b4a26a', '#5fbf5a', env));
    if (th === 'desert') { for (let i = 0; i * 64 < worldW; i++) if (hash(i * 3) < .5) { const x = i * 64; R(x, HORIZON + 22, 2, 8, '#65a30d'); R(x - 3, HORIZON + 24, 2, 4, '#65a30d'); R(x + 3, HORIZON + 23, 2, 4, '#65a30d'); } }
    else
    for (let i = 0; i * 48 < worldW; i++) if (hash(i * 5) < env + .1) tree(i * 48 + hash(i) * 20, HORIZON + 22, .8, leaf());
    if (highway) {
      for (let x = 30; x < worldW; x += 110) R(x, HORIZON - 8, 8, BASE - HORIZON + 8, '#9ca3af');
      R(0, HORIZON - 14, worldW, 8, '#6b7280'); R(0, HORIZON - 15, worldW, 2, '#d1d5db');
      hwCars.forEach(c => { R(c.x - 6, HORIZON - 19, 12, 5, c.color); R(c.x - 3, HORIZON - 22, 6, 3, '#bae6fd'); });
    }
  }
  function drawStreet() {
    R(0, BASE, worldW, ROAD_T - BASE, '#cbd5e1');
    ctx.strokeStyle = 'rgba(100,116,139,.35)'; ctx.lineWidth = 1;
    for (let x = 0; x < worldW; x += 22) line(x, BASE, x, ROAD_T);
    R(0, ROAD_T - 2, worldW, 2, '#94a3b8');
    R(0, ROAD_T, worldW, ROAD_B - ROAD_T, '#374151');
    for (let x = 0; x < worldW; x += 30) R(x, (ROAD_T + ROAD_B) / 2 - 1, 16, 2, '#facc15');
    R(0, ROAD_B, worldW, H - ROAD_B, '#1f2937');
    const share = camp() ? poll(reg(region)).share : 0, pc = camp() ? partyById(S.player.party).color : 0, oc = camp() ? partyById(S.opp.party).color : 0;
    for (let x = 60; x < worldW; x += 160) {
      R(x, BASE - 34, 2, 34, '#475569'); circ(x + 1, BASE - 35, 3, env > .3 ? '#fde68a' : '#94a3b8');
      if (camp()) { const mine = hash(x) < share; R(x + 3, BASE - 30, 12, 15, mine ? pc : oc); text((mine ? S.player.name : S.opp.name)[0], x + 9, BASE - 19, 8, '#fff', 800); R(x + 3, BASE - 30, 12, 2, '#fff'); }
    }
  }
  function drawCars() {
    cars.forEach(c => {
      const y = c.lane ? ROAD_B - 9 : ROAD_T + 12, d = c.lane ? -1 : 1, len = c.bus ? 40 : 24;
      rr(c.x - len / 2, y - 8, len, 8, 2, c.amb ? '#f8fafc' : c.bus ? '#f59e0b' : c.color);
      rr(c.x - len / 2 + (d > 0 ? 4 : len / 2 - 6), y - 13, c.bus ? len - 8 : 12, 6, 2, c.bus ? '#f59e0b' : c.color);
      R(c.x - len / 2 + (d > 0 ? 6 : len / 2 - 4), y - 12, c.bus ? len - 12 : 8, 4, '#bae6fd');
      if (c.amb) { R(c.x - 2, y - 7, 4, 6, '#ef4444'); R(c.x - 4, y - 5, 8, 2, '#ef4444'); circ(c.x, y - 14, 2, Math.sin(time * 12) > 0 ? '#3b82f6' : '#ef4444'); }
      circ(c.x - len / 2 + 5, y, 2.6, '#111'); circ(c.x + len / 2 - 5, y, 2.6, '#111');
    });
  }

  // ---------- buildings (each returns its top y) ----------
  const B = {
    townhall(l) {
      const x = l.x, w = l.w, cx = x + w / 2, pc = partyById(S.player.party).color;
      R(x + 4, BASE - 8, w - 8, 8, '#e5e7eb'); R(x + 12, BASE - 64, w - 24, 56, '#f5f0e1');
      for (let i = 0; i < 6; i++) R(x + 20 + i * ((w - 46) / 5), BASE - 60, 6, 52, '#ffffff');
      poly([x + 8, BASE - 64, cx, BASE - 88, x + w - 8, BASE - 64], '#e7dcc0');
      ctx.fillStyle = '#cbd5e1'; ctx.beginPath(); ctx.arc(cx, BASE - 88, 20, Math.PI, 0); ctx.fill();
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 1.5; line(cx, BASE - 108, cx, BASE - 136);
      const wv = Math.sin(time * 4) * 2; poly([cx, BASE - 136, cx + 22, BASE - 133 + wv, cx + 22, BASE - 123 + wv, cx, BASE - 126], pc);
      R(cx - 8, BASE - 30, 16, 22, '#78350f');
      return BASE - 140;
    },
    shops(l) {
      const names = ['BAKERY', 'MARKET', 'PHARMACY'], cols = ['#f472b6', '#38bdf8', '#4ade80'], hs = [44, 50, 42];
      for (let i = 0; i < 3; i++) {
        const x = l.x + i * 50, h = hs[i];
        R(x, BASE - h, 46, h, ['#fef3c7', '#e0e7ff', '#dcfce7'][i]);
        for (let s = 0; s < 6; s++) R(x + s * 7.7, BASE - h + 10, 7.7, 7, s % 2 ? '#fff' : cols[i]);
        R(x + 4, BASE - h + 20, 22, 16, '#93c5fd'); R(x + 30, BASE - h + 20, 12, h - 20, '#78350f');
        text(names[i], x + 23, BASE - h + 7, 6, '#334155');
      }
      return BASE - 58;
    },
    bazaar(l) {
      const cols = ['#f97316', '#0ea5e9', '#16a34a', '#e11d48'];
      R(l.x + 4, BASE - 40, l.w - 8, 40, '#e7c79a'); poly([l.x, BASE - 40, l.x + l.w / 2, BASE - 62, l.x + l.w, BASE - 40], '#0e7490');
      ctx.fillStyle = '#22d3ee'; ctx.beginPath(); ctx.arc(l.x + l.w / 2, BASE - 58, 12, Math.PI, 0); ctx.fill();
      for (let i = 0; i < 4; i++) { const x = l.x + 10 + i * 34; R(x, BASE - 26, 28, 26, '#fef3c7'); for (let s2 = 0; s2 < 4; s2++) R(x + s2 * 7, BASE - 30, 7, 6, s2 % 2 ? '#fff' : cols[i]); circ(x + 8, BASE - 10, 3, '#f59e0b'); circ(x + 15, BASE - 9, 3, '#ef4444'); circ(x + 22, BASE - 10, 3, '#84cc16'); }
      return BASE - 72;
    },
    apartments(l) {
      R(l.x + 6, BASE - 112, 52, 112, '#94a3b8'); windows(l.x + 6, BASE - 106, 52, 100, 4, 9, .45, l.x);
      R(l.x + 64, BASE - 86, 50, 86, '#a5b4fc'); windows(l.x + 64, BASE - 80, 50, 74, 4, 7, .5, l.x + 9);
      return BASE - 118;
    },
    houses(l) {
      const walls = ['#fde68a', '#bfdbfe', '#fecaca'], roofs = ['#b45309', '#1e40af', '#991b1b'];
      for (let i = 0; i < 3; i++) {
        const x = l.x + 4 + i * 49;
        R(x, BASE - 32, 40, 32, walls[i]); poly([x - 4, BASE - 32, x + 20, BASE - 52, x + 44, BASE - 32], roofs[i]);
        R(x + 16, BASE - 18, 9, 18, '#78350f'); R(x + 4, BASE - 26, 9, 8, '#93c5fd'); R(x + 28, BASE - 26, 9, 8, '#93c5fd');
      }
      return BASE - 58;
    },
    cafe(l) {
      R(l.x + 4, BASE - 42, 70, 42, '#fff7ed');
      for (let s = 0; s < 9; s++) R(l.x + 4 + s * 7.8, BASE - 42, 7.8, 8, s % 2 ? '#fff' : '#0ea5e9');
      R(l.x + 10, BASE - 30, 26, 18, '#93c5fd'); R(l.x + 46, BASE - 28, 12, 28, '#78350f');
      text('CAFÉ', l.x + 39, BASE - 46, 7, '#0c4a6e');
      [84, 106].forEach((dx, i) => { const x = l.x + dx; R(x - 1, BASE - 22, 2, 22, '#64748b'); poly([x - 12, BASE - 22, x, BASE - 30, x + 12, BASE - 22], i ? '#f43f5e' : '#facc15'); R(x - 6, BASE - 8, 12, 2, '#475569'); });
      return BASE - 54;
    },
    barn(l) {
      const tx = l.x + 10 + ((time * 10) % (l.w - 30));
      R(tx, HORIZON + 14, 14, 8, '#16a34a'); circ(tx + 3, HORIZON + 23, 4, '#111'); circ(tx + 12, HORIZON + 23, 2.5, '#111'); R(tx + 8, HORIZON + 8, 5, 6, '#16a34a');
      R(l.x + 10, BASE - 48, 72, 48, '#b91c1c'); poly([l.x + 4, BASE - 48, l.x + 20, BASE - 66, l.x + 72, BASE - 66, l.x + 88, BASE - 48], '#7f1d1d');
      R(l.x + 32, BASE - 30, 28, 30, '#fef2f2'); ctx.strokeStyle = '#b91c1c'; ctx.lineWidth = 2; line(l.x + 32, BASE - 30, l.x + 60, BASE); line(l.x + 60, BASE - 30, l.x + 32, BASE);
      R(l.x + 96, BASE - 76, 26, 76, '#cbd5e1'); ctx.fillStyle = '#94a3b8'; ctx.beginPath(); ctx.arc(l.x + 109, BASE - 76, 13, Math.PI, 0); ctx.fill();
      ctx.strokeStyle = '#a16207'; ctx.lineWidth = 1.5; for (let x = l.x + 126; x < l.x + l.w; x += 8) line(x, BASE - 12, x, BASE); line(l.x + 126, BASE - 9, l.x + l.w, BASE - 9);
      return BASE - 92;
    },
    chalets(l) {
      for (let i = 0; i < 2; i++) {
        const x = l.x + 6 + i * 68;
        R(x, BASE - 36, 56, 36, '#92400e'); poly([x - 6, BASE - 36, x + 28, BASE - 66, x + 62, BASE - 36], '#451a03');
        poly([x + 12, BASE - 51, x + 28, BASE - 66, x + 44, BASE - 51, x + 28, BASE - 58], '#f8fafc');
        R(x + 22, BASE - 20, 12, 20, '#451a03'); R(x + 6, BASE - 28, 10, 9, '#fde68a'); R(x + 40, BASE - 28, 10, 9, '#fde68a');
      }
      return BASE - 72;
    },
    mine(l) {
      poly([l.x, BASE, l.x + 40, BASE - 56, l.x + 80, BASE - 60, l.x + l.w, BASE], '#78716c');
      ctx.fillStyle = '#1c1917'; ctx.beginPath(); ctx.arc(l.x + 56, BASE, 16, Math.PI, 0); ctx.fill();
      R(l.x + 38, BASE - 18, 4, 18, '#78350f'); R(l.x + 70, BASE - 18, 4, 18, '#78350f'); R(l.x + 38, BASE - 20, 36, 4, '#78350f');
      const cx = l.x + 20 + (Math.sin(time * .6) * .5 + .5) * 60; R(cx - 8, BASE - 9, 16, 7, '#57534e'); circ(cx - 5, BASE - 1, 2, '#111'); circ(cx + 5, BASE - 1, 2, '#111');
      return BASE - 66;
    },
    housing(l) {
      const stock = S.housing ? S.housing.stock[region] : 0;
      const estates = (S.buildings[region] || []).filter(b => b === 'housing').length || 1;
      const lit = Math.max(.08, 1 - stock / (estates * 2000));
      const cols = ['#fca5a5', '#93c5fd', '#fde68a'], hs = [70, 96, 80];
      for (let i = 0; i < 3; i++) { const x = l.x + 4 + i * 50, h = hs[i]; R(x, BASE - h, 44, h, cols[i]); R(x - 2, BASE - h - 4, 48, 4, '#475569'); windows(x + 2, BASE - h + 4, 40, h - 22, 3, Math.round(h / 14), lit, x); R(x + 16, BASE - 14, 12, 14, '#475569'); }
      const sx = l.x + l.w - 6;
      R(sx - 1, BASE - 34, 2, 34, '#78350f');
      rr(sx - 30, BASE - 46, 34, 14, 2, stock > 0 ? '#16a34a' : '#475569');
      text(stock > 0 ? `${stock} FOR SALE` : 'SOLD OUT', sx - 13, BASE - 36, 5.5, '#fff');
      return BASE - 104;
    },
    hospital(l) {
      const x = l.x + 6, top = BASE - 74;
      R(x, top, 110, 74, '#f8fafc'); R(x, top, 110, 6, '#e2e8f0'); windows(x + 4, top + 10, 102, 36, 6, 2, .2, l.x);
      R(x + 42, BASE - 24, 26, 24, '#7dd3fc'); text('HOSPITAL', x + 55, top + 56, 8, '#dc2626', 800);
      R(x + 51, top - 22, 8, 22, '#ef4444'); R(x + 44, top - 15, 22, 8, '#ef4444');
      rr(x + 114, BASE - 16, 26, 14, 3, '#fff'); R(x + 126, BASE - 13, 3, 8, '#ef4444'); R(x + 123, BASE - 10, 9, 3, '#ef4444');
      circ(x + 119, BASE - 2, 2.5, '#111'); circ(x + 135, BASE - 2, 2.5, '#111'); circ(x + 120, BASE - 18, 2, Math.sin(time * 10) > 0 ? '#3b82f6' : '#ef4444');
      return top - 26;
    },
    school(l) {
      const x = l.x + 4, top = BASE - 52;
      R(x, top, 96, 52, '#c2410c'); R(x, top, 96, 4, '#fff7ed'); windows(x + 4, top + 8, 88, 26, 6, 2, .1, l.x + 3);
      R(x + 40, BASE - 20, 16, 20, '#78350f'); text('SCHOOL', x + 48, BASE - 24, 7, '#fff7ed');
      R(x + 39, top - 26, 18, 26, '#c2410c'); poly([x + 36, top - 26, x + 48, top - 42, x + 60, top - 26], '#7c2d12'); circ(x + 48, top - 14, 6, '#fff'); ctx.strokeStyle = '#111'; ctx.lineWidth = 1; line(x + 48, top - 14, x + 48 + 4 * Math.cos(time), top - 14 + 4 * Math.sin(time));
      const px = l.x + 106;
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1; for (let fx = px; fx < l.x + l.w; fx += 7) line(fx, BASE - 10, fx, BASE); line(px, BASE - 8, l.x + l.w, BASE - 8);
      ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2; line(px + 8, BASE, px + 8, BASE - 28); line(px + 36, BASE, px + 36, BASE - 28); line(px + 6, BASE - 28, px + 38, BASE - 28);
      const a = Math.sin(time * 2.4) * .6; ctx.strokeStyle = '#475569'; ctx.lineWidth = 1; const sx = px + 22 + Math.sin(a) * 16, sy = BASE - 28 + Math.cos(a) * 16; line(px + 22, BASE - 28, sx, sy); R(sx - 4, sy, 8, 2, '#1e40af');
      poly([px + 46, BASE, px + 66, BASE, px + 50, BASE - 22], '#facc15');
      return top - 46;
    },
    factory(l) {
      const x = l.x + 4, top = BASE - 50;
      R(x + 20, BASE - 102, 8, 52, '#e5e7eb'); R(x + 45, BASE - 96, 8, 46, '#e5e7eb');
      for (let i = 0; i < 4; i++) { R(x + 20, BASE - 98 + i * 14, 8, 5, '#dc2626'); R(x + 45, BASE - 92 + i * 13, 8, 5, '#dc2626'); }
      R(x, top, 142, 50, '#9ca3af');
      for (let i = 0; i < 5; i++) poly([x + i * 28.4, top, x + i * 28.4 + 28.4, top, x + i * 28.4 + 28.4, top - 14], '#6b7280');
      windows(x + 4, top + 6, 100, 18, 7, 1, .7, l.x); R(x + 108, BASE - 30, 28, 30, '#475569');
      text('FACTORY', x + 54, BASE - 10, 8, '#1f2937', 800);
      return BASE - 108;
    },
    coal(l) {
      poly([l.x + 12, BASE, l.x + 24, BASE - 48, l.x + 18, BASE - 90, l.x + 62, BASE - 90, l.x + 56, BASE - 48, l.x + 68, BASE], '#d1d5db');
      R(l.x + 18, BASE - 90, 44, 4, '#9ca3af');
      R(l.x + 74, BASE - 32, 52, 32, '#78716c'); text('⚡', l.x + 100, BASE - 12, 12, '#facc15');
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 1.5; line(l.x + 120, BASE - 32, l.x + 120, BASE - 62); line(l.x + 112, BASE - 56, l.x + 128, BASE - 56);
      return BASE - 96;
    },
    solar(l) {
      for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) { const x = l.x + 6 + c * 28, y = BASE - 6 - r * 18; poly([x, y, x + 24, y, x + 20, y - 12, x - 4, y - 12], '#1e3a8a'); ctx.strokeStyle = '#60a5fa'; ctx.lineWidth = .6; line(x + 10, y, x + 7, y - 12); line(x - 2, y - 6, x + 22, y - 6); R(x + 10, y, 2, 6, '#64748b'); }
      [l.x + 135, l.x + 168].forEach((tx, i) => {
        R(tx - 1.5, BASE - 100, 3, 100, '#f1f5f9'); circ(tx, BASE - 100, 3.5, '#e2e8f0');
        ctx.strokeStyle = '#f8fafc'; ctx.lineWidth = 2.5;
        for (let b = 0; b < 3; b++) { const a = time * (1.6 + i * .3) + b * Math.PI * 2 / 3; line(tx, BASE - 100, tx + Math.cos(a) * 26, BASE - 100 + Math.sin(a) * 26); }
      });
      return BASE - 130;
    },
    airport(l) {
      R(l.x, BASE - 14, l.w, 10, '#4b5563'); for (let x = l.x + 6; x < l.x + l.w; x += 18) R(x, BASE - 10, 9, 2, '#f8fafc');
      R(l.x + 8, BASE - 54, 120, 40, '#bae6fd'); R(l.x + 8, BASE - 56, 120, 4, '#64748b');
      ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1; for (let x = l.x + 8; x <= l.x + 128; x += 15) line(x, BASE - 54, x, BASE - 14);
      text('AIRPORT', l.x + 68, BASE - 60, 8, '#0c4a6e', 800);
      R(l.x + 138, BASE - 92, 12, 78, '#f1f5f9'); R(l.x + 131, BASE - 106, 26, 14, '#1e293b'); R(l.x + 129, BASE - 108, 30, 3, '#94a3b8');
      const cyc = (time % 16) / 16;
      if (cyc < .35) drawPlane(l.x + 200, BASE - 18, 0, 1);
      else if (cyc < .8) { const p = (cyc - .35) / .45; drawPlane(l.x + 170 + p * p * 520, BASE - 18 - Math.max(0, p - .35) * 260, -Math.min(.35, Math.max(0, p - .35) * 1.2), 1); }
      return BASE - 112;
    },
    port(l) {
      R(l.x + l.w * .45, HORIZON + 6, l.w * .55 + 24, BASE - HORIZON - 6, '#2f7fd8');
      ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 1; for (let i = 0; i < 6; i++) { const wx = l.x + l.w * .5 + ((i * 37 + time * 8) % (l.w * .5)); line(wx, HORIZON + 20 + i * 8, wx + 10, HORIZON + 20 + i * 8); }
      R(l.x, BASE - 6, l.w * .48, 6, '#78716c');
      const cc = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7'];
      for (let i = 0; i < 4; i++) for (let j = 0; j < 3 - (i % 2); j++) R(l.x + 6 + i * 24, BASE - 18 - j * 12, 22, 11, cc[(i + j * 2) % 5]);
      const bob = Math.sin(time * 1.5) * 1.5, sx = l.x + l.w * .55;
      poly([sx, BASE - 26 + bob, sx + 100, BASE - 26 + bob, sx + 92, BASE - 8 + bob, sx + 6, BASE - 8 + bob], '#1e293b'); R(sx, BASE - 26 + bob, 100, 3, '#b91c1c');
      for (let i = 0; i < 4; i++) R(sx + 8 + i * 16, BASE - 38 + bob, 14, 12, cc[(i + 2) % 5]);
      R(sx + 76, BASE - 46 + bob, 16, 20, '#f8fafc');
      const gx = l.x + 104;
      R(gx, BASE - 110, 5, 104, '#f59e0b'); R(gx + 30, BASE - 110, 5, 104, '#f59e0b'); R(gx - 6, BASE - 114, l.w - 104, 6, '#f59e0b');
      const tx = gx + 40 + (Math.sin(time * .5) * .5 + .5) * (l.w - 170);
      R(tx - 6, BASE - 110, 12, 7, '#334155'); ctx.strokeStyle = '#1f2937'; ctx.lineWidth = 1; line(tx, BASE - 103, tx, BASE - 60); R(tx - 10, BASE - 60, 20, 10, cc[Math.floor(time / 6) % 5]);
      return BASE - 120;
    },
    base(l) {
      const pc = partyById(S.player.party).color;
      R(l.x + 6, BASE - 30, 92, 30, '#4d7c0f'); poly([l.x + 2, BASE - 30, l.x + 52, BASE - 44, l.x + 102, BASE - 30], '#365314');
      for (let i = 0; i < 4; i++) R(l.x + 14 + i * 22, BASE - 22, 10, 8, '#1a2e05');
      ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1.5; line(l.x + 112, BASE, l.x + 112, BASE - 84);
      const wv = Math.sin(time * 4) * 2; poly([l.x + 112, BASE - 84, l.x + 136, BASE - 81 + wv, l.x + 136, BASE - 69 + wv, l.x + 112, BASE - 72], pc); text('★', l.x + 122, BASE - 74 + wv / 2, 8, '#fff');
      ctx.strokeStyle = '#57534e'; ctx.lineWidth = 2; line(l.x + 152, BASE, l.x + 156, BASE - 56); line(l.x + 176, BASE, l.x + 172, BASE - 56); R(l.x + 150, BASE - 70, 28, 14, '#57534e');
      const tx = l.x + 20 + (Math.sin(time * .35) * .5 + .5) * (l.w - 70), y = HORIZON + 34;
      rr(tx, y, 34, 10, 4, '#3f6212'); R(tx + 8, y - 7, 16, 7, '#4d7c0f'); R(tx + 24, y - 5, 18, 2.5, '#365314');
      for (let i = 0; i < 4; i++) circ(tx + 5 + i * 8, y + 10, 3, '#1c1917');
      return BASE - 90;
    },
    park(l) {
      const cx = l.x + l.w / 2;
      ctx.fillStyle = '#e5e7eb'; ctx.beginPath(); ctx.ellipse(cx, BASE - 44, 72, 24, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#22c55e'; ctx.beginPath(); ctx.ellipse(cx, BASE - 44, 54, 14, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5; line(cx - 70, BASE - 44, cx - 70, BASE - 92); line(cx + 70, BASE - 44, cx + 70, BASE - 92);
      R(cx - 76, BASE - 96, 12, 5, '#fef9c3'); R(cx + 64, BASE - 96, 12, 5, '#fef9c3');
      R(l.x, BASE - 10, l.w, 10, lerpColor('#a3a35a', '#4ade80', env));
      [l.x + 12, l.x + 70, l.x + l.w - 14].forEach((tx, i) => tree(tx, BASE, 1.25 - i * .1, leaf()));
      ctx.fillStyle = '#94a3b8'; ctx.beginPath(); ctx.ellipse(cx + 20, BASE - 5, 18, 5, 0, 0, Math.PI * 2); ctx.fill(); R(cx + 18, BASE - 20, 4, 15, '#cbd5e1');
      R(l.x + 28, BASE - 10, 34, 3, '#92400e'); R(l.x + 30, BASE - 7, 2, 7, '#78350f'); R(l.x + 58, BASE - 7, 2, 7, '#78350f'); R(l.x + 28, BASE - 18, 34, 2, '#92400e');
      text('STADIUM', cx, BASE - 70, 7, '#475569', 800);
      return BASE - 100;
    },
    site(l) {
      const p = l.p, P = PROJECTS[p.type], prog = Math.max(.1, (p.total - p.turnsLeft) / p.total);
      R(l.x + 8, BASE - 6, l.w - 40, 6, '#78716c');
      const bh = 24 + prog * 60;
      R(l.x + 14, BASE - bh * .65, l.w - 52, bh * .65, '#cbd5e1'); windows(l.x + 14, BASE - bh * .65 + 4, l.w - 52, bh * .65 - 8, 5, Math.max(1, Math.round(bh / 26)), 0, l.x);
      ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 1.2;
      for (let x = l.x + 12; x <= l.x + l.w - 36; x += 16) line(x, BASE, x, BASE - bh);
      for (let y = BASE; y >= BASE - bh; y -= 14) line(l.x + 12, y, l.x + l.w - 36, y);
      const mx = l.x + l.w - 22;
      ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2; line(mx, BASE, mx, BASE - 132); line(mx - 4, BASE, mx - 4, BASE - 132);
      ctx.lineWidth = 1; for (let y = BASE; y > BASE - 130; y -= 8) line(mx - 4, y, mx, y - 8);
      R(mx - 110, BASE - 136, 128, 4, '#f59e0b'); R(mx + 6, BASE - 134, 12, 8, '#57534e'); R(mx - 10, BASE - 146, 12, 10, '#facc15');
      const hx = mx - 70 + Math.sin(time * .5) * 34, hy = BASE - 132 + 50 + Math.sin(time * .9) * 10;
      ctx.strokeStyle = '#1f2937'; ctx.lineWidth = .8; line(hx, BASE - 132, hx, hy); R(hx - 14, hy, 28, 4, '#b45309');
      R(l.x + 6, BASE - 34, 2, 34, '#78350f'); rr(l.x - 2, BASE - 48, 64, 15, 2, '#facc15');
      text(`${P.name.toUpperCase()} ${Math.round(prog * 100)}%`, l.x + 30, BASE - 38, 5.5, '#1f2937', 800);
      for (let i = 0; i < 6; i++) R(l.x + 8 + i * 12, BASE - 3, 6, 3, i % 2 ? '#111' : '#facc15');
      return BASE - 150;
    },
  };
  function drawPlane(x, y, ang, s) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
    ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.ellipse(0, 0, 22, 4.5, 0, 0, Math.PI * 2); ctx.fill();
    poly([-16, -2, -22, -13, -15, -13, -8, -2], '#e2e8f0'); poly([-4, 1, 8, 1, -10, 9, -16, 9], '#cbd5e1');
    R(-14, -1, 30, 1.5, '#2563eb'); circ(18, -1, 1.5, '#1e3a5f');
    ctx.restore();
  }

  // ---------- people ----------
  function drawPerson(p) {
    if (p.state === 'inside') return;
    const s = p.size || 1, x = p.x, y = p.y, L = GLOOK[p.g], shirt = p.shirt || L.shirt || '#64748b';
    const moving = p.state === 'walk' || p.state === 'crowd';
    const cheering = p.state === 'cheer';
    const flag = p.flag || (cheering && ev && ev.stage ? ev.pc : null);
    const sw = moving ? Math.sin(p.phase) * 4 * s : 0;
    const sit = p.state === 'sit', jump = p.state === 'protest' ? Math.abs(Math.sin(time * 4 + p.phase)) * 3 : cheering ? Math.abs(Math.sin(time * 6 + p.phase)) * 3.5 : 0;
    const by = y - jump, hip = by - (sit ? 8 : 12) * s;
    ctx.lineCap = 'round';
    ctx.strokeStyle = L.pants; ctx.lineWidth = 2.6 * s;
    if (sit) { line(x, hip, x + 6 * s, hip); line(x + 6 * s, hip, x + 6 * s, by); }
    else { line(x, hip, x + sw, by); line(x, hip, x - sw, by); }
    if (L.pack) R(x - p.dir * 6 * s - 2 * s, hip - 11 * s, 4 * s, 8 * s, '#334155');
    rr(x - 4.5 * s, hip - 12 * s, 9 * s, 13 * s, 2 * s, shirt);
    if (p.g === 'business') { R(x - 1.2 * s, hip - 12 * s, 2.4 * s, 6 * s, '#f8fafc'); R(x - .6 * s, hip - 11 * s, 1.2 * s, 5 * s, '#dc2626'); }
    if (p.g === 'workers') R(x - 4.5 * s, hip - 6 * s, 9 * s, 1.6 * s, '#fde047');
    const sh = hip - 10 * s;
    ctx.strokeStyle = shirt; ctx.lineWidth = 2.2 * s;
    if (p.kind === 'builder') {
      const a = Math.sin(time * 9 + p.phase), hx = x + p.dir * 7 * s, hy = sh - 3 * s - a * 4 * s;
      line(x, sh, hx, hy); ctx.strokeStyle = '#78350f'; ctx.lineWidth = 1.4; line(hx, hy, hx + p.dir * 2 * s, hy - 6 * s); R(hx + p.dir * 2 * s - 2.5, hy - 8 * s, 5, 2.5, '#6b7280');
    } else if (p.state === 'protest') {
      line(x, sh, x + 2 * s, sh - 10 * s); ctx.strokeStyle = '#78350f'; ctx.lineWidth = 1.2; line(x + 2 * s, by - 18 * s, x + 2 * s, by - 50 * s);
      R(x - 15 * s, by - 60 * s, 34 * s, 11 * s, '#fff'); text(SIGNS[p.g], x + 2 * s, by - 52 * s, 5 * s, '#dc2626', 800);
    } else if (cheering) {
      const wave = Math.sin(time * 8 + p.phase) * 2 * s;
      line(x, sh, x - 5 * s, sh - 9 * s + wave); line(x, sh, x + 5 * s, sh - 9 * s - wave);
      if (flag) { ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1; line(x + 5 * s, sh - 9 * s - wave, x + 5 * s, sh - 21 * s - wave); const fw = Math.sin(time * 9 + p.phase) * 1.5; poly([x + 5 * s, sh - 21 * s - wave, x + 14 * s, sh - 19 * s - wave + fw, x + 5 * s, sh - 15 * s - wave], flag); }
    } else if (sit) { const up = ev && ev.type === 'townhall' && Math.sin(time * .8 + p.phase * 3) > .75; if (up) line(x, sh, x + 2 * s, sh - 11 * s); else line(x, sh, x + 5 * s, sh + 4 * s); }
    else { line(x, sh, x - sw * .8, sh + 8 * s); line(x, sh, x + sw * .8, sh + 8 * s); }
    if (L.brief && moving) R(x + sw * .8 - 2.5 * s, sh + 8 * s, 5 * s, 4 * s, '#78350f');
    if (L.cane) { ctx.strokeStyle = '#78350f'; ctx.lineWidth = 1.2 * s; line(x + p.dir * 5 * s, sh + 5 * s, x + p.dir * 6 * s, by); }
    const hy = hip - 16 * s;
    circ(x, hy, 4.3 * s, p.skin);
    if (L.hat === 'hard') { ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(x, hy - 1 * s, 4.6 * s, Math.PI, 0); ctx.fill(); R(x - 5.5 * s, hy - 1.4 * s, 11 * s, 1.4 * s, '#eab308'); }
    else if (L.hat === 'straw') { ctx.fillStyle = '#eab308'; ctx.beginPath(); ctx.ellipse(x, hy - 2.5 * s, 7.5 * s, 1.6 * s, 0, 0, Math.PI * 2); ctx.fill(); R(x - 3 * s, hy - 6 * s, 6 * s, 3.5 * s, '#ca8a04'); }
    else if (L.hat === 'helmet') { ctx.fillStyle = '#365314'; ctx.beginPath(); ctx.arc(x, hy - .5 * s, 4.8 * s, Math.PI, 0); ctx.fill(); }
    else { ctx.fillStyle = L.hair || '#3b2a1a'; ctx.beginPath(); ctx.arc(x, hy - .8 * s, 4.4 * s, Math.PI, 0); ctx.fill(); }
    const m = face(moodOf(p.g));
    circ(x - 1.5 * s, hy - .2 * s, .6 * s, '#111'); circ(x + 1.5 * s, hy - .2 * s, .6 * s, '#111');
    ctx.strokeStyle = '#7f1d1d'; ctx.lineWidth = .8 * s; ctx.beginPath();
    if (m > 0) ctx.arc(x, hy + 1 * s, 1.8 * s, .15 * Math.PI, .85 * Math.PI);
    else if (m < 0) ctx.arc(x, hy + 3.4 * s, 1.8 * s, 1.15 * Math.PI, 1.85 * Math.PI);
    else { ctx.moveTo(x - 1.5 * s, hy + 2 * s); ctx.lineTo(x + 1.5 * s, hy + 2 * s); }
    ctx.stroke();
    if (p.kind !== 'soldier' && p.kind !== 'oppfan') { ctx.font = `${7.5 * s}px sans-serif`; ctx.textAlign = 'center'; ctx.fillText(EMO[m], x, hy - 8 * s); }
  }
  function drawPrez() {
    const p = prez; if (!p) return;
    drawCandidate(S.player.look, mood(), p.x, p.onStage ? BASE - 20 : WALK + 2, p.walking, p.phase, p.dir, camp() ? '★ YOU' : '★ ' + ROLE.upper, 'rgba(251,191,36,.95)');
  }
  function drawBubble(x, y, t) {
    ctx.font = '600 8px Inter, system-ui, sans-serif';
    const w = ctx.measureText(t).width + 10, bx = Math.max(cam + 4, Math.min(cam + viewW - w - 4, x - w / 2));
    rr(bx, y - 14, w, 13, 6, 'rgba(255,255,255,.96)'); poly([x - 3, y - 1.5, x + 3, y - 1.5, x, y + 3], 'rgba(255,255,255,.96)');
    text(t, bx + w / 2, y - 4.5, 8, '#111827', 600);
  }

  // ---------- main draw ----------
  function draw() {
    const dpr = window.devicePixelRatio || 1, k = dpr * scale;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.setTransform(k, 0, 0, k, 0, 0); drawSky();
    ctx.setTransform(k, 0, 0, k, -cam * k, 0); drawClouds();
    ctx.setTransform(k, 0, 0, k, -cam * .5 * k, 0); drawBackground();
    ctx.setTransform(k, 0, 0, k, -cam * k, 0);
    drawGround();
    lots.forEach(l => { if (l.x + l.w < cam - 40 || l.x > cam + viewW + 40) { l.top = BASE - 100; return; } l.top = B[l.type](l); });
    drawEventBack();
    parts.forEach(q => {
      const a = Math.max(0, 1 - q.life / q.max);
      if (q.conf) { ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.rot); R(-q.r, -q.r / 2, q.r * 2, q.r, q.conf); ctx.restore(); return; }
      if (q.txt) { ctx.globalAlpha = a; ctx.font = `${q.r}px sans-serif`; ctx.textAlign = 'center'; ctx.fillText(q.txt, q.x, q.y); ctx.globalAlpha = 1; return; }
      ctx.fillStyle = `rgba(${q.c},${a * (q.g ? .9 : .55)})`; ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, Math.PI * 2); ctx.fill();
    });
    lots.forEach(l => { if (ev && ev.type !== 'door' && Math.abs(l.x + l.w / 2 - ev.x) < l.w / 2 + 70) return; if (oppStage && Math.abs(l.x + l.w / 2 - oppStage.x) < l.w / 2 + 50) return; const name = lotName(l); ctx.font = '700 7.5px Inter, system-ui, sans-serif'; const w = ctx.measureText(name).width + 12; rr(l.x + l.w / 2 - w / 2, l.top - 6, w, 12, 6, 'rgba(15,23,42,.72)'); text(name, l.x + l.w / 2, l.top + 2.5, 7.5, '#f8fafc'); });
    drawStreet();
    drawPrez();
    [...people].sort((a, b) => a.y - b.y).forEach(drawPerson);
    drawEventFront();
    drawCars();
    people.forEach(p => { if (p.bubble && p.state !== 'inside') drawBubble(p.x, p.y - (p.kind === 'protester' ? 66 : 42) * (p.size || 1), p.bubble.text); });
    if (prez && prez.bubble) drawBubble(prez.x, (prez.onStage ? BASE - 20 : WALK + 2) - 74, prez.bubble.text);
    if (env < .45) { ctx.setTransform(k, 0, 0, k, 0, 0); ctx.fillStyle = `rgba(120,105,80,${(.45 - env) * .7})`; ctx.fillRect(0, 0, viewW, BASE); }
  }

  // ---------- input ----------
  function bind(el) {
    el.addEventListener('pointerdown', e => { drag = { x: e.clientX, cam }; lastInteract = time; el.setPointerCapture(e.pointerId); el.classList.add('grabbing'); });
    el.addEventListener('pointermove', e => {
      if (drag) { cam = drag.cam - (e.clientX - drag.x) / scale; lastInteract = time; hideTip(); return; }
      hover(e);
    });
    const end = () => { drag = null; lastInteract = time; el.classList.remove('grabbing'); };
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
    el.addEventListener('pointerleave', hideTip);
    el.addEventListener('wheel', e => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey) { e.preventDefault(); cam += (e.deltaX || e.deltaY) / scale * .6; lastInteract = time; } }, { passive: false });
  }
  function hideTip() { const t = document.getElementById('cv-tip'); if (t) t.style.display = 'none'; }
  function hover(e) {
    const tip = document.getElementById('cv-tip'); if (!tip) return;
    const rect = cv.getBoundingClientRect(), wx = (e.clientX - rect.left) / scale + cam, wy = (e.clientY - rect.top) / scale;
    let html = '';
    if (prez && Math.abs(prez.x - wx) < 14 && wy > (prez.onStage ? BASE - 82 : WALK - 62) && wy < WALK + 4) html = `<b>★ ${camp() ? 'Candidate' : ROLE.title} ${esc(S.player.name)}</b><br>${ev ? 'Campaigning here!' : `Visiting ${prez.lot ? lotName(prez.lot) : 'the city'}`}`;
    if (!html) {
      const p = people.filter(q => q.state !== 'inside' && Math.abs(q.x - wx) < 7 * (q.size || 1) && wy > q.y - 36 * (q.size || 1) && wy < q.y + 3).sort((a, b) => b.y - a.y)[0];
      if (p) {
        if (p.kind === 'builder') html = '<b>👷 Construction worker</b><br>Building for your government';
        else if (p.kind === 'soldier') html = `<b>🪖 Soldier</b><br>Army strength ${fmt(S.mil.army)}`;
        else if (p.kind === 'oppfan') html = `<b>📢 ${esc(S.opp.name)} supporter</b><br>At the ${partyById(S.opp.party).name} rally`;
        else { const v = moodOf(p.g), m = face(v); const feel = camp() ? (m > 0 ? 'Supports you' : m < 0 ? `Supports ${esc(S.opp.name)}` : 'Undecided') : (m > 0 ? 'Happy' : m < 0 ? 'Unhappy' : 'Okay'); html = `<b>${GROUPS[p.g].icon} ${p.kind === 'kid' ? 'School kid' : GROUPS[p.g].name.replace(/s$/, '')}${p.kind === 'protester' ? ' (protesting)' : ''}</b><br>${EMO[m]} ${feel} · ${fmt(v)}%${p.bubble ? `<br>“${esc(p.bubble.text)}”` : ''}`; }
      }
    }
    if (!html && wy < BASE + 2) {
      const l = lotAt(wx);
      if (l) {
        let info = '';
        if (l.type === 'site') { const c = comp(l.p.company); info = `Built by ${c.name}<br>${l.p.turnsLeft} half-year${l.p.turnsLeft > 1 ? 's' : ''} left`; }
        else if (l.type === 'housing') info = `${S.housing.stock[region].toLocaleString()} homes for sale here`;
        else if (!S.stats) info = PROJECTS[l.type] ? PROJECTS[l.type].desc : '';
        else if (l.type === 'hospital') info = `National health: ${fmt(S.stats.health)}`;
        else if (l.type === 'school') info = `National education: ${fmt(S.stats.education)}`;
        else if (l.type === 'factory') info = `Unemployment: ${fmt(unemployment(), 1)}%`;
        else if (l.type === 'coal' || l.type === 'solar') { const en = energy(); info = `Energy ${fmt(en.supply)} / demand ${fmt(en.demand)}`; }
        else if (l.type === 'base') info = `Defense strength ${fmt(milStrength())}`;
        else if (PROJECTS[l.type]) info = PROJECTS[l.type].desc;
        html = `<b>${lotName(l)}</b>${info ? '<br>' + info : ''}`;
      }
    }
    if (!html) return hideTip();
    tip.innerHTML = html; tip.style.display = 'block';
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    tip.style.left = Math.min(rect.width - 190, x + 12) + 'px'; tip.style.top = Math.max(4, y - 50) + 'px';
  }

  // ---------- lifecycle ----------
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    cssW = cv.clientWidth; cssH = cv.clientHeight;
    cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssH * dpr);
    scale = cssH / H; viewW = cssW / scale;
  }
  function loop(now) {
    raf = 0;
    if (!cv || !cv.isConnected) { cv = null; return; }
    const dt = Math.min(.05, (now - lastT) / 1000); lastT = now;
    if (cv.clientWidth !== cssW || cv.clientHeight !== cssH) { resize(); const s = signature(); if (s !== sig) { sig = s; build(); } }
    update(dt); draw();
    raf = requestAnimationFrame(loop);
  }
  function attach(el) {
    if (!el || !S || !S.buildings) { cv = null; return; }
    if (el !== cv) { cv = el; ctx = cv.getContext('2d'); bind(cv); }
    resize();
    if (region !== UI.region) { cam = 0; prez = null; lastInteract = -99; }
    const s = signature();
    if (s !== sig || region !== UI.region) { region = UI.region; sig = s; build(); }
    if (!raf) { lastT = performance.now(); raf = requestAnimationFrame(loop); }
  }
  // send the president to the newest construction site
  function visit(type) { const l = lots.find(x => x.type === type) || lots.find(x => x.type === 'site' && x.p.type === type); if (l && prez) { prez.lot = l; prez.target = l.x + l.w / 2; prez.wait = 0; cam = Math.max(0, Math.min(worldW - viewW, l.x - viewW / 3)); lastInteract = time; } }
  return { attach, visit, event };
})();
