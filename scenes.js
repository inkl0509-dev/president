/* ============================================================
   scenes.js — animated scenes & foreign affairs
   • Flags     — drawn flags (SVG) so they work on every OS
   • Scenes    — canvas scenes: office, speech, UN General Assembly,
                 summit, bilateral visit, cabinet room
   • Speech    — speeches written in the formal style of heads of state
   • Diplomacy — UN, summits of the real organisations each country
                 belongs to, and state visits to partner countries
   Uses globals from data.js, game.js and gov.js at runtime.
   ============================================================ */
'use strict';

// ============================================================
// FLAGS (viewBox 30×20, simplified but recognisable)
// ============================================================
const Flags = (() => {
  const starPts = (cx, cy, r, n = 5, k = .4, rot = -Math.PI / 2) => Array.from({ length: n * 2 }, (_, i) => { const a = rot + i * Math.PI / n, rr = i % 2 ? r * k : r; return `${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`; }).join(' ');
  const star = (cx, cy, r, f, n = 5, k = .4) => `<polygon points="${starPts(cx, cy, r, n, k)}" fill="${f}"/>`;
  const h3 = (a, b, c) => `<rect width="30" height="20" fill="${b}"/><rect width="30" height="6.67" fill="${a}"/><rect y="13.33" width="30" height="6.67" fill="${c}"/>`;
  const v3 = (a, b, c) => `<rect width="30" height="20" fill="${b}"/><rect width="10" height="20" fill="${a}"/><rect x="20" width="10" height="20" fill="${c}"/>`;
  const crescent = (cx, cy, r, bg, f = '#fff', dx = .28) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}"/><circle cx="${cx + r * dx}" cy="${cy}" r="${r * .8}" fill="${bg}"/>`;
  const union = `<rect width="30" height="20" fill="#012169"/><path d="M0 0L30 20M30 0L0 20" stroke="#fff" stroke-width="4"/><path d="M0 0L30 20M30 0L0 20" stroke="#c8102e" stroke-width="1.4"/><path d="M15 0V20M0 10H30" stroke="#fff" stroke-width="6"/><path d="M15 0V20M0 10H30" stroke="#c8102e" stroke-width="3.4"/>`;
  const D = {
    uz: `<rect width="30" height="20" fill="#fff"/><rect width="30" height="6.4" fill="#0099b5"/><rect y="13.6" width="30" height="6.4" fill="#1eb53a"/><rect y="6.3" width="30" height=".5" fill="#ce1126"/><rect y="13.2" width="30" height=".5" fill="#ce1126"/>${crescent(4, 3.2, 2.2, '#0099b5')}${[[8, 1.4], [10, 1.4], [12, 1.4], [8, 3.2], [10, 3.2], [12, 3.2], [10, 5], [12, 5], [8, 5]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".45" fill="#fff"/>`).join('')}`,
    kz: `<rect width="30" height="20" fill="#00afca"/><circle cx="15.5" cy="8.5" r="3.2" fill="#fec50c"/>${Array.from({ length: 16 }, (_, i) => { const a = i * Math.PI / 8; return `<line x1="${15.5 + 3.8 * Math.cos(a)}" y1="${8.5 + 3.8 * Math.sin(a)}" x2="${15.5 + 4.8 * Math.cos(a)}" y2="${8.5 + 4.8 * Math.sin(a)}" stroke="#fec50c" stroke-width=".5"/>`; }).join('')}<path d="M10 14.5Q15.5 17 21 14.5Q15.5 15.6 10 14.5Z" fill="#fec50c"/><rect x="1.4" y="1" width="1.3" height="18" fill="#fec50c" opacity=".85"/>`,
    tr: `<rect width="30" height="20" fill="#e30a17"/>${crescent(11, 10, 5, '#e30a17', '#fff', .26)}${star(17.4, 10, 2.6, '#fff')}`,
    us: `<rect width="30" height="20" fill="#fff"/>${Array.from({ length: 7 }, (_, i) => `<rect y="${i * 20 / 6.5}" width="30" height="${20 / 13}" fill="#b22234"/>`).join('')}<rect width="12" height="10.77" fill="#3c3b6e"/>${Array.from({ length: 20 }, (_, i) => `<circle cx="${1.2 + (i % 5) * 2.4}" cy="${1.2 + Math.floor(i / 5) * 2.6}" r=".45" fill="#fff"/>`).join('')}`,
    gb: union,
    de: h3('#000', '#dd0000', '#ffce00'),
    fr: v3('#0055a4', '#fff', '#ef4135'),
    jp: `<rect width="30" height="20" fill="#fff"/><circle cx="15" cy="10" r="6" fill="#bc002d"/>`,
    in: `${h3('#ff9933', '#fff', '#138808')}<circle cx="15" cy="10" r="2.6" fill="none" stroke="#000080" stroke-width=".6"/><circle cx="15" cy="10" r=".6" fill="#000080"/>`,
    br: `<rect width="30" height="20" fill="#009c3b"/><polygon points="15,2 28,10 15,18 2,10" fill="#ffdf00"/><circle cx="15" cy="10" r="4.3" fill="#002776"/><path d="M10.9 9.2Q15 7.6 19.1 10.6" stroke="#fff" stroke-width=".7" fill="none"/>`,
    ru: h3('#fff', '#0039a6', '#d52b1e'),
    cn: `<rect width="30" height="20" fill="#de2910"/>${star(5, 5, 3, '#ffde00')}${[[10, 2], [12, 4], [12, 7], [10, 9]].map(([x, y]) => star(x, y, 1, '#ffde00')).join('')}`,
    kr: `<rect width="30" height="20" fill="#fff"/><circle cx="15" cy="10" r="5" fill="#003478"/><path d="M10 10A5 5 0 0 1 20 10A2.5 2.5 0 0 1 15 10A2.5 2.5 0 0 0 10 10Z" fill="#c60c30"/>${[[5, 4], [25, 4], [5, 16], [25, 16]].map(([x, y]) => `<rect x="${x - 2}" y="${y - 1.4}" width="4" height="2.8" fill="#000" opacity=".85"/>`).join('')}`,
    ae: `${h3('#00732f', '#fff', '#000')}<rect width="8" height="20" fill="#ff0000"/>`,
    it: v3('#009246', '#fff', '#ce2b37'),
    es: `<rect width="30" height="20" fill="#aa151b"/><rect y="5" width="30" height="10" fill="#f1bf00"/>`,
    pl: `<rect width="30" height="20" fill="#dc143c"/><rect width="30" height="10" fill="#fff"/>`,
    nl: h3('#ae1c28', '#fff', '#21468b'),
    ca: `<rect width="30" height="20" fill="#fff"/><rect width="7.5" height="20" fill="#d52b1e"/><rect x="22.5" width="7.5" height="20" fill="#d52b1e"/>${star(15, 9.6, 4.2, '#d52b1e', 11, .55)}<rect x="14.6" y="12" width=".8" height="3.5" fill="#d52b1e"/>`,
    mx: `${v3('#006847', '#fff', '#ce1126')}<circle cx="15" cy="10" r="2.2" fill="#8c5a2b"/>`,
    au: `<rect width="30" height="20" fill="#012169"/><g transform="scale(.5)">${union}</g>${star(7.5, 15, 2, '#fff', 7)}${[[22, 4], [26, 9], [22, 16], [19, 10]].map(([x, y]) => star(x, y, 1.1, '#fff', 7)).join('')}`,
    nz: `<rect width="30" height="20" fill="#012169"/><g transform="scale(.5)">${union}</g>${[[22, 5], [25, 9], [22, 16], [19, 10]].map(([x, y]) => star(x, y, 1.3, '#c8102e')).join('')}`,
    az: `${h3('#00b5e2', '#ef3340', '#509e2f')}${crescent(14, 10, 2.6, '#ef3340', '#fff', .3)}${star(17, 10, 1.2, '#fff', 8)}`,
    sa: `<rect width="30" height="20" fill="#006c35"/><rect x="7" y="7" width="16" height="1.4" fill="#fff" opacity=".9"/><rect x="9" y="5" width="12" height="1" fill="#fff" opacity=".7"/><rect x="8" y="13" width="14" height="1" fill="#fff"/>`,
    pk: `<rect width="30" height="20" fill="#01411c"/><rect width="7.5" height="20" fill="#fff"/>${crescent(19.5, 10, 5, '#01411c', '#fff', .3)}${star(22, 8, 1.6, '#fff')}`,
    ie: v3('#169b62', '#fff', '#ff883e'),
    za: `<rect width="30" height="20" fill="#fff"/><rect width="30" height="8" fill="#e03c31"/><rect y="12" width="30" height="8" fill="#001489"/><rect y="7.5" width="30" height="5" fill="#007749"/><polygon points="0,0 12,10 0,20" fill="#007749"/><polygon points="0,3 8,10 0,17" fill="#ffb81c"/><polygon points="0,4.5 6.4,10 0,15.5" fill="#000"/>`,
    ar: `${h3('#74acdf', '#fff', '#74acdf')}<circle cx="15" cy="10" r="2" fill="#f6b40e"/>`,
    pt: `<rect width="30" height="20" fill="#da291c"/><rect width="12" height="20" fill="#046a38"/><circle cx="12" cy="10" r="3.4" fill="#ffe900"/><circle cx="12" cy="10" r="2" fill="#da291c"/>`,
    id: `<rect width="30" height="20" fill="#fff"/><rect width="30" height="10" fill="#ce1126"/>`,
    kg: `<rect width="30" height="20" fill="#e8112d"/>${star(15, 10, 5.2, '#ffef00', 20, .7)}<circle cx="15" cy="10" r="2.6" fill="#e8112d"/>`,
    tj: `<rect width="30" height="20" fill="#fff"/><rect width="30" height="5.7" fill="#cc0000"/><rect y="14.3" width="30" height="5.7" fill="#006600"/><path d="M13 11h4l-.5-2.5-1.5 1-1.5-1z" fill="#f8c300"/>`,
    tm: `<rect width="30" height="20" fill="#00843d"/><rect x="4" width="5" height="20" fill="#d22630"/>${crescent(15, 6, 2.4, '#00843d', '#fff', .3)}`,
    by: `<rect width="30" height="20" fill="#c8313e"/><rect y="13.3" width="30" height="6.7" fill="#4aa657"/><rect width="4" height="20" fill="#fff"/>${Array.from({ length: 7 }, (_, i) => `<polygon points="2,${1 + i * 2.8} 3.2,${2.4 + i * 2.8} 2,${3.8 + i * 2.8} .8,${2.4 + i * 2.8}" fill="#c8313e"/>`).join('')}`,
    am: h3('#d90012', '#0033a0', '#f2a800'),
    eg: `${h3('#ce1126', '#fff', '#000')}<circle cx="15" cy="10" r="1.8" fill="#c09300"/>`,
    ir: `${h3('#239f40', '#fff', '#da0000')}<circle cx="15" cy="10" r="1.6" fill="none" stroke="#da0000" stroke-width=".6"/>`,
    vn: `<rect width="30" height="20" fill="#da251d"/>${star(15, 10, 5, '#ffff00')}`,
    ma: `<rect width="30" height="20" fill="#c1272d"/><polygon points="${starPts(15, 10.5, 4.6, 5, .38)}" fill="none" stroke="#006233" stroke-width=".9"/>`,
    eu: `<rect width="30" height="20" fill="#003399"/>${Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return star(15 + 6 * Math.cos(a), 10 + 6 * Math.sin(a), .9, '#ffcc00'); }).join('')}`,
    un: `<rect width="30" height="20" fill="#5b92e5"/><circle cx="15" cy="9.5" r="4.2" fill="none" stroke="#fff" stroke-width=".6"/><circle cx="15" cy="9.5" r="2.4" fill="none" stroke="#fff" stroke-width=".4"/><path d="M15 5.3V13.7M10.8 9.5H19.2" stroke="#fff" stroke-width=".4"/><path d="M9.6 12Q9 7 12 5M20.4 12Q21 7 18 5" stroke="#fff" stroke-width=".7" fill="none"/>`,
    ng: v3('#008751', '#fff', '#008751'),
    ke: `${h3('#000', '#bb0000', '#006600')}<rect y="6.2" width="30" height=".8" fill="#fff"/><rect y="13" width="30" height=".8" fill="#fff"/><ellipse cx="15" cy="10" rx="2.2" ry="4.6" fill="#bb0000" stroke="#000" stroke-width=".4"/>`,
    jm: `<rect width="30" height="20" fill="#009b3a"/><polygon points="0,0 0,20 13,10" fill="#000"/><polygon points="30,0 30,20 17,10" fill="#000"/><path d="M0 0L30 20M30 0L0 20" stroke="#fed100" stroke-width="2.6"/>`,
    et: `${h3('#078930', '#fcdd09', '#da121a')}<circle cx="15" cy="10" r="3.4" fill="#0f47af"/>${star(15, 10, 2.3, '#fcdd09')}`,
    bo: h3('#d52b1e', '#f9e300', '#007934'),
    py: `${h3('#d52b1e', '#fff', '#0038a8')}<circle cx="15" cy="10" r="1.6" fill="none" stroke="#000" stroke-width=".3"/>`,
    uy: `<rect width="30" height="20" fill="#fff"/>${[1, 3, 5, 7].map(i => `<rect y="${i * 20 / 9}" width="30" height="${20 / 9}" fill="#0038a8"/>`).join('')}<rect width="11" height="11" fill="#fff"/><circle cx="5.5" cy="5.5" r="2.6" fill="#fcd116"/>`,
    mv: `<rect width="30" height="20" fill="#d21034"/><rect x="5" y="4.5" width="20" height="11" fill="#007e3a"/>${crescent(16, 10, 3.6, '#007e3a', '#fff', .3)}`,
    lk: `<rect width="30" height="20" fill="#ffbe29"/><rect x="1" y="1" width="3.5" height="18" fill="#00534e"/><rect x="4.5" y="1" width="3.5" height="18" fill="#eb7400"/><rect x="9" y="1" width="20" height="18" fill="#8d153a"/>${star(19, 10, 4, '#ffbe29', 8, .5)}`,
    veloria: `<rect width="30" height="20" fill="#1e3a8a"/><rect y="12" width="30" height="8" fill="#f59e0b"/>${star(8, 6, 3, '#fff')}`,
  };
  const CODE = { mv: 'mv', uz: 'uz', kz: 'kz', tr: 'tr', us: 'us', uk: 'gb', de: 'de', fr: 'fr', jp: 'jp', in: 'in', br: 'br', veloria: 'veloria' };
  const code = id => CODE[id] || id;
  const raw = c => `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 30 20">${D[c] || D.veloria}</svg>`;
  const svg = (c, w = 22) => `<svg class="flag" viewBox="0 0 30 20" width="${w}" height="${Math.round(w * 2 / 3)}" aria-hidden="true">${D[c] || D.veloria}</svg>`;
  const cache = {};
  function img(c) { if (!cache[c]) { const im = new Image(); im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(raw(c)); cache[c] = im; } return cache[c]; }
  Object.keys(D).forEach(img);
  return { svg, img, code, has: c => !!D[c] };
})();
const myFlagCode = () => Flags.code((S && S.countryId) || 'veloria');
const myFlag = (w = 18) => Flags.svg(myFlagCode(), w);

