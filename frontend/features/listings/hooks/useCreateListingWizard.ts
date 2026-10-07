"use client";

import { useState, useCallback } from "react";
import {
  validateCreateListingWizardStep,
  type CreateListingWizardValidationInput,
} from "@/features/listings/lib/validateCreateListingWizardStep";
import { CREATE_LISTING_STEP_COUNT } from "@/features/listings/components/create-listing/constants";

export function useCreateListingWizard(validationInput: CreateListingWizardValidationInput) {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);

  const goToPreviousStep = useCallback(() => {
    setStepError(null);
    setCurrentStep((step) => Math.max(0, step - 1));
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const continueToNextStep = useCallback(() => {
    const error = validateCreateListingWizardStep(currentStep, validationInput);
    if (error) {
      setStepError(error);
      return;
    }
    setStepError(null);
    setCurrentStep((step) => Math.min(CREATE_LISTING_STEP_COUNT - 1, step + 1));
  }, [currentStep, validationInput]);

  return {
    currentStep,
    stepError,
    goToPreviousStep,
    goToStep,
    continueToNextStep,
  };
}
