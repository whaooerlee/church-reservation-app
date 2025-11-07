// app/api/reservations/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || 'approved';

  let query = supabaseAdmin
    .from('reservations')
    .select(
      'id, space_id, title, team_name, start_at, end_at, requester, purpose, status'
    )
    .order('start_at', { ascending: true });

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data ?? []);
}

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
