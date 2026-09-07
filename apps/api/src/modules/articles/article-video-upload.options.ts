import { BadRequestException } from '@nestjs/common';
import { diskStorage, type File as MulterFile } from 'multer';
import type { Request } from 'express';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  ARTICLE_VIDEO_MAX_BYTES,
  ARTICLE_VIDEO_MIME_TYPES,
} from './article-media.constants';
import {
  buildUniqueUploadFilename,
  ensureBlogUploadDirectory,
  parseBlogMediaKind,
} from './article-upload.paths';

const BLOG_VIDEO_EXTENSIONS = new Set(['.mp4', '.webm']);
const LEGACY_VIDEO_EXTENSIONS = new Set(['.mp4', '.webm', '.mov', '.avi']);
const LEGACY_VIDEO_MIME = new Set([
  ...ARTICLE_VIDEO_MIME_TYPES,
  'video/quicktime',
  'video/x-msvideo',
]);

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
      req: Request,
      _file: MulterFile,
      cb: (error: Error | null, destination: string) => void,
    ) => {
      try {
        const kind = parseBlogMediaKind(req.query?.kind) ?? 'content';
        const useBlog = Boolean(parseBlogMediaKind(req.query?.kind));
        cb(
          null,
          useBlog
            ? ensureBlogUploadDirectory(kind)
            : ensureArticleVideoUploadDirectory(),
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
      const useBlog = Boolean(parseBlogMediaKind(req.query?.kind));
      const allowed = useBlog ? BLOG_VIDEO_EXTENSIONS : LEGACY_VIDEO_EXTENSIONS;
      cb(null, buildUniqueUploadFilename(file.originalname, allowed, '.mp4'));
    },
  }),
  limits: { fileSize: ARTICLE_VIDEO_MAX_BYTES },
  fileFilter: (
    req: Request,
    file: MulterFile,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    const useBlog = Boolean(parseBlogMediaKind(req.query?.kind));
    const allowed = useBlog ? ARTICLE_VIDEO_MIME_TYPES : LEGACY_VIDEO_MIME;
    if (!allowed.has(file.mimetype)) {
      cb(
        new BadRequestException(
          useBlog
            ? 'Only MP4 and WebM video files are allowed.'
            : 'Only MP4, WebM, MOV, and AVI video files are allowed.',
        ),
        false,
      );
      return;
    }
    cb(null, true);
  },
};
