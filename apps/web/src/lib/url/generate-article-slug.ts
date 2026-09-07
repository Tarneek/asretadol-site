/**
 * Unicode-friendly slug for Persian SEO.
 * Keeps Persian/Arabic letters; does not transliterate to Latin.
 */
export function generateArticleSlug(title: string): string {
  return title
    .trim()
    .replace(/[\u200c\u200C]/g, '-')
    .replace(/[\s_]+/g, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200);
}
