import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { EmptyState } from '@/components/admin/empty-state';
import { FlashBanner, flashFromSearchParams } from '@/components/admin/flash-banner';
import { UserCreateForm, UserRowEditor } from '@/components/admin/user-management-forms';
import { getSession } from '@/lib/auth/session';
import { listAdminUsers } from '@/lib/api/admin-users';
import { adminRoleLabel } from '@/lib/admin-labels';
import { formatFaDate } from '@/lib/format';
import {
  createUserAction,
  deleteUserAction,
  updateUserPasswordAction,
} from './actions';

type AdminUsersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const query = await searchParams;
  const flash = flashFromSearchParams(query);
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    return (
      <>
        <AdminPageHeader title="مدیریت کاربران" description="فقط مدیران به این بخش دسترسی دارند." />
        <EmptyState title="دسترسی محدود" message="برای مدیریت کاربران با حساب مدیر وارد شوید." />
      </>
    );
  }

  const users = await listAdminUsers();

  return (
    <>
      <AdminPageHeader
        title="مدیریت کاربران"
        description="افزودن کاربر، تغییر رمز عبور و مدیریت وضعیت حساب‌های پنل."
      />
      {flash ? <FlashBanner {...flash} /> : null}

      <UserCreateForm action={createUserAction} />

      {users.length === 0 ? (
        <EmptyState title="کاربری ثبت نشده" message="اولین کاربر را از فرم بالا اضافه کنید." />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>شماره موبایل</th>
                <th>نام کاربری</th>
                <th>نقش</th>
                <th>تاریخ ثبت</th>
                <th>وضعیت</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const updateAction = updateUserPasswordAction.bind(null, user.id);
                const deleteAction = deleteUserAction.bind(null, user.id);
                return (
                  <tr key={user.id}>
                    <td dir="ltr" style={{ textAlign: 'right' }}>
                      {user.mobile}
                    </td>
                    <td>
                      <strong>{user.displayName}</strong>
                    </td>
                    <td>{adminRoleLabel(user.role)}</td>
                    <td>{formatFaDate(user.createdAt)}</td>
                    <td>
                      <span className={`badge ${user.isActive ? 'badge--published' : 'badge--draft'}`}>
                        {user.isActive ? 'فعال' : 'غیرفعال'}
                      </span>
                    </td>
                    <td>
                      <UserRowEditor
                        user={user}
                        updateAction={updateAction}
                        deleteAction={deleteAction}
                        canDelete={user.id !== session.id}
                      />
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
