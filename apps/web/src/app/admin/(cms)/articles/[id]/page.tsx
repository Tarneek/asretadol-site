import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { ArticleForm } from '@/components/admin/article-form';
import { ArticleWorkflowActions } from '@/components/admin/article-workflow-actions';
import { FlashBanner, flashFromSearchParams } from '@/components/admin/flash-banner';
import { getAdminArticle } from '@/lib/api/admin-articles';
import { listAdminCategories } from '@/lib/api/admin-categories';
import { listAdminTags } from '@/lib/api/admin-tags';
import { getSession } from '@/lib/auth/session';
import { canManageContent } from '@/lib/auth/permissions';
import { updateArticleAction } from '../actions';

type EditArticlePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EditArticlePage({ params, searchParams }: EditArticlePageProps) {
  const { id } = await params;
  const query = await searchParams;
  const flash = flashFromSearchParams(query);
  const session = await getSession();

  try {
    const [article, categories, tags] = await Promise.all([
      getAdminArticle(Number(id)),
      listAdminCategories(),
      listAdminTags(),
    ]);

    const boundUpdate = updateArticleAction.bind(null, Number(id));

    return (
      <>
        <AdminPageHeader
          title="ویرایش مطلب"
          description={article.slug}
          actions={
            <Link href="/admin/articles" className="btn btn--secondary btn--sm">
              بازگشت به فهرست
            </Link>
          }
        />
        {flash ? <FlashBanner {...flash} /> : null}
        {session && canManageContent(session.role) ? (
          <ArticleWorkflowActions
            articleId={Number(id)}
            status={article.status}
            featured={article.featured}
          />
        ) : null}
        <ArticleForm
          article={article}
          categories={categories}
          tags={tags}
          submitLabel="ذخیره تغییرات"
          action={boundUpdate}
        />
      </>
    );
  } catch {
    notFound();
  }
}
