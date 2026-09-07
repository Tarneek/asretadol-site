'use client';

import { useId, useState } from 'react';
import { uploadArticleEditorMedia } from '@/lib/article-editor-media';

type Props = {
  initialHasVideo?: boolean;
  initialVideoUrl?: string | null;
};

export function ArticleVideoFields({ initialHasVideo = false, initialVideoUrl = '' }: Props) {
  const [hasVideo, setHasVideo] = useState(initialHasVideo);
  const [videoPath, setVideoPath] = useState(initialVideoUrl ?? '');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoUrlId = useId();
  const toggleId = useId();
  const fileId = useId();

  const isLocalUpload =
    videoPath.startsWith('/uploads/videos/') ||
    videoPath.startsWith('/uploads/blog/content/');

  return (
    <div className="form-field article-video-field">
      <span className="form-field__label">ویدیو</span>
      <p className="form-field__hint">اختیاری — لینک خارجی یا بارگذاری فایل.</p>
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
        <div className="stack stack--sm" style={{ marginTop: '0.75rem' }}>
          <input type="hidden" name="videoUrl" value={videoPath} />
          <div className="form-field">
            <label className="form-field__label" htmlFor={videoUrlId}>
              آدرس ویدیو
            </label>
            <p className="form-field__hint">
              YouTube، Aparat، یا هر URL https — در غیر این صورت فایل را بارگذاری کنید.
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
            <p className="form-field__hint">MP4 یا WebM — حداکثر ۱۰۰ مگابایت.</p>
            <input
              id={fileId}
              type="file"
              accept="video/mp4,video/webm"
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
                  const path = await uploadArticleEditorMedia(file, 'video', 'content');
                  setVideoPath(path);
                } catch (uploadError) {
                  setError(
                    uploadError instanceof Error && uploadError.message.trim()
                      ? uploadError.message
                      : 'بارگذاری ویدیو ممکن نشد.',
                  );
                } finally {
                  setUploading(false);
                }
              }}
            />
          </div>
          {uploading ? (
            <p className="form-field__hint" role="status">
              در حال بارگذاری ویدیو…
            </p>
          ) : null}
          {error ? (
            <p className="form-field__hint" role="alert">
              {error}
            </p>
          ) : null}
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
