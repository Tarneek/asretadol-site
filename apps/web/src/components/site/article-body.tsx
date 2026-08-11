'use client';

import { useEffect, useState } from 'react';
import parse from 'html-react-parser';
import { sanitizeArticleHtmlAsync } from '@/lib/sanitize-html';

type ArticleBodyProps = {
  html: string;
};

/** @deprecated Prefer ArticleBodyClient — same browser-only sanitize path. */
export function ArticleBody({ html }: ArticleBodyProps) {
  const [safeHtml, setSafeHtml] = useState('');

  useEffect(() => {
    let cancelled = false;
    void sanitizeArticleHtmlAsync(html).then((safe) => {
      if (!cancelled) setSafeHtml(safe);
    });
    return () => {
      cancelled = true;
    };
  }, [html]);

  if (!safeHtml.trim()) {
    return null;
  }

  return <div className="article-body prose-rtl">{parse(safeHtml)}</div>;
}
