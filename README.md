# 🏛️ PRESIDENT: Rise to Power

A browser strategy game. Create a candidate, run a presidential campaign, win the election on a live
election night, then govern your country for up to two terms — balancing budgets, passing laws, handling
crises and keeping your promises. Your choices decide your legacy.

Pure **HTML + CSS + JavaScript** — no build step, no frameworks. Optional **Firebase** online Hall of Fame.

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
