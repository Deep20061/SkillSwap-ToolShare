// Browse-related screens: Home (marketplace), Search/Browse, Map.

// ── Marketplace Home (logged in) ─────────────────────────────────────
function HomeScreen({ tweaks }) {
  const nav = useNav();
  const featured = LISTINGS.slice(0, 6);
  const nearMe = [...LISTINGS].sort((a, b) => a.distance - b.distance).slice(0, 4);
  const skills = LISTINGS.filter((l) => l.kind === 'skill').slice(0, 4);
  const tools = LISTINGS.filter((l) => l.kind === 'tool').slice(0, 4);
  const recent = [LISTINGS[3], LISTINGS[7], LISTINGS[9]];

  return (
    <Page wide>
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-line bg-surface mb-10">
        <div className="relative grid lg:grid-cols-[1.05fr_0.95fr] gap-0 items-stretch">
          {/* Left — text */}
          <div className="p-6 md:p-10 lg:p-14 flex flex-col justify-center">
            <Badge tone="brand" className="mb-5 self-start">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulseDot" />
              {tweaks.loggedIn ? `Welcome back, ${ME.name.split(' ')[0]}` : 'Community exchange · Portugal'}
            </Badge>
            <h1 className="text-3xl md:text-[44px] lg:text-[52px] font-extrabold tracking-tight text-ink leading-[1.02] mb-4">
              {tweaks.loggedIn ? <>What will you swap <span className="text-brand-600">today?</span></> :
              <>Your talent. Their tools. <span className="text-brand-600">Zero euros.</span></>}
            </h1>
            <p className="text-[15px] md:text-base text-ink2 max-w-md leading-relaxed mb-6">
              Borrow a drill from your neighbour. Trade an hour of Spanish for an hour of shelving.
              SkillSwap matches you with verified neighbours who have what you need.
            </p>
            <div className="flex flex-wrap gap-2">
              <Btn onClick={() => nav.go('browse', { kind: 'skill' })} variant="primary" size="lg" icon={<I.Hand size={16} />}>Find a skill</Btn>
              <Btn onClick={() => nav.go('browse', { kind: 'tool' })} variant="secondary" size="lg" icon={<I.Tools size={16} />}>Borrow a tool</Btn>
              <Btn onClick={() => nav.go('map')} variant="ghost" size="lg" icon={<I.Map size={16} />}>Map view</Btn>
            </div>

            {/* Inline community proof */}
            <div className="flex items-center gap-3 mt-8 pt-6 border-t border-line">
              <div className="flex -space-x-2">
                {USERS.slice(0, 4).map(u => (
                  <Avatar key={u.id} user={u} size={32} className="ring-2 ring-surface"/>
                ))}
                <div className="w-8 h-8 rounded-full bg-sunken border-2 border-surface text-[10px] font-bold text-ink2 inline-flex items-center justify-center">
                  +2.4k
                </div>
              </div>
              <div className="text-xs text-ink2 leading-tight">
                <span className="font-semibold text-ink">2,418 neighbours</span> swapping in Braga
                <div className="flex items-center gap-1 mt-0.5">
                  <Stars rating={4.87} size={10}/>
                  <span className="text-ink3">4.87 · 12k+ swaps completed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right — hero photo with overlaid people cards */}
          <div className="relative min-h-[320px] lg:min-h-[520px] bg-gradient-to-br from-amber-200 to-amber-400 overflow-hidden">
            {/* Stripe pattern for placeholder feel */}
            <div className="absolute inset-0 stripe-ph opacity-30" />
            {/* Placeholder label */}
            <span className="absolute top-3 left-3 text-[10px] font-mono uppercase tracking-wider text-ink2 bg-white/85 backdrop-blur px-1.5 py-0.5 rounded">
              hero photo · neighbours swapping
            </span>

            {/* Diagonal gradient for legibility */}
            <div className="absolute inset-0 bg-gradient-to-tl from-black/10 via-transparent to-transparent"/>

            {/* Floating community chip — top right */}
            <div className="hidden md:flex absolute top-5 right-5 items-center gap-2.5 bg-surface/95 backdrop-blur rounded-full pl-1.5 pr-4 py-1.5 border border-line shadow-card">
              <Avatar user={USERS[3]} size={32}/>
              <div className="text-[11px] leading-tight">
                <div className="font-semibold text-ink">{USERS[3].name}</div>
                <div className="text-ink3">offered carpentry · 12 min ago</div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulseDot"/>
            </div>

            {/* Mini map chip — bottom right */}
            <button
              onClick={() => nav.go('map')}
              className="hidden md:flex absolute bottom-5 right-5 bg-surface/95 backdrop-blur rounded-2xl border border-line shadow-pop overflow-hidden text-left items-stretch hover:border-line2">
              <div className="relative w-24 h-20 map-grid">
                {PINS.slice(0, 5).map(p => (
                  <span key={p.id} className={cx('absolute -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full ring-2',
                    p.kind === 'skill' ? 'bg-violet-500 ring-violet-200/60' : 'bg-amber-500 ring-amber-200/60'
                  )} style={{ left: `${p.x}%`, top: `${p.y}%` }}/>
                ))}
              </div>
              <div className="px-3.5 py-2.5">
                <div className="text-[10px] font-mono uppercase tracking-wider text-brand-600">Near you</div>
                <div className="text-sm font-semibold text-ink whitespace-nowrap">{PINS.length} listings · 5 km</div>
                <div className="text-[11px] text-brand-600 mt-0.5 flex items-center gap-0.5">Open map <I.ArrowR size={11}/></div>
              </div>
            </button>

            {/* Floating swap card — bottom left */}
            <div className="hidden md:flex absolute bottom-5 left-5 max-w-[280px] bg-surface/95 backdrop-blur rounded-xl border border-line shadow-card p-3 items-center gap-3">
              <div className="flex -space-x-2 flex-shrink-0">
                <Avatar user={USERS[0]} size={28} className="ring-2 ring-surface"/>
                <Avatar user={USERS[2]} size={28} className="ring-2 ring-surface"/>
              </div>
              <div className="text-[11px] leading-snug text-ink2">
                <span className="font-semibold text-ink">Mariana</span> ↔ <span className="font-semibold text-ink">Beatriz</span> ·
                <span className="text-ink3"> 4h tiling for 4h Spanish</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip — replaces the 4 stat cards */}
      <section className="mb-12 grid grid-cols-3 gap-x-2 md:gap-x-6 py-4 px-2 md:px-0 border-y border-line">
        {[
          { i: <I.Shield size={18}/>, t: 'Verified profiles',  d: 'Government ID + selfie liveness',     c: 'text-emerald-600' },
          { i: <I.Doc size={18}/>,    t: 'Digital contracts',   d: 'Lightweight agreements, both sign',   c: 'text-brand-600'   },
          { i: <I.Star size={18}/>,   t: 'Two-way reviews',     d: 'Reputation built one swap at a time', c: 'text-amber-600'   },
        ].map(t => (
          <div key={t.t} className="flex items-center gap-3">
            <div className={cx('hidden sm:flex w-10 h-10 rounded-lg bg-sunken items-center justify-center', t.c)}>
              {t.i}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-ink">{t.t}</div>
              <div className="text-[11px] text-ink3 leading-snug">{t.d}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Categories */}
      <SectionHead kicker="Browse by category" title="What are you looking for?" />
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-12">
        {CATEGORIES.slice(0, 12).map((c) => {
          const Ic = CAT_ICON[c.icon];
          return (
            <button key={c.id} onClick={() => nav.go('browse', { cat: c.id })}
            className="group bg-surface border border-line rounded-xl p-4 hover:border-brand-300 hover:bg-brand-50/40 dark:hover:bg-brand-100/30 transition-colors text-left">
              <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 inline-flex items-center justify-center mb-3 group-hover:bg-brand-100">
                <Ic size={18} />
              </div>
              <div className="text-sm font-semibold text-ink leading-tight">{c.label}</div>
              <div className="text-[11px] text-ink3 mt-0.5">{c.count.toLocaleString()} listings</div>
            </button>);

        })}
      </div>

      {/* Continue / recent */}
      {tweaks.loggedIn &&
      <>
          <SectionHead kicker="Pick up where you left" title="Recently viewed" action={['browse']} actionLabel="Browse all" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {recent.map((l) => <ListingCard key={l.id} listing={l} style={tweaks.cardStyle} />)}
          </div>
        </>
      }

      {/* Near you */}
      <SectionHead kicker="In your neighbourhood" title="Near you" icon={<I.Pin size={20} />} action={['map']} actionLabel="Open map" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {nearMe.map((l) => <ListingCard key={l.id} listing={l} style={tweaks.cardStyle} />)}
      </div>

      {/* Skills row */}
      <SectionHead kicker="Time-for-time" title="Trending skills" icon={<I.Hand size={20} />} action={['browse', { kind: 'skill' }]} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {skills.map((l) => <ListingCard key={l.id} listing={l} style={tweaks.cardStyle} />)}
      </div>

      {/* Tools row */}
      <SectionHead kicker="Borrow, don't buy" title="Tools to borrow" icon={<I.Tools size={20} />} action={['browse', { kind: 'tool' }]} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {tools.map((l) => <ListingCard key={l.id} listing={l} style={tweaks.cardStyle} />)}
      </div>

      {/* How it works */}
      <section className="rounded-2xl bg-surface border border-line p-6 md:p-10 mb-12">
        <SectionHead kicker="No money, no friction" title="How an exchange works" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          {[
          { n: '01', t: 'Post or browse', d: 'List a skill or tool, or browse what neighbours have.', i: <I.Plus size={18} /> },
          { n: '02', t: 'Match & chat', d: 'Find a fair trade and message them in-app.', i: <I.Msg size={18} /> },
          { n: '03', t: 'Sign the contract', d: 'Lightweight digital agreement — both parties sign.', i: <I.Doc size={18} /> },
          { n: '04', t: 'Swap & review', d: 'Make the exchange and rate the experience.', i: <I.Star size={18} /> }].
          map((s) =>
          <div key={s.n} className="relative rounded-xl border border-line bg-sunken p-5">
              <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-brand-600 mb-3">Step {s.n}</div>
              <div className="w-10 h-10 rounded-lg bg-surface border border-line inline-flex items-center justify-center text-brand-600 mb-3">{s.i}</div>
              <div className="text-base font-bold tracking-tight text-ink mb-1">{s.t}</div>
              <div className="text-xs text-ink2 leading-relaxed">{s.d}</div>
            </div>
          )}
        </div>
      </section>

      {/* Become host CTA */}
      <section className="rounded-2xl bg-ink text-surface p-8 md:p-12 grid md:grid-cols-2 gap-6 items-center">
        <div>
          <Badge tone="brand" className="mb-3">Become a host</Badge>
          <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Got a skill? Got a drill?</h3>
          <p className="text-sm text-white/70 max-w-md leading-relaxed">
            Posting takes 3 minutes. Set your own terms, accept or decline trades, build a reputation in your neighbourhood.
          </p>
        </div>
        <div className="flex md:justify-end gap-2">
          <Btn onClick={() => nav.go('new')} variant="primary" size="lg" icon={<I.Plus size={16} />}>Post a listing</Btn>
          <Btn onClick={() => nav.go('how')} size="lg" className="!bg-white/10 !text-white hover:!bg-white/15 border border-white/10">Learn more</Btn>
        </div>
      </section>
    </Page>);

}

