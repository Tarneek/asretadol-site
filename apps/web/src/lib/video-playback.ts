export type VideoPlayback =
  | { kind: 'iframe'; embedUrl: string; provider: 'aparat' | 'youtube' }
  | { kind: 'file'; src: string }
  | { kind: 'unknown'; src: string };

const DIRECT_VIDEO_EXT = /\.(mp4|webm|ogg|ogv|mov|m4v)(\?.*)?$/i;

function safeUrl(raw: string): URL | null {
  try {
    return new URL(raw.trim());
  } catch {
    return null;
  }
}

function extractAparatHash(url: URL): string | null {
  const host = url.hostname.replace(/^www\./, '').toLowerCase();
  if (host !== 'aparat.com') {
    return null;
  }

  const embedMatch = url.pathname.match(
    /\/video\/video\/embed\/videohash\/([^/]+)/i,
  );
  if (embedMatch?.[1]) {
    return embedMatch[1];
  }

  const pageMatch = url.pathname.match(/\/v\/([^/?#]+)/i);
  return pageMatch?.[1] ?? null;
}

function extractYoutubeId(url: URL): string | null {
  const host = url.hostname.replace(/^www\./, '').toLowerCase();

  if (host === 'youtu.be') {
    const id = url.pathname.split('/').filter(Boolean)[0];
    return id || null;
  }

  if (
    host === 'youtube.com' ||
    host === 'm.youtube.com' ||
    host === 'music.youtube.com' ||
    host === 'youtube-nocookie.com'
  ) {
    const watchId = url.searchParams.get('v');
    if (watchId) {
      return watchId;
    }

    const embedMatch = url.pathname.match(/\/(?:embed|shorts|live)\/([^/?#]+)/i);
    return embedMatch?.[1] ?? null;
  }

  return null;
}

function aparatEmbedUrl(hash: string): string {
  return `https://www.aparat.com/video/video/embed/videohash/${encodeURIComponent(hash)}/vt/frame`;
}

function youtubeEmbedUrl(id: string): string {
  return `https://www.youtube.com/embed/${encodeURIComponent(id)}`;
}

/** True for uploaded or extension-based playable files (not page embeds). */
export function isDirectVideoFileUrl(raw: string): boolean {
  const value = raw.trim();
  if (!value) {
    return false;
  }
  if (value.startsWith('blob:')) {
    return true;
  }
  if (
    value.startsWith('/uploads/videos/') ||
    value.startsWith('/uploads/blog/content/')
  ) {
    return true;
  }
  const url = safeUrl(value.startsWith('/') ? `https://local.invalid${value}` : value);
  if (!url) {
    return DIRECT_VIDEO_EXT.test(value);
  }
  return DIRECT_VIDEO_EXT.test(url.pathname);
}

/**
 * Map user-pasted page URLs (Aparat / YouTube) or file URLs to a renderable
 * playback target for `<iframe>` or `<video>`.
 */
export function resolveVideoPlayback(rawUrl: string): VideoPlayback {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return { kind: 'unknown', src: '' };
  }

  if (isDirectVideoFileUrl(trimmed)) {
    return { kind: 'file', src: trimmed };
  }

  const url = safeUrl(trimmed);
  if (!url || (url.protocol !== 'http:' && url.protocol !== 'https:')) {
    return { kind: 'unknown', src: trimmed };
  }

  const aparatHash = extractAparatHash(url);
  if (aparatHash) {
    return {
      kind: 'iframe',
      provider: 'aparat',
      embedUrl: aparatEmbedUrl(aparatHash),
    };
  }

  const youtubeId = extractYoutubeId(url);
  if (youtubeId) {
    return {
      kind: 'iframe',
      provider: 'youtube',
      embedUrl: youtubeEmbedUrl(youtubeId),
    };
  }

  return { kind: 'unknown', src: trimmed };
}
