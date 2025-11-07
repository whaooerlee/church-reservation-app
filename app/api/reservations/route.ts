// app/api/reservations/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// ✅ 전체 예약 가져오기
export async function GET(_req: Request) {
  const { data, error } = await supabaseAdmin
    .from('reservations')
    .select(
      'id, space_id, title, team_name, start_at, end_at, requester, purpose, status'
    )
    .order('start_at', { ascending: true });

  if (error) {
    // 프론트에서 에러를 볼 수 있게 그대로 보냅니다
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // ⬅️ 프론트는 배열을 기대하니까 배열만 보냅니다
  return NextResponse.json(data ?? []);
}

// ✅ 예약 신청 (사용자 폼)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      space_id,
      title,
      team_name,
      start_at,
      end_at,
      requester,
      purpose,
    } = body;

    if (!space_id || !title || !start_at || !end_at || !requester) {
      return NextResponse.json(
        {
          error:
            '필수 항목 누락 (space_id, title, start_at, end_at, requester)',
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('reservations')
      .insert([
        {
          space_id,
          title,
          team_name: team_name ?? null,
          start_at,
          end_at,
          requester,
          purpose: purpose ?? null,
          status: 'pending', // 신청은 대기로
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
