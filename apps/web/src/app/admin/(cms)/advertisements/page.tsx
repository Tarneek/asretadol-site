import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdvertisementFormFields } from '@/components/admin/advertisement-form-fields';
import { ConfirmSubmit } from '@/components/admin/confirm-submit';
import { EmptyState } from '@/components/admin/empty-state';
import { FlashBanner, flashFromSearchParams } from '@/components/admin/flash-banner';
import { SubmitButton } from '@/components/admin/submit-button';
import { getSession } from '@/lib/auth/session';
import { canManageContent } from '@/lib/auth/permissions';
import { listAdminAdvertisements } from '@/lib/api/admin-advertisements';
import { getPlacementLabel } from '@/lib/ad-placements';
import { formatFaJalaliDateTime } from '@/lib/jalali-datetime';
import {
  createAdvertisementAction,
  deleteAdvertisementAction,
  updateAdvertisementAction,
} from './actions';

type AdminAdvertisementsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminAdvertisementsPage({
  searchParams,
}: AdminAdvertisementsPageProps) {
  const query = await searchParams;
  const flash = flashFromSearchParams(query);
  const [session, advertisements] = await Promise.all([
    getSession(),
    listAdminAdvertisements(),
  ]);
  const canManage = session ? canManageContent(session.role) : false;

  return (
    <>
      <AdminPageHeader
        title="مدیریت تبلیغات"
        description="بارگذاری بنر، تعیین جایگاه (ad-slot / ad-banner)، لینک مقصد، زمان‌بندی و چرخش خودکار."
      />
      {flash ? <FlashBanner {...flash} /> : null}

      {canManage ? (
        <form action={createAdvertisementAction} className="card admin-form-stack">
          <div className="admin-form-grid">
            <label className="form-field">
              <span className="form-field__label">عنوان (برای مدیریت و alt)</span>
              <input name="title" required placeholder="مثلاً تبلیغ طلا" />
            </label>
            <label className="form-field">
              <span className="form-field__label">لینک مقصد</span>
              <input
                name="linkUrl"
                type="url"
                dir="ltr"
                required
                placeholder="https://example.com/landing"
              />
            </label>
            <AdvertisementFormFields idPrefix="ad-create" />
          </div>
          <div className="admin-form-actions">
            <SubmitButton pendingLabel="در حال ایجاد…">ثبت تبلیغ</SubmitButton>
          </div>
        </form>
      ) : null}

      {advertisements.length === 0 ? (
        <EmptyState
          title="تبلیغی ثبت نشده"
          message="برای نمایش در صفحهٔ اصلی، یک بنر تبلیغاتی جدید بسازید."
        />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table admin-table--advertisements">
            <thead>
              <tr>
                <th>تبلیغ</th>
                <th>جایگاه</th>
                <th>وضعیت</th>
                <th style={{ width: '52%' }}>{canManage ? 'عملیات' : ''}</th>
              </tr>
            </thead>
            <tbody>
              {advertisements.map((ad) => {
                const updateAction = updateAdvertisementAction.bind(null, ad.id, ad.imageUrl);
                const deleteAction = deleteAdvertisementAction.bind(null, ad.id);

                return (
                  <tr key={ad.id}>
                    <td>
                      <strong>{ad.title}</strong>
                      <div className="admin-table__meta" dir="ltr">
                        {ad.linkUrl}
                      </div>
                    </td>
                    <td className="muted">
                      {getPlacementLabel(ad.placement)}
                      <div className="admin-table__meta">
                        اسلات {ad.slotIndex + 1} · ترتیب {ad.sortOrder}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${ad.isActive ? 'published' : 'archived'}`}>
                        {ad.isActive ? 'فعال' : 'غیرفعال'}
                      </span>
                      <div className="admin-table__meta">
                        از {formatFaJalaliDateTime(ad.startsAt)}
                      </div>
                      <div className="admin-table__meta">
                        تا {formatFaJalaliDateTime(ad.endsAt)}
                      </div>
                    </td>
                    <td>
                      {canManage ? (
                        <form action={updateAction} className="admin-form-stack admin-form-stack--tight">
                          <div className="admin-form-grid">
                            <label className="form-field">
                              <span className="form-field__label">عنوان</span>
                              <input name="title" defaultValue={ad.title} required />
                            </label>
                            <label className="form-field">
                              <span className="form-field__label">لینک مقصد</span>
                              <input
                                name="linkUrl"
                                type="url"
                                dir="ltr"
                                defaultValue={ad.linkUrl}
                                required
                              />
                            </label>
                            <AdvertisementFormFields idPrefix={`ad-${ad.id}`} initial={ad} />
                          </div>
                          <div className="admin-form-actions">
                            <SubmitButton pendingLabel="در حال ذخیره…">ذخیره</SubmitButton>
                          </div>
                        </form>
                      ) : null}

                      {canManage ? (
                        <form action={deleteAction} className="admin-inline-form">
                          <ConfirmSubmit
                            confirmMessage="این تبلیغ حذف شود؟"
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
