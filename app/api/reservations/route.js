// app/api/reservations/[id]/route.js
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// 빌드 시 정적분석 덜 하라고
export const dynamic = 'force-dynamic';

// 단건 조회
export async function GET(req, context) {
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

// 승인
export async function PATCH(req, context) {
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

// 삭제
export async function DELETE(req, context) {
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
