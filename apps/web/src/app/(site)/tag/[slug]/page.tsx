import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  ArticleListingGrid,
  ArticleSidebar,
  Breadcrumbs,
} from '@/components/site/listing';
import { SectionHeader } from '@/components/site/section-header';
import { ApiError } from '@/lib/api/client';
import { fetchLatestArticles, fetchTagArticles } from '@/lib/api/public-articles';
import {
  ApiUnavailableNotice,
  isApiUnavailableError,
} from '@/components/site/api-unavailable-notice';

type TagPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const result = await fetchTagArticles(slug, { limit: 1 });
    return {
      title: `برچسب: ${result.tag.name}`,
      description: `مطالب برچسب‌خورده با ${result.tag.name}`,
      openGraph: { locale: 'fa_IR', type: 'website' },
    };
  } catch {
    return { title: 'برچسب' };
  }
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;

  try {
    const [result, latest] = await Promise.all([
      fetchTagArticles(slug, { limit: 24 }),
      fetchLatestArticles({ limit: 8 }),
    ]);

    return (
      <div className="site-container-fluid blog-page">
        <Breadcrumbs
          items={[
            { label: 'خانه', href: '/' },
            { label: `#${result.tag.name}` },
          ]}
        />
        <SectionHeader title={`#${result.tag.name}`} />
        <div className="blog-layout">
          <ArticleListingGrid articles={result.data} />
          <ArticleSidebar related={latest.data} tags={[result.tag]} />
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
