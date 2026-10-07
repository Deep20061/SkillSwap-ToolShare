"use client";

import { cx } from "@/lib/utils";

export interface ToggleRowProps {
  label: string;
  desc?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function ToggleRow({ label, desc, checked, onChange, disabled }: ToggleRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line py-3 last:border-0">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-ink">{label}</div>
        {desc && <div className="mt-0.5 text-xs text-ink3">{desc}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className={cx(
          "relative inline-block h-5 w-9 flex-shrink-0 rounded-full transition-colors disabled:opacity-40",
          checked ? "bg-brand-600" : "bg-line2"
        )}
      >
        <span
          className={cx(
            "absolute top-0.5 block h-4 w-4 rounded-full bg-white shadow-sm transition-all",
            checked ? "left-4" : "left-0.5"
          )}
        />
      </button>
    </div>
  );
}
