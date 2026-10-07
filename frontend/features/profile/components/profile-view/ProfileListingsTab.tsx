import Link from "next/link";
import { ListingCard } from "@/features/listings/components/ListingCard";
import type { Listing } from "@/features/listings/types";
import { SkeletonCard } from "@/components/ui/SkeletonCard";

interface ProfileListingsTabProps {
  listings: Listing[];
  isLoading: boolean;
  isOwner: boolean;
}

export function ProfileListingsTab({ listings, isLoading, isOwner }: ProfileListingsTabProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-ink3">
        {isOwner ? (
          <>
            No listings yet.{" "}
            <Link href="/listings/new" className="text-brand-600 no-underline hover:underline">
              Post your first listing →
            </Link>
          </>
        ) : (
          "No active listings."
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((l) => (
        <ListingCard key={l.id} listing={l} />
      ))}
    </div>
  );
}
