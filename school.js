/* ============================================================
   📘 FINANCE SCHOOL — short illustrated lessons + quizzes on how
   a country's money works: budget & debt, Treasury bills, bonds
   & sukuk, currency swaps, reserves & the peg, the central bank,
   inflation, IMF & development loans, debt sustainability.
   Pass a quiz (all answers right) to earn a badge — and, while
   governing, ⭐1 political capital (once per lesson per game).
   ============================================================ */

const School = (() => {
  const KEY = 'president.school';
  const done = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } };
  const mv = () => typeof COUNTRY !== 'undefined' && COUNTRY && COUNTRY.id === 'mv';
  const cur = () => mv() ? 'MVR' : '';

  // --- tiny SVG diagram helpers ---
  const box = (x, y, w, h, t, sub, c = '#1e3a8a') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${c}" stroke="#93c5fd" stroke-width="1.2"/><text x="${x + w / 2}" y="${y + (sub ? h / 2 - 3 : h / 2 + 4)}" text-anchor="middle" fill="#fff" font-size="12" font-weight="700">${t}</text>${sub ? `<text x="${x + w / 2}" y="${y + h / 2 + 12}" text-anchor="middle" fill="#cbd5e1" font-size="10">${sub}</text>` : ''}`;
  const arrow = (x1, y1, x2, y2, label, c = '#fbbf24', dy = -6) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="2.4" marker-end="url(#ah${c.slice(1)})"/>${label ? `<text x="${(x1 + x2) / 2}" y="${(y1 + y2) / 2 + dy}" text-anchor="middle" fill="${c}" font-size="10.5" font-weight="700">${label}</text>` : ''}`;
  const svg = (w, h, body, colors = ['#fbbf24', '#34d399', '#f87171', '#93c5fd']) => `<svg class="sch-svg" viewBox="0 0 ${w} ${h}" role="img"><defs>${colors.map(c => `<marker id="ah${c.slice(1)}" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="${c}"/></marker>`).join('')}</defs>${body}</svg>`;
  const step = (n, t) => `<text x="12" y="${n}" fill="#e2e8f0" font-size="11">${t}</text>`;

  const L = () => [
    { id: 'budget', icon: '💰', title: 'Budget, deficit and debt',
      body: `<p>Every year the government collects <b>revenue</b> (taxes, fees, rents) and pays for <b>spending</b> (salaries, hospitals, schools, subsidies, interest). When spending is bigger than revenue, the gap is the <b>deficit</b>.</p>
        <p>The deficit has to be <b>financed</b> — by borrowing. Each year's borrowing adds to the <b>public debt</b>, and debt has to be repaid with <b>interest</b>, which becomes more spending next year.</p>
        <p>Economists compare these numbers with <b>GDP</b> (the size of the whole economy): a deficit of 5% of GDP means the government borrows one twentieth of everything the country produces in a year.</p>`,
      dia: () => svg(560, 170, `${box(10, 20, 150, 50, 'Revenue', 'taxes, fees, rents', '#065f46')}${box(10, 100, 150, 50, 'Spending', 'wages, services, interest', '#7f1d1d')}${box(220, 60, 120, 50, 'Deficit', 'spending − revenue', '#78350f')}${box(400, 60, 150, 50, 'Borrowing', 'T-bills, bonds, loans', '#1e3a8a')}${arrow(160, 45, 220, 75, '')}${arrow(160, 125, 220, 95, '')}${arrow(340, 85, 400, 85, 'financed by')}${arrow(475, 110, 475, 160, '', '#f87171')}<text x="475" y="168" text-anchor="middle" fill="#fca5a5" font-size="10">→ debt grows, interest next year</text>`),
      here: mv() ? 'The Maldives runs large deficits, so it borrows every year — at home through Treasury bills and bonds, and abroad through sukuk, bilateral loans and currency swaps.' : 'Almost every government runs deficits sometimes; the question is whether the debt stays affordable.',
      quiz: [['What is a budget deficit?', ['Spending greater than revenue', 'Debt owed to foreigners', 'A fall in exports'], 0],
        ['How is a deficit paid for?', ['By borrowing', 'It disappears by itself', 'Only by printing money'], 0],
        ['Why compare the deficit with GDP?', ['To see how big it is for the economy', 'Because GDP is a tax', 'It is required by the UN'], 0]] },
    { id: 'tbills', icon: '📜', title: 'Treasury bills (T-bills)',
      body: `<p>A <b>Treasury bill</b> is a short-term IOU from the government: “give me money today, I will pay you back the <b>face value</b> on a fixed date”. Terms are short — usually <b>28, 91, 182 or 364 days</b>.</p>
        <p>T-bills pay no separate interest. They are sold at a <b>discount</b>: you pay less than the face value, and the difference is your return. Price per 100 of face value = <b>100 ÷ (1 + rate × days ÷ 365)</b>.</p>
        <p><b>Example:</b> a 364-day bill at 4.60% sells for about <b>95.61</b>. You pay ${cur()} 95.61 now and get ${cur()} 100 in a year — that is 4.60% interest.</p>
        <p>Who buys them? Mainly <b>banks</b> (a safe place for spare cash), <b>pension funds</b>, insurers, state companies and some individuals. The <b>central bank</b> usually runs the sales as the government's agent.</p>
        <p><b>Two ways to sell:</b> an <b>auction</b> (buyers bid; the cheapest money is accepted first) or a <b>tap</b> (the government fixes the rate and sells to anyone who wants to buy).</p>
        <p><b>Risks:</b> because they are short, T-bills keep falling due. The government must <b>roll them over</b> (sell new ones to repay old ones). If buyers lose confidence, that becomes a crisis. Banks that lend heavily to the state also lend less to businesses (<b>crowding out</b>).</p>`,
      dia: () => svg(560, 190, `${box(10, 70, 140, 56, 'Ministry of Finance', 'needs cash', '#1e3a8a')}${box(210, 70, 140, 56, mv() ? 'MMA (agent)' : 'Central bank (agent)', 'runs the sale', '#334155')}${box(410, 70, 140, 56, 'Investors', 'banks, pension fund', '#065f46')}${arrow(150, 90, 210, 90, 'issues bills')}${arrow(350, 90, 410, 90, 'offers')}${arrow(410, 112, 350, 112, 'pay 95.61', '#34d399', 14)}${arrow(210, 112, 150, 112, 'cash today', '#34d399', 14)}<text x="280" y="30" text-anchor="middle" fill="#fbbf24" font-size="12" font-weight="700">TODAY</text><text x="280" y="170" text-anchor="middle" fill="#f87171" font-size="11" font-weight="700">IN 364 DAYS: government repays 100 (face value) to the investors</text>`),
      here: mv() ? 'In the Maldives the MMA issues T-bills for the Ministry of Finance. They are offered for 28, 91 (98), 182 and 364 days at fixed “tap” rates (3.50% to 4.60%), with a face value of MVR 10,000 per bill.' : '',
      quiz: [['How does a T-bill investor earn a return?', ['Buys below face value, gets face value at maturity', 'Gets a share of profits', 'Receives monthly dividends'], 0],
        ['What is “rolling over” T-bills?', ['Selling new bills to repay maturing ones', 'Cancelling the debt', 'Converting them into dollars'], 0],
        ['Why can heavy T-bill sales hurt businesses?', ['Banks lend to the state instead of to firms', 'T-bills raise taxes', 'They make imports illegal'], 0]] },
    { id: 'bonds', icon: '🧾', title: 'Bonds and sukuk',
      body: `<p>A <b>bond</b> is a longer IOU (2 to 30 years). The investor pays the face value; the government pays a fixed <b>coupon</b> (interest) every six months or year, and returns the face value at the end.</p>
        <p>A <b>sukuk</b> is the Islamic alternative: interest is not allowed, so investors instead own a share in an <b>asset</b> (for example land or buildings) and receive <b>profit</b> or rent from it. At maturity the government buys the asset back.</p>
        <p>Bonds sold to foreign investors in dollars bring in <b>foreign currency</b>, but must be repaid in dollars — dangerous if your own currency weakens. Countries with high debt pay much higher rates.</p>`,
      dia: () => svg(560, 160, `${box(10, 50, 150, 56, 'Government', 'issuer', '#1e3a8a')}${box(400, 50, 150, 56, 'Investors', 'local or foreign', '#065f46')}${arrow(400, 66, 160, 66, 'face value (e.g. $500M) today', '#34d399')}${arrow(160, 92, 400, 92, 'coupon / profit every year', '#fbbf24', 16)}<text x="280" y="140" text-anchor="middle" fill="#f87171" font-size="11" font-weight="700">At maturity: government repays the face value</text>`),
      here: mv() ? 'The Maldives repaid its $500 million 2021 sukuk in April 2026 — about $525 million including the final profit payment.' : '',
      quiz: [['What is a bond coupon?', ['The regular interest payment', 'A discount voucher', 'The bond\'s face value'], 0],
        ['How does a sukuk avoid interest?', ['Investors share in an asset and get profit/rent', 'It pays nothing at all', 'It is paid in gold'], 0],
        ['Why are dollar bonds risky for a small economy?', ['They must be repaid in dollars', 'Dollars cannot be spent', 'They have no maturity'], 0]] },
    { id: 'swap', icon: '🔁', title: 'Currency swaps between central banks',
      body: `<p>A <b>currency swap</b> is an exchange of currencies between two central banks, <b>reversed later</b>. It is a short-term loan of foreign currency, not a gift.</p>
        <ol><li><b>Today:</b> the ${mv() ? 'MMA' : 'central bank'} gives the partner its own currency${mv() ? ' (rufiyaa)' : ''} and receives the partner's currency${mv() ? ' (Indian rupees or US dollars)' : ''} at today's exchange rate.</li>
        <li><b>During the swap:</b> it uses the foreign currency to pay for imports or to calm the currency market — the reserves look stronger.</li>
        <li><b>At maturity:</b> both banks swap back at the <b>same</b> rate, and the borrower pays <b>interest</b>. It can be <b>rolled over</b> if the partner agrees.</li></ol>
        <p><b>Why use it?</b> It buys time in a dollar shortage. <b>The risk:</b> it must be repaid; if reserves are still low then, the problem returns — and you depend on the partner's goodwill.</p>`,
      dia: () => svg(560, 210, `${box(10, 70, 150, 60, mv() ? 'MMA' : 'Your central bank', mv() ? 'Maldives' : '', '#1e3a8a')}${box(400, 70, 150, 60, mv() ? 'Reserve Bank of India' : 'Partner central bank', mv() ? 'India' : '', '#065f46')}${arrow(160, 86, 400, 86, mv() ? '① rufiyaa' : '① your currency')}${arrow(400, 114, 160, 114, mv() ? '② rupees / dollars' : '② foreign currency', '#34d399', 16)}<text x="280" y="30" text-anchor="middle" fill="#fbbf24" font-size="12" font-weight="700">START OF THE SWAP</text><text x="280" y="170" text-anchor="middle" fill="#f87171" font-size="11" font-weight="700">③ AT MATURITY: swap back at the same rate + interest</text><text x="280" y="190" text-anchor="middle" fill="#cbd5e1" font-size="10">(or roll over for another period if the partner agrees)</text>`),
      here: mv() ? 'Under the SAARC Currency Swap Framework 2024–27, the RBI agreed in October 2024 to provide the MMA up to USD 400 million and INR 30 billion, valid until June 2027. The Maldives settled the USD 400 million in 2026, and India rolled over the INR 30 billion in October 2026. Rupees can be used to pay for imports from India, saving dollars.' : '',
      quiz: [['What happens at the end of a currency swap?', ['The currencies are swapped back, with interest', 'The foreign currency is kept for free', 'The exchange rate is reset to zero'], 0],
        ['Why would a central bank use a swap?', ['To get foreign currency quickly in a shortage', 'To raise taxes', 'To print more of its own money'], 0],
        ['What is the main risk of relying on swaps?', ['They must be repaid or rolled over', 'They are illegal', 'They lower exports'], 0]] },
    { id: 'reserves', icon: '💵', title: 'Foreign reserves and the pegged currency',
      body: `<p><b>Foreign reserves</b> are the dollars (and gold, other currencies) held by the central bank. They pay for imports and foreign debt when needed.</p>
        <p>A <b>peg</b> fixes the currency to another — ${mv() ? 'about MVR 15.42 per US dollar' : 'for example to the dollar'}. To keep the peg, the central bank must be ready to <b>sell dollars</b> at that rate. That only works while it has enough reserves.</p>
        <p>We measure reserves in <b>months of imports</b>: 3 months or more is usually seen as safe. When reserves run low, banks ration dollars and a <b>black market</b> appears with a worse rate. If reserves run out, the peg breaks: the currency is <b>devalued</b>, import prices jump, and foreign-currency debt becomes heavier.</p>`,
      dia: () => svg(560, 170, `${box(10, 20, 160, 50, 'Dollars in', 'tourism, exports, loans', '#065f46')}${box(10, 100, 160, 50, 'Dollars out', 'imports, debt repayments', '#7f1d1d')}${box(240, 55, 140, 60, 'Reserves', 'central bank', '#1e3a8a')}${box(440, 55, 110, 60, 'Peg holds', 'if reserves ≥ 3 months', '#334155')}${arrow(170, 45, 240, 75, '')}${arrow(240, 100, 170, 125, '', '#f87171')}${arrow(380, 85, 440, 85, 'defends')}`),
      here: mv() ? 'The Maldives imports almost everything. Tourism brings dollars in; imports and foreign debt send them out. Official reserves of about $600 million cover only around two months of imports, and the black-market rate has been well above the peg.' : '',
      quiz: [['How many months of import cover is usually seen as safe?', ['About 3 or more', 'Half a month', '24 months'], 0],
        ['What does the central bank need to keep a peg?', ['Enough foreign reserves to sell', 'A higher sales tax', 'A new flag'], 0],
        ['What happens if the peg breaks?', ['The currency is devalued and imports cost more', 'Prices fall', 'Foreign debt disappears'], 0]] },
    { id: 'cbank', icon: '🏦', title: 'The central bank and interest rates',
      body: `<p>The <b>central bank</b> manages the country's money: it sets short-term interest rates, supervises banks, keeps reserves and issues banknotes.</p>
        <p>Its main tools: the <b>policy rate</b> (the rate at which banks can borrow from it), the <b>minimum reserve requirement</b> (a share of deposits banks must keep with it), and <b>open market operations</b> (selling or buying bills to take money out of, or add it into, the banking system).</p>
        <p><b>Higher rates</b> → borrowing costs more → less spending → lower inflation, but slower growth. <b>Lower rates</b> do the opposite. Most central banks are <b>independent</b>, so governments cannot simply print money before elections.</p>
        <p><b>Printing money to pay for the budget</b> (“monetary financing”) is fast, but it raises prices and — under a peg — drains reserves.</p>`,
      dia: () => svg(560, 140, `${box(10, 40, 140, 56, 'Central bank', 'raises the rate', '#1e3a8a')}${box(200, 40, 140, 56, 'Banks', 'lend less, dearer', '#334155')}${box(390, 40, 160, 56, 'Prices', 'inflation cools', '#065f46')}${arrow(150, 68, 200, 68, '')}${arrow(340, 68, 390, 68, 'less spending')}`),
      here: mv() ? 'The MMA\'s main policy rate is a 7% one-week reverse repo rate; it also uses the minimum reserve requirement, a standing deposit facility and open market operations.' : '',
      quiz: [['What usually happens when the central bank raises rates?', ['Borrowing costs rise and inflation cools', 'Prices immediately double', 'Taxes fall'], 0],
        ['What is monetary financing?', ['The central bank creating money to fund the budget', 'A bank loan to a company', 'A foreign aid grant'], 0],
        ['Why are central banks often independent?', ['So politicians cannot print money for short-term gain', 'To avoid paying salaries', 'Because the UN requires it'], 0]] },
    { id: 'infl', icon: '🔥', title: 'Inflation',
      body: `<p><b>Inflation</b> is the general rise in prices. At 5% a year, something that costs 100 today costs 105 next year — money buys less.</p>
        <p>Causes: too much money and spending chasing the same goods (<b>demand</b>), higher costs such as fuel or imports (<b>cost</b>), and a weaker currency making imports dearer.</p>
        <p>Inflation hurts people on fixed incomes and savers most. Governments fight it with tighter money, a smaller deficit and targeted help for the poor. <b>Price controls</b> look quick but usually cause shortages and black markets.</p>`,
      dia: () => svg(560, 120, `${box(10, 35, 150, 50, 'Too much money', 'or high import costs', '#7f1d1d')}${box(210, 35, 140, 50, 'Prices rise', '', '#78350f')}${box(400, 35, 150, 50, 'Money buys less', 'pensions, wages', '#334155')}${arrow(160, 60, 210, 60, '')}${arrow(350, 60, 400, 60, '')}`),
      here: mv() ? 'Because the Maldives imports most food and fuel, world prices and the exchange rate move local inflation a lot.' : '',
      quiz: [['Who is hurt most by inflation?', ['People on fixed incomes and savers', 'Borrowers with fixed-rate loans', 'Nobody'], 0],
        ['What do price controls often cause?', ['Shortages and black markets', 'Lower taxes', 'More exports'], 0],
        ['Which policy helps reduce inflation?', ['Tighter money and a smaller deficit', 'Printing more money', 'Cutting interest rates to zero'], 0]] },
    { id: 'imf', icon: '🌐', title: 'IMF programmes and development loans',
      body: `<p>The <b>IMF</b> (International Monetary Fund) lends to countries in a balance-of-payments crisis. In return the government agrees a <b>programme</b> of reforms — usually cutting the deficit, protecting the poor, and fixing the currency regime. The money comes in instalments as targets are met.</p>
        <p><b>Development banks</b> — the World Bank, the Asian Development Bank, the Islamic Development Bank — lend for <b>projects</b> (schools, ports, water) on <b>concessional</b> terms: very low rates and 20–40 years to repay, with strict procurement rules.</p>
        <p><b>Bilateral lenders</b> (other governments, their export-import banks) are cheaper than markets but often require their own companies to do the work.</p>`,
      dia: () => svg(560, 130, `${box(10, 35, 160, 56, 'IMF', 'crisis loans + reforms', '#1e3a8a')}${box(200, 35, 160, 56, 'World Bank / ADB', 'cheap project loans', '#065f46')}${box(390, 35, 160, 56, 'Partner governments', 'bilateral, often tied', '#334155')}`),
      here: mv() ? 'In its 2026 review the IMF said the Maldives still faced a high risk of debt distress and needed decisive adjustment to protect the peg.' : '',
      quiz: [['What does the IMF ask for in return for a loan?', ['Reforms such as cutting the deficit', 'Ownership of the central bank', 'Nothing'], 0],
        ['What does “concessional” mean?', ['Cheaper than market terms', 'Paid in gold', 'Only for rich countries'], 0],
        ['A common condition of bilateral export-import bank loans is…', ['Contracts go to the lender\'s companies', 'No repayment', 'Free currency'], 0]] },
    { id: 'sustain', icon: '⚖️', title: 'Is the debt sustainable?',
      body: `<p>Debt stays under control when the economy grows <b>faster</b> than the interest rate on the debt (<b>g &gt; r</b>) and the budget, before interest, is not adding much new debt (a small <b>primary deficit</b> or a surplus).</p>
        <p>If interest is higher than growth, the debt grows by itself — a <b>snowball</b>. Then the only ways out are budget surpluses, faster growth, cheaper refinancing, or — in the worst case — restructuring or default.</p>
        <p>Watch also the <b>gross financing need</b>: how much debt falls due each year. Lots of short-term debt (like T-bills) means you must borrow again and again.</p>`,
      dia: () => svg(560, 130, `${box(10, 35, 160, 56, 'Growth g > interest r', 'debt ratio falls', '#065f46')}${box(390, 35, 160, 56, 'Interest r > growth g', 'debt snowballs', '#7f1d1d')}<text x="280" y="68" text-anchor="middle" fill="#fbbf24" font-size="13" font-weight="800">vs</text>`),
      here: '', quiz: [['When does debt tend to shrink relative to GDP?', ['When growth is higher than the interest rate', 'When interest rates rise', 'When the deficit grows'], 0],
        ['What is a “primary” deficit?', ['The deficit before interest payments', 'The first deficit ever', 'A deficit in schools'], 0],
        ['Why is a lot of short-term debt risky?', ['It must be refinanced often', 'It has higher face value', 'It cannot be sold'], 0]] },
  ];
  const get = id => L().find(x => x.id === id);

  async function open(id) {
    const lessons = L(), d = done();
    if (!id) {
      const pick0 = await new Promise(res => {
        const m = modal(`<div class="sch"><div class="scene-title">📘 Finance School</div>
          <p class="m-body">How a country's money really works — in short lessons with diagrams. Pass the quiz at the end of each to earn a badge${S && S.phase === 'govern' ? ' and ⭐1 political capital' : ''}.</p>
          <div class="sch-list">${lessons.map(x => `<button class="sch-item ${d[x.id] ? 'done' : ''}" data-l="${x.id}"><span>${x.icon}</span><b>${x.title}</b>${d[x.id] ? '<small>🏅 passed</small>' : ''}</button>`).join('')}</div>
          <p class="muted small">${Object.keys(d).length} of ${lessons.length} badges earned.</p>
          <div class="doc-actions"><button class="btn" id="sch-x">Close</button></div></div>`, 'wide');
        m.querySelectorAll('[data-l]').forEach(b => b.onclick = () => res(b.dataset.l));
        $('#sch-x', m).onclick = () => res(null);
      });
      if (!pick0) return closeModal();
      id = pick0;
    }
    const X = get(id); if (!X) return closeModal();
    const go = await docModal(`<div class="sch"><div class="scene-title">📘 Finance School · ${X.icon} ${X.title}</div>
      <div class="sch-body">${X.body}</div>${X.dia()}${X.here ? `<div class="sch-here">🇲🇻 <b>${mv() ? 'In the Maldives' : 'In practice'}:</b> ${X.here}</div>` : ''}</div>`,
      [{ id: 'quiz', label: '📝 Take the quiz', primary: true }, { id: 'back', label: '← All lessons' }, { id: 'x', label: 'Close' }]);
    if (go === 'back') return open();
    if (go !== 'quiz') return;
    // quiz: shuffle answers
    const qs = X.quiz.map(([q, opts, right]) => { const o = opts.map((t, i) => ({ t, ok: i === right })).sort(() => Math.random() - .5); return { q, o }; });
    const ans = [];
    for (let i = 0; i < qs.length; i++) {
      const k = await choiceModal({ icon: X.icon, title: `Question ${i + 1} of ${qs.length}`, text: `<p><b>${qs[i].q}</b></p>`, choices: qs[i].o.map(o => ({ t: o.t, note: '' })), mode: 'gov' });
      ans.push(qs[i].o[k] && qs[i].o[k].ok);
    }
    const score = ans.filter(Boolean).length, pass = score === qs.length;
    let reward = '';
    if (pass) {
      const dd = done(); const first = !dd[id]; dd[id] = Date.now(); localStorage.setItem(KEY, JSON.stringify(dd));
      if (S && S.phase === 'govern') { S.schoolPaid = S.schoolPaid || {}; if (!S.schoolPaid[id]) { S.schoolPaid[id] = 1; S.pc += 1; reward = ' +⭐1 political capital.'; save(); } }
      if (first) reward = ' 🏅 Badge earned!' + reward;
    }
    const nx = await docModal(`<div class="sch"><h2>${pass ? '🎉 Well done!' : '📘 Almost there'}</h2><p class="m-body">You answered <b>${score} of ${qs.length}</b> correctly.${pass ? reward : ' Read the lesson again and retry.'}</p>
      <ul class="sch-res">${qs.map((q, i) => `<li>${ans[i] ? '✅' : '❌'} ${q.q} — <i>${q.o.find(o => o.ok).t}</i></li>`).join('')}</ul></div>`,
      [{ id: 'more', label: '📘 More lessons', primary: true }, { id: 'retry', label: 'Read again' }, { id: 'x', label: 'Close' }]);
    if (nx === 'more') return open();
    if (nx === 'retry') return open(id);
    if (typeof render === 'function' && S) render();
  }
  return { open, lessons: L };
})();
