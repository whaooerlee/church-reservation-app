// app/api/admin-login/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { password } = await req.json();
  const adminPass =
    process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASS;

  if (password !== adminPass) {
    return NextResponse.json(
      { ok: false, message: '비밀번호가 올바르지 않습니다.' },
      { status: 401 }
    );
  }

  // ✅ 쿠키 설정을 가장 널널하게 (서버/클라이언트 둘 다 접근 가능)
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: 'admin_auth',
    value: 'true',
    path: '/',
    httpOnly: false,          // 서버에서도 클라이언트에서도 읽힘
    secure: false,            // 로컬 테스트에서도 작동하도록
    sameSite: 'lax',          // 기본 값, 크로스 도메인 문제 방지
    maxAge: 60 * 60 * 8,      // 8시간
  });

  return res;
}
