// Shell components — top nav, sidebars, common primitives, router context.

const { useState, useEffect, useRef, useMemo, createContext, useContext } = React;

// ── Router context (lightweight) ─────────────────────────────────────
const NavContext = createContext(null);
const useNav = () => useContext(NavContext);

// ── Atoms ────────────────────────────────────────────────────────────
const cx = (...a) => a.filter(Boolean).join(' ');

function Avatar({ user, size = 32, ring = false, className = '' }) {
  if (!user) return null;
  const tone = TONE[user.tone] || TONE.sky;
  const initials = user.avatar || user.name.split(' ').map((n) => n[0]).slice(0, 2).join('');
  return (
    <div
      className={cx(
        'inline-flex items-center justify-center rounded-full font-semibold flex-shrink-0',
        tone.bg, tone.fg, ring && 'ring-2 ring-white dark:ring-surface',
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.38 }}>
      
      {initials}
    </div>);

}

function Stars({ rating, size = 12, className = '' }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className={cx('inline-flex items-center gap-0.5 text-amber-500', className)}>
      {Array.from({ length: 5 }).map((_, i) =>
      <I.StarFill key={i} size={size}
      className={i < full ? '' : i === full && half ? 'opacity-60' : 'opacity-20'} />
      )}
    </span>);

}

function Badge({ children, tone = 'neutral', size = 'sm', className = '' }) {
  const tones = {
    brand: 'bg-brand-50 text-brand-700 dark:bg-brand-100 dark:text-brand-700 border border-brand-200',
    skill: 'bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300 border border-violet-200 dark:border-violet-500/30',
    tool: 'bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30',
    verified: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30',
    warn: 'bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30',
    danger: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30',
    neutral: 'bg-sunken text-ink2 border border-line',
    soon: 'bg-sunken text-ink3 border border-dashed border-line2'
  };
  const sizes = { xs: 'text-[10px] px-1.5 py-0.5', sm: 'text-[11px] px-2 py-0.5', md: 'text-xs px-2.5 py-1' };
  return (
    <span className={cx('inline-flex items-center gap-1 rounded-md font-medium tracking-wide whitespace-nowrap', tones[tone], sizes[size], className)}>
      {children}
    </span>);

}

function Btn({ children, variant = 'primary', size = 'md', icon, iconRight, full, className = '', ...rest }) {
  const variants = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-sm',
    secondary: 'bg-surface border border-line2 text-ink hover:bg-sunken active:bg-sunken',
    ghost: 'text-ink2 hover:bg-sunken hover:text-ink',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
    soft: 'bg-brand-50 text-brand-700 hover:bg-brand-100',
    dark: 'bg-ink text-surface hover:opacity-90'
  };
  const sizes = {
    sm: 'h-8 px-3 text-xs gap-1.5 rounded-md',
    md: 'h-10 px-4 text-sm gap-2 rounded-lg',
    lg: 'h-12 px-6 text-[15px] gap-2 rounded-lg',
    icon: 'h-9 w-9 rounded-md'
  };
  return (
    <button
      className={cx('inline-flex items-center justify-center font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none',
      variants[variant], sizes[size], full && 'w-full', className)}
      {...rest}>
      
      {icon}{children}{iconRight}
    </button>);

}

