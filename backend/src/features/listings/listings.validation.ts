import { z } from "zod";

export { validate, validateQuery } from "../../lib/validation";

// ── Shared ────────────────────────────────────────────────────────────────────

export const listingTypeSchema = z.enum(["SKILL_OFFER", "TOOL_LISTING"]);
export const listingStatusSchema = z.enum(["ACTIVE", "PAUSED", "ARCHIVED"]);
export const deliveryMethodSchema = z.enum(["IN_PERSON", "REMOTE", "BOTH"]);
export const toolConditionSchema = z.enum(["NEW", "LIKE_NEW", "GOOD", "FAIR"]);

// ── Create ────────────────────────────────────────────────────────────────────

const skillDetailSchema = z.object({
  skillName: z
    .string()
    .min(1, "Skill name is required")
    .max(100, "Skill name must be at most 100 characters"),
  estimatedHours: z.number().positive().optional(),
  deliveryMethod: deliveryMethodSchema,
  exchangeFor: z
    .string()
    .max(300, "exchangeFor must be at most 300 characters")
    .optional()
    .nullable(),
});

const toolDetailSchema = z.object({
  category: z
    .string()
    .min(1, "Category is required")
    .max(100, "Category must be at most 100 characters"),
  condition: toolConditionSchema,
  depositAmount: z.number().int().nonnegative().optional().nullable(),
  maxBorrowDays: z.number().int().positive().optional().nullable(),
  pickupLocation: z
    .string()
    .max(300, "Pickup location must be at most 300 characters")
    .optional()
    .nullable(),
});

export const createListingSchema = z
  .object({
    type: listingTypeSchema,
    title: z
      .string()
      .min(5, "Title must be at least 5 characters")
      .max(120, "Title must be at most 120 characters"),
    description: z
      .string()
      .min(20, "Description must be at least 20 characters")
      .max(2000, "Description must be at most 2000 characters"),
    tags: z
      .array(z.string().max(40, "Each tag must be at most 40 characters"))
      .max(10, "Cannot add more than 10 tags")
      .default([]),
    skillDetail: skillDetailSchema.optional(),
    toolDetail: toolDetailSchema.optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    locationName: z.string().max(200).optional(),
    categoryId: z.string().min(1, "categoryId is required"),
  })
  .refine(
    (d) => {
      if (d.type === "SKILL_OFFER") return !!d.skillDetail;
      if (d.type === "TOOL_LISTING") return !!d.toolDetail;
      return false;
    },
    {
      message:
        "skillDetail is required for SKILL_OFFER; toolDetail is required for TOOL_LISTING",
    },
  )
  .refine((d) => (d.latitude === undefined) === (d.longitude === undefined), {
    message: "latitude and longitude must both be provided or both omitted",
    path: ["latitude"],
  });

export type CreateListingInput = z.infer<typeof createListingSchema>;

// ── Update ────────────────────────────────────────────────────────────────────

export const updateListingSchema = z
  .object({
    title: z
      .string()
      .min(5, "Title must be at least 5 characters")
      .max(120, "Title must be at most 120 characters")
      .optional(),
    description: z
      .string()
      .min(20, "Description must be at least 20 characters")
      .max(2000, "Description must be at most 2000 characters")
      .optional(),
    tags: z
      .array(z.string().max(40, "Each tag must be at most 40 characters"))
      .max(10, "Cannot add more than 10 tags")
      .optional(),
    status: listingStatusSchema.optional(),
    skillDetail: z
      .object({
        estimatedHours: z.number().positive().optional().nullable(),
        deliveryMethod: deliveryMethodSchema.optional(),
        exchangeFor: z
          .string()
          .max(300, "exchangeFor must be at most 300 characters")
          .optional()
          .nullable(),
      })
      .optional(),
    toolDetail: z
      .object({
        category: z
          .string()
          .min(1, "Category is required")
          .max(100, "Category must be at most 100 characters")
          .optional(),
        condition: toolConditionSchema.optional(),
        depositAmount: z.number().int().nonnegative().optional().nullable(),
        maxBorrowDays: z.number().int().positive().optional().nullable(),
        pickupLocation: z
          .string()
          .max(300, "Pickup location must be at most 300 characters")
          .optional()
          .nullable(),
      })
      .optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    locationName: z.string().max(200).optional(),
    categoryId: z.string().optional(),
  })
  .refine((d) => (d.latitude === undefined) === (d.longitude === undefined), {
    message: "latitude and longitude must both be provided or both omitted",
    path: ["latitude"],
  });

export type UpdateListingInput = z.infer<typeof updateListingSchema>;

// ── Query ─────────────────────────────────────────────────────────────────────

export const listingQuerySchema = z
  .object({
    type: listingTypeSchema.optional(),
    status: listingStatusSchema.optional(),
    page: z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .refine((n) => n >= 1, "page must be >= 1")
      .default("1"),
    limit: z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .refine((n) => n >= 1 && n <= 50, "limit must be between 1 and 50")
      .default("20"),
    q: z.string().max(100).optional(),
    tag: z.string().max(40).optional(),
    categoryId: z.string().optional(),
    userId: z.string().optional(),
    minLat: z
      .string()
      .transform(Number)
      .refine((n) => !isNaN(n) && n >= -90 && n <= 90, "minLat must be between -90 and 90")
      .optional(),
    maxLat: z
      .string()
      .transform(Number)
      .refine((n) => !isNaN(n) && n >= -90 && n <= 90, "maxLat must be between -90 and 90")
      .optional(),
    minLng: z
      .string()
      .transform(Number)
      .refine((n) => !isNaN(n) && n >= -180 && n <= 180, "minLng must be between -180 and 180")
      .optional(),
    maxLng: z
      .string()
      .transform(Number)
      .refine((n) => !isNaN(n) && n >= -180 && n <= 180, "maxLng must be between -180 and 180")
      .optional(),
    verifiedOnly: z.string().optional().transform((v) => v === "true"),
    superHostOnly: z.string().optional().transform((v) => v === "true"),
    minDeposit: z
      .string()
      .transform(Number)
      .refine((n) => !isNaN(n) && n >= 0, "minDeposit must be a non-negative number")
      .optional(),
    maxDeposit: z
      .string()
      .transform(Number)
      .refine((n) => !isNaN(n) && n >= 0, "maxDeposit must be a non-negative number")
      .optional(),
    userLat: z
      .string()
      .transform(Number)
      .refine((n) => !isNaN(n) && n >= -90 && n <= 90, "userLat must be between -90 and 90")
      .optional(),
    userLng: z
      .string()
      .transform(Number)
      .refine((n) => !isNaN(n) && n >= -180 && n <= 180, "userLng must be between -180 and 180")
      .optional(),
    radiusKm: z
      .string()
      .transform(Number)
      .refine((n) => !isNaN(n) && n >= 1 && n <= 100, "radiusKm must be between 1 and 100")
      .optional(),
  })
  .superRefine((d, ctx) => {
    const bboxParams = [d.minLat, d.maxLat, d.minLng, d.maxLng];
    const provided = bboxParams.filter((v) => v !== undefined).length;
    if (provided !== 0 && provided !== 4) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "minLat, maxLat, minLng, and maxLng must all be provided together or all omitted",
        path: ["minLat"],
      });
    }
  });

export type ListingQueryInput = z.infer<typeof listingQuerySchema>;
