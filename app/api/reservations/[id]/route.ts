// app/api/reservations/[id]/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

async function getIdFromCtx(ctx: any): Promise<string | null> {
  const p = ctx?.params;
  if (!p) return null;
  // Next 16에서 params가 Promise로 타입 잡히는 경우가 있어 방어
  const obj = typeof p?.then === 'function' ? await p : p;
  return obj?.id ?? null;
}

export async function GET(req: Request, ctx: any) {
  const id = await getIdFromCtx(ctx);
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('reservations')
    .select('id, title, start_at, end_at, space_id, status, requester, team_name')
    .eq('id', id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// ✅ 승인/승인취소는 여기 PATCH로 처리
export async function PATCH(req: Request, ctx: any) {
  const id = await getIdFromCtx(ctx);
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  let body: any = {};
  try {
    const text = await req.text();
    body = text ? JSON.parse(text) : {};
  } catch {
    body = {};
  }

  const nextStatus = body?.status; // 'approved' | 'pending'
  if (nextStatus !== 'approved' && nextStatus !== 'pending') {
    return NextResponse.json({ error: 'status required (approved|pending)' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('reservations')
    .update({ status: nextStatus })
    .eq('id', id)
    .select('id, status')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, data });
}

export async function DELETE(req: Request, ctx: any) {
  const id = await getIdFromCtx(ctx);
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const { error } = await supabaseAdmin.from('reservations').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
