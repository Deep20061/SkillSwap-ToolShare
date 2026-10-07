// Mock data for SkillSwap marketplace
// Exposes everything on window.* so other Babel scripts can use them.

// ── Users ─────────────────────────────────────────────────────────────
const USERS = [
  { id: 'u1', name: 'Mariana Faria',   handle: 'mariana.f',  loc: 'Braga · Maximinos',     rating: 4.9, reviews: 47, verified: true,  joined: 'Apr 2025', avatar: 'MF', tone: 'rose'     },
  { id: 'u2', name: 'Carlos Mendes',   handle: 'carlosm',    loc: 'Porto · Cedofeita',     rating: 4.8, reviews: 31, verified: true,  joined: 'Jan 2025', avatar: 'CM', tone: 'amber'    },
  { id: 'u3', name: 'Beatriz Lopes',   handle: 'bea.lopes',  loc: 'Lisboa · Alvalade',     rating: 5.0, reviews: 22, verified: true,  joined: 'Sep 2024', avatar: 'BL', tone: 'emerald'  },
  { id: 'u4', name: 'João Pereira',    handle: 'joaop',      loc: 'Braga · São Vítor',     rating: 4.7, reviews: 18, verified: false, joined: 'Feb 2026', avatar: 'JP', tone: 'sky'      },
  { id: 'u5', name: 'Sofia Almeida',   handle: 'sofia.a',    loc: 'Braga · São Lázaro',    rating: 4.9, reviews: 64, verified: true,  joined: 'Aug 2024', avatar: 'SA', tone: 'violet'   },
  { id: 'u6', name: 'Rui Carvalho',    handle: 'rui.c',      loc: 'Guimarães · Centro',    rating: 4.6, reviews: 12, verified: false, joined: 'Mar 2026', avatar: 'RC', tone: 'orange'   },
  { id: 'u7', name: 'Inês Tavares',    handle: 'inestv',     loc: 'Braga · Real',          rating: 5.0, reviews: 39, verified: true,  joined: 'Nov 2024', avatar: 'IT', tone: 'teal'     },
  { id: 'u8', name: 'André Costa',     handle: 'andre.c',    loc: 'Braga · Nogueiró',      rating: 4.8, reviews: 27, verified: true,  joined: 'Jun 2025', avatar: 'AC', tone: 'indigo'   },
];

// ── "Me" (current user) ──────────────────────────────────────────────
const ME = {
  id: 'me', name: 'João Borges', handle: 'joaob', loc: 'Braga · São Vicente',
  rating: 4.9, reviews: 23, verified: true, joined: 'May 2025', avatar: 'JB', tone: 'sky',
  email: 'joao.borges@example.com', phone: '+351 912 345 678', bio: 'Carpenter by trade, photographer on weekends. Happy to swap an afternoon of shelves for a guitar lesson.',
};

// ── Categories ───────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'home',     label: 'Home & Repair',    icon: 'wrench',    count: 1284, kind: 'tool'  },
  { id: 'garden',   label: 'Garden & Outdoor', icon: 'leaf',      count:  612, kind: 'tool'  },
  { id: 'kitchen',  label: 'Kitchen',          icon: 'chef',      count:  248, kind: 'tool'  },
  { id: 'tech',     label: 'Tech & Coding',    icon: 'code',      count:  927, kind: 'skill' },
  { id: 'music',    label: 'Music',            icon: 'music',     count:  411, kind: 'skill' },
  { id: 'lang',     label: 'Languages',        icon: 'globe',     count:  338, kind: 'skill' },
  { id: 'fitness',  label: 'Fitness & Sport',  icon: 'dumbbell',  count:  192, kind: 'skill' },
  { id: 'art',      label: 'Art & Craft',      icon: 'palette',   count:  504, kind: 'skill' },
  { id: 'auto',     label: 'Auto & Bike',      icon: 'car',       count:  173, kind: 'tool'  },
  { id: 'photo',    label: 'Photo & Video',    icon: 'camera',    count:  287, kind: 'mixed' },
  { id: 'study',    label: 'Tutoring',         icon: 'book',      count:  364, kind: 'skill' },
  { id: 'event',    label: 'Events & Party',   icon: 'sparkles',  count:   88, kind: 'tool'  },
];

