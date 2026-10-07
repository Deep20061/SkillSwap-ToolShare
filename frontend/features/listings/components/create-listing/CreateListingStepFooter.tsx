import { ArrowL, ArrowR } from "@/components/ui/Icons";
import { CREATE_LISTING_STEP_COUNT } from "@/features/listings/components/create-listing/constants";

export interface CreateListingStepFooterProps {
  currentStep: number;
  stepError: string | null;
  onBack: () => void;
  onContinue: () => void;
}

export function CreateListingStepFooter({
  currentStep,
  stepError,
  onBack,
  onContinue,
}: CreateListingStepFooterProps) {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep >= CREATE_LISTING_STEP_COUNT - 1;

  return (
    <>
      {stepError && <p className="-mb-2 mt-4 text-right text-xs text-rose-500">{stepError}</p>}
      <div className="mt-8 flex items-center justify-between border-t border-line pt-6">
        <button
          type="button"
          onClick={onBack}
          disabled={isFirstStep}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-4 text-sm text-ink2 hover:bg-sunken hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowL size={14} /> Back
        </button>
        <div className="text-xs text-ink3">
          Step {currentStep + 1} of {CREATE_LISTING_STEP_COUNT}
        </div>
        {!isLastStep ? (
          <button
            type="button"
            onClick={onContinue}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-ink px-4 text-sm font-medium text-surface transition-opacity hover:opacity-90"
          >
            Continue <ArrowR size={14} />
          </button>
        ) : null}
      </div>
    </>
  );
}
