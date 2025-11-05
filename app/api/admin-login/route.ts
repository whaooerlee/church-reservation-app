// app/api/admin-login/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({ password: '' }));

  // Vercel에 설정해둔 비밀번호 읽기
  const realPass =
    process.env.ADMIN_PASS || process.env.NEXT_PUBLIC_ADMIN_PASS || '';

  // 🔴 비밀번호가 아예 서버에 설정돼 있지 않은 경우
  // => 개발/테스트 편하게 하려고 그냥 통과시킴
  if (!realPass) {
    return NextResponse.json({ ok: true, message: 'no admin password set (dev pass)' });
  }

  // ✅ 비밀번호가 설정돼 있고, 맞게 입력한 경우
  if (password === realPass) {
    return NextResponse.json({ ok: true });
  }

  // ❌ 틀린 경우
  return NextResponse.json(
    { ok: false, message: '비밀번호가 올바르지 않습니다.' },
    { status: 401 }
  );
}
