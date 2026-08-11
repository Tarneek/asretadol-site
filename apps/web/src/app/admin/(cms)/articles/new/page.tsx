import Link from 'next/link';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { listAdminCategories } from '@/lib/api/admin-categories';
import { listAdminTags } from '@/lib/api/admin-tags';
import { ArticleForm } from '@/components/admin/article-form';
import { FlashBanner, flashFromSearchParams } from '@/components/admin/flash-banner';
import { createArticleAction } from '../actions';

type NewArticlePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewArticlePage({ searchParams }: NewArticlePageProps) {
  const query = await searchParams;
  const flash = flashFromSearchParams(query);
  const [categories, tags] = await Promise.all([listAdminCategories(), listAdminTags()]);

  return (
    <>
      <AdminPageHeader
        title="مطلب جدید"
        description="مطلب به‌صورت پیش‌نویس ذخیره می‌شود؛ انتشار از صفحهٔ ویرایش."
        actions={
          <Link href="/admin/articles" className="btn btn--secondary btn--sm">
            انصراف
          </Link>
        }
      />
      {flash ? <FlashBanner {...flash} /> : null}
      <ArticleForm
        categories={categories}
        tags={tags}
        submitLabel="ثبت پیش‌نویس"
        action={createArticleAction}
      />
    </>
  );
}
