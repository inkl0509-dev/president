/* ============================================================
   SOUND — every sound is synthesised live with the Web Audio
   API, so there are no audio files to download (works offline
   and in the installed app). Effects are on by default; calm
   background music is optional. Both are toggled from the 🔊
   button in the top bar or the ☰ menu, and remembered.
   ============================================================ */

const Sound = (() => {
  const KEY = 'president.sound';
  let pref = { fx: true, music: false, vol: .7 };
  try { Object.assign(pref, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { }
  let ctx = null, master = null, musicGain = null, musicTimer = 0, noiseBuf = null, last = {};
  const savePref = () => { try { localStorage.setItem(KEY, JSON.stringify(pref)); } catch (e) { } };

  function ac() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return ctx; }
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
    ctx = new C(); master = ctx.createGain(); master.gain.value = pref.vol; master.connect(ctx.destination);
    musicGain = ctx.createGain(); musicGain.gain.value = .0001; musicGain.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 1.5, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return ctx;
  }
  // one note: frequency, start offset, length, waveform, volume
  function tone(f, t0 = 0, len = .15, type = 'sine', vol = .2, slide = 0, out) {
    const c = ac(); if (!c) return;
    const t = c.currentTime + t0, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t + len);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + len);
    o.connect(g); g.connect(out || master); o.start(t); o.stop(t + len + .05);
  }
  function noise(t0 = 0, len = .2, vol = .2, freq = 1200, q = .8, type = 'bandpass') {
    const c = ac(); if (!c) return;
    const t = c.currentTime + t0, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = noiseBuf; f.type = type; f.frequency.value = freq; f.Q.value = q;
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + len);
    s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random() * .5); s.stop(t + len + .05);
  }
  const N = { C4: 261.6, D4: 293.7, E4: 329.6, F4: 349.2, G4: 392, A4: 440, B4: 493.9, C5: 523.3, D5: 587.3, E5: 659.3, G5: 784, C6: 1046.5 };

  const FX = {
    click: () => tone(1400, 0, .04, 'square', .035),
    tab: () => { tone(900, 0, .05, 'triangle', .06); tone(1300, .03, .05, 'triangle', .04); },
    open: () => { noise(0, .18, .05, 2500, .6, 'highpass'); tone(500, 0, .12, 'sine', .05, 300); },
    good: () => { tone(N.E5, 0, .12, 'triangle', .12); tone(N.G5, .08, .18, 'triangle', .12); },
    bad: () => { tone(330, 0, .16, 'sawtooth', .06, -80); tone(247, .12, .26, 'sawtooth', .06, -60); },
    coin: () => { tone(1318, 0, .07, 'square', .05); tone(1760, .06, .2, 'square', .05); },
    alert: () => { tone(880, 0, .12, 'square', .06); tone(880, .18, .12, 'square', .06); },
    page: () => { noise(0, .25, .08, 3000, .5, 'highpass'); },
    gavel: () => { [0, .22, .44].forEach(t => { tone(180, t, .09, 'triangle', .3, -90); noise(t, .06, .25, 900, 1.5); }); },
    camera: () => { [0, .12, .3, .38].forEach(t => { noise(t, .04, .2, 4000, 1); tone(2400, t, .02, 'square', .03); }); },
    applause: (len = 2.2) => { for (let i = 0; i < 70; i++) noise(Math.random() * len, .05, .07 + Math.random() * .06, 1500 + Math.random() * 2500, 2); },
    crowd: () => { noise(0, 1.4, .06, 500, .7); FX.applause(1.2); },
    fanfare: () => { [[N.C5, 0], [N.E5, .14], [N.G5, .28], [N.C6, .46]].forEach(([f, t], i) => { tone(f, t, i === 3 ? .7 : .16, 'sawtooth', .07); tone(f / 2, t, i === 3 ? .7 : .16, 'triangle', .08); }); },
    drum: () => { tone(110, 0, .18, 'sine', .35, -60); noise(0, .06, .08, 200, 1, 'lowpass'); },
    tick: () => tone(1800, 0, .03, 'sine', .05),
    turn: () => { [N.G4, N.C5, N.E5].forEach((f, i) => tone(f, i * .1, .35, 'sine', .09)); },
    lose: () => { [N.G4, N.E4, N.C4].forEach((f, i) => tone(f, i * .25, .5, 'triangle', .1)); },
  };
  function play(name, ...a) {
    if (!pref.fx || !FX[name]) return;
    const now = performance.now(); if (last[name] && now - last[name] < 60) return; last[name] = now;   // no machine-gun repeats
    try { ac(); FX[name](...a); } catch (e) { }
  }

  // ---------- calm background music: slow chords that change mood with approval ----------
  const PROG = [[N.C4, N.E4, N.G4], [N.A4 / 2, N.C4, N.E4], [N.F4 / 2 * 1, N.A4 / 2 * 2, N.C4], [N.G4 / 2, N.B4 / 2, N.D4]];
  let step = 0;
  function musicBeat() {
    if (!pref.music || !ctx) return;
    const tense = typeof S !== 'undefined' && S && S.phase === 'govern' && typeof approval === 'function' && approval() < 40;
    const ch = PROG[step % PROG.length].map(f => tense ? f * .944 : f);   // a little darker when things go badly
    ch.forEach((f, i) => tone(f, i * .02, 3.6, 'triangle', .05, 0, musicGain));
    tone(ch[0] / 2, 0, 3.6, 'sine', .07, 0, musicGain);
    if (step % 2) [0, .9, 1.8, 2.7].forEach((t, i) => tone(ch[(i + step) % 3] * 2, t, .6, 'sine', .025, 0, musicGain));
    step++;
  }
  function music(on) {
    if (on && !ac()) return;
    if (!ctx) return;
    const t = ctx.currentTime;
    musicGain.gain.cancelScheduledValues(t); musicGain.gain.setTargetAtTime(on ? .55 : .0001, t, .6);
    clearInterval(musicTimer); musicTimer = 0;
    if (on) { musicBeat(); musicTimer = setInterval(musicBeat, 3500); }
  }
  // ---------- military band: a short drum roll, then each anthem in turn ----------
  const freq = n => { const m = /^([A-G])(#|b)?(\d)$/.exec(n); if (!m) return 0; const i = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0); return 440 * Math.pow(2, (i - 9) / 12 + (+m[3] - 4)); };
  function anthem(list) {
    if (!pref.fx || !list.length) return () => { };
    const c = ac(); if (!c) return () => { };
    const band = c.createGain(), lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2200;
    band.gain.value = .9; lp.connect(band); band.connect(master);
    if (musicGain) musicGain.gain.setTargetAtTime(.0001, c.currentTime, .3);
    let t = .1;
    for (let i = 0; i < 16; i++) noise(t + i * .07, .06, .05 + i * .006, 1800, 1.2);   // snare roll
    t += 1.4;
    list.forEach(A => {
      const beat = 60 / A.bpm;
      A.notes.forEach(([n, b]) => {
        const f = freq(n), len = b * beat;
        if (f) { tone(f, t, len * .95, 'sawtooth', .09, 0, lp); tone(f / 2, t, len * .95, 'triangle', .1, 0, lp); tone(f * 2, t, len * .6, 'sine', .015, 0, lp); }
        t += len;
      });
      t += 1.6;
    });
    const end = setTimeout(() => { if (pref.music && musicGain) musicGain.gain.setTargetAtTime(.55, ctx.currentTime, .6); }, t * 1000);
    return () => { clearTimeout(end); try { band.gain.setTargetAtTime(.0001, c.currentTime, .15); setTimeout(() => band.disconnect(), 600); } catch (e) { } if (pref.music && musicGain) musicGain.gain.setTargetAtTime(.55, c.currentTime + .5, .6); };
  }
  function set(k, v) { pref[k] = v; savePref(); if (k === 'music') music(v); if (k === 'vol' && master) master.gain.value = v; btn(); if (v && k === 'fx') play('good'); }
  function btn() { const b = document.getElementById('snd-btn'); if (b) { b.textContent = pref.fx || pref.music ? '🔊' : '🔇'; b.title = pref.fx || pref.music ? 'Sound on' : 'Sound off'; } }
  function panel() {
    const m = modal(`<div class="m-icon">🔊</div><h2>Sound</h2>
      <div class="snd-rows">
        <label class="snd-row"><span><b>Sound effects</b><small>clicks, cheers, gavel, cameras, alerts</small></span><input type="checkbox" id="snd-fx" ${pref.fx ? 'checked' : ''}></label>
        <label class="snd-row"><span><b>Background music</b><small>calm chords; darker when approval is low</small></span><input type="checkbox" id="snd-mu" ${pref.music ? 'checked' : ''}></label>
        <label class="snd-row"><span><b>Volume</b></span><input type="range" id="snd-vol" min="0" max="1" step=".05" value="${pref.vol}"></label>
      </div><button class="btn primary big" id="m-ok">Done</button>`);
    $('#snd-fx', m).onchange = e => set('fx', e.target.checked);
    $('#snd-mu', m).onchange = e => set('music', e.target.checked);
    $('#snd-vol', m).oninput = e => { set('vol', +e.target.value); play('tick'); };
    $('#m-ok', m).onclick = closeModal;
  }

  // ---------- hook into the game without touching every file ----------
  function install() {
    const top = document.getElementById('topbar'), menu = top && top.querySelector('.menu-btn');
    if (menu && !document.getElementById('snd-btn')) { const b = document.createElement('button'); b.id = 'snd-btn'; b.className = 'menu-btn'; b.setAttribute('aria-label', 'Sound'); b.onclick = panel; top.insertBefore(b, menu); btn(); }
    // first tap unlocks audio (browsers require a user gesture), then starts music if chosen
    const unlock = () => { ac(); if (pref.music) music(true); document.removeEventListener('pointerdown', unlock); };
    document.addEventListener('pointerdown', unlock);
    document.addEventListener('click', e => {
      const el = e.target.closest('button, .choice, [data-act]'); if (!el || el.disabled) return;
      const a = el.dataset.act;
      if (a === 'tab') play('tab');
      else if (a === 'endTurn' || a === 'endWeek') play('turn');
      else if (a === 'presser') play('camera');
      else if (a === 'qtime') play('gavel');
      else if (a === 'camp') play('crowd');
      else play('click');
    }, true);
    const _toast = window.toast;
    window.toast = toast = function (msg, kind = '') { play(kind === 'good' ? (/\$|💰|paid|revenue|fee/i.test(msg) ? 'coin' : 'good') : kind === 'bad' ? 'bad' : 'tick'); return _toast(msg, kind); };
    const _modal = window.modal;
    window.modal = modal = function (html, wide) { const was = document.getElementById('modal').classList.contains('open'); if (!was) play('open'); if (/WON|wins the election|You won|is open!|Target achieved|🎉/.test(html)) setTimeout(() => play('fanfare'), 150); else if (/⚠️|OIL SPILL|collapsed|no confidence/i.test(html)) play('alert'); return _modal(html, wide); };
    const _burst = Confetti.burst;
    Confetti.burst = n => { play('fanfare'); if ((n || 180) >= 150) setTimeout(() => play('applause'), 500); return _burst(n); };
    if (typeof QA !== 'undefined') {
      const _say = QA.say, _open = QA.open;
      QA.open = o => { const r = _open(o); play(o.cls === 'qtime' ? 'gavel' : 'camera'); return r; };
      QA.say = (k, who, text) => { const r = _say(k, who, text); if (/Order, order|Ayes|motion is/.test(text)) play('gavel'); else if (k[0] === 'b' && document.querySelector('.presser')) play('camera'); return r; };
    }
    if (typeof Impact !== 'undefined' && Impact.show) { const _s = Impact.show; Impact.show = (...a) => { play('page'); return _s(...a); }; }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install); else install();
  return { play, set, panel, anthem, pref: () => pref, state: () => ctx ? ctx.state : 'none' };
})();
