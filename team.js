/* ============================================================
   GOVERNMENT TEAM — the president appoints ministers and the
   managing directors (MDs) of state-owned enterprises (SOEs).
   Names can be typed, people moved between posts, or replaced.
   In online games, posts can be offered to other players.
   ============================================================ */

const SOE_LIST = {
  mv: [
    ['mtcc', 'MTCC', 'Maldives Transport and Contracting Company', '⛴️', 'Ferries, roads & construction (merged with RDC in 2026)'],
    ['hdc', 'HDC', 'Housing Development Corporation', '🏢', 'Housing & the Hulhumalé city project'],
    ['stelco', 'STELCO', 'State Electric Company', '⚡', 'Electricity & water across the atolls (took over Fenaka\'s services)'],
    ['macl', 'MACL', 'Maldives Airports Company Limited', '✈️', 'Velana International Airport'],
    ['mpl', 'MPL', 'Maldives Ports Limited', '⚓', 'Commercial ports'],
    ['sto', 'STO', 'State Trading Organization', '⛽', 'Fuel, staple food & medicine imports'],
    ['mwsc', 'MWSC', 'Malé Water and Sewerage Company', '💧', 'Water & sewerage'],
    ['wamco', 'WAMCO', 'Waste Management Corporation', '♻️', 'Waste collection & Thilafushi'],
    ['iasl', 'IASL', 'Island Aviation Services (Maldivian)', '🛩️', 'Domestic & regional airline'],
    ['bml', 'BML', 'Bank of Maldives', '🏦', 'Largest bank (state majority)'],
  ],
  default: [
    ['power', 'NPC', 'National Power Company', '⚡', 'Electricity generation & grid'],
    ['air', 'NAL', 'National Airline', '✈️', 'Flag carrier'],
    ['ports', 'NPA', 'National Ports Authority', '⚓', 'Ports & shipping'],
    ['housing', 'NHC', 'National Housing Corporation', '🏘️', 'Public housing'],
    ['water', 'NWU', 'National Water Utility', '💧', 'Water & sewerage'],
    ['rail', 'NRC', 'National Railway Company', '🚆', 'Rail & freight'],
  ],
};

