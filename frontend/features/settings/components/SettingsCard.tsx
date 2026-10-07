export interface SettingsCardProps {
  title: string;
  desc?: string;
  children: React.ReactNode;
}

export function SettingsCard({ title, desc, children }: SettingsCardProps) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-5 md:p-6">
      <header className="mb-5">
        <h2 className="text-lg font-bold text-ink">{title}</h2>
        {desc && <p className="mt-0.5 text-sm text-ink2">{desc}</p>}
      </header>
      {children}
    </section>
  );
}

export function Divider() {
  return <div className="my-6 border-t border-line" />;
}
