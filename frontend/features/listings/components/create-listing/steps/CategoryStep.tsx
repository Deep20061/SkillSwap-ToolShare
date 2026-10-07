import { CAT_ICONS, Compass } from "@/components/ui/Icons";
import { cx } from "@/lib/utils";
import { CreateListingStepPanel } from "@/features/listings/components/create-listing/StepPanel";
import type { Category } from "@/features/listings/hooks/useCategories";

export interface CreateListingCategoryStepProps {
  categories: Category[];
  categoriesLoading: boolean;
  listingCategoryId: string | undefined;
  onCategoryToggle: (categoryId: string) => void;
  categoryError?: string;
}

export function CreateListingCategoryStep({
  categories,
  categoriesLoading,
  listingCategoryId,
  onCategoryToggle,
  categoryError,
}: CreateListingCategoryStepProps) {
  return (
    <CreateListingStepPanel
      title="Choose a category"
      sub="This helps the right people find your listing."
    >
      {categoryError && <p className="mb-3 text-xs text-rose-600">{categoryError}</p>}
      {categoriesLoading ? (
        <p className="font-mono text-sm text-ink3">Loading categories…</p>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => {
            const iconKey = category.icon?.toLowerCase() ?? "";
            const Icon = CAT_ICONS[iconKey] ?? Compass;
            const isSelected = listingCategoryId === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onCategoryToggle(category.id)}
                className={cx(
                  "flex items-center gap-2.5 rounded-lg border p-3 text-left transition-colors",
                  isSelected
                    ? "border-brand-500 bg-brand-50 text-ink"
                    : "border-line text-ink2 hover:border-line2"
                )}
              >
                <Icon size={16} />
                <span className="text-sm font-medium">{category.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </CreateListingStepPanel>
  );
}
