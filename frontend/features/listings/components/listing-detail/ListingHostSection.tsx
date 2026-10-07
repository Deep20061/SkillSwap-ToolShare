import Link from "next/link";
import { Shield, StarFill } from "@/components/ui/Icons";
import { ListingDetailSection } from "@/features/listings/components/listing-detail/DetailLayout";
import { Avatar } from "@/features/profile/components/Avatar";
import type { Listing } from "@/features/listings/types";

export interface ListingHostSectionProps {
  listing: Listing;
  avatarSrc: string | null;
  memberSince: string;
}

export function ListingHostSection({ listing, avatarSrc, memberSince }: ListingHostSectionProps) {
  const owner = listing.user;

  return (
    <ListingDetailSection title="Meet the host">
      <div className="rounded-2xl border border-line bg-surface p-5">
        <div className="flex items-start gap-4">
          <Avatar src={avatarSrc} name={owner.name} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="min-w-0 break-words text-lg font-bold text-ink">{owner.name}</h3>
              {owner.profile?.isIdentityVerified && (
                <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">
                  <Shield size={10} /> Verified
                </span>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-ink2">
              {owner.profile?.rating != null && (
                <span className="flex items-center gap-1">
                  <StarFill size={12} className="text-amber-500" />
                  <span className="font-semibold text-ink">{owner.profile.rating.toFixed(1)}</span>
                  {owner.profile.reviewCount > 0 && (
                    <span>· {owner.profile.reviewCount} reviews</span>
                  )}
                </span>
              )}
              <span className="text-ink3">·</span>
              <span>Joined {memberSince}</span>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Link
                href={`/profile/${owner.id}`}
                className="inline-flex h-8 items-center rounded-lg border border-line px-3 text-sm text-ink2 no-underline hover:bg-sunken hover:text-ink"
              >
                View profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ListingDetailSection>
  );
}
