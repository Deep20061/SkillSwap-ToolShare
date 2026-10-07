import { z } from "zod";

const futureDate = z
  .string()
  .datetime()
  .refine((v) => new Date(v) > new Date(), { message: "Date must be in the future" });

export const proposeContractSchema = z.object({
  listingId: z.string().min(1),
  counterListingId: z.string().min(1).optional(),
  scheduledStart: futureDate.optional(),
  scheduledEnd: futureDate.optional(),
  message: z.string().max(2000).trim().optional(),
}).refine(
  (d) => !d.scheduledStart || !d.scheduledEnd || new Date(d.scheduledEnd) > new Date(d.scheduledStart),
  { message: "End date must be after start date", path: ["scheduledEnd"] },
);

export const patchContractSchema = z.object({
  action: z.enum(["accept", "decline", "complete", "cancel"]),
  cancelReason: z.string().max(500).trim().optional(),
});

export type ProposeContractInput = z.infer<typeof proposeContractSchema>;
export type PatchContractInput = z.infer<typeof patchContractSchema>;
