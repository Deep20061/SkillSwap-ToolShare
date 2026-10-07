"use client";

import { Search } from "@/components/ui/Icons";
import { cx } from "@/lib/utils";

const TABS = ["all", "active", "paused", "archived"] as const;
export type MyListingsTab = (typeof TABS)[number];

interface MyListingsToolbarProps {
  tab: MyListingsTab;
  onTabChange: (tab: MyListingsTab) => void;
  search: string;
  onSearchChange: (value: string) => void;
}

export function MyListingsToolbar({
  tab,
  onTabChange,
  search,
  onSearchChange,
}: MyListingsToolbarProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-1 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onTabChange(t)}
            className={cx(
              "-mb-px h-10 border-b-2 px-3 text-sm font-medium capitalize",
              tab === t ? "border-ink text-ink" : "border-transparent text-ink2 hover:text-ink"
            )}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink3">
          <Search size={14} />
        </span>
        <input
          className="h-9 w-56 rounded-lg border border-line2 bg-surface pl-9 pr-3 text-sm text-ink placeholder-ink3 focus:outline-none focus:ring-2 focus:ring-brand-200"
          placeholder="Search my listings…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}
