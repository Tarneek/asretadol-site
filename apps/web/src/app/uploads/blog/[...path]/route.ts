import { NextResponse } from 'next/server';
import { DEV_DEFAULT_API_URL, tryGetApiBaseUrl } from '@/lib/config';

export const runtime = 'nodejs';

function apiOrigin(): string {
  const apiBase = tryGetApiBaseUrl() ?? DEV_DEFAULT_API_URL;
  return apiBase.replace(/\/api\/?$/, '');
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await context.params;
  if (
    !segments.length ||
    segments.some((part) => !part || part === '.' || part === '..' || part.includes('\\'))
  ) {
    return new NextResponse(null, { status: 400 });
  }

  const upstream = `${apiOrigin()}/uploads/blog/${segments.map(encodeURIComponent).join('/')}`;

  let response: Response;
  try {
    response = await fetch(upstream, { cache: 'no-store' });
  } catch {
    return new NextResponse(null, { status: 502 });
  }

  if (!response.ok || !response.body) {
    return new NextResponse(null, { status: response.status === 404 ? 404 : response.status });
  }

  const headers = new Headers();
  const contentType = response.headers.get('content-type');
  if (contentType) {
    headers.set('Content-Type', contentType);
  }
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');

  return new NextResponse(response.body, { status: 200, headers });
}
