import type { ReactNode } from "react";

export interface CreateListingStepPanelProps {
  title: string;
  sub?: string;
  children: ReactNode;
}

export function CreateListingStepPanel({ title, sub, children }: CreateListingStepPanelProps) {
  return (
    <div>
      <h2 className="mb-1 text-xl font-bold tracking-tight text-ink md:text-2xl">{title}</h2>
      {sub && <p className="mb-6 max-w-xl text-sm text-ink2">{sub}</p>}
      {children}
    </div>
  );
}
