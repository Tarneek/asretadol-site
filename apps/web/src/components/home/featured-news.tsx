import Link from 'next/link';
import { ArticleNewsThumbnail } from '@/components/site/article-news-thumbnail';
import { articleHref, formatFaDate } from '@/lib/format';
import type { PublicArticleCard } from '@/lib/types/public-api';

type Props = {
  hero: PublicArticleCard[];
  featured: PublicArticleCard[];
  latest: PublicArticleCard[];
};

export function FeaturedNews({ hero, featured, latest }: Props) {
  const mainHero = hero[0] ?? featured[0] ?? latest[0];
  const sideHero = hero[1] ?? featured[1] ?? latest[1];
  const sideList = (hero.length > 2 ? hero.slice(2) : latest)
    .filter((a) => a.id !== mainHero?.id && a.id !== sideHero?.id)
    .slice(0, 3);

  if (!mainHero) {
    return <p className="site-empty">هنوز خبر منتشرشده‌ای وجود ندارد.</p>;
  }

  return (
    <div className="featured-grid">
      <div>
        <div className="featured-main">
          <div className="ImportantNewsList">
            {sideList.map((article) => (
              <Link key={article.id} href={articleHref(article.id, article.title)} className="item">
                <div className="imgbox">
                  <ArticleNewsThumbnail
                    src={article.featuredImage}
                    alt={article.title}
                    hasVideo={article.hasVideo}
                    fill
                    sizes="95px"
                  />
                  <div className="coverVideo" />
                </div>
                <h3>{article.title}</h3>
              </Link>
            ))}
          </div>
          <Link href={articleHref(mainHero.id, mainHero.title)} className="newsVideo news1">
            <ArticleNewsThumbnail
              src={mainHero.featuredImage}
              alt={mainHero.title}
              hasVideo={mainHero.hasVideo}
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              priority
            />
            <div className="coverVideo" />
            <h3>{mainHero.title}</h3>
            <div className="date-user">
              <span>{mainHero.author.displayName}</span>
              <span> - </span>
              <span>{formatFaDate(mainHero.publishedAt)}</span>
            </div>
          </Link>
        </div>
        <div className="ad-slots" aria-hidden>
          <div className="ad-slot" />
          <div className="ad-slot" />
        </div>
      </div>

      {sideHero ? (
        <Link href={articleHref(sideHero.id, sideHero.title)} className="newsVideo news2">
          <ArticleNewsThumbnail
            src={sideHero.featuredImage}
            alt={sideHero.title}
            hasVideo={sideHero.hasVideo}
            fill
            sizes="(max-width: 768px) 100vw, 35vw"
          />
          <div className="coverVideo" />
          <h3>{sideHero.title}</h3>
          <div className="date-user">
            <span>{sideHero.author.displayName}</span>
            <span> - </span>
            <span>{formatFaDate(sideHero.publishedAt)}</span>
          </div>
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
