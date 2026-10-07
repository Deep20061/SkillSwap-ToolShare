// Account screens: Profile (public), Settings, My Listings, Saved, How-it-works

// ── Public profile ───────────────────────────────────────────────────
function ProfileScreen({ params, tweaks }) {
  const nav = useNav();
  const u = params.id && params.id !== 'me' ? findUser(params.id) || ME : ME;
  const isMe = u.id === ME.id;
  const [tab, setTab] = useState(params.tab || 'listings');
  const userListings = LISTINGS.filter((l) => l.ownerId === u.id);
  const fallback = userListings.length ? userListings : LISTINGS.slice(0, 4);
  const userReviews = REVIEWS;

  const skills = [
  { name: 'Carpentry', level: 'Expert', hours: 47 },
  { name: 'Photography', level: 'Intermediate', hours: 12 },
  { name: 'Bicycle repair', level: 'Intermediate', hours: 18 },
  { name: 'Beginner Spanish', level: 'Beginner', hours: 3 }];


  return (
    <Page wide>
      {/* Cover */}
      <div className="relative rounded-2xl overflow-hidden border border-line h-48 md:h-64">
        <div className={cx('absolute inset-0 bg-gradient-to-br', (TONE[u.tone] || TONE.sky).bar)}/>
        <div className="absolute inset-0 stripe-ph opacity-30"/>
        <span className="absolute top-3 left-3 text-[10px] font-mono uppercase tracking-wider text-ink2 bg-white/85 backdrop-blur px-1.5 py-0.5 rounded">
          cover photo · drop in a banner shot
        </span>
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/15" />
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {isMe ?
          <Btn onClick={() => nav.go('settings')} variant="secondary" size="sm" icon={<I.Edit size={13} />}>Edit profile</Btn> :

          <Btn variant="secondary" size="sm" icon={<I.Heart size={13} />}>Follow</Btn>
          }
          <Btn variant="ghost" size="sm" className="!bg-white/85 hover:!bg-white" icon={<I.Send size={13} />}>Share</Btn>
        </div>
      </div>

      {/* Avatar row — only the avatar overlaps the cover; name sits below */}
      <div className="relative z-10 px-1 md:px-2 -mt-12 md:-mt-14 mb-4">
        <div className="ring-4 ring-sunken rounded-full inline-block">
          <Avatar user={u} size={108} className="!text-3xl" />
        </div>
      </div>

      {/* Identity strip — fully below the cover */}
      <div className="px-1 md:px-2 mb-8 flex flex-col md:flex-row md:items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-ink">{u.name}</h1>
            {u.verified && <Badge tone="verified"><I.Shield size={11} /> Verified</Badge>}
            {u.reviews > 30 && <Badge tone="brand">Super-host</Badge>}
          </div>
          <div className="flex items-center gap-3 mt-2 text-sm text-ink2 flex-wrap">
            <span className="flex items-center gap-1.5">
              <Stars rating={u.rating} size={12} />
              <span className="font-semibold text-ink">{u.rating}</span>
              <span>· {u.reviews} reviews</span>
            </span>
            <span className="text-ink3">·</span>
            <span className="flex items-center gap-1"><I.Pin size={13} /> {u.loc}</span>
            <span className="text-ink3">·</span>
            <span>Joined {u.joined}</span>
          </div>
          {(u.bio || isMe) &&
          <p className="text-[15px] text-ink2 mt-2 leading-relaxed max-w-2xl">
              {u.bio || 'Add a short bio so neighbours know what you’re about. A line or two is plenty.'}
            </p>
          }
        </div>
        {!isMe &&
        <div className="flex gap-2 flex-shrink-0">
            <Btn variant="secondary" icon={<I.Msg size={14} />}>Message</Btn>
            <Btn variant="primary" icon={<I.ArrowSwap size={14} />}>Propose swap</Btn>
          </div>
        }
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {[
        { v: userListings.length || 8, l: 'Active listings' },
        { v: u.reviews, l: 'Swaps done' },
        { v: u.rating, l: 'Rating' },
        { v: '< 2h', l: 'Avg. response' },
        { v: '98%', l: 'Completion rate' }].
        map((s) =>
        <div key={s.l} className="bg-surface border border-line rounded-xl px-4 py-3">
            <div className="text-2xl font-extrabold text-ink leading-tight">{s.v}</div>
            <div className="text-[11px] text-ink3">{s.l}</div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-line mb-6 flex items-center gap-1 overflow-x-auto">
        {[
        { v: 'listings', l: `Listings (${userListings.length || 8})` },
        { v: 'skills', l: `Skills (${skills.length})` },
        { v: 'reviews', l: `Reviews (${u.reviews})` },
        { v: 'about', l: 'About' }].
        map((t) =>
        <button key={t.v} onClick={() => setTab(t.v)}
        className={cx('h-10 px-4 text-sm font-medium border-b-2 -mb-px whitespace-nowrap',
        tab === t.v ? 'border-ink text-ink' : 'border-transparent text-ink2 hover:text-ink')}>
            {t.l}
          </button>
        )}
      </div>

      {tab === 'listings' &&
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {fallback.map((l) => <ListingCard key={l.id} listing={l} style={tweaks.cardStyle} />)}
        </div>
      }

      {tab === 'skills' &&
      <div className="grid md:grid-cols-2 gap-3">
          {skills.map((s) =>
        <div key={s.name} className="bg-surface border border-line rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-100 text-violet-700 inline-flex items-center justify-center"><I.Hand size={16} /></div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-ink">{s.name}</div>
                <div className="text-xs text-ink3">{s.level} · {s.hours}h swapped</div>
              </div>
              <Badge tone={s.level === 'Expert' ? 'verified' : 'neutral'} size="xs">{s.level}</Badge>
            </div>
        )}
        </div>
      }

      {tab === 'reviews' &&
      <div className="grid md:grid-cols-[260px_minmax(0,1fr)] gap-6">
          <aside className="bg-surface border border-line rounded-2xl p-5 self-start">
            <div className="text-5xl font-extrabold text-ink leading-none">{u.rating}</div>
            <Stars rating={u.rating} size={16} className="mt-2" />
            <div className="text-sm text-ink2 mt-2">{u.reviews} reviews</div>
            <div className="mt-4 space-y-2">
              {[5, 4, 3, 2, 1].map((n) => {
              const pct = n === 5 ? 84 : n === 4 ? 12 : n === 3 ? 3 : 1;
              return (
                <div key={n} className="flex items-center gap-2 text-xs">
                    <span className="w-3 text-ink3 font-mono">{n}</span>
                    <I.StarFill size={10} className="text-amber-500" />
                    <span className="flex-1 h-1.5 rounded-full bg-line overflow-hidden">
                      <span className="block h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                    </span>
                    <span className="text-ink3 font-mono w-6 text-right">{pct}%</span>
                  </div>);

            })}
            </div>
          </aside>
          <div className="space-y-3">
            {userReviews.map((r) => {
            const by = findUser(r.byId);
            return (
              <div key={r.id} className="bg-surface border border-line rounded-xl p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar user={by} size={36} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-ink">{by.name}</span>
                        <span className="text-[10px] text-ink3 font-mono">{r.t} ago</span>
                      </div>
                      <div className="text-xs text-ink3">{r.exchange}</div>
                    </div>
                    <Stars rating={r.rating} size={13} />
                  </div>
                  <p className="text-sm text-ink2 leading-relaxed">{r.text}</p>
                </div>);

          })}
          </div>
        </div>
      }

      {tab === 'about' &&
      <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-surface border border-line rounded-2xl p-5 space-y-4">
            <Field2 k="Bio" v={u.bio || 'Carpenter by trade, photographer on weekends. Happy to swap an afternoon of shelves for a guitar lesson.'} />
            <Field2 k="Speaks" v="Portuguese · English (B2) · Spanish (A2)" />
            <Field2 k="Lives in" v={u.loc} />
            <Field2 k="Joined" v={u.joined} />
            <Field2 k="Verified" v={<><I.Shield size={13} className="inline text-emerald-500" /> Identity · email · phone</>} />
          </div>
          <div className="space-y-3">
            <div className="bg-surface border border-line rounded-2xl p-5">
              <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-ink3 mb-3">Trust badges</div>
              <ul className="space-y-2">
                {[
              { i: <I.Shield size={14} className="text-emerald-600" />, t: 'Identity verified', d: 'Government ID checked' },
              { i: <I.Phone size={14} className="text-brand-600" />, t: 'Phone verified', d: '+351 ••• •• 678' },
              { i: <I.Spark size={14} className="text-amber-600" />, t: 'Super-host', d: '20+ swaps · 4.9-star' },
              { i: <I.Star size={14} className="text-rose-600" />, t: 'Top reviewer', d: 'Leaves thoughtful feedback' }].
              map((b) =>
              <li key={b.t} className="flex items-start gap-2.5">
                    <span className="mt-0.5">{b.i}</span>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-ink">{b.t}</div>
                      <div className="text-[11px] text-ink3">{b.d}</div>
                    </div>
                  </li>
              )}
              </ul>
            </div>
          </div>
        </div>
      }
    </Page>);

}

function Field2({ k, v }) {
  return (
    <div>
      <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-ink3 mb-1">{k}</div>
      <div className="text-[15px] text-ink leading-relaxed">{v}</div>
    </div>);

}

// ── Settings ─────────────────────────────────────────────────────────
function SettingsScreen() {
  const nav = useNav();
  const [tab, setTab] = useState('profile');
  const tabs = [
  { v: 'profile', l: 'Profile', i: <I.User size={15} /> },
  { v: 'account', l: 'Account & Login', i: <I.Key size={15} /> },
  { v: 'security', l: 'Privacy & Security', i: <I.Lock size={15} /> },
  { v: 'notifications', l: 'Notifications', i: <I.Bell size={15} /> },
  { v: 'verification', l: 'Verification', i: <I.Shield size={15} /> },
  { v: 'deposits', l: 'Deposits & Wallet', i: <I.Card size={15} /> },
  { v: 'location', l: 'Location', i: <I.Pin size={15} /> },
  { v: 'connected', l: 'Connected apps', i: <I.Globe size={15} /> },
  { v: 'data', l: 'Data & Export', i: <I.Doc size={15} /> }];


  return (
    <Page wide>
      <div className="mb-6">
        <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-brand-600 mb-1">Account</div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-ink">Settings</h1>
        <p className="text-sm text-ink2 mt-1">Profile, security, notifications and preferences.</p>
      </div>

      <div className="grid md:grid-cols-[240px_minmax(0,1fr)] gap-6">
        <aside className="md:sticky md:top-32 self-start">
          <nav className="bg-surface border border-line rounded-xl overflow-hidden">
            {tabs.map((t) =>
            <button key={t.v} onClick={() => setTab(t.v)}
            className={cx('w-full px-3 py-2.5 flex items-center gap-2.5 text-sm text-left border-l-2 transition-colors',
            tab === t.v ?
            'bg-brand-50/60 dark:bg-brand-100/40 border-brand-600 text-ink font-medium' :
            'border-transparent text-ink2 hover:bg-sunken hover:text-ink')}>
                <span className={tab === t.v ? 'text-brand-600' : 'text-ink3'}>{t.i}</span>
                {t.l}
              </button>
            )}
          </nav>
          <button className="w-full mt-3 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg flex items-center gap-2"><I.Logout size={14} /> Log out</button>
        </aside>

        <div className="min-w-0">
          {tab === 'profile' && <SettingsCard title="Public profile" desc="This information appears on your profile and listings.">
            <div className="flex items-start gap-4 mb-6">
              <Avatar user={ME} size={72} />
              <div className="flex-1">
                <Btn variant="secondary" size="sm">Upload new photo</Btn>
                <p className="text-[11px] text-ink3 mt-2">JPG or PNG · 1 MB max</p>
              </div>
              <Btn variant="ghost" size="sm">Remove</Btn>
            </div>
            <FormGrid>
              <FormField label="Full name" value={ME.name} />
              <FormField label="Username" value={`@${ME.handle}`} />
              <FormField label="Email" value={ME.email} suffix={<Badge tone="verified" size="xs">Verified</Badge>} />
              <FormField label="Phone" value={ME.phone} suffix={<Badge tone="verified" size="xs">Verified</Badge>} />
              <FormField label="City" value="Braga, Portugal" full />
              <FormField label="Bio" hint="160 chars max" full input={
              <textarea defaultValue={ME.bio} rows={3} className="w-full rounded-lg bg-surface border border-line2 text-sm text-ink p-3 focus:outline-none focus:ring-2 focus:ring-brand-200" />
              } />
              <FormField label="Languages" value="Portuguese · English" />
              <FormField label="Availability" hint="Affects search ranking"
              input={<select className="w-full h-10 rounded-lg bg-surface border border-line2 text-sm px-3"><option>Available now</option><option>Available next week</option><option>Paused</option></select>} />
            </FormGrid>
            <div className="mt-6 flex items-center justify-end gap-2">
              <Btn variant="ghost">Cancel</Btn>
              <Btn variant="primary">Save changes</Btn>
            </div>
          </SettingsCard>}

          {tab === 'account' && <SettingsCard title="Account & login" desc="How you sign in to SkillSwap.">
            <FormGrid>
              <FormField label="Email" value={ME.email} suffix={<button className="text-xs text-brand-600 hover:underline">Change</button>} />
              <FormField label="Password" value="••••••••••" suffix={<button className="text-xs text-brand-600 hover:underline">Change</button>} />
              <FormField label="Two-factor" hint="Authenticator app or SMS" value="Off"
              suffix={<Btn variant="secondary" size="sm">Enable</Btn>} full />
            </FormGrid>
            <Divider />
            <h3 className="text-sm font-semibold text-ink mb-3">Connected logins</h3>
            <ul className="space-y-2">
              {[
              { n: 'Google', d: ME.email, c: true },
              { n: 'Apple', d: 'Not connected', c: false },
              { n: 'GitHub', d: 'Not connected', c: false }].
              map((p) =>
              <li key={p.n} className="flex items-center justify-between p-3 rounded-lg border border-line bg-sunken/50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-surface border border-line inline-flex items-center justify-center text-sm font-bold">{p.n[0]}</div>
                    <div>
                      <div className="text-sm font-medium text-ink">{p.n}</div>
                      <div className="text-xs text-ink3">{p.d}</div>
                    </div>
                  </div>
                  <Btn variant={p.c ? 'ghost' : 'secondary'} size="sm">{p.c ? 'Disconnect' : 'Connect'}</Btn>
                </li>
              )}
            </ul>
            <Divider />
            <DangerBlock title="Deactivate account" desc="Hide your profile and listings. You can reactivate any time within 30 days." action="Deactivate" />
            <DangerBlock title="Delete account permanently" desc="This removes your profile, listings and exchange history. Cannot be undone." action="Delete account" danger />
          </SettingsCard>}

          {tab === 'security' && <SettingsCard title="Privacy & security" desc="Control who sees what.">
            <ToggleRow t="Show last name on profile" d="Off = only your first name and initial appear." def />
            <ToggleRow t="Show exact location" d="When off, only your neighbourhood appears on listings." />
            <ToggleRow t="Allow profile to appear in search engines" />
            <ToggleRow t="Let neighbours see my response time" def />
            <Divider />
            <h3 className="text-sm font-semibold text-ink mb-3">Active sessions</h3>
            <ul className="space-y-2">
              {[
              { d: 'MacBook Pro · Safari', l: 'Braga, PT · current session', t: 'now', cur: true },
              { d: 'iPhone 15 · iOS app', l: 'Braga, PT', t: '2h ago' },
              { d: 'Chrome · Windows', l: 'Lisbon, PT', t: '3d ago' }].
              map((s, i) =>
              <li key={i} className="flex items-center justify-between p-3 rounded-lg border border-line">
                  <div>
                    <div className="text-sm font-medium text-ink">{s.d} {s.cur && <Badge tone="verified" size="xs">Current</Badge>}</div>
                    <div className="text-xs text-ink3">{s.l} · {s.t}</div>
                  </div>
                  {!s.cur && <Btn variant="ghost" size="sm">Revoke</Btn>}
                </li>
              )}
            </ul>
            <button className="mt-3 text-sm text-rose-600 hover:underline">Sign out of all other sessions</button>
          </SettingsCard>}

          {tab === 'notifications' && <SettingsCard title="Notifications" desc="What we send you, where.">
            <table className="w-full">
              <thead>
                <tr className="text-[11px] font-mono uppercase tracking-[0.16em] text-ink3">
                  <th className="text-left py-2">Event</th>
                  <th className="text-center py-2 w-20">In-app</th>
                  <th className="text-center py-2 w-20">Email</th>
                  <th className="text-center py-2 w-20">Push</th>
                  <th className="text-center py-2 w-20">SMS</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                { l: 'New message', d: [true, false, true, false] },
                { l: 'Swap request', d: [true, true, true, false] },
                { l: 'Contract signed', d: [true, true, true, true] },
                { l: 'Review received', d: [true, true, false, false] },
                { l: 'New listing in your area', d: [false, true, false, false] },
                { l: 'Weekly digest', d: [false, true, false, false] },
                { l: 'Marketing & tips', d: [false, false, false, false] }].
                map((r, i) =>
                <tr key={i} className="border-t border-line">
                    <td className="py-3 text-ink">{r.l}</td>
                    {r.d.map((on, j) =>
                  <td key={j} className="text-center py-3">
                        <Switch defaultChecked={on} />
                      </td>
                  )}
                  </tr>
                )}
              </tbody>
            </table>
            <Divider />
            <ToggleRow t="Quiet hours · 22:00 → 08:00" d="Pause push & SMS overnight." def />
          </SettingsCard>}

          {tab === 'verification' && <SettingsCard title="Verification" desc="Verified profiles get 3× more swap requests.">
            <div className="space-y-3">
              <VerifyRow t="Email" d={ME.email} status="done" />
              <VerifyRow t="Phone number" d="+351 912 345 678" status="done" />
              <VerifyRow t="Government ID" d="Passport / Citizen card" status="done" />
              <VerifyRow t="Selfie liveness check" d="One-time biometric match against ID" status="pending" />
              <VerifyRow t="Address" d="A utility bill or bank statement (3 months)" status="missing" />
              <VerifyRow t="Linked socials" d="Optional — boosts trust score" status="missing" />
            </div>
            <Divider />
            <div className="rounded-xl border border-brand-200 bg-brand-50/60 dark:bg-brand-100/40 p-4 flex items-start gap-3">
              <I.Shield size={18} className="text-brand-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-semibold text-ink">Your trust score: 78/100</div>
                <div className="text-xs text-ink2 mt-0.5">Add address verification and 1 social to reach Super-verified.</div>
              </div>
            </div>
          </SettingsCard>}

          {tab === 'deposits' && <SettingsCard title="Deposits & wallet" desc="Refundable deposits held in escrow during tool exchanges.">
            <ComingSoon
              icon={<I.Card size={20} />}
              title="Payments & deposits"
              desc="Connect a card to send and receive refundable deposits when you borrow or lend tools. Money never leaves escrow unless something goes wrong.">
              
              <Btn variant="primary" size="sm" icon={<I.Plus size={13} />}>Add a payment method</Btn>
            </ComingSoon>
          </SettingsCard>}

          {tab === 'location' && <SettingsCard title="Location" desc="Where you are, and how visible you are on the map.">
            <FormGrid>
              <FormField label="Home address" value="Rua de São Vicente, Braga" full />
              <FormField label="Discovery radius"
              input={<select className="w-full h-10 rounded-lg bg-surface border border-line2 text-sm px-3"><option>3 km</option><option>5 km</option><option>10 km</option><option>City-wide</option></select>} />
              <FormField label="Coarse-grain on map" hint="Recommended"
              input={<Switch defaultChecked />} />
            </FormGrid>
            <Divider />
            <div className="rounded-xl overflow-hidden border border-line h-56 map-grid relative">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <span className="block w-32 h-32 rounded-full bg-brand-500/15 border-2 border-dashed border-brand-400/50" />
                <I.Pin size={22} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-600 fill-brand-500/40" />
              </div>
              <Badge tone="warn" size="sm" className="absolute top-3 left-3">Placeholder map</Badge>
            </div>
          </SettingsCard>}

          {tab === 'connected' && <SettingsCard title="Connected apps" desc="Apps that can talk to SkillSwap on your behalf.">
            <ComingSoon icon={<I.Globe size={20} />} title="Calendar &amp; cloud sync"
            desc="Sync availability with Google Calendar, sync uploaded photos to your cloud storage, and let other apps post listings via the SkillSwap API." />
          </SettingsCard>}

          {tab === 'data' && <SettingsCard title="Data &amp; export" desc="Download or delete what we have.">
            <div className="space-y-3">
              <DataRow t="Download your data" d="A ZIP with your profile, listings, messages and contracts (GDPR Art. 15)." action="Request export" />
              <DataRow t="Marketing preferences" d="Manage cookie preferences and ad personalisation." action="Manage" />
              <DataRow t="API tokens" d="Programmatic access for connected apps." action="Manage" badge="Beta" />
            </div>
          </SettingsCard>}
        </div>
      </div>
    </Page>);

}

