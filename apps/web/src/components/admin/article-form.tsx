'use client';

import { useActionState } from 'react';
import type { AdminArticle, AdminCategory, AdminTag } from '@/lib/types/admin-api';
import type { ArticleFormState } from '@/app/admin/(cms)/articles/actions';
import { FlashBanner } from './flash-banner';
import { ArticleTitleSlugFields } from './article-title-slug-fields';
import { ArticleFeaturedImageField } from './article-featured-image-field';
import { ArticleRichTextEditor } from './article-rich-text-editor';
import { ArticleVideoFields } from './article-video-fields';
import { SubmitButton } from './submit-button';

type ArticleFormAction = (
  prevState: ArticleFormState,
  formData: FormData,
) => Promise<ArticleFormState>;

type ArticleFormProps = {
  article?: AdminArticle;
  categories: AdminCategory[];
  tags: AdminTag[];
  submitLabel: string;
  action: ArticleFormAction;
};

export function ArticleForm({
  article,
  categories,
  tags,
  submitLabel,
  action,
}: ArticleFormProps) {
  const [state, formAction] = useActionState(action, {});
  const draft = state.values;
  const selectedCategoryIds = new Set(
    draft?.categoryIds ?? article?.categories.map((c) => c.id) ?? [],
  );
  const selectedTagIds = new Set(draft?.tagIds ?? article?.tags.map((t) => t.id) ?? []);
  const fieldsKey = String(state.stamp ?? 'initial');

  return (
    <form action={formAction} className="article-editor article-editor--rtl" dir="rtl">
      <div className="article-editor__main" key={`main-${fieldsKey}`}>
        {state.error ? <FlashBanner type="error" message={state.error} /> : null}
        <section className="card">
          <header className="article-editor__card-header">
            <h2 className="article-editor__card-title">اطلاعات اصلی</h2>
            <p className="article-editor__card-desc">
              عنوان، شناسه URL و خلاصهٔ کوتاه برای فهرست مطالب و اشتراک‌گذاری.
            </p>
          </header>
          <div className="form-grid">
            <ArticleTitleSlugFields
              initialTitle={draft?.title ?? article?.title ?? ''}
              initialSlug={draft?.slug ?? article?.slug ?? ''}
            />
            <div className="form-field">
              <label className="form-field__label" htmlFor="article-excerpt">
                خلاصه خبر
              </label>
              <p className="form-field__hint">
                اختیاری. متن کوتاه برای لیست مطالب و پیش‌نمایش شبکه‌های اجتماعی.
              </p>
              <textarea
                id="article-excerpt"
                name="excerpt"
                rows={3}
                dir="rtl"
                defaultValue={draft?.excerpt ?? article?.excerpt ?? ''}
                placeholder="یک یا دو جمله دربارهٔ موضوع خبر…"
              />
            </div>
          </div>
        </section>

        <section className="card">
          <header className="article-editor__card-header">
            <h2 className="article-editor__card-title">متن مطلب</h2>
            <p className="article-editor__card-desc">
              بدنهٔ کامل خبر — خروجی به‌صورت HTML ذخیره می‌شود. پر کردن این بخش اختیاری است.
            </p>
          </header>
          <div className="form-field">
            <label className="form-field__label" htmlFor="article-content">
              متن کامل
            </label>
            <ArticleRichTextEditor
              initialHtml={draft?.content ?? article?.content ?? ''}
              name="content"
            />
          </div>
        </section>

        <section className="card">
          <header className="article-editor__card-header">
            <h2 className="article-editor__card-title">رسانه</h2>
            <p className="article-editor__card-desc">تصویر شاخص و ویدیوی اختیاری مطلب.</p>
          </header>
          <div className="form-grid form-grid--2">
            <ArticleFeaturedImageField
              initialPath={draft?.featuredImage || article?.featuredImage}
              slot="main"
            />
            <ArticleVideoFields
              initialHasVideo={draft?.hasVideo ?? article?.hasVideo ?? false}
              initialVideoUrl={draft?.videoUrl || article?.videoUrl}
            />
          </div>
        </section>
      </div>

      <aside className="article-editor__aside" key={`aside-${fieldsKey}`}>
        <section className="card">
          <header className="article-editor__card-header">
            <h2 className="article-editor__card-title">طبقه‌بندی</h2>
            <p className="article-editor__card-desc">دسته‌بندی‌ها و برچسب‌های مرتبط با مطلب.</p>
          </header>
          <div className="form-grid">
            <fieldset className="taxonomy-fieldset">
              <legend>دسته‌بندی‌ها</legend>
              <div className="taxonomy-fieldset__body">
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
              </div>
            </fieldset>

            <fieldset className="taxonomy-fieldset">
              <legend>برچسب‌ها</legend>
              <div className="taxonomy-fieldset__body">
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
              </div>
            </fieldset>
          </div>
        </section>

        <section className="card">
          <header className="article-editor__card-header">
            <h2 className="article-editor__card-title">جایگاه صفحهٔ اصلی</h2>
            <p className="article-editor__card-desc">نمایش مطلب در بلوک‌های ویژهٔ سایت.</p>
          </header>
          <div className="checkbox-grid">
            <label>
              <input
                type="checkbox"
                name="isHero"
                value="1"
                defaultChecked={draft?.isHero ?? article?.isHero ?? false}
              />
              سرتیتر اصلی
            </label>
            <label>
              <input
                type="checkbox"
                name="isFeatured"
                value="1"
                defaultChecked={draft?.isFeatured ?? article?.isFeatured ?? article?.featured ?? false}
              />
              خبر ویژه
            </label>
            <label>
              <input
                type="checkbox"
                name="isBreaking"
                value="1"
                defaultChecked={draft?.isBreaking ?? article?.isBreaking ?? false}
              />
              خبر فوری
            </label>
          </div>
        </section>

        <section className="card">
          <header className="article-editor__card-header">
            <h2 className="article-editor__card-title">تنظیمات سئو</h2>
            <p className="article-editor__card-desc">عنوان و توضیح برای موتورهای جستجو.</p>
          </header>
          <div className="form-grid">
            <div className="form-field">
              <label className="form-field__label" htmlFor="article-seo-title">
                عنوان سئو
              </label>
              <input
                id="article-seo-title"
                name="seoTitle"
                dir="rtl"
                defaultValue={draft?.seoTitle ?? article?.seoTitle ?? ''}
                placeholder="در صورت خالی بودن از عنوان مطلب استفاده می‌شود"
              />
            </div>
            <div className="form-field">
              <label className="form-field__label" htmlFor="article-seo-description">
                توضیح سئو
              </label>
              <textarea
                id="article-seo-description"
                name="seoDescription"
                rows={3}
                dir="rtl"
                defaultValue={draft?.seoDescription ?? article?.seoDescription ?? ''}
                placeholder="حداکثر حدود ۱۶۰ کاراکتر توصیه می‌شود"
              />
            </div>
          </div>
        </section>

        <section className="card">
          <div className="article-editor__actions">
            <SubmitButton pendingLabel="در حال ذخیره…">{submitLabel}</SubmitButton>
          </div>
        </section>
      </aside>
    </form>
  );
}
