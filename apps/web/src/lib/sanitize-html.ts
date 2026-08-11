// Important: avoid loading `isomorphic-dompurify` (and thus `jsdom`) during SSR.
// In Next dev, `jsdom` tries to read `default-stylesheet.css` from `.next/browser/`.
// We lazy-load and only sanitize in the browser.

const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'blockquote',
  'a',
  'img',
  'span',
  'div',
  'sub',
  'sup',
  'pre',
  'code',
];

const ALLOWED_ATTR = ['href', 'title', 'target', 'rel', 'src', 'alt', 'class'];

type DomPurifyLike = {
  sanitize: (
    dirty: string,
    cfg: {
      ALLOWED_TAGS: string[];
      ALLOWED_ATTR: string[];
      ALLOW_DATA_ATTR: boolean;
    },
  ) => string;
};

let browserDomPurify: DomPurifyLike | null = null;

async function loadDomPurify(): Promise<DomPurifyLike> {
  if (browserDomPurify) return browserDomPurify;
  const mod = await import('isomorphic-dompurify');
  browserDomPurify = (('default' in mod && mod.default) ? mod.default : mod) as DomPurifyLike;
  return browserDomPurify;
}

/** Sync sanitize for client components that already ran the lazy loader (or SSR no-op). */
export function sanitizeArticleHtml(html: string): string {
  if (typeof window === 'undefined' || !browserDomPurify) {
    return '';
  }

  return browserDomPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });
}

/** Prefer this in effects — loads DOMPurify once in the browser. */
export async function sanitizeArticleHtmlAsync(html: string): Promise<string> {
  if (typeof window === 'undefined') {
    return '';
  }

  const DOMPurify = await loadDomPurify();
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });
}
