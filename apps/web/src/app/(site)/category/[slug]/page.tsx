import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  ArticleListingGrid,
  ArticleSidebar,
  Breadcrumbs,
} from '@/components/site/listing';
import { SectionHeader } from '@/components/site/section-header';
import { ApiError } from '@/lib/api/client';
import {
  fetchCategoryArticles,
  fetchLatestArticles,
} from '@/lib/api/public-articles';
import {
  ApiUnavailableNotice,
  isApiUnavailableError,
} from '@/components/site/api-unavailable-notice';

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const result = await fetchCategoryArticles(slug, { limit: 1 });
    return {
      title: result.category.name,
      description: result.category.description ?? `اخبار ${result.category.name}`,
      openGraph: { locale: 'fa_IR', type: 'website' },
    };
  } catch {
    return { title: 'دسته' };
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  try {
    const [result, latest] = await Promise.all([
      fetchCategoryArticles(slug, { limit: 24 }),
      fetchLatestArticles({ limit: 8 }),
    ]);

    return (
      <div className="site-container-fluid blog-page">
        <Breadcrumbs
          items={[
            { label: 'خانه', href: '/' },
            { label: result.category.name },
          ]}
        />
        <SectionHeader
          title={result.category.name}
          moreHref={`/category/${result.category.slug}`}
        />
        {result.category.description ? (
          <p className="site-empty" style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
            {result.category.description}
          </p>
        ) : null}
        <div className="blog-layout">
          <ArticleListingGrid articles={result.data} />
          <ArticleSidebar related={latest.data} categories={[result.category]} />
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
