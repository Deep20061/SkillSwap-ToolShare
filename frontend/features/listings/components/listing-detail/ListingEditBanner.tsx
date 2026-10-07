import { Edit } from "@/components/ui/Icons";

export interface ListingEditBannerProps {
  isSaving: boolean;
  onCancel: () => void;
  onSave: () => void;
}

export function ListingEditBanner({ isSaving, onCancel, onSave }: ListingEditBannerProps) {
  return (
    <div className="sticky top-0 z-[1050] border-b border-amber-500 bg-amber-400">
      <div className="mx-auto flex h-10 max-w-[1400px] items-center justify-between gap-3 px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-sm font-medium text-amber-900">
          <Edit size={14} className="flex-shrink-0" />
          Editing mode — your changes aren&apos;t saved yet
        </div>
        <div className="flex items-center gap-3 text-xs text-amber-900">
          <button
            type="button"
            onClick={onCancel}
            className="underline underline-offset-2 hover:text-amber-950"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="rounded-md bg-amber-900 px-3 py-1 text-xs font-semibold text-amber-50 transition-colors hover:bg-amber-950 disabled:opacity-60"
          >
            {isSaving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
