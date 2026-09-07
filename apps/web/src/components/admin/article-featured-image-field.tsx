'use client';

import { useState } from 'react';
import Image from 'next/image';
import { uploadArticleEditorMedia } from '@/lib/article-editor-media';
import {
  NEWS_PLACEHOLDER_IMAGE_PATH,
  imageOrPlaceholder,
  isUploadedMediaPath,
} from '@/lib/format';

type Props = {
  initialPath?: string | null;
  slot?: 'main' | 'thumbnails';
};

export function ArticleFeaturedImageField({ initialPath, slot = 'main' }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string>(
    imageOrPlaceholder(initialPath),
  );
  const [hiddenPath, setHiddenPath] = useState(
    initialPath?.trim() || NEWS_PLACEHOLDER_IMAGE_PATH,
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unoptimized =
    previewUrl.startsWith('blob:') || isUploadedMediaPath(previewUrl);

  return (
    <div className="form-field article-image-field">
      <label className="form-field__label" htmlFor="article-featured-image-file">
        تصویر اصلی
      </label>
      <p className="form-field__hint">
        فایل تصویر را از رایانه انتخاب کنید (JPEG، PNG یا WebP — حداکثر ۵ مگابایت).
      </p>
      <input type="hidden" name="featuredImage" value={hiddenPath} />
      <div className="article-image-field__preview">
        <Image
          src={previewUrl}
          alt="پیش‌نمایش تصویر مطلب"
          width={320}
          height={200}
          className="article-image-field__img"
          unoptimized={unoptimized}
        />
      </div>
      <input
        id="article-featured-image-file"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={uploading}
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (!file) {
            return;
          }
          setUploading(true);
          setError(null);
          try {
            const path = await uploadArticleEditorMedia(file, 'image', slot);
            setHiddenPath(path);
            setPreviewUrl(path);
          } catch (uploadError) {
            setError(
              uploadError instanceof Error && uploadError.message.trim()
                ? uploadError.message
                : 'بارگذاری تصویر ممکن نشد.',
            );
          } finally {
            setUploading(false);
          }
        }}
      />
      {uploading ? (
        <p className="form-field__hint" role="status">
          در حال بارگذاری تصویر…
        </p>
      ) : null}
      {error ? (
        <p className="form-field__hint" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
