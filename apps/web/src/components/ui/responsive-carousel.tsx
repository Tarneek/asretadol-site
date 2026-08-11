'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { IconChevronLeft, IconChevronRight } from '@/components/icons/site-icons';

type Breakpoints = {
  mobile: number;
  tablet: number;
  desktop: number;
};

type Props = {
  children: ReactNode;
  ariaLabel: string;
  className?: string;
  slideClassName?: string;
  breakpoints?: Breakpoints;
};

const DEFAULT_BREAKPOINTS: Breakpoints = {
  mobile: 1,
  tablet: 2,
  desktop: 3,
};

export function ResponsiveCarousel({
  children,
  ariaLabel,
  className,
  slideClassName,
  breakpoints = DEFAULT_BREAKPOINTS,
}: Props) {
  const slideNodes = useMemo(() => {
    const nodes = Array.isArray(children) ? children : [children];
    return nodes.filter((node) => node !== null && node !== undefined);
  }, [children]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canGoPrev, setCanGoPrev] = useState(false);
  const [canGoNext, setCanGoNext] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    direction: 'rtl',
    align: 'start',
    dragFree: false,
    containScroll: 'trimSnaps',
    slidesToScroll: 1,
  });

  const updateControls = useCallback(() => {
    if (!emblaApi) {
      return;
    }

    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanGoPrev(emblaApi.canScrollPrev());
    setCanGoNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    updateControls();
    emblaApi.on('select', updateControls);
    emblaApi.on('reInit', updateControls);

    return () => {
      emblaApi.off('select', updateControls);
      emblaApi.off('reInit', updateControls);
    };
  }, [emblaApi, updateControls]);

  return (
    <div
      className={`carousel ${className ?? ''}`.trim()}
      aria-label={ariaLabel}
      style={
        {
          '--carousel-mobile': breakpoints.mobile,
          '--carousel-tablet': breakpoints.tablet,
          '--carousel-desktop': breakpoints.desktop,
        } as CSSProperties
      }
    >
      <div className="carousel-controls">
        <button
          type="button"
          className="carousel-button"
          onClick={() => emblaApi?.scrollPrev()}
          disabled={!canGoPrev}
          aria-label="اسلاید قبلی"
        >
          <IconChevronRight size={22} />
        </button>
        <button
          type="button"
          className="carousel-button"
          onClick={() => emblaApi?.scrollNext()}
          disabled={!canGoNext}
          aria-label="اسلاید بعدی"
        >
          <IconChevronLeft size={22} />
        </button>
      </div>

      <div className="carousel-viewport" ref={emblaRef}>
        <div className="carousel-track">
          {slideNodes.map((slide, itemIndex) => (
            <div
              key={itemIndex}
              className={`carousel-slide ${slideClassName ?? ''}`.trim()}
            >
              {slide}
            </div>
          ))}
        </div>
      </div>

      {slideNodes.length > 1 ? (
        <div className="carousel-dots" aria-hidden="true">
          {emblaApi?.scrollSnapList().map((_, dotIndex) => (
            <button
              key={dotIndex}
              type="button"
              className={`carousel-dot${dotIndex === selectedIndex ? ' active' : ''}`}
              onClick={() => emblaApi?.scrollTo(dotIndex)}
              aria-label={`رفتن به اسلاید ${dotIndex + 1}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
