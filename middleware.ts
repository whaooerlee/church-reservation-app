// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 이 경로들만 로그인 체크하고 싶을 때
const ADMIN_PATHS = ['/admin'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // /admin2 같은 새 페이지는 건드리지 않음
  if (!ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // 쿠키 확인
  const hasAuth = req.cookies.get('admin_auth')?.value === 'true';

  // 로그인 안 돼 있으면 /admin/login 으로
  if (!hasAuth && pathname !== '/admin/login') {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }

  // 그 외엔 그냥 통과
  return NextResponse.next();
}

// 이 미들웨어를 어떤 경로에 적용할지
export const config = {
  matcher: ['/admin/:path*'],
};
