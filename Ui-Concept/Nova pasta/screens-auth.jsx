// Auth screens — Login, Register

function AuthShell({ children, title, sub, footer }) {
  const nav = useNav();
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-sunken">
      {/* Left: Brand panel */}
      <aside className="relative hidden lg:flex flex-col p-12 bg-gradient-to-br from-brand-50 via-surface to-surface dark:from-brand-100/20 dark:via-surface dark:to-surface border-r border-line overflow-hidden">
        <div className="absolute inset-0 stripe-ph opacity-30"/>
        <div className="relative flex items-center gap-2 text-brand-600">
          <Logo size={28}/>
          <span className="text-base font-extrabold tracking-tight text-ink">Skill<span className="text-brand-600">Swap</span> & ToolShare</span>
        </div>

        <div className="relative my-auto">
          <Badge tone="brand" className="mb-4"><span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulseDot"/> 12,418 swaps and counting</Badge>
          <h2 className="text-4xl font-extrabold tracking-tight leading-[1.05] text-ink mb-3">
            Your talent.<br/>Their tools.<br/><span className="text-brand-600">Zero euros.</span>
          </h2>
          <p className="text-[15px] text-ink2 max-w-md leading-relaxed">
            A neighbourhood marketplace built on trust, verified profiles, and digital contracts — not money.
          </p>
          <ul className="space-y-2 mt-6">
            {['Verified profiles only', 'Digital contracts sign in 30 seconds', 'Two-way reviews keep things honest'].map(t => (
              <li key={t} className="flex items-center gap-2 text-sm text-ink2"><I.Check size={14} className="text-emerald-500"/> {t}</li>
            ))}
          </ul>
        </div>

        <div className="relative bg-surface border border-line rounded-xl p-4 flex items-center gap-3 max-w-md">
          <Avatar user={USERS[0]} size={36}/>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-ink2 leading-snug">"I fixed bathroom tiles, they taught my daughter guitar. Zero euros."</div>
            <div className="text-[11px] text-ink3 mt-1">{USERS[0].name} · {USERS[0].loc}</div>
          </div>
          <Stars rating={5}/>
        </div>
      </aside>

      {/* Right: Form */}
      <main className="flex flex-col">
        <div className="p-6 flex items-center justify-between">
          <button onClick={() => nav.go('home')} className="flex items-center gap-2 text-brand-600 lg:hidden">
            <Logo size={24}/><span className="text-sm font-bold text-ink">SkillSwap</span>
          </button>
          <div className="ml-auto">{footer}</div>
        </div>
        <div className="flex-1 flex items-center justify-center px-6 pb-12">
          <div className="w-full max-w-md">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-ink mb-1">{title}</h1>
            {sub && <p className="text-sm text-ink2 mb-6">{sub}</p>}
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

function LoginScreen() {
  const nav = useNav();
  return (
    <AuthShell title="Welcome back" sub="Log in to keep swapping with your neighbours."
      footer={<span className="text-sm text-ink2">No account? <button onClick={() => nav.go('register')} className="text-brand-600 font-medium hover:underline">Sign up</button></span>}>
      <div className="space-y-3">
        <Btn variant="secondary" full size="lg" icon={<span className="w-4 h-4 inline-block rounded bg-gradient-to-br from-blue-500 via-rose-500 to-amber-500"/>}>Continue with Google</Btn>
        <Btn variant="secondary" full size="lg" icon={<span className="w-4 h-4 inline-flex items-center justify-center text-ink"></span>}>Continue with Apple</Btn>
      </div>
      <div className="flex items-center gap-3 my-5">
        <span className="flex-1 h-px bg-line"/>
        <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-ink3">or email</span>
        <span className="flex-1 h-px bg-line"/>
      </div>
      <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); nav.go('home'); }}>
        <Field label="Email"><Input type="email" placeholder="you@example.com" defaultValue="joao.borges@example.com"/></Field>
        <Field label="Password" hint={<button type="button" className="text-brand-600 hover:underline">Forgot?</button>}>
          <Input type="password" placeholder="••••••••" defaultValue="passwordhere"/>
        </Field>
        <label className="flex items-center gap-2 text-sm text-ink2 cursor-pointer">
          <input type="checkbox" className="accent-brand-600 rounded" defaultChecked/> Keep me logged in
        </label>
        <Btn variant="primary" full size="lg" type="submit">Log in</Btn>
      </form>
      <p className="text-[11px] text-ink3 text-center mt-6 leading-relaxed">
        By logging in you agree to the <a href="#" className="underline">Terms of service</a> and acknowledge our <a href="#" className="underline">Privacy policy</a>.
      </p>
    </AuthShell>
  );
}

function RegisterScreen() {
  const nav = useNav();
  return (
    <AuthShell title="Join SkillSwap" sub="Free forever. No card. Verified profiles only."
      footer={<span className="text-sm text-ink2">Have an account? <button onClick={() => nav.go('login')} className="text-brand-600 font-medium hover:underline">Log in</button></span>}>
      <div className="space-y-3">
        <Btn variant="secondary" full size="lg" icon={<span className="w-4 h-4 inline-block rounded bg-gradient-to-br from-blue-500 via-rose-500 to-amber-500"/>}>Sign up with Google</Btn>
        <Btn variant="secondary" full size="lg" icon={<span className="w-4 h-4 inline-flex items-center justify-center text-ink"></span>}>Sign up with Apple</Btn>
      </div>
      <div className="flex items-center gap-3 my-5">
        <span className="flex-1 h-px bg-line"/>
        <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-ink3">or email</span>
        <span className="flex-1 h-px bg-line"/>
      </div>
      <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); nav.go('home'); }}>
        <Field label="Full name"><Input placeholder="João Borges"/></Field>
        <Field label="Email"><Input type="email" placeholder="you@example.com"/></Field>
        <Field label="Password" hint="8+ chars"><Input type="password" placeholder="••••••••"/></Field>
        <Field label="City"><Input placeholder="Braga"/></Field>
        <label className="flex items-start gap-2 text-xs text-ink2">
          <input type="checkbox" className="accent-brand-600 rounded mt-0.5" defaultChecked/>
          <span>I agree to the <a className="underline" href="#">Terms</a>, <a className="underline" href="#">Privacy</a> and Community Code of Conduct.</span>
        </label>
        <Btn variant="primary" full size="lg" type="submit">Create account</Btn>
      </form>
    </AuthShell>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-ink3">{label}</span>
        {hint && <span className="text-[11px]">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

Object.assign(window, { LoginScreen, RegisterScreen });
