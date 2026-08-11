import { NextResponse } from 'next/server';
import { ApiConfigurationError } from '@/lib/config';
import { ApiNetworkError } from '@/lib/api/client';
import { loginWithCredentials } from '@/lib/auth/session';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    if (!body.email || !body.password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const user = await loginWithCredentials(body.email, body.password);
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
        { message: error.message, code: 'API_UNAVAILABLE' },
        { status: 503 },
      );
    }
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }
}
