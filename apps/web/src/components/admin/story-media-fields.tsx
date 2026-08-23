'use client';

import { useId, useMemo, useState } from 'react';
import Image from 'next/image';
import { imageOrPlaceholder, isUploadedMediaPath } from '@/lib/format';

const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const VIDEO_MAX_BYTES = 100 * 1024 * 1024;

const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';
const VIDEO_ACCEPT = 'video/mp4,video/webm,video/quicktime,video/x-msvideo';

type MediaType = 'image' | 'video';

type Props = {
  initialMediaType?: MediaType;
  initialMediaUrl?: string;
  idPrefix?: string;
};

function isDirectVideoPreview(url: string): boolean {
  return (
    url.startsWith('blob:') ||
    url.startsWith('/uploads/videos/') ||
    /\.(mp4|webm|mov)(\?|$)/i.test(url)
  );
}

export function StoryMediaFields({
  initialMediaType = 'image',
  initialMediaUrl = '',
  idPrefix = 'story',
}: Props) {
  const [mediaType, setMediaType] = useState<MediaType>(initialMediaType);
  const [mediaUrl, setMediaUrl] = useState(initialMediaUrl.trim());
  const [previewUrl, setPreviewUrl] = useState(initialMediaUrl.trim());
  const [pendingFile, setPendingFile] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const mediaTypeId = useId();
  const urlId = useId();
  const fileId = useId();

  const accept = mediaType === 'video' ? VIDEO_ACCEPT : IMAGE_ACCEPT;
  const maxBytes = mediaType === 'video' ? VIDEO_MAX_BYTES : IMAGE_MAX_BYTES;

  const urlPlaceholder =
    mediaType === 'video'
      ? 'https://example.com/story.mp4'
      : 'https://example.com/story.jpg';

  const hint =
    mediaType === 'video'
      ? 'لینک مستقیم ویدیو (https) یا بارگذاری فایل — MP4، WebM یا MOV، حداکثر ۱۰۰ مگابایت.'
      : 'لینک تصویر (https) یا بارگذاری فایل — JPEG، PNG، WebP یا GIF، حداکثر ۵ مگابایت.';

  const showVideoPreview = mediaType === 'video' && previewUrl && isDirectVideoPreview(previewUrl);
  const showImagePreview = mediaType === 'image' && previewUrl;
  const unoptimized =
    previewUrl.startsWith('blob:') || isUploadedMediaPath(previewUrl) || previewUrl.startsWith('http');

  const fileInputKey = useMemo(
    () => `${idPrefix}-${mediaType}-${pendingFile ? 'file' : 'empty'}`,
    [idPrefix, mediaType, pendingFile],
  );

  function handleMediaTypeChange(nextType: MediaType) {
    setMediaType(nextType);
    setPendingFile(false);
    setFileError(null);
    setMediaUrl(initialMediaUrl.trim());
    setPreviewUrl(initialMediaUrl.trim());
  }

  function handleUrlChange(value: string) {
    setPendingFile(false);
    setFileError(null);
    setMediaUrl(value);
    setPreviewUrl(value);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
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

    setFileError(null);
    setPendingFile(true);
    setMediaUrl('');
    setPreviewUrl(URL.createObjectURL(file));
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
            value={pendingFile ? '' : mediaUrl}
            onChange={(event) => handleUrlChange(event.target.value)}
            placeholder={urlPlaceholder}
            disabled={pendingFile}
          />
        </div>

        <div className="form-field" style={{ marginTop: '0.75rem' }}>
          <label className="form-field__label" htmlFor={fileId}>
            {mediaType === 'video' ? 'بارگذاری فایل ویدیو' : 'بارگذاری فایل تصویر'}
          </label>
          <input
            key={fileInputKey}
            id={fileId}
            name="mediaFile"
            type="file"
            accept={accept}
            onChange={handleFileChange}
          />
        </div>

        {fileError ? (
          <p className="form-field__hint" style={{ color: 'var(--danger)' }} role="alert">
            {fileError}
          </p>
        ) : null}

        {pendingFile ? (
          <p className="form-field__hint">فایل جدید انتخاب شد — پس از ذخیره، بارگذاری انجام می‌شود.</p>
        ) : mediaUrl ? (
          <p className="form-field__hint" dir="ltr">
            مسیر فعلی: {mediaUrl}
          </p>
        ) : null}

        {showImagePreview ? (
          <div className="article-image-field__preview story-media-field__preview">
            <Image
              src={imageOrPlaceholder(previewUrl)}
              alt="پیش‌نمایش رسانه استوری"
              width={320}
              height={200}
              className="article-image-field__img"
              unoptimized={unoptimized}
            />
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

        {mediaType === 'video' && previewUrl && !showVideoPreview ? (
          <p className="form-field__hint" dir="ltr">
            پیش‌نمایش برای این آدرس ویدیو در دسترس نیست؛ پس از ذخیره در سایت نمایش داده می‌شود.
          </p>
        ) : null}
      </div>
    </>
  );
}
