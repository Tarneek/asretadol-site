import { BadRequestException } from '@nestjs/common';
import { StoryMediaType } from '../../common/enums/story-media-type.enum';
const HTTP_URL_RE = /^https?:\/\//i;

/** True for absolute http(s) URLs or site-relative paths (e.g. /news/1/slug). */
export function isValidStoryLink(value: string | null | undefined): boolean {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) {
    return true;
  }
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed.length > 1 && !trimmed.includes('://');
  }
  if (!HTTP_URL_RE.test(trimmed)) {
    return false;
  }
  try {
    // eslint-disable-next-line no-new
    new URL(trimmed);
    return true;
  } catch {
    return false;
  }
}

/** Empty → null; keep absolute URLs and site-relative paths as-is. */
export function normalizeStoryLink(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) {
    return null;
  }
  if (!isValidStoryLink(trimmed)) {
    throw new BadRequestException(
      'link must be a valid URL (https://...) or a site path starting with /',
    );
  }
  return trimmed;
}

/**
 * Accepts remote http(s) URLs and any uploaded `/uploads/...` path.
 * Image/video-specific prefixes remain preferred, but legacy or shared
 * upload folders must not block updates of existing stories.
 */
export function normalizeStoryMediaUrl(
  value: string | null | undefined,
  mediaType: StoryMediaType,
): string {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) {
    throw new BadRequestException('mediaUrl is required');
  }

  if (HTTP_URL_RE.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('/uploads/')) {
    return trimmed;
  }

  // Static site assets (placeholder / branding) used as story art.
  if (mediaType === StoryMediaType.Image && trimmed.startsWith('/images/')) {
    return trimmed;
  }

  if (mediaType === StoryMediaType.Image) {
    throw new BadRequestException(
      'Image media must be a URL or a path under /uploads/ or /images/',
    );
  }

  if (mediaType === StoryMediaType.Video) {
    throw new BadRequestException(
      'Video media must be a URL or a path under /uploads/',
    );
  }

  throw new BadRequestException('Invalid story media URL');
}
