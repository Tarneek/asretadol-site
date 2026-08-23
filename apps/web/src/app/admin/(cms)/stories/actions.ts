'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  uploadAdminArticleImage,
  uploadAdminArticleVideo,
} from '@/lib/api/admin-articles';
import {
  createAdminStory,
  deleteAdminStory,
  updateAdminStory,
} from '@/lib/api/admin-stories';

function errorRedirect(message: string): never {
  redirect(`/admin/stories?error=${encodeURIComponent(message)}`);
}

async function resolveStoryMediaFromForm(
  formData: FormData,
  fallback?: string | null,
): Promise<string> {
  const mediaType = String(formData.get('mediaType') ?? 'image') as 'image' | 'video';
  const file = formData.get('mediaFile');

  if (file instanceof File && file.size > 0) {
    return mediaType === 'video'
      ? await uploadAdminArticleVideo(file)
      : await uploadAdminArticleImage(file);
  }

  const mediaUrl = String(formData.get('mediaUrl') ?? '').trim();
  if (mediaUrl) {
    return mediaUrl;
  }

  if (fallback?.trim()) {
    return fallback.trim();
  }

  throw new Error('Story media is required');
}

export async function createStoryAction(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim();
  const mediaType = String(formData.get('mediaType') ?? 'image') as 'image' | 'video';
  const link = String(formData.get('link') ?? '').trim();
  const isActive = formData.get('isActive') === 'on';

  let mediaUrl: string;
  try {
    mediaUrl = await resolveStoryMediaFromForm(formData);
  } catch {
    errorRedirect('رسانه استوری الزامی است. لینک معتبر وارد کنید یا فایل بارگذاری کنید.');
  }

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

export async function updateStoryAction(
  id: string,
  existingMediaUrl: string,
  formData: FormData,
) {
  const title = String(formData.get('title') ?? '').trim();
  const mediaType = String(formData.get('mediaType') ?? 'image') as 'image' | 'video';
  const link = String(formData.get('link') ?? '').trim();
  const isActive = formData.get('isActive') === 'on';

  let mediaUrl: string;
  try {
    mediaUrl = await resolveStoryMediaFromForm(formData, existingMediaUrl);
  } catch {
    errorRedirect('رسانه استوری الزامی است. لینک معتبر وارد کنید یا فایل بارگذاری کنید.');
  }

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