function Input({ icon, iconRight, className = '', ...rest }) {
  return (
    <div className="relative">
      {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink3 pointer-events-none">{icon}</span>}
      <input
        className={cx(
          'w-full h-10 rounded-lg bg-surface border border-line2 text-sm text-ink placeholder-ink3',
          'focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-colors',
          icon ? 'pl-9' : 'pl-3', iconRight ? 'pr-9' : 'pr-3', className
        )}
        {...rest} />
      
      {iconRight && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink3">{iconRight}</span>}
    </div>);

}

// ── Soon placeholder ─────────────────────────────────────────────────
function ComingSoon({ title, desc, icon, children }) {
  return (
    <div className="rounded-2xl border border-dashed border-line2 bg-surface p-10 md:p-14 text-center stripe-ph">
      <div className="bg-surface inline-block rounded-2xl px-8 py-10 border border-line">
        <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 inline-flex items-center justify-center mb-4">{icon}</div>
        <div className="text-xs font-mono uppercase tracking-[0.18em] text-brand-600 mb-2">Coming soon · placeholder</div>
        <h3 className="text-xl font-bold tracking-tight text-ink mb-2">{title}</h3>
        <p className="text-sm text-ink2 max-w-md mx-auto leading-relaxed">{desc}</p>
        {children && <div className="mt-5">{children}</div>}
      </div>
    </div>);

}

// ── Image placeholder (categorised by tone) ──────────────────────────
function Photo({ tone = 'sky', label, aspect = 'aspect-[4/3]', className = '', children }) {
  const t = TONE[tone] || TONE.sky;
  return (
    <div className={cx('relative overflow-hidden', aspect, t.block, className)}>
      <div className="absolute inset-0 stripe-ph opacity-40" />
      <div className={cx('absolute inset-0 bg-gradient-to-br', t.bar, 'opacity-60')} />
      {label &&
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-ink2 bg-white/70 dark:bg-black/30 backdrop-blur px-1.5 py-0.5 rounded">{label}</span>
        </div>
      }
      {children}
    </div>);

}

// ── Top Nav ──────────────────────────────────────────────────────────
function TopNav({ tweaks }) {
  const nav = useNav();
  const loggedIn = tweaks.loggedIn;
  const unreadMsgs = CONVERSATIONS.filter((c) => c.unread > 0).length;
  const unreadNots = NOTIFICATIONS.filter((n) => n.unread).length;
  const [search, setSearch] = useState('');
  const [menu, setMenu] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    const off = (e) => {if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(false);};
    document.addEventListener('mousedown', off);
    return () => document.removeEventListener('mousedown', off);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-surface/85 backdrop-blur border-b border-line">
      <div className="w-full px-4 md:px-6 lg:px-8 h-16 flex items-center gap-3 md:gap-5">
        {/* Logo */}
        <button onClick={() => nav.go('home')} className="flex items-center gap-2 text-brand-600 flex-shrink-0">
          <Logo size={26} />
          <span className="text-[15px] font-extrabold tracking-tight text-ink hidden sm:block">
            Skill<span className="text-brand-600">Swap</span>
          </span>
        </button>

        {/* Search */}
        <div className="flex-1 min-w-0">
          <form onSubmit={(e) => {e.preventDefault();nav.go('browse', { q: search });}}>
            <Input
              icon={<I.Search size={16} />}
              iconRight={<kbd className="hidden md:inline text-[10px] font-mono text-ink3 border border-line rounded px-1">⌘K</kbd>}
              placeholder="Search skills, tools, neighbours…"
              value={search}
              onChange={(e) => setSearch(e.target.value)} />
            
          </form>
        </div>

        {/* Right cluster */}
        <nav className="flex items-center gap-1">
          <button
            onClick={() => nav.go('map')}
            className="hidden md:inline-flex items-center gap-1.5 h-9 px-3 rounded-md text-sm text-ink2 hover:bg-sunken hover:text-ink">
            
            <I.Map size={16} /> Map
          </button>
          {loggedIn &&
          <Btn onClick={() => nav.go('new')} className="hidden md:inline-flex" variant="dark" size="sm" icon={<I.Plus size={14} />}>Post</Btn>
          }

          {loggedIn ?
          <>
              <IconBtn label="Messages" onClick={() => nav.go('messages')} badge={unreadMsgs}>
                <I.Msg size={18} />
              </IconBtn>
              <IconBtn label="Notifications" onClick={() => nav.go('notifications')} badge={unreadNots}>
                <I.Bell size={18} />
              </IconBtn>
              <div className="relative" ref={menuRef}>
                <button
                onClick={() => setMenu((v) => !v)}
                className="ml-1 flex items-center gap-2 pl-1 pr-2 h-9 rounded-full hover:bg-sunken">
                
                  <Avatar user={ME} size={28} />
                  <I.ChevDown size={14} className="text-ink3" />
                </button>
                {menu && <UserMenu onClose={() => setMenu(false)} />}
              </div>
            </> :

          <>
              <Btn onClick={() => nav.go('login')} variant="ghost" size="sm">Log in</Btn>
              <Btn onClick={() => nav.go('register')} variant="primary" size="sm">Sign up</Btn>
            </>
          }
        </nav>
      </div>

      {/* Category chip bar */}
      <CategoryBar />
    </header>);

}

function IconBtn({ children, badge, label, ...rest }) {
  return (
    <button
      title={label}
      className="relative h-9 w-9 inline-flex items-center justify-center rounded-md text-ink2 hover:bg-sunken hover:text-ink"
      {...rest}>
      
      {children}
      {badge > 0 &&
      <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-1 rounded-full bg-brand-600 text-white text-[9px] font-bold inline-flex items-center justify-center ring-2 ring-surface leading-none">
          {badge}
        </span>
      }
    </button>);

}

function UserMenu({ onClose }) {
  const nav = useNav();
  const go = (to) => {nav.go(to);onClose();};
  return (
    <div className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-surface border border-line shadow-pop overflow-hidden animate-fadein">
      <div className="p-3 border-b border-line flex items-center gap-3">
        <Avatar user={ME} size={40} />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-ink truncate">{ME.name}</div>
          <div className="text-xs text-ink3 truncate">{ME.email}</div>
        </div>
      </div>
      <div className="py-1">
        {[
        { l: 'Your profile', ic: <I.User size={15} />, to: 'profile' },
        { l: 'My listings', ic: <I.Layers size={15} />, to: 'mylistings' },
        { l: 'Exchanges', ic: <I.ArrowSwap size={15} />, to: 'exchanges' },
        { l: 'Saved', ic: <I.Heart size={15} />, to: 'saved' },
        { l: 'Settings', ic: <I.Settings size={15} />, to: 'settings' }].
        map((i) =>
        <button key={i.l} onClick={() => go(i.to)}
        className="w-full px-3 py-2 flex items-center gap-2.5 text-sm text-ink2 hover:bg-sunken hover:text-ink">
            <span className="text-ink3">{i.ic}</span>{i.l}
          </button>
        )}
      </div>
      <div className="border-t border-line py-1">
        <button onClick={() => go('login')}
        className="w-full px-3 py-2 flex items-center gap-2.5 text-sm text-ink2 hover:bg-sunken hover:text-ink">
          <span className="text-ink3"><I.Logout size={15} /></span>Log out
        </button>
      </div>
    </div>);

}

function CategoryBar() {
  const nav = useNav();
  return (
    <div className="border-t border-line bg-surface">
      <div className="w-full px-4 md:px-6 lg:px-8 scroll-x">
        <div className="flex items-center gap-1 py-2 min-w-max">
          <button onClick={() => nav.go('browse', { kind: 'all' })}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs text-ink2 hover:bg-sunken hover:text-ink whitespace-nowrap">
            <I.Compass size={14} /> Browse all
          </button>
          <button onClick={() => nav.go('browse', { kind: 'skill' })}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs text-ink2 hover:bg-sunken hover:text-ink whitespace-nowrap">
            <I.Hand size={14} /> Skills
          </button>
          <button onClick={() => nav.go('browse', { kind: 'tool' })}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs text-ink2 hover:bg-sunken hover:text-ink whitespace-nowrap">
            <I.Tools size={14} /> Tools
          </button>
          <div className="h-5 w-px bg-line mx-1" />
          {CATEGORIES.map((c) => {
            const Ic = CAT_ICON[c.icon];
            return (
              <button key={c.id} onClick={() => nav.go('browse', { cat: c.id })}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs text-ink2 hover:bg-sunken hover:text-ink whitespace-nowrap">
                <Ic size={14} /> {c.label}
              </button>);

          })}
        </div>
      </div>
    </div>);

}

// ── Footer ───────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2">
          <div className="flex items-center gap-2 text-brand-600 mb-3">
            <Logo size={24} />
            <span className="text-[15px] font-extrabold tracking-tight text-ink">Skill<span className="text-brand-600">Swap</span> & ToolShare</span>
          </div>
          <p className="text-sm text-ink2 max-w-sm leading-relaxed">
            Your talent and tools are the currency. A neighbourhood exchange platform — no money changes hands.
          </p>
          <div className="flex items-center gap-2 mt-4">
            <Badge tone="verified">Lisbon · Porto · Braga</Badge>
            <Badge tone="brand">EU · pt</Badge>
          </div>
        </div>
        {[
        { h: 'Marketplace', l: ['Browse skills', 'Browse tools', 'Map view', 'Categories'] },
        { h: 'Trust', l: ['Verification', 'Digital contracts', 'Deposits', 'Community rules'] },
        { h: 'Help', l: ['How it works', 'FAQ', 'Safety', 'Contact'] }].
        map((col) =>
        <div key={col.h}>
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-ink3 mb-3">{col.h}</div>
            <ul className="space-y-2">
              {col.l.map((l) => <li key={l}><a href="#" className="text-sm text-ink2 hover:text-ink">{l}</a></li>)}
            </ul>
          </div>
        )}
      </div>
      <div className="border-t border-line">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 py-4 flex items-center justify-between text-xs text-ink3">
          <span>© 2026 SkillSwap. No money. Just talent, tools, trust.</span>
          <span className="hidden md:inline">Built in Braga · PT</span>
        </div>
      </div>
    </footer>);

}

