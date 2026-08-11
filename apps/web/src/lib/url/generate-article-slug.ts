/**
 * Generate a URL-safe slug from an article title (Persian-friendly).
 *
 * Rules:
 * - Replace spaces and ZWNJ (U+200C) with hyphens.
 * - Remove punctuation/symbols (keep letters + digits).
 * - Collapse multiple hyphens and trim them.
 */
export function generateArticleSlug(title: string): string {
  return (
    title
      // Normalize نیم‌فاصله to hyphen to keep URLs stable.
      .replace(/\u200C/g, '-')
      // Replace whitespace runs with a hyphen.
      .replace(/[\s]+/g, '-')
      // Replace everything except letters/numbers with hyphen.
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      // Collapse repeated hyphens.
      .replace(/-+/g, '-')
      // Trim leading/trailing hyphens.
      .replace(/^-|-$/g, '')
  );
}