// ============================================================
// SCENE RUNNER & DRAWING HELPERS
// ============================================================
let SC = null;   // current 2D context while a scene draws
const sR = (x, y, w, h, c) => { SC.fillStyle = c; SC.fillRect(x, y, w, h); };
function sPoly(p, c) { SC.fillStyle = c; SC.beginPath(); SC.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) SC.lineTo(p[i], p[i + 1]); SC.closePath(); SC.fill(); }
function sCirc(x, y, r, c) { SC.fillStyle = c; SC.beginPath(); SC.arc(x, y, r, 0, Math.PI * 2); SC.fill(); }
function sLine(x1, y1, x2, y2, c, w = 1) { SC.strokeStyle = c; SC.lineWidth = w; SC.beginPath(); SC.moveTo(x1, y1); SC.lineTo(x2, y2); SC.stroke(); }
function sRR(x, y, w, h, r, c) { r = Math.min(r, w / 2, h / 2); SC.fillStyle = c; SC.beginPath(); SC.moveTo(x + r, y); SC.arcTo(x + w, y, x + w, y + h, r); SC.arcTo(x + w, y + h, x, y + h, r); SC.arcTo(x, y + h, x, y, r); SC.arcTo(x, y, x + w, y, r); SC.closePath(); SC.fill(); }
function sText(t, x, y, size, color, weight = 700, align = 'center', font = 'Inter, system-ui, sans-serif') { SC.font = `${weight} ${size}px ${font}`; SC.textAlign = align; SC.fillStyle = color; SC.fillText(t, x, y); }
function sWrap(t, maxW, size, weight = 600) { SC.font = `${weight} ${size}px Inter, system-ui, sans-serif`; const out = []; let cur = ''; String(t).split(' ').forEach(w => { const n = cur ? cur + ' ' + w : w; if (SC.measureText(n).width > maxW && cur) { out.push(cur); cur = w; } else cur = n; }); if (cur) out.push(cur); return out; }
const sImgCache = {};
function sAvatar(look, m) { const k = JSON.stringify(look) + m; if (!sImgCache[k]) { const im = new Image(); im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140">${avatarInner(look, m)}</svg>`); sImgCache[k] = im; } return sImgCache[k]; }
function sBust(look, m, x, y, w) { const im = sAvatar(look, m); if (im.complete) SC.drawImage(im, x - w / 2, y, w, w * 140 / 120); }
function sPerson(look, m, x, y, s = 1, o = {}) {           // full standing figure, feet at y
  const sw = o.walk ? Math.sin(o.t * 9) * 4 * s : 0;
  SC.lineCap = 'round'; sLine(x, y - 14 * s, x + sw, y, look.suit, 3.4 * s); sLine(x, y - 14 * s, x - sw, y, look.suit, 3.4 * s);
  const im = sAvatar(look, m); if (!im.complete) return;
  SC.save(); if (o.dir < 0) { SC.translate(x * 2, 0); SC.scale(-1, 1); } SC.drawImage(im, x - 18 * s, y - 56 * s, 36 * s, 42 * s); SC.restore();
}
function sFlag(code, x, y, w, t, pole = true, wave = true) {     // waving flag; (x,y) = top of pole
  const im = Flags.img(code), h = w * 2 / 3;
  if (pole) { sLine(x, y - 4, x, y + w * 2.4, '#cbd5e1', Math.max(1.5, w / 18)); sCirc(x, y - 4, Math.max(2, w / 14), '#fbbf24'); }
  if (!im.complete) return;
  const n = 12;
  for (let i = 0; i < n; i++) {
    const sx = i / n * 30, dy = wave ? Math.sin(t * 3 + i * .6 + x) * (h * .06) * (i / n) : 0;
    SC.drawImage(im, sx / 30 * im.width, 0, im.width / n + .5, im.height, x + i * w / n, y + dy, w / n + .6, h);
  }
  SC.fillStyle = 'rgba(0,0,0,.08)'; SC.fillRect(x, y, w, h * .08);
}
function sBubble(x, y, t, maxW = 230, size = 12) {
  const lines = sWrap(t, maxW, size), w = Math.min(maxW + 20, Math.max(...lines.map(l => SC.measureText(l).width)) + 20), h = lines.length * (size + 4) + 12;
  const bx = x - w / 2, by = y - h - 8;
  sRR(bx, by, w, h, 9, 'rgba(255,255,255,.97)'); sPoly([x - 6, by + h - 1, x + 6, by + h - 1, x, by + h + 8], 'rgba(255,255,255,.97)');
  lines.forEach((l, i) => sText(l, x, by + 8 + size + i * (size + 4) - 2, size, '#0f172a', 600));
}
function sCrowdHead(x, y, kind, t, ph, cheer) {
  const dy = cheer ? -Math.abs(Math.sin(t * 9 + ph)) * 5 : 0;
  const skin = ['#f5d0b5', '#e0ac69', '#c68642', '#8d5524'][Math.floor(ph * 10) % 4];
  const col = { workers: '#f97316', business: '#1f2937', farmers: '#65a30d', youth: ['#ec4899', '#06b6d4', '#a855f7'][Math.floor(ph * 7) % 3], elderly: '#94a3b8', delegate: '#1e293b' }[kind] || '#334155';
  SC.fillStyle = col; SC.beginPath(); SC.ellipse(x, y + 16 + dy, 15, 12, 0, Math.PI, 0); SC.fill();
  if (cheer) { sLine(x - 9, y + 8 + dy, x - 14, y - 10 + dy, col, 4); sLine(x + 9, y + 8 + dy, x + 14, y - 10 + dy, col, 4); }
  sCirc(x, y + dy, 8.5, skin);
  if (kind === 'workers') { SC.fillStyle = '#facc15'; SC.beginPath(); SC.arc(x, y - 2 + dy, 9, Math.PI, 0); SC.fill(); }
  else if (kind === 'farmers') { SC.fillStyle = '#eab308'; SC.beginPath(); SC.ellipse(x, y - 5 + dy, 13, 3, 0, 0, Math.PI * 2); SC.fill(); sR(x - 5, y - 11 + dy, 10, 6, '#ca8a04'); }
  else { SC.fillStyle = kind === 'elderly' ? '#e5e7eb' : '#2b1b0e'; SC.beginPath(); SC.arc(x, y - 1 + dy, 8.8, Math.PI, 0); SC.fill(); }
}
function sFlash(t, ph, x, y) { if (Math.sin(t * 7 + ph * 13) > .985) sCirc(x, y, 9, 'rgba(255,255,255,.9)'); }

function makeRunner() {
  let cv = null, ctx = null, raf = 0, last = 0, scene = null, scale = 1, dpr = 1, H = 300;
  const api = { t: 0, vw: 900, H: 300, p: {}, st: {} };
  function attach(el, sc, p = {}, h = 300) {
    if (!el) { cv = null; return; }
    if (el !== cv || sc !== scene) { api.t = 0; api.st = {}; }
    cv = el; ctx = el.getContext('2d'); scene = sc; api.p = p; H = api.H = h;
    resize();
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); }
  }
  function resize() { dpr = window.devicePixelRatio || 1; const cw = cv.clientWidth || 900, ch = cv.clientHeight || H; cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr); scale = ch / H; api.vw = cw / scale; }
  function loop(now) {
    raf = 0;
    if (!cv || !cv.isConnected) { cv = null; return; }
    const dt = Math.min(.05, (now - last) / 1000); last = now; api.t += dt;
    if (Math.abs(cv.width - cv.clientWidth * dpr) > 2 || Math.abs(cv.height - cv.clientHeight * dpr) > 2) resize();
    SC = ctx; ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0); ctx.clearRect(0, 0, api.vw, H);
    try { DRAW[scene] && DRAW[scene](api, dt); } catch (e) { console.error(e); }
    raf = requestAnimationFrame(loop);
  }
  return { attach, api, get active() { return !!cv; } };
}

