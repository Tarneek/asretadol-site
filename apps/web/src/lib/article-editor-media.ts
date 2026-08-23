/** Shared limits for inline article editor uploads (matches API). */
export const ARTICLE_EDITOR_IMAGE_ACCEPT =
  'image/jpeg,image/png,image/webp,image/gif';
export const ARTICLE_EDITOR_VIDEO_ACCEPT =
  'video/mp4,video/webm,video/quicktime,video/x-msvideo';

export const ARTICLE_EDITOR_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const ARTICLE_EDITOR_VIDEO_MAX_BYTES = 100 * 1024 * 1024;

const IMAGE_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const VIDEO_MIME = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
]);

export function validateArticleEditorMediaFile(
  file: File,
  kind: 'image' | 'video',
): string | null {
  if (kind === 'image') {
    if (!IMAGE_MIME.has(file.type)) {
      return 'فرمت تصویر مجاز نیست. از JPEG، PNG، WebP یا GIF استفاده کنید.';
    }
    if (file.size > ARTICLE_EDITOR_IMAGE_MAX_BYTES) {
      return 'حجم تصویر نباید بیشتر از ۵ مگابایت باشد.';
    }
    return null;
  }

  if (!VIDEO_MIME.has(file.type)) {
    return 'فرمت ویدیو مجاز نیست. از MP4، WebM یا MOV استفاده کنید.';
  }
  if (file.size > ARTICLE_EDITOR_VIDEO_MAX_BYTES) {
    return 'حجم ویدیو نباید بیشتر از ۱۰۰ مگابایت باشد.';
  }
  return null;
}

export async function uploadArticleEditorMedia(
  file: File,
  kind: 'image' | 'video',
): Promise<string> {
  const validationError = validateArticleEditorMediaFile(file, kind);
  if (validationError) {
    throw new Error(validationError);
  }

  const formData = new FormData();
  formData.append('file', file);
  const endpoint =
    kind === 'video'
      ? '/api/admin/articles/media/upload-video'
      : '/api/admin/articles/media/upload';

  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  const payload = (await response.json().catch(() => null)) as {
    message?: string;
    path?: string;
  } | null;

  if (!response.ok) {
    throw new Error(payload?.message ?? 'بارگذاری فایل ممکن نشد.');
  }

  if (!payload?.path?.trim()) {
    throw new Error('پاسخ سرور نامعتبر بود.');
  }

  return payload.path.trim();
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
