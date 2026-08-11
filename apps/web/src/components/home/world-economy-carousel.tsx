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

export function WorldEconomyCarousel({ articles }: Props) {
  if (articles.length === 0) {
    return <p className="site-empty">خبری در این بخش نیست.</p>;
  }

  return (
    <div className="blog-home">
      <div className="site-container">
        <ResponsiveCarousel
          ariaLabel="اخبار اقتصادی جهان"
          className="blog-carousel"
          slideClassName="blog-slide"
          breakpoints={{ mobile: 1, tablet: 2, desktop: 3 }}
        >
          {articles.slice(0, 8).map((article) => (
            <article key={article.id} className="blog-item">
              <Link href={articleHref(article.id, article.title)} className="pic-blog">
                <ArticleNewsThumbnail
                  src={article.featuredImage}
                  alt={article.title}
                  hasVideo={article.hasVideo}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="coverVideo" />
              </Link>
              <div className="info-blog">
                <span className="date">{formatFaDate(article.publishedAt)}</span>
                <div className="bodyDiv">
                  <Link href={articleHref(article.id, article.title)}>
                    <h3 className="title">{article.title}</h3>
                  </Link>
                  <div className="user">
                    <span>{article.author.displayName}</span>
                  </div>
                  {article.excerpt ? (
                    <Link href={articleHref(article.id, article.title)}>
                      <p className="text">{article.excerpt}</p>
                    </Link>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </ResponsiveCarousel>
      </div>
    </div>
  );
}
