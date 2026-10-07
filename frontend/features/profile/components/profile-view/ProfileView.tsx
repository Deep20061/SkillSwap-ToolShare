"use client";

import type { Listing } from "@/features/listings/types";
import { ProfileAboutTab } from "./ProfileAboutTab";
import { ProfileCover } from "./ProfileCover";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileListingsTab } from "./ProfileListingsTab";
import { ProfileReviewsTab } from "./ProfileReviewsTab";
import { ProfileStats } from "./ProfileStats";
import { ProfileTabs } from "./ProfileTabs";
import type { ProfileTab } from "./constants";

interface ProfileViewProps {
  tab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  showEditButton: boolean;
  onEditProfile: () => void;
  userId: string;
  displayName: string;
  avatarSrc: string | null;
  isVerified: boolean;
  rating: number | null | undefined;
  reviewCount: number;
  bio: string | null | undefined;
  joinedDate: string | null;
  alwaysShowJoined: boolean;
  displayEmail?: string;
  phone?: string | null;
  listings: Listing[];
  listingsLoading: boolean;
  isOwner: boolean;
}

export function ProfileView({
  tab,
  onTabChange,
  showEditButton,
  onEditProfile,
  userId,
  displayName,
  avatarSrc,
  isVerified,
  rating,
  reviewCount,
  bio,
  joinedDate,
  alwaysShowJoined,
  displayEmail,
  phone,
  listings,
  listingsLoading,
  isOwner,
}: ProfileViewProps) {
  const stats = [
    { v: listings.length, l: "Active listings" },
    { v: reviewCount, l: "Reviews" },
    { v: rating != null ? rating.toFixed(1) : "—", l: "Rating" },
  ] as const;

  return (
    <>
      <ProfileCover showEditButton={showEditButton} onEditProfile={onEditProfile} />
      <ProfileHeader
        displayName={displayName}
        avatarSrc={avatarSrc}
        isVerified={isVerified}
        rating={rating}
        reviewCount={reviewCount}
        bio={bio}
        joinedDate={joinedDate}
        alwaysShowJoined={alwaysShowJoined}
      />
      <ProfileStats stats={stats} />
      <ProfileTabs
        tab={tab}
        onTabChange={onTabChange}
        listingsCount={listings.length}
        reviewCount={reviewCount}
      />
      {tab === "listings" && (
        <ProfileListingsTab listings={listings} isLoading={listingsLoading} isOwner={isOwner} />
      )}
      {tab === "reviews" && (
        <ProfileReviewsTab userId={userId} rating={rating} reviewCount={reviewCount} />
      )}
      {tab === "about" && (
        <ProfileAboutTab
          bio={bio}
          displayEmail={displayEmail}
          joinedDate={joinedDate}
          isIdentityVerified={isVerified}
          phone={phone}
          reviewCount={reviewCount}
          rating={rating}
        />
      )}
    </>
  );
}
