import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { MapListingItem } from "@/features/listings/components/map/MapListingItem";
import { Search, Shield, MapIcon } from "@/components/ui/Icons";
import { cx } from "@/lib/utils";
import type { Listing, ListingType } from "@/features/listings/types";
import type { MapPin } from "@/features/listings/hooks/useMapPins";

const DynamicListingsMap = dynamic(
  () =>
    import("@/features/listings/components/map/ListingsMap").then((m) => ({
      default: m.ListingsMap,
    })),
  {
    ssr: false,
    loading: () => <div className="h-full w-full animate-pulse rounded-xl bg-sunken" />,
  }
);

interface MapBrowseViewProps {
  listings: Listing[];
  pins: MapPin[];
  isLoading: boolean;
  pagination: { total: number; pages: number };
  nearCity: string | null;
  geoAvailable: boolean;
  mapCenter?: [number, number];
  mapZoom: number;
  kindLabel: string;
  catLabel?: string;
  selectedType: ListingType | "";
  query: string;
  setQuery: (v: string) => void;
  handleTypeChange: (t: ListingType | "") => void;
  handleSearch: (e: React.FormEvent) => void;
  distanceKm?: number;
  setDistanceKm: (v: number) => void;
  verifiedOnly: boolean;
  setVerifiedOnly: (v: boolean) => void;
  hasFilters: boolean;
  clearAll: () => void;
  setBbox: (b: { minLat: number; maxLat: number; minLng: number; maxLng: number }) => void;
  onSwitchToGrid: () => void;
}

