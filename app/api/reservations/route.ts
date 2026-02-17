import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// 입력이 '2026-02-17T19:10' 처럼 타임존 없는 경우 → 서울시간(+09:00)로 간주하여 UTC ISO로 변환
// 입력이 이미 '...Z' 또는 '+09:00' 같은 offset을 포함하면 그대로 UTC로 변환
function toUtcIsoFromSeoul(input: string) {
  if (!input || typeof input !== 'string') throw new Error('invalid datetime');

  const trimmed = input.trim();

  // 이미 timezone 정보가 있으면 그대로 Date로 파싱
  const hasTZ = /([zZ]|[+\-]\d{2}:\d{2})$/.test(trimmed);

  // datetime-local은 보통 초가 없음. Date 파싱을 안정화하기 위해 초(:00) 추가
  // - hasTZ: 2026-02-17T19:10+09:00 또는 2026-02-17T10:10Z
  // - noTZ : 2026-02-17T19:10  → 2026-02-17T19:10:00+09:00
  let iso = trimmed;

  if (hasTZ) {
    // 초가 없는 offset/Z 형태일 수 있으므로 초를 보정
    // 예) 2026-02-17T19:10+09:00  → 2026-02-17T19:10:00+09:00
    iso = iso.replace(
      /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})([zZ]|[+\-]\d{2}:\d{2})$/,
      '$1:00$2'
    );
  } else {
    // 예) 2026-02-17T19:10 → 2026-02-17T19:10:00+09:00
    iso = `${iso}:00+09:00`;
  }

  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) throw new Error('invalid datetime');

  return d.toISOString(); // UTC ISO
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    // ✅ 사용자 화면은 승인된 것만 보여야 하므로 기본값 approved
    // (관리자에서 필요하면 ?status=pending / ?status=approved 로 호출 가능)
    const status = url.searchParams.get('status') || 'approved';

    const { data, error } = await supabaseAdmin
      .from('reservations')
      .select('id, title, start_at, end_at, space_id, status, requester, team_name')
      .eq('status', status)
      .order('start_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { space_id, title, start_at, end_at, requester, team_name } = body || {};

    // ✅ 필수값 체크
    const missing = ['space_id', 'title', 'start_at', 'end_at', 'requester']
      .filter((k) => !body?.[k] || String(body[k]).trim() === '');

    if (missing.length) {
      return NextResponse.json(
        { error: `필수 항목 누락 (${missing.join(', ')})` },
        { status: 400 }
      );
    }

    // ✅ 서울시간으로 간주하여 UTC로 저장
    const startUtc = toUtcIsoFromSeoul(String(start_at));
    const endUtc = toUtcIsoFromSeoul(String(end_at));

    // ✅ 시간 역전 방지
    if (new Date(startUtc).getTime() >= new Date(endUtc).getTime()) {
      return NextResponse.json(
        { error: '종료 시간은 시작 시간보다 늦어야 합니다.' },
        { status: 400 }
      );
    }

    // ✅ 겹침 방지 (approved + pending 모두 포함해서 막는 게 안전)
    // 겹침 조건: (start < existing_end) AND (end > existing_start)
    const { data: overlap, error: overlapErr } = await supabaseAdmin
      .from('reservations')
      .select('id, start_at, end_at, status')
      .eq('space_id', space_id)
      .lt('start_at', endUtc)
      .gt('end_at', startUtc)
      .maybeSingle();

    // maybeSingle은 0개면 null, 2개 이상이면 에러가 날 수 있음 → 그래서 아래처럼 처리
    if (overlapErr && !/JSON object requested, multiple/.test(overlapErr.message)) {
      // 단순한 에러는 그대로 반환
      return NextResponse.json({ error: overlapErr.message }, { status: 500 });
    }
    if (overlap) {
      return NextResponse.json(
        { error: '해당 시간에 이미 예약(또는 신청)이 있습니다. 다른 시간을 선택해주세요.' },
        { status: 409 }
      );
    }

    // ✅ 승인 대기(pending)로 저장
    const { data, error } = await supabaseAdmin
      .from('reservations')
      .insert([{
        space_id,
        title,
        requester,
        team_name: team_name ? String(team_name) : null,
        start_at: startUtc,
        end_at: endUtc,
        status: 'pending',
      }])
      .select('id')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'unknown error' },
      { status: 500 }
    );
  }
}