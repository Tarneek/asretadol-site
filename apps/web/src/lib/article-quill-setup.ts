import Quill from 'quill';
import { BlockEmbed } from 'quill/blots/block';
import { AlignStyle } from 'quill/formats/align';
import Image from 'quill/formats/image';
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

/** Quill's default image sanitizer rejects relative `/uploads/...` URLs. */
const originalImageSanitize = Image.sanitize.bind(Image);
Image.sanitize = (url: string) => {
  if (typeof url === 'string' && url.startsWith('/') && !url.startsWith('//')) {
    return url;
  }
  return originalImageSanitize(url);
};

const originalImageMatch = Image.match.bind(Image);
Image.match = (url: string) =>
  originalImageMatch(url) || /\.(jpe?g|gif|png|webp)(\?.*)?$/i.test(url);

class HtmlVideoBlot extends BlockEmbed {
  static blotName = 'htmlVideo';
  static tagName = 'VIDEO';

  static create(value: string) {
    const node = super.create(value) as HTMLVideoElement;
    node.setAttribute('src', value);
    node.setAttribute('controls', 'true');
    node.setAttribute('playsinline', 'true');
    node.setAttribute('preload', 'metadata');
    node.style.maxWidth = '100%';
    node.style.height = 'auto';
    return node;
  }

  static value(node: HTMLElement) {
    return node.getAttribute('src') ?? '';
  }
}

Quill.register(HtmlVideoBlot, true);

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
