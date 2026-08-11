'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { IconChevronLeft, IconChevronRight, IconClose } from '@/components/icons/site-icons';
import type { PublicStory } from '@/lib/types/public-api';

type Props = {
  stories: PublicStory[];
};

const IMAGE_DURATION_MS = 4500;

export function StoriesRail({ stories }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const activeStory = openIndex === null ? null : stories[openIndex] ?? null;

  const openStory = useCallback((index: number) => {
    setOpenIndex(index);
    setProgress(0);
  }, []);

  const closeStory = useCallback(() => {
    setOpenIndex(null);
    setProgress(0);
  }, []);

  const goToNext = useCallback(() => {
    setOpenIndex((current) => {
      if (current === null) return current;
      if (current >= stories.length - 1) {
        return null;
      }
      return current + 1;
    });
    setProgress(0);
  }, [stories.length]);

  const goToPrev = useCallback(() => {
    setOpenIndex((current) => {
      if (current === null) return current;
      return Math.max(0, current - 1);
    });
    setProgress(0);
  }, []);

  useEffect(() => {
    if (!activeStory || activeStory.mediaType !== 'image') {
      return;
    }

    const startedAt = window.performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const nextProgress = Math.min(1, (now - startedAt) / IMAGE_DURATION_MS);
      setProgress(nextProgress);
      if (nextProgress >= 1) {
        goToNext();
        return;
      }
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [activeStory, goToNext]);

  useEffect(() => {
    if (!activeStory || activeStory.mediaType !== 'video') {
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
      setProgress(video.currentTime / video.duration);
    };

    const handleEnded = () => goToNext();

    video.currentTime = 0;
    setProgress(0);
    video.play().catch(() => undefined);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.pause();
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [activeStory, goToNext]);

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

  const railItems = useMemo(
    () =>
      stories.map((story, index) => (
        <button
          key={story.id}
          type="button"
          className="story-item"
          onClick={() => openStory(index)}
          aria-label={`Open story: ${story.title}`}
        >
          <span className="story-ring">
            <span className="story-ring__inner">
              {story.mediaType === 'video' ? (
                <video
                  className="story-avatar"
                  src={story.mediaUrl}
                  muted
                  playsInline
                  preload="metadata"
                />
              ) : (
                <img className="story-avatar" src={story.mediaUrl} alt={story.title} />
              )}
            </span>
          </span>
          <span className="story-label">{story.title}</span>
        </button>
      )),
    [openStory, stories],
  );

  if (stories.length === 0) {
    return null;
  }

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

              <div className="story-modal__media-frame">
                {activeStory.mediaType === 'video' ? (
                  <video
                    key={activeStory.id}
                    ref={videoRef}
                    className="story-modal__media"
                    src={activeStory.mediaUrl}
                    controls
                    playsInline
                  />
                ) : (
                  <img
                    key={activeStory.id}
                    className="story-modal__media"
                    src={activeStory.mediaUrl}
                    alt={activeStory.title}
                  />
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

            {activeStory.link ? (
              <div className="story-modal__footer">
                <Link href={activeStory.link} className="btn-danger" target="_blank" rel="noreferrer">
                  ?????? ????
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