// ── Listings ─────────────────────────────────────────────────────────
// Mix of SKILL_OFFER + TOOL_LISTING. Image fields use stripe-ph placeholder.
const LISTINGS = [
  { id: 'l1',  kind: 'tool',  ownerId: 'u2', title: 'Bosch GSB 18V cordless hammer drill', cat: 'home',    catLabel: 'Home & Repair', tags: ['drill','bosch','18V','battery'],
    desc: 'Brushless hammer drill with two 4Ah batteries, charger and 21-piece bit set. Used once a month at most — great for tile, masonry and wood.',
    condition: 'Like new', maxDays: 7, deposit: 60, hours: null, level: null, distance: 1.4, posted: '2 days ago', views: 142, swatch: 'amber' },
  { id: 'l2',  kind: 'skill', ownerId: 'u3', title: 'Conversational Spanish — beginner to B1', cat: 'lang', catLabel: 'Languages', tags: ['spanish','language','conversation'],
    desc: 'Madrid-born, 8 years tutoring. Casual conversation lessons, 60 min sessions, your place or a café. Trade for help with my React/Next.js side project.',
    condition: null, maxDays: null, deposit: null, hours: 1, level: 'Expert', distance: 0.6, posted: '4 hours ago', views: 89, swatch: 'emerald' },
  { id: 'l3',  kind: 'tool',  ownerId: 'u5', title: 'KitchenAid Artisan stand mixer (5qt)', cat: 'kitchen', catLabel: 'Kitchen', tags: ['mixer','baking','kitchen'],
    desc: 'Cherry red, with whisk, paddle and dough hook. Cleaned after every use. Pickup only, weekends preferred.',
    condition: 'Excellent', maxDays: 3, deposit: 40, hours: null, level: null, distance: 2.1, posted: '1 day ago', views: 56, swatch: 'rose' },
  { id: 'l4',  kind: 'skill', ownerId: 'u1', title: 'Bathroom tiling & grout repair',         cat: 'home', catLabel: 'Home & Repair', tags: ['tiling','bathroom','repair','grout'],
    desc: '12 years on the tools. I tile, I grout, I do the messy bit. One afternoon per job typically. Trade for guitar lessons (my daughter is 9).',
    condition: null, maxDays: null, deposit: null, hours: 4, level: 'Expert', distance: 3.4, posted: '6 hours ago', views: 211, swatch: 'sky' },
  { id: 'l5',  kind: 'tool',  ownerId: 'u4', title: 'Makita track saw + 1.4m guide rail',     cat: 'home', catLabel: 'Home & Repair', tags: ['saw','makita','track','woodworking'],
    desc: 'Plunge cut, dust port, two extra blades (fine + general). Rail bag included. Returning user discount on the deposit.',
    condition: 'Good', maxDays: 5, deposit: 80, hours: null, level: null, distance: 0.9, posted: '3 days ago', views: 73, swatch: 'amber' },
  { id: 'l6',  kind: 'skill', ownerId: 'u7', title: 'Guitar lessons — acoustic, classical',   cat: 'music', catLabel: 'Music', tags: ['guitar','music','lessons','acoustic'],
    desc: 'Conservatory-trained, 6 years teaching kids and adults. 45 min sessions. Looking for a carpenter to help me hang some shelves.',
    condition: null, maxDays: null, deposit: null, hours: 1, level: 'Expert', distance: 1.1, posted: 'Yesterday', views: 168, swatch: 'violet' },
  { id: 'l7',  kind: 'tool',  ownerId: 'u8', title: 'Mountain bike — Trek Marlin 7, size M',  cat: 'auto', catLabel: 'Auto & Bike', tags: ['bike','mountain','trek'],
    desc: 'Recently serviced. Comes with helmet, two water bottles and a small repair kit. Great for the Gerês trails.',
    condition: 'Good', maxDays: 14, deposit: 100, hours: null, level: null, distance: 1.8, posted: '5 days ago', views: 304, swatch: 'indigo' },
  { id: 'l8',  kind: 'skill', ownerId: 'u6', title: 'React & Next.js mentoring (1:1)',         cat: 'tech', catLabel: 'Tech & Coding', tags: ['react','next.js','coding','mentor'],
    desc: 'Senior dev, 9 yoe. Pair-programming, code review, architecture chat. Remote OK. Will trade for anything home-cooked and Portuguese.',
    condition: null, maxDays: null, deposit: null, hours: 2, level: 'Expert', distance: 4.2, posted: '12 hours ago', views: 92, swatch: 'orange' },
  { id: 'l9',  kind: 'tool',  ownerId: 'u1', title: 'DJI Mini 3 Pro drone + 3 batteries',     cat: 'photo', catLabel: 'Photo & Video', tags: ['drone','dji','4k','photo'],
    desc: '4K HDR video, vertical shooting, smart controller included. Includes a hard case and ND filter set. Pilot certificate appreciated.',
    condition: 'Like new', maxDays: 4, deposit: 120, hours: null, level: null, distance: 2.6, posted: '1 week ago', views: 421, swatch: 'rose' },
  { id: 'l10', kind: 'skill', ownerId: 'u5', title: 'Sourdough baking — half-day workshop',    cat: 'kitchen', catLabel: 'Kitchen', tags: ['baking','sourdough','bread','workshop'],
    desc: 'You leave with a live starter, two loaves and the technique. 4 hours, my kitchen. Trade for some honest gardening help.',
    condition: null, maxDays: null, deposit: null, hours: 4, level: 'Intermediate', distance: 2.1, posted: '2 days ago', views: 135, swatch: 'violet' },
  { id: 'l11', kind: 'tool',  ownerId: 'u3', title: 'Pressure washer — Kärcher K5',           cat: 'garden', catLabel: 'Garden & Outdoor', tags: ['cleaning','karcher','pressure','outdoor'],
    desc: 'Patios, driveways, garden furniture, the car. 20m hose, two nozzles. Bring your own detergent please.',
    condition: 'Excellent', maxDays: 2, deposit: 35, hours: null, level: null, distance: 0.3, posted: '3 hours ago', views: 67, swatch: 'emerald' },
  { id: 'l12', kind: 'skill', ownerId: 'u8', title: 'Yoga & breathwork — private',             cat: 'fitness', catLabel: 'Fitness & Sport', tags: ['yoga','breathwork','wellness'],
    desc: 'Vinyasa-leaning. Beginner-friendly. Bring a mat or borrow mine. 75 min. Trade for help around the apartment or some web stuff.',
    condition: null, maxDays: null, deposit: null, hours: 1, level: 'Expert', distance: 3.1, posted: '6 days ago', views: 78, swatch: 'indigo' },
];

