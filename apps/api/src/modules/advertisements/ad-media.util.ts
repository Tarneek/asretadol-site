import { BadRequestException } from '@nestjs/common';
import { ARTICLE_UPLOAD_URL_PREFIX } from '../articles/article-media.constants';

export function normalizeAdvertisementImagePath(value: string | null | undefined): string {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) {
    throw new BadRequestException('imageUrl is required');
  }
  if (!trimmed.startsWith(ARTICLE_UPLOAD_URL_PREFIX)) {
    throw new BadRequestException(
      'Advertisement image must be uploaded to /uploads/news/',
    );
  }
  return trimmed;
}

export function parseOptionalDate(value: string | null | undefined): Date | null {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) {
    return null;
  }
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) {
    throw new BadRequestException('Invalid date value');
  }
  return date;
}
