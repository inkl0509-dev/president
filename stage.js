/* ============================================================
   Debate studio + confetti effects.
   Debate: an animated TV studio with every candidate at a podium,
   a moderator, spotlights, a live audience and a live meter.
   Uses globals from data.js and game.js at runtime.
   ============================================================ */
'use strict';

const Confetti = (() => {
  let cv = null, ctx = null, ps = [], raf = 0;
  function burst(n = 180) {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!cv) { cv = document.createElement('canvas'); cv.id = 'confetti'; document.body.appendChild(cv); ctx = cv.getContext('2d'); }
    const dpr = window.devicePixelRatio || 1;
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cols = ['#f43f5e', '#facc15', '#22c55e', '#3b82f6', '#a855f7', '#fb923c', '#ffffff'];
    for (let i = 0; i < n; i++) ps.push({ x: innerWidth / 2 + (Math.random() - .5) * innerWidth * .4, y: innerHeight * .35, vx: (Math.random() - .5) * 15, vy: -Math.random() * 15 - 4,
      r: 5 + Math.random() * 5, c: cols[i % cols.length], rot: Math.random() * 6, vr: (Math.random() - .5) * .4, life: 0 });
    if (!raf) raf = requestAnimationFrame(step);
  }
  function step() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    ps.forEach(p => { p.vy += .32; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life++;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.c; ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); ctx.restore(); });
    ps = ps.filter(p => p.y < innerHeight + 20 && p.life < 420);
    raf = ps.length ? requestAnimationFrame(step) : 0;
    if (!raf) ctx.clearRect(0, 0, innerWidth, innerHeight);
  }
  return { burst };
})();

