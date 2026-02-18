// app/api/reservations/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get('status') || 'approved'; 
    // status=approved | pending | all

    let query = supabaseAdmin
      .from('reservations')
      // ✅ 실제 존재하는 컬럼만 안전하게 선택 (여기 중요)
      .select('id,title,start_at,end_at,space_id,status,requester,team_name')
      .order('start_at', { ascending: true });

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data ?? []);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'server error' }, { status: 500 });
  }
}