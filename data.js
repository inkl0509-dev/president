/* ============================================================
   PRESIDENT: Rise to Power — game content
   Edit this file to add parties, regions, laws and events.
   ============================================================ */

const GROUPS = {
  workers:  { name: 'Workers',  icon: '🔧' },
  business: { name: 'Business', icon: '💼' },
  farmers:  { name: 'Farmers',  icon: '🌾' },
  youth:    { name: 'Youth',    icon: '🎓' },
  elderly:  { name: 'Seniors',  icon: '🧓' },
};

const STATS = {
  economy:     { name: 'Economy',     icon: '📈' },
  health:      { name: 'Health',      icon: '🏥' },
  education:   { name: 'Education',   icon: '📚' },
  security:    { name: 'Security',    icon: '🛡️' },
  environment: { name: 'Environment', icon: '🌳' },
  freedom:     { name: 'Freedom',     icon: '🗽' },
  housing:     { name: 'Housing',     icon: '🏠' },
};

const PARTIES = [
  { id: 'prog',  name: 'Progressive Party',  color: '#3b82f6', slogan: 'Forward, together.',
    bias: { workers: 10, business: -10, farmers: -2, youth: 8, elderly: 0 } },
  { id: 'cons',  name: 'Conservative Union', color: '#ef4444', slogan: 'Strength. Order. Prosperity.',
    bias: { workers: -2, business: 12, farmers: 8, youth: -10, elderly: 8 } },
  { id: 'green', name: 'Green Alliance',     color: '#22c55e', slogan: 'A future worth living in.',
    bias: { workers: -2, business: -8, farmers: 2, youth: 14, elderly: -6 } },
  { id: 'lib',   name: 'Liberty Party',      color: '#f59e0b', slogan: 'Free people, free markets.',
    bias: { workers: 0, business: 8, farmers: -4, youth: 6, elderly: -4 } },
];

const OPP_NAMES = ['Victor Hale', 'Elena Marsh', 'Gregor Stein', 'Amara Okafor', 'Lucas Moreau',
  'Sofia Varga', 'Dmitri Kovac', 'Hana Sato', 'Rustam Aliyev', 'Nadia Karim', 'Oliver Brandt', 'Leyla Hasan'];

// Map: viewBox 0 0 400 300. pop = electoral votes (total 100, need 51).
const REGIONS = [
  { id: 'capital', theme: 'capital', coast: false, city: [215,128,'Veloria'], name: 'Capital District', short: 'Capital', pop: 22,
    desc: 'Universities, ministries and young professionals. Trend-setters.',
    mix: { workers: .20, business: .22, farmers: 0, youth: .38, elderly: .20 },
    pts: [[160,120],[250,105],[270,170],[190,190],[110,160]] },
  { id: 'north', theme: 'industry', coast: true, city: [300,52,'Ironvale'], name: 'Industrial North', short: 'North', pop: 24,
    desc: 'Steel mills, car plants and strong unions. Jobs come first.',
    mix: { workers: .50, business: .08, farmers: .05, youth: .20, elderly: .17 },
    pts: [[150,35],[270,25],[350,60],[250,105],[160,120]] },
  { id: 'coast', theme: 'coast', coast: true, city: [343,104,'Port Azure'], name: 'Coastal Ports', short: 'Coast', pop: 20,
    desc: 'Busy harbours, trade and tourism. Open to the world.',
    mix: { workers: .30, business: .15, farmers: .05, youth: .30, elderly: .20 },
    pts: [[350,60],[370,140],[340,220],[270,170],[250,105]] },
  { id: 'farm', theme: 'farm', coast: false, city: [128,238,'Goldfield'], name: 'Southern Farmlands', short: 'Farmlands', pop: 18,
    desc: 'Wheat, cotton and orchards. Traditional and proud.',
    mix: { workers: .15, business: .05, farmers: .45, youth: .12, elderly: .23 },
    pts: [[70,230],[150,265],[260,270],[340,220],[270,170],[190,190],[110,160]] },
  { id: 'high', theme: 'mountain', coast: false, city: [78,80,'Stonecrest'], name: 'Western Highlands', short: 'Highlands', pop: 16,
    desc: 'Mountain towns, mines and retirees. Hard to win over.',
    mix: { workers: .25, business: .05, farmers: .25, youth: .15, elderly: .30 },
    pts: [[30,110],[60,50],[150,35],[160,120],[110,160],[70,230]] },
];

// Campaign promises -> the law that fulfils them
const PROMISES = {
  workers:  { law: 'minwage',  text: 'Raise the minimum wage' },
  business: { law: 'corptax',  text: 'Cut corporate taxes' },
  farmers:  { law: 'farmsub',  text: 'Give farmers subsidies' },
  youth:    { law: 'freeuni',  text: 'Make university free' },
  elderly:  { law: 'pensions', text: 'Raise pensions' },
};

const CAMP_ACTIONS = {
  rally:    { name: 'Hold a rally',   icon: '📣', cost: 4,  region: true, desc: 'Big boost in this region' },
  door:     { name: 'Door-to-door',   icon: '🚪', cost: 1,  region: true, desc: 'Small, cheap boost here' },
  townhall: { name: 'Town hall',      icon: '🎤', cost: 2,  group: true,  desc: 'Win over one voter group' },
  tv:       { name: 'TV ad blitz',    icon: '📺', cost: 12, desc: 'Support up everywhere' },
  attack:   { name: 'Attack ad',      icon: '🗡️', cost: 8,  desc: 'Hurt your rival. May backfire' },
  fund:     { name: 'Fundraiser',     icon: '🥂', cost: 0,  desc: '+$12M. Business ▲ Workers ▼' },
  promise:  { name: 'Make a promise', icon: '🤝', cost: 0,  group: true, desc: 'Huge boost — deliver it in office!' },
};

// cost = % of GDP per half-year (negative = raises money)
const LAWS = [
  { id: 'minwage', name: 'Minimum Wage Act', icon: '💵', pc: 3, cost: 0,
    desc: 'Raise the minimum wage by 20%.', g: { workers: 10, business: -8, youth: 3 }, s: { economy: -3 } },
  { id: 'corptax', name: 'Corporate Tax Cut', icon: '🏢', pc: 3, cost: 0.6,
    desc: 'Cut the corporate tax rate to attract investment.', g: { business: 12, workers: -4, youth: -2 }, s: { economy: 5 } },
  { id: 'farmsub', name: 'Farm Subsidies', icon: '🚜', pc: 2, cost: 0.4,
    desc: 'Direct support payments to farmers.', g: { farmers: 12, business: -2 }, s: {} },
  { id: 'freeuni', name: 'Free University', icon: '🎓', pc: 4, cost: 0.6,
    desc: 'Abolish tuition fees at public universities.', g: { youth: 12, elderly: -2 }, s: { education: 10 } },
  { id: 'pensions', name: 'Pension Increase', icon: '🧓', pc: 3, cost: 0.7,
    desc: 'Raise state pensions above inflation.', g: { elderly: 12, youth: -3 }, s: {} },
  { id: 'uhc', name: 'Universal Healthcare', icon: '🏥', pc: 5, cost: 1.0,
    desc: 'Free basic healthcare for every citizen.', g: { workers: 5, elderly: 6, business: -4 }, s: { health: 15 } },
  { id: 'carbon', name: 'Carbon Tax', icon: '🏭', pc: 4, cost: -0.5,
    desc: 'Tax pollution. Raises money, angers industry.', g: { youth: 8, workers: -5, farmers: -5, business: -6 }, s: { environment: 15 } },
  { id: 'rail', name: 'High-Speed Rail', icon: '🚄', pc: 3, cost: 0.6,
    desc: 'Connect every region with fast trains.', g: { workers: 3, business: 3 }, s: { economy: 6, environment: 4 } },
  { id: 'police', name: 'Tough on Crime Act', icon: '🚓', pc: 3, cost: 0.3,
    desc: 'More police powers and longer sentences.', g: { elderly: 6, youth: -6 }, s: { security: 12, freedom: -10 } },
  { id: 'press', name: 'Press Freedom Act', icon: '📰', pc: 2, cost: 0, ease: 5,
    desc: 'Protect journalists and open government data.', g: { youth: 5 }, s: { freedom: 12 } },
  { id: 'anticorrupt', name: 'Anti-Corruption Agency', icon: '🔍', pc: 3, cost: 0.2,
    desc: 'An independent watchdog for officials.', g: { workers: 3, business: 2, farmers: 3, youth: 3, elderly: 3 }, s: { economy: 3, freedom: 3 } },
  { id: 'renew', name: 'Renewable Energy Plan', icon: '☀️', pc: 3, cost: 0.5,
    desc: 'Solar and wind farms across the country.', g: { youth: 5, farmers: 2 }, s: { environment: 10, economy: 2 } },
  { id: 'austerity', name: 'Austerity Package', icon: '✂️', pc: 4, cost: -1.2, ease: -10,
    desc: 'Deep spending cuts to fix the budget.', g: { workers: -8, elderly: -6, youth: -4, business: 6 }, s: { economy: -2 } },
  { id: 'techhub', name: 'Tech Innovation Zones', icon: '💻', pc: 2, cost: 0.3,
    desc: 'Tax-free zones for startups.', g: { youth: 5, business: 4 }, s: { economy: 6, education: 3 } },
  { id: 'tariffs', name: 'Import Tariffs', icon: '🚢', pc: 2, cost: -0.3,
    desc: 'Protect local industry from foreign goods.', g: { workers: 6, farmers: 5, business: -6 }, s: { economy: -3 } },
];

