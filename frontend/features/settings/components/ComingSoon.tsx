export interface ComingSoonProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

export function ComingSoon({ icon, title, desc }: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-sunken text-ink3">
        {icon}
      </div>
      <div className="font-semibold text-ink">{title}</div>
      <p className="max-w-sm text-sm text-ink2">{desc}</p>
      <span className="rounded-full border border-line px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-ink3">
        Coming soon
      </span>
    </div>
  );
}
