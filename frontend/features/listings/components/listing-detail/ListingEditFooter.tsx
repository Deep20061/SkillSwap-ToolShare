import type { EditForm } from "@/features/listings/hooks/useListing";

export interface ListingEditFooterProps {
  editForm: EditForm;
  isSaving: boolean;
  onCancel: () => void;
  onSave: () => void;
  onEditFormChange: (form: EditForm) => void;
}

export function ListingEditFooter({
  editForm,
  isSaving,
  onCancel,
  onSave,
  onEditFormChange,
}: ListingEditFooterProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[1050] border-t border-line bg-surface/95 shadow-pop backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-ink3 sm:block">Status</span>
          <select
            className="h-8 rounded-lg border border-line2 bg-sunken px-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand-200"
            value={editForm.status}
            onChange={(event) =>
              onEditFormChange({
                ...editForm,
                status: event.target.value as "ACTIVE" | "PAUSED",
              })
            }
          >
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-9 rounded-lg px-4 text-sm text-ink2 transition-colors hover:bg-sunken hover:text-ink"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="h-9 rounded-lg bg-ink px-5 text-sm font-semibold text-surface transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSaving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
