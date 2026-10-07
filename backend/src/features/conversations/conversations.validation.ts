import { z } from "zod";

const futureDate = z
  .string()
  .datetime()
  .refine((v) => new Date(v) > new Date(), { message: "Date must be in the future" });

export const createConversationSchema = z.object({
  recipientId: z.string().min(1),
  listingId: z.string().min(1).optional(),
  // If provided, automatically propose a contract on conversation creation
  offerListingId: z.string().min(1).optional(),
  scheduledStart: futureDate.optional(),
  scheduledEnd: futureDate.optional(),
});

export const sendMessageSchema = z.object({
  content: z.string().max(2000).trim().optional(),
});

export const messagesQuerySchema = z.object({
  lastMessageId: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(30),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type MessagesQueryInput = z.infer<typeof messagesQuerySchema>;

export const scheduleProposalSchema = z.object({
  slots: z.array(z.object({
    day: z.string(),
    date: z.string(),
    time: z.string(),
    dur: z.string(),
    rawDate: z.string(),
  })).min(1).max(5),
});

export const confirmSlotSchema = z.object({
  slotIndex: z.number().int().min(0),
});

export type ScheduleProposalInput = z.infer<typeof scheduleProposalSchema>;
export type ConfirmSlotInput = z.infer<typeof confirmSlotSchema>;
