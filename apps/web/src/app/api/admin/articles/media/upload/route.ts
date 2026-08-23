import { NextResponse } from 'next/server';
import { uploadAdminArticleImage } from '@/lib/api/admin-articles';
import { getSession } from '@/lib/auth/session';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: 'ورود به پنل الزامی است.' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ message: 'فایل تصویر الزامی است.' }, { status: 400 });
    }

    const path = await uploadAdminArticleImage(file);
    return NextResponse.json({ path });
  } catch (error) {
    const message =
      error instanceof Error && error.message.trim()
        ? error.message
        : 'بارگذاری تصویر ممکن نشد.';
    return NextResponse.json({ message }, { status: 400 });
  }
}
