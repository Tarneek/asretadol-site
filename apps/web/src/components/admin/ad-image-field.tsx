'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AD_PLACEMENT_HINTS } from '@/lib/ad-placements';
import { isUploadedMediaPath } from '@/lib/format';

const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';

export { AD_PLACEMENT_HINTS };

type Props = {
  initialImageUrl?: string;
  idPrefix?: string;
  placement?: keyof typeof AD_PLACEMENT_HINTS;
};

export function AdImageField({
  initialImageUrl = '',
  idPrefix = 'ad',
  placement = 'ad-slot',
}: Props) {
  const [previewUrl, setPreviewUrl] = useState(initialImageUrl.trim());
  const [hiddenPath, setHiddenPath] = useState(initialImageUrl.trim());
  const [fileError, setFileError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState(false);

  const hint = AD_PLACEMENT_HINTS[placement];
  const unoptimized =
    previewUrl.startsWith('blob:') || isUploadedMediaPath(previewUrl);

  return (
    <div className="form-field ad-image-field" style={{ gridColumn: '1 / -1' }}>
      <span className="form-field__label">تصویر تبلیغ</span>
      <p className="form-field__hint">
        {hint.sizeHint} — JPEG، PNG، WebP یا GIF، حداکثر ۵ مگابایت.
      </p>

      <input type="hidden" name="imageUrl" value={hiddenPath} />

      {previewUrl ? (
        <div className="article-image-field__preview ad-image-field__preview">
          <Image
            src={previewUrl}
            alt="پیش‌نمایش تبلیغ"
            width={480}
            height={placement === 'ad-banner' ? 90 : 160}
            className="article-image-field__img"
            unoptimized={unoptimized}
          />
        </div>
      ) : null}

      <input
        id={`${idPrefix}-image-file`}
        name="imageFile"
        type="file"
        accept={IMAGE_ACCEPT}
        required={!hiddenPath}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) {
            return;
          }

          if (file.size > IMAGE_MAX_BYTES) {
            setFileError('حجم تصویر نباید بیشتر از ۵ مگابایت باشد.');
            event.target.value = '';
            return;
          }

          setFileError(null);
          setPendingFile(true);
          setHiddenPath('');
          setPreviewUrl(URL.createObjectURL(file));
        }}
      />

      {fileError ? (
        <p className="form-field__hint" style={{ color: 'var(--danger)' }} role="alert">
          {fileError}
        </p>
      ) : null}

      {pendingFile ? (
        <p className="form-field__hint">فایل جدید انتخاب شد — پس از ذخیره بارگذاری می‌شود.</p>
      ) : hiddenPath ? (
        <p className="form-field__hint" dir="ltr">
          مسیر فعلی: {hiddenPath}
        </p>
      ) : null}
    </div>
  );
}
