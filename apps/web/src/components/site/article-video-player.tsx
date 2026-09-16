'use client';

import { resolveVideoPlayback } from '@/lib/video-playback';

type ArticleVideoPlayerProps = {
  url: string;
  title: string;
};

export function ArticleVideoPlayer({ url, title }: ArticleVideoPlayerProps) {
  const playback = resolveVideoPlayback(url);

  if (playback.kind === 'iframe') {
    return (
      <div className="article-video-player">
        <iframe
          className="article-video-player__embed"
          src={playback.embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    );
  }

  if (playback.kind === 'file') {
    return (
      <div className="article-video-player">
        <video
          className="article-video-player__file"
          src={playback.src}
          controls
          playsInline
          preload="metadata"
          aria-label={title}
        />
      </div>
    );
  }

  return (
    <div className="article-video-player article-video-player--fallback">
      <a
        className="article-video-player__external"
        href={playback.src}
        target="_blank"
        rel="noreferrer"
      >
        مشاهده ویدیو
      </a>
    </div>
  );
}
