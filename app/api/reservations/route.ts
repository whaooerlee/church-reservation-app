import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/* ---------- GET: 달력용 목록 (기본 approved) ---------- */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const status = url.searchParams.get('status') || 'approved';

  const { data, error } = await supabaseAdmin
    .from('reservations')
    .select('id,title,start_at,end_at,space_id,status,team_name')
    .eq('status', status)
    .order('start_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data ?? []);
}

/* ---------- POST: 예약 신청 (공간명 → UUID 자동 매핑) ---------- */
export async function POST(req: Request) {
  try {
    const raw = await req.json().catch(() => ({}));

    // 1) space 입력값 수집 (id 또는 name 모두 허용)
    const rawSpace =
      raw.space_id ?? raw.spaceId ?? raw.space ?? raw.spaceName ?? raw.space_label ?? null;

    // 2) title/requester/team_name
    const titleRaw = raw.title ?? raw.purpose ?? raw.usage ?? raw.content ?? raw.reason;
    const requester = raw.requester ?? raw.applicant ?? raw.name ?? raw.requesterName;
    const team_name = raw.team_name ?? raw.team ?? raw.group ?? raw.cell ?? null;

    // 3) 시간 조합 허용
    let start_at = raw.start_at ?? raw.startAt ?? null;
    let end_at = raw.end_at ?? raw.endAt ?? null;
    if (!start_at || !end_at) {
      const date = raw.date ?? raw.day ?? null;
      const st = raw.start_time ?? raw.startTime ?? null;
      const et = raw.end_time ?? raw.endTime ?? null;
      if (date && st && et) {
        start_at = `${date}T${st}`;
        end_at = `${date}T${et}`;
      }
    }

    // 4) 필수값 1차 체크 (space는 일단 rawSpace 존재만 확인)
    const missing: string[] = [];
    if (!rawSpace) missing.push('space_id');
    if (!titleRaw) missing.push('title');
    if (!start_at) missing.push('start_at');
    if (!end_at) missing.push('end_at');
    if (!requester) missing.push('requester');
    if (missing.length) {
      return NextResponse.json(
        { error: `필수 항목 누락: ${missing.join(', ')}`, received: raw },
        { status: 400 }
      );
    }

    // 5) 날짜 유효성
    const sIso = new Date(start_at).toISOString();
    const eIso = new Date(end_at).toISOString();
    if (isNaN(+new Date(sIso)) || isNaN(+new Date(eIso)) || new Date(sIso) >= new Date(eIso)) {
      return NextResponse.json(
        { error: '시간 형식 오류(시작/종료 확인)', received: { start_at, end_at } },
        { status: 400 }
      );
    }

    // 6) space_id가 UUID가 아니면 'name'으로 조회하여 UUID로 변환
    let space_id: string | null = String(rawSpace);
    const uuidRe =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidRe.test(space_id)) {
      // 공백 제거한 이름으로 대소문자 구분 없이 검색
      const { data: spaceRow, error: spaceErr } = await supabaseAdmin
        .from('spaces')
        .select('id')
        .ilike('name', space_id.trim())
        .maybeSingle();

      if (spaceErr)
        return NextResponse.json({ error: spaceErr.message }, { status: 400 });
      if (!spaceRow)
        return NextResponse.json(
          { error: `존재하지 않는 공간명: ${space_id}` },
          { status: 400 }
        );

      space_id = spaceRow.id;
    }

    // 7) INSERT
    const { data, error } = await supabaseAdmin
      .from('reservations')
      .insert([
        {
          space_id,
          title: String(titleRaw).trim(),
          start_at: sIso,
          end_at: eIso,
          requester: String(requester).trim(),
          team_name: team_name ? String(team_name).trim() : null,
          status: 'pending',
        },
      ])
      .select('id, application_no');

    if (error) {
      const msg = error.message || '';
      const isOverlap =
        msg.toLowerCase().includes('overlap') || msg.toLowerCase().includes('conflict');
      return NextResponse.json(
        { error: isOverlap ? '이미 겹치는 예약이 있습니다.' : msg || '신청 실패' },
        { status: isOverlap ? 409 : 400 }
      );
    }

    return NextResponse.json(
      { ok: true, id: data?.[0]?.id, application_no: data?.[0]?.application_no },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'unknown error' }, { status: 500 });
  }
}
