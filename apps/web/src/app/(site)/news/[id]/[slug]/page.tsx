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
import { absoluteUrl, getSiteUrl } from '@/lib/site-url';
import { formatFaDate } from '@/lib/format';
import {
  ApiUnavailableNotice,
  isApiUnavailableError,
} from '@/components/site/api-unavailable-notice';

type NewsArticlePageProps = {
  params: Promise<{ id: string; slug: string }>;
};

export async function generateMetadata({ params }: NewsArticlePageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const article = await fetchArticleById(Number(id));
    const canonicalSlug = generateArticleSlug(article.title);
    const canonicalPath = `/news/${article.id}/${canonicalSlug}`;
    const canonicalUrl = absoluteUrl(canonicalPath);

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
        url: canonicalUrl,
        title: article.seoTitle ?? article.title,
        description: article.seoDescription ?? article.excerpt ?? undefined,
        images: article.featuredImage
          ? [
              article.featuredImage.startsWith('http')
                ? article.featuredImage
                : absoluteUrl(article.featuredImage),
            ]
          : undefined,
        publishedTime: article.publishedAt,
        modifiedTime: article.updatedAt,
      },
      twitter: {
        card: 'summary_large_image',
        title: article.seoTitle ?? article.title,
        description: article.seoDescription ?? article.excerpt ?? undefined,
        images: article.featuredImage
          ? [
              article.featuredImage.startsWith('http')
                ? article.featuredImage
                : absoluteUrl(article.featuredImage),
            ]
          : undefined,
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
    const articleUrl = absoluteUrl(`/news/${article.id}/${expectedSlug}`);
    const featuredImageUrl = article.featuredImage
      ? article.featuredImage.startsWith('http')
        ? article.featuredImage
        : absoluteUrl(article.featuredImage)
      : undefined;

    const articleJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: article.title,
      description: article.excerpt ?? article.seoDescription ?? undefined,
      datePublished: article.publishedAt,
      dateModified: article.updatedAt,
      author: {
        '@type': 'Person',
        name: article.author.displayName,
      },
      publisher: {
        '@type': 'Organization',
        name: 'نیرا نیوز',
        url: getSiteUrl(),
      },
      mainEntityOfPage: articleUrl,
      url: articleUrl,
      image: featuredImageUrl ? [featuredImageUrl] : undefined,
    };

    return (
      <div className="site-container-fluid blog-page">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
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

