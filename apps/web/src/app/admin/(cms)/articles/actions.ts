'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  archiveAdminArticle,
  createAdminArticle,
  deleteAdminArticle,
  publishAdminArticle,
  setAdminArticleFeatured,
  updateAdminArticle,
  uploadAdminArticleImage,
  uploadAdminArticleVideo,
} from '@/lib/api/admin-articles';
import { NEWS_PLACEHOLDER_IMAGE_PATH } from '@/lib/format';

function actionErrorRedirect(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

async function resolveFeaturedImageFromForm(
  formData: FormData,
  fallback?: string | null,
): Promise<string> {
  const file = formData.get('featuredImageFile');
  if (file instanceof File && file.size > 0) {
    return await uploadAdminArticleImage(file);
  }

  const path = String(formData.get('featuredImage') ?? '').trim();
  if (path) {
    return path;
  }

  return fallback?.trim() || NEWS_PLACEHOLDER_IMAGE_PATH;
}

async function resolveArticleVideoFromForm(
  formData: FormData,
  fallback?: string | null,
): Promise<{ hasVideo: boolean; videoUrl: string | null }> {
  const hasVideo = formData.get('hasVideo') === '1';
  if (!hasVideo) {
    return { hasVideo: false, videoUrl: null };
  }

  const file = formData.get('videoFile');
  if (file instanceof File && file.size > 0) {
    const path = await uploadAdminArticleVideo(file);
    return { hasVideo: true, videoUrl: path };
  }

  const videoUrl = String(formData.get('videoUrl') ?? '').trim();
  if (videoUrl) {
    return { hasVideo: true, videoUrl };
  }

  if (fallback?.trim()) {
    return { hasVideo: true, videoUrl: fallback.trim() };
  }

  return { hasVideo: true, videoUrl: null };
}

export async function createArticleAction(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim();
  const content = String(formData.get('content') ?? '').trim();
  const excerpt = String(formData.get('excerpt') ?? '').trim();
  const seoTitle = String(formData.get('seoTitle') ?? '').trim();
  const seoDescription = String(formData.get('seoDescription') ?? '').trim();
  const categoryIds = formData.getAll('categoryIds').map(String);
  const tagIds = formData.getAll('tagIds').map(String);
  const isHero = formData.get('isHero') === '1';
  const isFeatured = formData.get('isFeatured') === '1';
  const isBreaking = formData.get('isBreaking') === '1';
  let hasVideo: boolean;
  let videoUrl: string | null;
  try {
    ({ hasVideo, videoUrl } = await resolveArticleVideoFromForm(formData));
  } catch {
    actionErrorRedirect(
      '/admin/articles/new',
      'بارگذاری ویدیو ممکن نشد. اندازه و نوع فایل را بررسی کنید.',
    );
  }

  let featuredImage: string;
  try {
    featuredImage = await resolveFeaturedImageFromForm(formData);
  } catch {
    actionErrorRedirect(
      '/admin/articles/new',
      'بارگذاری تصویر ممکن نشد. اندازه و نوع فایل را بررسی کنید.',
    );
  }

  let article;
  try {
    article = await createAdminArticle({
      title,
      content,
      excerpt: excerpt || null,
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
      featuredImage,
      categoryIds,
      tagIds,
      isHero,
      isFeatured,
      isBreaking,
      hasVideo,
      videoUrl,
    });
  } catch {
    actionErrorRedirect(
      '/admin/articles/new',
      'ثبت مطلب ممکن نشد. ورودی‌ها را بررسی کنید و دوباره تلاش کنید.',
    );
  }

  revalidatePath('/admin/articles');
  redirect(`/admin/articles/${article.id}?created=1`);
}

export async function updateArticleAction(id: number, formData: FormData) {
  const title = String(formData.get('title') ?? '').trim();
  const content = String(formData.get('content') ?? '').trim();
  const excerpt = String(formData.get('excerpt') ?? '').trim();
  const seoTitle = String(formData.get('seoTitle') ?? '').trim();
  const seoDescription = String(formData.get('seoDescription') ?? '').trim();
  const categoryIds = formData.getAll('categoryIds').map(String);
  const tagIds = formData.getAll('tagIds').map(String);
  const isHero = formData.get('isHero') === '1';
  const isFeatured = formData.get('isFeatured') === '1';
  const isBreaking = formData.get('isBreaking') === '1';
  const existingVideo = String(formData.get('videoUrl') ?? '').trim();
  let hasVideo: boolean;
  let videoUrl: string | null;
  try {
    ({ hasVideo, videoUrl } = await resolveArticleVideoFromForm(
      formData,
      existingVideo || undefined,
    ));
  } catch {
    actionErrorRedirect(
      `/admin/articles/${id}`,
      'بارگذاری ویدیو ممکن نشد. اندازه و نوع فایل را بررسی کنید.',
    );
  }
  const existingPath = String(formData.get('featuredImage') ?? '').trim();

  let featuredImage: string;
  try {
    featuredImage = await resolveFeaturedImageFromForm(formData, existingPath);
  } catch {
    actionErrorRedirect(
      `/admin/articles/${id}`,
      'بارگذاری تصویر ممکن نشد. اندازه و نوع فایل را بررسی کنید.',
    );
  }

  try {
    await updateAdminArticle(id, {
      title,
      content,
      excerpt: excerpt || null,
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
      featuredImage,
      categoryIds,
      tagIds,
      isHero,
      isFeatured,
      isBreaking,
      hasVideo,
      videoUrl,
    });
  } catch {
    actionErrorRedirect(
      `/admin/articles/${id}`,
      'ذخیره مطلب ممکن نشد. ورودی‌ها را بررسی کنید و دوباره تلاش کنید.',
    );
  }

  revalidatePath('/admin/articles');
  revalidatePath(`/admin/articles/${id}`);
  redirect(`/admin/articles/${id}?saved=1`);
}

export async function publishArticleAction(id: number) {
  try {
    await publishAdminArticle(id);
  } catch {
    actionErrorRedirect(`/admin/articles/${id}`, 'انتشار مطلب ممکن نشد.');
  }
  revalidatePath('/admin/articles');
  revalidatePath(`/admin/articles/${id}`);
  redirect(`/admin/articles/${id}?saved=1`);
}

export async function archiveArticleAction(id: number) {
  try {
    await archiveAdminArticle(id);
  } catch {
    actionErrorRedirect(`/admin/articles/${id}`, 'بایگانی مطلب ممکن نشد.');
  }
  revalidatePath('/admin/articles');
  revalidatePath(`/admin/articles/${id}`);
  redirect(`/admin/articles/${id}?saved=1`);
}

export async function setFeaturedArticleAction(id: number, featured: boolean) {
  try {
    await setAdminArticleFeatured(id, featured);
  } catch {
    actionErrorRedirect(
      `/admin/articles/${id}`,
      featured ? 'علامت‌گذاری ویژه ممکن نشد.' : 'حذف از ویژه ممکن نشد.',
    );
  }
  revalidatePath('/admin/articles');
  revalidatePath(`/admin/articles/${id}`);
  redirect(`/admin/articles/${id}?saved=1`);
}

export async function deleteArticleAction(id: number) {
  try {
    await deleteAdminArticle(id);
  } catch {
    actionErrorRedirect(`/admin/articles/${id}`, 'حذف مطلب ممکن نشد.');
  }
  revalidatePath('/admin/articles');
  redirect('/admin/articles?deleted=1');
}
