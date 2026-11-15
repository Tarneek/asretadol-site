import { describe, expect, it } from 'vitest';
import {
  NEWS_PLACEHOLDER_IMAGE_PATH,
  imageOrPlaceholder,
  isNewsPlaceholderImage,
} from './format';

describe('imageOrPlaceholder', () => {
  it('uses the Nira default for missing or blank paths', () => {
    expect(imageOrPlaceholder(null)).toBe(NEWS_PLACEHOLDER_IMAGE_PATH);
    expect(imageOrPlaceholder(undefined)).toBe(NEWS_PLACEHOLDER_IMAGE_PATH);
    expect(imageOrPlaceholder('')).toBe(NEWS_PLACEHOLDER_IMAGE_PATH);
    expect(imageOrPlaceholder('   ')).toBe(NEWS_PLACEHOLDER_IMAGE_PATH);
  });

  it('keeps relative upload paths and absolute http(s) URLs', () => {
    expect(imageOrPlaceholder('/uploads/blog/main/a.jpg')).toBe(
      '/uploads/blog/main/a.jpg',
    );
    expect(imageOrPlaceholder('https://cdn.example.com/a.jpg')).toBe(
      'https://cdn.example.com/a.jpg',
    );
  });

  it('rejects invalid non-path values', () => {
    expect(imageOrPlaceholder('not-a-path')).toBe(NEWS_PLACEHOLDER_IMAGE_PATH);
  });

  it('identifies the placeholder path for onError guards', () => {
    expect(isNewsPlaceholderImage(NEWS_PLACEHOLDER_IMAGE_PATH)).toBe(true);
    expect(isNewsPlaceholderImage('/uploads/x.jpg')).toBe(false);
  });
});