/* Event effects (governing):
   g: group approval, s: stats, all: every group, cost: $B spent (negative = income),
   gdp: % change, pc: political capital */
const GOV_EVENTS = [
  { id: 'strike', icon: '🏭', title: 'Factory workers on strike',
    text: 'Thousands of workers in the North walk out, demanding higher pay. Production has stopped.',
    choices: [
      { t: 'Side with the workers', fx: { g: { workers: 8, business: -6 }, s: { economy: -3 } }, news: 'President backs striking workers' },
      { t: 'Mediate a deal', fx: { g: { workers: 2, business: 2 }, cost: 1 }, news: 'Government brokers end to strike' },
      { t: 'Send in the police', fx: { g: { workers: -10, business: 4 }, s: { security: 3, freedom: -4 } }, news: 'Police break up factory strike' },
    ] },
  { id: 'flood', icon: '🌊', title: 'Floods hit the Farmlands',
    text: 'Heavy rain has flooded villages and destroyed crops across the south.',
    choices: [
      { t: 'Full emergency aid', fx: { g: { farmers: 8, elderly: 3 }, cost: 4 }, news: 'Massive relief effort for flood victims' },
      { t: 'Ask for international help', fx: { g: { farmers: 3 }, cost: 1, s: { economy: -1 } }, news: 'Foreign aid arrives in flooded south' },
      { t: 'Minimal response', fx: { g: { farmers: -10 }, s: { health: -3 } }, news: 'Anger over slow flood response' },
    ] },
  { id: 'techhq', icon: '🏙️', title: 'Tech giant wants a new HQ',
    text: 'A global tech company is choosing between your capital and a rival country. They want tax breaks.',
    choices: [
      { t: 'Offer big tax breaks', fx: { g: { business: 5, youth: 4, workers: -2 }, s: { economy: 6 }, cost: 2 }, news: 'Tech giant picks the capital for new HQ' },
      { t: 'Normal terms only', fx: { s: { economy: 2 } }, news: 'Tech firm opens smaller office' },
      { t: 'We don\'t need them', fx: { g: { business: -5 }, s: { environment: 2 } }, news: 'Tech giant snubbed, goes abroad' },
    ] },
  { id: 'pandemic', icon: '🦠', title: 'A new virus is spreading',
    text: 'Hospitals report a fast-spreading flu. Experts are split on what to do.',
    choices: [
      { t: 'Full lockdown', fx: { g: { elderly: 6, youth: -6, business: -6 }, s: { health: 10, economy: -8, freedom: -6 } }, news: 'Nation enters lockdown' },
      { t: 'Masks and vaccines', fx: { g: { elderly: 4 }, s: { health: 6 }, cost: 3 }, news: 'Mass vaccination campaign begins' },
      { t: 'Keep everything open', fx: { g: { elderly: -10, business: 3 }, s: { health: -10, economy: 2 } }, news: 'Hospitals overwhelmed as virus spreads' },
    ] },
  { id: 'scandal', icon: '🕵️', title: 'Cabinet scandal!',
    text: 'Your trade minister is caught taking bribes from a construction firm. The press is all over it.',
    choices: [
      { t: 'Fire the minister', fx: { all: 2, pc: -1 }, news: 'Minister sacked in bribery scandal' },
      { t: 'Launch an independent inquiry', fx: { g: { youth: 3 }, s: { freedom: 3 }, cost: 0.5 }, news: 'Independent inquiry into bribery' },
      { t: 'Defend your minister', fx: { all: -6, s: { freedom: -2 } }, news: 'President defends disgraced minister' },
    ] },
  { id: 'border', icon: '🪖', title: 'Tension on the border',
    text: 'A neighbouring country is moving troops near your border.',
    choices: [
      { t: 'Send more troops', fx: { g: { elderly: 4, youth: -4 }, s: { security: 6 }, cost: 2 }, news: 'Troops reinforce the border' },
      { t: 'Talk it out', fx: { g: { youth: 3 }, s: { security: -2, freedom: 2 } }, news: 'Peace talks with neighbour' },
      { t: 'Sign a defence alliance', fx: { s: { security: 4, economy: 2 }, cost: 1 }, news: 'New defence alliance signed' },
    ] },
  { id: 'oil', icon: '🛢️', title: 'Oil found in the Highlands',
    text: 'Geologists discover a large oil field under a protected national park.',
    choices: [
      { t: 'Drill, baby, drill', fx: { g: { workers: 5, youth: -6 }, s: { environment: -10 }, cost: -4, gdp: 3 }, news: 'Oil drilling begins in Highlands' },
      { t: 'Limited drilling', fx: { s: { environment: -4 }, cost: -2, gdp: 1 }, news: 'Limited oil drilling approved' },
      { t: 'Protect the park', fx: { g: { youth: 6, business: -5 }, s: { environment: 5 } }, news: 'National park protected from drilling' },
    ] },
  { id: 'students', icon: '🪧', title: 'Student protests',
    text: 'Students fill the capital\'s squares protesting tuition fees and rents.',
    choices: [
      { t: 'Meet their demands', fx: { g: { youth: 10 }, s: { education: 4 }, cost: 2 }, news: 'Government gives in to students' },
      { t: 'Ignore them', fx: { g: { youth: -8 } }, news: 'Student protests continue' },
      { t: 'Crack down', fx: { g: { youth: -15, elderly: 3 }, s: { freedom: -8, security: 2 } }, news: 'Police clear student protest camps' },
    ] },
  { id: 'crash', icon: '📉', title: 'Stock market crash',
    text: 'Markets fall 20% in a single day. Banks are in trouble.',
    choices: [
      { t: 'Bail out the banks', fx: { g: { business: 8, workers: -6 }, s: { economy: 4 }, cost: 6 }, news: 'Banks rescued with public money' },
      { t: 'Stimulus cheques for families', fx: { g: { workers: 6, elderly: 4 }, s: { economy: 3 }, cost: 5 }, news: 'Every family gets a stimulus cheque' },
      { t: 'Let the market correct', fx: { g: { business: -8 }, s: { economy: -8 }, gdp: -1 }, news: 'Recession fears as markets slide' },
    ] },
  { id: 'nurses', icon: '🩺', title: 'Nurse shortage',
    text: 'Hospitals are short of 10,000 nurses. Waiting times are exploding.',
    choices: [
      { t: 'Raise nurses\' pay', fx: { g: { workers: 3 }, s: { health: 5 }, cost: 3 }, news: 'Nurses get a pay rise' },
      { t: 'Recruit from abroad', fx: { g: { workers: -3 }, s: { health: 6 }, cost: 2 }, news: 'Foreign nurses recruited' },
      { t: 'Wait it out', fx: { g: { elderly: -6 }, s: { health: -6 } }, news: 'Hospital waiting lists grow' },
    ] },
  { id: 'drought', icon: '☀️', title: 'Severe drought',
    text: 'No rain for three months. Rivers are drying up.',
    choices: [
      { t: 'Irrigation subsidies', fx: { g: { farmers: 8 }, cost: 2 }, news: 'Emergency irrigation for farmers' },
      { t: 'Water rationing', fx: { g: { farmers: -4 }, s: { environment: 4 } }, news: 'Water rationing announced' },
      { t: 'Import food', fx: { g: { farmers: -6 }, s: { economy: -2 }, cost: 1 }, news: 'Food imports rise during drought' },
    ] },
  { id: 'crime', icon: '🚨', title: 'Crime wave in the capital',
    text: 'Robberies are up 40% this year. People feel unsafe at night.',
    choices: [
      { t: 'More police on the streets', fx: { g: { elderly: 5 }, s: { security: 8, freedom: -3 }, cost: 2 }, news: 'Thousands of new police officers hired' },
      { t: 'Youth & social programs', fx: { g: { youth: 4, workers: 3 }, s: { security: 3 }, cost: 2 }, news: 'New youth centres to fight crime' },
      { t: 'Night curfew', fx: { g: { youth: -10 }, s: { security: 6, freedom: -10 } }, news: 'Curfew imposed in the capital' },
    ] },
  { id: 'olympics', icon: '🏅', title: 'Olympic Games bid',
    text: 'The sports committee wants to bid for the Olympics. It would be expensive — and glorious.',
    choices: [
      { t: 'Go for gold!', fx: { all: 2, g: { youth: 3 }, s: { economy: 3 }, cost: 4 }, news: 'Country bids to host the Olympics' },
      { t: 'Too expensive', fx: { g: { business: -2 } }, news: 'Olympic bid dropped' },
    ] },
  { id: 'leak', icon: '📰', title: 'Leaked documents',
    text: 'A newspaper publishes secret government memos. Your advisers are furious.',
    choices: [
      { t: 'Respect the free press', fx: { g: { youth: 4 }, s: { freedom: 5 }, pc: -1 }, news: 'President defends right to publish' },
      { t: 'Sue the newspaper', fx: { g: { youth: -5 }, s: { freedom: -8 } }, news: 'Government sues newspaper' },
      { t: 'Say nothing', fx: { all: -1 }, news: 'Silence from the palace on leak' },
    ] },
  { id: 'airline', icon: '✈️', title: 'Buyer for the national airline',
    text: 'A foreign investor offers to buy the loss-making national airline.',
    choices: [
      { t: 'Sell it', fx: { g: { workers: -6, business: 5 }, cost: -5 }, news: 'National airline sold to foreign investor' },
      { t: 'Sell half', fx: { g: { workers: -2, business: 2 }, cost: -2 }, news: 'Airline partially privatised' },
      { t: 'Keep it national', fx: { g: { workers: 3 }, cost: 1 }, news: 'Government keeps the airline' },
    ] },
  { id: 'fires', icon: '🔥', title: 'Heatwave and wildfires',
    text: 'Record temperatures. Forest fires are burning near towns.',
    choices: [
      { t: 'More firefighters', fx: { g: { farmers: 4 }, s: { environment: 3 }, cost: 2 }, news: 'Firefighting force doubled' },
      { t: 'Announce a climate plan', fx: { g: { youth: 6, business: -3 }, s: { environment: 6 }, cost: 1 }, news: 'Bold climate plan unveiled' },
      { t: 'Blame the last government', fx: { g: { youth: -4 }, pc: 1 }, news: 'President blames predecessor for fires' },
    ] },
  { id: 'teachers', icon: '🍎', title: 'Teachers on strike',
    text: 'Schools are closed as teachers demand better salaries.',
    choices: [
      { t: 'Raise salaries', fx: { g: { workers: 3, youth: 3 }, s: { education: 6 }, cost: 2.5 }, news: 'Teachers win pay rise' },
      { t: 'Negotiate', fx: { s: { education: 2 }, cost: 1 }, news: 'Teachers accept compromise' },
      { t: 'Hire volunteers', fx: { g: { youth: -6, workers: -5 }, s: { education: -8 } }, news: 'Chaos in schools as volunteers step in' },
    ] },
  { id: 'dance', icon: '🕺', title: 'You went viral',
    text: 'A video of you dancing at a wedding has 50 million views.',
    choices: [
      { t: 'Embrace it — post another!', fx: { g: { youth: 6, elderly: -2 } }, news: 'President\'s dance moves go viral (again)' },
      { t: 'Apologise', fx: { g: { elderly: 2, youth: -2 } }, news: 'President apologises for "undignified" dance' },
      { t: 'Ignore it', fx: {}, news: 'Dancing video fades from headlines' },
    ] },
  { id: 'refugees', icon: '⛺', title: 'Refugees at the border',
    text: 'Thousands of families are fleeing a war in a nearby country.',
    choices: [
      { t: 'Welcome them', fx: { g: { youth: 6, elderly: -5, workers: -3 }, s: { freedom: 5 }, cost: 2 }, news: 'Country opens its doors to refugees' },
      { t: 'Strict limits', fx: { g: { elderly: 4, youth: -5 }, s: { security: 3, freedom: -3 } }, news: 'Strict refugee limits announced' },
      { t: 'Fund camps abroad', fx: { s: { freedom: 2 }, cost: 1 }, news: 'Aid sent to refugee camps abroad' },
    ] },
  { id: 'loan', icon: '🏦', title: 'International loan offer',
    text: 'A global bank offers a big loan — if you cut some public spending.',
    choices: [
      { t: 'Take the loan', fx: { g: { workers: -5, elderly: -4 }, cost: -10 }, news: 'Government accepts international loan' },
      { t: 'Renegotiate', fx: { cost: -4, pc: -1 }, news: 'Smaller loan agreed after talks' },
      { t: 'Decline', fx: {}, news: 'Government declines foreign loan' },
    ] },
  { id: 'holiday', icon: '🎉', title: 'New national holiday?',
    text: 'A popular petition asks for a new public holiday to celebrate independence.',
    choices: [
      { t: 'Yes — party time!', fx: { g: { workers: 6, youth: 4, business: -4 }, s: { economy: -2 } }, news: 'New national holiday declared' },
      { t: 'No, we have work to do', fx: { g: { workers: -2, business: 2 } }, news: 'Holiday petition rejected' },
    ] },
  { id: 'space', icon: '🚀', title: 'Space program',
    text: 'Scientists pitch a national space program. "We could reach the Moon in 10 years!"',
    choices: [
      { t: 'Fund it', fx: { g: { youth: 5 }, s: { education: 4, economy: 2 }, cost: 3 }, news: 'National space agency founded' },
      { t: 'Not now', fx: { g: { youth: -2 } }, news: 'Space dreams put on hold' },
    ] },
  { id: 'quake', icon: '🏚️', title: 'Earthquake!',
    text: 'A 6.8 earthquake hits the Highlands. Buildings have collapsed.',
    choices: [
      { t: 'Lead the rescue in person', fx: { all: 3, s: { health: 2 }, cost: 5 }, news: 'President leads earthquake rescue' },
      { t: 'Send the army', fx: { all: 1, cost: 3 }, news: 'Army deployed to quake zone' },
      { t: 'Let local officials handle it', fx: { all: -6, s: { health: -8 } }, news: 'Outrage over slow quake response' },
    ] },
  { id: 'startup', icon: '🦄', title: 'Unicorn startup',
    text: 'A local app is now worth $10 billion. Its founders want to list on a foreign stock exchange.',
    choices: [
      { t: 'Convince them to stay', fx: { g: { business: 3, youth: 3 }, s: { economy: 3 }, pc: -1 }, news: 'Unicorn startup stays home' },
      { t: 'Let them go', fx: { g: { youth: -2 } }, news: 'Startup lists abroad' },
    ] },
];

