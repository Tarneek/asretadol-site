import Link from 'next/link';
import { ArticleNewsThumbnail } from '@/components/site/article-news-thumbnail';
import {
  articleHref,
  formatFaDate,
} from '@/lib/format';
import type { PublicArticleCard } from '@/lib/types/public-api';
import { ResponsiveCarousel } from '@/components/ui/responsive-carousel';

type Props = {
  articles: PublicArticleCard[];
};

export function AnalyticalNews({ articles }: Props) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <div className="analytical-news pt-5">
      <div className="site-container">
        <ResponsiveCarousel
          ariaLabel="تحلیل‌های خبری"
          className="analysis-carousel"
          slideClassName="analysis-slide"
          breakpoints={{ mobile: 1, tablet: 2, desktop: 4 }}
        >
          {articles.slice(0, 8).map((article) => (
            <div key={article.id} className="item">
              <Link href={articleHref(article.id, article.title)} className="imgbox">
                <ArticleNewsThumbnail
                  src={article.featuredImage}
                  alt={article.title}
                  hasVideo={article.hasVideo}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="coverVideo" />
              </Link>
              <div className="bodyText">
                <Link href={articleHref(article.id, article.title)}>
                  <h3>{article.title}</h3>
                </Link>
                <div className="datebox">
                  <time>{formatFaDate(article.publishedAt)}</time>
                  <span> - {article.author.displayName}</span>
                </div>
              </div>
            </div>
          ))}
        </ResponsiveCarousel>
      </div>
    </div>
  );
}
