interface StatItem {
  v: string | number;
  l: string;
}

export function MyListingsStats({ stats }: { stats: readonly StatItem[] }) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map((s) => (
        <div key={s.l} className="rounded-xl border border-line bg-surface px-4 py-3">
          <div className="text-2xl font-bold text-ink">{s.v}</div>
          <div className="text-[11px] text-ink3">{s.l}</div>
        </div>
      ))}
    </div>
  );
}
