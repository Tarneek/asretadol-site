import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import {
  ArticleSidebar,
  Breadcrumbs,
} from '@/components/site/listing';
import { SiteArticleImage } from '@/components/site/site-article-image';
import { ArticleBodyClient } from '@/components/site/article-body.client';
import { ArticleVideoPlayer } from '@/components/site/article-video-player';
import { ApiError } from '@/lib/api/client';
import {
  fetchArticleById,
  fetchLatestArticles,
} from '@/lib/api/public-articles';
import { generateArticleSlug } from '@/lib/url/generate-article-slug';
import { formatFaDate } from '@/lib/format';
import {
  ApiUnavailableNotice,
  isApiUnavailableError,
} from '@/components/site/api-unavailable-notice';

type NewsArticlePageProps = {
  params: Promise<{ id: string; slug: string }>;
};

function getSiteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return fromEnv || 'http://localhost:3000';
}

export async function generateMetadata({ params }: NewsArticlePageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const article = await fetchArticleById(Number(id));
    const canonicalSlug = generateArticleSlug(article.title);
    const canonicalPath = `/news/${article.id}/${canonicalSlug}`;

    return {
      metadataBase: new URL(getSiteUrl()),
      title: article.seoTitle ?? article.title,
      description: article.seoDescription ?? article.excerpt ?? undefined,
      alternates: {
        canonical: canonicalPath,
      },
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

export default async function NewsArticlePage({ params }: NewsArticlePageProps) {
  const { id, slug } = await params;
  const articleId = Number(id);

  if (!Number.isFinite(articleId) || articleId <= 0) {
    notFound();
  }

  const slugFromUrl = decodeURIComponent(slug);

  try {
    const [article, latest] = await Promise.all([
      fetchArticleById(articleId),
      fetchLatestArticles({ limit: 8 }),
    ]);

    const expectedSlug = generateArticleSlug(article.title);
    if (slugFromUrl !== expectedSlug) {
      redirect(`/news/${article.id}/${expectedSlug}`);
    }

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
    if (error instanceof ApiError && error.status >= 500) {
      return <ApiUnavailableNotice error={error} />;
    }
    throw error;
  }
}

