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
import { userFacingApiError } from '@/lib/api/user-facing-error';
import { revalidateAfterStoryMutation } from '@/lib/cache/site-revalidate';

function errorRedirect(message: string): never {
  redirect(`/admin/stories?error=${encodeURIComponent(message)}`);
}

function readStoryFields(formData: FormData) {
  return {
    title: String(formData.get('title') ?? '').trim(),
    mediaType: (String(formData.get('mediaType') ?? 'image') === 'video'
      ? 'video'
      : 'image') as 'image' | 'video',
    link: String(formData.get('link') ?? '').trim(),
    isActive: formData.get('isActive') === 'on',
  };
}

/**
 * Resolve media for create/update:
 * 1) newly posted file (progressive enhancement / failed client upload retry)
 * 2) `mediaUrl` hidden field (client-side upload or typed URL)
 * 3) existing story media (edit without changing media)
 */
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
  if (mediaUrl && !mediaUrl.startsWith('blob:')) {
    return mediaUrl;
  }

  if (fallback?.trim()) {
    return fallback.trim();
  }

  throw new Error('Story media is required');
}

export async function createStoryAction(formData: FormData) {
  const { title, mediaType, link, isActive } = readStoryFields(formData);
  if (!title) {
    errorRedirect('عنوان استوری الزامی است.');
  }

  let mediaUrl: string;
  try {
    mediaUrl = await resolveStoryMediaFromForm(formData);
  } catch (error) {
    errorRedirect(
      userFacingApiError(
        error,
        'رسانه استوری الزامی است. لینک معتبر وارد کنید یا فایل بارگذاری کنید.',
      ),
    );
  }

  try {
    await createAdminStory({
      title,
      mediaUrl,
      mediaType,
      link: link || null,
      isActive,
    });
  } catch (error) {
    console.error('[createStoryAction]', error);
    errorRedirect(userFacingApiError(error, 'ثبت استوری ممکن نشد.'));
  }

  revalidatePath('/admin/stories');
  revalidateAfterStoryMutation();
  redirect('/admin/stories?created=1');
}

export async function updateStoryAction(
  id: string,
  existingMediaUrl: string,
  formData: FormData,
) {
  const { title, mediaType, link, isActive } = readStoryFields(formData);
  if (!title) {
    errorRedirect('عنوان استوری الزامی است.');
  }

  // Prefer hidden field from the form (always current) over the bound arg
  // (can be stale after a previous media change in the same SSR render).
  const formExisting = String(formData.get('existingMediaUrl') ?? '').trim();
  const fallbackMedia = formExisting || existingMediaUrl;

  let mediaUrl: string;
  try {
    mediaUrl = await resolveStoryMediaFromForm(formData, fallbackMedia);
  } catch (error) {
    errorRedirect(
      userFacingApiError(
        error,
        'رسانه استوری الزامی است. لینک معتبر وارد کنید یا فایل بارگذاری کنید.',
      ),
    );
  }

  try {
    await updateAdminStory(id, {
      title,
      mediaUrl,
      mediaType,
      link: link || null,
      isActive,
    });
  } catch (error) {
    console.error('[updateStoryAction]', error);
    errorRedirect(userFacingApiError(error, 'به‌روزرسانی استوری ممکن نشد.'));
  }

  revalidatePath('/admin/stories');
  revalidateAfterStoryMutation();
  redirect('/admin/stories?saved=1');
}

export async function deleteStoryAction(id: string) {
  try {
    await deleteAdminStory(id);
  } catch (error) {
    console.error('[deleteStoryAction]', error);
    errorRedirect(userFacingApiError(error, 'حذف استوری ممکن نشد.'));
  }

  revalidatePath('/admin/stories');
  revalidateAfterStoryMutation();
  redirect('/admin/stories?deleted=1');
}
