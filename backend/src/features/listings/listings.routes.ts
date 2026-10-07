import { Router } from "express";
import { apiLimiter } from "../../middleware/rateLimiter";
import { requireSession, optionalSession } from "../auth/auth.middleware";
import {
  validate,
  validateQuery,
  createListingSchema,
  updateListingSchema,
  listingQuerySchema,
} from "./listings.validation";
import * as controller from "./listings.controller";
import { createImageUpload } from "../../lib/media";

const router = Router();
const upload = createImageUpload("listings");

router.use(apiLimiter);

// ── Public routes (optionalSession injects req.user when a cookie is present) ──
router.get("/", optionalSession, validateQuery(listingQuerySchema), controller.list);
router.get("/map", optionalSession, validateQuery(listingQuerySchema), controller.listMap);

// ── Protected routes ──────────────────────────────────────────────────────────
// Static segments (/me/listings, /saved) must come before /:id
router.get("/me/listings", requireSession, controller.mine);
router.get("/saved", requireSession, controller.getSaved);
router.post("/:id/save", requireSession, controller.toggleSave);
router.get("/:id", optionalSession, controller.getOne);
router.post("/", requireSession, validate(createListingSchema), controller.create);
router.patch(
  "/:id",
  requireSession,
  validate(updateListingSchema),
  controller.update,
);
router.delete("/:id", requireSession, controller.remove);

// ── Media routes ──────────────────────────────────────────────────────────────
router.post("/:id/media", requireSession, upload.single("file"), controller.uploadMedia);
router.delete("/:id/media/:mediaId", requireSession, controller.deleteMedia);

export default router;
