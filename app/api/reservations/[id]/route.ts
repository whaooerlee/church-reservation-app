// app/api/reservations/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Next 16에서는 params가 Promise로 들어오기 때문에 한 번 await 해서 꺼낸다
type Ctx = { params: Promise<{ id: string }> };

// PATCH /api/reservations/:id  → 승인 / 승인취소
export async function PATCH(req: NextRequest, context: Ctx) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const { status } = body as { status?: string };

  try {
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
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE /api/reservations/:id  → 삭제
export async function DELETE(_req: NextRequest, context: Ctx) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }

  try {
    const { error } = await supabaseAdmin
      .from('reservations')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
