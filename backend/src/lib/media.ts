/**
 * Media helpers — centralises avatar magic-byte validation and disk-path logic
 * so they can be reused across features (profile, listings, etc.) without
 * duplicating fs boilerplate in every controller.
 */

import fsSync from "fs";
import fs from "fs/promises";
import path from "path";
import multer from "multer";
import logger from "./logger";

/** Root directory where uploaded media is stored (overridable via env). */
export const mediaRoot = path.resolve(process.env.MEDIA_PATH ?? "/app/media");

/**
 * Returns a URL-path prefix like "/media" derived from the media root, e.g.
 * "/media/avatars/file.jpg". Stripping this prefix from a stored URL path
 * gives you the file path relative to `mediaRoot`.
 */
export const MEDIA_URL_PREFIX = "/media";

/**
 * Inspects the first 12 bytes of a file and returns `true` when the magic
 * bytes match a supported image format (JPEG, PNG, GIF, WebP).
 *
 * Used as a second layer of defence after multer's MIME-type filter — a
 * client can lie about Content-Type, but it cannot fake magic bytes on disk.
 */
export async function hasImageMagicBytes(filePath: string): Promise<boolean> {
  const handle = await fs.open(filePath, "r");
  try {
    const buf = Buffer.alloc(12);
    const { bytesRead } = await handle.read(buf, 0, 12, 0);
    if (bytesRead < 3) return false;
    // JPEG: FF D8 FF
    if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return true;
    // PNG: 89 50 4E 47
    if (bytesRead >= 4 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47)
      return true;
    // GIF: 47 49 46 38
    if (bytesRead >= 4 && buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38)
      return true;
    // WebP: RIFF????WEBP
    if (
      bytesRead === 12 &&
      buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
      buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
    )
      return true;
    return false;
  } finally {
    await handle.close();
  }
}

/**
 * Inspects the first 8 bytes of a non-image document and returns `true` when
 * the magic bytes match a supported format (PDF, .docx zip, legacy .doc OLE2).
 * Plain-text files have no reliable magic bytes, so they always pass.
 *
 * Used as a second layer of defence after multer's MIME-type filter, following
 * the same two-layer pattern as `hasImageMagicBytes`.
 */
export async function hasDocumentMagicBytes(filePath: string, mimeType: string): Promise<boolean> {
  if (mimeType === "text/plain") {
    const handle = await fs.open(filePath, "r");
    try {
      const buf = Buffer.alloc(512);
      const { bytesRead } = await handle.read(buf, 0, 512, 0);
      const slice = buf.slice(0, bytesRead);
      // Accept UTF-16 LE (FF FE) and UTF-16 BE (FE FF) — both use null bytes legitimately.
      if (bytesRead >= 2 && ((slice[0] === 0xff && slice[1] === 0xfe) || (slice[0] === 0xfe && slice[1] === 0xff))) {
        return true;
      }
      // Reject binary content masquerading as plain text.
      return !slice.includes(0x00);
    } finally {
      await handle.close();
    }
  }
  const handle = await fs.open(filePath, "r");
  try {
    const buf = Buffer.alloc(8);
    const { bytesRead } = await handle.read(buf, 0, 8, 0);
    if (bytesRead < 4) return false;
    // PDF: %PDF
    if (mimeType === "application/pdf") {
      return buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46;
    }
    // .docx: PK zip header (50 4B 03 04)
    if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      return buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 0x03 && buf[3] === 0x04;
    }
    // .doc: OLE2 compound document (D0 CF 11 E0)
    if (mimeType === "application/msword") {
      return buf[0] === 0xd0 && buf[1] === 0xcf && buf[2] === 0x11 && buf[3] === 0xe0;
    }
    return false;
  } finally {
    await handle.close();
  }
}

/** Image MIME types accepted by uploads across the app. */
const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

