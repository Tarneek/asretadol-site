'use client';

import { useId, useRef, useState } from 'react';
import Image from 'next/image';
import {
  NEWS_PLACEHOLDER_IMAGE_PATH,
  isUploadedMediaPath,
} from '@/lib/format';
import { toPublicUploadUrl } from '@/lib/article-editor-media';
import { resolveVideoPlayback } from '@/lib/video-playback';
import { SiteVideoEmbed } from '@/components/site/site-video-embed';

const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const VIDEO_MAX_BYTES = 100 * 1024 * 1024;

const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';
const VIDEO_ACCEPT = 'video/mp4,video/webm,video/quicktime,video/x-msvideo';

const IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const VIDEO_MIME = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
]);

type MediaType = 'image' | 'video';

type Props = {
  initialMediaType?: MediaType;
  initialMediaUrl?: string;
  idPrefix?: string;
};

function isDirectVideoPreview(url: string): boolean {
  return resolveVideoPlayback(url).kind === 'file';
}

function isEmbedVideoPreview(url: string): boolean {
  return resolveVideoPlayback(url).kind === 'iframe';
}

function revokeIfBlob(url: string) {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

function storyImageSrc(url: string): string {
  const value = url.trim();
  if (
    value.startsWith('/') ||
    value.startsWith('blob:') ||
    value.startsWith('http://') ||
    value.startsWith('https://')
  ) {
    return value;
  }
  return NEWS_PLACEHOLDER_IMAGE_PATH;
}

async function uploadStoryMediaFile(file: File, mediaType: MediaType): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const endpoint =
    mediaType === 'video'
      ? '/api/admin/articles/media/upload-video'
      : '/api/admin/articles/media/upload';

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

export function StoryMediaFields({
  initialMediaType = 'image',
  initialMediaUrl = '',
  idPrefix = 'story',
}: Props) {
  const [mediaType, setMediaType] = useState<MediaType>(initialMediaType);
  const [mediaUrl, setMediaUrl] = useState(initialMediaUrl.trim());
  const [previewUrl, setPreviewUrl] = useState(initialMediaUrl.trim());
  const [uploading, setUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mediaTypeId = useId();
  const urlId = useId();
  const fileId = useId();

  const accept = mediaType === 'video' ? VIDEO_ACCEPT : IMAGE_ACCEPT;
  const maxBytes = mediaType === 'video' ? VIDEO_MAX_BYTES : IMAGE_MAX_BYTES;
  const allowedMime = mediaType === 'video' ? VIDEO_MIME : IMAGE_MIME;

  const urlPlaceholder =
    mediaType === 'video'
      ? 'https://example.com/story.mp4'
      : 'https://example.com/story.jpg';

  const hint =
    mediaType === 'video'
      ? 'لینک آپارات/یوتیوب، لینک مستقیم ویدیو (https)، یا بارگذاری فایل — MP4، WebM یا MOV، حداکثر ۱۰۰ مگابایت.'
      : 'لینک تصویر (https) یا بارگذاری فایل — JPEG، PNG، WebP یا GIF، حداکثر ۵ مگابایت.';

  const showVideoPreview = mediaType === 'video' && previewUrl && isDirectVideoPreview(previewUrl);
  const showEmbedPreview = mediaType === 'video' && previewUrl && isEmbedVideoPreview(previewUrl);
  const imageSrc = storyImageSrc(previewUrl);
  const imageUnoptimized =
    imageSrc.startsWith('blob:') ||
    isUploadedMediaPath(imageSrc) ||
    imageSrc.startsWith('http');

  function handleMediaTypeChange(nextType: MediaType) {
    setMediaType(nextType);
    setUploading(false);
    setFileError(null);
    setPreviewUrl((current) => {
      revokeIfBlob(current);
      return initialMediaUrl.trim();
    });
    setMediaUrl(initialMediaUrl.trim());
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function handleUrlChange(value: string) {
    setFileError(null);
    setMediaUrl(value);
    setPreviewUrl((current) => {
      revokeIfBlob(current);
      return value;
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!allowedMime.has(file.type)) {
      setFileError(
        mediaType === 'video'
          ? 'فرمت ویدیو مجاز نیست. از MP4، WebM یا MOV استفاده کنید.'
          : 'فرمت تصویر مجاز نیست. از JPEG، PNG، WebP یا GIF استفاده کنید.',
      );
      event.target.value = '';
      return;
    }

    if (file.size > maxBytes) {
      setFileError(
        mediaType === 'video'
          ? 'حجم فایل ویدیو نباید بیشتر از ۱۰۰ مگابایت باشد.'
          : 'حجم تصویر نباید بیشتر از ۵ مگابایت باشد.',
      );
      event.target.value = '';
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setFileError(null);
    setPreviewUrl((current) => {
      revokeIfBlob(current);
      return objectUrl;
    });
    setUploading(true);

    try {
      const path = await uploadStoryMediaFile(file, mediaType);
      setMediaUrl(path);
      setPreviewUrl((current) => {
        revokeIfBlob(current);
        return path;
      });
      event.target.value = '';
    } catch (uploadError) {
      setFileError(
        uploadError instanceof Error && uploadError.message.trim()
          ? uploadError.message
          : 'بارگذاری فایل ممکن نشد.',
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <label className="form-field">
        <span className="form-field__label" id={`${idPrefix}-media-type-label`}>
          نوع رسانه
        </span>
        <select
          id={mediaTypeId}
          name="mediaType"
          value={mediaType}
          onChange={(event) => handleMediaTypeChange(event.target.value as MediaType)}
          aria-labelledby={`${idPrefix}-media-type-label`}
        >
          <option value="image">تصویر</option>
          <option value="video">ویدیو</option>
        </select>
      </label>

      <div className="form-field story-media-field" style={{ gridColumn: '1 / -1' }}>
        <span className="form-field__label">رسانه استوری</span>
        <p className="form-field__hint">{hint}</p>

        <input type="hidden" name="mediaUrl" value={mediaUrl} />

        <div className="form-field" style={{ marginTop: '0.75rem' }}>
          <label className="form-field__label" htmlFor={urlId}>
            آدرس رسانه (URL)
          </label>
          <input
            id={urlId}
            type="text"
            dir="ltr"
            value={mediaUrl}
            onChange={(event) => handleUrlChange(event.target.value)}
            placeholder={urlPlaceholder}
            disabled={uploading}
          />
        </div>

        <div className="form-field" style={{ marginTop: '0.75rem' }}>
          <label className="form-field__label" htmlFor={fileId}>
            {mediaType === 'video' ? 'بارگذاری فایل ویدیو' : 'بارگذاری فایل تصویر'}
          </label>
          <input
            ref={fileInputRef}
            id={fileId}
            type="file"
            accept={accept}
            disabled={uploading}
            onChange={handleFileChange}
          />
        </div>

        {uploading ? (
          <p className="form-field__hint" role="status">
            در حال بارگذاری فایل…
          </p>
        ) : null}

        {fileError ? (
          <p className="form-field__hint" style={{ color: 'var(--danger)' }} role="alert">
            {fileError}
          </p>
        ) : null}

        {mediaUrl ? (
          <p className="form-field__hint" dir="ltr">
            مسیر فعلی: {mediaUrl}
          </p>
        ) : null}

        {mediaType === 'image' ? (
          <div className="article-image-field__preview story-media-field__preview">
            {imageSrc.startsWith('blob:') ? (
              // Blob previews are local object URLs; next/image cannot optimize them.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageSrc}
                alt="پیش‌نمایش رسانه استوری"
                className="article-image-field__img"
              />
            ) : (
              <Image
                src={imageSrc}
                alt="پیش‌نمایش رسانه استوری"
                width={320}
                height={200}
                className="article-image-field__img"
                unoptimized={imageUnoptimized}
              />
            )}
          </div>
        ) : null}

        {showVideoPreview ? (
          <div className="story-media-field__preview">
            <video
              src={previewUrl}
              controls
              playsInline
              className="story-media-field__video"
              aria-label="پیش‌نمایش ویدیو استوری"
            />
          </div>
        ) : null}

        {showEmbedPreview ? (
          <div className="story-media-field__preview story-media-field__preview--embed">
            <SiteVideoEmbed
              url={previewUrl}
              title="پیش‌نمایش ویدیو استوری"
              className="story-media-field__embed"
            />
          </div>
        ) : null}

        {mediaType === 'video' && previewUrl && !showVideoPreview && !showEmbedPreview ? (
          <p className="form-field__hint" dir="ltr">
            پیش‌نمایش برای این آدرس ویدیو در دسترس نیست؛ پس از ذخیره در سایت نمایش داده می‌شود.
          </p>
        ) : null}
      </div>
    </>
  );
}
