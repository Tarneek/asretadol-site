import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ARTICLE_PLACEHOLDER_IMAGE_PATH,
  ARTICLE_UPLOAD_URL_PREFIX,
  ARTICLE_VIDEO_UPLOAD_URL_PREFIX,
} from './article-media.constants';
import { ensureArticleUploadDirectory } from './article-image-upload.options';
import { ensureArticleVideoUploadDirectory } from './article-video-upload.options';

@Injectable()
export class ArticleMediaService {
  getUploadDirectory(): string {
    return ensureArticleUploadDirectory();
  }

  ensureUploadDirectory(): string {
    return ensureArticleUploadDirectory();
  }

  buildPublicPath(filename: string): string {
    return `${ARTICLE_UPLOAD_URL_PREFIX}${filename}`;
  }

  buildVideoPublicPath(filename: string): string {
    return `${ARTICLE_VIDEO_UPLOAD_URL_PREFIX}${filename}`;
  }

  normalizeFeaturedImagePath(value: string | null | undefined): string {
    const trimmed = value?.trim() ?? '';
    if (!trimmed) {
      return ARTICLE_PLACEHOLDER_IMAGE_PATH;
    }
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      throw new BadRequestException(
        'Remote image URLs are not allowed. Upload an image file instead.',
      );
    }
    if (
      trimmed.startsWith(ARTICLE_UPLOAD_URL_PREFIX) ||
      trimmed.startsWith('/images/')
    ) {
      return trimmed;
    }
    throw new BadRequestException('Invalid featured image path.');
  }

  normalizeVideoUrl(value: string | null | undefined): string {
    const trimmed = value?.trim() ?? '';
    if (!trimmed) {
      throw new BadRequestException('Video URL or uploaded file is required.');
    }
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    if (trimmed.startsWith(ARTICLE_VIDEO_UPLOAD_URL_PREFIX)) {
      return trimmed;
    }
    throw new BadRequestException(
      'Video must be an https URL or a path under /uploads/videos/.',
    );
  }
}
