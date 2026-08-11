import Link from 'next/link';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { ArticleListFilters } from '@/components/admin/article-list-filters';
import { AdminPagination, articlesListHref } from '@/components/admin/admin-pagination';
import { EmptyState } from '@/components/admin/empty-state';
import { FlashBanner, flashFromSearchParams } from '@/components/admin/flash-banner';
import {
  BreakingBadge,
  FeaturedBadge,
  HeroBadge,
  StatusBadge,
} from '@/components/admin/status-badge';
import { listAdminArticles } from '@/lib/api/admin-articles';
import { listAdminCategories } from '@/lib/api/admin-categories';
import { formatFaDate } from '@/lib/format';

const VALID_STATUSES = new Set(['draft', 'published', 'scheduled', 'archived']);

type AdminArticlesPageProps = {
  searchParams: Promise<{
    page?: string;
    status?: string;
    search?: string;
    categoryId?: string;
    saved?: string;
    created?: string;
    deleted?: string;
    error?: string;
  }>;
};

export default async function AdminArticlesPage({ searchParams }: AdminArticlesPageProps) {
  const params = await searchParams;
  const flash = flashFromSearchParams(params);
  const page = Math.max(1, Number(params.page) || 1);
  const status = params.status && VALID_STATUSES.has(params.status) ? params.status : undefined;
  const search = params.search?.trim() || undefined;
  const categoryId = params.categoryId?.trim() || undefined;

  const [result, categories] = await Promise.all([
    listAdminArticles({
      page,
      limit: 20,
      status,
      search,
      categoryId,
    }),
    listAdminCategories(),
  ]);

  const filters = { status, search, categoryId };
  const hasFilters = Boolean(status || search || categoryId);

  return (
    <>
      <AdminPageHeader
        title="مدیریت مطالب"
        description="ایجاد، ویرایش، انتشار و تعیین جایگاه خبر در صفحهٔ اصلی."
        actions={
          <Link href="/admin/articles/new" className="btn btn--primary">
            مطلب جدید
          </Link>
        }
      />

      {flash ? <FlashBanner {...flash} /> : null}

      <div className="admin-toolbar">
        <ArticleListFilters
          status={status ?? ''}
          search={search ?? ''}
          categoryId={categoryId ?? ''}
          categories={categories}
        />
      </div>

      {result.data.length === 0 ? (
        <EmptyState
          title={hasFilters ? 'مطلبی یافت نشد' : 'هنوز مطلبی ثبت نشده'}
          message={
            hasFilters
              ? 'فیلترها را تغییر دهید یا جستجو را پاک کنید.'
              : 'اولین پیش‌نویس را بنویسید تا کار تحریریه شروع شود.'
          }
          actionLabel={hasFilters ? undefined : 'ثبت مطلب'}
          actionHref={hasFilters ? undefined : '/admin/articles/new'}
        />
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>عنوان</th>
                  <th>وضعیت</th>
                  <th>بازدید</th>
                  <th>به‌روزرسانی</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {result.data.map((article) => (
                  <tr key={article.id}>
                    <td>
                      <Link href={`/admin/articles/${article.id}`} className="admin-table__title">
                        {article.title}
                      </Link>
                      <div className="admin-table__meta">{article.slug}</div>
                    </td>
                    <td>
                      <div className="row-actions">
                        <StatusBadge status={article.status} />
                        {article.isHero ? <HeroBadge /> : null}
                        {article.isFeatured || article.featured ? <FeaturedBadge /> : null}
                        {article.isBreaking ? <BreakingBadge /> : null}
                      </div>
                    </td>
                    <td className="muted" style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {(article.viewsCount ?? 0).toLocaleString('fa-IR')}
                    </td>
                    <td className="muted">{formatFaDate(article.updatedAt)}</td>
                    <td>
                      <div className="admin-table__actions">
                        <Link
                          href={`/admin/articles/${article.id}`}
                          className="btn btn--secondary btn--sm"
                          aria-label={`ویرایش ${article.title}`}
                        >
                          ویرایش
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <AdminPagination meta={result.meta} buildHref={(p) => articlesListHref(p, filters)} />
        </>
      )}
    </>
  );
}
