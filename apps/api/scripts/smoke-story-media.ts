import { StoryMediaType } from '../src/common/enums/story-media-type.enum';
import {
  isValidStoryLink,
  normalizeStoryLink,
  normalizeStoryMediaUrl,
} from '../src/modules/stories/story-media.util';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

assert(isValidStoryLink('/tag/gold'), 'relative link');
assert(isValidStoryLink('https://niranews.com/a'), 'https link');
assert(!isValidStoryLink('www.aparat.com/v/x'), 'reject no-protocol');
assert(normalizeStoryLink('') === null, 'empty → null');
assert(normalizeStoryLink('/news/1/x') === '/news/1/x', 'keep relative');
assert(
  normalizeStoryMediaUrl('/uploads/news/a.jpg', StoryMediaType.Image) ===
    '/uploads/news/a.jpg',
  'news image path',
);
assert(
  normalizeStoryMediaUrl('/uploads/blog/main/a.jpg', StoryMediaType.Image) ===
    '/uploads/blog/main/a.jpg',
  'blog image path',
);
assert(
  normalizeStoryMediaUrl('/uploads/videos/a.mp4', StoryMediaType.Video) ===
    '/uploads/videos/a.mp4',
  'video path',
);

console.log('smoke-story-media: OK');
