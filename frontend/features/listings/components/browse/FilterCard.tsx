import type { ReactNode } from "react";

export interface BrowseFilterCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function BrowseFilterCard({ title, subtitle, children }: BrowseFilterCardProps) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="mb-2 flex items-baseline justify-between">
        <h4 className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink3">{title}</h4>
        {subtitle && <span className="text-[10px] text-ink3">{subtitle}</span>}
      </div>
      <div>{children}</div>
    </div>
  );
}
