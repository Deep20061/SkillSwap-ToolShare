import { Router } from "express";
import { apiLimiter } from "../../middleware/rateLimiter";
import { requireSession } from "../auth/auth.middleware";
import { validate, updateProfileSchema } from "./profile.validation";
import * as controller from "./profile.controller";
import { createImageUpload } from "../../lib/media";

const upload = createImageUpload("avatars", 5 * 1024 * 1024);

const router = Router();

router.use(apiLimiter);

router.get("/me", requireSession, controller.getMe);
router.get("/:userId", controller.getPublic);
router.patch(
  "/me",
  requireSession,
  validate(updateProfileSchema),
  controller.updateMe,
);
router.post(
  "/me/avatar",
  requireSession,
  upload.single("avatar"),
  controller.uploadAvatar,
);

export default router;
