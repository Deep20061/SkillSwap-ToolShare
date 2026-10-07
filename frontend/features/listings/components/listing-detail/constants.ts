import type { DeliveryMethod, ToolCondition } from "@/features/listings/types";

export const DELIVERY_LABELS: Record<DeliveryMethod, string> = {
  IN_PERSON: "In person",
  REMOTE: "Remote",
  BOTH: "In person or remote",
};

export const CONDITION_LABELS: Record<ToolCondition, string> = {
  NEW: "New",
  LIKE_NEW: "Like new",
  GOOD: "Good",
  FAIR: "Fair",
};

/** Edit-mode inputs use brand-300 border to make the editable state more obvious. */
export const listingEditInputClassName =
  "w-full h-10 rounded-lg bg-surface border border-brand-300 text-sm text-ink px-3 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-colors";

export const listingEditSelectClassName = listingEditInputClassName;
