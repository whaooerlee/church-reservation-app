import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

function extractId(req: Request, params?: { id?: string }) {
  let id = params?.id;
  if (!id) {
    const url = new URL(req.url);
    const segs = url.pathname.split('/').filter(Boolean);
    id = segs[segs.length - 1];
  }
  if (!id) {
    const url = new URL(req.url);
    id = url.searchParams.get('id') ?? undefined;
  }
  return id;
}

/** GET /api/reservations/:id → 신청 상세 조회 */
export async function GET(req: Request, ctx: { params: { id?: string } }) {
  const id = extractId(req, ctx?.params);
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('reservations')
    .select('id, application_no, title, requester, team_name, space_id, start_at, end_at, status')
    .eq('id', id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ error: `not found: ${id}` }, { status: 404 });

  return NextResponse.json(data);
}

/** PATCH /api/reservations/:id → 승인 처리 */
export async function PATCH(req: Request, ctx: { params: { id?: string } }) {
  const id = extractId(req, ctx?.params);
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const { error } = await supabaseAdmin.from('reservations').update({ status: 'approved' }).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true, id, status: 'approved' });
}

/** DELETE /api/reservations/:id → 삭제 */
export async function DELETE(req: Request, ctx: { params: { id?: string } }) {
  const id = extractId(req, ctx?.params);
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const { error } = await supabaseAdmin.from('reservations').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true, id });
}
