'use client';

import { useId, useState } from 'react';

type Props = {
  initialHasVideo?: boolean;
  initialVideoUrl?: string | null;
};

export function ArticleVideoFields({ initialHasVideo = false, initialVideoUrl = '' }: Props) {
  const [hasVideo, setHasVideo] = useState(initialHasVideo);
  const [videoPath, setVideoPath] = useState(initialVideoUrl ?? '');
  const videoUrlId = useId();
  const toggleId = useId();
  const fileId = useId();

  const isLocalUpload = videoPath.startsWith('/uploads/videos/');

  return (
    <div className="form-section">
      <h3 className="form-section__title">ویدیو</h3>
      <label className="checkbox-row" htmlFor={toggleId}>
        <input
          id={toggleId}
          type="checkbox"
          name="hasVideo"
          value="1"
          checked={hasVideo}
          onChange={(event) => setHasVideo(event.target.checked)}
        />
        این مطلب ویدیو دارد
      </label>
      {hasVideo ? (
        <div className="article-video-field" style={{ marginTop: '0.75rem' }}>
          <input type="hidden" name="videoUrl" value={videoPath} />
          <div className="form-field">
            <label className="form-field__label" htmlFor={videoUrlId}>
              آدرس ویدیو (اختیاری اگر فایل آپلود می‌کنید)
            </label>
            <p className="form-field__hint">
              YouTube، Aparat، یا هر URL https — در غیر این صورت فایل را در پایین بارگذاری کنید.
            </p>
            <input
              id={videoUrlId}
              type="text"
              dir="ltr"
              value={isLocalUpload ? '' : videoPath}
              onChange={(event) => setVideoPath(event.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
          <div className="form-field">
            <label className="form-field__label" htmlFor={fileId}>
              بارگذاری فایل ویدیو
            </label>
            <p className="form-field__hint">MP4، WebM یا MOV — حداکثر ۱۰۰ مگابایت.</p>
            <input
              id={fileId}
              name="videoFile"
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
              onChange={() => {
                /* path set on server after upload */
              }}
            />
          </div>
          {videoPath ? (
            <p className="form-field__hint" dir="ltr">
              مسیر فعلی: {videoPath}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