function SettingsCard({ title, desc, children }) {
  return (
    <section className="bg-surface border border-line rounded-2xl p-5 md:p-6">
      <header className="mb-5">
        <h2 className="text-lg font-bold text-ink">{title}</h2>
        {desc && <p className="text-sm text-ink2 mt-0.5">{desc}</p>}
      </header>
      {children}
    </section>);

}
function FormGrid({ children }) {
  return <div className="grid md:grid-cols-2 gap-4">{children}</div>;
}
function FormField({ label, value, hint, suffix, full, input }) {
  return (
    <label className={cx('block', full && 'md:col-span-2')}>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-ink3">{label}</span>
        {hint && <span className="text-[10px] text-ink3">{hint}</span>}
      </div>
      {input ??
      <div className="relative">
          <Input defaultValue={value} />
          {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</span>}
        </div>
      }
    </label>);

}
function Divider() {return <div className="my-6 border-t border-line" />;}
function ToggleRow({ t, d, def }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-line last:border-0">
      <div className="flex-1">
        <div className="text-sm font-medium text-ink">{t}</div>
        {d && <div className="text-xs text-ink3 mt-0.5">{d}</div>}
      </div>
      <Switch defaultChecked={def} />
    </div>);

}
function Switch({ defaultChecked }) {
  const [on, setOn] = useState(!!defaultChecked);
  return (
    <button onClick={() => setOn((v) => !v)}
    className={cx('w-9 h-5 rounded-full transition-colors relative inline-block', on ? 'bg-brand-600' : 'bg-line2')}>
      <span className={cx('block w-4 h-4 rounded-full bg-white shadow-sm absolute top-0.5 transition-all', on ? 'left-4' : 'left-0.5')} />
    </button>);

}
function VerifyRow({ t, d, status }) {
  const m = {
    done: { l: 'Verified', t: 'verified', i: <I.Check size={11} /> },
    pending: { l: 'Pending', t: 'warn', i: <I.Clock size={11} /> },
    missing: { l: 'Add', t: 'neutral', i: <I.Plus size={11} /> }
  };
  const s = m[status];
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-line">
      <div className="min-w-0">
        <div className="text-sm font-medium text-ink">{t}</div>
        <div className="text-xs text-ink3">{d}</div>
      </div>
      {status === 'done' ? <Badge tone={s.t}>{s.i} {s.l}</Badge> : <Btn variant="secondary" size="sm">{status === 'pending' ? 'In review' : 'Add'}</Btn>}
    </div>);

}
function DangerBlock({ title, desc, action, danger }) {
  return (
    <div className={cx('rounded-xl border p-4 flex items-start justify-between gap-4',
    danger ? 'border-rose-200 bg-rose-50/50 dark:bg-rose-500/10' : 'border-line bg-sunken/60')}>
      <div>
        <div className={cx('text-sm font-semibold', danger ? 'text-rose-700 dark:text-rose-400' : 'text-ink')}>{title}</div>
        <div className="text-xs text-ink2 mt-1 max-w-md">{desc}</div>
      </div>
      <Btn variant={danger ? 'danger' : 'secondary'} size="sm">{action}</Btn>
    </div>);

}
function DataRow({ t, d, action, badge }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-line">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-ink">{t}</span>
          {badge && <Badge tone="warn" size="xs">{badge}</Badge>}
        </div>
        <div className="text-xs text-ink3">{d}</div>
      </div>
      <Btn variant="secondary" size="sm">{action}</Btn>
    </div>);

}

