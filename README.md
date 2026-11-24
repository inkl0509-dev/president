# 🏛️ PRESIDENT: Rise to Power

A browser strategy game. Create a candidate, run a presidential campaign, win the election on a live
election night, then govern your country for up to two terms — balancing budgets, passing laws, handling
crises and keeping your promises. Your choices decide your legacy.

Pure **HTML + CSS + JavaScript** — no build step, no frameworks. Optional **Firebase** online Hall of Fame.

## How government works in the game

- **Passing a law** follows the real legislative path: a formal **bill** (long title, numbered sections,
  explanatory memorandum with the cost to taxpayers) → **first reading** → **committee stage** (members in
  proportion to party seats, expert witnesses for and against, a proposed amendment you can accept or reject) →
  **second reading debate** (MPs from each party speak; you can whip and negotiate) → **division** (the vote) →
  **upper house** (Senate, House of Lords, Bundesrat, Rajya Sabha…) → **enactment** (signature, Royal Assent or
  promulgation, depending on the country).
- **Awarding a project** follows public-procurement practice: choose **open tender, restricted tender or direct
  contracting** → official **invitation for bids** with published criteria → **public bid opening** →
  **evaluation committee** (chair, engineer, financial analyst, compliance officer, independent observer) scoring
  Price 40 / Technical 30 / Experience 15 / Time 15 with integrity checks → **award** (or a risky override) →
  possible **bid protest** to a review board → **contract** with advance payment, performance guarantee,
  liquidated damages for delay and retention. Contractors are paid by milestones as work progresses.
- **Cabinet meetings**: 11 ministers (with each country's real titles, e.g. Chancellor of the Exchequer, Secretary
  of State) brief you with live data, explain the economics behind it, and propose actions you can adopt.
  Coalition partners get a ministry.
- **The newspaper** each half-year: headline story, economy figures, a markets box (stock index, currency,
  inflation, central-bank rate, bond yield, oil), world news with its effect on your country, an
  "economics explained" box, opinion poll and editorial.
