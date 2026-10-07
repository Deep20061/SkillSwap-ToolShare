import { Router } from "express";
import { apiLimiter } from "../../middleware/rateLimiter";
import { requireSession } from "../auth/auth.middleware";
import { validate } from "../../lib/validation";
import { patchContractSchema } from "./contracts.validation";
import * as controller from "./contracts.controller";

const router = Router();

router.use(apiLimiter);
router.use(requireSession);

router.patch("/:id", validate(patchContractSchema), controller.patch);

export default router;
