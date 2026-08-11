export const ARTICLE_PLACEHOLDER_IMAGE_PATH = '/images/placeholder-news.svg';

export const ARTICLE_UPLOAD_URL_PREFIX = '/uploads/news/';

export const ARTICLE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export const ARTICLE_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

export const ARTICLE_VIDEO_UPLOAD_URL_PREFIX = '/uploads/videos/';

/** 100 MB — configured in multer limits for video uploads. */
export const ARTICLE_VIDEO_MAX_BYTES = 100 * 1024 * 1024;

export const ARTICLE_VIDEO_MIME_TYPES = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
]);
