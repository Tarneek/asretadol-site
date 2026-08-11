'use client';

import { useEffect, useState } from 'react';
import parse from 'html-react-parser';
import { sanitizeArticleHtmlAsync } from '@/lib/sanitize-html';

type ArticleBodyClientProps = {
  html: string;
};

export function ArticleBodyClient({ html }: ArticleBodyClientProps) {
  const [safeHtml, setSafeHtml] = useState('');

  useEffect(() => {
    let cancelled = false;
    // Run sanitization only in the browser to avoid SSR-time jsdom issues.
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
