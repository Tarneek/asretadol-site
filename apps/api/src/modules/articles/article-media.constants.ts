export const ARTICLE_PLACEHOLDER_IMAGE_PATH = '/images/placeholder-news.svg';

/** Legacy advertisement / story image prefix. */
export const ARTICLE_UPLOAD_URL_PREFIX = '/uploads/news/';

export const BLOG_UPLOAD_URL_PREFIX = '/uploads/blog/';

export const ARTICLE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export const ARTICLE_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export const ARTICLE_VIDEO_UPLOAD_URL_PREFIX = '/uploads/videos/';

export const BLOG_CONTENT_UPLOAD_URL_PREFIX = '/uploads/blog/content/';

/** 100 MB — configured in multer limits for video uploads. */
export const ARTICLE_VIDEO_MAX_BYTES = 100 * 1024 * 1024;

export const ARTICLE_VIDEO_MIME_TYPES = new Set(['video/mp4', 'video/webm']);

export type BlogMediaKind = 'thumbnails' | 'main' | 'content';

export const BLOG_MEDIA_KINDS: readonly BlogMediaKind[] = [
  'thumbnails',
  'main',
  'content',
];