// ============================================================
// SCENES
// ============================================================
const DRAW = {};
let OFFICE_EV = null;   // { type:'signing', title, t0 }

DRAW.office = (a, dt) => {
  const { vw, t } = a, H = 300, cx = vw / 2, st = a.st;
  const day = !S.turn || S.turn % 2;
  // walls & floor
  const wg = SC.createLinearGradient(0, 0, 0, 210); wg.addColorStop(0, '#efe3cc'); wg.addColorStop(1, '#dccaa8'); SC.fillStyle = wg; SC.fillRect(0, 0, vw, 210);
  for (let x = (cx % 60) - 60; x < vw; x += 60) sR(x, 0, 2, 175, 'rgba(120,90,50,.12)');
  sR(0, 175, vw, 35, '#6b4a2b'); sR(0, 175, vw, 4, '#8a6239');
  const fg = SC.createLinearGradient(0, 210, 0, H); fg.addColorStop(0, '#1e3a8a'); fg.addColorStop(1, '#172554'); SC.fillStyle = fg; SC.fillRect(0, 210, vw, 90);
  SC.fillStyle = '#1e40af'; SC.beginPath(); SC.ellipse(cx, 262, 260, 34, 0, 0, Math.PI * 2); SC.fill();
  SC.strokeStyle = '#fbbf24'; SC.lineWidth = 2; SC.beginPath(); SC.ellipse(cx, 262, 250, 30, 0, 0, Math.PI * 2); SC.stroke();
  // window with the capital
  const wx = cx - 120, wy = 26, ww = 240, wh = 130;
  const sky = SC.createLinearGradient(0, wy, 0, wy + wh);
  if (day) { sky.addColorStop(0, '#5aa6ea'); sky.addColorStop(1, '#c7e8ff'); } else { sky.addColorStop(0, '#312e81'); sky.addColorStop(1, '#f59e0b'); }
  SC.fillStyle = sky; SC.fillRect(wx, wy, ww, wh);
  for (let i = 0; i < 12; i++) { const h = 25 + ((i * 37) % 50); sR(wx + i * 20, wy + wh - h, 17, h, day ? 'rgba(100,116,139,.75)' : 'rgba(30,27,75,.85)'); if (!day) for (let j = 0; j < h / 9; j++) if ((i * 7 + j * 3) % 4 === 0) sR(wx + i * 20 + 4, wy + wh - h + 4 + j * 9, 3, 3, '#fde68a'); }
  sR(wx - 6, wy - 6, ww + 12, 6, '#f8fafc'); sR(wx - 6, wy + wh, ww + 12, 8, '#f8fafc'); sR(cx - 2, wy, 4, wh, '#f8fafc'); sR(wx, wy + wh / 2 - 2, ww, 4, '#f8fafc');
  [[wx - 40, 1], [wx + ww + 4, -1]].forEach(([x, d]) => { sPoly([x, 12, x + 36, 12, x + 36 + d * 4, 170, x - d * 4, 172], '#9f1239'); sR(x, 12, 36, 6, '#fbbf24'); });
  sR(wx - 48, 8, ww + 96, 6, '#a16207');
  // flags behind the desk
  sFlag(myFlagCode(), cx - 190, 30, 60, t);
  const pc = partyById(S.player.party).color; sLine(cx + 190, 26, cx + 190, 170, '#cbd5e1', 3); sCirc(cx + 190, 26, 4, '#fbbf24');
  for (let i = 0; i < 10; i++) { const dy = Math.sin(t * 3 + i * .6) * 2 * (i / 10); sR(cx + 190 + i * 6, 30 + dy, 6.4, 40, pc); } sText('★', cx + 220, 56, 16, '#fff');
  // bookshelf & TV
  const bx = cx - 380; sR(bx, 30, 120, 150, '#5b3a1e'); for (let r = 0; r < 4; r++) { sR(bx + 4, 36 + r * 36, 112, 3, '#3f2a14'); for (let b = 0; b < 12; b++) sR(bx + 8 + b * 9, 40 + r * 36 + (b % 3), 7, 28 - (b % 3), ['#7f1d1d', '#1e3a8a', '#14532d', '#a16207', '#4c1d95'][(b + r) % 5]); }
  const tx = cx + 262; sR(tx, 40, 140, 82, '#0f172a'); sR(tx + 4, 44, 132, 74, '#1e3a8a');
  sR(tx + 4, 44, 132, 14, '#b91c1c'); sText('● LIVE NEWS', tx + 10, 55, 8, '#fff', 800, 'left');
  const head = (S.news && S.news[0]) || 'Welcome to the office'; const hl = sWrap(head, 120, 9);
  hl.slice(0, 3).forEach((l, i) => sText(l, tx + 70, 74 + i * 12, 9, '#f8fafc', 700));
  sR(tx + 60, 122, 20, 18, '#334155');
  // clock
  sCirc(cx + 300, 160, 0, '#000');
  // aide walking in with papers
  st.aide = st.aide || { x: vw + 40, ph: 'wait', w: 3 };
  const ai = st.aide;
  if (ai.ph === 'wait') { ai.w -= dt; if (ai.w <= 0) ai.ph = 'in'; }
  else if (ai.ph === 'in') { ai.x -= 60 * dt; if (ai.x < cx + 150) { ai.ph = 'give'; ai.w = 2.2; st.say = { text: pick(['Your briefing papers, sir.', 'The ministers are waiting.', 'Documents to sign.', 'The press office has a question.']), until: t + 2 }; } }
  else if (ai.ph === 'give') { ai.w -= dt; if (ai.w <= 0) ai.ph = 'out'; }
  else if (ai.ph === 'out') { ai.x += 60 * dt; if (ai.x > vw + 40) { ai.ph = 'wait'; ai.w = 9 + Math.random() * 6; } }
  st.aideLook = st.aideLook || { skin: '#e0ac69', hair: '#1f1308', style: 'side', suit: '#334155', tie: '#1d4ed8' };
  sPerson(st.aideLook, 0, ai.x, 250, 1.3, { walk: ai.ph === 'in' || ai.ph === 'out', t, dir: ai.ph === 'out' ? 1 : -1 });
  if (ai.ph === 'in' || ai.ph === 'give') sR(ai.x - 22, 205, 14, 10, '#f8fafc');
  // the president at the desk
  const ev = OFFICE_EV && t - OFFICE_EV.t0 < 9 ? OFFICE_EV : null;
  if (ev && ev.type === 'signing') {
    const mins = S.cabinet ? S.cabinet.slice(0, 3) : [];
    mins.forEach((m2, i) => sBust(m2.look, 1, cx - 110 + i * 110 + (i === 1 ? 0 : 0), 96 + (i === 1 ? -6 : 0), 64));
  }
  const talking = st.say && st.say.until > t;
  sBust(S.player.look, talking ? (Math.floor(t * 9) % 2) : 1, cx, 110 + Math.sin(t * 1.3) * 1, 92);
  // desk
  sR(cx - 170, 196, 340, 10, '#7c4a24'); sR(cx - 160, 206, 320, 62, '#5b3a1e');
  sR(cx - 150, 214, 90, 46, '#4a2f17'); sR(cx + 60, 214, 90, 46, '#4a2f17'); sCirc(cx, 236, 18, '#fbbf24'); sCirc(cx, 236, 14, '#7c4a24'); sText('★', cx, 242, 16, '#fbbf24');
  sR(cx - 120, 186, 60, 10, '#f8fafc'); sR(cx - 116, 182, 52, 6, '#e2e8f0');
  sR(cx + 70, 184, 36, 12, '#111827'); sCirc(cx + 76, 184, 4, '#111827');
  sLine(cx + 140, 196, cx + 140, 160, '#a16207', 2); sPoly([cx + 126, 160, cx + 154, 160, cx + 148, 146, cx + 132, 146], '#065f46');
  sRR(cx - 52, 188, 104, 12, 3, '#1e293b'); sText(`${ROLE.upper} ${S.player.name.toUpperCase()}`.slice(0, 32), cx, 197, 6.5, '#fbbf24', 800);
  const pen = Math.sin(t * 6) * 6; sLine(cx - 20 + pen, 190, cx - 14 + pen, 176, '#111827', 2);
  if (ev && ev.type === 'signing') {
    sR(cx - 40, 180, 80, 14, '#fff'); SC.strokeStyle = '#1e3a8a'; SC.lineWidth = 1.2; SC.beginPath(); const prog = Math.min(1, (t - ev.t0) / 3);
    for (let i = 0; i <= 40 * prog; i++) { const x = cx - 32 + i * 1.5, y = 188 + Math.sin(i * .7) * 3; i ? SC.lineTo(x, y) : SC.moveTo(x, y); } SC.stroke();
    sRR(cx - 220, 8, 440, 26, 13, 'rgba(15,23,42,.85)'); sText(`✒️ SIGNING: ${ev.title}`.slice(0, 70), cx, 26, 12, '#fde68a', 800);
    for (let i = 0; i < 4; i++) sFlash(t, i, cx - 300 + i * 200, 150 + (i % 2) * 40);
  }
  // phone / thoughts
  if (S.pendingEvent && Math.floor(t * 2) % 2) { sText('📞', cx + 88, 178, 18, '#000'); sRR(cx + 100, 150, 76, 18, 9, '#dc2626'); sText('URGENT CALL', cx + 138, 163, 8, '#fff', 800); }
  if (!talking && (!st.next || t > st.next)) {
    const lines = [`Approval is ${fmt(approval())}% — let's keep working.`, `Inflation at ${fmt(S.infl || 0, 1)}%. Get me the finance minister.`, 'Schedule a cabinet meeting.', 'Prepare my next speech.', 'What does the press say today?'];
    if (S.projects && S.projects.length) { const p = S.projects[0]; lines.push(`How is the ${PROJECTS[p.type].name.toLowerCase()} in ${reg(p.region).short} going?`); }
    if (S.threat > milStrength()) lines.push('I want a security briefing.');
    st.say = { text: pick(lines), until: t + 3 }; st.next = t + 10 + Math.random() * 6;
  }
  if (talking) sBubble(cx, 106, st.say.text, 240, 11);
  if (ai.ph === 'give' && st.say && st.say.until > t && st.say.aide !== false) {}
};

