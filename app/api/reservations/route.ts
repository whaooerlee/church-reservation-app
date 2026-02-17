import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * Convert an ISO-like datetime string to UTC ISO, interpreting timezone-less inputs as Asia/Seoul.
 *
 * - If input has an explicit timezone (Z or ±HH:MM), we respect it.
 * - If input is timezone-less like "2026-02-17T10:30" (or with seconds),
 *   we interpret it as Seoul time (UTC+09:00, no DST) and convert to UTC.
 */
function toUtcIsoFromSeoul(input: string) {
  if (typeof input !== 'string' || !input.trim()) throw new Error('invalid datetime');

  const v = input.trim();

  // If timezone is provided, parse as-is.
  const hasTz = /([zZ]|[+\-]\d{2}:\d{2})$/.test(v);
  if (hasTz) {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) throw new Error('invalid datetime');
    return d.toISOString();
  }

  // Parse timezone-less datetime: YYYY-MM-DDTHH:mm(:ss(.SSS)?)?
  const m = v.match(
    /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/
  );
  if (!m) throw new Error('invalid datetime');

  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const hour = Number(m[4]);
  const minute = Number(m[5]);
  const second = m[6] ? Number(m[6]) : 0;
  const ms = m[7] ? Number(m[7].padEnd(3, '0')) : 0;

  // Basic range validation
  if (
    month < 1 || month > 12 ||
    day < 1 || day > 31 ||
    hour < 0 || hour > 23 ||
    minute < 0 || minute > 59 ||
    second < 0 || second > 59 ||
    ms < 0 || ms > 999
  ) {
    throw new Error('invalid datetime');
  }

  // Asia/Seoul is UTC+09:00 (no DST)
  const SEOUL_OFFSET_MIN = 9 * 60;

  // Convert "Seoul local" components to UTC milliseconds.
  const utcMs =
    Date.UTC(year, month - 1, day, hour, minute, second, ms) - SEOUL_OFFSET_MIN * 60 * 1000;

  const d = new Date(utcMs);
  if (Number.isNaN(d.getTime())) throw new Error('invalid datetime');

  return d.toISOString();
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

    // (선택) 종료가 시작보다 빠르면 거절
    if (new Date(endUtc).getTime() <= new Date(startUtc).getTime()) {
      return NextResponse.json({ error: 'end_at은 start_at 이후여야 합니다.' }, { status: 400 });
    }

    // ✅ 승인 대기(pending)로 저장
    const { data, error } = await supabaseAdmin
      .from('reservations')
      .insert([
        {
          space_id,
          title,
          team_name: team_name || null,
          requester,
          start_at: startUtc,
          end_at: endUtc,
          status: 'pending',
        },
      ])
      .select('id')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'unknown error' }, { status: 500 });
  }
}