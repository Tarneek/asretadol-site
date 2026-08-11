import { BadRequestException } from '@nestjs/common';
import { diskStorage, type File as MulterFile } from 'multer';
import type { Request } from 'express';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import {
  ARTICLE_IMAGE_MAX_BYTES,
  ARTICLE_IMAGE_MIME_TYPES,
} from './article-media.constants';

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

export function resolveArticleUploadDirectory(): string {
  const fromEnv = process.env.ARTICLE_UPLOAD_DIR?.trim();
  if (fromEnv) {
    return resolve(fromEnv);
  }
  return resolve(process.cwd(), '..', 'web', 'public', 'uploads', 'news');
}

export function ensureArticleUploadDirectory(): string {
  const dir = resolveArticleUploadDirectory();
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export const ARTICLE_IMAGE_MULTER_OPTIONS = {
  storage: diskStorage({
    destination: (
      _req: Request,
      _file: MulterFile,
      cb: (error: Error | null, destination: string) => void,
    ) => {
      try {
        cb(null, ensureArticleUploadDirectory());
      } catch (error) {
        cb(error as Error, '');
      }
    },
    filename: (
      _req: Request,
      file: MulterFile,
      cb: (error: Error | null, filename: string) => void,
    ) => {
      const rawExt = extname(file.originalname).toLowerCase();
      const ext = ALLOWED_EXTENSIONS.has(rawExt)
        ? rawExt === '.jpeg'
          ? '.jpg'
          : rawExt
        : '.jpg';
      cb(null, `${randomUUID()}${ext}`);
    },
  }),
  limits: { fileSize: ARTICLE_IMAGE_MAX_BYTES },
  fileFilter: (
    _req: Express.Request,
    file: MulterFile,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (!ARTICLE_IMAGE_MIME_TYPES.has(file.mimetype)) {
      cb(
        new BadRequestException('Only JPEG, PNG, WebP, and GIF images are allowed.'),
        false,
      );
      return;
    }
    cb(null, true);
  },
};
