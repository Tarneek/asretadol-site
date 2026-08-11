import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';

import { ACCESS_TOKEN_COOKIE } from '@/lib/auth/constants';



const ADMIN_LOGIN = '/admin/login';

const ADMIN_HOME = '/admin/dashboard';



export function middleware(request: NextRequest) {

  const { pathname } = request.nextUrl;

  const hasAccessToken = Boolean(request.cookies.get(ACCESS_TOKEN_COOKIE)?.value);



  if (pathname === '/admin' || pathname === '/admin/') {

    const target = hasAccessToken ? ADMIN_HOME : ADMIN_LOGIN;

    return NextResponse.redirect(new URL(target, request.url));

  }



  if (pathname.startsWith('/admin') && pathname !== ADMIN_LOGIN) {

    if (!hasAccessToken) {

      const loginUrl = new URL(ADMIN_LOGIN, request.url);

      loginUrl.searchParams.set('next', pathname);

      return NextResponse.redirect(loginUrl);

    }

  }



  if (pathname === ADMIN_LOGIN && hasAccessToken) {

    return NextResponse.redirect(new URL(ADMIN_HOME, request.url));

  }



  return NextResponse.next();

}



export const config = {

  matcher: ['/admin', '/admin/:path*'],

};