// ── Conversations / messages ─────────────────────────────────────────
const CONVERSATIONS = [
  {
    id: 'c1', userId: 'u1', listingId: 'l4', unread: 2, lastAt: '2m',
    pinned: true, contractState: 'proposed',
    messages: [
      { from: 'u1', t: '10:14', text: 'Hi João! Saw you have shelving skills. I do tiling and grout repair — fair trade?' },
      { from: 'me', t: '10:16', text: 'That actually works perfectly. My kitchen needs a backsplash redone.' },
      { from: 'u1', t: '10:17', text: 'Send me a couple of photos and the size and I can quote you the hours.' },
      { from: 'me', t: '10:32', text: 'Done — uploaded 3 photos. About 1.6m wide, 60cm tall.', attach: { kind: 'images', count: 3 } },
      { from: 'u1', t: '10:34', text: 'Drafted a contract — 4 hours tiling vs. 4 hours shelving. Same Saturday OK?', attach: { kind: 'contract', id: 'x1' } },
    ],
  },
  {
    id: 'c2', userId: 'u2', listingId: 'l1', unread: 0, lastAt: '1h',
    contractState: 'active',
    messages: [
      { from: 'u2', t: 'Mon 09:02', text: 'Pickup at 4? I leave the drill with the porter if you\'re late.' },
      { from: 'me', t: 'Mon 09:04', text: 'Perfect, see you at 4.' },
    ],
  },
  {
    id: 'c3', userId: 'u3', listingId: 'l2', unread: 0, lastAt: '3h',
    contractState: 'pending-review',
    messages: [
      { from: 'u3', t: 'Tue 18:40', text: 'How did Tuesday go? You can leave a review now if you\'re ready.' },
    ],
  },
  {
    id: 'c4', userId: 'u5', listingId: 'l10', unread: 1, lastAt: '1d',
    contractState: null,
    messages: [
      { from: 'u5', t: 'Yesterday', text: 'I could trade the workshop for help in the garden — 4 hours each?' },
    ],
  },
  {
    id: 'c5', userId: 'u8', listingId: 'l7', unread: 0, lastAt: '3d',
    contractState: 'completed',
    messages: [
      { from: 'u8', t: 'Last Thu', text: 'Hope the trail was fun. Bike came back in perfect shape, deposit released.' },
    ],
  },
];

