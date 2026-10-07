import type { ListingType } from "@/features/listings/types";

export function getBrowseKindLabel(selectedType: ListingType | ""): string {
  if (selectedType === "SKILL_OFFER") return "Skills to swap";
  if (selectedType === "TOOL_LISTING") return "Tools to borrow";
  return "All listings";
}
