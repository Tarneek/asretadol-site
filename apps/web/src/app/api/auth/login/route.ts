import { NextResponse } from 'next/server';
import { ApiConfigurationError } from '@/lib/config';
import { ApiError, ApiNetworkError } from '@/lib/api/client';
import { loginWithCredentials } from '@/lib/auth/session';
import { normalizeIranianMobile } from '@/lib/iranian-mobile';

function nestMessage(body: string): string | null {
  try {
    const parsed = JSON.parse(body) as { message?: string | string[] };
    if (Array.isArray(parsed.message)) {
      return parsed.message.filter(Boolean).join(' ');
    }
    if (typeof parsed.message === 'string' && parsed.message.trim()) {
      return parsed.message;
    }
  } catch {
    // ignore non-JSON bodies
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { mobile?: string; password?: string };
    if (!body.mobile || !body.password) {
      return NextResponse.json(
        { message: 'شماره موبایل و رمز عبور الزامی است', code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }

    const mobile = normalizeIranianMobile(body.mobile);
    if (!mobile) {
      return NextResponse.json(
        { message: 'شماره موبایل معتبر نیست. فرمت صحیح: 09xxxxxxxxx', code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }

    const user = await loginWithCredentials(mobile, body.password);
    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof ApiConfigurationError) {
      return NextResponse.json(
        { message: error.config.message, code: 'API_NOT_CONFIGURED' },
        { status: 503 },
      );
    }
    if (error instanceof ApiNetworkError) {
      return NextResponse.json(
        {
          message: error.message,
          code: 'API_UNAVAILABLE',
        },
        { status: 503 },
      );
    }
    if (error instanceof ApiError) {
      if (error.status === 401) {
        return NextResponse.json(
          { message: 'شماره موبایل یا رمز عبور نادرست است', code: 'INVALID_CREDENTIALS' },
          { status: 401 },
        );
      }
      if (error.status === 400) {
        return NextResponse.json(
          {
            message: nestMessage(error.body) ?? 'اطلاعات ورود معتبر نیست',
            code: 'VALIDATION_ERROR',
          },
          { status: 400 },
        );
      }
      if (error.status >= 500) {
        return NextResponse.json(
          {
            message: nestMessage(error.body) ?? 'خطای داخلی سرور API',
            code: 'API_ERROR',
          },
          { status: 502 },
        );
      }
    }
    return NextResponse.json(
      { message: 'شماره موبایل یا رمز عبور نادرست است', code: 'INVALID_CREDENTIALS' },
      { status: 401 },
    );
  }
}
