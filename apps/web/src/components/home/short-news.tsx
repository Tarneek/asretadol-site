import Link from 'next/link';
import { IconNewsFlash } from '@/components/icons/site-icons';
import { ArticleNewsThumbnail } from '@/components/site/article-news-thumbnail';
import { articleHref } from '@/lib/format';
import type { PublicArticleCard } from '@/lib/types/public-api';

type Props = {
  articles: PublicArticleCard[];
};

export function ShortNews({ articles }: Props) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <div className="site-container-fluid shortNewsfather" id="short-news">
      <div className="shortNewsTitleDiv">
        <h3 className="heading-with-icon heading-with-icon--on-accent">
          <IconNewsFlash size={22} className="heading-with-icon__glyph" />
          <span>اخبار کوتاه</span>
        </h3>
      </div>
      <div className="site-container shortNews">
        <div className="shortNews-grid">
          {articles.slice(0, 8).map((article) => (
            <Link key={article.id} href={articleHref(article.id, article.title)} className="item">
              <div className="imgbox">
                <ArticleNewsThumbnail
                  src={article.featuredImage}
                  alt={article.title}
                  hasVideo={article.hasVideo}
                  fill
                  sizes="(max-width: 768px) 50vw, 200px"
                />
              </div>
              <div className="bodyText">
                <h3>{article.title}</h3>
                {article.excerpt ? <p>{article.excerpt}</p> : null}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
