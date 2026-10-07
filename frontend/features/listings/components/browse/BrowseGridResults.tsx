import type { Dispatch, SetStateAction } from "react";
import { ArrowL, ArrowR, Search } from "@/components/ui/Icons";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { ListingCard } from "@/features/listings/components/ListingCard";
import type { Listing } from "@/features/listings/types";
import { cx } from "@/lib/utils";

export interface BrowseGridResultsProps {
  listings: Listing[];
  isLoading: boolean;
  error: string | null;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  pagination: { total: number; pages: number };
}

export function BrowseGridResults({
  listings,
  isLoading,
  error,
  page,
  setPage,
  pagination,
}: BrowseGridResultsProps) {
  if (error) {
    return <div className="py-12 text-center text-sm text-rose-600">{error}</div>;
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-surface py-20 text-center">
        <Search size={28} className="mx-auto mb-3 text-ink3" />
        <h3 className="mb-1 text-lg font-bold text-ink">No matches</h3>
        <p className="mx-auto max-w-xs text-sm text-ink2">
          Try widening your distance, removing filters, or browsing related categories.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
      {pagination.pages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs text-ink2 hover:bg-sunken hover:text-ink disabled:opacity-40"
          >
            <ArrowL size={13} /> Prev
          </button>
          {Array.from({ length: Math.min(pagination.pages, 5) }, (_, index) => {
            const pageNumber = index + 1;
            return (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setPage(pageNumber)}
                className={cx(
                  "h-8 w-8 rounded-md text-sm font-medium",
                  pageNumber === page
                    ? "bg-ink text-surface"
                    : "text-ink2 hover:bg-sunken hover:text-ink"
                )}
              >
                {pageNumber}
              </button>
            );
          })}
          {pagination.pages > 5 && <span className="px-1 text-ink3">…</span>}
          <button
            type="button"
            disabled={page >= pagination.pages}
            onClick={() => setPage((current) => Math.min(pagination.pages, current + 1))}
            className="inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs text-ink2 hover:bg-sunken hover:text-ink disabled:opacity-40"
          >
            Next <ArrowR size={13} />
          </button>
        </div>
      )}
    </>
  );
}