DRAW.speech = (a) => {
  const { vw, t, p } = a, H = 400, cx = vw / 2;
  const nation = p.kind === 'nation';
  const bg = SC.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#0c1a3d'); bg.addColorStop(1, '#1e3a8a'); SC.fillStyle = bg; SC.fillRect(0, 0, vw, H);
  for (let i = 0; i < vw / 40; i++) sR(i * 40, 0, 1, 300, 'rgba(255,255,255,.04)');
  [-1, 1].forEach(s => { sFlag(myFlagCode(), cx + s * 230 - (s < 0 ? 66 : 0), 40, 66, t); sFlag(myFlagCode(), cx + s * 310 - (s < 0 ? 66 : 0), 52, 66, t + 1); });
  sRR(cx - 200, 14, 400, 30, 15, 'rgba(15,23,42,.75)');
  sText(nation ? `ADDRESS TO THE NATION · ${S.country.toUpperCase()}` : `${ROLE.upper} MEETS ${GROUPS[p.kind].name.toUpperCase()} · ${reg(UI.region).city[2].toUpperCase()}`, cx, 34, 12, '#fde68a', 800);
  if (nation) { sRR(cx - 300, 60, 54, 18, 4, '#dc2626'); sText('● LIVE', cx - 273, 73, 9, '#fff', 800); }
  // teleprompters
  [cx - 120, cx + 120].forEach(x => { sLine(x, 300, x, 200, '#475569', 3); sPoly([x - 22, 160, x + 22, 160, x + 26, 200, x - 26, 200], 'rgba(186,230,253,.25)'); });
  const talk = p.st && p.st.talking;
  sBust(S.player.look, talk ? Math.floor(t * 9) % 2 : 1, cx, 112 + Math.sin(t * 2) * 1.2, 120);
  // podium
  sPoly([cx - 70, 232, cx + 70, 232, cx + 58, 330, cx - 58, 330], '#7c4a24'); sR(cx - 76, 226, 152, 10, '#5b3a1e');
  sCirc(cx, 272, 22, '#fbbf24'); sCirc(cx, 272, 18, '#1e3a8a'); sText('★', cx, 279, 20, '#fbbf24');
  sLine(cx - 14, 226, cx - 22, 196, '#94a3b8', 2); sLine(cx + 14, 226, cx + 22, 196, '#94a3b8', 2); sCirc(cx - 22, 194, 3, '#111'); sCirc(cx + 22, 194, 3, '#111');
  // audience / cameras
  const cheer = p.st && p.st.react && t - p.st.react.t < 2.2 && p.st.react.v > 0;
  const kinds = nation ? ['workers', 'business', 'farmers', 'youth', 'elderly'] : [p.kind];
  for (let r = 0; r < 3; r++) for (let i = 0; i * 44 < vw + 44; i++) { const x = i * 44 + (r % 2) * 22 - 10, ph = i * .37 + r; sCrowdHead(x, 340 + r * 22, kinds[(i + r) % kinds.length], t, ph, cheer && (i + r) % 3 !== 0); }
  [cx - 380, cx + 380].forEach((x, i) => { sR(x - 18, 230, 36, 22, '#111827'); sCirc(x + (i ? -22 : 22), 241, 8, '#334155'); sLine(x, 252, x - 10, 300, '#475569', 2); sLine(x, 252, x + 10, 300, '#475569', 2); sFlash(t, i, x, 240); });
  if (p.st && p.st.react && t - p.st.react.t < 1.8) { const k = (t - p.st.react.t) / 1.8; for (let i = 0; i < 8; i++) sText(p.st.react.v > 0 ? '👏' : '🤔', cx - 300 + i * 85, 330 - k * 60, 16, '#000'); }
};

DRAW.un = (a) => {
  const { vw, t, p } = a, H = 400, cx = vw / 2;
  const g = SC.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#b8913a'); g.addColorStop(.6, '#d8b45a'); g.addColorStop(1, '#5b4a2b'); SC.fillStyle = g; SC.fillRect(0, 0, vw, H);
  for (let x = cx % 26; x < vw; x += 26) sR(x, 0, 2, 230, 'rgba(90,60,20,.25)');
  sCirc(cx, 70, 52, '#4a7fc9'); SC.strokeStyle = '#fff'; SC.lineWidth = 1.5; [16, 32, 48].forEach(r => { SC.beginPath(); SC.arc(cx, 70, r, 0, Math.PI * 2); SC.stroke(); });
  [-1, 1].forEach(s => { SC.beginPath(); SC.moveTo(cx + s * 30, 120); SC.quadraticCurveTo(cx + s * 72, 90, cx + s * 52, 30); SC.stroke(); });
  sLine(cx - 52, 70, cx + 52, 70, '#fff', 1.2); sLine(cx, 18, cx, 122, '#fff', 1.2);
  sText('UNITED NATIONS · GENERAL ASSEMBLY', cx, 136, 12, '#1c1917', 800);
  sText(`${yearNow() - 1945}th SESSION · GENERAL DEBATE`, cx, 149, 8, '#3f2f15', 700);
  // dais
  sR(cx - 170, 172, 340, 30, '#3f6b55'); sR(cx - 170, 172, 340, 4, '#86efac');
  (S.unLooks = S.unLooks || [randomLook(), randomLook(), randomLook()]).forEach((l, i) => sBust(l, 0, cx - 80 + i * 80, 154, 36));
  // side screens
  [cx - 330, cx + 250].forEach(x => { sR(x, 40, 80, 56, '#0f172a'); const im = Flags.img(myFlagCode()); if (im.complete) SC.drawImage(im, x + 8, 48, 30, 20); sText(S.country.slice(0, 14), x + 40, 82, 8, '#fff', 700); sText(S.player.name.split(' ').slice(-1)[0], x + 56, 62, 8, '#fde68a', 800, 'center'); });
  // speaker at the green rostrum
  const talk = p.st && p.st.talking;
  sBust(S.player.look, talk ? Math.floor(t * 9) % 2 : 1, cx, 190, 86);
  sPoly([cx - 64, 268, cx + 64, 268, cx + 56, 330, cx - 56, 330], '#2f6b4f'); sR(cx - 70, 262, 140, 10, '#1f4d38');
  sLine(cx - 10, 262, cx - 16, 238, '#94a3b8', 2); sCirc(cx - 16, 236, 3, '#111');
  // delegations
  const codes = S.unFlags || (S.unFlags = shuffle(['us', 'cn', 'ru', 'gb', 'fr', 'de', 'jp', 'in', 'br', 'za', 'ng', 'eg', 'tr', 'kz', 'uz', 'id', 'mx', 'ar', 'ca', 'au', 'kr', 'sa', 'ae', 'pk', 'ke', 'et', 'it', 'es', 'pl', 'nl', 'ir', 'vn', 'ma', 'az', 'kg', 'tj', 'tm', 'by', 'am', 'pt', 'ie', 'nz', 'bo', 'py', 'uy', 'jm']).filter(c => c !== myFlagCode()));
  const cheer = p.st && p.st.react && t - p.st.react.t < 2.2 && p.st.react.v > 0;
  let k = 0;
  for (let r = 0; r < 2; r++) for (let i = 0; i * 74 < vw + 74; i++) {
    const x = i * 74 + (r ? 37 : 0) - 20, y = 330 + r * 36; if (Math.abs(x - cx) < 90 && r === 0) continue;
    sCrowdHead(x, y - 14, 'delegate', t, i * .7 + r, cheer && (i + r) % 2 === 0);
    sR(x - 30, y + 8, 60, 14, '#3f2f15'); const im = Flags.img(codes[k++ % codes.length]); if (im.complete) SC.drawImage(im, x - 9, y + 9, 18, 12);
  }
};

