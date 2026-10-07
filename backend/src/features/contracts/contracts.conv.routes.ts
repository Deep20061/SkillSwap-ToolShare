import { Router } from "express";
import { apiLimiter } from "../../middleware/rateLimiter";
import { requireSession } from "../auth/auth.middleware";
import { validate } from "../../lib/validation";
import { proposeContractSchema } from "./contracts.validation";
import * as controller from "./contracts.controller";

const router = Router();

router.use(apiLimiter);
router.use(requireSession);

router.post("/:conversationId/contracts", validate(proposeContractSchema), controller.propose);
router.get("/:conversationId/contracts", controller.getForConversation);

export default router;
