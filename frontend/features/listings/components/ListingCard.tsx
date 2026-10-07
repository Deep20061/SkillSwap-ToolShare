"use client";

import Link from "next/link";
import type { Listing } from "@/features/listings/types";
import { Shield, StarFill, Heart, HeartFill } from "@/components/ui/Icons";
import { ListingThumbnail } from "@/features/listings/components/ListingThumbnail";
import { ListingTypeBadge } from "@/features/listings/components/ListingTypeBadge";
import { timeAgo } from "@/lib/utils";
import { Avatar } from "@/features/profile/components/Avatar";
import { apiUrl } from "@/lib/api";
import { useSaveListing } from "@/features/listings/hooks/useSaveListing";

function conditionLabel(c: string): string {
  const map: Record<string, string> = {
    NEW: "New",
    LIKE_NEW: "Like new",
    GOOD: "Good",
    FAIR: "Fair",
  };
  return (
    map[c] ??
    c
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/^\w/, (s) => s.toUpperCase())
  );
}

// ── Card component ────────────────────────────────────────────────────────────

export function ListingCard({ listing, compact = false }: { listing: Listing; compact?: boolean }) {
  const isSkill = listing.type === "SKILL_OFFER";
  const { isSaved, saveCount, toggle } = useSaveListing(listing.id, {
    isSaved: listing.isSaved,
    saveCount: listing.saveCount ?? 0,
  });
  const thumb = listing.media[0];
  const catLabel = listing.category?.name ?? (isSkill ? "Skill" : "Tool");
  const rating = listing.user.profile?.rating;
  const isVerified = listing.user.profile?.isIdentityVerified ?? false;
  const avatarSrc = listing.user.profile?.avatarUrl
    ? `${apiUrl}${listing.user.profile.avatarUrl}`
    : null;

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group relative block cursor-pointer overflow-hidden rounded-2xl border border-line bg-surface no-underline transition-all hover:border-line2 hover:shadow-card"
    >
      {/* Image / placeholder */}
      <div className="relative">
        <ListingThumbnail
          listingId={listing.id}
          mediaSrc={thumb ? `${apiUrl}${thumb.path}` : null}
          imageSizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={compact ? "aspect-[5/3]" : "aspect-[4/3]"}
        >
          {catLabel && (
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
              <span className="rounded bg-white/70 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink2 backdrop-blur">
                {catLabel}
              </span>
            </div>
          )}
        </ListingThumbnail>

        {/* Save heart + count */}
        <button
          onClick={toggle}
          className="absolute right-2.5 top-2.5 inline-flex h-8 items-center gap-1.5 rounded-full bg-white/85 px-2.5 text-ink2 backdrop-blur hover:text-rose-500"
        >
          {saveCount > 0 && (
            <span className="mt-px text-[13px] font-semibold leading-none">{saveCount}</span>
          )}
          {isSaved ? <HeartFill size={14} className="text-rose-500" /> : <Heart size={14} />}
        </button>

        {/* Type pill */}
        <div className="absolute left-2.5 top-2.5">
          <ListingTypeBadge type={listing.type} iconSize={10} />
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="mb-1.5 line-clamp-2 text-[15px] font-semibold leading-snug text-ink">
          {listing.title}
        </h3>

        {/* Meta row */}
        <div className="mb-3 flex flex-wrap items-center gap-1.5 text-[12px] text-ink2">
          {isSkill ? (
            <>
              {listing.skillDetail?.estimatedHours != null && (
                <span className="font-medium text-ink">
                  {listing.skillDetail.estimatedHours}h session
                </span>
              )}
              {listing.skillDetail?.deliveryMethod && (
                <>
                  <span className="text-ink3">·</span>
                  <span>{listing.skillDetail.deliveryMethod.replace("_", " ").toLowerCase()}</span>
                </>
              )}
            </>
          ) : (
            <>
              {listing.toolDetail?.depositAmount != null && (
                <span className="font-medium text-ink">
                  €{listing.toolDetail.depositAmount} deposit
                </span>
              )}
              {listing.toolDetail?.maxBorrowDays != null && (
                <>
                  <span className="text-ink3">·</span>
                  <span>up to {listing.toolDetail.maxBorrowDays}d</span>
                </>
              )}
              {listing.toolDetail?.condition && (
                <>
                  <span className="text-ink3">·</span>
                  <span>{conditionLabel(listing.toolDetail.condition)}</span>
                </>
              )}
            </>
          )}
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between border-t border-line pt-3">
          <div className="flex min-w-0 items-center gap-2">
            <Avatar src={avatarSrc} name={listing.user.name} size="xs" />
            <div className="min-w-0">
              <div className="max-w-[120px] truncate text-xs font-medium text-ink">
                {listing.user.name.split(" ")[0]}
              </div>
              {rating != null && (
                <div className="flex items-center gap-0.5 text-[10px] text-ink3">
                  <StarFill size={9} className="text-amber-500" />
                  <span>{rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            {isVerified && <Shield size={11} className="flex-shrink-0 text-emerald-500" />}
          </div>
          <div className="flex-shrink-0 text-[11px] text-ink3">{timeAgo(listing.createdAt)}</div>
        </div>
      </div>
    </Link>
  );
}