// ── Exchanges / contracts ────────────────────────────────────────────
const EXCHANGES = [
  { id: 'x1', counterpartyId: 'u1', listingId: 'l4', state: 'proposed', kind: 'skill',
    terms: '4h tiling ↔ 4h shelving', date: 'Sat 18 May · 14:00', deposit: 0 },
  { id: 'x2', counterpartyId: 'u2', listingId: 'l1', state: 'active',   kind: 'tool',
    terms: 'Borrow drill for 5 days', date: 'Mon 13 → Fri 17 May', deposit: 60 },
  { id: 'x3', counterpartyId: 'u3', listingId: 'l2', state: 'review',   kind: 'skill',
    terms: '1h Spanish ↔ 1h React mentoring', date: 'Tue 7 May · 19:00', deposit: 0 },
  { id: 'x4', counterpartyId: 'u8', listingId: 'l7', state: 'completed', kind: 'tool',
    terms: 'Bike, weekend rental', date: '2–4 May', deposit: 100, myRating: 5, theirRating: 5 },
  { id: 'x5', counterpartyId: 'u6', listingId: 'l8', state: 'cancelled', kind: 'skill',
    terms: '2h React mentoring', date: 'Cancelled 28 Apr', deposit: 0 },
];

// ── Notifications ────────────────────────────────────────────────────
const NOTIFICATIONS = [
  { id: 'n1', kind: 'contract',  userId: 'u1', t: '2m',  text: 'sent you a contract for', target: '4h shelving ↔ 4h tiling', unread: true  },
  { id: 'n2', kind: 'message',   userId: 'u5', t: '1h',  text: 'replied in', target: 'Sourdough workshop', unread: true  },
  { id: 'n3', kind: 'review',    userId: 'u8', t: '3h',  text: 'left you a 5-star review for', target: 'Trek Marlin rental', unread: true  },
  { id: 'n4', kind: 'request',   userId: 'u4', t: '5h',  text: 'wants to borrow', target: 'Bosch hammer drill', unread: false },
  { id: 'n5', kind: 'system',    userId: null, t: 'Yesterday', text: 'Identity verification approved', target: '— you\'re now Verified ', unread: false },
  { id: 'n6', kind: 'message',   userId: 'u3', t: 'Tue',   text: 'asked for a review for', target: 'Conversational Spanish', unread: false },
  { id: 'n7', kind: 'reminder',  userId: null, t: 'Mon',   text: 'Return reminder:', target: 'Bosch drill due Friday', unread: false },
];

