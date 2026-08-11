import { IconPlay } from '@/components/icons/site-icons';
import { SiteArticleImage } from '@/components/site/site-article-image';

type ArticleNewsThumbnailProps = {
  src: string | null | undefined;
  alt: string;
  hasVideo?: boolean;
  className?: string;
  imageClassName?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
};

export function ArticleNewsThumbnail({
  src,
  alt,
  hasVideo = false,
  className,
  imageClassName,
  ...imageProps
}: ArticleNewsThumbnailProps) {
  const rootClass = className
    ? `article-news-thumb ${className}`
    : 'article-news-thumb';

  return (
    <div className={rootClass}>
      <SiteArticleImage
        src={src}
        alt={alt}
        className={imageClassName ?? 'site-media-cover'}
        {...imageProps}
      />
      {hasVideo ? (
        <span className="article-news-thumb__play" aria-hidden>
          <IconPlay size={26} />
        </span>
      ) : null}
    </div>
  );
}
