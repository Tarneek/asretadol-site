import Image from 'next/image';
import { imageOrPlaceholder } from '@/lib/format';

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
  const resolved = imageOrPlaceholder(src);

  if (fill) {
    return (
      <Image
        src={resolved}
        alt={alt}
        fill
        className={className}
        sizes={sizes ?? '(max-width: 768px) 100vw, 50vw'}
        priority={priority}
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
    />
  );
}
