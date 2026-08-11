import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  ArticleSidebar,
  Breadcrumbs,
} from '@/components/site/listing';
import { SiteArticleImage } from '@/components/site/site-article-image';
import { ArticleBodyClient } from '@/components/site/article-body.client';
import { ArticleVideoPlayer } from '@/components/site/article-video-player';
import { ApiError } from '@/lib/api/client';
import {
  fetchArticleBySlug,
  fetchLatestArticles,
} from '@/lib/api/public-articles';
import { formatFaDate } from '@/lib/format';
import {
  ApiUnavailableNotice,
  isApiUnavailableError,
} from '@/components/site/api-unavailable-notice';

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const article = await fetchArticleBySlug(slug);
    return {
      title: article.seoTitle ?? article.title,
      description: article.seoDescription ?? article.excerpt ?? undefined,
      openGraph: {
        locale: 'fa_IR',
        type: 'article',
        title: article.seoTitle ?? article.title,
        description: article.seoDescription ?? article.excerpt ?? undefined,
        images: article.featuredImage ? [article.featuredImage] : undefined,
      },
    };
  } catch {
    return { title: 'خبر' };
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;

  try {
    const [article, latest] = await Promise.all([
      fetchArticleBySlug(slug),
      fetchLatestArticles({ limit: 8 }),
    ]);

    const categories = article.categories;
    const tags = article.tags;

    return (
      <div className="site-container-fluid blog-page">
        <Breadcrumbs
          items={[
            { label: 'خانه', href: '/' },
            ...(categories[0]
              ? [{ label: categories[0].name, href: `/category/${categories[0].slug}` }]
              : []),
            { label: article.title },
          ]}
        />

        <div className="blog-layout">
          <article className="blog-detail-inner">
            <div className="blog-pic">
              <SiteArticleImage
                src={article.featuredImage}
                alt={article.title}
                width={1200}
                height={675}
                className="site-media-cover blog-pic__image"
                sizes="(max-width: 768px) 100vw, 70vw"
                priority
              />
            </div>
            {article.hasVideo && article.videoUrl ? (
              <ArticleVideoPlayer url={article.videoUrl} title={article.title} />
            ) : null}
            <div className="meta">
              <span className="sender">{article.author.displayName}</span>
              <span className="date">{formatFaDate(article.publishedAt)}</span>
            </div>
            <div className="description">
              <h1>{article.title}</h1>
              {article.excerpt ? <p>{article.excerpt}</p> : null}
              <ArticleBodyClient html={article.content} />
            </div>
          </article>

          <ArticleSidebar
            related={latest.data.filter((item) => item.id !== article.id)}
            categories={categories}
            tags={tags}
          />
        </div>
      </div>
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    if (isApiUnavailableError(error)) {
      return <ApiUnavailableNotice error={error} />;
    }
    throw error;
  }
}
