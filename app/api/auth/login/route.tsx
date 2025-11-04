import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(()=>({}));
  if (!password) return new NextResponse('비밀번호 입력 필요', { status: 400 });

  const ok = password === process.env.ADMIN_PASSWORD;
  if (!ok) return new NextResponse('비밀번호가 올바르지 않습니다.', { status: 401 });

  const res = new NextResponse(JSON.stringify({ ok: true }), { status: 200 });
  res.cookies.set('admin', '1', {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: 60 * 60 * 8, // 8시간
  });
  return res;
}
