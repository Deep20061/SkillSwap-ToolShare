import type { ContractStatus } from "../types";

export const DEAL_STEPS = ["Talking", "Terms", "Scheduled", "Done"] as const;

export function dealStep(status: ContractStatus | null | undefined): {
  idx: number;
  label: string;
  headline: string;
} {
  switch (status) {
    case "PENDING":
      return { idx: 1, label: "Terms", headline: "Terms proposed — review and accept" };
    case "ACCEPTED":
    case "IN_PROGRESS":
      return { idx: 2, label: "Scheduled", headline: "Booked. See you there." };
    case "COMPLETED":
      return { idx: 3, label: "Done", headline: "Swap done — leave a review" };
    case "CANCELLED":
    case "DECLINED":
      return { idx: -1, label: "Ended", headline: "This swap was cancelled." };
    default:
      return { idx: 0, label: "Talking", headline: "Negotiating the swap" };
  }
}

export function dealStepIdx(status: ContractStatus | null): number {
  switch (status) {
    case "PENDING":
      return 1;
    case "ACCEPTED":
    case "IN_PROGRESS":
      return 2;
    case "COMPLETED":
      return 3;
    default:
      return 0;
  }
}

export function listingKind(type: string | undefined): "SKILL" | "TOOL" {
  return type === "SKILL_OFFER" ? "SKILL" : "TOOL";
}