// ── Search / Browse screen ──────────────────────────────────────────
function BrowseScreen({ tweaks, params }) {
  const nav = useNav();
  const [view, setView] = useState('grid'); // grid | list
  const [sort, setSort] = useState('relevance');
  const [openFilters, setOpenFilters] = useState(true);

  const [kind, setKind] = useState(params.kind || 'all');
  const [cat, setCat] = useState(params.cat || 'all');
  const [verified, setVerified] = useState(false);
  const [maxDist, setMaxDist] = useState(10);
  const [q, setQ] = useState(params.q || '');

  useEffect(() => {setKind(params.kind || 'all');setCat(params.cat || 'all');setQ(params.q || '');}, [params.kind, params.cat, params.q]);

  const filtered = useMemo(() => {
    return LISTINGS.filter((l) => {
      if (kind !== 'all' && l.kind !== kind) return false;
      if (cat !== 'all' && l.cat !== cat) return false;
      if (verified && !findUser(l.ownerId).verified) return false;
      if (l.distance > maxDist) return false;
      if (q && !`${l.title} ${l.desc} ${l.tags.join(' ')}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [kind, cat, verified, maxDist, q]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sort === 'distance') arr.sort((a, b) => a.distance - b.distance);
    if (sort === 'recent') arr.sort((a, b) => b.views - a.views); // proxy
    if (sort === 'rating') arr.sort((a, b) => findUser(b.ownerId).rating - findUser(a.ownerId).rating);
    return arr;
  }, [filtered, sort]);

  const catName = CATEGORIES.find((c) => c.id === cat)?.label;

  return (
    <Page wide>
      {/* Header strip */}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-brand-600 mb-1">Marketplace</div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-ink">
            {kind === 'skill' ? 'Skills to swap' : kind === 'tool' ? 'Tools to borrow' : 'All listings'}
            {catName && <span className="text-ink3 font-normal"> · {catName}</span>}
          </h1>
          <div className="text-sm text-ink2 mt-1">
            {sorted.length} result{sorted.length === 1 ? '' : 's'} {q && <>for "<span className="text-ink">{q}</span>"</>} near <span className="font-medium text-ink">Braga</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1 rounded-md border border-line bg-surface p-1">
            <button onClick={() => setView('grid')} className={cx('h-7 w-7 inline-flex items-center justify-center rounded', view === 'grid' ? 'bg-sunken text-ink' : 'text-ink3 hover:text-ink')}><I.Grid size={14} /></button>
            <button onClick={() => setView('list')} className={cx('h-7 w-7 inline-flex items-center justify-center rounded', view === 'list' ? 'bg-sunken text-ink' : 'text-ink3 hover:text-ink')}><I.List size={14} /></button>
          </div>
          <div className="relative">
            <select value={sort} onChange={(e) => setSort(e.target.value)}
            className="h-9 pl-3 pr-8 rounded-md border border-line bg-surface text-sm text-ink appearance-none cursor-pointer">
              <option value="relevance">Sort: Relevance</option>
              <option value="distance">Sort: Closest</option>
              <option value="recent">Sort: Most viewed</option>
              <option value="rating">Sort: Top-rated host</option>
            </select>
            <I.ChevDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-ink3 pointer-events-none" />
          </div>
          <Btn onClick={() => nav.go('map')} className="hidden md:inline-flex" variant="secondary" size="sm" icon={<I.Map size={14} />}>Map</Btn>
          <Btn onClick={() => setOpenFilters((v) => !v)} className="md:hidden" variant="secondary" size="sm" icon={<I.Filter size={14} />}>Filters</Btn>
        </div>
      </div>

      <div className="grid md:grid-cols-[260px_minmax(0,1fr)] gap-6">
        {/* Filters sidebar */}
        <aside className={cx('md:sticky md:top-32 self-start space-y-5', !openFilters && 'hidden md:block')}>
          <FilterCard title="Type">
            {[
            { v: 'all', l: 'All listings', n: LISTINGS.length },
            { v: 'skill', l: 'Skills', n: LISTINGS.filter((x) => x.kind === 'skill').length },
            { v: 'tool', l: 'Tools', n: LISTINGS.filter((x) => x.kind === 'tool').length }].
            map((o) =>
            <label key={o.v} className="flex items-center gap-2 text-sm py-1 cursor-pointer">
                <input type="radio" name="kind" checked={kind === o.v} onChange={() => setKind(o.v)} className="accent-brand-600" />
                <span className="flex-1 text-ink2">{o.l}</span>
                <span className="text-xs text-ink3 font-mono">{o.n}</span>
              </label>
            )}
          </FilterCard>

          <FilterCard title="Category">
            <label className="flex items-center gap-2 text-sm py-1 cursor-pointer">
              <input type="radio" name="cat" checked={cat === 'all'} onChange={() => setCat('all')} className="accent-brand-600" />
              <span className="text-ink2">All categories</span>
            </label>
            {CATEGORIES.map((c) =>
            <label key={c.id} className="flex items-center gap-2 text-sm py-1 cursor-pointer">
                <input type="radio" name="cat" checked={cat === c.id} onChange={() => setCat(c.id)} className="accent-brand-600" />
                <span className="flex-1 text-ink2">{c.label}</span>
                <span className="text-xs text-ink3 font-mono">{c.count}</span>
              </label>
            )}
          </FilterCard>

          <FilterCard title="Distance">
            <div className="text-sm text-ink2 mb-2">Within <span className="font-semibold text-ink">{maxDist} km</span></div>
            <input type="range" min="1" max="20" value={maxDist} onChange={(e) => setMaxDist(+e.target.value)}
            className="w-full accent-brand-600" />
            <div className="flex justify-between text-[10px] text-ink3 font-mono mt-1">
              <span>1km</span><span>10km</span><span>20km</span>
            </div>
          </FilterCard>

          <FilterCard title="Host">
            <label className="flex items-center gap-2 text-sm py-1 cursor-pointer">
              <input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} className="accent-brand-600 rounded" />
              <span className="flex-1 text-ink2">Verified identity</span>
              <I.Shield size={12} className="text-emerald-500" />
            </label>
            <label className="flex items-center gap-2 text-sm py-1 cursor-pointer">
              <input type="checkbox" className="accent-brand-600 rounded" />
              <span className="text-ink2">Super-host (15+ swaps)</span>
            </label>
            <label className="flex items-center gap-2 text-sm py-1 cursor-pointer">
              <input type="checkbox" className="accent-brand-600 rounded" />
              <span className="text-ink2">Available this week</span>
            </label>
          </FilterCard>

          <FilterCard title="Skill level" subtitle="(skills only)">
            {['Beginner', 'Intermediate', 'Expert'].map((lv) =>
            <label key={lv} className="flex items-center gap-2 text-sm py-1 cursor-pointer">
                <input type="checkbox" className="accent-brand-600 rounded" />
                <span className="text-ink2">{lv}</span>
              </label>
            )}
          </FilterCard>

          <FilterCard title="Deposit (tools)">
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Min €" />
              <Input placeholder="Max €" />
            </div>
          </FilterCard>

          <button onClick={() => {setKind('all');setCat('all');setVerified(false);setMaxDist(10);setQ('');}}
          className="text-sm text-ink2 hover:text-ink underline underline-offset-2">
            Reset all filters
          </button>
        </aside>

        {/* Results */}
        <div className="min-w-0">
          {sorted.length === 0 ?
          <div className="text-center py-20 bg-surface border border-dashed border-line rounded-xl">
              <I.Search size={28} className="mx-auto text-ink3 mb-3" />
              <h3 className="text-lg font-bold text-ink mb-1">No matches</h3>
              <p className="text-sm text-ink2 max-w-xs mx-auto">Try widening your distance, removing filters, or browsing related categories.</p>
            </div> :
          view === 'grid' ?
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {sorted.map((l) => <ListingCard key={l.id} listing={l} style={tweaks.cardStyle} />)}
            </div> :

          <div className="space-y-3">
              {sorted.map((l) => <ListingRow key={l.id} listing={l} />)}
            </div>
          }

          {/* Pagination */}
          {sorted.length > 0 &&
          <div className="flex items-center justify-center gap-2 mt-10">
              <Btn variant="ghost" size="sm" icon={<I.ArrowL size={13} />}>Prev</Btn>
              {[1, 2, 3, 4, 5].map((n) =>
            <button key={n} className={cx(
              'h-8 w-8 rounded-md text-sm font-medium',
              n === 1 ? 'bg-ink text-surface' : 'text-ink2 hover:bg-sunken hover:text-ink'
            )}>{n}</button>
            )}
              <span className="text-ink3 px-1">…</span>
              <Btn variant="ghost" size="sm" iconRight={<I.ArrowR size={13} />}>Next</Btn>
            </div>
          }
        </div>
      </div>
    </Page>);

}

function FilterCard({ title, subtitle, children }) {
  return (
    <div className="bg-surface border border-line rounded-xl p-4">
      <div className="flex items-baseline justify-between mb-2">
        <h4 className="text-[11px] font-mono uppercase tracking-[0.18em] text-ink3">{title}</h4>
        {subtitle && <span className="text-[10px] text-ink3">{subtitle}</span>}
      </div>
      <div>{children}</div>
    </div>);

}

// ── Map screen (placeholder, interactive) ────────────────────────────
function MapScreen({ tweaks }) {
  const nav = useNav();
  const [active, setActive] = useState(PINS[0].id);
  const [filter, setFilter] = useState('all');

  const visible = PINS.filter((p) => filter === 'all' || p.kind === filter);
  const activeListing = findListing(active);
  const activeOwner = activeListing ? findUser(activeListing.ownerId) : null;

  return (
    <div className="w-full px-0">
      <div className="bg-surface overflow-hidden border-t border-line">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_minmax(0,1fr)] h-[calc(100vh-110px)]">
          {/* List rail */}
          <div className="border-r border-line overflow-y-auto">
            <div className="sticky top-0 z-10 bg-surface/95 backdrop-blur border-b border-line p-4">
              <div className="flex items-center gap-2 mb-3">
                <Badge tone="warn" size="sm">Map placeholder — real map coming soon</Badge>
              </div>
              <h2 className="text-lg font-bold text-ink">Map view</h2>
              <div className="text-xs text-ink3 mt-0.5">Showing {visible.length} listings within 5 km of Braga centre</div>
              <div className="flex items-center gap-1 mt-3 p-1 rounded-md bg-sunken">
                {[
                { v: 'all', l: 'All' }, { v: 'skill', l: 'Skills' }, { v: 'tool', l: 'Tools' }].
                map((o) =>
                <button key={o.v} onClick={() => setFilter(o.v)}
                className={cx('flex-1 h-7 text-xs rounded font-medium',
                filter === o.v ? 'bg-surface text-ink shadow-sm' : 'text-ink2')}>{o.l}</button>
                )}
              </div>
            </div>
            <div className="divide-y divide-line">
              {visible.map((p) => {
                const l = findListing(p.id);
                if (!l) return null;
                const o = findUser(l.ownerId);
                const isActive = active === p.id;
                return (
                  <button key={p.id} onClick={() => setActive(p.id)}
                  className={cx('w-full text-left p-4 flex gap-3 transition-colors',
                  isActive ? 'bg-brand-50/60 dark:bg-brand-100/40' : 'hover:bg-sunken')}>
                    <Photo tone={l.swatch} aspect="" className="w-16 h-16 rounded-lg flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Badge tone={l.kind === 'skill' ? 'skill' : 'tool'} size="xs">{l.kind === 'skill' ? 'Skill' : 'Tool'}</Badge>
                        <span className="text-[10px] text-ink3">{l.distance}km</span>
                      </div>
                      <div className="text-sm font-semibold text-ink line-clamp-1">{l.title}</div>
                      <div className="text-xs text-ink2 flex items-center gap-1 mt-1">
                        <Avatar user={o} size={14} /> {o.name.split(' ')[0]}
                        <span className="text-ink3 ml-0.5">· <I.StarFill size={9} className="inline text-amber-500" /> {o.rating}</span>
                      </div>
                    </div>
                  </button>);

              })}
            </div>
          </div>

          {/* Map canvas */}
          <div className="relative map-grid">
            {/* Roads sketch */}
            <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d="M0,30 Q40,28 60,34 T100,40" stroke="var(--ink-3)" strokeWidth="0.4" fill="none" />
              <path d="M20,0 Q22,40 30,55 T35,100" stroke="var(--ink-3)" strokeWidth="0.4" fill="none" />
              <path d="M0,72 Q35,70 55,78 T100,82" stroke="var(--ink-3)" strokeWidth="0.4" fill="none" />
              <path d="M65,0 Q70,30 60,55 T55,100" stroke="var(--ink-3)" strokeWidth="0.4" fill="none" />
            </svg>

            {/* Compass / controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
              <div className="bg-surface rounded-lg border border-line shadow-card overflow-hidden flex flex-col">
                <button className="h-8 w-8 hover:bg-sunken text-ink2"><I.Plus size={14} className="mx-auto" /></button>
                <div className="border-t border-line" />
                <button className="h-8 w-8 hover:bg-sunken text-ink2"><span className="block w-2 h-px bg-current mx-auto" /></button>
              </div>
              <button className="h-8 w-8 bg-surface rounded-lg border border-line shadow-card text-ink2 hover:bg-sunken inline-flex items-center justify-center"><I.Compass size={14} /></button>
              <button className="h-8 w-8 bg-surface rounded-lg border border-line shadow-card text-ink2 hover:bg-sunken inline-flex items-center justify-center"><I.Layers size={14} /></button>
            </div>

            {/* My location ring */}
            <div className="absolute -translate-x-1/2 -translate-y-1/2 left-[50%] top-[50%] z-0">
              <span className="block w-4 h-4 rounded-full bg-sky-500 ring-4 ring-sky-200/70" />
              <span className="absolute inset-0 w-4 h-4 rounded-full bg-sky-500 animate-ping opacity-40" />
            </div>

            {/* Pins */}
            {visible.map((p) => {
              const l = findListing(p.id);
              const isActive = active === p.id;
              return (
                <button key={p.id} onClick={() => setActive(p.id)}
                className="absolute -translate-x-1/2 -translate-y-full z-10 group"
                style={{ left: `${p.x}%`, top: `${p.y}%` }}>
                  <div className={cx(
                    'flex items-center gap-1.5 rounded-full pl-1 pr-3 py-1 shadow-card border transition-all',
                    isActive ? 'bg-ink text-surface border-ink scale-110' : 'bg-surface border-line hover:border-line2'
                  )}>
                    <span className={cx('w-6 h-6 rounded-full inline-flex items-center justify-center',
                    l.kind === 'skill' ? 'bg-violet-100 text-violet-700' : 'bg-amber-100 text-amber-800')}>
                      {l.kind === 'skill' ? <I.Hand size={11} /> : <I.Tools size={11} />}
                    </span>
                    <span className="text-xs font-semibold whitespace-nowrap">{p.label}</span>
                  </div>
                  <span className={cx('block mx-auto w-0 h-0 border-t-[6px] border-x-[5px] border-x-transparent',
                  isActive ? 'border-t-ink' : 'border-t-line')} />
                </button>);

            })}

            {/* Active card — anchored above the active pin */}
            {activeListing && (() => {
              const activePin = PINS.find(p => p.id === active);
              if (!activePin) return null;
              return (
                <>
                  {/* Mobile: bottom sheet */}
                  <div className="lg:hidden absolute inset-x-4 bottom-4 z-30 animate-fadein">
                    <ActiveListingCard listing={activeListing} owner={activeOwner} onView={() => nav.go('listing', { id: activeListing.id })} />
                  </div>
                  {/* Desktop: floats above the pin */}
                  <div
                    className="hidden lg:block absolute z-30 w-[360px]"
                    style={{
                      left: `${activePin.x}%`,
                      top: `${activePin.y}%`,
                      transform: 'translate(-50%, calc(-100% - 44px))',
                    }}
                  >
                    <div className="animate-fadein">
                      <ActiveListingCard listing={activeListing} owner={activeOwner} onView={() => nav.go('listing', { id: activeListing.id })} />
                      {/* Pointer pointing down to the pin */}
                      <div className="mx-auto w-0 h-0 border-t-[8px] border-x-[7px] border-x-transparent border-t-surface drop-shadow-[0_2px_2px_rgba(15,23,42,0.12)]" />
                    </div>
                  </div>
                </>
              );
            })()}

            {/* Bottom-left attribution */}
            <div className="absolute bottom-2 left-2 text-[10px] font-mono text-ink3 bg-surface/80 px-2 py-0.5 rounded backdrop-blur z-10">
              Map data · placeholder (production: MapLibre + OSM)
            </div>
          </div>
        </div>
      </div>
    </div>);

}

Object.assign(window, { HomeScreen, BrowseScreen, MapScreen });

// ── Map active listing card ──────────────────────────────────────────
function ActiveListingCard({ listing, owner, onView }) {
  return (
    <div className="bg-surface rounded-2xl border border-line shadow-pop overflow-hidden">
      <div className="flex">
        <Photo tone={listing.swatch} aspect="" className="w-28 h-28 flex-shrink-0" />
        <div className="flex-1 min-w-0 p-3.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Badge tone={listing.kind === 'skill' ? 'skill' : 'tool'} size="xs">
              {listing.kind === 'skill' ? 'Skill' : 'Tool'}
            </Badge>
            {owner.verified && <Badge tone="verified" size="xs"><I.Shield size={9} /></Badge>}
            <span className="text-[10px] text-ink3 ml-auto">{listing.distance}km</span>
          </div>
          <h4 className="text-sm font-bold text-ink leading-tight mb-1 line-clamp-2">{listing.title}</h4>
          <div className="flex items-center gap-1.5 text-xs text-ink2 mb-2">
            <Avatar user={owner} size={16}/> {owner.name.split(' ')[0]}
            <span className="text-ink3">· <I.StarFill size={9} className="inline text-amber-500" /> {owner.rating}</span>
          </div>
          <button onClick={onView}
            className="text-xs font-semibold text-brand-600 hover:underline">
            View listing →
          </button>
        </div>
      </div>
    </div>
  );
}