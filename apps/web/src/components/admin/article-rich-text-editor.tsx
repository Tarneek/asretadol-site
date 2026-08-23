'use client';

import { useCallback, useId, useMemo, useRef, useState } from 'react';
import ReactQuill from 'react-quill-new';
import type ReactQuillType from 'react-quill-new';
import '@/lib/article-quill-setup';
import { createAlignHandler } from '@/lib/article-quill-setup';
import {
  ARTICLE_EDITOR_IMAGE_ACCEPT,
  ARTICLE_EDITOR_VIDEO_ACCEPT,
  buildEditorImageHtml,
  buildEditorVideoHtml,
  uploadArticleEditorMedia,
} from '@/lib/article-editor-media';
import 'react-quill-new/dist/quill.snow.css';

const EDITOR_FORMATS = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'color',
  'background',
  'list',
  'indent',
  'align',
  'blockquote',
  'link',
];

type Props = {
  initialHtml?: string;
  name?: string;
};

type UploadKind = 'image' | 'video';

export function ArticleRichTextEditor({ initialHtml = '', name = 'content' }: Props) {
  const [value, setValue] = useState(initialHtml);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const editorId = useId();
  const quillRef = useRef<ReactQuillType | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadKindRef = useRef<UploadKind>('image');

  const insertHtmlAtCursor = useCallback((html: string) => {
    const editor = quillRef.current?.getEditor();
    if (!editor) {
      return;
    }

    const range = editor.getSelection(true);
    const index = range?.index ?? editor.getLength();
    editor.clipboard.dangerouslyPasteHTML(index, html, 'user');
    editor.setSelection(index + 1, 0, 'user');
    setValue(editor.getSemanticHTML());
  }, []);

  const openUploadPicker = useCallback((kind: UploadKind) => {
    uploadKindRef.current = kind;
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.accept =
        kind === 'video' ? ARTICLE_EDITOR_VIDEO_ACCEPT : ARTICLE_EDITOR_IMAGE_ACCEPT;
    }
    fileInputRef.current?.click();
  }, []);

  const handleUploadImage = useCallback(() => {
    openUploadPicker('image');
  }, [openUploadPicker]);

  const handleUploadVideo = useCallback(() => {
    openUploadPicker('video');
  }, [openUploadPicker]);

  const handleFileSelected = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) {
        return;
      }

      const kind = uploadKindRef.current;
      setUploading(true);
      setUploadError(null);

      try {
        const path = await uploadArticleEditorMedia(file, kind);
        insertHtmlAtCursor(
          kind === 'video' ? buildEditorVideoHtml(path) : buildEditorImageHtml(path),
        );
      } catch (error) {
        const message =
          error instanceof Error && error.message.trim()
            ? error.message
            : 'بارگذاری فایل ممکن نشد.';
        setUploadError(message);
        window.alert(message);
      } finally {
        setUploading(false);
      }
    },
    [insertHtmlAtCursor],
  );

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ color: [] }, { background: [] }],
          [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
          ['alignRight', 'alignCenter', 'alignLeft'],
          ['blockquote'],
          ['link', 'uploadImage', 'uploadVideo'],
          ['clean'],
        ],
        handlers: {
          alignRight: createAlignHandler('right'),
          alignCenter: createAlignHandler('center'),
          alignLeft: createAlignHandler('left'),
          uploadImage: handleUploadImage,
          uploadVideo: handleUploadVideo,
        },
      },
    }),
    [handleUploadImage, handleUploadVideo],
  );

  const plainText = value.replace(/<[^>]+>/g, '').trim();

  return (
    <div className="article-rich-editor" dir="rtl">
      <input
        ref={fileInputRef}
        type="file"
        className="article-rich-editor__file-input"
        accept={ARTICLE_EDITOR_IMAGE_ACCEPT}
        tabIndex={-1}
        aria-hidden
        onChange={handleFileSelected}
      />
      {uploading ? (
        <p className="article-rich-editor__status" role="status">
          در حال بارگذاری فایل…
        </p>
      ) : null}
      {uploadError ? (
        <p className="article-rich-editor__error" role="alert">
          {uploadError}
        </p>
      ) : null}
      <ReactQuill
        ref={quillRef}
        id={editorId}
        theme="snow"
        value={value}
        onChange={setValue}
        modules={modules}
        formats={EDITOR_FORMATS}
        placeholder="متن خبر را بنویسید…"
      />
      <input type="hidden" name={name} value={value} required={!plainText} />
    </div>
  );
}
