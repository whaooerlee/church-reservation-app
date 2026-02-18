// app/api/reservations/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const status = url.searchParams.get('status') || 'approved'; // ✅ 기본값 approved

  let q = supabaseAdmin
    .from('reservations')
    .select('id, title, start_at, end_at, space_id, status, requester, team_name')
    .order('start_at', { ascending: true });

  if (status === 'approved' || status === 'pending') {
    q = q.eq('status', status);
  }

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(req: Request) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const { space_id, title, start_at, end_at, requester, team_name } = body || {};
  if (!space_id || !title || !start_at || !end_at || !requester) {
    return NextResponse.json(
      { error: '필수 항목 누락 (space_id, title, start_at, end_at, requester)' },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from('reservations')
    .insert([
      {
        space_id,
        title,
        start_at,
        end_at,
        requester,
        team_name: team_name || null,
        status: 'pending', // ✅ 신청은 무조건 pending
      },
    ])
    .select('id, title, start_at, end_at, space_id, status, requester, team_name')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, data });
}
