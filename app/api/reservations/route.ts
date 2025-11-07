// app/api/reservations/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// 전체 목록
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('reservations')
    .select(
      // 👇 여기에서 purpose 뺐습니다
      'id, space_id, title, team_name, start_at, end_at, requester, status'
    )
    .order('start_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

// 신청 저장
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
      // purpose 는 DB에 없으니까 받아도 버립니다
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
          status: 'pending', // 기본은 대기
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
