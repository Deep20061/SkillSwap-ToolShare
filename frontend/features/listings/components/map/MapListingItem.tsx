"use client";

import { cx } from "@/lib/utils";
import { Shield, StarFill, Pin } from "@/components/ui/Icons";
import { ListingThumbnail } from "@/features/listings/components/ListingThumbnail";
import { ListingTypeBadge } from "@/features/listings/components/ListingTypeBadge";
import { apiUrl } from "@/lib/api";
import { Avatar } from "@/features/profile/components/Avatar";
import type { Listing } from "@/features/listings/types";

export function MapListingItem({
  listing,
  isActive,
  onClick,
}: {
  listing: Listing;
  isActive: boolean;
  onClick: () => void;
}) {
  const thumb = listing.media[0];
  const rating = listing.user.profile?.rating;
  const isVerified = listing.user.profile?.isIdentityVerified ?? false;
  const avatarSrc = listing.user.profile?.avatarUrl
    ? `${apiUrl}${listing.user.profile.avatarUrl}`
    : null;

  return (
    <button
      onClick={onClick}
      className={cx(
        "flex w-full gap-3 p-4 text-left transition-colors",
        isActive ? "bg-brand-50/60 dark:bg-brand-100/40" : "hover:bg-sunken"
      )}
    >
      {/* Thumbnail — 64×64 rounded, same as concept */}
      <ListingThumbnail
        listingId={listing.id}
        mediaSrc={thumb ? `${apiUrl}${thumb.path}` : null}
        imageSizes="64px"
        className="h-16 w-16 flex-shrink-0 rounded-lg"
      />

      {/* Content */}
      <div className="min-w-0 flex-1">
        {/* Type badge + distance */}
        <div className="mb-0.5 flex items-center gap-1.5">
          <ListingTypeBadge
            type={listing.type}
            iconSize={9}
            className="inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[10px] font-medium tracking-wide"
          />
          {listing.locationName && (
            <span className="flex min-w-0 items-center gap-0.5 text-[10px] text-ink3">
              <Pin size={9} className="flex-shrink-0" />{" "}
              <span className="truncate">{listing.locationName.split(",")[0]}</span>
            </span>
          )}
        </div>

        {/* Title */}
        <div className="mb-1 line-clamp-1 text-sm font-semibold text-ink">{listing.title}</div>

        {/* Owner row */}
        <div className="flex items-center gap-1.5 text-xs text-ink2">
          <Avatar src={avatarSrc} name={listing.user.name} size="xs" />
          <span className="truncate">{listing.user.name.split(" ")[0]}</span>
          {isVerified && <Shield size={10} className="flex-shrink-0 text-emerald-500" />}
          {rating != null && (
            <span className="ml-0.5 flex items-center gap-0.5 text-ink3">
              · <StarFill size={9} className="inline text-amber-500" /> {rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