- **World economy**: inflation (starting from each country's recent real rate), an independent central bank,
  and 15 kinds of world events — oil and gas price swings, global rate hikes, gold prices, remittances, trade
  wars, shipping disruptions, AI boom… — whose effects depend on what your country exports and imports.
  The first edition reflects the real late-2026 situation: energy-driven inflation and central-bank rate rises.

## Real countries

Pick a fictional country or one of 11 real ones: Maldives, Uzbekistan, Kazakhstan, Türkiye, United States,
United Kingdom, Germany, France, Japan, India and Brazil. (Maldives: presidential system, 5-year terms with a
2-term limit, 93-seat People's Majlis, every region coastal and built around Greater Malé, the atolls and Addu.) Each uses real data:

- **Population, GDP (IMF 2025, nominal US$) and government debt (% of GDP)**. All money in the game is shown at the
  real scale of that economy.
- **Political rules**: the title you run for (President, Prime Minister, Chancellor), term length (7 years in
  Uzbekistan and Kazakhstan, 4 in the US…), term limits (Kazakhstan: one single term; no limit in parliamentary
  systems, where the game ends after 3 terms) and the real size of parliament (150 seats in Uzbekistan's
  Legislative Chamber, 650 in the UK House of Commons…).
- **Geography**: five regions built from real provinces/states with their population shares, real main cities and
  landscapes (desert, mountains, coast, farmland, jungle). Landlocked Uzbekistan cannot build seaports or a navy.
- **Not real on purpose**: parties, candidates and the hostile foreign power are fictional; the map is a stylised
  5-region layout, not the true border shape; starting stats (health, education…) are rough game estimates.

Edit `COUNTRIES` in `data.js` to add more countries.

## Office, diplomacy and ceremonies

- **Pinned scene**: the animated panel stays at the top of the screen while you scroll (📌 to unpin).
- **Presidential office**: while governing, the top panel shows your office: flags, desk, live TV news, aides.
  Signed laws are shown being signed at the desk.
- **Speeches**: addresses to a group or to the nation, written in the formal style of a head of state and built
  from your real record (growth, inflation, projects, laws). They are original texts, not copies of real leaders' speeches.
- **Cabinet room**: ministers sit around the table and each gives a professional briefing.
- **Foreign affairs**: speak at the UN General Assembly (second half of the year), attend the summits your country
  really belongs to (G20, G7, NATO, EU, SCO, BRICS, Commonwealth, COP…) and make state visits to real partner
  countries. Foreign officials are generic figures shown with their national flag. Trips build international reputation and deals.
- **Opening ceremonies**: when a project is finished, the city view shows a ribbon-cutting ceremony.
- Flags are drawn in SVG so they also display on Windows (which has no emoji flags).

## 📘 Finance School, T-bills and swaps (the game is meant to teach)

- **Finance School** (title screen, ☰ menu, 🏦 Money tab): 9 short lessons with diagrams — budget & debt, Treasury bills,
  bonds & sukuk, currency swaps, reserves & the peg, the central bank, inflation, IMF & development loans, debt
  sustainability — each with a 3-question quiz. Pass to earn a badge (and ⭐1 while governing).
- **Treasury bills** (🏦 Money tab): publish an *Invitation to subscribe* for 28/91/182/364-day bills (Maldives: the MMA
  sells them for the Ministry of Finance at fixed "tap" rates of 3.50–4.60%; price = 100 ÷ (1 + rate × days ÷ 365)).
  Banks, the pension fund, insurers and others subscribe; you see the cover ratio, allotment and settlement. Every
  half-year maturing bills are rolled over — if investors stay away, borrowing costs rise.
- **Currency swap** and every other financing decision has a **📘 How it works** button that opens the lesson.

## A more realistic campaign

- The election body's **rules & nomination** (e.g. Elections Commission of Maldives), the voting system and the
  spending limit; a **running mate** where president and vice president run together (Maldives, USA, Brazil).
- **Weekly polls** by named pollsters with sample size, **margin of error**, undecided voters, a trend line and
  "statistical tie" warnings (tap ? to learn how to read a poll).
- **Campaign finance ledger** (raised / spent / legal limit) and a tempting illegal donation; the election body
  audits the accounts after the vote.
- **Campaign silence & election day** (polling stations, secret ballot, observers, turnout).
- **Two-round systems** (Maldives, France, Brazil, Türkiye, Kazakhstan, Uzbekistan): more than 50% of valid votes
  wins; otherwise a **runoff** between the top two, where eliminated candidates may endorse you.

## 🚧 Megaprojects (monitor them closely)

Open the **🚧 Megaprojects** tab to launch a flagship project. Each one goes through the real stages:

1. **Feasibility study** (one half-year, about 1% of the cost) — an updated cost estimate and a benefit–cost ratio. Early estimates are usually too low (optimism bias).
2. **Environmental & social impact assessment** — full EIA with public hearings (slower, fewer protests) or fast-track (quicker, more protests and land disputes).
3. **Financing** — budget and bonds/sukuk, a bilateral development loan (cheaper, but the lender picks the contractor) or a public–private partnership (less money now, payments for years after it opens).
4. **Tender** — experienced consortium, lowest bidder or national/local builder: price against quality and speed.
5. **Construction** — every half-year the dashboard shows reported progress against plan (S-curve), the schedule and cost indices (earned value), money spent, safety, quality and a **risk register** with mitigations (supervision engineer, community fund, fixed-price contracts). Risks become decisions; if you ignore them, the site manager decides. **Site inspections** reveal the true progress (contractors report generously) and defects. You can pause, give public updates or cancel (and learn about the sunk-cost trap).

On opening, a ceremony compares time, cost and quality with the plan, and the project keeps adding to growth, energy and services.

Projects depend on the country: nuclear plants, high-speed rail, metros, dams, offshore wind, new cities and irrigation where they make sense; in the **Maldives** bridges (Greater Malé sea bridge, Addu City link road, Laamu island bridges), island reclamation (Hulhumalé-style city, Ras Malé eco-city, Gulhifalhu industrial island, expanding a crowded outer island), a new Velana terminal, the Gulhifalhu port, coastal protection, island solar and a waste-to-energy plant (no nuclear plant — and Germany has none since its 2023 phase-out). Costs are rough game estimates.

### 🏝️ Island resorts (Maldives)

Below the megaprojects, lease uninhabited islands for resorts: pick an atoll and a size (40, 100 or 200 villas), then choose open international bidding (best fee, takes a half-year), a joint venture with the state tourism company, or a direct award (fast and cheap, but scandal risk and the developer may never build). Set reef protection and local-hiring rules. The developer pays for construction; once open, the resort pays rent and tourism taxes every half-year, brings dollars into the reserves and creates jobs. Stalled leases can be revoked.

## Each country is different

Voter groups and events follow the country. India has **Farmers (kisan)**, marches on Delhi for a legal minimum support price, failed monsoons and onion prices. The Maldives has **Fishers & islanders** and **Resort & port workers**, tuna prices, the resort service charge, Malé housing, swell-wave flooding, coral bleaching, migrant workers, island harbours, Thilafushi and desalination — and no earthquakes, land borders or oil fields. France has pension strikes and motorway blockades; Kazakhstan fuel-price protests and spring floods; Uzbekistan the cotton harvest and the Aral Sea; Brazil the Amazon; Japan emptying villages; and so on. Events are simplified scenarios based on real issues; add more in `local.js`.

## 🧑‍💼 The President's advisers

The **Advisers** button in the office opens your personal team (separate from ministers and the expert roundtable). Each reads the current situation, gives advice with buttons to act, and answers common questions:

- ⚖️ **Legal Counsel** — scandal risk, direct awards, fast-tracked EIAs, rights and term limits; order a legal audit (⭐1). Answers: term limits, central bank independence, tenders, protests, dismissing ministers vs judges.
- 🩺 **President's Physician** — your own stress and fitness. Crises, low approval, scandals, deficits and running megaprojects raise stress; rest and an exercise routine lower it. Above 75 you lose political capital; above 90 you may collapse. Also advises on public health.
- 🌐 **Foreign Policy Adviser** — reputation, neighbours, borrowing from foreign lenders, climate finance, alliances, the UN.
- 📣 **Press Secretary** — the unhappiest group, the top story, press conferences, handling scandals.
- 🛡️ **National Security Adviser** — threat level, defence spending, wider security (in the Maldives: the sea, smuggling, disasters).
- 🗳️ **Political Strategist** — time to the election, majority in parliament, pledges and targets.
- 🌍 **Climate & Environment Adviser** — environment, electricity, adaptation vs mitigation, reclamation.

A red dot means an adviser wants to see you; the assistant reminds you too. Legal answers are simplified explanations for learning.

## 📱 Layout

The game clock (month and year, pause / play / fast) sits in the top bar. The **End half-year** (or **End week**) button is the first, full-width button under the city view, and on phones all action buttons are shown in a grid — nothing hides off the side of the screen.

## 📖 How to play & tips

Shown once before your first game ("Before you start"), and any time from the title screen, the setup screen or ☰ → How to play. Five tabs: **How to play** (the flow from candidate to retirement), **Win the election** (how the vote is decided in your country, what each campaign action does and costs, promises, attack-ad backfire, the debate, running mates), **Campaign money** (start $30M, +$3M a week, fundraisers +$12M, the legal spending limit — $45M, $60M in the US — and what happens if you overspend or take the tycoon's illegal donation: the post-election audit, a fine and scandal risk), **Governing tips** (cabinet, budget and debt crisis, targets, the 25% impeachment line, tenders, advisers, press) and **Stars**.

## ⭐ Political capital (stars)

Tap any ⭐ counter (or ☰ → How to earn stars) for the explainer. Earn stars: ⭐+2 every half-year (+1 if approval is above 60%; turn income stops at 12), ⭐+2 per national target achieved, ⭐+1 per Finance School lesson passed in government, ⭐+2 on re-election, ⭐+2 for the Lawyer qualification, ⭐+1 for suspending a corrupt official on a megaproject, and refunds when expert advice fails. Shady donations, crony contracts and blaming the last government give quick stars but raise scandal risk. When you don't have enough stars, the warning is tappable, and the assistant suggests ways to earn more when you are low.

## 🔊 Sound

All sounds are synthesised live with the Web Audio API — no audio files, so they work offline and in the installed app. Effects: button clicks, tab switches, a chime at the end of each turn, success and warning tones, coins for money coming in, a drum roll as election results come in, a fanfare and applause for victories and new laws, crowd cheers at rallies, camera shutters at press conferences, the Speaker's gavel at question time, and alarms for spills or no-confidence motions. Optional calm background music (it turns darker when approval is low). Use the 🔊 button in the top bar or ☰ → Sound & music; settings are remembered.

### 🎺 Anthems at state visits

On a state visit the military band plays your country's anthem, then the host's, as in real protocol (a 🔇 Stop button is shown). Included as melodies: the anthems whose music is in the public domain — *The Star-Spangled Banner* (USA), *God Save the King* (UK) and *La Marseillaise* (France). The fictional Republic of Veloria has an original anthem composed for the game. Other countries (including the Maldives, whose anthem's music is still under copyright) get original ceremonial band music. More public-domain anthems can be added in `anthem.js`.

## 👔 Cabinet meetings: discuss, decide, delegate

Tap a minister's proposal to **discuss it without leaving the meeting**. Ask: what will it cost, how long will it take, what are the risks and who will be unhappy, what are the alternatives, what does the Finance Minister think, and what result do you expect and how will we measure it — every answer uses the real figures. Then decide: **agree** (the minister carries it out), ask for a **revised proposal** at the next meeting, **handle it yourself** (leaves the meeting for the full law or tender process), or **not now**.

Agreed decisions are the minister's job: bills are drafted and put to parliament (political capital is committed; the vote happens early next half-year), tenders are run by the ministry's committee and the contract signed, budget measures start at once. At the start of the next half-year the **vice president** (or chief of staff) reports what happened — passed or defeated, who won the tender, how the figures moved — and ministers repeat the updates at the next cabinet meeting.

## 🔍 Tender review: what "Clarify" means

The document check now has a **How do I decide?** guide. ✓ Accept complete, valid documents; ❓ Clarify sends a written request for a *minor* gap (a missing CV, missing equipment commitment letters) — the bidder replies within days and the document is accepted, but may not change its price or substance; ✗ Reject material defects (bid security, forged or expired documents, experience, ownership), which can never be fixed by clarification; ☎️ Verify with the issuer when something looks suspicious. Each clarification shows the letter sent and the bidder's reply.

## 🎙️ Press conferences and 🏛️ question time

**Press conference** (🎙️ Press in the office, once per half-year). Choose up to 3 ministers to stand with you. Journalists ask about the country's real current concerns — deficit, debt, prices, jobs, dollar shortage, scandals, hospitals, schools, housing, crime, power cuts, environment, late megaprojects, islands leased without bidding, today's headline. For each question: answer honestly, defend the government, promise quick action (checked next half-year — broken promises cost trust), or ask a minister on stage to answer (their skill and whether it is their area decide how well it goes).

Questions are aimed at the ministers you bring — each minister on stage gets at least one question on their own area — and rotate: recently asked topics are pushed back, the wording changes, and journalists follow up ("last time it was X, now it is Y — what changed?"). Good answers give the real figures, the causes, numbered steps with costs, and a target with a date (e.g. "cut the deficit to 2.5% of GDP by Jan–Jun 2029"); weak ministers give vague answers or get the numbers wrong.

**Question time** (Parliament tab, once per half-year). The Speaker opens the session and opposition MPs question the responsible ministers. The minister can give the facts and a plan, attack the opposition's record, or promise a report to the committee. Ministers who keep answering badly face a **motion of no confidence**: defend them (you need a majority) or ask them to resign.

## 🛢️ Oil & gas exploration

In the Megaprojects tab every country can look for oil — even the Maldives, where past exploration found no commercial oil, so the chance is low (and a spill would hit reefs and tourism). Offer a block (open licensing round or direct deal), set environmental rules, and the oil company pays for the seismic survey and the exploration well. Most wells in low-chance countries are dry. If oil is found, choose the contract (production sharing, royalty and tax, or a national oil company) and whether to save half in a sovereign wealth fund or spend it all (the "resource curse": inflation and dependence on oil). Producing fields pay the state every half-year at the current oil price; spills are possible.

## 🗣️ Debates that don't repeat

The debate pool now has many more questions, plus country questions (Maldives: Malé housing, rising seas, fishers, island leasing, resort jobs, atoll hospitals, ferries; India: MSP, jobs, air pollution; and others). Questions already asked in a game are not repeated, and at re-election the moderator asks about your record using your real numbers.

## 🎯 Targets, qualifications and key terms

**Qualification.** When you create your candidate, choose a background: economist, lawyer, business owner, engineer, doctor, teacher, military officer, activist/union leader, or self-made with no degree. Each gives a small advantage (e.g. doctors start with better health, engineers build megaprojects to higher quality) and decides what you already know.

**Key terms.** With assistant mode on, the Chief of Staff explains — one at a time, during the campaign and in government — the terms your candidate does not know yet: GDP, growth, budget, deficit and surplus, public debt, interest, inflation, unemployment, majority, constitution, central bank, reserves, the peg, T-bills, PPPs and more. Each explanation includes what it means for your country right now (e.g. "You are running a deficit of 3.1% of GDP"). An economist skips the economics; a doctor learns everything. All terms are in **☰ → 📖 Key terms glossary**.

**Targets.** At the start of each term you publish targets. A balanced budget or surplus is always required; choose up to 3 more (debt below a level, inflation 1–5%, lower unemployment, growth, enough electricity, reserves of 3 months in pegged countries, housing, health, approval). A target is achieved when met for a full year (two half-years in a row): ⭐+2, more public trust and +150 points in your final score. Missed targets at the end of the term cost trust. The 🎯 strip shows live progress; **Details** explains how to reach each one.

## Learning to govern

- **📊 Impact of every decision**: laws, budget changes, tenders, loans, expert options, cabinet advice and events each show
  what changed right away, what is expected later, and **what people say** (citizens' reactions by group, age, job and island).
- **📰 The newspaper** now has journalists with bylines (political, economics, foreign desk, atolls), a *Decisions & reactions*
  story with quotes from the government and the opposition, and a vox pop from around the country.
- **🧭 Assistant mode** (☰ menu): a Chief of Staff suggests what to do next and teaches one lesson on how to run a country
  each half-year. Turn it off and all guidance disappears.
- **💳 Loans in cabinet**: in a cabinet meeting, discuss bank loans — local banks, foreign commercial banks, World Bank/ADB,
  India EXIM, China EXIM, IsDB/Saudi Fund (Maldives) — with the ministers' views, then choose the amount and purpose.
- **✍️ Write your own bill** (Laws tab): choose the area, title, purpose, clauses, funding and phase-in; the assistant checks
  cost, winners and losers and expected votes; then the bill goes through parliament.
- **🔍 Full tender review**: after bid opening you can check every bidder's documents yourself (bid security, registration,
  tax clearance, accounts, experience, staff, method, ownership), verify suspicious ones by phone, correct arithmetic
  errors, score the technical proposals, and get graded by the auditor. Mistakes lead to protests or scandals.

## Install on a phone (PWA)

The game is a Progressive Web App: on your own site (e.g. Vercel, which serves HTTPS) players can install it.
- **Android / Chrome / Edge**: tap **📲 Install app** on the title screen (or ⋮ → *Install app*).
- **iPhone / iPad**: open the site in Safari → Share → *Add to Home Screen* (the 📲 button shows these steps).
It then opens full-screen with its own icon and works offline (online multiplayer needs internet).
Files: `manifest.webmanifest`, `sw.js` (offline cache — bump `VERSION` when you deploy changes), `pwa.js`, `icons/`.
Installing is not possible inside the Claude page preview (it runs in a frame).

On phones and touch screens all buttons are at least 44 px; the pinned action bar scrolls sideways.

## Government team & online multiplayer

- **👥 Government tab**: appoint ministers and the managing directors of state-owned enterprises (Maldives: MTCC, HDC,
  STELCO, MACL, MPL, STO, MWSC, WAMCO, IASL, BML). Type a name, switch a person's gender/look, replace them, or move
  people between posts.
- **🌐 Online multiplayer** (title screen):
  1. Create a game (name + country) or join an open one; type your name and pick a party.
  2. Choose **Run for president** or **Party member**. The host starts the campaign.
  3. Each candidate plays their own campaign against computer rivals; their national vote share is the score. Party
     members knock on doors for their candidate (+0.4 points per shift, up to 6). The host counts the votes.
  4. The winner governs. In the 👥 Government tab they **offer posts** (minister or SOE managing director) to players,
     dismiss them, and approve or reject proposals.
  5. Players **accept** a post or **decline and join the opposition**. Ministers propose budget changes, tenders, bills and
     memos; MDs ask for capital or tariff changes; the opposition asks questions in parliament, issues statements and
     tables no-confidence motions (3 actions per half-year each). Everyone sees the state of the nation live.
- Where it is stored: in the published Claude page, the page's shared database (people need **Contributor** access);
  on your own site, Cloud Firestore (fill in `config.js` and deploy `firestore.rules`).
- Game names are unique (case and spacing ignored); a deleted game's name can be used again.
- While candidates campaign, each sees the others live: a 🌐 *Your rivals* strip (where they are, what they are doing, their
  poll share) and, when a rival is in the same region, their stage and supporters appear in the animation.
- The host can **delete** a game: every other candidate must agree (one refusal keeps the game).
- **Single-player and online games are saved separately** (one save per online game and player), so you can keep a
  single-player game and any number of online games going at the same time without losing progress.
- Re-election campaigns after the first term are played by the president alone against computer rivals.

## Game clock & experts

- **Clock**: while governing, game time runs — **2 real minutes = 1 month**, so a half-year lasts 12 minutes and ends
  automatically after June / December. ⏸ pause, ▶ normal, ⏩ fast (40 s a month). The clock stops while a dialog is open.
  **End half-year →** still ends it at once.
- **🧠 Ask the experts**: a policy roundtable on the current problem (deficit, debt, inflation, jobs, dollar reserves,
  approval). The chief economist, central-bank governor, an IMF mission chief, the chamber of commerce, a union leader and
  the opposition each give their view and recommend options; every option shows pros, cons and its effect before you decide.
- The pinned top panel is compact (smaller scene and buttons); 🔼 hides the scene and keeps only the action bar.

## Manifesto, money & banks

- **📜 Manifesto tab**: every promise and development pledge with *what to do* (step by step), *the effect when kept*,
  progress bars, and a "What to do next" list. Cabinet decisions and financing decisions are tracked to completion
  (bill enacted, tender launched, under construction, opened). On the campaign trail, the 📜 Manifesto button adds up to
  3 development pledges; unbuilt pledges count as broken at the next election.
- **🏦 Money tab**: the country's real central bank, currency regime and largest banks, with inflation, debt and risk.
  The Maldives is modelled in detail: MMA, the rufiyaa peg (MVR 15.42/$), official reserves and import cover, the
  black-market rate, a foreign-debt calendar (India currency swap, treasury bonds), MIRA taxes (G-GST 8%, T-GST 17%,
  Green Tax) and financing decisions (swap rollover, dollar loans from banks, tax changes, Foreign Currency Act,
  money printing, sukuk, IMF programme, open market operations). If reserves run out, the peg breaks.

## The Maldives in detail

- **Map** drawn from real latitude/longitude: all 20 administrative atolls with their Thaana code letters (ހއ, ހދ … ސ),
  traditional atoll names (Thiladhunmathi, Miladhunmadulu, Huvadhu …) and capital islands, the 5 cities (Malé, Addu,
  Fuvahmulah, Kulhudhuffushi, Thinadhoo), the Equator and sea routes. Six regions: Maalé, Uthuru, Medhu, Huvadhu,
  **Addu City** and **Fuvahmulah City** (separate). Countries can define more than five regions (`extra: true`).
- **Maldivian names** for rivals, ministers and the newspaper.
- **Cabinet** with the ministry titles from the April 2026 restructuring (e.g. Ministry of Finance and Public Enterprises,
  Ministry of Tourism and Civil Aviation).
- **Contractors**: real state-owned companies (HDC, MTCC, STELCO) and foreign contractors (AFCONS, CCCC) bid in
  tenders. Their performance in the game is simulated; budget and "shady" bidders are always fictional.
- Parties and candidates remain fictional.

## How to play

**Campaign (8 weeks)**
- Every action plays out in the animated city: rallies get a stage with banners, spotlights, balloons, confetti
  and a cheering crowd waving flags; door-to-door shows you knocking and a resident answering; town halls get a
  canopy and seated audience asking questions; TV and attack ads appear on giant billboards; fundraisers become a
  gala tent with guests. Your rival holds their own rallies with fans, and campaign posters cover the lamp posts.
- The TV debate is a live studio: all four party candidates at podiums, a moderator, spotlights, party banners,
  a live audience that cheers or groans, and an on-screen "who is winning" meter that decides the result.
- You get 3 actions per week: rallies, door-to-door, town halls, TV ads, attack ads, fundraisers, promises.
- Tap a region on the map — your character walks there. Big regions give more electoral votes (51 of 100 wins).
- Your rival campaigns too. Random events and a live TV debate can swing the race.
- Promises give a big boost — but you must pass the matching law once in office.

**Governing (2 terms × 8 half-years)**
- **City view**: an animated street scene of the selected region. Every building you own is drawn — homes, shops,
  hospitals, schools with kids playing, smoking factories, wind turbines, airports with planes taking off, ports with
  ships and cranes, military bases with tanks, parks and stadiums, construction sites with cranes and builders.
  Citizens walk around, go to work and say what they think; the face above each person shows if they are happy 😊,
  okay 😐 or angry 😠. Very unhappy groups protest with signs. Your president walks around inspecting it all.
  Drag to explore, hover to inspect.
- **Map**: 5 regions with cities, roads, and every building you own. Tap a region — your president walks there to inspect it.
- **Build**: start projects (housing estates, hospitals, schools, highways, airports, seaports, industrial parks,
  solar/wind farms, coal plants, military bases, parks). Each project goes to **tender**: 3 companies bid with
  different price, speed and quality. Cheap or shady companies cause delays, cost overruns, defects and scandals.
  Companies build a reputation over time.
- **Housing**: finished estates add homes; sell them to citizens at affordable, market or luxury prices.
- **Parliament**: 100 seats across 4 parties. Laws need 51 votes; each party votes by its interests.
  Invite parties into a coalition — but partners quit if you pass laws they hate.
- **Defense**: army, air force, navy, military bases, peace summits and a defense alliance.
  If the neighbouring Draskor Federation's threat outgrows your strength, it may invade.
- **Development**: population, GDP per person, unemployment, energy supply vs demand, and a development level
  (Developing → Emerging → Developed → Advanced).
- **Budget**: set taxes and spending on health, education, police, infrastructure and welfare.
- **Laws**: spend political capital ⭐ to propose one bill per half-year.
- **People**: give speeches to win back unhappy groups (workers, business, farmers, youth, seniors).
- Every half-year brings a crisis or decision: strikes, floods, scandals, pandemics, oil discoveries…
- Below 25% approval you risk **impeachment**. After term 1 you must win **re-election**.
- Finish two terms to get your final legacy score and title.

## Project structure

```
index.html        page shell
style.css         all styles
data.js           game content: parties, regions, cities, projects, companies, laws, events
game.js           game logic + UI
city.js           animated city view + campaign scenes (canvas)
stage.js          animated TV debate studio + confetti
gov.js            bills, procurement, cabinet, newspaper, world economy
scenes.js         flags, office, speeches, UN, summits, state visits, cabinet room
money.js          central banks, banks, taxes, reserves, financing decisions
agenda.js         manifesto & delivery tracker
experts.js        expert policy roundtable
team.js           ministers & SOE managing directors
net.js            storage adapter (Claude page db or Firebase)
online.js         online multiplayer: lobby, election, posts, proposals, opposition
pwa.js, sw.js     install as an app, offline cache
impact.js         decision impacts & public opinion
assistant.js      Chief of Staff guidance (assistant mode)
loans.js          loan discussion in cabinet
drafter.js        write your own bill
tender.js         full tender document review & evaluation
school.js         Finance School lessons & quizzes
tbills.js         Treasury bill issuance, subscriptions, rollover
realcamp.js       election rules, running mate, polls, campaign finance, runoff
resorts.js        Maldives island resort leasing
qual.js           qualifications and the key-terms glossary
targets.js        national targets (budget surplus and others)
advisers.js       the president's personal advisers and the president's own health
qa.js             press conferences and parliamentary question time (built from current concerns)
oil.js            oil & gas exploration, contracts and the wealth fund
debateq.js        larger debate question pool, country questions, no repeats
sound.js          synthesised sound effects and background music
stars.js          the political capital explainer
guide.js          how to play, election tips, campaign money rules
anthem.js         anthems and ceremonial music for state visits
cabtalk.js        cabinet discussion, delegated decisions and the vice president's follow-up
mega.js           megaprojects: feasibility, EIA, financing, tender, monitored construction
local.js          country-specific voter groups and events (farmers' protests, fishers, strikes…)
manifest.webmanifest, icons/  app name and icons
config.js         Firebase config (leave empty to play offline)
firebase.js       online Hall of Fame (Firestore), loaded only if configured
firestore.rules   security rules for the leaderboard
firebase.json     Firebase CLI config (rules + optional hosting)
vercel.json       Vercel static hosting config
```

Want new events, laws, projects or companies? Add entries in `data.js` — no other code changes needed.

## Run locally

Any static server works (needed because `firebase.js` is an ES module):

```bash
npx serve .          # or: python3 -m http.server 8080
```

Then open http://localhost:3000 (or :8080).

## 1. Upload to GitHub

```bash
git init
git add .
git commit -m "President: Rise to Power"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/president-game.git
git push -u origin main
```

(Create the empty repo first at https://github.com/new.)

## 2. Deploy on Vercel

1. Go to https://vercel.com/new and **Import** your GitHub repo.
2. Framework preset: **Other**. Build command: *none*. Output directory: `.` (root).
3. Click **Deploy**. Every `git push` to `main` redeploys automatically.

Or from the terminal: `npm i -g vercel && vercel --prod`

## 3. Firebase online Hall of Fame (optional)

1. Create a project at https://console.firebase.google.com
2. **Build → Firestore Database → Create database** (production mode, any region).
3. **Project settings → Your apps → Web (</>)** → register an app and copy the `firebaseConfig` values into `config.js`.
4. Publish the security rules — either paste `firestore.rules` into **Firestore → Rules**, or:
   ```bash
   npm i -g firebase-tools
   firebase login
   firebase use --add          # pick your project
   firebase deploy --only firestore:rules
   ```
5. Commit & push `config.js` → Vercel redeploys → the title screen shows “🟢 Online Hall of Fame connected”.

The first time someone loads the online board, Firestore may log a link to create an index for
`score desc` — single-field indexes are automatic, so normally nothing is needed.

**Alternative:** host on Firebase instead of Vercel with `firebase deploy --only hosting`.

> Note: the leaderboard has no login, so the rules only check that entries are well-formed. For a
> public launch, consider adding Firebase App Check or Anonymous Auth to limit spam.

## Saving

Progress auto-saves in the browser (localStorage) after every action. Use **☰ → Save & go to title**
and **Continue** to pick up later.
