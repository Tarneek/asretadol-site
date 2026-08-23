'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { uploadAdminArticleImage } from '@/lib/api/admin-articles';
import {
  createAdminAdvertisement,
  deleteAdminAdvertisement,
  updateAdminAdvertisement,
} from '@/lib/api/admin-advertisements';

function errorRedirect(message: string): never {
  redirect(`/admin/advertisements?error=${encodeURIComponent(message)}`);
}

function parseIsoDatetime(value: FormDataEntryValue | null): string | null {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) {
    return null;
  }
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid date');
  }
  return date.toISOString();
}

function readCommonFields(formData: FormData) {
  return {
    title: String(formData.get('title') ?? '').trim(),
    linkUrl: String(formData.get('linkUrl') ?? '').trim(),
    placement: String(formData.get('placement') ?? 'ad-slot') as 'ad-slot' | 'ad-banner',
    slotIndex: Number(formData.get('slotIndex') ?? 0),
    sortOrder: Number(formData.get('sortOrder') ?? 0),
    isActive: formData.get('isActive') === 'on',
    rotationEnabled: formData.get('rotationEnabled') === 'on',
    rotationIntervalSeconds: Number(formData.get('rotationIntervalSeconds') ?? 8),
    startsAt: parseIsoDatetime(formData.get('startsAt')),
    endsAt: parseIsoDatetime(formData.get('endsAt')),
  };
}

async function resolveImageFromForm(
  formData: FormData,
  fallback?: string | null,
): Promise<string> {
  const file = formData.get('imageFile');
  if (file instanceof File && file.size > 0) {
    return uploadAdminArticleImage(file);
  }

  const imageUrl = String(formData.get('imageUrl') ?? '').trim();
  if (imageUrl) {
    return imageUrl;
  }

  if (fallback?.trim()) {
    return fallback.trim();
  }

  throw new Error('Image required');
}

export async function createAdvertisementAction(formData: FormData) {
  let common;
  try {
    common = readCommonFields(formData);
  } catch {
    errorRedirect('تاریخ شروع یا پایان نامعتبر است.');
  }

  if (!common.title || !common.linkUrl) {
    errorRedirect('عنوان و لینک مقصد الزامی است.');
  }

  let imageUrl: string;
  try {
    imageUrl = await resolveImageFromForm(formData);
  } catch {
    errorRedirect('بارگذاری تصویر تبلیغ ممکن نشد. فایل معتبر انتخاب کنید.');
  }

  try {
    await createAdminAdvertisement({
      ...common,
      imageUrl,
    });
  } catch {
    errorRedirect('ثبت تبلیغ ممکن نشد.');
  }

  revalidatePath('/admin/advertisements');
  revalidatePath('/');
  redirect('/admin/advertisements?created=1');
}

export async function updateAdvertisementAction(
  id: string,
  existingImageUrl: string,
  formData: FormData,
) {
  let common;
  try {
    common = readCommonFields(formData);
  } catch {
    errorRedirect('تاریخ شروع یا پایان نامعتبر است.');
  }

  if (!common.title || !common.linkUrl) {
    errorRedirect('عنوان و لینک مقصد الزامی است.');
  }

  let imageUrl: string;
  try {
    imageUrl = await resolveImageFromForm(formData, existingImageUrl);
  } catch {
    errorRedirect('بارگذاری تصویر تبلیغ ممکن نشد. فایل معتبر انتخاب کنید.');
  }

  try {
    await updateAdminAdvertisement(id, {
      ...common,
      imageUrl,
    });
  } catch {
    errorRedirect('به‌روزرسانی تبلیغ ممکن نشد.');
  }

  revalidatePath('/admin/advertisements');
  revalidatePath('/');
  redirect('/admin/advertisements?saved=1');
}

export async function deleteAdvertisementAction(id: string) {
  try {
    await deleteAdminAdvertisement(id);
  } catch {
    errorRedirect('حذف تبلیغ ممکن نشد.');
  }

  revalidatePath('/admin/advertisements');
  revalidatePath('/');
  redirect('/admin/advertisements?deleted=1');
}
