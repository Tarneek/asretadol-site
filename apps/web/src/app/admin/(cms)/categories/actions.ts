'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  createAdminCategory,
  deleteAdminCategory,
  updateAdminCategory,
} from '@/lib/api/admin-categories';

function errorRedirect(message: string): never {
  redirect(`/admin/categories?error=${encodeURIComponent(message)}`);
}

export async function createCategoryAction(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();

  try {
    await createAdminCategory({
      name,
      description: description || null,
    });
  } catch {
    errorRedirect('ثبت دسته ممکن نشد.');
  }

  revalidatePath('/admin/categories');
  redirect('/admin/categories?created=1');
}

export async function updateCategoryAction(id: string, formData: FormData) {
  const name = String(formData.get('name') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();

  try {
    await updateAdminCategory(id, {
      name,
      description: description || null,
    });
  } catch {
    errorRedirect('به‌روزرسانی دسته ممکن نشد.');
  }

  revalidatePath('/admin/categories');
  redirect('/admin/categories?saved=1');
}

export async function deleteCategoryAction(id: string) {
  try {
    await deleteAdminCategory(id);
  } catch {
    errorRedirect('حذف دسته ممکن نشد؛ ممکن است هنوز به مطلبی متصل باشد.');
  }

  revalidatePath('/admin/categories');
  redirect('/admin/categories?deleted=1');
}
