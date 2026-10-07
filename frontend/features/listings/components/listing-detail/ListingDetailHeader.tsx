"use client";

import { useRef, useState } from "react";
import {
  Dots,
  Edit,
  Eye,
  Hand,
  Heart,
  HeartFill,
  Send,
  Shield,
  StarFill,
  Tools,
  Trash,
  Upload,
} from "@/components/ui/Icons";
import { useDismissOnOutsideClick } from "@/features/listings/hooks/useDismissOnOutsideClick";
import type { EditForm } from "@/features/listings/hooks/useListing";
import type { Listing } from "@/features/listings/types";
import { useSaveListing } from "@/features/listings/hooks/useSaveListing";
import { cx } from "@/lib/utils";

export interface ListingDetailHeaderProps {
  listing: Listing;
  isSkill: boolean;
  catLabel: string;
  memberSince: string;
  editing: boolean;
  editForm: EditForm | null;
  isOwner: boolean;
  isUploading: boolean;
  isDeleting: boolean;
  confirmDelete: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onEditFormChange: (form: EditForm) => void;
  onOpenEdit: () => void;
  onConfirmDelete: (value: boolean) => void;
  onDelete: () => void;
  onUploadClick: () => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ListingDetailHeader({
  listing,
  isSkill,
  catLabel,
  memberSince,
  editing,
  editForm,
  isOwner,
  isUploading,
  isDeleting,
  confirmDelete,
  fileInputRef,
  onEditFormChange,
  onOpenEdit,
  onConfirmDelete,
  onDelete,
  onUploadClick,
  onFileChange,
}: ListingDetailHeaderProps) {
  const owner = listing.user;
  const [dotsOpen, setDotsOpen] = useState(false);
  const dotsRef = useRef<HTMLDivElement>(null);
  const { isSaved, saveCount, toggle } = useSaveListing(listing.id, {
    isSaved: listing.isSaved,
    saveCount: listing.saveCount ?? 0,
  });

  useDismissOnOutsideClick(dotsRef, () => setDotsOpen(false));

  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <span
            className={cx(
              "inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-2 py-0.5 text-[11px] font-medium tracking-wide",
              isSkill
                ? "border-violet-200 bg-violet-50 text-violet-700"
                : "border-amber-200 bg-amber-50 text-amber-800"
            )}
          >
            {isSkill ? <Hand size={10} /> : <Tools size={10} />}
            {isSkill ? "Skill offer" : "Tool listing"}
          </span>
          <span className="inline-flex items-center rounded-md border border-line bg-sunken px-2 py-0.5 text-[11px] text-ink2">
            {catLabel}
          </span>
          {owner.profile?.isIdentityVerified && (
            <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">
              <Shield size={10} /> Verified host
            </span>
          )}
        </div>

        {editing && editForm ? (
          <input
            className="w-full max-w-2xl border-b-2 border-brand-400 bg-transparent pb-0.5 text-2xl font-bold leading-tight tracking-tight text-ink outline-none md:text-3xl"
            value={editForm.title}
            onChange={(event) => onEditFormChange({ ...editForm, title: event.target.value })}
            maxLength={120}
          />
        ) : (
          <h1 className="break-words text-2xl font-bold leading-tight tracking-tight text-ink md:text-3xl">
            {listing.title}
          </h1>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-ink2">
          {owner.profile?.rating != null && (
            <span className="flex items-center gap-1">
              <StarFill size={13} className="text-amber-500" />
              <span className="font-semibold text-ink">{owner.profile.rating.toFixed(1)}</span>
              {owner.profile.reviewCount > 0 && <span>({owner.profile.reviewCount})</span>}
            </span>
          )}
          <span className="text-ink3">·</span>
          <span className="flex items-center gap-1">
            <Eye size={13} /> {listing.viewCount} views
          </span>
          <span className="text-ink3">·</span>
          <span className="flex items-center gap-1">
            <HeartFill size={12} className="text-rose-400" /> {saveCount} saves
          </span>
          <span className="text-ink3">·</span>
          <span>Posted {memberSince}</span>
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center gap-2">
        {!editing && (
          <>
            <button
              type="button"
              onClick={toggle}
              className={cx(
                "inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-sm transition-colors",
                isSaved
                  ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                  : "border-line text-ink2 hover:bg-sunken hover:text-ink"
              )}
            >
              {isSaved ? <HeartFill size={14} /> : <Heart size={14} />}
              {isSaved ? "Saved" : "Save"}
            </button>
            <button
              type="button"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line px-3 text-sm text-ink2 hover:bg-sunken hover:text-ink"
            >
              <Send size={14} /> Share
            </button>
          </>
        )}
        <div className="relative" ref={dotsRef}>
          <button
            type="button"
            onClick={() => setDotsOpen((open) => !open)}
            className={cx(
              "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line text-ink2 transition-colors hover:bg-sunken hover:text-ink",
              dotsOpen && "bg-sunken text-ink"
            )}
          >
            <Dots size={14} />
          </button>
          {dotsOpen && (
            <div className="absolute right-0 top-10 z-20 w-52 rounded-xl border border-line bg-surface py-1.5 shadow-pop">
              {isOwner ? (
                <>
                  {!editing && (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenEdit();
                        setDotsOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-ink transition-colors hover:bg-sunken"
                    >
                      <Edit size={14} className="flex-shrink-0 text-ink3" /> Edit listing
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      onUploadClick();
                      setDotsOpen(false);
                    }}
                    disabled={isUploading}
                    className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-ink transition-colors hover:bg-sunken disabled:opacity-50"
                  >
                    <Upload size={14} className="flex-shrink-0 text-ink3" />
                    {isUploading ? "Uploading…" : "Upload photos"}
                  </button>
                  <div className="my-1 border-t border-line" />
                  {confirmDelete ? (
                    <div className="px-3.5 py-2">
                      <p className="mb-2 text-xs text-ink2">Delete this listing?</p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={onDelete}
                          disabled={isDeleting}
                          className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-rose-700 disabled:opacity-50"
                        >
                          {isDeleting ? "Deleting…" : "Yes, delete"}
                        </button>
                        <button
                          type="button"
                          onClick={() => onConfirmDelete(false)}
                          className="text-xs text-ink2 hover:text-ink"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onConfirmDelete(true)}
                      className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-rose-600 transition-colors hover:bg-rose-50"
                    >
                      <Trash size={14} className="flex-shrink-0" /> Delete listing
                    </button>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-ink2 transition-colors hover:bg-sunken"
                >
                  Report this listing
                </button>
              )}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={onFileChange}
          />
        </div>
      </div>
    </div>
  );
}