/** MIME types accepted for general file attachments (messages, etc). */
const ALLOWED_FILE_MIME_TYPES = [
  ...ALLOWED_IMAGE_MIME_TYPES,
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

/**
 * Creates a multer upload instance that stores files in `<mediaRoot>/<subdir>/`.
 * The directory is created synchronously on first call so it always exists when
 * the first request arrives.
 *
 * @param subdir       Sub-directory under `mediaRoot` to store files in.
 * @param maxSizeBytes Maximum accepted file size (defaults to 10 MB).
 */
export function createImageUpload(
  subdir: string,
  maxSizeBytes = 10 * 1024 * 1024,
) {
  const destPath = path.join(mediaRoot, subdir);
  fsSync.mkdirSync(destPath, { recursive: true });

  const storage = multer.diskStorage({
    destination: (
      _req: Express.Request,
      _file: Express.Multer.File,
      cb: (error: Error | null, destination: string) => void,
    ) => cb(null, destPath),
    filename: (
      _req: Express.Request,
      file: Express.Multer.File,
      cb: (error: Error | null, filename: string) => void,
    ) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
      cb(null, unique);
    },
  });

  return multer({
    storage,
    limits: { fileSize: maxSizeBytes },
    fileFilter: (
      _req: Express.Request,
      file: Express.Multer.File,
      cb: (error: Error | null, acceptFile?: boolean) => void,
    ) => {
      if (ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          Object.assign(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), {
            message: "Only JPEG, PNG, WebP, and GIF images are allowed",
          }),
        );
      }
    },
  });
}

/**
 * Same as `createImageUpload` but also accepts PDF and common document types.
 * Used for message attachments where users can send files as well as images.
 *
 * @param subdir       Sub-directory under `mediaRoot` to store files in.
 * @param maxSizeBytes Maximum accepted file size (defaults to 25 MB).
 */
export function createFileUpload(
  subdir: string,
  maxSizeBytes = 25 * 1024 * 1024,
) {
  const destPath = path.join(mediaRoot, subdir);
  fsSync.mkdirSync(destPath, { recursive: true });

  const storage = multer.diskStorage({
    destination: (
      _req: Express.Request,
      _file: Express.Multer.File,
      cb: (error: Error | null, destination: string) => void,
    ) => cb(null, destPath),
    filename: (
      _req: Express.Request,
      file: Express.Multer.File,
      cb: (error: Error | null, filename: string) => void,
    ) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
      cb(null, unique);
    },
  });

  return multer({
    storage,
    limits: { fileSize: maxSizeBytes },
    fileFilter: (
      _req: Express.Request,
      file: Express.Multer.File,
      cb: (error: Error | null, acceptFile?: boolean) => void,
    ) => {
      if (ALLOWED_FILE_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          Object.assign(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), {
            message: "Only images, PDF, Word documents, and plain text are allowed",
          }),
        );
      }
    },
  });
}

/**
 * Deletes a media file identified by its stored URL path (e.g. "/media/avatars/old.jpg").
 *
 * - Resolves the disk path by replacing the URL prefix with `mediaRoot`.
 * - Refuses to delete anything outside `mediaRoot` (path-traversal guard).
 * - Silently swallows ENOENT (file already gone) so callers don't need to handle it.
 * - Logs a warning on unexpected errors rather than throwing.
 */
export async function deleteMediaFile(urlPath: string): Promise<void> {
  const relative = urlPath.startsWith(MEDIA_URL_PREFIX)
    ? urlPath.slice(MEDIA_URL_PREFIX.length)
    : urlPath;
  const diskPath = path.resolve(path.join(mediaRoot, relative));

  if (!diskPath.startsWith(mediaRoot + "/")) {
    logger.warn(`deleteMediaFile: refusing to delete path outside media root: ${diskPath}`);
    return;
  }

  try {
    await fs.unlink(diskPath);
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
      logger.warn(`deleteMediaFile: could not delete ${diskPath}: ${(err as Error).message}`);
    }
  }
}
