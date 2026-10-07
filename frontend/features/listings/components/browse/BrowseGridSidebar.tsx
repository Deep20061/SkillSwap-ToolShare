"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { MapIcon, Search, Shield } from "@/components/ui/Icons";
import { BrowseFilterCard } from "@/features/listings/components/browse/FilterCard";
import type { Listing, ListingType } from "@/features/listings/types";
import type { Category } from "@/features/listings/hooks/useCategories";

export interface BrowseGridSidebarProps {
  query: string;
  setQuery: (value: string) => void;
  handleSearch: (event: React.FormEvent) => void;
  selectedType: ListingType | "";
  paginationTotal: number;
  listings: Listing[];
  handleTypeChange: (type: ListingType | "") => void;
  categories: Category[];
  categoryId?: string;
  distanceKm?: number;
  setDistanceKm: (km: number) => void;
  verifiedOnly: boolean;
  setVerifiedOnly: (value: boolean) => void;
  superHostOnly: boolean;
  setSuperHostOnly: (value: boolean) => void;
  minDeposit: string;
  setMinDeposit: (value: string) => void;
  maxDeposit: string;
  setMaxDeposit: (value: string) => void;
  hasFilters: boolean;
  clearAll: () => void;
  onSwitchToMap: () => void;
}

export function BrowseGridSidebar({
  query,
  setQuery,
  handleSearch,
  selectedType,
  paginationTotal,
  listings,
  handleTypeChange,
  categories,
  categoryId,
  distanceKm,
  setDistanceKm,
  verifiedOnly,
  setVerifiedOnly,
  superHostOnly,
  setSuperHostOnly,
  minDeposit,
  setMinDeposit,
  maxDeposit,
  setMaxDeposit,
  hasFilters,
  clearAll,
  onSwitchToMap,
}: BrowseGridSidebarProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  function navigateCategory(nextCategoryId: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextCategoryId) {
      params.set("categoryId", nextCategoryId);
    } else {
      params.delete("categoryId");
    }
    router.push(`/listings?${params.toString()}`);
  }

  const typeOptions = [
    { value: "" as const, label: "All listings", count: paginationTotal },
    {
      value: "SKILL_OFFER" as const,
      label: "Skills",
      count: listings.filter((listing) => listing.type === "SKILL_OFFER").length,
    },
    {
      value: "TOOL_LISTING" as const,
      label: "Tools",
      count: listings.filter((listing) => listing.type === "TOOL_LISTING").length,
    },
  ];

  return (
    <aside className="space-y-5 self-start md:sticky md:top-32 md:max-h-[calc(100vh-9rem)] md:overflow-y-auto md:pr-1">
      <form onSubmit={handleSearch}>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink3">
            <Search size={16} />
          </span>
          <input
            className="h-10 w-full rounded-lg border border-line2 bg-surface pl-9 pr-3 text-sm text-ink placeholder-ink3 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
            placeholder="Search listings…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </form>

      <BrowseFilterCard title="Type">
        {typeOptions.map((option) => (
          <label key={option.value} className="flex cursor-pointer items-center gap-2 py-1 text-sm">
            <input
              type="radio"
              name="kind"
              className="accent-brand-600"
              checked={selectedType === option.value}
              onChange={() => handleTypeChange(option.value)}
            />
            <span className="flex-1 text-ink2">{option.label}</span>
            <span className="font-mono text-xs text-ink3">{option.count}</span>
          </label>
        ))}
      </BrowseFilterCard>

      {categories.length > 0 && (
        <BrowseFilterCard title="Category">
          <label className="flex cursor-pointer items-center gap-2 py-1 text-sm">
            <input
              type="radio"
              name="cat"
              className="accent-brand-600"
              checked={!categoryId}
              onChange={() => navigateCategory(null)}
            />
            <span className="text-ink2">All categories</span>
          </label>
          {categories.map((category) => (
            <label
              key={category.id}
              className="flex cursor-pointer items-center gap-2 py-1 text-sm"
            >
              <input
                type="radio"
                name="cat"
                className="accent-brand-600"
                checked={categoryId === category.id}
                onChange={() => navigateCategory(category.id)}
              />
              <span className="flex-1 text-ink2">{category.name}</span>
            </label>
          ))}
        </BrowseFilterCard>
      )}

      <BrowseFilterCard title="Distance">
        <div className="mb-2 text-sm text-ink2">
          Within <span className="font-semibold text-ink">{distanceKm ?? 10} km</span>
        </div>
        <input
          type="range"
          min="1"
          max="20"
          className="w-full accent-brand-600"
          value={distanceKm ?? 10}
          onChange={(event) => setDistanceKm(+event.target.value)}
        />
        <div className="mt-1 flex justify-between font-mono text-[10px] text-ink3">
          <span>1km</span>
          <span>10km</span>
          <span>20km</span>
        </div>
      </BrowseFilterCard>

      <BrowseFilterCard title="Host">
        <label className="flex cursor-pointer items-center gap-2 py-1 text-sm">
          <input
            type="checkbox"
            className="rounded accent-brand-600"
            checked={verifiedOnly}
            onChange={(event) => setVerifiedOnly(event.target.checked)}
          />
          <span className="flex-1 text-ink2">Verified identity</span>
          <Shield size={12} className="text-emerald-500" />
        </label>
        <label className="flex cursor-pointer items-center gap-2 py-1 text-sm">
          <input
            type="checkbox"
            className="rounded accent-brand-600"
            checked={superHostOnly}
            onChange={(event) => setSuperHostOnly(event.target.checked)}
          />
          <span className="text-ink2">Super-host</span>
        </label>
      </BrowseFilterCard>

      <BrowseFilterCard title="Deposit (tools)">
        <div className="grid grid-cols-2 gap-2">
          <input
            className="h-10 w-full rounded-lg border border-line2 bg-surface pl-3 pr-3 text-sm text-ink placeholder-ink3 focus:outline-none focus:ring-2 focus:ring-brand-200"
            placeholder="Min €"
            value={minDeposit}
            onChange={(event) => setMinDeposit(event.target.value)}
          />
          <input
            className="h-10 w-full rounded-lg border border-line2 bg-surface pl-3 pr-3 text-sm text-ink placeholder-ink3 focus:outline-none focus:ring-2 focus:ring-brand-200"
            placeholder="Max €"
            value={maxDeposit}
            onChange={(event) => setMaxDeposit(event.target.value)}
          />
        </div>
      </BrowseFilterCard>

      <button
        type="button"
        onClick={onSwitchToMap}
        className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-line text-sm text-ink2 transition-colors hover:bg-sunken hover:text-ink"
      >
        <MapIcon size={14} /> Switch to map view
      </button>

      {hasFilters && (
        <button
          type="button"
          onClick={clearAll}
          className="text-sm text-ink2 underline underline-offset-2 hover:text-ink"
        >
          Reset all filters
        </button>
      )}
    </aside>
  );
}