const Team = (() => {
  function soes() {
    if (!S.soes) {
      const list = SOE_LIST[COUNTRY.id] || SOE_LIST.default;
      S.soes = list.map(([id, short, name, icon, desc]) => { const g = Math.random() < .4 ? 'f' : 'm', look = randomLook(); if (g === 'f') look.style = pick(['long', 'curly', 'side']); return { id, short, name, icon, desc, md: { name: personName(g), gender: g, look } }; });
    }
    return S.soes;
  }
  const posts = () => [...S.cabinet.map(m => ({ key: 'min:' + m.id, label: Cabinet.get(m.id).title, icon: Cabinet.get(m.id).icon })), ...soes().map(s => ({ key: 'soe:' + s.id, label: `MD of ${s.short} — ${s.name}`, icon: s.icon }))];
  const holder = key => { const [k, id] = key.split(':'); return k === 'min' ? S.cabinet.find(m => m.id === id) : (soes().find(s => s.id === id) || {}).md; };
  const postLabel = key => (posts().find(p => p.key === key) || { label: key }).label;
  function freshPerson(h) { const g = Math.random() < .45 ? 'f' : 'm', look = randomLook(); if (g === 'f') look.style = pick(['long', 'curly', 'side']); Object.assign(h, { name: personName(g), gender: g, look, uid: null, human: false }); }

  function personRow(key, h, icon, title, sub) {
    const human = h.uid ? `<span class="tm-human" title="Played by an online player">🌐 player</span>` : '';
    return `<div class="tm-row ${h.uid ? 'is-human' : ''}"><div class="tm-av">${avatarSVG(h.look, 0, 34)}</div>
      <div class="tm-post"><b>${icon} ${esc(title)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</div>
      <input class="tm-name" data-key="${key}" value="${esc(h.name)}" maxlength="40" ${h.uid ? 'disabled' : ''} aria-label="Name of the ${esc(title)}">${human}
      <div class="tm-ctl">
        <button class="tm-b" data-tm="gender" data-key="${key}" title="Switch gender" ${h.uid ? 'disabled' : ''}>${h.gender === 'f' ? '👩' : '👨'}</button>
        <button class="tm-b" data-tm="new" data-key="${key}" title="${h.uid ? 'Remove the player and appoint someone else' : 'Appoint someone else'}">🔄</button>
        <select class="tm-move" data-key="${key}" title="Move this person to another post"><option value="">Move to…</option>${posts().filter(p => p.key !== key && p.key.split(':')[0] === key.split(':')[0]).map(p => `<option value="${p.key}">${p.icon} ${esc(p.label)}</option>`).join('')}</select>
      </div></div>`;
  }
  function html() {
    Cabinet.ensure(); soes();
    const on = typeof Online !== 'undefined' && Online.active() && Online.isPresident();
    return `<div class="team">
      ${on ? Online.teamPanel() : ''}
      <h3>👔 Cabinet <small class="muted">type a name to appoint someone, or move people between posts</small></h3>
      <div class="tm-list">${S.cabinet.map(m => { const g = Cabinet.get(m.id); return personRow('min:' + m.id, m, g.icon, g.title, `${partyById(m.party).name} · skill ${m.skill || 70}`); }).join('')}</div>
      <h3>🏭 State-owned enterprises <small class="muted">appoint the managing directors (MDs)</small></h3>
      <div class="tm-list">${soes().map(s => personRow('soe:' + s.id, s.md, s.icon, `MD, ${s.short}`, `${s.name} · ${s.desc}`)).join('')}</div>
      ${edu(COUNTRY.id === 'mv' ? 'In the Maldives the President appoints cabinet ministers, who must then be approved by the People\'s Majlis. The boards and managing directors of state-owned enterprises are appointed by the government through the Privatisation and Corporatisation Board (PCB) and the Ministry of Finance and Public Enterprises.' : 'Presidents appoint ministers (often confirmed by parliament) and, through the finance ministry or a holding agency, the boards and managing directors of state-owned companies.')}
    </div>`;
  }
  function publish() { if (typeof Online !== 'undefined' && Online.active()) Online.publishSoon(true); }
  // --- events (delegated) ---
  document.addEventListener('change', e => {
    const t = e.target;
    if (t.classList.contains('tm-name')) {
      const h = holder(t.dataset.key); const v = t.value.trim().slice(0, 40);
      if (h && v && v !== h.name) { h.name = v; save(); toast(`${v} appointed: ${postLabel(t.dataset.key)}`, 'good'); news(`${v} appointed ${postLabel(t.dataset.key)}`); publish(); }
    }
    if (t.classList.contains('tm-move') && t.value) {
      const a = holder(t.dataset.key), b = holder(t.value); if (!a || !b) return;
      const F = ['name', 'gender', 'look', 'party', 'skill', 'uid', 'human'];
      const tmp = {}; F.forEach(f => tmp[f] = a[f]); F.forEach(f => { a[f] = b[f]; b[f] = tmp[f]; });
      toast(`${b.name} is now ${postLabel(t.value)}`, 'good'); news(`Cabinet reshuffle: ${b.name} moves to ${postLabel(t.value)}`);
      save(); render(); publish();
    }
  });
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-tm]'); if (!b) return;
    const h = holder(b.dataset.key); if (!h) return;
    if (b.dataset.tm === 'gender') { h.gender = h.gender === 'f' ? 'm' : 'f'; h.look = randomLook(); if (h.gender === 'f') h.look.style = pick(['long', 'curly', 'side']); }
    if (b.dataset.tm === 'new') { const old = h.name; freshPerson(h); news(`${old} replaced by ${h.name} as ${postLabel(b.dataset.key)}`); }
    save(); render(); publish();
  });
  return { html, soes, posts, holder, postLabel, freshPerson };
})();
