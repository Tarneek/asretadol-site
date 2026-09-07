import { BadRequestException } from '@nestjs/common';
import { diskStorage, type File as MulterFile } from 'multer';
import type { Request } from 'express';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  ARTICLE_IMAGE_MAX_BYTES,
  ARTICLE_IMAGE_MIME_TYPES,
} from './article-media.constants';
import {
  buildUniqueUploadFilename,
  ensureBlogUploadDirectory,
  parseBlogMediaKind,
} from './article-upload.paths';

const BLOG_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const LEGACY_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const LEGACY_IMAGE_MIME = new Set([
  ...ARTICLE_IMAGE_MIME_TYPES,
  'image/gif',
]);

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
      req: Request,
      _file: MulterFile,
      cb: (error: Error | null, destination: string) => void,
    ) => {
      try {
        const kind = parseBlogMediaKind(req.query?.kind);
        cb(
          null,
          kind ? ensureBlogUploadDirectory(kind) : ensureArticleUploadDirectory(),
        );
      } catch (error) {
        cb(error as Error, '');
      }
    },
    filename: (
      req: Request,
      file: MulterFile,
      cb: (error: Error | null, filename: string) => void,
    ) => {
      const kind = parseBlogMediaKind(req.query?.kind);
      const allowed = kind ? BLOG_IMAGE_EXTENSIONS : LEGACY_IMAGE_EXTENSIONS;
      cb(null, buildUniqueUploadFilename(file.originalname, allowed, '.jpg'));
    },
  }),
  limits: { fileSize: ARTICLE_IMAGE_MAX_BYTES },
  fileFilter: (
    req: Request,
    file: MulterFile,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    const kind = parseBlogMediaKind(req.query?.kind);
    const allowed = kind ? ARTICLE_IMAGE_MIME_TYPES : LEGACY_IMAGE_MIME;
    if (!allowed.has(file.mimetype)) {
      cb(
        new BadRequestException(
          kind
            ? 'Only JPEG, PNG, and WebP images are allowed.'
            : 'Only JPEG, PNG, WebP, and GIF images are allowed.',
        ),
        false,
      );
      return;
    }
    cb(null, true);
  },
};
