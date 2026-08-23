import Quill from 'quill';
import { AlignStyle } from 'quill/formats/align';
import icons from 'quill/ui/icons';

/** Allow explicit left alignment (Quill defaults omit "left" from the whitelist). */
AlignStyle.whitelist = ['right', 'center', 'justify', 'left'];

type QuillEditor = InstanceType<typeof Quill>;

const iconSet = icons as {
  align: Record<string, string>;
  image: string;
  video: string;
  [key: string]: unknown;
};

iconSet.uploadImage = iconSet.image;
iconSet.uploadVideo = iconSet.video;
iconSet.alignRight = iconSet.align.right;
iconSet.alignLeft = iconSet.align[''];
iconSet.alignCenter = iconSet.align.center;

export function applyBlockAlign(
  quill: QuillEditor,
  align: 'right' | 'left' | 'center' | 'justify',
) {
  const range = quill.getSelection(true);
  if (!range) {
    return;
  }

  if (range.length === 0) {
    quill.format('align', align, Quill.sources.USER);
    return;
  }

  quill.formatLine(range.index, range.length, 'align', align, Quill.sources.USER);
}

export function createAlignHandler(align: 'right' | 'left' | 'center' | 'justify') {
  return function alignHandler(this: { quill: QuillEditor }) {
    applyBlockAlign(this.quill, align);
  };
}

let setupDone = false;

export function ensureArticleQuillSetup() {
  if (setupDone) {
    return;
  }
  setupDone = true;
}

ensureArticleQuillSetup();
