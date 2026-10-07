"use client";

import { cx } from "@/lib/utils";
import { PROFILE_TABS, type ProfileTab } from "./constants";

interface ProfileTabsProps {
  tab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  listingsCount: number;
  reviewCount: number;
}

export function ProfileTabs({ tab, onTabChange, listingsCount, reviewCount }: ProfileTabsProps) {
  return (
    <div className="mb-6 flex items-center gap-0 border-b border-line">
      {PROFILE_TABS.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onTabChange(t)}
          className={cx(
            "-mb-px h-10 shrink-0 whitespace-nowrap border-b-2 px-5 text-sm font-medium capitalize",
            tab === t ? "border-ink text-ink" : "border-transparent text-ink2 hover:text-ink"
          )}
        >
          {t === "listings"
            ? `Listings (${listingsCount})`
            : t === "reviews"
              ? `Reviews (${reviewCount})`
              : "About"}
        </button>
      ))}
    </div>
  );
}
