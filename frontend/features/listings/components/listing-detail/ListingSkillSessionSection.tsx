import {
  ListingDetailKV,
  ListingDetailSection,
  ListingEditLabel,
} from "@/features/listings/components/listing-detail/DetailLayout";
import {
  DELIVERY_LABELS,
  listingEditInputClassName,
  listingEditSelectClassName,
} from "@/features/listings/components/listing-detail/constants";
import type { EditForm } from "@/features/listings/hooks/useListing";
import type { DeliveryMethod, Listing } from "@/features/listings/types";

export interface ListingSkillSessionSectionProps {
  listing: Listing;
  editing: boolean;
  editForm: EditForm | null;
  onEditFormChange: (form: EditForm) => void;
}

export function ListingSkillSessionSection({
  listing,
  editing,
  editForm,
  onEditFormChange,
}: ListingSkillSessionSectionProps) {
  if (!listing.skillDetail) return null;

  return (
    <ListingDetailSection title="Session details">
      {editing && editForm ? (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <ListingEditLabel>Delivery</ListingEditLabel>
            <select
              className={listingEditSelectClassName}
              value={editForm.deliveryMethod}
              onChange={(event) =>
                onEditFormChange({
                  ...editForm,
                  deliveryMethod: event.target.value as DeliveryMethod,
                })
              }
            >
              <option value="IN_PERSON">In person</option>
              <option value="REMOTE">Remote</option>
              <option value="BOTH">Both</option>
            </select>
          </div>
          <div>
            <ListingEditLabel>Est. hours</ListingEditLabel>
            <input
              type="number"
              min="0"
              step="0.5"
              className={listingEditInputClassName}
              value={editForm.estimatedHours}
              onChange={(event) =>
                onEditFormChange({ ...editForm, estimatedHours: event.target.value })
              }
            />
          </div>
          <div className="col-span-2">
            <ListingEditLabel>Looking for in exchange</ListingEditLabel>
            <input
              className={listingEditInputClassName}
              placeholder="e.g. cooking lessons, gardening…"
              value={editForm.exchangeFor}
              onChange={(event) =>
                onEditFormChange({ ...editForm, exchangeFor: event.target.value })
              }
            />
          </div>
        </div>
      ) : (
        <dl className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <ListingDetailKV label="Skill" value={listing.skillDetail.skill.name} />
          <ListingDetailKV
            label="Delivery"
            value={DELIVERY_LABELS[listing.skillDetail.deliveryMethod]}
          />
          {listing.skillDetail.estimatedHours != null && (
            <ListingDetailKV
              label="Session length"
              value={`${listing.skillDetail.estimatedHours}h`}
            />
          )}
          {listing.skillDetail.exchangeFor && (
            <div className="col-span-2 rounded-lg border border-line bg-sunken p-3">
              <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink3">
                Looking for in exchange
              </div>
              <div className="text-sm text-ink">{listing.skillDetail.exchangeFor}</div>
            </div>
          )}
        </dl>
      )}
    </ListingDetailSection>
  );
}
