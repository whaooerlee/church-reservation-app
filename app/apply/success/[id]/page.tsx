'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

type Reservation = {
  id: string;
  space_id: string;
  title: string;
  requester: string;
  team_name?: string | null;
  start_at: string;
  end_at: string;
  status: string;
  created_at?: string;
};

async function safeJson(res: Response) {
  const text = await res.text();
  if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
  if (!text) return null;
  try { return JSON.parse(text); } catch { return null; }
}

function fmtKst(iso: string) {
  // DB는 UTC timestamptz → 화면은 서울시간으로 표시
  return new Date(iso).toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export default function SuccessPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [data, setData] = useState<Reservation | null>(null);
  const [err, setErr] = useState<string>('');

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        setErr('');
        const res = await fetch(`/api/reservations/${id}`, { cache: 'no-store' });
        const json = await safeJson(res);
        if (!json) throw new Error('신청 정보를 불러올 수 없습니다.');
        setData(json);
      } catch (e: any) {
        setErr(e?.message || '신청 정보를 불러올 수 없습니다.');
      }
    })();
  }, [id]);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: 24 }}>
      <div style={{
        maxWidth: 720, margin: '0 auto',
        background: '#fff', border: '1px solid #e2e8f0',
        borderRadius: 16, padding: 20
      }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 12px' }}>
          신청이 접수되었습니다.
        </h1>
        <p style={{ margin: '0 0 16px', color: '#475569' }}>
          관리자가 검토 후 승인하면 메인 달력에 표시됩니다.
        </p>

        {err && (
          <div style={{ padding: 12, borderRadius: 12, background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c' }}>
            {err}
          </div>
        )}

        {data && (
          <div style={{ marginTop: 14, padding: 12, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'grid', gap: 8 }}>
              <div><b>신청자:</b> {data.requester}</div>
              <div><b>순/팀:</b> {data.team_name || '-'}</div>
              <div><b>목적:</b> {data.title}</div>
              <div><b>시작(서울):</b> {fmtKst(data.start_at)}</div>
              <div><b>종료(서울):</b> {fmtKst(data.end_at)}</div>
              <div><b>상태:</b> {data.status}</div>
              <div style={{ color: '#64748b', fontSize: 13 }}>
                신청 ID: {data.id}
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          <Link href="/" style={{
            background: '#a3272f', color: '#fff', padding: '8px 12px',
            borderRadius: 10, textDecoration: 'none', fontWeight: 600
          }}>
            메인으로
          </Link>

          <Link href="/apply" style={{
            background: '#fff', color: '#a3272f', padding: '8px 12px',
            borderRadius: 10, textDecoration: 'none', fontWeight: 600,
            border: '1px solid #a3272f'
          }}>
            다시 신청
          </Link>
        </div>
      </div>
    </div>
  );
}