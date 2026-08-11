import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { EmptyState } from '@/components/admin/empty-state';
import { FlashBanner, flashFromSearchParams } from '@/components/admin/flash-banner';
import { TaxonomyCreateForm, TaxonomyRowEditor } from '@/components/admin/taxonomy-forms';
import { getSession } from '@/lib/auth/session';
import { canManageContent } from '@/lib/auth/permissions';
import { listAdminTags } from '@/lib/api/admin-tags';
import { createTagAction, deleteTagAction, updateTagAction } from './actions';

type AdminTagsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminTagsPage({ searchParams }: AdminTagsPageProps) {
  const query = await searchParams;
  const flash = flashFromSearchParams(query);
  const [session, tags] = await Promise.all([getSession(), listAdminTags()]);
  const canManage = session ? canManageContent(session.role) : false;

  return (
    <>
      <AdminPageHeader
        title="برچسب‌ها"
        description="برچسب‌گذاری مطالب برای فیلتر و کشف محتوا در سایت."
      />
      {flash ? <FlashBanner {...flash} /> : null}

      {canManage ? <TaxonomyCreateForm action={createTagAction} entityLabel="برچسب" /> : null}

      {tags.length === 0 ? (
        <EmptyState
          title="برچسبی ثبت نشده"
          message="برچسب بسازید تا خوانندگان مطالب مرتبط را راحت‌تر پیدا کنند."
        />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>نام</th>
                <th>نامک</th>
                <th style={{ width: '40%' }}>{canManage ? 'عملیات' : ''}</th>
              </tr>
            </thead>
            <tbody>
              {tags.map((tag) => {
                const updateAction = updateTagAction.bind(null, tag.id);
                const deleteAction = deleteTagAction.bind(null, tag.id);

                return (
                  <tr key={tag.id}>
                    <td>
                      <strong>{tag.name}</strong>
                    </td>
                    <td className="muted">{tag.slug}</td>
                    <td>
                      {canManage ? (
                        <TaxonomyRowEditor
                          updateAction={updateAction}
                          deleteAction={deleteAction}
                          name={tag.name}
                          entityLabel="برچسب"
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
