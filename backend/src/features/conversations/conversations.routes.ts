import { Router } from "express";
import { apiLimiter } from "../../middleware/rateLimiter";
import { requireSession } from "../auth/auth.middleware";
import { validate, validateQuery } from "../../lib/validation";
import { createFileUpload } from "../../lib/media";
import {
  createConversationSchema,
  sendMessageSchema,
  messagesQuerySchema,
  scheduleProposalSchema,
  confirmSlotSchema,
} from "./conversations.validation";
import * as controller from "./conversations.controller";

const router = Router();
const messageUpload = createFileUpload("message-attachments", 10 * 1024 * 1024);

router.use(apiLimiter);
router.use(requireSession);

router.post("/", validate(createConversationSchema), controller.createOrFind);
router.get("/", controller.list);
router.get("/unread", controller.unreadTotal);
router.get("/:id", controller.getOne);
router.get("/:id/messages", validateQuery(messagesQuerySchema), controller.messages);
router.post("/:id/messages", messageUpload.single("file"), validate(sendMessageSchema), controller.send);
router.post("/:id/typing", controller.typing);
router.get("/:id/media", controller.getMedia);
router.patch("/:id/read", controller.markRead);
router.post("/:id/schedule", validate(scheduleProposalSchema), controller.sendSchedule);
router.patch("/:id/schedule/:messageId/confirm", validate(confirmSlotSchema), controller.confirmSlot);

export default router;
