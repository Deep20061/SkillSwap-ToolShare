import {
  ListingDetailSection,
  ListingEditLabel,
} from "@/features/listings/components/listing-detail/DetailLayout";
import { listingEditInputClassName } from "@/features/listings/components/listing-detail/constants";
import type { EditForm } from "@/features/listings/hooks/useListing";
import type { Listing } from "@/features/listings/types";

export interface ListingAboutSectionProps {
  listing: Listing;
  editing: boolean;
  editForm: EditForm | null;
  onEditFormChange: (form: EditForm) => void;
}

export function ListingAboutSection({
  listing,
  editing,
  editForm,
  onEditFormChange,
}: ListingAboutSectionProps) {
  return (
    <ListingDetailSection title="About this listing">
      {editing && editForm ? (
        <div className="space-y-4">
          <div>
            <ListingEditLabel>Description</ListingEditLabel>
            <textarea
              rows={6}
              className="w-full resize-y rounded-lg border border-brand-300 bg-surface p-3 text-[15px] leading-relaxed text-ink transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
              value={editForm.description}
              onChange={(event) =>
                onEditFormChange({ ...editForm, description: event.target.value })
              }
              maxLength={2000}
            />
            <span className="mt-1 block text-[10px] text-ink3">
              {editForm.description.length}/2000
            </span>
          </div>
          <div>
            <ListingEditLabel>Tags (comma-separated)</ListingEditLabel>
            <input
              className={listingEditInputClassName}
              placeholder="e.g. beginner-friendly, weekends"
              value={editForm.tags}
              onChange={(event) => onEditFormChange({ ...editForm, tags: event.target.value })}
            />
          </div>
        </div>
      ) : (
        <>
          <p className="text-[15px] leading-relaxed text-ink2">{listing.description}</p>
          {listing.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {listing.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-line bg-sunken px-2.5 py-1 text-xs text-ink2"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </ListingDetailSection>
  );
}