const DEBT_EVENT = { id: 'debt', icon: '🔥', title: 'Debt crisis!',
  text: 'Your national debt is too high. Investors are panicking and interest rates are exploding.',
  choices: [
    { t: 'Harsh austerity', fx: { g: { workers: -8, elderly: -8, youth: -4 }, s: { economy: -4 }, cost: -12 }, news: 'Harsh cuts announced to fix debt' },
    { t: 'Emergency loan', fx: { g: { workers: -4, elderly: -4 }, cost: -8, pc: -2 }, news: 'Emergency loan saves the budget' },
    { t: 'Default on the debt', fx: { all: -5, s: { economy: -15 }, gdp: -5, debtMul: 0.55 }, news: 'Country defaults on its debt!' },
  ] };

/* Campaign events: p = your sympathy, o = opponent, pAll/oAll = all groups,
   funds = $M, rb = region bonus, risk = chance of backlash */
const CAMP_EVENTS = [
  { id: 'tweet', icon: '📱', title: 'An old post resurfaces',
    text: 'A rude joke you posted 10 years ago is trending.',
    choices: [
      { t: 'Apologise sincerely', fx: { pAll: -1 } },
      { t: 'Double down', fx: { p: { youth: -4, elderly: 2 } } },
      { t: 'Make a joke about it', fx: { p: { youth: 3 }, risk: { chance: .4, fx: { pAll: -2 }, news: 'Your joke made it worse!' } } },
    ] },
  { id: 'union', icon: '🔧', title: 'Union endorsement',
    text: 'The largest trade union offers to endorse you — if you oppose new labour reforms.',
    choices: [
      { t: 'Accept the endorsement', fx: { p: { workers: 6, business: -4 } } },
      { t: 'Politely decline', fx: { p: { business: 2 } } },
    ] },
  { id: 'donor', icon: '💰', title: 'Billionaire donor',
    text: 'A billionaire offers a huge donation. Journalists will find out.',
    choices: [
      { t: 'Take the money', fx: { funds: 25, p: { business: 3, youth: -4, workers: -2 } } },
      { t: 'Refuse publicly', fx: { p: { youth: 3, workers: 2 } } },
    ] },
  { id: 'dirt', icon: '🗂️', title: 'Dirt on your opponent',
    text: 'Someone sends you documents about your opponent\'s secret offshore account.',
    choices: [
      { t: 'Leak it to the press', fx: { oAll: -5, risk: { chance: .3, fx: { pAll: -3 }, news: 'Voters dislike your dirty tactics' } } },
      { t: 'Stay clean', fx: { pAll: 1 } },
    ] },
  { id: 'meme', icon: '😂', title: 'You became a meme',
    text: 'A photo of you eating a giant sandwich is everywhere online.',
    choices: [
      { t: 'Ride the wave (buy merch)', fx: { funds: -2, p: { youth: 6 } } },
      { t: 'Ignore it', fx: {} },
    ] },
  { id: 'farmers', icon: '🚜', title: 'Tractor protest',
    text: 'Farmers block highways with tractors, protesting low crop prices.',
    choices: [
      { t: 'Visit the protest', fx: { p: { farmers: 5 }, rb: { farm: 3 } } },
      { t: 'Issue a statement', fx: { p: { farmers: 1 } } },
      { t: 'Call it "a traffic problem"', fx: { p: { farmers: -6, business: 2 } } },
    ] },
  { id: 'health', icon: '🏃', title: 'Rumours about your health',
    text: 'Tabloids claim you are secretly ill.',
    choices: [
      { t: 'Release medical records', fx: { p: { elderly: 3 } } },
      { t: 'Run a marathon on TV', fx: { p: { youth: 4, elderly: 1 }, risk: { chance: .2, fx: { pAll: -2 }, news: 'You collapsed at km 30. Ouch.' } } },
    ] },
  { id: 'celeb', icon: '🎤', title: 'Pop star endorsement',
    text: 'The country\'s biggest pop star wants to perform at your rally.',
    choices: [
      { t: 'Yes! Concert rally', fx: { p: { youth: 5, elderly: -1 }, funds: -3 } },
      { t: 'Keep it serious', fx: { p: { elderly: 2 } } },
    ] },
  { id: 'gaffe', icon: '🎙️', title: 'Hot-mic gaffe',
    text: 'A microphone caught you calling the Highlands "the boring part of the country".',
    choices: [
      { t: 'Tour the Highlands to apologise', fx: { rb: { high: 2 }, funds: -3 } },
      { t: 'Laugh it off', fx: { rb: { high: -4 } } },
    ] },
];

