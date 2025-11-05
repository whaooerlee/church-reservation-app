// app/api/reservations/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

// ✅ 목록 조회 ?status=approved 이런 식으로
export async function GET(req: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'supabase not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    let query = supabaseAdmin
      .from('reservations')
      .select('*')
      .order('start_at', { ascending: true });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'unknown error' }, { status: 500 });
  }
}

// ✅ 신규 신청
export async function POST(req: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'supabase not configured' }, { status: 500 });
    }

    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json({ error: 'invalid json' }, { status: 400 });
    }

    const {
      space_id,
      title,
      start_at,
      end_at,
      requester,
      team_name,
      purpose,
    } = body;

    if (!space_id || !title || !start_at || !end_at || !requester) {
      return NextResponse.json(
        { error: '필수 항목 누락 (space_id, title, start_at, end_at, requester)' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('reservations')
      .insert({
        space_id,
        title,
        start_at,
        end_at,
        requester,
        team_name,
        purpose,
        status: 'pending',
      })
      .select()
      .maybeSingle();

    if (error) {
      // 중복시간 정책 걸리면 여기로 옴
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'unknown error' }, { status: 500 });
  }
}
