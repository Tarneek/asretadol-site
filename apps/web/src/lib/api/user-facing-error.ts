import { ApiError, isApiNetworkError } from '@/lib/api/client';

const MESSAGE_FA: Record<string, string> = {
  'seoTitle must be shorter than or equal to 255 characters':
    'عنوان سئو حداکثر ۲۵۵ کاراکتر است.',
  'seoDescription must be shorter than or equal to 500 characters':
    'توضیح سئو حداکثر ۵۰۰ کاراکتر است.',
  'title must be longer than or equal to 1 characters': 'عنوان مطلب الزامی است.',
  'title must be shorter than or equal to 500 characters':
    'عنوان مطلب حداکثر ۵۰۰ کاراکتر است.',
  'Unable to generate a valid slug':
    'ساخت شناسه URL از عنوان ممکن نشد. اسلاگ را به‌صورت دستی وارد کنید.',
  'One or more categoryIds are invalid': 'یک یا چند دسته‌بندی نامعتبر است.',
  'One or more tagIds are invalid': 'یک یا چند برچسب نامعتبر است.',
  'Invalid featured image path.': 'مسیر تصویر شاخص نامعتبر است. تصویر را دوباره بارگذاری کنید.',
  'Remote image URLs are not allowed. Upload an image file instead.':
    'آدرس اینترنتی تصویر مجاز نیست. فایل تصویر را بارگذاری کنید.',
  'Video URL or file is required when "Has Video" is enabled.':
    'وقتی گزینه ویدیو فعال است، لینک یا فایل ویدیو الزامی است.',
  'Not authenticated': 'نشست شما منقضی شده است. دوباره وارد شوید.',
};

function firstMessage(body: string): string | null {
  try {
    const parsed = JSON.parse(body) as { message?: string | string[] };
    if (typeof parsed.message === 'string' && parsed.message.trim()) {
      return parsed.message;
    }
    if (Array.isArray(parsed.message) && parsed.message.length > 0) {
      return parsed.message.map(String).join(' ');
    }
  } catch {
    if (body.trim()) {
      return body.trim();
    }
  }
  return null;
}

export function userFacingApiError(error: unknown, fallback: string): string {
  if (isApiNetworkError(error)) {
    return 'ارتباط با سرور برقرار نشد. از روشن بودن API و پایگاه‌داده مطمئن شوید.';
  }

  if (error instanceof ApiError) {
    if (error.status === 401) {
      return 'نشست شما منقضی شده است. دوباره وارد شوید.';
    }
    const raw = firstMessage(error.body);
    if (raw) {
      return MESSAGE_FA[raw] ?? raw;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return MESSAGE_FA[error.message] ?? fallback;
  }

  return fallback;
}
