import { CreateListingStepPanel } from "@/features/listings/components/create-listing/StepPanel";
import type { ListingType } from "@/features/listings/types";

export interface CreateListingPreviewStepProps {
  type: ListingType;
  categoryName: string;
  title: string;
  photoCount: number;
  locationName: string;
  submitError: string | null;
  isSubmitting: boolean;
}

export function CreateListingPreviewStep({
  type,
  categoryName,
  title,
  photoCount,
  locationName,
  submitError,
  isSubmitting,
}: CreateListingPreviewStepProps) {
  const summaryRows = [
    { key: "Type", value: type === "SKILL_OFFER" ? "Skill offer" : "Tool listing" },
    { key: "Category", value: categoryName },
    { key: "Title", value: title || "—" },
    {
      key: "Photos",
      value: `${photoCount} added${photoCount === 0 ? " — add at least 1" : ""}`,
    },
    { key: "Location", value: locationName || "Not set (profile location will be used)" },
  ] as const;

  return (
    <CreateListingStepPanel title="Preview & publish" sub="This is what people will see.">
      <div className="mb-6 space-y-3">
        {summaryRows.map(({ key, value }) => (
          <div key={key} className="flex items-center justify-between border-b border-line py-2">
            <span className="font-mono text-xs uppercase tracking-wider text-ink3">{key}</span>
            <span className="max-w-[220px] truncate text-sm font-medium text-ink">{value}</span>
          </div>
        ))}
      </div>

      {submitError && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-relaxed text-rose-600">
          {submitError}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="h-12 w-full rounded-xl bg-ink text-sm font-semibold text-surface transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting
          ? photoCount > 0
            ? "Uploading photos…"
            : "Publishing…"
          : "Publish listing →"}
      </button>
      <p className="mt-2 text-center text-[11px] text-ink3">
        By publishing, you agree to the Community Code of Conduct.
      </p>
    </CreateListingStepPanel>
  );
}
