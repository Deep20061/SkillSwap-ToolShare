import type { ReactNode } from "react";

export interface CreateListingFormFieldProps {
  label: string;
  hint?: string;
  children: ReactNode;
}

export function CreateListingFormField({ label, hint, children }: CreateListingFormFieldProps) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink3">{label}</span>
        {hint && <span className="text-[10px] text-ink3">{hint}</span>}
      </div>
      {children}
    </label>
  );
}
