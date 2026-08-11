import Link from 'next/link';
import type { PaginationMeta } from '@/lib/types/public-api';

type AdminPaginationProps = {
  meta: PaginationMeta;
  buildHref: (page: number) => string;
};

export function AdminPagination({ meta, buildHref }: AdminPaginationProps) {
  if (meta.totalPages <= 1) {
    return (
      <p className="admin-pagination muted" style={{ marginTop: '1rem' }}>
        {meta.total.toLocaleString('fa-IR')} مورد
      </p>
    );
  }

  const prevPage = meta.page > 1 ? meta.page - 1 : null;
  const nextPage = meta.page < meta.totalPages ? meta.page + 1 : null;

  return (
    <nav className="admin-pagination" aria-label="صفحه‌بندی">
      <span>
        صفحه {meta.page.toLocaleString('fa-IR')} از {meta.totalPages.toLocaleString('fa-IR')} ·{' '}
        {meta.total.toLocaleString('fa-IR')} مورد
      </span>
      <div className="admin-pagination__links">
        {prevPage ? (
          <Link href={buildHref(prevPage)} className="btn btn--secondary btn--sm">
            قبلی
          </Link>
        ) : (
          <span className="btn btn--secondary btn--sm" style={{ opacity: 0.45, pointerEvents: 'none' }}>
            قبلی
          </span>
        )}
        {nextPage ? (
          <Link href={buildHref(nextPage)} className="btn btn--secondary btn--sm">
            بعدی
          </Link>
        ) : (
          <span className="btn btn--secondary btn--sm" style={{ opacity: 0.45, pointerEvents: 'none' }}>
            بعدی
          </span>
        )}
      </div>
    </nav>
  );
}

export function articlesListHref(
  page: number,
  filters: { status?: string; search?: string; categoryId?: string },
) {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.search) params.set('search', filters.search);
  if (filters.categoryId) params.set('categoryId', filters.categoryId);
  if (page > 1) params.set('page', String(page));
  const query = params.toString();
  return query ? `/admin/articles?${query}` : '/admin/articles';
}
