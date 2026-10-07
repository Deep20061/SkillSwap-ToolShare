import { Hand, Tools } from "@/components/ui/Icons";
import type { ListingType } from "@/features/listings/types";
import { cx } from "@/lib/utils";

export interface ListingTypeBadgeProps {
  type: ListingType;
  /** Icon size in px. Defaults to 10. */
  iconSize?: number;
  /**
   * Layout/spacing classes for the badge span. Defaults to the listing-card
   * sizing. Pass the original string from a call site to preserve its exact
   * appearance.
   */
  className?: string;
}

const DEFAULT_CLASS =
  "inline-flex items-center gap-1 rounded-md font-medium tracking-wide whitespace-nowrap text-[11px] px-2 py-0.5 border";

/**
 * Shared "Skill" / "Tool" pill rendered across listing cards, the map list,
 * and the my-listings table.
 */
export function ListingTypeBadge({
  type,
  iconSize = 10,
  className = DEFAULT_CLASS,
}: ListingTypeBadgeProps) {
  const isSkill = type === "SKILL_OFFER";
  return (
    <span
      className={cx(
        className,
        isSkill
          ? "border-violet-200 bg-violet-50 text-violet-700"
          : "border-amber-200 bg-amber-50 text-amber-800"
      )}
    >
      {isSkill ? <Hand size={iconSize} /> : <Tools size={iconSize} />}
      {isSkill ? "Skill" : "Tool"}
    </span>
  );
}
