'use client';

import type { RefObject } from 'react';
import { resolveVideoPlayback } from '@/lib/video-playback';

type SiteVideoEmbedProps = {
  url: string;
  title: string;
  className?: string;
  /** Forwarded to native video for story progress tracking. */
  videoRef?: RefObject<HTMLVideoElement | null>;
  onNativeEnded?: () => void;
};

export function SiteVideoEmbed({
  url,
  title,
  className,
  videoRef,
  onNativeEnded,
}: SiteVideoEmbedProps) {
  const playback = resolveVideoPlayback(url);

  if (playback.kind === 'iframe') {
    return (
      <iframe
        className={className}
        src={playback.embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    );
  }

  if (playback.kind === 'file') {
    return (
      <video
        ref={videoRef}
        className={className}
        src={playback.src}
        controls
        playsInline
        preload="metadata"
        aria-label={title}
        onEnded={onNativeEnded}
      />
    );
  }

  return (
    <a
      className={className ? `${className} site-video-embed__external` : 'site-video-embed__external'}
      href={playback.src}
      target="_blank"
      rel="noreferrer"
    >
      مشاهده ویدیو
    </a>
  );
}