const DEBATE_Q = [
  { q: '"How will you create jobs?"', a: [
    { t: 'Invest in factories & infrastructure', fx: { p: { workers: 3, farmers: 1 } } },
    { t: 'Cut taxes for businesses', fx: { p: { business: 4, workers: -1 } } },
    { t: 'A green jobs revolution', fx: { p: { youth: 3, workers: 1, business: -1 } } } ] },
  { q: '"Crime is rising. What will you do?"', a: [
    { t: 'More police on the streets', fx: { p: { elderly: 3, youth: -1 } } },
    { t: 'Fix poverty — the root cause', fx: { p: { youth: 3, workers: 1, elderly: -1 } } },
    { t: 'Tougher prison sentences', fx: { p: { elderly: 4, youth: -3 } } } ] },
  { q: '"Healthcare is too expensive. Your plan?"', a: [
    { t: 'Universal healthcare for all', fx: { p: { workers: 3, elderly: 2, business: -2 } } },
    { t: 'More competition between clinics', fx: { p: { business: 3 } } },
    { t: 'Focus on seniors first', fx: { p: { elderly: 4, youth: -1 } } } ] },
  { q: '"Is climate change a priority?"', a: [
    { t: 'Yes — bold climate action now', fx: { p: { youth: 4, workers: -1, farmers: -1 } } },
    { t: 'Balance it with jobs', fx: { p: { workers: 2, farmers: 1 } } },
    { t: 'The economy comes first', fx: { p: { business: 2, youth: -4 } } } ] },
  { q: '"What about our schools?"', a: [
    { t: 'Free university for everyone', fx: { p: { youth: 5, elderly: -1 } } },
    { t: 'Vocational training & apprenticeships', fx: { p: { workers: 3, farmers: 1 } } },
    { t: 'Let parents choose schools', fx: { p: { business: 2, elderly: 1 } } } ] },
  { q: '"Farmers are struggling. Will you help?"', a: [
    { t: 'Yes, with direct subsidies', fx: { p: { farmers: 4, business: -1 } } },
    { t: 'Modernise farms with technology', fx: { p: { farmers: 2, youth: 1 } } },
    { t: 'The free market will decide', fx: { p: { business: 2, farmers: -4 } } } ] },
];

const RALLY_LINES = [
  'Thank you, {r}! Together we will win!',
  '{r}, are you ready for change?!',
  'I see the future of this country right here in {r}!',
  '{r} — you deserve a president who listens!',
];

const SPEECH_LINES = {
  workers:  ['Every job matters. Every worker matters.', 'Fair pay for a fair day\'s work!'],
  business: ['We will make this the best place to do business.', 'Innovation will power our future.'],
  farmers:  ['Our farmers feed the nation. We stand with them.', 'Strong farms, strong country!'],
  youth:    ['The future belongs to you. Let\'s build it together.', 'Your voice matters — and I\'m listening.'],
  elderly:  ['You built this country. We will take care of you.', 'Dignity in retirement is a right.'],
};

// ---------- country building ----------
let NEIGHBOR = 'Draskor Federation';

// Roads between cities (region ids)
const ROADS = [['capital','north'],['capital','coast'],['capital','farm'],['capital','high'],['north','coast'],['farm','coast'],['high','north'],['high','farm']];

// Starting infrastructure
const START_BUILDINGS = { capital: ['hospital', 'school', 'airport'], north: ['factory', 'coal'], coast: ['port', 'hospital'], farm: ['school'], high: ['base'] };

/* Construction projects. cost in $B, turns = half-years, max = per region.
   fx.s = permanent stat bonus, fx.g = permanent group bonus. */
