import fs from "fs/promises";
import { Request, Response, NextFunction } from "express";
import * as profileService from "./profile.service";
import logger from "../../lib/logger";
import { hasImageMagicBytes, MEDIA_URL_PREFIX } from "../../lib/media";
import type { UpdateProfileInput } from "./profile.validation";

export async function getPublic(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const profile = await profileService.getPublicProfile(String(req.params["userId"]));
    if (!profile) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const profile = await profileService.getProfile(req.user!.id);
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

export async function updateMe(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const profile = await profileService.updateProfile(
      req.user!.id,
      req.body as UpdateProfileInput,
    );
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

export async function uploadAvatar(
  req: Request & { file?: Express.Multer.File },
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    if (!(await hasImageMagicBytes(req.file.path))) {
      await fs.unlink(req.file.path).catch((err) =>
        logger.warn(`Failed to delete rejected upload ${req.file!.path}: ${err.message}`),
      );
      res
        .status(400)
        .json({ error: "Only JPEG, PNG, WebP, and GIF images are allowed" });
      return;
    }
    const relativePath = `${MEDIA_URL_PREFIX}/avatars/${req.file.filename}`;
    await profileService.updateAvatar(req.user!.id, relativePath);
    res.json({ avatarUrl: relativePath });
  } catch (err) {
    next(err);
  }
}

