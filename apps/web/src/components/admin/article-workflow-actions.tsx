import {
  archiveArticleAction,
  deleteArticleAction,
  publishArticleAction,
  setFeaturedArticleAction,
} from '@/app/admin/(cms)/articles/actions';
import { FeaturedBadge, StatusBadge } from './status-badge';
import { ConfirmSubmit } from './confirm-submit';
import { SubmitButton } from './submit-button';

type ArticleWorkflowActionsProps = {
  articleId: number;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  featured: boolean;
};

export function ArticleWorkflowActions({
  articleId,
  status,
  featured,
}: ArticleWorkflowActionsProps) {
  const publishAction = publishArticleAction.bind(null, articleId);
  const archiveAction = archiveArticleAction.bind(null, articleId);
  const deleteAction = deleteArticleAction.bind(null, articleId);
  const featureAction = setFeaturedArticleAction.bind(null, articleId, true);
  const unfeatureAction = setFeaturedArticleAction.bind(null, articleId, false);

  return (
    <div className="card workflow-bar">
      <div className="workflow-bar__meta">
        <StatusBadge status={status} />
        {featured ? <FeaturedBadge /> : null}
      </div>
      <div className="workflow-bar__actions">
        {status !== 'published' ? (
          <form action={publishAction}>
            <SubmitButton variant="primary" pendingLabel="در حال انتشار…">
              انتشار
            </SubmitButton>
          </form>
        ) : null}
        {status === 'published' ? (
          <form action={archiveAction}>
            <SubmitButton variant="secondary" pendingLabel="در حال بایگانی…">
              بایگانی
            </SubmitButton>
          </form>
        ) : null}
        {status === 'published' ? (
          featured ? (
            <form action={unfeatureAction}>
              <SubmitButton variant="secondary" pendingLabel="در حال به‌روزرسانی…">
                حذف از ویژه
              </SubmitButton>
            </form>
          ) : (
            <form action={featureAction}>
              <SubmitButton variant="secondary" pendingLabel="در حال به‌روزرسانی…">
                علامت‌گذاری ویژه
              </SubmitButton>
            </form>
          )
        ) : null}
        <form action={deleteAction}>
          <ConfirmSubmit confirmMessage="این مطلب برای همیشه حذف شود؟ این کار قابل بازگشت نیست.">
            حذف
          </ConfirmSubmit>
        </form>
      </div>
    </div>
  );
}
