import { NextResponse } from 'next/server';
import { uploadAdminArticleImage } from '@/lib/api/admin-articles';
import { getSession } from '@/lib/auth/session';

function parseImageSlot(
  raw: string | null,
): 'main' | 'thumbnails' | 'content' | undefined {
  if (raw === 'main' || raw === 'thumbnails' || raw === 'content') {
    return raw;
  }
  return undefined;
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: 'ورود به پنل الزامی است.' }, { status: 401 });
  }

  try {
    const kind = parseImageSlot(new URL(request.url).searchParams.get('kind'));
    const formData = await request.formData();
    const file = formData.get('file');
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ message: 'فایل تصویر الزامی است.' }, { status: 400 });
    }

    const path = await uploadAdminArticleImage(file, kind);
    return NextResponse.json({ path, url: path });
  } catch (error) {
    const message =
      error instanceof Error && error.message.trim()
        ? error.message
        : 'بارگذاری تصویر ممکن نشد.';
    return NextResponse.json({ message }, { status: 400 });
  }
}
