import { ConfirmSubmit } from '@/components/admin/confirm-submit';
import { SubmitButton } from '@/components/admin/submit-button';

type TaxonomyCreateFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  entityLabel: string;
  showDescription?: boolean;
};

export function TaxonomyCreateForm({
  action,
  entityLabel,
  showDescription = false,
}: TaxonomyCreateFormProps) {
  return (
    <form action={action} className="card form-grid" style={{ marginBottom: '1.25rem' }}>
      <h2 style={{ margin: 0, fontSize: '1.05rem' }}>افزودن {entityLabel}</h2>
      <div className="form-grid form-grid--2">
        <div className="form-field">
          <label className="form-field__label" htmlFor={`create-${entityLabel}-name`}>
            نام
          </label>
          <input id={`create-${entityLabel}-name`} name="name" placeholder="نام" required />
        </div>
        {showDescription ? (
          <div className="form-field">
            <label className="form-field__label" htmlFor="create-category-description">
              توضیح
            </label>
            <textarea
              id="create-category-description"
              name="description"
              placeholder="توضیح اختیاری"
              rows={2}
            />
          </div>
        ) : null}
      </div>
      <div>
        <SubmitButton pendingLabel="در حال افزودن…">افزودن {entityLabel}</SubmitButton>
      </div>
    </form>
  );
}

type TaxonomyRowActionsProps = {
  updateAction: (formData: FormData) => void | Promise<void>;
  deleteAction: (formData: FormData) => void | Promise<void>;
  name: string;
  description?: string | null;
  showDescription?: boolean;
  entityLabel: string;
};

export function TaxonomyRowEditor({
  updateAction,
  deleteAction,
  name,
  description,
  showDescription = false,
  entityLabel,
}: TaxonomyRowActionsProps) {
  return (
    <div className="row-actions">
      <form action={updateAction} className="admin-filters" style={{ flex: '1 1 12rem', maxWidth: '100%' }}>
        <div className="form-field" style={{ flex: '1 1 8rem', minWidth: 0, maxWidth: '12rem' }}>
          <input name="name" defaultValue={name} required aria-label={`نام ${entityLabel}`} />
        </div>
        {showDescription ? (
          <div className="form-field" style={{ flex: '2 1 10rem', minWidth: 0, maxWidth: '16rem' }}>
            <input
              name="description"
              defaultValue={description ?? ''}
              placeholder="توضیح"
              aria-label="توضیح دسته"
            />
          </div>
        ) : null}
        <SubmitButton variant="secondary" pendingLabel="در حال ذخیره…" className="btn--sm">
          ذخیره
        </SubmitButton>
      </form>
      <form action={deleteAction}>
        <ConfirmSubmit
          confirmMessage={`این ${entityLabel} حذف شود؟ ارتباط آن با مطالب ممکن است از بین برود.`}
          size="sm"
        >
          حذف
        </ConfirmSubmit>
      </form>
    </div>
  );
}
