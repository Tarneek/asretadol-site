import Link from 'next/link';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { DashboardViewsChart } from '@/components/admin/dashboard-views-chart';
import { fetchAdminDashboardStats, fetchAdminViewsChartSafe } from '@/lib/api/admin-articles';
import { listAdminCategories } from '@/lib/api/admin-categories';
import { listAdminTags } from '@/lib/api/admin-tags';

export async function AdminDashboardView() {
  const [stats, viewsChartResult, categories, tags] = await Promise.all([
    fetchAdminDashboardStats(),
    fetchAdminViewsChartSafe(14),
    listAdminCategories(),
    listAdminTags(),
  ]);
  const { chart, unavailable: chartUnavailable } = viewsChartResult;

  const statCards = [
    { label: 'کل مطالب', value: stats.totalArticles, accent: 'indigo' as const },
    { label: 'بازدید کل', value: stats.totalViews, accent: 'sky' as const },
    { label: 'پیش‌نویس', value: stats.draftCount, accent: 'slate' as const },
    { label: 'منتشرشده', value: stats.publishedCount, accent: 'emerald' as const },
    { label: 'زمان‌بندی', value: stats.scheduledCount, accent: 'amber' as const },
    { label: 'استوری فعال', value: stats.activeStories, accent: 'violet' as const },
    { label: 'دسته‌بندی', value: categories.length, accent: 'blue' as const },
    { label: 'برچسب', value: tags.length, accent: 'coral' as const },
  ];

  return (
    <>
      <AdminPageHeader
        title="داشبورد تحریریه"
        description="آمار مطالب، روند بازدید و دسترسی سریع به بخش‌های تحریریه."
      />

      <div className="dashboard-layout">
        <div className="dashboard-stats-grid">
          {statCards.map((stat) => (
            <div key={stat.label} className={`stat-card stat-card--${stat.accent}`}>
              <p className="stat-card__label">{stat.label}</p>
              <p className="stat-card__value">{stat.value.toLocaleString('fa-IR')}</p>
            </div>
          ))}
        </div>

        <DashboardViewsChart chart={chart} unavailable={chartUnavailable} />
      </div>

      <section className="dashboard-quick-section" aria-labelledby="dashboard-quick-access-title">
        <h2 id="dashboard-quick-access-title" className="section-title">
          دسترسی سریع
        </h2>
        <div className="quick-links">
          <Link href="/admin/articles/new" className="quick-link">
            <p className="quick-link__title">مطلب جدید</p>
            <p className="quick-link__desc">ثبت پیش‌نویس با گزینه‌های سرتیتر، ویژه یا فوری.</p>
          </Link>
          <Link href="/admin/articles" className="quick-link">
            <p className="quick-link__title">مدیریت مطالب</p>
            <p className="quick-link__desc">فیلتر بر اساس وضعیت، دسته یا جستجو.</p>
          </Link>
          <Link href="/admin/stories" className="quick-link">
            <p className="quick-link__title">استوری‌ها</p>
            <p className="quick-link__desc">
              {stats.activeStories.toLocaleString('fa-IR')} استوری فعال در ریل صفحهٔ اصلی.
            </p>
          </Link>
          <Link href="/admin/categories" className="quick-link">
            <p className="quick-link__title">دسته‌بندی‌ها</p>
            <p className="quick-link__desc">
              {categories.length.toLocaleString('fa-IR')} موضوع تعریف‌شده.
            </p>
          </Link>
        </div>
      </section>
    </>
  );
}
