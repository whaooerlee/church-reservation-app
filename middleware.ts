import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // /admin 보호 (로그인 페이지와 API 제외)
  const isAdmin = pathname.startsWith('/admin');
  const isLoginPage = pathname.startsWith('/admin/login');
  const isAuthApi = pathname.startsWith('/api/auth');

  if (isAdmin && !isLoginPage && !isAuthApi) {
    const adminCookie = req.cookies.get('admin')?.value;
    if (adminCookie !== '1') {
      const url = req.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/auth/:path*'],
};
