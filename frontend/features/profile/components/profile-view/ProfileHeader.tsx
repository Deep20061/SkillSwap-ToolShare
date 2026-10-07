"use client";

import { Avatar } from "@/features/profile/components/Avatar";
import { Shield, StarFill } from "@/components/ui/Icons";

export interface ProfileHeaderProps {
  displayName: string;
  avatarSrc: string | null;
  isVerified: boolean;
  rating: number | null | undefined;
  reviewCount: number;
  bio: string | null | undefined;
  joinedDate: string | null;
  alwaysShowJoined: boolean;
}

export function ProfileHeader({
  displayName,
  avatarSrc,
  isVerified,
  rating,
  reviewCount,
  bio,
  joinedDate,
  alwaysShowJoined,
}: ProfileHeaderProps) {
  return (
    <>
      <div className="relative z-10 -mt-12 mb-4 px-1 md:-mt-14 md:px-2">
        <div className="inline-block rounded-full ring-4 ring-surface">
          <Avatar src={avatarSrc} name={displayName} size="xl" />
        </div>
      </div>

      <div className="mb-8 flex flex-col gap-4 px-1 md:flex-row md:items-start md:px-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="min-w-0 break-words text-2xl font-bold tracking-tight text-ink md:text-3xl">
              {displayName}
            </h1>
            {isVerified && (
              <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">
                <Shield size={10} /> Verified
              </span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-ink2">
            {rating != null && (
              <span className="flex items-center gap-1.5">
                <StarFill size={12} className="text-amber-500" />
                <span className="font-semibold text-ink">{rating.toFixed(1)}</span>
                <span>· {reviewCount} reviews</span>
              </span>
            )}
            {(alwaysShowJoined || joinedDate) && (
              <>
                <span className="text-ink3">·</span>
                <span>Joined {joinedDate}</span>
              </>
            )}
          </div>
          {bio && <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink2">{bio}</p>}
        </div>
      </div>
    </>
  );
}
