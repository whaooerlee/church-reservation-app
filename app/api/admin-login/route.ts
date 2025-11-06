/*
// app/api/admin-login/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { password } = await req.json();

  const ok =
    password === process.env.ADMIN_PASSWORD ||
    password === process.env.NEXT_PUBLIC_ADMIN_PASS;

  if (!ok) {
    return NextResponse.json(
      { ok: false, message: '비밀번호가 올바르지 않습니다.' },
      { status: 401 }
    );
  }

  // ✅ 여기서 쿠키 심어주기
  const res = NextResponse.json({ ok: true });

  res.cookies.set('admin_auth', '1', {
    httpOnly: true,
    sameSite: 'lax',
    // 로컬(localhost)에서는 secure 쓰면 브라우저가 버립니다
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8, // 8시간
  });

  return res;
}

*/

// app/api/admin-login/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({ password: '' }));

  const adminPass = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASS;

  if (!adminPass || password !== adminPass) {
    return NextResponse.json({ ok: false, message: '비밀번호가 맞지 않습니다.' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set('admin_auth', '1', {
    httpOnly: false, // 로컬/테스트라면 false
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8시간
  });
  return res;
}

