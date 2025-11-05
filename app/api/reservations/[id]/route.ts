// app/api/reservations/[id]/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// ✅ 예약 한 건 조회 (필요하면)
export async function GET(
  _req: Request,
  ctx: { params: { id: string } }
) {
  const { id } = ctx.params;
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

// ✅ 관리자 승인 (status = approved 로 변경)
export async function PATCH(
  _req: Request,
  ctx: { params: { id: string } }
) {
  const { id } = ctx.params;
  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }

  // 현재 값 가져오기 (디버깅용)
  const { data: before } = await supabaseAdmin
    .from('reservations')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  const { data, error } = await supabaseAdmin
    .from('reservations')
    .update({ status: 'approved' })
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: error.message, debug: { id, before } },
      { status: 409 }
    );
  }
  if (!data) {
    return NextResponse.json(
      { error: 'update did not apply', debug: { id, before } },
      { status: 409 }
    );
  }

  return NextResponse.json({ ok: true, data });
}

// ✅ 삭제 (관리자에서 쓰는 용도)
export async function DELETE(
  _req: Request,
  ctx: { params: { id: string } }
) {
  const { id } = ctx.params;
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
