import Link from 'next/link';
import { ArticleNewsThumbnail } from '@/components/site/article-news-thumbnail';
import { articleHref, formatFaDate } from '@/lib/format';
import type { PublicArticleCard } from '@/lib/types/public-api';

type Props = {
  articles: PublicArticleCard[];
};

export function EconomySection({ articles }: Props) {
  const [lead, ...rest] = articles;
  if (!lead) {
    return <p className="site-empty">خبری در این بخش نیست.</p>;
  }

  return (
    <div className="site-container egtesadiNews">
      <div className="egtesadiNewsOne">
        <Link href={articleHref(lead.id, lead.title)} className="imgbox">
          <ArticleNewsThumbnail
            src={lead.featuredImage}
            alt={lead.title}
            hasVideo={lead.hasVideo}
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            imageClassName="site-media-cover egtesadiNewsOneImg"
          />
          <div className="coverVideo" />
        </Link>
        <div className="bodyText">
          <Link href={articleHref(lead.id, lead.title)}>
            <h3>{lead.title}</h3>
            {lead.excerpt ? <p>{lead.excerpt}</p> : null}
          </Link>
          <div className="user">
            <span>{lead.author.displayName}</span>
          </div>
        </div>
      </div>

      <div className="egtesadiNewsList">
        {rest.slice(0, 4).map((article) => (
          <div key={article.id} className="item">
            <Link href={articleHref(article.id, article.title)} className="imgbox">
              <ArticleNewsThumbnail
                src={article.featuredImage}
                alt={article.title}
                hasVideo={article.hasVideo}
                fill
                sizes="100px"
              />
              <div className="coverVideo" />
            </Link>
            <div className="bodyText">
              <Link href={articleHref(article.id, article.title)}>
                <h3>{article.title}</h3>
              </Link>
              <div className="datebox">
                <time>{formatFaDate(article.publishedAt)}</time>
                <span> - </span>
                <span>{article.author.displayName}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
