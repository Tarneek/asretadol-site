'use client';

import dynamic from 'next/dynamic';
import { useId, useMemo, useState } from 'react';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

type Props = {
  initialHtml?: string;
  name?: string;
};

export function ArticleRichTextEditor({ initialHtml = '', name = 'content' }: Props) {
  const [value, setValue] = useState(initialHtml);
  const editorId = useId();

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['blockquote', 'link'],
        ['clean'],
      ],
    }),
    [],
  );

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'blockquote',
    'link',
  ];

  const plainText = value.replace(/<[^>]+>/g, '').trim();

  return (
    <div className="article-rich-editor">
      <ReactQuill
        id={editorId}
        theme="snow"
        value={value}
        onChange={setValue}
        modules={modules}
        formats={formats}
        placeholder="متن خبر را بنویسید…"
      />
      <input type="hidden" name={name} value={value} required={!plainText} />
    </div>
  );
}
