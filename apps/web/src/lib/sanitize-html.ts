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
  'video',
  'span',
  'div',
  'sub',
  'sup',
  'pre',
  'code',
];

const ALLOWED_ATTR = [
  'href',
  'title',
  'target',
  'rel',
  'src',
  'alt',
  'class',
  'dir',
  'controls',
  'playsinline',
  'style',
];

const SANITIZE_CONFIG = {
  ALLOWED_TAGS,
  ALLOWED_ATTR,
  ALLOW_DATA_ATTR: false,
} as const;

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

  return browserDomPurify.sanitize(html, SANITIZE_CONFIG);
}

/** Prefer this in effects — loads DOMPurify once in the browser. */
export async function sanitizeArticleHtmlAsync(html: string): Promise<string> {
  if (typeof window === 'undefined') {
    return html;
  }

  const DOMPurify = await loadDomPurify();
  return DOMPurify.sanitize(html, SANITIZE_CONFIG);
}

const VOID_TAGS = new Set(['br', 'img']);
const ALLOWED_TAG_SET = new Set(ALLOWED_TAGS);
const ALLOWED_ATTR_SET = new Set(ALLOWED_ATTR);

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function isDangerousUrl(value: string): boolean {
  return /^\s*(javascript|vbscript|data):/i.test(value.trim());
}

function sanitizeStyle(value: string): string {
  return value
    .split(';')
    .map((part) => part.trim())
    .filter((part) => {
      if (!part) return false;
      const [prop, ...rest] = part.split(':');
      const property = prop?.trim().toLowerCase() ?? '';
      const raw = rest.join(':').trim();
      if (!property || !raw) return false;
      if (property.startsWith('-') || property.includes('expression')) return false;
      if (isDangerousUrl(raw) || /expression\s*\(/i.test(raw)) return false;
      return (
        property === 'text-align' ||
        property === 'color' ||
        property === 'background-color' ||
        property === 'max-width' ||
        property === 'width' ||
        property === 'height' ||
        property === 'direction'
      );
    })
    .join('; ');
}

function filterAttributes(rawAttrs: string, tag: string): string {
  const kept: string[] = [];
  const attrRe =
    /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
  let match: RegExpExecArray | null;
  while ((match = attrRe.exec(rawAttrs))) {
    const name = match[1].toLowerCase();
    const value = match[2] ?? match[3] ?? match[4] ?? '';
    if (!ALLOWED_ATTR_SET.has(name) || name.startsWith('on')) {
      continue;
    }
    if ((name === 'href' || name === 'src') && isDangerousUrl(value)) {
      continue;
    }
    const nextValue = name === 'style' ? sanitizeStyle(value) : value;
    if (!nextValue) {
      continue;
    }
    if (tag === 'a' && name === 'target') {
      kept.push('target="_blank"', 'rel="noopener noreferrer"');
      continue;
    }
    kept.push(`${name}="${escapeAttr(nextValue)}"`);
  }
  return kept.length ? ` ${[...new Set(kept)].join(' ')}` : '';
}

/** jsdom-free allowlist sanitizer for server actions (Next bundles break isomorphic-dompurify). */
function sanitizeWithAllowlist(html: string): string {
  const withoutComments = html.replace(/<!--[\s\S]*?-->/g, '');
  return withoutComments.replace(
    /<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g,
    (full, rawTag: string, rawAttrs: string) => {
      const tag = rawTag.toLowerCase();
      if (!ALLOWED_TAG_SET.has(tag)) {
        return '';
      }
      if (full.startsWith('</')) {
        return `</${tag}>`;
      }
      return `<${tag}${filterAttributes(rawAttrs, tag)}${VOID_TAGS.has(tag) ? ' />' : '>'}`;
    },
  );
}

/** Sanitize article HTML before persisting (server actions / API). */
export async function sanitizeArticleHtmlForStorage(html: string): Promise<string> {
  const trimmed = html.trim();
  if (!trimmed) {
    return '';
  }

  return sanitizeWithAllowlist(trimmed);
}
