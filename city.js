/* ============================================================
   City view — an animated side-view scene of the selected region.
   Draws every building the player owns, construction sites,
   citizens (with their mood), cars, planes, ships and the president.
   Uses globals from data.js and game.js at runtime.
   ============================================================ */
'use strict';
const City = (() => {
  const H = 300, HORIZON = 188, BASE = 244, WALK = 255, ROAD_T = 262, ROAD_B = 294;
  const FILLERS = { capital: ['townhall', 'shops', 'apartments'], north: ['houses', 'shops'], coast: ['cafe', 'houses'], farm: ['barn', 'houses'], high: ['chalets', 'mine'] };
  const LOT_W = { housing: 170, hospital: 150, school: 175, airport: 290, port: 250, factory: 155, solar: 185, coal: 135, base: 185, park: 175, site: 160,
    townhall: 175, shops: 150, apartments: 120, houses: 150, cafe: 125, barn: 160, chalets: 140, mine: 120 };
  const FILLER_NAMES = { townhall: '🏛️ Presidential Palace', shops: '🛍️ Shops', apartments: '🏢 Apartments', houses: '🏡 Homes', cafe: '☕ Beach café', barn: '🐄 Family farm', chalets: '🏔️ Mountain homes', mine: '⛏️ Old mine' };
  const WORK = { workers: ['factory', 'site', 'port', 'coal', 'mine', 'shops'], business: ['shops', 'townhall', 'airport', 'port', 'apartments'], farmers: ['barn', 'solar', 'shops'], youth: ['school', 'park', 'cafe', 'shops'], elderly: ['park', 'hospital', 'shops', 'cafe'] };
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
  let drag = null, lastInteract = -99, autoDir = 1, prez = null, prezImg = null, prezKey = '', highway = false, env = .55;

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
    if (!S || !S.ga) return 55;
    return Math.max(0, Math.min(100, S.ga[g] + (S.regionMods ? S.regionMods[region] * .5 : 0)));
  }
  const lotAt = x => lots.find(l => x >= l.x && x <= l.x + l.w);
  function lotName(l) { return l.type === 'site' ? `🚧 ${PROJECTS[l.p.type].name}` : PROJECTS[l.type] ? `${PROJECTS[l.type].icon} ${PROJECTS[l.type].name}` : FILLER_NAMES[l.type]; }

  // ---------- scene setup ----------
  function signature() {
    if (!S || !S.buildings) return '';
    const rid = UI.region;
    return JSON.stringify([rid, S.buildings[rid], (S.projects || []).filter(p => p.region === rid).map(p => [p.type, p.turnsLeft]),
      S.housing ? S.housing.stock[rid] > 0 : 0, S.ga ? GK.filter(g => S.ga[g] + S.regionMods[rid] * .5 < 35) : [], S.turn, Math.round(viewW / 50)]);
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
    const fill = FILLERS[region];
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
    const angry = S.ga ? GK.filter(g => moodOf(g) < 35 && r.mix[g] > 0).sort((a, b) => moodOf(a) - moodOf(b)) : [];
    if (angry.length) { const c = lots[0]; for (let k = 0; k < 5; k++) people.push({ kind: 'protester', g: angry[0], x: c.x + 25 + k * 22, y: WALK + (k % 2) * 2, dir: 1, phase: k * 1.3, size: 1, skin: choose(SKINS), shirt: angry[0] === 'youth' ? choose(YOUTH_SHIRTS) : null, state: 'protest' }); }
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
  function talk(p) {
    const m = face(moodOf(p.g)), lot = lotAt(p.x), iss = issues();
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
    people.forEach(p => {
      p.phase += dt * (p.state === 'walk' ? (p.speed || 20) / 3.2 : 5);
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
      if (p.bubble && p.bubble.until < time) p.bubble = null;
    });
    cars.forEach(c => { c.x += (c.lane ? -1 : 1) * c.speed * dt; if (c.x > worldW + 40) c.x = -40; if (c.x < -40) c.x = worldW + 40; });
    hwCars.forEach(c => { c.x += c.dir * c.speed * dt; if (c.x > worldW + 20) c.x = -20; if (c.x < -20) c.x = worldW + 20; });
    clouds.forEach(c => { c.x += c.v * dt; if (c.x > worldW + 60) c.x = -60; });
    lots.forEach(l => {
      if (l.type === 'factory' && Math.random() < dt * 7) [l.x + 28, l.x + 53].forEach(cx => parts.push({ x: cx + rand(-2, 2), y: BASE - 102, vx: rand(4, 10), vy: rand(-14, -8), r: rand(3, 6), life: 0, max: rand(3, 5), c: '110,110,120' }));
      if (l.type === 'coal' && Math.random() < dt * 6) parts.push({ x: l.x + 40 + rand(-10, 10), y: BASE - 92, vx: rand(2, 8), vy: rand(-16, -10), r: rand(6, 10), life: 0, max: rand(3, 5), c: '240,240,245' });
      if (l.type === 'park' && Math.random() < dt * 30) parts.push({ x: l.x + l.w / 2 + 20, y: BASE - 20, vx: rand(-12, 12), vy: rand(-42, -30), r: 1.4, life: 0, max: 1.1, c: '125,200,255', g: true });
    });
    parts.forEach(q => { q.life += dt; q.x += q.vx * dt; q.y += q.vy * dt; if (q.g) q.vy += 70 * dt; else q.r += dt * 3; });
    parts = parts.filter(q => q.life < q.max).slice(-300);
    updatePrez(dt);
  }
  function updatePrez(dt) {
    const p = prez; if (!p) return;
    if (p.bubble && p.bubble.until < time) p.bubble = null;
    if (p.wait > 0) { p.wait -= dt; p.walking = false; if (p.wait <= 0) { p.lot = choose(lots); p.target = p.lot.x + p.lot.w / 2 + rand(-25, 25); } return; }
    if (p.target == null) { p.wait = 1; return; }
    const d = p.target - p.x, step = 42 * dt;
    p.dir = Math.sign(d) || 1; p.walking = true; p.phase += dt * 9;
    if (Math.abs(d) <= step) { p.x = p.target; p.target = null; p.wait = rand(3, 5); p.walking = false; p.bubble = { text: PREZ_LINES[p.lot.type] || 'Hello, everyone!', until: time + 3 }; }
    else p.x += Math.sign(d) * step;
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
    switch (region) {
      case 'capital':
        for (let i = 0; i * 34 < W; i++) { const h = 40 + hash(i) * 70; R(i * 34, HORIZON - h, 28, h + 10, 'rgba(100,122,160,.55)'); for (let j = 0; j < h / 10 - 1; j++) if (hash(i * 3 + j) > .55) R(i * 34 + 6 + (j % 2) * 10, HORIZON - h + 6 + j * 10, 4, 4, 'rgba(255,240,180,.6)'); }
        break;
      case 'north':
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
      case 'high':
        for (let i = 0; i * 170 < W + 170; i++) { const hh = 100 + hash(i) * 50, cx = i * 170 + 40; poly([cx - 110, HORIZON, cx, HORIZON - hh, cx + 110, HORIZON], 'rgba(100,116,139,.8)'); poly([cx - 24, HORIZON - hh + 24, cx, HORIZON - hh, cx + 24, HORIZON - hh + 24, cx + 8, HORIZON - hh + 20, cx - 6, HORIZON - hh + 28], '#f8fafc'); }
        for (let i = 0; i * 26 < W; i++) { const x = i * 26 + hash(i) * 10; poly([x - 7, HORIZON + 2, x, HORIZON - 20, x + 7, HORIZON + 2], '#166534'); }
        break;
    }
  }
  function drawGround() {
    R(0, HORIZON, worldW, BASE - HORIZON, lerpColor('#b4a26a', '#5fbf5a', env));
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
    for (let x = 60; x < worldW; x += 160) { R(x, BASE - 34, 2, 34, '#475569'); circ(x + 1, BASE - 35, 3, env > .3 ? '#fde68a' : '#94a3b8'); }
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
    const moving = p.state === 'walk';
    const sw = moving ? Math.sin(p.phase) * 4 * s : 0;
    const sit = p.state === 'sit', jump = p.state === 'protest' ? Math.abs(Math.sin(time * 4 + p.phase)) * 3 : 0;
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
    } else if (sit) { line(x, sh, x + 5 * s, sh + 4 * s); }
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
    if (p.kind !== 'soldier') { ctx.font = `${7.5 * s}px sans-serif`; ctx.textAlign = 'center'; ctx.fillText(EMO[m], x, hy - 8 * s); }
  }
  function drawPrez() {
    const p = prez; if (!p || !prezImg || !prezImg.complete) return;
    const x = p.x, y = WALK + 2, sw = p.walking ? Math.sin(p.phase) * 4 : 0;
    ctx.lineCap = 'round'; ctx.strokeStyle = S.player.look.suit; ctx.lineWidth = 3.4;
    line(x, y - 14, x + sw, y); line(x, y - 14, x - sw, y);
    ctx.save(); if (p.dir < 0) { ctx.translate(x * 2, 0); ctx.scale(-1, 1); }
    ctx.drawImage(prezImg, x - 18, y - 56, 36, 42); ctx.restore();
    rr(x - 22, y - 70, 44, 10, 5, 'rgba(251,191,36,.95)'); text('★ PRESIDENT', x, y - 62.5, 5.8, '#1a1205', 800);
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
    parts.forEach(q => { ctx.fillStyle = `rgba(${q.c},${(1 - q.life / q.max) * (q.g ? .9 : .55)})`; ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, Math.PI * 2); ctx.fill(); });
    lots.forEach(l => { const name = lotName(l); ctx.font = '700 7.5px Inter, system-ui, sans-serif'; const w = ctx.measureText(name).width + 12; rr(l.x + l.w / 2 - w / 2, l.top - 6, w, 12, 6, 'rgba(15,23,42,.72)'); text(name, l.x + l.w / 2, l.top + 2.5, 7.5, '#f8fafc'); });
    drawStreet();
    [...people].sort((a, b) => a.y - b.y).forEach(drawPerson);
    drawPrez();
    drawCars();
    people.forEach(p => { if (p.bubble && p.state !== 'inside') drawBubble(p.x, p.y - (p.kind === 'protester' ? 66 : 42) * (p.size || 1), p.bubble.text); });
    if (prez && prez.bubble) drawBubble(prez.x, WALK - 72, prez.bubble.text);
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
    if (prez && Math.abs(prez.x - wx) < 14 && wy > WALK - 62 && wy < WALK + 4) html = `<b>★ President ${esc(S.player.name)}</b><br>Visiting ${prez.lot ? lotName(prez.lot) : 'the city'}`;
    if (!html) {
      const p = people.filter(q => q.state !== 'inside' && Math.abs(q.x - wx) < 7 * (q.size || 1) && wy > q.y - 36 * (q.size || 1) && wy < q.y + 3).sort((a, b) => b.y - a.y)[0];
      if (p) {
        if (p.kind === 'builder') html = '<b>👷 Construction worker</b><br>Building for your government';
        else if (p.kind === 'soldier') html = `<b>🪖 Soldier</b><br>Army strength ${fmt(S.mil.army)}`;
        else { const v = moodOf(p.g), m = face(v); html = `<b>${GROUPS[p.g].icon} ${p.kind === 'kid' ? 'School kid' : GROUPS[p.g].name.replace(/s$/, '')}${p.kind === 'protester' ? ' (protesting)' : ''}</b><br>${EMO[m]} ${m > 0 ? 'Happy' : m < 0 ? 'Unhappy' : 'Okay'} · ${fmt(v)}%${p.bubble ? `<br>“${esc(p.bubble.text)}”` : ''}`; }
      }
    }
    if (!html && wy < BASE + 2) {
      const l = lotAt(wx);
      if (l) {
        let info = '';
        if (l.type === 'site') { const c = comp(l.p.company); info = `Built by ${c.name}<br>${l.p.turnsLeft} half-year${l.p.turnsLeft > 1 ? 's' : ''} left`; }
        else if (l.type === 'housing') info = `${S.housing.stock[region].toLocaleString()} homes for sale here`;
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
  return { attach, visit };
})();
