import type { ReactNode } from "react";

export function ListingDetailKV({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-sunken p-3">
      <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink3">
        {label}
      </div>
      <div className="text-sm font-semibold text-ink">{value}</div>
    </div>
  );
}

export function ListingEditLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-ink3">
      {children}
    </div>
  );
}

export function ListingDetailSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-8">
      <div className="mb-3">
        <h2 className="text-lg font-bold tracking-tight text-ink">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-ink3">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}
