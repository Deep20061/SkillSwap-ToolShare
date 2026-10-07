import fs from "fs/promises";
import path from "path";
import { Request, Response, NextFunction } from "express";
import * as service from "./conversations.service";
import { hasImageMagicBytes, hasDocumentMagicBytes, MEDIA_URL_PREFIX } from "../../lib/media";
import type {
  CreateConversationInput,
  SendMessageInput,
  MessagesQueryInput,
  ScheduleProposalInput,
  ConfirmSlotInput,
} from "./conversations.validation";

export async function createOrFind(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = req.body as CreateConversationInput;
    const result = await service.getOrCreateConversation(req.user!.id, input);
    if (result === null) {
      res.status(400).json({ error: "Invalid recipient" });
      return;
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function list(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const conversations = await service.getConversations(req.user!.id);
    res.json({ conversations });
  } catch (err) {
    next(err);
  }
}

export async function unreadTotal(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const total = await service.getUnreadTotal(req.user!.id);
    res.json({ total });
  } catch (err) {
    next(err);
  }
}

export async function getOne(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await service.getConversation(
      String(req.params["id"]),
      req.user!.id,
    );
    if (result === null) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    if (result === "forbidden") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function messages(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = (req as Request & { parsedQuery: MessagesQueryInput })
      .parsedQuery;
    const result = await service.getMessages(
      String(req.params["id"]),
      req.user!.id,
      query,
    );
    if (result === "forbidden") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    if (result === "invalid_last_message_id") {
      res.status(400).json({ error: "Invalid lastMessageId" });
      return;
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function send(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const file = req.file as Express.Multer.File | undefined;

  try {
    const input = req.body as SendMessageInput;

    if (!input.content?.trim() && !file) {
      res.status(400).json({ error: "Message must have content or an attachment" });
      return;
    }

    // Membership check before touching the file so non-participants can't
    // land uploads on disk even temporarily.
    const isMember = await service.isConversationMember(String(req.params["id"]), req.user!.id);
    if (!isMember) {
      if (file) await fs.unlink(file.path).catch(() => {});
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    // Magic-byte check — second layer of defence after multer MIME filter
    if (file) {
      const isImage = file.mimetype.startsWith("image/");
      const valid = isImage
        ? await hasImageMagicBytes(file.path)
        : await hasDocumentMagicBytes(file.path, file.mimetype);
      if (!valid) {
        await fs.unlink(file.path).catch(() => {});
        res.status(400).json({ error: isImage ? "Invalid image file" : "Invalid document file" });
        return;
      }
    }

    const fileData = file
      ? {
          path: `${MEDIA_URL_PREFIX}/message-attachments/${path.basename(file.path)}`,
          mimeType: file.mimetype,
          fileName: file.originalname,
          sizeBytes: file.size,
        }
      : undefined;

    const result = await service.sendMessage(
      String(req.params["id"]),
      req.user!.id,
      input,
      fileData,
    );

    if (result === "forbidden") {
      if (file) await fs.unlink(file.path).catch(() => {});
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    res.status(201).json(result);
  } catch (err) {
    if (file) await fs.unlink(file.path).catch(() => {});
    next(err);
  }
}

export async function typing(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await service.publishTyping(
      String(req.params["id"]),
      req.user!.id,
      req.user!.name,
    );
    if (result === "forbidden") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export async function getMedia(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const cursor = req.query["cursor"] ? String(req.query["cursor"]) : undefined;
    const result = await service.getConversationMedia(
      String(req.params["id"]),
      req.user!.id,
      cursor,
    );
    if (result === "forbidden") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function markRead(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await service.markAsRead(
      String(req.params["id"]),
      req.user!.id,
    );
    if (result === "forbidden") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export async function sendSchedule(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = req.body as ScheduleProposalInput;
    const result = await service.sendScheduleProposal(String(req.params["id"]), req.user!.id, input);
    if (result === "forbidden") { res.status(403).json({ error: "Forbidden" }); return; }
    res.json(result);
  } catch (err) { next(err); }
}

export async function confirmSlot(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = req.body as ConfirmSlotInput;
    const result = await service.confirmScheduleSlot(
      String(req.params["id"]),
      req.user!.id,
      String(req.params["messageId"]),
      input,
    );
    if (result === "forbidden") { res.status(403).json({ error: "Forbidden" }); return; }
    if (result === "not_found") { res.status(404).json({ error: "Not found" }); return; }
    if (result === "invalid_slot") { res.status(400).json({ error: "Invalid slot index" }); return; }
    if (result === "already_confirmed") { res.status(409).json({ error: "Slot already confirmed" }); return; }
    res.json(result);
  } catch (err) { next(err); }
}
