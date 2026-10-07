// Listing detail + Create listing wizard

// ── Listing Detail ───────────────────────────────────────────────────
function ListingScreen({ params, tweaks }) {
  const nav = useNav();
  const l = findListing(params.id) || LISTINGS[0];
  const owner = findUser(l.ownerId);
  const isSkill = l.kind === 'skill';
  const [gallery, setGallery] = useState(0);
  const ownerReviews = REVIEWS.slice(0, 3);
  const similar = LISTINGS.filter(x => x.id !== l.id && x.cat === l.cat).slice(0, 4);
  if (similar.length < 4) similar.push(...LISTINGS.filter(x => x.id !== l.id && !similar.includes(x)).slice(0, 4 - similar.length));

  return (
    <Page wide>
      {/* Crumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-ink3 mb-4">
        <button onClick={() => nav.go('home')} className="hover:text-ink">Home</button>
        <I.Chev size={12}/>
        <button onClick={() => nav.go('browse', { kind: l.kind })} className="hover:text-ink">{isSkill ? 'Skills' : 'Tools'}</button>
        <I.Chev size={12}/>
        <button onClick={() => nav.go('browse', { cat: l.cat })} className="hover:text-ink">{l.catLabel}</button>
        <I.Chev size={12}/>
        <span className="text-ink2 truncate max-w-[200px]">{l.title}</span>
      </nav>

      {/* Title row */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Badge tone={isSkill ? 'skill' : 'tool'}>{isSkill ? <I.Hand size={11}/> : <I.Tools size={11}/>} {isSkill ? 'Skill offer' : 'Tool listing'}</Badge>
            <Badge tone="neutral">{l.catLabel}</Badge>
            {owner.verified && <Badge tone="verified"><I.Shield size={11}/> Verified host</Badge>}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-ink leading-tight">{l.title}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-ink2">
            <span className="flex items-center gap-1"><I.StarFill size={13} className="text-amber-500"/> <span className="font-semibold text-ink">{owner.rating}</span> ({owner.reviews})</span>
            <span className="text-ink3">·</span>
            <span className="flex items-center gap-1"><I.Pin size={13}/> {owner.loc}</span>
            <span className="text-ink3">·</span>
            <span className="flex items-center gap-1"><I.Eye size={13}/> {l.views} views</span>
            <span className="text-ink3">·</span>
            <span>Posted {l.posted}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Btn variant="secondary" size="sm" icon={<I.Heart size={14}/>}>Save</Btn>
          <Btn variant="secondary" size="sm" icon={<I.Send size={14}/>}>Share</Btn>
          <Btn variant="ghost" size="sm" icon={<I.Dots size={14}/>}/>
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-6">
        {/* Left col */}
        <div className="min-w-0">
          {/* Gallery */}
          <div className="grid grid-cols-4 gap-2 mb-6 rounded-2xl overflow-hidden">
            <Photo tone={l.swatch} aspect="" label="hero photo" className="col-span-4 md:col-span-3 row-span-2 md:aspect-[5/4] aspect-[4/3]"/>
            <Photo tone={l.swatch} aspect="" label="angle 2" className="hidden md:block aspect-[5/4]"/>
            <Photo tone={l.swatch} aspect="" label="angle 3" className="hidden md:block aspect-[5/4]"/>
            <button className="hidden md:block relative aspect-[5/4]">
              <Photo tone={l.swatch} aspect="" />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-sm font-semibold backdrop-blur-sm">
                + 5 photos
              </div>
            </button>
            <button className="hidden md:flex aspect-[5/4] items-center justify-center border border-dashed border-line2 text-xs text-ink3 hover:bg-sunken">View all</button>
          </div>

          {/* About */}
          <Section title="About this listing">
            <p className="text-[15px] text-ink2 leading-relaxed">{l.desc}</p>
            <p className="text-[15px] text-ink2 leading-relaxed mt-3">
              {isSkill ? `Sessions run roughly ${l.hours} hour${l.hours>1?'s':''}. We can meet at your place, mine, or a coffee shop in between. I’m happy to do one trial half-session if you’re not sure it’s the right fit.`
                       : `I keep this in good condition and it comes back the same way. If anything breaks during fair use we sort it out — that’s what the deposit is for.`}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {l.tags.map(t => (
                <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-sunken text-ink2 border border-line">#{t}</span>
              ))}
            </div>
          </Section>

          {/* Details grid */}
          <Section title={isSkill ? 'Session details' : 'Tool details'}>
            <dl className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {isSkill ? (
                <>
                  <DetailKV k="Skill level" v={l.level}/>
                  <DetailKV k="Session length" v={`${l.hours} hour${l.hours > 1 ? 's' : ''}`}/>
                  <DetailKV k="Delivery" v="In person · ≤ 5 km"/>
                  <DetailKV k="Trade type" v="Time for time (1:1)"/>
                  <DetailKV k="Languages" v="PT · EN"/>
                  <DetailKV k="Cancellation" v="24h notice"/>
                </>
              ) : (
                <>
                  <DetailKV k="Condition" v={l.condition}/>
                  <DetailKV k="Max borrow" v={`${l.maxDays} days`}/>
                  <DetailKV k="Deposit (held)" v={`€${l.deposit}`}/>
                  <DetailKV k="Pickup" v="Owner's place"/>
                  <DetailKV k="Includes" v="Battery · charger · case"/>
                  <DetailKV k="Insurance" v="Yes — up to €500"/>
                </>
              )}
            </dl>
          </Section>

          {/* Location */}
          <Section title="Where it is" subtitle="Approximate — exact location shared after agreement">
            <div className="relative aspect-[16/8] rounded-xl overflow-hidden border border-line map-grid">
              <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M0,40 Q40,38 60,44 T100,50" stroke="var(--ink-3)" strokeWidth="0.4" fill="none"/>
                <path d="M30,0 Q32,40 40,55 T45,100" stroke="var(--ink-3)" strokeWidth="0.4" fill="none"/>
              </svg>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <span className="block w-28 h-28 rounded-full bg-brand-500/15 border-2 border-dashed border-brand-400/50"/>
                <I.Pin size={22} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-600 fill-brand-500/40"/>
              </div>
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                <div className="bg-surface/90 backdrop-blur rounded-lg border border-line px-3 py-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-ink3">Approx. area</div>
                  <div className="text-sm font-semibold text-ink">{owner.loc}</div>
                </div>
                <Btn variant="secondary" size="sm" icon={<I.Map size={13}/>} onClick={() => nav.go('map')}>Open map</Btn>
              </div>
            </div>
          </Section>

          {/* Host card (expanded) */}
          <Section title="Meet the host">
            <div className="bg-surface border border-line rounded-2xl p-5">
              <div className="flex items-start gap-4">
                <Avatar user={owner} size={64}/>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-ink">{owner.name}</h3>
                    {owner.verified && <Badge tone="verified" size="xs"><I.Shield size={10}/> Verified</Badge>}
                    <Badge tone="brand" size="xs">Super-host</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-ink2 mt-1 flex-wrap">
                    <span className="flex items-center gap-1"><Stars rating={owner.rating} size={11}/> <span className="font-semibold text-ink">{owner.rating}</span> · {owner.reviews} reviews</span>
                    <span className="text-ink3">·</span>
                    <span>Joined {owner.joined}</span>
                    <span className="text-ink3">·</span>
                    <span>Responds in &lt; 2h</span>
                  </div>
                  <p className="text-sm text-ink2 mt-3 leading-relaxed">
                    {owner.name.split(' ')[0]} has completed {owner.reviews} swaps on SkillSwap. Identity and address verified.
                    Typical trade response time is under two hours during the week.
                  </p>
                  <div className="flex items-center gap-2 mt-4">
                    <Btn onClick={() => nav.go('profile', { id: owner.id })} variant="secondary" size="sm">View profile</Btn>
                    <Btn onClick={() => nav.go('messages', { user: owner.id })} variant="ghost" size="sm" icon={<I.Msg size={13}/>}>Message</Btn>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* Reviews */}
          <Section title={`Reviews (${owner.reviews})`} action={() => nav.go('profile', { id: owner.id, tab: 'reviews' })}>
            <div className="grid md:grid-cols-2 gap-3">
              {ownerReviews.map(r => {
                const by = findUser(r.byId);
                return (
                  <div key={r.id} className="bg-surface border border-line rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar user={by} size={28}/>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-ink">{by.name}</div>
                        <div className="text-[11px] text-ink3">{r.t} ago · {r.exchange}</div>
                      </div>
                      <Stars rating={r.rating}/>
                    </div>
                    <p className="text-sm text-ink2 leading-relaxed">{r.text}</p>
                  </div>
                );
              })}
            </div>
          </Section>

          {/* Similar */}
          <Section title="Similar listings nearby">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {similar.map(s => <ListingCard key={s.id} listing={s} style={tweaks.cardStyle}/>)}
            </div>
          </Section>
        </div>

        {/* Right rail: action card */}
        <aside className="lg:sticky lg:top-32 self-start">
          <div className="bg-surface border border-line rounded-2xl shadow-card overflow-hidden">
            <div className="p-5 border-b border-line">
              <div className="flex items-baseline justify-between mb-1">
                <div>
                  <div className="text-3xl font-extrabold text-ink leading-none">
                    {isSkill ? `${l.hours}h` : `€${l.deposit}`}
                  </div>
                  <div className="text-xs text-ink3 mt-1">
                    {isSkill ? 'per session · time for time' : 'refundable deposit · borrow free'}
                  </div>
                </div>
                <Badge tone="verified" size="xs"><I.Shield size={10}/> Protected</Badge>
              </div>
              {isSkill && (
                <div className="mt-3 text-xs text-ink2">
                  You give back: <span className="font-semibold text-ink">{l.hours}h</span> of your own skill, or an agreed equivalent.
                </div>
              )}
              {!isSkill && (
                <div className="mt-3 text-xs text-ink2">
                  Deposit held in escrow. Released automatically on return in good condition.
                </div>
              )}
            </div>

            <div className="p-5 space-y-3 border-b border-line">
              <div>
                <label className="text-[11px] font-mono uppercase tracking-[0.16em] text-ink3 mb-1.5 block">When</label>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="From" iconRight={<I.Calendar size={14}/>} defaultValue="Sat 18 May"/>
                  <Input placeholder="To"   iconRight={<I.Calendar size={14}/>} defaultValue={isSkill ? '14:00' : 'Wed 22 May'}/>
                </div>
              </div>

              {isSkill ? (
                <div>
                  <label className="text-[11px] font-mono uppercase tracking-[0.16em] text-ink3 mb-1.5 block">What you'll offer in return</label>
                  <select className="w-full h-10 rounded-lg bg-surface border border-line2 text-sm px-3">
                    <option>Carpentry — shelving & assembly</option>
                    <option>Photography — half-day shoot</option>
                    <option>Open / let's chat</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="text-[11px] font-mono uppercase tracking-[0.16em] text-ink3 mb-1.5 block">Reason for borrowing</label>
                  <select className="w-full h-10 rounded-lg bg-surface border border-line2 text-sm px-3">
                    <option>Home project</option>
                    <option>Repair</option>
                    <option>One-off task</option>
                  </select>
                </div>
              )}
            </div>

            <div className="p-5">
              <Btn full size="lg" variant="primary" icon={<I.ArrowSwap size={16}/>}>Request to swap</Btn>
              <div className="mt-2">
                <Btn full variant="secondary" icon={<I.Msg size={15}/>}>Message host first</Btn>
              </div>
              <p className="text-[11px] text-ink3 text-center mt-3 leading-relaxed">
                You won't be charged. Both parties sign a digital agreement before the exchange begins.
              </p>
            </div>

            <div className="p-5 bg-sunken border-t border-line">
              <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-ink3 mb-2">Protection</div>
              <ul className="space-y-2 text-xs text-ink2">
                <li className="flex items-start gap-2"><I.Shield size={13} className="text-emerald-500 mt-0.5 flex-shrink-0"/>Verified host identity</li>
                <li className="flex items-start gap-2"><I.Doc    size={13} className="text-brand-500 mt-0.5 flex-shrink-0"/>Digital contract with arbitration</li>
                <li className="flex items-start gap-2"><I.Star   size={13} className="text-amber-500 mt-0.5 flex-shrink-0"/>Two-way review after the swap</li>
                <li className="flex items-start gap-2"><I.Phone  size={13} className="text-rose-500 mt-0.5 flex-shrink-0"/>24h dispute line</li>
              </ul>
            </div>
          </div>

          <button className="w-full mt-3 text-xs text-ink3 hover:text-ink2">Report this listing</button>
        </aside>
      </div>
    </Page>
  );
}