DRAW.summit = (a) => {
  const { vw, t, p } = a, H = 400, cx = vw / 2;
  const bg = SC.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#0f2b46'); bg.addColorStop(1, '#0b1726'); SC.fillStyle = bg; SC.fillRect(0, 0, vw, H);
  sRR(cx - 300, 18, 600, 70, 10, '#f8fafc'); sText(p.org.name.toUpperCase(), cx, 52, 20, '#0f2b46', 800); sText(`${p.org.city} · ${yearNow()}`, cx, 74, 11, '#475569', 700);
  const fl = p.org.flags, n = fl.length, sp = Math.min(70, (vw - 80) / n);
  fl.forEach((c, i) => sFlag(c, cx - (n - 1) * sp / 2 + i * sp - 18, 104, 36, t + i));
  sR(0, 300, vw, 100, '#334155'); sR(0, 300, vw, 4, '#64748b');
  sR(cx - 330, 292, 660, 10, '#991b1b');
  const L = S.summitLooks || (S.summitLooks = Array.from({ length: 7 }, randomLook));
  const m = Math.min(7, n), pos = Array.from({ length: m + 1 }, (_, i) => cx - m * 40 + i * 80);
  pos.forEach((x, i) => { const me = i === Math.floor(m / 2); sPerson(me ? S.player.look : L[i % L.length], me ? 1 : (i % 3 ? 1 : 0), x, 296, 1.9, { t }); if (me) { sRR(x - 22, 166, 44, 14, 7, '#fbbf24'); sText('★ YOU', x, 176, 8, '#1a1205', 800); } });
  for (let i = 0; i < 8; i++) sFlash(t, i, 40 + i * (vw - 80) / 7, 350 + (i % 2) * 20);
  for (let i = 0; i < vw / 50; i++) { sCirc(i * 50 + 20, 372, 12, '#0f172a'); sR(i * 50 + 12, 360, 16, 10, '#1f2937'); }
  if (p.st && p.st.caption) { sRR(cx - 260, 316, 520, 26, 13, 'rgba(15,23,42,.85)'); sText(p.st.caption, cx, 334, 12, '#fde68a', 800); }
};

DRAW.bilateral = (a) => {
  const { vw, t, p } = a, H = 400, cx = vw / 2;
  const phase = t < 6 && !(p.st && p.st.talks) ? 'arrive' : 'talks';
  if (phase === 'arrive') {
    const sky = SC.createLinearGradient(0, 0, 0, 260); sky.addColorStop(0, '#60a5fa'); sky.addColorStop(1, '#dbeafe'); SC.fillStyle = sky; SC.fillRect(0, 0, vw, 260);
    sR(0, 260, vw, 140, '#6b7280'); for (let x = 0; x < vw; x += 60) sR(x, 330, 30, 4, '#f8fafc');
    sRR(cx - 380, 160, 300, 54, 27, '#f8fafc'); sR(cx - 380, 186, 300, 6, '#1e3a8a'); sPoly([cx - 380, 186, cx - 410, 120, cx - 360, 120, cx - 340, 186], '#f8fafc');
    for (let i = 0; i < 10; i++) sCirc(cx - 330 + i * 22, 178, 4, '#93c5fd');
    const im = Flags.img(myFlagCode()); if (im.complete) SC.drawImage(im, cx - 200, 168, 24, 16);
    sPoly([cx - 140, 214, cx - 120, 214, cx - 70, 290, cx - 90, 290], '#e5e7eb');
    sPoly([cx - 90, 290, cx + 300, 290, cx + 320, 320, cx - 70, 320], '#b91c1c');
    for (let i = 0; i < 6; i++) sPerson({ skin: '#e0ac69', hair: '#1f1308', style: 'short', suit: '#14532d', tie: '#fbbf24' }, 0, cx - 40 + i * 50, 286, 1.1, { t });
    sFlag(myFlagCode(), cx + 210, 140, 54, t); sFlag(p.code, cx + 280, 140, 54, t + 1);
    const k = Math.min(1, t / 5), px = cx - 80 + k * 260;
    sPerson(S.player.look, 1, px, 318, 1.5, { walk: k < 1, t });
    (p.st.hostLook = p.st.hostLook || randomLook());
    sPerson(p.st.hostLook, 1, cx + 330, 318, 1.5, { t, dir: -1 });
    sRR(cx - 220, 18, 440, 30, 15, 'rgba(15,23,42,.8)'); sText(`STATE VISIT · ARRIVAL IN ${p.name.toUpperCase()}`, cx, 38, 13, '#fde68a', 800);
    return;
  }
  const wg = SC.createLinearGradient(0, 0, 0, 260); wg.addColorStop(0, '#f1e6cf'); wg.addColorStop(1, '#d9c39a'); SC.fillStyle = wg; SC.fillRect(0, 0, vw, 260);
  sR(0, 260, vw, 140, '#7c2d12');
  sFlag(myFlagCode(), cx - 120, 34, 70, t); sFlag(p.code, cx + 50, 34, 70, t + 1);
  sFlag(myFlagCode(), cx - 330, 40, 54, t + 2); sFlag(p.code, cx + 280, 40, 54, t + 3);
  const sign = p.st && p.st.sign;
  p.st.hostLooks = p.st.hostLooks || [randomLook(), randomLook()];
  if (!sign) {
    const ours = [S.player.look, ...(S.cabinet || []).slice(0, 2).map(c => c.look)];
    ours.forEach((l, i) => sBust(l, 1, cx - 270 + i * 80, 150, 70));
    [p.st.hostLook || randomLook(), ...p.st.hostLooks].forEach((l, i) => sBust(l, 1, cx + 110 + i * 80, 150, 70));
  } else {
    const k = Math.min(1, (t - sign) / 1.5);
    sPerson(S.player.look, 1, cx - 60 + k * 20, 262, 2, { t }); sPerson(p.st.hostLook, 1, cx + 60 - k * 20, 262, 2, { t, dir: -1 });
    if (k >= 1) { sLine(cx - 30, 205, cx + 30, 205, p.st.hostLook.suit, 6); sCirc(cx, 205, 6, '#e0ac69'); }
    for (let i = 0; i < 6; i++) sFlash(t, i, 60 + i * (vw - 120) / 5, 300);
    sRR(cx - 230, 18, 460, 28, 14, 'rgba(15,23,42,.85)'); sText(p.st.caption || 'AGREEMENT SIGNED', cx, 37, 12, '#fde68a', 800);
  }
  sR(cx - 360, 236, 720, 16, '#5b3a1e'); sR(cx - 350, 252, 700, 40, '#4a2f17');
  [[cx - 200, myFlagCode()], [cx + 200, p.code]].forEach(([x, c]) => { sLine(x, 236, x, 212, '#cbd5e1', 1.5); const im = Flags.img(c); if (im.complete) SC.drawImage(im, x, 212, 18, 12); });
  for (let i = 0; i < vw / 48; i++) sCrowdHead(i * 48 + 10, 360, 'delegate', t, i, false);
  if (!sign) { sRR(cx - 230, 300, 460, 26, 13, 'rgba(15,23,42,.8)'); sText(`TALKS WITH THE ${p.name.toUpperCase()} DELEGATION`, cx, 318, 12, '#fde68a', 800); }
};

