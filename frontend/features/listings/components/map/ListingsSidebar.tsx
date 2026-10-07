"use client";

import Link from "next/link";
import type { Ref } from "react";
import type { ListingType } from "@/features/listings/types";
import { useCategories } from "@/features/listings/hooks/useCategories";

interface ListingsSidebarProps {
  selectedType: ListingType | "";
  query: string;
  setQuery: (v: string) => void;
  selectedTag: string;
  tagInput: string;
  setTagInput: (v: string) => void;
  tagInputRef: Ref<HTMLInputElement>;
  hasFilters: boolean;
  handleTypeChange: (t: ListingType | "") => void;
  handleSearch: (e: React.FormEvent) => void;
  handleTagSearch: (e: React.FormEvent) => void;
  clearTag: () => void;
  clearAll: () => void;
  // New props
  geoAvailable: boolean;
  selectedCategory?: string;
  onCategoryChange: (id: string | undefined) => void;
  selectedDistance?: number;
  onDistanceChange?: (km: number | undefined) => void;
  _verifiedIdentity?: boolean;
  _onVerifiedIdentityChange?: (v: boolean) => void;
  superHost?: boolean;
  onSuperHostChange?: (v: boolean) => void;
  minDeposit?: string;
  onMinDepositChange?: (v: string) => void;
  maxDeposit?: string;
  onMaxDepositChange?: (v: string) => void;
}

const sectionLabel =
  "text-[0.55rem] tracking-[0.18em] uppercase text-slate-400 mb-2 block font-mono";

