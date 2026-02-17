import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type Ctx = { params: Promise<{ id: string }> };

// ✅ 신청 성공 페이지에서 상세 1건 조회용 (pending도 조회 가능)
export async function GET(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from('reservations')
      .select('id, space_id, title, requester, team_name, start_at, end_at, status') // ✅ created_at 제거
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'unknown error' }, { status: 500 });
  }
}

// ✅ 관리자 승인/취소 (status만 변경)
export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const body = await req.json().catch(() => ({}));
    const status = body?.status;

    if (status !== 'approved' && status !== 'pending') {
      return NextResponse.json({ error: 'status must be approved|pending' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('reservations')
      .update({ status })
      .eq('id', id)
      .select('id, status')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 409 });

    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'unknown error' }, { status: 500 });
  }
}

// ✅ 관리자 삭제
export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const { error } = await supabaseAdmin.from('reservations').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 409 });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'unknown error' }, { status: 500 });
  }
}