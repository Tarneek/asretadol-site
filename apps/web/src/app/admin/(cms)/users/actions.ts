'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  createAdminUser,
  deleteAdminUser,
  updateAdminUser,
} from '@/lib/api/admin-users';
import { normalizeIranianMobile } from '@/lib/iranian-mobile';

function actionErrorRedirect(message: string): never {
  redirect(`/admin/users?error=${encodeURIComponent(message)}`);
}

export async function createUserAction(formData: FormData) {
  const mobileRaw = String(formData.get('mobile') ?? '');
  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');
  const displayName = String(formData.get('displayName') ?? '').trim();
  const role = String(formData.get('role') ?? 'author');
  const isActive = formData.get('isActive') === '1';

  const mobile = normalizeIranianMobile(mobileRaw);
  if (!mobile) {
    actionErrorRedirect('شماره موبایل معتبر نیست. فرمت صحیح: 09xxxxxxxxx');
  }
  if (password.length < 8) {
    actionErrorRedirect('رمز عبور باید حداقل ۸ کاراکتر باشد.');
  }
  if (password !== confirmPassword) {
    actionErrorRedirect('رمز عبور و تکرار آن یکسان نیستند.');
  }

  try {
    await createAdminUser({
      mobile,
      password,
      displayName: displayName || mobile,
      role,
      isActive,
    });
  } catch {
    actionErrorRedirect('ثبت کاربر ممکن نشد. شماره تکراری یا ورودی نامعتبر است.');
  }

  revalidatePath('/admin/users');
  redirect('/admin/users?created=1');
}

export async function updateUserPasswordAction(id: string, formData: FormData) {
  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');
  const displayName = String(formData.get('displayName') ?? '').trim();
  const role = String(formData.get('role') ?? '');
  const isActive = formData.get('isActive') === '1';

  if (password) {
    if (password.length < 8) {
      actionErrorRedirect('رمز عبور باید حداقل ۸ کاراکتر باشد.');
    }
    if (password !== confirmPassword) {
      actionErrorRedirect('رمز عبور و تکرار آن یکسان نیستند.');
    }
  }

  try {
    await updateAdminUser(id, {
      ...(password ? { password } : {}),
      ...(displayName ? { displayName } : {}),
      ...(role ? { role } : {}),
      isActive,
    });
  } catch {
    actionErrorRedirect('ذخیره تغییرات کاربر ممکن نشد.');
  }

  revalidatePath('/admin/users');
  redirect('/admin/users?saved=1');
}

export async function deleteUserAction(id: string) {
  try {
    await deleteAdminUser(id);
  } catch {
    actionErrorRedirect('حذف کاربر ممکن نشد.');
  }

  revalidatePath('/admin/users');
  redirect('/admin/users?deleted=1');
}