// ── My Listings ──────────────────────────────────────────────────────
function MyListingsScreen() {
  const nav = useNav();
  const [tab, setTab] = useState('all');
  // Pretend we own first 4
  const mine = LISTINGS.slice(0, 4).map((l, i) => ({ ...l, status: ['ACTIVE', 'ACTIVE', 'PAUSED', 'DRAFT'][i] }));
  const filtered = tab === 'all' ? mine : mine.filter((l) => l.status.toLowerCase() === tab);

  return (
    <Page>
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-brand-600 mb-1">Account</div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-ink">My listings</h1>
          <p className="text-sm text-ink2 mt-1">Everything you've posted to the marketplace.</p>
        </div>
        <Btn onClick={() => nav.go('new')} variant="dark" icon={<I.Plus size={14} />}>New listing</Btn>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
        { v: mine.length, l: 'Total listings' },
        { v: mine.filter((l) => l.status === 'ACTIVE').length, l: 'Active' },
        { v: mine.reduce((s, l) => s + l.views, 0), l: 'Total views' },
        { v: '12', l: 'Requests this week' }].
        map((s) =>
        <div key={s.l} className="bg-surface border border-line rounded-xl px-4 py-3">
            <div className="text-2xl font-bold text-ink">{s.v}</div>
            <div className="text-[11px] text-ink3">{s.l}</div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-1 border-b border-line">
          {['all', 'active', 'paused', 'draft'].map((t) =>
          <button key={t} onClick={() => setTab(t)}
          className={cx('h-10 px-3 text-sm font-medium border-b-2 -mb-px capitalize',
          tab === t ? 'border-ink text-ink' : 'border-transparent text-ink2 hover:text-ink')}>{t}</button>
          )}
        </div>
        <Input icon={<I.Search size={14} />} placeholder="Search my listings…" className="!w-64" />
      </div>

      <div className="bg-surface border border-line rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-sunken">
            <tr className="text-[11px] font-mono uppercase tracking-wider text-ink3">
              <th className="text-left p-3">Listing</th>
              <th className="text-left p-3 hidden md:table-cell">Status</th>
              <th className="text-left p-3 hidden md:table-cell">Views</th>
              <th className="text-left p-3 hidden md:table-cell">Requests</th>
              <th className="text-left p-3 hidden md:table-cell">Posted</th>
              <th className="text-right p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.map((l) =>
            <tr key={l.id} className="hover:bg-sunken/60">
                <td className="p-3">
                  <button onClick={() => nav.go('listing', { id: l.id })} className="flex items-center gap-3 text-left">
                    <Photo tone={l.swatch} aspect="" className="w-12 h-12 rounded-md flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-ink truncate max-w-[280px]">{l.title}</div>
                      <div className="text-xs text-ink3 mt-0.5 flex items-center gap-1">
                        <Badge tone={l.kind === 'skill' ? 'skill' : 'tool'} size="xs">{l.kind === 'skill' ? 'Skill' : 'Tool'}</Badge>
                        <span>· {l.catLabel}</span>
                      </div>
                    </div>
                  </button>
                </td>
                <td className="p-3 hidden md:table-cell">
                  <Badge tone={l.status === 'ACTIVE' ? 'verified' : l.status === 'PAUSED' ? 'warn' : 'neutral'} size="xs">
                    {l.status.toLowerCase()}
                  </Badge>
                </td>
                <td className="p-3 hidden md:table-cell text-ink2">{l.views}</td>
                <td className="p-3 hidden md:table-cell text-ink2">{Math.floor(l.views * 0.05)}</td>
                <td className="p-3 hidden md:table-cell text-ink3 text-xs">{l.posted}</td>
                <td className="p-3 text-right">
                  <div className="inline-flex items-center gap-0.5">
                    <button className="h-8 w-8 inline-flex items-center justify-center rounded-md text-ink3 hover:text-ink hover:bg-sunken"><I.Edit size={14} /></button>
                    <button className="h-8 w-8 inline-flex items-center justify-center rounded-md text-ink3 hover:text-ink hover:bg-sunken"><I.Pause size={14} /></button>
                    <button className="h-8 w-8 inline-flex items-center justify-center rounded-md text-ink3 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"><I.Trash size={14} /></button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Page>);

}

