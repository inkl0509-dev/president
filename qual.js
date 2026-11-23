/* ============================================================
   QUALIFICATIONS & KEY TERMS
   When you create your candidate you choose a background.
   An economist already knows what GDP and a deficit are; a
   doctor or a fisher probably does not. With assistant mode on,
   the Chief of Staff explains the terms YOUR candidate does not
   know yet, one at a time, using the country's real numbers.
   ============================================================ */

const QUALS = {
  economist: { icon: '📊', name: 'Economist', knows: ['econ', 'fiscal', 'money'], perk: 'Knows the economy · Economy +3', fx: { s: { economy: 3 } }, voters: { business: 3 } },
  lawyer: { icon: '⚖️', name: 'Lawyer', knows: ['law', 'politics'], perk: 'Knows the constitution · ⭐ +2 political capital', fx: { pc: 2 }, voters: { elderly: 2 } },
  business: { icon: '💼', name: 'Business owner', knows: ['econ', 'projects'], perk: 'Knows deals and projects · Business voters +5', fx: {}, voters: { business: 5 } },
  engineer: { icon: '👷', name: 'Engineer', knows: ['projects'], perk: 'Knows construction · megaprojects get +10 quality', fx: {}, voters: { workers: 2 } },
  doctor: { icon: '🩺', name: 'Doctor', knows: [], perk: 'Trusted on health · Health +5', fx: { s: { health: 5 } }, voters: { elderly: 4 } },
  teacher: { icon: '📚', name: 'Teacher', knows: [], perk: 'Trusted on schools · Education +5', fx: { s: { education: 5 } }, voters: { youth: 4 } },
  military: { icon: '🎖️', name: 'Military officer', knows: ['gov'], perk: 'Knows security · Security +5', fx: { s: { security: 5 } }, voters: { elderly: 2, workers: 2 } },
  activist: { icon: '✊', name: 'Activist / union leader', knows: ['politics'], perk: 'Knows the streets · Workers +5, Freedom +3', fx: { s: { freedom: 3 } }, voters: { workers: 5 } },
  selfmade: { icon: '🌱', name: 'Self-made, no degree', knows: [], perk: 'One of the people · Farmers/islanders +5', fx: {}, voters: { farmers: 5 } },
};
const QFIELDS = { econ: 'Economy', fiscal: 'Budget & debt', money: 'Money & banks', law: 'Law & parliament', gov: 'Running the government', projects: 'Projects', politics: 'Politics' };

