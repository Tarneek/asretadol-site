/** Shared limits for article media uploads (matches API blog rules). */
export const ARTICLE_EDITOR_IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp';
export const ARTICLE_EDITOR_VIDEO_ACCEPT = 'video/mp4,video/webm';

export const ARTICLE_EDITOR_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const ARTICLE_EDITOR_VIDEO_MAX_BYTES = 100 * 1024 * 1024;

export type ArticleMediaSlot = 'main' | 'thumbnails' | 'content';

const IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const VIDEO_MIME = new Set(['video/mp4', 'video/webm']);

export function validateArticleEditorMediaFile(
  file: File,
  kind: 'image' | 'video',
): string | null {
  if (kind === 'image') {
    if (!IMAGE_MIME.has(file.type)) {
      return 'فرمت تصویر مجاز نیست. از JPEG، PNG یا WebP استفاده کنید.';
    }
    if (file.size > ARTICLE_EDITOR_IMAGE_MAX_BYTES) {
      return 'حجم تصویر نباید بیشتر از ۵ مگابایت باشد.';
    }
    return null;
  }

  if (!VIDEO_MIME.has(file.type)) {
    return 'فرمت ویدیو مجاز نیست. از MP4 یا WebM استفاده کنید.';
  }
  if (file.size > ARTICLE_EDITOR_VIDEO_MAX_BYTES) {
    return 'حجم ویدیو نباید بیشتر از ۱۰۰ مگابایت باشد.';
  }
  return null;
}

export async function uploadArticleEditorMedia(
  file: File,
  kind: 'image' | 'video',
  slot: ArticleMediaSlot = 'content',
): Promise<string> {
  const validationError = validateArticleEditorMediaFile(file, kind);
  if (validationError) {
    throw new Error(validationError);
  }

  const formData = new FormData();
  formData.append('file', file);
  const endpoint =
    kind === 'video'
      ? `/api/admin/articles/media/upload-video?kind=${slot}`
      : `/api/admin/articles/media/upload?kind=${slot}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  const payload = (await response.json().catch(() => null)) as {
    message?: string;
    path?: string;
    url?: string;
  } | null;

  if (!response.ok) {
    throw new Error(payload?.message ?? 'بارگذاری فایل ممکن نشد.');
  }

  const publicUrl = toPublicUploadUrl(payload?.url ?? payload?.path);
  if (!publicUrl) {
    throw new Error('پاسخ سرور نامعتبر بود.');
  }

  return publicUrl;
}

/** Keep editor `src` as a site-relative `/uploads/...` URL, never a filesystem path. */
export function toPublicUploadUrl(raw: string | null | undefined): string | null {
  const value = raw?.trim() ?? '';
  if (!value) {
    return null;
  }
  if (/^[a-zA-Z]:[\\/]/.test(value) || value.startsWith('\\\\') || value.includes('\\')) {
    return null;
  }
  if (value.startsWith('/uploads/')) {
    return value;
  }
  if (value.startsWith('http://') || value.startsWith('https://')) {
    try {
      const parsed = new URL(value);
      return parsed.pathname.startsWith('/uploads/') ? parsed.pathname : null;
    } catch {
      return null;
    }
  }
  return null;
}

export function buildEditorImageHtml(url: string): string {
  const safeUrl = escapeHtmlAttribute(url);
  return `<p><img src="${safeUrl}" alt="" /></p>`;
}

export function buildEditorVideoHtml(url: string): string {
  const safeUrl = escapeHtmlAttribute(url);
  return `<p><video src="${safeUrl}" controls playsinline style="max-width:100%"></video></p>`;
}

function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