export function MapBrowseView({
  listings,
  pins,
  isLoading,
  pagination,
  nearCity,
  geoAvailable,
  mapCenter,
  mapZoom,
  kindLabel,
  catLabel,
  selectedType,
  query,
  setQuery,
  handleTypeChange,
  handleSearch,
  distanceKm,
  setDistanceKm,
  verifiedOnly,
  setVerifiedOnly,
  hasFilters,
  clearAll,
  setBbox,
  onSwitchToGrid,
}: MapBrowseViewProps) {
  const [activeListingId, setActiveListingId] = useState<string | null>(null);
  const railRef = useRef<HTMLDivElement>(null);

  const handleSelectListing = useCallback((id: string) => {
    setActiveListingId((prev) => (prev === id ? null : id));
  }, []);

  useEffect(() => {
    if (!activeListingId || !railRef.current) return;
    const el = railRef.current.querySelector(`[data-listing-id="${activeListingId}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [activeListingId]);

  return (
    // Exact same two-column grid as the grid view
    <div className="grid gap-6 md:grid-cols-[260px_minmax(0,1fr)]">
      {/* ── Left column — results list, sticky just like the filter sidebar ── */}
      <aside className="self-start md:sticky md:top-32">
        <div className="flex max-h-[calc(100vh-10rem)] flex-col overflow-hidden rounded-xl border border-line bg-surface">
          {/* Header */}
          <div className="shrink-0 space-y-3 border-b border-line px-4 pb-3 pt-4">
            <div>
              <h2 className="text-sm font-bold tracking-tight text-ink">
                {kindLabel}
                {catLabel && <span className="font-normal text-ink3"> · {catLabel}</span>}
              </h2>
              <p className="mt-0.5 text-xs text-ink3">
                {`${pagination.total} result${pagination.total !== 1 ? "s" : ""}${nearCity ? ` near ${nearCity}` : ""}`}
                {isLoading && (
                  <span className="ml-1 inline-block h-3 w-3 animate-spin rounded-full border border-ink3 border-t-transparent align-middle" />
                )}
              </p>
            </div>

            {/* Type segmented control */}
            <div className="flex items-center gap-0.5 rounded-md bg-sunken p-0.5">
              {[
                { v: "" as const, l: "All" },
                { v: "SKILL_OFFER" as const, l: "Skills" },
                { v: "TOOL_LISTING" as const, l: "Tools" },
              ].map((o) => (
                <button
                  key={o.v}
                  onClick={() => handleTypeChange(o.v)}
                  className={cx(
                    "h-6 flex-1 rounded text-xs font-medium transition-colors",
                    selectedType === o.v
                      ? "bg-surface text-ink shadow-sm"
                      : "text-ink2 hover:text-ink"
                  )}
                >
                  {o.l}
                </button>
              ))}
            </div>

            {/* Search */}
            <form onSubmit={handleSearch}>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink3">
                  <Search size={13} />
                </span>
                <input
                  className="h-8 w-full rounded-lg border border-line2 bg-sunken pl-8 pr-3 text-xs text-ink placeholder-ink3 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                  placeholder="Search listings…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </form>

            {/* Quick filters */}
            <div className="flex flex-wrap items-center gap-3">
              {geoAvailable && (
                <div className="flex items-center gap-2 text-xs text-ink2">
                  <span className="whitespace-nowrap">
                    Within <span className="font-semibold text-ink">{distanceKm ?? 10} km</span>
                  </span>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    className="w-16 accent-brand-600"
                    value={distanceKm ?? 10}
                    onChange={(e) => setDistanceKm(+e.target.value)}
                  />
                </div>
              )}
              <label className="flex cursor-pointer items-center gap-1.5 text-xs text-ink2">
                <input
                  type="checkbox"
                  className="rounded accent-brand-600"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                />
                <Shield size={10} className="text-emerald-500" /> Verified
              </label>
              {hasFilters && (
                <button
                  onClick={clearAll}
                  className="ml-auto text-xs text-ink2 underline underline-offset-2 hover:text-ink"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Back to grid */}
            <button
              onClick={onSwitchToGrid}
              className="text-xs text-brand-600 underline-offset-2 hover:underline"
            >
              ← Back to grid view
            </button>
          </div>

          {/* Scrollable results — keep showing stale listings while refetching */}
          <div className="flex-1 divide-y divide-line overflow-y-auto" ref={railRef}>
            {/* Only show skeleton on true first load (no listings yet) */}
            {isLoading &&
              listings.length === 0 &&
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex gap-3 p-3">
                  <div className="h-14 w-14 shrink-0 animate-pulse rounded-lg bg-sunken" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-2.5 w-1/3 animate-pulse rounded bg-sunken" />
                    <div className="h-3.5 w-4/5 animate-pulse rounded bg-sunken" />
                    <div className="h-2.5 w-1/2 animate-pulse rounded bg-sunken" />
                  </div>
                </div>
              ))}

            {!isLoading && listings.length === 0 && (
              <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
                <MapIcon size={22} className="mb-2 text-ink3" />
                <h3 className="mb-1 text-sm font-bold text-ink">No listings in view</h3>
                <p className="text-xs text-ink2">Pan or zoom the map to find listings.</p>
              </div>
            )}

            {listings.map((listing) => (
              <div key={listing.id} data-listing-id={listing.id}>
                <MapListingItem
                  listing={listing}
                  isActive={activeListingId === listing.id}
                  onClick={() =>
                    setActiveListingId(activeListingId === listing.id ? null : listing.id)
                  }
                />
              </div>
            ))}
          </div>

          {/* Pagination hint */}
          {!isLoading && pagination.total > 20 && (
            <div className="shrink-0 border-t border-line bg-sunken/60 px-4 py-2">
              <p className="text-center text-[10px] text-ink3">
                Showing {listings.length} of {pagination.total} — zoom in to narrow results
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* ── Right column — map, same slot the card grid occupies ────────────── */}
      <div
        className="overflow-hidden rounded-xl border border-line"
        style={{ height: "calc(100vh - 10rem)", isolation: "isolate" }}
      >
        <DynamicListingsMap
          pins={pins}
          onBoundsChange={setBbox}
          className="h-full w-full"
          center={mapCenter}
          zoom={mapZoom}
          activeId={activeListingId}
          onSelectListing={handleSelectListing}
        />
      </div>
    </div>
  );
}
