import type { ListingType } from "@/features/listings/types";

export interface CreateListingWizardValidationInput {
  listingCategoryId: string | undefined;
  title: string;
  description: string;
  type: ListingType;
  skillName: string;
  toolCategory: string;
  photoCount: number;
}

/** Returns an inline error message, or null when the step is valid. */
export function validateCreateListingWizardStep(
  step: number,
  input: CreateListingWizardValidationInput
): string | null {
  switch (step) {
    case 0:
      return null;
    case 1:
      if (!input.listingCategoryId) {
        return "Please select a category before continuing.";
      }
      return null;
    case 2:
      if (input.title.trim().length < 5) {
        return "Title must be at least 5 characters.";
      }
      if (input.description.trim().length < 20) {
        return "Description must be at least 20 characters.";
      }
      if (input.type === "SKILL_OFFER" && !input.skillName.trim()) {
        return "Skill name is required.";
      }
      if (input.type === "TOOL_LISTING" && !input.toolCategory.trim()) {
        return "Tool category is required.";
      }
      return null;
    case 3:
      if (input.photoCount === 0) {
        return "Please add at least one photo.";
      }
      return null;
    case 4:
      return null;
    default:
      return null;
  }
}
