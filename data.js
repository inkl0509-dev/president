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
  { id: 'capital', city: [215,128,'Veloria'], name: 'Capital District', short: 'Capital', pop: 22,
    desc: 'Universities, ministries and young professionals. Trend-setters.',
    mix: { workers: .20, business: .22, farmers: 0, youth: .38, elderly: .20 },
    pts: [[160,120],[250,105],[270,170],[190,190],[110,160]] },
  { id: 'north', city: [300,52,'Ironvale'], name: 'Industrial North', short: 'North', pop: 24,
    desc: 'Steel mills, car plants and strong unions. Jobs come first.',
    mix: { workers: .50, business: .08, farmers: .05, youth: .20, elderly: .17 },
    pts: [[150,35],[270,25],[350,60],[250,105],[160,120]] },
  { id: 'coast', city: [343,104,'Port Azure'], name: 'Coastal Ports', short: 'Coast', pop: 20,
    desc: 'Busy harbours, trade and tourism. Open to the world.',
    mix: { workers: .30, business: .15, farmers: .05, youth: .30, elderly: .20 },
    pts: [[350,60],[370,140],[340,220],[270,170],[250,105]] },
  { id: 'farm', city: [128,238,'Goldfield'], name: 'Southern Farmlands', short: 'Farmlands', pop: 18,
    desc: 'Wheat, cotton and orchards. Traditional and proud.',
    mix: { workers: .15, business: .05, farmers: .45, youth: .12, elderly: .23 },
    pts: [[70,230],[150,265],[260,270],[340,220],[270,170],[190,190],[110,160]] },
  { id: 'high', city: [78,80,'Stonecrest'], name: 'Western Highlands', short: 'Highlands', pop: 16,
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
const NEIGHBOR = 'Draskor Federation';

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
  port:     { name: 'Seaport',            icon: '⚓', cost: 6, turns: 3, max: 1, only: ['coast', 'north'], desc: 'Shipping & exports (coast only)', fx: { s: { economy: 5 }, g: { workers: 2, business: 2 } } },
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
    text: `Police arrest an agent of the ${NEIGHBOR} photographing a military base.`,
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
