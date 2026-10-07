"use client";

import { type Dispatch, type SetStateAction, type ReactNode } from "react";
import { ShieldCheck, Star } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { AvatarUpload } from "./AvatarUpload";
import { ProfileForm } from "./ProfileForm";
import type { ProfileResponse } from "../types";

interface ProfileSettingsProps {
  profile: ProfileResponse | null;
  setProfile: Dispatch<SetStateAction<ProfileResponse | null>>;
  isLoading: boolean;
  error: string | null;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-5 text-sm font-semibold text-gray-800">{title}</h2>
      {children}
    </section>
  );
}

export function ProfileSettings({
  profile: data,
  setProfile,
  isLoading,
  error,
}: ProfileSettingsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="h-6 w-6 text-gray-400" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-red-500">{error ?? "Failed to load profile"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Section title="Photo">
        <AvatarUpload
          currentAvatarUrl={data.profile.avatarUrl}
          userName={data.user.name}
          onUpload={(avatarUrl) =>
            setProfile((prev) =>
              prev ? { ...prev, profile: { ...prev.profile, avatarUrl } } : prev
            )
          }
        />
      </Section>

      <Section title="Basic information">
        <ProfileForm data={data} onSaved={(updated) => setProfile(updated)} />
      </Section>

      <Section title="Account standing">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1">
            <dt className="flex items-center gap-1.5 text-xs text-gray-400">
              <Star size={12} className="text-amber-400" />
              Rating
            </dt>
            <dd className="text-lg font-bold text-gray-900">
              {data.profile.rating != null ? data.profile.rating.toFixed(1) : "—"}
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-xs text-gray-400">Reviews</dt>
            <dd className="text-lg font-bold text-gray-900">{data.profile.reviewCount}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="flex items-center gap-1.5 text-xs text-gray-400">
              <ShieldCheck size={12} className="text-emerald-500" />
              Identity
            </dt>
            <dd className="text-sm font-medium">
              {data.profile.isIdentityVerified ? (
                <span className="text-emerald-600">Verified</span>
              ) : (
                <span className="text-amber-600">Pending</span>
              )}
            </dd>
          </div>
        </dl>
      </Section>
    </div>
  );
}
