'use client';

import { useState } from 'react';
import Image from 'next/image';
import { NEWS_PLACEHOLDER_IMAGE_PATH, imageOrPlaceholder } from '@/lib/format';

type Props = {
  initialPath?: string | null;
};

export function ArticleFeaturedImageField({ initialPath }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string>(
    imageOrPlaceholder(initialPath),
  );
  const [hiddenPath, setHiddenPath] = useState(
    initialPath?.trim() || NEWS_PLACEHOLDER_IMAGE_PATH,
  );

  return (
    <div className="form-field article-image-field">
      <label className="form-field__label" htmlFor="article-featured-image-file">
        تصویر اصلی
      </label>
      <p className="form-field__hint">
        فایل تصویر را از رایانه انتخاب کنید (JPEG، PNG، WebP یا GIF — حداکثر ۵ مگابایت).
      </p>
      <input type="hidden" name="featuredImage" value={hiddenPath} />
      <div className="article-image-field__preview">
        <Image
          src={previewUrl}
          alt="پیش‌نمایش تصویر مطلب"
          width={320}
          height={200}
          className="article-image-field__img"
          unoptimized={previewUrl.startsWith('blob:')}
        />
      </div>
      <input
        id="article-featured-image-file"
        name="featuredImageFile"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) {
            return;
          }
          setPreviewUrl(URL.createObjectURL(file));
          setHiddenPath('');
        }}
      />
    </div>
  );
}
