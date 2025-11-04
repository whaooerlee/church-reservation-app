'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

type Resv = {
  id: string;
  application_no?: string | null;
  title: string;
  requester: string;
  team_name?: string | null;
  start_at: string;
  end_at: string;
  status: 'pending' | 'approved';
};

function fmt(dt: string) {
  try {
    return new Date(dt).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return dt;
  }
}

export default function SuccessPage() {
  const params = useParams<{ id: string }>();
  const id = (params?.id ?? '') as string;

  const [data, setData] = useState<Resv | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    async function load() {
      try {
        const base =
          typeof window !== 'undefined' ? window.location.origin : '';
        const res = await fetch(`${base}/api/reservations/${id}`);
        if (!res.ok) throw new Error(await res.text());
        const json = (await res.json()) as Resv;
        setData(json);
      } catch (err: any) {
        console.error(err);
        setError('신청 정보를 불러오지 못했습니다.');
      }
    }

    load();
  }, [id]);

  if (!id) return <div style={{ padding: 24 }}>잘못된 접근입니다.</div>;
  if (error) return <div style={{ padding: 24 }}>{error}</div>;
  if (!data) return <div style={{ padding: 24 }}>불러오는 중...</div>;

  const appNo = data.application_no ?? data.id;
  const team = data.team_name || '-';

  const btn = {
    borderRadius: 8,
    padding: '8px 14px',
    textDecoration: 'none',
    border: '1px solid #042550',
    display: 'inline-block',
  } as const;

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>신청이 접수되었습니다.</h1>
      <p style={{ color: '#556070', marginTop: 0 }}>관리자가 검토 후 승인하면 메인 달력에 표시됩니다.</p>

      <div style={{ background: '#fff', border: '1px solid #e1e5eb', borderRadius: 12, padding: 16, maxWidth: 760 }}>
        <dl style={{ display: 'grid', gridTemplateColumns: '140px 1fr', rowGap: 10, columnGap: 16, margin: 0 }}>
          <dt>신청번호</dt><dd>{appNo}</dd>
          <dt>순/팀 & 목적</dt><dd>{data.title}</dd>
          <dt>신청자</dt><dd>{data.requester}</dd>
          <dt>순/팀 이름</dt><dd>{team}</dd>
          <dt>시작</dt><dd>{fmt(data.start_at)}</dd>
          <dt>종료</dt><dd>{fmt(data.end_at)}</dd>
          <dt>상태</dt><dd>{data.status === 'approved' ? '승인됨' : '승인 대기'}</dd>
        </dl>

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <Link href="/" style={{ ...btn, background: '#fff', color: '#042550' }}>메인으로</Link>
          <Link href="/apply" style={{ ...btn, background: '#042550', color: '#fff' }}>다른 시간 신청</Link>
        </div>
      </div>
    </div>
  );
}
