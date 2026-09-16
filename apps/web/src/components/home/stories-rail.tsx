'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { IconChevronLeft, IconChevronRight, IconClose } from '@/components/icons/site-icons';
import { SiteVideoEmbed } from '@/components/site/site-video-embed';
import { isDirectVideoFileUrl, resolveVideoPlayback } from '@/lib/video-playback';
import type { PublicStory } from '@/lib/types/public-api';

type Props = {
  stories: PublicStory[];
};

const IMAGE_DURATION_MS = 4500;
const EMBED_VIDEO_DURATION_MS = 12_000;

function resolveStoryLink(link: string | null | undefined): string | null {
  const value = link?.trim() ?? '';
  return value.length > 0 ? value : null;
}

function useTimedProgress(active: boolean, durationMs: number, onComplete: () => void) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!active) {
      return;
    }

    const startedAt = window.performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const nextProgress = Math.min(1, (now - startedAt) / durationMs);
      setProgress(nextProgress);
      if (nextProgress >= 1) {
        onComplete();
        return;
      }
      frame = window.requestAnimationFrame(tick);
    };

    setProgress(0);
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [active, durationMs, onComplete]);

  return progress;
}

export function StoriesRail({ stories }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [nativeProgress, setNativeProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const activeStory = openIndex === null ? null : stories[openIndex] ?? null;
  const activeStoryLink = resolveStoryLink(activeStory?.link);
  const activeVideoPlayback =
    activeStory?.mediaType === 'video'
      ? resolveVideoPlayback(activeStory.mediaUrl)
      : null;
  const isNativeVideo =
    activeStory?.mediaType === 'video' && activeVideoPlayback?.kind === 'file';
  const isEmbedVideo =
    activeStory?.mediaType === 'video' && activeVideoPlayback?.kind === 'iframe';

  const openStory = useCallback((index: number) => {
    setOpenIndex(index);
    setNativeProgress(0);
  }, []);

  const closeStory = useCallback(() => {
    setOpenIndex(null);
    setNativeProgress(0);
  }, []);

  const goToNext = useCallback(() => {
    setOpenIndex((current) => {
      if (current === null) return current;
      if (current >= stories.length - 1) {
        return null;
      }
      return current + 1;
    });
    setNativeProgress(0);
  }, [stories.length]);

  const goToPrev = useCallback(() => {
    setOpenIndex((current) => {
      if (current === null) return current;
      return Math.max(0, current - 1);
    });
    setNativeProgress(0);
  }, []);

  const imageProgress = useTimedProgress(
    Boolean(activeStory && activeStory.mediaType === 'image'),
    IMAGE_DURATION_MS,
    goToNext,
  );
  const embedProgress = useTimedProgress(
    Boolean(isEmbedVideo),
    EMBED_VIDEO_DURATION_MS,
    goToNext,
  );

  useEffect(() => {
    if (!isNativeVideo || !activeStory) {
      return;
    }

    const video = videoRef.current;
    if (!video) {
      return;
    }

    const handleTimeUpdate = () => {
      if (!video.duration || Number.isNaN(video.duration)) {
        return;
      }
      setNativeProgress(video.currentTime / video.duration);
    };

    video.currentTime = 0;
    setNativeProgress(0);
    video.play().catch(() => undefined);
    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.pause();
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [activeStory, isNativeVideo]);

  useEffect(() => {
    if (openIndex === null) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeStory();
      if (event.key === 'ArrowLeft') goToNext();
      if (event.key === 'ArrowRight') goToPrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeStory, goToNext, goToPrev, openIndex]);

  const progress =
    activeStory?.mediaType === 'image'
      ? imageProgress
      : isEmbedVideo
        ? embedProgress
        : nativeProgress;

  const railItems = useMemo(
    () =>
      stories.map((story, index) => {
        const isFileVideo =
          story.mediaType === 'video' && isDirectVideoFileUrl(story.mediaUrl);

        return (
          <button
            key={story.id}
            type="button"
            className="story-item"
            onClick={() => openStory(index)}
            aria-label={`Open story: ${story.title}`}
          >
            <span className="story-ring">
              <span className="story-ring__inner">
                {isFileVideo ? (
                  <video
                    className="story-avatar"
                    src={story.mediaUrl}
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : story.mediaType === 'video' ? (
                  <span className="story-avatar story-avatar--embed" aria-hidden>
                    ▶
                  </span>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="story-avatar" src={story.mediaUrl} alt={story.title} />
                )}
              </span>
            </span>
            <span className="story-label">{story.title}</span>
          </button>
        );
      }),
    [openStory, stories],
  );

  if (stories.length === 0) {
    return null;
  }

  const mediaContent =
    activeStory == null ? null : activeStory.mediaType === 'video' ? (
      <SiteVideoEmbed
        key={activeStory.id}
        url={activeStory.mediaUrl}
        title={activeStory.title}
        className="story-modal__media"
        videoRef={videoRef}
        onNativeEnded={goToNext}
      />
    ) : (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        key={activeStory.id}
        className="story-modal__media"
        src={activeStory.mediaUrl}
        alt={activeStory.title}
      />
    );

  return (
    <>
      <div className="rightPanelFather">
        <div className="rightPanel desktop-only">{railItems}</div>
        <div className="stories-mobile">{railItems}</div>
      </div>

      {activeStory ? (
        <div className="story-modal" role="dialog" aria-modal="true" aria-label={activeStory.title}>
          <button
            type="button"
            className="story-modal__backdrop"
            aria-label="Close story viewer"
            onClick={closeStory}
          />
          <div className="story-modal__card">
            <div className="story-modal__progress">
              {stories.map((story, index) => {
                const value =
                  index < (openIndex ?? 0) ? 1 : index === openIndex ? progress : 0;

                return (
                  <span key={story.id} className="story-modal__progress-track">
                    <span
                      className="story-modal__progress-bar"
                      style={{ transform: `scaleX(${value})` }}
                    />
                  </span>
                );
              })}
            </div>

            <div className="story-modal__header">
              <strong>{activeStory.title}</strong>
              <button type="button" className="story-modal__close" onClick={closeStory} aria-label="بستن">
                <IconClose size={22} />
              </button>
            </div>

            <div className="story-modal__body">
              <button
                type="button"
                className="story-modal__nav story-modal__nav--prev"
                onClick={goToPrev}
                disabled={openIndex === 0}
                aria-label="Previous story"
              >
                <IconChevronRight size={24} />
              </button>

              <div
                className={
                  activeStoryLink
                    ? 'story-modal__media-frame story-modal__media-frame--linked'
                    : 'story-modal__media-frame'
                }
              >
                {activeStoryLink && activeStory.mediaType === 'image' ? (
                  <Link
                    href={activeStoryLink}
                    className="story-modal__media-link"
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`باز کردن لینک: ${activeStory.title}`}
                  >
                    {mediaContent}
                  </Link>
                ) : (
                  mediaContent
                )}
              </div>

              <button
                type="button"
                className="story-modal__nav story-modal__nav--next"
                onClick={goToNext}
                aria-label="Next story"
              >
                <IconChevronLeft size={24} />
              </button>
            </div>

            {activeStoryLink ? (
              <div className="story-modal__footer">
                <Link
                  href={activeStoryLink}
                  className="btn-danger"
                  target="_blank"
                  rel="noreferrer"
                >
                  مشاهده خبر
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
