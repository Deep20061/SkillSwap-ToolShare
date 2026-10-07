"use client";

import { Edit } from "@/components/ui/Icons";

interface ProfileCoverProps {
  showEditButton: boolean;
  onEditProfile: () => void;
}

export function ProfileCover({ showEditButton, onEditProfile }: ProfileCoverProps) {
  return (
    <div className="relative h-48 overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-brand-100 to-brand-200 md:h-64">
      <div className="stripe-ph absolute inset-0 opacity-20" />
      {showEditButton && (
        <div className="absolute right-3 top-3 flex items-center gap-2">
          <button
            type="button"
            onClick={onEditProfile}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white/85 px-3 text-sm text-ink2 backdrop-blur transition-colors hover:bg-white"
          >
            <Edit size={13} /> Edit profile
          </button>
        </div>
      )}
    </div>
  );
}
