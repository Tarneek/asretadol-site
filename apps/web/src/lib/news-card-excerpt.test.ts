import { describe, expect, it } from 'vitest';
import { shouldShowNewsCardExcerpt } from './news-card-excerpt';

describe('shouldShowNewsCardExcerpt', () => {
  it('hides excerpt when title is empty of lead', () => {
    expect(shouldShowNewsCardExcerpt('عنوان کوتاه', '')).toBe(false);
    expect(shouldShowNewsCardExcerpt('عنوان کوتاه', null)).toBe(false);
  });

  it('shows excerpt for short titles with lead text', () => {
    expect(
      shouldShowNewsCardExcerpt('تورم نقطه به نقطه به ۲۸٪ رسید', 'خلاصه کوتاه خبر'),
    ).toBe(true);
    expect(shouldShowNewsCardExcerpt('ا'.repeat(45), 'خلاصه')).toBe(true);
  });

  it('hides excerpt for long multi-line titles', () => {
    const longTitle =
      'بانک مرکزی سیاست پولی خود را برای کنترل تورم و ثبات بازار ارز اعلام کرد و جزئیات بیشتری منتشر شد';
    expect(shouldShowNewsCardExcerpt(longTitle, 'خلاصه خبر')).toBe(false);
    expect(shouldShowNewsCardExcerpt('ا'.repeat(46), 'خلاصه')).toBe(false);
  });
});
