'use client';

import { useState } from 'react';
import { generateArticleSlug } from '@/lib/url/generate-article-slug';

type Props = {
  initialTitle?: string;
  initialSlug?: string;
};

export function ArticleTitleSlugFields({ initialTitle = '', initialSlug = '' }: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [slug, setSlug] = useState(initialSlug);
  const [slugEdited, setSlugEdited] = useState(Boolean(initialSlug));

  return (
    <>
      <div className="form-field">
        <label className="form-field__label" htmlFor="article-title">
          عنوان مطلب
        </label>
        <input
          id="article-title"
          name="title"
          required
          dir="rtl"
          value={title}
          onChange={(event) => {
            const nextTitle = event.target.value;
            setTitle(nextTitle);
            if (!slugEdited) {
              setSlug(generateArticleSlug(nextTitle));
            }
          }}
          placeholder="عنوان خبر را وارد کنید"
        />
      </div>
      <div className="form-field">
        <label className="form-field__label" htmlFor="article-slug">
          شناسه URL (Slug)
        </label>
        <p className="form-field__hint">
          به‌صورت خودکار از عنوان ساخته می‌شود. در صورت نیاز می‌توانید آن را ویرایش کنید.
        </p>
        <input
          id="article-slug"
          name="slug"
          dir="rtl"
          value={slug}
          onChange={(event) => {
            setSlugEdited(true);
            setSlug(event.target.value);
          }}
          placeholder="example-news-slug"
          autoComplete="off"
        />
      </div>
    </>
  );
}
