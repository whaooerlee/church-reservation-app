import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type Ctx = { params: { id: string } };

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const id = params?.id;
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const bodyText = await req.text();
    const body = bodyText ? JSON.parse(bodyText) : {};
    const status = body?.status;

    if (status !== 'approved' && status !== 'pending') {
      return NextResponse.json({ error: 'status must be approved|pending' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('reservations')
      .update({ status })
      .eq('id', id)
      .select('id,status')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'unknown error' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: Ctx) {
  try {
    const id = params?.id;
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const { error } = await supabaseAdmin.from('reservations').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'unknown error' }, { status: 500 });
  }
}
