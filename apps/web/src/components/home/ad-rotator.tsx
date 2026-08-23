'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { isUploadedMediaPath } from '@/lib/format';
import type { PublicAdvertisement } from '@/lib/types/public-api';

type Props = {
  ads: PublicAdvertisement[];
  className: string;
};

export function AdRotator({ ads, className }: Props) {
  const rotatableAds = useMemo(
    () => ads.filter((ad) => ad.rotationEnabled),
    [ads],
  );
  const staticAds = useMemo(
    () => (rotatableAds.length > 0 ? rotatableAds : ads),
    [ads, rotatableAds],
  );

  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [staticAds]);

  useEffect(() => {
    if (staticAds.length <= 1 || rotatableAds.length <= 1) {
      return;
    }

    const intervalMs = (staticAds[0]?.rotationIntervalSeconds ?? 8) * 1000;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % staticAds.length);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [staticAds, rotatableAds.length]);

  if (staticAds.length === 0) {
    return <div className={className} aria-hidden="true" />;
  }

  const ad = staticAds[index] ?? staticAds[0];
  const unoptimized = isUploadedMediaPath(ad.imageUrl) || ad.imageUrl.startsWith('http');

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
