import { z } from "zod";

export { validate } from "../../lib/validation";

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters")
    .optional(),
  bio: z
    .string()
    .max(500, "Bio must be at most 500 characters")
    .optional()
    .nullable(),
  location: z
    .string()
    .max(200, "Location must be at most 200 characters")
    .optional()
    .nullable(),
  timezone: z
    .string()
    .max(100, "Timezone must be at most 100 characters")
    .optional()
    .nullable(),
  phone: z
    .string()
    .max(30, "Phone must be at most 30 characters")
    .optional()
    .nullable(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

