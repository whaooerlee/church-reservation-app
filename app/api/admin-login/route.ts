// app/api/admin-login/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { password } = await req.json();

  // Vercel 환경변수에서 읽기 (둘 중 하나로 넣으세요)
  const realPass =
    process.env.ADMIN_PASS || process.env.NEXT_PUBLIC_ADMIN_PASS || '';

  if (!realPass) {
    // 서버에 비번이 아예 안 들어있으면 그냥 막아두는 게 안전
    return NextResponse.json(
      { ok: false, message: '관리자 비밀번호가 설정되어 있지 않습니다.' },
      { status: 500 }
    );
  }

  if (password === realPass) {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json(
    { ok: false, message: '비밀번호가 올바르지 않습니다.' },
    { status: 401 }
  );
}