DRAW.cabinet = (a) => {
  const { vw, t, p } = a, H = 260, cx = vw / 2;
  const wg = SC.createLinearGradient(0, 0, 0, 170); wg.addColorStop(0, '#e7dcc4'); wg.addColorStop(1, '#cbb68f'); SC.fillStyle = wg; SC.fillRect(0, 0, vw, 170);
  for (let x = cx % 70; x < vw; x += 70) sR(x, 0, 3, 170, 'rgba(91,58,30,.18)');
  sR(0, 166, vw, 94, '#1e3a8a');
  sFlag(myFlagCode(), cx - 70, 10, 56, t); sLine(cx + 60, 6, cx + 60, 120, '#cbd5e1', 2); sCirc(cx + 60, 6, 3, '#fbbf24');
  for (let i = 0; i < 9; i++) sR(cx + 60 + i * 6, 10 + Math.sin(t * 3 + i * .6) * 1.5 * (i / 9), 6.4, 36, partyById(S.player.party).color);
  sR(cx + 250, 16, 150, 84, '#0f172a'); sText('BUDGET & ECONOMY', cx + 325, 30, 8, '#94a3b8', 700);
  const bc = budgetCalc(), vals = [S.stats.economy, S.stats.health, S.stats.education, S.stats.housing, approval()];
  vals.forEach((v, i) => { const h = v * .5; sR(cx + 262 + i * 27, 92 - h, 18, h, approvalColor(v)); });
  sText(`deficit ${fmt(Math.max(0, -bc.bal * 2 / S.gdp * 100), 1)}% · debt ${fmt(debtPct())}%`, cx + 325, 112, 8, '#e2e8f0', 700);
  sR(cx - 400, 20, 110, 80, '#5b3a1e'); sR(cx - 396, 24, 102, 72, '#7aa6c2'); sPoly([cx - 396, 96, cx - 360, 60, cx - 330, 80, cx - 294, 52, cx - 294, 96], '#3f6b3f');
  const mins = p.ministers || [], n = mins.length, sp = Math.min(70, (vw - 160) / (n + 1));
  const seats = [...mins.slice(0, Math.ceil(n / 2)), null, ...mins.slice(Math.ceil(n / 2))];
  seats.forEach((m2, i) => {
    const x = cx - (seats.length - 1) * sp / 2 + i * sp, speaking = m2 && p.speaker && p.speaker() === m2.id;
    if (!m2) { sRR(x - 26, 92, 52, 80, 8, '#7f1d1d'); sBust(S.player.look, 1, x, 104, 60); return; }
    sRR(x - 22, 112, 44, 60, 6, '#3f2a14');
    if (speaking) { SC.fillStyle = 'rgba(253,230,138,.25)'; SC.beginPath(); SC.ellipse(x, 140, 34, 46, 0, 0, Math.PI * 2); SC.fill(); }
    sBust(m2.look, speaking ? Math.floor(t * 9) % 2 : 0, x, 118 + Math.sin(t + i) * .6, 50);
  });
  sR(cx - vw * .45, 172, vw * .9, 12, '#7c4a24'); sR(cx - vw * .44, 184, vw * .88, 40, '#5b3a1e');
  seats.forEach((m2, i) => { const x = cx - (seats.length - 1) * sp / 2 + i * sp; sR(x - 18, 164, 36, 9, '#f8fafc'); sText(m2 ? MINISTRIES.find(z => z.id === m2.id).icon : '★', x, 172, 8, '#111', 700); sR(x + 8, 168, 10, 5, '#e2e8f0'); });
  const sp2 = p.speaker && p.speaker(), who = mins.find(m2 => m2.id === sp2);
  if (who && p.line) { const i = seats.indexOf(who), x = cx - (seats.length - 1) * sp / 2 + i * sp; sBubble(Math.max(140, Math.min(vw - 140, x)), 114, p.line(), 250, 11); }
};

const Scenes = { top: makeRunner(), modal: makeRunner() };
function officeEvent(type, data = {}) { OFFICE_EV = { type, ...data, t0: Scenes.top.api.t }; }

// ============================================================
// SPEECHES
// ============================================================
const GREETING = { uz: 'Hurmatli vatandoshlar!', kz: 'Qurmetti otandastar!', tr: 'Değerli vatandaşlarım!', fr: 'Mes chers compatriotes,', de: 'Liebe Mitbürgerinnen und Mitbürger,', jp: 'Kokumin no minasama,', in: 'Mere pyare deshvasiyon,', br: 'Queridos brasileiros e brasileiras,', us: 'My fellow Americans,', uk: 'Good evening.' };
const CLOSING = { mv: 'Thank you. May Allah bless the Maldives.', uz: 'Thank you. Long live Uzbekistan!', kz: 'Thank you. Long live Kazakhstan!', tr: 'Thank you. Long live Türkiye!', us: 'Thank you. God bless you, and God bless the United States of America.', uk: 'Thank you.', fr: 'Vive la République, et vive la France !', de: 'Vielen Dank.', jp: 'Thank you very much.', in: 'Jai Hind!', br: 'Muito obrigado!' };
const Speech = (() => {
  const annual = g => ((1 + (g || 0) / 100) ** 2 - 1) * 100;
  function compose(kind) {
    const c = S.country, me = S.player.name, region = reg(UI.region), city = region.city[2];
    const g = annual(S.lastGrowth), built = S.built || 0, homes = S.housing ? S.housing.sold : 0;
    const out = [];
    const greet = GREETING[COUNTRY.id];
    const opening = {
      nation: `My fellow citizens of ${c},`, workers: `Dear workers of ${city}, dear friends,`, business: `Distinguished entrepreneurs, business leaders, ladies and gentlemen,`,
      farmers: `Dear farmers, dear people of the land,`, youth: `Dear young friends, dear students,`, elderly: `Dear veterans, respected elders,`,
    }[kind];
    if (greet && kind === 'nation') out.push(greet);
    out.push(opening);
    out.push(kind === 'nation' ? `Tonight I want to speak to you directly about where our country stands and where we are going.` : `Thank you for welcoming me in ${city}. I came to listen, and to tell you what this government is doing for you.`);
    if (S.lastGrowth === undefined) out.push(`We have only just begun. The task ahead is great, but so is the strength of our people.`);
    else out.push(g >= 0 ? `Over the past year our economy has grown by ${fmt(g, 1)}%${built ? `, and we have completed ${built} major public project${built > 1 ? 's' : ''} — hospitals, schools, roads and homes built by our own people` : ''}.` : `I will not hide the truth: our economy has been through a difficult period, shrinking by ${fmt(-g, 1)}%. But difficult times are when a nation shows its strength.`);
    if (S.infl > (S.inflTarget || 3) + 2) out.push(`I know that rising prices — inflation of ${fmt(S.infl, 1)}% — hurt every family budget. Bringing prices under control, together with an independent central bank, is my first priority.`);
    const plans = {
      workers: S.laws.includes('minwage') ? 'We raised the minimum wage, because a full day of honest work must pay enough to live with dignity.' : 'My government will raise the minimum wage, because a full day of honest work must pay enough to live with dignity.',
      business: `We will keep taxes predictable, cut red tape and protect property rights, so that every entrepreneur in ${c} can plan, invest and hire.`,
      farmers: S.laws.includes('farmsub') ? 'Our new support programme puts money directly in farmers\' hands and invests in water-saving irrigation.' : 'We will support our farmers with modern irrigation, fair prices and better roads to the markets.',
      youth: S.laws.includes('freeuni') ? 'University is now free for our students — because talent must never be limited by a family\'s income.' : 'Education is the best investment a country can make. We will open the doors of universities and modern technology to every young person.',
      elderly: S.laws.includes('pensions') ? 'We have raised pensions, and they will keep pace with prices.' : 'You built this country. My government will protect your pensions and bring good health care closer to your homes.',
      nation: `We will build ${homes ? 'even more ' : ''}affordable homes, modern hospitals and schools in every region, and we will keep our public finances responsible so that our children do not pay for our mistakes.`,
    };
    out.push(plans[kind]);
    if (kind === 'nation' && S.threat > milStrength()) out.push('Our security is not negotiable. We will strengthen our defence, and we will always prefer dialogue to conflict.');
    out.push(kind === 'nation' ? `No government can do this alone. It will take all of us — workers and business owners, farmers and students, young and old.` : `I will not promise you miracles. I promise you honest work, every day, for as long as you trust me with this office.`);
    out.push(CLOSING[COUNTRY.id] || 'Thank you.');
    return out;
  }
  function composeUN(topic) {
    const c = S.country, out = ['Mr. President of the General Assembly, Mr. Secretary-General, Excellencies, ladies and gentlemen,'];
    out.push(`It is an honour to address this Assembly on behalf of the people of ${c}.`);
    const T = {
      climate: [
        COUNTRY.id === 'mv' ? 'For a nation whose islands rise barely a metre above the sea, climate change is not a debate — it is a question of survival. We once held a cabinet meeting underwater to warn the world; today the warning is louder than ever.' : COUNTRY.id === 'uz' || COUNTRY.id === 'kz' ? 'Our region has witnessed one of the worst environmental disasters of our time — the drying of the Aral Sea. We know from bitter experience that nature does not forgive mismanagement.' : COUNTRY.id === 'jp' ? 'As an island nation, we face stronger typhoons and rising seas every year.' : COUNTRY.id === 'br' ? 'The Amazon rainforest is not only our heritage; it is the lungs of the planet, and protecting it is our responsibility.' : COUNTRY.id === 'in' ? 'Heatwaves and erratic monsoons already threaten the harvests that feed hundreds of millions.' : 'Floods, droughts and heatwaves are no longer distant warnings. They are here.',
        `${c} commits to expanding renewable energy and to working with every nation to keep the goals of the Paris Agreement within reach.`,
        'We call on developed countries to honour their pledges of climate finance for the most vulnerable.'],
      peace: [
        COUNTRY.id === 'jp' ? 'As the only nation to have suffered atomic bombings, we have a special duty to work for a world without nuclear weapons.' : COUNTRY.id === 'kz' ? 'Our people suffered from decades of nuclear testing at Semipalatinsk. We closed that site and gave up the nuclear weapons we inherited — proof that disarmament is possible.' : COUNTRY.id === 'uz' ? 'Central Asia is a nuclear-weapon-free zone under the Treaty of Semipalatinsk. We are proud of that, and we urge others to follow.' : 'Wars are destroying lives, homes and the hopes of a whole generation.',
        'Disputes must be settled by dialogue and international law, as the Charter of the United Nations requires.',
        `${c} stands ready to host talks and to contribute to peacebuilding.`],
      development: [
        COUNTRY.id === 'mv' ? 'Small island developing states carry heavy debts and face huge costs to protect their coasts. We need fairer access to concessional finance.' : COUNTRY.landlocked ? 'For landlocked countries like ours, transport corridors and open borders are a matter of survival for our economy.' : 'Trade, investment and fair rules have lifted hundreds of millions out of poverty — but too many are still left behind.',
        'We ask for fairer access to finance and technology so that every nation can achieve the Sustainable Development Goals by 2030.',
        `${c} is reforming its economy, opening to investors and investing in its people.`],
      health: [
        'The pandemic taught us that no one is safe until everyone is safe.',
        'We support a stronger World Health Organization, fair access to vaccines and investment in primary health care.',
        `${c} is working toward universal health coverage for every citizen.`],
    }[topic];
    out.push(...T, 'Let us leave this Assembly not with words, but with commitments. Thank you.');
    return out;
  }
  // plays a speech scene; resolves when the player clicks Finish
  function play(scene, lines, title, mood) {
    return new Promise(res => {
      const st = { talking: true, react: null };
      const m = modal(`<div class="scene-title">${title}</div><canvas id="scene-cv" class="scene-cv"></canvas>
        <div class="speech-text" id="sp-text">${lines.map((l, i) => `<p data-i="${i}">${esc(l)}</p>`).join('')}</div>
        <div class="doc-actions"><button class="btn" id="sp-skip">Skip ▶▶</button><button class="btn primary" id="sp-done" disabled>Finish</button></div>`, 'scene-card');
      Scenes.modal.attach($('#scene-cv', m), scene, { kind: scene === 'speech' ? title.kind : null, st, ...(scene === 'speech' ? { kind: mood.kind } : {}) }, 400);
      const ps = [...m.querySelectorAll('#sp-text p')];
      let i = 0, timer = null;
      const show = k => { ps.forEach((p, j) => { p.classList.toggle('on', j === k); p.classList.toggle('done', j < k); }); if (ps[k]) ps[k].scrollIntoView({ block: 'nearest', behavior: 'smooth' }); };
      const finish = () => { clearTimeout(timer); ps.forEach(p => { p.classList.remove('on'); p.classList.add('done'); }); st.talking = false; st.react = { t: Scenes.modal.api.t, v: mood.v }; $('#sp-done', m).disabled = false; $('#sp-skip', m).disabled = true; };
      const next = () => {
        if (i >= lines.length) return finish();
        show(i); st.talking = true;
        timer = setTimeout(() => { if (i % 2 === 1 || i === lines.length - 1) st.react = { t: Scenes.modal.api.t, v: mood.v }; i++; next(); }, Math.min(6500, 1300 + lines[i].length * 42));
      };
      next();
      $('#sp-skip', m).onclick = finish;
      $('#sp-done', m).onclick = () => { closeModal(); res(); };
    });
  }
  async function give(kind) {
    const cost = kind === 'nation' ? 2 : 1;
    if (UI.busy || S.pendingEvent || S.pc < cost) return;
    UI.busy = true;
    try {
      S.pc -= cost;
      const v = kind === 'nation' ? approval() - 45 : S.ga[kind] - 45;
      await play('speech', compose(kind), kind === 'nation' ? `📺 Address to the Nation` : `🎤 Speech to ${GROUPS[kind].name.toLowerCase()} in ${reg(UI.region).city[2]}`, { kind, v });
      if (kind === 'nation') { GK.forEach(g => { S.ga[g] = clamp(S.ga[g] + 1.5); S.eventMods[g] += 1.5; }); news(`${ROLE.title} ${S.player.name} addresses the nation`); }
      else { S.ga[kind] = clamp(S.ga[kind] + 3); S.eventMods[kind] += 3; news(`${ROLE.title} speaks to ${GROUPS[kind].name.toLowerCase()} in ${reg(UI.region).city[2]}`); }
      toast(kind === 'nation' ? 'Everyone +1.5 approval' : `${GROUPS[kind].name} approval +3`, 'good');
      save();
    } finally { UI.busy = false; render(); }
  }
  return { give, play, composeUN };
})();

