"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { useSession } from "@/features/auth/hooks/useSession";
import { useMyListings } from "@/features/listings/hooks/useMyListings";
import { apiUrl } from "@/lib/api";
import type { Listing } from "@/features/listings/types";
import { ProfileLoadingState } from "@/features/profile/components/profile-view/ProfileLoadingState";
import { ProfilePageLayout } from "@/features/profile/components/profile-view/ProfilePageLayout";
import { ProfileView } from "@/features/profile/components/profile-view/ProfileView";
import type { ProfileTab } from "@/features/profile/components/profile-view/constants";

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useSession();
  const { profile, isLoading } = useProfile();
  const [tab, setTab] = useState<ProfileTab>("listings");
  const { myListings, myListingsLoading } = useMyListings(tab === "listings" ? "listings" : "");

  if (isLoading) {
    return <ProfileLoadingState />;
  }

  const displayName = profile?.user?.name ?? user?.name ?? "User";
  const displayEmail = profile?.user?.email ?? user?.email ?? "";
  const avatarSrc = profile?.profile?.avatarUrl ? `${apiUrl}${profile.profile.avatarUrl}` : null;
  const rating = profile?.profile?.rating;
  const reviewCount = profile?.profile?.reviewCount ?? 0;
  const bio = profile?.profile?.bio;
  const phone = profile?.profile?.phone;
  const joinedDate = profile?.user?.createdAt
    ? new Date(profile.user.createdAt).toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric",
      })
    : null;
  const isVerified = profile?.profile?.isIdentityVerified ?? false;
  const listings = myListings as unknown as Listing[];

  return (
    <ProfilePageLayout>
      <ProfileView
        tab={tab}
        onTabChange={setTab}
        showEditButton
        onEditProfile={() => router.push("/settings")}
        userId={user?.id ?? ""}
        displayName={displayName}
        avatarSrc={avatarSrc}
        isVerified={isVerified}
        rating={rating}
        reviewCount={reviewCount}
        bio={bio}
        joinedDate={joinedDate}
        alwaysShowJoined={false}
        displayEmail={displayEmail}
        phone={phone}
        listings={listings}
        listingsLoading={myListingsLoading}
        isOwner
      />
    </ProfilePageLayout>
  );
}
