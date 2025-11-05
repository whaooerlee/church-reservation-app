// app/api/admin-login/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({ password: '' }));

  // 여기서 가능한 이름은 전부 체크합니다.
  const realPass =
    process.env.ADMIN_PASS ||              // 우리가 처음에 쓴 이름
    process.env.ADMIN_PASSWORD ||          // 지금 입력하신 이름
    process.env.NEXT_PUBLIC_ADMIN_PASS ||  // 프론트에도 노출되는 이름
    '';

  // 비번이 아예 서버에 없으면 일단 통과 (테스트용)
  if (!realPass) {
    return NextResponse.json(
      { ok: true, message: 'no admin password set (dev mode)' },
      { status: 200 }
    );
  }

  if (password === realPass) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  return NextResponse.json(
    { ok: false, message: '비밀번호가 올바르지 않습니다.' },
    { status: 401 }
  );
}