const Debate = (() => {
  const W = 900, H = 480, XS = [122, 315, 585, 778];
  const MOD_LOOK = { skin: '#c68642', hair: '#d6d3d1', style: 'short', suit: '#3f3f46', tie: '#f8fafc' };
  let cv = null, ctx = null, raf = 0, lastT = 0, time = 0, scale = 1, dpr = 1;
  let cast = [], speaker = -1, bubble = null, meter = 50, meterShown = 50, cheer = null, parts = [], winner = -1, country = '', audience = [], skip = null;
  const imgCache = {};
  const rand = (a, b) => a + Math.random() * (b - a);
  const choose = a => a[Math.floor(Math.random() * a.length)];
  const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
  function poly(pts, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]); ctx.closePath(); ctx.fill(); }
  function circ(x, y, r, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
  function rr(x, y, w, h, r, c) { r = Math.min(r, w / 2, h / 2); ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); ctx.fill(); }
  function text(t, x, y, size, color, weight = 700, align = 'center') { ctx.font = `${weight} ${size}px Inter, system-ui, sans-serif`; ctx.textAlign = align; ctx.fillStyle = color; ctx.fillText(t, x, y); }
  function wrap(t, maxW, size) {
    ctx.font = `600 ${size}px Inter, system-ui, sans-serif`;
    const words = t.split(' '), lines = []; let cur = '';
    words.forEach(w => { const test = cur ? cur + ' ' + w : w; if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; } else cur = test; });
    if (cur) lines.push(cur); return lines;
  }
  function imgFor(look, m) {
    const key = JSON.stringify(look) + m;
    if (!imgCache[key]) { const im = new Image(); im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140">${avatarInner(look, m)}</svg>`); imgCache[key] = im; }
    return imgCache[key];
  }
  function wait(ms) { return new Promise(res => { const t = setTimeout(() => { skip = null; res(); }, ms); skip = () => { clearTimeout(t); skip = null; res(); }; }); }

  function open(opts) {
    country = opts.country; meter = meterShown = 50; winner = -1; parts = []; speaker = -1; bubble = null; cheer = null;
    cast = opts.cast.map((c, i) => ({ ...c, x: XS[i], color: partyById(c.party).color }));
    cast.push({ name: 'Moderator', role: 'mod', look: MOD_LOOK, x: 450, color: '#64748b' });
    cast.forEach(c => { imgFor(c.look, 0); imgFor(c.look, 1); imgFor(c.look, -1); });
    audience = [];
    for (let r = 0; r < 3; r++) for (let i = 0; i < 23; i++) audience.push({ row: r, x: i * 41 + (r % 2) * 20 - 8 + rand(-4, 4), ph: Math.random() * 6, shade: rand(.75, 1), flag: Math.random() < .18 ? choose([cast[1].color, cast[2].color]) : null });
    const m = modal(`<div class="debate"><div class="debate-top"><span class="live-dot"></span> LIVE · Presidential debate</div><canvas id="debate-cv" aria-label="Debate stage"></canvas><div id="debate-panel" class="debate-panel"></div></div>`, 'debate-card');
    cv = $('#debate-cv', m); ctx = cv.getContext('2d');
    cv.onclick = () => skip && skip();
    resize();
    lastT = performance.now(); if (!raf) raf = requestAnimationFrame(loop);
  }
  function close() { if (raf) cancelAnimationFrame(raf); raf = 0; cv = null; closeModal(); }
  function resize() { if (!cv) return; dpr = window.devicePixelRatio || 1; const w = cv.clientWidth || 800; cv.width = Math.round(w * dpr); cv.height = Math.round(w * H / W * dpr); scale = w / W; }
  function loop(now) {
    raf = 0; if (!cv || !cv.isConnected) { cv = null; return; }
    const dt = Math.min(.05, (now - lastT) / 1000); lastT = now; time += dt;
    if (Math.abs(cv.width - cv.clientWidth * dpr) > 2) resize();
    meterShown += (meter - meterShown) * Math.min(1, dt * 3);
    parts.forEach(p => { p.life += dt; p.x += (p.vx || 0) * dt; p.y += p.vy * dt; if (p.conf) { p.vy += 40 * dt; p.rot += dt * 5; } });
    parts = parts.filter(p => p.life < p.max);
    if (winner === 1 && Math.random() < dt * 40) parts.push({ x: rand(0, W), y: -10, vx: rand(-20, 20), vy: rand(40, 80), life: 0, max: 6, conf: choose(['#f43f5e', '#facc15', '#22c55e', '#3b82f6', '#a855f7', '#fff']), rot: rand(0, 6) });
    if (Math.random() < dt * 1.5) parts.push({ flash: true, x: rand(20, W - 20), y: rand(425, 470), vy: 0, life: 0, max: .12 });
    draw();
    raf = requestAnimationFrame(loop);
  }

  // ---------- drawing ----------
  function draw() {
    ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
    const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#0a0f2c'); bg.addColorStop(1, '#151a3d'); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 18; i++) for (let j = 0; j < 10; j++) { const a = .05 + .05 * Math.sin(time * 1.6 + i * .45 + j * .7); R(i * 50 + 1, j * 30 + 18, 48, 28, `rgba(59,130,246,${a})`); }
    // hanging party banners
    [[cast[0], 34], [cast[1], 222], [cast[2], 678], [cast[3], 866]].forEach(([c, x]) => {
      const sway = Math.sin(time * 1.2 + x) * 2;
      poly([x - 18, 14, x + 18, 14, x + 18 + sway, 150, x + sway, 168, x - 18 + sway, 150], c.color);
      text('★', x + sway / 2, 70, 20, 'rgba(255,255,255,.85)'); text(partyById(c.party).name.split(' ')[0].toUpperCase(), x + sway / 2, 100, 7, '#fff', 800);
    });
    // big screen
    rr(286, 22, 328, 156, 10, '#94a3b8'); rr(290, 26, 320, 148, 8, '#020617');
    const sg = ctx.createLinearGradient(290, 26, 610, 174); sg.addColorStop(0, 'rgba(30,58,138,.6)'); sg.addColorStop(1, 'rgba(88,28,135,.5)'); ctx.fillStyle = sg; ctx.fillRect(290, 26, 320, 148);
    circ(306, 42, 4.5, Math.sin(time * 5) > 0 ? '#ef4444' : '#7f1d1d'); text('LIVE', 316, 46, 9, '#fecaca', 800, 'left');
    text('THE GREAT DEBATE', 450, 72, 24, '#fde68a', 800);
    text(`${country.toUpperCase()} · PRESIDENTIAL ELECTION`, 450, 92, 9, '#cbd5e1', 700);
    const p = cast[1], o = cast[2];
    rr(318, 112, 264, 20, 10, o.color); rr(318, 112, Math.max(20, 264 * meterShown / 100), 20, 10, p.color);
    R(318 + 264 * .5 - 1, 108, 2, 28, '#fff');
    text(`${p.name.split(' ').slice(-1)[0]} ${Math.round(meterShown)}%`, 324, 126, 10, '#fff', 800, 'left');
    text(`${Math.round(100 - meterShown)}% ${o.name.split(' ').slice(-1)[0]}`, 576, 126, 10, '#fff', 800, 'right');
    text('LIVE AUDIENCE METER · WHO IS WINNING?', 450, 156, 8, '#94a3b8', 700);
    // lighting truss
    R(0, 4, W, 9, '#334155'); for (let i = 0; i < 12; i++) { circ(38 + i * 75, 16, 6, '#cbd5e1'); circ(38 + i * 75, 18, 3.5, '#fef9c3'); }
    // spotlight cones
    ctx.globalCompositeOperation = 'lighter';
    cast.forEach((c, i) => {
      const on = i === speaker || i === winner, a = on ? .22 : .05, sx = c.x + Math.sin(time * .6 + i) * 6;
      const g = ctx.createLinearGradient(0, 14, 0, 380); g.addColorStop(0, `rgba(255,248,220,${a})`); g.addColorStop(1, `rgba(255,248,220,${a * .2})`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(sx - 6, 14); ctx.lineTo(sx + 6, 14); ctx.lineTo(c.x + 62, 380); ctx.lineTo(c.x - 62, 380); ctx.closePath(); ctx.fill();
    });
    [[150, '96,165,250'], [750, '244,114,182']].forEach(([sx, col], i) => {
      const tx = 450 + Math.sin(time * .7 + i * 2) * 340;
      ctx.fillStyle = `rgba(${col},.07)`; ctx.beginPath(); ctx.moveTo(sx - 4, 14); ctx.lineTo(sx + 4, 14); ctx.lineTo(tx + 50, 400); ctx.lineTo(tx - 50, 400); ctx.closePath(); ctx.fill();
    });
    ctx.globalCompositeOperation = 'source-over';
    // floor
    const fg = ctx.createLinearGradient(0, 300, 0, H); fg.addColorStop(0, '#243049'); fg.addColorStop(1, '#0b1020'); ctx.fillStyle = fg; ctx.fillRect(0, 300, W, H - 300);
    ctx.fillStyle = 'rgba(148,163,184,.12)'; ctx.beginPath(); ctx.ellipse(450, 350, 400, 36, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(253,230,138,.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(450, 350, 380, 32, 0, 0, Math.PI * 2); ctx.stroke();
    cast.forEach((c, i) => { if (c.role !== 'mod') drawCandidate(c, i); });
    drawCandidate(cast[4], 4);
    drawAudience();
    parts.forEach(q => {
      const a = 1 - q.life / q.max;
      if (q.flash) { circ(q.x, q.y, 10, `rgba(255,255,255,${a * .8})`); return; }
      ctx.globalAlpha = Math.max(0, a);
      if (q.conf) { ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.rot); R(-4, -2, 8, 4, q.conf); ctx.restore(); }
      else { ctx.font = '16px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(q.txt, q.x, q.y); }
      ctx.globalAlpha = 1;
    });
    if (bubble) drawBubble();
  }
  function drawCandidate(c, i) {
    const mod = c.role === 'mod', speaking = i === speaker;
    let m = mod ? 0 : c.role === 'player' ? 1 : 0;
    if (winner >= 0 && !mod) m = winner === i ? 1 : -1;
    if (speaking) m = Math.floor(time * 9) % 2 ? 1 : 0;                       // mouth flaps while talking
    const bob = speaking ? Math.sin(time * 7) * 1.6 : Math.sin(time * 1.3 + i) * .7;
    const iw = mod ? 80 : 100, ih = iw * 140 / 120, top = mod ? 348 : 300;
    if (speaking && !mod) { ctx.fillStyle = c.color + '55'; ctx.beginPath(); ctx.ellipse(c.x, 382, 70, 10, 0, 0, Math.PI * 2); ctx.fill(); }
    const im = imgFor(c.look, m);
    if (im.complete) ctx.drawImage(im, c.x - iw / 2, top - ih + 20 + bob, iw, ih);
    if (mod) {
      rr(c.x - 74, top, 148, 42, 6, '#1f2937'); R(c.x - 74, top, 148, 4, '#94a3b8');
      text('MODERATOR', c.x, top + 26, 10, '#cbd5e1', 800);
      return;
    }
    ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(c.x - 12, top + 2); ctx.lineTo(c.x - 18, top - 24); ctx.stroke(); circ(c.x - 18, top - 26, 3.5, '#111827');
    poly([c.x - 50, top, c.x + 50, top, c.x + 42, top + 82, c.x - 42, top + 82], '#e2e8f0');
    poly([c.x - 43, top + 6, c.x + 43, top + 6, c.x + 37, top + 76, c.x - 37, top + 76], c.color);
    R(c.x - 50, top - 3, 100, 5, '#f8fafc');
    text('★', c.x, top + 24, 13, 'rgba(255,255,255,.9)');
    const last = c.name.split(' ').slice(-1)[0].toUpperCase();
    text(last, c.x, top + 44, last.length > 8 ? 11 : 13, '#fff', 800);
    text(partyById(c.party).name, c.x, top + 60, 7.5, 'rgba(255,255,255,.85)', 700);
    if (c.role === 'player') { rr(c.x - 18, top + 88, 36, 13, 6, '#fbbf24'); text('YOU', c.x, top + 98, 8.5, '#1a1205', 800); }
  }
  function drawAudience() {
    const ch = cheer && time - cheer.t0 < 2.4 ? cheer : null;
    audience.forEach(a => {
      const y = 432 + a.row * 18;
      let dy = 0, arms = false, shake = 0;
      if (ch) {
        if (ch.v > 0 && Math.sin(a.ph * 3) > -.2) { dy = -Math.abs(Math.sin(time * 10 + a.ph)) * 5; arms = true; }
        if (ch.v < 0) shake = Math.sin(time * 14 + a.ph) * 1.5;
      }
      const col = `rgb(${Math.round(46 * a.shade)},${Math.round(56 * a.shade)},${Math.round(96 * a.shade)})`;
      if (arms) { ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(a.x - 8, y + dy); ctx.lineTo(a.x - 14, y - 20 + dy); ctx.moveTo(a.x + 8, y + dy); ctx.lineTo(a.x + 14, y - 20 + dy); ctx.stroke(); }
      if (a.flag && (arms || Math.sin(time + a.ph) > .6)) { ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(a.x + 14, y - 20 + dy); ctx.lineTo(a.x + 14, y - 38 + dy); ctx.stroke(); R(a.x + 14, y - 38 + dy + Math.sin(time * 6 + a.ph), 12, 8, a.flag); }
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(a.x, y + 14 + dy, 16, 12, 0, Math.PI, 0); ctx.fill();
      circ(a.x + shake, y - 4 + dy, 10, col);
      ctx.strokeStyle = 'rgba(191,219,254,.55)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(a.x + shake, y - 4 + dy, 10, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
    });
  }
  function drawBubble() {
    const c = cast[bubble.i]; const mod = c.role === 'mod';
    const size = 13, lines = wrap(bubble.text, 250, size), w = Math.min(270, Math.max(...lines.map(l => ctx.measureText(l).width)) + 22), h = lines.length * 17 + 14;
    const ax = c.x, ay = mod ? 262 : 196;
    const bx = Math.max(8, Math.min(W - w - 8, ax - w / 2)), by = ay - h - 10;
    const pop = Math.min(1, (time - bubble.t0) * 6);
    ctx.save(); ctx.translate(ax, ay); ctx.scale(pop, pop); ctx.translate(-ax, -ay);
    rr(bx, by, w, h, 10, '#ffffff'); poly([ax - 7, by + h - 1, ax + 7, by + h - 1, ax, by + h + 10], '#ffffff');
    R(bx, by, 5, h, c.color);
    lines.forEach((l, k) => text(l, bx + w / 2 + 2, by + 22 + k * 17, size, '#0f172a', 600));
    ctx.restore();
  }

  // ---------- script API ----------
  async function say(i, t, ms = 2600) { speaker = i; bubble = { i, text: t, t0: time }; await wait(ms); bubble = null; speaker = -1; }
  function react(v) {
    cheer = { t0: time, v };
    meter = Math.max(8, Math.min(92, meter + v));
    const n = Math.min(16, 4 + Math.round(Math.abs(v) * 2));
    for (let k = 0; k < n; k++) parts.push({ x: rand(40, W - 40), y: rand(420, 455), vy: -rand(30, 60), vx: rand(-6, 6), life: 0, max: 1.8, txt: v > 0 ? choose(['👏', '👏', '🙌', '❤️']) : choose(['🤔', '😐', '👎']) });
  }
  function ask(title, answers, fxHTML) {
    return new Promise(res => {
      const p = $('#debate-panel');
      p.innerHTML = `<div class="dq">🎙️ ${title}</div><div class="dchoices">${answers.map((a, i) => `<button class="choice" data-i="${i}"><b>${a.t}</b><span class="fx">${fxHTML(a)}</span></button>`).join('')}</div>`;
      p.querySelectorAll('.choice').forEach(b => b.onclick = () => { p.innerHTML = '<div class="dwait">Click the stage to skip ▶</div>'; res(+b.dataset.i); });
    });
  }
  function panel(html) { const p = $('#debate-panel'); if (p) p.innerHTML = html; }
  function finish(i) { winner = i; speaker = -1; }
  return { open, close, say, react, ask, panel, finish, meter: () => meter, PLAYER: 1, OPP: 2, MOD: 4 };
})();
