// app/api/admin-login/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({ password: '' }));

  // .env 에 있는 관리자 비밀번호 확인
  const adminPass = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASS;

  if (!adminPass || password !== adminPass) {
    return NextResponse.json({ ok: false, message: '비밀번호가 맞지 않습니다.' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });

  // ✅ Vercel 환경에서도 작동하도록 secure + sameSite 세팅
  res.cookies.set('admin_auth', '1', {
    httpOnly: false,   // 클라이언트 JS에서 접근 가능
    sameSite: 'strict',
    secure: true,      // https 환경에서만
    path: '/',
    maxAge: 60 * 60 * 8, // 8시간
  });

  return res;
}
