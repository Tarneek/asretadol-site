import { BadRequestException } from '@nestjs/common';
import { diskStorage, type File as MulterFile } from 'multer';
import type { Request } from 'express';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import {
  ARTICLE_VIDEO_MAX_BYTES,
  ARTICLE_VIDEO_MIME_TYPES,
} from './article-media.constants';

const ALLOWED_EXTENSIONS = new Set(['.mp4', '.webm', '.mov', '.avi']);

export function resolveArticleVideoUploadDirectory(): string {
  const fromEnv = process.env.ARTICLE_VIDEO_UPLOAD_DIR?.trim();
  if (fromEnv) {
    return resolve(fromEnv);
  }
  return resolve(process.cwd(), '..', 'web', 'public', 'uploads', 'videos');
}

export function ensureArticleVideoUploadDirectory(): string {
  const dir = resolveArticleVideoUploadDirectory();
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export const ARTICLE_VIDEO_MULTER_OPTIONS = {
  storage: diskStorage({
    destination: (
      _req: Request,
      _file: MulterFile,
      cb: (error: Error | null, destination: string) => void,
    ) => {
      try {
        cb(null, ensureArticleVideoUploadDirectory());
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
      const ext = ALLOWED_EXTENSIONS.has(rawExt) ? rawExt : '.mp4';
      cb(null, `${randomUUID()}${ext}`);
    },
  }),
  limits: { fileSize: ARTICLE_VIDEO_MAX_BYTES },
  fileFilter: (
    _req: Request,
    file: MulterFile,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (!ARTICLE_VIDEO_MIME_TYPES.has(file.mimetype)) {
      cb(
        new BadRequestException('Only MP4, WebM, MOV, and AVI video files are allowed.'),
        false,
      );
      return;
    }
    cb(null, true);
  },
};