function Section({ title, subtitle, action, children }) {
  return (
    <section className="mb-8">
      <div className="flex items-end justify-between mb-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-ink">{title}</h2>
          {subtitle && <p className="text-xs text-ink3 mt-0.5">{subtitle}</p>}
        </div>
        {action && <button onClick={action} className="text-sm text-ink2 hover:text-ink">See all →</button>}
      </div>
      {children}
    </section>
  );
}

function DetailKV({ k, v }) {
  return (
    <div className="border border-line rounded-lg p-3 bg-sunken">
      <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-ink3 mb-1">{k}</div>
      <div className="text-sm font-semibold text-ink">{v}</div>
    </div>
  );
}

// ── Create Listing Wizard ────────────────────────────────────────────
function NewListingScreen() {
  const nav = useNav();
  const [step, setStep] = useState(0);
  const [kind, setKind] = useState('');
  const [cat, setCat] = useState('');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  const steps = [
    { k: 'type',     l: 'Type' },
    { k: 'category', l: 'Category' },
    { k: 'details',  l: 'Details' },
    { k: 'photos',   l: 'Photos' },
    { k: 'location', l: 'Location' },
    { k: 'preview',  l: 'Preview' },
  ];

  return (
    <Page>
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => nav.go('home')} className="text-sm text-ink2 hover:text-ink flex items-center gap-1.5">
          <I.ArrowL size={14}/> Back to marketplace
        </button>
        <button className="text-sm text-ink3 hover:text-ink">Save as draft</button>
      </div>

      {/* Step rail */}
      <ol className="flex items-center gap-2 mb-8 overflow-x-auto">
        {steps.map((s, i) => (
          <li key={s.k} className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => i < step && setStep(i)}
              className={cx('flex items-center gap-2 px-3 h-8 rounded-full text-xs font-medium border',
                i === step  ? 'bg-ink text-surface border-ink' :
                i  < step  ? 'bg-surface border-line text-ink2' :
                              'bg-transparent border-dashed border-line text-ink3'
              )}>
              <span className={cx('w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px]',
                i === step ? 'bg-white/20' :
                i  < step ? 'bg-emerald-100 text-emerald-700' : 'bg-sunken')}>
                {i < step ? <I.Check size={11}/> : i + 1}
              </span>
              {s.l}
            </button>
            {i < steps.length - 1 && <I.Chev size={12} className="text-ink3"/>}
          </li>
        ))}
      </ol>

      <div className="bg-surface border border-line rounded-2xl p-6 md:p-8 min-h-[420px]">
        {step === 0 && (
          <Step title="What are you posting?" sub="Skills are exchanged time-for-time. Tools are borrowed with an optional deposit.">
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { v: 'skill', t: 'A skill I can teach or do', d: 'Cooking, coaching, repairs, tutoring, code, photography…', i: <I.Hand size={22}/> },
                { v: 'tool',  t: 'A tool I can lend',          d: 'Drills, mixers, bikes, drones, ladders, anything physical…', i: <I.Tools size={22}/> },
              ].map(o => (
                <button key={o.v} onClick={() => setKind(o.v)}
                  className={cx('text-left p-5 rounded-2xl border-2 transition-all',
                    kind === o.v ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-100/40' : 'border-line hover:border-line2')}>
                  <div className={cx('w-12 h-12 rounded-xl inline-flex items-center justify-center mb-3',
                    o.v === 'skill' ? 'bg-violet-100 text-violet-700' : 'bg-amber-100 text-amber-800')}>{o.i}</div>
                  <div className="font-bold text-ink mb-1">{o.t}</div>
                  <div className="text-sm text-ink2 leading-relaxed">{o.d}</div>
                </button>
              ))}
            </div>
          </Step>
        )}
        {step === 1 && (
          <Step title="Choose a category" sub="This helps the right people find your listing.">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {CATEGORIES.map(c => {
                const Ic = CAT_ICON[c.icon];
                return (
                  <button key={c.id} onClick={() => setCat(c.id)}
                    className={cx('p-3 rounded-lg border text-left flex items-center gap-2.5',
                      cat === c.id ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-100/40 text-ink' : 'border-line hover:border-line2 text-ink2')}>
                    <Ic size={16}/>
                    <span className="text-sm font-medium">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </Step>
        )}
        {step === 2 && (
          <Step title="Describe it" sub="A clear title and an honest description get 3× more requests.">
            <div className="space-y-4 max-w-2xl">
              <Field label="Title" hint="60 chars max">
                <Input placeholder={kind === 'tool' ? 'e.g. Bosch GSB 18V cordless hammer drill' : 'e.g. Conversational Spanish — beginner to B1'} value={title} onChange={e => setTitle(e.target.value)}/>
              </Field>
              <Field label="Description" hint="What's included, condition, what you're hoping to swap for">
                <textarea rows={6} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Tell neighbours what you're offering…"
                  className="w-full rounded-lg bg-surface border border-line2 text-sm text-ink p-3 placeholder-ink3 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"/>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                {kind === 'tool' ? (
                  <>
                    <Field label="Condition"><select className="w-full h-10 rounded-lg bg-surface border border-line2 text-sm px-3"><option>Like new</option><option>Excellent</option><option>Good</option><option>Fair</option></select></Field>
                    <Field label="Max borrow days"><Input placeholder="7" defaultValue="7"/></Field>
                    <Field label="Deposit (€)" hint="Optional, refundable"><Input placeholder="50" defaultValue="50"/></Field>
                    <Field label="Pickup or delivery"><select className="w-full h-10 rounded-lg bg-surface border border-line2 text-sm px-3"><option>Pickup only</option><option>I can deliver</option><option>Either</option></select></Field>
                  </>
                ) : (
                  <>
                    <Field label="Level"><select className="w-full h-10 rounded-lg bg-surface border border-line2 text-sm px-3"><option>Beginner</option><option>Intermediate</option><option>Expert</option></select></Field>
                    <Field label="Session length (hours)"><Input defaultValue="1"/></Field>
                    <Field label="Delivery"><select className="w-full h-10 rounded-lg bg-surface border border-line2 text-sm px-3"><option>In person</option><option>Online</option><option>Either</option></select></Field>
                    <Field label="Trade type"><select className="w-full h-10 rounded-lg bg-surface border border-line2 text-sm px-3"><option>Time for time</option><option>Open / discuss</option></select></Field>
                  </>
                )}
              </div>
              <Field label="Tags" hint="Up to 5 — help search">
                <Input placeholder="e.g. drill, bosch, 18v" defaultValue="drill, bosch, 18v"/>
              </Field>
            </div>
          </Step>
        )}
        {step === 3 && (
          <Step title="Add photos" sub="Listings with 3+ photos get 4× more requests. JPEG/PNG, up to 10 MB each.">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[0,1,2,3,4,5,6,7].map(i => (
                <button key={i} className={cx(
                  'aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors',
                  i === 0 ? 'border-brand-400 bg-brand-50/30 text-brand-700' : 'border-line hover:border-line2 text-ink3'
                )}>
                  <I.Image size={20}/>
                  <span className="text-[10px] font-medium">{i === 0 ? 'Cover *' : 'Add photo'}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 text-xs text-ink2 flex items-center gap-1.5">
              <I.Info size={14}/> The first photo will be used as the cover image in search results.
            </div>
          </Step>
        )}
        {step === 4 && (
          <Step title="Where is it?" sub="Exact location is only revealed to the person you agree to swap with.">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Field label="Address"><Input defaultValue="Rua de São Vicente, Braga"/></Field>
                <Field label="Neighbourhood"><Input defaultValue="São Vicente"/></Field>
                <Field label="Discovery radius" hint="How far away your listing appears in search">
                  <select className="w-full h-10 rounded-lg bg-surface border border-line2 text-sm px-3"><option>3 km</option><option>5 km</option><option>10 km</option><option>City-wide</option></select>
                </Field>
                <label className="flex items-center gap-2 text-sm text-ink2"><input type="checkbox" className="accent-brand-600 rounded" defaultChecked/> Show approximate location on map (recommended)</label>
              </div>
              <div className="relative aspect-square rounded-xl border border-line overflow-hidden map-grid">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="block w-32 h-32 rounded-full bg-brand-500/15 border-2 border-dashed border-brand-400/50"/>
                  <I.Pin size={22} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-600 fill-brand-500/40"/>
                </div>
              </div>
            </div>
          </Step>
        )}
        {step === 5 && (
          <Step title="Preview & publish" sub="This is what people will see.">
            <div className="grid md:grid-cols-[minmax(0,360px)_1fr] gap-5">
              <ListingCard listing={{ ...LISTINGS[0], title: title || LISTINGS[0].title, kind: kind || 'tool', catLabel: CATEGORIES.find(c => c.id === cat)?.label || 'Home & Repair', swatch: 'sky' }} style="hybrid"/>
              <div className="space-y-3">
                <Summary k="Type" v={kind === 'skill' ? 'Skill offer' : 'Tool listing'}/>
                <Summary k="Category" v={CATEGORIES.find(c => c.id === cat)?.label || '—'}/>
                <Summary k="Title" v={title || '—'}/>
                <Summary k="Photos" v="0 added — add at least 1 cover"/>
                <Summary k="Visibility" v="Public · 5km radius"/>
                <div className="pt-3 border-t border-line">
                  <Btn variant="primary" size="lg" full>Publish listing</Btn>
                  <p className="text-[11px] text-ink3 text-center mt-2">By publishing, you agree to the Community Code of Conduct.</p>
                </div>
              </div>
            </div>
          </Step>
        )}

        {/* Footer nav */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-line">
          <Btn variant="ghost" disabled={step === 0} onClick={() => setStep(Math.max(0, step - 1))} icon={<I.ArrowL size={14}/>}>Back</Btn>
          <div className="text-xs text-ink3">Step {step + 1} of {steps.length}</div>
          {step < steps.length - 1 ? (
            <Btn variant="primary" onClick={() => setStep(Math.min(steps.length - 1, step + 1))} iconRight={<I.ArrowR size={14}/>}>
              Continue
            </Btn>
          ) : (
            <Btn variant="primary" onClick={() => nav.go('home')}>Publish</Btn>
          )}
        </div>
      </div>
    </Page>
  );
}

function Step({ title, sub, children }) {
  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold tracking-tight text-ink mb-1">{title}</h2>
      {sub && <p className="text-sm text-ink2 mb-6 max-w-xl">{sub}</p>}
      {children}
    </div>
  );
}
function Field({ label, hint, children }) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-ink3">{label}</span>
        {hint && <span className="text-[10px] text-ink3">{hint}</span>}
      </div>
      {children}
    </label>
  );
}
function Summary({ k, v }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-line">
      <span className="text-xs font-mono uppercase tracking-wider text-ink3">{k}</span>
      <span className="text-sm font-medium text-ink truncate max-w-[220px]">{v}</span>
    </div>
  );
}

Object.assign(window, { ListingScreen, NewListingScreen });
