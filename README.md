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
  Fuvahmulah, Kulhudhuffushi, Thinadhoo), the Equator and sea routes. Regions use Dhivehi names (Uthuru, Medhu, Dhekunu).
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
