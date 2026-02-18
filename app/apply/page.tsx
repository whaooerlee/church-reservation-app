'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Space = { id: string; name: string };

function toUtcIsoFromSeoul(dateStr: string, hhmm: string) {
  // dateStr: 'YYYY-MM-DD', hhmm: 'HH:mm'
  const [y, m, d] = dateStr.split('-').map(Number);
  const [hh, mm] = hhmm.split(':').map(Number);

  // 서울(UTC+9) → UTC로 변환
  const utcMs = Date.UTC(y, m - 1, d, hh - 9, mm, 0, 0);
  return new Date(utcMs).toISOString();
}

export default function ApplyPage() {
  const router = useRouter();

  const [spaces, setSpaces] = useState<Space[]>([]);
  const [spaceId, setSpaceId] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');           // YYYY-MM-DD
  const [startTime, setStartTime] = useState(''); // HH:mm
  const [endTime, setEndTime] = useState('');     // HH:mm
  const [requester, setRequester] = useState('');
  const [teamName, setTeamName] = useState('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/spaces');
        const json = await res.json();
        setSpaces(Array.isArray(json) ? json : []);
      } catch {
        setSpaces([]);
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!spaceId || !title || !date || !startTime || !endTime || !requester) {
      setError('필수 항목 누락 (space_id, title, date, start, end, requester)');
      return;
    }

    // ✅ 서울 입력값을 UTC ISO로 변환해서 서버에 보냄
    const start_at = toUtcIsoFromSeoul(date, startTime);
    const end_at = toUtcIsoFromSeoul(date, endTime);

    setLoading(true);
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          space_id: spaceId,
          title,
          start_at,
          end_at,
          requester,
          team_name: teamName || null,
        }),
      });

      const text = await res.text();
      const json = text ? JSON.parse(text) : null;

      if (!res.ok) {
        throw new Error(json?.error || `신청 실패 (HTTP ${res.status})`);
      }

      const id = json?.data?.id;
      if (!id) throw new Error('신청은 되었으나 id를 받지 못했습니다.');

      router.push(`/apply/success/${id}`);
    } catch (err: any) {
      setError(err?.message || '신청 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>
        세종교육관 공간사용 예약 신청
      </h1>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <label>
          공간 선택
          <select value={spaceId} onChange={(e) => setSpaceId(e.target.value)} style={{ width: '100%', height: 40 }}>
            <option value="">선택</option>
            {spaces.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </label>

        <label>
          사용 목적
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%', height: 40 }} />
        </label>

        <label>
          날짜 (서울시간 기준)
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: '100%', height: 40 }} />
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <label>
            시작 시간 (서울)
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={{ width: '100%', height: 40 }} />
          </label>
          <label>
            종료 시간 (서울)
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} style={{ width: '100%', height: 40 }} />
          </label>
        </div>

        <div style={{ fontSize: 12, color: '#64748b' }}>
          ※ 입력/저장은 서울시간(Asia/Seoul) 기준으로 처리됩니다.
        </div>

        <label>
          신청자
          <input value={requester} onChange={(e) => setRequester(e.target.value)} style={{ width: '100%', height: 40 }} />
        </label>

        <label>
          순 또는 팀 이름
          <input value={teamName} onChange={(e) => setTeamName(e.target.value)} style={{ width: '100%', height: 40 }} />
        </label>

        {error && <div style={{ color: '#dc2626', fontWeight: 600 }}>{error}</div>}

        <button
          type="submit"
          disabled={loading}
          style={{
            height: 44,
            borderRadius: 10,
            border: 'none',
            background: '#a3272f',
            color: '#fff',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {loading ? '신청 중…' : '예약 신청'}
        </button>
      </form>
    </div>
  );
}
