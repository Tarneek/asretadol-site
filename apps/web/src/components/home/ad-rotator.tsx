'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  getAdRotationIntervalMs,
  resolveAdPlacementDisplay,
} from '@/lib/ad-placement-display';
import { isUploadedMediaPath } from '@/lib/format';
import type { PublicAdvertisement } from '@/lib/types/public-api';

type Props = {
  ads: PublicAdvertisement[];
  className: string;
};

function AdUnit({
  ad,
  className,
}: {
  ad: PublicAdvertisement;
  className: string;
}) {
  const unoptimized =
    isUploadedMediaPath(ad.imageUrl) || ad.imageUrl.startsWith('http');

  return (
    <a
      href={ad.linkUrl}
      className={`${className} ad-unit`}
      target="_blank"
      rel="noopener noreferrer sponsored"
      aria-label={ad.title}
    >
      <Image
        src={ad.imageUrl}
        alt={ad.title}
        fill
        className="ad-unit__image"
        sizes="(max-width: 768px) 100vw, 50vw"
        unoptimized={unoptimized}
      />
    </a>
  );
}

/** Rotating carousel — only mounted when a placement has 2+ ads. */
function AdCarousel({
  ads,
  className,
}: {
  ads: PublicAdvertisement[];
  className: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [ads]);

  useEffect(() => {
    const intervalMs = getAdRotationIntervalMs(ads);
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % ads.length);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [ads]);

  const ad = ads[index] ?? ads[0]!;
  return <AdUnit ad={ad} className={className} />;
}

/**
 * Renders ads for one placement/slot.
 * Single ad → static; multiple → carousel; none → empty placeholder.
 */
export function AdRotator({ ads, className }: Props) {
  const display = resolveAdPlacementDisplay(ads);

  if (display.mode === 'empty') {
    return <div className={className} aria-hidden="true" />;
  }

  if (display.mode === 'static') {
    return <AdUnit ad={display.ads[0]} className={className} />;
  }

  return <AdCarousel ads={display.ads} className={className} />;
}
