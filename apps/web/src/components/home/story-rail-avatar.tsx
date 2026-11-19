'use client';

import { useEffect, useState } from 'react';
import {
  NEWS_PLACEHOLDER_IMAGE_PATH,
  imageOrPlaceholder,
  isNewsPlaceholderImage,
} from '@/lib/format';
import { isDirectVideoFileUrl } from '@/lib/video-playback';

type Props = {
  title: string;
  mediaUrl: string | null | undefined;
  mediaType: 'image' | 'video';
};

/**
 * Circular story rail thumbnail for desktop + mobile rails.
 * Native <img>/<video> (not next/image) — avoids optimizer/lazy issues in overflow rails.
 */
export function StoryRailAvatar({ title, mediaUrl, mediaType }: Props) {
  const resolved = imageOrPlaceholder(mediaUrl);
  const [src, setSrc] = useState(resolved);
  const [useImageFallback, setUseImageFallback] = useState(false);

  useEffect(() => {
    setSrc(imageOrPlaceholder(mediaUrl));
    setUseImageFallback(false);
  }, [mediaUrl]);

  const isFileVideo =
    mediaType === 'video' &&
    Boolean(mediaUrl?.trim()) &&
    isDirectVideoFileUrl(mediaUrl!) &&
    !useImageFallback;

  if (mediaType === 'video' && !isFileVideo && !useImageFallback) {
    return (
      <span className="story-avatar story-avatar--embed" aria-hidden>
        ▶
      </span>
    );
  }

  if (isFileVideo) {
    const raw = mediaUrl!.trim();
    const videoSrc = raw.includes('#') ? raw : `${raw}#t=0.001`;

    return (
      <video
        className="story-avatar"
        src={videoSrc}
        muted
        playsInline
        preload="metadata"
        aria-label={title}
        onError={() => {
          setSrc(NEWS_PLACEHOLDER_IMAGE_PATH);
          setUseImageFallback(true);
        }}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- rail needs eager native decode
    <img
      className="story-avatar"
      src={src || NEWS_PLACEHOLDER_IMAGE_PATH}
      alt={title}
      width={72}
      height={72}
      loading="eager"
      decoding="async"
      referrerPolicy="no-referrer"
      draggable={false}
      onError={() => {
        setSrc((current) =>
          isNewsPlaceholderImage(current) ? current : NEWS_PLACEHOLDER_IMAGE_PATH,
        );
      }}
    />
  );
}
