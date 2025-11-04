// app/api/admin/status/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// POST /api/admin/status?id=<uuid>&to=pending|approved
export async function POST(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  const to = url.searchParams.get('to'); // 'pending' | 'approved'

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  if (!to || !['pending', 'approved'].includes(to)) {
    return NextResponse.json({ error: 'to must be pending|approved' }, { status: 400 });
  }

  // 0) 존재 확인
  const { data: before, error: selErr } = await supabaseAdmin
    .from('reservations')
    .select('id,status')
    .eq('id', id)
    .maybeSingle();
  if (selErr) return NextResponse.json({ error: selErr.message }, { status: 400 });
  if (!before) return NextResponse.json({ error: `not found: ${id}` }, { status: 404 });

  if (before.status === to) {
    return NextResponse.json({ id: before.id, status: before.status });
  }

  // 1) 업데이트
  const { error: updErr } = await supabaseAdmin
    .from('reservations')
    .update({ status: to })
    .eq('id', id)
    .neq('status', to);
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 400 });

  // 2) 사후 확인
  const { data: after, error: afterErr } = await supabaseAdmin
    .from('reservations')
    .select('id,status')
    .eq('id', id)
    .maybeSingle();
  if (afterErr) return NextResponse.json({ error: afterErr.message }, { status: 400 });
  if (!after) return NextResponse.json({ error: `not found: ${id}` }, { status: 404 });

  if (after.status !== to) {
    return NextResponse.json({ error: `update did not apply: ${id}` }, { status: 409 });
  }

  return NextResponse.json(after);
}
