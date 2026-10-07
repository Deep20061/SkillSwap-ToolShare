import { Request, Response, NextFunction } from "express";
import * as service from "./reviews.service";
import type { CreateReviewInput } from "./reviews.validation";

export async function create(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = req.body as CreateReviewInput;
    const result = await service.createReview(req.user!.id, input);

    if (result === "not_found") {
      res.status(404).json({ error: "Contract not found" });
      return;
    }
    if (result === "forbidden") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    if (result === "not_completed") {
      res.status(400).json({ error: "Can only review a completed exchange" });
      return;
    }
    if (result === "already_reviewed") {
      res.status(409).json({ error: "You have already reviewed this exchange" });
      return;
    }

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function listForUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const cursor = typeof req.query["cursor"] === "string" ? req.query["cursor"] : undefined;
    const result = await service.getUserReviews(String(req.params["userId"]), cursor);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function checkStatus(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await service.getReviewStatus(
      req.user!.id,
      String(req.params["contractId"]),
    );

    if (result === "not_found") {
      res.status(404).json({ error: "Contract not found" });
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
