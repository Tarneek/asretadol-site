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
  mediaUrl: string;
  mediaType: 'image' | 'video';
};

/**
 * Circular story rail thumbnail.
 * Uses a plain <img>/<video> (not next/image) so horizontal mobile scroll
 * is not blocked by optimizer/lazy intersection quirks.
 */
export function StoryRailAvatar({ title, mediaUrl, mediaType }: Props) {
  const [src, setSrc] = useState(() => imageOrPlaceholder(mediaUrl));
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    setSrc(imageOrPlaceholder(mediaUrl));
    setVideoFailed(false);
  }, [mediaUrl]);

  const isFileVideo =
    mediaType === 'video' && isDirectVideoFileUrl(mediaUrl) && !videoFailed;

  if (mediaType === 'video' && !isFileVideo) {
    return (
      <span className="story-avatar story-avatar--embed" aria-hidden>
        ▶
      </span>
    );
  }

  if (isFileVideo) {
    // `#t=0.001` forces Safari/iOS to decode a first frame for the circle preview.
    const videoSrc = mediaUrl.includes('#') ? mediaUrl : `${mediaUrl}#t=0.001`;

    return (
      <video
        className="story-avatar"
        src={videoSrc}
        muted
        playsInline
        preload="metadata"
        aria-label={title}
        onError={() => setVideoFailed(true)}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- rail needs eager native decode in overflow-x
    <img
      className="story-avatar"
      src={src}
      alt={title}
      loading="eager"
      decoding="async"
      draggable={false}
      onError={() => {
        setSrc((current) =>
          isNewsPlaceholderImage(current) ? current : NEWS_PLACEHOLDER_IMAGE_PATH,
        );
      }}
    />
  );
}