const PROJECTS = {
  housing:  { name: 'Housing estate',     icon: '🏘️', cost: 3, turns: 2, max: 4, units: 2000, desc: '2,000 homes to sell to citizens', fx: { g: { youth: 1 } } },
  hospital: { name: 'Hospital',           icon: '🏥', cost: 3, turns: 2, max: 2, desc: 'Better healthcare', fx: { s: { health: 4 }, g: { elderly: 2 } } },
  school:   { name: 'School & college',   icon: '🏫', cost: 2, turns: 2, max: 2, desc: 'Better education', fx: { s: { education: 4 }, g: { youth: 2 } } },
  highway:  { name: 'Highway',            icon: '🛣️', cost: 4, turns: 3, max: 1, desc: 'Faster trade, happier farmers', fx: { s: { economy: 3 }, g: { farmers: 2, business: 1 } } },
  airport:  { name: 'Airport',            icon: '✈️', cost: 8, turns: 4, max: 1, desc: 'Tourism, trade and business', fx: { s: { economy: 5 }, g: { business: 3, youth: 1 } } },
  port:     { name: 'Seaport',            icon: '⚓', cost: 6, turns: 3, max: 1, desc: 'Shipping & exports (coastal regions only)', fx: { s: { economy: 5 }, g: { workers: 2, business: 2 } } },
  factory:  { name: 'Industrial park',    icon: '🏭', cost: 4, turns: 2, max: 2, desc: 'Jobs! But more pollution', fx: { s: { economy: 4, environment: -4 }, g: { workers: 3 } } },
  solar:    { name: 'Solar & wind farm',  icon: '☀️', cost: 4, turns: 2, max: 2, desc: '+15 clean energy', fx: { s: { environment: 2 }, g: { youth: 1 } } },
  coal:     { name: 'Coal power plant',   icon: '⚡', cost: 3, turns: 2, max: 1, desc: '+22 energy, dirty', fx: { s: { environment: -6 }, g: { workers: 1 } } },
  base:     { name: 'Military base',      icon: '🪖', cost: 5, turns: 3, max: 1, desc: '+6 defense strength', fx: { s: { security: 2 }, g: { elderly: 1 } } },
  park:     { name: 'Park & stadium',     icon: '🏟️', cost: 2, turns: 1, max: 2, desc: 'Happier citizens', fx: { s: { environment: 1 }, g: { youth: 2, workers: 1 } } },
};

/* Construction companies that bid for projects.
   spec = project types they specialise in ('all' = general contractor).
   price multiplier, quality 0-100 (fewer delays & defects), speed (>=70 one turn faster, <50 one slower). */
const COMPANIES = [
  { id: 'atlas',  name: 'Atlas Construction',     icon: '🏗️', tag: 'Local',   spec: ['housing', 'highway', 'park', 'school'], price: 1.0,  quality: 68, speed: 60 },
  { id: 'sky',    name: 'SkyBridge Infrastructure', icon: '🌉', tag: 'Local', spec: ['airport', 'port', 'highway'], price: 1.12, quality: 80, speed: 55 },
  { id: 'medi',   name: 'MediBuild Group',        icon: '🩺', tag: 'Local',   spec: ['hospital', 'school'], price: 1.05, quality: 78, speed: 60 },
  { id: 'volt',   name: 'Voltaris Energy',        icon: '🔋', tag: 'Local',   spec: ['solar', 'coal', 'factory'], price: 1.0, quality: 72, speed: 65 },
  { id: 'iron',   name: 'Ironclad Defense Works', icon: '🛡️', tag: 'Local',   spec: ['base'], price: 1.1, quality: 82, speed: 50 },
  { id: 'nat',    name: 'National Works Corp',    icon: '🏛️', tag: 'State',   spec: 'all', price: 1.02, quality: 55, speed: 45 },
  { id: 'orion',  name: 'Orion Global',           icon: '🌍', tag: 'Foreign', spec: 'all', price: 1.3, quality: 88, speed: 75 },
  { id: 'quick',  name: 'QuickBuild Ltd',         icon: '⚡', tag: 'Budget',  spec: 'all', price: 0.78, quality: 42, speed: 75 },
  { id: 'crown',  name: 'Golden Crown Builders',  icon: '👑', tag: 'Shady',   spec: 'all', price: 0.9, quality: 50, speed: 60, shady: true },
];

// Real contractors per country (performance in the game is simulated — not a rating of the real company).
// The budget and "shady" bidders always stay fictional.
const COMPANY_LOCAL = {
  mv: {
    atlas: { name: 'HDC — Housing Development Corporation', icon: '🏢', tag: 'State', spec: ['housing', 'park', 'school'] },
    sky:   { name: 'AFCONS Infrastructure (India)', icon: '🌉', tag: 'Foreign', spec: ['highway', 'port', 'airport'] },
    volt:  { name: 'STELCO — State Electric Company', icon: '⚡', tag: 'State', spec: ['solar', 'coal'] },
    nat:   { name: 'MTCC — Maldives Transport & Contracting Co.', icon: '⛴️', tag: 'State' },
    orion: { name: 'CCCC — China Communications Construction', icon: '🌍', tag: 'Foreign' },
    medi:  { name: 'Atoll MediBuild (fictional)' }, iron: { name: 'Coastguard Works (fictional)' },
  },
};

// Price policy for selling government-built homes. price = $B per 1,000 homes.
const HOUSE_PRICES = {
  affordable: { name: 'Affordable', icon: '🙂', price: 0.8, demand: 1.6, desc: 'Sells fast. Workers & youth love it. Loses money.' },
  market:     { name: 'Market price', icon: '⚖️', price: 1.4, demand: 1.0, desc: 'Covers costs. Steady sales.' },
  luxury:     { name: 'Luxury', icon: '💎', price: 2.2, demand: 0.5, desc: 'Big profit, slow sales. Workers resent it.' },
};

const MIL_UPGRADES = {
  army: { name: 'Army', icon: '🪖', cost: 2, desc: 'Recruit & train soldiers' },
  air:  { name: 'Air force', icon: '🛩️', cost: 3, desc: 'Buy fighter jets' },
  navy: { name: 'Navy', icon: '🚢', cost: 3, desc: 'Build warships' },
};

GOV_EVENTS.push(
  { id: 'rent', icon: '🏠', title: 'Rents are skyrocketing',
    text: 'Young families can\'t afford to live in the cities. Rents rose 25% this year.',
    choices: [
      { t: 'Impose a rent cap', fx: { g: { youth: 6, workers: 3, business: -6 }, s: { housing: -2 } }, news: 'Rent cap introduced' },
      { t: 'Build public housing now', fx: { g: { youth: 3 }, cost: 3, homes: { capital: 2000 } }, news: '2,000 public homes rushed into the capital' },
      { t: 'The market will fix it', fx: { g: { youth: -5, business: 2 } }, news: 'Government refuses to act on rents' },
    ] },
  { id: 'tycoon', icon: '💼', title: 'A tycoon\'s offer',
    text: 'A construction tycoon offers your party a huge “donation” — and hints he\'d like future contracts.',
    choices: [
      { t: 'Accept quietly', fx: { pc: 3, scandal: 1 }, news: 'Party receives record donation' },
      { t: 'Refuse and report him', fx: { g: { youth: 3 }, s: { freedom: 2 } }, news: 'President exposes bribery attempt' },
    ] },
  { id: 'spy', icon: '🕶️', title: 'Spy caught!',
    text: 'Police arrest an agent of the {NEIGHBOR} photographing a military base.',
    choices: [
      { t: 'Expel their diplomats', fx: { g: { elderly: 3 }, threat: 8 }, news: 'Diplomats expelled over spy scandal' },
      { t: 'Quiet prisoner swap', fx: { threat: -5 }, news: 'Spy quietly sent home' },
      { t: 'Public trial', fx: { all: 1, s: { security: 3 }, threat: 4 }, news: 'Spy trial gripping the nation' },
    ] },
  { id: 'arms', icon: '🛩️', title: 'Fighter jet deal',
    text: 'A foreign arms maker offers 24 fighter jets at a discount.',
    choices: [
      { t: 'Buy the jets', fx: { cost: 4, air: 15, g: { elderly: 2, youth: -2 } }, news: 'Air force gets 24 new jets' },
      { t: 'Too expensive', fx: {}, news: 'Jet deal rejected' },
    ] },
);

// What each party's candidates say during the TV debate
const DEBATE_LINES = {
  prog:  ['We will stand with working families!', 'Healthcare is a right, not a privilege!', 'My opponent only cares about the rich.'],
  cons:  ['Lower taxes, law and order!', 'Strong economy, strong nation!', 'My opponent will raise your taxes!'],
  green: ['There is no planet B!', 'Clean energy means good jobs!', 'We need action, not words!'],
  lib:   ['Get the government out of your way!', 'Freedom and opportunity for all!', 'Less bureaucracy, more freedom!'],
};

