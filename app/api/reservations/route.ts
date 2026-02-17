import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { DateTime } from 'luxon';

// 입력이 '2026-02-17T10:30' 처럼 타임존 없는 경우 → 서울시간으로 해석 후 UTC로 저장
function toUtcIsoFromSeoul(input: string) {
  // 이미 offset/Z가 붙어 있으면 그대로 파싱
  const hasTz = /([zZ]|[+\-]\d{2}:\d{2})$/.test(input);
  const dt = hasTz
    ? DateTime.fromISO(input)
    : DateTime.fromISO(input, { zone: 'Asia/Seoul' });

  if (!dt.isValid) throw new Error('invalid datetime');
  return dt.toUTC().toISO();
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get('status') || 'approved'; // ✅ 기본 approved

    const { data, error } = await supabaseAdmin
      .from('reservations')
      .select('id, title, start_at, end_at, space_id, status, requester, team_name')
      .eq('status', status)
      .order('start_at', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'unknown error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { space_id, title, start_at, end_at, requester, team_name } = body || {};

    // ✅ 필수값 체크
    const missing = ['space_id', 'title', 'start_at', 'end_at', 'requester'].filter((k) => !body?.[k]);
    if (missing.length) {
      return NextResponse.json(
        { error: `필수 항목 누락 (${missing.join(', ')})` },
        { status: 400 }
      );
    }

    // ✅ 서울시간으로 해석해서 UTC로 저장 (DB는 UTC 권장)
    const startUtc = toUtcIsoFromSeoul(start_at);
    const endUtc = toUtcIsoFromSeoul(end_at);

    // ✅ 승인 대기(pending)로 저장
    const { data, error } = await supabaseAdmin
      .from('reservations')
      .insert([{
        space_id,
        title,
        team_name: team_name || null,
        requester,
        start_at: startUtc,
        end_at: endUtc,
        status: 'pending',
      }])
      .select('id')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'unknown error' }, { status: 500 });
  }
}