/* ============================================================
   LOCAL FLAVOUR — every country has its own society, economy
   and problems. India has millions of small farmers and farmer
   protests; the Maldives has fishers, resort workers, island
   councils and the sea. This file renames the voter groups and
   adds each country's own events to the event deck (and removes
   generic events that make no sense there, such as earthquakes
   or a land border in the Maldives).
   Events are simplified game scenarios based on real issues.
   ============================================================ */

const LOCAL = {
  mv: {
    groups: { farmers: { name: 'Fishers & islanders', icon: '🎣' }, workers: { name: 'Resort & port workers', icon: '🛎️' } },
    skip: ['strike', 'flood', 'oil', 'drought', 'fires', 'quake', 'border', 'refugees', 'space', 'olympics'],
    events: [
      { id: 'mv_tuna', icon: '🎣', title: 'Fishers: tuna prices have collapsed',
        text: 'Pole-and-line fishers say exporters now pay far less per kilo of skipjack tuna, while fuel and ice cost more. Boats in the atolls are staying in harbour.',
        choices: [
          { t: 'Guarantee a minimum purchase price through the state fish company', fx: { g: { farmers: 10 }, cost: 1.2, s: { economy: -1 } }, news: 'Government guarantees fishers a minimum tuna price' },
          { t: 'Fuel subsidy for registered fishing vessels', fx: { g: { farmers: 6 }, cost: .7 }, news: 'Fuel subsidy for fishing vessels announced' },
          { t: 'Help them reach new export markets (slower)', fx: { g: { farmers: 2, business: 3 }, cost: .2, s: { economy: 1 } }, news: 'Trade mission to promote Maldivian tuna abroad' },
        ] },
      { id: 'mv_resort', icon: '🛎️', title: 'Resort workers demand their service charge',
        text: 'Staff at several resorts say owners are keeping part of the service charge that guests pay and are cutting days off. Unions threaten a walkout in peak season.',
        choices: [
          { t: 'Enforce the law: the full service charge goes to staff', fx: { g: { workers: 10, business: -6 } }, news: 'Labour inspectors told to enforce service-charge rules' },
          { t: 'Bring owners and unions to the table', fx: { g: { workers: 4, business: 1 }, pc: -1 }, news: 'Tourism minister mediates between resorts and unions' },
          { t: 'Stay out of it — tourism must not stop', fx: { g: { workers: -8, business: 5 }, s: { freedom: -2 } }, news: 'Government refuses to intervene in resort dispute' },
        ] },
      { id: 'mv_housing', icon: '🏢', title: 'Malé families cannot find homes',
        text: 'Thousands of families live in tiny, crowded rented rooms in Malé. The latest social housing flat ballot had far more applicants than flats.',
        choices: [
          { t: 'Build more flats in Hulhumalé', fx: { g: { youth: 6, workers: 4 }, s: { housing: 6 }, cost: 2 }, news: 'New social housing towers planned for Hulhumalé' },
          { t: 'Rent support for low-income families', fx: { g: { workers: 5, elderly: 3 }, cost: 1 }, news: 'Rent support scheme opens for Malé families' },
          { t: 'Develop regional cities so people need not move to Malé', fx: { g: { farmers: 5, youth: 2 }, s: { economy: 1 }, cost: 1.5 }, news: 'Regional development plan to ease pressure on Malé' },
        ] },
      { id: 'mv_udha', icon: '🌊', title: 'Swell waves flood island homes',
        text: 'High swell waves (udha) have flooded homes and wells on several islands. Salt water has spoiled drinking water and gardens.',
        choices: [
          { t: 'Emergency water, repairs and sea defences', fx: { g: { farmers: 8, elderly: 3 }, s: { environment: 2 }, cost: 1.5 }, news: 'Emergency relief for flooded islands' },
          { t: 'Ask international climate funds for help', fx: { g: { farmers: 3 }, cost: .3 }, news: 'Maldives appeals for climate adaptation finance' },
          { t: 'Leave it to the island councils', fx: { g: { farmers: -8, elderly: -4 } }, news: 'Islanders angry at slow response to flooding' },
        ] },
      { id: 'mv_coral', icon: '🪸', title: 'Coral bleaching on the reefs',
        text: 'Warm seas are bleaching coral across the atolls. Reefs protect islands from waves and bring the divers that resorts rely on.',
        choices: [
          { t: 'Create new marine protected areas', fx: { s: { environment: 6 }, g: { farmers: -3, youth: 3 } }, news: 'New marine protected areas declared' },
          { t: 'Fund reef restoration and monitoring', fx: { s: { environment: 3 }, cost: .5, g: { business: 2 } }, news: 'Reef restoration programme launched' },
          { t: 'Nothing we can do about global warming', fx: { s: { environment: -3 }, g: { youth: -5 } }, news: 'Government shrugs off coral bleaching' },
        ] },
      { id: 'mv_expat', icon: '🧱', title: 'Migrant workers crowded into unsafe rooms',
        text: 'Inspectors find construction workers from abroad sleeping 15 to a room in Malé, some unpaid for months, with passports held by employers.',
        choices: [
          { t: 'Crack down on abusive employers and build worker dormitories', fx: { s: { freedom: 3, health: 2 }, g: { business: -4 }, cost: .8 }, news: 'Crackdown on illegal treatment of migrant workers' },
          { t: 'Register and regularise undocumented workers', fx: { s: { freedom: 2, economy: 1 }, g: { business: 2, workers: -3 } }, news: 'Amnesty to register undocumented migrant workers' },
          { t: 'Deport undocumented workers', fx: { g: { workers: 3, business: -5 }, s: { freedom: -4, economy: -1 } }, news: 'Mass deportations of undocumented workers' },
        ] },
      { id: 'mv_harbour', icon: '⚓', title: 'Island council wants a new harbour',
        text: 'An island council says its old harbour is too shallow for ferries and fishing boats. Every island near it is asking for the same.',
        choices: [
          { t: 'Build it — islands need harbours', fx: { g: { farmers: 8 }, cost: .8 }, news: 'New harbour promised for outer island' },
          { t: 'Build one regional harbour for several islands', fx: { g: { farmers: 3 }, cost: .4, s: { economy: 1 } }, news: 'Regional harbour plan shared by island councils' },
          { t: 'Not this year', fx: { g: { farmers: -5 } }, news: 'Island harbour request rejected' },
        ] },
      { id: 'mv_waste', icon: '🔥', title: 'Fire at the Thilafushi waste site',
        text: 'Smoke from burning rubbish on Thilafushi drifts over Malé. Doctors warn about breathing problems and the waste keeps piling up.',
        choices: [
          { t: 'Speed up proper waste management', fx: { s: { environment: 5, health: 2 }, cost: 1 }, news: 'Waste management plan for Greater Malé accelerated' },
          { t: 'Put out the fire and move on', fx: { s: { environment: -2 }, cost: .1 }, news: 'Thilafushi fire put out, problem remains' },
        ] },
      { id: 'mv_water', icon: '💧', title: 'Desalination plant breaks down',
        text: 'A breakdown at a desalination plant leaves part of Malé without tap water. Queues form for bottled water.',
        choices: [
          { t: 'Airlift water and fund a backup plant', fx: { g: { elderly: 4, workers: 3 }, s: { health: 2 }, cost: 1 }, news: 'Emergency water supply and backup plant funded' },
          { t: 'Ask friendly countries to send water', fx: { g: { elderly: 2 }, cost: .2 }, news: 'Foreign navies deliver drinking water' },
        ] },
    ],
  },
  in: {
    groups: { farmers: { name: 'Farmers (kisan)', icon: '🌾' } },
    skip: [],
    events: [
      { id: 'in_kisan', icon: '🚜', title: 'Farmers march towards Delhi',
        text: 'Tens of thousands of farmers on tractors are camped at the capital\'s borders. They want a legal guarantee of a minimum support price (MSP) for their crops.',
        choices: [
          { t: 'Give MSP a legal guarantee', fx: { g: { farmers: 14, business: -4 }, cost: 2.5 }, news: 'Government gives legal backing to minimum support prices' },
          { t: 'Form a committee with farmer unions', fx: { g: { farmers: 4 }, pc: -1 }, news: 'Talks committee formed with farmer unions' },
          { t: 'Barricade the highways', fx: { g: { farmers: -14, youth: -3 }, s: { freedom: -5, security: 2 } }, news: 'Police block farmers at capital borders' },
        ] },
      { id: 'in_monsoon', icon: '🌧️', title: 'The monsoon has failed',
        text: 'Rainfall is far below normal. Reservoirs are low, crops are wilting and food prices are starting to climb.',
        choices: [
          { t: 'Drought relief and crop insurance payouts', fx: { g: { farmers: 9 }, cost: 2 }, news: 'Drought relief package for farmers' },
          { t: 'Extra work days under the rural jobs scheme', fx: { g: { farmers: 5, workers: 3 }, cost: 1.2 }, news: 'Rural job guarantee expanded in drought districts' },
          { t: 'Wait for next season', fx: { g: { farmers: -9 }, s: { economy: -2 } }, news: 'Anger in villages over drought response' },
        ] },
      { id: 'in_onion', icon: '🧅', title: 'Onion prices triple',
        text: 'Bad harvests have sent onion and tomato prices soaring. Families are angry, but farmers finally earn more.',
        choices: [
          { t: 'Ban onion exports', fx: { g: { workers: 4, elderly: 3, farmers: -7 } }, news: 'Onion exports banned to cool prices' },
          { t: 'Sell from government buffer stocks', fx: { g: { workers: 3, elderly: 2 }, cost: .5 }, news: 'Cheap onions sold from government stocks' },
          { t: 'Let prices work', fx: { g: { farmers: 4, workers: -5, elderly: -4 } }, news: 'Government will not interfere in vegetable prices' },
        ] },
      { id: 'in_cyclone', icon: '🌀', title: 'Cyclone heading for the east coast',
        text: 'A severe cyclone will make landfall in two days. Millions live in its path.',
        choices: [
          { t: 'Evacuate early to cyclone shelters', fx: { g: { farmers: 5, elderly: 5 }, s: { security: 2 }, cost: 1 }, news: 'Mass evacuation saves lives as cyclone hits' },
          { t: 'Issue warnings only', fx: { g: { elderly: -6, farmers: -4 }, s: { health: -3 } }, news: 'Cyclone death toll criticised' },
        ] },
    ],
  },
  uz: {
    groups: { farmers: { name: 'Cotton & fruit farmers', icon: '🌾' } },
    skip: ['flood'],
    events: [
      { id: 'uz_cotton', icon: '☁️', title: 'Cotton harvest under the spotlight',
        text: 'International monitors check that no one is forced to pick cotton. Some district bosses want to send teachers and doctors to the fields "just this once".',
        choices: [
          { t: 'Forbid it and pay pickers fair wages', fx: { s: { freedom: 4 }, g: { farmers: -3, workers: 3 }, cost: .5 }, news: 'Forced labour in cotton fields banned again' },
          { t: 'Let the districts decide', fx: { s: { freedom: -6 }, g: { farmers: 3 } }, news: 'Reports of teachers sent to cotton fields' },
        ] },
      { id: 'uz_gas', icon: '🔥', title: 'Winter gas and power cuts',
        text: 'A cold snap has left towns without gas and electricity. Families burn whatever they can to keep warm.',
        choices: [
          { t: 'Import emergency gas and fix the grid', fx: { g: { elderly: 6, workers: 3 }, cost: 1.5 }, news: 'Emergency gas imports and grid repairs' },
          { t: 'Ration supply and promise reform', fx: { g: { elderly: -4 }, s: { economy: -1 } }, news: 'Gas rationing announced' },
        ] },
      { id: 'uz_aral', icon: '🏜️', title: 'Salt storms from the dried Aral Sea',
        text: 'Dust and salt from the dried-up Aral Sea bed blow over Karakalpakstan, harming health and farmland.',
        choices: [
          { t: 'Plant saxaul forests on the sea bed', fx: { s: { environment: 5, health: 1 }, cost: .7 }, news: 'Forests planted on the former Aral Sea bed' },
          { t: 'Water-saving irrigation upstream', fx: { s: { environment: 3 }, g: { farmers: -2 }, cost: .5 }, news: 'Drip irrigation programme launched' },
        ] },
    ],
  },
  kz: {
    groups: { farmers: { name: 'Grain farmers & herders', icon: '🐎' } },
    skip: [],
    events: [
      { id: 'kz_lpg', icon: '⛽', title: 'Car-gas price doubles overnight',
        text: 'Liquefied gas for cars has doubled in price after controls were lifted. Protests start in the oil towns of the west.',
        choices: [
          { t: 'Bring back the price cap', fx: { g: { workers: 7, business: -3 }, cost: 1 }, news: 'Price cap on car gas restored' },
          { t: 'Meet the protesters and target help to the poor', fx: { g: { workers: 4 }, cost: .5, pc: -1 }, news: 'Government meets protesters in the west' },
          { t: 'Declare a state of emergency', fx: { g: { workers: -10, youth: -6 }, s: { freedom: -8, security: 3 } }, news: 'State of emergency declared amid fuel protests' },
        ] },
      { id: 'kz_flood', icon: '🌊', title: 'Spring snowmelt floods',
        text: 'Fast-melting snow has flooded villages along the steppe rivers. Thousands have left their homes.',
        choices: [
          { t: 'Full relief and rebuild', fx: { g: { farmers: 7, elderly: 3 }, cost: 2 }, news: 'Flood victims promised new homes' },
          { t: 'Relief only', fx: { g: { farmers: 2 }, cost: .7 }, news: 'Emergency relief for flooded villages' },
        ] },
      { id: 'kz_oil', icon: '🛢️', title: 'Oil price slump',
        text: 'World oil prices have fallen sharply. Oil pays for much of the budget.',
        choices: [
          { t: 'Draw on the National Fund', fx: { cost: 1.5, s: { economy: 1 } }, news: 'National Fund used to cushion oil slump' },
          { t: 'Cut spending', fx: { g: { workers: -4, elderly: -3 }, cost: -1 }, news: 'Spending cuts as oil revenue falls' },
        ] },
    ],
  },
  tr: {
    groups: {},
    skip: [],
    events: [
      { id: 'tr_quake', icon: '🏚️', title: 'Experts warn: buildings not earthquake-safe',
        text: 'Engineers say millions of homes were built without following earthquake rules. A big quake near a major city is expected one day.',
        choices: [
          { t: 'Pay to strengthen or rebuild risky homes', fx: { s: { housing: 4, security: 3 }, cost: 2.5, g: { business: 3 } }, news: 'Huge urban renewal programme for quake safety' },
          { t: 'End "building amnesties" and enforce codes', fx: { s: { security: 3 }, g: { business: -5 } }, news: 'Building amnesties ended' },
          { t: 'Postpone — too expensive', fx: { s: { security: -3 }, g: { elderly: -3 } }, news: 'Quake safety plan postponed' },
        ] },
      { id: 'tr_lira', icon: '💱', title: 'The lira is falling',
        text: 'Prices are rising fast and people are swapping lira savings for dollars and gold.',
        choices: [
          { t: 'Back the central bank raising rates', fx: { g: { business: -4 }, s: { economy: 2 } }, news: 'Government backs higher interest rates' },
          { t: 'Pressure the bank to keep rates low', fx: { g: { business: 3 }, s: { economy: -4 } }, news: 'Lira slides as rates are held down' },
        ] },
    ],
  },
  us: {
    groups: { farmers: { name: 'Farmers & ranchers', icon: '🤠' } },
    skip: ['border'],
    events: [
      { id: 'us_hurricane', icon: '🌀', title: 'Hurricane hits the Gulf Coast',
        text: 'A powerful hurricane has flooded cities and cut power to millions.',
        choices: [
          { t: 'Federal disaster declaration and full aid', fx: { g: { workers: 4, elderly: 4 }, cost: 2 }, news: 'Federal aid flows to hurricane zone' },
          { t: 'Let states lead', fx: { g: { elderly: -4 } }, news: 'Criticism of slow hurricane response' },
        ] },
      { id: 'us_shutdown', icon: '🏛️', title: 'Government shutdown looms',
        text: 'Congress has not passed the budget. Without a deal, many federal workers go unpaid.',
        choices: [
          { t: 'Compromise with the other party', fx: { pc: -2, g: { workers: 3 } }, news: 'Shutdown averted by last-minute deal' },
          { t: 'Hold firm', fx: { g: { workers: -5 }, s: { economy: -2 } }, news: 'Federal government shuts down' },
        ] },
    ],
  },
  uk: {
    groups: {},
    skip: ['quake', 'border'],
    events: [
      { id: 'uk_nhs', icon: '🩺', title: 'Junior doctors strike',
        text: 'Junior doctors walk out over pay. NHS waiting lists are already at record levels.',
        choices: [
          { t: 'Offer a pay rise', fx: { s: { health: 3 }, cost: 1, g: { workers: 3 } }, news: 'Doctors accept improved pay offer' },
          { t: 'Hold the line on pay', fx: { s: { health: -4 }, g: { elderly: -4 } }, news: 'Strike continues, operations cancelled' },
        ] },
      { id: 'uk_energy', icon: '💡', title: 'Energy bills soar',
        text: 'Gas prices have jumped and household energy bills will rise sharply this winter.',
        choices: [
          { t: 'Cap bills and pay suppliers the difference', fx: { g: { elderly: 6, workers: 4 }, cost: 2 }, news: 'Energy price guarantee announced' },
          { t: 'Targeted help for the poorest', fx: { g: { elderly: 3 }, cost: .8 }, news: 'Cost-of-living payments for poorest households' },
        ] },
    ],
  },
  de: {
    groups: {},
    skip: ['quake'],
    events: [
      { id: 'de_auto', icon: '🚗', title: 'Car industry cuts jobs',
        text: 'Carmakers are struggling with the shift to electric cars and competition from abroad. Thousands of factory jobs are at risk.',
        choices: [
          { t: 'Short-time work and EV subsidies', fx: { g: { workers: 6, business: 3 }, cost: 1.5 }, news: 'Support for car workers and electric cars' },
          { t: 'Retrain workers for new industries', fx: { g: { workers: 2 }, s: { education: 2 }, cost: .8 }, news: 'Retraining fund for car workers' },
        ] },
      { id: 'de_rail', icon: '🚆', title: 'Trains are late, again',
        text: 'Only about two-thirds of long-distance trains arrive on time. Bridges and tracks need decades of repairs.',
        choices: [
          { t: 'Huge rail renovation fund', fx: { s: { economy: 2 }, cost: 2, g: { workers: 2 } }, news: 'Billions for rail renovation' },
          { t: 'Blame the rail company', fx: { g: { workers: -2 } }, news: 'Government criticises rail operator' },
        ] },
    ],
  },
  fr: {
    groups: { farmers: { name: 'Farmers (agriculteurs)', icon: '🚜' } },
    skip: ['quake'],
    events: [
      { id: 'fr_pension', icon: '🪧', title: 'General strike against pension reform',
        text: 'Unions call a national strike against raising the retirement age. Trains and refineries stop.',
        choices: [
          { t: 'Withdraw the reform', fx: { g: { workers: 8, elderly: 4, business: -5 }, cost: 1 }, news: 'Pension reform withdrawn after strikes' },
          { t: 'Push it through without a vote', fx: { g: { workers: -8, youth: -4 }, s: { freedom: -3 }, cost: -1, pc: -2 }, news: 'Reform forced through, protests grow' },
        ] },
      { id: 'fr_farm', icon: '🚜', title: 'Farmers block the motorways',
        text: 'Farmers dump hay and manure on motorways, protesting low prices, red tape and cheap imports.',
        choices: [
          { t: 'Cut red tape and fuel taxes for farmers', fx: { g: { farmers: 9 }, s: { environment: -3 }, cost: .7 }, news: 'Concessions for farmers end blockades' },
          { t: 'Clear the roads', fx: { g: { farmers: -9 }, s: { security: 1 } }, news: 'Police clear farmer blockades' },
        ] },
    ],
  },
  jp: {
    groups: { farmers: { name: 'Rural towns', icon: '🏘️' } },
    skip: ['refugees', 'border'],
    events: [
      { id: 'jp_village', icon: '🏚️', title: 'Villages are emptying',
        text: 'Young people leave for Tokyo and millions of houses stand empty in the countryside.',
        choices: [
          { t: 'Cash for families who move to rural areas', fx: { g: { farmers: 6, youth: 2 }, cost: 1 }, news: 'Relocation grants for rural Japan' },
          { t: 'Merge services into regional hubs', fx: { g: { farmers: -3, elderly: -2 }, cost: -.5 }, news: 'Rural services merged into hubs' },
        ] },
      { id: 'jp_care', icon: '🧓', title: 'Not enough care workers',
        text: 'The elderly population keeps growing and care homes cannot find staff.',
        choices: [
          { t: 'Raise care pay and admit foreign care workers', fx: { g: { elderly: 6 }, s: { health: 2 }, cost: 1 }, news: 'Care workers to get raises and visas' },
          { t: 'Fund care robots', fx: { g: { elderly: 2, business: 3 }, cost: .7 }, news: 'Robots to help in care homes' },
        ] },
    ],
  },
  br: {
    groups: { farmers: { name: 'Agribusiness & farmers', icon: '🐄' } },
    skip: ['quake'],
    events: [
      { id: 'br_amazon', icon: '🌳', title: 'Deforestation in the Amazon jumps',
        text: 'Satellites show forest clearing for cattle and soy is rising. Other countries threaten to stop buying.',
        choices: [
          { t: 'Send environmental police and block illegal land claims', fx: { s: { environment: 7 }, g: { farmers: -6 } }, news: 'Crackdown on illegal deforestation' },
          { t: 'Pay farmers to keep the forest standing', fx: { s: { environment: 4 }, g: { farmers: 2 }, cost: .8 }, news: 'Payments for protecting forest' },
          { t: 'Development comes first', fx: { s: { environment: -6 }, g: { farmers: 5, youth: -4 } }, news: 'Deforestation surges' },
        ] },
      { id: 'br_hydro', icon: '💧', title: 'Drought empties hydro dams',
        text: 'Low rivers mean hydropower dams make less electricity and bills are rising.',
        choices: [
          { t: 'Run gas plants and subsidise bills', fx: { g: { workers: 3 }, s: { environment: -2 }, cost: 1 }, news: 'Gas plants switched on during drought' },
          { t: 'Campaign to save electricity', fx: { s: { economy: -1 } }, news: 'Energy-saving campaign launched' },
        ] },
    ],
  },
};

const Local = (() => {
  const base = JSON.parse(JSON.stringify(GROUPS));
  const L = () => LOCAL[(typeof COUNTRY !== 'undefined' && COUNTRY && COUNTRY.id) || ''] || { groups: {}, skip: [], events: [] };
  function apply(id) {
    const o = (LOCAL[id] || {}).groups || {};
    Object.keys(GROUPS).forEach(g => Object.assign(GROUPS[g], base[g], o[g] || {}));
  }
  const events = () => [...GOV_EVENTS.filter(e => !(L().skip || []).includes(e.id)), ...(L().events || [])];
  const deckIds = () => events().map(e => e.id);
  const find = id => events().find(e => e.id === id);
  const has = deck => !(L().events || []).length || (deck || []).some(id => L().events.some(e => e.id === id));
  return { apply, deckIds, find, events, has };
})();
