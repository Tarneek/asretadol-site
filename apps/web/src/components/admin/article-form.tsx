import type { AdminArticle, AdminCategory, AdminTag } from '@/lib/types/admin-api';
import { ArticleFeaturedImageField } from './article-featured-image-field';
import { ArticleRichTextEditor } from './article-rich-text-editor';
import { ArticleVideoFields } from './article-video-fields';
import { SubmitButton } from './submit-button';

type ArticleFormProps = {
  article?: AdminArticle;
  categories: AdminCategory[];
  tags: AdminTag[];
  submitLabel: string;
  action: (formData: FormData) => void | Promise<void>;
};

export function ArticleForm({
  article,
  categories,
  tags,
  submitLabel,
  action,
}: ArticleFormProps) {
  const selectedCategoryIds = new Set(article?.categories.map((c) => c.id) ?? []);
  const selectedTagIds = new Set(article?.tags.map((t) => t.id) ?? []);

  return (
    <form action={action} className="card form-grid" encType="multipart/form-data">
      <div className="form-grid form-grid--2">
        <div className="form-field">
          <label className="form-field__label" htmlFor="article-title">
            عنوان مطلب
          </label>
          <input id="article-title" name="title" required defaultValue={article?.title ?? ''} />
        </div>
        <ArticleFeaturedImageField initialPath={article?.featuredImage} />
      </div>

      <div className="form-field">
        <label className="form-field__label" htmlFor="article-excerpt">
          خلاصه خبر
        </label>
        <p className="form-field__hint">متن کوتاه برای لیست مطالب و پیش‌نمایش شبکه‌های اجتماعی.</p>
        <textarea id="article-excerpt" name="excerpt" rows={2} defaultValue={article?.excerpt ?? ''} />
      </div>

      <ArticleVideoFields
        initialHasVideo={article?.hasVideo ?? false}
        initialVideoUrl={article?.videoUrl}
      />

      <div className="form-field">
        <label className="form-field__label" htmlFor="article-content">
          متن کامل
        </label>
        <p className="form-field__hint">ویرایشگر متنی — خروجی به‌صورت HTML در پایگاه‌داده ذخیره می‌شود.</p>
        <ArticleRichTextEditor initialHtml={article?.content ?? ''} name="content" />
      </div>

      <div className="form-section">
        <h3 className="form-section__title">جایگاه در صفحهٔ اصلی</h3>
        <div className="checkbox-grid">
          <label>
            <input
              type="checkbox"
              name="isHero"
              value="1"
              defaultChecked={article?.isHero ?? false}
            />
            سرتیتر اصلی
          </label>
          <label>
            <input
              type="checkbox"
              name="isFeatured"
              value="1"
              defaultChecked={article?.isFeatured ?? article?.featured ?? false}
            />
            خبر ویژه
          </label>
          <label>
            <input
              type="checkbox"
              name="isBreaking"
              value="1"
              defaultChecked={article?.isBreaking ?? false}
            />
            خبر فوری
          </label>
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section__title">طبقه‌بندی</h3>
        <div className="form-grid form-grid--2">
          <fieldset>
            <legend>دسته‌بندی‌ها</legend>
            {categories.length === 0 ? (
              <p className="muted" style={{ margin: 0 }}>
                هنوز دسته‌ای تعریف نشده. از بخش دسته‌بندی‌ها اضافه کنید.
              </p>
            ) : (
              <div className="checkbox-grid">
                {categories.map((category) => (
                  <label key={category.id}>
                    <input
                      type="checkbox"
                      name="categoryIds"
                      value={category.id}
                      defaultChecked={selectedCategoryIds.has(category.id)}
                    />
                    {category.name}
                  </label>
                ))}
              </div>
            )}
          </fieldset>

          <fieldset>
            <legend>برچسب‌ها</legend>
            {tags.length === 0 ? (
              <p className="muted" style={{ margin: 0 }}>
                هنوز برچسبی تعریف نشده. از بخش برچسب‌ها اضافه کنید.
              </p>
            ) : (
              <div className="checkbox-grid">
                {tags.map((tag) => (
                  <label key={tag.id}>
                    <input
                      type="checkbox"
                      name="tagIds"
                      value={tag.id}
                      defaultChecked={selectedTagIds.has(tag.id)}
                    />
                    {tag.name}
                  </label>
                ))}
              </div>
            )}
          </fieldset>
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section__title">سئو</h3>
        <div className="form-grid">
          <div className="form-field">
            <label className="form-field__label" htmlFor="article-seo-title">
              عنوان سئو
            </label>
            <input id="article-seo-title" name="seoTitle" defaultValue={article?.seoTitle ?? ''} />
          </div>
          <div className="form-field">
            <label className="form-field__label" htmlFor="article-seo-description">
              توضیح سئو
            </label>
            <textarea
              id="article-seo-description"
              name="seoDescription"
              rows={2}
              defaultValue={article?.seoDescription ?? ''}
            />
          </div>
        </div>
      </div>

      <div>
        <SubmitButton pendingLabel="در حال ذخیره…">{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
