import { existsSync, mkdirSync } from 'node:fs';
import { basename, extname, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { slugify } from '../../common/utils/slug.util';
import {
  BLOG_MEDIA_KINDS,
  BLOG_UPLOAD_URL_PREFIX,
  type BlogMediaKind,
} from './article-media.constants';

export function parseBlogMediaKind(raw: unknown): BlogMediaKind | null {
  if (raw === 'thumbnail' || raw === 'thumbnails') {
    return 'thumbnails';
  }
  if (raw === 'main' || raw === 'featured' || raw === 'banner') {
    return 'main';
  }
  if (raw === 'content') {
    return 'content';
  }
  return null;
}

/** Root for blog media: thumbnails/, main/, content/. */
export function resolveBlogUploadRoot(): string {
  const fromEnv =
    process.env.UPLOAD_DIR?.trim() || process.env.BLOG_UPLOAD_DIR?.trim();
  if (fromEnv) {
    return resolve(fromEnv);
  }
  return resolve(process.cwd(), 'uploads', 'blog');
}

export function resolveBlogUploadDirectory(kind: BlogMediaKind): string {
  return resolve(resolveBlogUploadRoot(), kind);
}

export function ensureBlogUploadDirectories(): string {
  const root = resolveBlogUploadRoot();
  for (const kind of BLOG_MEDIA_KINDS) {
    const dir = resolve(root, kind);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }
  return root;
}

export function ensureBlogUploadDirectory(kind: BlogMediaKind): string {
  const dir = resolveBlogUploadDirectory(kind);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function buildBlogPublicPath(kind: BlogMediaKind, filename: string): string {
  return `${BLOG_UPLOAD_URL_PREFIX}${kind}/${filename}`;
}

export function buildUniqueUploadFilename(
  originalName: string,
  allowedExtensions: Set<string>,
  fallbackExt: string,
): string {
  const rawExt = extname(originalName).toLowerCase();
  const ext = allowedExtensions.has(rawExt)
    ? rawExt === '.jpeg'
      ? '.jpg'
      : rawExt
    : fallbackExt;
  const originalSlug = slugify(basename(originalName, extname(originalName))).slice(
    0,
    40,
  );
  const stamp = Date.now();
  const id = randomUUID();
  return originalSlug
    ? `${stamp}-${id}-${originalSlug}${ext}`
    : `${stamp}-${id}${ext}`;
}