export function ListingsSidebar({
  selectedType,
  query,
  setQuery,
  selectedTag,
  tagInput,
  setTagInput,
  tagInputRef,
  hasFilters,
  handleTypeChange,
  handleSearch,
  handleTagSearch,
  clearTag,
  clearAll,
  geoAvailable,
  selectedCategory,
  onCategoryChange,
  selectedDistance,
  onDistanceChange,
  _verifiedIdentity,
  _onVerifiedIdentityChange,
  superHost,
  onSuperHostChange,
  minDeposit,
  onMinDepositChange,
  maxDeposit,
  onMaxDepositChange,
}: ListingsSidebarProps) {
  const { categories, loading: catLoading } = useCategories();

  const showDeposit = selectedType === "TOOL_LISTING" || selectedType === "";

  return (
    <aside className="scrollbar-hide sticky top-14 hidden h-[calc(100vh-56px)] min-h-[calc(100vh-56px)] w-72 shrink-0 flex-col overflow-y-auto border-r border-slate-100 bg-white md:flex">
      {/* Sidebar header */}
      <div className="border-b border-slate-100 px-6 pb-4 pt-6">
        <div className="mb-1 font-serif text-lg font-bold tracking-tight text-slate-900">
          Marketplace
        </div>
        <div className="font-mono text-xs text-slate-400">Filter & discover</div>
      </div>

      <div className="scrollbar-hide flex-1 space-y-6 overflow-y-auto px-6 py-5">
        {/* Post listing CTA */}
        <Link
          href="/listings/new"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-white py-2.5 text-xs font-medium tracking-wide text-slate-900 no-underline transition-colors duration-150 hover:bg-slate-100"
        >
          + Post a listing
        </Link>

        {/* Type filter */}
        <div>
          <span className={sectionLabel}>Type</span>
          <div className="space-y-0.5">
            {[
              { value: "" as const, label: "All listings" },
              { value: "SKILL_OFFER" as const, label: "Skills" },
              { value: "TOOL_LISTING" as const, label: "Tools" },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => handleTypeChange(value)}
                className={`w-full cursor-pointer rounded-md px-3 py-2 text-left font-mono text-sm transition-colors duration-150 ${
                  selectedType === value
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Category filter */}
        <div>
          <span className={sectionLabel}>Category</span>
          {catLoading ? (
            <span className="font-mono text-xs text-slate-500">Loading…</span>
          ) : (
            <div className="space-y-0.5">
              <button
                onClick={() => onCategoryChange(undefined)}
                className={`w-full cursor-pointer rounded-md px-3 py-2 text-left font-mono text-sm transition-colors duration-150 ${
                  !selectedCategory
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                All categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onCategoryChange(selectedCategory === cat.id ? undefined : cat.id)}
                  className={`flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left font-mono text-sm transition-colors duration-150 ${
                    selectedCategory === cat.id
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {cat.icon && <span className="text-base leading-none">{cat.icon}</span>}
                  <span className="truncate">{cat.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Text search */}
        <div>
          <span className={sectionLabel}>Search</span>
          <form className="flex flex-col gap-2" onSubmit={handleSearch}>
            <input
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-slate-500"
              type="text"
              placeholder="Keywords…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              type="submit"
              className="cursor-pointer rounded-md bg-slate-900 py-2 font-mono text-xs uppercase tracking-wide text-white transition-all hover:bg-slate-600"
            >
              Search
            </button>
          </form>
        </div>

        {/* Tag filter */}
        <div>
          <span className={sectionLabel}>Tag</span>
          <form className="flex flex-col gap-2" onSubmit={handleTagSearch}>
            <input
              ref={tagInputRef}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-slate-500"
              type="text"
              placeholder="e.g. beginner-friendly"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
            />
            <button
              type="submit"
              className="cursor-pointer rounded-md bg-slate-900 py-2 font-mono text-xs uppercase tracking-wide text-white transition-all hover:bg-slate-600"
            >
              Filter by tag
            </button>
          </form>
          {selectedTag && (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-blue-800 bg-blue-950 px-2 py-1 font-mono text-xs text-blue-400">
              {selectedTag}
              <button
                className="cursor-pointer border-none bg-transparent p-0 text-sm leading-none text-blue-400 hover:text-blue-200"
                onClick={clearTag}
                title="Remove tag filter"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Distance (only when geo is available) */}
        {geoAvailable && onDistanceChange && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className={sectionLabel} style={{ marginBottom: 0 }}>
                Distance
              </span>
              {selectedDistance !== undefined && (
                <button
                  className="cursor-pointer border-none bg-transparent font-mono text-[0.6rem] text-blue-400 underline hover:text-blue-300"
                  onClick={() => onDistanceChange(undefined)}
                >
                  clear
                </button>
              )}
            </div>
            <div className="mb-2 font-mono text-xs text-slate-400">
              {selectedDistance !== undefined ? `Within ${selectedDistance} km` : "Any distance"}
            </div>
            <input
              type="range"
              min={1}
              max={50}
              step={1}
              value={selectedDistance ?? 25}
              onChange={(e) => onDistanceChange(Number(e.target.value))}
              className="w-full cursor-pointer accent-blue-500"
            />
            <div className="mt-1 flex justify-between font-mono text-[0.55rem] text-slate-600">
              <span>1 km</span>
              <span>50 km</span>
            </div>
          </div>
        )}

        {/* Host filters */}
        <div>
          <span className={sectionLabel}>Host</span>
          <div className="space-y-2">
            <label
              className="flex cursor-not-allowed items-center gap-2.5 font-mono text-sm text-slate-600"
              title="Identity verification coming soon"
            >
              <input
                type="checkbox"
                disabled
                checked={false}
                readOnly
                className="cursor-not-allowed rounded accent-blue-500 opacity-30"
              />
              <span>Verified identity</span>
              <span className="ml-auto font-mono text-[0.5rem] uppercase tracking-wide text-slate-600">
                (soon)
              </span>
            </label>
            <label className="flex cursor-pointer items-center gap-2.5 font-mono text-sm text-slate-700 transition-colors hover:text-slate-900">
              <input
                type="checkbox"
                checked={superHost ?? false}
                onChange={(e) => onSuperHostChange?.(e.target.checked)}
                className="rounded accent-blue-500"
              />
              Super-host (15+ swaps)
            </label>
          </div>
        </div>

        {/* Deposit range (tool or all) */}
        {showDeposit && onMinDepositChange && onMaxDepositChange && (
          <div>
            <span className={sectionLabel}>Deposit range</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                placeholder="Min €"
                value={minDeposit ?? ""}
                onChange={(e) => onMinDepositChange(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-slate-500"
              />
              <span className="shrink-0 text-sm text-slate-600">–</span>
              <input
                type="number"
                min="0"
                placeholder="Max €"
                value={maxDeposit ?? ""}
                onChange={(e) => onMaxDepositChange(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-slate-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Reset all filters — always at bottom */}
      <div className="border-t border-slate-100 px-6 py-4">
        {hasFilters ? (
          <button
            className="w-full cursor-pointer rounded-md border border-slate-200 bg-transparent py-2 font-mono text-xs uppercase tracking-wide text-slate-500 transition-all hover:border-slate-400 hover:text-slate-700"
            onClick={clearAll}
          >
            Reset all filters
          </button>
        ) : (
          <p className="text-center font-mono text-[0.6rem] text-slate-600">No filters applied</p>
        )}
      </div>
    </aside>
  );
}
