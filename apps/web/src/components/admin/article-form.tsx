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
    <form action={action} className="article-editor" encType="multipart/form-data">
      <div className="article-editor__main">
        <section className="card">
          <header className="article-editor__card-header">
            <h2 className="article-editor__card-title">اطلاعات اصلی</h2>
            <p className="article-editor__card-desc">
              عنوان، شناسه URL و خلاصهٔ کوتاه برای فهرست مطالب و اشتراک‌گذاری.
            </p>
          </header>
          <div className="form-grid">
            <div className="form-field">
              <label className="form-field__label" htmlFor="article-title">
                عنوان مطلب
              </label>
              <input
                id="article-title"
                name="title"
                required
                defaultValue={article?.title ?? ''}
                placeholder="عنوان خبر را وارد کنید"
              />
            </div>
            <div className="form-field">
              <label className="form-field__label" htmlFor="article-slug">
                شناسه URL (Slug)
              </label>
              <p className="form-field__hint">
                اختیاری — در صورت خالی بودن از روی عنوان ساخته می‌شود. فقط حروف لاتین، عدد و خط تیره.
              </p>
              <input
                id="article-slug"
                name="slug"
                dir="ltr"
                defaultValue={article?.slug ?? ''}
                placeholder="example-news-slug"
                autoComplete="off"
              />
            </div>
            <div className="form-field">
              <label className="form-field__label" htmlFor="article-excerpt">
                خلاصه خبر
              </label>
              <p className="form-field__hint">متن کوتاه برای لیست مطالب و پیش‌نمایش شبکه‌های اجتماعی.</p>
              <textarea
                id="article-excerpt"
                name="excerpt"
                rows={3}
                defaultValue={article?.excerpt ?? ''}
                placeholder="یک یا دو جمله دربارهٔ موضوع خبر…"
              />
            </div>
          </div>
        </section>

        <section className="card">
          <header className="article-editor__card-header">
            <h2 className="article-editor__card-title">متن مطلب</h2>
            <p className="article-editor__card-desc">
              بدنهٔ کامل خبر — خروجی به‌صورت HTML ذخیره می‌شود.
            </p>
          </header>
          <div className="form-field">
            <label className="form-field__label" htmlFor="article-content">
              متن کامل
            </label>
            <ArticleRichTextEditor initialHtml={article?.content ?? ''} name="content" />
          </div>
        </section>

        <section className="card">
          <header className="article-editor__card-header">
            <h2 className="article-editor__card-title">رسانه</h2>
            <p className="article-editor__card-desc">تصویر شاخص و ویدیوی اختیاری مطلب.</p>
          </header>
          <div className="form-grid form-grid--2">
            <ArticleFeaturedImageField initialPath={article?.featuredImage} />
            <ArticleVideoFields
              initialHasVideo={article?.hasVideo ?? false}
              initialVideoUrl={article?.videoUrl}
            />
          </div>
        </section>
      </div>

      <aside className="article-editor__aside">
        <section className="card">
          <header className="article-editor__card-header">
            <h2 className="article-editor__card-title">طبقه‌بندی</h2>
            <p className="article-editor__card-desc">دسته‌بندی‌ها و برچسب‌های مرتبط با مطلب.</p>
          </header>
          <div className="form-grid">
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
                defaultValue={article?.seoTitle ?? ''}
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
                defaultValue={article?.seoDescription ?? ''}
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