// ── Reviews ──────────────────────────────────────────────────────────
const REVIEWS = [
  { id: 'r1', byId: 'u8', rating: 5, t: '3d',  text: 'João showed up on time, fixed two cabinets that had been driving me mad for months, and left no mess. Would swap again without hesitation.', exchange: '4h carpentry ↔ weekend bike rental' },
  { id: 'r2', byId: 'u3', rating: 5, t: '2w',  text: 'Clear communicator and patient. Great trade partner — the Spanish-for-shelves swap worked out for both of us.', exchange: '1h Spanish ↔ 1h shelving' },
  { id: 'r3', byId: 'u5', rating: 5, t: '1mo', text: 'Helped me move three IKEA pieces in an evening, all assembled correctly. Came back the next week to fix the wonky door, on his own initiative.', exchange: 'IKEA assembly ↔ sourdough workshop' },
  { id: 'r4', byId: 'u2', rating: 4, t: '2mo', text: 'Solid work on the deck. Slightly later than agreed but warned me in advance. Tools returned in good shape.', exchange: 'Deck repair ↔ drill rental' },
];

// ── Map pins ─────────────────────────────────────────────────────────
const PINS = [
  { id: 'l4',  x: 32, y: 38, kind: 'skill', label: 'Tiling' },
  { id: 'l1',  x: 58, y: 28, kind: 'tool',  label: 'Drill' },
  { id: 'l6',  x: 42, y: 55, kind: 'skill', label: 'Guitar' },
  { id: 'l11', x: 26, y: 62, kind: 'tool',  label: 'Pressure washer' },
  { id: 'l3',  x: 68, y: 48, kind: 'tool',  label: 'Mixer' },
  { id: 'l8',  x: 78, y: 36, kind: 'skill', label: 'React' },
  { id: 'l10', x: 50, y: 72, kind: 'skill', label: 'Sourdough' },
  { id: 'l2',  x: 18, y: 30, kind: 'skill', label: 'Spanish' },
  { id: 'l7',  x: 62, y: 65, kind: 'tool',  label: 'Bike' },
  { id: 'l5',  x: 84, y: 58, kind: 'tool',  label: 'Track saw' },
  { id: 'l9',  x: 36, y: 22, kind: 'tool',  label: 'Drone' },
  { id: 'l12', x: 72, y: 78, kind: 'skill', label: 'Yoga' },
];

// ── Tone helpers (avatar/swatch colors) ──────────────────────────────
const TONE = {
  rose:    { bg: 'bg-rose-100',    fg: 'text-rose-700',    ring: 'ring-rose-200',    block: 'bg-rose-200',    bar: 'from-rose-200 to-rose-400'    },
  amber:   { bg: 'bg-amber-100',   fg: 'text-amber-800',   ring: 'ring-amber-200',   block: 'bg-amber-200',   bar: 'from-amber-200 to-amber-400'   },
  emerald: { bg: 'bg-emerald-100', fg: 'text-emerald-800', ring: 'ring-emerald-200', block: 'bg-emerald-200', bar: 'from-emerald-200 to-emerald-400' },
  sky:     { bg: 'bg-sky-100',     fg: 'text-sky-800',     ring: 'ring-sky-200',     block: 'bg-sky-200',     bar: 'from-sky-200 to-sky-400'     },
  violet:  { bg: 'bg-violet-100',  fg: 'text-violet-800',  ring: 'ring-violet-200',  block: 'bg-violet-200',  bar: 'from-violet-200 to-violet-400'  },
  orange:  { bg: 'bg-orange-100',  fg: 'text-orange-800',  ring: 'ring-orange-200',  block: 'bg-orange-200',  bar: 'from-orange-200 to-orange-400'  },
  teal:    { bg: 'bg-teal-100',    fg: 'text-teal-800',    ring: 'ring-teal-200',    block: 'bg-teal-200',    bar: 'from-teal-200 to-teal-400'    },
  indigo:  { bg: 'bg-indigo-100',  fg: 'text-indigo-800',  ring: 'ring-indigo-200',  block: 'bg-indigo-200',  bar: 'from-indigo-200 to-indigo-400'  },
};

const findUser    = (id) => id === 'me' ? ME : USERS.find(u => u.id === id);
const findListing = (id) => LISTINGS.find(l => l.id === id);

Object.assign(window, {
  USERS, ME, CATEGORIES, LISTINGS, CONVERSATIONS, EXCHANGES, NOTIFICATIONS, REVIEWS, PINS, TONE,
  findUser, findListing,
});
