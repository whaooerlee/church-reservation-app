// app/api/reservations/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type Ctx = { params: Promise<{ id: string }> };

// ✅ 상태 바꾸기 (승인 / 대기)
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const { status } = body as { status?: string };

  const { data, error } = await supabaseAdmin
    .from('reservations')
    .update(status ? { status } : {})
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message, debug: { id, status } },
      { status: 409 }
    );
  }

  return NextResponse.json(data);
}

// ✅ 삭제
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('reservations')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 409 });
  }

  return NextResponse.json({ ok: true });
}
