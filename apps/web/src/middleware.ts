import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';

import { ACCESS_TOKEN_COOKIE } from '@/lib/auth/constants';



const ADMIN_LOGIN = '/admin/login';

const ADMIN_HOME = '/admin/dashboard';

function isServerActionRequest(request: NextRequest): boolean {
  return request.headers.has('next-action') || request.headers.has('Next-Action');
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAccessToken = Boolean(request.cookies.get(ACCESS_TOKEN_COOKIE)?.value);
  const isServerAction = isServerActionRequest(request);

  if (pathname === '/admin' || pathname === '/admin/') {
    const target = hasAccessToken ? ADMIN_HOME : ADMIN_LOGIN;
    return NextResponse.redirect(new URL(target, request.url));
  }

  if (pathname.startsWith('/admin') && pathname !== ADMIN_LOGIN) {
    if (!hasAccessToken) {
      // Never redirect Server Action POSTs: the login page does not register CMS
      // actions, so a redirect causes "Server Action was not found on the server".
      if (isServerAction) {
        return new NextResponse(null, { status: 401 });
      }

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


