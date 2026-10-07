"use client";

import Link from "next/link";
import { AppFooter } from "@/components/AppFooter";
import { ListingAboutSection } from "@/features/listings/components/listing-detail/ListingAboutSection";
import { ListingActionCard } from "@/features/listings/components/listing-detail/ListingActionCard";
import { ListingDetailBreadcrumb } from "@/features/listings/components/listing-detail/ListingDetailBreadcrumb";
import { ListingDetailHeader } from "@/features/listings/components/listing-detail/ListingDetailHeader";
import { ListingEditBanner } from "@/features/listings/components/listing-detail/ListingEditBanner";
import { ListingEditFooter } from "@/features/listings/components/listing-detail/ListingEditFooter";
import { ListingGallery } from "@/features/listings/components/listing-detail/ListingGallery";
import { ListingHostSection } from "@/features/listings/components/listing-detail/ListingHostSection";
import { ListingLocationSection } from "@/features/listings/components/listing-detail/ListingLocationSection";
import { ListingSkillSessionSection } from "@/features/listings/components/listing-detail/ListingSkillSessionSection";
import { ListingToolDetailsSection } from "@/features/listings/components/listing-detail/ListingToolDetailsSection";
import { useListing, type EditForm } from "@/features/listings/hooks/useListing";
import { cx } from "@/lib/utils";

export default function ListingDetailPage() {
  const {
    listing,
    isLoading,
    error,
    editing,
    editForm,
    setEditForm,
    isSaving,
    confirmDelete,
    setConfirmDelete,
    isDeleting,
    isUploading,
    fileInputRef,
    apiUrl,
    isOwner,
    openEdit,
    closeEdit,
    handleSave,
    handleDelete,
    handleUpload,
    handleDeleteMedia,
  } = useListing();

  if (isLoading) {
    return (
      <div className="min-h-full bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-16 md:px-6 lg:px-8">
          <div className="animate-pulse font-mono text-sm text-ink3">Loading…</div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-full bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center md:px-6 lg:px-8">
          <p className="mb-4 text-sm text-ink2">{error ?? "Listing not found."}</p>
          <Link href="/listings" className="text-sm text-brand-600 no-underline hover:underline">
            ← Back to listings
          </Link>
        </div>
      </div>
    );
  }

  const isSkill = listing.type === "SKILL_OFFER";
  const owner = listing.user;
  const avatarSrc = owner.profile?.avatarUrl
    ? `${apiUrl}${owner.profile.avatarUrl}`
    : owner.image
      ? `${apiUrl}${owner.image}`
      : null;
  const memberSince = new Date(listing.createdAt).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
  const catLabel = listing.category?.name ?? (isSkill ? "Skill" : "Tool");

  function handleEditFormChange(nextForm: EditForm) {
    setEditForm(nextForm);
  }

  return (
    <div className={cx("min-h-full bg-surface", editing && "pb-20")}>
      {editing && (
        <ListingEditBanner isSaving={isSaving} onCancel={closeEdit} onSave={handleSave} />
      )}

      <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-6 md:py-8 lg:px-8">
        <ListingDetailBreadcrumb listing={listing} isSkill={isSkill} />

        <ListingDetailHeader
          listing={listing}
          isSkill={isSkill}
          catLabel={catLabel}
          memberSince={memberSince}
          editing={editing}
          editForm={editForm}
          isOwner={isOwner}
          isUploading={isUploading}
          isDeleting={isDeleting}
          confirmDelete={confirmDelete}
          fileInputRef={fileInputRef}
          onEditFormChange={handleEditFormChange}
          onOpenEdit={openEdit}
          onConfirmDelete={setConfirmDelete}
          onDelete={handleDelete}
          onUploadClick={() => fileInputRef.current?.click()}
          onFileChange={handleUpload}
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0">
            <ListingGallery
              listing={listing}
              apiUrl={apiUrl}
              editing={editing}
              isUploading={isUploading}
              onUploadClick={() => fileInputRef.current?.click()}
              onDeleteMedia={handleDeleteMedia}
            />

            <ListingAboutSection
              listing={listing}
              editing={editing}
              editForm={editForm}
              onEditFormChange={handleEditFormChange}
            />

            {isSkill && (
              <ListingSkillSessionSection
                listing={listing}
                editing={editing}
                editForm={editForm}
                onEditFormChange={handleEditFormChange}
              />
            )}

            {!isSkill && (
              <ListingToolDetailsSection
                listing={listing}
                editing={editing}
                editForm={editForm}
                onEditFormChange={handleEditFormChange}
              />
            )}

            <ListingLocationSection listing={listing} />
            <ListingHostSection listing={listing} avatarSrc={avatarSrc} memberSince={memberSince} />
          </div>

          <ListingActionCard listing={listing} isSkill={isSkill} />
        </div>
      </div>

      <AppFooter />

      {editing && editForm && (
        <ListingEditFooter
          editForm={editForm}
          isSaving={isSaving}
          onCancel={closeEdit}
          onSave={handleSave}
          onEditFormChange={handleEditFormChange}
        />
      )}
    </div>
  );
}
