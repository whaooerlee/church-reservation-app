// app/api/reservations/[id]/route.js
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

// ✅ 예약 한 건 조회
export async function GET(_req, context) {
  const id = context?.params?.id;
  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('reservations')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}

// ✅ 승인
export async function PATCH(_req, context) {
  const id = context?.params?.id;
  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('reservations')
    .update({ status: 'approved' })
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ error: 'update did not apply' }, { status: 409 });
  }

  return NextResponse.json({ ok: true, data });
}

// ✅ 삭제
export async function DELETE(_req, context) {
  const id = context?.params?.id;
  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('reservations')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
