import { Request, Response, NextFunction } from "express";
import * as service from "./contracts.service";
import type { ProposeContractInput, PatchContractInput } from "./contracts.validation";

export async function propose(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = req.body as ProposeContractInput;
    const result = await service.proposeContract(
      String(req.params["conversationId"]),
      req.user!.id,
      input,
    );
    if (result === null) {
      res.status(404).json({ error: "Conversation or listing not found" });
      return;
    }
    if (result === "forbidden") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    if (result === "conflict") {
      res.status(409).json({ error: "An active contract already exists for this conversation" });
      return;
    }
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getForConversation(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await service.getContractForConversation(
      String(req.params["conversationId"]),
      req.user!.id,
    );
    if (result === "forbidden") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    if (result === null) {
      res.json({ contract: null });
      return;
    }
    res.json({ contract: result });
  } catch (err) {
    next(err);
  }
}

export async function patch(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = req.body as PatchContractInput;
    const result = await service.patchContract(
      String(req.params["id"]),
      req.user!.id,
      input,
    );
    if (result === null) {
      res.status(404).json({ error: "Contract not found" });
      return;
    }
    if (result === "forbidden") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    if (result === "invalid_transition") {
      res.status(422).json({ error: "Invalid status transition" });
      return;
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
}
