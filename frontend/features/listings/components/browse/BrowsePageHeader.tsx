import { ChevDown } from "@/components/ui/Icons";
import { BrowseViewModeToggle } from "@/features/listings/components/browse/ViewModeToggle";

export interface BrowsePageHeaderProps {
  kindLabel: string;
  catLabel?: string;
  totalResults: number;
  nearCity: string | null;
  isLoading: boolean;
  mode: "grid" | "map";
  onGrid: () => void;
  onMap: () => void;
  geoAvailable: boolean;
  showSort?: boolean;
}

export function BrowsePageHeader({
  kindLabel,
  catLabel,
  totalResults,
  nearCity,
  isLoading,
  mode,
  onGrid,
  onMap,
  geoAvailable,
  showSort = false,
}: BrowsePageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.18em] text-brand-600">
          Marketplace
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">
          {kindLabel}
          {catLabel && <span className="font-normal text-ink3"> · {catLabel}</span>}
        </h1>
        <div className="mt-1 text-sm text-ink2">
          {totalResults} result{totalResults !== 1 ? "s" : ""}
          {nearCity && (
            <>
              {" "}
              near <span className="font-medium text-ink">{nearCity}</span>
            </>
          )}
          {isLoading && (
            <span className="ml-1.5 inline-block h-3 w-3 animate-spin rounded-full border border-ink3 border-t-transparent align-middle" />
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <BrowseViewModeToggle mode={mode} onGrid={onGrid} onMap={onMap} />
        {showSort && (
          <div className="relative">
            <select
              className="h-9 cursor-pointer appearance-none rounded-md border border-line bg-surface pl-3 pr-8 text-sm text-ink"
              defaultValue="relevance"
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="recent">Sort: Most recent</option>
              {geoAvailable && <option value="distance">Sort: Closest</option>}
            </select>
            <ChevDown
              size={14}
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-ink3"
            />
          </div>
        )}
      </div>
    </div>
  );
}
