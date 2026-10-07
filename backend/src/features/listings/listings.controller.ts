import { Request, Response, NextFunction } from "express";
import fs from "fs/promises";
import * as listingsService from "./listings.service";
import {
  hasImageMagicBytes,
  deleteMediaFile,
  MEDIA_URL_PREFIX,
} from "../../lib/media";
import type {
  CreateListingInput,
  UpdateListingInput,
  ListingQueryInput,
} from "./listings.validation";

export async function listMap(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = (req as Request & { parsedQuery: ListingQueryInput })
      .parsedQuery;
    const pins = await listingsService.getListingsForMap(query, req.user?.id);
    res.json({ pins });
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
    const query = (req as Request & { parsedQuery: ListingQueryInput })
      .parsedQuery;
    const result = await listingsService.getListings(query, req.user?.id);
    res.json(result);
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
    const listing = await listingsService.getListingById(String(req.params["id"]), req.user?.id);
    if (!listing) {
      res.status(404).json({ error: "Listing not found" });
      return;
    }
    res.json(listing);
  } catch (err) {
    next(err);
  }
}

export async function create(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = await listingsService.createListing(
      req.user!.id,
      req.body as CreateListingInput,
    );
    res.status(201).json({ id });
  } catch (err) {
    next(err);
  }
}

export async function update(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await listingsService.updateListing(
      String(req.params["id"]),
      req.user!.id,
      req.body as UpdateListingInput,
    );
    if (result === null) {
      res.status(404).json({ error: "Listing not found" });
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

export async function remove(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await listingsService.deleteListing(
      String(req.params["id"]),
      req.user!.id,
    );
    if (result === null) {
      res.status(404).json({ error: "Listing not found" });
      return;
    }
    if (result === "forbidden") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export async function mine(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const listings = await listingsService.getMyListings(req.user!.id);
    res.json({ listings });
  } catch (err) {
    next(err);
  }
}

export async function uploadMedia(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const valid = await hasImageMagicBytes(req.file.path);
    if (!valid) {
      await deleteMediaFile(req.file.path);
      res.status(400).json({ error: "Invalid image file" });
      return;
    }

    const urlPath = `${MEDIA_URL_PREFIX}/listings/${req.file.filename}`;
    const result = await listingsService.addListingMedia(
      String(req.params["id"]),
      req.user!.id,
      { path: urlPath, mimetype: req.file.mimetype, size: req.file.size },
    );

    if (result === null) {
      await fs.unlink(req.file.path).catch(() => {});
      res.status(404).json({ error: "Listing not found" });
      return;
    }
    if (result === "forbidden") {
      await fs.unlink(req.file.path).catch(() => {});
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function toggleSave(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await listingsService.toggleSave(String(req.params["id"]), req.user!.id);
    if (result === null) {
      res.status(404).json({ error: "Listing not found" });
      return;
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getSaved(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const listings = await listingsService.getSavedListings(req.user!.id);
    res.json({ listings });
  } catch (err) {
    next(err);
  }
}

export async function deleteMedia(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const filePath = await listingsService.removeListingMedia(
      String(req.params["id"]),
      String(req.params["mediaId"]),
      req.user!.id,
    );

    if (filePath === null) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    if (filePath === "forbidden") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    await deleteMediaFile(filePath);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