// ── Listing Card ─────────────────────────────────────────────────────
// Three card styles selectable via tweaks.cardStyle: 'image' | 'hybrid' | 'text'
function ListingCard({ listing, style = 'hybrid', compact = false }) {
  const nav = useNav();
  const owner = findUser(listing.ownerId);
  const isSkill = listing.kind === 'skill';
  const [saved, setSaved] = useState(false);

  return (
    <div onClick={() => nav.go('listing', { id: listing.id })}
    className="group relative bg-surface border border-line rounded-2xl overflow-hidden hover:border-line2 hover:shadow-card transition-all cursor-pointer">

      {/* Image */}
      {style !== 'text' &&
      <div className="relative">
          <Photo tone={listing.swatch} label={listing.catLabel} aspect={compact ? 'aspect-[5/3]' : 'aspect-[4/3]'} />
          {/* Save heart */}
          <button
          onClick={(e) => {e.stopPropagation();setSaved((s) => !s);}}
          className="absolute top-2.5 right-2.5 h-8 w-8 rounded-full bg-white/85 dark:bg-black/40 backdrop-blur inline-flex items-center justify-center text-ink2 hover:text-rose-500">
          
            {saved ? <I.HeartFill size={16} className="text-rose-500" /> : <I.Heart size={15} />}
          </button>
          {/* Type pill */}
          <div className="absolute top-2.5 left-2.5">
            <Badge tone={isSkill ? 'skill' : 'tool'} size="xs">
              {isSkill ? <I.Hand size={10} /> : <I.Tools size={10} />}
              {isSkill ? 'Skill' : 'Tool'}
            </Badge>
          </div>
        </div>
      }

      {/* Body */}
      <div className={cx('p-4', style === 'text' && 'pt-4')}>
        {style === 'text' &&
        <div className="flex items-center gap-1.5 mb-2">
            <Badge tone={isSkill ? 'skill' : 'tool'} size="xs">
              {isSkill ? <I.Hand size={10} /> : <I.Tools size={10} />}
              {isSkill ? 'Skill' : 'Tool'}
            </Badge>
            {owner.verified && <Badge tone="verified" size="xs"><I.Shield size={9} /> Verified</Badge>}
          </div>
        }

        <h3 className="font-semibold text-[15px] text-ink leading-snug line-clamp-2 mb-1.5">
          {listing.title}
        </h3>

        {/* Meta row */}
        <div className="flex items-center gap-1.5 text-[12px] text-ink2 mb-3 flex-wrap">
          {isSkill ?
          <>
              <span className="font-medium text-ink">{listing.hours}h session</span>
              <span className="text-ink3">·</span>
              <span>{listing.level}</span>
            </> :

          <>
              <span className="font-medium text-ink">€{listing.deposit} deposit</span>
              <span className="text-ink3">·</span>
              <span>up to {listing.maxDays}d</span>
              <span className="text-ink3">·</span>
              <span>{listing.condition}</span>
            </>
          }
        </div>

        {style === 'text' &&
        <p className="text-xs text-ink2 leading-relaxed line-clamp-2 mb-3">{listing.desc}</p>
        }

        {/* Footer row */}
        <div className="flex items-center justify-between pt-3 border-t border-line">
          <button
            onClick={(e) => {e.stopPropagation();nav.go('profile', { id: owner.id });}}
            className="flex items-center gap-2 min-w-0">
            
            <Avatar user={owner} size={22} />
            <div className="min-w-0">
              <div className="text-xs font-medium text-ink truncate max-w-[120px]">{owner.name.split(' ')[0]}</div>
              <div className="text-[10px] text-ink3 flex items-center gap-1">
                <Stars rating={owner.rating} size={9} />
                <span>{owner.rating}</span>
              </div>
            </div>
          </button>
          <div className="text-[11px] text-ink3 flex items-center gap-1 flex-shrink-0">
            <I.Pin size={10} /> {listing.distance}km
          </div>
        </div>
      </div>
    </div>);

}

