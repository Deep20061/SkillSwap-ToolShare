import { Hand, Tools } from "@/components/ui/Icons";
import { cx } from "@/lib/utils";
import { CreateListingStepPanel } from "@/features/listings/components/create-listing/StepPanel";
import type { ListingType } from "@/features/listings/types";

const TYPE_OPTIONS = [
  {
    value: "SKILL_OFFER" as const,
    title: "A skill I can teach or do",
    description: "Cooking, coaching, repairs, tutoring, code, photography…",
    icon: <Hand size={22} />,
    iconBg: "bg-violet-100 text-violet-700",
  },
  {
    value: "TOOL_LISTING" as const,
    title: "A tool I can lend",
    description: "Drills, mixers, bikes, drones, ladders, anything physical…",
    icon: <Tools size={22} />,
    iconBg: "bg-amber-100 text-amber-800",
  },
] as const;

export interface CreateListingTypeStepProps {
  type: ListingType;
  onTypeChange: (type: ListingType) => void;
}

export function CreateListingTypeStep({ type, onTypeChange }: CreateListingTypeStepProps) {
  return (
    <CreateListingStepPanel
      title="What are you posting?"
      sub="Skills are exchanged time-for-time. Tools are borrowed with an optional deposit."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {TYPE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onTypeChange(option.value)}
            className={cx(
              "rounded-2xl border-2 p-5 text-left transition-all",
              type === option.value
                ? "border-brand-500 bg-brand-50"
                : "border-line hover:border-line2"
            )}
          >
            <div
              className={cx(
                "mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl",
                option.iconBg
              )}
            >
              {option.icon}
            </div>
            <div className="mb-1 font-bold text-ink">{option.title}</div>
            <p className="text-sm leading-relaxed text-ink2">{option.description}</p>
          </button>
        ))}
      </div>
    </CreateListingStepPanel>
  );
}