/* ============================================================
   REAL COUNTRIES
   Population, GDP (IMF 2025, nominal US$) and government debt (% of GDP)
   are real figures. Term length, term limits and parliament size follow
   each country's rules. Regions are groups of real provinces/states with
   approximate population shares. Starting stats are rough game estimates.
   Parties and candidates are always fictional.
   region: [name, short, main city, % of population, theme, coastal?, mix(workers,business,farmers,youth,seniors), description]
   ============================================================ */
const _r = (name, short, city, pop, theme, coast, m, desc) => ({ name, short, city, pop, theme, coast, desc,
  mix: { workers: m[0], business: m[1], farmers: m[2], youth: m[3], elderly: m[4] } });
const COUNTRIES = [
  { id: 'veloria', name: 'Republic of Veloria', flag: '🏳️', fictional: true, system: 'presidential', title: 'President', termYears: 4, termLimit: 2,
    seats: 100, parl: 'National Assembly', pop: 24, gdp: 100, debt: 55, rate: .015, landlocked: false, infra: 40,
    note: 'A fictional country — type any name you like.' },
  { id: 'uz', name: 'Uzbekistan', flag: '🇺🇿', system: 'presidential', title: 'President', termYears: 7, termLimit: 2,
    seats: 150, parl: 'Legislative Chamber (Oliy Majlis)', pop: 38.4, gdp: 147, debt: 31, rate: .015, landlocked: true, infra: 38,
    stats: { economy: 62, health: 52, education: 56, security: 55, environment: 42, freedom: 60, housing: 46 }, mil: { army: 40, air: 25, navy: 0 },
    note: 'Doubly landlocked — no seaports or navy. 7-year presidential terms.',
    regions: {
      capital: _r('Tashkent city & region', 'Tashkent', 'Tashkent', 17, 'capital', false, [.30, .20, .05, .30, .15], 'The capital: government, business, universities and the metro.'),
      north: _r('Fergana Valley', 'Fergana', 'Namangan', 28, 'industry', false, [.38, .05, .22, .22, .13], 'Andijan, Fergana and Namangan — the most densely populated valley, car plants and cotton.'),
      coast: _r('Karakalpakstan, Khorezm, Bukhara & Navoi', 'West', 'Bukhara', 19, 'desert', false, [.30, .05, .30, .18, .17], 'Desert and oases: the Aral Sea region, ancient Khiva and Bukhara, mining in Navoi.'),
      farm: _r('Samarkand, Jizzakh & Syrdarya', 'Samarkand', 'Samarkand', 18, 'farm', false, [.22, .05, .35, .20, .18], 'Fertile plains, tourism on the Silk Road and the biggest region by population.'),
      high: _r('Kashkadarya & Surkhandarya', 'South', 'Qarshi', 18, 'mountain', false, [.25, .04, .33, .20, .18], 'Mountains, gas fields and the southern border at Termez.'),
    } },
  { id: 'mv', name: 'Maldives', flag: '🇲🇻', system: 'presidential', title: 'President', termYears: 5, termLimit: 2,
    seats: 93, parl: 'People\'s Majlis', threat: 15, pop: 0.53, gdp: 7.8, debt: 129.7, rate: .02, landlocked: false, infra: 45,
    stats: { economy: 52, health: 66, education: 58, security: 55, environment: 55, freedom: 60, housing: 38 }, mil: { army: 15, air: 5, navy: 15 },
    nameLocal: 'Dhivehi Raajje', note: 'Dhivehi Raajje — an island nation of 1,192 coral islands in 20 administrative atolls and 5 cities. Tourism drives the economy; public debt is very high and rising seas are an existential threat. 5-year presidential terms, unicameral People\'s Majlis.',
    regions: {
      capital: Object.assign(_r('Maalé City & Kaafu Atoll (Malé Atholhu)', 'Maalé', 'Maalé', 43, 'capital', true, [.30, .22, .02, .30, .16], 'The capital: Malé, Hulhumalé and Villimalé, Velana International Airport, and guesthouse islands like Maafushi in Kaafu Atoll.'),
        { pts: [[206,92],[318,92],[318,140],[206,140]], lab: [352,112] }),
      north: Object.assign(_r('Uthuru — Northern Atolls (Haa Alif to Lhaviyani)', 'Uthuru', 'Kulhudhuffushi', 21, 'coast', true, [.28, .08, .22, .24, .18], 'Seven northern atolls: fishing communities, Kulhudhuffushi City, regional airports and island harbours.'),
        { pts: [[96,6],[318,6],[318,92],[96,92]], lab: [352,46] }),
      coast: Object.assign(_r('Medhu — Central Atolls & resort islands', 'Medhu', 'Mahibadhoo', 11, 'coast', true, [.40, .22, .06, .22, .10], 'Alif Alif, Alif Dhaal, Vaavu, Meemu, Faafu and Dhaalu: world-famous resorts, dive sites and manta bays.'),
        { pts: [[96,92],[206,92],[206,140],[318,140],[318,178],[96,178]], lab: [352,160] }),
      farm: Object.assign(_r('Mathi Dhekunu — Thaa, Laamu & Huvadhu Atoll', 'Huvadhu', 'Thinadhoo', 12, 'coast', true, [.26, .06, .30, .20, .18], 'Thaa, Laamu and the giant Huvadhu Atoll (Gaafu Alif & Gaafu Dhaalu): fishing, farming islands and Thinadhoo City.'),
        { pts: [[96,178],[318,178],[318,262],[96,262]], lab: [352,212] }),
      high: Object.assign(_r('Dhekunu — Addu City & Fuvahmulah City', 'Addu', 'Addu City', 13, 'coast', true, [.30, .12, .14, .26, .18], 'The far south across the Equator: Addu City (Hithadhoo, Feydhoo, Gan with its international airport) and the one-island atoll Fuvahmulah.'),
        { pts: [[96,262],[318,262],[318,296],[96,296]], lab: [352,268] }),
    },
    // 20 administrative atolls + Malé City. Positions come from real latitude/longitude.
    atolls: [
      ['HA', 'Haa Alif', 'Dhidhdhoo', 6.95, 72.95, 'north', 10, 9, 'ހއ', 'Thiladhunmathi Uthuruburi'], ['HDh', 'Haa Dhaalu', 'Kulhudhuffushi', 6.62, 73.05, 'north', 10, 8, 'ހދ', 'Thiladhunmathi Dhekunuburi'],
      ['Sh', 'Shaviyani', 'Funadhoo', 6.3, 73.2, 'north', 8, 8, 'ށ', 'Miladhunmadulu Uthuruburi'], ['N', 'Noonu', 'Manadhoo', 5.85, 73.4, 'north', 8, 9, 'ނ', 'Miladhunmadulu Dhekunuburi'],
      ['R', 'Raa', 'Ungoofaaru', 5.55, 72.97, 'north', 9, 10, 'ރ', 'Maalhosmadulu Uthuruburi'], ['Lh', 'Lhaviyani', 'Naifaru', 5.33, 73.52, 'north', 7, 6, 'ޅ', 'Faadhippolhu'],
      ['B', 'Baa', 'Eydhafushi', 5.1, 73.05, 'north', 9, 7, 'ބ', 'Maalhosmadulu Dhekunuburi'], ['K', 'Kaafu', 'Thulusdhoo', 4.3, 73.47, 'capital', 9, 16, 'ކ', 'Malé Atholhu'],
      ['AA', 'Alif Alif', 'Rasdhoo', 4.1, 72.85, 'coast', 9, 10, 'އއ', 'Ari Atholhu Uthuruburi'], ['ADh', 'Alif Dhaal', 'Mahibadhoo', 3.68, 72.85, 'coast', 9, 7, 'އދ', 'Ari Atholhu Dhekunuburi'],
      ['V', 'Vaavu', 'Felidhoo', 3.5, 73.5, 'coast', 8, 7, 'ވ', 'Felidhu Atholhu'], ['F', 'Faafu', 'Nilandhoo', 3.2, 72.92, 'coast', 7, 6, 'ފ', 'Nilandhe Atholhu Uthuruburi'],
      ['M', 'Meemu', 'Muli', 2.95, 73.55, 'coast', 6, 8, 'މ', 'Mulaku Atholhu'], ['Dh', 'Dhaalu', 'Kudahuvadhoo', 2.82, 72.92, 'coast', 7, 6, 'ދ', 'Nilandhe Atholhu Dhekunuburi'],
      ['Th', 'Thaa', 'Veymandoo', 2.38, 73.12, 'farm', 11, 9, 'ތ', 'Kolhumadulu'], ['L', 'Laamu', 'Fonadhoo', 1.9, 73.42, 'farm', 7, 10, 'ލ', 'Hadhdhunmathi'],
      ['GA', 'Gaafu Alif', 'Viligili', 0.65, 73.28, 'farm', 13, 8, 'ގއ', 'Huvadhu Atholhu Uthuruburi'], ['GDh', 'Gaafu Dhaalu', 'Thinadhoo', 0.38, 73.05, 'farm', 13, 8, 'ގދ', 'Huvadhu Atholhu Dhekunuburi'],
      ['Gn', 'Gnaviyani', 'Fuvahmulah', -0.3, 73.42, 'high', 3, 4, 'ޏ', 'Fuvahmulah'], ['S', 'Seenu (Addu)', 'Hithadhoo', -0.63, 73.15, 'high', 8, 6, 'ސ', 'Addu Atholhu'],
    ],
    // official cities (Thinadhoo became the fifth city in 2023) + Hulhumalé
    cities: [
      ['Maalé', 4.175, 73.51, 'Capital city · about 212,000 people in Malé City (2022 census)', 'capital'],
      ['Hulhumalé', 4.215, 73.54, 'Reclaimed island, part of Malé City', 'capital'],
      ['Addu City', -0.6, 73.08, 'Second-largest city · about 25,000 people', 'high', 'L'],
      ['Fuvahmulah City', -0.3, 73.42, 'A one-island atoll and city · about 9,000 people', 'high'],
      ['Kulhudhuffushi City', 6.62, 73.07, 'Capital of Haa Dhaalu Atoll · about 10,000 people', 'north'],
      ['Thinadhoo City', 0.53, 73.0, 'Capital of Gaafu Dhaalu Atoll · city since 2023', 'farm', 'L'],
    ],
    geo: ll => [Math.round(140 + (ll[1] - 72.6) * 120), Math.round(15 + (7.1 - ll[0]) * 35)] },
  { id: 'kz', name: 'Kazakhstan', flag: '🇰🇿', system: 'presidential', title: 'President', termYears: 7, termLimit: 1,
    seats: 98, parl: 'Mazhilis', pop: 20.4, gdp: 306, debt: 24.6, rate: .015, landlocked: false, infra: 48,
    stats: { economy: 58, health: 55, education: 60, security: 55, environment: 44, freedom: 60, housing: 50 }, mil: { army: 35, air: 25, navy: 10 },
    note: 'One single 7-year presidential term. Ports only on the Caspian Sea.',
    regions: {
      capital: _r('Astana & Akmola', 'Astana', 'Astana', 12, 'capital', false, [.25, .22, .08, .30, .15], 'The modern capital on the steppe.'),
      north: _r('North & East (Karaganda, Pavlodar, East Kazakhstan)', 'North-East', 'Karaganda', 25, 'industry', false, [.45, .06, .14, .15, .20], 'Coal, steel and metals — the industrial heartland.'),
      coast: _r('West (Atyrau, Mangystau, Aktobe)', 'West', 'Aktau', 15, 'desert', true, [.42, .10, .08, .25, .15], 'Oil and gas on the Caspian Sea.'),
      farm: _r('South (Shymkent, Turkistan, Zhambyl, Kyzylorda)', 'South', 'Shymkent', 27, 'farm', false, [.25, .05, .32, .25, .13], 'Young, fast-growing and agricultural.'),
      high: _r('Almaty city & region', 'Almaty', 'Almaty', 21, 'mountain', false, [.25, .20, .10, .30, .15], 'The largest city, business hub, under the Tian Shan mountains.'),
    } },
  { id: 'tr', name: 'Türkiye', flag: '🇹🇷', system: 'presidential', title: 'President', termYears: 5, termLimit: 2,
    seats: 600, parl: 'Grand National Assembly', pop: 86, gdp: 1603, debt: 22.5, rate: .03, landlocked: false, infra: 60,
    stats: { economy: 55, health: 62, education: 56, security: 55, environment: 50, freedom: 60, housing: 46 }, mil: { army: 60, air: 50, navy: 45 },
    note: '5-year presidential terms, two-term limit.',
    regions: {
      capital: _r('Central Anatolia', 'Central', 'Ankara', 15, 'capital', false, [.28, .15, .17, .25, .15], 'Ankara, the capital, on the Anatolian plateau.'),
      north: _r('Marmara', 'Marmara', 'Istanbul', 31, 'industry', true, [.38, .17, .03, .27, .15], 'Istanbul and Bursa — industry, finance and the Bosphorus.'),
      coast: _r('Aegean & Mediterranean', 'Aegean', 'İzmir', 25, 'coast', true, [.28, .12, .18, .24, .18], 'Ports, tourism and olive groves.'),
      farm: _r('Black Sea', 'Black Sea', 'Samsun', 10, 'farm', true, [.20, .05, .35, .18, .22], 'Tea, hazelnuts and green hills.'),
      high: _r('Eastern & Southeastern Anatolia', 'East', 'Diyarbakır', 19, 'mountain', false, [.25, .05, .30, .30, .10], 'Mountains, rivers and a very young population.'),
    } },
  { id: 'us', name: 'United States', flag: '🇺🇸', system: 'presidential', title: 'President', termYears: 4, termLimit: 2,
    seats: 435, parl: 'House of Representatives', pop: 342, gdp: 30861, debt: 126.8, rate: .017, landlocked: false, infra: 78,
    stats: { economy: 58, health: 64, education: 70, security: 55, environment: 52, freedom: 60, housing: 48 }, mil: { army: 70, air: 85, navy: 85 },
    note: '4-year presidential terms, two-term limit. Real electoral college has 538 votes; here regions are grouped.',
    regions: {
      capital: _r('Northeast & D.C.', 'Northeast', 'Washington', 17, 'capital', true, [.25, .22, .03, .27, .23], 'Washington, New York and Boston — politics and finance.'),
      north: _r('Midwest', 'Midwest', 'Chicago', 21, 'industry', false, [.38, .10, .14, .20, .18], 'Factories and farms of the heartland.'),
      coast: _r('Pacific Coast', 'Pacific', 'Los Angeles', 16, 'coast', true, [.25, .20, .06, .32, .17], 'California tech, Hollywood and Pacific ports.'),
      farm: _r('South', 'South', 'Houston', 38, 'farm', true, [.30, .14, .12, .26, .18], 'The biggest and fastest-growing region.'),
      high: _r('Mountain West', 'Mountain', 'Denver', 8, 'mountain', false, [.27, .13, .15, .27, .18], 'Rockies, deserts and booming cities.'),
    } },
  { id: 'uk', name: 'United Kingdom', flag: '🇬🇧', system: 'parliamentary', title: 'Prime Minister', termYears: 5, termLimit: 0,
    seats: 650, parl: 'House of Commons', pop: 69.5, gdp: 4012, debt: 102, rate: .015, landlocked: false, infra: 72,
    stats: { economy: 50, health: 70, education: 72, security: 55, environment: 60, freedom: 60, housing: 40 }, mil: { army: 45, air: 50, navy: 55 },
    note: 'Parliamentary system — elections at least every 5 years, no term limit (game ends after 3 terms).',
    regions: {
      capital: _r('London', 'London', 'London', 13, 'capital', true, [.25, .25, .01, .32, .17], 'The capital and a global finance centre.'),
      north: _r('North of England', 'North', 'Manchester', 23, 'industry', true, [.40, .08, .05, .25, .22], 'Former industrial heartland of Manchester, Leeds and Newcastle.'),
      coast: _r('South of England & Wales', 'South', 'Bristol', 27, 'coast', true, [.27, .15, .08, .23, .27], 'Ports, coasts and commuter towns.'),
      farm: _r('Midlands & East', 'Midlands', 'Birmingham', 26, 'farm', true, [.34, .10, .12, .24, .20], 'Birmingham, manufacturing and East Anglian farms.'),
      high: _r('Scotland & Northern Ireland', 'Scotland & NI', 'Edinburgh', 11, 'mountain', true, [.30, .10, .10, .25, .25], 'Highlands, whisky and North Sea energy.'),
    } },
  { id: 'de', name: 'Germany', flag: '🇩🇪', system: 'parliamentary', title: 'Chancellor', termYears: 4, termLimit: 0,
    seats: 630, parl: 'Bundestag', pop: 83.5, gdp: 5116, debt: 64.6, rate: .012, landlocked: false, infra: 78,
    stats: { economy: 46, health: 72, education: 72, security: 55, environment: 62, freedom: 60, housing: 50 }, mil: { army: 40, air: 40, navy: 30 },
    note: 'Parliamentary system — the Chancellor is chosen by the Bundestag; no term limit (game ends after 3 terms).',
    regions: {
      capital: _r('Berlin & the East', 'Berlin & East', 'Berlin', 18, 'capital', false, [.30, .14, .06, .24, .26], 'Berlin, Saxony, Brandenburg and Thuringia.'),
      north: _r('North Rhine-Westphalia', 'NRW', 'Cologne', 22, 'industry', false, [.40, .15, .03, .22, .20], 'The Ruhr — Germany\'s most populous state and industrial core.'),
      coast: _r('Northern Germany', 'North', 'Hamburg', 18, 'coast', true, [.30, .15, .10, .21, .24], 'Hamburg, Bremen and the North and Baltic Sea coasts.'),
      farm: _r('Southwest & Centre', 'Southwest', 'Frankfurt', 26, 'farm', false, [.32, .20, .08, .21, .19], 'Frankfurt finance, car makers and wine country.'),
      high: _r('Bavaria', 'Bavaria', 'Munich', 16, 'mountain', false, [.30, .18, .10, .22, .20], 'Munich, the Alps and high-tech industry.'),
    } },
  { id: 'fr', name: 'France', flag: '🇫🇷', system: 'presidential', title: 'President', termYears: 5, termLimit: 2,
    seats: 577, parl: 'National Assembly', pop: 68.6, gdp: 3383, debt: 118.5, rate: .015, landlocked: false, infra: 75,
    stats: { economy: 48, health: 74, education: 68, security: 55, environment: 64, freedom: 60, housing: 50 }, mil: { army: 50, air: 55, navy: 55 },
    note: '5-year presidential terms, two consecutive terms maximum.',
    regions: {
      capital: _r('Île-de-France', 'Paris', 'Paris', 18, 'capital', false, [.25, .25, .01, .32, .17], 'Paris and its suburbs.'),
      north: _r('North & East', 'North-East', 'Lille', 21, 'industry', true, [.38, .10, .12, .20, .20], 'Lille, Strasbourg and old industrial basins.'),
      coast: _r('West & Atlantic', 'West', 'Bordeaux', 29, 'coast', true, [.27, .12, .16, .20, .25], 'Brittany, Normandy, the Loire and Bordeaux.'),
      farm: _r('Occitanie', 'South-West', 'Toulouse', 11, 'farm', true, [.25, .12, .20, .22, .21], 'Toulouse aerospace, vineyards and farms.'),
      high: _r('South-East & the Alps', 'South-East', 'Lyon', 21, 'mountain', true, [.30, .15, .08, .24, .23], 'Lyon, Marseille and the Alps.'),
    } },
  { id: 'jp', name: 'Japan', flag: '🇯🇵', system: 'parliamentary', title: 'Prime Minister', termYears: 4, termLimit: 0,
    seats: 465, parl: 'House of Representatives', pop: 123.3, gdp: 4453, debt: 199.4, rate: .005, landlocked: false, infra: 85,
    stats: { economy: 48, health: 82, education: 76, security: 55, environment: 60, freedom: 60, housing: 60 }, mil: { army: 40, air: 50, navy: 60 },
    note: 'Very high debt but very low interest rates. Parliamentary system, no term limit (game ends after 3 terms).',
    regions: {
      capital: _r('Kantō', 'Kantō', 'Tokyo', 35, 'capital', true, [.28, .22, .02, .24, .24], 'Tokyo and Yokohama — the world\'s largest metro area.'),
      north: _r('Tōhoku & Hokkaidō', 'North', 'Sapporo', 11, 'mountain', true, [.24, .07, .22, .15, .32], 'Snowy north, rice, fishing and an ageing population.'),
      coast: _r('Kansai', 'Kansai', 'Osaka', 17, 'coast', true, [.32, .16, .04, .20, .28], 'Osaka, Kyoto and Kobe.'),
      farm: _r('Western Japan (Kyūshū, Chūgoku, Shikoku)', 'West', 'Fukuoka', 20, 'farm', true, [.28, .10, .16, .18, .28], 'Fukuoka, Hiroshima and island farms.'),
      high: _r('Chūbu', 'Chūbu', 'Nagoya', 17, 'industry', true, [.38, .14, .08, .18, .22], 'Nagoya car industry and the Japanese Alps.'),
    } },
  { id: 'in', name: 'India', flag: '🇮🇳', system: 'parliamentary', title: 'Prime Minister', termYears: 5, termLimit: 0,
    seats: 543, parl: 'Lok Sabha', pop: 1464, gdp: 3909, debt: 83.1, rate: .02, landlocked: false, infra: 42,
    stats: { economy: 64, health: 46, education: 46, security: 55, environment: 34, freedom: 60, housing: 40 }, mil: { army: 65, air: 55, navy: 50 },
    note: 'Parliamentary system, 5-year Lok Sabha terms, no term limit (game ends after 3 terms).',
    regions: {
      capital: _r('North (Delhi, Uttar Pradesh, Punjab, Haryana)', 'North', 'New Delhi', 24, 'capital', false, [.28, .10, .28, .24, .10], 'Delhi and the Gangetic plain.'),
      north: _r('East & Northeast', 'East', 'Kolkata', 26, 'farm', true, [.28, .07, .35, .22, .08], 'Bihar, West Bengal, Odisha and the Northeast.'),
      coast: _r('West (Maharashtra, Gujarat, Goa)', 'West', 'Mumbai', 15, 'coast', true, [.34, .18, .18, .20, .10], 'Mumbai finance, Gujarat industry and big ports.'),
      farm: _r('Central (Madhya Pradesh, Rajasthan, Chhattisgarh)', 'Central', 'Jaipur', 14, 'desert', false, [.24, .06, .42, .20, .08], 'Farms, forests and the Thar desert.'),
      high: _r('South (Karnataka, Tamil Nadu, Andhra, Telangana, Kerala)', 'South', 'Bengaluru', 21, 'industry', true, [.34, .16, .18, .20, .12], 'Tech hubs, factories and ports.'),
    } },
  { id: 'br', name: 'Brazil', flag: '🇧🇷', system: 'presidential', title: 'President', termYears: 4, termLimit: 2,
    seats: 513, parl: 'Chamber of Deputies', pop: 213, gdp: 2280, debt: 97, rate: .025, landlocked: false, infra: 52,
    stats: { economy: 50, health: 56, education: 50, security: 55, environment: 56, freedom: 60, housing: 44 }, mil: { army: 40, air: 30, navy: 35 },
    note: '4-year presidential terms, two consecutive terms maximum. High interest rates.',
    regions: {
      capital: _r('Centre-West', 'Centre-West', 'Brasília', 8, 'capital', false, [.22, .14, .28, .24, .12], 'Brasília and the soy and cattle frontier.'),
      north: _r('Southeast', 'Southeast', 'São Paulo', 42, 'industry', true, [.36, .18, .05, .24, .17], 'São Paulo and Rio — the economic engine.'),
      coast: _r('Northeast', 'Northeast', 'Salvador', 27, 'coast', true, [.30, .07, .25, .25, .13], 'Beaches, sugar cane and a young population.'),
      farm: _r('South', 'South', 'Porto Alegre', 15, 'farm', true, [.30, .12, .22, .18, .18], 'Farms, wine and industry.'),
      high: _r('North (Amazon)', 'Amazon', 'Manaus', 8, 'jungle', true, [.28, .06, .30, .28, .08], 'The Amazon rainforest and Manaus free-trade zone.'),
    } },
];
const VELORIA_REGIONS = REGIONS.map(r => ({ ...r, mix: { ...r.mix } }));
