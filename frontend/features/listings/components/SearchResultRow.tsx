import Link from "next/link";
import type { Listing } from "@/features/listings/types";
import { ListingTypeBadge } from "@/features/listings/components/ListingTypeBadge";
import { ListingThumbnail } from "@/features/listings/components/ListingThumbnail";
import { apiUrl } from "@/lib/api";

export function SearchResultRow({
  listing,
  onSelect,
}: {
  listing: Listing;
  onSelect?: () => void;
}) {
  const thumb = listing.media[0];
  const catLabel = listing.category?.name ?? (listing.type === "SKILL_OFFER" ? "Skill" : "Tool");
  const host = listing.user.name.split(" ")[0];

  return (
    <Link
      href={`/listings/${listing.id}`}
      onClick={onSelect}
      className="group flex items-center gap-3 px-3 py-2.5 no-underline hover:bg-sunken"
    >
      <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg">
        <ListingThumbnail
          listingId={listing.id}
          mediaSrc={thumb ? `${apiUrl}${thumb.path}` : null}
          imageSizes="44px"
          className="h-full w-full"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink group-hover:text-brand-600">
          {listing.title}
        </p>
        <div className="mt-0.5 flex items-center gap-1.5">
          <ListingTypeBadge
            type={listing.type}
            iconSize={9}
            className="inline-flex items-center gap-1 rounded px-1.5 py-px text-[10px] font-medium border"
          />
          <span className="text-xs text-ink3">{catLabel}</span>
          <span className="text-xs text-ink3">·</span>
          <span className="text-xs text-ink3">{host}</span>
        </div>
      </div>
    </Link>
  );
}
