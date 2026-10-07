import { Check } from "@/components/ui/Icons";
import { cx } from "@/lib/utils";
import { CREATE_LISTING_STEPS } from "@/features/listings/components/create-listing/constants";

export interface CreateListingStepRailProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

export function CreateListingStepRail({ currentStep, onStepClick }: CreateListingStepRailProps) {
  return (
    <ol className="mb-8 flex items-center gap-2 overflow-x-auto pb-1">
      {CREATE_LISTING_STEPS.map((step, index) => (
        <li key={step.key} className="flex flex-shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => index < currentStep && onStepClick(index)}
            className={cx(
              "flex h-8 items-center gap-2 rounded-full border px-3 text-xs font-medium",
              index === currentStep
                ? "border-ink bg-ink text-surface"
                : index < currentStep
                  ? "border-line bg-surface text-ink2"
                  : "border-dashed border-line bg-transparent text-ink3"
            )}
          >
            <span
              className={cx(
                "inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px]",
                index === currentStep
                  ? "bg-white/20"
                  : index < currentStep
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-sunken"
              )}
            >
              {index < currentStep ? <Check size={11} /> : index + 1}
            </span>
            {step.label}
          </button>
          {index < CREATE_LISTING_STEPS.length - 1 && <span className="text-xs text-ink3">›</span>}
        </li>
      ))}
    </ol>
  );
}
