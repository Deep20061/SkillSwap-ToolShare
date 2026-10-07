import { z } from "zod";
import { Request, Response, NextFunction } from "express";

/**
 * Express middleware that validates `req.body` against a Zod schema.
 * On success, replaces `req.body` with the parsed (coerced) data.
 * On failure, responds 400 with the flattened Zod error.
 */
export function validate(schema: z.ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.flatten() });
      return;
    }
    req.body = result.data;
    next();
  };
}

/**
 * Express middleware that validates `req.query` against a Zod schema.
 * On success, attaches the parsed (coerced) data as `req.parsedQuery` so
 * controllers receive typed values without mutating the read-only `req.query`.
 */
export function validateQuery(schema: z.ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      res.status(400).json({ error: result.error.flatten() });
      return;
    }
    (req as Request & { parsedQuery: unknown }).parsedQuery = result.data;
    next();
  };
}

/**
 * Converts an arbitrary string to a URL-safe slug. Falls back to a
 * timestamp-based slug when the input reduces to an empty string.
 */
export function slugify(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || `skill-${Date.now()}`;
}
