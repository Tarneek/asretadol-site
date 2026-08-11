import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { EmptyState } from '@/components/admin/empty-state';
import { FlashBanner, flashFromSearchParams } from '@/components/admin/flash-banner';
import { TaxonomyCreateForm, TaxonomyRowEditor } from '@/components/admin/taxonomy-forms';
import { getSession } from '@/lib/auth/session';
import { canManageContent } from '@/lib/auth/permissions';
import { listAdminCategories } from '@/lib/api/admin-categories';
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from './actions';

type AdminCategoriesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminCategoriesPage({ searchParams }: AdminCategoriesPageProps) {
  const query = await searchParams;
  const flash = flashFromSearchParams(query);
  const [session, categories] = await Promise.all([getSession(), listAdminCategories()]);
  const canManage = session ? canManageContent(session.role) : false;

  return (
    <>
      <AdminPageHeader
        title="دسته‌بندی‌ها"
        description="سازمان‌دهی مطالب بر اساس موضوع. نامک از روی نام ساخته می‌شود."
      />
      {flash ? <FlashBanner {...flash} /> : null}

      {canManage ? (
        <TaxonomyCreateForm action={createCategoryAction} entityLabel="دسته" showDescription />
      ) : null}

      {categories.length === 0 ? (
        <EmptyState
          title="دسته‌ای ثبت نشده"
          message="برای گروه‌بندی مطالب در سایت، دسته‌بندی بسازید."
        />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>نام</th>
                <th>نامک</th>
                <th style={{ width: '50%' }}>{canManage ? 'عملیات' : ''}</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => {
                const updateAction = updateCategoryAction.bind(null, category.id);
                const deleteAction = deleteCategoryAction.bind(null, category.id);

                return (
                  <tr key={category.id}>
                    <td>
                      <strong>{category.name}</strong>
                      {category.description ? (
                        <div className="admin-table__meta" style={{ direction: 'rtl', textAlign: 'right' }}>
                          {category.description}
                        </div>
                      ) : null}
                    </td>
                    <td className="muted">{category.slug}</td>
                    <td>
                      {canManage ? (
                        <TaxonomyRowEditor
                          updateAction={updateAction}
                          deleteAction={deleteAction}
                          name={category.name}
                          description={category.description}
                          showDescription
                          entityLabel="دسته"
                        />
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
