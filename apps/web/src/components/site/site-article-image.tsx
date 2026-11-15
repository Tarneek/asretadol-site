'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  NEWS_PLACEHOLDER_IMAGE_PATH,
  imageOrPlaceholder,
  isNewsPlaceholderImage,
  isUploadedMediaPath,
} from '@/lib/format';

type SiteArticleImageProps = {
  src: string | null | undefined;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
};

export function SiteArticleImage({
  src,
  alt,
  className,
  width = 800,
  height = 500,
  fill,
  sizes,
  priority,
}: SiteArticleImageProps) {
  const [resolved, setResolved] = useState(() => imageOrPlaceholder(src));

  useEffect(() => {
    setResolved(imageOrPlaceholder(src));
  }, [src]);

  // Runtime volume files are not served by Next's static handler in standalone;
  // nginx serves /uploads/* — skip the optimizer so the browser hits nginx directly.
  const unoptimized =
    isUploadedMediaPath(resolved) || isNewsPlaceholderImage(resolved);

  const handleError = () => {
    setResolved((current) =>
      isNewsPlaceholderImage(current) ? current : NEWS_PLACEHOLDER_IMAGE_PATH,
    );
  };

  if (fill) {
    return (
      <Image
        src={resolved}
        alt={alt}
        fill
        className={className}
        sizes={sizes ?? '(max-width: 768px) 100vw, 50vw'}
        priority={priority}
        unoptimized={unoptimized}
        onError={handleError}
      />
    );
  }

  return (
    <Image
      src={resolved}
      alt={alt}
      width={width}
      height={height}
      className={className}
      sizes={sizes}
      priority={priority}
      unoptimized={unoptimized}
      onError={handleError}
    />
  );
}
