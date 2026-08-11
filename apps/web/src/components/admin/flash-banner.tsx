type FlashBannerProps = {
  type: 'success' | 'error' | 'info';
  message: string;
};

export function FlashBanner({ type, message }: FlashBannerProps) {
  return (
    <div className={`alert alert--${type}`} role="status">
      {message}
    </div>
  );
}

export function flashFromSearchParams(
  params: Record<string, string | string[] | undefined>,
): FlashBannerProps | null {
  const saved = param(params.saved);
  const created = param(params.created);
  const deleted = param(params.deleted);
  const error = param(params.error);

  if (error) {
    return { type: 'error', message: decodeFlash(error) };
  }
  if (saved === '1') {
    return { type: 'success', message: 'تغییرات با موفقیت ذخیره شد.' };
  }
  if (created === '1') {
    return { type: 'success', message: 'با موفقیت ایجاد شد.' };
  }
  if (deleted === '1') {
    return { type: 'success', message: 'با موفقیت حذف شد.' };
  }
  return null;
}

function param(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function decodeFlash(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
