/* ============================================================
   ⭐ POLITICAL CAPITAL — how to earn it and what it is for.
   Opened by tapping any ⭐ counter, from the ☰ menu, the
   glossary, or when you don't have enough.
   ============================================================ */

const Stars = (() => {
  function open() {
    const gov = S && S.phase === 'govern';
    const ap = gov ? approval() : 0, next = gov ? Math.min(12, S.pc + 2 + (ap > 60 ? 1 : 0)) - S.pc : 2;
    const tLeft = gov && S.tg ? S.tg.list.filter(t => !t.done).length : 0;
    const sch = typeof School !== 'undefined' ? School.lessons().filter(l => !(S && S.schoolPaid && S.schoolPaid[l.id])).length : 0;
    const row = (ic, t, d, b = '') => `<div class="st-row"><span>${ic}</span><div><b>${t}</b><small>${d}</small></div>${b}</div>`;
    const go = (act, id, l) => `<button class="btn small" data-st="${act}" data-id="${id || ''}">${l}</button>`;
    const m = modal(`<div class="m-icon">⭐</div><h2>Political capital (stars)</h2>
      <p class="m-body">Political capital is the goodwill and influence a leader has — with parliament, the party and the public. In the game it is your ⭐ stars. You have <b>⭐ ${S ? S.pc : 0}</b>.</p>
      <h4>How to earn stars</h4>
      <div class="st-list">
        ${row('🗓️', 'Every half-year: ⭐+2 automatically', `+1 more if approval is above 60%${gov ? ` (yours is ${fmt(ap)}%)` : ''}. Turn income stops at ⭐12, so spend them. ${gov ? `<b>Next half-year: ⭐+${next}.</b>` : ''}`)}
        ${row('🎯', 'Achieve a national target: ⭐+2 each', gov && S.tg ? `${tLeft} of your ${S.tg.list.length} targets still open. Meet a target two half-years in a row.` : 'You set targets when you take office.', gov && S.tg ? go('targets', '', 'Targets →') : '')}
        ${row('📘', 'Pass a Finance School lesson: ⭐+1 each', `Read a short lesson and pass its quiz while in government. ${sch ? `${sch} lesson${sch > 1 ? 's' : ''} left to earn.` : 'All earned!'}`, go('school', '', 'School →'))}
        ${row('🗳️', 'Win re-election: ⭐+2', 'A new term starts with fresh political capital.')}
        ${row('⚖️', 'Choose the Lawyer qualification: ⭐+2 at the start', 'Your background when you create a candidate.')}
        ${row('🕵️', 'Act against corruption', 'Suspending an official accused of bribes on a megaproject and ordering an audit earns ⭐+1.')}
        ${row('↩️', 'Failed expert advice is refunded', 'If an expert option you paid stars for fails, you get the stars back.')}
      </div>
      <details class="st-warn"><summary>⚠️ Quick stars that cost you later</summary><p>Accepting a shady donation (⭐+3), giving a contract to a crony contractor (⭐+2) or blaming the last government (⭐+1) give stars now, but raise scandal risk or anger voters. A scandal costs ⭐−2 and public support.</p></details>
      <h4>How to lose stars</h4>
      <p class="small">Exhaustion (stress above 75: ⭐−1; collapse), scandals breaking (⭐−2), and revoking resort leases (⭐−1).</p>
      <h4>What stars are for</h4>
      <p class="small">Passing laws (⭐2–5 each), site inspections (⭐1), legal audits (⭐1), state visits (⭐1), expert-recommended reforms, many 🏦 money actions (swap, sukuk, IMF…), and diplomacy. <b>Tip:</b> save stars for the laws in your manifesto.</p>
      <button class="btn primary big" id="m-ok">Got it</button>`, 'wide');
    $('#m-ok', m).onclick = closeModal;
    m.querySelectorAll('[data-st]').forEach(b => b.onclick = () => { closeModal(); if (b.dataset.st === 'targets') Targets.details(); else School.open(); });
  }
  return { open };
})();
