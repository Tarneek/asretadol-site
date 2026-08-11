import Link from 'next/link';
import type { PublicArticleCard } from '@/lib/types/public-api';
import { articleHref } from '@/lib/format';

type ArticleCardProps = {
  article: PublicArticleCard;
};

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="card">
      <h3>
        <Link href={articleHref(article.id, article.title)}>{article.title}</Link>
      </h3>
      {article.excerpt ? <p className="muted">{article.excerpt}</p> : null}
      <p className="muted" style={{ fontSize: '0.875rem' }}>
        {article.author.displayName} · {new Date(article.publishedAt).toLocaleDateString()}
      </p>
      <div>
        {article.categories.map((category) => (
          <Link key={category.id} href={`/category/${category.slug}`} className="pill">
            {category.name}
          </Link>
        ))}
        {article.tags.map((tag) => (
          <Link key={tag.id} href={`/tag/${tag.slug}`} className="pill">
            #{tag.name}
          </Link>
        ))}
      </div>
    </article>
  );
}
