// app/api/reservations/[id]/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type Params = { params: { id: string } };

// PATCH /api/reservations/:id  → { status: 'approved' } 같은 걸로 보냄
export async function PATCH(req: Request, { params }: Params) {
  const id = params.id;
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
        { status: 409 },
      );
    }

    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE /api/reservations/:id
export async function DELETE(_: Request, { params }: Params) {
  const id = params.id;
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
