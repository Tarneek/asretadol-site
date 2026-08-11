'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  createAdminStory,
  deleteAdminStory,
  updateAdminStory,
} from '@/lib/api/admin-stories';

function errorRedirect(message: string): never {
  redirect(`/admin/stories?error=${encodeURIComponent(message)}`);
}

export async function createStoryAction(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim();
  const mediaUrl = String(formData.get('mediaUrl') ?? '').trim();
  const mediaType = String(formData.get('mediaType') ?? 'image') as 'image' | 'video';
  const link = String(formData.get('link') ?? '').trim();
  const isActive = formData.get('isActive') === 'on';

  try {
    await createAdminStory({
      title,
      mediaUrl,
      mediaType,
      link: link || null,
      isActive,
    });
  } catch {
    errorRedirect('ثبت استوری ممکن نشد.');
  }

  revalidatePath('/admin/stories');
  revalidatePath('/');
  redirect('/admin/stories?created=1');
}

export async function updateStoryAction(id: string, formData: FormData) {
  const title = String(formData.get('title') ?? '').trim();
  const mediaUrl = String(formData.get('mediaUrl') ?? '').trim();
  const mediaType = String(formData.get('mediaType') ?? 'image') as 'image' | 'video';
  const link = String(formData.get('link') ?? '').trim();
  const isActive = formData.get('isActive') === 'on';

  try {
    await updateAdminStory(id, {
      title,
      mediaUrl,
      mediaType,
      link: link || null,
      isActive,
    });
  } catch {
    errorRedirect('به‌روزرسانی استوری ممکن نشد.');
  }

  revalidatePath('/admin/stories');
  revalidatePath('/');
  redirect('/admin/stories?saved=1');
}

export async function deleteStoryAction(id: string) {
  try {
    await deleteAdminStory(id);
  } catch {
    errorRedirect('حذف استوری ممکن نشد.');
  }

  revalidatePath('/admin/stories');
  revalidatePath('/');
  redirect('/admin/stories?deleted=1');
}
