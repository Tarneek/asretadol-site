/**
 * Decide whether a horizontal news list card should show the lead/excerpt.
 * Short titles leave room beside the thumbnail; long (multi-line) titles hide it.
 */
/** Titles at or under this length are treated as single-line beside a ~95px thumb. */
export const NEWS_CARD_SHORT_TITLE_MAX_CHARS = 45;

export function shouldShowNewsCardExcerpt(
  title: string,
  excerpt: string | null | undefined,
  maxChars: number = NEWS_CARD_SHORT_TITLE_MAX_CHARS,
): boolean {
  const lead = excerpt?.trim() ?? '';
  if (!lead) {
    return false;
  }

  const normalizedTitle = title.trim().replace(/\s+/g, ' ');
  return normalizedTitle.length <= maxChars;
}