// each term: field, a short plain-language definition, and "now" — what it means in YOUR country right now
const TERMS = [
  { id: 'gdp', t: 'GDP (Gross Domestic Product)', f: 'econ', d: 'The value of everything a country produces in one year — goods and services. It is the main measure of the size of an economy.', now: () => `${S.country}'s GDP is about ${bigMoney(S.gdp ? gdpReal() : COUNTRY.gdp)} a year.` },
  { id: 'growth', t: 'Economic growth', f: 'econ', d: 'How much GDP rises (or falls) compared with before. Growth means more jobs and more tax revenue; negative growth means the economy is shrinking.', now: () => S.lastGrowth !== undefined ? `Last half-year the economy changed by ${sign(S.lastGrowth)}%.` : 'You will see growth after your first half-year.' },
  { id: 'budget', t: 'Budget', f: 'fiscal', d: 'The government\'s plan for money: what it collects (revenue, mostly taxes) and what it spends (schools, hospitals, salaries, interest).', now: () => { const b = budgetCalc(); return `This year: revenue about ${money(b.rev * 2)}, spending about ${money((b.rev - b.bal) * 2)}.`; } },
  { id: 'deficit', t: 'Deficit and surplus', f: 'fiscal', d: 'A deficit is when the government spends more than it collects and must borrow the difference. A surplus is when it collects more than it spends and can pay back debt.', now: () => { const b = budgetCalc(), p = b.bal * 2 / S.gdp * 100; return `You are running a ${p >= 0 ? 'surplus' : 'deficit'} of ${fmt(Math.abs(p), 1)}% of GDP.`; } },
  { id: 'debt', t: 'Public debt (debt-to-GDP)', f: 'fiscal', d: 'All the money the government owes, added up from past deficits. It is compared with GDP: 60% means the debt equals 60% of one year\'s national output.', now: () => `Debt is ${fmt(S.gdp ? debtPct() : COUNTRY.debt)}% of GDP.` },
  { id: 'interest', t: 'Interest on debt', f: 'fiscal', d: 'The price of borrowing. Every year part of the budget goes to lenders instead of services — the bigger the debt and the higher the rate, the more you pay.', now: () => `You pay about ${money(budgetCalc().interest * 2)} a year in interest.` },
  { id: 'inflation', t: 'Inflation', f: 'econ', d: 'How fast prices rise. A little (about 2%) is normal; high inflation eats people\'s wages and savings and hurts the poor most.', now: () => S.infl !== undefined ? `Inflation is ${fmt(S.infl, 1)}%.` : '' },
  { id: 'unemp', t: 'Unemployment rate', f: 'econ', d: 'The share of people who want a job but cannot find one.', now: () => `Unemployment is about ${fmt(unemployment(), 1)}%.` },
  { id: 'revenue', t: 'Tax revenue', f: 'fiscal', d: 'The money the government collects, mainly from taxes on income, profits and sales (GST/VAT), plus fees and income from state companies.', now: () => `Your tax rate setting is ${S.budget ? S.budget.tax : '?'}%.` },
  { id: 'approval', t: 'Approval rating', f: 'politics', d: 'The share of people who think you are doing a good job. It decides elections and how much political capital you have.', now: () => `Your approval is ${fmt(approval())}%.` },
  { id: 'manifesto', t: 'Manifesto and mandate', f: 'politics', d: 'A manifesto is the list of promises you made. Winning the election gives you a mandate — permission from voters to carry them out. Broken promises cost trust.', now: () => `You have ${(S.promises || []).length} promises on record.` },
  { id: 'majority', t: 'Parliamentary majority', f: 'law', d: 'More than half the seats in parliament. You need it to pass laws and the budget. Some changes, like the constitution, need two-thirds.', now: () => S.parl ? `You control ${coalitionSeats()} of ${S.parl.size || 100} seats; a majority is ${majority()}.` : '' },
  { id: 'constitution', t: 'Constitution', f: 'law', d: 'The highest law of the country. It sets out how leaders are chosen, what powers they have and the rights of citizens. Ordinary laws must obey it.', now: () => `${S.country} is a ${COUNTRY.system === 'presidential' ? 'presidential republic' : 'parliamentary system'}.` },
  { id: 'separation', t: 'Separation of powers', f: 'law', d: 'Power is split between the executive (president and ministers), the legislature (parliament) and the judiciary (courts), so that each checks the others.', now: () => `Your parliament is the ${COUNTRY.parl}.` },
  { id: 'cabinet', t: 'Cabinet and ministries', f: 'gov', d: 'The cabinet is the team of ministers who run the ministries (health, finance, education…). The leader sets direction; ministers deliver.', now: () => 'Meet your cabinet in the 👥 Government tab.' },
  { id: 'soe', t: 'State-owned enterprise (SOE)', f: 'gov', d: 'A company owned by the government, such as a power, water or airline company. They provide services but can also lose money that taxpayers must cover.', now: () => 'Appoint SOE managing directors in the 👥 Government tab.' },
  { id: 'tender', t: 'Public tender (procurement)', f: 'gov', d: 'An open competition where companies bid for a government contract. Judged on price, quality and ability, it gives value for money and prevents corruption.', now: () => 'Every 🏗️ Build project goes through a tender.' },
  { id: 'centralbank', t: 'Central bank and interest rates', f: 'money', d: 'The central bank looks after the currency, sets the main interest rate and supervises banks. Higher rates slow inflation; lower rates encourage borrowing.', now: () => S.cb !== undefined ? `The central bank rate is ${fmt(S.cb, 2)}%.` : '' },
  { id: 'reserves', t: 'Foreign-currency reserves', f: 'money', d: 'Dollars and other foreign money held by the central bank to pay for imports and defend the currency. Usually counted in months of imports — 3 months is a common minimum.', now: () => (typeof Money !== 'undefined' && Money.peg()) ? `Reserves cover about ${fmt(Money.cover(), 1)} months of imports.` : 'See the 🏦 Money tab.' },
  { id: 'exrate', t: 'Exchange rate and peg', f: 'money', d: 'The price of your currency in other currencies. A pegged currency is held at a fixed rate (like the rufiyaa at about 15.42 to the US dollar), which needs enough reserves.', now: () => (typeof Money !== 'undefined' && Money.peg()) ? 'Your currency is pegged to the US dollar.' : 'Your currency floats: its price moves with the market.' },
  { id: 'tbill', t: 'Treasury bills and bonds', f: 'money', d: 'Ways for the government to borrow from investors. T-bills are short (under a year); bonds (and sukuk) are longer. The government repays them with interest.', now: () => 'Issue T-bills in the 🏦 Money tab, and learn more in the Finance School.' },
  { id: 'imf', t: 'IMF', f: 'money', d: 'The International Monetary Fund lends to countries in currency or debt crises, usually with conditions such as cutting the deficit.', now: () => debtPct() > 100 ? 'With debt this high, markets watch you closely.' : '' },
  { id: 'feas', t: 'Feasibility study and EIA', f: 'projects', d: 'Before a big project: a feasibility study checks cost, demand and benefits; an environmental impact assessment (EIA) checks harm to nature and people.', now: () => 'See the 🚧 Megaprojects tab.' },
  { id: 'ppp', t: 'Public–private partnership (PPP)', f: 'projects', d: 'A private company finances and builds public infrastructure; the state pays it back over many years. It spreads the cost but usually costs more in total.', now: () => '' },
  { id: 'overrun', t: 'Cost overrun and optimism bias', f: 'projects', d: 'Big projects usually cost more and take longer than first planned, because early estimates are too hopeful. Inspections and good contracts keep this under control.', now: () => '' },
];

