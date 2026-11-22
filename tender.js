/* ============================================================
   FULL TENDER REVIEW — you sit as chair of the Tender
   Evaluation Committee for one project:
   1. Document check (each bidder's file: accept / clarify / reject,
      and verify documents with the issuing bank or authority)
   2. Arithmetic check of the price schedule (bill of quantities)
   3. Technical scoring (method, staff, equipment, experience)
   4. Auditor's review of your work
   The results feed the normal award → contract steps.
   ============================================================ */

const TenderReview = (() => {
  const mv = () => COUNTRY.id === 'mv';
  const REG = () => mv() ? 'Ministry of Economic Development and Trade (business registry)' : 'Companies Registry';
  const TAX = () => mv() ? 'MIRA (Maldives Inland Revenue Authority)' : 'National Revenue Authority';
  const BANK = () => mv() ? pick(['Bank of Maldives', 'Maldives Islamic Bank', 'State Bank of India (Malé)', 'Commercial Bank of Maldives']) : pick(['National Bank', 'Crown Commercial Bank', 'City Bank']);
  const DOCS = [
    { id: 'form', name: 'Signed bid form & power of attorney', material: true },
    { id: 'security', name: 'Bid security (bank guarantee, 2%)', material: true, verify: 'bank' },
    { id: 'reg', name: 'Business registration certificate', material: true, verify: 'reg' },
    { id: 'tax', name: 'Tax clearance certificate', material: true, verify: 'tax' },
    { id: 'fin', name: 'Audited financial statements (3 years)', material: true },
    { id: 'exp', name: 'Similar contracts & completion certificates', material: true, verify: 'client' },
    { id: 'staff', name: 'Key staff CVs (project manager, site engineer)', material: false },
    { id: 'method', name: 'Technical proposal: method statement & work schedule', material: true },
    { id: 'equip', name: 'Equipment list (owned or leased)', material: false },
    { id: 'bo', name: 'Beneficial ownership & conflict-of-interest declaration', material: true },
  ];
  // build the "truth" of each bidder's file
  function dossier(b, est, P) {
    const issues = {};
    const pickIssue = arr => { const d = pick(arr); return d; };
    if (b.c.shady) { issues.security = { kind: 'forged', hidden: true }; issues.bo = { kind: 'missing' }; }
    if (!b.docs && !b.c.shady) { const d = pickIssue(['tax', 'exp', 'security']); issues[d] = { kind: pick({ tax: ['expired', 'missing'], exp: ['missing', 'expired'], security: ['short', 'missing'] }[d]) }; }
    if (Math.random() < .3) issues.staff = { kind: 'minor' };
    if (b.q < 45) issues.method = { kind: 'weak' };
    if (Math.random() < .2 && !issues.exp) issues.exp = { kind: 'unverified', hidden: true };
    const arith = Math.random() < .25 ? Math.round(b.price * rnd(-.04, .04) * 10) / 10 : 0;   // error in the price schedule
    const bank = BANK(), until = `${pick(['30 June', '31 July', '31 August', '30 September'])} ${yearNow() + 1}`;
    const yrs = 5 + Math.floor(rnd(0, 20)), turnover = Math.round(b.price * rnd(1.5, 4) * 10) / 10;
    const ev = {
      form: 'Signed by the managing director; power of attorney attached and notarised.',
      security: issues.security && issues.security.kind === 'short' ? `Guarantee from ${bank} for 1.5% of the bid price — the tender requires 2%.`
        : issues.security && issues.security.kind === 'missing' ? '— not submitted —'
        : `Guarantee No. ${Math.floor(rnd(100000, 999999))} from ${bank} for 2% of the bid price, valid until ${until}.`,
      reg: `Registered with the ${REG()} ${yrs} years ago; registration current.`,
      tax: issues.tax && issues.tax.kind === 'expired' ? `Certificate from ${TAX()} — <b>expired</b> two months before the bid deadline.` : issues.tax && issues.tax.kind === 'missing' ? '— not submitted —' : `Certificate from ${TAX()}: no outstanding taxes; valid for 6 more months.`,
      fin: `Average annual turnover ${money(turnover)} (requirement: at least 1.5 × the yearly contract value); positive net worth; auditor's opinion unqualified.`,
      exp: issues.exp && issues.exp.kind === 'missing' ? 'Only one similar contract listed — the tender requires two in the last 5 years.'
        : issues.exp && issues.exp.kind === 'expired' ? 'Two contracts listed, but one was completed 8 years ago (outside the 5-year window).'
        : `${b.q > 70 ? 3 : 2} similar ${P.name.toLowerCase()} contracts completed in the last 5 years; completion certificates attached.`,
      staff: issues.staff ? 'Project manager CV attached (15 yrs). <b>Site engineer CV missing</b> — a name is given but no CV.' : `Project manager (${Math.round(rnd(10, 22))} yrs) and site engineer (${Math.round(rnd(6, 14))} yrs), both chartered.`,
      method: issues.method ? 'Generic method statement copied from another project; schedule has no critical path and ignores the monsoon season.' : `Detailed method statement, ${b.turns * 6}-month schedule with critical path, quality and safety plan.`,
      equip: b.q > 60 ? 'Owns the main plant; cranes leased with signed letters of commitment.' : 'Most equipment to be hired after award; no commitment letters.',
      bo: issues.bo ? '— not submitted — (the form is blank)' : 'Owners listed; no family links to officials; no conflicts declared.',
    };
    const verify = {
      bank: issues.security && issues.security.kind === 'forged' ? `☎️ ${bank} says guarantee number ${ev.security.match(/No\. (\d+)/) ? ev.security.match(/No\. (\d+)/)[1] : ''} <b>does not exist</b>. The document is forged.` : `☎️ ${bank} confirms the guarantee is genuine.`,
      reg: `☎️ The ${REG()} confirms the registration.`,
      tax: issues.tax ? `☎️ ${TAX()} confirms the problem.` : `☎️ ${TAX()} confirms the certificate is valid.`,
      client: issues.exp && issues.exp.kind === 'unverified' ? '☎️ One past client says the project was <b>never completed</b> by this firm — the completion certificate is not genuine.' : '☎️ Past clients confirm the contracts were completed.',
    };
    // what a correct reviewer should do with each document
    const should = {};
    DOCS.forEach(d => {
      const i = issues[d.id];
      should[d.id] = !i ? 'ok' : i.kind === 'minor' ? 'clarify' : i.kind === 'weak' ? 'ok' : 'reject';   // a weak method is a scoring matter, not a rejection
    });
    return { issues, ev, verify, should, arith };
  }
  const lbl = { ok: '✓ Accept', clarify: '❓ Clarify', reject: '✗ Reject' };

  async function run(bids, est, P, r, ref, STEPS) {
    bids.forEach(b => { b.file = dossier(b, est, P); b.mark = {}; b.ver = {}; });
    let cur = 0;
    // ---------- 1. document check ----------
    await new Promise(res => {
      const draw = () => {
        const b = bids[cur], f = b.file, done = bids.every(x => DOCS.every(d => x.mark[d.id]));
        const html = `${stepsBar(STEPS, 3)}<div class="tr"><h2>🔍 Document check — Ref. ${esc(ref)}</h2>
          <p class="m-body small">You chair the Tender Evaluation Committee. Open each bidder's file and decide on every document. A <b>material</b> defect (bid security, tax, registration, experience, ownership) makes the bid <b>non-responsive</b>. Minor gaps can be fixed by a clarification request — but bidders may not change their price. Use ☎️ to verify suspicious documents.</p>
          <div class="tr-tabs">${bids.map((x, i) => { const n = DOCS.filter(d => x.mark[d.id]).length; return `<button class="${i === cur ? 'on' : ''}" data-b="${i}">${x.c.icon} ${esc(x.c.name)} <small>${n}/${DOCS.length}</small></button>`; }).join('')}</div>
          <div class="tr-docs">${DOCS.map(d => { const m = b.mark[d.id], v = b.ver[d.id];
            return `<div class="tr-doc ${m || ''}"><div class="tr-dn"><b>${d.name}</b>${d.material ? '<span class="tr-mat">material</span>' : '<span class="tr-min">minor</span>'}</div>
              <div class="tr-ev">${f.ev[d.id]}${v ? `<div class="tr-ver">${v}</div>` : ''}</div>
              <div class="tr-act">${d.verify && !v ? `<button class="btn small" data-v="${d.id}">☎️ Verify</button>` : ''}${['ok', 'clarify', 'reject'].map(k => `<button class="btn small ${m === k ? 'primary' : ''}" data-m="${d.id}" data-k="${k}">${lbl[k]}</button>`).join('')}</div></div>`; }).join('')}</div>
          <div class="tr-sum">Status of ${esc(b.c.name)}: ${DOCS.some(d => b.mark[d.id] === 'reject' && d.material) ? '<b class="bad">Non-responsive (material defect)</b>' : DOCS.every(d => b.mark[d.id]) ? '<b class="good">Responsive</b>' : '<span class="muted">review in progress</span>'}</div>
          ${edu('Bid evaluation starts with a pass/fail check of documents. Committees must apply the published rules to every bidder in the same way — rejecting a good bid for a trivial reason is as wrong as accepting a forged guarantee.')}
          <div class="doc-actions"><button class="btn" id="tr-auto">Let the committee finish</button><button class="btn primary" id="tr-next" ${done ? '' : 'disabled'}>Continue → price check</button></div></div>`;
        const m = modal(html, 'wide');
        m.querySelectorAll('[data-b]').forEach(x => x.onclick = () => { cur = +x.dataset.b; draw(); });
        m.querySelectorAll('[data-m]').forEach(x => x.onclick = () => { b.mark[x.dataset.m] = x.dataset.k; if (DOCS.every(d => b.mark[d.id]) && cur < bids.length - 1 && !bids[cur + 1].touched) { bids[cur + 1].touched = true; } draw(); });
        m.querySelectorAll('[data-v]').forEach(x => x.onclick = () => { const d = DOCS.find(y => y.id === x.dataset.v); b.ver[d.id] = f.verify[d.verify]; b.verified = (b.verified || 0) + 1; draw(); });
        $('#tr-auto', m).onclick = () => { bids.forEach(x => DOCS.forEach(d => { if (!x.mark[d.id]) x.mark[d.id] = x.file.should[d.id]; })); res(); };
        $('#tr-next', m).onclick = () => res();
      };
      draw();
    });
    bids.forEach(b => { b.ok = !DOCS.some(d => d.material && b.mark[d.id] === 'reject'); b.flags = DOCS.filter(d => b.mark[d.id] === 'reject').map(d => `${d.name}: rejected in document check`); b.reviewed = true; });
    // ---------- 2. arithmetic check ----------
    const errs = bids.filter(b => b.ok && b.file.arith);
    if (errs.length) {
      const ch = await docModal(`${stepsBar(STEPS, 3)}<h2>🧮 Arithmetic check of the price schedules</h2>
        <p class="m-body">The financial analyst re-added every bill of quantities (unit rate × quantity for each item). Errors were found:</p>
        <table class="bidtable"><tr><th>Bidder</th><th>Price read at opening</th><th>Corrected total</th></tr>${errs.map(b => `<tr><td>${b.c.icon} ${esc(b.c.name)}</td><td>${money(b.price)}</td><td><b>${money(b.price + b.file.arith)}</b></td></tr>`).join('')}</table>
        ${edu('Standard rule (e.g. World Bank and most national procurement laws): where unit rates and totals disagree, the unit rate prevails and the total is corrected. The bidder must accept the corrected price or lose its bid security.')}`,
        [{ id: 'fix', label: '✅ Apply the corrections (standard rule)', primary: true }, { id: 'keep', label: 'Ignore the errors' }]);
      if (ch === 'fix') errs.forEach(b => { b.price = Math.round((b.price + b.file.arith) * 10) / 10; b.corrected = true; });
      else bids.forEach(b => b.ignoredArith = !!b.file.arith);
    }
    // ---------- 3. technical scoring ----------
    const resp = bids.filter(b => b.ok);
    if (resp.length) {
      const CRIT = [['method', 'Method statement & work plan'], ['staff', 'Key staff'], ['equip', 'Equipment'], ['exp', 'Relevant experience']];
      resp.forEach(b => { b.ts = {}; });
      await new Promise(res => {
        const draw = () => {
          const all = resp.every(b => CRIT.every(([k]) => b.ts[k] !== undefined));
          const m = modal(`${stepsBar(STEPS, 3)}<div class="tr"><h2>📐 Technical evaluation</h2>
            <p class="m-body small">Score each responsive bid from 0 to 10 on each criterion, using the evidence in its file. The committee's engineer gives her scores too; the average is used.</p>
            ${resp.map((b, i) => `<div class="tr-tech"><b>${b.c.icon} ${esc(b.c.name)}</b>
              ${CRIT.map(([k, n]) => `<div class="tr-crit"><div><span>${n}</span><small>${b.file.ev[k] || ''}</small></div><div class="tr-sc">${[0, 2, 4, 6, 8, 10].map(v => `<button class="${b.ts[k] === v ? 'on' : ''}" data-i="${i}" data-c="${k}" data-v="${v}">${v}</button>`).join('')}</div></div>`).join('')}</div>`).join('')}
            ${edu('Technical scores must be justified by evidence in the bid, written down in the evaluation report. Scoring a friend generously without evidence is a classic form of procurement fraud.')}
            <div class="doc-actions"><button class="btn" id="tr-eng">Let the committee's engineer score</button><button class="btn primary" id="tr-done" ${all ? '' : 'disabled'}>Finish evaluation →</button></div></div>`, 'wide');
          m.querySelectorAll('[data-c]').forEach(x => x.onclick = () => { resp[+x.dataset.i].ts[x.dataset.c] = +x.dataset.v; draw(); });
          $('#tr-done', m).onclick = () => res();
          $('#tr-eng', m).onclick = () => { resp.forEach(b => CRIT.forEach(([k]) => { if (b.ts[k] === undefined) b.ts[k] = Math.round(b.q / 20) * 2; })); res(); };
        };
        draw();
      });
      resp.forEach(b => { const mine = CRIT.reduce((s, [k]) => s + b.ts[k], 0) / CRIT.length * 10; b.myTech = mine; b.q = clamp((mine + b.q) / 2); });
    }
    // ---------- 4. auditor's review ----------
    let caught = 0, missed = [], wrongly = [];
    bids.forEach(b => DOCS.forEach(d => {
      const s = b.file.should[d.id], m = b.mark[d.id];
      if (s === 'reject' && m === 'reject') caught++;
      else if (s === 'reject' && m !== 'reject') missed.push(`${b.c.name}: ${d.name.toLowerCase()} should have been rejected`);
      else if (s !== 'reject' && m === 'reject' && d.material) wrongly.push(`${b.c.name}: ${d.name.toLowerCase()} was fine`);
    }));
    const forgedMissed = bids.filter(b => b.file.issues.security && b.file.issues.security.kind === 'forged' && b.mark.security !== 'reject');
    const grade = !missed.length && !wrongly.length ? 'A — exemplary' : missed.length + wrongly.length <= 1 ? 'B — minor lapses' : 'C — serious lapses';
    await docModal(`${stepsBar(STEPS, 3)}<h2>🧾 Auditor's review of the evaluation</h2>
      <p class="m-body">The internal auditor compared your decisions with the tender rules.</p>
      <div class="tr-audit"><div><b>${caught}</b><small>defects correctly caught</small></div><div><b>${missed.length}</b><small>defects missed</small></div><div><b>${wrongly.length}</b><small>bids wrongly rejected</small></div><div><b>${grade}</b><small>grade</small></div></div>
      ${missed.length ? `<p class="bad small">Missed: ${missed.map(esc).join('; ')}.</p>` : ''}${wrongly.length ? `<p class="bad small">Wrongly rejected: ${wrongly.map(esc).join('; ')} — expect a bid protest.</p>` : ''}
      ${forgedMissed.length ? '<p class="bad"><b>⚠️ A forged bank guarantee was accepted.</b> If that bidder wins, the fraud will surface later.</p>' : ''}
      ${errs.length && bids.some(b => b.ignoredArith) ? '<p class="bad small">Arithmetic errors were ignored — the contract price may be challenged.</p>' : ''}
      ${edu('Auditors and anti-corruption bodies review procurement files after award. A clean, well-documented evaluation protects the officials, the winning bidder and the public purse.')}`,
      [{ id: 'go', label: 'Continue → evaluation report', primary: true }]);
    // consequences
    if (grade.startsWith('A')) { S.rep = clamp((S.rep || 50) + 2); news(`Auditor praises transparent evaluation of tender ${ref}`); }
    if (forgedMissed.length) S.scandalRisk += 1.2;
    bids.forEach(b => { b.wronged = wrongly.some(w => w.startsWith(b.c.name)); });
    return { grade, wrongly: wrongly.length };
  }
  return { run };
})();
