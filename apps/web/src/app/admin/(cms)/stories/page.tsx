import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { ConfirmSubmit } from '@/components/admin/confirm-submit';
import { EmptyState } from '@/components/admin/empty-state';
import { FlashBanner, flashFromSearchParams } from '@/components/admin/flash-banner';
import { StoryMediaFields } from '@/components/admin/story-media-fields';
import { SubmitButton } from '@/components/admin/submit-button';
import { getSession } from '@/lib/auth/session';
import { canManageContent } from '@/lib/auth/permissions';
import { listAdminStories } from '@/lib/api/admin-stories';
import {
  createStoryAction,
  deleteStoryAction,
  updateStoryAction,
} from './actions';

type AdminStoriesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminStoriesPage({ searchParams }: AdminStoriesPageProps) {
  const query = await searchParams;
  const flash = flashFromSearchParams(query);
  const [session, stories] = await Promise.all([getSession(), listAdminStories()]);
  const canManage = session ? canManageContent(session.role) : false;

  return (
    <>
      <AdminPageHeader
        title="استوری‌ها"
        description="مدیریت دایره‌های استوری صفحهٔ اصلی؛ بارگذاری تصویر/ویدیو یا آدرس URL و لینک مقصد اختیاری."
      />
      {flash ? <FlashBanner {...flash} /> : null}

      {canManage ? (
        <form action={createStoryAction} className="card admin-form-stack">
          <div className="admin-form-grid">
            <label className="form-field">
              <span className="form-field__label">عنوان</span>
              <input name="title" required placeholder="مثلاً خبر طلا" />
            </label>
            <StoryMediaFields idPrefix="story-create" />
            <label className="form-field" style={{ gridColumn: '1 / -1' }}>
              <span className="form-field__label">لینک مقصد (اختیاری)</span>
              <input
                name="link"
                type="text"
                dir="ltr"
                inputMode="url"
                placeholder="https://example.com/article"
                autoComplete="off"
              />
            </label>
            <label className="checkbox-field">
              <input name="isActive" type="checkbox" defaultChecked />
              <span>استوری فعال</span>
            </label>
          </div>
          <div className="admin-form-actions">
            <SubmitButton pendingLabel="در حال ایجاد…">ثبت استوری</SubmitButton>
          </div>
        </form>
      ) : null}

      {stories.length === 0 ? (
        <EmptyState
          title="استوری‌ای ثبت نشده"
          message="برای ریل بالای صفحهٔ اصلی، استوری جدید بسازید."
        />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table admin-table--stories">
            <thead>
              <tr>
                <th>استوری</th>
                <th>رسانه</th>
                <th>وضعیت</th>
                <th style={{ width: '52%' }}>{canManage ? 'عملیات' : ''}</th>
              </tr>
            </thead>
            <tbody>
              {stories.map((story) => {
                const updateAction = updateStoryAction.bind(null, story.id, story.mediaUrl);
                const deleteAction = deleteStoryAction.bind(null, story.id);

                return (
                  <tr key={story.id}>
                    <td>
                      <strong>{story.title}</strong>
                      {story.link ? <div className="admin-table__meta">{story.link}</div> : null}
                    </td>
                    <td className="muted">
                      {story.mediaType === 'video' ? 'ویدیو' : 'تصویر'}
                      <div className="admin-table__meta">{story.mediaUrl}</div>
                    </td>
                    <td>
                      <span className={`status-badge ${story.isActive ? 'published' : 'archived'}`}>
                        {story.isActive ? 'فعال' : 'غیرفعال'}
                      </span>
                    </td>
                    <td>
                      {canManage ? (
                        <form action={updateAction} className="admin-form-stack admin-form-stack--tight">
                          <div className="admin-form-grid">
                            <label className="form-field">
                              <span className="form-field__label">عنوان</span>
                              <input name="title" defaultValue={story.title} required />
                            </label>
                            <StoryMediaFields
                              idPrefix={`story-${story.id}`}
                              initialMediaType={story.mediaType}
                              initialMediaUrl={story.mediaUrl}
                            />
                            <label className="form-field" style={{ gridColumn: '1 / -1' }}>
                              <span className="form-field__label">لینک مقصد (اختیاری)</span>
                              <input
                                name="link"
                                type="text"
                                dir="ltr"
                                inputMode="url"
                                defaultValue={story.link ?? ''}
                                placeholder="https://example.com/article"
                                autoComplete="off"
                              />
                            </label>
                            <label className="checkbox-field">
                              <input name="isActive" type="checkbox" defaultChecked={story.isActive} />
                              <span>استوری فعال</span>
                            </label>
                          </div>
                          <div className="admin-form-actions">
                            <SubmitButton pendingLabel="در حال ذخیره…">ذخیره</SubmitButton>
                          </div>
                        </form>
                      ) : null}

                      {canManage ? (
                        <form action={deleteAction} className="admin-inline-form">
                          <ConfirmSubmit
                            confirmMessage="این استوری حذف شود؟"
                            pendingLabel="در حال حذف…"
                          >
                            حذف
                          </ConfirmSubmit>
                        </form>
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