// ============================================================
// DIPLOMACY — UN, summits, state visits
// ============================================================
const NATIONS = { lk: 'Sri Lanka', mv: 'Maldives', kz: 'Kazakhstan', uz: 'Uzbekistan', ru: 'Russia', cn: 'China', tr: 'Türkiye', kr: 'South Korea', de: 'Germany', us: 'United States', ae: 'United Arab Emirates', az: 'Azerbaijan', gb: 'United Kingdom', sa: 'Saudi Arabia', ca: 'Canada', mx: 'Mexico', jp: 'Japan', in: 'India', fr: 'France', ie: 'Ireland', pl: 'Poland', it: 'Italy', nl: 'Netherlands', es: 'Spain', ma: 'Morocco', au: 'Australia', vn: 'Vietnam', ar: 'Argentina', pt: 'Portugal', za: 'South Africa', kg: 'Kyrgyzstan', tj: 'Tajikistan' };
const PARTNERS = {
  veloria: ['us', 'cn', 'de', 'jp', 'in', 'tr'], mv: ['in', 'cn', 'lk', 'ae', 'sa', 'jp', 'gb', 'tr'], uz: ['kz', 'ru', 'cn', 'tr', 'kr', 'de', 'us', 'ae', 'tj', 'kg'], kz: ['uz', 'ru', 'cn', 'tr', 'de', 'us', 'kr', 'kg'],
  tr: ['de', 'az', 'uz', 'kz', 'us', 'gb', 'sa', 'it'], us: ['ca', 'mx', 'gb', 'jp', 'de', 'in', 'kr', 'fr'], uk: ['us', 'fr', 'de', 'ie', 'in', 'jp', 'ca', 'pl'],
  de: ['fr', 'pl', 'us', 'cn', 'it', 'nl', 'gb', 'jp'], fr: ['de', 'it', 'es', 'gb', 'us', 'in', 'ma', 'pl'], jp: ['us', 'kr', 'au', 'in', 'cn', 'gb', 'vn', 'de'],
  in: ['us', 'jp', 'ae', 'ru', 'fr', 'gb', 'sa', 'au'], br: ['ar', 'cn', 'us', 'pt', 'in', 'za', 'mx', 'de'],
};
const ORGS = {
  unga: { name: 'UN General Assembly', city: 'New York', all: true, h2: true, un: true, flags: ['un'] },
  cop: { name: 'UN Climate Change Conference (COP)', city: 'Host city', all: true, h2: true, flags: ['un', 'br', 'in', 'cn', 'us', 'eu', 'za', 'jp', 'au'], agenda: ['climate', 'energy'] },
  g20: { name: 'G20 Leaders\' Summit', city: 'Host city', members: ['us', 'uk', 'de', 'fr', 'jp', 'in', 'br', 'tr'], flags: ['ar', 'au', 'br', 'ca', 'cn', 'fr', 'de', 'in', 'id', 'it', 'jp', 'kr', 'mx', 'ru', 'sa', 'za', 'tr', 'gb', 'us', 'eu'], agenda: ['trade', 'climate', 'energy'] },
  g7: { name: 'G7 Summit', city: 'Host city', members: ['us', 'uk', 'de', 'fr', 'jp'], flags: ['ca', 'fr', 'de', 'it', 'jp', 'gb', 'us', 'eu'], agenda: ['trade', 'security', 'energy'] },
  nato: { name: 'NATO Summit', city: 'Host city', members: ['us', 'uk', 'de', 'fr', 'tr'], flags: ['us', 'gb', 'fr', 'de', 'tr', 'it', 'ca', 'pl', 'es', 'nl'], agenda: ['security'] },
  eu: { name: 'European Council', city: 'Brussels', members: ['de', 'fr'], flags: ['eu', 'de', 'fr', 'it', 'es', 'pl', 'nl', 'pt', 'ie'], agenda: ['trade', 'energy', 'security'] },
  sco: { name: 'Shanghai Cooperation Organisation Summit', city: 'Host city', members: ['uz', 'kz', 'in'], flags: ['cn', 'ru', 'in', 'pk', 'kz', 'uz', 'kg', 'tj', 'ir', 'by'], agenda: ['security', 'trade'] },
  brics: { name: 'BRICS Summit', city: 'Host city', members: ['in', 'br'], flags: ['br', 'ru', 'in', 'cn', 'za', 'eg', 'et', 'ir', 'ae', 'id'], agenda: ['trade', 'energy'] },
  cis: { name: 'CIS Council of Heads of State', city: 'Host city', members: ['uz', 'kz'], flags: ['am', 'az', 'by', 'kz', 'kg', 'ru', 'tj', 'uz'], agenda: ['trade', 'security'] },
  ots: { name: 'Organization of Turkic States Summit', city: 'Host city', members: ['uz', 'kz', 'tr'], flags: ['az', 'kz', 'kg', 'tr', 'uz'], agenda: ['trade', 'energy'] },
  c5: { name: 'Consultative Meeting of Central Asian Heads of State', city: 'Host city', members: ['uz', 'kz'], flags: ['kz', 'kg', 'tj', 'tm', 'uz'], agenda: ['trade', 'energy', 'security'] },
  mercosur: { name: 'Mercosur Summit', city: 'Host city', members: ['br'], flags: ['ar', 'br', 'py', 'uy', 'bo'], agenda: ['trade'] },
  chogm: { name: 'Commonwealth Heads of Government Meeting', city: 'Host city', members: ['uk', 'in', 'mv'], flags: ['gb', 'in', 'ca', 'au', 'nz', 'za', 'ng', 'ke', 'pk', 'jm'], agenda: ['trade', 'climate'] },
  quad: { name: 'Quad Leaders\' Summit', city: 'Host city', members: ['us', 'jp', 'in'], flags: ['au', 'in', 'jp', 'us'], agenda: ['security', 'trade'] },
  rc: { name: 'Regional Council Summit', city: 'Host city', members: ['veloria'], flags: ['veloria', 'tr', 'de', 'kz', 'uz'], agenda: ['trade', 'security'] },
};
const AGENDA = {
  trade: { label: '🤝 Trade & investment', text: 'Leaders agreed to lower trade barriers and launch joint investment projects.', fx: k => { S.gdp *= 1 + .5 * k / 100; S.eventMods.business += 3 * k; S.ga.business = clamp(S.ga.business + 2 * k); } },
  security: { label: '🛡️ Security cooperation', text: 'Leaders agreed to share intelligence and hold joint exercises.', fx: k => { S.threat = clamp(S.threat - 9 * k, 5, 100); S.eventMods.elderly += 2 * k; } },
  climate: { label: '🌍 Climate action', text: 'Leaders pledged faster emission cuts and climate finance for vulnerable countries.', fx: k => { S.lawStat.environment += 2 * k; S.eventMods.youth += 3 * k; S.ga.youth = clamp(S.ga.youth + 2 * k); } },
  energy: { label: '⚡ Energy & connectivity', text: 'Leaders agreed on new power lines, pipelines and transport corridors.', fx: k => { S.energyBonus = (S.energyBonus || 0) + 6 * k; S.gdp *= 1 + .2 * k / 100; } },
};
const DEALS = {
  trade: { label: '📦 Free trade & customs agreement', text: 'cut tariffs and simplify customs', fx: k => { S.gdp *= 1 + .4 * k / 100; S.eventMods.business += 3 * k; S.eventMods.farmers += 1.5 * k; } },
  invest: { label: '🏭 Investment agreement', text: 'launch joint factories and investment funds', fx: k => { S.gdp *= 1 + .5 * k / 100; S.eventMods.workers += 3 * k; } },
  energy: { label: '⚡ Energy cooperation', text: 'build power links and supply energy', fx: k => { S.energyBonus = (S.energyBonus || 0) + 8 * k; } },
  security: { label: '🛡️ Security & defence cooperation', text: 'cooperate on border security and defence', fx: k => { S.threat = clamp(S.threat - 6 * k, 5, 100); } },
  education: { label: '🎓 Education & culture exchange', text: 'exchange students, teachers and artists', fx: k => { S.lawStat.education += 1.5 * k; S.eventMods.youth += 3 * k; } },
};
const Diplomacy = (() => {
  const year = () => Math.ceil(S.turn / 2);
  const k = () => .7 + (S.rep || 50) / 100 * .6;
  const travelled = () => S.tripTurn === S.turn;
  function options() {
    const opts = [], cid = COUNTRY.id;
    Object.entries(ORGS).forEach(([id, o]) => {
      if (!(o.all || (o.members || []).includes(cid))) return;
      const done = (S.summits || {})[id] === year(), wrongHalf = o.h2 && S.turn % 2 === 1;
      opts.push({ id, kind: o.un ? 'un' : 'summit', t: `${Flags.svg(o.flags[0], 22)} ${o.name}`, note: done ? 'Already attended this year' : wrongHalf ? 'Meets in the second half of the year (September–November)' : o.un ? 'Speak from the rostrum to 193 member states' : `With ${o.flags.length} member flags · agenda: ${(o.agenda || []).map(a => AGENDA[a].label).join(', ')}`, disabled: done || wrongHalf });
    });
    (PARTNERS[cid] || PARTNERS.veloria).forEach(c => {
      const last = (S.visits || {})[c], cool = last && S.turn - last < 4;
      opts.push({ id: 'v:' + c, kind: 'visit', t: `${Flags.svg(c, 22)} State visit to ${NATIONS[c]}`, note: cool ? 'Visited recently' : 'Bilateral talks and agreements · ⭐1', disabled: cool || S.pc < 1 });
    });
    return opts;
  }
  async function menu() {
    if (UI.busy || S.pendingEvent) return;
    if (travelled()) return toast('You have already made a foreign trip this half-year.', 'bad');
    const opts = options();
    const k2 = await choiceModal({ icon: '✈️', title: 'Foreign affairs', text: `International reputation: <b>${fmt(S.rep || 50)}</b>/100 — higher reputation makes deals more valuable. One foreign trip per half-year.`, choices: [...opts.map(o => ({ t: o.t, note: o.note, disabled: o.disabled })), { t: 'Stay at home', note: '' }] });
    if (k2 >= opts.length) return;
    const o = opts[k2];
    UI.busy = true;
    try {
      S.tripTurn = S.turn;
      if (o.kind === 'un') await un();
      else if (o.kind === 'summit') await summit(o.id);
      else await visit(o.id.slice(2));
      save();
    } finally { UI.busy = false; render(); }
  }
  async function un() {
    const topic = await choiceModal({ icon: '🇺🇳', title: 'Your speech to the UN General Assembly', text: 'Each head of state speaks in the General Debate. What will be your main theme?', choices: [
      { t: '🌍 Climate & environment', note: 'Youth ▲ · environment ▲ · reputation ▲' }, { t: '🕊️ Peace & disarmament', note: 'Threat ▼ · reputation ▲' },
      { t: '📈 Development & fair trade', note: 'Business ▲ · economy ▲' }, { t: '🏥 Global health', note: 'Health ▲ · seniors ▲' }] });
    const id = ['climate', 'peace', 'development', 'health'][topic];
    await Speech.play('un', Speech.composeUN(id), '🇺🇳 General Debate — United Nations General Assembly, New York', { v: 10 });
    S.rep = clamp((S.rep || 50) + 6);
    if (id === 'climate') { S.lawStat.environment += 1.5; S.eventMods.youth += 3; }
    if (id === 'peace') S.threat = clamp(S.threat - 8, 5, 100);
    if (id === 'development') { S.gdp *= 1.003; S.eventMods.business += 2; }
    if (id === 'health') { S.lawStat.health += 1.5; S.eventMods.elderly += 2; }
    GK.forEach(g => S.ga[g] = clamp(S.ga[g] + 1));
    (S.summits = S.summits || {}).unga = year();
    news(`${ROLE.title} ${S.player.name} addresses the UN General Assembly`);
    toast('Reputation +6', 'good');
  }
  async function summit(id) {
    const o = ORGS[id];
    const st = { caption: '📸 Family photo of the leaders' };
    await new Promise(res => {
      const m = modal(`<div class="scene-title">${Flags.svg(o.flags[0], 22)} ${o.name}</div><canvas id="scene-cv" class="scene-cv"></canvas>
        <div id="sum-panel" class="debate-panel"><div class="dq">Which issue will you push at the summit table?</div><div class="dchoices">${(o.agenda || ['trade']).map(a => `<button class="choice" data-a="${a}"><b>${AGENDA[a].label}</b></button>`).join('')}</div></div>`, 'scene-card');
      Scenes.modal.attach($('#scene-cv', m), 'summit', { org: o, st }, 400);
      m.querySelectorAll('[data-a]').forEach(b => b.onclick = () => {
        const A = AGENDA[b.dataset.a]; A.fx(k()); S.rep = clamp((S.rep || 50) + 4);
        st.caption = `✅ ${A.label.replace(/^\S+\s/, '')}: agreement reached`;
        $('#sum-panel', m).innerHTML = `<div class="memo"><div class="memo-h">JOINT COMMUNIQUÉ</div><p>${A.text} ${ROLE.title} ${esc(S.player.name)} of ${esc(S.country)} welcomed the outcome.</p></div><div class="center"><button class="btn primary big" id="sum-ok">Fly home</button></div>`;
        $('#sum-ok', m).onclick = () => { closeModal(); res(); };
      });
    });
    (S.summits = S.summits || {})[id] = year();
    news(`${ROLE.title} attends the ${o.name}`);
  }
  async function visit(code) {
    S.pc -= 1;
    const st = { talks: false };
    const name = NATIONS[code];
    await new Promise(res => {
      const m = modal(`<div class="scene-title">${Flags.svg(code, 22)} State visit to ${name}</div><canvas id="scene-cv" class="scene-cv"></canvas>
        <div id="vis-panel" class="debate-panel"><div class="dwait">✈️ Arriving… guard of honour, national anthems…</div></div>`, 'scene-card');
      Scenes.modal.attach($('#scene-cv', m), 'bilateral', { code, name, st }, 400);
      setTimeout(() => {
        st.talks = true;
        const deals = Object.entries(DEALS);
        $('#vis-panel', m).innerHTML = `<div class="dq">Talks with the ${name} delegation. Which agreement will you sign?</div><div class="dchoices">${deals.map(([id, d]) => `<button class="choice" data-d="${id}"><b>${d.label}</b></button>`).join('')}</div>`;
        m.querySelectorAll('[data-d]').forEach(b => b.onclick = () => {
          const d = DEALS[b.dataset.d]; d.fx(k()); S.rep = clamp((S.rep || 50) + 2);
          st.sign = Scenes.modal.api.t; st.caption = `${d.label.replace(/^\S+\s/, '').toUpperCase()} SIGNED`;
          $('#vis-panel', m).innerHTML = `<div class="memo"><div class="memo-h">JOINT STATEMENT</div><p>${esc(S.country)} and ${name} agreed to ${d.text}. Ministers will meet within six months to implement the agreement.</p></div><div class="center"><button class="btn primary big" id="vis-ok">Fly home</button></div>`;
          $('#vis-ok', m).onclick = () => { closeModal(); res(); };
        });
      }, 5200);
    });
    (S.visits = S.visits || {})[code] = S.turn;
    news(`${ROLE.title} ${S.player.name} on a state visit to ${name}`);
  }
  return { menu };
})();
