'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createAdminTag, deleteAdminTag, updateAdminTag } from '@/lib/api/admin-tags';

function errorRedirect(message: string): never {
  redirect(`/admin/tags?error=${encodeURIComponent(message)}`);
}

export async function createTagAction(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim();

  try {
    await createAdminTag({ name });
  } catch {
    errorRedirect('ثبت برچسب ممکن نشد.');
  }

  revalidatePath('/admin/tags');
  redirect('/admin/tags?created=1');
}

export async function updateTagAction(id: string, formData: FormData) {
  const name = String(formData.get('name') ?? '').trim();

  try {
    await updateAdminTag(id, { name });
  } catch {
    errorRedirect('به‌روزرسانی برچسب ممکن نشد.');
  }

  revalidatePath('/admin/tags');
  redirect('/admin/tags?saved=1');
}

export async function deleteTagAction(id: string) {
  try {
    await deleteAdminTag(id);
  } catch {
    errorRedirect('حذف برچسب ممکن نشد؛ ممکن است هنوز به مطلبی متصل باشد.');
  }

  revalidatePath('/admin/tags');
  redirect('/admin/tags?deleted=1');
}
