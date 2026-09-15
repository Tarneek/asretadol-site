import { BadRequestException } from '@nestjs/common';
import { StoryMediaType } from '../../common/enums/story-media-type.enum';
import {
  ARTICLE_UPLOAD_URL_PREFIX,
  ARTICLE_VIDEO_UPLOAD_URL_PREFIX,
  BLOG_CONTENT_UPLOAD_URL_PREFIX,
  BLOG_UPLOAD_URL_PREFIX,
} from '../articles/article-media.constants';

export function normalizeStoryMediaUrl(
  value: string | null | undefined,
  mediaType: StoryMediaType,
): string {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) {
    throw new BadRequestException('mediaUrl is required');
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  if (mediaType === StoryMediaType.Image) {
    if (
      trimmed.startsWith(ARTICLE_UPLOAD_URL_PREFIX) ||
      trimmed.startsWith(BLOG_UPLOAD_URL_PREFIX) ||
      trimmed.startsWith('/images/')
    ) {
      return trimmed;
    }
    throw new BadRequestException(
      'Image media must be a URL or a path under /uploads/news/ or /uploads/blog/',
    );
  }

  if (mediaType === StoryMediaType.Video) {
    if (
      trimmed.startsWith(ARTICLE_VIDEO_UPLOAD_URL_PREFIX) ||
      trimmed.startsWith(BLOG_CONTENT_UPLOAD_URL_PREFIX)
    ) {
      return trimmed;
    }
    throw new BadRequestException(
      'Video media must be a URL or a path under /uploads/videos/ or /uploads/blog/content/',
    );
  }

  throw new BadRequestException('Invalid story media URL');
}
