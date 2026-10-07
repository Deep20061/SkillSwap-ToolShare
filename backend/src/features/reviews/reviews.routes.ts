import { Router } from "express";
import { apiLimiter } from "../../middleware/rateLimiter";
import { requireSession } from "../auth/auth.middleware";
import { validate } from "../../lib/validation";
import { createReviewSchema } from "./reviews.validation";
import * as controller from "./reviews.controller";

const router = Router();

router.use(apiLimiter);

router.get("/user/:userId", controller.listForUser);

router.use(requireSession);

router.post("/", validate(createReviewSchema), controller.create);
router.get("/:contractId/status", controller.checkStatus);

export default router;
