"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/features/auth/hooks/useSession";
import { usePublicProfile } from "@/features/profile/hooks/usePublicProfile";
import { useProfileListings } from "@/features/profile/hooks/useProfileListings";
import { apiUrl } from "@/lib/api";
import { ProfileLoadingState } from "@/features/profile/components/profile-view/ProfileLoadingState";
import { ProfileNotFoundState } from "@/features/profile/components/profile-view/ProfileNotFoundState";
import { ProfilePageLayout } from "@/features/profile/components/profile-view/ProfilePageLayout";
import { ProfileView } from "@/features/profile/components/profile-view/ProfileView";
import type { ProfileTab } from "@/features/profile/components/profile-view/constants";

function ProfileInner() {
  const params = useParams();
  const router = useRouter();
  const { user: sessionUser } = useSession();
  const userId = String(params.id);
  const isOwner = sessionUser?.id === userId;

  const [tab, setTab] = useState<ProfileTab>("listings");
  const { data, isLoading, notFound } = usePublicProfile(userId);
  const { listings, listingsLoading } = useProfileListings(userId, tab);

  // Privacy setting: when the profile owner opted out of search engines,
  // add <meta name="robots" content="noindex"> so crawlers skip this page.
  useEffect(() => {
    if (!data || data.allowSearchIndexing !== false) return;
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, [data]);

  if (isLoading) {
    return <ProfileLoadingState />;
  }

  if (notFound || !data) {
    return <ProfileNotFoundState />;
  }

  const { user, profile } = data;
  const displayName = user.name;
  const avatarSrc = profile?.avatarUrl ? `${apiUrl}${profile.avatarUrl}` : null;
  const rating = profile?.rating;
  const reviewCount = profile?.reviewCount ?? 0;
  const bio = profile?.bio;
  const isVerified = profile?.isIdentityVerified ?? false;
  const phone = profile?.phone;
  const joinedDate = new Date(user.createdAt).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  return (
    <ProfilePageLayout>
      <ProfileView
        tab={tab}
        onTabChange={setTab}
        showEditButton={isOwner}
        onEditProfile={() => router.push("/settings")}
        userId={userId}
        displayName={displayName}
        avatarSrc={avatarSrc}
        isVerified={isVerified}
        rating={rating}
        reviewCount={reviewCount}
        bio={bio}
        joinedDate={joinedDate}
        alwaysShowJoined
        phone={phone}
        listings={listings}
        listingsLoading={listingsLoading}
        isOwner={isOwner}
      />
    </ProfilePageLayout>
  );
}

export default function PublicProfilePage() {
  return (
    <Suspense>
      <ProfileInner />
    </Suspense>
  );
}
