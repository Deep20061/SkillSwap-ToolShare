// Root app — router, tweaks panel, dark mode, palette.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette":     ["#3b65f1","#1d3fb5","#dde7ff"],
  "cardStyle":   "hybrid",
  "loggedIn":    true,
  "dark":        false,
  "showSoon":    true,
  "startScreen": "home"
}/*EDITMODE-END*/;

// Each entry: chip colors used by TweakColor (hero + accents), plus the actual
// brand hue/chroma used to generate the full Tailwind brand-* scale.
const PALETTES = [
  { key: 'blue',   chips: ['#3b65f1','#1d3fb5','#dde7ff'], hue: 252, c: 0.17 },
  { key: 'forest', chips: ['#199a59','#0d6b3a','#cdebd9'], hue: 152, c: 0.13 },
  { key: 'sunset', chips: ['#e2710d','#a44a07','#f7d9ba'], hue: 38,  c: 0.16 },
  { key: 'slate',  chips: ['#5b6378','#3a4053','#dcdfe7'], hue: 235, c: 0.04 },
];

function applyPalette(value) {
  // value is the chips array; resolve to the palette entry
  const json = JSON.stringify(value);
  const def  = PALETTES.find(p => JSON.stringify(p.chips) === json) || PALETTES[0];
  const r = document.documentElement.style;
  // Light scale
  r.setProperty('--brand-50',  `oklch(0.975 ${def.c * 0.08} ${def.hue})`);
  r.setProperty('--brand-100', `oklch(0.952 ${def.c * 0.18} ${def.hue})`);
  r.setProperty('--brand-200', `oklch(0.905 ${def.c * 0.30} ${def.hue})`);
  r.setProperty('--brand-300', `oklch(0.825 ${def.c * 0.53} ${def.hue})`);
  r.setProperty('--brand-400', `oklch(0.725 ${def.c * 0.76} ${def.hue})`);
  r.setProperty('--brand-500', `oklch(0.625 ${def.c} ${def.hue})`);
  r.setProperty('--brand-600', `oklch(0.555 ${def.c * 1.06} ${def.hue})`);
  r.setProperty('--brand-700', `oklch(0.475 ${def.c * 0.97} ${def.hue})`);
  r.setProperty('--brand-800', `oklch(0.395 ${def.c * 0.79} ${def.hue})`);
  r.setProperty('--brand-900', `oklch(0.300 ${def.c * 0.55} ${def.hue})`);
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Route state: { screen, params }
  const [route, setRoute] = useState({ screen: t.startScreen, params: {} });
  const go = (screen, params = {}) => {
    setRoute({ screen, params });
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'instant' });
  };
  const nav = useMemo(() => ({ go, route }), [route]);

  // Apply palette + dark
  useEffect(() => { applyPalette(t.palette); }, [t.palette]);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', !!t.dark);
  }, [t.dark]);

  // Auth routing: if logged out, force public screens
  useEffect(() => {
    const publicOnly = ['login', 'register', 'how'];
    const allowAnon = ['home', 'browse', 'listing', 'map', 'profile', 'how', 'login', 'register'];
    if (!t.loggedIn && !allowAnon.includes(route.screen)) {
      go('login');
    }
  }, [t.loggedIn, route.screen]);

  // Screen routing
  const isFullBleed = ['login', 'register'].includes(route.screen);
  const showShell = !isFullBleed;

  let screen;
  switch (route.screen) {
    case 'home':         screen = <HomeScreen tweaks={t}/>; break;
    case 'browse':       screen = <BrowseScreen tweaks={t} params={route.params}/>; break;
    case 'listing':      screen = <ListingScreen tweaks={t} params={route.params}/>; break;
    case 'map':          screen = <MapScreen tweaks={t}/>; break;
    case 'messages':     screen = <MessagesScreen params={route.params}/>; break;
    case 'notifications':screen = <NotificationsScreen/>; break;
    case 'exchanges':    screen = <ExchangesScreen/>; break;
    case 'profile':      screen = <ProfileScreen tweaks={t} params={route.params}/>; break;
    case 'settings':     screen = <SettingsScreen/>; break;
    case 'mylistings':   screen = <MyListingsScreen/>; break;
    case 'saved':        screen = <SavedScreen tweaks={t}/>; break;
    case 'new':          screen = <NewListingScreen/>; break;
    case 'how':          screen = <HowScreen/>; break;
    case 'login':        screen = <LoginScreen/>; break;
    case 'register':     screen = <RegisterScreen/>; break;
    default:             screen = <HomeScreen tweaks={t}/>;
  }

  return (
    <NavContext.Provider value={nav}>
      <div className={cx('min-h-screen', t.dark && 'dark')}>
        {showShell && <TopNav tweaks={t}/>}
        <div key={route.screen + JSON.stringify(route.params)} className="animate-fadein">
          {screen}
        </div>
        {showShell && !['map','messages'].includes(route.screen) && <Footer/>}

        {/* Tweaks panel */}
        <TweaksPanel title="Tweaks">
          <TweakSection label="Appearance"/>
          <TweakColor label="Palette" value={t.palette}
            options={PALETTES.map(p => p.chips)}
            onChange={(v) => setTweak('palette', v)}/>
          <TweakToggle label="Dark mode" value={t.dark} onChange={(v) => setTweak('dark', v)}/>

          <TweakSection label="Layout"/>
          <TweakRadio label="Card style" value={t.cardStyle}
            options={[{ value: 'image', label: 'Image' }, { value: 'hybrid', label: 'Hybrid' }, { value: 'text', label: 'Text' }]}
            onChange={(v) => setTweak('cardStyle', v)}/>

          <TweakSection label="State"/>
          <TweakToggle label="Logged in" value={t.loggedIn} onChange={(v) => setTweak('loggedIn', v)}/>
          <TweakToggle label="Show 'coming soon' placeholders" value={t.showSoon} onChange={(v) => setTweak('showSoon', v)}/>

          <TweakSection label="Jump to screen"/>
          <TweakSelect label="Screen" value={route.screen}
            options={[
              { value: 'home',           label: 'Home (marketplace)' },
              { value: 'browse',         label: 'Search / Browse' },
              { value: 'listing',        label: 'Listing detail' },
              { value: 'map',            label: 'Map view' },
              { value: 'messages',       label: 'Messages / Chat' },
              { value: 'notifications',  label: 'Notifications' },
              { value: 'exchanges',      label: 'Exchanges' },
              { value: 'profile',        label: 'Public profile' },
              { value: 'settings',       label: 'Settings' },
              { value: 'mylistings',     label: 'My listings' },
              { value: 'saved',          label: 'Saved' },
              { value: 'new',            label: 'Create listing' },
              { value: 'login',          label: 'Log in' },
              { value: 'register',       label: 'Sign up' },
            ]}
            onChange={(v) => go(v)}/>
        </TweaksPanel>
      </div>
    </NavContext.Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
