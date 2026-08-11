import Link from 'next/link';
import type { AdminCategory } from '@/lib/types/admin-api';

type ArticleListFiltersProps = {
  status?: string;
  search?: string;
  categoryId?: string;
  categories: AdminCategory[];
};

const statusOptions = [
  { value: '', label: 'همه وضعیت‌ها' },
  { value: 'draft', label: 'پیش‌نویس' },
  { value: 'published', label: 'منتشرشده' },
  { value: 'scheduled', label: 'زمان‌بندی‌شده' },
  { value: 'archived', label: 'بایگانی' },
];

export function ArticleListFilters({
  status = '',
  search = '',
  categoryId = '',
  categories,
}: ArticleListFiltersProps) {
  return (
    <form method="get" className="admin-filters">
      <div className="form-field">
        <label className="form-field__label" htmlFor="filter-search">
          جستجو
        </label>
        <input
          id="filter-search"
          name="search"
          type="search"
          placeholder="عنوان یا نامک…"
          defaultValue={search}
        />
      </div>
      <div className="form-field">
        <label className="form-field__label" htmlFor="filter-status">
          وضعیت
        </label>
        <select id="filter-status" name="status" defaultValue={status}>
          {statusOptions.map((option) => (
            <option key={option.value || 'all'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="form-field">
        <label className="form-field__label" htmlFor="filter-category">
          دسته‌بندی
        </label>
        <select id="filter-category" name="categoryId" defaultValue={categoryId}>
          <option value="">همه دسته‌ها</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn btn--secondary">
        اعمال فیلتر
      </button>
      {status || search || categoryId ? (
        <Link href="/admin/articles" className="btn btn--ghost btn--sm">
          پاک کردن
        </Link>
      ) : null}
    </form>
  );
}
