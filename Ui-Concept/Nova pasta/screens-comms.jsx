// Communications screens: Messages, Notifications, Exchanges

// ── Messages screen ──────────────────────────────────────────────────
function MessagesScreen({ params }) {
  const nav = useNav();
  const initial = params.user
    ? CONVERSATIONS.find(c => c.userId === params.user)?.id || CONVERSATIONS[0].id
    : CONVERSATIONS[0].id;
  const [active, setActive] = useState(initial);
  const [draft, setDraft] = useState('');
  const conv = CONVERSATIONS.find(c => c.id === active) || CONVERSATIONS[0];
  const partner = findUser(conv.userId);
  const listing = findListing(conv.listingId);

  return (
    <div className="w-full px-0 text-[13px]">
      <div className="bg-surface overflow-hidden border-t border-line">
        <div className="grid grid-cols-1 md:grid-cols-[260px_minmax(0,1fr)] lg:grid-cols-[280px_minmax(0,1fr)_280px] h-[calc(100vh-110px)]">

          {/* Conversation list */}
          <aside className="border-r border-line overflow-y-auto">
            <div className="sticky top-0 bg-surface/95 backdrop-blur border-b border-line px-3 py-2.5 z-10">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-[15px] font-bold text-ink">Messages</h2>
                <button className="h-6 w-6 rounded text-ink3 hover:bg-sunken hover:text-ink inline-flex items-center justify-center"><I.Edit size={13}/></button>
              </div>
              <Input icon={<I.Search size={13}/>} placeholder="Search…" className="!h-8 !text-[12px]"/>
              <div className="flex items-center gap-0.5 mt-2">
                {['All','Unread','Active','Archived'].map((l, i) => (
                  <button key={l} className={cx('h-6 px-2 text-[11px] rounded',
                    i === 0 ? 'bg-sunken text-ink font-medium' : 'text-ink2 hover:bg-sunken')}>{l}</button>
                ))}
              </div>
            </div>
            <ul>
              {CONVERSATIONS.map(c => {
                const u = findUser(c.userId);
                const last = c.messages[c.messages.length - 1];
                const isActive = c.id === active;
                return (
                  <li key={c.id}>
                    <button onClick={() => setActive(c.id)}
                      className={cx('w-full text-left px-3 py-2.5 flex gap-2.5 border-b border-line/60 transition-colors',
                        isActive ? 'bg-brand-50/60 dark:bg-brand-100/40' : 'hover:bg-sunken')}>
                      <div className="relative flex-shrink-0">
                        <Avatar user={u} size={32}/>
                        {c.unread > 0 && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-brand-600 ring-2 ring-surface"/>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={cx('text-[12.5px] truncate', c.unread > 0 ? 'font-semibold text-ink' : 'font-medium text-ink2')}>{u.name}</span>
                          <span className="text-[10px] text-ink3 flex-shrink-0 font-mono">{c.lastAt}</span>
                        </div>
                        <div className="text-[10.5px] text-ink3 truncate mb-0.5">re: {findListing(c.listingId)?.title}</div>
                        <div className="flex items-center gap-1.5">
                          <span className={cx('text-[11.5px] truncate', c.unread > 0 ? 'text-ink2' : 'text-ink3')}>
                            {last.from === 'me' && <span className="text-ink3">You: </span>}
                            {last.text}
                          </span>
                        </div>
                        {c.contractState && (
                          <div className="mt-1">
                            <ContractBadge state={c.contractState}/>
                          </div>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* Thread */}
          <main className="flex flex-col overflow-hidden">
            {/* Thread header */}
            <header className="border-b border-line px-4 py-2.5 flex items-center justify-between bg-surface/95 backdrop-blur z-10">
              <div className="flex items-center gap-2.5 min-w-0">
                <button onClick={() => nav.go('profile', { id: partner.id })}>
                  <Avatar user={partner} size={32}/>
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-semibold text-ink">{partner.name}</span>
                    {partner.verified && <I.Shield size={11} className="text-emerald-500"/>}
                  </div>
                  <div className="text-[10.5px] text-ink3 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"/> Online · responds in &lt;2h
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                <button className="h-7 w-7 rounded text-ink3 hover:bg-sunken hover:text-ink inline-flex items-center justify-center"><I.Phone size={13}/></button>
                <button className="h-7 w-7 rounded text-ink3 hover:bg-sunken hover:text-ink inline-flex items-center justify-center"><I.Calendar size={13}/></button>
                <button className="h-7 w-7 rounded text-ink3 hover:bg-sunken hover:text-ink inline-flex items-center justify-center"><I.Dots size={13}/></button>
              </div>
            </header>

            {/* Listing context strip */}
            <div className="border-b border-line px-4 py-2 bg-sunken flex items-center gap-2.5">
              <Photo tone={listing.swatch} aspect="" className="w-7 h-7 rounded flex-shrink-0"/>
              <div className="flex-1 min-w-0">
                <div className="text-[9.5px] font-mono uppercase tracking-wider text-ink3">Discussing</div>
                <button onClick={() => nav.go('listing', { id: listing.id })} className="text-[12.5px] font-semibold text-ink hover:text-brand-600 truncate block text-left">{listing.title}</button>
              </div>
              <Badge tone={listing.kind === 'skill' ? 'skill' : 'tool'} size="xs">{listing.kind === 'skill' ? 'Skill' : 'Tool'}</Badge>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 md:px-5 md:py-4 space-y-2.5 bg-sunken/50">
              <div className="text-center text-[10.5px] font-mono uppercase tracking-wider text-ink3">— Today —</div>
              {conv.messages.map((m, i) => (
                <MessageBubble key={i} m={m} user={m.from === 'me' ? ME : partner}/>
              ))}
              <div className="flex items-end gap-1.5">
                <Avatar user={partner} size={22}/>
                <div className="bg-surface border border-line rounded-2xl rounded-bl-md px-3 py-1.5 text-[11px] text-ink3 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-ink3 animate-pulseDot"/>
                  <span className="w-1.5 h-1.5 rounded-full bg-ink3 animate-pulseDot" style={{ animationDelay: '0.2s' }}/>
                  <span className="w-1.5 h-1.5 rounded-full bg-ink3 animate-pulseDot" style={{ animationDelay: '0.4s' }}/>
                  <span className="ml-1.5">{partner.name.split(' ')[0]} is typing…</span>
                </div>
              </div>
            </div>

            {/* Composer */}
            <div className="border-t border-line px-3 py-2.5 md:px-4 md:py-3 bg-surface">
              <div className="flex items-center gap-0.5 mb-1.5 text-ink3">
                <button className="h-7 w-7 rounded hover:bg-sunken hover:text-ink inline-flex items-center justify-center"><I.Paperclip size={13}/></button>
                <button className="h-7 w-7 rounded hover:bg-sunken hover:text-ink inline-flex items-center justify-center"><I.Image size={13}/></button>
                <button className="h-7 w-7 rounded hover:bg-sunken hover:text-ink inline-flex items-center justify-center"><I.Calendar size={13}/></button>
                <span className="mx-1 text-ink3/50">|</span>
                <button className="h-7 px-2 rounded hover:bg-sunken hover:text-ink inline-flex items-center gap-1 text-[11px] font-medium"><I.Doc size={12}/> New contract</button>
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1 bg-sunken rounded-xl border border-line">
                  <textarea
                    value={draft} onChange={e => setDraft(e.target.value)}
                    placeholder="Write a message…" rows={1}
                    className="w-full bg-transparent text-[12.5px] text-ink px-3 py-2 placeholder-ink3 resize-none focus:outline-none max-h-32"
                  />
                </div>
                <Btn variant="primary" size="sm" icon={<I.Send size={13}/>}>Send</Btn>
              </div>
              <div className="flex items-center justify-between mt-1.5 text-[9.5px] font-mono text-ink3">
                <span className="flex items-center gap-1"><I.Lock size={10}/> End-to-end encrypted · AES-256</span>
                <span>Enter to send · Shift+Enter for newline</span>
              </div>
            </div>
          </main>

          {/* Side panel — contract + actions */}
          <aside className="hidden lg:flex flex-col border-l border-line overflow-y-auto">
            <div className="px-3.5 py-3 border-b border-line">
              <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-ink3 mb-1.5">Partner</div>
              <div className="flex items-center gap-2.5 mb-2.5">
                <Avatar user={partner} size={36}/>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-ink">{partner.name}</div>
                  <div className="text-[11px] text-ink3">{partner.loc}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-center">
                <KVMini k="Rating" v={partner.rating}/>
                <KVMini k="Swaps"  v={partner.reviews}/>
                <KVMini k="Joined" v={partner.joined.split(' ')[1]}/>
              </div>
              <div className="grid grid-cols-2 gap-1.5 mt-2.5">
                <Btn variant="secondary" size="sm" onClick={() => nav.go('profile', { id: partner.id })}>Profile</Btn>
                <Btn variant="ghost" size="sm">Report</Btn>
              </div>
            </div>

            {/* Contract widget */}
            <div className="px-3.5 py-3 border-b border-line">
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-ink3">Exchange contract</div>
                <ContractBadge state={conv.contractState || 'none'}/>
              </div>
              {conv.contractState === 'proposed' ? (
                <div className="rounded-lg border border-brand-200 bg-brand-50/60 dark:bg-brand-100/40 p-3">
                  <div className="text-[12.5px] font-semibold text-ink mb-1.5">Proposed terms</div>
                  <dl className="space-y-1 text-[11.5px]">
                    <Row k="What" v="4h tiling · 4h shelving"/>
                    <Row k="When" v="Sat 18 May, 14:00"/>
                    <Row k="Where" v="Mariana's place, Maximinos"/>
                    <Row k="Deposit" v="None"/>
                  </dl>
                  <div className="grid grid-cols-2 gap-1.5 mt-3">
                    <Btn variant="primary" size="sm" icon={<I.Check size={12}/>}>Accept</Btn>
                    <Btn variant="secondary" size="sm">Counter</Btn>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-line p-3 text-center">
                  <I.Doc size={18} className="mx-auto text-ink3 mb-1.5"/>
                  <div className="text-[11.5px] text-ink2 mb-2">No active contract</div>
                  <Btn size="sm" variant="secondary" icon={<I.Plus size={11}/>}>Propose terms</Btn>
                </div>
              )}
            </div>

            {/* Shared files placeholder */}
            <div className="px-3.5 py-3 border-b border-line">
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-ink3">Shared</div>
                <button className="text-[10px] text-ink3 hover:text-ink">View all</button>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[0,1,2].map(i => <Photo key={i} tone="rose" aspect="" className="rounded-md aspect-square"/>)}
              </div>
            </div>

            <div className="px-3.5 py-3">
              <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-ink3 mb-1.5">Safety</div>
              <ul className="space-y-1.5 text-[11.5px] text-ink2">
                <li className="flex items-start gap-1.5"><I.Lock size={12} className="text-emerald-500 mt-0.5 flex-shrink-0"/>Messages are end-to-end encrypted</li>
                <li className="flex items-start gap-1.5"><I.Info size={12} className="text-brand-500 mt-0.5 flex-shrink-0"/>Don't share payment info — swaps are non-monetary</li>
                <li className="flex items-start gap-1.5"><I.Shield size={12} className="text-rose-500 mt-0.5 flex-shrink-0"/>Meet in a public space the first time</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ m, user }) {
  const mine = m.from === 'me';
  return (
    <div className={cx('flex items-end gap-1.5', mine && 'flex-row-reverse')}>
      {!mine && <Avatar user={user} size={22}/>}
      <div className={cx('max-w-[78%] flex flex-col', mine && 'items-end')}>
        {m.attach?.kind === 'contract' ? (
          <ContractCard/>
        ) : m.attach?.kind === 'images' ? (
          <div className="grid grid-cols-3 gap-1 mb-1 max-w-[220px]">
            {Array.from({ length: m.attach.count }).map((_, i) => <Photo key={i} tone="amber" aspect="" className="rounded-md aspect-square"/>)}
          </div>
        ) : null}
        <div className={cx('px-3 py-1.5 text-[12.5px] leading-snug',
          mine
            ? 'bg-brand-600 text-white rounded-2xl rounded-br-md'
            : 'bg-surface border border-line text-ink rounded-2xl rounded-bl-md')}>
          {m.text}
        </div>
        <div className="text-[9.5px] text-ink3 mt-0.5 px-1 font-mono">{m.t}{mine && ' · seen'}</div>
      </div>
    </div>
  );
}

function ContractCard() {
  return (
    <div className="bg-surface border border-brand-300 rounded-lg p-2.5 mb-1 max-w-[280px] w-full">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-7 h-7 rounded-md bg-brand-100 text-brand-700 inline-flex items-center justify-center"><I.Doc size={12}/></div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-mono uppercase tracking-wider text-brand-600">Exchange contract</div>
          <div className="text-[12.5px] font-semibold text-ink">Tiling for shelving · 4h ⇄ 4h</div>
        </div>
      </div>
      <div className="text-[11px] text-ink2 mb-2">Sat 18 May, 14:00 · Maximinos · No deposit</div>
      <div className="grid grid-cols-2 gap-1.5">
        <Btn variant="primary" size="sm">View &amp; sign</Btn>
        <Btn variant="ghost" size="sm">Counter</Btn>
      </div>
    </div>
  );
}

function ContractBadge({ state }) {
  const map = {
    proposed:        { l: 'Proposed', t: 'warn' },
    active:          { l: 'Active',   t: 'verified' },
    'pending-review':{ l: 'Awaiting review', t: 'brand' },
    completed:       { l: 'Completed', t: 'neutral' },
    cancelled:       { l: 'Cancelled', t: 'danger' },
    none:            { l: 'No contract', t: 'neutral' },
  };
  const s = map[state] || map.none;
  return <Badge tone={s.t} size="xs">{s.l}</Badge>;
}

function KVMini({ k, v }) {
  return (
    <div className="rounded-md border border-line bg-sunken py-1.5">
      <div className="text-[14px] font-bold text-ink leading-tight">{v}</div>
      <div className="text-[9px] font-mono uppercase tracking-wider text-ink3">{k}</div>
    </div>
  );
}
function Row({ k, v }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink3">{k}</dt>
      <dd className="font-medium text-ink">{v}</dd>
    </div>
  );
}

// ── Notifications screen ─────────────────────────────────────────────
function NotificationsScreen() {
  const nav = useNav();
  const [tab, setTab] = useState('all');
  const filtered = NOTIFICATIONS.filter(n => tab === 'all' || (tab === 'unread' && n.unread) || n.kind === tab);

  return (
    <Page>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-brand-600 mb-1">Inbox</div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-ink">Notifications</h1>
        </div>
        <Btn variant="ghost" size="sm">Mark all as read</Btn>
      </div>

      <div className="flex items-center gap-1 mb-4 border-b border-line">
        {[
          { v: 'all',     l: 'All' },
          { v: 'unread',  l: 'Unread', n: NOTIFICATIONS.filter(x => x.unread).length },
          { v: 'message', l: 'Messages' },
          { v: 'contract',l: 'Contracts' },
          { v: 'review',  l: 'Reviews' },
          { v: 'system',  l: 'System' },
        ].map(t => (
          <button key={t.v} onClick={() => setTab(t.v)}
            className={cx('h-10 px-3 text-sm font-medium border-b-2 -mb-px flex items-center gap-1.5',
              tab === t.v ? 'border-ink text-ink' : 'border-transparent text-ink2 hover:text-ink')}>
            {t.l}
            {t.n > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-100 text-brand-700">{t.n}</span>}
          </button>
        ))}
      </div>

      <div className="bg-surface border border-line rounded-2xl divide-y divide-line">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-ink3">All caught up.</div>
        ) : filtered.map(n => {
          const u = n.userId ? findUser(n.userId) : null;
          return (
            <button key={n.id} className="w-full text-left p-4 flex items-start gap-3 hover:bg-sunken transition-colors group">
              <div className="relative flex-shrink-0">
                {u ? <Avatar user={u} size={36}/> : (
                  <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 inline-flex items-center justify-center"><I.Spark size={16}/></div>
                )}
                {n.unread && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-brand-600 ring-2 ring-surface"/>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-ink2 leading-snug">
                  {u && <span className="font-semibold text-ink">{u.name}</span>}{' '}{n.text}{' '}<span className="font-medium text-ink">{n.target}</span>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[11px] font-mono text-ink3">{n.t} ago</span>
                  <Badge tone={n.kind === 'contract' ? 'warn' : n.kind === 'review' ? 'verified' : 'neutral'} size="xs">{n.kind}</Badge>
                </div>
              </div>
              <I.Chev size={14} className="text-ink3 mt-2 group-hover:text-ink"/>
            </button>
          );
        })}
      </div>
    </Page>
  );
}

// ── Exchanges screen ─────────────────────────────────────────────────
function ExchangesScreen() {
  const nav = useNav();
  const [tab, setTab] = useState('all');
  const counts = {
    proposed:  EXCHANGES.filter(x => x.state === 'proposed').length,
    active:    EXCHANGES.filter(x => x.state === 'active').length,
    review:    EXCHANGES.filter(x => x.state === 'review').length,
    completed: EXCHANGES.filter(x => x.state === 'completed').length,
    cancelled: EXCHANGES.filter(x => x.state === 'cancelled').length,
  };
  const filtered = tab === 'all' ? EXCHANGES : EXCHANGES.filter(x => x.state === tab);

  return (
    <Page>
      <div className="mb-6">
        <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-brand-600 mb-1">Account</div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-ink">Exchanges</h1>
        <p className="text-sm text-ink2 mt-1">Active swaps, contracts to sign, and your history.</p>
      </div>

      {/* Pipeline stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6">
        {[
          { v: counts.proposed,  l: 'Proposed',  t: 'warn' },
          { v: counts.active,    l: 'Active',    t: 'verified' },
          { v: counts.review,    l: 'Awaiting review', t: 'brand' },
          { v: counts.completed, l: 'Completed', t: 'neutral' },
          { v: counts.cancelled, l: 'Cancelled', t: 'danger' },
        ].map(s => (
          <div key={s.l} className="bg-surface border border-line rounded-lg px-4 py-3">
            <div className="text-2xl font-bold text-ink">{s.v}</div>
            <div className="text-[11px] text-ink3 mt-0.5">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1 mb-4 border-b border-line overflow-x-auto">
        {[
          { v: 'all', l: 'All' },
          { v: 'proposed', l: 'Proposed' },
          { v: 'active', l: 'Active' },
          { v: 'review', l: 'Review' },
          { v: 'completed', l: 'Completed' },
          { v: 'cancelled', l: 'Cancelled' },
        ].map(t => (
          <button key={t.v} onClick={() => setTab(t.v)}
            className={cx('h-10 px-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap',
              tab === t.v ? 'border-ink text-ink' : 'border-transparent text-ink2 hover:text-ink')}>
            {t.l}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(x => {
          const u = findUser(x.counterpartyId);
          const l = findListing(x.listingId);
          const stateMap = {
            proposed:  { l: 'Awaiting your decision', t: 'warn' },
            active:    { l: 'In progress',            t: 'verified' },
            review:    { l: 'Leave a review',         t: 'brand' },
            completed: { l: 'Completed',              t: 'neutral' },
            cancelled: { l: 'Cancelled',              t: 'danger' },
          };
          const s = stateMap[x.state];
          return (
            <div key={x.id} className="bg-surface border border-line rounded-xl p-4 md:p-5 flex flex-col md:flex-row gap-4">
              <div className="flex items-start gap-3 md:w-1/3">
                <Avatar user={u} size={44}/>
                <div className="min-w-0">
                  <div className="font-semibold text-ink">{u.name}</div>
                  <div className="text-xs text-ink3">{u.loc}</div>
                  <Badge tone={s.t} size="xs" className="mt-1.5">{s.l}</Badge>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <button onClick={() => nav.go('listing', { id: l.id })}
                  className="text-sm font-medium text-ink hover:text-brand-600 truncate block text-left">
                  {l.title}
                </button>
                <div className="text-xs text-ink2 mt-1">{x.terms}</div>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-ink3 flex-wrap">
                  <span className="flex items-center gap-1"><I.Calendar size={12}/> {x.date}</span>
                  {x.deposit > 0 && <span className="flex items-center gap-1"><I.Lock size={12}/> €{x.deposit} deposit</span>}
                  <span>· Contract #{x.id}</span>
                </div>
              </div>
              <div className="flex md:flex-col items-stretch gap-2 md:w-44">
                {x.state === 'proposed' && (<>
                  <Btn variant="primary" size="sm" icon={<I.Check size={13}/>}>Accept</Btn>
                  <Btn variant="secondary" size="sm">Counter</Btn>
                </>)}
                {x.state === 'active' && (<>
                  <Btn variant="secondary" size="sm" icon={<I.Msg size={13}/>}>Message</Btn>
                  <Btn variant="ghost"     size="sm">Mark complete</Btn>
                </>)}
                {x.state === 'review' && (<>
                  <Btn variant="primary"   size="sm" icon={<I.Star size={13}/>}>Leave review</Btn>
                  <Btn variant="ghost"     size="sm">Skip</Btn>
                </>)}
                {x.state === 'completed' && (
                  <Btn variant="secondary" size="sm" icon={<I.Doc size={13}/>}>View contract</Btn>
                )}
                {x.state === 'cancelled' && (
                  <Btn variant="ghost"     size="sm">Details</Btn>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Page>
  );
}

Object.assign(window, { MessagesScreen, NotificationsScreen, ExchangesScreen });
