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
import { sanitizeArticleHtmlForStorage } from '@/lib/sanitize-html';
import { userFacingApiError } from '@/lib/api/user-facing-error';
import { generateArticleSlug } from '@/lib/url/generate-article-slug';

function actionErrorRedirect(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

function isNextRedirect(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'digest' in error &&
    typeof (error as { digest: unknown }).digest === 'string' &&
    (error as { digest: string }).digest.startsWith('NEXT_REDIRECT')
  );
}

async function sanitizeContentOrRedirect(rawContent: string, errorPath: string): Promise<string> {
  try {
    const content = await sanitizeArticleHtmlForStorage(rawContent);
    const text = content.replace(/<[^>]+>/g, '').replace(/&nbsp;/gi, ' ').trim();
    if (!text) {
      actionErrorRedirect(errorPath, 'متن مطلب را وارد کنید.');
    }
    return content;
  } catch (error) {
    if (isNextRedirect(error)) {
      throw error;
    }
    actionErrorRedirect(errorPath, 'پردازش متن مطلب ممکن نشد. دوباره تلاش کنید.');
  }
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
  if (!title) {
    actionErrorRedirect('/admin/articles/new', 'عنوان مطلب الزامی است.');
  }
  const slug =
    String(formData.get('slug') ?? '').trim() || generateArticleSlug(title);
  const rawContent = String(formData.get('content') ?? '').trim();
  const content = await sanitizeContentOrRedirect(rawContent, '/admin/articles/new');
  const excerpt = String(formData.get('excerpt') ?? '').trim();
  const seoTitle = String(formData.get('seoTitle') ?? '').trim();
  const seoDescription = String(formData.get('seoDescription') ?? '').trim();
  const categoryIds = formData.getAll('categoryIds').map(String).filter(Boolean);
  const tagIds = formData.getAll('tagIds').map(String).filter(Boolean);
  const isHero = formData.get('isHero') === '1';
  const isFeatured = formData.get('isFeatured') === '1';
  const isBreaking = formData.get('isBreaking') === '1';
  let hasVideo: boolean;
  let videoUrl: string | null;
  try {
    ({ hasVideo, videoUrl } = await resolveArticleVideoFromForm(formData));
  } catch (error) {
    if (isNextRedirect(error)) {
      throw error;
    }
    actionErrorRedirect(
      '/admin/articles/new',
      userFacingApiError(error, 'بارگذاری ویدیو ممکن نشد. اندازه و نوع فایل را بررسی کنید.'),
    );
  }

  let featuredImage: string;
  try {
    featuredImage = await resolveFeaturedImageFromForm(formData);
  } catch (error) {
    if (isNextRedirect(error)) {
      throw error;
    }
    actionErrorRedirect(
      '/admin/articles/new',
      userFacingApiError(error, 'بارگذاری تصویر ممکن نشد. اندازه و نوع فایل را بررسی کنید.'),
    );
  }

  const payload: Record<string, unknown> = {
    title,
    slug,
    content,
    excerpt: excerpt || null,
    seoTitle: seoTitle || null,
    seoDescription: seoDescription || null,
    featuredImage,
    isHero,
    isFeatured,
    isBreaking,
    hasVideo,
  };
  if (categoryIds.length > 0) {
    payload.categoryIds = categoryIds;
  }
  if (tagIds.length > 0) {
    payload.tagIds = tagIds;
  }
  if (hasVideo) {
    payload.videoUrl = videoUrl;
  }

  let article;
  try {
    article = await createAdminArticle(payload);
  } catch (error) {
    if (isNextRedirect(error)) {
      throw error;
    }
    if (process.env.NODE_ENV !== 'production') {
      console.error('[createArticle]', error);
    }
    actionErrorRedirect(
      '/admin/articles/new',
      userFacingApiError(
        error,
        'ثبت مطلب ممکن نشد. ورودی‌ها را بررسی کنید و دوباره تلاش کنید.',
      ),
    );
  }

  revalidatePath('/admin/articles');
  redirect(`/admin/articles/${article.id}?created=1`);
}

export async function updateArticleAction(id: number, formData: FormData) {
  const title = String(formData.get('title') ?? '').trim();
  const slug = String(formData.get('slug') ?? '').trim();
  const rawContent = String(formData.get('content') ?? '').trim();
  const content = await sanitizeContentOrRedirect(rawContent, `/admin/articles/${id}`);
  const excerpt = String(formData.get('excerpt') ?? '').trim();
  const seoTitle = String(formData.get('seoTitle') ?? '').trim();
  const seoDescription = String(formData.get('seoDescription') ?? '').trim();
  const categoryIds = formData.getAll('categoryIds').map(String).filter(Boolean);
  const tagIds = formData.getAll('tagIds').map(String).filter(Boolean);
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
      ...(slug ? { slug } : {}),
      content,
      excerpt: excerpt || null,
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
      featuredImage,
      ...(categoryIds.length > 0 ? { categoryIds } : {}),
      ...(tagIds.length > 0 ? { tagIds } : {}),
      isHero,
      isFeatured,
      isBreaking,
      hasVideo,
      ...(hasVideo ? { videoUrl } : {}),
    });
  } catch (error) {
    if (isNextRedirect(error)) {
      throw error;
    }
    actionErrorRedirect(
      `/admin/articles/${id}`,
      userFacingApiError(
        error,
        'ذخیره مطلب ممکن نشد. ورودی‌ها را بررسی کنید و دوباره تلاش کنید.',
      ),
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