// ── Saved screen ─────────────────────────────────────────────────────
function SavedScreen({ tweaks }) {
  const saved = [LISTINGS[1], LISTINGS[5], LISTINGS[7]];
  return (
    <Page>
      <div className="mb-6">
        <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-brand-600 mb-1">Saved</div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-ink">Saved listings</h1>
        <p className="text-sm text-ink2 mt-1">Listings you've heart'd to come back to.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {saved.map((l) => <ListingCard key={l.id} listing={l} style={tweaks.cardStyle} />)}
      </div>
    </Page>);

}

// ── How-it-works (marketing-style) ───────────────────────────────────
function HowScreen() {
  return (
    <Page>
      <div className="mb-8">
        <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-brand-600 mb-1">For the curious</div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-ink mb-2">How SkillSwap works</h1>
        <p className="text-base text-ink2 max-w-2xl leading-relaxed">A community marketplace where talent and resources are the currency. No money changes hands. Read the long version below.</p>
      </div>
      <ComingSoon icon={<I.Book size={20} />} title="Long-form guide"
      desc="Worked examples, video walkthrough, and an FAQ that actually answers questions. Hard at work — for now the homepage covers the basics." />
    </Page>);

}

Object.assign(window, { ProfileScreen, SettingsScreen, MyListingsScreen, SavedScreen, HowScreen });