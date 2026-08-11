import Link from 'next/link';
import { ArticleNewsThumbnail } from '@/components/site/article-news-thumbnail';
import {
  articleHref,
  categoryHref,
  formatFaDate,
  tagHref,
} from '@/lib/format';
import type { PublicArticleCard, PublicCategory, PublicTag } from '@/lib/types/public-api';

type BreadcrumbItem = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="address-bar" aria-label="مسیر صفحه">
      <ul>
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`}>
            {item.href ? <Link href={item.href}>{item.label}</Link> : <span>{item.label}</span>}
            {index < items.length - 1 ? <span> / </span> : null}
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function ArticleListingGrid({ articles }: { articles: PublicArticleCard[] }) {
  if (articles.length === 0) {
    return <p className="site-empty">موردی یافت نشد.</p>;
  }

  return (
    <div className="listing-grid">
      {articles.map((article) => (
        <article key={article.id} className="listing-card">
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
          <span className="date">{formatFaDate(article.publishedAt)}</span>
          <Link href={articleHref(article.id, article.title)}>
            <h2 className="title">{article.title}</h2>
          </Link>
          {article.excerpt ? <p className="text">{article.excerpt}</p> : null}
        </article>
      ))}
    </div>
  );
}

export function ArticleSidebar({
  related,
  categories,
  tags,
}: {
  related: PublicArticleCard[];
  categories?: PublicCategory[];
  tags?: PublicTag[];
}) {
  return (
    <aside className="sidebar">
      <div className="bg">
        <div className="title">
          <h6>آخرین مطالب</h6>
        </div>
        <div className="category-box">
          {related.slice(0, 6).map((article) => (
            <div key={article.id} className="item">
              <Link href={articleHref(article.id, article.title)}>
                <div className="imgbox">
                  <ArticleNewsThumbnail
                    src={article.featuredImage}
                    alt={article.title}
                    hasVideo={article.hasVideo}
                    fill
                    sizes="80px"
                  />
                </div>
                <h3>{article.title}</h3>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {categories && categories.length > 0 ? (
        <div className="bg">
          <div className="title">
            <h6>دسته‌ها</h6>
          </div>
          <div className="tags-box">
            {categories.map((category) => (
              <Link key={category.id} href={categoryHref(category.slug)}>
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {tags && tags.length > 0 ? (
        <div className="bg">
          <div className="title">
            <h6>برچسب‌ها</h6>
          </div>
          <div className="tags-box">
            {tags.map((tag) => (
              <Link key={tag.id} href={tagHref(tag.slug)}>
                #{tag.name}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </aside>
  );
}