const Qual = (() => {
  const q = () => QUALS[(S && S.player && S.player.qual) || 'teacher'] || QUALS.teacher;
  const known = t => q().knows.includes(t.f);
  const learned = () => (S.learned = S.learned || []);
  const toLearn = () => TERMS.filter(t => !known(t) && !learned().includes(t.id));
  function apply() {      // called once when a new game starts
    const Q = q();
    if (S.camp) for (const g in Q.voters) S.camp.symP[g] = (S.camp.symP[g] || 50) + Q.voters[g];
    news(`${S.player.name}, ${Q.name.toLowerCase()}, enters the race`);
  }
  function onGovern() {   // stat perks start when you take office
    if (S.qualDone) return; S.qualDone = 1;
    const Q = q(); if (Q.fx.s) for (const k in Q.fx.s) S.stats[k] = clamp(S.stats[k] + Q.fx.s[k]);
    if (Q.fx.pc) S.pc += Q.fx.pc;
  }
  const badge = () => S && S.player ? `<span class="qual-chip" title="${esc(q().perk)}">${q().icon} ${q().name}</span>` : '';
  function lineNow(t) { try { const v = t.now() || ''; return /NaN|undefined/.test(v) ? '' : v; } catch (e) { return ''; } }
  // the Chief of Staff explains one unknown term at a time
  function termCard() {
    if (typeof Assistant === 'undefined' || !Assistant.on() || !S) return '';
    const list = toLearn(), t = list[0], Q = q();
    if (!t) return `<div class="term-card done"><b>📖 Key terms</b><p>You know all ${TERMS.length} key terms. <button class="btn small ghost" data-act="glossary">Open the glossary</button></p></div>`;
    return `<div class="term-card"><div class="term-h"><b>📖 Term to know: ${t.t}</b><small>${Q.icon} As ${/^[aeiou]/i.test(Q.name) ? 'an' : 'a'} ${Q.name.toLowerCase()} you ${Q.knows.length ? `already know ${Q.knows.map(f => QFIELDS[f].toLowerCase()).join(', ')}` : 'are new to these words'} — ${list.length} term${list.length > 1 ? 's' : ''} to learn</small></div>
      <p>${t.d}</p>${lineNow(t) ? `<p class="term-now">📍 ${lineNow(t)}</p>` : ''}
      <div class="term-b"><button class="btn small primary" data-act="learnTerm" data-id="${t.id}">✓ Got it — next term</button><button class="btn small ghost" data-act="glossary">All terms</button></div></div>`;
  }
  function learn(id) { if (!learned().includes(id)) learned().push(id); save(); render(); }
  function glossary(focus) {
    const groups = Object.keys(QFIELDS).map(f => [f, TERMS.filter(t => t.f === f)]).filter(x => x[1].length);
    modal(`<div class="m-icon">📖</div><h2>Key terms for running a country</h2>
      <p class="muted center">${q().icon} ${q().name}: ${q().knows.length ? 'you already know ' + q().knows.map(f => QFIELDS[f]).join(', ') : 'everything here is worth learning'}.</p>
      <div class="gloss">${groups.map(([f, list]) => `<h4>${QFIELDS[f]} ${q().knows.includes(f) ? '<span class="good">✓ your field</span>' : ''}</h4>${list.map(t => `<details ${t.id === focus ? 'open' : ''}><summary>${learned().includes(t.id) || known(t) ? '✅' : '📘'} ${t.t}</summary><p>${t.d}</p>${S && S.stats && lineNow(t) ? `<p class="term-now">📍 ${lineNow(t)}</p>` : ''}</details>`).join('')}`).join('')}</div>
      <button class="btn primary big" id="m-ok">Close</button>`, 'wide');
    $('#m-ok').onclick = closeModal;
  }
  return { apply, onGovern, badge, termCard, learn, glossary, q, toLearn };
})();
