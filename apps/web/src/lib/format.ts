import { generateArticleSlug } from '@/lib/url/generate-article-slug';

const FA_GREGORY_MONTH_SHORT = [
  'ژان',
  'فور',
  'مار',
  'آور',
  'مه',
  'ژون',
  'ژول',
  'اوت',
  'سپ',
  'اکت',
  'نوا',
  'دس',
] as const;

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

function toFaDigits(value: number): string {
  return String(value).replace(/\d/g, (d) => FA_DIGITS[Number(d)] ?? d);
}

/** Stable fa-IR digits for SSR and client (no Intl locale drift). */
export function formatFaNumber(value: number): string {
  return toFaDigits(value);
}

/** Short UTC day label for charts — parsed from `YYYY-MM-DD`, no locale calendar. */
export function formatFaChartDay(dateKey: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!match) {
    return dateKey;
  }
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return dateKey;
  }
  return `${toFaDigits(day)} ${FA_GREGORY_MONTH_SHORT[month - 1]}`;
}

const faNumberFormatGrouped = new Intl.NumberFormat('fa-IR', {
  numberingSystem: 'arabext',
  useGrouping: true,
});

/** Locale-formatted numbers for non-chart UI (may differ slightly on SSR in edge cases). */
export function formatFaNumberGrouped(value: number): string {
  return faNumberFormatGrouped.format(value);
}

export function formatFaDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatEnDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function articleHref(id: number, title: string): string {
  return `/news/${id}/${generateArticleSlug(title)}`;
}

export function categoryHref(slug: string): string {
  return `/category/${slug}`;
}

export function tagHref(slug: string): string {
  return `/tag/${slug}`;
}

export const NEWS_PLACEHOLDER_IMAGE_PATH = '/images/placeholder-news.svg';

export function imageOrPlaceholder(url: string | null | undefined): string {
  if (url && url.startsWith('/')) {
    return url;
  }
  return NEWS_PLACEHOLDER_IMAGE_PATH;
}
