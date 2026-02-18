'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type Reservation = {
  id: string;
  title: string;
  requester: string;
  team_name?: string | null;
  start_at: string;
  end_at: string;
  status: string;
};

function fmtSeoul(iso?: string) {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function SuccessPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const [data, setData] = useState<Reservation | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!id) return;

    (async () => {
      setError('');
      try {
        const res = await fetch(`/api/reservations/${id}`, { method: 'GET' });
        const text = await res.text();
        const json = text ? JSON.parse(text) : null;

        if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);

        // ✅ /api/reservations/[id] 는 { data } 로 내려줌
        const r = json?.data;
        if (!r) throw new Error('신청 정보를 불러오지 못했습니다.');

        setData(r);
      } catch (e: any) {
        setError(e?.message || '신청 정보를 불러오지 못했습니다.');
      }
    })();
  }, [id]);

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: 24 }}>
      <div style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 16,
        padding: 20,
      }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>
          신청이 접수되었습니다.
        </h1>
        <p style={{ color: '#475569', marginTop: 0 }}>
          관리자가 검토 후 승인하면 메인 달력에 표시됩니다.
        </p>

        {error && (
          <div style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 12,
            border: '1px solid #fecaca',
            background: '#fef2f2',
            color: '#b91c1c',
            fontWeight: 700,
          }}>
            {error}
          </div>
        )}

        {data && (
          <div style={{
            marginTop: 14,
            padding: 14,
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            background: '#f8fafc',
            lineHeight: 1.8,
            fontWeight: 600,
            color: '#0f172a',
          }}>
            <div>신청자: {data.requester || '-'}</div>
            <div>순/팀: {data.team_name || '-'}</div>
            <div>목적: {data.title || '-'}</div>
            <div>시작(서울): {fmtSeoul(data.start_at)}</div>
            <div>종료(서울): {fmtSeoul(data.end_at)}</div>
            <div>상태: {data.status || '-'}</div>
            <div style={{ color: '#64748b', fontWeight: 500, marginTop: 6 }}>
              신청 ID: {data.id}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button
            onClick={() => router.push('/')}
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              border: '1px solid #a3272f',
              background: '#a3272f',
              color: '#fff',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            메인으로
          </button>
          <button
            onClick={() => router.push('/apply')}
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              border: '1px solid #a3272f',
              background: '#fff',
              color: '#a3272f',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            다시 신청
          </button>
        </div>
      </div>
    </div>
  );
}