// ── Compact list-row variant ─────────────────────────────────────────
function ListingRow({ listing }) {
  const nav = useNav();
  const owner = findUser(listing.ownerId);
  const isSkill = listing.kind === 'skill';
  return (
    <div onClick={() => nav.go('listing', { id: listing.id })}
    className="flex gap-4 p-4 bg-surface border border-line rounded-xl hover:border-line2 hover:shadow-card cursor-pointer transition-all">
      <Photo tone={listing.swatch} aspect="" className="w-28 h-28 rounded-lg flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <Badge tone={isSkill ? 'skill' : 'tool'} size="xs">
            {isSkill ? 'Skill' : 'Tool'}
          </Badge>
          {owner.verified && <Badge tone="verified" size="xs"><I.Shield size={9} /> Verified</Badge>}
          <Badge tone="neutral" size="xs">{listing.catLabel}</Badge>
        </div>
        <h3 className="font-semibold text-[15px] text-ink leading-tight mb-1 line-clamp-1">{listing.title}</h3>
        <p className="text-xs text-ink2 leading-relaxed line-clamp-2 mb-2">{listing.desc}</p>
        <div className="flex items-center gap-3 text-[11px] text-ink2">
          <span className="flex items-center gap-1"><Avatar user={owner} size={16} /> {owner.name.split(' ')[0]}</span>
          <span className="flex items-center gap-0.5"><I.StarFill size={10} className="text-amber-500" /> {owner.rating}</span>
          <span className="flex items-center gap-1"><I.Pin size={10} /> {listing.distance}km</span>
          <span className="text-ink3">· {listing.posted}</span>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-base font-bold text-ink">
          {isSkill ? `${listing.hours}h` : `€${listing.deposit}`}
        </div>
        <div className="text-[10px] text-ink3 uppercase tracking-wider">
          {isSkill ? 'per session' : 'deposit'}
        </div>
      </div>
    </div>);

}

// ── Page container ───────────────────────────────────────────────────
function Page({ children, wide = false }) {
  return (
    <div className={cx('w-full mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8', wide ? 'max-w-[1600px]' : 'max-w-[1280px]')}>
      <div className="animate-fadein">{children}</div>
    </div>);

}

// ── Section title ────────────────────────────────────────────────────
function SectionHead({ kicker, title, action, actionLabel = 'See all', icon }) {
  const nav = useNav();
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        {kicker && <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-brand-600 mb-1">{kicker}</div>}
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-ink flex items-center gap-2">
          {icon}{title}
        </h2>
      </div>
      {action &&
      <button onClick={() => nav.go(...action)} className="text-sm text-ink2 hover:text-ink flex items-center gap-1 group">
          {actionLabel} <I.Chev size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      }
    </div>);

}

Object.assign(window, {
  NavContext, useNav, cx,
  Avatar, Stars, Badge, Btn, Input, ComingSoon, Photo, IconBtn,
  TopNav, Footer,
  ListingCard, ListingRow,
  Page, SectionHead
});