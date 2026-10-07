/**
 * Hand-written ambient declarations for multer v2 (which ships no .d.ts files).
 * Only covers the subset used in this project.
 */

// Augment Express.Request so req.file and req.files are typed everywhere.
// This must be in the global scope (no top-level import/export) for the
// namespace augmentation to apply globally.
declare namespace Express {
  namespace Multer {
    interface File {
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      size: number;
      destination: string;
      filename: string;
      path: string;
      buffer: Buffer;
    }
  }

  interface Request {
    file?: Express.Multer.File;
    files?:
      | { [fieldname: string]: Express.Multer.File[] }
      | Express.Multer.File[];
  }
}

declare module "multer" {
  import { RequestHandler } from "express";

  type FileFilterCallback = (
    error: Error | null,
    acceptFile?: boolean,
  ) => void;

  interface DiskStorageOptions {
    destination?:
      | string
      | ((
          req: Express.Request,
          file: Express.Multer.File,
          callback: (error: Error | null, destination: string) => void,
        ) => void);
    filename?: (
      req: Express.Request,
      file: Express.Multer.File,
      callback: (error: Error | null, filename: string) => void,
    ) => void;
  }

  interface StorageEngine {
    _handleFile(
      req: Express.Request,
      file: Express.Multer.File,
      callback: (error?: Error, info?: Partial<Express.Multer.File>) => void,
    ): void;
    _removeFile(
      req: Express.Request,
      file: Express.Multer.File,
      callback: (error: Error | null) => void,
    ): void;
  }

  interface Options {
    dest?: string;
    storage?: StorageEngine;
    limits?: {
      fieldNameSize?: number;
      fieldSize?: number;
      fields?: number;
      fileSize?: number;
      files?: number;
      parts?: number;
      headerPairs?: number;
    };
    preservePath?: boolean;
    fileFilter?: (
      req: Express.Request,
      file: Express.Multer.File,
      callback: FileFilterCallback,
    ) => void;
  }

  class MulterError extends Error {
    code: string;
    field?: string;
    constructor(code: string, field?: string);
  }

  interface Multer {
    single(fieldname: string): RequestHandler;
    array(fieldname: string, maxCount?: number): RequestHandler;
    fields(
      fields: ReadonlyArray<{ name: string; maxCount?: number }>,
    ): RequestHandler;
    none(): RequestHandler;
    any(): RequestHandler;
  }

  function multer(options?: Options): Multer;
  namespace multer {
    function diskStorage(options: DiskStorageOptions): StorageEngine;
    function memoryStorage(): StorageEngine;
    class MulterError extends Error {
      code: string;
      field?: string;
      constructor(code: string, field?: string);
    }
  }

  export = multer;
}
