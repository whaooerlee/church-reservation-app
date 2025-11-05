// app/api/admin-login/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Vercel에서 캐싱 막기

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({ password: '' }));
  const inputPass = body.password ?? '';

  // 환경변수 여러 이름 모두 시도
  const realPass =
    process.env.ADMIN_PASS ||
    process.env.ADMIN_PASSWORD ||
    process.env.NEXT_PUBLIC_ADMIN_PASS ||
    '';

  // 디버그용 로그 (Vercel build logs → Function logs 에서 보임)
  console.log('[admin-login] input:', inputPass);
  console.log('[admin-login] realPass exists:', !!realPass);

  // 비밀번호가 아예 설정 안 되어 있으면 통과 (개발/테스트)
  if (!realPass) {
    return NextResponse.json(
      { ok: true, mode: 'no-password' },
      { status: 200 }
    );
  }

  if (inputPass === realPass) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  return NextResponse.json(
    { ok: false, message: '비밀번호가 올바르지 않습니다.' },
    { status: 401 }
  );
}
