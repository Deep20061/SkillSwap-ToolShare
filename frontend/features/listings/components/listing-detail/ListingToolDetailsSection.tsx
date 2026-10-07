import {
  ListingDetailKV,
  ListingDetailSection,
  ListingEditLabel,
} from "@/features/listings/components/listing-detail/DetailLayout";
import {
  CONDITION_LABELS,
  listingEditInputClassName,
  listingEditSelectClassName,
} from "@/features/listings/components/listing-detail/constants";
import type { EditForm } from "@/features/listings/hooks/useListing";
import type { Listing, ToolCondition } from "@/features/listings/types";

export interface ListingToolDetailsSectionProps {
  listing: Listing;
  editing: boolean;
  editForm: EditForm | null;
  onEditFormChange: (form: EditForm) => void;
}

export function ListingToolDetailsSection({
  listing,
  editing,
  editForm,
  onEditFormChange,
}: ListingToolDetailsSectionProps) {
  if (!listing.toolDetail) return null;

  return (
    <ListingDetailSection title="Tool details">
      {editing && editForm ? (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <ListingEditLabel>Condition</ListingEditLabel>
            <select
              className={listingEditSelectClassName}
              value={editForm.condition}
              onChange={(event) =>
                onEditFormChange({
                  ...editForm,
                  condition: event.target.value as ToolCondition,
                })
              }
            >
              <option value="NEW">New</option>
              <option value="LIKE_NEW">Like new</option>
              <option value="GOOD">Good</option>
              <option value="FAIR">Fair</option>
            </select>
          </div>
          <div>
            <ListingEditLabel>Deposit (€)</ListingEditLabel>
            <input
              type="number"
              min="0"
              className={listingEditInputClassName}
              value={editForm.depositAmount}
              onChange={(event) =>
                onEditFormChange({ ...editForm, depositAmount: event.target.value })
              }
            />
          </div>
          <div>
            <ListingEditLabel>Max borrow (days)</ListingEditLabel>
            <input
              type="number"
              min="1"
              className={listingEditInputClassName}
              value={editForm.maxBorrowDays}
              onChange={(event) =>
                onEditFormChange({ ...editForm, maxBorrowDays: event.target.value })
              }
            />
          </div>
          <div>
            <ListingEditLabel>Pickup location</ListingEditLabel>
            <input
              className={listingEditInputClassName}
              value={editForm.pickupLocation}
              onChange={(event) =>
                onEditFormChange({ ...editForm, pickupLocation: event.target.value })
              }
            />
          </div>
        </div>
      ) : (
        <dl className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <ListingDetailKV
            label="Condition"
            value={CONDITION_LABELS[listing.toolDetail.condition]}
          />
          {listing.toolDetail.maxBorrowDays != null && (
            <ListingDetailKV
              label="Max borrow"
              value={`${listing.toolDetail.maxBorrowDays} days`}
            />
          )}
          {listing.toolDetail.depositAmount != null && (
            <ListingDetailKV
              label="Deposit (held)"
              value={`€${listing.toolDetail.depositAmount}`}
            />
          )}
          {listing.toolDetail.pickupLocation && (
            <ListingDetailKV label="Pickup" value={listing.toolDetail.pickupLocation} />
          )}
        </dl>
      )}
    </ListingDetailSection>
  );
}
