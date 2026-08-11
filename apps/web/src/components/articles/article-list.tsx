import type { PublicArticleCard } from '@/lib/types/public-api';
import { ArticleCard } from './article-card';

type ArticleListProps = {
  articles: PublicArticleCard[];
  emptyMessage?: string;
};

export function ArticleList({
  articles,
  emptyMessage = 'No articles found.',
}: ArticleListProps) {
  if (articles.length === 0) {
    return (
      <div className="state-box">
        <p className="muted" style={{ margin: 0 }}>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="stack">
      {articles.map((article) => <ArticleCard key={article.id} article={article} />)}
    </div>
  );
}
