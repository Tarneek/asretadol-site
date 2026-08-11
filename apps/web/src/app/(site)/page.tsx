import type { Metadata } from 'next';
import { AdBanners } from '@/components/home/ad-banners';
import { AnalyticalNews } from '@/components/home/analytical-news';
import { EconomySection } from '@/components/home/economy-section';
import { FeaturedNews } from '@/components/home/featured-news';
import { MarketTicker } from '@/components/home/market-ticker';
import { ShortNews } from '@/components/home/short-news';
import { StoriesRail } from '@/components/home/stories-rail';
import { WorldEconomyCarousel } from '@/components/home/world-economy-carousel';
import { SectionHeader } from '@/components/site/section-header';
import { ArticleListingGrid } from '@/components/site/listing';
import {
  ApiUnavailableNotice,
  isApiUnavailableError,
} from '@/components/site/api-unavailable-notice';
import { ApiError } from '@/lib/api/client';
import { loadHomepageFeeds } from '@/lib/api/public-home';
import { searchPublicArticles } from '@/lib/api/public-articles';
import { formatEnDate, formatFaDate } from '@/lib/format';

export const metadata: Metadata = {
  title: 'خانه',
  description: 'مهم‌ترین اخبار اقتصادی و تحلیلی — عصر تعادل',
  openGraph: {
    locale: 'fa_IR',
    type: 'website',
    title: 'عصر تعادل | پایگاه خبری تحلیلی',
  },
};

type HomePageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const { q } = await searchParams;

  try {
    if (q?.trim()) {
      const result = await searchPublicArticles({ q: q.trim(), limit: 24 });
      return (
        <div className="site-container-fluid blog-page">
          <SectionHeader title={`نتایج جستجو: ${result.query}`} />
          <ArticleListingGrid articles={result.data} />
        </div>
      );
    }

    const { hero, featured, latest, iranEconomy, worldEconomy, analytical, stories } =
      await loadHomepageFeeds();

    const shortNews = latest.slice(0, 8);
    const now = new Date();

    return (
      <div className="site-container-fluid">
        <div className="home-top">
          <StoriesRail stories={stories} />
          <div className="leftPanelFather">
            <SectionHeader
              title="مهم‌ترین اخبار"
              showDate
              dateLabel={`${formatFaDate(now.toISOString())} - ${formatEnDate(now)}`}
            />
            <FeaturedNews hero={hero} featured={featured} latest={latest} />
            <MarketTicker />
          </div>
        </div>

        <SectionHeader title="اخبار اقتصادی ایران" moreHref="/category/iranian-economy" />
        <EconomySection articles={iranEconomy} />

        <ShortNews articles={shortNews} />

        <SectionHeader title="اخبار اقتصادی جهان" moreHref="/category/world-economy" />
        <WorldEconomyCarousel articles={worldEconomy} />

        <SectionHeader title="تحلیل‌های خبری" moreHref="/tag/analysis" />
        <AnalyticalNews articles={analytical} />

        <AdBanners />
      </div>
    );
  } catch (error) {
    if (isApiUnavailableError(error)) {
      return <ApiUnavailableNotice error={error} />;
    }
    if (error instanceof ApiError && error.status >= 500) {
      return <ApiUnavailableNotice error={error} />;
    }
    throw error;
  }
}
